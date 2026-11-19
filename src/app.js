(function () {
  'use strict';

  var Icons = window.ObsSocialIcons;
  var I18n = window.ObsSocialI18n;
  var Config = window.ObsSocialConfig;
  var Animations = window.ObsSocialAnimations;
  var Renderer = window.ObsSocialRenderer;
  var StudioMod = window.ObsSocialStudio;

  var overrides = Config.extractUrlOverrides(window.location);
  var forcedDock = document.body && document.body.getAttribute('data-force-mode') === 'dock';
  var isDockMode = Boolean(overrides.dockMode || forcedDock);
  var cleanMode = Boolean(overrides.cleanMode) && !isDockMode;

  if (isDockMode) {
    document.body.classList.add('mode-dock');
  }

  var store = Config.createConfigStore();
  var mainStageEl = document.getElementById('widget-stage');
  var stageEl = mainStageEl;
  var slotEl = document.getElementById('stage-slot');
  var studioEl = document.getElementById('studio-shell');
  var toastEl = document.getElementById('studio-toast');
  var hoverToolbar = document.getElementById('hover-toolbar');
  var btnOpenStudio = document.getElementById('btn-open-studio');
  var btnHoverPause = document.getElementById('btn-hover-pause');
  var btnHoverNext = document.getElementById('btn-hover-next');

  var studioOpen = Boolean(overrides.setupOpen && !cleanMode && !isDockMode);
  var hoverTimer = null;
  var obsHiddenPause = false;
  var obsConnected = Boolean(window.obsstudio);
  var obsVersion = obsConnected && window.obsstudio.pluginVersion ? String(window.obsstudio.pluginVersion) : '';

  var animCtrl = Animations.createAnimationController();

  function getMiniScale(cfg) {
    if (!isDockMode) return undefined;
    var base = Number((cfg.appearance && cfg.appearance.scale) || 1);
    return Math.min(0.88, Math.max(0.55, base * 0.78));
  }

  function createPlaybackEngine() {
    var runId = 0;
    var currentIndex = 0;
    var currentItemId = null;
    var currentCardEl = null;
    var currentStructSig = '';
    var effectivePaused = false;
    var activeWaitHooks = [];
    var shuffledOrder = [];

    function getEnabledItems(cfg) {
      return (cfg.items || []).filter(function (it) { return it.enabled !== false; });
    }

    function computePauseState(cfg) {
      return Boolean((cfg && cfg.playback && cfg.playback.paused) || obsHiddenPause);
    }

    function syncPausedState(cfg) {
      var nextPaused = computePauseState(cfg);
      if (nextPaused === effectivePaused) return;
      effectivePaused = nextPaused;
      animCtrl.setPaused(effectivePaused);
      var hooks = activeWaitHooks.slice();
      hooks.forEach(function (hook) { hook(effectivePaused); });
      updateHoverLabels(cfg);
    }

    function pausableWait(ms, token) {
      if (ms <= 0) return Promise.resolve();
      return new Promise(function (resolve) {
        var remaining = ms;
        var timer = null;
        var startedAt = 0;
        var done = false;

        function cleanup() {
          if (done) return;
          done = true;
          if (timer) {
            clearTimeout(timer);
            timer = null;
          }
          activeWaitHooks = activeWaitHooks.filter(function (h) { return h !== onPauseToggle; });
          resolve();
        }

        function startTimer() {
          if (done || token !== runId) {
            cleanup();
            return;
          }
          if (effectivePaused || remaining <= 0) {
            if (remaining <= 0) cleanup();
            return;
          }
          startedAt = Date.now();
          timer = setTimeout(function () {
            timer = null;
            remaining = 0;
            cleanup();
          }, remaining);
        }

        function onPauseToggle(isNowPaused) {
          if (done || token !== runId) {
            cleanup();
            return;
          }
          if (isNowPaused) {
            if (timer) {
              clearTimeout(timer);
              timer = null;
              remaining = Math.max(0, remaining - (Date.now() - startedAt));
            }
          } else {
            startTimer();
          }
        }

        activeWaitHooks.push(onPauseToggle);
        if (!effectivePaused) {
          startTimer();
        }
      });
    }

    function pickOrder(items, shuffle) {
      var ids = items.map(function (it) { return it.id; });
      if (!shuffle) return ids;
      for (var i = ids.length - 1; i > 0; i--) {
        var j = Math.floor(Math.random() * (i + 1));
        var tmp = ids[i];
        ids[i] = ids[j];
        ids[j] = tmp;
      }
      return ids;
    }

    function getNextItem(cfg, stepDelta) {
      var enabled = getEnabledItems(cfg);
      if (!enabled.length) return null;

      if (cfg.playback.shuffle) {
        if (!shuffledOrder.length) {
          shuffledOrder = pickOrder(enabled, true);
        }
        // Keep only still-enabled ids
        var enabledMap = Object.create(null);
        enabled.forEach(function (it) { enabledMap[it.id] = it; });
        shuffledOrder = shuffledOrder.filter(function (id) { return Boolean(enabledMap[id]); });
        if (!shuffledOrder.length) {
          shuffledOrder = pickOrder(enabled, true);
        }
      }

      if (typeof stepDelta === 'number') {
        currentIndex = (currentIndex + stepDelta + enabled.length) % enabled.length;
      } else if (currentIndex >= enabled.length) {
        currentIndex = 0;
      }

      if (cfg.playback.shuffle && typeof stepDelta !== 'number') {
        var nextId = shuffledOrder[currentIndex % shuffledOrder.length];
        var match = enabled.find(function (it) { return it.id === nextId; });
        if (match) return match;
      }

      return enabled[currentIndex];
    }

    function renderEmpty(cfg) {
      if (!slotEl) return;
      slotEl.innerHTML = '';
      currentCardEl = null;
      currentItemId = null;
      if (studioOpen || isDockMode) {
        var msg = document.createElement('div');
        msg.className = 'stage-empty-msg';
        msg.innerHTML =
          '<strong>' + I18n.t(cfg.lang, 'emptySocialsTitle') + '</strong>' +
          '<span>' + I18n.t(cfg.lang, 'emptySocialsSub') + '</span>';
        slotEl.appendChild(msg);
      }
    }

    async function runLoop(startOptions) {
      var token = ++runId;
      var opts = startOptions || {};

      while (token === runId) {
        var cfg = store.get();
        effectivePaused = computePauseState(cfg);
        Renderer.applyStagePosition(stageEl, cfg, isDockMode, getMiniScale(cfg));

        var enabled = getEnabledItems(cfg);
        if (!enabled.length) {
          renderEmpty(cfg);
          await pausableWait(600, token);
          continue;
        }

        var item = null;
        if (opts.forceItemId) {
          var forcedIdx = enabled.findIndex(function (it) { return it.id === opts.forceItemId; });
          if (forcedIdx !== -1) {
            currentIndex = forcedIdx;
            item = enabled[forcedIdx];
          }
          opts.forceItemId = null;
        }
        if (!item) {
          item = getNextItem(cfg);
        }
        if (!item) continue;

        currentItemId = item.id;
        currentStructSig = Renderer.getStructuralSignature(item, cfg);
        if (slotEl) {
          slotEl.innerHTML = '';
          currentCardEl = Renderer.createCardElement(item, cfg);
          slotEl.appendChild(currentCardEl);
        }

        if (studio && (studioOpen || isDockMode)) {
          highlightLiveRow(currentItemId);
        }

        await animCtrl.playEnter(currentCardEl, cfg);
        if (token !== runId) return;

        cfg = store.get();
        var holdSec = item.customDurationSec > 0 ? item.customDurationSec : cfg.playback.displayDurationSec;
        var holdMs = Math.max(500, Math.round(holdSec * 1000));
        animCtrl.startHoldEffects(currentCardEl, cfg, holdMs);

        await pausableWait(holdMs, token);
        if (token !== runId) return;

        cfg = store.get();
        await animCtrl.playExit(currentCardEl, cfg);
        if (token !== runId) return;

        if (slotEl) {
          slotEl.innerHTML = '';
          currentCardEl = null;
          currentStructSig = '';
        }

        enabled = getEnabledItems(cfg);
        if (!enabled.length) continue;

        var isEndOfCycle = currentIndex + 1 >= enabled.length;
        currentIndex = (currentIndex + 1) % enabled.length;
        if (isEndOfCycle && cfg.playback.shuffle) {
          shuffledOrder = pickOrder(enabled, true);
        }

        if (isEndOfCycle && cfg.playback.cyclePauseSec > 0) {
          await pausableWait(cfg.playback.cyclePauseSec * 1000, token);
        } else if (cfg.playback.gapDurationMs > 0 && (enabled.length > 1 || cfg.playback.cyclePauseSec > 0)) {
          await pausableWait(cfg.playback.gapDurationMs, token);
        }
      }
    }

    function start() {
      currentIndex = 0;
      runLoop();
    }

    function replay() {
      animCtrl.cancelAll();
      runLoop({ forceItemId: currentItemId });
    }

    function restartCycle() {
      animCtrl.cancelAll();
      currentIndex = 0;
      runLoop();
    }

    function next() {
      var cfg = store.get();
      var enabled = getEnabledItems(cfg);
      if (!enabled.length) return;
      currentIndex = (currentIndex + 1) % enabled.length;
      animCtrl.cancelAll();
      runLoop({ forceItemId: enabled[currentIndex].id });
    }

    function prev() {
      var cfg = store.get();
      var enabled = getEnabledItems(cfg);
      if (!enabled.length) return;
      currentIndex = (currentIndex - 1 + enabled.length) % enabled.length;
      animCtrl.cancelAll();
      runLoop({ forceItemId: enabled[currentIndex].id });
    }

    function jumpToItem(itemId) {
      animCtrl.cancelAll();
      runLoop({ forceItemId: itemId });
    }

    function refreshCurrentCard() {
      var cfg = store.get();
      Renderer.applyStagePosition(stageEl, cfg, isDockMode, getMiniScale(cfg));
      syncPausedState(cfg);

      var enabled = getEnabledItems(cfg);
      if (!enabled.length) {
        renderEmpty(cfg);
        return;
      }

      var item = enabled.find(function (it) { return it.id === currentItemId; });
      if (!item) {
        jumpToItem(enabled[0].id);
        return;
      }

      if (!currentCardEl || !slotEl) return;

      var nextSig = Renderer.getStructuralSignature(item, cfg);
      if (nextSig === currentStructSig) {
        Renderer.updateCardInPlace(currentCardEl, item, cfg);
        return;
      }

      currentStructSig = nextSig;
      var fresh = Renderer.createCardElement(item, cfg);
      slotEl.innerHTML = '';
      slotEl.appendChild(fresh);
      currentCardEl = fresh;

      var holdSec = item.customDurationSec > 0 ? item.customDurationSec : cfg.playback.displayDurationSec;
      var holdMs = Math.max(500, Math.round(holdSec * 1000));
      animCtrl.startHoldEffects(currentCardEl, cfg, holdMs);
    }

    function getCurrentItemId() {
      return currentItemId;
    }

    return {
      start: start,
      replay: replay,
      restartCycle: restartCycle,
      next: next,
      prev: prev,
      jumpToItem: jumpToItem,
      refreshCurrentCard: refreshCurrentCard,
      syncPausedState: syncPausedState,
      getCurrentItemId: getCurrentItemId
    };
  }

  var playback = createPlaybackEngine();

  function highlightLiveRow(liveId) {
    if (!studioEl) return;
    studioEl.querySelectorAll('.social-row').forEach(function (row) {
      var btn = row.querySelector('[data-row-act="preview"]');
      if (btn) {
        btn.classList.toggle('active-live', row.getAttribute('data-item-id') === liveId);
      }
    });
  }

  function applyBackdrop(cfg) {
    if (!stageEl) return;
    if (studioOpen) {
      stageEl.setAttribute('data-backdrop', (cfg.obs && cfg.obs.studioBackdrop) || 'checker');
    } else {
      stageEl.removeAttribute('data-backdrop');
    }
    var dockStage = document.getElementById('dock-preview-stage');
    if (dockStage) {
      dockStage.setAttribute('data-backdrop', (cfg.obs && cfg.obs.studioBackdrop) || 'checker');
    }
  }

  function updateHoverLabels(cfg) {
    if (!btnOpenStudio || !btnHoverPause || !btnHoverNext) return;
    btnOpenStudio.innerHTML = '⚙ ' + I18n.t(cfg.lang, 'openSettings');
    btnHoverPause.textContent = cfg.playback.paused ? '▶' : '⏸';
    btnHoverPause.title = I18n.t(cfg.lang, cfg.playback.paused ? 'play' : 'pause');
    btnHoverNext.title = I18n.t(cfg.lang, 'next');
  }

  var studio = StudioMod.createStudio({
    store: store,
    rootEl: studioEl,
    toastEl: toastEl,
    playback: playback,
    isDockMode: isDockMode,
    getObsInfo: function () {
      return { connected: obsConnected, version: obsVersion };
    },
    onBeforeRender: function () {
      if (isDockMode && slotEl && mainStageEl && slotEl.parentElement !== mainStageEl) {
        mainStageEl.appendChild(slotEl);
        stageEl = mainStageEl;
      }
    },
    onDockPreviewMounted: function (dockPreviewStage) {
      if (!dockPreviewStage || !slotEl) return;
      stageEl = dockPreviewStage;
      dockPreviewStage.appendChild(slotEl);
      applyBackdrop(store.get());
      playback.refreshCurrentCard();
    },
    onClose: function () {
      setStudioOpen(false);
    }
  });

  function setStudioOpen(open) {
    if (cleanMode || isDockMode) return;
    studioOpen = Boolean(open);
    document.body.classList.toggle('studio-open', studioOpen);
    document.body.classList.remove('show-hover-ui');
    var cfg = store.get();
    applyBackdrop(cfg);
    if (studioOpen) {
      studio.render();
    }
    playback.refreshCurrentCard();
  }

  // Subscribe to config changes
  store.subscribe(function (cfg, meta) {
    var src = (meta && meta.source) || 'local';
    applyBackdrop(cfg);
    updateHoverLabels(cfg);
    playback.syncPausedState(cfg);

    if (src === 'studio-input') {
      playback.refreshCurrentCard();
    } else if (src === 'broadcast' || src === 'storage' || src === 'server-init' || src === 'server-sse' || src === 'import' || src === 'reset') {
      playback.refreshCurrentCard();
      if (studioOpen || isDockMode) {
        studio.render();
      }
    } else if (src === 'server-status') {
      if (studioOpen || isDockMode) {
        studio.render();
      }
    }
  });

  // Mouse hover / OBS Interact detection
  function triggerHoverUi() {
    if (cleanMode || isDockMode || studioOpen) return;
    var cfg = store.get();
    if (cfg.obs && cfg.obs.hideHoverButton) return;
    document.body.classList.add('show-hover-ui');
    if (hoverTimer) clearTimeout(hoverTimer);
    hoverTimer = setTimeout(function () {
      if (hoverToolbar && hoverToolbar.matches(':hover')) {
        triggerHoverUi();
        return;
      }
      document.body.classList.remove('show-hover-ui');
    }, 4200);
  }

  if (!isDockMode && !cleanMode) {
    window.addEventListener('mousemove', triggerHoverUi, { passive: true });
    window.addEventListener('pointerdown', triggerHoverUi, { passive: true });

    window.addEventListener('dblclick', function (ev) {
      if (studioOpen) return;
      if (hoverToolbar && hoverToolbar.contains(ev.target)) return;
      setStudioOpen(true);
    });

    window.addEventListener('keydown', function (ev) {
      var tag = ev.target && ev.target.tagName ? ev.target.tagName.toLowerCase() : '';
      var editing = tag === 'input' || tag === 'textarea' || tag === 'select' || (ev.target && ev.target.isContentEditable);
      if (ev.key === 'Escape' && studioOpen) {
        setStudioOpen(false);
        return;
      }
      if (editing) return;
      if (ev.key === 'F2' || ev.key === 's' || ev.key === 'S' || ev.key === 'ы' || ev.key === 'Ы') {
        ev.preventDefault();
        setStudioOpen(!studioOpen);
      }
    });
  }

  if (btnOpenStudio) {
    btnOpenStudio.addEventListener('click', function () {
      setStudioOpen(true);
    });
  }
  if (btnHoverPause) {
    btnHoverPause.addEventListener('click', function () {
      store.update(function (d) {
        d.playback.paused = !d.playback.paused;
      });
    });
  }
  if (btnHoverNext) {
    btnHoverNext.addEventListener('click', function () {
      playback.next();
    });
  }

  // OBS Studio Browser Source events
  if (window.obsstudio) {
    window.addEventListener('obsSourceVisibleChanged', function (ev) {
      var visible = ev && ev.detail ? ev.detail.visible : true;
      var cfg = store.get();
      if (!visible) {
        if (cfg.playback.pauseWhenObsHidden) {
          obsHiddenPause = true;
          playback.syncPausedState(cfg);
        }
      } else {
        obsHiddenPause = false;
        if (cfg.playback.restartOnObsShow) {
          playback.restartCycle();
        } else {
          playback.syncPausedState(cfg);
        }
      }
    });

    window.addEventListener('obsSourceActiveChanged', function (ev) {
      var active = ev && ev.detail ? ev.detail.active : true;
      var cfg = store.get();
      if (active) {
        obsHiddenPause = false;
        if (cfg.playback.restartOnObsShow) {
          playback.restartCycle();
        } else {
          playback.syncPausedState(cfg);
        }
      } else if (cfg.playback.pauseWhenObsHidden) {
        obsHiddenPause = true;
        playback.syncPausedState(cfg);
      }
    });
  }

  // Boot
  var initialCfg = store.init(overrides);
  updateHoverLabels(initialCfg);
  applyBackdrop(initialCfg);

  if (isDockMode) {
    studio.render();
  } else if (studioOpen) {
    setStudioOpen(true);
  }

  playback.start();
})();
