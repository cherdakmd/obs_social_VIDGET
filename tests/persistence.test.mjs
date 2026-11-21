import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import { createRequire } from 'node:module';
import { createObsWidgetServer } from '../server.mjs';

const require = createRequire(import.meta.url);
const Config = require('../src/config.js');
const McConfig = require('../src/mc-config.js');

async function withMockBrowserEnv(initialLs, initialWinName, fn) {
  const prevWindow = globalThis.window;
  const prevStorage = globalThis.localStorage;
  const prevLocation = globalThis.location;

  const lsMap = new Map(Object.entries(initialLs || {}));
  const winObj = {
    name: initialWinName || '',
    addEventListener() {}
  };

  globalThis.window = winObj;
  globalThis.localStorage = {
    getItem(k) { return lsMap.has(k) ? lsMap.get(k) : null; },
    setItem(k, v) { lsMap.set(k, String(v)); },
    removeItem(k) { lsMap.delete(k); }
  };
  globalThis.location = { protocol: 'file:', href: 'file:///C:/obs/index.html', search: '', hash: '' };

  try {
    return await fn({ lsMap, winObj });
  } finally {
    if (prevWindow === undefined) delete globalThis.window; else globalThis.window = prevWindow;
    if (prevStorage === undefined) delete globalThis.localStorage; else globalThis.localStorage = prevStorage;
    if (prevLocation === undefined) delete globalThis.location; else globalThis.location = prevLocation;
  }
}

test('Social widget store persists across OBS source refresh via window.name even if localStorage is wiped', async () => {
  let savedWinName = '';

  await withMockBrowserEnv({}, '', async ({ lsMap, winObj }) => {
    const store1 = Config.createConfigStore({ skipServerProbe: true });
    store1.init();
    store1.update((d) => {
      d.items[0].handle = '@persisted_streamer';
      d.appearance.theme = 'cyber-pill';
    });
    const res = await store1.saveNow();
    assert.equal(res.ok, true);
    assert.equal(res.target, 'local');
    savedWinName = winObj.name;
    assert.ok(lsMap.has(Config.STORAGE_KEY));
    assert.ok(savedWinName.startsWith('__OBS_SOCIAL_STATE_V1__:'));
    store1.destroy();
  });

  // Simulate OBS "Refresh cache" where localStorage was wiped on file://, but window.name survived
  await withMockBrowserEnv({}, savedWinName, () => {
    const store2 = Config.createConfigStore({ skipServerProbe: true });
    const cfg = store2.init();
    assert.equal(cfg.items[0].handle, '@persisted_streamer');
    assert.equal(cfg.appearance.theme, 'cyber-pill');
    store2.destroy();
  });
});

test('Social widget store does not overwrite user edits with stale #cfg= URL hash on OBS refresh', async () => {
  const urlCfg = Config.getDefaultConfig();
  urlCfg.items[0].handle = '@from_initial_url';
  const shareUrl = Config.buildShareUrl('file:///C:/obs/index.html', urlCfg);
  const parsedUrl = new URL(shareUrl);

  await withMockBrowserEnv({}, '', ({ lsMap, winObj }) => {
    // 1. First load applies #cfg= from URL
    const s1 = Config.createConfigStore({ skipServerProbe: true });
    const first = s1.init(Config.extractUrlOverrides(parsedUrl));
    assert.equal(first.items[0].handle, '@from_initial_url');

    // 2. User edits handle in OBS Interact / Studio
    s1.update((d) => {
      d.items[0].handle = '@edited_inside_obs';
    });
    s1.destroy();

    // 3. OBS refreshes source with the exact same URL (#cfg=...)
    const s2 = Config.createConfigStore({ skipServerProbe: true });
    const reloaded = s2.init(Config.extractUrlOverrides(parsedUrl));
    assert.equal(reloaded.items[0].handle, '@edited_inside_obs');
    s2.destroy();

    // 4. Even if localStorage was wiped but window.name survived, stale #cfg= still does not overwrite
    lsMap.clear();
    const s3 = Config.createConfigStore({ skipServerProbe: true });
    const reloadedFromWn = s3.init(Config.extractUrlOverrides(parsedUrl));
    assert.equal(reloadedFromWn.items[0].handle, '@edited_inside_obs');
    s3.destroy();

    // 5. A genuinely NEW #cfg= URL still applies cleanly
    const newerCfg = Config.getDefaultConfig();
    newerCfg.items[0].handle = '@brand_new_url_cfg';
    const newerUrl = new URL(Config.buildShareUrl('file:///C:/obs/index.html', newerCfg));
    const s4 = Config.createConfigStore({ skipServerProbe: true });
    const appliedNew = s4.init(Config.extractUrlOverrides(newerUrl));
    assert.equal(appliedNew.items[0].handle, '@brand_new_url_cfg');
    assert.ok(winObj.name.includes('@brand_new_url_cfg'));
    s4.destroy();
  });
});

test('Minecraft widget store survives localStorage wipe via window.name and protects edits from stale #cfg=', async () => {
  const urlCfg = McConfig.getDefaultConfig();
  urlCfg.server.ip = 'initial.mc.ru';
  const shareUrl = new URL(McConfig.buildShareUrl('file:///C:/obs/minecraft.html', urlCfg));

  await withMockBrowserEnv({}, '', async ({ lsMap }) => {
    const s1 = McConfig.createMcConfigStore({ skipServerProbe: true });
    const initCfg = s1.init(McConfig.extractUrlOverrides(shareUrl));
    assert.equal(initCfg.server.ip, 'initial.mc.ru');

    s1.update((d) => {
      d.server.ip = 'my-real-smp.ru';
      d.playback.displayMode = 'interval';
    });
    await s1.saveNow();
    s1.destroy();

    // Wipe localStorage, keep window.name, reload with same #cfg URL
    lsMap.clear();
    const s2 = McConfig.createMcConfigStore({ skipServerProbe: true });
    const reloaded = s2.init(McConfig.extractUrlOverrides(shareUrl));
    assert.equal(reloaded.server.ip, 'my-real-smp.ru');
    assert.equal(reloaded.playback.displayMode, 'interval');
    s2.destroy();
  });
});

test('server.mjs accepts POST keepalive/sendBeacon saves and recovers from corrupted primary JSON via backup', async () => {
  const tmpDir = await fs.mkdtemp(path.join(os.tmpdir(), 'obs-persist-test-'));
  const server = createObsWidgetServer({ dataDir: tmpDir });
  await new Promise((resolve) => server.listen(0, '127.0.0.1', resolve));
  const { port } = server.address();
  const baseUrl = `http://127.0.0.1:${port}`;

  try {
    // 1. Save via POST (as navigator.sendBeacon uses POST)
    const cfg = Config.getDefaultConfig();
    cfg.items[0].handle = '@beacon_saved';
    const postRes = await fetch(`${baseUrl}/api/config`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ sender: 'unload-beacon', config: cfg })
    });
    assert.equal(postRes.status, 200);
    const postJson = await postRes.json();
    assert.equal(postJson.ok, true);
    assert.ok(typeof postJson.savedAt === 'number');

    // 2. Corrupt primary config.json and verify server recovers from config.backup.json
    await fs.writeFile(path.join(tmpDir, 'config.json'), '{broken json', 'utf8');
    const recovered = await (await fetch(`${baseUrl}/api/config`)).json();
    assert.equal(recovered.ok, true);
    assert.equal(recovered.config.items[0].handle, '@beacon_saved');

    // 3. Same for mc-config POST & backup recovery
    const mcCfg = McConfig.getDefaultConfig();
    mcCfg.server.name = 'Backup Craft';
    const mcPostRes = await fetch(`${baseUrl}/api/mc-config`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ sender: 'mc-beacon', config: mcCfg })
    });
    assert.equal(mcPostRes.status, 200);
    await fs.writeFile(path.join(tmpDir, 'mc-config.json'), '', 'utf8');
    const mcRecovered = await (await fetch(`${baseUrl}/api/mc-config`)).json();
    assert.equal(mcRecovered.config.server.name, 'Backup Craft');

    // 4. End-to-end store.saveNow() -> HTTP server -> new store recovers even after full client wipe
    const prevWin = globalThis.window;
    const prevLs = globalThis.localStorage;
    const prevLoc = globalThis.location;
    const prevFetch = globalThis.fetch;

    try {
      const ls = new Map();
      globalThis.window = { name: '', addEventListener() {} };
      globalThis.localStorage = {
        getItem: (k) => (ls.has(k) ? ls.get(k) : null),
        setItem: (k, v) => ls.set(k, String(v)),
        removeItem: (k) => ls.delete(k)
      };
      globalThis.location = { protocol: 'http:', href: `${baseUrl}/`, search: '', hash: '' };
      globalThis.fetch = (url, init) => prevFetch(url.startsWith('/') ? `${baseUrl}${url}` : url, init);

      const storeA = Config.createConfigStore();
      storeA.init();
      storeA.update((d) => { d.items[0].handle = '@e2e_server_saved'; });
      const saveRes = await storeA.saveNow();
      assert.equal(saveRes.ok, true);
      assert.equal(saveRes.target, 'server');
      assert.equal(storeA.getSaveState().dirty, false);
      storeA.destroy();

      // Wipe client completely and simulate fresh OBS Browser Source reload
      ls.clear();
      globalThis.window.name = '';
      const storeB = Config.createConfigStore();
      let serverInitSeen = false;
      storeB.subscribe((cfg, meta) => {
        if (meta && meta.source === 'server-init') {
          serverInitSeen = cfg.items[0].handle === '@e2e_server_saved';
        }
      });
      storeB.init();
      await new Promise((r) => setTimeout(r, 120));
      assert.equal(serverInitSeen, true);
      assert.equal(storeB.get().items[0].handle, '@e2e_server_saved');
      storeB.destroy();

      // 5. Fresh OBS cache wipe + stale #cfg= in URL must NOT overwrite existing server config.json
      ls.clear();
      globalThis.window.name = '';
      const staleCfg = Config.getDefaultConfig();
      staleCfg.items[0].handle = '@stale_url_should_not_win';
      const staleUrl = new URL(Config.buildShareUrl(`${baseUrl}/`, staleCfg));
      globalThis.location = { protocol: 'http:', href: staleUrl.href, search: staleUrl.search, hash: staleUrl.hash };
      const storeC = Config.createConfigStore();
      storeC.init(Config.extractUrlOverrides(staleUrl));
      await new Promise((r) => setTimeout(r, 120));
      assert.equal(storeC.get().items[0].handle, '@e2e_server_saved');
      const verifyDisk = await (await prevFetch(`${baseUrl}/api/config`)).json();
      assert.equal(verifyDisk.config.items[0].handle, '@e2e_server_saved');
      storeC.destroy();
    } finally {
      if (prevWin === undefined) delete globalThis.window; else globalThis.window = prevWin;
      if (prevLs === undefined) delete globalThis.localStorage; else globalThis.localStorage = prevLs;
      if (prevLoc === undefined) delete globalThis.location; else globalThis.location = prevLoc;
      globalThis.fetch = prevFetch;
    }
  } finally {
    if (typeof server.closeAllConnections === 'function') server.closeAllConnections();
    await new Promise((resolve) => server.close(resolve));
    await fs.rm(tmpDir, { recursive: true, force: true });
  }
});

test('Social and Minecraft stores support Undo history and offline multi-profile isolation', async () => {
  await withMockBrowserEnv({}, '', async () => {
    // 1. Social store Undo & continuous studio-input coalescing
    const s = Config.createConfigStore({ skipServerProbe: true });
    s.init();
    assert.equal(s.canUndo(), false);
    assert.equal(s.undo(), null);

    const origHandle = s.get().items[0].handle;
    s.update((d) => { d.items[0].handle = '@step_one'; }, { source: 'studio-input' });
    s.update((d) => { d.items[0].handle = '@step_one_final'; }, { source: 'studio-input' });
    assert.equal(s.canUndo(), true);

    s.update((d) => { d.appearance.theme = 'cyber-pill'; }, { source: 'preset' });
    const afterUndo1 = s.undo();
    assert.equal(afterUndo1.appearance.theme, 'glass-neon');
    assert.equal(afterUndo1.items[0].handle, '@step_one_final');

    const afterUndo2 = s.undo();
    assert.equal(afterUndo2.items[0].handle, origHandle);
    assert.equal(s.canUndo(), false);

    // 2. Social profiles create/switch/delete offline
    const pCreated = await s.createProfile('Just Chatting', false);
    assert.equal(pCreated.id, 'just-chatting');
    assert.equal(s.getActiveProfile().id, 'just-chatting');
    s.update((d) => { d.items[0].handle = '@chatting_scene'; });

    await s.switchProfile('default');
    assert.equal(s.getActiveProfile().id, 'default');
    assert.equal(s.get().items[0].handle, origHandle);

    await s.switchProfile('just-chatting');
    assert.equal(s.get().items[0].handle, '@chatting_scene');

    const profiles = await s.listProfiles();
    assert.ok(profiles.some((p) => p.id === 'just-chatting'));

    assert.equal(await s.deleteProfile('default'), false);
    assert.equal(await s.deleteProfile('just-chatting'), true);
    assert.equal(s.getActiveProfile().id, 'default');
    s.destroy();

    // 3. Minecraft store Undo & profiles
    const ms = McConfig.createMcConfigStore({ skipServerProbe: true });
    const mcInit = ms.init();
    assert.equal(ms.canUndo(), false);
    ms.update((d) => { d.server.name = 'SkyBlock'; }, { source: 'studio-input' });
    assert.equal(ms.canUndo(), true);
    const mcUndone = ms.undo();
    assert.equal(mcUndone.server.name, mcInit.server.name);
    assert.equal(ms.canUndo(), false);

    const mcProf = await ms.createProfile('Survival SMP', true);
    ms.update((d) => { d.server.ip = 'survival.example.com'; });
    await ms.switchProfile('default');
    assert.notEqual(ms.get().server.ip, 'survival.example.com');
    await ms.switchProfile(mcProf.id);
    assert.equal(ms.get().server.ip, 'survival.example.com');
    await ms.deleteProfile(mcProf.id);
    ms.destroy();
  });
});
