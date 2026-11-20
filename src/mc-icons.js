(function (root, factory) {
  if (typeof module === 'object' && module.exports) {
    module.exports = factory(require('./icons.js'));
  } else {
    root.ObsMcIcons = factory(root.ObsSocialIcons);
  }
})(typeof globalThis !== 'undefined' ? globalThis : this, function (SocialIcons) {
  'use strict';

  var MC_ICONS = [
    {
      id: 'grass-block',
      name: 'Блок травы',
      nameEn: 'Grass Block',
      tags: 'трава земля блок куб майнкрафт grass dirt cube block',
      accentColor: '#22C55E',
      secondaryColor: '#854D0E',
      svg: '<svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M12 2 3 7v10l9 5 9-5V7l-9-5zm0 2.3L18.6 8 12 11.7 5.4 8 12 4.3zM5 9.8l6 3.3v6.5l-6-3.3V9.8zm8 9.8v-6.5l6-3.3v6.5l-6 3.3z"/></svg>'
    },
    {
      id: 'creeper',
      name: 'Крипер',
      nameEn: 'Creeper',
      tags: 'крипер лицо моб зеленый creeper face mob',
      accentColor: '#4ADE80',
      secondaryColor: '#16A34A',
      svg: '<svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M4 3h16a1 1 0 0 1 1 1v16a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1V4a1 1 0 0 1 1-1zm2.5 4v4h4V7h-4zm7 0v4h4V7h-4zM10 11v2H8.5v5.5H11V16h2v2.5h2.5V13H14v-2h-4z"/></svg>'
    },
    {
      id: 'diamond-sword',
      name: 'Алмазный меч',
      nameEn: 'Diamond Sword',
      tags: 'меч алмаз пвп бой оружие sword diamond pvp combat',
      accentColor: '#38BDF8',
      secondaryColor: '#0EA5E9',
      svg: '<svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M20.5 3.5h-4.2L9.2 10.6l-2.1-2.1-1.4 1.4 1.8 1.8L4 15.2l1.4 1.4 3.5-3.5 1.8 1.8 1.4-1.4-2.1-2.1 7.1-7.1V3.5zm-15 14L3 20l1 1 2.5-2.5-1-1z"/></svg>'
    },
    {
      id: 'diamond-pickaxe',
      name: 'Кирка',
      nameEn: 'Pickaxe',
      tags: 'кирка шахта выживание ресурсы pickaxe mining survival',
      accentColor: '#22D3EE',
      secondaryColor: '#0284C7',
      svg: '<svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M14.7 3.2c-2.9-.5-6 .3-8.4 2.3l1.9 1.9c1.5-.9 3.3-1.2 4.9-.9l-9.4 9.4 2.1 2.1 9.4-9.4c.3 1.6 0 3.4-.9 4.9l1.9 1.9c2-2.4 2.8-5.5 2.3-8.4l1.3-1.3-2.1-2.1-1.3 1.3c-.6-.8-1.1-1.3-1.7-1.7z"/></svg>'
    },
    {
      id: 'emerald',
      name: 'Изумруд',
      nameEn: 'Emerald',
      tags: 'изумруд валюта экономика торговля emerald gem economy',
      accentColor: '#10B981',
      secondaryColor: '#059669',
      svg: '<svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M8 2h8l4 5v10l-4 5H8l-4-5V7l4-5zm1.2 3L7 7.8v8.4L9.2 19h5.6l2.2-2.8V7.8L14.8 5H9.2zM10 7.5h4l1.5 2v5l-1.5 2h-4l-1.5-2v-5l1.5-2z"/></svg>'
    },
    {
      id: 'diamond',
      name: 'Алмаз',
      nameEn: 'Diamond',
      tags: 'алмаз кристалл премиум diamond crystal gem',
      accentColor: '#06B6D4',
      secondaryColor: '#3B82F6',
      svg: '<svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M6 3h12l4 6-10 12L2 9l4-6zm1 2-2.5 3.5h4.2L9.8 5H7zm5 0-1.1 3.5h2.2L12 5zm2.2 0 1.1 3.5h4.2L17 5h-2.8zM4.7 10.5 11 18l-2-7.5H4.7zm6 0L12 17.8l1.3-7.3h-2.6zm4.3 0L13 18l6.3-7.5H15z"/></svg>'
    },
    {
      id: 'ender-eye',
      name: 'Око Эндера',
      nameEn: 'Eye of Ender',
      tags: 'эндер око портал энд ender eye pearl end',
      accentColor: '#14B8A6',
      secondaryColor: '#7C3AED',
      svg: '<svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M12 3a9 9 0 1 0 0 18 9 9 0 0 0 0-18zm0 4c3.4 0 6.2 2.1 7.2 5-1 2.9-3.8 5-7.2 5s-6.2-2.1-7.2-5c1-2.9 3.8-5 7.2-5zm0 2a3 3 0 0 0-1 5.8V9.2A3 3 0 0 1 12 9zm1 0v5.8A3 3 0 0 0 13 9z"/></svg>'
    },
    {
      id: 'command-block',
      name: 'Командный блок',
      nameEn: 'Command Block',
      tags: 'командный блок редстоун техно сервер command redstone',
      accentColor: '#F97316',
      secondaryColor: '#EA580C',
      svg: '<svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M4 3h16a1 1 0 0 1 1 1v16a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1V4a1 1 0 0 1 1-1zm2 3v12h12V6H6zm4 2h4v2h2v4h-2v2h-4v-2H8v-4h2V8zm1 3v2h2v-2h-2z"/></svg>'
    },
    {
      id: 'hardcore-heart',
      name: 'Сердце хардкора',
      nameEn: 'Hardcore Heart',
      tags: 'сердце хардкор жизнь хп сердцевин hardcore heart hp',
      accentColor: '#EF4444',
      secondaryColor: '#DC2626',
      svg: '<svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M12 21.35 10.55 20C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.5L12 21.35zm-4.5-15C6 6.35 5 7.35 5 8.85c0 .7.25 1.35.75 2.05L10.5 7c-.8-.4-1.8-.65-3-.65z"/></svg>'
    },
    {
      id: 'crown-smp',
      name: 'Корона SMP',
      nameEn: 'SMP Crown',
      tags: 'корона смп приватный вип клан crown smp private vip',
      accentColor: '#F59E0B',
      secondaryColor: '#D97706',
      svg: '<svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="m3 18 1.5-10L9 12l3-6 3 6 4.5-4L21 18H3zm1 2h16v2H4v-2z"/></svg>'
    },
    {
      id: 'nether-portal',
      name: 'Портал Незера',
      nameEn: 'Nether Portal',
      tags: 'портал незер ад обсидиан nether portal obsidian',
      accentColor: '#A855F7',
      secondaryColor: '#7E22CE',
      svg: '<svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M5 2h14v20H5V2zm3 3v14h8V5H8zm2 2h4v10h-4V7z"/></svg>'
    },
    {
      id: 'nether-star',
      name: 'Звезда Незера',
      nameEn: 'Nether Star',
      tags: 'звезда маяк незер ивент nether star beacon',
      accentColor: '#E879F9',
      secondaryColor: '#A855F7',
      svg: '<svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="m12 2 2.4 6.6L21 11l-6.6 2.4L12 20l-2.4-6.6L3 11l6.6-2.4L12 2z"/></svg>'
    },
    {
      id: 'totem',
      name: 'Тотем',
      nameEn: 'Totem',
      tags: 'тотем золото анархия выживание totem gold anarchy',
      accentColor: '#FACC15',
      secondaryColor: '#CA8A04',
      svg: '<svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M9 3h6v3h3v4h-2v9h-2v2h-4v-2H8v-9H6V6h3V3zm1.5 4.5v2h3v-2h-3z"/></svg>'
    },
    {
      id: 'potion',
      name: 'Зелье',
      nameEn: 'Potion',
      tags: 'зелье алхимия магия рпг potion magic rpg',
      accentColor: '#EC4899',
      secondaryColor: '#DB2777',
      svg: '<svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M9 2h6v2h-1v3.2l4.8 6.4A3.5 3.5 0 0 1 16 19.5H8a3.5 3.5 0 0 1-2.8-5.9L10 7.2V4H9V2zm1.5 9.5L7.8 15a1.5 1.5 0 0 0 1.2 2.5h6a1.5 1.5 0 0 0 1.2-2.5l-2.7-3.5h-3z"/></svg>'
    },
    {
      id: 'torch',
      name: 'Факел',
      nameEn: 'Torch',
      tags: 'факел свет пещера torch light fire',
      accentColor: '#FB923C',
      secondaryColor: '#F59E0B',
      svg: '<svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M12 2c2.2 2 3 4 2 6-.7 1.3-2 1.8-2 1.8s-1.3-.5-2-1.8C9 6 9.8 4 12 2zm-2 9h4l-1 11h-2l-1-11z"/></svg>'
    },
    {
      id: 'chest',
      name: 'Сундук',
      nameEn: 'Chest',
      tags: 'сундук лут кейсы гриф chest loot',
      accentColor: '#D97706',
      secondaryColor: '#B45309',
      svg: '<svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M3 6a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2v4H3V6zm0 6h7v2h4v-2h7v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-6z"/></svg>'
    },
    {
      id: 'shield-pvp',
      name: 'Щит PvP',
      nameEn: 'PvP Shield',
      tags: 'щит защита пвп дуэли арены shield pvp defense',
      accentColor: '#60A5FA',
      secondaryColor: '#2563EB',
      svg: '<svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M12 2 4 5.5v6.2c0 5 3.4 9.6 8 10.8 4.6-1.2 8-5.8 8-10.8V5.5L12 2zm0 3.2 5 2.2v4.3c0 3.5-2.1 6.8-5 7.9-2.9-1.1-5-4.4-5-7.9V7.4l5-2.2z"/></svg>'
    },
    {
      id: 'cube-server',
      name: 'Сервер (Куб)',
      nameEn: 'Server Cube',
      tags: 'сервер айпи хост блок server ip host cube',
      accentColor: '#8B5CF6',
      secondaryColor: '#6366F1',
      svg: '<svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M12 2 3.5 6.8v10.4L12 22l8.5-4.8V6.8L12 2zm0 2.3 6.2 3.5L12 11.3 5.8 7.8 12 4.3zm-6.5 5.2 5.5 3.1v6.6l-5.5-3.1V9.5zm13 0v6.6L13 19.2v-6.6l5.5-3.1z"/></svg>'
    }
  ];

  var ICON_MAP = Object.create(null);
  MC_ICONS.forEach(function (ic) {
    ICON_MAP[ic.id] = ic;
  });

  function getIcon(id) {
    return ICON_MAP[id] || MC_ICONS[0];
  }

  function searchIcons(query) {
    var q = String(query || '').trim().toLowerCase();
    if (!q) return MC_ICONS.slice();
    return MC_ICONS.filter(function (ic) {
      var hay = [ic.id, ic.name, ic.nameEn, ic.tags].join(' ').toLowerCase();
      return hay.indexOf(q) !== -1;
    });
  }

  function sanitizeSvg(raw) {
    if (SocialIcons && typeof SocialIcons.sanitizeSvg === 'function') {
      return SocialIcons.sanitizeSvg(raw);
    }
    return '';
  }

  function isSafeImageSrc(src) {
    if (SocialIcons && typeof SocialIcons.isSafeImageSrc === 'function') {
      return SocialIcons.isSafeImageSrc(src);
    }
    return false;
  }

  function escapeAttr(val) {
    return String(val || '').replace(/"/g, '&quot;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
  }

  function renderIconHtml(serverCfg, liveIconUrl) {
    var s = serverCfg || {};
    var type = s.iconType || 'preset';
    if (type === 'live-icon') {
      if (liveIconUrl && isSafeImageSrc(liveIconUrl)) {
        return '<img class="card-icon-img mc-pixel-img" src="' + escapeAttr(liveIconUrl) + '" alt="Server icon"/>';
      }
      if (s.iconImage && isSafeImageSrc(s.iconImage)) {
        return '<img class="card-icon-img" src="' + escapeAttr(s.iconImage) + '" alt="Server icon"/>';
      }
      type = 'preset';
    }
    if (type === 'image' && s.iconImage && isSafeImageSrc(s.iconImage)) {
      return '<img class="card-icon-img" src="' + escapeAttr(s.iconImage) + '" alt="' + escapeAttr(s.name || 'Server') + '"/>';
    }
    if (type === 'svg' && s.iconSvg) {
      var safe = sanitizeSvg(s.iconSvg);
      if (safe) return safe;
    }
    if (type === 'emoji' && s.iconEmoji) {
      return '<span class="card-icon-emoji">' + String(s.iconEmoji).replace(/[<>&]/g, '') + '</span>';
    }
    return getIcon(s.iconPreset || 'grass-block').svg;
  }

  return {
    MC_ICONS: MC_ICONS,
    getIcon: getIcon,
    searchIcons: searchIcons,
    sanitizeSvg: sanitizeSvg,
    isSafeImageSrc: isSafeImageSrc,
    renderIconHtml: renderIconHtml
  };
});
