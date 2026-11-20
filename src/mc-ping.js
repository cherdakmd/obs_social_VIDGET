(function (root, factory) {
  if (typeof module === 'object' && module.exports) {
    module.exports = factory(
      require('node:net'),
      require('node:dgram'),
      require('node:dns').promises
    );
  } else {
    root.ObsMcPing = factory(null, null, null);
  }
})(typeof globalThis !== 'undefined' ? globalThis : this, function (net, dgram, dnsPromises) {
  'use strict';

  var RAKNET_MAGIC = [
    0x00, 0xff, 0xff, 0x00, 0xfe, 0xfe, 0xfe, 0xfe,
    0xfd, 0xfd, 0xfd, 0xfd, 0x12, 0x34, 0x56, 0x78
  ];
  var RAKNET_MAGIC_BUF = typeof Buffer !== 'undefined' ? Buffer.from(RAKNET_MAGIC) : null;

  function isLocalOrPrivateHost(host) {
    var h = String(host || '').trim().toLowerCase();
    if (!h) return false;
    return /^(localhost|::1|127\.|10\.|192\.168\.|172\.(1[6-9]|2\d|3[01])\.)/.test(h) || /\.local$/i.test(h);
  }

  function extractPlainMotd(desc) {
    if (!desc) return '';
    var text = '';
    if (typeof desc === 'string') {
      text = desc;
    } else if (typeof desc === 'object') {
      text = (desc.text ? String(desc.text) : '') +
        (Array.isArray(desc.extra) ? desc.extra.map(extractPlainMotd).join('') : '');
    }
    return text.replace(/§[0-9a-fk-or]/gi, '').trim();
  }

  function normalizeTargetArgs(parsedOrHost, portOrTimeout, maybeTimeout, defaultPort) {
    if (parsedOrHost && typeof parsedOrHost === 'object') {
      return {
        parsed: parsedOrHost,
        timeoutMs: Number(portOrTimeout) || 4500
      };
    }
    var hasPort = typeof portOrTimeout === 'number' && Number.isInteger(portOrTimeout) && portOrTimeout > 0 && portOrTimeout <= 65535;
    var host = String(parsedOrHost || '').trim();
    var port = hasPort ? portOrTimeout : defaultPort;
    return {
      parsed: {
        host: host,
        port: port,
        explicitPort: hasPort,
        normalized: port === defaultPort ? host : host + ':' + port
      },
      timeoutMs: Number(hasPort ? maybeTimeout : portOrTimeout) || 4500
    };
  }

  function parseAddress(rawIp, edition) {
    var defaultPort = edition === 'bedrock' ? 19132 : 25565;
    var s = String(rawIp || '').trim();
    if (!s) return null;
    s = s.replace(/^(minecraft|mc):\/\//i, '').replace(/\/+$/, '');
    if (/[\s/?#\\]/.test(s) || s.length > 180) return null;

    var host = '';
    var port = defaultPort;
    var explicitPort = false;

    if (s.charAt(0) === '[') {
      var closeIdx = s.indexOf(']');
      if (closeIdx === -1) return null;
      host = s.slice(1, closeIdx);
      var rest = s.slice(closeIdx + 1);
      if (rest) {
        if (rest.charAt(0) !== ':') return null;
        var pNum6 = Number(rest.slice(1));
        if (!Number.isInteger(pNum6) || pNum6 < 1 || pNum6 > 65535) return null;
        port = pNum6;
        explicitPort = true;
      }
    } else {
      var colonParts = s.split(':');
      if (colonParts.length > 2) return null;
      host = colonParts[0];
      if (colonParts.length === 2) {
        var pNum = Number(colonParts[1]);
        if (!Number.isInteger(pNum) || pNum < 1 || pNum > 65535) return null;
        port = pNum;
        explicitPort = true;
      }
    }

    if (!host || !/^[a-zA-Z0-9._:-]+$/.test(host)) return null;
    return {
      host: host,
      port: port,
      explicitPort: explicitPort,
      normalized: explicitPort ? (host + ':' + port) : host
    };
  }

  function encodeVarInt(value) {
    var bytes = [];
    var v = value >>> 0;
    do {
      var temp = v & 0x7f;
      v >>>= 7;
      if (v !== 0) temp |= 0x80;
      bytes.push(temp);
    } while (v !== 0);
    return Buffer.from(bytes);
  }

  function readVarInt(buf, offset) {
    var numRead = 0;
    var result = 0;
    var read;
    do {
      if (offset + numRead >= buf.length) return null;
      read = buf[offset + numRead];
      var value = read & 0x7f;
      result |= value << (7 * numRead);
      numRead++;
      if (numRead > 5) throw new Error('VarInt too big');
    } while ((read & 0x80) !== 0);
    return { value: result, size: numRead };
  }

  function buildJavaHandshake(host, port) {
    var hostBuf = Buffer.from(host, 'utf8');
    var portBuf = Buffer.alloc(2);
    portBuf.writeUInt16BE(port, 0);

    var payload = Buffer.concat([
      Buffer.from([0x00]), // Packet ID: Handshake
      encodeVarInt(765), // Protocol 1.20.4+ (status-agnostic)
      encodeVarInt(hostBuf.length),
      hostBuf,
      portBuf,
      Buffer.from([0x01]) // Next state: Status
    ]);

    var handshakePacket = Buffer.concat([encodeVarInt(payload.length), payload]);
    var statusRequestPacket = Buffer.from([0x01, 0x00]); // Length 1, Packet ID 0x00
    return Buffer.concat([handshakePacket, statusRequestPacket]);
  }

  async function resolveSrvIfNeeded(parsed) {
    if (!dnsPromises || parsed.explicitPort || /^\d+\.\d+\.\d+\.\d+$/.test(parsed.host) || parsed.host === 'localhost') {
      return { host: parsed.host, port: parsed.port };
    }
    try {
      var records = await dnsPromises.resolveSrv('_minecraft._tcp.' + parsed.host);
      if (records && records.length && records[0].name) {
        return { host: records[0].name, port: records[0].port || parsed.port };
      }
    } catch (_err) {
      // Fallback to direct A/AAAA host:port
    }
    return { host: parsed.host, port: parsed.port };
  }

  async function pingJavaServer(parsedOrHost, portOrTimeout, maybeTimeout) {
    if (!net) throw new Error('Node net module unavailable');
    var targetArgs = normalizeTargetArgs(parsedOrHost, portOrTimeout, maybeTimeout, 25565);
    var parsed = targetArgs.parsed;
    var target = await resolveSrvIfNeeded(parsed);
    var ms = targetArgs.timeoutMs;

    return new Promise(function (resolve) {
      var settled = false;
      var chunks = [];
      var socket = net.createConnection({ host: target.host, port: target.port });

      function finish(res) {
        if (settled) return;
        settled = true;
        try { socket.destroy(); } catch (_e) {}
        resolve(res);
      }

      socket.setTimeout(ms);
      socket.on('timeout', function () {
        finish({
          ok: true,
          online: false,
          edition: 'java',
          host: parsed.host,
          port: parsed.port,
          playersOnline: null,
          playersMax: null,
          version: '',
          iconDataUrl: '',
          source: 'local-tcp',
          error: 'Timeout',
          checkedAt: Date.now()
        });
      });

      socket.on('error', function (err) {
        finish({
          ok: true,
          online: false,
          edition: 'java',
          host: parsed.host,
          port: parsed.port,
          playersOnline: null,
          playersMax: null,
          version: '',
          iconDataUrl: '',
          source: 'local-tcp',
          error: err && err.code ? err.code : 'Connection error',
          checkedAt: Date.now()
        });
      });

      socket.on('connect', function () {
        socket.write(buildJavaHandshake(parsed.host, parsed.port));
      });

      socket.on('data', function (chunk) {
        chunks.push(chunk);
        var buf = Buffer.concat(chunks);
        try {
          var pktLenInfo = readVarInt(buf, 0);
          if (!pktLenInfo) return;
          var totalNeeded = pktLenInfo.size + pktLenInfo.value;
          if (buf.length < totalNeeded) return;

          var offset = pktLenInfo.size;
          var pktIdInfo = readVarInt(buf, offset);
          if (!pktIdInfo || pktIdInfo.value !== 0x00) {
            throw new Error('Unexpected packet id');
          }
          offset += pktIdInfo.size;

          var strLenInfo = readVarInt(buf, offset);
          if (!strLenInfo) return;
          offset += strLenInfo.size;
          if (buf.length < offset + strLenInfo.value) return;

          var jsonStr = buf.slice(offset, offset + strLenInfo.value).toString('utf8');
          var data = JSON.parse(jsonStr);
          var players = data && data.players ? data.players : {};
          var ver = data && data.version && data.version.name ? String(data.version.name) : '';
          var motd = extractPlainMotd(data && data.description);
          var fav = data && typeof data.favicon === 'string' && /^data:image\/png;base64,[A-Za-z0-9+/=]+$/.test(data.favicon)
            ? data.favicon
            : '';

          finish({
            ok: true,
            online: true,
            edition: 'java',
            host: parsed.host,
            port: parsed.port,
            playersOnline: typeof players.online === 'number' ? players.online : 0,
            playersMax: typeof players.max === 'number' ? players.max : 0,
            version: ver,
            motd: motd,
            favicon: fav,
            iconDataUrl: fav,
            source: 'local-tcp',
            checkedAt: Date.now()
          });
        } catch (err) {
          finish({
            ok: true,
            online: false,
            edition: 'java',
            host: parsed.host,
            port: parsed.port,
            playersOnline: null,
            playersMax: null,
            version: '',
            motd: '',
            favicon: '',
            iconDataUrl: '',
            source: 'local-tcp',
            error: err && err.message ? err.message : 'Parse error',
            checkedAt: Date.now()
          });
        }
      });
    });
  }

  function pingBedrockServer(parsedOrHost, portOrTimeout, maybeTimeout) {
    if (!dgram) throw new Error('Node dgram module unavailable');
    var targetArgs = normalizeTargetArgs(parsedOrHost, portOrTimeout, maybeTimeout, 19132);
    var parsed = targetArgs.parsed;
    var ms = targetArgs.timeoutMs;
    return new Promise(function (resolve) {
      var settled = false;
      var client = dgram.createSocket('udp4');
      var timer = setTimeout(function () {
        finish({
          ok: true,
          online: false,
          edition: 'bedrock',
          host: parsed.host,
          port: parsed.port,
          playersOnline: null,
          playersMax: null,
          version: '',
          motd: '',
          favicon: '',
          iconDataUrl: '',
          source: 'local-udp',
          error: 'Timeout',
          checkedAt: Date.now()
        });
      }, ms);

      function finish(res) {
        if (settled) return;
        settled = true;
        clearTimeout(timer);
        try { client.close(); } catch (_e) {}
        resolve(res);
      }

      client.on('error', function (err) {
        finish({
          ok: true,
          online: false,
          edition: 'bedrock',
          host: parsed.host,
          port: parsed.port,
          playersOnline: null,
          playersMax: null,
          version: '',
          motd: '',
          favicon: '',
          iconDataUrl: '',
          source: 'local-udp',
          error: err && err.code ? err.code : 'UDP error',
          checkedAt: Date.now()
        });
      });

      client.on('message', function (msg) {
        try {
          if (msg.length < 35 || msg[0] !== 0x1c) return;
          var strLen = msg.readUInt16BE(33);
          var payload = msg.slice(35, 35 + strLen).toString('utf8');
          var parts = payload.split(';');
          var motd = (parts[1] || '').trim();
          var ver = parts[3] || '';
          var online = Number(parts[4]);
          var max = Number(parts[5]);
          finish({
            ok: true,
            online: true,
            edition: 'bedrock',
            host: parsed.host,
            port: parsed.port,
            playersOnline: Number.isFinite(online) ? online : 0,
            playersMax: Number.isFinite(max) ? max : 0,
            version: ver,
            motd: motd,
            favicon: '',
            iconDataUrl: '',
            source: 'local-udp',
            checkedAt: Date.now()
          });
        } catch (_e) {
          // Ignore malformed packet
        }
      });

      // RakNet Unconnected Ping: 0x01 + 8b time + 16b magic + 8b client GUID
      var pkt = Buffer.alloc(33);
      pkt[0] = 0x01;
      pkt.writeBigInt64BE(BigInt(Date.now()), 1);
      Buffer.from(RAKNET_MAGIC).copy(pkt, 9);
      pkt.writeBigInt64BE(BigInt('0x123456789abcdef0'), 25);

      client.send(pkt, parsed.port, parsed.host, function (err) {
        if (err) {
          finish({
            ok: true,
            online: false,
            edition: 'bedrock',
            host: parsed.host,
            port: parsed.port,
            playersOnline: null,
            playersMax: null,
            version: '',
            iconDataUrl: '',
            source: 'local-udp',
            error: err.code || 'Send error',
            checkedAt: Date.now()
          });
        }
      });
    });
  }

  function normalizeMcStatusIoResponse(data, edition, parsed) {
    var ed = edition === 'bedrock' ? 'bedrock' : 'java';
    var online = Boolean(data && data.online);
    var players = (data && data.players) || {};
    var ver = data && data.version && (data.version.name_clean || data.version.name_raw || data.version.name)
      ? String(data.version.name_clean || data.version.name_raw || data.version.name)
      : '';
    var motd = '';
    if (data && data.motd) {
      motd = typeof data.motd.clean === 'string'
        ? data.motd.clean.trim()
        : (typeof data.motd.raw === 'string' ? data.motd.raw.trim() : '');
    }
    var icon = data && typeof data.icon === 'string' && /^data:image\//i.test(data.icon) ? data.icon : '';
    return {
      ok: true,
      online: online,
      edition: ed,
      host: parsed ? parsed.host : '',
      port: parsed ? parsed.port : (ed === 'bedrock' ? 19132 : 25565),
      playersOnline: typeof players.online === 'number' ? players.online : null,
      playersMax: typeof players.max === 'number' ? players.max : null,
      version: ver,
      motd: motd,
      favicon: icon,
      iconDataUrl: icon,
      source: 'mcstatus.io',
      checkedAt: Date.now()
    };
  }

  async function pingServer(rawIp, edition, timeoutMsOrOpts) {
    var ed = edition === 'bedrock' ? 'bedrock' : 'java';
    var ms = typeof timeoutMsOrOpts === 'object' && timeoutMsOrOpts !== null
      ? Number(timeoutMsOrOpts.timeoutMs) || 4500
      : Number(timeoutMsOrOpts) || 4500;
    var parsed = parseAddress(rawIp, ed);
    if (!parsed) {
      return {
        ok: false,
        online: false,
        edition: ed,
        error: 'Invalid server IP',
        checkedAt: Date.now()
      };
    }
    if (ed === 'bedrock') {
      return pingBedrockServer(parsed, ms);
    }
    return pingJavaServer(parsed, ms);
  }

  function fetchStatusInBrowser(options) {
    var opts = options || {};
    var ed = opts.edition === 'bedrock' ? 'bedrock' : 'java';
    var rawIp = opts.ip || opts.address || '';
    var parsed = parseAddress(rawIp, ed);
    if (!parsed) {
      return Promise.resolve({
        ok: false,
        online: false,
        edition: ed,
        error: 'Invalid IP',
        checkedAt: Date.now()
      });
    }
    if (typeof fetch !== 'function') {
      return Promise.resolve({ ok: false, online: false, error: 'fetch unavailable', checkedAt: Date.now() });
    }

    var isLanHost = isLocalOrPrivateHost(parsed.host);

    function queryMcstatusApi() {
      var apiUrl = 'https://api.mcstatus.io/v2/status/' + ed + '/' + encodeURIComponent(parsed.normalized);
      return fetch(apiUrl, { cache: 'no-store' })
        .then(function (res) {
          if (!res.ok) throw new Error('HTTP ' + res.status);
          return res.json();
        })
        .then(function (data) {
          return normalizeMcStatusIoResponse(data, ed, parsed);
        })
        .catch(function (err) {
          return {
            ok: false,
            online: false,
            edition: ed,
            source: 'mcstatus.io',
            error: err && err.message ? err.message : 'Network error',
            checkedAt: Date.now()
          };
        });
    }

    var useLocal = opts.source === 'server' || (opts.source !== 'mcstatus' && opts.serverAvailable);
    if (useLocal) {
      return fetch(
        '/api/mc-status?address=' + encodeURIComponent(parsed.normalized) +
        '&edition=' + encodeURIComponent(ed) +
        '&source=' + encodeURIComponent(opts.source || 'auto'),
        { cache: 'no-store' }
      )
        .then(function (res) { return res.json(); })
        .then(function (res) {
          if (res && res.online) return res;
          if ((opts.source === 'auto' || !opts.source) && !isLanHost) {
            return queryMcstatusApi().then(function (apiRes) {
              return apiRes.online ? apiRes : res;
            });
          }
          return res;
        })
        .catch(function () {
          if ((opts.source === 'auto' || !opts.source) && !isLanHost) {
            return queryMcstatusApi();
          }
          return { ok: false, online: false, edition: ed, source: 'local-tcp', error: 'Server unreachable', checkedAt: Date.now() };
        });
    }

    return queryMcstatusApi();
  }

  return {
    RAKNET_MAGIC: RAKNET_MAGIC_BUF || RAKNET_MAGIC,
    isLocalOrPrivateHost: isLocalOrPrivateHost,
    parseAddress: parseAddress,
    encodeVarInt: encodeVarInt,
    readVarInt: readVarInt,
    buildJavaHandshake: buildJavaHandshake,
    normalizeMcStatusIoResponse: normalizeMcStatusIoResponse,
    pingJavaServer: pingJavaServer,
    pingBedrockServer: pingBedrockServer,
    pingServer: pingServer,
    fetchStatusInBrowser: fetchStatusInBrowser
  };
});
