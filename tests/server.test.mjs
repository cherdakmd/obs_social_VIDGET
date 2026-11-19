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
  } finally {
    await new Promise((resolve) => server.close(resolve));
    await fs.rm(tmpDir, { recursive: true, force: true });
  }
});
