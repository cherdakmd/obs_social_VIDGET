(function (root, factory) {
  if (typeof module === 'object' && module.exports) {
    module.exports = factory(require('./icons.js'), require('./qr.js'));
  } else {
    root.ObsSocialRenderer = factory(root.ObsSocialIcons, root.ObsSocialQR);
  }
})(typeof globalThis !== 'undefined' ? globalThis : this, function (Icons, QR) {
  'use strict';

  function hexToRgbString(hex, fallback) {
    if (typeof hex !== 'string') return fallback || '14, 17, 26';
    var h = hex.trim().replace('#', '');
    if (h.length === 3) {
      h = h[0] + h[0] + h[1] + h[1] + h[2] + h[2];
    }
    if (!/^[0-9a-fA-F]{6}$/.test(h)) return fallback || '14, 17, 26';
    var r = parseInt(h.slice(0, 2), 16);
    var g = parseInt(h.slice(2, 4), 16);
    var b = parseInt(h.slice(4, 6), 16);
    return r + ', ' + g + ', ' + b;
  }

  function formatShortUrl(url) {
    if (!url || typeof url !== 'string') return '';
    return url
      .trim()
      .replace(/^https?:\/\//i, '')
      .replace(/^mailto:/i, '')
      .replace(/^www\./i, '')
      .replace(/\/+$/, '');
  }

  function escapeHtml(str) {
    return String(str || '')
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;');
  }

  function applyStagePosition(stageEl, config, isMiniPreview, scaleOverride) {
    if (!stageEl) return;
    var ap = (config && config.appearance) || {};
    var scale = typeof scaleOverride === 'number' ? scaleOverride : Number(ap.scale || 1);
    stageEl.style.setProperty('--widget-scale', String(scale));

    if (isMiniPreview) {
      stageEl.setAttribute('data-anchor', 'center');
      stageEl.style.setProperty('--stage-offset-x', '16px');
      stageEl.style.setProperty('--stage-offset-y', '16px');
      return;
    }
    var pos = (config && config.position) || {};
    stageEl.setAttribute('data-anchor', pos.anchor || 'bottom-left');
    stageEl.style.setProperty('--stage-offset-x', (pos.offsetX != null ? pos.offsetX : 36) + 'px');
    stageEl.style.setProperty('--stage-offset-y', (pos.offsetY != null ? pos.offsetY : 36) + 'px');
  }

  function shouldShowQr(item, config) {
    if (!item || !item.url || !item.url.trim()) return false;
    if (item.showQr === 'on') return true;
    if (item.showQr === 'off') return false;
    return Boolean(config && config.appearance && config.appearance.showQrGlobal);
  }

  function applyCardStyles(cardEl, item, config, scaleOverride) {
    if (!cardEl || !item || !config) return;
    var ap = config.appearance || {};
    var anim = config.animation || {};

    cardEl.setAttribute('data-theme', ap.theme || 'glass-neon');
    cardEl.setAttribute('data-layout', ap.layout || 'card');
    cardEl.setAttribute('data-font', ap.fontFamily || 'modern');
    cardEl.setAttribute('data-icon-color', item.iconColorMode || 'brand');
    cardEl.setAttribute('data-progress', anim.progressStyle || 'bottom-bar');

    var scale = typeof scaleOverride === 'number' ? scaleOverride : Number(ap.scale || 1);

    cardEl.style.setProperty('--accent', item.accentColor || '#2AABEE');
    cardEl.style.setProperty('--accent-rgb', hexToRgbString(item.accentColor, '42, 171, 238'));
    cardEl.style.setProperty('--accent2', item.secondaryColor || item.accentColor || '#229ED9');
    cardEl.style.setProperty('--accent2-rgb', hexToRgbString(item.secondaryColor || item.accentColor, '34, 158, 217'));
    cardEl.style.setProperty('--card-bg-rgb', hexToRgbString(ap.bgColor, '12, 16, 27'));
    cardEl.style.setProperty('--card-bg-alpha', String(ap.bgOpacity != null ? ap.bgOpacity : 0.78));
    cardEl.style.setProperty('--card-text', ap.textColor || '#f8fafc');
    cardEl.style.setProperty('--card-radius', (ap.borderRadiusPx != null ? ap.borderRadiusPx : 18) + 'px');
    cardEl.style.setProperty('--card-max-width', (ap.maxWidthPx || 440) + 'px');
    cardEl.style.setProperty('--card-blur', (ap.blurPx != null ? ap.blurPx : 16) + 'px');
    cardEl.style.setProperty('--card-border-w', (ap.borderWidthPx != null ? ap.borderWidthPx : 1) + 'px');
    cardEl.style.setProperty('--card-border-alpha', String(ap.borderOpacity != null ? ap.borderOpacity : 0.25));
    cardEl.style.setProperty('--card-glow', String(ap.glowIntensity != null ? ap.glowIntensity : 0.7));
    cardEl.style.setProperty('--card-shadow', String(ap.shadowIntensity != null ? ap.shadowIntensity : 0.75));
    cardEl.style.setProperty('--icon-size', (ap.iconSizePx || 44) + 'px');
    cardEl.style.setProperty('--qr-size', (ap.qrSizePx || 64) + 'px');
    cardEl.style.setProperty('--widget-scale', String(scale));
  }

  function createCardElement(item, config, options) {
    var opts = options || {};
    var ap = (config && config.appearance) || {};
    var anim = (config && config.animation) || {};
    var doc = opts.document || document;

    var card = doc.createElement('div');
    card.className = 'social-card';
    card.setAttribute('data-item-id', item.id || '');
    applyCardStyles(card, item, config, opts.scaleOverride);

    var showTitle = Boolean(ap.showPlatformTitle && item.title && item.title.trim());
    var showSubtitle = Boolean(ap.showSubtitle && item.subtitle && item.subtitle.trim() && ap.layout !== 'pill');
    var domainText = ap.showLinkDomain ? formatShortUrl(item.url) : '';
    var showDomain = Boolean(domainText && domainText !== (item.handle || '').trim() && ap.layout !== 'pill');
    var showQr = shouldShowQr(item, config);

    var qrMarkup = '';
    if (showQr && QR && typeof QR.renderSvg === 'function') {
      qrMarkup = QR.renderSvg(item.url, { fg: '#0f172a', bg: '#ffffff', margin: 2 });
    }

    var ringRadius = 27;
    var ringCirc = (2 * Math.PI * ringRadius).toFixed(2);
    var showRing = anim.progressStyle === 'icon-ring';

    var iconHtml = Icons.renderIconHtml(item);

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
            (showTitle
              ? '<div class="card-title-row"><span class="card-title">' + escapeHtml(item.title) + '</span></div>'
              : '') +
            '<div class="card-handle">' + escapeHtml(item.handle || item.title || 'Social') + '</div>' +
            (showSubtitle ? '<div class="card-subtitle">' + escapeHtml(item.subtitle) + '</div>' : '') +
            (showDomain ? '<div class="card-domain">' + escapeHtml(domainText) + '</div>' : '') +
          '</div>' +
          (qrMarkup ? '<div class="card-qr-wrap">' + qrMarkup + '</div>' : '') +
        '</div>' +
        '<div class="card-progress"><div class="card-progress-fill"></div></div>' +
      '</div>';

    return card;
  }

  function getStructuralSignature(item, config) {
    var ap = (config && config.appearance) || {};
    var anim = (config && config.animation) || {};
    var showQr = shouldShowQr(item, config);
    var domainText = ap.showLinkDomain ? formatShortUrl(item.url) : '';
    var showDomain = Boolean(domainText && domainText !== (item.handle || '').trim() && ap.layout !== 'pill');
    var showTitle = Boolean(ap.showPlatformTitle && item.title && item.title.trim());
    var showSub = Boolean(ap.showSubtitle && item.subtitle && item.subtitle.trim() && ap.layout !== 'pill');
    return [
      item.id,
      ap.layout || 'card',
      showTitle ? '1' : '0',
      showSub ? '1' : '0',
      showDomain ? '1' : '0',
      showQr ? ('qr:' + item.url) : '0',
      anim.progressStyle || 'bottom-bar',
      item.iconType,
      item.iconPreset,
      item.iconImage,
      item.iconSvg,
      item.iconEmoji
    ].join('|');
  }

  function updateCardInPlace(cardEl, item, config) {
    if (!cardEl || !item || !config) return;
    var ap = config.appearance || {};
    applyCardStyles(cardEl, item, config);

    var titleEl = cardEl.querySelector('.card-title');
    if (titleEl) titleEl.textContent = item.title || '';

    var handleEl = cardEl.querySelector('.card-handle');
    if (handleEl) handleEl.textContent = item.handle || item.title || 'Social';

    var subEl = cardEl.querySelector('.card-subtitle');
    if (subEl) subEl.textContent = item.subtitle || '';

    var domEl = cardEl.querySelector('.card-domain');
    if (domEl && ap.showLinkDomain) domEl.textContent = formatShortUrl(item.url);
  }

  return {
    hexToRgbString: hexToRgbString,
    formatShortUrl: formatShortUrl,
    shouldShowQr: shouldShowQr,
    getStructuralSignature: getStructuralSignature,
    applyStagePosition: applyStagePosition,
    applyCardStyles: applyCardStyles,
    updateCardInPlace: updateCardInPlace,
    createCardElement: createCardElement
  };
});
