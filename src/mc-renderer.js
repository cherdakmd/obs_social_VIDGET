(function (root, factory) {
  if (typeof module === 'object' && module.exports) {
    module.exports = factory(
      require('./renderer.js'),
      require('./mc-icons.js'),
      require('./qr.js')
    );
  } else {
    root.ObsMcRenderer = factory(
      root.ObsSocialRenderer,
      root.ObsMcIcons,
      root.ObsSocialQR
    );
  }
})(typeof globalThis !== 'undefined' ? globalThis : this, function (BaseRenderer, McIcons, QR) {
  'use strict';

  function escapeHtml(str) {
    return String(str || '')
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;');
  }

  function toStyleItem(config) {
    var sv = (config && config.server) || {};
    return {
      id: 'mc-server',
      accentColor: sv.accentColor || '#22C55E',
      secondaryColor: sv.secondaryColor || sv.accentColor || '#10B981',
      iconColorMode: sv.iconColorMode || 'brand',
      url: sv.url || '',
      showQr: sv.showQr || (config && config.appearance && config.appearance.showQrGlobal) ? 'on' : 'off'
    };
  }

  function shouldShowQr(config) {
    var sv = (config && config.server) || {};
    var ap = (config && config.appearance) || {};
    return Boolean(sv.url && sv.url.trim() && (ap.showQrGlobal || sv.showQr));
  }

  function formatIpParts(config) {
    var sv = (config && config.server) || {};
    var ap = (config && config.appearance) || {};
    var ip = (sv.ip || '').trim() || 'play.myserver.ru';
    var prefix = ap.showIpPrefix && sv.ipPrefix && sv.ipPrefix.trim() ? sv.ipPrefix.trim() : '';
    return { prefix: prefix, ip: ip };
  }

  function formatIpLine(config) {
    var parts = formatIpParts(config);
    return (parts.prefix ? parts.prefix + ' ' : '') + parts.ip;
  }

  function resolveVersionText(config, statusState) {
    var sv = (config && config.server) || {};
    var ls = (config && config.liveStatus) || {};
    if (ls.enabled && ls.syncLiveVersion && statusState && statusState.online && statusState.version) {
      return statusState.version;
    }
    return (sv.version || '').trim();
  }

  function buildStatusBadgeData(config, statusState) {
    var ls = (config && config.liveStatus) || {};
    var lang = (config && config.lang) === 'en' ? 'en' : 'ru';
    if (!ls.enabled || !statusState) {
      return { visible: false, state: 'idle', text: '' };
    }
    if (statusState.loading && statusState.online === undefined) {
      return { visible: true, state: 'loading', text: '...' };
    }
    if (statusState.online) {
      if (ls.showOnlineCount && typeof statusState.playersOnline === 'number') {
        var maxPart = typeof statusState.playersMax === 'number' && statusState.playersMax > 0
          ? '/' + statusState.playersMax
          : '';
        return {
          visible: true,
          state: 'online',
          text: statusState.playersOnline + maxPart
        };
      }
      return {
        visible: true,
        state: 'online',
        text: lang === 'en' ? 'Online' : 'Онлайн'
      };
    }
    if (ls.showOfflineBadge) {
      return {
        visible: true,
        state: 'offline',
        text: lang === 'en' ? 'Offline' : 'Оффлайн'
      };
    }
    return { visible: false, state: 'offline', text: '' };
  }

  function buildStatusBadgeHtml(statusData) {
    if (!statusData || !statusData.visible) return '';
    return (
      '<span class="mc-status-pill is-' + escapeHtml(statusData.state) + '">' +
        '<span class="mc-status-dot"></span>' +
        '<span class="mc-status-text">' + escapeHtml(statusData.text) + '</span>' +
      '</span>'
    );
  }

  function getEffectiveLiveIcon(config, statusState) {
    var sv = (config && config.server) || {};
    var ls = (config && config.liveStatus) || {};
    var liveUrl = statusState && (statusState.iconDataUrl || statusState.favicon);
    if ((sv.iconType === 'live-icon' || (ls.enabled && ls.useLiveIcon)) && liveUrl) {
      return liveUrl;
    }
    return '';
  }

  function getStructuralSignature(config, statusState) {
    var sv = (config && config.server) || {};
    var ap = (config && config.appearance) || {};
    var anim = (config && config.animation) || {};
    var pb = (config && config.playback) || {};
    var compactLine = ap.layout === 'pill' || ap.layout === 'ticker';
    var verText = resolveVersionText(config, statusState);
    var showName = Boolean(ap.showServerName && sv.name && sv.name.trim());
    var showVer = Boolean(ap.showVersionBadge && verText);
    var statusData = buildStatusBadgeData(config, statusState);
    var showDesc = Boolean(ap.showDescription && sv.description && sv.description.trim() && !compactLine);
    var showQr = shouldShowQr(config);
    var liveIcon = getEffectiveLiveIcon(config, statusState);
    var ipParts = formatIpParts(config);

    return [
      ap.layout || 'card',
      pb.displayMode || 'always',
      showName ? '1' : '0',
      showVer ? '1' : '0',
      ipParts.prefix ? 'pfx1' : 'pfx0',
      statusData.visible ? 'st1' : 'st0',
      showDesc ? '1' : '0',
      showQr ? ('qr:' + sv.url) : '0',
      anim.progressStyle || 'bottom-bar',
      sv.iconType,
      sv.iconPreset,
      sv.iconImage,
      sv.iconSvg,
      sv.iconEmoji,
      liveIcon ? 'live-ico' : 'no-live-ico'
    ].join('|');
  }

  function createCardElement(config, statusState, options) {
    var opts = options || {};
    var sv = (config && config.server) || {};
    var ap = (config && config.appearance) || {};
    var anim = (config && config.animation) || {};
    var pb = (config && config.playback) || {};
    var doc = opts.document || document;

    var card = doc.createElement('div');
    card.className = 'social-card mc-card';
    card.setAttribute('data-item-id', 'mc-server');
    card.setAttribute('data-mc-mode', pb.displayMode || 'always');
    BaseRenderer.applyCardStyles(card, toStyleItem(config), config, opts.scaleOverride);

    var compactLine = ap.layout === 'pill' || ap.layout === 'ticker';
    var verText = resolveVersionText(config, statusState);
    var showName = Boolean(ap.showServerName && sv.name && sv.name.trim());
    var showVer = Boolean(ap.showVersionBadge && verText);
    var statusData = buildStatusBadgeData(config, statusState);
    var showTitleRow = showName || showVer || statusData.visible;
    var showDesc = Boolean(ap.showDescription && sv.description && sv.description.trim() && !compactLine);
    var showQr = shouldShowQr(config);
    var ipParts = formatIpParts(config);

    var qrMarkup = '';
    if (showQr && QR && typeof QR.renderSvg === 'function') {
      qrMarkup = QR.renderSvg(sv.url, { fg: '#0f172a', bg: '#ffffff', margin: 2 });
    }

    var ringRadius = 27;
    var ringCirc = (2 * Math.PI * ringRadius).toFixed(2);
    var showRing = pb.displayMode === 'interval' && anim.progressStyle === 'icon-ring';
    var liveIcon = getEffectiveLiveIcon(config, statusState);
    var iconCfg = Object.assign({}, sv);
    if (liveIcon && config.liveStatus && config.liveStatus.useLiveIcon) {
      iconCfg.iconType = 'live-icon';
    }
    var iconHtml = McIcons.renderIconHtml(iconCfg, liveIcon);

    card.innerHTML =
      '<div class="card-surface">' +
        '<div class="card-bg"></div>' +
        '<div class="card-accent-bar"></div>' +
        '<div class="card-shimmer"></div>' +
        '<div class="card-border"></div>' +
        '<div class="card-content">' +
          '<div class="card-icon-wrap">' +
            (showRing
              ? '<svg class="card-icon-ring" viewBox="0 0 60 60" aria-hidden="true">' +
                  '<circle class="card-ring-track" cx="30" cy="30" r="' + ringRadius + '"/>' +
                  '<circle class="card-ring-circle" cx="30" cy="30" r="' + ringRadius + '" stroke-dasharray="' + ringCirc + '" stroke-dashoffset="' + ringCirc + '" data-circumference="' + ringCirc + '"/>' +
                '</svg>'
              : '') +
            '<div class="card-icon-bg"></div>' +
            '<div class="card-icon">' + iconHtml + '</div>' +
          '</div>' +
          '<div class="card-text">' +
            (showTitleRow
              ? '<div class="card-title-row mc-title-row">' +
                  (showName ? '<span class="card-title">' + escapeHtml(sv.name) + '</span>' : '') +
                  (showVer ? '<span class="mc-version-badge">' + escapeHtml(verText) + '</span>' : '') +
                  buildStatusBadgeHtml(statusData) +
                '</div>'
              : '') +
            '<div class="card-handle mc-ip-line mc-ip-row">' +
              (ipParts.prefix ? '<span class="mc-ip-prefix">' + escapeHtml(ipParts.prefix) + '</span>' : '') +
              '<span class="mc-ip-text">' + escapeHtml(ipParts.ip) + '</span>' +
            '</div>' +
            (showDesc ? '<div class="card-subtitle mc-desc-line">' + escapeHtml(sv.description) + '</div>' : '') +
          '</div>' +
          (qrMarkup ? '<div class="card-qr-wrap">' + qrMarkup + '</div>' : '') +
        '</div>' +
        '<div class="card-progress"><div class="card-progress-fill"></div></div>' +
      '</div>';

    return card;
  }

  function updateCardInPlace(cardEl, config, statusState) {
    if (!cardEl || !config) return;
    var sv = config.server || {};
    var pb = config.playback || {};
    cardEl.setAttribute('data-mc-mode', pb.displayMode || 'always');
    BaseRenderer.applyCardStyles(cardEl, toStyleItem(config), config);

    var titleEl = cardEl.querySelector('.card-title');
    if (titleEl) titleEl.textContent = sv.name || '';

    var verEl = cardEl.querySelector('.mc-version-badge');
    if (verEl) verEl.textContent = resolveVersionText(config, statusState);

    var statusData = buildStatusBadgeData(config, statusState);
    var statusEl = cardEl.querySelector('.mc-status-pill');
    if (statusEl && statusData.visible) {
      statusEl.className = 'mc-status-pill is-' + statusData.state;
      var txtEl = statusEl.querySelector('.mc-status-text');
      if (txtEl) txtEl.textContent = statusData.text;
    }

    var ipParts = formatIpParts(config);
    var prefixEl = cardEl.querySelector('.mc-ip-prefix');
    var ipTextEl = cardEl.querySelector('.mc-ip-text');
    if (prefixEl) prefixEl.textContent = ipParts.prefix;
    if (ipTextEl) {
      ipTextEl.textContent = ipParts.ip;
    } else {
      var handleEl = cardEl.querySelector('.mc-ip-line');
      if (handleEl) handleEl.textContent = formatIpLine(config);
    }

    var descEl = cardEl.querySelector('.mc-desc-line');
    if (descEl) descEl.textContent = sv.description || '';
  }

  return {
    applyStagePosition: BaseRenderer.applyStagePosition,
    shouldShowQr: shouldShowQr,
    formatIpParts: formatIpParts,
    formatIpLine: formatIpLine,
    resolveVersionText: resolveVersionText,
    buildStatusBadgeData: buildStatusBadgeData,
    getStructuralSignature: getStructuralSignature,
    createCardElement: createCardElement,
    updateCardInPlace: updateCardInPlace
  };
});
