(function (root, factory) {
  if (typeof module === 'object' && module.exports) {
    module.exports = factory();
  } else {
    root.ObsSocialQR = factory();
  }
})(typeof globalThis !== 'undefined' ? globalThis : this, function () {
  'use strict';

  // GF(256) with primitive polynomial 0x11D (x^8 + x^4 + x^3 + x^2 + 1)
  var GF_EXP = new Uint8Array(512);
  var GF_LOG = new Uint8Array(256);
  (function initGF() {
    var x = 1;
    for (var i = 0; i < 255; i++) {
      GF_EXP[i] = x;
      GF_LOG[x] = i;
      x <<= 1;
      if (x & 0x100) {
        x ^= 0x11d;
      }
    }
    for (var j = 255; j < 512; j++) {
      GF_EXP[j] = GF_EXP[j - 255];
    }
  })();

  function gfMul(a, b) {
    if (a === 0 || b === 0) return 0;
    return GF_EXP[GF_LOG[a] + GF_LOG[b]];
  }

  function rsGeneratorPoly(degree) {
    var poly = [1];
    for (var i = 0; i < degree; i++) {
      var next = new Array(poly.length + 1).fill(0);
      var factor = GF_EXP[i];
      for (var j = 0; j < poly.length; j++) {
        next[j] ^= poly[j];
        next[j + 1] ^= gfMul(poly[j], factor);
      }
      poly = next;
    }
    return poly;
  }

  function rsComputeEC(data, ecCount) {
    var gen = rsGeneratorPoly(ecCount);
    var res = new Uint8Array(data.length + ecCount);
    res.set(data, 0);
    for (var i = 0; i < data.length; i++) {
      var coef = res[i];
      if (coef !== 0) {
        for (var j = 0; j < gen.length; j++) {
          res[i + j] ^= gfMul(gen[j], coef);
        }
      }
    }
    return Array.from(res.slice(data.length));
  }

  var ALIGNMENT_POSITIONS = {
    1: [],
    2: [6, 18],
    3: [6, 22],
    4: [6, 26],
    5: [6, 30],
    6: [6, 34],
    7: [6, 22, 38],
    8: [6, 24, 42],
    9: [6, 26, 46],
    10: [6, 28, 50]
  };

  // [version]: { total, data, ecPerBlock, g1Count, g1Data, g2Count, g2Data }
  var VERSION_TABLE = {
    M: {
      1: { total: 26, data: 16, ecPerBlock: 10, g1Count: 1, g1Data: 16, g2Count: 0, g2Data: 0 },
      2: { total: 44, data: 28, ecPerBlock: 16, g1Count: 1, g1Data: 28, g2Count: 0, g2Data: 0 },
      3: { total: 70, data: 44, ecPerBlock: 26, g1Count: 1, g1Data: 44, g2Count: 0, g2Data: 0 },
      4: { total: 100, data: 64, ecPerBlock: 18, g1Count: 2, g1Data: 32, g2Count: 0, g2Data: 0 },
      5: { total: 134, data: 86, ecPerBlock: 24, g1Count: 2, g1Data: 43, g2Count: 0, g2Data: 0 },
      6: { total: 172, data: 108, ecPerBlock: 16, g1Count: 4, g1Data: 27, g2Count: 0, g2Data: 0 },
      7: { total: 196, data: 124, ecPerBlock: 18, g1Count: 4, g1Data: 31, g2Count: 0, g2Data: 0 },
      8: { total: 242, data: 154, ecPerBlock: 22, g1Count: 2, g1Data: 38, g2Count: 2, g2Data: 39 },
      9: { total: 292, data: 182, ecPerBlock: 22, g1Count: 3, g1Data: 36, g2Count: 2, g2Data: 37 },
      10: { total: 346, data: 216, ecPerBlock: 26, g1Count: 4, g1Data: 43, g2Count: 1, g2Data: 44 }
    },
    L: {
      1: { total: 26, data: 19, ecPerBlock: 7, g1Count: 1, g1Data: 19, g2Count: 0, g2Data: 0 },
      2: { total: 44, data: 34, ecPerBlock: 10, g1Count: 1, g1Data: 34, g2Count: 0, g2Data: 0 },
      3: { total: 70, data: 55, ecPerBlock: 15, g1Count: 1, g1Data: 55, g2Count: 0, g2Data: 0 },
      4: { total: 100, data: 80, ecPerBlock: 20, g1Count: 1, g1Data: 80, g2Count: 0, g2Data: 0 },
      5: { total: 134, data: 108, ecPerBlock: 26, g1Count: 1, g1Data: 108, g2Count: 0, g2Data: 0 },
      6: { total: 172, data: 136, ecPerBlock: 18, g1Count: 2, g1Data: 68, g2Count: 0, g2Data: 0 },
      7: { total: 196, data: 156, ecPerBlock: 20, g1Count: 2, g1Data: 78, g2Count: 0, g2Data: 0 },
      8: { total: 242, data: 194, ecPerBlock: 24, g1Count: 2, g1Data: 97, g2Count: 0, g2Data: 0 },
      9: { total: 292, data: 232, ecPerBlock: 30, g1Count: 2, g1Data: 116, g2Count: 0, g2Data: 0 },
      10: { total: 346, data: 274, ecPerBlock: 18, g1Count: 2, g1Data: 68, g2Count: 2, g2Data: 69 }
    }
  };

  function encodeUtf8Bytes(str) {
    if (typeof TextEncoder !== 'undefined') {
      return Array.from(new TextEncoder().encode(str));
    }
    var utf8 = unescape(encodeURIComponent(str));
    var arr = [];
    for (var i = 0; i < utf8.length; i++) {
      arr.push(utf8.charCodeAt(i));
    }
    return arr;
  }

  function chooseVersionAndLevel(byteLength, preferredLevel) {
    var level = preferredLevel === 'L' ? 'L' : 'M';
    for (var v = 1; v <= 10; v++) {
      var charCountBits = v >= 10 ? 16 : 8;
      var headerBits = 4 + charCountBits;
      var neededBytes = Math.ceil((headerBits + byteLength * 8) / 8);
      if (neededBytes <= VERSION_TABLE[level][v].data) {
        return { version: v, level: level };
      }
    }
    if (level === 'M') {
      for (var v2 = 1; v2 <= 10; v2++) {
        var cBits = v2 >= 10 ? 16 : 8;
        var need = Math.ceil((4 + cBits + byteLength * 8) / 8);
        if (need <= VERSION_TABLE.L[v2].data) {
          return { version: v2, level: 'L' };
        }
      }
    }
    return null;
  }

  function buildDataCodewords(bytes, version, spec) {
    var bits = [];
    function pushBits(val, len) {
      for (var i = len - 1; i >= 0; i--) {
        bits.push((val >>> i) & 1);
      }
    }

    // Mode indicator: Byte = 0100
    pushBits(0b0100, 4);
    var countBits = version >= 10 ? 16 : 8;
    pushBits(bytes.length, countBits);

    for (var i = 0; i < bytes.length; i++) {
      pushBits(bytes[i], 8);
    }

    var capacityBits = spec.data * 8;
    var terminatorLen = Math.min(4, capacityBits - bits.length);
    pushBits(0, terminatorLen);

    while (bits.length % 8 !== 0) {
      bits.push(0);
    }

    var codewords = [];
    for (var j = 0; j < bits.length; j += 8) {
      var b = 0;
      for (var k = 0; k < 8; k++) {
        b = (b << 1) | bits[j + k];
      }
      codewords.push(b);
    }

    var padBytes = [0xec, 0x11];
    var padIdx = 0;
    while (codewords.length < spec.data) {
      codewords.push(padBytes[padIdx % 2]);
      padIdx++;
    }
    return codewords;
  }

  function interleaveCodewords(dataCodewords, spec) {
    var dataBlocks = [];
    var ecBlocks = [];
    var offset = 0;

    for (var i = 0; i < spec.g1Count; i++) {
      var blk1 = dataCodewords.slice(offset, offset + spec.g1Data);
      offset += spec.g1Data;
      dataBlocks.push(blk1);
      ecBlocks.push(rsComputeEC(blk1, spec.ecPerBlock));
    }
    for (var j = 0; j < spec.g2Count; j++) {
      var blk2 = dataCodewords.slice(offset, offset + spec.g2Data);
      offset += spec.g2Data;
      dataBlocks.push(blk2);
      ecBlocks.push(rsComputeEC(blk2, spec.ecPerBlock));
    }

    var result = [];
    var maxDataLen = Math.max(spec.g1Data, spec.g2Data);
    for (var c = 0; c < maxDataLen; c++) {
      for (var b = 0; b < dataBlocks.length; b++) {
        if (c < dataBlocks[b].length) {
          result.push(dataBlocks[b][c]);
        }
      }
    }
    for (var e = 0; e < spec.ecPerBlock; e++) {
      for (var b2 = 0; b2 < ecBlocks.length; b2++) {
        result.push(ecBlocks[b2][e]);
      }
    }
    return result;
  }

  function bchFormatInfo(ecLevelBits, maskId) {
    var data = (ecLevelBits << 3) | maskId;
    var rem = data << 10;
    var poly = 0x537;
    for (var i = 14; i >= 10; i--) {
      if ((rem >>> i) & 1) {
        rem ^= poly << (i - 10);
      }
    }
    return ((data << 10) | rem) ^ 0x5412;
  }

  function bchVersionInfo(version) {
    var rem = version << 12;
    var poly = 0x1f25;
    for (var i = 17; i >= 12; i--) {
      if ((rem >>> i) & 1) {
        rem ^= poly << (i - 12);
      }
    }
    return (version << 12) | rem;
  }

  function createEmptyGrid(size) {
    var modules = new Array(size);
    var isFunction = new Array(size);
    for (var r = 0; r < size; r++) {
      modules[r] = new Uint8Array(size);
      isFunction[r] = new Uint8Array(size);
    }
    return { size: size, modules: modules, isFunction: isFunction };
  }

  function setFunctionModule(grid, r, c, dark) {
    if (r < 0 || r >= grid.size || c < 0 || c >= grid.size) return;
    grid.modules[r][c] = dark ? 1 : 0;
    grid.isFunction[r][c] = 1;
  }

  function drawFinderPattern(grid, row, col) {
    for (var dr = -1; dr <= 7; dr++) {
      for (var dc = -1; dc <= 7; dc++) {
        var r = row + dr;
        var c = col + dc;
        if (r < 0 || r >= grid.size || c < 0 || c >= grid.size) continue;
        var isSep = dr === -1 || dr === 7 || dc === -1 || dc === 7;
        var dark = false;
        if (!isSep) {
          var dist = Math.max(Math.abs(dr - 3), Math.abs(dc - 3));
          dark = dist !== 2;
        }
        setFunctionModule(grid, r, c, dark);
      }
    }
  }

  function drawAlignmentPattern(grid, row, col) {
    for (var dr = -2; dr <= 2; dr++) {
      for (var dc = -2; dc <= 2; dc++) {
        var dist = Math.max(Math.abs(dr), Math.abs(dc));
        setFunctionModule(grid, row + dr, col + dc, dist !== 1);
      }
    }
  }

  function setupFunctionPatterns(grid, version) {
    var size = grid.size;
    drawFinderPattern(grid, 0, 0);
    drawFinderPattern(grid, 0, size - 7);
    drawFinderPattern(grid, size - 7, 0);

    // Alignment patterns
    var pos = ALIGNMENT_POSITIONS[version] || [];
    for (var i = 0; i < pos.length; i++) {
      for (var j = 0; j < pos.length; j++) {
        var r = pos[i];
        var c = pos[j];
        if (
          (r === 6 && c === 6) ||
          (r === 6 && c === size - 7) ||
          (r === size - 7 && c === 6)
        ) {
          continue;
        }
        drawAlignmentPattern(grid, r, c);
      }
    }

    // Timing patterns
    for (var k = 8; k < size - 8; k++) {
      var dark = k % 2 === 0;
      if (!grid.isFunction[6][k]) setFunctionModule(grid, 6, k, dark);
      if (!grid.isFunction[k][6]) setFunctionModule(grid, k, 6, dark);
    }

    // Dark module
    setFunctionModule(grid, size - 8, 8, true);

    // Reserve format info spots
    for (var f = 0; f < 9; f++) {
      if (f !== 6) {
        setFunctionModule(grid, 8, f, false);
        setFunctionModule(grid, f, 8, false);
      }
    }
    for (var f2 = 0; f2 < 8; f2++) {
      setFunctionModule(grid, 8, size - 1 - f2, false);
      setFunctionModule(grid, size - 1 - f2, 8, false);
    }

    // Version info for >= 7
    if (version >= 7) {
      var vBits = bchVersionInfo(version);
      for (var v = 0; v < 18; v++) {
        var bit = ((vBits >>> v) & 1) === 1;
        var a = Math.floor(v / 3);
        var b = size - 11 + (v % 3);
        setFunctionModule(grid, a, b, bit);
        setFunctionModule(grid, b, a, bit);
      }
    }
  }

  function writeFormatInfo(grid, level, maskId) {
    var ecBits = level === 'L' ? 0b01 : 0b00;
    var fmt = bchFormatInfo(ecBits, maskId);
    var size = grid.size;

    for (var i = 0; i <= 5; i++) {
      setFunctionModule(grid, 8, i, ((fmt >>> (14 - i)) & 1) === 1);
    }
    setFunctionModule(grid, 8, 7, ((fmt >>> 8) & 1) === 1);
    setFunctionModule(grid, 8, 8, ((fmt >>> 7) & 1) === 1);
    setFunctionModule(grid, 7, 8, ((fmt >>> 6) & 1) === 1);
    for (var j = 9; j < 15; j++) {
      setFunctionModule(grid, 14 - j, 8, ((fmt >>> (14 - j)) & 1) === 1);
    }

    for (var k = 0; k < 8; k++) {
      setFunctionModule(grid, 8, size - 1 - k, ((fmt >>> k) & 1) === 1);
    }
    for (var m = 8; m < 15; m++) {
      setFunctionModule(grid, size - 15 + m, 8, ((fmt >>> m) & 1) === 1);
    }
    // Dark module remains dark
    setFunctionModule(grid, size - 8, 8, true);
  }

  function placeCodewords(grid, allCodewords) {
    var size = grid.size;
    var totalBits = allCodewords.length * 8;
    var bitIdx = 0;
    var up = true;

    for (var col = size - 1; col >= 1; col -= 2) {
      if (col === 6) col--;
      for (var step = 0; step < size; step++) {
        var r = up ? size - 1 - step : step;
        for (var dc = 0; dc < 2; dc++) {
          var c = col - dc;
          if (!grid.isFunction[r][c]) {
            var bit = 0;
            if (bitIdx < totalBits) {
              bit = (allCodewords[bitIdx >> 3] >>> (7 - (bitIdx & 7))) & 1;
              bitIdx++;
            }
            grid.modules[r][c] = bit;
          }
        }
      }
      up = !up;
    }
  }

  function maskBit(maskId, r, c) {
    switch (maskId) {
      case 0: return (r + c) % 2 === 0;
      case 1: return r % 2 === 0;
      case 2: return c % 3 === 0;
      case 3: return (r + c) % 3 === 0;
      case 4: return (Math.floor(r / 2) + Math.floor(c / 3)) % 2 === 0;
      case 5: return ((r * c) % 2) + ((r * c) % 3) === 0;
      case 6: return (((r * c) % 2) + ((r * c) % 3)) % 2 === 0;
      case 7: return (((r + c) % 2) + ((r * c) % 3)) % 2 === 0;
      default: return false;
    }
  }

  function cloneModulesWithMask(grid, maskId) {
    var size = grid.size;
    var out = new Array(size);
    for (var r = 0; r < size; r++) {
      out[r] = new Uint8Array(size);
      for (var c = 0; c < size; c++) {
        var val = grid.modules[r][c];
        if (!grid.isFunction[r][c] && maskBit(maskId, r, c)) {
          val ^= 1;
        }
        out[r][c] = val;
      }
    }
    return out;
  }

  function evaluatePenalty(modules) {
    var size = modules.length;
    var penalty = 0;

    // Rule 1: 5+ adjacent same-color modules in row/col
    for (var r = 0; r < size; r++) {
      var runColor = modules[r][0];
      var runLen = 1;
      for (var c = 1; c < size; c++) {
        if (modules[r][c] === runColor) {
          runLen++;
        } else {
          if (runLen >= 5) penalty += 3 + (runLen - 5);
          runColor = modules[r][c];
          runLen = 1;
        }
      }
      if (runLen >= 5) penalty += 3 + (runLen - 5);
    }

    for (var c2 = 0; c2 < size; c2++) {
      var colColor = modules[0][c2];
      var colLen = 1;
      for (var r2 = 1; r2 < size; r2++) {
        if (modules[r2][c2] === colColor) {
          colLen++;
        } else {
          if (colLen >= 5) penalty += 3 + (colLen - 5);
          colColor = modules[r2][c2];
          colLen = 1;
        }
      }
      if (colLen >= 5) penalty += 3 + (colLen - 5);
    }

    // Rule 2: 2x2 blocks of same color
    for (var r3 = 0; r3 < size - 1; r3++) {
      for (var c3 = 0; c3 < size - 1; c3++) {
        var v = modules[r3][c3];
        if (
          v === modules[r3][c3 + 1] &&
          v === modules[r3 + 1][c3] &&
          v === modules[r3 + 1][c3 + 1]
        ) {
          penalty += 3;
        }
      }
    }

    // Rule 3: Finder-like 1:1:3:1:1 patterns (1011101 + 4 light)
    function checkFinderRun(getVal, idx, limit) {
      if (idx + 10 >= limit) return false;
      var a =
        getVal(idx) === 1 &&
        getVal(idx + 1) === 0 &&
        getVal(idx + 2) === 1 &&
        getVal(idx + 3) === 1 &&
        getVal(idx + 4) === 1 &&
        getVal(idx + 5) === 0 &&
        getVal(idx + 6) === 1 &&
        getVal(idx + 7) === 0 &&
        getVal(idx + 8) === 0 &&
        getVal(idx + 9) === 0 &&
        getVal(idx + 10) === 0;
      var b =
        getVal(idx) === 0 &&
        getVal(idx + 1) === 0 &&
        getVal(idx + 2) === 0 &&
        getVal(idx + 3) === 0 &&
        getVal(idx + 4) === 1 &&
        getVal(idx + 5) === 0 &&
        getVal(idx + 6) === 1 &&
        getVal(idx + 7) === 1 &&
        getVal(idx + 8) === 1 &&
        getVal(idx + 9) === 0 &&
        getVal(idx + 10) === 1;
      return a || b;
    }

    for (var r4 = 0; r4 < size; r4++) {
      for (var c4 = 0; c4 <= size - 11; c4++) {
        if (checkFinderRun(function (i) { return modules[r4][i]; }, c4, size)) {
          penalty += 40;
        }
      }
    }
    for (var c5 = 0; c5 < size; c5++) {
      for (var r5 = 0; r5 <= size - 11; r5++) {
        if (checkFinderRun(function (i) { return modules[i][c5]; }, r5, size)) {
          penalty += 40;
        }
      }
    }

    // Rule 4: Dark module ratio
    var darkCount = 0;
    for (var r6 = 0; r6 < size; r6++) {
      for (var c6 = 0; c6 < size; c6++) {
        if (modules[r6][c6]) darkCount++;
      }
    }
    var percent = (darkCount * 100) / (size * size);
    var prevMultiple = Math.floor(Math.abs(percent - 50) / 5);
    penalty += prevMultiple * 10;

    return penalty;
  }

  function generateMatrix(text, preferredLevel) {
    var str = String(text || '').trim();
    if (!str) return null;

    var bytes = encodeUtf8Bytes(str);
    var choice = chooseVersionAndLevel(bytes.length, preferredLevel || 'M');
    if (!choice) return null;

    var spec = VERSION_TABLE[choice.level][choice.version];
    var dataCodewords = buildDataCodewords(bytes, choice.version, spec);
    var interleaved = interleaveCodewords(dataCodewords, spec);

    var size = 17 + choice.version * 4;
    var grid = createEmptyGrid(size);
    setupFunctionPatterns(grid, choice.version);
    placeCodewords(grid, interleaved);

    var bestMask = 0;
    var bestPenalty = Infinity;
    var bestModules = null;

    for (var mask = 0; mask < 8; mask++) {
      writeFormatInfo(grid, choice.level, mask);
      var candidate = cloneModulesWithMask(grid, mask);
      var penalty = evaluatePenalty(candidate);
      if (penalty < bestPenalty) {
        bestPenalty = penalty;
        bestMask = mask;
        bestModules = candidate;
      }
    }

    return {
      version: choice.version,
      level: choice.level,
      mask: bestMask,
      size: size,
      modules: bestModules
    };
  }

  function renderSvg(text, options) {
    var opts = options || {};
    var qr = generateMatrix(text, opts.level || 'M');
    if (!qr) return '';

    var quiet = typeof opts.margin === 'number' ? opts.margin : 2;
    var totalSize = qr.size + quiet * 2;
    var fg = opts.fg || '#0f172a';
    var bg = opts.bg || '#ffffff';
    var parts = [];

    for (var r = 0; r < qr.size; r++) {
      for (var c = 0; c < qr.size; c++) {
        if (qr.modules[r][c]) {
          parts.push('M' + (c + quiet) + ',' + (r + quiet) + 'h1v1h-1z');
        }
      }
    }

    return (
      '<svg class="card-qr-svg" viewBox="0 0 ' +
      totalSize +
      ' ' +
      totalSize +
      '" shape-rendering="crispEdges" aria-hidden="true">' +
      '<rect width="' +
      totalSize +
      '" height="' +
      totalSize +
      '" fill="' +
      bg +
      '" rx="1.5"/>' +
      '<path d="' +
      parts.join('') +
      '" fill="' +
      fg +
      '"/>' +
      '</svg>'
    );
  }

  return {
    generateMatrix: generateMatrix,
    renderSvg: renderSvg,
    _internal: {
      rsComputeEC: rsComputeEC,
      bchFormatInfo: bchFormatInfo
    }
  };
});
