import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import http from 'node:http';
import { createObsWidgetServer } from '../server.mjs';

test('sync server serves widget, persists config.json, blocks traversal, and pushes SSE updates', async () => {
  const tmpDir = await fs.mkdtemp(path.join(os.tmpdir(), 'obs-vidget-test-'));
  const server = createObsWidgetServer({ dataDir: tmpDir });

  await new Promise((resolve) => server.listen(0, '127.0.0.1', resolve));
  const addr = server.address();
  const baseUrl = `http://127.0.0.1:${addr.port}`;

  try {
    // 1. Health & Static routes
    const healthRes = await fetch(`${baseUrl}/api/health`);
    assert.equal(healthRes.status, 200);
    const healthJson = await healthRes.json();
    assert.equal(healthJson.ok, true);

    const indexRes = await fetch(`${baseUrl}/`);
    assert.equal(indexRes.status, 200);
    const indexText = await indexRes.text();
    assert.ok(indexText.includes('OBS Social Widget'));

    const dockRes = await fetch(`${baseUrl}/dock.html`);
    assert.equal(dockRes.status, 200);

    const cssRes = await fetch(`${baseUrl}/src/styles.css`);
    assert.equal(cssRes.status, 200);

    // 2. Security: block private files & path traversal
    for (const badPath of ['/package.json', '/server.mjs', '/.git/HEAD', '/../package.json']) {
      const badRes = await fetch(`${baseUrl}${badPath}`);
      assert.equal(badRes.status, 404, `Expected 404 for ${badPath}`);
    }

    // 3. Initial config is null before first PUT
    const initCfgRes = await fetch(`${baseUrl}/api/config`);
    assert.equal(initCfgRes.status, 200);
    const initCfgJson = await initCfgRes.json();
    assert.equal(initCfgJson.config, null);

    // 4. Connect SSE listener and trigger PUT /api/config
    const sseReceived = new Promise((resolve, reject) => {
      const req = http.get(`${baseUrl}/api/events`, (res) => {
        let buf = '';
        res.setEncoding('utf8');
        res.on('data', (chunk) => {
          buf += chunk;
          if (buf.includes('event: config-updated')) {
            req.destroy();
            resolve(buf);
          }
        });
      });
      req.on('error', reject);
      setTimeout(() => {
        req.destroy();
        reject(new Error('SSE timeout'));
      }, 3000);
    });

    // Give SSE connection a moment to register
    await new Promise((r) => setTimeout(r, 60));

    const putRes = await fetch(`${baseUrl}/api/config`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        sender: 'dock-test',
        config: {
          lang: 'ru',
          items: [
            {
              id: 'tg-1',
              platform: 'telegram',
              title: 'Telegram',
              handle: '@stream_live',
              accentColor: '#2AABEE'
            }
          ],
          appearance: { theme: 'cyber-pill' }
        }
      })
    });
    assert.equal(putRes.status, 200);
    const putJson = await putRes.json();
    assert.equal(putJson.ok, true);
    assert.equal(putJson.config.items[0].handle, '@stream_live');
    assert.equal(putJson.config.appearance.theme, 'cyber-pill');

    const ssePayload = await sseReceived;
    assert.ok(ssePayload.includes('@stream_live'));
    assert.ok(ssePayload.includes('dock-test'));

    // 5. Verify disk persistence
    const savedOnDisk = JSON.parse(await fs.readFile(path.join(tmpDir, 'config.json'), 'utf8'));
    assert.equal(savedOnDisk.items[0].handle, '@stream_live');

    const getCfgRes = await fetch(`${baseUrl}/api/config`);
    const getCfgJson = await getCfgRes.json();
    assert.equal(getCfgJson.config.items[0].handle, '@stream_live');

    // 6. /api/info returns resolved storage directories
    const infoRes = await fetch(`${baseUrl}/api/info`);
    assert.equal(infoRes.status, 200);
    const infoJson = await infoRes.json();
    assert.equal(infoJson.ok, true);
    assert.equal(infoJson.dataDir, tmpDir);
    assert.ok(infoJson.profilesDir.startsWith(tmpDir));
    assert.ok(infoJson.uploadsDir.startsWith(tmpDir));

    // 7. POST /api/upload saves PNG and sanitized SVG under /uploads/ and blocks traversal
    const tinyPngB64 = 'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==';
    const upPngRes = await fetch(`${baseUrl}/api/upload`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        filename: 'My Icon!.png',
        dataUrl: `data:image/png;base64,${tinyPngB64}`
      })
    });
    assert.equal(upPngRes.status, 200);
    const upPng = await upPngRes.json();
    assert.equal(upPng.ok, true);
    assert.match(upPng.url, /^\/uploads\/.+\.png$/);

    const fetchedPng = await fetch(`${baseUrl}${upPng.url}`);
    assert.equal(fetchedPng.status, 200);
    assert.equal(fetchedPng.headers.get('content-type'), 'image/png');
    assert.equal(fetchedPng.headers.get('x-content-type-options'), 'nosniff');

    const unsafeSvg = '<svg viewBox="0 0 24 24" onload="alert(1)"><script>hack()</script><circle cx="12" cy="12" r="10"/></svg>';
    const upSvgRes = await fetch(`${baseUrl}/api/upload`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        filename: 'badge.svg',
        dataUrl: `data:image/svg+xml;base64,${Buffer.from(unsafeSvg, 'utf8').toString('base64')}`
      })
    });
    assert.equal(upSvgRes.status, 200);
    const upSvg = await upSvgRes.json();
    const fetchedSvgText = await (await fetch(`${baseUrl}${upSvg.url}`)).text();
    assert.ok(fetchedSvgText.includes('<circle'));
    assert.ok(!fetchedSvgText.includes('<script'));
    assert.ok(!fetchedSvgText.includes('onload'));

    const badUpload = await fetch(`${baseUrl}/api/upload`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ filename: 'evil.html', dataUrl: 'data:text/html;base64,PGh0bWw+' })
    });
    assert.equal(badUpload.status, 400);

    const traversalUpload = await fetch(`${baseUrl}/uploads/..%2Fconfig.json`);
    assert.equal(traversalUpload.status, 404);

    // 8. Profiles CRUD + ?profile= config isolation for both widgets
    const createProf = await fetch(`${baseUrl}/api/profiles`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: 'Minecraft Scene' })
    });
    assert.equal(createProf.status, 200);
    const profCreated = await createProf.json();
    assert.equal(profCreated.profile.id, 'minecraft-scene');

    const profPut = await fetch(`${baseUrl}/api/config?profile=${profCreated.profile.id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        sender: 'prof-test',
        config: {
          items: [{ id: 'p1', platform: 'discord', title: 'Discord', handle: 'discord.gg/mc-scene', accentColor: '#5865F2' }]
        }
      })
    });
    assert.equal(profPut.status, 200);

    // Default profile remained untouched
    const defaultAfter = await (await fetch(`${baseUrl}/api/config`)).json();
    assert.equal(defaultAfter.config.items[0].handle, '@stream_live');

    const sceneAfter = await (await fetch(`${baseUrl}/api/config?profile=${profCreated.profile.id}`)).json();
    assert.equal(sceneAfter.config.items[0].handle, 'discord.gg/mc-scene');

    const listProfs = await (await fetch(`${baseUrl}/api/profiles`)).json();
    assert.ok(listProfs.profiles.some((p) => p.id === 'default'));
    assert.ok(listProfs.profiles.some((p) => p.id === 'minecraft-scene'));

    const delDefault = await fetch(`${baseUrl}/api/profiles/default`, { method: 'DELETE' });
    assert.equal(delDefault.status, 400);

    const delScene = await fetch(`${baseUrl}/api/profiles/${profCreated.profile.id}`, { method: 'DELETE' });
    assert.equal(delScene.status, 200);

    // MC Profiles CRUD isolation
    const mcProfRes = await fetch(`${baseUrl}/api/mc-profiles`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: 'Bedrock Lobby', config: { server: { name: 'Lobby 2', ip: 'lobby.mc.ru', edition: 'bedrock' } } })
    });
    assert.equal(mcProfRes.status, 200);
    const mcProf = await mcProfRes.json();
    const mcSceneCfg = await (await fetch(`${baseUrl}/api/mc-config?profile=${mcProf.profile.id}`)).json();
    assert.equal(mcSceneCfg.config.server.name, 'Lobby 2');
    assert.equal(mcSceneCfg.config.server.edition, 'bedrock');
  } finally {
    if (typeof server.closeAllConnections === 'function') server.closeAllConnections();
    await new Promise((resolve) => server.close(resolve));
    await fs.rm(tmpDir, { recursive: true, force: true });
  }
});
