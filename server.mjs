import http from 'node:http';
import fs from 'node:fs';
import fsp from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { createRequire } from 'node:module';

const require = createRequire(import.meta.url);
const Config = require('./src/config.js');

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

export function createObsWidgetServer(options = {}) {
  const rootDir = options.rootDir || __dirname;
  const dataDir = options.dataDir || rootDir;
  const configPath = path.join(dataDir, 'config.json');
  const sseClients = new Set();

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

  async function readStoredConfig() {
    try {
      const raw = await fsp.readFile(configPath, 'utf8');
      const parsed = JSON.parse(raw);
      return Config.normalizeConfig(parsed);
    } catch (err) {
      if (err && err.code === 'ENOENT') return null;
      return null;
    }
  }

  async function writeStoredConfig(cfg) {
    await fsp.mkdir(dataDir, { recursive: true });
    const tmp = `${configPath}.${process.pid}.${Date.now()}.tmp`;
    await fsp.writeFile(tmp, JSON.stringify(cfg, null, 2), 'utf8');
    await fsp.rename(tmp, configPath);
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
    if (rel !== 'index.html' && rel !== 'dock.html' && !rel.startsWith('src/')) {
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
        const config = await readStoredConfig();
        sendJson(res, 200, { ok: true, config });
        return;
      }

      if (req.method === 'PUT' && pathname === '/api/config') {
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

        const normalized = Config.normalizeConfig(candidate);
        await writeStoredConfig(normalized);
        broadcastSse('config-updated', {
          sender: payload.sender || null,
          config: normalized
        });
        sendJson(res, 200, { ok: true, config: normalized });
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
    console.log(`  OBS Browser Source : http://127.0.0.1:${port}/`);
    console.log(`  OBS Custom Dock    : http://127.0.0.1:${port}/dock.html`);
    console.log(`  Setup in Browser   : http://127.0.0.1:${port}/?setup=1`);
    console.log('  Config saved to    : config.json');
    console.log('=======================================================');
    console.log('');
  });
}
