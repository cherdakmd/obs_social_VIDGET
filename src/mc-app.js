(function (root) {
  'use strict';

  var McConfig = root.ObsMcConfig;
  var McRenderer = root.ObsMcRenderer;
  var McI18n = root.ObsMcI18n;
  var McPing = root.ObsMcPing;
  var Animations = root.ObsSocialAnimations;
  var McStudio = root.ObsMcStudio;

  var query = new URLSearchParams(location.search);
  var forcedDock = document.body && document.body.getAttribute('data-force-mode') === 'dock';
  var isDockMode = Boolean(query.get('dock') === '1' || /minecraft-dock\.html$/i.test(location.pathname) || forcedDock);
  var cleanMode = Boolean((query.get('clean') === '1' || query.get('mode') === 'overlay') && !isDockMode);
  var setupRequested = query.get('setup') === '1' || query.get('studio') === '1';

  if (isDockMode) {
    document.body.classList.add('mode-dock');
  }

  var mainStageEl = document.getElementById('widget-stage');
  var stageEl = mainStageEl;
  var slotEl = document.getElementById('stage-slot');
  var studioEl = document.getElementById('studio-shell');
  var toastEl = document.getElementById('studio-toast');
  var hoverToolbar = document.getElementById('hover-toolbar');
  var btnOpenStudio = document.getElementById('btn-open-studio');
  var btnHoverPause = document.getElementById('btn-hover-pause');

  var store = McConfig.createMcConfigStore();
  var animCtrl = Animations.createAnimationController();

  var studioOpen = Boolean(setupRequested && !cleanMode && !isDockMode);
  var hoverTimer = null;
  var obsHiddenPause = false;
  var obsConnected = Boolean(root.obsstudio);
  var obsVersion = obsConnected && root.obsstudio.pluginVersion ? String(root.obsstudio.pluginVersion) : '';

  var liveStatusState = null;
  var pollTimer = null;
  var pollSignature = '';
  var pollScheduleDebounce = null;
  var inFlightPingId = 0;

  function getMiniScale(cfg) {
    if (!isDockMode) return undefined;
    var base = Number((cfg.appearance && cfg.appearance.scale) || 1);
    return Math.min(0.88, Math.max(0.55, base * 0.78));
  }

  function applyStageAndBackdrop(cfg) {
    if (stageEl) {
      McRenderer.applyStagePosition(stageEl, cfg, isDockMode, getMiniScale(cfg));
      if (studioOpen && !isDockMode) {
        stageEl.setAttribute('data-backdrop', (cfg.obs && cfg.obs.studioBackdrop) || 'checker');
      } else if (!isDockMode) {
        stageEl.removeAttribute('data-backdrop');
      }
    }
    var dockStage = document.getElementById('dock-preview-stage');
    if (dockStage) {
      dockStage.setAttribute('data-backdrop', (cfg.obs && cfg.obs.studioBackdrop) || 'checker');
    }
  }

  function updateHoverLabels(cfg) {
    if (btnOpenStudio) {
      btnOpenStudio.innerHTML = '⚙ ' + McI18n.t(cfg.lang, 'openSettings');
    }
    if (btnHoverPause) {
      btnHoverPause.textContent = cfg.playback.paused ? '▶' : '⏸';
      btnHoverPause.title = McI18n.t(cfg.lang, cfg.playback.paused ? 'play' : 'pause');
    }
  }

  function createPlaybackEngine() {
    var runId = 0;
    var currentCardEl = null;
    var currentRenderKey = '';
    var effectivePaused = false;
    var activeWaitHooks = [];
    var modeChangeWaiters = [];

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

    function notifyModeMaybeChanged() {
      var list = modeChangeWaiters.slice();
      modeChangeWaiters = [];
      list.forEach(function (fn) { fn(); });
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

    function waitWhilePaused(token) {
      if (!effectivePaused) return Promise.resolve();
      return new Promise(function (resolve) {
        function hook(isNowPaused) {
          if (token !== runId || !isNowPaused) {
            activeWaitHooks = activeWaitHooks.filter(function (h) { return h !== hook; });
            resolve();
          }
        }
        activeWaitHooks.push(hook);
      });
    }

    function waitUntilModeOrRunChanges(token) {
      return new Promise(function (resolve) {
        var done = false;
        function finish() {
          if (done) return;
          done = true;
          modeChangeWaiters = modeChangeWaiters.filter(function (f) { return f !== check; });
          resolve();
        }
        function check() {
          if (token !== runId || store.get().playback.displayMode !== 'always') {
            finish();
          }
        }
        modeChangeWaiters.push(check);
        var iv = setInterval(function () {
          if (done) {
            clearInterval(iv);
            return;
          }
          if (token !== runId || store.get().playback.displayMode !== 'always') {
            clearInterval(iv);
            finish();
          }
        }, 250);
      });
    }

    function mountCard(cfg, forceNoProgress) {
      if (!slotEl) return null;
      var effectiveCfg = forceNoProgress
        ? Object.assign({}, cfg, {
            animation: Object.assign({}, cfg.animation, { progressStyle: 'none' })
          })
        : cfg;
      var card = McRenderer.createCardElement(effectiveCfg, liveStatusState, {
        scaleOverride: getMiniScale(cfg)
      });
      currentRenderKey = McRenderer.getStructuralSignature(effectiveCfg, liveStatusState);
      slotEl.innerHTML = '';
      slotEl.appendChild(card);
      currentCardEl = card;
      return { card: card, cfg: effectiveCfg };
    }

    async function runLoop(opts) {
      var token = ++runId;
      var exitOldFirst = Boolean(opts && opts.exitOldFirst && currentCardEl);

      if (exitOldFirst && currentCardEl) {
        await animCtrl.playExit(currentCardEl, store.get());
        if (token !== runId) return;
        if (slotEl) slotEl.innerHTML = '';
        currentCardEl = null;
        currentRenderKey = '';
        await pausableWait(140, token);
        if (token !== runId) return;
      }

      while (token === runId) {
        var cfg = store.get();
        effectivePaused = computePauseState(cfg);
        applyStageAndBackdrop(cfg);

        if (isDockMode) {
          var dockMounted = mountCard(cfg, cfg.playback.displayMode === 'always');
          if (!dockMounted) return;
          await animCtrl.playEnter(dockMounted.card, dockMounted.cfg);
          if (token !== runId) return;
          animCtrl.startHoldEffects(dockMounted.card, dockMounted.cfg, cfg.playback.displayMode === 'interval' ? Math.max(1500, cfg.playback.displayDurationSec * 1000) : 0);
          await waitUntilModeOrRunChanges(token);
          return;
        }

        if (effectivePaused) {
          await waitWhilePaused(token);
          if (token !== runId) return;
          cfg = store.get();
        }

        if (cfg.playback.displayMode === 'always') {
          var alwaysMounted = mountCard(cfg, true);
          if (!alwaysMounted) return;
          await animCtrl.playEnter(alwaysMounted.card, alwaysMounted.cfg);
          if (token !== runId) return;
          animCtrl.startHoldEffects(alwaysMounted.card, alwaysMounted.cfg, 0);
          await waitUntilModeOrRunChanges(token);
          if (token !== runId) return;

          if (currentCardEl) {
            await animCtrl.playExit(currentCardEl, store.get());
            if (token !== runId) return;
          }
          if (slotEl) slotEl.innerHTML = '';
          currentCardEl = null;
          currentRenderKey = '';
          continue;
        }

        // Interval mode
        var ivMounted = mountCard(cfg, false);
        if (!ivMounted) return;
        await animCtrl.playEnter(ivMounted.card, ivMounted.cfg);
        if (token !== runId) return;

        cfg = store.get();
        var holdSec = Number(cfg.playback.displayDurationSec) || 10;
        var holdMs = Math.max(1000, Math.round(holdSec * 1000));
        animCtrl.startHoldEffects(ivMounted.card, ivMounted.cfg, holdMs);

        await pausableWait(holdMs, token);
        if (token !== runId) return;

        cfg = store.get();
        await animCtrl.playExit(ivMounted.card, cfg);
        if (token !== runId) return;

        if (slotEl) slotEl.innerHTML = '';
        currentCardEl = null;
        currentRenderKey = '';

        var coolSec = Number(cfg.playback.intervalCooldownSec) || 12;
        var coolMs = Math.max(500, Math.round(coolSec * 1000));
        await pausableWait(coolMs, token);
      }
    }

    function start() {
      runLoop({ exitOldFirst: false });
    }

    function replay() {
      animCtrl.cancelAll();
      runLoop({ exitOldFirst: false });
    }

    function restartCycle() {
      animCtrl.cancelAll();
      runLoop({ exitOldFirst: false });
    }

    function refreshCurrentCard() {
      var cfg = store.get();
      applyStageAndBackdrop(cfg);
      syncPausedState(cfg);
      notifyModeMaybeChanged();

      if (!currentCardEl || !slotEl) return;

      var effectiveCfg = cfg.playback.displayMode === 'always'
        ? Object.assign({}, cfg, { animation: Object.assign({}, cfg.animation, { progressStyle: 'none' }) })
        : cfg;

      var nextKey = McRenderer.getStructuralSignature(effectiveCfg, liveStatusState);
      if (nextKey === currentRenderKey) {
        McRenderer.updateCardInPlace(currentCardEl, effectiveCfg, liveStatusState);
        if (isDockMode) {
          currentCardEl.style.setProperty('--widget-scale', String(getMiniScale(cfg)));
        }
        return;
      }

      var mounted = mountCard(effectiveCfg, cfg.playback.displayMode === 'always');
      if (mounted) {
        var holdMs = cfg.playback.displayMode === 'interval'
          ? Math.max(1000, Math.round((cfg.playback.displayDurationSec || 10) * 1000))
          : 0;
        animCtrl.startHoldEffects(mounted.card, mounted.cfg, holdMs);
      }
    }

    return {
      start: start,
      replay: replay,
      restartCycle: restartCycle,
      refreshCurrentCard: refreshCurrentCard,
      syncPausedState: syncPausedState
    };
  }

  var playback = createPlaybackEngine();

  function activeServerTabVisible() {
    var el = studioEl && studioEl.querySelector('[data-tab="server"]');
    return Boolean(el && el.classList.contains('active'));
  }

  function runLivePing() {
    var cfg = store.get();
    if (!cfg.liveStatus.enabled || !cfg.server.ip || !cfg.server.ip.trim()) {
      liveStatusState = null;
      playback.refreshCurrentCard();
      return Promise.resolve(null);
    }
    var pingId = ++inFlightPingId;
    return McPing.fetchStatusInBrowser({
      ip: cfg.server.ip.trim(),
      address: cfg.server.ip.trim(),
      edition: cfg.server.edition || 'java',
      source: cfg.liveStatus.source || 'auto',
      serverAvailable: store.isServerAvailable()
    }).then(function (res) {
      if (pingId !== inFlightPingId) return res;
      liveStatusState = res;
      playback.refreshCurrentCard();
      if ((studioOpen || isDockMode) && activeServerTabVisible() && studio) {
        studio.refreshBody();
      }
      return res;
    });
  }

  function scheduleLivePoller(immediate) {
    if (pollTimer) {
      clearTimeout(pollTimer);
      pollTimer = null;
    }
    var cfg = store.get();
    var ls = cfg.liveStatus;
    var sig = [ls.enabled, ls.source, ls.pollIntervalSec, cfg.server.ip, cfg.server.edition, store.isServerAvailable()].join('|');
    var sigChanged = sig !== pollSignature;
    pollSignature = sig;

    if (!ls.enabled || !cfg.server.ip || !cfg.server.ip.trim()) {
      liveStatusState = null;
      playback.refreshCurrentCard();
      return;
    }

    var ms = Math.max(10, Number(ls.pollIntervalSec) || 30) * 1000;
    if (immediate || sigChanged) {
      runLivePing().finally(function () {
        if (pollSignature === sig) {
          pollTimer = setTimeout(function () { scheduleLivePoller(true); }, ms);
        }
      });
    } else {
      pollTimer = setTimeout(function () { scheduleLivePoller(true); }, ms);
    }
  }

  var studio = McStudio.createMcStudio({
    store: store,
    rootEl: studioEl,
    toastEl: toastEl,
    playback: playback,
    isDockMode: isDockMode,
    getObsInfo: function () {
      return { connected: obsConnected, version: obsVersion };
    },
    getStatusState: function () {
      return liveStatusState;
    },
    triggerLiveCheck: function () {
      return runLivePing();
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
      applyStageAndBackdrop(store.get());
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
    applyStageAndBackdrop(cfg);
    if (studioOpen) {
      studio.render();
    }
    playback.refreshCurrentCard();
  }

  var lastDisplayMode = '';

  store.subscribe(function (cfg, meta) {
    var src = (meta && meta.source) || 'local';
    applyStageAndBackdrop(cfg);
    updateHoverLabels(cfg);
    playback.syncPausedState(cfg);

    var modeChanged = Boolean(lastDisplayMode && lastDisplayMode !== cfg.playback.displayMode);
    lastDisplayMode = cfg.playback.displayMode;

    if (src === 'save-state') {
      if ((studioOpen || isDockMode) && studio.updateSaveIndicator) {
        studio.updateSaveIndicator();
      }
      return;
    }

    if (modeChanged) {
      playback.replay();
      if ((studioOpen || isDockMode) && studio.updateSaveIndicator) {
        studio.updateSaveIndicator();
      }
    } else if (src === 'studio-input' || src === 'local' || src === 'drag-canvas') {
      playback.refreshCurrentCard();
      if ((studioOpen || isDockMode) && studio.updateSaveIndicator) {
        studio.updateSaveIndicator();
      }
    } else if (src === 'broadcast' || src === 'storage' || src === 'server-init' || src === 'server-sse' || src === 'import' || src === 'reset' || src === 'undo' || src === 'profile-switch') {
      playback.refreshCurrentCard();
      if (studioOpen || isDockMode) {
        studio.render();
      }
    } else if (src === 'server-status') {
      if (studioOpen || isDockMode) {
        studio.render();
      }
    }

    var newSig = [cfg.liveStatus.enabled, cfg.liveStatus.source, cfg.liveStatus.pollIntervalSec, cfg.server.ip, cfg.server.edition, store.isServerAvailable()].join('|');
    if (newSig !== pollSignature) {
      if (pollScheduleDebounce) clearTimeout(pollScheduleDebounce);
      pollScheduleDebounce = setTimeout(function () {
        scheduleLivePoller(true);
      }, 400);
    }
  });

  function setupCanvasDrag() {
    if (!slotEl || !mainStageEl || isDockMode || cleanMode) return;
    var hudBadge = null;

    function ensureHudBadge() {
      if (!hudBadge) {
        hudBadge = document.createElement('div');
        hudBadge.className = 'drag-hud-badge';
        document.body.appendChild(hudBadge);
      }
      return hudBadge;
    }

    function hideHudBadge() {
      if (hudBadge) hudBadge.classList.remove('visible');
    }

    function computeDraggedPosition(startRect, stageRect, dx, dy) {
      var maxLeft = Math.max(0, stageRect.width - startRect.width);
      var maxTop = Math.max(0, stageRect.height - startRect.height);
      var relLeft = Math.max(0, Math.min(maxLeft, (startRect.left - stageRect.left) + dx));
      var relTop = Math.max(0, Math.min(maxTop, (startRect.top - stageRect.top) + dy));
      var relRight = Math.max(0, stageRect.width - (relLeft + startRect.width));
      var relBottom = Math.max(0, stageRect.height - (relTop + startRect.height));

      var centerX = relLeft + startRect.width / 2;
      var centerY = relTop + startRect.height / 2;
      var stageMidX = stageRect.width / 2;
      var stageMidY = stageRect.height / 2;

      var hPart;
      var offX;
      if (Math.abs(centerX - stageMidX) <= 14) {
        hPart = 'center';
        offX = 0;
      } else if (centerX <= stageMidX) {
        hPart = 'left';
        offX = Math.min(1600, Math.max(0, Math.round(relLeft)));
      } else {
        hPart = 'right';
        offX = Math.min(1600, Math.max(0, Math.round(relRight)));
      }

      var vPart;
      var offY;
      if (Math.abs(centerY - stageMidY) <= 14) {
        vPart = 'middle';
        offY = 0;
      } else if (centerY <= stageMidY) {
        vPart = 'top';
        offY = Math.min(950, Math.max(0, Math.round(relTop)));
      } else {
        vPart = 'bottom';
        offY = Math.min(950, Math.max(0, Math.round(relBottom)));
      }

      var anchor = vPart === 'middle'
        ? (hPart === 'center' ? 'center' : ('middle-' + hPart))
        : (vPart + '-' + hPart);

      return { anchor: anchor, offsetX: offX, offsetY: offY };
    }

    slotEl.addEventListener('pointerdown', function (ev) {
      if (!studioOpen || isDockMode || ev.button !== 0) return;
      if (stageEl !== mainStageEl) return;

      var startX = ev.clientX;
      var startY = ev.clientY;
      var startRect = slotEl.getBoundingClientRect();
      var stageRect = mainStageEl.getBoundingClientRect();
      if (!startRect.width || !stageRect.width) return;

      var dragging = false;
      var lastPos = null;
      var pointerId = ev.pointerId;

      function onMove(moveEv) {
        if (moveEv.pointerId !== pointerId) return;
        var dx = moveEv.clientX - startX;
        var dy = moveEv.clientY - startY;
        if (!dragging && Math.hypot(dx, dy) < 4) return;

        if (!dragging) {
          dragging = true;
          slotEl.classList.add('is-dragging');
          try { slotEl.setPointerCapture(pointerId); } catch (_e) {}
        }

        lastPos = computeDraggedPosition(startRect, stageRect, dx, dy);
        var tempCfg = Object.assign({}, store.get(), { position: lastPos });
        McRenderer.applyStagePosition(mainStageEl, tempCfg, false);

        var badge = ensureHudBadge();
        badge.textContent = lastPos.anchor + ' · X: ' + lastPos.offsetX + 'px, Y: ' + lastPos.offsetY + 'px';
        badge.classList.add('visible');

        if (studio && studio.syncPositionInputs) {
          studio.syncPositionInputs(lastPos);
        }
      }

      function cleanup(commit) {
        window.removeEventListener('pointermove', onMove);
        window.removeEventListener('pointerup', onUp);
        window.removeEventListener('pointercancel', onCancel);
        slotEl.classList.remove('is-dragging');
        hideHudBadge();
        try {
          if (slotEl.hasPointerCapture && slotEl.hasPointerCapture(pointerId)) {
            slotEl.releasePointerCapture(pointerId);
          }
        } catch (_e) {}
        if (commit && dragging && lastPos) {
          store.update(function (d) {
            d.position.anchor = lastPos.anchor;
            d.position.offsetX = lastPos.offsetX;
            d.position.offsetY = lastPos.offsetY;
          }, { source: 'drag-canvas' });
          if (studio && studio.syncPositionInputs) {
            studio.syncPositionInputs(lastPos);
          }
        }
      }

      function onUp(upEv) {
        if (upEv.pointerId !== pointerId) return;
        cleanup(true);
      }

      function onCancel(cancelEv) {
        if (cancelEv.pointerId !== pointerId) return;
        McRenderer.applyStagePosition(mainStageEl, store.get(), false);
        if (studio && studio.syncPositionInputs) {
          studio.syncPositionInputs(store.get().position);
        }
        cleanup(false);
      }

      window.addEventListener('pointermove', onMove);
      window.addEventListener('pointerup', onUp);
      window.addEventListener('pointercancel', onCancel);
    });
  }
  setupCanvasDrag();

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

  window.addEventListener('keydown', function (ev) {
    if ((ev.ctrlKey || ev.metaKey) && !ev.shiftKey && !ev.altKey) {
      var k = (ev.key || '').toLowerCase();
      if (k === 's' || k === 'ы') {
        if (studioOpen || isDockMode) {
          ev.preventDefault();
          if (studio && studio.saveNow) studio.saveNow();
        }
        return;
      }
      if (k === 'z' || k === 'я') {
        if (studioOpen || isDockMode) {
          var tag = ev.target && ev.target.tagName ? ev.target.tagName.toLowerCase() : '';
          var isTextTyping = (tag === 'textarea') || (ev.target && ev.target.isContentEditable) ||
            (tag === 'input' && /^(text|url|email|search|password|number)$/i.test(ev.target.type || 'text'));
          if (!isTextTyping && studio && studio.undo) {
            if (studio.undo()) {
              ev.preventDefault();
            }
          }
        }
      }
    }
  });

  if (!isDockMode && !cleanMode) {
    window.addEventListener('mousemove', triggerHoverUi, { passive: true });
    window.addEventListener('pointerdown', triggerHoverUi, { passive: true });

    window.addEventListener('dblclick', function (ev) {
      if (studioOpen) return;
      if (hoverToolbar && hoverToolbar.contains(ev.target)) return;
      setStudioOpen(true);
    });

    window.addEventListener('keydown', function (ev) {
      if (ev.ctrlKey || ev.metaKey || ev.altKey) return;
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

  if (root.obsstudio) {
    root.addEventListener('obsSourceVisibleChanged', function (ev) {
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

    root.addEventListener('obsSourceActiveChanged', function (ev) {
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

  var initialCfg = store.init(McConfig.extractUrlOverrides(window.location));
  lastDisplayMode = initialCfg.playback.displayMode;
  updateHoverLabels(initialCfg);
  applyStageAndBackdrop(initialCfg);

  if (isDockMode) {
    studio.render();
  } else if (studioOpen) {
    setStudioOpen(true);
  }

  playback.start();
  scheduleLivePoller(true);
})(typeof window !== 'undefined' ? window : globalThis);
