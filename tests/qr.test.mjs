import test from 'node:test';
import assert from 'node:assert/strict';
import { createRequire } from 'node:module';

const require = createRequire(import.meta.url);
const QR = require('../src/qr.js');

test('Reed-Solomon EC matches ISO/IEC 18004 reference vector for Version 1-M', () => {
  // Data codewords for "HELLO WORLD" in Alphanumeric V1-M from ISO 18004 Annex I
  const data = [32, 91, 11, 120, 209, 114, 220, 77, 67, 64, 236, 17, 236, 17, 236, 17];
  const ec = QR._internal.rsComputeEC(data, 10);
  assert.deepEqual(ec, [196, 35, 39, 119, 235, 215, 231, 226, 93, 23]);
});

test('BCH format info matches known ISO/IEC 18004 mask 0 EC-M vector', () => {
  // EC M = 00, mask 0 = 000 => 101010000010010 (0x5412)
  assert.equal(QR._internal.bchFormatInfo(0b00, 0), 0x5412);
});

test('QR matrix generates valid finder, separator, timing, and dark modules across lengths', () => {
  const samples = [
    'https://t.me/my_stream',
    'https://twitch.tv/super_streamer_channel?ref=obs_overlay_widget',
    'https://example.com/' + 'a'.repeat(160)
  ];

  for (const text of samples) {
    const qr = QR.generateMatrix(text);
    assert.ok(qr, `Expected matrix for length ${text.length}`);
    const n = qr.size;
    assert.equal(n, 17 + qr.version * 4);

    // Top-left 7x7 finder outer ring
    for (let i = 0; i < 7; i++) {
      assert.equal(qr.modules[0][i], 1);
      assert.equal(qr.modules[6][i], 1);
      assert.equal(qr.modules[i][0], 1);
      assert.equal(qr.modules[i][6], 1);
      // Top-right finder top/bottom edges
      assert.equal(qr.modules[0][n - 7 + i], 1);
      assert.equal(qr.modules[6][n - 7 + i], 1);
      // Bottom-left finder left/right edges
      assert.equal(qr.modules[n - 7 + i][0], 1);
      assert.equal(qr.modules[n - 7 + i][6], 1);
    }

    // Center 3x3 dark block of top-left finder
    for (let r = 2; r <= 4; r++) {
      for (let c = 2; c <= 4; c++) {
        assert.equal(qr.modules[r][c], 1);
      }
    }

    // Dark module always set at (4*version + 9, 8) === (n - 8, 8)
    assert.equal(qr.modules[n - 8][8], 1);

    // Timing patterns alternating at row 6 and col 6 between finders
    for (let k = 8; k < n - 8; k++) {
      assert.equal(qr.modules[6][k], k % 2 === 0 ? 1 : 0);
      assert.equal(qr.modules[k][6], k % 2 === 0 ? 1 : 0);
    }
  }
});

test('renderSvg produces crisp SVG output with quiet zone', () => {
  const svg = QR.renderSvg('https://t.me/obs_social_widget');
  assert.ok(svg.startsWith('<svg class="card-qr-svg"'));
  assert.ok(svg.includes('<path d="M'));
  assert.ok(svg.endsWith('</svg>'));
});
