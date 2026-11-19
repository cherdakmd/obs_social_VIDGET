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
