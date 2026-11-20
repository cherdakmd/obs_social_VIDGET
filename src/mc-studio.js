(function (root, factory) {
  if (typeof module === 'object' && module.exports) {
    module.exports = factory(
      require('./mc-icons.js'),
      require('./mc-i18n.js'),
      require('./mc-config.js')
    );
  } else {
    root.ObsMcStudio = factory(
      root.ObsMcIcons,
      root.ObsMcI18n,
      root.ObsMcConfig
    );
  }
})(typeof globalThis !== 'undefined' ? globalThis : this, function (McIcons, McI18n, McConfig) {
  'use strict';

  function escapeHtml(str) {
    return String(str || '')
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;');
  }

  function createMcStudio(options) {
    var store = options.store;
    var rootEl = options.rootEl;
    var toastEl = options.toastEl;
    var playback = options.playback;
    var isDockMode = Boolean(options.isDockMode);
    var onClose = options.onClose || function () {};
    var getObsInfo = options.getObsInfo || function () { return { connected: false, version: '' }; };
    var getStatusState = options.getStatusState || function () { return null; };
    var triggerLiveCheck = options.triggerLiveCheck || function () { return Promise.resolve(null); };

    var activeTab = 'server';
    var iconSearchQuery = '';
    var resetConfirmOpen = false;
    var activePresetId = '';
    var checkingNow = false;
    var toastTimer = null;

    function t(key) {
      var cfg = store.get();
      return McI18n.t(cfg.lang, key);
    }

    function showToast(msg) {
      if (!toastEl) return;
      toastEl.textContent = msg;
      toastEl.classList.add('show');
      if (toastTimer) clearTimeout(toastTimer);
      toastTimer = setTimeout(function () {
        toastEl.classList.remove('show');
      }, 2400);
    }

    function applyReset(target) {
      var cur = store.get();
      var next = McConfig.resetSection(cur, target);
      if (target === 'all' || target === 'look' || target === 'design') {
        activePresetId = '';
      }
      resetConfirmOpen = false;
      store.set(next, { source: 'reset' });
      renderShell();
      playback.replay();
      showToast(t('resetDoneToast'));
    }

    function processImageFile(file) {
      if (!file) return;
      var type = (file.type || '').toLowerCase();
      var name = (file.name || '').toLowerCase();

      if (type === 'image/svg+xml' || name.endsWith('.svg')) {
        var readerSvg = new FileReader();
        readerSvg.onload = function () {
          var safe = McIcons.sanitizeSvg(String(readerSvg.result || ''));
          if (!safe) {
            showToast(t('iconUploadError'));
            return;
          }
          store.update(function (d) {
            d.server.iconType = 'svg';
            d.server.iconSvg = safe;
          }, { source: 'studio-input' });
          showToast(t('iconUploadSuccess'));
          renderBody();
        };
        readerSvg.readAsText(file);
        return;
      }

      if (!/^image\/(png|jpeg|jpg|webp|gif)$/.test(type) && !/\.(png|jpe?g|webp|gif)$/.test(name)) {
        showToast(t('iconUploadError'));
        return;
      }

      var reader = new FileReader();
      reader.onload = function () {
        var rawDataUrl = String(reader.result || '');
        if ((type === 'image/gif' || name.endsWith('.gif')) && rawDataUrl.length < 350000) {
          store.update(function (d) {
            d.server.iconType = 'image';
            d.server.iconImage = rawDataUrl;
          }, { source: 'studio-input' });
          showToast(t('iconUploadSuccess'));
          renderBody();
          return;
        }

        var img = new Image();
        img.onload = function () {
          var maxDim = 192;
          var w = img.naturalWidth || 128;
          var h = img.naturalHeight || 128;
          var scale = Math.min(1, maxDim / Math.max(w, h));
          var cw = Math.max(1, Math.round(w * scale));
          var ch = Math.max(1, Math.round(h * scale));
          var canvas = document.createElement('canvas');
          canvas.width = cw;
          canvas.height = ch;
          var ctx = canvas.getContext('2d');
          ctx.clearRect(0, 0, cw, ch);
          ctx.drawImage(img, 0, 0, cw, ch);
          var outUrl = canvas.toDataURL('image/png');
          store.update(function (d) {
            d.server.iconType = 'image';
            d.server.iconImage = outUrl;
          }, { source: 'studio-input' });
          showToast(t('iconUploadSuccess'));
          renderBody();
        };
        img.onerror = function () {
          showToast(t('iconUploadError'));
        };
        img.src = rawDataUrl;
      };
      reader.readAsDataURL(file);
    }

    function copyText(text, warnIfLong) {
      if (!text) return;
      var done = function () {
        showToast(warnIfLong ? t('copiedToast') + ' ' + t('urlWithImagesWarn') : t('copiedToast'));
      };
      if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(text).then(done).catch(function () {
          fallbackCopy(text, done);
        });
      } else {
        fallbackCopy(text, done);
      }
    }

    function fallbackCopy(text, cb) {
      var ta = document.createElement('textarea');
      ta.value = text;
      ta.style.position = 'fixed';
      ta.style.opacity = '0';
      document.body.appendChild(ta);
      ta.select();
      try {
        document.execCommand('copy');
      } catch (_e) {}
      document.body.removeChild(ta);
      cb();
    }

    function formatLiveSummary(st) {
      if (!st) return '';
      if (checkingNow) return t('liveCheckingText');
      if (st.online) {
        return t('liveResultOnline')
          .replace('{online}', st.playersOnline != null ? st.playersOnline : '?')
          .replace('{max}', st.playersMax != null ? st.playersMax : '?')
          .replace('{ver}', st.version || '—')
          .replace('{src}', st.source || '');
      }
      if (st.ok === false && st.error) {
        return t('liveResultError') + ': ' + st.error;
      }
      return t('liveResultOffline').replace('{src}', st.source || '—');
    }

    function renderShell() {
      if (options.onBeforeRender) {
        options.onBeforeRender();
      }
      var cfg = store.get();
      var obs = getObsInfo();
      var serverOn = store.isServerAvailable();
      var statusClass = serverOn ? 'server' : obs.connected ? 'obs' : '';
      var statusText = serverOn
        ? t('statusServerSync')
        : obs.connected
          ? t('statusObsConnected') + (obs.version ? ' v' + obs.version : '')
          : isDockMode
            ? t('statusDockMode')
            : t('statusLocalMode');

      var langOther = cfg.lang === 'ru' ? 'EN' : 'RU';

      rootEl.innerHTML =
        '<div class="studio-header">' +
          '<div class="studio-brand">' +
            '<div class="studio-logo" style="background:linear-gradient(135deg,#22c55e,#10b981);">MC</div>' +
            '<div class="studio-title-wrap">' +
              '<div class="studio-title">' + escapeHtml(t('appTitle')) + '</div>' +
              '<div class="studio-status"><span class="status-dot ' + statusClass + '"></span><span>' + escapeHtml(statusText) + '</span></div>' +
            '</div>' +
          '</div>' +
          '<div class="studio-header-actions">' +
            '<button class="btn sm danger ' + (resetConfirmOpen ? 'active' : '') + '" data-action="open-reset" title="' + escapeHtml(t('resetDefaultsBtn')) + '">↺ ' + escapeHtml(t('resetQuickBtn')) + '</button>' +
            '<button class="btn sm" data-action="toggle-lang" title="RU / EN">' + langOther + '</button>' +
            (!isDockMode
              ? '<button class="btn sm success" data-action="close-studio">✓ ' + escapeHtml(t('doneHide')) + '</button>'
              : '') +
          '</div>' +
        '</div>' +
        (resetConfirmOpen
          ? '<div class="reset-confirm-bar" role="alert">' +
              '<div class="reset-confirm-title">' + escapeHtml(t('resetBannerMcTitle')) + '</div>' +
              '<div class="reset-confirm-actions">' +
                '<button class="btn sm primary" data-confirm-reset="look">' + escapeHtml(t('resetLookOnlyMcBtn')) + '</button>' +
                '<button class="btn sm danger" data-confirm-reset="all">' + escapeHtml(t('resetAllMcBtn')) + '</button>' +
                '<button class="btn sm" data-action="cancel-reset">' + escapeHtml(t('resetCancelBtn')) + '</button>' +
              '</div>' +
            '</div>'
          : '') +
        '<div class="dock-preview-box">' +
          '<div class="dock-preview-bar">' +
            '<span>' + escapeHtml(t('previewStageLabel')) + '</span>' +
            '<div class="toolbar-group" data-dock-backdrops></div>' +
          '</div>' +
          '<div class="dock-preview-stage" id="dock-preview-stage" data-backdrop="' + escapeHtml(cfg.obs.studioBackdrop) + '"></div>' +
        '</div>' +
        '<div class="studio-toolbar">' +
          '<div class="toolbar-group">' +
            '<button class="btn sm ' + (cfg.playback.paused ? 'primary' : '') + '" data-action="toggle-pause">' +
              (cfg.playback.paused ? '▶ ' + escapeHtml(t('play')) : '⏸ ' + escapeHtml(t('pause'))) +
            '</button>' +
            '<button class="btn sm" data-action="replay-anim">↻ ' + escapeHtml(t('replayAnim')) + '</button>' +
          '</div>' +
          (!isDockMode
            ? '<div class="toolbar-group">' +
                '<select class="select" data-action="backdrop-select" style="width:auto;padding:4px 8px;font-size:11.5px;">' +
                  '<option value="checker"' + (cfg.obs.studioBackdrop === 'checker' ? ' selected' : '') + '>' + escapeHtml(t('backdropChecker')) + '</option>' +
                  '<option value="dark"' + (cfg.obs.studioBackdrop === 'dark' ? ' selected' : '') + '>' + escapeHtml(t('backdropDark')) + '</option>' +
                  '<option value="light"' + (cfg.obs.studioBackdrop === 'light' ? ' selected' : '') + '>' + escapeHtml(t('backdropLight')) + '</option>' +
                  '<option value="transparent"' + (cfg.obs.studioBackdrop === 'transparent' ? ' selected' : '') + '>' + escapeHtml(t('backdropTransparent')) + '</option>' +
                '</select>' +
              '</div>'
            : '') +
        '</div>' +
        '<div class="studio-tabs">' +
          '<button class="tab-btn ' + (activeTab === 'server' ? 'active' : '') + '" data-tab="server">' + escapeHtml(t('tabServer')) + '</button>' +
          '<button class="tab-btn ' + (activeTab === 'design' ? 'active' : '') + '" data-tab="design">' + escapeHtml(t('tabDesign')) + '</button>' +
          '<button class="tab-btn ' + (activeTab === 'font' ? 'active' : '') + '" data-tab="font">' + escapeHtml(t('tabFont')) + '</button>' +
          '<button class="tab-btn ' + (activeTab === 'motion' ? 'active' : '') + '" data-tab="motion">' + escapeHtml(t('tabMotion')) + '</button>' +
          '<button class="tab-btn ' + (activeTab === 'obs' ? 'active' : '') + '" data-tab="obs">' + escapeHtml(t('tabObs')) + '</button>' +
        '</div>' +
        '<div class="studio-body" id="studio-body"></div>';

      if (isDockMode) {
        var bdWrap = rootEl.querySelector('[data-dock-backdrops]');
        if (bdWrap) {
          ['checker', 'dark', 'light'].forEach(function (bd) {
            var b = document.createElement('button');
            b.className = 'btn sm ' + (cfg.obs.studioBackdrop === bd ? 'active' : '');
            b.style.padding = '2px 6px';
            b.style.fontSize = '10.5px';
            b.textContent = bd === 'checker' ? t('backdropChecker') : bd === 'dark' ? t('backdropDark') : t('backdropLight');
            b.addEventListener('click', function () {
              store.update(function (d) { d.obs.studioBackdrop = bd; }, { source: 'studio-input' });
              bdWrap.querySelectorAll('button').forEach(function (btn) {
                btn.classList.toggle('active', btn === b);
              });
            });
            bdWrap.appendChild(b);
          });
        }
        if (options.onDockPreviewMounted) {
          options.onDockPreviewMounted(rootEl.querySelector('#dock-preview-stage'));
        }
      }

      bindHeaderEvents();
      renderBody();
    }

    function bindHeaderEvents() {
      rootEl.querySelectorAll('[data-tab]').forEach(function (btn) {
        btn.addEventListener('click', function () {
          activeTab = btn.getAttribute('data-tab');
          rootEl.querySelectorAll('[data-tab]').forEach(function (b) {
            b.classList.toggle('active', b === btn);
          });
          renderBody();
        });
      });

      var closeBtn = rootEl.querySelector('[data-action="close-studio"]');
      if (closeBtn) closeBtn.addEventListener('click', onClose);

      var openResetBtn = rootEl.querySelector('[data-action="open-reset"]');
      if (openResetBtn) {
        openResetBtn.addEventListener('click', function () {
          resetConfirmOpen = !resetConfirmOpen;
          renderShell();
        });
      }

      var cancelResetBtn = rootEl.querySelector('[data-action="cancel-reset"]');
      if (cancelResetBtn) {
        cancelResetBtn.addEventListener('click', function () {
          resetConfirmOpen = false;
          renderShell();
        });
      }

      rootEl.querySelectorAll('[data-confirm-reset]').forEach(function (btn) {
        btn.addEventListener('click', function () {
          applyReset(btn.getAttribute('data-confirm-reset'));
        });
      });

      var langBtn = rootEl.querySelector('[data-action="toggle-lang"]');
      if (langBtn) {
        langBtn.addEventListener('click', function () {
          store.update(function (d) {
            d.lang = d.lang === 'ru' ? 'en' : 'ru';
          });
          renderShell();
        });
      }

      var replayBtn = rootEl.querySelector('[data-action="replay-anim"]');
      if (replayBtn) replayBtn.addEventListener('click', function () { playback.replay(); });

      var pauseBtn = rootEl.querySelector('[data-action="toggle-pause"]');
      if (pauseBtn) {
        pauseBtn.addEventListener('click', function () {
          var nextCfg = store.update(function (d) {
            d.playback.paused = !d.playback.paused;
          });
          pauseBtn.classList.toggle('primary', nextCfg.playback.paused);
          pauseBtn.textContent = nextCfg.playback.paused ? '▶ ' + t('play') : '⏸ ' + t('pause');
        });
      }

      var bdSelect = rootEl.querySelector('[data-action="backdrop-select"]');
      if (bdSelect) {
        bdSelect.addEventListener('change', function () {
          store.update(function (d) {
            d.obs.studioBackdrop = bdSelect.value;
          });
        });
      }
    }

    function renderBody() {
      var bodyEl = rootEl.querySelector('#studio-body');
      if (!bodyEl) return;
      var cfg = store.get();

      if (activeTab === 'server') renderServerTab(bodyEl, cfg);
      else if (activeTab === 'design') renderDesignTab(bodyEl, cfg);
      else if (activeTab === 'font') renderFontTab(bodyEl, cfg);
      else if (activeTab === 'motion') renderMotionTab(bodyEl, cfg);
      else renderObsTab(bodyEl, cfg);
    }

    function buildIconPickerHtml(matches, sv) {
      if (!matches.length) {
        return '<div class="icon-empty-msg">' + escapeHtml(t('iconNoMatches')) + '</div>';
      }
      return matches.map(function (ic) {
        var isAct = sv.iconType === 'preset' && sv.iconPreset === ic.id;
        var label = store.get().lang === 'en' ? ic.nameEn : ic.name;
        return (
          '<button class="icon-pick-btn ' + (isAct ? 'active' : '') + '" data-pick-icon="' + ic.id + '" title="' + escapeHtml(label) + '" style="color:' + ic.accentColor + '">' +
            ic.svg +
          '</button>'
        );
      }).join('');
    }

    function renderServerTab(bodyEl, cfg) {
      var sv = cfg.server;
      var ls = cfg.liveStatus;
      var pb = cfg.playback;
      var stState = getStatusState();
      var summary = formatLiveSummary(stState);
      var iconMatches = McIcons.searchIcons(iconSearchQuery);

      bodyEl.innerHTML =
        '<div class="section-box">' +
          '<div class="section-title">' + escapeHtml(t('displayModeTitle')) + '</div>' +
          '<div class="seg-group">' +
            '<button class="seg-btn ' + (pb.displayMode === 'always' ? 'active' : '') + '" data-display-mode="always">' + escapeHtml(t('displayModeAlways')) + '</button>' +
            '<button class="seg-btn ' + (pb.displayMode === 'interval' ? 'active' : '') + '" data-display-mode="interval">' + escapeHtml(t('displayModeInterval')) + '</button>' +
          '</div>' +
          '<div class="section-hint">' + escapeHtml(pb.displayMode === 'always' ? t('displayModeAlwaysHint') : t('displayModeIntervalHint')) + '</div>' +
          (pb.displayMode === 'interval'
            ? '<div class="row-2">' +
                renderRange('displayDurationSec', t('intervalDurationLabel'), pb.displayDurationSec, 2, 120, 1, 's', 'pb') +
                renderRange('intervalCooldownSec', t('intervalCooldownLabel'), pb.intervalCooldownSec, 2, 600, 1, 's', 'pb') +
              '</div>'
            : '') +
        '</div>' +

        '<div class="section-box">' +
          '<div class="section-title">' + escapeHtml(t('serverInfoTitle')) + '</div>' +
          '<div class="row-2">' +
            '<div class="field-group">' +
              '<span class="field-label">' + escapeHtml(t('fieldServerName')) + '</span>' +
              '<input class="input" type="text" data-sv="name" value="' + escapeHtml(sv.name) + '" placeholder="' + escapeHtml(t('fieldServerNamePlaceholder')) + '">' +
            '</div>' +
            '<div class="field-group">' +
              '<span class="field-label">' + escapeHtml(t('fieldServerVersion')) + '</span>' +
              '<input class="input" type="text" data-sv="version" value="' + escapeHtml(sv.version) + '" placeholder="' + escapeHtml(t('fieldServerVersionPlaceholder')) + '">' +
            '</div>' +
          '</div>' +
          '<div class="row-2">' +
            '<div class="field-group">' +
              '<span class="field-label">' + escapeHtml(t('fieldServerIp')) + '</span>' +
              '<input class="input" type="text" data-sv="ip" value="' + escapeHtml(sv.ip) + '" placeholder="' + escapeHtml(t('fieldServerIpPlaceholder')) + '">' +
            '</div>' +
            '<div class="field-group">' +
              '<span class="field-label">' + escapeHtml(t('fieldIpPrefix')) + '</span>' +
              '<input class="input" type="text" data-sv="ipPrefix" value="' + escapeHtml(sv.ipPrefix) + '" placeholder="' + escapeHtml(t('fieldIpPrefixPlaceholder')) + '">' +
            '</div>' +
          '</div>' +
          '<div class="field-group">' +
            '<span class="field-label">' + escapeHtml(t('fieldServerDesc')) + '</span>' +
            '<input class="input" type="text" data-sv="description" value="' + escapeHtml(sv.description) + '" placeholder="' + escapeHtml(t('fieldServerDescPlaceholder')) + '">' +
          '</div>' +
          '<div class="row-2">' +
            '<div class="field-group">' +
              '<span class="field-label">' + escapeHtml(t('fieldAccentColor')) + '</span>' +
              '<div class="color-row">' +
                '<input class="color-input" type="color" data-sv="accentColor" value="' + escapeHtml(sv.accentColor) + '">' +
                '<input class="input" type="text" data-sv="accentColorText" value="' + escapeHtml(sv.accentColor) + '">' +
              '</div>' +
            '</div>' +
            '<div class="field-group">' +
              '<span class="field-label">' + escapeHtml(t('fieldSecondaryColor')) + '</span>' +
              '<div class="color-row">' +
                '<input class="color-input" type="color" data-sv="secondaryColor" value="' + escapeHtml(sv.secondaryColor) + '">' +
                '<button class="btn sm" data-action="reset-brand-color" title="' + escapeHtml(t('resetBrandColor')) + '">↺</button>' +
              '</div>' +
            '</div>' +
          '</div>' +
          '<div class="field-group">' +
            '<span class="field-label">' + escapeHtml(t('fieldServerUrl')) + '</span>' +
            '<input class="input" type="url" data-sv="url" value="' + escapeHtml(sv.url) + '" placeholder="' + escapeHtml(t('fieldServerUrlPlaceholder')) + '">' +
          '</div>' +
          '<label class="toggle-row"><span>' + escapeHtml(t('fieldQrShow')) + '</span><input type="checkbox" data-sv="showQr"' + (sv.showQr ? ' checked' : '') + '></label>' +
        '</div>' +

        '<div class="section-box">' +
          '<div class="section-title">' +
            '<span>' + escapeHtml(t('liveStatusTitle')) + '</span>' +
            '<button class="btn sm primary" data-action="check-live-now"' + (checkingNow ? ' disabled' : '') + '>🔄 ' + escapeHtml(checkingNow ? t('liveCheckingText') : t('liveCheckNowBtn')) + '</button>' +
          '</div>' +
          '<label class="toggle-row"><span>' + escapeHtml(t('liveStatusEnableLabel')) + '</span><input type="checkbox" data-ls="enabled"' + (ls.enabled ? ' checked' : '') + '></label>' +
          (summary
            ? '<div class="mc-live-result ' + (stState && stState.online ? 'is-online' : 'is-offline') + '">' + escapeHtml(summary) + '</div>'
            : '') +
          '<div class="row-2">' +
            '<div class="field-group">' +
              '<span class="field-label">' + escapeHtml(t('fieldEdition')) + '</span>' +
              '<select class="select" data-sv="edition">' +
                '<option value="java"' + (sv.edition === 'java' ? ' selected' : '') + '>' + escapeHtml(t('editionJava')) + '</option>' +
                '<option value="bedrock"' + (sv.edition === 'bedrock' ? ' selected' : '') + '>' + escapeHtml(t('editionBedrock')) + '</option>' +
              '</select>' +
            '</div>' +
            '<div class="field-group">' +
              '<span class="field-label">' + escapeHtml(t('liveStatusSourceLabel')) + '</span>' +
              '<select class="select" data-ls="source">' +
                '<option value="auto"' + (ls.source === 'auto' ? ' selected' : '') + '>' + escapeHtml(t('liveSourceAuto')) + '</option>' +
                '<option value="server"' + (ls.source === 'server' ? ' selected' : '') + '>' + escapeHtml(t('liveSourceServer')) + '</option>' +
                '<option value="mcstatus"' + (ls.source === 'mcstatus' ? ' selected' : '') + '>' + escapeHtml(t('liveSourceMcstatus')) + '</option>' +
              '</select>' +
            '</div>' +
          '</div>' +
          renderRange('pollIntervalSec', t('livePollLabel'), ls.pollIntervalSec, 10, 300, 5, 's', 'ls') +
          '<label class="toggle-row"><span>' + escapeHtml(t('liveShowCountLabel')) + '</span><input type="checkbox" data-ls="showOnlineCount"' + (ls.showOnlineCount ? ' checked' : '') + '></label>' +
          '<label class="toggle-row"><span>' + escapeHtml(t('liveShowOfflineLabel')) + '</span><input type="checkbox" data-ls="showOfflineBadge"' + (ls.showOfflineBadge ? ' checked' : '') + '></label>' +
          '<label class="toggle-row"><span>' + escapeHtml(t('liveUseIconLabel')) + '</span><input type="checkbox" data-ls="useLiveIcon"' + (ls.useLiveIcon ? ' checked' : '') + '></label>' +
          '<label class="toggle-row"><span>' + escapeHtml(t('liveSyncVersionLabel')) + '</span><input type="checkbox" data-ls="syncLiveVersion"' + (ls.syncLiveVersion ? ' checked' : '') + '></label>' +
        '</div>' +

        '<div class="section-box">' +
          '<div class="field-group">' +
            '<span class="field-label">' +
              '<span>' + escapeHtml(t('iconSectionTitle')) + '</span>' +
              '<select class="select" data-sv="iconColorMode" style="width:auto;padding:3px 8px;font-size:11px;">' +
                '<option value="brand"' + (sv.iconColorMode === 'brand' ? ' selected' : '') + '>' + escapeHtml(t('iconColorBrand')) + '</option>' +
                '<option value="white"' + (sv.iconColorMode === 'white' ? ' selected' : '') + '>' + escapeHtml(t('iconColorWhite')) + '</option>' +
                '<option value="original"' + (sv.iconColorMode === 'original' ? ' selected' : '') + '>' + escapeHtml(t('iconColorOriginal')) + '</option>' +
              '</select>' +
            '</span>' +
            '<div class="seg-group">' +
              ['preset', 'image', 'svg', 'emoji', 'live-icon'].map(function (mode) {
                var labelKey = mode === 'preset' ? 'iconModePreset' : mode === 'image' ? 'iconModeImage' : mode === 'svg' ? 'iconModeSvg' : mode === 'emoji' ? 'iconModeEmoji' : 'iconModeLive';
                return '<button class="seg-btn ' + (sv.iconType === mode ? 'active' : '') + '" data-icon-mode="' + mode + '">' + escapeHtml(t(labelKey)) + '</button>';
              }).join('') +
            '</div>' +
          '</div>' +

          (sv.iconType === 'preset' || sv.iconType === 'live-icon'
            ? '<div class="field-group">' +
                '<input class="input" type="search" data-action="search-icons" value="' + escapeHtml(iconSearchQuery) + '" placeholder="' + escapeHtml(t('iconSearchMcPlaceholder')) + '">' +
                '<div class="icon-picker-grid" id="mc-icon-picker-grid">' + buildIconPickerHtml(iconMatches, sv) + '</div>' +
              '</div>'
            : '') +

          (sv.iconType === 'image'
            ? '<div class="field-group">' +
                '<label class="dropzone" id="mc-icon-dropzone">' +
                  '<input type="file" accept="image/png,image/jpeg,image/webp,image/gif,image/svg+xml,.svg" data-action="upload-icon" style="display:none;">' +
                  '<span>' + escapeHtml(t('iconUploadBtn')) + '</span>' +
                '</label>' +
                '<span class="field-label">' + escapeHtml(t('iconImageUrlLabel')) + '</span>' +
                '<input class="input" type="url" data-sv="iconImage" value="' + escapeHtml(sv.iconImage) + '" placeholder="' + escapeHtml(t('iconImageUrlPlaceholder')) + '">' +
              '</div>'
            : '') +

          (sv.iconType === 'svg'
            ? '<div class="field-group">' +
                '<span class="field-label">' + escapeHtml(t('iconSvgCodeLabel')) + '</span>' +
                '<textarea class="textarea" data-sv="iconSvg" placeholder="' + escapeHtml(t('iconSvgCodePlaceholder')) + '">' + escapeHtml(sv.iconSvg) + '</textarea>' +
              '</div>'
            : '') +

          (sv.iconType === 'emoji'
            ? '<div class="field-group">' +
                '<span class="field-label">' + escapeHtml(t('iconEmojiLabel')) + '</span>' +
                '<input class="input" type="text" data-sv="iconEmoji" value="' + escapeHtml(sv.iconEmoji) + '">' +
              '</div>'
            : '') +
        '</div>' +

        '<div class="section-reset-row">' +
          '<button class="btn sm danger" data-section-reset="server">' + escapeHtml(t('resetServerBtn')) + '</button>' +
        '</div>';

      bindServerTabEvents(bodyEl);
    }

    function bindServerTabEvents(bodyEl) {
      bodyEl.querySelectorAll('[data-display-mode]').forEach(function (btn) {
        btn.addEventListener('click', function () {
          var mode = btn.getAttribute('data-display-mode');
          store.update(function (d) {
            d.playback.displayMode = mode;
          }, { source: 'studio-input' });
          playback.replay();
          renderBody();
        });
      });

      bindSectionInputs(bodyEl, 'pb', 'playback', false);
      bindSectionInputs(bodyEl, 'ls', 'liveStatus', false);

      bodyEl.querySelectorAll('[data-sv]').forEach(function (el) {
        var field = el.getAttribute('data-sv');
        var evtName = el.type === 'checkbox' || el.tagName === 'SELECT' ? 'change' : 'input';
        el.addEventListener(evtName, function () {
          store.update(function (d) {
            if (field === 'showQr') {
              d.server.showQr = el.checked;
              d.appearance.showQrGlobal = el.checked;
            } else if (field === 'accentColor') {
              var txtEl = bodyEl.querySelector('[data-sv="accentColorText"]');
              if (txtEl) txtEl.value = el.value;
              d.server.accentColor = el.value;
            } else if (field === 'accentColorText') {
              if (/^#[0-9a-fA-F]{6}$/.test(el.value.trim())) {
                var colEl = bodyEl.querySelector('[data-sv="accentColor"]');
                if (colEl) colEl.value = el.value.trim();
                d.server.accentColor = el.value.trim();
              }
            } else if (field === 'iconSvg') {
              d.server.iconSvg = McIcons.sanitizeSvg(el.value);
            } else {
              d.server[field] = el.value;
            }
          }, { source: 'studio-input' });

          if (field === 'showQr' || field === 'url' || field === 'iconImage' || field === 'iconSvg' || field === 'iconEmoji') {
            playback.refreshCurrentCard();
          }
        });
      });

      var resetColBtn = bodyEl.querySelector('[data-action="reset-brand-color"]');
      if (resetColBtn) {
        resetColBtn.addEventListener('click', function () {
          store.update(function (d) {
            var ic = McIcons.getIcon(d.server.iconPreset);
            d.server.accentColor = ic.accentColor;
            d.server.secondaryColor = ic.secondaryColor;
          }, { source: 'studio-input' });
          renderBody();
        });
      }

      var checkBtn = bodyEl.querySelector('[data-action="check-live-now"]');
      if (checkBtn) {
        checkBtn.addEventListener('click', function () {
          checkingNow = true;
          renderBody();
          triggerLiveCheck().finally(function () {
            checkingNow = false;
            if (activeTab === 'server') renderBody();
          });
        });
      }

      bodyEl.querySelectorAll('[data-icon-mode]').forEach(function (btn) {
        btn.addEventListener('click', function () {
          var mode = btn.getAttribute('data-icon-mode');
          store.update(function (d) {
            d.server.iconType = mode;
          }, { source: 'studio-input' });
          renderBody();
        });
      });

      function bindIconPickButtons() {
        bodyEl.querySelectorAll('[data-pick-icon]').forEach(function (btn) {
          btn.addEventListener('click', function () {
            var pid = btn.getAttribute('data-pick-icon');
            var meta = McIcons.getIcon(pid);
            store.update(function (d) {
              d.server.iconType = 'preset';
              d.server.iconPreset = pid;
              d.server.accentColor = meta.accentColor;
              d.server.secondaryColor = meta.secondaryColor;
            }, { source: 'studio-input' });
            renderBody();
          });
        });
      }
      bindIconPickButtons();

      var searchIcons = bodyEl.querySelector('[data-action="search-icons"]');
      if (searchIcons) {
        searchIcons.addEventListener('input', function () {
          iconSearchQuery = searchIcons.value;
          var grid = bodyEl.querySelector('#mc-icon-picker-grid');
          if (grid) {
            grid.innerHTML = buildIconPickerHtml(McIcons.searchIcons(iconSearchQuery), store.get().server);
            bindIconPickButtons();
          }
        });
      }

      var uploadInput = bodyEl.querySelector('[data-action="upload-icon"]');
      var dropzone = bodyEl.querySelector('#mc-icon-dropzone');
      if (uploadInput) {
        uploadInput.addEventListener('change', function () {
          if (uploadInput.files && uploadInput.files[0]) {
            processImageFile(uploadInput.files[0]);
          }
        });
      }
      if (dropzone) {
        dropzone.addEventListener('dragover', function (ev) {
          ev.preventDefault();
          dropzone.classList.add('dragover');
        });
        dropzone.addEventListener('dragleave', function () {
          dropzone.classList.remove('dragover');
        });
        dropzone.addEventListener('drop', function (ev) {
          ev.preventDefault();
          dropzone.classList.remove('dragover');
          if (ev.dataTransfer && ev.dataTransfer.files && ev.dataTransfer.files[0]) {
            processImageFile(ev.dataTransfer.files[0]);
          }
        });
      }

      bindSectionResetButtons(bodyEl);
    }

    function renderDesignTab(bodyEl, cfg) {
      var ap = cfg.appearance;
      var ty = cfg.typography || {};
      var anim = cfg.animation || {};
      var lang = cfg.lang;
      var presetIds = Object.keys(McConfig.STYLE_PRESETS);
      var presetDict = t('presets') || {};
      var themeDict = t('themes') || {};
      var layoutDict = t('layouts') || {};

      function isPresetMatch(pid) {
        if (activePresetId) return activePresetId === pid;
        var pr = McConfig.STYLE_PRESETS[pid];
        if (!pr || !pr.appearance) return false;
        return pr.appearance.theme === ap.theme &&
          pr.appearance.layout === ap.layout &&
          (!pr.animation || pr.animation.style === anim.style);
      }

      bodyEl.innerHTML =
        '<div class="section-box">' +
          '<div class="section-title"><span>' + escapeHtml(t('presetsTitle')) + ' (' + presetIds.length + ')</span></div>' +
          '<div class="preset-grid">' +
            presetIds.map(function (pid) {
              var pr = McConfig.STYLE_PRESETS[pid];
              var bgHex = (pr && pr.appearance && pr.appearance.bgColor) || '#0c101b';
              var txtHex = (pr && pr.appearance && pr.appearance.textColor) || '#ffffff';
              return (
                '<button class="preset-btn ' + (isPresetMatch(pid) ? 'active' : '') + '" data-apply-preset="' + pid + '">' +
                  '<span>' + escapeHtml(presetDict[pid] || pid) + '</span>' +
                  '<span class="preset-swatch" style="background:' + escapeHtml(bgHex) + ';border-color:' + escapeHtml(txtHex) + ';"></span>' +
                '</button>'
              );
            }).join('') +
          '</div>' +
        '</div>' +

        '<div class="section-box">' +
          '<div class="field-group">' +
            '<span class="field-label">' + escapeHtml(t('themeLabel')) + '</span>' +
            '<select class="select" data-ap="theme">' +
              McConfig.THEMES.map(function (th) {
                return '<option value="' + th + '"' + (ap.theme === th ? ' selected' : '') + '>' + escapeHtml(themeDict[th] || th) + '</option>';
              }).join('') +
            '</select>' +
          '</div>' +
          '<div class="row-2">' +
            '<div class="field-group">' +
              '<span class="field-label">' + escapeHtml(t('layoutLabel')) + '</span>' +
              '<select class="select" data-ap="layout">' +
                McConfig.LAYOUTS.map(function (ly) {
                  return '<option value="' + ly + '"' + (ap.layout === ly ? ' selected' : '') + '>' + escapeHtml(layoutDict[ly] || ly) + '</option>';
                }).join('') +
              '</select>' +
            '</div>' +
            '<div class="field-group">' +
              '<span class="field-label">' + escapeHtml(t('fontLabel')) + '</span>' +
              '<select class="select" data-action="quick-font-select">' +
                McConfig.FONT_PRESETS.map(function (fp) {
                  var lbl = lang === 'ru' ? fp.labelRu : fp.labelEn;
                  return '<option value="' + fp.id + '"' + ((ty.fontPreset || ap.fontFamily) === fp.id ? ' selected' : '') + '>' + escapeHtml(lbl) + '</option>';
                }).join('') +
              '</select>' +
            '</div>' +
          '</div>' +
        '</div>' +

        '<div class="section-box">' +
          '<div class="section-title">' + escapeHtml(t('togglesDesignTitle')) + '</div>' +
          '<label class="toggle-row"><span>' + escapeHtml(t('showServerNameLabel')) + '</span><input type="checkbox" data-ap="showServerName"' + (ap.showServerName ? ' checked' : '') + '></label>' +
          '<label class="toggle-row"><span>' + escapeHtml(t('showVersionBadgeLabel')) + '</span><input type="checkbox" data-ap="showVersionBadge"' + (ap.showVersionBadge ? ' checked' : '') + '></label>' +
          '<label class="toggle-row"><span>' + escapeHtml(t('showDescriptionLabel')) + '</span><input type="checkbox" data-ap="showDescription"' + (ap.showDescription ? ' checked' : '') + '></label>' +
          '<label class="toggle-row"><span>' + escapeHtml(t('showIpPrefixLabel')) + '</span><input type="checkbox" data-ap="showIpPrefix"' + (ap.showIpPrefix ? ' checked' : '') + '></label>' +
        '</div>' +

        '<div class="section-box">' +
          '<div class="section-title">' + escapeHtml(t('slidersDesignTitle')) + '</div>' +
          '<div class="row-2">' +
            '<div class="field-group">' +
              '<span class="field-label">' + escapeHtml(t('bgColorLabel')) + '</span>' +
              '<div class="color-row"><input class="color-input" type="color" data-ap="bgColor" value="' + escapeHtml(ap.bgColor) + '"><span class="field-value">' + escapeHtml(ap.bgColor) + '</span></div>' +
            '</div>' +
            '<div class="field-group">' +
              '<span class="field-label">' + escapeHtml(t('textColorLabel')) + '</span>' +
              '<div class="color-row"><input class="color-input" type="color" data-ap="textColor" value="' + escapeHtml(ap.textColor) + '"><span class="field-value">' + escapeHtml(ap.textColor) + '</span></div>' +
            '</div>' +
          '</div>' +
          renderRange('scale', t('scaleLabel'), ap.scale, 0.5, 2.0, 0.05, 'x', 'ap') +
          renderRange('maxWidthPx', t('maxWidthLabel'), ap.maxWidthPx, 240, 720, 10, 'px', 'ap') +
          renderRange('borderRadiusPx', t('radiusLabel'), ap.borderRadiusPx, 0, 48, 1, 'px', 'ap') +
          renderRange('iconSizePx', t('iconSizeLabel'), ap.iconSizePx, 26, 68, 2, 'px', 'ap') +
          renderRange('qrSizePx', t('qrSizeLabel'), ap.qrSizePx, 46, 110, 2, 'px', 'ap') +
          renderRange('bgOpacity', t('bgOpacityLabel'), Math.round(ap.bgOpacity * 100), 0, 100, 2, '%', 'ap-pct') +
          renderRange('blurPx', t('blurLabel'), ap.blurPx, 0, 32, 1, 'px', 'ap') +
          renderRange('borderWidthPx', t('borderWidthLabel'), ap.borderWidthPx, 0, 5, 0.5, 'px', 'ap') +
          renderRange('borderOpacity', t('borderOpacityLabel'), Math.round(ap.borderOpacity * 100), 0, 100, 2, '%', 'ap-pct') +
          renderRange('glowIntensity', t('glowLabel'), Math.round(ap.glowIntensity * 100), 0, 100, 2, '%', 'ap-pct') +
          renderRange('shadowIntensity', t('shadowLabel'), Math.round(ap.shadowIntensity * 100), 0, 100, 2, '%', 'ap-pct') +
        '</div>' +

        '<div class="section-reset-row">' +
          '<button class="btn sm danger" data-section-reset="design">' + escapeHtml(t('resetDesignBtn')) + '</button>' +
        '</div>';

      bodyEl.querySelectorAll('[data-apply-preset]').forEach(function (btn) {
        btn.addEventListener('click', function () {
          var pid = btn.getAttribute('data-apply-preset');
          activePresetId = pid;
          store.update(function (d) {
            return McConfig.applyStylePreset(d, pid);
          }, { source: 'studio-input' });
          playback.replay();
          renderBody();
        });
      });

      var quickFontSel = bodyEl.querySelector('[data-action="quick-font-select"]');
      if (quickFontSel) {
        quickFontSel.addEventListener('change', function () {
          store.update(function (d) {
            d.appearance.fontFamily = quickFontSel.value;
            if (!d.typography) d.typography = {};
            d.typography.fontPreset = quickFontSel.value;
          }, { source: 'studio-input' });
        });
      }

      bindSectionInputs(bodyEl, 'ap', 'appearance');
      bindSectionResetButtons(bodyEl);
    }

    function renderWeightOptions(selectedWeight) {
      return [300, 400, 500, 600, 700, 800, 900].map(function (w) {
        return '<option value="' + w + '"' + (Number(selectedWeight) === w ? ' selected' : '') + '>' + w + '</option>';
      }).join('');
    }

    function renderTransformOptions(selectedTransform) {
      return [
        { id: 'none', key: 'transformNone' },
        { id: 'uppercase', key: 'transformUpper' },
        { id: 'lowercase', key: 'transformLower' },
        { id: 'capitalize', key: 'transformCap' }
      ].map(function (it) {
        return '<option value="' + it.id + '"' + (selectedTransform === it.id ? ' selected' : '') + '>' + escapeHtml(t(it.key)) + '</option>';
      }).join('');
    }

    function renderColorModeOptions(selectedMode) {
      return [
        { id: 'accent', key: 'colorModeAccent' },
        { id: 'text', key: 'colorModeText' },
        { id: 'custom', key: 'colorModeCustom' }
      ].map(function (it) {
        return '<option value="' + it.id + '"' + (selectedMode === it.id ? ' selected' : '') + '>' + escapeHtml(t(it.key)) + '</option>';
      }).join('');
    }

    function renderFontTab(bodyEl, cfg) {
      var ty = cfg.typography;
      var lang = cfg.lang;
      var activePreset = ty.fontPreset || cfg.appearance.fontFamily || 'modern';

      bodyEl.innerHTML =
        '<div class="section-box">' +
          '<div class="section-title">' + escapeHtml(t('fontFamilySectionTitle')) + '</div>' +
          '<div class="font-preset-list">' +
            McConfig.FONT_PRESETS.map(function (fp) {
              var lbl = lang === 'ru' ? fp.labelRu : fp.labelEn;
              return (
                '<button class="font-preset-card ' + (activePreset === fp.id ? 'active' : '') + '" data-font-preset="' + fp.id + '">' +
                  '<span style="font-size:12px;font-weight:600;">' + escapeHtml(lbl) + '</span>' +
                  '<span class="font-preset-sample" style="font-family:' + escapeHtml(fp.stack) + '">Абв Abc</span>' +
                '</button>'
              );
            }).join('') +
          '</div>' +
          '<div class="field-group">' +
            '<span class="field-label">' + escapeHtml(t('customFontLabel')) + '</span>' +
            '<input class="input" type="text" data-ty="customFontName" value="' + escapeHtml(ty.customFontName) + '" placeholder="' + escapeHtml(t('customFontPlaceholder')) + '">' +
            '<div class="section-hint">' + escapeHtml(t('customFontHint')) + '</div>' +
          '</div>' +
        '</div>' +

        '<div class="section-box">' +
          '<div class="section-title">' + escapeHtml(t('fontHandleSectionTitle')) + '</div>' +
          renderRange('handleSizePx', t('fontSizeLabel'), ty.handleSizePx, 11, 38, 0.5, 'px', 'ty') +
          renderRange('handleLetterSpacingPx', t('fontLetterSpacingLabel'), ty.handleLetterSpacingPx, -2, 10, 0.1, 'px', 'ty') +
          '<div class="row-2">' +
            '<div class="field-group">' +
              '<span class="field-label">' + escapeHtml(t('fontWeightLabel')) + '</span>' +
              '<select class="select" data-ty-num="handleWeight">' + renderWeightOptions(ty.handleWeight) + '</select>' +
            '</div>' +
            '<div class="field-group">' +
              '<span class="field-label">' + escapeHtml(t('fontTransformLabel')) + '</span>' +
              '<select class="select" data-ty="handleTransform">' + renderTransformOptions(ty.handleTransform) + '</select>' +
            '</div>' +
          '</div>' +
          '<label class="toggle-row"><span>' + escapeHtml(t('fontItalicLabel')) + '</span><input type="checkbox" data-ty="handleItalic"' + (ty.handleItalic ? ' checked' : '') + '></label>' +
        '</div>' +

        '<div class="section-box">' +
          '<div class="section-title">' + escapeHtml(t('fontTitleSectionTitle')) + '</div>' +
          renderRange('titleSizePx', t('fontSizeLabel'), ty.titleSizePx, 8, 26, 0.5, 'px', 'ty') +
          renderRange('titleLetterSpacingPx', t('fontLetterSpacingLabel'), ty.titleLetterSpacingPx, -1, 10, 0.1, 'px', 'ty') +
          '<div class="row-2">' +
            '<div class="field-group">' +
              '<span class="field-label">' + escapeHtml(t('fontWeightLabel')) + '</span>' +
              '<select class="select" data-ty-num="titleWeight">' + renderWeightOptions(ty.titleWeight) + '</select>' +
            '</div>' +
            '<div class="field-group">' +
              '<span class="field-label">' + escapeHtml(t('fontTransformLabel')) + '</span>' +
              '<select class="select" data-ty="titleTransform">' + renderTransformOptions(ty.titleTransform) + '</select>' +
            '</div>' +
          '</div>' +
          '<div class="row-2">' +
            '<div class="field-group">' +
              '<span class="field-label">' + escapeHtml(t('fontColorModeLabel')) + '</span>' +
              '<select class="select" data-ty="titleColorMode">' + renderColorModeOptions(ty.titleColorMode) + '</select>' +
            '</div>' +
            '<div class="field-group" style="' + (ty.titleColorMode === 'custom' ? '' : 'opacity:0.45;pointer-events:none;') + '">' +
              '<span class="field-label">' + escapeHtml(t('colorModeCustom')) + '</span>' +
              '<div class="color-row"><input class="color-input" type="color" data-ty="titleCustomColor" value="' + escapeHtml(ty.titleCustomColor) + '"><span class="field-value">' + escapeHtml(ty.titleCustomColor) + '</span></div>' +
            '</div>' +
          '</div>' +
          '<label class="toggle-row"><span>' + escapeHtml(t('fontItalicLabel')) + '</span><input type="checkbox" data-ty="titleItalic"' + (ty.titleItalic ? ' checked' : '') + '></label>' +
        '</div>' +

        '<div class="section-box">' +
          '<div class="section-title">' + escapeHtml(t('fontSubtitleSectionTitle')) + '</div>' +
          renderRange('subtitleSizePx', t('fontSizeLabel'), ty.subtitleSizePx, 8, 26, 0.5, 'px', 'ty') +
          renderRange('subtitleOpacity', t('fontOpacityLabel'), Math.round(ty.subtitleOpacity * 100), 25, 100, 2, '%', 'ty-pct') +
          '<div class="row-2">' +
            '<div class="field-group">' +
              '<span class="field-label">' + escapeHtml(t('fontWeightLabel')) + '</span>' +
              '<select class="select" data-ty-num="subtitleWeight">' + renderWeightOptions(ty.subtitleWeight) + '</select>' +
            '</div>' +
            '<div class="field-group">' +
              '<span class="field-label">' + escapeHtml(t('fontTransformLabel')) + '</span>' +
              '<select class="select" data-ty="subtitleTransform">' + renderTransformOptions(ty.subtitleTransform) + '</select>' +
            '</div>' +
          '</div>' +
          '<div class="row-2">' +
            '<div class="field-group">' +
              '<span class="field-label">' + escapeHtml(t('fontColorModeLabel')) + '</span>' +
              '<select class="select" data-ty="subtitleColorMode">' + renderColorModeOptions(ty.subtitleColorMode) + '</select>' +
            '</div>' +
            '<div class="field-group" style="' + (ty.subtitleColorMode === 'custom' ? '' : 'opacity:0.45;pointer-events:none;') + '">' +
              '<span class="field-label">' + escapeHtml(t('colorModeCustom')) + '</span>' +
              '<div class="color-row"><input class="color-input" type="color" data-ty="subtitleCustomColor" value="' + escapeHtml(ty.subtitleCustomColor) + '"><span class="field-value">' + escapeHtml(ty.subtitleCustomColor) + '</span></div>' +
            '</div>' +
          '</div>' +
          '<label class="toggle-row"><span>' + escapeHtml(t('fontItalicLabel')) + '</span><input type="checkbox" data-ty="subtitleItalic"' + (ty.subtitleItalic ? ' checked' : '') + '></label>' +
        '</div>' +

        '<div class="section-box">' +
          '<div class="section-title">' + escapeHtml(t('fontEffectsSectionTitle')) + '</div>' +
          renderRange('lineGapPx', t('lineGapLabel'), ty.lineGapPx, 0, 14, 0.5, 'px', 'ty') +
          '<div class="field-group">' +
            '<span class="field-label">' + escapeHtml(t('textShadowModeLabel')) + '</span>' +
            '<select class="select" data-ty="textShadowMode">' +
              '<option value="none"' + (ty.textShadowMode === 'none' ? ' selected' : '') + '>' + escapeHtml(t('shadowNone')) + '</option>' +
              '<option value="soft"' + (ty.textShadowMode === 'soft' ? ' selected' : '') + '>' + escapeHtml(t('shadowSoft')) + '</option>' +
              '<option value="strong"' + (ty.textShadowMode === 'strong' ? ' selected' : '') + '>' + escapeHtml(t('shadowStrong')) + '</option>' +
              '<option value="glow"' + (ty.textShadowMode === 'glow' ? ' selected' : '') + '>' + escapeHtml(t('shadowGlow')) + '</option>' +
            '</select>' +
          '</div>' +
          renderRange('textShadowStrength', t('textShadowStrengthLabel'), Math.round(ty.textShadowStrength * 100), 0, 100, 2, '%', 'ty-pct') +
          renderRange('textStrokePx', t('textStrokePxLabel'), ty.textStrokePx, 0, 3, 0.25, 'px', 'ty') +
          '<div class="field-group">' +
            '<span class="field-label">' + escapeHtml(t('textStrokeColorLabel')) + '</span>' +
            '<div class="color-row"><input class="color-input" type="color" data-ty="textStrokeColor" value="' + escapeHtml(ty.textStrokeColor) + '"><span class="field-value">' + escapeHtml(ty.textStrokeColor) + '</span></div>' +
          '</div>' +
        '</div>' +

        '<div class="section-reset-row">' +
          '<button class="btn sm danger" data-section-reset="typography">' + escapeHtml(t('resetFontBtn')) + '</button>' +
        '</div>';

      bodyEl.querySelectorAll('[data-font-preset]').forEach(function (btn) {
        btn.addEventListener('click', function () {
          var fid = btn.getAttribute('data-font-preset');
          store.update(function (d) {
            if (!d.typography) d.typography = {};
            d.typography.fontPreset = fid;
            d.appearance.fontFamily = fid;
          }, { source: 'studio-input' });
          bodyEl.querySelectorAll('[data-font-preset]').forEach(function (b) {
            b.classList.toggle('active', b === btn);
          });
        });
      });

      bodyEl.querySelectorAll('[data-ty-num]').forEach(function (sel) {
        var key = sel.getAttribute('data-ty-num');
        sel.addEventListener('change', function () {
          store.update(function (d) {
            if (!d.typography) d.typography = {};
            d.typography[key] = Number(sel.value) || 700;
          }, { source: 'studio-input' });
        });
      });

      bindSectionInputs(bodyEl, 'ty', 'typography');
      bodyEl.querySelectorAll('[data-ty="titleColorMode"], [data-ty="subtitleColorMode"]').forEach(function (sel) {
        sel.addEventListener('change', function () {
          renderBody();
        });
      });
      bindSectionResetButtons(bodyEl);
    }

    function renderMotionTab(bodyEl, cfg) {
      var anim = cfg.animation;
      var pb = cfg.playback;
      var animDict = t('animStyles');
      var easingDict = t('easings');
      var idleDict = t('idleMotions');
      var progDict = t('progressStyles');

      bodyEl.innerHTML =
        '<div class="section-box">' +
          '<div class="field-group">' +
            '<span class="field-label">' + escapeHtml(t('animStyleLabel')) + '</span>' +
            '<div class="preset-grid">' +
              McConfig.ANIM_STYLES.map(function (st) {
                return '<button class="preset-btn ' + (anim.style === st ? 'active' : '') + '" data-anim-style="' + st + '"><span>' + escapeHtml(animDict[st] || st) + '</span></button>';
              }).join('') +
            '</div>' +
          '</div>' +

          '<div class="row-2">' +
            '<div class="field-group">' +
              '<span class="field-label">' + escapeHtml(t('animDirectionLabel')) + '</span>' +
              '<select class="select" data-anim="direction">' +
                '<option value="left"' + (anim.direction === 'left' ? ' selected' : '') + '>' + escapeHtml(t('dirLeft')) + '</option>' +
                '<option value="right"' + (anim.direction === 'right' ? ' selected' : '') + '>' + escapeHtml(t('dirRight')) + '</option>' +
                '<option value="top"' + (anim.direction === 'top' ? ' selected' : '') + '>' + escapeHtml(t('dirTop')) + '</option>' +
                '<option value="bottom"' + (anim.direction === 'bottom' ? ' selected' : '') + '>' + escapeHtml(t('dirBottom')) + '</option>' +
              '</select>' +
            '</div>' +
            '<div class="field-group">' +
              '<span class="field-label">' + escapeHtml(t('animEasingLabel')) + '</span>' +
              '<select class="select" data-anim="easing">' +
                Object.keys(easingDict).map(function (ek) {
                  return '<option value="' + ek + '"' + (anim.easing === ek ? ' selected' : '') + '>' + escapeHtml(easingDict[ek]) + '</option>';
                }).join('') +
              '</select>' +
            '</div>' +
          '</div>' +

          '<div class="row-2">' +
            '<div class="field-group">' +
              '<span class="field-label">' + escapeHtml(t('idleMotionLabel')) + '</span>' +
              '<select class="select" data-anim="idleMotion">' +
                Object.keys(idleDict).map(function (ik) {
                  return '<option value="' + ik + '"' + (anim.idleMotion === ik ? ' selected' : '') + '>' + escapeHtml(idleDict[ik]) + '</option>';
                }).join('') +
              '</select>' +
            '</div>' +
            '<div class="field-group">' +
              '<span class="field-label">' + escapeHtml(t('progressStyleLabel')) + '</span>' +
              '<select class="select" data-anim="progressStyle">' +
                Object.keys(progDict).map(function (pk) {
                  return '<option value="' + pk + '"' + (anim.progressStyle === pk ? ' selected' : '') + '>' + escapeHtml(progDict[pk]) + '</option>';
                }).join('') +
              '</select>' +
            '</div>' +
          '</div>' +

          '<label class="toggle-row"><span>' + escapeHtml(t('shimmerSweepLabel')) + '</span><input type="checkbox" data-anim="shimmerSweep"' + (anim.shimmerSweep ? ' checked' : '') + '></label>' +
        '</div>' +

        '<div class="section-box">' +
          '<div class="section-title">' + escapeHtml(t('timingTitle')) + '</div>' +
          '<div class="seg-group">' +
            '<button class="seg-btn ' + (pb.displayMode === 'always' ? 'active' : '') + '" data-motion-mode="always">' + escapeHtml(t('displayModeAlways')) + '</button>' +
            '<button class="seg-btn ' + (pb.displayMode === 'interval' ? 'active' : '') + '" data-motion-mode="interval">' + escapeHtml(t('displayModeInterval')) + '</button>' +
          '</div>' +
          renderRange('displayDurationSec', t('intervalDurationLabel'), pb.displayDurationSec, 2, 120, 1, 's', 'pb') +
          renderRange('intervalCooldownSec', t('intervalCooldownLabel'), pb.intervalCooldownSec, 2, 600, 1, 's', 'pb') +
          renderRange('enterDurationMs', t('enterDurationLabel'), pb.enterDurationMs, 150, 1800, 50, 'ms', 'pb') +
          renderRange('exitDurationMs', t('exitDurationLabel'), pb.exitDurationMs, 150, 1500, 50, 'ms', 'pb') +
          renderRange('staggerMs', t('staggerLabel'), anim.staggerMs, 0, 200, 5, 'ms', 'anim') +
          renderRange('distancePx', t('distanceLabel'), anim.distancePx, 10, 140, 2, 'px', 'anim') +
        '</div>' +

        '<div class="section-reset-row">' +
          '<button class="btn sm danger" data-section-reset="animation">' + escapeHtml(t('resetMotionBtn')) + '</button>' +
        '</div>';

      bodyEl.querySelectorAll('[data-anim-style]').forEach(function (btn) {
        btn.addEventListener('click', function () {
          activePresetId = '';
          var st = btn.getAttribute('data-anim-style');
          store.update(function (d) { d.animation.style = st; }, { source: 'studio-input' });
          bodyEl.querySelectorAll('[data-anim-style]').forEach(function (b) {
            b.classList.toggle('active', b === btn);
          });
          playback.replay();
        });
      });

      bodyEl.querySelectorAll('[data-motion-mode]').forEach(function (btn) {
        btn.addEventListener('click', function () {
          var mode = btn.getAttribute('data-motion-mode');
          store.update(function (d) { d.playback.displayMode = mode; }, { source: 'studio-input' });
          bodyEl.querySelectorAll('[data-motion-mode]').forEach(function (b) {
            b.classList.toggle('active', b === btn);
          });
          playback.replay();
        });
      });

      bindSectionInputs(bodyEl, 'anim', 'animation', true);
      bindSectionInputs(bodyEl, 'pb', 'playback', false);
      bindSectionResetButtons(bodyEl);
    }

    function renderObsTab(bodyEl, cfg) {
      var pos = cfg.position;
      var pb = cfg.playback;
      var obs = cfg.obs;
      var anchorArrows = {
        'top-left': '↖', 'top-center': '↑', 'top-right': '↗',
        'middle-left': '←', center: '•', 'middle-right': '→',
        'bottom-left': '↙', 'bottom-center': '↓', 'bottom-right': '↘'
      };

      bodyEl.innerHTML =
        '<div class="section-box">' +
          '<div class="section-title">' + escapeHtml(t('positionTitle')) + '</div>' +
          '<div class="anchor-grid">' +
            McConfig.ANCHORS.map(function (anc) {
              return '<button class="anchor-cell ' + (pos.anchor === anc ? 'active' : '') + '" data-anchor="' + anc + '" title="' + anc + '">' + anchorArrows[anc] + '</button>';
            }).join('') +
          '</div>' +
          renderRange('offsetX', t('offsetXLabel'), pos.offsetX, 0, 300, 2, 'px', 'pos') +
          renderRange('offsetY', t('offsetYLabel'), pos.offsetY, 0, 300, 2, 'px', 'pos') +
        '</div>' +

        '<div class="section-box">' +
          '<div class="section-title">' + escapeHtml(t('obsBehaviorTitle')) + '</div>' +
          '<label class="toggle-row"><span>' + escapeHtml(t('restartOnObsShowMcLabel')) + '</span><input type="checkbox" data-pb="restartOnObsShow"' + (pb.restartOnObsShow ? ' checked' : '') + '></label>' +
          '<label class="toggle-row"><span>' + escapeHtml(t('pauseWhenObsHiddenMcLabel')) + '</span><input type="checkbox" data-pb="pauseWhenObsHidden"' + (pb.pauseWhenObsHidden ? ' checked' : '') + '></label>' +
          '<label class="toggle-row"><span>' + escapeHtml(t('hideHoverButtonLabel')) + '</span><input type="checkbox" data-obs="hideHoverButton"' + (obs.hideHoverButton ? ' checked' : '') + '></label>' +
        '</div>' +

        '<div class="section-box">' +
          '<div class="section-title">' + escapeHtml(t('exportTitle')) + '</div>' +
          '<div class="row-2">' +
            '<button class="btn primary" data-action="copy-url">🔗 ' + escapeHtml(t('copyObsMcUrlBtn')) + '</button>' +
            '<button class="btn" data-action="copy-dock-url">🧩 ' + escapeHtml(t('copyDockMcUrlBtn')) + '</button>' +
          '</div>' +
          '<div class="row-2">' +
            '<button class="btn" data-action="export-json">⬇ ' + escapeHtml(t('exportJsonBtn')) + '</button>' +
            '<label class="btn" style="cursor:pointer;">⬆ ' + escapeHtml(t('importJsonBtn')) + '<input type="file" accept=".json,application/json" data-action="import-json" style="display:none;"></label>' +
          '</div>' +
          '<button class="btn danger" data-action="reset-defaults">↺ ' + escapeHtml(t('resetDefaultsBtn')) + '</button>' +
        '</div>' +

        '<div class="section-box">' +
          '<div class="section-title">' + escapeHtml(t('obsGuideTitle')) + '</div>' +
          '<div class="guide-card"><strong>' + escapeHtml(t('obsGuideStep1Title')) + '</strong>' + escapeHtml(t('obsGuideStep1McBody')) + '</div>' +
          '<div class="guide-card"><strong>' + escapeHtml(t('obsGuideStep2Title')) + '</strong>' + escapeHtml(t('obsGuideStep2McBody')) + '</div>' +
          '<div class="guide-card"><strong>' + escapeHtml(t('obsGuideStep3Title')) + '</strong>' + escapeHtml(t('obsGuideStep3McBody')) + '</div>' +
        '</div>';

      bodyEl.querySelectorAll('[data-anchor]').forEach(function (btn) {
        btn.addEventListener('click', function () {
          var anc = btn.getAttribute('data-anchor');
          store.update(function (d) { d.position.anchor = anc; }, { source: 'studio-input' });
          bodyEl.querySelectorAll('[data-anchor]').forEach(function (b) {
            b.classList.toggle('active', b === btn);
          });
        });
      });

      bindSectionInputs(bodyEl, 'pos', 'position', false);
      bindSectionInputs(bodyEl, 'pb', 'playback', false);
      bindSectionInputs(bodyEl, 'obs', 'obs', false);

      var copyUrlBtn = bodyEl.querySelector('[data-action="copy-url"]');
      if (copyUrlBtn) {
        copyUrlBtn.addEventListener('click', function () {
          var cur = store.get();
          var base = location.href.split('#')[0].split('?')[0].replace(/minecraft-dock\.html$/i, 'minecraft.html');
          var share = McConfig.buildShareUrl(base, cur, null);
          copyText(share, share.length > 6000);
        });
      }

      var copyDockBtn = bodyEl.querySelector('[data-action="copy-dock-url"]');
      if (copyDockBtn) {
        copyDockBtn.addEventListener('click', function () {
          var base = location.href.split('#')[0].split('?')[0].replace(/minecraft-dock\.html$/i, 'minecraft.html');
          copyText(base + '?dock=1', false);
        });
      }

      var exportBtn = bodyEl.querySelector('[data-action="export-json"]');
      if (exportBtn) {
        exportBtn.addEventListener('click', function () {
          var data = JSON.stringify(store.get(), null, 2);
          var blob = new Blob([data], { type: 'application/json' });
          var url = URL.createObjectURL(blob);
          var a = document.createElement('a');
          a.href = url;
          a.download = 'obs-minecraft-widget-config.json';
          document.body.appendChild(a);
          a.click();
          document.body.removeChild(a);
          URL.revokeObjectURL(url);
        });
      }

      var importInput = bodyEl.querySelector('[data-action="import-json"]');
      if (importInput) {
        importInput.addEventListener('change', function () {
          var file = importInput.files && importInput.files[0];
          if (!file) return;
          var r = new FileReader();
          r.onload = function () {
            try {
              var parsed = JSON.parse(String(r.result || ''));
              store.set(parsed, { source: 'import' });
              showToast(t('importedToast'));
              renderShell();
            } catch (_err) {
              showToast(t('importErrorToast'));
            }
          };
          r.readAsText(file);
        });
      }

      var resetBtn = bodyEl.querySelector('[data-action="reset-defaults"]');
      if (resetBtn) {
        resetBtn.addEventListener('click', function () {
          resetConfirmOpen = true;
          renderShell();
        });
      }
    }

    function bindSectionResetButtons(container) {
      container.querySelectorAll('[data-section-reset]').forEach(function (btn) {
        btn.addEventListener('click', function () {
          applyReset(btn.getAttribute('data-section-reset'));
        });
      });
    }

    function renderRange(key, label, value, min, max, step, unit, attrPrefix) {
      return (
        '<div class="field-group">' +
          '<span class="field-label"><span>' + escapeHtml(label) + '</span><span class="field-value" data-val-for="' + attrPrefix + ':' + key + '">' + escapeHtml(value) + unit + '</span></span>' +
          '<input class="range" type="range" min="' + min + '" max="' + max + '" step="' + step + '" value="' + escapeHtml(value) + '" data-unit="' + escapeHtml(unit) + '" data-' + attrPrefix + '="' + key + '">' +
        '</div>'
      );
    }

    function bindSectionInputs(container, attrPrefix, sectionKey, replayOnSelectChange) {
      var pctAttr = attrPrefix + '-pct';
      container.querySelectorAll('[data-' + attrPrefix + '], [data-' + pctAttr + ']').forEach(function (el) {
        var isPct = el.hasAttribute('data-' + pctAttr);
        var key = el.getAttribute('data-' + (isPct ? pctAttr : attrPrefix));
        var evt = el.type === 'checkbox' || el.tagName === 'SELECT' ? 'change' : 'input';
        el.addEventListener(evt, function () {
          var val;
          if (el.type === 'checkbox') {
            val = el.checked;
          } else if (el.type === 'range' || el.type === 'number') {
            var num = Number(el.value);
            val = isPct ? num / 100 : num;
            var valTag = container.querySelector('[data-val-for="' + attrPrefix + ':' + key + '"]');
            if (valTag) valTag.textContent = el.value + (el.getAttribute('data-unit') || '');
          } else if (el.type === 'color') {
            val = el.value;
            var hexTag = el.parentElement && el.parentElement.querySelector('.field-value');
            if (hexTag) hexTag.textContent = el.value;
          } else {
            val = el.value;
          }

          if (sectionKey === 'appearance' || sectionKey === 'animation') {
            activePresetId = '';
          }

          store.update(function (d) {
            if (!d[sectionKey]) d[sectionKey] = {};
            d[sectionKey][key] = val;
          }, { source: 'studio-input' });

          if (replayOnSelectChange && (key === 'direction' || key === 'easing' || key === 'progressStyle' || key === 'idleMotion')) {
            playback.replay();
          }
          if (key === 'theme' || key === 'showQrGlobal' || key === 'layout' || key === 'showServerName' || key === 'showVersionBadge' || key === 'showDescription' || key === 'showIpPrefix' || key === 'showOnlineCount' || key === 'showOfflineBadge' || key === 'useLiveIcon' || key === 'syncLiveVersion') {
            playback.refreshCurrentCard();
          }
        });
      });
    }

    return {
      render: renderShell,
      refreshBody: renderBody,
      showToast: showToast
    };
  }

  return {
    createMcStudio: createMcStudio
  };
});
