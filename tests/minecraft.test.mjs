import test from 'node:test';
import assert from 'node:assert/strict';
import net from 'node:net';
import dgram from 'node:dgram';
import fs from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import { createRequire } from 'node:module';

import { createObsWidgetServer } from '../server.mjs';

const require = createRequire(import.meta.url);
const McIcons = require('../src/mc-icons.js');
const McConfig = require('../src/mc-config.js');
const McPing = require('../src/mc-ping.js');
const McRenderer = require('../src/mc-renderer.js');
const McI18n = require('../src/mc-i18n.js');

function readVarIntFromBuf(buf, offset) {
  let num = 0;
  let shift = 0;
  let pos = offset;
  while (pos < buf.length) {
    const b = buf[pos++];
    num |= (b & 0x7f) << shift;
    if ((b & 0x80) === 0) return { value: num, bytesRead: pos - offset };
    shift += 7;
  }
  return null;
}

function createFakeJavaServer(statusJson) {
  const server = net.createServer((socket) => {
    let buffer = Buffer.alloc(0);
    let state = 'handshake';

    socket.on('data', (chunk) => {
      buffer = Buffer.concat([buffer, chunk]);
      while (buffer.length > 0) {
        const lenInfo = readVarIntFromBuf(buffer, 0);
        if (!lenInfo) return;
        const packetLen = lenInfo.value;
        const totalLen = lenInfo.bytesRead + packetLen;
        if (buffer.length < totalLen) return;

        const payload = buffer.subarray(lenInfo.bytesRead, totalLen);
        buffer = buffer.subarray(totalLen);

        const idInfo = readVarIntFromBuf(payload, 0);
        if (!idInfo) continue;

        if (state === 'handshake' && idInfo.value === 0x00) {
          state = 'status';
        } else if (state === 'status' && idInfo.value === 0x00) {
          const jsonBuf = Buffer.from(JSON.stringify(statusJson), 'utf8');
          const strPacket = Buffer.concat([
            McPing.encodeVarInt(0x00),
            McPing.encodeVarInt(jsonBuf.length),
            jsonBuf
          ]);
          const full = Buffer.concat([McPing.encodeVarInt(strPacket.length), strPacket]);
          socket.write(full);
          socket.end();
        }
      }
    });
  });

  return new Promise((resolve) => {
    server.listen(0, '127.0.0.1', () => {
      const addr = server.address();
      resolve({ server, port: addr.port });
    });
  });
}

function createFakeBedrockServer(motdLine) {
  const sock = dgram.createSocket('udp4');
  sock.on('message', (msg, rinfo) => {
    if (msg.length > 0 && msg[0] === 0x01) {
      const strBuf = Buffer.from(motdLine, 'utf8');
      const pong = Buffer.alloc(1 + 8 + 8 + 16 + 2 + strBuf.length);
      pong[0] = 0x1c;
      msg.copy(pong, 1, 1, 9);
      pong.writeBigUInt64BE(BigInt('0x9988776655443322'), 9);
      McPing.RAKNET_MAGIC.copy(pong, 17);
      pong.writeUInt16BE(strBuf.length, 33);
      strBuf.copy(pong, 35);
      sock.send(pong, rinfo.port, rinfo.address);
    }
  });

  return new Promise((resolve) => {
    sock.bind(0, '127.0.0.1', () => {
      const addr = sock.address();
      resolve({ sock, port: addr.port });
    });
  });
}

function createMockDocument() {
  function makeNode(tag) {
    const attrs = {};
    const props = {};
    const children = [];
    let html = '';
    const el = {
      tagName: tag.toUpperCase(),
      className: '',
      style: {
        setProperty(k, v) { props[k] = v; },
        getPropertyValue(k) { return props[k] || ''; }
      },
      setAttribute(k, v) { attrs[k] = String(v); },
      getAttribute(k) { return attrs[k] !== undefined ? attrs[k] : null; },
      appendChild(c) { children.push(c); },
      get innerHTML() { return html; },
      set innerHTML(v) { html = String(v); },
      get ownerDocument() { return null; },
      _attrs: attrs,
      _props: props,
      _children: children,
      querySelector(sel) {
        if (sel === '.mc-ip-text') {
          return { textContent: '' };
        }
        return null;
      }
    };
    return el;
  }
  return {
    createElement(tag) { return makeNode(tag); }
  };
}

test('McIcons provides 18 Minecraft SVG icons with bilingual search and XSS-safe sanitization', () => {
  assert.equal(McIcons.MC_ICONS.length, 18);
  assert.ok(McIcons.searchIcons('крипер').some((i) => i.id === 'creeper'));
  assert.ok(McIcons.searchIcons('sword').some((i) => i.id === 'diamond-sword'));

  const dirty = '<svg onload="alert(1)"><script>evil()</script><rect width="10" height="10" onclick="x()"/><a href="javascript:alert(2)">x</a></svg>';
  const clean = McIcons.sanitizeSvg(dirty);
  assert.ok(!clean.includes('<script'));
  assert.ok(!clean.includes('onload'));
  assert.ok(!clean.includes('onclick'));
  assert.ok(!clean.includes('javascript:'));

  const liveHtml = McIcons.renderIconHtml(
    { iconType: 'live-icon', iconPreset: 'grass-block' },
    'data:image/png;base64,AAAA'
  );
  assert.ok(liveHtml.includes('<img') && liveHtml.includes('data:image/png;base64,AAAA'));

  const emojiHtml = McIcons.renderIconHtml({ iconType: 'emoji', iconEmoji: '⛏️' }, '');
  assert.ok(emojiHtml.includes('⛏️'));
});

test('McConfig normalizes display modes, server fields, reset sections, and hash codec', () => {
  const def = McConfig.getDefaultConfig();
  assert.equal(def.playback.displayMode, 'always');
  assert.equal(def.liveStatus.enabled, false);
  assert.equal(def.server.edition, 'java');

  const norm = McConfig.normalizeConfig({
    playback: { displayMode: 'interval', displayDurationSec: 999, intervalCooldownSec: 1 },
    server: { name: 'Test SMP', ip: 'play.example.org', edition: 'bedrock' },
    liveStatus: { enabled: true, source: 'server', pollIntervalSec: 3 }
  });
  assert.equal(norm.playback.displayMode, 'interval');
  assert.equal(norm.playback.displayDurationSec, 120);
  assert.equal(norm.playback.intervalCooldownSec, 2);
  assert.equal(norm.server.edition, 'bedrock');
  assert.equal(norm.liveStatus.enabled, true);
  assert.equal(norm.liveStatus.pollIntervalSec, 10);

  const afterDesignReset = McConfig.resetSection({
    ...norm,
    appearance: { ...norm.appearance, theme: 'cyber-pill', scale: 1.5 }
  }, 'design');
  assert.equal(afterDesignReset.appearance.theme, 'glass-neon');
  assert.equal(afterDesignReset.server.ip, 'play.example.org');

  const afterAllReset = McConfig.resetSection(norm, 'all');
  assert.equal(afterAllReset.server.name, def.server.name);

  const encoded = McConfig.encodeConfigToParam(norm);
  const decoded = McConfig.decodeConfigFromParam(encoded);
  assert.equal(decoded.server.name, 'Test SMP');
  assert.equal(decoded.playback.displayMode, 'interval');
});

test('McI18n RU and EN dictionaries have 100% key symmetry', () => {
  const ruKeys = Object.keys(McI18n.DICT.ru).sort();
  const enKeys = Object.keys(McI18n.DICT.en).sort();
  assert.deepEqual(ruKeys, enKeys);
});

test('McPing parses addresses, detects LAN hosts, and pings Java TCP and Bedrock UDP servers', async () => {
  assert.deepEqual(McPing.parseAddress('play.myserver.ru', 'java'), {
    host: 'play.myserver.ru',
    port: 25565,
    explicitPort: false,
    normalized: 'play.myserver.ru'
  });
  assert.deepEqual(McPing.parseAddress('127.0.0.1:25577', 'java'), {
    host: '127.0.0.1',
    port: 25577,
    explicitPort: true,
    normalized: '127.0.0.1:25577'
  });
  assert.deepEqual(McPing.parseAddress('mc.example.net', 'bedrock'), {
    host: 'mc.example.net',
    port: 19132,
    explicitPort: false,
    normalized: 'mc.example.net'
  });
  assert.equal(McPing.parseAddress('', 'java'), null);
  assert.equal(McPing.parseAddress('bad host!!', 'java'), null);

  assert.equal(McPing.isLocalOrPrivateHost('localhost'), true);
  assert.equal(McPing.isLocalOrPrivateHost('127.0.0.1'), true);
  assert.equal(McPing.isLocalOrPrivateHost('192.168.0.12'), true);
  assert.equal(McPing.isLocalOrPrivateHost('10.24.1.5'), true);
  assert.equal(McPing.isLocalOrPrivateHost('172.16.5.2'), true);
  assert.equal(McPing.isLocalOrPrivateHost('play.hypixel.net'), false);

  const fakeJava = await createFakeJavaServer({
    version: { name: 'Paper 1.21.4', protocol: 769 },
    players: { max: 100, online: 42 },
    description: { text: 'Welcome to Survival!' },
    favicon: 'data:image/png;base64,iVBORw0KGgo='
  });
  try {
    const res = await McPing.pingJavaServer('127.0.0.1', fakeJava.port, 1500);
    assert.equal(res.online, true);
    assert.equal(res.playersOnline, 42);
    assert.equal(res.playersMax, 100);
    assert.equal(res.version, 'Paper 1.21.4');
    assert.equal(res.motd, 'Welcome to Survival!');
    assert.ok(res.favicon.startsWith('data:image/png'));
  } finally {
    await new Promise((r) => fakeJava.server.close(r));
  }

  const fakeBedrock = await createFakeBedrockServer('MCPE;Bedrock SMP;712;1.21.50;17;50;12345;Survival;');
  try {
    const res = await McPing.pingBedrockServer('127.0.0.1', fakeBedrock.port, 1500);
    assert.equal(res.online, true);
    assert.equal(res.edition, 'bedrock');
    assert.equal(res.playersOnline, 17);
    assert.equal(res.playersMax, 50);
    assert.equal(res.version, '1.21.50');
    assert.equal(res.motd, 'Bedrock SMP');
  } finally {
    fakeBedrock.sock.close();
  }

  const normApi = McPing.normalizeMcStatusIoResponse({
    online: true,
    version: { name_clean: '1.21.4' },
    players: { online: 12, max: 60 },
    motd: { clean: 'Clean MOTD' },
    icon: 'data:image/png;base64,ZZZ'
  }, 'java');
  assert.equal(normApi.online, true);
  assert.equal(normApi.playersOnline, 12);
  assert.equal(normApi.playersMax, 60);
  assert.equal(normApi.version, '1.21.4');
  assert.equal(normApi.motd, 'Clean MOTD');
});

test('McRenderer builds card markup with status pill, version badge, IP prefix, and respects compact layouts', () => {
  const cfg = McConfig.getDefaultConfig();
  cfg.server.name = 'Emerald SMP';
  cfg.server.ip = 'play.emerald.gg';
  cfg.server.ipPrefix = 'IP:';
  cfg.server.version = '1.21.4';
  cfg.server.description = 'Vanilla + Voice Chat';
  cfg.liveStatus.enabled = true;
  cfg.liveStatus.showOnlineCount = true;
  cfg.liveStatus.syncLiveVersion = true;
  cfg.liveStatus.useLiveIcon = true;

  const doc = createMockDocument();
  const statusState = {
    ok: true,
    online: true,
    playersOnline: 28,
    playersMax: 100,
    version: '1.21.5',
    iconDataUrl: 'data:image/png;base64,iVBORw0KGgo='
  };

  const card = McRenderer.createCardElement(cfg, statusState, { document: doc });
  assert.ok(card.className.includes('mc-card'));
  assert.ok(card.innerHTML.includes('Emerald SMP'));
  assert.ok(card.innerHTML.includes('1.21.5'));
  assert.ok(card.innerHTML.includes('28/100'));
  assert.ok(card.innerHTML.includes('IP:'));
  assert.ok(card.innerHTML.includes('play.emerald.gg'));
  assert.ok(card.innerHTML.includes('Vanilla + Voice Chat'));
  assert.ok(card.innerHTML.includes('data:image/png;base64,iVBORw0KGgo='));

  // Offline badge
  const offCard = McRenderer.createCardElement(cfg, { ok: true, online: false }, { document: doc });
  assert.ok(offCard.innerHTML.includes('is-offline'));

  // Compact layout hides description
  cfg.appearance.layout = 'ticker';
  const tickerCard = McRenderer.createCardElement(cfg, statusState, { document: doc });
  assert.ok(!tickerCard.innerHTML.includes('Vanilla + Voice Chat'));

  // Aligned IP row/prefix/text classes & signature
  assert.ok(card.innerHTML.includes('mc-ip-row'));
  assert.ok(card.innerHTML.includes('mc-ip-prefix'));
  assert.ok(card.innerHTML.includes('mc-ip-text'));

  const sigWithPrefix = McRenderer.getStructuralSignature(cfg, statusState);
  cfg.appearance.showIpPrefix = false;
  const sigWithoutPrefix = McRenderer.getStructuralSignature(cfg, statusState);
  assert.notEqual(sigWithPrefix, sigWithoutPrefix);

  const noPrefixCard = McRenderer.createCardElement(cfg, statusState, { document: doc });
  assert.ok(!noPrefixCard.innerHTML.includes('mc-ip-prefix'));
  assert.ok(noPrefixCard.innerHTML.includes('mc-ip-line'));

  const widePos = McConfig.normalizeConfig({ position: { offsetX: 1480, offsetY: 880 } });
  assert.equal(widePos.position.offsetX, 1480);
  assert.equal(widePos.position.offsetY, 880);
});

test('server.mjs serves Minecraft pages, stores mc-config independently, broadcasts SSE, and pings via /api/mc-status', async () => {
  const tmpDir = await fs.mkdtemp(path.join(os.tmpdir(), 'obs-mc-test-'));
  const fakeJava = await createFakeJavaServer({
    version: { name: '1.21.4', protocol: 769 },
    players: { max: 50, online: 9 },
    description: 'Local Test'
  });

  const server = createObsWidgetServer({
    dataDir: tmpDir,
    disableRemoteMcStatus: true
  });

  await new Promise((resolve) => server.listen(0, '127.0.0.1', resolve));
  const { port } = server.address();
  const baseUrl = `http://127.0.0.1:${port}`;

  try {
    // 1. Static HTML routes
    const mcHtml = await fetch(`${baseUrl}/minecraft.html`);
    assert.equal(mcHtml.status, 200);
    const mcHtmlBody = await mcHtml.text();
    assert.ok(mcHtmlBody.includes('OBS Minecraft Widget'));

    const mcDock = await fetch(`${baseUrl}/minecraft-dock.html`);
    assert.equal(mcDock.status, 200);

    // 2. Config isolation: PUT /api/mc-config must not touch /api/config
    const initSocial = await (await fetch(`${baseUrl}/api/config`)).json();
    assert.equal(initSocial.config, null);

    // Connect SSE listener before PUT
    const sseAbort = new AbortController();
    const ssePromise = (async () => {
      const resp = await fetch(`${baseUrl}/api/events`, { signal: sseAbort.signal });
      const reader = resp.body.getReader();
      let buf = '';
      while (true) {
        const { value, done } = await reader.read();
        if (done) break;
        buf += new TextDecoder().decode(value);
        if (buf.includes('event: mc-config-updated')) {
          sseAbort.abort();
          return buf;
        }
      }
      return buf;
    })().catch((e) => (e && e.name === 'AbortError' ? 'event: mc-config-updated' : ''));

    // Slight delay so SSE connection registers
    await new Promise((r) => setTimeout(r, 80));

    const payload = McConfig.getDefaultConfig();
    payload.server.name = 'Isolated MC Server';
    payload.server.ip = `127.0.0.1:${fakeJava.port}`;
    payload.playback.displayMode = 'interval';

    const putRes = await fetch(`${baseUrl}/api/mc-config`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ sender: 'test', config: payload })
    });
    assert.equal(putRes.status, 200);

    const sseText = await ssePromise;
    assert.ok(sseText.includes('event: mc-config-updated'));

    const getMc = await (await fetch(`${baseUrl}/api/mc-config`)).json();
    assert.equal(getMc.config.server.name, 'Isolated MC Server');
    assert.equal(getMc.config.playback.displayMode, 'interval');

    const stillNoSocial = await (await fetch(`${baseUrl}/api/config`)).json();
    assert.equal(stillNoSocial.config, null);

    // 3. /api/mc-status live ping + validation
    const badStatus = await fetch(`${baseUrl}/api/mc-status?address=`);
    assert.equal(badStatus.status, 400);

    const live1 = await (await fetch(`${baseUrl}/api/mc-status?address=${encodeURIComponent(`127.0.0.1:${fakeJava.port}`)}&edition=java&source=server`)).json();
    assert.equal(live1.online, true);
    assert.equal(live1.playersOnline, 9);
    assert.equal(live1.playersMax, 50);
    assert.equal(live1.version, '1.21.4');

    const live2 = await (await fetch(`${baseUrl}/api/mc-status?address=${encodeURIComponent(`127.0.0.1:${fakeJava.port}`)}&edition=java&source=server`)).json();
    assert.equal(live2.cached, true);
  } finally {
    await new Promise((r) => server.close(r));
    await new Promise((r) => fakeJava.server.close(r));
    await fs.rm(tmpDir, { recursive: true, force: true });
  }
});
