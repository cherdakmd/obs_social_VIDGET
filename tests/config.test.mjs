import test from 'node:test';
import assert from 'node:assert/strict';
import { createRequire } from 'node:module';

const require = createRequire(import.meta.url);
const Icons = require('../src/icons.js');
const Config = require('../src/config.js');

test('default config has 4 valid Russian social cards', () => {
  const cfg = Config.getDefaultConfig();
  assert.equal(cfg.lang, 'ru');
  assert.equal(cfg.items.length, 4);
  assert.ok(cfg.items.every((it) => it.enabled && it.handle && it.accentColor.startsWith('#')));
});

test('normalizeConfig clamps out-of-range numbers and falls back invalid enums', () => {
  const dirty = {
    lang: 'fr',
    items: [
      {
        id: 'x1',
        platform: 'unknown-platform',
        title: 'Test',
        handle: '@test',
        accentColor: 'not-a-color',
        iconType: 'bad-type',
        iconImage: 'javascript:alert(1)',
        iconSvg: '<svg viewBox="0 0 24 24" onload="alert(1)"><script>evil()</script><path d="M0 0h24v24H0z"/></svg>',
        customDurationSec: 999
      }
    ],
    playback: {
      displayDurationSec: 0.1,
      enterDurationMs: -100,
      cyclePauseSec: 99999
    },
    animation: {
      style: 'non-existent',
      direction: 'diagonal',
      easing: 'warp-speed'
    },
    appearance: {
      theme: 'fake-theme',
      scale: 99,
      bgOpacity: -5,
      bgColor: 'rgb(0,0,0)'
    }
  };

  const clean = Config.normalizeConfig(dirty);
  assert.equal(clean.lang, 'ru');
  assert.equal(clean.items[0].platform, 'link');
  assert.equal(clean.items[0].accentColor, '#94A3B8');
  assert.equal(clean.items[0].iconType, 'preset');
  assert.equal(clean.items[0].iconImage, '');
  assert.ok(!clean.items[0].iconSvg.includes('<script'));
  assert.ok(!clean.items[0].iconSvg.includes('onload'));
  assert.equal(clean.items[0].customDurationSec, 120);
  assert.equal(clean.playback.displayDurationSec, 1.5);
  assert.equal(clean.playback.enterDurationMs, 0);
  assert.equal(clean.playback.cyclePauseSec, 600);
  assert.equal(clean.animation.style, 'expand-pill');
  assert.equal(clean.animation.direction, 'left');
  assert.equal(clean.appearance.theme, 'glass-neon');
  assert.equal(clean.appearance.scale, 2.2);
  assert.equal(clean.appearance.bgOpacity, 0);
  assert.equal(clean.appearance.bgColor, '#0c101b');
});

test('applyStylePreset updates look & motion without erasing user socials', () => {
  const cfg = Config.getDefaultConfig();
  cfg.items[0].handle = '@unique_streamer_handle';
  const updated = Config.applyStylePreset(cfg, 'retro-pop');
  assert.equal(updated.appearance.theme, 'retro-pop');
  assert.equal(updated.animation.style, 'drop-settle');
  assert.equal(updated.items[0].handle, '@unique_streamer_handle');
});

test('URL encode/decode round-trip preserves Cyrillic text and nested settings', () => {
  const cfg = Config.getDefaultConfig();
  cfg.items[0].handle = '@мой_телеграм';
  cfg.items[0].subtitle = 'Стримы каждый вечер в 19:00!';
  cfg.appearance.theme = 'cyber-pill';
  cfg.position.anchor = 'top-right';

  const encoded = Config.encodeConfigToParam(cfg);
  assert.ok(encoded.length > 20);
  assert.ok(!/[+/=]/.test(encoded));

  const decoded = Config.decodeConfigFromParam(encoded);
  assert.ok(decoded);
  assert.equal(decoded.items[0].handle, '@мой_телеграм');
  assert.equal(decoded.items[0].subtitle, 'Стримы каждый вечер в 19:00!');
  assert.equal(decoded.appearance.theme, 'cyber-pill');
  assert.equal(decoded.position.anchor, 'top-right');
});

test('buildShareUrl and extractUrlOverrides parse flags and hash config', () => {
  const cfg = Config.getDefaultConfig();
  cfg.items[1].handle = 'twitch.tv/arena_stream';
  const shareUrl = Config.buildShareUrl('http://127.0.0.1:3847/index.html', cfg, { setup: '1' });
  const parsed = new URL(shareUrl);
  const overrides = Config.extractUrlOverrides(parsed);

  assert.equal(overrides.setupOpen, true);
  assert.equal(overrides.dockMode, false);
  assert.ok(overrides.configFromUrl);
  assert.equal(overrides.configFromUrl.items[1].handle, 'twitch.tv/arena_stream');
});

test('sanitizeSvg strips scripts, foreignObject, and inline event handlers', () => {
  const malicious = '<svg viewBox="0 0 24 24" onclick="alert(1)"><foreignObject><div>hack</div></foreignObject><script>bad()</script><a xlink:href="javascript:alert(2)"><path d="M1 1h10v10H1z"/></a></svg>';
  const safe = Icons.sanitizeSvg(malicious);
  assert.ok(safe.includes('<path d="M1 1h10v10H1z"/>'));
  assert.ok(!safe.toLowerCase().includes('script'));
  assert.ok(!safe.toLowerCase().includes('foreignobject'));
  assert.ok(!safe.toLowerCase().includes('onclick'));
  assert.ok(!safe.toLowerCase().includes('javascript:'));
});
