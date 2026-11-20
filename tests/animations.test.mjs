import test from 'node:test';
import assert from 'node:assert/strict';
import { createRequire } from 'node:module';

const require = createRequire(import.meta.url);
const Config = require('../src/config.js');
const Animations = require('../src/animations.js');
const I18n = require('../src/i18n.js');

test('all animation styles and directions build valid enter and exit plans', () => {
  const base = Config.getDefaultConfig();

  for (const style of Config.ANIM_STYLES) {
    for (const dir of Config.DIRECTIONS) {
      const cfg = Config.normalizeConfig({
        ...base,
        animation: { ...base.animation, style, direction: dir }
      });

      const enter = Animations.buildEnterPlan(cfg);
      const exit = Animations.buildExitPlan(cfg);

      if (style === 'instant') {
        assert.equal(enter.instant, true);
        assert.equal(exit.instant, true);
      } else {
        assert.equal(enter.instant, false);
        assert.equal(exit.instant, false);
        assert.ok(enter.steps.length >= 1, `enter steps missing for ${style}/${dir}`);
        assert.ok(exit.steps.length >= 1, `exit steps missing for ${style}/${dir}`);
        for (const s of [...enter.steps, ...exit.steps]) {
          assert.ok(Array.isArray(s.keyframes) && s.keyframes.length >= 2);
          assert.ok(typeof s.options.duration === 'number' && s.options.duration > 0);
        }
      }
    }
  }
});

test('i18n Russian and English dictionaries have matching top-level and nested keys', () => {
  const ru = I18n.DICT.ru;
  const en = I18n.DICT.en;

  const ruKeys = Object.keys(ru).sort();
  const enKeys = Object.keys(en).sort();
  assert.deepEqual(ruKeys, enKeys);

  for (const k of ruKeys) {
    if (typeof ru[k] === 'object' && ru[k] !== null) {
      assert.deepEqual(Object.keys(ru[k]).sort(), Object.keys(en[k]).sort(), `Mismatch inside key ${k}`);
    }
  }
});

test('i18n covers all themes, layouts, presets, animation styles, idle motions, and progress indicators', () => {
  assert.ok(Config.ANIM_STYLES.length >= 16);
  for (const lang of ['ru', 'en']) {
    const d = I18n.DICT[lang];
    for (const id of Config.THEMES) assert.ok(d.themes[id], `missing theme ${id} in ${lang}`);
    for (const id of Config.LAYOUTS) assert.ok(d.layouts[id], `missing layout ${id} in ${lang}`);
    for (const id of Object.keys(Config.STYLE_PRESETS)) assert.ok(d.presets[id], `missing preset ${id} in ${lang}`);
    for (const id of Config.ANIM_STYLES) assert.ok(d.animStyles[id], `missing animStyle ${id} in ${lang}`);
    for (const id of Config.IDLE_MOTIONS) assert.ok(d.idleMotions[id], `missing idleMotion ${id} in ${lang}`);
    for (const id of Config.PROGRESS_STYLES) assert.ok(d.progressStyles[id], `missing progressStyle ${id} in ${lang}`);
  }
});
