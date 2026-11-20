(function (root, factory) {
  if (typeof module === 'object' && module.exports) {
    module.exports = factory(require('./icons.js'));
  } else {
    root.ObsSocialConfig = factory(root.ObsSocialIcons);
  }
})(typeof globalThis !== 'undefined' ? globalThis : this, function (Icons) {
  'use strict';

  var STORAGE_KEY = 'obs_social_vidget_config_v1';
  var CHANNEL_NAME = 'obs_social_vidget_channel_v1';

  var THEMES = [
    'glass-neon',
    'cyber-pill',
    'minimal-clean',
    'liquid-gradient',
    'streamer-pro',
    'retro-pop',
    'compact-strip',
    'cyber-hud',
    'frosted-light',
    'holo-border',
    'oled-neon',
    'arcade-pixel',
    'broadcast-bar',
    'pure-text'
  ];

  var LAYOUTS = [
    'card',
    'pill',
    'split',
    'vertical',
    'chamfer',
    'ribbon',
    'floating-badge',
    'ticker',
    'showcase',
    'skew'
  ];
  var FONTS = [
    'modern',
    'geometric',
    'rubik',
    'display',
    'russo',
    'tektur',
    'unbounded',
    'rounded',
    'mono',
    'pixel',
    'play',
    'caveat',
    'serif',
    'custom'
  ];

  var FONT_PRESETS = [
    {
      id: 'modern',
      labelRu: 'Inter / Segoe UI (Современный)',
      labelEn: 'Inter / Segoe UI (Modern)',
      stack: "'Inter', 'Segoe UI', system-ui, -apple-system, sans-serif",
      googleFamily: 'Inter:wght@400;500;600;700;800;900'
    },
    {
      id: 'geometric',
      labelRu: 'Montserrat (Геометричный)',
      labelEn: 'Montserrat (Geometric)',
      stack: "'Montserrat', 'Bahnschrift', 'Avenir Next', 'Segoe UI', sans-serif",
      googleFamily: 'Montserrat:ital,wght@0,400..900;1,400..900'
    },
    {
      id: 'rubik',
      labelRu: 'Rubik (Стримерский мягкий)',
      labelEn: 'Rubik (Smooth Streamer)',
      stack: "'Rubik', 'Segoe UI', system-ui, sans-serif",
      googleFamily: 'Rubik:ital,wght@0,400..900;1,400..900'
    },
    {
      id: 'display',
      labelRu: 'Oswald (Узкий киберспорт)',
      labelEn: 'Oswald (Condensed Esports)',
      stack: "'Oswald', 'Bahnschrift Condensed', 'Arial Narrow', sans-serif",
      googleFamily: 'Oswald:wght@400;500;600;700'
    },
    {
      id: 'russo',
      labelRu: 'Russo One (Мощный заголовок)',
      labelEn: 'Russo One (Bold Impact)',
      stack: "'Russo One', 'Impact', 'Arial Black', sans-serif",
      googleFamily: 'Russo+One'
    },
    {
      id: 'tektur',
      labelRu: 'Tektur (Киберпанк / Sci-Fi)',
      labelEn: 'Tektur (Cyberpunk / Sci-Fi)',
      stack: "'Tektur', 'Bahnschrift', 'Segoe UI', sans-serif",
      googleFamily: 'Tektur:wght@400..900'
    },
    {
      id: 'unbounded',
      labelRu: 'Unbounded (Футуристичный)',
      labelEn: 'Unbounded (Futuristic Wide)',
      stack: "'Unbounded', 'Montserrat', sans-serif",
      googleFamily: 'Unbounded:wght@400..900'
    },
    {
      id: 'rounded',
      labelRu: 'Nunito (Округлый уютный)',
      labelEn: 'Nunito (Rounded Cozy)',
      stack: "'Nunito', 'Comfortaa', 'SF Pro Rounded', 'Trebuchet MS', sans-serif",
      googleFamily: 'Nunito:ital,wght@0,400..900;1,400..900'
    },
    {
      id: 'mono',
      labelRu: 'JetBrains Mono (Код / Моно)',
      labelEn: 'JetBrains Mono (Code)',
      stack: "'JetBrains Mono', 'Cascadia Code', 'Consolas', monospace",
      googleFamily: 'JetBrains+Mono:ital,wght@0,400..800;1,400..800'
    },
    {
      id: 'pixel',
      labelRu: 'Press Start 2P (8-bit Ретро)',
      labelEn: 'Press Start 2P (8-bit Pixel)',
      stack: "'Press Start 2P', 'Consolas', monospace",
      googleFamily: 'Press+Start+2P'
    },
    {
      id: 'play',
      labelRu: 'Play (Игровой техно)',
      labelEn: 'Play (Gaming Tech)',
      stack: "'Play', 'Segoe UI', sans-serif",
      googleFamily: 'Play:wght@400;700'
    },
    {
      id: 'caveat',
      labelRu: 'Caveat (Рукописный)',
      labelEn: 'Caveat (Handwritten)',
      stack: "'Caveat', 'Segoe Print', cursive",
      googleFamily: 'Caveat:wght@500;700'
    },
    {
      id: 'serif',
      labelRu: 'Playfair Display (Классика)',
      labelEn: 'Playfair Display (Editorial)',
      stack: "'Playfair Display', 'Georgia', serif",
      googleFamily: 'Playfair+Display:ital,wght@0,500..900;1,500..900'
    },
    {
      id: 'custom',
      labelRu: 'Свой шрифт (система / Google Fonts)',
      labelEn: 'Custom Font (System / Google Fonts)',
      stack: "'Inter', 'Segoe UI', system-ui, sans-serif",
      googleFamily: ''
    }
  ];

  var TEXT_TRANSFORMS = ['none', 'uppercase', 'lowercase', 'capitalize'];
  var TEXT_COLOR_MODES = ['accent', 'text', 'custom'];
  var TEXT_SHADOW_MODES = ['none', 'soft', 'strong', 'glow'];
  var ANIM_STYLES = [
    'expand-pill',
    'slide-fade',
    'spring-pop',
    'blur-morph',
    'flip-3d',
    'kinetic-wipe',
    'drop-settle',
    'elastic-swing',
    'glitch-pulse',
    'zoom-focus',
    'icon-pop-reveal',
    'center-split',
    'wave-slide',
    'neon-surge',
    'swing-3d',
    'instant'
  ];
  var DIRECTIONS = ['left', 'right', 'top', 'bottom'];
  var EASINGS = ['spring', 'smooth', 'expo', 'bounce', 'silk'];
  var IDLE_MOTIONS = ['none', 'float', 'pulse-glow', 'tilt', 'spin-slow', 'breathe', 'neon-flicker'];
  var PROGRESS_STYLES = ['none', 'bottom-bar', 'top-line', 'icon-ring', 'side-bar', 'glow-edge'];
  var ANCHORS = [
    'top-left',
    'top-center',
    'top-right',
    'middle-left',
    'center',
    'middle-right',
    'bottom-left',
    'bottom-center',
    'bottom-right'
  ];
  var BACKDROPS = ['transparent', 'checker', 'dark', 'light'];

  var STYLE_PRESETS = {
    'glass-neon': {
      appearance: {
        theme: 'glass-neon',
        layout: 'card',
        fontFamily: 'modern',
        borderRadiusPx: 18,
        bgOpacity: 0.78,
        bgColor: '#0c101b',
        textColor: '#f8fafc',
        blurPx: 16,
        borderWidthPx: 1,
        borderOpacity: 0.25,
        glowIntensity: 0.7,
        shadowIntensity: 0.75,
        showPlatformTitle: true,
        showSubtitle: true,
        showLinkDomain: false,
        showQrGlobal: false,
        iconSizePx: 44
      },
      animation: {
        style: 'expand-pill',
        direction: 'left',
        easing: 'spring',
        idleMotion: 'float',
        shimmerSweep: true,
        progressStyle: 'bottom-bar'
      }
    },
    'cyber-pill': {
      appearance: {
        theme: 'cyber-pill',
        layout: 'pill',
        fontFamily: 'geometric',
        borderRadiusPx: 999,
        bgOpacity: 0.88,
        bgColor: '#090b12',
        textColor: '#ffffff',
        blurPx: 14,
        borderWidthPx: 1.5,
        borderOpacity: 0.45,
        glowIntensity: 0.85,
        shadowIntensity: 0.7,
        showPlatformTitle: false,
        showSubtitle: false,
        showLinkDomain: false,
        showQrGlobal: false,
        iconSizePx: 40
      },
      animation: {
        style: 'spring-pop',
        direction: 'bottom',
        easing: 'spring',
        idleMotion: 'pulse-glow',
        shimmerSweep: true,
        progressStyle: 'icon-ring'
      }
    },
    'minimal-clean': {
      appearance: {
        theme: 'minimal-clean',
        layout: 'card',
        fontFamily: 'modern',
        borderRadiusPx: 14,
        bgOpacity: 0.94,
        bgColor: '#141720',
        textColor: '#f8fafc',
        blurPx: 6,
        borderWidthPx: 1,
        borderOpacity: 0.12,
        glowIntensity: 0.15,
        shadowIntensity: 0.55,
        showPlatformTitle: true,
        showSubtitle: true,
        showLinkDomain: false,
        showQrGlobal: false,
        iconSizePx: 42
      },
      animation: {
        style: 'blur-morph',
        direction: 'bottom',
        easing: 'silk',
        idleMotion: 'none',
        shimmerSweep: false,
        progressStyle: 'top-line'
      }
    },
    'liquid-gradient': {
      appearance: {
        theme: 'liquid-gradient',
        layout: 'card',
        fontFamily: 'rounded',
        borderRadiusPx: 22,
        bgOpacity: 0.88,
        bgColor: '#131627',
        textColor: '#ffffff',
        blurPx: 18,
        borderWidthPx: 1,
        borderOpacity: 0.3,
        glowIntensity: 0.75,
        shadowIntensity: 0.8,
        showPlatformTitle: true,
        showSubtitle: true,
        showLinkDomain: false,
        showQrGlobal: false,
        iconSizePx: 46
      },
      animation: {
        style: 'slide-fade',
        direction: 'left',
        easing: 'expo',
        idleMotion: 'float',
        shimmerSweep: true,
        progressStyle: 'bottom-bar'
      }
    },
    'streamer-pro': {
      appearance: {
        theme: 'streamer-pro',
        layout: 'split',
        fontFamily: 'display',
        borderRadiusPx: 10,
        bgOpacity: 0.92,
        bgColor: '#0b0d14',
        textColor: '#ffffff',
        blurPx: 8,
        borderWidthPx: 2,
        borderOpacity: 0.45,
        glowIntensity: 0.6,
        shadowIntensity: 0.85,
        showPlatformTitle: true,
        showSubtitle: true,
        showLinkDomain: false,
        showQrGlobal: false,
        iconSizePx: 46
      },
      animation: {
        style: 'kinetic-wipe',
        direction: 'left',
        easing: 'expo',
        idleMotion: 'none',
        shimmerSweep: true,
        progressStyle: 'bottom-bar'
      }
    },
    'retro-pop': {
      appearance: {
        theme: 'retro-pop',
        layout: 'card',
        fontFamily: 'mono',
        borderRadiusPx: 8,
        bgOpacity: 0.96,
        bgColor: '#161925',
        textColor: '#ffffff',
        blurPx: 0,
        borderWidthPx: 2.5,
        borderOpacity: 0.9,
        glowIntensity: 0.25,
        shadowIntensity: 0.95,
        showPlatformTitle: true,
        showSubtitle: true,
        showLinkDomain: false,
        showQrGlobal: false,
        iconSizePx: 42
      },
      animation: {
        style: 'drop-settle',
        direction: 'top',
        easing: 'bounce',
        idleMotion: 'tilt',
        shimmerSweep: false,
        progressStyle: 'bottom-bar'
      }
    },
    'compact-qr': {
      appearance: {
        theme: 'glass-neon',
        layout: 'card',
        fontFamily: 'modern',
        borderRadiusPx: 18,
        bgOpacity: 0.84,
        bgColor: '#0c101b',
        textColor: '#f8fafc',
        blurPx: 16,
        borderWidthPx: 1,
        borderOpacity: 0.28,
        glowIntensity: 0.6,
        shadowIntensity: 0.75,
        showPlatformTitle: true,
        showSubtitle: true,
        showLinkDomain: true,
        showQrGlobal: true,
        qrSizePx: 66,
        iconSizePx: 42
      },
      animation: {
        style: 'flip-3d',
        direction: 'left',
        easing: 'smooth',
        idleMotion: 'none',
        shimmerSweep: true,
        progressStyle: 'bottom-bar'
      }
    },
    'cyber-hud': {
      appearance: {
        theme: 'cyber-hud',
        layout: 'chamfer',
        fontFamily: 'tektur',
        borderRadiusPx: 4,
        bgOpacity: 0.88,
        bgColor: '#070b14',
        textColor: '#f1f5f9',
        blurPx: 12,
        borderWidthPx: 1.5,
        borderOpacity: 0.6,
        glowIntensity: 0.85,
        shadowIntensity: 0.8,
        showPlatformTitle: true,
        showSubtitle: true,
        showLinkDomain: false,
        showQrGlobal: false,
        iconSizePx: 44
      },
      typography: {
        fontPreset: 'tektur',
        textShadowMode: 'glow',
        textStrokePx: 0
      },
      animation: {
        style: 'glitch-pulse',
        direction: 'left',
        easing: 'expo',
        idleMotion: 'neon-flicker',
        shimmerSweep: true,
        progressStyle: 'glow-edge'
      }
    },
    'frosted-light': {
      appearance: {
        theme: 'frosted-light',
        layout: 'card',
        fontFamily: 'geometric',
        borderRadiusPx: 20,
        bgOpacity: 0.86,
        bgColor: '#f8fafc',
        textColor: '#0f172a',
        blurPx: 18,
        borderWidthPx: 1,
        borderOpacity: 0.65,
        glowIntensity: 0.25,
        shadowIntensity: 0.55,
        showPlatformTitle: true,
        showSubtitle: true,
        showLinkDomain: false,
        showQrGlobal: false,
        iconSizePx: 44
      },
      typography: {
        fontPreset: 'geometric',
        textShadowMode: 'none',
        textStrokePx: 0,
        subtitleColorMode: 'text'
      },
      animation: {
        style: 'zoom-focus',
        direction: 'bottom',
        easing: 'silk',
        idleMotion: 'breathe',
        shimmerSweep: true,
        progressStyle: 'top-line'
      }
    },
    'holo-prism': {
      appearance: {
        theme: 'holo-border',
        layout: 'floating-badge',
        fontFamily: 'unbounded',
        borderRadiusPx: 18,
        bgOpacity: 0.82,
        bgColor: '#0b0e19',
        textColor: '#ffffff',
        blurPx: 16,
        borderWidthPx: 2,
        borderOpacity: 0.7,
        glowIntensity: 0.9,
        shadowIntensity: 0.8,
        showPlatformTitle: true,
        showSubtitle: true,
        showLinkDomain: false,
        showQrGlobal: false,
        iconSizePx: 46
      },
      typography: {
        fontPreset: 'unbounded',
        textShadowMode: 'soft',
        textStrokePx: 0
      },
      animation: {
        style: 'icon-pop-reveal',
        direction: 'left',
        easing: 'spring',
        idleMotion: 'spin-slow',
        shimmerSweep: true,
        progressStyle: 'glow-edge'
      }
    },
    'oled-glow': {
      appearance: {
        theme: 'oled-neon',
        layout: 'pill',
        fontFamily: 'rubik',
        borderRadiusPx: 999,
        bgOpacity: 0.95,
        bgColor: '#030408',
        textColor: '#ffffff',
        blurPx: 8,
        borderWidthPx: 1.5,
        borderOpacity: 0.75,
        glowIntensity: 1.0,
        shadowIntensity: 0.85,
        showPlatformTitle: false,
        showSubtitle: true,
        showLinkDomain: false,
        showQrGlobal: false,
        iconSizePx: 42
      },
      typography: {
        fontPreset: 'rubik',
        textShadowMode: 'glow',
        textStrokePx: 0
      },
      animation: {
        style: 'neon-surge',
        direction: 'left',
        easing: 'expo',
        idleMotion: 'pulse-glow',
        shimmerSweep: true,
        progressStyle: 'icon-ring'
      }
    },
    'arcade-8bit': {
      appearance: {
        theme: 'arcade-pixel',
        layout: 'card',
        fontFamily: 'pixel',
        borderRadiusPx: 0,
        bgOpacity: 0.96,
        bgColor: '#11131f',
        textColor: '#ffffff',
        blurPx: 0,
        borderWidthPx: 3,
        borderOpacity: 1.0,
        glowIntensity: 0.4,
        shadowIntensity: 0.95,
        showPlatformTitle: true,
        showSubtitle: true,
        showLinkDomain: false,
        showQrGlobal: false,
        iconSizePx: 40
      },
      typography: {
        fontPreset: 'pixel',
        handleSizePx: 14,
        titleSizePx: 9.5,
        subtitleSizePx: 10,
        textShadowMode: 'strong',
        textStrokePx: 0
      },
      animation: {
        style: 'drop-settle',
        direction: 'top',
        easing: 'bounce',
        idleMotion: 'tilt',
        shimmerSweep: false,
        progressStyle: 'bottom-bar'
      }
    },
    'tv-lower-third': {
      appearance: {
        theme: 'broadcast-bar',
        layout: 'ribbon',
        fontFamily: 'display',
        borderRadiusPx: 6,
        bgOpacity: 0.92,
        bgColor: '#0c111d',
        textColor: '#f8fafc',
        blurPx: 8,
        borderWidthPx: 1,
        borderOpacity: 0.35,
        glowIntensity: 0.35,
        shadowIntensity: 0.85,
        showPlatformTitle: true,
        showSubtitle: true,
        showLinkDomain: false,
        showQrGlobal: false,
        iconSizePx: 44
      },
      typography: {
        fontPreset: 'display',
        textShadowMode: 'soft',
        textStrokePx: 0
      },
      animation: {
        style: 'center-split',
        direction: 'left',
        easing: 'expo',
        idleMotion: 'none',
        shimmerSweep: true,
        progressStyle: 'side-bar'
      }
    },
    'ghost-overlay': {
      appearance: {
        theme: 'pure-text',
        layout: 'floating-badge',
        fontFamily: 'russo',
        borderRadiusPx: 16,
        bgOpacity: 0.0,
        bgColor: '#000000',
        textColor: '#ffffff',
        blurPx: 0,
        borderWidthPx: 0,
        borderOpacity: 0.0,
        glowIntensity: 0.85,
        shadowIntensity: 0.0,
        showPlatformTitle: true,
        showSubtitle: true,
        showLinkDomain: false,
        showQrGlobal: false,
        iconSizePx: 48
      },
      typography: {
        fontPreset: 'russo',
        textShadowMode: 'strong',
        textShadowStrength: 0.95,
        textStrokePx: 1.25,
        textStrokeColor: '#000000'
      },
      animation: {
        style: 'wave-slide',
        direction: 'left',
        easing: 'spring',
        idleMotion: 'float',
        shimmerSweep: false,
        progressStyle: 'none'
      }
    },
    'sport-skew': {
      appearance: {
        theme: 'streamer-pro',
        layout: 'skew',
        fontFamily: 'play',
        borderRadiusPx: 8,
        bgOpacity: 0.9,
        bgColor: '#0a0e1a',
        textColor: '#ffffff',
        blurPx: 10,
        borderWidthPx: 1.5,
        borderOpacity: 0.55,
        glowIntensity: 0.7,
        shadowIntensity: 0.85,
        showPlatformTitle: true,
        showSubtitle: true,
        showLinkDomain: false,
        showQrGlobal: false,
        iconSizePx: 44
      },
      typography: {
        fontPreset: 'play',
        textShadowMode: 'strong',
        textStrokePx: 0
      },
      animation: {
        style: 'swing-3d',
        direction: 'left',
        easing: 'expo',
        idleMotion: 'pulse-glow',
        shimmerSweep: true,
        progressStyle: 'bottom-bar'
      }
    },
    'qr-showcase': {
      appearance: {
        theme: 'holo-border',
        layout: 'showcase',
        fontFamily: 'geometric',
        borderRadiusPx: 20,
        bgOpacity: 0.88,
        bgColor: '#0d111e',
        textColor: '#ffffff',
        blurPx: 16,
        borderWidthPx: 1.5,
        borderOpacity: 0.5,
        glowIntensity: 0.8,
        shadowIntensity: 0.85,
        showPlatformTitle: true,
        showSubtitle: true,
        showLinkDomain: true,
        showQrGlobal: true,
        qrSizePx: 84,
        iconSizePx: 48
      },
      typography: {
        fontPreset: 'geometric',
        textShadowMode: 'soft',
        textStrokePx: 0
      },
      animation: {
        style: 'flip-3d',
        direction: 'bottom',
        easing: 'spring',
        idleMotion: 'breathe',
        shimmerSweep: true,
        progressStyle: 'glow-edge'
      }
    }
  };

  function createItemFromPlatform(platformId, overrides) {
    var p = Icons.getPlatform(platformId || 'telegram');
    var base = {
      id: 'item-' + p.id + '-' + Math.random().toString(36).slice(2, 7),
      enabled: true,
      platform: p.id,
      title: p.defaultTitle,
      handle: p.placeholderHandle,
      subtitle: '',
      url: p.placeholderUrl,
      accentColor: p.accentColor,
      secondaryColor: p.secondaryColor,
      iconType: 'preset',
      iconPreset: p.id,
      iconImage: '',
      iconSvg: '',
      iconEmoji: '✨',
      iconColorMode: 'brand',
      customDurationSec: 0,
      showQr: 'inherit'
    };
    if (overrides && typeof overrides === 'object') {
      Object.keys(overrides).forEach(function (k) {
        if (overrides[k] !== undefined) base[k] = overrides[k];
      });
    }
    return base;
  }

  function getDefaultConfig() {
    return {
      schemaVersion: 1,
      lang: 'ru',
      items: [
        createItemFromPlatform('telegram', {
          id: 'default-telegram',
          title: 'Telegram',
          handle: '@my_stream_tg',
          subtitle: 'Анонсы стримов и новости',
          url: 'https://t.me/my_stream_tg'
        }),
        createItemFromPlatform('twitch', {
          id: 'default-twitch',
          title: 'Twitch',
          handle: 'twitch.tv/my_channel',
          subtitle: 'Прямые эфиры каждый день',
          url: 'https://twitch.tv/my_channel'
        }),
        createItemFromPlatform('youtube', {
          id: 'default-youtube',
          title: 'YouTube',
          handle: '@my_youtube',
          subtitle: 'Нарезки, гайды и VODы',
          url: 'https://youtube.com/@my_youtube'
        }),
        createItemFromPlatform('discord', {
          id: 'default-discord',
          title: 'Discord',
          handle: 'discord.gg/community',
          subtitle: 'Заходи пообщаться в чат!',
          url: 'https://discord.gg/community'
        })
      ],
      playback: {
        displayDurationSec: 5.5,
        enterDurationMs: 650,
        exitDurationMs: 480,
        gapDurationMs: 320,
        cyclePauseSec: 0,
        shuffle: false,
        paused: false,
        restartOnObsShow: true,
        pauseWhenObsHidden: true
      },
      animation: {
        style: 'expand-pill',
        direction: 'left',
        easing: 'spring',
        distancePx: 48,
        staggerMs: 65,
        idleMotion: 'float',
        shimmerSweep: true,
        progressStyle: 'bottom-bar'
      },
      appearance: {
        theme: 'glass-neon',
        layout: 'card',
        fontFamily: 'modern',
        scale: 1.0,
        maxWidthPx: 440,
        borderRadiusPx: 18,
        bgOpacity: 0.78,
        bgColor: '#0c101b',
        textColor: '#f8fafc',
        blurPx: 16,
        borderWidthPx: 1,
        borderOpacity: 0.25,
        glowIntensity: 0.7,
        shadowIntensity: 0.75,
        showPlatformTitle: true,
        showSubtitle: true,
        showLinkDomain: false,
        showQrGlobal: false,
        qrSizePx: 64,
        iconSizePx: 44
      },
      typography: {
        fontPreset: 'modern',
        customFontName: '',
        handleSizePx: 19,
        handleWeight: 700,
        handleItalic: false,
        handleTransform: 'none',
        handleLetterSpacingPx: -0.3,
        titleSizePx: 11,
        titleWeight: 700,
        titleItalic: false,
        titleTransform: 'uppercase',
        titleLetterSpacingPx: 1.1,
        titleColorMode: 'accent',
        titleCustomColor: '#38bdf8',
        subtitleSizePx: 12.5,
        subtitleWeight: 500,
        subtitleItalic: false,
        subtitleTransform: 'none',
        subtitleOpacity: 0.78,
        subtitleColorMode: 'text',
        subtitleCustomColor: '#cbd5e1',
        lineGapPx: 2,
        textShadowMode: 'soft',
        textShadowStrength: 0.55,
        textStrokePx: 0,
        textStrokeColor: '#000000'
      },
      position: {
        anchor: 'bottom-left',
        offsetX: 36,
        offsetY: 36
      },
      obs: {
        hideHoverButton: false,
        studioBackdrop: 'checker'
      }
    };
  }

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

  function normalizeItem(raw, idx) {
    var r = raw && typeof raw === 'object' ? raw : {};
    var platform = typeof r.platform === 'string' && r.platform.trim() ? r.platform.trim() : 'link';
    var meta = Icons.getPlatform(platform);
    var iconType = validEnum(r.iconType, ['preset', 'image', 'svg', 'emoji'], 'preset');

    var iconImage = '';
    if (typeof r.iconImage === 'string' && Icons.isSafeImageSrc(r.iconImage)) {
      iconImage = r.iconImage.trim();
    }

    var iconSvg = '';
    if (typeof r.iconSvg === 'string' && r.iconSvg.trim()) {
      iconSvg = Icons.sanitizeSvg(r.iconSvg);
    }

    return {
      id: typeof r.id === 'string' && r.id.trim() ? r.id.trim().slice(0, 64) : 'item-' + (idx + 1) + '-' + Date.now(),
      enabled: r.enabled !== false,
      platform: meta.id,
      title: typeof r.title === 'string' ? r.title.slice(0, 80) : meta.defaultTitle,
      handle: typeof r.handle === 'string' ? r.handle.slice(0, 120) : meta.placeholderHandle,
      subtitle: typeof r.subtitle === 'string' ? r.subtitle.slice(0, 140) : '',
      url: typeof r.url === 'string' ? r.url.trim().slice(0, 300) : '',
      accentColor: validHex(r.accentColor, meta.accentColor),
      secondaryColor: validHex(r.secondaryColor, meta.secondaryColor),
      iconType: iconType,
      iconPreset: typeof r.iconPreset === 'string' && r.iconPreset ? r.iconPreset : meta.id,
      iconImage: iconImage,
      iconSvg: iconSvg,
      iconEmoji: typeof r.iconEmoji === 'string' && r.iconEmoji ? r.iconEmoji.slice(0, 8) : '✨',
      iconColorMode: validEnum(r.iconColorMode, ['brand', 'white', 'original'], 'brand'),
      customDurationSec: clamp(r.customDurationSec, 0, 120, 0),
      showQr: validEnum(r.showQr, ['inherit', 'on', 'off'], 'inherit')
    };
  }

  function normalizeConfig(raw) {
    var def = getDefaultConfig();
    if (!raw || typeof raw !== 'object') return def;

    var items;
    if (Array.isArray(raw.items)) {
      items = raw.items.map(normalizeItem);
    } else {
      items = def.items;
    }

    var p = raw.playback && typeof raw.playback === 'object' ? raw.playback : {};
    var a = raw.animation && typeof raw.animation === 'object' ? raw.animation : {};
    var ap = raw.appearance && typeof raw.appearance === 'object' ? raw.appearance : {};
    var ty = raw.typography && typeof raw.typography === 'object' ? raw.typography : {};
    var pos = raw.position && typeof raw.position === 'object' ? raw.position : {};
    var obs = raw.obs && typeof raw.obs === 'object' ? raw.obs : {};

    var fontPreset = validEnum(
      ty.fontPreset || ap.fontFamily,
      FONTS,
      def.typography.fontPreset
    );

    return {
      schemaVersion: 1,
      lang: raw.lang === 'en' ? 'en' : 'ru',
      items: items,
      playback: {
        displayDurationSec: clamp(p.displayDurationSec, 1.5, 60, def.playback.displayDurationSec),
        enterDurationMs: Math.round(clamp(p.enterDurationMs, 0, 2500, def.playback.enterDurationMs)),
        exitDurationMs: Math.round(clamp(p.exitDurationMs, 0, 2500, def.playback.exitDurationMs)),
        gapDurationMs: Math.round(clamp(p.gapDurationMs, 0, 15000, def.playback.gapDurationMs)),
        cyclePauseSec: clamp(p.cyclePauseSec, 0, 600, def.playback.cyclePauseSec),
        shuffle: Boolean(p.shuffle),
        paused: Boolean(p.paused),
        restartOnObsShow: p.restartOnObsShow !== false,
        pauseWhenObsHidden: p.pauseWhenObsHidden !== false
      },
      animation: {
        style: validEnum(a.style, ANIM_STYLES, def.animation.style),
        direction: validEnum(a.direction, DIRECTIONS, def.animation.direction),
        easing: validEnum(a.easing, EASINGS, def.animation.easing),
        distancePx: Math.round(clamp(a.distancePx, 8, 160, def.animation.distancePx)),
        staggerMs: Math.round(clamp(a.staggerMs, 0, 250, def.animation.staggerMs)),
        idleMotion: validEnum(a.idleMotion, IDLE_MOTIONS, def.animation.idleMotion),
        shimmerSweep: a.shimmerSweep !== false,
        progressStyle: validEnum(a.progressStyle, PROGRESS_STYLES, def.animation.progressStyle)
      },
      appearance: {
        theme: validEnum(ap.theme, THEMES, def.appearance.theme),
        layout: validEnum(ap.layout, LAYOUTS, def.appearance.layout),
        fontFamily: fontPreset,
        scale: clamp(ap.scale, 0.5, 2.2, def.appearance.scale),
        maxWidthPx: Math.round(clamp(ap.maxWidthPx, 220, 760, def.appearance.maxWidthPx)),
        borderRadiusPx: Math.round(clamp(ap.borderRadiusPx, 0, 999, def.appearance.borderRadiusPx)),
        bgOpacity: clamp(ap.bgOpacity, 0, 1, def.appearance.bgOpacity),
        bgColor: validHex(ap.bgColor, def.appearance.bgColor),
        textColor: validHex(ap.textColor, def.appearance.textColor),
        blurPx: Math.round(clamp(ap.blurPx, 0, 32, def.appearance.blurPx)),
        borderWidthPx: clamp(ap.borderWidthPx, 0, 6, def.appearance.borderWidthPx),
        borderOpacity: clamp(ap.borderOpacity, 0, 1, def.appearance.borderOpacity),
        glowIntensity: clamp(ap.glowIntensity, 0, 1, def.appearance.glowIntensity),
        shadowIntensity: clamp(ap.shadowIntensity, 0, 1, def.appearance.shadowIntensity),
        showPlatformTitle: ap.showPlatformTitle !== false,
        showSubtitle: ap.showSubtitle !== false,
        showLinkDomain: Boolean(ap.showLinkDomain),
        showQrGlobal: Boolean(ap.showQrGlobal),
        qrSizePx: Math.round(clamp(ap.qrSizePx, 44, 120, def.appearance.qrSizePx)),
        iconSizePx: Math.round(clamp(ap.iconSizePx, 24, 72, def.appearance.iconSizePx))
      },
      typography: {
        fontPreset: fontPreset,
        customFontName: typeof ty.customFontName === 'string' ? ty.customFontName.replace(/["'<>\\;]/g, '').trim().slice(0, 80) : '',
        handleSizePx: clamp(ty.handleSizePx, 11, 38, def.typography.handleSizePx),
        handleWeight: Math.round(clamp(ty.handleWeight, 300, 900, def.typography.handleWeight) / 100) * 100,
        handleItalic: Boolean(ty.handleItalic),
        handleTransform: validEnum(ty.handleTransform, TEXT_TRANSFORMS, def.typography.handleTransform),
        handleLetterSpacingPx: clamp(ty.handleLetterSpacingPx, -2, 10, def.typography.handleLetterSpacingPx),
        titleSizePx: clamp(ty.titleSizePx, 8, 26, def.typography.titleSizePx),
        titleWeight: Math.round(clamp(ty.titleWeight, 300, 900, def.typography.titleWeight) / 100) * 100,
        titleItalic: Boolean(ty.titleItalic),
        titleTransform: validEnum(ty.titleTransform, TEXT_TRANSFORMS, def.typography.titleTransform),
        titleLetterSpacingPx: clamp(ty.titleLetterSpacingPx, -1, 10, def.typography.titleLetterSpacingPx),
        titleColorMode: validEnum(ty.titleColorMode, TEXT_COLOR_MODES, def.typography.titleColorMode),
        titleCustomColor: validHex(ty.titleCustomColor, def.typography.titleCustomColor),
        subtitleSizePx: clamp(ty.subtitleSizePx, 8, 26, def.typography.subtitleSizePx),
        subtitleWeight: Math.round(clamp(ty.subtitleWeight, 300, 900, def.typography.subtitleWeight) / 100) * 100,
        subtitleItalic: Boolean(ty.subtitleItalic),
        subtitleTransform: validEnum(ty.subtitleTransform, TEXT_TRANSFORMS, def.typography.subtitleTransform),
        subtitleOpacity: clamp(ty.subtitleOpacity, 0.25, 1, def.typography.subtitleOpacity),
        subtitleColorMode: validEnum(ty.subtitleColorMode, TEXT_COLOR_MODES, def.typography.subtitleColorMode),
        subtitleCustomColor: validHex(ty.subtitleCustomColor, def.typography.subtitleCustomColor),
        lineGapPx: clamp(ty.lineGapPx, 0, 14, def.typography.lineGapPx),
        textShadowMode: validEnum(ty.textShadowMode, TEXT_SHADOW_MODES, def.typography.textShadowMode),
        textShadowStrength: clamp(ty.textShadowStrength, 0, 1, def.typography.textShadowStrength),
        textStrokePx: clamp(ty.textStrokePx, 0, 3, def.typography.textStrokePx),
        textStrokeColor: validHex(ty.textStrokeColor, def.typography.textStrokeColor)
      },
      position: {
        anchor: validEnum(pos.anchor, ANCHORS, def.position.anchor),
        offsetX: Math.round(clamp(pos.offsetX, 0, 400, def.position.offsetX)),
        offsetY: Math.round(clamp(pos.offsetY, 0, 400, def.position.offsetY))
      },
      obs: {
        hideHoverButton: Boolean(obs.hideHoverButton),
        studioBackdrop: validEnum(obs.studioBackdrop, BACKDROPS, def.obs.studioBackdrop)
      }
    };
  }

  function getFontPreset(id) {
    for (var i = 0; i < FONT_PRESETS.length; i++) {
      if (FONT_PRESETS[i].id === id) return FONT_PRESETS[i];
    }
    return FONT_PRESETS[0];
  }

  function applyStylePreset(config, presetId) {
    var preset = STYLE_PRESETS[presetId];
    if (!preset) return config;
    var def = getDefaultConfig();
    var next = clone(config);
    if (preset.appearance) {
      Object.assign(next.appearance, preset.appearance);
    }
    if (!next.typography) next.typography = clone(def.typography);
    next.typography.handleSizePx = def.typography.handleSizePx;
    next.typography.titleSizePx = def.typography.titleSizePx;
    next.typography.subtitleSizePx = def.typography.subtitleSizePx;
    next.typography.textShadowMode = def.typography.textShadowMode;
    next.typography.textShadowStrength = def.typography.textShadowStrength;
    next.typography.textStrokePx = def.typography.textStrokePx;
    next.typography.subtitleColorMode = def.typography.subtitleColorMode;
    if (preset.appearance && preset.appearance.fontFamily) {
      next.typography.fontPreset = preset.appearance.fontFamily;
    }
    if (preset.typography) {
      Object.assign(next.typography, preset.typography);
    }
    if (preset.animation) {
      Object.assign(next.animation, preset.animation);
    }
    return normalizeConfig(next);
  }

  function resetSection(config, target) {
    var def = getDefaultConfig();
    if (target === 'all') {
      if (config && config.lang) def.lang = config.lang === 'en' ? 'en' : 'ru';
      return def;
    }
    var next = clone(config || def);
    if (target === 'design') {
      var keepFont = next.typography ? next.typography.fontPreset : def.appearance.fontFamily;
      next.appearance = clone(def.appearance);
      next.appearance.fontFamily = keepFont;
    } else if (target === 'typography') {
      next.typography = clone(def.typography);
      next.appearance.fontFamily = def.typography.fontPreset;
      next.appearance.textColor = def.appearance.textColor;
    } else if (target === 'animation') {
      next.animation = clone(def.animation);
      next.playback.displayDurationSec = def.playback.displayDurationSec;
      next.playback.enterDurationMs = def.playback.enterDurationMs;
      next.playback.exitDurationMs = def.playback.exitDurationMs;
      next.playback.gapDurationMs = def.playback.gapDurationMs;
      next.playback.cyclePauseSec = def.playback.cyclePauseSec;
      next.playback.shuffle = def.playback.shuffle;
    } else if (target === 'look') {
      next.appearance = clone(def.appearance);
      next.typography = clone(def.typography);
      next.animation = clone(def.animation);
      next.position = clone(def.position);
      next.playback.displayDurationSec = def.playback.displayDurationSec;
      next.playback.enterDurationMs = def.playback.enterDurationMs;
      next.playback.exitDurationMs = def.playback.exitDurationMs;
      next.playback.gapDurationMs = def.playback.gapDurationMs;
      next.playback.cyclePauseSec = def.playback.cyclePauseSec;
      next.playback.shuffle = def.playback.shuffle;
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
    var clean = normalizeConfig(config);
    var json = JSON.stringify(clean);
    return utf8ToBase64Url(json);
  }

  function decodeConfigFromParam(param) {
    try {
      if (!param || typeof param !== 'string') return null;
      var json = base64UrlToUtf8(param.trim());
      var parsed = JSON.parse(json);
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
    var encoded = encodeConfigToParam(config);
    urlObj.hash = 'cfg=' + encoded;
    return urlObj.toString();
  }

  function extractUrlOverrides(loc) {
    var search = (loc && loc.search) || '';
    var hash = (loc && loc.hash) || '';
    var params = new URLSearchParams(search);
    var cfgParam = params.get('cfg');
    if (!cfgParam && hash) {
      var hashStr = hash.charAt(0) === '#' ? hash.slice(1) : hash;
      if (hashStr.indexOf('cfg=') === 0) {
        cfgParam = hashStr.slice(4);
      } else {
        var hp = new URLSearchParams(hashStr);
        cfgParam = hp.get('cfg');
      }
    }

    var configFromUrl = cfgParam ? decodeConfigFromParam(cfgParam) : null;
    return {
      configFromUrl: configFromUrl,
      dockMode: params.get('dock') === '1' || params.get('mode') === 'dock',
      setupOpen: params.get('setup') === '1' || params.get('config') === '1',
      cleanMode: params.get('clean') === '1',
      themeOverride: params.get('theme'),
      animOverride: params.get('anim'),
      posOverride: params.get('pos')
    };
  }

  function createConfigStore(options) {
    var opts = options || {};
    var listeners = [];
    var channel = null;
    var serverAvailable = false;
    var serverSaveTimer = null;
    var eventSource = null;
    var clientId = 'c-' + Math.random().toString(36).slice(2, 10);
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
      } catch (_err) {
        // Ignore storage quota / restricted file:// storage
      }
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

    function probeAndConnectServer() {
      if (typeof location === 'undefined' || !/^https?:$/i.test(location.protocol)) {
        return Promise.resolve(false);
      }
      if (typeof fetch !== 'function') return Promise.resolve(false);

      var controller = typeof AbortController !== 'undefined' ? new AbortController() : null;
      var timeout = controller
        ? setTimeout(function () {
            controller.abort();
          }, 900)
        : null;

      return fetch('/api/config', {
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
              // Seed server with current local config if server has none yet
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

    function connectSse() {
      if (typeof EventSource === 'undefined' || eventSource) return;
      try {
        eventSource = new EventSource('/api/events');
        eventSource.addEventListener('config-updated', function (ev) {
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

    function saveToServerImmediate(cfg) {
      if (!serverAvailable || typeof fetch !== 'function') return;
      fetch('/api/config', {
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

    function init(urlOverrides) {
      initChannels();
      var ov = urlOverrides || (typeof location !== 'undefined' ? extractUrlOverrides(location) : {});
      var local = readLocalStorage();
      if (ov.configFromUrl) {
        current = ov.configFromUrl;
      } else if (local) {
        current = local;
      } else {
        current = getDefaultConfig();
      }

      if (ov.themeOverride && THEMES.indexOf(ov.themeOverride) !== -1) {
        current.appearance.theme = ov.themeOverride;
      }
      if (ov.animOverride && ANIM_STYLES.indexOf(ov.animOverride) !== -1) {
        current.animation.style = ov.animOverride;
      }
      if (ov.posOverride && ANCHORS.indexOf(ov.posOverride) !== -1) {
        current.position.anchor = ov.posOverride;
      }

      current = normalizeConfig(current);
      writeLocalStorage(current);
      notify('init');

      if (!opts.skipServerProbe && !ov.configFromUrl) {
        probeAndConnectServer().then(function (connected) {
          if (connected) notify('server-status');
        });
      } else if (!opts.skipServerProbe) {
        // Probe only to report availability without overwriting explicit URL config
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
        listeners = listeners.filter(function (f) {
          return f !== fn;
        });
      };
    }

    function isServerAvailable() {
      return serverAvailable;
    }

    function destroy() {
      if (channel) {
        try {
          channel.close();
        } catch (_e) {}
        channel = null;
      }
      if (eventSource) {
        try {
          eventSource.close();
        } catch (_e) {}
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
    THEMES: THEMES,
    LAYOUTS: LAYOUTS,
    FONTS: FONTS,
    FONT_PRESETS: FONT_PRESETS,
    TEXT_TRANSFORMS: TEXT_TRANSFORMS,
    TEXT_COLOR_MODES: TEXT_COLOR_MODES,
    TEXT_SHADOW_MODES: TEXT_SHADOW_MODES,
    ANIM_STYLES: ANIM_STYLES,
    DIRECTIONS: DIRECTIONS,
    EASINGS: EASINGS,
    IDLE_MOTIONS: IDLE_MOTIONS,
    PROGRESS_STYLES: PROGRESS_STYLES,
    ANCHORS: ANCHORS,
    BACKDROPS: BACKDROPS,
    STYLE_PRESETS: STYLE_PRESETS,
    createItemFromPlatform: createItemFromPlatform,
    getDefaultConfig: getDefaultConfig,
    getFontPreset: getFontPreset,
    normalizeItem: normalizeItem,
    normalizeConfig: normalizeConfig,
    applyStylePreset: applyStylePreset,
    resetSection: resetSection,
    encodeConfigToParam: encodeConfigToParam,
    decodeConfigFromParam: decodeConfigFromParam,
    buildShareUrl: buildShareUrl,
    extractUrlOverrides: extractUrlOverrides,
    createConfigStore: createConfigStore
  };
});
