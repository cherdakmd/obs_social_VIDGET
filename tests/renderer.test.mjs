import test from 'node:test';
import assert from 'node:assert/strict';
import { createRequire } from 'node:module';

const require = createRequire(import.meta.url);
const Config = require('../src/config.js');
const Renderer = require('../src/renderer.js');

test('hexToRgbString converts 6-char and 3-char hex colors accurately', () => {
  assert.equal(Renderer.hexToRgbString('#2AABEE'), '42, 171, 238');
  assert.equal(Renderer.hexToRgbString('#fff'), '255, 255, 255');
  assert.equal(Renderer.hexToRgbString('invalid', '1, 2, 3'), '1, 2, 3');
});

test('formatShortUrl cleans protocol, www, and trailing slash', () => {
  assert.equal(Renderer.formatShortUrl('https://www.t.me/my_channel/'), 't.me/my_channel');
  assert.equal(Renderer.formatShortUrl('mailto:hi@example.com'), 'hi@example.com');
});

test('shouldShowQr respects global and per-item overrides', () => {
  const cfg = Config.getDefaultConfig();
  const item = { ...cfg.items[0], url: 'https://t.me/test', showQr: 'inherit' };

  cfg.appearance.showQrGlobal = false;
  assert.equal(Renderer.shouldShowQr(item, cfg), false);

  item.showQr = 'on';
  assert.equal(Renderer.shouldShowQr(item, cfg), true);

  cfg.appearance.showQrGlobal = true;
  item.showQr = 'off';
  assert.equal(Renderer.shouldShowQr(item, cfg), false);

  item.showQr = 'on';
  item.url = '';
  assert.equal(Renderer.shouldShowQr(item, cfg), false);
});

test('getStructuralSignature changes when QR, layout, or icon changes, stays stable on color tweaks', () => {
  const cfg = Config.getDefaultConfig();
  const item = { ...cfg.items[0] };
  const s1 = Renderer.getStructuralSignature(item, cfg);

  // Changing accentColor or opacity shouldn't alter structural signature
  item.accentColor = '#ff00ff';
  cfg.appearance.bgOpacity = 0.4;
  assert.equal(Renderer.getStructuralSignature(item, cfg), s1);

  // Changing layout or QR must alter structural signature
  cfg.appearance.layout = 'split';
  assert.notEqual(Renderer.getStructuralSignature(item, cfg), s1);
});
