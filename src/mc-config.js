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
        offsetX: Math.round(clamp(pos.offsetX, 0, 1600, def.position.offsetX)),
        offsetY: Math.round(clamp(pos.offsetY, 0, 950, def.position.offsetY))
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
    ov.cfgRaw = cfgParam || '';
    ov.forceCfg = params.get('forcecfg') === '1';
    ov.modeOverride = params.get('mode');
    return ov;
  }

  function createMcConfigStore(options) {
    var opts = options || {};
    var listeners = [];
    var channel = null;
    var serverAvailable = false;
    var serverSaveTimer = null;
    var retryTimer = null;
    var retryAttempt = 0;
    var eventSource = null;
    var clientId = 'mc-' + Math.random().toString(36).slice(2, 10);
    var current = getDefaultConfig();
    var dirtySinceInit = false;
    var appliedUrlCfg = '';
    var sanitizePid = BaseConfig.sanitizeProfileId || function (v) { return String(v || 'default'); };
    var slugifyName = BaseConfig.slugifyProfileName || function (v) { return String(v || 'scene'); };
    var activeProfileId = opts.profile ? sanitizePid(opts.profile) : 'default';
    var profileLockedByUrl = Boolean(opts.profile);
    var PROFILES_META_KEY = STORAGE_KEY + '_profiles_meta_v1';
    var ACTIVE_PROFILE_KEY = STORAGE_KEY + '_active_profile_v1';
    var IDB_NAME = 'obs_widget_persist_v1';
    var IDB_STORE = 'configs';
    var MAX_UNDO = 25;
    var undoStack = [];
    var lastUndoPushAt = 0;
    var lastUndoSource = '';
    var saveState = {
      dirty: false,
      saving: false,
      lastSavedAt: 0,
      target: 'local',
      lastError: false
    };

    function getStorageKey(pid) {
      var id = sanitizePid(pid || activeProfileId);
      return id === 'default' ? STORAGE_KEY : (STORAGE_KEY + '__p__' + id);
    }

    function getAppliedUrlKey(pid) {
      return getStorageKey(pid) + '_applied_url';
    }

    function getWinNamePrefix(pid) {
      var id = sanitizePid(pid || activeProfileId);
      return id === 'default' ? '__OBS_MC_STATE_V1__:' : ('__OBS_MC_STATE_V1__' + id + ':');
    }

    function getApiConfigUrl(pid) {
      var id = sanitizePid(pid || activeProfileId);
      return id === 'default' ? '/api/mc-config' : ('/api/mc-config?profile=' + encodeURIComponent(id));
    }

    function readProfilesMeta() {
      var list = [{ id: 'default', name: 'default', updatedAt: 0 }];
      try {
        if (typeof localStorage !== 'undefined') {
          var raw = localStorage.getItem(PROFILES_META_KEY);
          if (raw) {
            var parsed = JSON.parse(raw);
            if (Array.isArray(parsed)) {
              parsed.forEach(function (entry) {
                if (!entry || typeof entry !== 'object') return;
                var id = sanitizePid(entry.id || entry.name || '');
                if (id === 'default') return;
                if (!list.some(function (x) { return x.id === id; })) {
                  list.push({
                    id: id,
                    name: String(entry.name || id).slice(0, 48),
                    updatedAt: Number(entry.updatedAt) || 0
                  });
                }
              });
            }
          }
        }
      } catch (_e) {}
      return list;
    }

    function writeProfilesMeta(list) {
      try {
        if (typeof localStorage === 'undefined') return;
        var clean = (list || []).filter(function (x) {
          return x && sanitizePid(x.id) !== 'default';
        }).map(function (x) {
          return {
            id: sanitizePid(x.id),
            name: String(x.name || x.id).slice(0, 48),
            updatedAt: Number(x.updatedAt) || Date.now()
          };
        });
        localStorage.setItem(PROFILES_META_KEY, JSON.stringify(clean));
      } catch (_e) {}
    }

    function ensureProfileInMeta(id, displayName) {
      var pid = sanitizePid(id);
      if (pid === 'default') return;
      var list = readProfilesMeta();
      var found = list.find(function (x) { return x.id === pid; });
      if (found) {
        if (displayName) found.name = String(displayName).slice(0, 48);
        found.updatedAt = Date.now();
      } else {
        list.push({ id: pid, name: String(displayName || pid).slice(0, 48), updatedAt: Date.now() });
      }
      writeProfilesMeta(list);
    }

    function notify(source) {
      var snap = clone(current);
      listeners.forEach(function (fn) {
        try {
          fn(snap, {
            source: source,
            profile: activeProfileId,
            serverAvailable: serverAvailable,
            canUndo: undoStack.length > 0,
            saveState: Object.assign({}, saveState, { canUndo: undoStack.length > 0 })
          });
        } catch (err) {
          if (typeof console !== 'undefined' && console.error) console.error(err);
        }
      });
    }

    function readWindowNameState() {
      try {
        var prefix = getWinNamePrefix();
        if (typeof window === 'undefined' || typeof window.name !== 'string') return null;
        if (window.name.indexOf(prefix) !== 0) return null;
        var parsed = JSON.parse(window.name.slice(prefix.length));
        if (!parsed || typeof parsed !== 'object' || !parsed.cfg) return null;
        return {
          cfg: normalizeConfig(parsed.cfg),
          appliedUrlCfg: typeof parsed.appliedUrlCfg === 'string' ? parsed.appliedUrlCfg : '',
          savedAt: Number(parsed.savedAt) || 0
        };
      } catch (_err) {
        return null;
      }
    }

    function writeWindowNameState(cfg, urlCfg) {
      try {
        if (typeof window === 'undefined') return;
        window.name = getWinNamePrefix() + JSON.stringify({
          cfg: cfg,
          appliedUrlCfg: urlCfg || '',
          savedAt: Date.now()
        });
      } catch (_err) {}
    }

    function idbOpen() {
      return new Promise(function (resolve) {
        try {
          if (typeof indexedDB === 'undefined') {
            resolve(null);
            return;
          }
          var req = indexedDB.open(IDB_NAME, 1);
          req.onupgradeneeded = function () {
            try {
              var db = req.result;
              if (!db.objectStoreNames.contains(IDB_STORE)) {
                db.createObjectStore(IDB_STORE);
              }
            } catch (_e) {}
          };
          req.onsuccess = function () { resolve(req.result); };
          req.onerror = function () { resolve(null); };
          req.onblocked = function () { resolve(null); };
        } catch (_err) {
          resolve(null);
        }
      });
    }

    function idbReadState() {
      return idbOpen().then(function (db) {
        if (!db) return null;
        return new Promise(function (resolve) {
          try {
            var tx = db.transaction(IDB_STORE, 'readonly');
            var req = tx.objectStore(IDB_STORE).get(getStorageKey());
            req.onsuccess = function () {
              var val = req.result;
              if (val && typeof val === 'object' && val.cfg) {
                resolve({
                  cfg: normalizeConfig(val.cfg),
                  appliedUrlCfg: typeof val.appliedUrlCfg === 'string' ? val.appliedUrlCfg : '',
                  savedAt: Number(val.savedAt) || 0
                });
              } else {
                resolve(null);
              }
            };
            req.onerror = function () { resolve(null); };
          } catch (_e) {
            resolve(null);
          }
        });
      });
    }

    function idbWriteState(cfg, urlCfg) {
      return idbOpen().then(function (db) {
        if (!db) return false;
        return new Promise(function (resolve) {
          try {
            var tx = db.transaction(IDB_STORE, 'readwrite');
            tx.objectStore(IDB_STORE).put({
              cfg: cfg,
              appliedUrlCfg: urlCfg || '',
              savedAt: Date.now()
            }, getStorageKey());
            tx.oncomplete = function () { resolve(true); };
            tx.onerror = function () { resolve(false); };
          } catch (_e) {
            resolve(false);
          }
        });
      });
    }

    function readLocalStorage() {
      try {
        if (typeof localStorage === 'undefined') return null;
        var raw = localStorage.getItem(getStorageKey());
        if (!raw) return null;
        return normalizeConfig(JSON.parse(raw));
      } catch (_err) {
        return null;
      }
    }

    function readAppliedUrlCfg() {
      try {
        if (typeof localStorage !== 'undefined') {
          var v = localStorage.getItem(getAppliedUrlKey());
          if (v) return v;
        }
      } catch (_e) {}
      var wn = readWindowNameState();
      return wn ? wn.appliedUrlCfg : '';
    }

    function writeAppliedUrlCfg(val) {
      appliedUrlCfg = val || '';
      try {
        if (typeof localStorage !== 'undefined') {
          if (appliedUrlCfg) localStorage.setItem(getAppliedUrlKey(), appliedUrlCfg);
          else localStorage.removeItem(getAppliedUrlKey());
        }
      } catch (_e) {}
    }

    function writeLocalStorage(cfg) {
      try {
        if (typeof localStorage !== 'undefined') {
          localStorage.setItem(getStorageKey(), JSON.stringify(cfg));
        }
      } catch (_err) {}
    }

    function persistClientAll(cfg) {
      writeLocalStorage(cfg);
      writeWindowNameState(cfg, appliedUrlCfg);
      idbWriteState(cfg, appliedUrlCfg);
    }

    function isHttpOrigin() {
      return typeof location !== 'undefined' && /^https?:$/i.test(location.protocol);
    }

    function initChannels() {
      if (typeof BroadcastChannel !== 'undefined') {
        try {
          channel = new BroadcastChannel(CHANNEL_NAME);
          channel.onmessage = function (ev) {
            var data = ev && ev.data;
            if (!data || data.sender === clientId || !data.config) return;
            if ((data.profile || 'default') !== activeProfileId) return;
            current = normalizeConfig(data.config);
            persistClientAll(current);
            notify('broadcast');
          };
        } catch (_err) {
          channel = null;
        }
      }
      if (typeof window !== 'undefined' && window.addEventListener) {
        window.addEventListener('storage', function (ev) {
          if (ev.key === getStorageKey() && ev.newValue) {
            try {
              current = normalizeConfig(JSON.parse(ev.newValue));
              writeWindowNameState(current, appliedUrlCfg);
              notify('storage');
            } catch (_e) {}
          }
        });

        var onUnloadFlush = function () {
          flushServerSave();
        };
        window.addEventListener('pagehide', onUnloadFlush);
        window.addEventListener('beforeunload', onUnloadFlush);
        if (typeof document !== 'undefined' && document.addEventListener) {
          document.addEventListener('visibilitychange', function () {
            if (document.visibilityState === 'hidden') {
              flushServerSave();
            }
          });
        }
      }
    }

    function saveToServerImmediate(cfg, useKeepalive) {
      if (!isHttpOrigin() || typeof fetch !== 'function') {
        return Promise.resolve({ ok: true, target: 'local', savedAt: Date.now() });
      }
      saveState.saving = true;
      var bodyStr = JSON.stringify({ sender: clientId, profile: activeProfileId, config: cfg });
      return fetch(getApiConfigUrl(), {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: bodyStr,
        keepalive: Boolean(useKeepalive)
      })
        .then(function (res) {
          if (!res.ok) throw new Error('HTTP ' + res.status);
          return res.json();
        })
        .then(function (payload) {
          serverAvailable = true;
          connectSse();
          saveState.dirty = false;
          saveState.saving = false;
          saveState.lastError = false;
          saveState.target = 'server';
          saveState.lastSavedAt = (payload && payload.savedAt) || Date.now();
          notify('save-state');
          return { ok: true, target: 'server', savedAt: saveState.lastSavedAt };
        })
        .catch(function () {
          saveState.saving = false;
          saveState.lastError = true;
          notify('save-state');
          return { ok: true, target: 'local', serverError: true, savedAt: Date.now() };
        });
    }

    function flushServerSave() {
      if (!isHttpOrigin() || (!serverSaveTimer && !saveState.dirty)) return;
      if (serverSaveTimer) {
        clearTimeout(serverSaveTimer);
        serverSaveTimer = null;
      }
      var bodyStr = JSON.stringify({ sender: clientId, profile: activeProfileId, config: current });
      var url = getApiConfigUrl();
      try {
        if (typeof fetch === 'function') {
          fetch(url, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: bodyStr,
            keepalive: true
          }).catch(function () {});
          saveState.dirty = false;
          return;
        }
      } catch (_e) {}
      if (typeof navigator !== 'undefined' && typeof navigator.sendBeacon === 'function' && typeof Blob !== 'undefined') {
        try {
          navigator.sendBeacon(url, new Blob([bodyStr], { type: 'application/json' }));
          saveState.dirty = false;
        } catch (_e2) {}
      }
    }

    function scheduleServerSave(cfg) {
      if (!serverAvailable && !isHttpOrigin()) {
        saveState.dirty = false;
        saveState.saving = false;
        saveState.target = 'local';
        saveState.lastSavedAt = Date.now();
        return;
      }
      if (!serverAvailable) return;
      saveState.dirty = true;
      saveState.saving = true;
      if (serverSaveTimer) clearTimeout(serverSaveTimer);
      serverSaveTimer = setTimeout(function () {
        serverSaveTimer = null;
        saveToServerImmediate(cfg, false);
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
            if ((payload.profile || 'default') !== activeProfileId) return;
            current = normalizeConfig(payload.config);
            persistClientAll(current);
            saveState.dirty = false;
            saveState.saving = false;
            saveState.lastSavedAt = Date.now();
            saveState.target = 'server';
            notify('server-sse');
          } catch (_e) {}
        });
      } catch (_err) {
        eventSource = null;
      }
    }

    function probeAndConnectServer(preferLocalSeed) {
      if (!isHttpOrigin() || typeof fetch !== 'function') {
        return Promise.resolve(false);
      }
      var targetProfile = activeProfileId;
      var controller = typeof AbortController !== 'undefined' ? new AbortController() : null;
      var timeout = controller ? setTimeout(function () { controller.abort(); }, 3000) : null;

      return fetch(getApiConfigUrl(targetProfile), {
        method: 'GET',
        cache: 'no-store',
        signal: controller ? controller.signal : undefined
      })
        .then(function (res) {
          if (timeout) clearTimeout(timeout);
          if (!res.ok) return false;
          return res.json().then(function (payload) {
            if (!payload || !payload.ok) return false;
            if (targetProfile !== activeProfileId) return true;
            serverAvailable = true;
            saveState.target = 'server';
            if (payload.config && !dirtySinceInit && !preferLocalSeed) {
              current = normalizeConfig(payload.config);
              persistClientAll(current);
              saveState.dirty = false;
              saveState.lastSavedAt = Date.now();
              notify('server-init');
            } else {
              saveToServerImmediate(current, false);
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

    function scheduleServerRetry(preferLocalSeed) {
      if (opts.skipServerProbe || !isHttpOrigin() || serverAvailable || retryAttempt >= 3) return;
      var delays = [2000, 5000, 10000];
      var waitMs = delays[retryAttempt] || 10000;
      retryAttempt += 1;
      if (retryTimer) clearTimeout(retryTimer);
      retryTimer = setTimeout(function () {
        retryTimer = null;
        if (serverAvailable) return;
        probeAndConnectServer(preferLocalSeed).then(function (ok) {
          if (ok) notify('server-status');
          else scheduleServerRetry(preferLocalSeed);
        });
      }, waitMs);
    }

    function loadCurrentProfileLocal(ov) {
      var localLs = readLocalStorage();
      var localWn = readWindowNameState();
      var local = localLs || (localWn && localWn.cfg) || null;
      appliedUrlCfg = readAppliedUrlCfg();
      var hadPrevApplied = Boolean(appliedUrlCfg);

      var hasNewUrlCfg = Boolean(
        ov &&
        ov.configFromUrl &&
        ov.cfgRaw &&
        (ov.forceCfg || !local || appliedUrlCfg !== ov.cfgRaw)
      );

      if (hasNewUrlCfg) {
        current = ov.configFromUrl;
        writeAppliedUrlCfg(ov.cfgRaw);
      } else if (ov && ov.configFromUrl && !ov.cfgRaw) {
        current = ov.configFromUrl;
      } else if (local) {
        current = local;
      } else {
        current = getDefaultConfig();
      }

      if (ov && ov.themeOverride && BaseConfig.THEMES.indexOf(ov.themeOverride) !== -1) {
        current.appearance.theme = ov.themeOverride;
      }
      if (ov && ov.animOverride && BaseConfig.ANIM_STYLES.indexOf(ov.animOverride) !== -1) {
        current.animation.style = ov.animOverride;
      }
      if (ov && ov.posOverride && BaseConfig.ANCHORS.indexOf(ov.posOverride) !== -1) {
        current.position.anchor = ov.posOverride;
      }
      if (ov && ov.modeOverride && DISPLAY_MODES.indexOf(ov.modeOverride) !== -1) {
        current.playback.displayMode = ov.modeOverride;
      }

      current = normalizeConfig(current);
      if (local || (ov && ov.forceCfg)) {
        persistClientAll(current);
      } else {
        writeLocalStorage(current);
        writeWindowNameState(current, appliedUrlCfg);
      }
      saveState.lastSavedAt = Date.now();
      saveState.target = 'local';
      return { local: local, ov: ov || {}, hasNewUrlCfg: hasNewUrlCfg, hadPrevApplied: hadPrevApplied };
    }

    function init(urlOverrides) {
      initChannels();
      var ov = urlOverrides || (typeof location !== 'undefined' ? extractUrlOverrides(location) : {});
      if (ov.profile) {
        activeProfileId = sanitizePid(ov.profile);
        profileLockedByUrl = true;
      } else if (!opts.profile) {
        try {
          if (typeof localStorage !== 'undefined') {
            var savedPid = localStorage.getItem(ACTIVE_PROFILE_KEY);
            if (savedPid) activeProfileId = sanitizePid(savedPid);
          }
        } catch (_e) {}
      }
      if (activeProfileId !== 'default') {
        ensureProfileInMeta(activeProfileId);
      }

      var loadRes = loadCurrentProfileLocal(ov);
      notify('init');

      if (!loadRes.local && !ov.forceCfg) {
        var initPid = activeProfileId;
        idbReadState().then(function (idbState) {
          if (activeProfileId !== initPid || dirtySinceInit || serverAvailable) return;
          if (idbState && idbState.cfg && (!ov.cfgRaw || !idbState.appliedUrlCfg || idbState.appliedUrlCfg === ov.cfgRaw)) {
            current = normalizeConfig(idbState.cfg);
            if (idbState.appliedUrlCfg) {
              writeAppliedUrlCfg(idbState.appliedUrlCfg);
            }
            writeLocalStorage(current);
            writeWindowNameState(current, appliedUrlCfg);
            notify('storage');
          } else {
            idbWriteState(current, appliedUrlCfg);
          }
        });
      }

      if (!opts.skipServerProbe) {
        var preferSeed = Boolean(ov.forceCfg || (loadRes.hasNewUrlCfg && loadRes.hadPrevApplied));
        probeAndConnectServer(preferSeed).then(function (connected) {
          if (connected) {
            notify('server-status');
          } else {
            scheduleServerRetry(preferSeed);
          }
        });
      }

      return clone(current);
    }

    function get() {
      return clone(current);
    }

    function pushUndoSnapshot(prevCfg, source) {
      var now = Date.now();
      var isContinuous = source === 'studio-input' && lastUndoSource === 'studio-input' && (now - lastUndoPushAt) < 650;
      if (isContinuous && undoStack.length > 0) {
        lastUndoPushAt = now;
        return;
      }
      undoStack.push(clone(prevCfg));
      if (undoStack.length > MAX_UNDO) {
        undoStack.shift();
      }
      lastUndoPushAt = now;
      lastUndoSource = source || 'local';
    }

    function set(nextConfig, meta) {
      var source = (meta && meta.source) || 'local';
      var normalized = normalizeConfig(nextConfig);
      var shouldRecordUndo =
        source !== 'undo' &&
        source !== 'server-init' &&
        source !== 'server-sse' &&
        source !== 'storage' &&
        source !== 'broadcast' &&
        source !== 'profile-switch';

      if (shouldRecordUndo && JSON.stringify(current) !== JSON.stringify(normalized)) {
        pushUndoSnapshot(current, source);
      }

      dirtySinceInit = true;
      current = normalized;
      persistClientAll(current);
      if (channel) {
        try {
          channel.postMessage({ sender: clientId, profile: activeProfileId, config: current });
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

    function canUndo() {
      return undoStack.length > 0;
    }

    function undo() {
      if (!undoStack.length) return null;
      var prev = undoStack.pop();
      lastUndoSource = 'undo';
      lastUndoPushAt = 0;
      return set(prev, { source: 'undo' });
    }

    function saveNow() {
      if (serverSaveTimer) {
        clearTimeout(serverSaveTimer);
        serverSaveTimer = null;
      }
      persistClientAll(current);
      if (channel) {
        try {
          channel.postMessage({ sender: clientId, profile: activeProfileId, config: current });
        } catch (_e) {}
      }
      if (isHttpOrigin()) {
        return saveToServerImmediate(current, true);
      }
      saveState.dirty = false;
      saveState.saving = false;
      saveState.target = 'local';
      saveState.lastSavedAt = Date.now();
      notify('save-state');
      return Promise.resolve({ ok: true, target: 'local', savedAt: saveState.lastSavedAt });
    }

    function getSaveState() {
      return Object.assign({}, saveState, {
        serverAvailable: serverAvailable,
        canUndo: undoStack.length > 0,
        profile: activeProfileId
      });
    }

    function getActiveProfile() {
      var list = readProfilesMeta();
      var found = list.find(function (p) { return p.id === activeProfileId; });
      return {
        id: activeProfileId,
        name: found ? found.name : activeProfileId,
        lockedByUrl: profileLockedByUrl
      };
    }

    function listProfiles() {
      var localList = readProfilesMeta();
      if (!isHttpOrigin() || typeof fetch !== 'function') {
        return Promise.resolve(localList);
      }
      return fetch('/api/mc-profiles', { method: 'GET', cache: 'no-store' })
        .then(function (res) {
          if (!res.ok) return localList;
          return res.json().then(function (payload) {
            if (!payload || !payload.ok || !Array.isArray(payload.profiles)) return localList;
            var merged = [{ id: 'default', name: 'default', updatedAt: 0 }];
            var seen = { default: true };
            payload.profiles.concat(localList).forEach(function (entry) {
              if (!entry || !entry.id) return;
              var pid = sanitizePid(entry.id);
              if (seen[pid]) return;
              seen[pid] = true;
              merged.push({
                id: pid,
                name: String(entry.name || pid).slice(0, 48),
                updatedAt: Number(entry.updatedAt) || 0
              });
            });
            writeProfilesMeta(merged);
            return merged;
          });
        })
        .catch(function () {
          return localList;
        });
    }

    function switchProfile(nextId, switchOpts) {
      var swOpts = switchOpts || {};
      flushServerSave();
      var pid = sanitizePid(nextId || 'default');
      activeProfileId = pid;
      if (!profileLockedByUrl && swOpts.persistSelection !== false) {
        try {
          if (typeof localStorage !== 'undefined') {
            localStorage.setItem(ACTIVE_PROFILE_KEY, pid);
          }
        } catch (_e) {}
      }
      if (pid !== 'default') {
        ensureProfileInMeta(pid, swOpts.name);
      }
      undoStack = [];
      lastUndoSource = '';
      lastUndoPushAt = 0;
      dirtySinceInit = false;

      if (swOpts.seedConfig) {
        current = normalizeConfig(swOpts.seedConfig);
        persistClientAll(current);
      } else {
        loadCurrentProfileLocal(null);
      }

      notify('profile-switch');

      if (!opts.skipServerProbe && isHttpOrigin() && typeof fetch === 'function') {
        if (swOpts.seedConfig) {
          return saveToServerImmediate(current, false).then(function () {
            return clone(current);
          });
        }
        return probeAndConnectServer(false).then(function () {
          return clone(current);
        });
      }
      return Promise.resolve(clone(current));
    }

    function createProfile(rawName, copyCurrent) {
      var displayName = String(rawName || '').trim().slice(0, 48);
      var pid = slugifyName(displayName);
      if (pid === 'default') pid = 'scene-' + Math.random().toString(36).slice(2, 6);
      var existing = readProfilesMeta();
      if (existing.some(function (p) { return p.id === pid; })) {
        pid = (pid + '-' + Math.random().toString(36).slice(2, 5)).slice(0, 48);
      }
      ensureProfileInMeta(pid, displayName || pid);
      var seed = copyCurrent === false ? getDefaultConfig() : clone(current);
      if (isHttpOrigin() && typeof fetch === 'function') {
        fetch('/api/mc-profiles', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ id: pid, name: displayName || pid, config: seed })
        }).catch(function () {});
      }
      return switchProfile(pid, { name: displayName || pid, seedConfig: seed }).then(function () {
        return { id: pid, name: displayName || pid };
      });
    }

    function deleteProfile(targetId) {
      var pid = sanitizePid(targetId);
      if (pid === 'default') return Promise.resolve(false);
      var meta = readProfilesMeta().filter(function (p) { return p.id !== pid; });
      writeProfilesMeta(meta);
      try {
        if (typeof localStorage !== 'undefined') {
          localStorage.removeItem(getStorageKey(pid));
          localStorage.removeItem(getAppliedUrlKey(pid));
        }
      } catch (_e) {}
      if (isHttpOrigin() && typeof fetch === 'function') {
        fetch('/api/mc-profiles/' + encodeURIComponent(pid), { method: 'DELETE' }).catch(function () {});
      }
      if (activeProfileId === pid) {
        return switchProfile('default').then(function () { return true; });
      }
      notify('profile-switch');
      return Promise.resolve(true);
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
      flushServerSave();
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
      if (retryTimer) {
        clearTimeout(retryTimer);
        retryTimer = null;
      }
    }

    return {
      init: init,
      get: get,
      set: set,
      update: update,
      canUndo: canUndo,
      undo: undo,
      saveNow: saveNow,
      getSaveState: getSaveState,
      getActiveProfile: getActiveProfile,
      listProfiles: listProfiles,
      switchProfile: switchProfile,
      createProfile: createProfile,
      deleteProfile: deleteProfile,
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
    sanitizeProfileId: BaseConfig.sanitizeProfileId,
    slugifyProfileName: BaseConfig.slugifyProfileName,
    createMcConfigStore: createMcConfigStore
  };
});
