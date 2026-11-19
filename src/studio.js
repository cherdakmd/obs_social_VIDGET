(function (root, factory) {
  if (typeof module === 'object' && module.exports) {
    module.exports = factory(
      require('./icons.js'),
      require('./i18n.js'),
      require('./config.js')
    );
  } else {
    root.ObsSocialStudio = factory(
      root.ObsSocialIcons,
      root.ObsSocialI18n,
      root.ObsSocialConfig
    );
  }
})(typeof globalThis !== 'undefined' ? globalThis : this, function (Icons, I18n, Config) {
  'use strict';

  var QUICK_PLATFORMS = ['telegram', 'twitch', 'youtube', 'discord', 'vk', 'kick', 'boosty', 'donationalerts'];

  function escapeHtml(str) {
    return String(str || '')
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;');
  }

  function createStudio(options) {
    var store = options.store;
    var rootEl = options.rootEl;
    var toastEl = options.toastEl;
    var playback = options.playback;
    var isDockMode = Boolean(options.isDockMode);
    var onClose = options.onClose || function () {};
    var getObsInfo = options.getObsInfo || function () { return { connected: false, version: '' }; };

    var activeTab = 'socials';
    var selectedItemId = null;
    var iconSearchQuery = '';
    var toastTimer = null;
    var dragSrcId = null;

    function t(key) {
      var cfg = store.get();
      return I18n.t(cfg.lang, key);
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

    function ensureSelectedItem(cfg) {
      var items = cfg.items || [];
      if (!items.length) {
        selectedItemId = null;
        return null;
      }
      var found = items.find(function (it) {
        return it.id === selectedItemId;
      });
      if (!found) {
        selectedItemId = items[0].id;
        return items[0];
      }
      return found;
    }

    function processImageFile(file, itemId) {
      if (!file) return;
      var type = (file.type || '').toLowerCase();
      var name = (file.name || '').toLowerCase();

      if (type === 'image/svg+xml' || name.endsWith('.svg')) {
        var readerSvg = new FileReader();
        readerSvg.onload = function () {
          var safe = Icons.sanitizeSvg(String(readerSvg.result || ''));
          if (!safe) {
            showToast(t('iconUploadError'));
            return;
          }
          store.update(function (draft) {
            var target = draft.items.find(function (x) { return x.id === itemId; });
            if (target) {
              target.iconType = 'svg';
              target.iconSvg = safe;
            }
          });
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
          store.update(function (draft) {
            var target = draft.items.find(function (x) { return x.id === itemId; });
            if (target) {
              target.iconType = 'image';
              target.iconImage = rawDataUrl;
            }
          });
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
          store.update(function (draft) {
            var target = draft.items.find(function (x) { return x.id === itemId; });
            if (target) {
              target.iconType = 'image';
              target.iconImage = outUrl;
            }
          });
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
            '<div class="studio-logo">SV</div>' +
            '<div class="studio-title-wrap">' +
              '<div class="studio-title">' + escapeHtml(t('appTitle')) + '</div>' +
              '<div class="studio-status"><span class="status-dot ' + statusClass + '"></span><span>' + escapeHtml(statusText) + '</span></div>' +
            '</div>' +
          '</div>' +
          '<div class="studio-header-actions">' +
            '<button class="btn sm" data-action="toggle-lang" title="RU / EN">' + langOther + '</button>' +
            (!isDockMode
              ? '<button class="btn sm success" data-action="close-studio">✓ ' + escapeHtml(t('doneHide')) + '</button>'
              : '') +
          '</div>' +
        '</div>' +
        '<div class="dock-preview-box">' +
          '<div class="dock-preview-bar">' +
            '<span>' + escapeHtml(t('previewStageLabel')) + '</span>' +
            '<div class="toolbar-group" data-dock-backdrops></div>' +
          '</div>' +
          '<div class="dock-preview-stage" id="dock-preview-stage" data-backdrop="' + escapeHtml(cfg.obs.studioBackdrop) + '"></div>' +
        '</div>' +
        '<div class="studio-toolbar">' +
          '<div class="toolbar-group">' +
            '<button class="btn sm" data-action="prev-card" title="' + escapeHtml(t('prev')) + '">⏮</button>' +
            '<button class="btn sm ' + (cfg.playback.paused ? 'primary' : '') + '" data-action="toggle-pause">' +
              (cfg.playback.paused ? '▶ ' + escapeHtml(t('play')) : '⏸ ' + escapeHtml(t('pause'))) +
            '</button>' +
            '<button class="btn sm" data-action="next-card" title="' + escapeHtml(t('next')) + '">⏭</button>' +
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
          '<button class="tab-btn ' + (activeTab === 'socials' ? 'active' : '') + '" data-tab="socials">' + escapeHtml(t('tabSocials')) + '</button>' +
          '<button class="tab-btn ' + (activeTab === 'design' ? 'active' : '') + '" data-tab="design">' + escapeHtml(t('tabDesign')) + '</button>' +
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

      var langBtn = rootEl.querySelector('[data-action="toggle-lang"]');
      if (langBtn) {
        langBtn.addEventListener('click', function () {
          store.update(function (d) {
            d.lang = d.lang === 'ru' ? 'en' : 'ru';
          });
          renderShell();
        });
      }

      var prevBtn = rootEl.querySelector('[data-action="prev-card"]');
      if (prevBtn) prevBtn.addEventListener('click', function () { playback.prev(); });

      var nextBtn = rootEl.querySelector('[data-action="next-card"]');
      if (nextBtn) nextBtn.addEventListener('click', function () { playback.next(); });

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

      if (activeTab === 'socials') renderSocialsTab(bodyEl, cfg);
      else if (activeTab === 'design') renderDesignTab(bodyEl, cfg);
      else if (activeTab === 'motion') renderMotionTab(bodyEl, cfg);
      else renderObsTab(bodyEl, cfg);
    }

    function renderSocialsTab(bodyEl, cfg) {
      var selected = ensureSelectedItem(cfg);
      var currentLiveId = playback.getCurrentItemId();

      var quickChipsHtml = QUICK_PLATFORMS.map(function (pid) {
        var p = Icons.getPlatform(pid);
        return (
          '<button class="quick-chip" data-quick-add="' + pid + '" style="--chip-color:' + p.accentColor + '">' +
            p.svg +
            '<span>' + escapeHtml(p.name) + '</span>' +
          '</button>'
        );
      }).join('');

      var listHtml = cfg.items.length
        ? cfg.items.map(function (item, idx) {
            var isSel = selected && item.id === selected.id;
            var isLive = item.id === currentLiveId;
            return (
              '<div class="social-row ' + (isSel ? 'selected ' : '') + (!item.enabled ? 'disabled ' : '') + '" draggable="true" data-item-id="' + escapeHtml(item.id) + '">' +
                '<span class="drag-handle" title="Drag">⋮⋮</span>' +
                '<div class="social-row-icon" style="color:' + escapeHtml(item.accentColor) + '">' + Icons.renderIconHtml(item) + '</div>' +
                '<div class="social-row-info">' +
                  '<div class="social-row-title">' + escapeHtml(item.handle || item.title) + '</div>' +
                  '<div class="social-row-sub">' + escapeHtml(item.title) + (item.subtitle ? ' · ' + escapeHtml(item.subtitle) : '') + '</div>' +
                '</div>' +
                '<div class="social-row-actions">' +
                  '<button class="mini-icon-btn ' + (isLive ? 'active-live' : '') + '" data-row-act="preview" title="' + escapeHtml(t('previewThisCard')) + '">👁</button>' +
                  '<button class="mini-icon-btn" data-row-act="toggle" title="' + escapeHtml(t('enabledLabel')) + '">' + (item.enabled ? '✓' : '○') + '</button>' +
                  (idx > 0 ? '<button class="mini-icon-btn" data-row-act="up" title="' + escapeHtml(t('moveUp')) + '">↑</button>' : '') +
                  (idx < cfg.items.length - 1 ? '<button class="mini-icon-btn" data-row-act="down" title="' + escapeHtml(t('moveDown')) + '">↓</button>' : '') +
                  '<button class="mini-icon-btn" data-row-act="dup" title="' + escapeHtml(t('duplicateCard')) + '">⧉</button>' +
                  '<button class="mini-icon-btn danger" data-row-act="del" title="' + escapeHtml(t('deleteCard')) + '">✕</button>' +
                '</div>' +
              '</div>'
            );
          }).join('')
        : '<div class="section-hint">' + escapeHtml(t('noSocialsYet')) + '</div>';

      var editorHtml = '';
      if (selected) {
        var iconPlatforms = Icons.searchPlatforms(iconSearchQuery);
        var pickerHtml = iconPlatforms.map(function (p) {
          var isAct = selected.iconType === 'preset' && (selected.iconPreset || selected.platform) === p.id;
          return (
            '<button class="icon-pick-btn ' + (isAct ? 'active' : '') + '" data-pick-icon="' + p.id + '" title="' + escapeHtml(p.name) + '" style="color:' + p.accentColor + '">' +
              p.svg +
            '</button>'
          );
        }).join('');

        editorHtml =
          '<div class="section-box" data-editor-id="' + escapeHtml(selected.id) + '">' +
            '<div class="section-title">' +
              '<span>' + escapeHtml(t('editCardTitle')) + '</span>' +
              '<label class="toggle-row" style="padding:0;font-size:11.5px;text-transform:none;letter-spacing:0;">' +
                '<input type="checkbox" data-edit="enabled"' + (selected.enabled ? ' checked' : '') + '> ' +
                '<span>' + escapeHtml(t('enabledLabel')) + '</span>' +
              '</label>' +
            '</div>' +

            '<div class="row-2">' +
              '<div class="field-group">' +
                '<span class="field-label">' + escapeHtml(t('fieldPlatformTitle')) + '</span>' +
                '<input class="input" type="text" data-edit="title" value="' + escapeHtml(selected.title) + '" placeholder="' + escapeHtml(t('fieldPlatformPlaceholder')) + '">' +
              '</div>' +
              '<div class="field-group">' +
                '<span class="field-label">' + escapeHtml(t('fieldHandle')) + '</span>' +
                '<input class="input" type="text" data-edit="handle" value="' + escapeHtml(selected.handle) + '" placeholder="' + escapeHtml(t('fieldHandlePlaceholder')) + '">' +
              '</div>' +
            '</div>' +

            '<div class="field-group">' +
              '<span class="field-label">' + escapeHtml(t('fieldSubtitle')) + '</span>' +
              '<input class="input" type="text" data-edit="subtitle" value="' + escapeHtml(selected.subtitle) + '" placeholder="' + escapeHtml(t('fieldSubtitlePlaceholder')) + '">' +
            '</div>' +

            '<div class="field-group">' +
              '<span class="field-label">' + escapeHtml(t('fieldUrl')) + '</span>' +
              '<input class="input" type="url" data-edit="url" value="' + escapeHtml(selected.url) + '" placeholder="' + escapeHtml(t('fieldUrlPlaceholder')) + '">' +
            '</div>' +

            '<div class="row-2">' +
              '<div class="field-group">' +
                '<span class="field-label">' + escapeHtml(t('fieldAccentColor')) + '</span>' +
                '<div class="color-row">' +
                  '<input class="color-input" type="color" data-edit="accentColor" value="' + escapeHtml(selected.accentColor) + '">' +
                  '<input class="input" type="text" data-edit="accentColorText" value="' + escapeHtml(selected.accentColor) + '">' +
                '</div>' +
              '</div>' +
              '<div class="field-group">' +
                '<span class="field-label">' + escapeHtml(t('fieldSecondaryColor')) + '</span>' +
                '<div class="color-row">' +
                  '<input class="color-input" type="color" data-edit="secondaryColor" value="' + escapeHtml(selected.secondaryColor) + '">' +
                  '<button class="btn sm" data-action="reset-brand-color" title="' + escapeHtml(t('resetBrandColor')) + '">↺</button>' +
                '</div>' +
              '</div>' +
            '</div>' +

            '<div class="row-2">' +
              '<div class="field-group">' +
                '<span class="field-label">' + escapeHtml(t('fieldCustomDuration')) + '</span>' +
                '<input class="input" type="number" min="0" max="120" step="0.5" data-edit="customDurationSec" value="' + escapeHtml(selected.customDurationSec) + '">' +
              '</div>' +
              '<div class="field-group">' +
                '<span class="field-label">' + escapeHtml(t('fieldQrOverride')) + '</span>' +
                '<select class="select" data-edit="showQr">' +
                  '<option value="inherit"' + (selected.showQr === 'inherit' ? ' selected' : '') + '>' + escapeHtml(t('qrInherit')) + '</option>' +
                  '<option value="on"' + (selected.showQr === 'on' ? ' selected' : '') + '>' + escapeHtml(t('qrOn')) + '</option>' +
                  '<option value="off"' + (selected.showQr === 'off' ? ' selected' : '') + '>' + escapeHtml(t('qrOff')) + '</option>' +
                '</select>' +
              '</div>' +
            '</div>' +

            '<div class="field-group">' +
              '<span class="field-label">' +
                '<span>' + escapeHtml(t('iconSectionTitle')) + '</span>' +
                '<select class="select" data-edit="iconColorMode" style="width:auto;padding:3px 8px;font-size:11px;">' +
                  '<option value="brand"' + (selected.iconColorMode === 'brand' ? ' selected' : '') + '>' + escapeHtml(t('iconColorBrand')) + '</option>' +
                  '<option value="white"' + (selected.iconColorMode === 'white' ? ' selected' : '') + '>' + escapeHtml(t('iconColorWhite')) + '</option>' +
                  '<option value="original"' + (selected.iconColorMode === 'original' ? ' selected' : '') + '>' + escapeHtml(t('iconColorOriginal')) + '</option>' +
                '</select>' +
              '</span>' +
              '<div class="seg-group">' +
                ['preset', 'image', 'svg', 'emoji'].map(function (mode) {
                  var labelKey = mode === 'preset' ? 'iconModePreset' : mode === 'image' ? 'iconModeImage' : mode === 'svg' ? 'iconModeSvg' : 'iconModeEmoji';
                  return '<button class="seg-btn ' + (selected.iconType === mode ? 'active' : '') + '" data-icon-mode="' + mode + '">' + escapeHtml(t(labelKey)) + '</button>';
                }).join('') +
              '</div>' +
            '</div>' +

            (selected.iconType === 'preset'
              ? '<div class="field-group">' +
                  '<input class="input" type="search" data-action="search-icons" value="' + escapeHtml(iconSearchQuery) + '" placeholder="' + escapeHtml(t('iconSearchPlaceholder')) + '">' +
                  '<div class="icon-picker-grid">' + pickerHtml + '</div>' +
                '</div>'
              : '') +

            (selected.iconType === 'image'
              ? '<div class="field-group">' +
                  '<label class="dropzone" id="icon-dropzone">' +
                    '<input type="file" accept="image/png,image/jpeg,image/webp,image/gif,image/svg+xml,.svg" data-action="upload-icon" style="display:none;">' +
                    '<span>' + escapeHtml(t('iconUploadBtn')) + '</span>' +
                  '</label>' +
                  '<span class="field-label">' + escapeHtml(t('iconImageUrlLabel')) + '</span>' +
                  '<input class="input" type="url" data-edit="iconImage" value="' + escapeHtml(selected.iconImage) + '" placeholder="' + escapeHtml(t('iconImageUrlPlaceholder')) + '">' +
                '</div>'
              : '') +

            (selected.iconType === 'svg'
              ? '<div class="field-group">' +
                  '<span class="field-label">' + escapeHtml(t('iconSvgCodeLabel')) + '</span>' +
                  '<textarea class="textarea" data-edit="iconSvg" placeholder="' + escapeHtml(t('iconSvgCodePlaceholder')) + '">' + escapeHtml(selected.iconSvg) + '</textarea>' +
                '</div>'
              : '') +

            (selected.iconType === 'emoji'
              ? '<div class="field-group">' +
                  '<span class="field-label">' + escapeHtml(t('iconEmojiLabel')) + '</span>' +
                  '<input class="input" type="text" data-edit="iconEmoji" value="' + escapeHtml(selected.iconEmoji) + '">' +
                '</div>'
              : '') +
          '</div>';
      }

      bodyEl.innerHTML =
        '<div class="section-box">' +
          '<div class="section-title">' +
            '<span>' + escapeHtml(t('quickAddLabel')) + '</span>' +
            '<button class="btn sm primary" data-action="add-custom">' + escapeHtml(t('addCustomSocial')) + '</button>' +
          '</div>' +
          '<div class="quick-add-grid">' + quickChipsHtml + '</div>' +
        '</div>' +

        '<div class="section-box">' +
          '<div class="section-title">' +
            '<span>' + escapeHtml(t('socialListTitle')) + ' (' + cfg.items.length + ')</span>' +
          '</div>' +
          '<div class="section-hint">' + escapeHtml(t('socialListHint')) + '</div>' +
          '<div class="social-list" id="social-list">' + listHtml + '</div>' +
        '</div>' +
        editorHtml;

      bindSocialsEvents(bodyEl);
    }

    function bindSocialsEvents(bodyEl) {
      bodyEl.querySelectorAll('[data-quick-add]').forEach(function (btn) {
        btn.addEventListener('click', function () {
          var pid = btn.getAttribute('data-quick-add');
          var newItem = Config.createItemFromPlatform(pid);
          store.update(function (d) { d.items.push(newItem); });
          selectedItemId = newItem.id;
          playback.jumpToItem(newItem.id);
          renderBody();
        });
      });

      var addCustomBtn = bodyEl.querySelector('[data-action="add-custom"]');
      if (addCustomBtn) {
        addCustomBtn.addEventListener('click', function () {
          var newItem = Config.createItemFromPlatform('link', {
            title: cfgLangTitle(),
            handle: '@custom_link'
          });
          store.update(function (d) { d.items.push(newItem); });
          selectedItemId = newItem.id;
          playback.jumpToItem(newItem.id);
          renderBody();
        });
      }

      function cfgLangTitle() {
        return store.get().lang === 'ru' ? 'Ссылка' : 'Link';
      }

      bodyEl.querySelectorAll('.social-row').forEach(function (row) {
        var id = row.getAttribute('data-item-id');
        row.addEventListener('click', function (ev) {
          if (ev.target.closest('[data-row-act]')) return;
          selectedItemId = id;
          renderBody();
        });

        row.addEventListener('dragstart', function (ev) {
          dragSrcId = id;
          row.classList.add('dragging');
          if (ev.dataTransfer) {
            ev.dataTransfer.effectAllowed = 'move';
            ev.dataTransfer.setData('text/plain', id);
          }
        });
        row.addEventListener('dragend', function () {
          row.classList.remove('dragging');
          dragSrcId = null;
        });
        row.addEventListener('dragover', function (ev) {
          ev.preventDefault();
        });
        row.addEventListener('drop', function (ev) {
          ev.preventDefault();
          var fromId = dragSrcId || (ev.dataTransfer ? ev.dataTransfer.getData('text/plain') : '');
          if (!fromId || fromId === id) return;
          store.update(function (d) {
            var fromIdx = d.items.findIndex(function (x) { return x.id === fromId; });
            var toIdx = d.items.findIndex(function (x) { return x.id === id; });
            if (fromIdx === -1 || toIdx === -1) return;
            var moved = d.items.splice(fromIdx, 1)[0];
            d.items.splice(toIdx, 0, moved);
          });
          renderBody();
        });

        row.querySelectorAll('[data-row-act]').forEach(function (btn) {
          btn.addEventListener('click', function (ev) {
            ev.stopPropagation();
            var act = btn.getAttribute('data-row-act');
            if (act === 'preview') {
              selectedItemId = id;
              playback.jumpToItem(id);
              renderBody();
              return;
            }
            if (act === 'toggle') {
              store.update(function (d) {
                var it = d.items.find(function (x) { return x.id === id; });
                if (it) it.enabled = !it.enabled;
              });
              renderBody();
              return;
            }
            if (act === 'up' || act === 'down') {
              store.update(function (d) {
                var i = d.items.findIndex(function (x) { return x.id === id; });
                var targetIdx = act === 'up' ? i - 1 : i + 1;
                if (i === -1 || targetIdx < 0 || targetIdx >= d.items.length) return;
                var tmp = d.items[i];
                d.items[i] = d.items[targetIdx];
                d.items[targetIdx] = tmp;
              });
              renderBody();
              return;
            }
            if (act === 'dup') {
              var cloneId = null;
              store.update(function (d) {
                var i = d.items.findIndex(function (x) { return x.id === id; });
                if (i === -1) return;
                var copy = JSON.parse(JSON.stringify(d.items[i]));
                copy.id = 'item-' + Date.now().toString(36) + '-' + Math.random().toString(36).slice(2, 5);
                d.items.splice(i + 1, 0, copy);
                cloneId = copy.id;
              });
              if (cloneId) selectedItemId = cloneId;
              renderBody();
              return;
            }
            if (act === 'del') {
              store.update(function (d) {
                d.items = d.items.filter(function (x) { return x.id !== id; });
              });
              renderBody();
            }
          });
        });
      });

      var editorBox = bodyEl.querySelector('[data-editor-id]');
      if (!editorBox) return;
      var itemId = editorBox.getAttribute('data-editor-id');

      function mutateItem(fn, syncListRow) {
        store.update(function (d) {
          var target = d.items.find(function (x) { return x.id === itemId; });
          if (target) fn(target);
        }, { source: 'studio-input' });

        if (syncListRow) {
          var rows = bodyEl.querySelectorAll('.social-row');
          var listRow = null;
          for (var rIdx = 0; rIdx < rows.length; rIdx++) {
            if (rows[rIdx].getAttribute('data-item-id') === itemId) {
              listRow = rows[rIdx];
              break;
            }
          }
          var updated = store.get().items.find(function (x) { return x.id === itemId; });
          if (listRow && updated) {
            var tEl = listRow.querySelector('.social-row-title');
            var sEl = listRow.querySelector('.social-row-sub');
            var iEl = listRow.querySelector('.social-row-icon');
            if (tEl) tEl.textContent = updated.handle || updated.title;
            if (sEl) sEl.textContent = updated.title + (updated.subtitle ? ' · ' + updated.subtitle : '');
            if (iEl) {
              iEl.style.color = updated.accentColor;
              iEl.innerHTML = Icons.renderIconHtml(updated);
            }
          }
        }
      }

      editorBox.querySelectorAll('[data-edit]').forEach(function (el) {
        var field = el.getAttribute('data-edit');
        var evtName = el.type === 'checkbox' || el.tagName === 'SELECT' ? 'change' : 'input';
        el.addEventListener(evtName, function () {
          if (field === 'enabled') {
            mutateItem(function (it) { it.enabled = el.checked; }, false);
            renderBody();
          } else if (field === 'accentColor') {
            var txtEl = editorBox.querySelector('[data-edit="accentColorText"]');
            if (txtEl) txtEl.value = el.value;
            mutateItem(function (it) { it.accentColor = el.value; }, true);
          } else if (field === 'accentColorText') {
            if (/^#[0-9a-fA-F]{6}$/.test(el.value.trim())) {
              var colEl = editorBox.querySelector('[data-edit="accentColor"]');
              if (colEl) colEl.value = el.value.trim();
              mutateItem(function (it) { it.accentColor = el.value.trim(); }, true);
            }
          } else if (field === 'customDurationSec') {
            mutateItem(function (it) { it.customDurationSec = Number(el.value) || 0; }, false);
          } else if (field === 'iconSvg') {
            mutateItem(function (it) { it.iconSvg = Icons.sanitizeSvg(el.value); }, true);
          } else {
            mutateItem(function (it) { it[field] = el.value; }, true);
          }
        });
      });

      var resetColBtn = editorBox.querySelector('[data-action="reset-brand-color"]');
      if (resetColBtn) {
        resetColBtn.addEventListener('click', function () {
          mutateItem(function (it) {
            var p = Icons.getPlatform(it.iconPreset || it.platform);
            it.accentColor = p.accentColor;
            it.secondaryColor = p.secondaryColor;
          }, true);
          renderBody();
        });
      }

      editorBox.querySelectorAll('[data-icon-mode]').forEach(function (btn) {
        btn.addEventListener('click', function () {
          var mode = btn.getAttribute('data-icon-mode');
          mutateItem(function (it) { it.iconType = mode; }, true);
          renderBody();
        });
      });

      var searchIcons = editorBox.querySelector('[data-action="search-icons"]');
      if (searchIcons) {
        searchIcons.addEventListener('input', function () {
          iconSearchQuery = searchIcons.value;
          var grid = editorBox.querySelector('.icon-picker-grid');
          if (!grid) return;
          var cur = store.get().items.find(function (x) { return x.id === itemId; });
          var matches = Icons.searchPlatforms(iconSearchQuery);
          grid.innerHTML = matches.map(function (p) {
            var isAct = cur && cur.iconType === 'preset' && (cur.iconPreset || cur.platform) === p.id;
            return (
              '<button class="icon-pick-btn ' + (isAct ? 'active' : '') + '" data-pick-icon="' + p.id + '" title="' + escapeHtml(p.name) + '" style="color:' + p.accentColor + '">' +
                p.svg +
              '</button>'
            );
          }).join('');
          bindIconPickButtons();
        });
      }

      function bindIconPickButtons() {
        editorBox.querySelectorAll('[data-pick-icon]').forEach(function (btn) {
          btn.addEventListener('click', function () {
            var pid = btn.getAttribute('data-pick-icon');
            var meta = Icons.getPlatform(pid);
            mutateItem(function (it) {
              it.iconType = 'preset';
              it.iconPreset = pid;
              it.platform = pid;
              it.accentColor = meta.accentColor;
              it.secondaryColor = meta.secondaryColor;
            }, true);
            renderBody();
          });
        });
      }
      bindIconPickButtons();

      var uploadInput = editorBox.querySelector('[data-action="upload-icon"]');
      var dropzone = editorBox.querySelector('#icon-dropzone');
      if (uploadInput) {
        uploadInput.addEventListener('change', function () {
          if (uploadInput.files && uploadInput.files[0]) {
            processImageFile(uploadInput.files[0], itemId);
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
            processImageFile(ev.dataTransfer.files[0], itemId);
          }
        });
      }
    }

    function renderDesignTab(bodyEl, cfg) {
      var ap = cfg.appearance;
      var presets = [
        { id: 'glass-neon', key: 'presetGlassNeon' },
        { id: 'cyber-pill', key: 'presetCyberPill' },
        { id: 'minimal-clean', key: 'presetMinimalClean' },
        { id: 'liquid-gradient', key: 'presetLiquidGradient' },
        { id: 'streamer-pro', key: 'presetStreamerPro' },
        { id: 'retro-pop', key: 'presetRetroPop' },
        { id: 'compact-qr', key: 'presetCompactQr' }
      ];

      bodyEl.innerHTML =
        '<div class="section-box">' +
          '<div class="section-title">' + escapeHtml(t('presetsTitle')) + '</div>' +
          '<div class="preset-grid">' +
            presets.map(function (pr) {
              return '<button class="preset-btn ' + (ap.theme === pr.id ? 'active' : '') + '" data-apply-preset="' + pr.id + '"><span>' + escapeHtml(t(pr.key)) + '</span><span>✦</span></button>';
            }).join('') +
          '</div>' +
        '</div>' +

        '<div class="section-box">' +
          '<div class="field-group">' +
            '<span class="field-label">' + escapeHtml(t('themeLabel')) + '</span>' +
            '<select class="select" data-ap="theme">' +
              presets.map(function (pr) {
                return '<option value="' + pr.id + '"' + (ap.theme === pr.id ? ' selected' : '') + '>' + escapeHtml(t(pr.key)) + '</option>';
              }).join('') +
            '</select>' +
          '</div>' +
          '<div class="row-2">' +
            '<div class="field-group">' +
              '<span class="field-label">' + escapeHtml(t('layoutLabel')) + '</span>' +
              '<select class="select" data-ap="layout">' +
                '<option value="card"' + (ap.layout === 'card' ? ' selected' : '') + '>' + escapeHtml(t('layoutCard')) + '</option>' +
                '<option value="pill"' + (ap.layout === 'pill' ? ' selected' : '') + '>' + escapeHtml(t('layoutPill')) + '</option>' +
                '<option value="split"' + (ap.layout === 'split' ? ' selected' : '') + '>' + escapeHtml(t('layoutSplit')) + '</option>' +
                '<option value="vertical"' + (ap.layout === 'vertical' ? ' selected' : '') + '>' + escapeHtml(t('layoutVertical')) + '</option>' +
              '</select>' +
            '</div>' +
            '<div class="field-group">' +
              '<span class="field-label">' + escapeHtml(t('fontLabel')) + '</span>' +
              '<select class="select" data-ap="fontFamily">' +
                '<option value="modern"' + (ap.fontFamily === 'modern' ? ' selected' : '') + '>' + escapeHtml(t('fontModern')) + '</option>' +
                '<option value="geometric"' + (ap.fontFamily === 'geometric' ? ' selected' : '') + '>' + escapeHtml(t('fontGeometric')) + '</option>' +
                '<option value="display"' + (ap.fontFamily === 'display' ? ' selected' : '') + '>' + escapeHtml(t('fontDisplay')) + '</option>' +
                '<option value="mono"' + (ap.fontFamily === 'mono' ? ' selected' : '') + '>' + escapeHtml(t('fontMono')) + '</option>' +
                '<option value="rounded"' + (ap.fontFamily === 'rounded' ? ' selected' : '') + '>' + escapeHtml(t('fontRounded')) + '</option>' +
              '</select>' +
            '</div>' +
          '</div>' +
        '</div>' +

        '<div class="section-box">' +
          '<div class="section-title">' + escapeHtml(t('togglesDesignTitle')) + '</div>' +
          '<label class="toggle-row"><span>' + escapeHtml(t('showPlatformTitle')) + '</span><input type="checkbox" data-ap="showPlatformTitle"' + (ap.showPlatformTitle ? ' checked' : '') + '></label>' +
          '<label class="toggle-row"><span>' + escapeHtml(t('showSubtitle')) + '</span><input type="checkbox" data-ap="showSubtitle"' + (ap.showSubtitle ? ' checked' : '') + '></label>' +
          '<label class="toggle-row"><span>' + escapeHtml(t('showLinkDomain')) + '</span><input type="checkbox" data-ap="showLinkDomain"' + (ap.showLinkDomain ? ' checked' : '') + '></label>' +
          '<label class="toggle-row"><span>' + escapeHtml(t('showQrGlobal')) + '</span><input type="checkbox" data-ap="showQrGlobal"' + (ap.showQrGlobal ? ' checked' : '') + '></label>' +
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
        '</div>';

      bodyEl.querySelectorAll('[data-apply-preset]').forEach(function (btn) {
        btn.addEventListener('click', function () {
          var pid = btn.getAttribute('data-apply-preset');
          store.update(function (d) {
            return Config.applyStylePreset(d, pid);
          });
          playback.replay();
          renderBody();
        });
      });

      bindSectionInputs(bodyEl, 'ap', 'appearance');
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
              Config.ANIM_STYLES.map(function (st) {
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
          '<label class="toggle-row"><span>' + escapeHtml(t('shuffleLabel')) + '</span><input type="checkbox" data-pb="shuffle"' + (pb.shuffle ? ' checked' : '') + '></label>' +
        '</div>' +

        '<div class="section-box">' +
          '<div class="section-title">' + escapeHtml(t('timingTitle')) + '</div>' +
          renderRange('displayDurationSec', t('displayDurationLabel'), pb.displayDurationSec, 1.5, 30, 0.5, 's', 'pb') +
          renderRange('enterDurationMs', t('enterDurationLabel'), pb.enterDurationMs, 150, 1800, 50, 'ms', 'pb') +
          renderRange('exitDurationMs', t('exitDurationLabel'), pb.exitDurationMs, 150, 1500, 50, 'ms', 'pb') +
          renderRange('gapDurationMs', t('gapDurationLabel'), pb.gapDurationMs, 0, 5000, 50, 'ms', 'pb') +
          renderRange('cyclePauseSec', t('cyclePauseLabel'), pb.cyclePauseSec, 0, 300, 5, 's', 'pb') +
          renderRange('staggerMs', t('staggerLabel'), anim.staggerMs, 0, 200, 5, 'ms', 'anim') +
          renderRange('distancePx', t('distanceLabel'), anim.distancePx, 10, 140, 2, 'px', 'anim') +
        '</div>';

      bodyEl.querySelectorAll('[data-anim-style]').forEach(function (btn) {
        btn.addEventListener('click', function () {
          var st = btn.getAttribute('data-anim-style');
          store.update(function (d) { d.animation.style = st; });
          bodyEl.querySelectorAll('[data-anim-style]').forEach(function (b) {
            b.classList.toggle('active', b === btn);
          });
          playback.replay();
        });
      });

      bindSectionInputs(bodyEl, 'anim', 'animation', true);
      bindSectionInputs(bodyEl, 'pb', 'playback', false);
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
            Config.ANCHORS.map(function (anc) {
              return '<button class="anchor-cell ' + (pos.anchor === anc ? 'active' : '') + '" data-anchor="' + anc + '" title="' + anc + '">' + anchorArrows[anc] + '</button>';
            }).join('') +
          '</div>' +
          renderRange('offsetX', t('offsetXLabel'), pos.offsetX, 0, 300, 2, 'px', 'pos') +
          renderRange('offsetY', t('offsetYLabel'), pos.offsetY, 0, 300, 2, 'px', 'pos') +
        '</div>' +

        '<div class="section-box">' +
          '<div class="section-title">' + escapeHtml(t('obsBehaviorTitle')) + '</div>' +
          '<label class="toggle-row"><span>' + escapeHtml(t('restartOnObsShowLabel')) + '</span><input type="checkbox" data-pb="restartOnObsShow"' + (pb.restartOnObsShow ? ' checked' : '') + '></label>' +
          '<label class="toggle-row"><span>' + escapeHtml(t('pauseWhenObsHiddenLabel')) + '</span><input type="checkbox" data-pb="pauseWhenObsHidden"' + (pb.pauseWhenObsHidden ? ' checked' : '') + '></label>' +
          '<label class="toggle-row"><span>' + escapeHtml(t('hideHoverButtonLabel')) + '</span><input type="checkbox" data-obs="hideHoverButton"' + (obs.hideHoverButton ? ' checked' : '') + '></label>' +
        '</div>' +

        '<div class="section-box">' +
          '<div class="section-title">' + escapeHtml(t('exportTitle')) + '</div>' +
          '<div class="row-2">' +
            '<button class="btn primary" data-action="copy-url">🔗 ' + escapeHtml(t('copyObsUrlBtn')) + '</button>' +
            '<button class="btn" data-action="copy-dock-url">🧩 ' + escapeHtml(t('copyDockUrlBtn')) + '</button>' +
          '</div>' +
          '<div class="row-2">' +
            '<button class="btn" data-action="export-json">⬇ ' + escapeHtml(t('exportJsonBtn')) + '</button>' +
            '<label class="btn" style="cursor:pointer;">⬆ ' + escapeHtml(t('importJsonBtn')) + '<input type="file" accept=".json,application/json" data-action="import-json" style="display:none;"></label>' +
          '</div>' +
          '<button class="btn danger" data-action="reset-defaults">↺ ' + escapeHtml(t('resetDefaultsBtn')) + '</button>' +
        '</div>' +

        '<div class="section-box">' +
          '<div class="section-title">' + escapeHtml(t('obsGuideTitle')) + '</div>' +
          '<div class="guide-card"><strong>' + escapeHtml(t('obsGuideStep1Title')) + '</strong>' + escapeHtml(t('obsGuideStep1Body')) + '</div>' +
          '<div class="guide-card"><strong>' + escapeHtml(t('obsGuideStep2Title')) + '</strong>' + escapeHtml(t('obsGuideStep2Body')) + '</div>' +
          '<div class="guide-card"><strong>' + escapeHtml(t('obsGuideStep3Title')) + '</strong>' + escapeHtml(t('obsGuideStep3Body')) + '</div>' +
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
          var base = location.href.split('#')[0].split('?')[0].replace(/dock\.html$/i, 'index.html');
          var share = Config.buildShareUrl(base, cur, null);
          copyText(share, share.length > 6000);
        });
      }

      var copyDockBtn = bodyEl.querySelector('[data-action="copy-dock-url"]');
      if (copyDockBtn) {
        copyDockBtn.addEventListener('click', function () {
          var base = location.href.split('#')[0].split('?')[0].replace(/dock\.html$/i, 'index.html');
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
          a.download = 'obs-social-widget-config.json';
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
          if (typeof confirm !== 'function' || confirm(t('resetConfirm'))) {
            store.set(Config.getDefaultConfig(), { source: 'reset' });
            selectedItemId = null;
            renderShell();
            playback.replay();
          }
        });
      }
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

          store.update(function (d) {
            if (!d[sectionKey]) d[sectionKey] = {};
            d[sectionKey][key] = val;
          }, { source: 'studio-input' });

          if (replayOnSelectChange && (key === 'direction' || key === 'easing' || key === 'progressStyle')) {
            playback.replay();
          }
          if (key === 'showQrGlobal' || key === 'layout' || key === 'showPlatformTitle' || key === 'showSubtitle' || key === 'showLinkDomain') {
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
    createStudio: createStudio
  };
});
