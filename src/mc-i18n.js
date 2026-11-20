(function (root, factory) {
  if (typeof module === 'object' && module.exports) {
    module.exports = factory(require('./i18n.js'));
  } else {
    root.ObsMcI18n = factory(root.ObsSocialI18n);
  }
})(typeof globalThis !== 'undefined' ? globalThis : this, function (BaseI18n) {
  'use strict';

  var MC_EXTRA = {
    ru: {
      appTitle: 'OBS Minecraft Widget',
      appSubtitle: 'Плашка сервера в OBS',
      openSettings: 'Настроить сервер',
      dockHintTitle: 'Панель Minecraft-сервера',

      tabServer: 'Сервер',
      displayModeTitle: 'Режим показа на экране',
      displayModeAlways: 'Всегда на экране',
      displayModeInterval: 'По таймеру (интервал)',
      displayModeAlwaysHint: 'Плашка появляется при открытии сцены и остаётся закреплённой на стриме.',
      displayModeIntervalHint: 'Плашка выезжает на заданное время, а затем прячется до следующего показа.',

      serverInfoTitle: 'Данные Minecraft-сервера',
      fieldServerName: 'Название сервера',
      fieldServerNamePlaceholder: 'Например: MyCraft SMP',
      fieldServerIp: 'IP-адрес сервера',
      fieldServerIpPlaceholder: 'play.myserver.ru или 127.0.0.1:25565',
      fieldIpPrefix: 'Подпись перед IP',
      fieldIpPrefixPlaceholder: 'IP:',
      fieldServerVersion: 'Версия Minecraft',
      fieldServerVersionPlaceholder: '1.21.1 / Java + Bedrock',
      fieldServerDesc: 'Краткое описание',
      fieldServerDescPlaceholder: 'Приватное выживание • Ивенты в 19:00',
      fieldEdition: 'Издание (для автопинга)',
      editionJava: 'Java Edition (25565)',
      editionBedrock: 'Bedrock Edition (19132)',
      fieldServerUrl: 'Ссылка (необязательно, для QR-кода)',
      fieldServerUrlPlaceholder: 'https://discord.gg/myserver',
      fieldQrShow: 'Показывать QR-код (если есть ссылка)',

      liveStatusTitle: 'Живой статус и онлайн игроков',
      liveStatusEnableLabel: 'Показывать онлайн и статус сервера',
      liveStatusSourceLabel: 'Способ проверки',
      liveSourceAuto: 'Авто (server.mjs или mcstatus.io)',
      liveSourceServer: 'Через server.mjs (LAN / localhost / прямой TCP)',
      liveSourceMcstatus: 'Публичный API (mcstatus.io)',
      livePollLabel: 'Частота обновления (сек)',
      liveShowCountLabel: 'Показывать число игроков (42/100)',
      liveShowOfflineLabel: 'Показывать бейдж «Оффлайн», если сервер недоступен',
      liveUseIconLabel: 'Подтягивать иконку server-icon.png с сервера',
      liveSyncVersionLabel: 'Подставлять версию из ответа сервера',
      liveCheckNowBtn: 'Проверить сейчас',
      liveCheckingText: 'Проверка...',
      liveResultOnline: 'Онлайн: {online}/{max} · {ver} ({src})',
      liveResultOffline: 'Сервер не отвечает / оффлайн ({src})',
      liveResultError: 'Ошибка адреса или сети',

      iconModeLive: 'Серверная (Live)',
      iconSearchMcPlaceholder: 'Поиск иконки (крипер, меч, изумруд...)',

      showServerNameLabel: 'Показывать название сервера',
      showVersionBadgeLabel: 'Показывать бейдж версии',
      showDescriptionLabel: 'Показывать краткое описание',
      showIpPrefixLabel: 'Показывать подпись перед IP (например, «IP:»)',

      intervalDurationLabel: 'Длительность показа (сек)',
      intervalCooldownLabel: 'Пауза до следующего показа (сек)',
      restartOnObsShowMcLabel: 'Проигрывать анимацию при показе сцены',
      pauseWhenObsHiddenMcLabel: 'Ставить таймер на паузу, пока источник скрыт',

      resetServerBtn: '↺ Сбросить данные сервера',
      resetBannerMcTitle: 'Сбросить настройки виджета по умолчанию?',
      resetLookOnlyMcBtn: 'Только дизайн, шрифт и анимацию',
      resetAllMcBtn: 'Сбросить всё (включая сервер)',
      copyObsMcUrlBtn: 'Скопировать URL виджета',
      copyDockMcUrlBtn: 'Скопировать URL Док-панели',
      obsGuideStep1McBody: 'Добавьте minecraft.html в OBS как «Браузер» (Локальный файл, 1920×1080). Нажмите ПКМ → «Взаимодействовать» и наведите мышь (или нажмите S / двойной клик) — откроются настройки сервера.',
      obsGuideStep2McBody: 'Откройте Док-панели → Пользовательские док-панели браузера и укажите minecraft-dock.html (или minecraft.html?dock=1) для управления сервером прямо из интерфейса OBS.',
      obsGuideStep3McBody: 'При запуске start-obs-widget.bat / ./start-obs-widget.sh откройте http://127.0.0.1:3847/minecraft.html и http://127.0.0.1:3847/minecraft-dock.html — настройки сохраняются в mc-config.json, а локальные серверы Minecraft (127.0.0.1, LAN, Radmin) пингуются напрямую по TCP/UDP!'
    },
    en: {
      appTitle: 'OBS Minecraft Widget',
      appSubtitle: 'Server Overlay for OBS',
      openSettings: 'Configure Server',
      dockHintTitle: 'OBS Minecraft Panel',

      tabServer: 'Server',
      displayModeTitle: 'Display Behavior',
      displayModeAlways: 'Always Visible',
      displayModeInterval: 'Interval Timer',
      displayModeAlwaysHint: 'Stays pinned on stream once the scene becomes visible.',
      displayModeIntervalHint: 'Slides in for a set duration, then hides until the next interval.',

      serverInfoTitle: 'Minecraft Server Info',
      fieldServerName: 'Server Name',
      fieldServerNamePlaceholder: 'e.g. MyCraft SMP',
      fieldServerIp: 'Server IP Address',
      fieldServerIpPlaceholder: 'play.myserver.net or 127.0.0.1:25565',
      fieldIpPrefix: 'IP Prefix',
      fieldIpPrefixPlaceholder: 'IP:',
      fieldServerVersion: 'Minecraft Version',
      fieldServerVersionPlaceholder: '1.21.1 / Java + Bedrock',
      fieldServerDesc: 'Short Description',
      fieldServerDescPlaceholder: 'Survival SMP • Events at 19:00',
      fieldEdition: 'Edition (for live ping)',
      editionJava: 'Java Edition (25565)',
      editionBedrock: 'Bedrock Edition (19132)',
      fieldServerUrl: 'Link URL (optional, for QR code)',
      fieldServerUrlPlaceholder: 'https://discord.gg/myserver',
      fieldQrShow: 'Show QR code (when URL is set)',

      liveStatusTitle: 'Live Status & Player Count',
      liveStatusEnableLabel: 'Enable live server status & player count',
      liveStatusSourceLabel: 'Status source',
      liveSourceAuto: 'Auto (server.mjs or mcstatus.io)',
      liveSourceServer: 'Via server.mjs (LAN / localhost / direct TCP)',
      liveSourceMcstatus: 'Public API (mcstatus.io)',
      livePollLabel: 'Refresh interval (sec)',
      liveShowCountLabel: 'Show player count (42/100)',
      liveShowOfflineLabel: 'Show "Offline" badge if unreachable',
      liveUseIconLabel: 'Use server-icon.png from server response',
      liveSyncVersionLabel: 'Use server version from status response',
      liveCheckNowBtn: 'Test Now',
      liveCheckingText: 'Checking...',
      liveResultOnline: 'Online: {online}/{max} · {ver} ({src})',
      liveResultOffline: 'Unreachable / Offline ({src})',
      liveResultError: 'Invalid address or network error',

      iconModeLive: 'Live Icon',
      iconSearchMcPlaceholder: 'Search icon (creeper, sword, emerald...)',

      showServerNameLabel: 'Show server name',
      showVersionBadgeLabel: 'Show version badge',
      showDescriptionLabel: 'Show short description',
      showIpPrefixLabel: 'Show IP prefix (e.g. "IP:")',

      intervalDurationLabel: 'Visible duration (sec)',
      intervalCooldownLabel: 'Cooldown before next show (sec)',
      restartOnObsShowMcLabel: 'Replay enter animation when scene becomes visible',
      pauseWhenObsHiddenMcLabel: 'Pause interval timer while source is hidden',

      resetServerBtn: '↺ Reset Server Info',
      resetBannerMcTitle: 'Reset widget settings to defaults?',
      resetLookOnlyMcBtn: 'Design, Font & Motion only',
      resetAllMcBtn: 'Reset Everything (incl. Server)',
      copyObsMcUrlBtn: 'Copy Widget URL',
      copyDockMcUrlBtn: 'Copy Dock URL',
      obsGuideStep1McBody: 'Add minecraft.html in OBS as a Local File Browser Source (1920×1080). Right-click → Interact and move your mouse (or press S / double-click) to configure your server overlay.',
      obsGuideStep2McBody: 'Open Docks → Custom Browser Docks in OBS and point it to minecraft-dock.html (or minecraft.html?dock=1) to manage your server overlay right from OBS.',
      obsGuideStep3McBody: 'When running start-obs-widget.bat / ./start-obs-widget.sh, open http://127.0.0.1:3847/minecraft.html and http://127.0.0.1:3847/minecraft-dock.html — config saves to mc-config.json and local/LAN Minecraft servers ping directly over TCP/UDP!'
    }
  };

  var DICT = {
    ru: Object.assign({}, BaseI18n.DICT.ru, MC_EXTRA.ru),
    en: Object.assign({}, BaseI18n.DICT.en, MC_EXTRA.en)
  };

  function getLang(lang) {
    return DICT[lang] ? DICT[lang] : DICT.ru;
  }

  function t(lang, key) {
    var d = getLang(lang);
    return key in d ? d[key] : (DICT.en[key] || key);
  }

  return {
    MC_EXTRA: MC_EXTRA,
    DICT: DICT,
    getLang: getLang,
    t: t
  };
});
