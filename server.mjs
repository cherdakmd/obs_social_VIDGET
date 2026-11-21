import http from 'node:http';
import fs from 'node:fs';
import fsp from 'node:fs/promises';
import path from 'node:path';
import crypto from 'node:crypto';
import { fileURLToPath } from 'node:url';
import { createRequire } from 'node:module';

const require = createRequire(import.meta.url);
const Icons = require('./src/icons.js');
const Config = require('./src/config.js');
const McConfig = require('./src/mc-config.js');
const McPing = require('./src/mc-ping.js');

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const MIME_TYPES = {
  '.html': 'text/html; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.js': 'application/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.svg': 'image/svg+xml',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.webp': 'image/webp',
  '.gif': 'image/gif',
  '.ico': 'image/x-icon'
};

const MAX_BODY_BYTES = 2 * 1024 * 1024;
const MAX_UPLOAD_BODY_BYTES = 8 * 1024 * 1024;
const ALLOWED_HTML = new Set(['index.html', 'dock.html', 'minecraft.html', 'minecraft-dock.html']);
const STATUS_CACHE_TTL_MS = 4000;

export function createObsWidgetServer(options = {}) {
  const rootDir = options.rootDir || __dirname;
  const dataDir = options.dataDir || rootDir;
  const configPath = path.join(dataDir, 'config.json');
  const mcConfigPath = path.join(dataDir, 'mc-config.json');
  const profilesDir = path.join(dataDir, 'profiles');
  const mcProfilesDir = path.join(dataDir, 'mc-profiles');
  const uploadsDir = path.join(dataDir, 'uploads');
  const sseClients = new Set();
  const statusCache = new Map();

  function sanitizeProfileId(raw) {
    return Config.sanitizeProfileId(String(raw || 'default'));
  }

  function getKindPaths(kind, rawProfileId) {
    const profileId = sanitizeProfileId(rawProfileId);
    const isMc = kind === 'mc';
    const dir = isMc ? mcProfilesDir : profilesDir;
    const baseDefault = isMc ? mcConfigPath : configPath;
    if (profileId === 'default') {
      return { profileId: 'default', dir, filePath: baseDefault };
    }
    const safeFile = path.resolve(dir, `${profileId}.json`);
    if (!safeFile.startsWith(path.resolve(dir) + path.sep)) {
      return { profileId: 'default', dir, filePath: baseDefault };
    }
    return { profileId, dir, filePath: safeFile };
  }

  async function readProfilesList(kind) {
    const isMc = kind === 'mc';
    const dir = isMc ? mcProfilesDir : profilesDir;
    const metaPath = path.join(dir, '_meta.json');
    let metaMap = {};
    try {
      const raw = await fsp.readFile(metaPath, 'utf8');
      const parsed = JSON.parse(raw);
      if (parsed && typeof parsed === 'object') metaMap = parsed;
    } catch {
      metaMap = {};
    }

    const result = [{ id: 'default', name: 'default', updatedAt: 0 }];
    const seen = new Set(['default']);

    try {
      const entries = await fsp.readdir(dir, { withFileTypes: true });
      for (const ent of entries) {
        if (!ent.isFile()) continue;
        if (!ent.name.endsWith('.json') || ent.name === '_meta.json' || ent.name.endsWith('.backup.json')) continue;
        const id = sanitizeProfileId(ent.name.slice(0, -5));
        if (id === 'default' || seen.has(id)) continue;
        seen.add(id);
        let statMtime = 0;
        try {
          const st = await fsp.stat(path.join(dir, ent.name));
          statMtime = Math.round(st.mtimeMs);
        } catch {}
        const meta = metaMap[id] && typeof metaMap[id] === 'object' ? metaMap[id] : {};
        result.push({
          id,
          name: typeof meta.name === 'string' && meta.name.trim() ? meta.name.trim().slice(0, 48) : id,
          updatedAt: Number(meta.updatedAt) || statMtime
        });
      }
    } catch {
      // profiles directory doesn't exist yet
    }

    return result;
  }

  async function writeProfileMeta(kind, profileId, name) {
    if (profileId === 'default') return;
    const dir = kind === 'mc' ? mcProfilesDir : profilesDir;
    const metaPath = path.join(dir, '_meta.json');
    await fsp.mkdir(dir, { recursive: true });
    let metaMap = {};
    try {
      const raw = await fsp.readFile(metaPath, 'utf8');
      const parsed = JSON.parse(raw);
      if (parsed && typeof parsed === 'object') metaMap = parsed;
    } catch {
      metaMap = {};
    }
    metaMap[profileId] = {
      name: String(name || profileId).slice(0, 48),
      updatedAt: Date.now()
    };
    const tmp = `${metaPath}.${process.pid}.${Date.now()}.tmp`;
    await fsp.writeFile(tmp, JSON.stringify(metaMap, null, 2), 'utf8');
    await fsp.rename(tmp, metaPath);
  }

  async function removeProfileFiles(kind, rawProfileId) {
    const { profileId, dir, filePath } = getKindPaths(kind, rawProfileId);
    if (profileId === 'default') return false;
    await fsp.rm(filePath, { force: true });
    await fsp.rm(getBackupPath(filePath), { force: true });
    const metaPath = path.join(dir, '_meta.json');
    try {
      const raw = await fsp.readFile(metaPath, 'utf8');
      const parsed = JSON.parse(raw);
      if (parsed && typeof parsed === 'object' && parsed[profileId]) {
        delete parsed[profileId];
        await fsp.writeFile(metaPath, JSON.stringify(parsed, null, 2), 'utf8');
      }
    } catch {}
    return true;
  }

  function sendJson(res, status, data) {
    const body = JSON.stringify(data);
    res.writeHead(status, {
      'Content-Type': 'application/json; charset=utf-8',
      'Cache-Control': 'no-store',
      'Access-Control-Allow-Origin': '*'
    });
    res.end(body);
  }

  function broadcastSse(eventName, payload) {
    const line = `event: ${eventName}\ndata: ${JSON.stringify(payload)}\n\n`;
    for (const client of sseClients) {
      try {
        client.write(line);
      } catch {
        sseClients.delete(client);
      }
    }
  }

  function getBackupPath(filePath) {
    return filePath.replace(/\.json$/i, '.backup.json');
  }

  async function readJsonConfig(filePath, normalizer) {
    const candidates = [filePath, getBackupPath(filePath)];
    for (const candidatePath of candidates) {
      try {
        const raw = await fsp.readFile(candidatePath, 'utf8');
        const parsed = JSON.parse(raw);
        if (parsed && typeof parsed === 'object') {
          return normalizer(parsed);
        }
      } catch (_err) {
        // Try backup if primary missing or corrupted
      }
    }
    return null;
  }

  async function writeJsonConfig(filePath, cfg) {
    await fsp.mkdir(path.dirname(filePath), { recursive: true });
    const serialized = JSON.stringify(cfg, null, 2);
    const tmp = `${filePath}.${process.pid}.${Date.now()}.tmp`;
    await fsp.writeFile(tmp, serialized, 'utf8');
    await fsp.rename(tmp, filePath);
    try {
      const backupPath = getBackupPath(filePath);
      const backupTmp = `${backupPath}.${process.pid}.${Date.now()}.tmp`;
      await fsp.writeFile(backupTmp, serialized, 'utf8');
      await fsp.rename(backupTmp, backupPath);
    } catch {
      // Non-fatal if backup fails
    }
  }

  function readBody(req, maxBytes = MAX_BODY_BYTES) {
    return new Promise((resolve, reject) => {
      let size = 0;
      const chunks = [];
      req.on('data', (chunk) => {
        size += chunk.length;
        if (size > maxBytes) {
          reject(new Error('PAYLOAD_TOO_LARGE'));
          req.destroy();
          return;
        }
        chunks.push(chunk);
      });
      req.on('end', () => {
        resolve(Buffer.concat(chunks).toString('utf8'));
      });
      req.on('error', reject);
    });
  }

  function resolveStaticPath(pathname) {
    if (pathname.startsWith('/uploads/')) {
      const filePart = pathname.slice('/uploads/'.length);
      if (!/^[a-zA-Z0-9._-]+\.(?:png|jpe?g|webp|gif|svg)$/i.test(filePart) || filePart.includes('..')) {
        return null;
      }
      const fullPath = path.resolve(uploadsDir, filePart);
      if (!fullPath.startsWith(path.resolve(uploadsDir) + path.sep)) {
        return null;
      }
      return { fullPath, isUpload: true };
    }
    let rel = pathname === '/' ? 'index.html' : pathname.replace(/^\/+/, '');
    if (!ALLOWED_HTML.has(rel) && !rel.startsWith('src/')) {
      return null;
    }
    const normalized = path.normalize(rel);
    if (normalized.startsWith('..') || path.isAbsolute(normalized)) {
      return null;
    }
    const fullPath = path.resolve(rootDir, normalized);
    if (!fullPath.startsWith(path.resolve(rootDir) + path.sep)) {
      return null;
    }
    return { fullPath, isUpload: false };
  }

  async function handleConfigPut(req, res, kind, rawProfileId, normalizer, sseEvent) {
    let rawBody;
    try {
      rawBody = await readBody(req, MAX_BODY_BYTES);
    } catch (err) {
      if (err && err.message === 'PAYLOAD_TOO_LARGE') {
        sendJson(res, 413, { ok: false, error: 'Payload too large' });
        return;
      }
      sendJson(res, 400, { ok: false, error: 'Invalid request stream' });
      return;
    }

    let payload;
    try {
      payload = JSON.parse(rawBody || '{}');
    } catch {
      sendJson(res, 400, { ok: false, error: 'Invalid JSON' });
      return;
    }

    const candidate = payload && payload.config ? payload.config : payload;
    if (!candidate || typeof candidate !== 'object' || Array.isArray(candidate)) {
      sendJson(res, 400, { ok: false, error: 'Invalid config payload' });
      return;
    }

    const effectiveProfile = rawProfileId || (payload && payload.profile) || 'default';
    const { profileId, filePath } = getKindPaths(kind, effectiveProfile);
    const normalized = normalizer(candidate);
    await writeJsonConfig(filePath, normalized);
    if (profileId !== 'default' && typeof payload.profileName === 'string' && payload.profileName.trim()) {
      await writeProfileMeta(kind, profileId, payload.profileName.trim());
    }
    broadcastSse(sseEvent, {
      sender: payload.sender || null,
      profile: profileId,
      config: normalized
    });
    sendJson(res, 200, { ok: true, profile: profileId, config: normalized, savedAt: Date.now() });
  }

  async function handleProfileCreate(req, res, kind, normalizer, sseEvent) {
    let rawBody;
    try {
      rawBody = await readBody(req, MAX_BODY_BYTES);
    } catch (err) {
      sendJson(res, err && err.message === 'PAYLOAD_TOO_LARGE' ? 413 : 400, { ok: false, error: 'Invalid body' });
      return;
    }
    let payload;
    try {
      payload = JSON.parse(rawBody || '{}');
    } catch {
      sendJson(res, 400, { ok: false, error: 'Invalid JSON' });
      return;
    }
    const displayName = typeof payload.name === 'string' && payload.name.trim()
      ? payload.name.trim().slice(0, 48)
      : (typeof payload.id === 'string' ? payload.id.trim().slice(0, 48) : 'scene');
    let profileId = sanitizeProfileId(payload.id || Config.slugifyProfileName(displayName));
    if (profileId === 'default') {
      profileId = `scene-${crypto.randomBytes(2).toString('hex')}`;
    }
    const { filePath } = getKindPaths(kind, profileId);
    const baseCfg = payload.config && typeof payload.config === 'object'
      ? normalizer(payload.config)
      : normalizer(kind === 'mc' ? McConfig.getDefaultConfig() : Config.getDefaultConfig());
    await writeJsonConfig(filePath, baseCfg);
    await writeProfileMeta(kind, profileId, displayName);
    broadcastSse(sseEvent, { sender: payload.sender || null, profile: profileId, config: baseCfg });
    sendJson(res, 200, { ok: true, profile: { id: profileId, name: displayName, updatedAt: Date.now() }, config: baseCfg });
  }

  async function handleUploadImage(req, res) {
    let rawBody;
    try {
      rawBody = await readBody(req, MAX_UPLOAD_BODY_BYTES);
    } catch (err) {
      sendJson(res, err && err.message === 'PAYLOAD_TOO_LARGE' ? 413 : 400, {
        ok: false,
        error: err && err.message === 'PAYLOAD_TOO_LARGE' ? 'Image too large (max 5MB)' : 'Invalid request stream'
      });
      return;
    }

    let payload;
    try {
      payload = JSON.parse(rawBody || '{}');
    } catch {
      sendJson(res, 400, { ok: false, error: 'Invalid JSON' });
      return;
    }

    const dataUrl = typeof payload.dataUrl === 'string' ? payload.dataUrl.trim() : '';
    const match = dataUrl.match(/^data:image\/(png|jpeg|jpg|webp|gif|svg\+xml)(?:;charset=[^;,]+)?(;base64)?,([\s\S]+)$/i);
    if (!match) {
      sendJson(res, 400, { ok: false, error: 'Unsupported image format (PNG, JPG, WebP, GIF, SVG only)' });
      return;
    }

    const mimeSubtype = match[1].toLowerCase();
    const isBase64 = Boolean(match[2]);
    const rawData = match[3];
    const extMap = { png: 'png', jpeg: 'jpg', jpg: 'jpg', webp: 'webp', gif: 'gif', 'svg+xml': 'svg' };
    const ext = extMap[mimeSubtype] || 'png';

    let fileBuf;
    if (ext === 'svg') {
      const svgText = isBase64
        ? Buffer.from(rawData, 'base64').toString('utf8')
        : decodeURIComponent(rawData);
      const safeSvg = Icons.sanitizeSvg(svgText);
      if (!safeSvg) {
        sendJson(res, 400, { ok: false, error: 'Invalid SVG image' });
        return;
      }
      fileBuf = Buffer.from(safeSvg, 'utf8');
    } else {
      if (!isBase64) {
        sendJson(res, 400, { ok: false, error: 'Raster images must be base64-encoded' });
        return;
      }
      fileBuf = Buffer.from(rawData, 'base64');
    }

    if (!fileBuf.length || fileBuf.length > 5 * 1024 * 1024) {
      sendJson(res, 413, { ok: false, error: 'Image size exceeds 5MB limit' });
      return;
    }

    await fsp.mkdir(uploadsDir, { recursive: true });
    const fileName = `u-${Date.now()}-${crypto.randomBytes(4).toString('hex')}.${ext}`;
    const destPath = path.join(uploadsDir, fileName);
    await fsp.writeFile(destPath, fileBuf);
    sendJson(res, 200, {
      ok: true,
      url: `/uploads/${fileName}`,
      filename: fileName,
      size: fileBuf.length
    });
  }

  async function fetchMcStatusFallback(address, edition) {
    if (typeof fetch !== 'function') return null;
    const parsed = McPing.parseAddress(address, edition);
    if (!parsed) return null;
    const addrParam = parsed.port && ((edition === 'java' && parsed.port !== 25565) || (edition === 'bedrock' && parsed.port !== 19132))
      ? `${parsed.host}:${parsed.port}`
      : parsed.host;
    const endpoint = edition === 'bedrock'
      ? `https://api.mcstatus.io/v2/status/bedrock/${encodeURIComponent(addrParam)}`
      : `https://api.mcstatus.io/v2/status/java/${encodeURIComponent(addrParam)}`;

    const ctrl = new AbortController();
    const timer = setTimeout(() => ctrl.abort(), 3500);
    try {
      const resp = await fetch(endpoint, { signal: ctrl.signal });
      if (!resp.ok) return null;
      const data = await resp.json();
      return McPing.normalizeMcStatusIoResponse(data, edition);
    } catch {
      return null;
    } finally {
      clearTimeout(timer);
    }
  }

  async function queryMinecraftStatus(address, edition, source) {
    const normEdition = edition === 'bedrock' ? 'bedrock' : 'java';
    const normSource = source === 'server' || source === 'mcstatus' ? source : 'auto';
    const parsed = McPing.parseAddress(address, normEdition);
    if (!parsed) {
      return {
        ok: false,
        online: false,
        edition: normEdition,
        error: 'Invalid server address'
      };
    }

    const cacheKey = `${normEdition}|${normSource}|${parsed.host}:${parsed.port}`;
    const cached = statusCache.get(cacheKey);
    if (cached && Date.now() - cached.ts < STATUS_CACHE_TTL_MS) {
      return Object.assign({}, cached.result, { cached: true });
    }

    let result = null;
    const pingFn = options.mcPing || McPing.pingServer;

    if (normSource !== 'mcstatus') {
      result = await pingFn(address, normEdition, {
        timeoutMs: options.mcPingTimeoutMs || 3200
      });
    }

    if (
      (!result || !result.online) &&
      normSource !== 'server' &&
      !McPing.isLocalOrPrivateHost(parsed.host) &&
      !options.disableRemoteMcStatus
    ) {
      const fallback = await fetchMcStatusFallback(address, normEdition);
      if (fallback && (fallback.online || normSource === 'mcstatus')) {
        result = fallback;
      }
    }

    if (!result) {
      result = {
        ok: true,
        online: false,
        edition: normEdition,
        source: normSource,
        playersOnline: null,
        playersMax: null,
        version: '',
        motd: '',
        favicon: '',
        latencyMs: null
      };
    }

    if (statusCache.size > 60) {
      statusCache.clear();
    }
    statusCache.set(cacheKey, { ts: Date.now(), result });
    return result;
  }

  const server = http.createServer(async (req, res) => {
    try {
      const urlObj = new URL(req.url || '/', 'http://127.0.0.1');
      const pathname = decodeURIComponent(urlObj.pathname);

      if (req.method === 'OPTIONS') {
        res.writeHead(204, {
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Methods': 'GET, PUT, POST, DELETE, OPTIONS',
          'Access-Control-Allow-Headers': 'Content-Type'
        });
        res.end();
        return;
      }

      if (req.method === 'GET' && pathname === '/api/health') {
        sendJson(res, 200, { ok: true, mode: 'obs-social-vidget-server' });
        return;
      }

      if (req.method === 'GET' && pathname === '/api/info') {
        sendJson(res, 200, {
          ok: true,
          dataDir,
          configFile: configPath,
          mcConfigFile: mcConfigPath,
          uploadsDir,
          profilesDir,
          mcProfilesDir
        });
        return;
      }

      if (req.method === 'POST' && pathname === '/api/upload') {
        await handleUploadImage(req, res);
        return;
      }

      if (req.method === 'GET' && pathname === '/api/profiles') {
        const profiles = await readProfilesList('social');
        sendJson(res, 200, { ok: true, profiles });
        return;
      }

      if (req.method === 'POST' && pathname === '/api/profiles') {
        await handleProfileCreate(req, res, 'social', Config.normalizeConfig, 'config-updated');
        return;
      }

      if (req.method === 'DELETE' && pathname.startsWith('/api/profiles/')) {
        const id = pathname.slice('/api/profiles/'.length);
        const deleted = await removeProfileFiles('social', id);
        if (!deleted) {
          sendJson(res, 400, { ok: false, error: 'Cannot delete default profile' });
          return;
        }
        sendJson(res, 200, { ok: true, id: sanitizeProfileId(id) });
        return;
      }

      if (req.method === 'GET' && pathname === '/api/mc-profiles') {
        const profiles = await readProfilesList('mc');
        sendJson(res, 200, { ok: true, profiles });
        return;
      }

      if (req.method === 'POST' && pathname === '/api/mc-profiles') {
        await handleProfileCreate(req, res, 'mc', McConfig.normalizeConfig, 'mc-config-updated');
        return;
      }

      if (req.method === 'DELETE' && pathname.startsWith('/api/mc-profiles/')) {
        const id = pathname.slice('/api/mc-profiles/'.length);
        const deleted = await removeProfileFiles('mc', id);
        if (!deleted) {
          sendJson(res, 400, { ok: false, error: 'Cannot delete default profile' });
          return;
        }
        sendJson(res, 200, { ok: true, id: sanitizeProfileId(id) });
        return;
      }

      if (req.method === 'GET' && pathname === '/api/config') {
        const profile = urlObj.searchParams.get('profile') || 'default';
        const { profileId, filePath } = getKindPaths('social', profile);
        const config = await readJsonConfig(filePath, Config.normalizeConfig);
        sendJson(res, 200, { ok: true, profile: profileId, config });
        return;
      }

      if ((req.method === 'PUT' || req.method === 'POST') && pathname === '/api/config') {
        const profile = urlObj.searchParams.get('profile') || '';
        await handleConfigPut(req, res, 'social', profile, Config.normalizeConfig, 'config-updated');
        return;
      }

      if (req.method === 'GET' && pathname === '/api/mc-config') {
        const profile = urlObj.searchParams.get('profile') || 'default';
        const { profileId, filePath } = getKindPaths('mc', profile);
        const config = await readJsonConfig(filePath, McConfig.normalizeConfig);
        sendJson(res, 200, { ok: true, profile: profileId, config });
        return;
      }

      if ((req.method === 'PUT' || req.method === 'POST') && pathname === '/api/mc-config') {
        const profile = urlObj.searchParams.get('profile') || '';
        await handleConfigPut(req, res, 'mc', profile, McConfig.normalizeConfig, 'mc-config-updated');
        return;
      }

      if (req.method === 'GET' && pathname === '/api/mc-status') {
        const address = urlObj.searchParams.get('address') || urlObj.searchParams.get('ip') || '';
        const edition = urlObj.searchParams.get('edition') || 'java';
        const source = urlObj.searchParams.get('source') || 'auto';
        if (!address.trim()) {
          sendJson(res, 400, { ok: false, online: false, error: 'Missing server address' });
          return;
        }
        const status = await queryMinecraftStatus(address, edition, source);
        sendJson(res, 200, status);
        return;
      }

      if (req.method === 'GET' && pathname === '/api/events') {
        res.writeHead(200, {
          'Content-Type': 'text/event-stream; charset=utf-8',
          'Cache-Control': 'no-cache, no-transform',
          Connection: 'keep-alive',
          'Access-Control-Allow-Origin': '*'
        });
        res.write(': connected\n\n');
        sseClients.add(res);
        req.on('close', () => {
          sseClients.delete(res);
        });
        return;
      }

      if (req.method === 'GET' || req.method === 'HEAD') {
        const resolved = resolveStaticPath(pathname);
        if (!resolved) {
          res.writeHead(404, { 'Content-Type': 'text/plain; charset=utf-8' });
          res.end('Not found');
          return;
        }
        const { fullPath, isUpload } = resolved;
        try {
          const stat = await fsp.stat(fullPath);
          if (!stat.isFile()) {
            res.writeHead(404);
            res.end('Not found');
            return;
          }
          const ext = path.extname(fullPath).toLowerCase();
          const mime = MIME_TYPES[ext] || 'application/octet-stream';
          const headers = {
            'Content-Type': mime,
            'Cache-Control': isUpload ? 'public, max-age=86400' : 'no-store',
            'X-Content-Type-Options': 'nosniff'
          };
          if (isUpload && ext === '.svg') {
            headers['Content-Security-Policy'] = "default-src 'none'; style-src 'unsafe-inline'";
          }
          res.writeHead(200, headers);
          if (req.method === 'HEAD') {
            res.end();
            return;
          }
          fs.createReadStream(fullPath).pipe(res);
          return;
        } catch {
          res.writeHead(404, { 'Content-Type': 'text/plain; charset=utf-8' });
          res.end('Not found');
          return;
        }
      }

      res.writeHead(405, { 'Content-Type': 'text/plain; charset=utf-8' });
      res.end('Method not allowed');
    } catch (err) {
      sendJson(res, 500, { ok: false, error: err && err.message ? err.message : 'Internal error' });
    }
  });

  const keepAliveTimer = setInterval(() => {
    for (const client of sseClients) {
      try {
        client.write(': ping\n\n');
      } catch {
        sseClients.delete(client);
      }
    }
  }, 20000);
  keepAliveTimer.unref();

  server.on('close', () => {
    clearInterval(keepAliveTimer);
    for (const client of sseClients) {
      try {
        client.end();
      } catch {}
    }
    sseClients.clear();
  });

  return server;
}

const isMain = process.argv[1] && path.resolve(process.argv[1]) === path.resolve(__filename);
if (isMain) {
  const port = Number(process.env.PORT) || 3847;
  const host = process.env.HOST || '0.0.0.0';
  const server = createObsWidgetServer();
  server.listen(port, host, () => {
    console.log('');
    console.log('=======================================================');
    console.log('  OBS Social Widget — Live Sync Server Running!');
    console.log('=======================================================');
    console.log(`  Social Overlay     : http://127.0.0.1:${port}/`);
    console.log(`  Social Dock        : http://127.0.0.1:${port}/dock.html`);
    console.log(`  Minecraft Overlay  : http://127.0.0.1:${port}/minecraft.html`);
    console.log(`  Minecraft Dock     : http://127.0.0.1:${port}/minecraft-dock.html`);
    console.log(`  Setup in Browser   : http://127.0.0.1:${port}/?setup=1`);
    console.log('  Configs saved to   : config.json / mc-config.json');
    console.log('=======================================================');
    console.log('');
  });
}
