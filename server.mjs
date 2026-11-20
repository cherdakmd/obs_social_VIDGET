import http from 'node:http';
import fs from 'node:fs';
import fsp from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { createRequire } from 'node:module';

const require = createRequire(import.meta.url);
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
  '.ico': 'image/x-icon'
};

const MAX_BODY_BYTES = 2 * 1024 * 1024;
const ALLOWED_HTML = new Set(['index.html', 'dock.html', 'minecraft.html', 'minecraft-dock.html']);
const STATUS_CACHE_TTL_MS = 4000;

export function createObsWidgetServer(options = {}) {
  const rootDir = options.rootDir || __dirname;
  const dataDir = options.dataDir || rootDir;
  const configPath = path.join(dataDir, 'config.json');
  const mcConfigPath = path.join(dataDir, 'mc-config.json');
  const sseClients = new Set();
  const statusCache = new Map();

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

  async function readJsonConfig(filePath, normalizer) {
    try {
      const raw = await fsp.readFile(filePath, 'utf8');
      const parsed = JSON.parse(raw);
      return normalizer(parsed);
    } catch (err) {
      if (err && err.code === 'ENOENT') return null;
      return null;
    }
  }

  async function writeJsonConfig(filePath, cfg) {
    await fsp.mkdir(dataDir, { recursive: true });
    const tmp = `${filePath}.${process.pid}.${Date.now()}.tmp`;
    await fsp.writeFile(tmp, JSON.stringify(cfg, null, 2), 'utf8');
    await fsp.rename(tmp, filePath);
  }

  function readBody(req) {
    return new Promise((resolve, reject) => {
      let size = 0;
      const chunks = [];
      req.on('data', (chunk) => {
        size += chunk.length;
        if (size > MAX_BODY_BYTES) {
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
    return fullPath;
  }

  async function handleConfigPut(req, res, filePath, normalizer, sseEvent) {
    let rawBody;
    try {
      rawBody = await readBody(req);
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

    const normalized = normalizer(candidate);
    await writeJsonConfig(filePath, normalized);
    broadcastSse(sseEvent, {
      sender: payload.sender || null,
      config: normalized
    });
    sendJson(res, 200, { ok: true, config: normalized });
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
          'Access-Control-Allow-Methods': 'GET, PUT, OPTIONS',
          'Access-Control-Allow-Headers': 'Content-Type'
        });
        res.end();
        return;
      }

      if (req.method === 'GET' && pathname === '/api/health') {
        sendJson(res, 200, { ok: true, mode: 'obs-social-vidget-server' });
        return;
      }

      if (req.method === 'GET' && pathname === '/api/config') {
        const config = await readJsonConfig(configPath, Config.normalizeConfig);
        sendJson(res, 200, { ok: true, config });
        return;
      }

      if (req.method === 'PUT' && pathname === '/api/config') {
        await handleConfigPut(req, res, configPath, Config.normalizeConfig, 'config-updated');
        return;
      }

      if (req.method === 'GET' && pathname === '/api/mc-config') {
        const config = await readJsonConfig(mcConfigPath, McConfig.normalizeConfig);
        sendJson(res, 200, { ok: true, config });
        return;
      }

      if (req.method === 'PUT' && pathname === '/api/mc-config') {
        await handleConfigPut(req, res, mcConfigPath, McConfig.normalizeConfig, 'mc-config-updated');
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
        const filePath = resolveStaticPath(pathname);
        if (!filePath) {
          res.writeHead(404, { 'Content-Type': 'text/plain; charset=utf-8' });
          res.end('Not found');
          return;
        }
        try {
          const stat = await fsp.stat(filePath);
          if (!stat.isFile()) {
            res.writeHead(404);
            res.end('Not found');
            return;
          }
          const ext = path.extname(filePath).toLowerCase();
          const mime = MIME_TYPES[ext] || 'application/octet-stream';
          res.writeHead(200, {
            'Content-Type': mime,
            'Cache-Control': 'no-store'
          });
          if (req.method === 'HEAD') {
            res.end();
            return;
          }
          fs.createReadStream(filePath).pipe(res);
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
