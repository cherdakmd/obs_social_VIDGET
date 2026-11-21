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

test('expanded icon library provides 60+ categorized icons with bilingual RU/EN search', () => {
  assert.ok(Icons.PLATFORMS.length >= 60, `Expected 60+ icons, got ${Icons.PLATFORMS.length}`);
  const cats = Icons.getCategories('ru');
  assert.equal(cats[0].id, 'all');
  assert.ok(cats.length >= 5);

  const donateIcons = Icons.searchPlatforms('', 'donate');
  assert.ok(donateIcons.length >= 8);
  assert.ok(donateIcons.every((p) => p.category === 'donate'));

  const ruMatches = Icons.searchPlatforms('донат');
  assert.ok(ruMatches.some((p) => p.id === 'donationalerts'));

  const gameMatches = Icons.searchPlatforms('steam', 'gaming');
  assert.ok(gameMatches.some((p) => p.id === 'steam'));

  assert.ok(Icons.PLATFORMS.every((p) => p.svg.includes('<svg') && p.accentColor.startsWith('#')));
});

test('typography schema normalizes cleanly and preserves v1.0.0 fontFamily compatibility', () => {
  const legacy = {
    appearance: { fontFamily: 'mono' },
    typography: {
      customFontName: '"Bad;Font<script>"',
      handleSizePx: 200,
      handleWeight: 740,
      textStrokePx: 9,
      textShadowMode: 'glow'
    }
  };
  const clean = Config.normalizeConfig(legacy);
  assert.equal(clean.typography.fontPreset, 'mono');
  assert.equal(clean.appearance.fontFamily, 'mono');
  assert.equal(clean.typography.customFontName, 'BadFontscript');
  assert.equal(clean.typography.handleSizePx, 38);
  assert.equal(clean.typography.handleWeight, 700);
  assert.equal(clean.typography.textStrokePx, 3);
  assert.equal(clean.typography.textShadowMode, 'glow');
});

test('resetSection resets targeted config sections and look-only preserves user socials', () => {
  const cfg = Config.getDefaultConfig();
  cfg.lang = 'en';
  cfg.items[0].handle = '@kept_social';
  cfg.appearance.theme = 'retro-pop';
  cfg.typography.fontPreset = 'pixel';
  cfg.typography.handleSizePx = 30;
  cfg.animation.style = 'flip-3d';

  const resetTypo = Config.resetSection(cfg, 'typography');
  assert.equal(resetTypo.typography.fontPreset, 'modern');
  assert.equal(resetTypo.typography.handleSizePx, 19);
  assert.equal(resetTypo.appearance.theme, 'retro-pop');
  assert.equal(resetTypo.items[0].handle, '@kept_social');

  const resetLook = Config.resetSection(cfg, 'look');
  assert.equal(resetLook.appearance.theme, 'glass-neon');
  assert.equal(resetLook.typography.fontPreset, 'modern');
  assert.equal(resetLook.animation.style, 'expand-pill');
  assert.equal(resetLook.items[0].handle, '@kept_social');

  const resetAll = Config.resetSection(cfg, 'all');
  assert.equal(resetAll.lang, 'en');
  assert.equal(resetAll.items[0].handle, '@my_stream_tg');
});

test('all 16 style presets, 14 themes, and 10 layouts normalize and apply cleanly', () => {
  const presetIds = Object.keys(Config.STYLE_PRESETS);
  assert.ok(presetIds.length >= 16, `Expected 16+ presets, got ${presetIds.length}`);
  assert.ok(Config.THEMES.length >= 14);
  assert.ok(Config.LAYOUTS.length >= 10);

  const base = Config.getDefaultConfig();
  base.items[0].handle = '@preserved_user';

  for (const pid of presetIds) {
    const applied = Config.applyStylePreset(base, pid);
    assert.equal(applied.items[0].handle, '@preserved_user');
    assert.ok(Config.THEMES.includes(applied.appearance.theme), `invalid theme in preset ${pid}`);
    assert.ok(Config.LAYOUTS.includes(applied.appearance.layout), `invalid layout in preset ${pid}`);
    assert.ok(Config.ANIM_STYLES.includes(applied.animation.style), `invalid anim in preset ${pid}`);
    assert.ok(Config.IDLE_MOTIONS.includes(applied.animation.idleMotion), `invalid idle in preset ${pid}`);
    assert.ok(Config.PROGRESS_STYLES.includes(applied.animation.progressStyle), `invalid progress in preset ${pid}`);
  }

  // Switching from ghost-overlay back to minimal-clean resets stroke cleanly
  const ghost = Config.applyStylePreset(base, 'ghost-overlay');
  assert.ok(ghost.typography.textStrokePx > 0);
  const minimal = Config.applyStylePreset(ghost, 'minimal-clean');
  assert.equal(minimal.typography.textStrokePx, 0);
});

test('widened 1080p position offsets, /uploads/ safe image URLs, and profile helpers work cleanly', () => {
  const norm = Config.normalizeConfig({
    position: { anchor: 'bottom-right', offsetX: 1520, offsetY: 910 },
    items: [
      { id: 'up1', platform: 'telegram', title: 'TG', handle: '@tg', iconType: 'image', iconImage: '/uploads/logo-123.png' },
      { id: 'up2', platform: 'twitch', title: 'TW', handle: 'tw', iconType: 'image', iconImage: '/uploads/../config.json' }
    ]
  });
  assert.equal(norm.position.offsetX, 1520);
  assert.equal(norm.position.offsetY, 910);
  assert.equal(norm.items[0].iconImage, '/uploads/logo-123.png');
  assert.equal(norm.items[1].iconImage, '');

  const clamped = Config.normalizeConfig({ position: { offsetX: 5000, offsetY: -40 } });
  assert.equal(clamped.position.offsetX, 1600);
  assert.equal(clamped.position.offsetY, 0);

  assert.equal(Icons.isSafeImageSrc('/uploads/avatar_1.webp'), true);
  assert.equal(Icons.isSafeImageSrc('/uploads/bad/nested.png'), false);

  assert.equal(Config.slugifyProfileName('Стрим Основной #1'), 'strim-osnovnoy-1');
  assert.equal(Config.sanitizeProfileId('../Bad Profile!'), 'bad-profile');
  const ov = Config.extractUrlOverrides(new URL('http://127.0.0.1:3847/index.html?profile=Scene%20Two'));
  assert.equal(ov.profile, 'scene-two');
});


