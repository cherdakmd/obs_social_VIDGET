(function (root, factory) {
  if (typeof module === 'object' && module.exports) {
    module.exports = factory(require('./config.js'), require('./mc-icons.js'));
  } else {
    root.ObsMcConfig = factory(root.ObsSocialConfig, root.ObsMcIcons);
  }
})(typeof globalThis !== 'undefined' ? globalThis : this, function (BaseConfig, McIcons) {
  'use strict';

  var STORAGE_KEY = 'obs_mc_widget_config_v1';
  var CHANNEL_NAME = 'obs_mc_widget_channel_v1';

  var DISPLAY_MODES = ['always', 'interval'];
  var EDITIONS = ['java', 'bedrock'];
  var STATUS_SOURCES = ['auto', 'server', 'mcstatus'];

  function clone(obj) {
    return JSON.parse(JSON.stringify(obj));
  }

  function clamp(num, min, max, fallback) {
    var n = Number(num);
    if (!Number.isFinite(n)) return fallback;
    return Math.min(max, Math.max(min, n));
  }

  function validEnum(val, list, fallback) {
    return list.indexOf(val) !== -1 ? val : fallback;
  }

  function validHex(val, fallback) {
    if (typeof val !== 'string') return fallback;
    var s = val.trim();
    if (/^#[0-9a-fA-F]{6}$/.test(s) || /^#[0-9a-fA-F]{3}$/.test(s)) return s;
    return fallback;
  }

  function getDefaultConfig() {
    var baseDef = BaseConfig.getDefaultConfig();
    return {
      schemaVersion: 1,
      lang: 'ru',
      server: {
        name: 'Minecraft SMP',
        ip: 'play.myserver.ru',
        ipPrefix: 'IP:',
        version: '1.21.1',
        description: 'Выживание без грифа • Заходи играть!',
        edition: 'java',
        accentColor: '#22C55E',
        secondaryColor: '#10B981',
        iconType: 'preset',
        iconPreset: 'grass-block',
        iconImage: '',
        iconSvg: '',
        iconEmoji: '⛏️',
        iconColorMode: 'brand',
        url: '',
        showQr: false
      },
      liveStatus: {
        enabled: false,
        source: 'auto',
        pollIntervalSec: 30,
        showOnlineCount: true,
        showOfflineBadge: true,
        useLiveIcon: false,
        syncLiveVersion: false
      },
      playback: {
        displayMode: 'always',
        displayDurationSec: 8,
        intervalCooldownSec: 35,
        enterDurationMs: 650,
        exitDurationMs: 480,
        paused: false,
        restartOnObsShow: true,
        pauseWhenObsHidden: true
      },
      animation: clone(baseDef.animation),
      appearance: {
        theme: 'glass-neon',
        layout: 'card',
        fontFamily: 'modern',
        scale: 1.0,
        maxWidthPx: 460,
        borderRadiusPx: 18,
        bgOpacity: 0.82,
        bgColor: '#0c101b',
        textColor: '#f8fafc',
        blurPx: 16,
        borderWidthPx: 1,
        borderOpacity: 0.28,
        glowIntensity: 0.7,
        shadowIntensity: 0.75,
        showServerName: true,
        showVersionBadge: true,
        showDescription: true,
        showIpPrefix: true,
        showQrGlobal: false,
        qrSizePx: 64,
        iconSizePx: 46
      },
      typography: clone(baseDef.typography),
      position: {
        anchor: 'top-left',
        offsetX: 32,
        offsetY: 32
      },
      obs: {
        hideHoverButton: false,
        studioBackdrop: 'checker'
      }
    };
  }

  function normalizeConfig(raw) {
    var def = getDefaultConfig();
    if (!raw || typeof raw !== 'object') return def;

    // Borrow typography/appearance/animation normalization cleanly via BaseConfig
    var baseNorm = BaseConfig.normalizeConfig({
      lang: raw.lang,
      appearance: raw.appearance,
      typography: raw.typography,
      animation: raw.animation,
      position: raw.position,
      obs: raw.obs
    });

    var sv = raw.server && typeof raw.server === 'object' ? raw.server : {};
    var ls = raw.liveStatus && typeof raw.liveStatus === 'object' ? raw.liveStatus : {};
    var pb = raw.playback && typeof raw.playback === 'object' ? raw.playback : {};
    var ap = raw.appearance && typeof raw.appearance === 'object' ? raw.appearance : {};
    var pos = raw.position && typeof raw.position === 'object' ? raw.position : {};

    var presetId = typeof sv.iconPreset === 'string' && sv.iconPreset ? sv.iconPreset : def.server.iconPreset;
    var presetMeta = McIcons.getIcon(presetId);

    var iconImage = '';
    if (typeof sv.iconImage === 'string' && McIcons.isSafeImageSrc(sv.iconImage)) {
      iconImage = sv.iconImage.trim();
    }
    var iconSvg = '';
    if (typeof sv.iconSvg === 'string' && sv.iconSvg.trim()) {
      iconSvg = McIcons.sanitizeSvg(sv.iconSvg);
    }

    var mergedAppearance = Object.assign({}, baseNorm.appearance, {
      maxWidthPx: Math.round(clamp(ap.maxWidthPx, 220, 760, def.appearance.maxWidthPx)),
      bgOpacity: clamp(ap.bgOpacity, 0, 1, def.appearance.bgOpacity),
      borderOpacity: clamp(ap.borderOpacity, 0, 1, def.appearance.borderOpacity),
      iconSizePx: Math.round(clamp(ap.iconSizePx, 24, 72, def.appearance.iconSizePx)),
      showServerName: ap.showServerName !== false,
      showVersionBadge: ap.showVersionBadge !== false,
      showDescription: ap.showDescription !== false,
      showIpPrefix: ap.showIpPrefix !== false,
      showQrGlobal: sv.showQr !== undefined ? Boolean(sv.showQr) : Boolean(ap.showQrGlobal)
    });

    return {
      schemaVersion: 1,
      lang: baseNorm.lang,
      server: {
        name: typeof sv.name === 'string' ? sv.name.slice(0, 80) : def.server.name,
        ip: typeof sv.ip === 'string' ? sv.ip.trim().slice(0, 120) : def.server.ip,
        ipPrefix: typeof sv.ipPrefix === 'string' ? sv.ipPrefix.slice(0, 16) : def.server.ipPrefix,
        version: typeof sv.version === 'string' ? sv.version.slice(0, 48) : def.server.version,
        description: typeof sv.description === 'string' ? sv.description.slice(0, 160) : def.server.description,
        edition: validEnum(sv.edition, EDITIONS, def.server.edition),
        accentColor: validHex(sv.accentColor, presetMeta.accentColor || def.server.accentColor),
        secondaryColor: validHex(sv.secondaryColor, presetMeta.secondaryColor || def.server.secondaryColor),
        iconType: validEnum(sv.iconType, ['preset', 'image', 'svg', 'emoji', 'live-icon'], def.server.iconType),
        iconPreset: presetMeta.id,
        iconImage: iconImage,
        iconSvg: iconSvg,
        iconEmoji: typeof sv.iconEmoji === 'string' && sv.iconEmoji ? sv.iconEmoji.slice(0, 8) : def.server.iconEmoji,
        iconColorMode: validEnum(sv.iconColorMode, ['brand', 'white', 'original'], def.server.iconColorMode),
        url: typeof sv.url === 'string' ? sv.url.trim().slice(0, 300) : '',
        showQr: Boolean(sv.showQr)
      },
      liveStatus: {
        enabled: Boolean(ls.enabled),
        source: validEnum(ls.source, STATUS_SOURCES, def.liveStatus.source),
        pollIntervalSec: Math.round(clamp(ls.pollIntervalSec, 10, 300, def.liveStatus.pollIntervalSec)),
        showOnlineCount: ls.showOnlineCount !== false,
        showOfflineBadge: ls.showOfflineBadge !== false,
        useLiveIcon: Boolean(ls.useLiveIcon),
        syncLiveVersion: Boolean(ls.syncLiveVersion)
      },
      playback: {
        displayMode: validEnum(pb.displayMode, DISPLAY_MODES, def.playback.displayMode),
        displayDurationSec: clamp(pb.displayDurationSec, 2, 120, def.playback.displayDurationSec),
        intervalCooldownSec: clamp(pb.intervalCooldownSec, 2, 600, def.playback.intervalCooldownSec),
        enterDurationMs: Math.round(clamp(pb.enterDurationMs, 0, 2500, def.playback.enterDurationMs)),
        exitDurationMs: Math.round(clamp(pb.exitDurationMs, 0, 2500, def.playback.exitDurationMs)),
        paused: Boolean(pb.paused),
        restartOnObsShow: pb.restartOnObsShow !== false,
        pauseWhenObsHidden: pb.pauseWhenObsHidden !== false
      },
      animation: baseNorm.animation,
      appearance: mergedAppearance,
      typography: baseNorm.typography,
      position: {
        anchor: validEnum(pos.anchor, BaseConfig.ANCHORS, def.position.anchor),
        offsetX: Math.round(clamp(pos.offsetX, 0, 400, def.position.offsetX)),
        offsetY: Math.round(clamp(pos.offsetY, 0, 400, def.position.offsetY))
      },
      obs: baseNorm.obs
    };
  }

  function applyStylePreset(config, presetId) {
    var updatedBase = BaseConfig.applyStylePreset(config, presetId);
    var next = clone(config);
    next.appearance = Object.assign({}, next.appearance, updatedBase.appearance);
    next.typography = clone(updatedBase.typography);
    next.animation = clone(updatedBase.animation);
    return normalizeConfig(next);
  }

  function resetSection(config, target) {
    var def = getDefaultConfig();
    if (target === 'all') {
      if (config && config.lang) def.lang = config.lang === 'en' ? 'en' : 'ru';
      return def;
    }
    var next = clone(config || def);
    if (target === 'server') {
      next.server = clone(def.server);
      next.liveStatus = clone(def.liveStatus);
    } else if (target === 'design') {
      var keepFont = next.typography ? next.typography.fontPreset : def.appearance.fontFamily;
      next.appearance = clone(def.appearance);
      next.appearance.fontFamily = keepFont;
    } else if (target === 'typography') {
      next.typography = clone(def.typography);
      next.appearance.fontFamily = def.typography.fontPreset;
      next.appearance.textColor = def.appearance.textColor;
    } else if (target === 'animation') {
      next.animation = clone(def.animation);
      next.playback.displayMode = def.playback.displayMode;
      next.playback.displayDurationSec = def.playback.displayDurationSec;
      next.playback.intervalCooldownSec = def.playback.intervalCooldownSec;
      next.playback.enterDurationMs = def.playback.enterDurationMs;
      next.playback.exitDurationMs = def.playback.exitDurationMs;
    } else if (target === 'look') {
      next.appearance = clone(def.appearance);
      next.typography = clone(def.typography);
      next.animation = clone(def.animation);
      next.position = clone(def.position);
      next.playback.displayMode = def.playback.displayMode;
      next.playback.displayDurationSec = def.playback.displayDurationSec;
      next.playback.intervalCooldownSec = def.playback.intervalCooldownSec;
      next.playback.enterDurationMs = def.playback.enterDurationMs;
      next.playback.exitDurationMs = def.playback.exitDurationMs;
    }
    return normalizeConfig(next);
  }

  function utf8ToBase64Url(str) {
    var bytes;
    if (typeof TextEncoder !== 'undefined') {
      bytes = new TextEncoder().encode(str);
    } else {
      var binStr = unescape(encodeURIComponent(str));
      bytes = new Uint8Array(binStr.length);
      for (var i = 0; i < binStr.length; i++) bytes[i] = binStr.charCodeAt(i);
    }
    var binary = '';
    for (var j = 0; j < bytes.length; j++) {
      binary += String.fromCharCode(bytes[j]);
    }
    var b64 = typeof btoa === 'function' ? btoa(binary) : Buffer.from(bytes).toString('base64');
    return b64.replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/g, '');
  }

  function base64UrlToUtf8(b64url) {
    var b64 = String(b64url || '').replace(/-/g, '+').replace(/_/g, '/');
    while (b64.length % 4 !== 0) b64 += '=';
    if (typeof atob === 'function' && typeof TextDecoder !== 'undefined') {
      var binary = atob(b64);
      var bytes = new Uint8Array(binary.length);
      for (var i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i);
      return new TextDecoder().decode(bytes);
    }
    return Buffer.from(b64, 'base64').toString('utf8');
  }

  function encodeConfigToParam(config) {
    return utf8ToBase64Url(JSON.stringify(normalizeConfig(config)));
  }

  function decodeConfigFromParam(param) {
    try {
      if (!param || typeof param !== 'string') return null;
      var parsed = JSON.parse(base64UrlToUtf8(param.trim()));
      return normalizeConfig(parsed);
    } catch (_err) {
      return null;
    }
  }

  function buildShareUrl(baseHref, config, extraParams) {
    var urlObj;
    try {
      urlObj = new URL(baseHref);
    } catch (_e) {
      return '';
    }
    urlObj.hash = '';
    urlObj.searchParams.delete('cfg');
    if (extraParams && typeof extraParams === 'object') {
      Object.keys(extraParams).forEach(function (k) {
        if (extraParams[k] === null || extraParams[k] === undefined) {
          urlObj.searchParams.delete(k);
        } else {
          urlObj.searchParams.set(k, String(extraParams[k]));
        }
      });
    }
    urlObj.hash = 'cfg=' + encodeConfigToParam(config);
    return urlObj.toString();
  }

  function extractUrlOverrides(loc) {
    var ov = BaseConfig.extractUrlOverrides(loc);
    var search = (loc && loc.search) || '';
    var hash = (loc && loc.hash) || '';
    var params = new URLSearchParams(search);
    var cfgParam = params.get('cfg');
    if (!cfgParam && hash) {
      var hashStr = hash.charAt(0) === '#' ? hash.slice(1) : hash;
      if (hashStr.indexOf('cfg=') === 0) {
        cfgParam = hashStr.slice(4);
      } else {
        cfgParam = new URLSearchParams(hashStr).get('cfg');
      }
    }
    ov.configFromUrl = cfgParam ? decodeConfigFromParam(cfgParam) : null;
    ov.modeOverride = params.get('mode');
    return ov;
  }

  function createMcConfigStore(options) {
    var opts = options || {};
    var listeners = [];
    var channel = null;
    var serverAvailable = false;
    var serverSaveTimer = null;
    var eventSource = null;
    var clientId = 'mc-' + Math.random().toString(36).slice(2, 10);
    var current = getDefaultConfig();

    function notify(source) {
      var snap = clone(current);
      listeners.forEach(function (fn) {
        try {
          fn(snap, { source: source, serverAvailable: serverAvailable });
        } catch (err) {
          if (typeof console !== 'undefined' && console.error) console.error(err);
        }
      });
    }

    function readLocalStorage() {
      try {
        if (typeof localStorage === 'undefined') return null;
        var raw = localStorage.getItem(STORAGE_KEY);
        if (!raw) return null;
        return normalizeConfig(JSON.parse(raw));
      } catch (_err) {
        return null;
      }
    }

    function writeLocalStorage(cfg) {
      try {
        if (typeof localStorage !== 'undefined') {
          localStorage.setItem(STORAGE_KEY, JSON.stringify(cfg));
        }
      } catch (_err) {}
    }

    function initChannels() {
      if (typeof BroadcastChannel !== 'undefined') {
        try {
          channel = new BroadcastChannel(CHANNEL_NAME);
          channel.onmessage = function (ev) {
            var data = ev && ev.data;
            if (!data || data.sender === clientId || !data.config) return;
            current = normalizeConfig(data.config);
            writeLocalStorage(current);
            notify('broadcast');
          };
        } catch (_err) {
          channel = null;
        }
      }
      if (typeof window !== 'undefined' && window.addEventListener) {
        window.addEventListener('storage', function (ev) {
          if (ev.key === STORAGE_KEY && ev.newValue) {
            try {
              current = normalizeConfig(JSON.parse(ev.newValue));
              notify('storage');
            } catch (_e) {}
          }
        });
      }
    }

    function saveToServerImmediate(cfg) {
      if (!serverAvailable || typeof fetch !== 'function') return;
      fetch('/api/mc-config', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ sender: clientId, config: cfg })
      }).catch(function () {});
    }

    function scheduleServerSave(cfg) {
      if (!serverAvailable) return;
      if (serverSaveTimer) clearTimeout(serverSaveTimer);
      serverSaveTimer = setTimeout(function () {
        saveToServerImmediate(cfg);
      }, 120);
    }

    function connectSse() {
      if (typeof EventSource === 'undefined' || eventSource) return;
      try {
        eventSource = new EventSource('/api/events');
        eventSource.addEventListener('mc-config-updated', function (ev) {
          try {
            var payload = JSON.parse(ev.data);
            if (!payload || payload.sender === clientId || !payload.config) return;
            current = normalizeConfig(payload.config);
            writeLocalStorage(current);
            notify('server-sse');
          } catch (_e) {}
        });
      } catch (_err) {
        eventSource = null;
      }
    }

    function probeAndConnectServer() {
      if (typeof location === 'undefined' || !/^https?:$/i.test(location.protocol)) {
        return Promise.resolve(false);
      }
      if (typeof fetch !== 'function') return Promise.resolve(false);
      var controller = typeof AbortController !== 'undefined' ? new AbortController() : null;
      var timeout = controller ? setTimeout(function () { controller.abort(); }, 900) : null;

      return fetch('/api/mc-config', {
        method: 'GET',
        cache: 'no-store',
        signal: controller ? controller.signal : undefined
      })
        .then(function (res) {
          if (timeout) clearTimeout(timeout);
          if (!res.ok) return false;
          return res.json().then(function (payload) {
            if (!payload || !payload.ok) return false;
            serverAvailable = true;
            if (payload.config) {
              current = normalizeConfig(payload.config);
              writeLocalStorage(current);
              notify('server-init');
            } else {
              saveToServerImmediate(current);
            }
            connectSse();
            return true;
          });
        })
        .catch(function () {
          if (timeout) clearTimeout(timeout);
          return false;
        });
    }

    function init(urlOverrides) {
      initChannels();
      var ov = urlOverrides || (typeof location !== 'undefined' ? extractUrlOverrides(location) : {});
      var local = readLocalStorage();
      current = ov.configFromUrl ? ov.configFromUrl : (local || getDefaultConfig());

      if (ov.themeOverride && BaseConfig.THEMES.indexOf(ov.themeOverride) !== -1) {
        current.appearance.theme = ov.themeOverride;
      }
      if (ov.animOverride && BaseConfig.ANIM_STYLES.indexOf(ov.animOverride) !== -1) {
        current.animation.style = ov.animOverride;
      }
      if (ov.posOverride && BaseConfig.ANCHORS.indexOf(ov.posOverride) !== -1) {
        current.position.anchor = ov.posOverride;
      }
      if (ov.modeOverride && DISPLAY_MODES.indexOf(ov.modeOverride) !== -1) {
        current.playback.displayMode = ov.modeOverride;
      }

      current = normalizeConfig(current);
      writeLocalStorage(current);
      notify('init');

      if (!opts.skipServerProbe && !ov.configFromUrl) {
        probeAndConnectServer().then(function (connected) {
          if (connected) notify('server-status');
        });
      } else if (!opts.skipServerProbe) {
        if (typeof location !== 'undefined' && /^https?:$/i.test(location.protocol) && typeof fetch === 'function') {
          fetch('/api/health').then(function (r) {
            if (r.ok) {
              serverAvailable = true;
              connectSse();
              notify('server-status');
            }
          }).catch(function () {});
        }
      }

      return clone(current);
    }

    function get() {
      return clone(current);
    }

    function set(nextConfig, meta) {
      var source = (meta && meta.source) || 'local';
      current = normalizeConfig(nextConfig);
      writeLocalStorage(current);
      if (channel) {
        try {
          channel.postMessage({ sender: clientId, config: current });
        } catch (_e) {}
      }
      scheduleServerSave(current);
      notify(source);
      return clone(current);
    }

    function update(mutator, meta) {
      var draft = clone(current);
      var res = mutator(draft);
      return set(res && typeof res === 'object' ? res : draft, meta);
    }

    function subscribe(fn) {
      listeners.push(fn);
      return function unsubscribe() {
        listeners = listeners.filter(function (f) { return f !== fn; });
      };
    }

    function isServerAvailable() {
      return serverAvailable;
    }

    function destroy() {
      if (channel) {
        try { channel.close(); } catch (_e) {}
        channel = null;
      }
      if (eventSource) {
        try { eventSource.close(); } catch (_e) {}
        eventSource = null;
      }
      if (serverSaveTimer) {
        clearTimeout(serverSaveTimer);
        serverSaveTimer = null;
      }
    }

    return {
      init: init,
      get: get,
      set: set,
      update: update,
      subscribe: subscribe,
      isServerAvailable: isServerAvailable,
      destroy: destroy
    };
  }

  return {
    STORAGE_KEY: STORAGE_KEY,
    CHANNEL_NAME: CHANNEL_NAME,
    DISPLAY_MODES: DISPLAY_MODES,
    EDITIONS: EDITIONS,
    STATUS_SOURCES: STATUS_SOURCES,
    THEMES: BaseConfig.THEMES,
    LAYOUTS: BaseConfig.LAYOUTS,
    FONTS: BaseConfig.FONTS,
    FONT_PRESETS: BaseConfig.FONT_PRESETS,
    ANIM_STYLES: BaseConfig.ANIM_STYLES,
    DIRECTIONS: BaseConfig.DIRECTIONS,
    EASINGS: BaseConfig.EASINGS,
    IDLE_MOTIONS: BaseConfig.IDLE_MOTIONS,
    PROGRESS_STYLES: BaseConfig.PROGRESS_STYLES,
    ANCHORS: BaseConfig.ANCHORS,
    BACKDROPS: BaseConfig.BACKDROPS,
    STYLE_PRESETS: BaseConfig.STYLE_PRESETS,
    getFontPreset: BaseConfig.getFontPreset,
    getDefaultConfig: getDefaultConfig,
    normalizeConfig: normalizeConfig,
    applyStylePreset: applyStylePreset,
    resetSection: resetSection,
    encodeConfigToParam: encodeConfigToParam,
    decodeConfigFromParam: decodeConfigFromParam,
    buildShareUrl: buildShareUrl,
    extractUrlOverrides: extractUrlOverrides,
    createMcConfigStore: createMcConfigStore
  };
});
