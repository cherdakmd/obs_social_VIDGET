(function (root, factory) {
  if (typeof module === 'object' && module.exports) {
    module.exports = factory();
  } else {
    root.ObsSocialIcons = factory();
  }
})(typeof globalThis !== 'undefined' ? globalThis : this, function () {
  'use strict';

  var CATEGORIES = [
    { id: 'all', ru: 'Все', en: 'All' },
    { id: 'socials', ru: 'Соцсети', en: 'Socials' },
    { id: 'streaming', ru: 'Стриминг', en: 'Streaming' },
    { id: 'donate', ru: 'Донаты', en: 'Support' },
    { id: 'gaming', ru: 'Игры и Музыка', en: 'Gaming & Music' },
    { id: 'badges', ru: 'Значки', en: 'Badges' }
  ];

  var PLATFORMS = [
    // ======================== SOCIALS & MESSENGERS ========================
    {
      id: 'telegram',
      name: 'Telegram',
      category: 'socials',
      tags: 'телеграм телега тг tg messenger chat channel',
      accentColor: '#2AABEE',
      secondaryColor: '#229ED9',
      defaultTitle: 'Telegram',
      placeholderHandle: '@username',
      placeholderUrl: 'https://t.me/username',
      svg: '<svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M21.94 4.66c.22-1.02-.38-1.42-1.31-1.06L2.88 10.46c-1.21.48-1.2 1.16-.22 1.46l4.54 1.42 10.52-6.64c.5-.31.96-.14.58.19l-8.52 7.69-.31 4.66c.46 0 .66-.21.92-.46l2.21-2.15 4.6 3.39c.85.47 1.45.23 1.66-.78l3.08-14.58z"/></svg>'
    },
    {
      id: 'discord',
      name: 'Discord',
      category: 'socials',
      tags: 'дискорд дс сервер voice community',
      accentColor: '#5865F2',
      secondaryColor: '#4752C4',
      defaultTitle: 'Discord',
      placeholderHandle: 'discord.gg/server',
      placeholderUrl: 'https://discord.gg/server',
      svg: '<svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M20.32 4.37a19.8 19.8 0 0 0-4.89-1.52.07.07 0 0 0-.08.04c-.21.38-.44.87-.61 1.25a18.27 18.27 0 0 0-5.48 0c-.17-.39-.41-.87-.62-1.25a.08.08 0 0 0-.08-.04A19.74 19.74 0 0 0 3.67 4.37a.07.07 0 0 0-.03.03C.53 9.05-.32 13.58.1 18.06a.08.08 0 0 0 .03.05 19.9 19.9 0 0 0 5.99 3.03.08.08 0 0 0 .08-.03c.46-.63.87-1.3 1.23-2a.08.08 0 0 0-.04-.11 13.1 13.1 0 0 1-1.87-.9.08.08 0 0 1-.01-.12c.13-.09.25-.19.37-.29a.07.07 0 0 1 .08-.01c3.93 1.8 8.18 1.8 12.06 0a.07.07 0 0 1 .08.01c.12.1.25.2.37.29a.08.08 0 0 1-.01.13c-.6.35-1.22.65-1.87.89a.08.08 0 0 0-.04.11c.36.7.78 1.37 1.22 2a.08.08 0 0 0 .08.03 19.83 19.83 0 0 0 6-3.03.08.08 0 0 0 .03-.05c.5-5.18-.84-9.67-3.55-13.66a.06.06 0 0 0-.03-.03zM8.02 15.33c-1.18 0-2.16-1.08-2.16-2.42 0-1.33.96-2.42 2.16-2.42 1.21 0 2.18 1.1 2.16 2.42 0 1.34-.96 2.42-2.16 2.42zm7.97 0c-1.18 0-2.16-1.08-2.16-2.42 0-1.33.96-2.42 2.16-2.42 1.21 0 2.18 1.1 2.16 2.42 0 1.34-.95 2.42-2.16 2.42z"/></svg>'
    },
    {
      id: 'vk',
      name: 'VK (ВКонтакте)',
      category: 'socials',
      tags: 'вк вконтакте паблик группа',
      accentColor: '#0077FF',
      secondaryColor: '#0055CC',
      defaultTitle: 'ВКонтакте',
      placeholderHandle: 'vk.com/channel',
      placeholderUrl: 'https://vk.com/channel',
      svg: '<svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M13.16 18.25c-6.88 0-10.8-4.72-10.96-12.56h3.44c.11 5.75 2.65 8.18 4.66 8.68V5.69h3.24v4.95c1.98-.21 4.07-2.47 4.77-4.95h3.24c-.54 3.06-2.81 5.32-4.42 6.26 1.61.75 4.2 2.72 5.19 6.3h-3.57c-.76-2.38-2.66-4.22-5.18-4.47v4.47h-.41z"/></svg>'
    },
    {
      id: 'tiktok',
      name: 'TikTok',
      category: 'socials',
      tags: 'тикток тик ток shorts клипы',
      accentColor: '#FF0050',
      secondaryColor: '#00F2EA',
      defaultTitle: 'TikTok',
      placeholderHandle: '@username',
      placeholderUrl: 'https://tiktok.com/@username',
      svg: '<svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.2 1.74 2.89 2.89 0 0 1 2.31-4.64c.29 0 .58.04.86.13V9.4a6.33 6.33 0 0 0-1-.08A6.34 6.34 0 0 0 5 20.1a6.34 6.34 0 0 0 10.86-4.43v-7a8.16 8.16 0 0 0 4.77 1.52v-3.4a4.85 4.85 0 0 1-1.04-.1z"/></svg>'
    },
    {
      id: 'instagram',
      name: 'Instagram',
      category: 'socials',
      tags: 'инстаграм инста reels photo',
      accentColor: '#E4405F',
      secondaryColor: '#F77737',
      defaultTitle: 'Instagram',
      placeholderHandle: '@username',
      placeholderUrl: 'https://instagram.com/username',
      svg: '<svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M7.8 2h8.4C19.4 2 22 4.6 22 7.8v8.4a5.8 5.8 0 0 1-5.8 5.8H7.8C4.6 22 2 19.4 2 16.2V7.8A5.8 5.8 0 0 1 7.8 2zm-.2 2A3.6 3.6 0 0 0 4 7.6v8.8C4 18.39 5.61 20 7.6 20h8.8a3.6 3.6 0 0 0 3.6-3.6V7.6C20 5.61 18.39 4 16.4 4H7.6zm9.65 1.5a1.25 1.25 0 1 1 0 2.5 1.25 1.25 0 0 1 0-2.5zM12 7a5 5 0 1 1 0 10 5 5 0 0 1 0-10zm0 2a3 3 0 1 0 0 6 3 3 0 0 0 0-6z"/></svg>'
    },
    {
      id: 'x',
      name: 'X (Twitter)',
      category: 'socials',
      tags: 'твиттер twitter x икс',
      accentColor: '#E2E8F0',
      secondaryColor: '#94A3B8',
      defaultTitle: 'X / Twitter',
      placeholderHandle: '@username',
      placeholderUrl: 'https://x.com/username',
      svg: '<svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M18.24 2.25h3.31l-7.23 8.26L22.82 21.75h-6.66l-5.21-6.82-5.97 6.82H1.67l7.73-8.84L1.25 2.25h6.83l4.71 6.23 5.45-6.23zm-1.16 17.52h1.83L7.08 4.13H5.12l11.96 15.64z"/></svg>'
    },
    {
      id: 'threads',
      name: 'Threads',
      category: 'socials',
      tags: 'тредс нити social',
      accentColor: '#F1F5F9',
      secondaryColor: '#94A3B8',
      defaultTitle: 'Threads',
      placeholderHandle: '@username',
      placeholderUrl: 'https://threads.net/@username',
      svg: '<svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M12.19 2C6.96 2 3.3 5.73 3.3 11.98c0 6.26 3.57 10.02 8.95 10.02 3.63 0 6.08-1.44 7.36-3.71l-1.92-1.08c-.97 1.65-2.78 2.66-5.36 2.66-4.05 0-6.75-2.97-6.75-7.88 0-4.92 2.72-7.86 6.65-7.86 4.1 0 6.32 2.47 6.53 6.25-.67-.46-1.56-.73-2.66-.73-.26-2.4-1.5-3.78-3.77-3.78-2.24 0-3.82 1.44-3.82 3.47 0 1.88 1.38 3.21 3.54 3.21 1.47 0 2.64-.55 3.28-1.47.25 1.3.14 2.4-.39 3.09-.46.61-1.26.92-2.42.92v2.05c1.82 0 3.23-.58 4.07-1.69 1.12-1.47 1.24-3.7.72-5.68 1.25.55 1.94 1.54 1.94 2.91 0 1.4-.61 2.27-1.62 2.27h-.55v2.08h.66c2.22 0 3.71-1.74 3.71-4.4 0-4.96-3.51-8.65-8.92-8.65zm-.17 9.6c-1.05 0-1.7-.57-1.7-1.47 0-.96.71-1.57 1.81-1.57 1.14 0 1.81.66 1.86 1.84-.41.77-1.1 1.2-1.97 1.2z"/></svg>'
    },
    {
      id: 'bluesky',
      name: 'Bluesky',
      category: 'socials',
      tags: 'блюскай bsky бабочка',
      accentColor: '#0085FF',
      secondaryColor: '#38BDF8',
      defaultTitle: 'Bluesky',
      placeholderHandle: '@nick.bsky.social',
      placeholderUrl: 'https://bsky.app',
      svg: '<svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M5.2 4.3C7.9 6.3 10.8 10.4 12 12.8c1.2-2.4 4.1-6.5 6.8-8.5 2-1.5 5.2-2.7 5.2 1 0 .7-.4 6-0.7 6.9-.9 3-4 3.8-6.8 3.3 4.8.8 6.1 3.5 3.4 6.2-5 5.1-7.2-1.3-7.8-2.9-.1-.3-.15-.4-.1-.4.05 0 0 .1-.1.4-.6 1.6-2.8 8-7.8 2.9-2.7-2.7-1.4-5.4 3.4-6.2-2.8.5-5.9-.3-6.8-3.3C.4 11.3 0 6 0 5.3c0-3.7 3.2-2.5 5.2-1z"/></svg>'
    },
    {
      id: 'reddit',
      name: 'Reddit',
      category: 'socials',
      tags: 'реддит сабреддит forum community',
      accentColor: '#FF4500',
      secondaryColor: '#EA580C',
      defaultTitle: 'Reddit',
      placeholderHandle: 'r/community',
      placeholderUrl: 'https://reddit.com/r/community',
      svg: '<svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M12 2a10 10 0 1 0 0 20 10 10 0 0 0 0-20zm5.8 11.4c.1.2.1.5.1.7 0 2.5-2.9 4.5-6.5 4.5s-6.5-2-6.5-4.5c0-.3 0-.5.1-.7A1.45 1.45 0 0 1 4.2 12a1.5 1.5 0 0 1 2.5-1.1 7.3 7.3 0 0 1 4.8-1.5l.9-4.1a.4.4 0 0 1 .5-.3l2.9.6a1.1 1.1 0 1 1-.2.8l-2.5-.5-.8 3.5a7.3 7.3 0 0 1 4.7 1.5A1.5 1.5 0 0 1 19.8 12c0 .6-.4 1.2-1 1.4zM9.2 12.6a1.1 1.1 0 1 0 0 2.2 1.1 1.1 0 0 0 0-2.2zm5.6 0a1.1 1.1 0 1 0 0 2.2 1.1 1.1 0 0 0 0-2.2zm-5.1 3.7c.7.7 1.8 1 2.8 1s2.1-.3 2.8-1a.4.4 0 0 0-.6-.5c-.5.5-1.4.8-2.2.8-.8 0-1.7-.3-2.2-.8a.4.4 0 1 0-.6.5z"/></svg>'
    },
    {
      id: 'whatsapp',
      name: 'WhatsApp',
      category: 'socials',
      tags: 'ватсап вацап чат мессенджер',
      accentColor: '#25D366',
      secondaryColor: '#128C7E',
      defaultTitle: 'WhatsApp',
      placeholderHandle: 'Канал WhatsApp',
      placeholderUrl: 'https://whatsapp.com',
      svg: '<svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M12.04 2a9.94 9.94 0 0 0-8.6 14.94L2 22l5.2-1.36A9.94 9.94 0 1 0 12.04 2zm5.8 14.08c-.24.68-1.41 1.3-1.95 1.38-.52.08-1.18.11-1.9-.12-.44-.14-1-.33-1.72-.64-3.03-1.3-5-4.37-5.16-4.57-.15-.2-1.23-1.64-1.23-3.13 0-1.49.78-2.22 1.06-2.52.27-.3.6-.38.8-.38h.58c.19 0 .44-.07.68.52.25.6.85 2.08.92 2.23.08.15.13.33.03.53-.1.2-.15.33-.3.51-.15.18-.31.4-.45.54-.15.15-.3.31-.13.61.18.3.78 1.29 1.68 2.09 1.15 1.03 2.13 1.35 2.43 1.5.3.15.48.13.66-.08.18-.2.76-.88.96-1.18.2-.3.4-.25.68-.15.28.1 1.76.83 2.06.98.3.15.5.22.58.35.07.12.07.73-.17 1.41z"/></svg>'
    },
    {
      id: 'dzen',
      name: 'Дзен',
      category: 'socials',
      tags: 'дзен яндекс блог статьи dzen',
      accentColor: '#F8FAFC',
      secondaryColor: '#94A3B8',
      defaultTitle: 'Дзен',
      placeholderHandle: 'dzen.ru/channel',
      placeholderUrl: 'https://dzen.ru/channel',
      svg: '<svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M12 2c.3 6.2 2.8 9.7 10 10-7.2.3-9.7 3.8-10 10-.3-6.2-2.8-9.7-10-10 7.2-.3 9.7-3.8 10-10z"/></svg>'
    },
    {
      id: 'ok',
      name: 'Одноклассники',
      category: 'socials',
      tags: 'ок одноклассники odnoklassniki',
      accentColor: '#EE8208',
      secondaryColor: '#D97706',
      defaultTitle: 'OK.ru',
      placeholderHandle: 'ok.ru/profile',
      placeholderUrl: 'https://ok.ru',
      svg: '<svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M12 2.5a4.5 4.5 0 1 0 0 9 4.5 4.5 0 0 0 0-9zm0 6.4a1.9 1.9 0 1 1 0-3.8 1.9 1.9 0 0 1 0 3.8zm4.8 4.4c-.7 1-2 1.7-3.4 2l3.1 3.2a1.3 1.3 0 0 1-1.9 1.9L12 17.7l-2.6 2.7a1.3 1.3 0 0 1-1.9-1.9l3.1-3.2c-1.4-.3-2.7-1-3.4-2a1.3 1.3 0 1 1 2.1-1.5c.6.9 1.6 1.3 2.7 1.3s2.1-.4 2.7-1.3a1.3 1.3 0 1 1 2.1 1.5z"/></svg>'
    },
    {
      id: 'facebook',
      name: 'Facebook',
      category: 'socials',
      tags: 'фейсбук fb meta',
      accentColor: '#1877F2',
      secondaryColor: '#0E5FD8',
      defaultTitle: 'Facebook',
      placeholderHandle: 'fb.com/page',
      placeholderUrl: 'https://facebook.com',
      svg: '<svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M14 13.5h2.5l1-4H14v-2c0-1.03 0-2 2-2h1.5V2.14c-.33-.04-1.56-.14-2.86-.14-2.72 0-4.64 1.66-4.64 4.7v2.8H7v4h3V22h4v-8.5z"/></svg>'
    },
    {
      id: 'pinterest',
      name: 'Pinterest',
      category: 'socials',
      tags: 'пинтерест арт доски референсы',
      accentColor: '#E60023',
      secondaryColor: '#BD081C',
      defaultTitle: 'Pinterest',
      placeholderHandle: 'pinterest.com/nick',
      placeholderUrl: 'https://pinterest.com',
      svg: '<svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M12 2a10 10 0 0 0-3.65 19.31c-.05-.79-.1-2 .02-2.86l.74-3.15s-.19-.38-.19-.94c0-.88.51-1.54 1.15-1.54.54 0 .8.41.8.89 0 .54-.35 1.36-.53 2.11-.15.63.32 1.14.94 1.14 1.13 0 2-1.19 2-2.9 0-1.52-1.09-2.58-2.65-2.58-1.8 0-2.86 1.35-2.86 2.75 0 .54.21 1.13.47 1.45.05.06.06.12.04.18l-.18.71c-.03.11-.09.14-.21.08-.8-.37-1.3-1.54-1.3-2.48 0-2.02 1.47-3.87 4.24-3.87 2.22 0 3.95 1.58 3.95 3.7 0 2.21-1.39 3.99-3.33 3.99-.65 0-1.26-.34-1.47-.74l-.4 1.52c-.14.56-.53 1.25-.79 1.68A10 10 0 1 0 12 2z"/></svg>'
    },
    {
      id: 'linkedin',
      name: 'LinkedIn',
      category: 'socials',
      tags: 'линкедин работа карьера',
      accentColor: '#0A66C2',
      secondaryColor: '#004182',
      defaultTitle: 'LinkedIn',
      placeholderHandle: 'in/username',
      placeholderUrl: 'https://linkedin.com',
      svg: '<svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M19 3a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h14zM8.5 18v-7.5H6V18h2.5zM7.25 9.3a1.45 1.45 0 1 0 0-2.9 1.45 1.45 0 0 0 0 2.9zM18 18v-4.2c0-2.24-1.2-3.3-2.8-3.3-1.3 0-1.88.72-2.2 1.22V10.5H10.5V18H13v-4.1c0-1.08.2-2.12 1.54-2.12 1.32 0 1.34 1.23 1.34 2.19V18H18z"/></svg>'
    },
    {
      id: 'snapchat',
      name: 'Snapchat',
      category: 'socials',
      tags: 'снапчат призрак',
      accentColor: '#FFFC00',
      secondaryColor: '#EAB308',
      defaultTitle: 'Snapchat',
      placeholderHandle: '@username',
      placeholderUrl: 'https://snapchat.com',
      svg: '<svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M12 2.5c-3.3 0-5.4 2.2-5.4 5.5 0 .9.2 1.8.2 2.2-.5.2-1.2.1-1.6 0-.4-.1-.8.2-.7.6.1.4.8.7 1.3.9.2.1.4.3.2.7-.7 1.8-2.3 2.9-3.6 3.2-.4.1-.5.6-.1.8 1 .5 2.2.8 2.9 1.2.2.5.3 1.1.8 1.2.6.1 1.4-.2 2.5 0 1 .2 1.9 1.2 3.5 1.2s2.5-1 3.5-1.2c1.1-.2 1.9.1 2.5 0 .5-.1.6-.7.8-1.2.7-.4 1.9-.7 2.9-1.2.4-.2.3-.7-.1-.8-1.3-.3-2.9-1.4-3.6-3.2-.2-.4 0-.6.2-.7.5-.2 1.2-.5 1.3-.9.1-.4-.3-.7-.7-.6-.4.1-1.1.2-1.6 0 0-.4.2-1.3.2-2.2 0-3.3-2.1-5.5-5.4-5.5z"/></svg>'
    },
    {
      id: 'mastodon',
      name: 'Mastodon',
      category: 'socials',
      tags: 'мастодон fediverse',
      accentColor: '#6364FF',
      secondaryColor: '#563ACC',
      defaultTitle: 'Mastodon',
      placeholderHandle: '@nick@mastodon.social',
      placeholderUrl: 'https://mastodon.social',
      svg: '<svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M21.3 13.9c-.3 1.5-2.7 3.2-5.4 3.5-1.4.2-2.8.3-4.3.2-2.4-.1-4.3-.6-4.3-.6 0 .2 0 .5.1.7.3 2.2 2.1 2.3 3.9 2.4 1.8.1 3.3-.4 3.3-.4l.1 1.6s-1.2.7-3.4.8c-1.2.1-2.7 0-4.4-.5-3.8-1-4.4-5-4.5-9.1V8.6c0-4.4 2.9-5.7 2.9-5.7C6.8 2.2 9.4 2 12 2h.1c2.6 0 5.2.2 6.7.9 0 0 2.9 1.3 2.9 5.7 0 0 .1 3.3-.4 5.3zm-3.2-4.6c0-1.1-.3-2-.9-2.6-.6-.6-1.4-.9-2.4-.9-1.1 0-1.9.4-2.5 1.2l-.5.9-.5-.9c-.6-.8-1.4-1.2-2.5-1.2-1 0-1.8.3-2.4.9-.6.6-.9 1.5-.9 2.6v5.2h2.1V9.4c0-1 .4-1.6 1.3-1.6 1 0 1.4.6 1.4 1.8v2.7h2V9.6c0-1.2.4-1.8 1.4-1.8.9 0 1.3.6 1.3 1.6v5.1h2.1V9.3z"/></svg>'
    },
    {
      id: 'viber',
      name: 'Viber',
      category: 'socials',
      tags: 'вайбер мессенджер звонок',
      accentColor: '#7360F2',
      secondaryColor: '#5B46D9',
      defaultTitle: 'Viber',
      placeholderHandle: 'Viber Community',
      placeholderUrl: 'https://viber.com',
      svg: '<svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M12 2C6.5 2 2.5 5.6 2.5 10.6c0 2.7 1.2 5 3.3 6.6v3.7l3.3-1.8c.9.2 1.9.4 2.9.4 5.5 0 9.5-3.6 9.5-8.9S17.5 2 12 2zm4.8 12.1c-.2.6-1.1 1.1-1.6 1.2-.4.1-1 .1-2.8-.6-2.4-1-4-3.4-4.1-3.6-.1-.2-1-1.3-1-2.5s.6-1.8.9-2c.2-.2.5-.3.7-.3h.5c.2 0 .4 0 .5.4.2.5.7 1.7.8 1.8.1.2.1.3 0 .5l-.4.5c-.1.1-.3.3-.1.6.2.3.8 1.3 1.7 2.1 1.2 1 2.1 1.3 2.4 1.5.3.1.5.1.6-.1l.7-.8c.2-.2.4-.2.6-.1.3.1 1.6.8 1.9.9.3.2.5.2.5.4.1.2.1.8-.1 1.3z"/></svg>'
    },
    {
      id: 'messenger',
      name: 'Messenger',
      category: 'socials',
      tags: 'мессенджер чат диалог',
      accentColor: '#0099FF',
      secondaryColor: '#A033FF',
      defaultTitle: 'Messenger',
      placeholderHandle: 'm.me/username',
      placeholderUrl: 'https://m.me',
      svg: '<svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M12 2C6.48 2 2 6.14 2 11.25c0 2.91 1.45 5.5 3.72 7.2V22l3.4-1.87c.91.25 1.88.39 2.88.39 5.52 0 10-4.14 10-9.25S17.52 2 12 2zm1 12.46-2.55-2.72-4.97 2.72 5.47-5.81 2.61 2.72 4.91-2.72-5.47 5.81z"/></svg>'
    },

    // ======================== STREAMING & VIDEO ========================
    {
      id: 'twitch',
      name: 'Twitch',
      category: 'streaming',
      tags: 'твич твитч стрим stream',
      accentColor: '#9146FF',
      secondaryColor: '#6441A5',
      defaultTitle: 'Twitch',
      placeholderHandle: 'twitch.tv/channel',
      placeholderUrl: 'https://twitch.tv/channel',
      svg: '<svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M4.27 2 2 5.93V19.6h4.91V22h2.73l2.45-2.4h3.82L22 13.53V2H4.27zm15.82 10.73-3.27 3.27h-4.91l-2.73 2.73V16H5.09V3.91h15v8.82zM16.27 7.18v4.91h-1.82V7.18h1.82zm-4.91 0v4.91H9.55V7.18h1.81z"/></svg>'
    },
    {
      id: 'youtube',
      name: 'YouTube',
      category: 'streaming',
      tags: 'ютуб ютьюб видео канал вод vod',
      accentColor: '#FF0033',
      secondaryColor: '#CC0022',
      defaultTitle: 'YouTube',
      placeholderHandle: '@channel',
      placeholderUrl: 'https://youtube.com/@channel',
      svg: '<svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M23.15 7.2a3.01 3.01 0 0 0-2.12-2.13C19.16 4.56 12 4.56 12 4.56s-7.16 0-9.03.51A3.01 3.01 0 0 0 .85 7.2C.35 9.08.35 12 .35 12s0 2.92.5 4.8a3.01 3.01 0 0 0 2.12 2.13c1.87.51 9.03.51 9.03.51s7.16 0 9.03-.51a3.01 3.01 0 0 0 2.12-2.13c.5-1.88.5-4.8.5-4.8s0-2.92-.5-4.8zM9.67 15.18V8.82L15.27 12l-5.6 3.18z"/></svg>'
    },
    {
      id: 'youtubeshorts',
      name: 'YouTube Shorts',
      category: 'streaming',
      tags: 'шортс shorts клипы нарезки youtube',
      accentColor: '#FF0033',
      secondaryColor: '#FF4E45',
      defaultTitle: 'Shorts',
      placeholderHandle: '@channel/shorts',
      placeholderUrl: 'https://youtube.com/@channel/shorts',
      svg: '<svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M16.7 2.8a3.9 3.9 0 0 1 2 6.8l-1 .6 1 .5a3.9 3.9 0 0 1-.2 7l-7.9 4.5a3.9 3.9 0 0 1-5.2-1.4 3.9 3.9 0 0 1 1.4-5.3l1-.6-1-.5a3.9 3.9 0 0 1 .2-7l7.9-4.5a3.9 3.9 0 0 1 1.8-.1zM10 9.3v5.4l4.8-2.7L10 9.3z"/></svg>'
    },
    {
      id: 'kick',
      name: 'Kick',
      category: 'streaming',
      tags: 'кик стрим зелёный stream',
      accentColor: '#53FC18',
      secondaryColor: '#22C55E',
      defaultTitle: 'Kick',
      placeholderHandle: 'kick.com/channel',
      placeholderUrl: 'https://kick.com/channel',
      svg: '<svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M3 2h6.5v6h2.2V5h2.2V2H21v6.5h-3v3h-2.5v1H18v3h3V22h-7.1v-3h-2.2v-3H9.5v6H3V2z"/></svg>'
    },
    {
      id: 'vkplay',
      name: 'VK Video Live',
      category: 'streaming',
      tags: 'вк плей лайв вк видео стрим',
      accentColor: '#0077FF',
      secondaryColor: '#4F46E5',
      defaultTitle: 'VK Video Live',
      placeholderHandle: 'live.vkvideo.ru/nick',
      placeholderUrl: 'https://live.vkvideo.ru/nick',
      svg: '<svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M4.5 3.5h15A2.5 2.5 0 0 1 22 6v12a2.5 2.5 0 0 1-2.5 2.5h-15A2.5 2.5 0 0 1 2 18V6a2.5 2.5 0 0 1 2.5-2.5zm5.2 4.7v7.6L16.3 12 9.7 8.2z"/></svg>'
    },
    {
      id: 'trovo',
      name: 'Trovo',
      category: 'streaming',
      tags: 'трово стрим',
      accentColor: '#19D66B',
      secondaryColor: '#059669',
      defaultTitle: 'Trovo',
      placeholderHandle: 'trovo.live/channel',
      placeholderUrl: 'https://trovo.live/channel',
      svg: '<svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M4 5.5h16l-1.5 3.6h-4.7l-3 9.4H6.9l3-9.4H4V5.5zm12.8 5.2a3.8 3.8 0 1 1 0 7.6 3.8 3.8 0 0 1 0-7.6zm0 2.1a1.7 1.7 0 1 0 0 3.4 1.7 1.7 0 0 0 0-3.4z"/></svg>'
    },
    {
      id: 'rutube',
      name: 'Rutube',
      category: 'streaming',
      tags: 'рутуб видео',
      accentColor: '#00A8FF',
      secondaryColor: '#0284C7',
      defaultTitle: 'Rutube',
      placeholderHandle: 'rutube.ru/u/channel',
      placeholderUrl: 'https://rutube.ru/u/channel',
      svg: '<svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M5 4h9.2c3.2 0 5.3 1.9 5.3 4.8 0 2.1-1.1 3.7-2.9 4.4L19.8 20h-4l-2.8-6.1H8.6V20H5V4zm3.6 3v4h5.1c1.3 0 2.1-.7 2.1-2s-.8-2-2.1-2H8.6z"/><circle cx="20.2" cy="5.2" r="2"/></svg>'
    },
    {
      id: 'vimeo',
      name: 'Vimeo',
      category: 'streaming',
      tags: 'вимео видео',
      accentColor: '#1AB7EA',
      secondaryColor: '#0284C7',
      defaultTitle: 'Vimeo',
      placeholderHandle: 'vimeo.com/nick',
      placeholderUrl: 'https://vimeo.com',
      svg: '<svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M22 7.4c-.1 2.2-1.6 5.2-4.5 9-3 3.9-5.5 5.8-7.5 5.8-1.3 0-2.4-1.2-3.2-3.5l-1.7-6.3C4.4 10 3.7 8.9 2.9 8.9c-.2 0-.8.4-1.7 1L0 8.5c1-.9 2.1-1.9 3.1-2.8 1.4-1.2 2.4-1.8 3.2-1.9 1.7-.2 2.7 1 3.1 3.5.4 2.7.7 4.4.9 5 .5 2.3 1 3.4 1.6 3.4.5 0 1.2-.8 2.2-2.3 1-1.5 1.5-2.7 1.6-3.5.1-1.4-.4-2.1-1.6-2.1-.6 0-1.2.1-1.8.4 1.2-3.9 3.5-5.8 6.8-5.7 2.5.1 3.7 1.7 3.6 4.9z"/></svg>'
    },
    {
      id: 'bilibili',
      name: 'Bilibili',
      category: 'streaming',
      tags: 'билибили аниме видео',
      accentColor: '#00A1D6',
      secondaryColor: '#FB7299',
      defaultTitle: 'Bilibili',
      placeholderHandle: 'space.bilibili.com',
      placeholderUrl: 'https://bilibili.com',
      svg: '<svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M7.7 3.2a1 1 0 0 1 1.4 0L11 5.1h2l1.9-1.9a1 1 0 1 1 1.4 1.4L15.4 5.5H19a3 3 0 0 1 3 3v9a3 3 0 0 1-3 3H5a3 3 0 0 1-3-3v-9a3 3 0 0 1 3-3h3.6L7.7 4.6a1 1 0 0 1 0-1.4zM5 7.5a1 1 0 0 0-1 1v9a1 1 0 0 0 1 1h14a1 1 0 0 0 1-1v-9a1 1 0 0 0-1-1H5zm3.5 3.5a1.5 1.5 0 0 1 1.5 1.5v2a1.5 1.5 0 0 1-3 0v-2A1.5 1.5 0 0 1 8.5 11zm7 0a1.5 1.5 0 0 1 1.5 1.5v2a1.5 1.5 0 0 1-3 0v-2a1.5 1.5 0 0 1 1.5-1.5z"/></svg>'
    },
    {
      id: 'rumble',
      name: 'Rumble',
      category: 'streaming',
      tags: 'рамбл видео',
      accentColor: '#85C742',
      secondaryColor: '#65A30D',
      defaultTitle: 'Rumble',
      placeholderHandle: 'rumble.com/c/nick',
      placeholderUrl: 'https://rumble.com',
      svg: '<svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M12 2a10 10 0 1 0 0 20 10 10 0 0 0 0-20zm3.8 11.4-5.2 3.2c-1 .6-2.3-.1-2.3-1.3V8.7c0-1.2 1.3-1.9 2.3-1.3l5.2 3.2c1 .6 1 2.2 0 2.8z"/></svg>'
    },
    {
      id: 'live',
      name: 'Прямой эфир / Live',
      category: 'streaming',
      tags: 'лайв эфир стрим трансляция broadcast',
      accentColor: '#EF4444',
      secondaryColor: '#F97316',
      defaultTitle: 'LIVE',
      placeholderHandle: 'Прямая трансляция',
      placeholderUrl: '',
      svg: '<svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><circle cx="12" cy="12" r="3"/><path d="M7.76 7.76a6 6 0 0 0 0 8.48l1.41-1.41a4 4 0 0 1 0-5.66L7.76 7.76zm8.48 0-1.41 1.41a4 4 0 0 1 0 5.66l1.41 1.41a6 6 0 0 0 0-8.48zM4.93 4.93a10 10 0 0 0 0 14.14l1.41-1.41a8 8 0 0 1 0-11.32L4.93 4.93zm14.14 0-1.41 1.41a8 8 0 0 1 0 11.32l1.41 1.41a10 10 0 0 0 0-14.14z"/></svg>'
    },
    {
      id: 'clapper',
      name: 'Клипы / VOD',
      category: 'streaming',
      tags: 'клипы нарезки монтаж кино видео vod',
      accentColor: '#38BDF8',
      secondaryColor: '#6366F1',
      defaultTitle: 'Клипы & VOD',
      placeholderHandle: 'Смотри нарезки!',
      placeholderUrl: '',
      svg: '<svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="m4 4 2.5 4h3L7 4h2.5L12 8h3l-2.5-4H15l2.5 4h2.5V4a1 1 0 0 1 1 1v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a1 1 0 0 1 1-1zm0 6v9h16v-9H4z"/></svg>'
    },
    {
      id: 'podcast',
      name: 'Подкаст / Микрофон',
      category: 'streaming',
      tags: 'подкаст микрофон голос радио mic',
      accentColor: '#A855F7',
      secondaryColor: '#EC4899',
      defaultTitle: 'Подкаст',
      placeholderHandle: 'Слушай выпуски',
      placeholderUrl: '',
      svg: '<svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M12 2a3.5 3.5 0 0 0-3.5 3.5v5a3.5 3.5 0 0 0 7 0v-5A3.5 3.5 0 0 0 12 2zm-6.5 8.5a1 1 0 1 0-2 0A8.5 8.5 0 0 0 11 18.93V21H8.5a1 1 0 1 0 0 2h7a1 1 0 1 0 0-2H13v-2.07A8.5 8.5 0 0 0 20.5 10.5a1 1 0 1 0-2 0 6.5 6.5 0 0 1-13 0z"/></svg>'
    },

    // ======================== DONATE & SUPPORT ========================
    {
      id: 'boosty',
      name: 'Boosty',
      category: 'donate',
      tags: 'бусти подписка поддержка контент',
      accentColor: '#F15F2C',
      secondaryColor: '#E11D48',
      defaultTitle: 'Boosty',
      placeholderHandle: 'boosty.to/channel',
      placeholderUrl: 'https://boosty.to/channel',
      svg: '<svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M10.4 2.2 4.8 14.3h4.5l-1.9 7.5L18.9 9.7h-4.8l2.5-7.5h-6.2zm2.6 2.1-1.8 5.4h3.9l-5.1 6.4.9-3.9H7.6L13 4.3z"/></svg>'
    },
    {
      id: 'donationalerts',
      name: 'DonationAlerts / Донат',
      category: 'donate',
      tags: 'донат да донейшен поддержка деньги',
      accentColor: '#F57D07',
      secondaryColor: '#FBBF24',
      defaultTitle: 'Поддержка',
      placeholderHandle: 'donationalerts.com/r/nick',
      placeholderUrl: 'https://donationalerts.com/r/nick',
      svg: '<svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1.2 15.4v1.1h-2.1v-1.12c-1.56-.32-2.66-1.28-2.75-2.63h1.89c.11.71.68 1.2 1.72 1.2 1.07 0 1.65-.45 1.65-1.08 0-.67-.54-.98-2.06-1.31-1.92-.42-3.03-1.11-3.03-2.64 0-1.33 1.04-2.31 2.58-2.62V7.2h2.1v1.11c1.46.31 2.41 1.22 2.52 2.48h-1.88c-.1-.64-.62-1.07-1.49-1.07-.94 0-1.48.41-1.48 1.01 0 .61.53.91 1.98 1.24 2.02.45 3.11 1.15 3.11 2.71 0 1.44-1.1 2.42-2.76 2.72z"/></svg>'
    },
    {
      id: 'donatepay',
      name: 'DonatePay / Рубль',
      category: 'donate',
      tags: 'донатпей рубль донат перевод оплата',
      accentColor: '#22C55E',
      secondaryColor: '#16A34A',
      defaultTitle: 'Донат',
      placeholderHandle: 'new.donatepay.ru/@nick',
      placeholderUrl: 'https://donatepay.ru',
      svg: '<svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M12 2a10 10 0 1 0 0 20 10 10 0 0 0 0-20zm1.5 10.7H10V14h3v1.6H10V18H8v-2.4H7V14h1v-1.3H7v-1.8h1V6.5h5.5a3.1 3.1 0 1 1 0 6.2zm-.2-4.4H10v2.6h3.3a1.3 1.3 0 1 0 0-2.6z"/></svg>'
    },
    {
      id: 'patreon',
      name: 'Patreon',
      category: 'donate',
      tags: 'патреон подписка спонсор',
      accentColor: '#FF424D',
      secondaryColor: '#F43F5E',
      defaultTitle: 'Patreon',
      placeholderHandle: 'patreon.com/creator',
      placeholderUrl: 'https://patreon.com/creator',
      svg: '<svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><circle cx="14.5" cy="9.5" r="5.5"/><rect x="3" y="4" width="3.5" height="16" rx="1"/></svg>'
    },
    {
      id: 'kofi',
      name: 'Ko-fi',
      category: 'donate',
      tags: 'кофи кофе донат',
      accentColor: '#FF5E5B',
      secondaryColor: '#FB7185',
      defaultTitle: 'Ko-fi',
      placeholderHandle: 'ko-fi.com/creator',
      placeholderUrl: 'https://ko-fi.com/creator',
      svg: '<svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M3 6h14.5a3.5 3.5 0 0 1 0 7H17v1.5A4.5 4.5 0 0 1 12.5 19h-5A4.5 4.5 0 0 1 3 14.5V6zm14 5h.5a1.5 1.5 0 0 0 0-3H17v3zm-7 4.7 2.8-2.6a1.95 1.95 0 0 0-2.8-2.7 1.95 1.95 0 0 0-2.8 2.7L10 15.7z"/></svg>'
    },
    {
      id: 'paypal',
      name: 'PayPal',
      category: 'donate',
      tags: 'пейпал оплата донат перевод',
      accentColor: '#0070BA',
      secondaryColor: '#003087',
      defaultTitle: 'PayPal',
      placeholderHandle: 'paypal.me/username',
      placeholderUrl: 'https://paypal.me',
      svg: '<svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M7.4 20.5H4.6a.6.6 0 0 1-.6-.7L6.3 5a1 1 0 0 1 1-.8h6c2.8 0 4.6 1.5 4.2 4.2-.4 3-2.5 4.7-5.6 4.7h-2l-.9 6.6a.9.9 0 0 1-.9.8zm2.6-10h1.9c1.5 0 2.6-.7 2.8-2.1.2-1.2-.6-1.9-2-1.9h-2.1l-.6 4z"/><path d="M18.6 9.2c-.3 2.8-2.3 4.8-5.4 4.8h-1.6l-.8 6h2.2a.8.8 0 0 0 .8-.7l.6-3.7h1.4c2.4 0 4-1.4 4.3-3.7.2-1.2-.2-2.2-1.5-2.7z" opacity=".75"/></svg>'
    },
    {
      id: 'wallet',
      name: 'Кошелёк / СБП / Карта',
      category: 'donate',
      tags: 'сбп карта перевод кошелек юмани деньги',
      accentColor: '#8B5CF6',
      secondaryColor: '#06B6D4',
      defaultTitle: 'Поддержать',
      placeholderHandle: 'Перевод / СБП',
      placeholderUrl: '',
      svg: '<svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M4 5h15a2 2 0 0 1 2 2v1.5h-4.5a3.5 3.5 0 0 0 0 7H21V17a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V7a2 2 0 0 1 2-2zm12.5 5.5H22v3h-5.5a1.5 1.5 0 0 1 0-3zm.5 2.2a.7.7 0 1 0 0-1.4.7.7 0 0 0 0 1.4z"/></svg>'
    },
    {
      id: 'diamond',
      name: 'VIP / Алмаз',
      category: 'donate',
      tags: 'алмаз вип сабка спонсор gem',
      accentColor: '#38BDF8',
      secondaryColor: '#818CF8',
      defaultTitle: 'VIP Подписка',
      placeholderHandle: 'Доступ к бонусам',
      placeholderUrl: '',
      svg: '<svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M6 3h12l4 6-10 12L2 9l4-6zm1.1 2L4.6 8.5h4.2L10.3 5H7.1zm5.2 0L10.8 8.5h2.4L11.7 5h.6zm2.4 0 1.5 3.5h4.2L16.9 5h-2.2zM4.7 10.5l5.9 7.2-2.2-7.2H4.7zm5.7 0 1.6 7.5 1.6-7.5h-3.2zm5.2 0-2.2 7.2 5.9-7.2h-3.7z"/></svg>'
    },
    {
      id: 'crown',
      name: 'Корона / Топ',
      category: 'donate',
      tags: 'корона вип король топ донатер',
      accentColor: '#FBBF24',
      secondaryColor: '#F59E0B',
      defaultTitle: 'VIP / Топ',
      placeholderHandle: 'Эксклюзивный доступ',
      placeholderUrl: '',
      svg: '<svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="m3 7 4.5 4.2L12 5l4.5 6.2L21 7l-1.8 11H4.8L3 7zm2 13h14v2H5v-2z"/></svg>'
    },
    {
      id: 'gift',
      name: 'Подарок / Розыгрыш',
      category: 'donate',
      tags: 'подарок розыгрыш приз гифт giveaway',
      accentColor: '#EC4899',
      secondaryColor: '#F43F5E',
      defaultTitle: 'Розыгрыш',
      placeholderHandle: 'Участвуй в призах!',
      placeholderUrl: '',
      svg: '<svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M9.5 3A2.5 2.5 0 0 0 7 5.5c0 .54.17 1.05.46 1.5H3.5A1.5 1.5 0 0 0 2 8.5v2A1.5 1.5 0 0 0 3.5 12H4v7.5A1.5 1.5 0 0 0 5.5 21h13a1.5 1.5 0 0 0 1.5-1.5V12h.5a1.5 1.5 0 0 0 1.5-1.5v-2A1.5 1.5 0 0 0 20.5 7h-3.96c.29-.45.46-.96.46-1.5A2.5 2.5 0 0 0 14.5 3c-1.08 0-1.99.68-2.5 1.63C11.49 3.68 10.58 3 9.5 3zm0 2c.69 0 1.25.56 1.25 1.25V7H9.5A1.5 1.5 0 0 1 9.5 5zm5 0a1.5 1.5 0 0 1 0 2h-1.25v-.75c0-.69.56-1.25 1.25-1.25zM11 12v7H6v-7h5zm2 0h5v7h-5v-7z"/></svg>'
    },
    {
      id: 'heart',
      name: 'Сердце / Спасибо',
      category: 'donate',
      tags: 'сердце лайк спасибо любовь подписка',
      accentColor: '#F43F5E',
      secondaryColor: '#EC4899',
      defaultTitle: 'Подпишись',
      placeholderHandle: 'Спасибо за поддержку!',
      placeholderUrl: '',
      svg: '<svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/></svg>'
    },
    {
      id: 'handshake',
      name: 'Реклама / Партнёры',
      category: 'donate',
      tags: 'реклама сотрудничество бизнес партнер',
      accentColor: '#14B8A6',
      secondaryColor: '#0EA5E9',
      defaultTitle: 'Реклама',
      placeholderHandle: 'По вопросам рекламы',
      placeholderUrl: '',
      svg: '<svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M16.5 3.5 12 6.8 7.5 3.5 2 7.5l3 5.2 2.4-1.4L12 16l4.6-4.7 2.4 1.4 3-5.2-5.5-4zM6.4 14.8l-1.4.8 4.4 4.4a2 2 0 0 0 2.8 0l.5-.5-4.3-4.3-2-.4zm11.2 0-2 .4-4.3 4.3.5.5a2 2 0 0 0 2.8 0l4.4-4.4-1.4-.8z"/></svg>'
    },

    // ======================== GAMING, MUSIC & DEV ========================
    {
      id: 'steam',
      name: 'Steam',
      category: 'gaming',
      tags: 'стим игры профиль друзья',
      accentColor: '#66C0F4',
      secondaryColor: '#1B2838',
      defaultTitle: 'Steam',
      placeholderHandle: 'steamcommunity.com/id/nick',
      placeholderUrl: 'https://steamcommunity.com/id/nick',
      svg: '<svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M12 2a10 10 0 0 0-9.95 9.02l5.35 2.21a2.84 2.84 0 0 1 1.6-.49l2.39-3.46v-.05a3.78 3.78 0 1 1 3.78 3.78h-.09l-3.41 2.43a2.85 2.85 0 0 1-5.64.54l-3.83-1.58A10 10 0 1 0 12 2zm-4.4 14.37-1.22-.5a2.13 2.13 0 0 0 3.86-.23 2.13 2.13 0 0 0-2.64-2.74l1.26.52a1.57 1.57 0 0 1-1.26 2.95zm10.09-7.14a2.52 2.52 0 1 0-5.04 0 2.52 2.52 0 0 0 5.04 0zm-4.41 0a1.89 1.89 0 1 1 3.78 0 1.89 1.89 0 0 1-3.78 0z"/></svg>'
    },
    {
      id: 'spotify',
      name: 'Spotify',
      category: 'gaming',
      tags: 'спотифай музыка треки плейлист',
      accentColor: '#1DB954',
      secondaryColor: '#16A34A',
      defaultTitle: 'Spotify',
      placeholderHandle: 'Мой плейлист',
      placeholderUrl: 'https://open.spotify.com',
      svg: '<svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M12 2a10 10 0 1 0 0 20 10 10 0 0 0 0-20zm4.58 14.42a.62.62 0 0 1-.85.21c-2.34-1.43-5.29-1.75-8.76-.96a.62.62 0 1 1-.28-1.22c3.8-.87 7.06-.5 9.68 1.1.29.18.38.57.21.87zm1.22-2.72a.78.78 0 0 1-1.07.26c-2.68-1.65-6.77-2.13-9.94-1.16a.78.78 0 1 1-.45-1.5c3.62-1.1 8.13-.57 11.2 1.33.36.22.48.7.26 1.07zm.1-2.83c-3.22-1.91-8.52-2.09-11.6-1.15a.94.94 0 1 1-.54-1.79c3.53-1.07 9.39-.87 13.09 1.33a.94.94 0 0 1-.95 1.61z"/></svg>'
    },
    {
      id: 'soundcloud',
      name: 'SoundCloud',
      category: 'gaming',
      tags: 'саундклауд музыка ремиксы треки',
      accentColor: '#FF5500',
      secondaryColor: '#EA580C',
      defaultTitle: 'SoundCloud',
      placeholderHandle: 'soundcloud.com/artist',
      placeholderUrl: 'https://soundcloud.com/artist',
      svg: '<svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M11.5 7.4c-.3 0-.5.2-.5.5v8.6c0 .3.2.5.5.5h7.2c1.8 0 3.3-1.4 3.3-3.2 0-1.6-1.2-3-2.8-3.2-.5-2-2.3-3.5-4.5-3.5-1.2 0-2.3.5-3.1 1.3zm-2.3 1.7a.5.5 0 0 0-.5.5v6.9a.5.5 0 0 0 1 0V9.6a.5.5 0 0 0-.5-.5zm-2.2 1.4a.5.5 0 0 0-.5.5v5.5a.5.5 0 0 0 1 0V11a.5.5 0 0 0-.5-.5zm-2.2 1.2a.5.5 0 0 0-.5.5v4.3a.5.5 0 0 0 1 0v-4.3a.5.5 0 0 0-.5-.5zm-2.2 1.4a.5.5 0 0 0-.5.5v2.9a.5.5 0 0 0 1 0v-2.9a.5.5 0 0 0-.5-.5z"/></svg>'
    },
    {
      id: 'yandexmusic',
      name: 'Яндекс Музыка',
      category: 'gaming',
      tags: 'яндекс музыка трек плейлист yandex',
      accentColor: '#FFCC00',
      secondaryColor: '#FF5500',
      defaultTitle: 'Яндекс Музыка',
      placeholderHandle: 'music.yandex.ru',
      placeholderUrl: 'https://music.yandex.ru',
      svg: '<svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M16 3v11.5a4.5 4.5 0 1 1-2-3.74V6.5L8 8.3v8.2a4.5 4.5 0 1 1-2-3.74V6.3a1.5 1.5 0 0 1 1.07-1.44l7.5-2.25A1.1 1.1 0 0 1 16 3z"/></svg>'
    },
    {
      id: 'applemusic',
      name: 'Apple Music',
      category: 'gaming',
      tags: 'эппл мьюзик музыка аудио',
      accentColor: '#FA243C',
      secondaryColor: '#FB5C74',
      defaultTitle: 'Apple Music',
      placeholderHandle: 'music.apple.com',
      placeholderUrl: 'https://music.apple.com',
      svg: '<svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M18.5 3.1 9.5 5v10.6a3.2 3.2 0 1 1-1.6-2.8V4.2c0-.5.35-.95.85-1.05l9.5-2c.65-.14 1.25.35 1.25 1.02v11.4a3.2 3.2 0 1 1-1.6-2.8V3.1h.6z"/></svg>'
    },
    {
      id: 'epicgames',
      name: 'Epic Games',
      category: 'gaming',
      tags: 'эпик геймс fortnite фортнайт тег автора',
      accentColor: '#E2E8F0',
      secondaryColor: '#64748B',
      defaultTitle: 'Epic Tag',
      placeholderHandle: 'Код автора: NICK',
      placeholderUrl: 'https://epicgames.com',
      svg: '<svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M4.5 2h15A1.5 1.5 0 0 1 21 3.5v13.2a2 2 0 0 1-1.15 1.81L12 22l-7.85-3.49A2 2 0 0 1 3 16.7V3.5A1.5 1.5 0 0 1 4.5 2zm3.5 4v10h8v-2.4h-5.2v-1.6h4.2V9.8h-4.2V8.4H16V6H8z"/></svg>'
    },
    {
      id: 'playstation',
      name: 'PlayStation / PSN',
      category: 'gaming',
      tags: 'плейстейшн пс5 консоль плойка psn',
      accentColor: '#0070D1',
      secondaryColor: '#003791',
      defaultTitle: 'PSN',
      placeholderHandle: 'PSN: MyNick',
      placeholderUrl: '',
      svg: '<svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M9.7 4.2v15.4l3.3 1.1V8.6c0-.9.4-1.5 1-1.3.8.2 1 .9 1 1.9v3.6c2.5 1.2 4.3 0 4.3-3.1 0-3-1.1-4.3-4.4-5.4-1.4-.5-3.5-1-5.2-.1zM3 16.8c-1.5.5-1.7 1.8-.3 2.3 1.3.5 3.1.5 4.8 0l1.2-.4v-2l-2.6.9c-.8.3-1.6.3-2.1 0-.4-.2-.2-.6.5-.8l3.2-1.1v-2L3 16.8zm14-.3-3 1v2l4.8-1.6c1.5-.5 1.7-1.7.3-2.3-1.2-.5-2.8-.5-4.3-.1l-.8.3v1.9l2-.7c.8-.3 1.5-.2 1.9 0 .4.2.2.5-.9.5z"/></svg>'
    },
    {
      id: 'xbox',
      name: 'Xbox Live',
      category: 'gaming',
      tags: 'иксбокс xbox геймертег консоль',
      accentColor: '#107C10',
      secondaryColor: '#22C55E',
      defaultTitle: 'Xbox',
      placeholderHandle: 'Gamertag',
      placeholderUrl: '',
      svg: '<svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M12 2a10 10 0 1 0 0 20 10 10 0 0 0 0-20zm5.3 3.7c-1.8-1.1-3.9-1.6-5.3-.3-1.4-1.3-3.5-.8-5.3.3 1.6-.6 3.5.3 5.3 2 1.8-1.7 3.7-2.6 5.3-2zm2.2 2.4c-.7 1.1-2.5 2.7-4.8 4.4 2.4 2.4 4.1 5 4.1 6.7a8 8 0 0 0 .7-11.1zm-15 0a8 8 0 0 0 .7 11.1c0-1.7 1.7-4.3 4.1-6.7-2.3-1.7-4.1-3.3-4.8-4.4zm7.5 6c-2.5 2-4.6 4.7-4.3 6.2a8.1 8.1 0 0 0 8.6 0c.3-1.5-1.8-4.2-4.3-6.2z"/></svg>'
    },
    {
      id: 'gamepad',
      name: 'Геймпад / Игры',
      category: 'gaming',
      tags: 'геймпад джойстик игры squad команда',
      accentColor: '#A855F7',
      secondaryColor: '#7C3AED',
      defaultTitle: 'Игры',
      placeholderHandle: 'Играем вместе',
      placeholderUrl: '',
      svg: '<svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M6.8 6A4.8 4.8 0 0 0 2 10.8v4.1a3.1 3.1 0 0 0 5.4 2l1.8-2h5.6l1.8 2a3.1 3.1 0 0 0 5.4-2v-4.1A4.8 4.8 0 0 0 17.2 6H6.8zM8 9.2h1.6v1.8h1.8v1.6H9.6v1.8H8v-1.8H6.2V11H8V9.2zm7.7.6a1.1 1.1 0 1 1 0 2.2 1.1 1.1 0 0 1 0-2.2zm2.3 2.3a1.1 1.1 0 1 1 0 2.2 1.1 1.1 0 0 1 0-2.2z"/></svg>'
    },
    {
      id: 'headset',
      name: 'Наушники / Войс',
      category: 'gaming',
      tags: 'наушники войс голос музыка',
      accentColor: '#6366F1',
      secondaryColor: '#38BDF8',
      defaultTitle: 'Голосовой чат',
      placeholderHandle: 'Заходи в войс',
      placeholderUrl: '',
      svg: '<svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M12 3a9 9 0 0 0-9 9v5.5A2.5 2.5 0 0 0 5.5 20H7a1 1 0 0 0 1-1v-5a1 1 0 0 0-1-1H5v-1a7 7 0 0 1 14 0v1h-2a1 1 0 0 0-1 1v5a1 1 0 0 0 1 1h1.5a2.5 2.5 0 0 0 2.5-2.5V12a9 9 0 0 0-9-9z"/></svg>'
    },
    {
      id: 'crosshair',
      name: 'Прицел / Шутеры',
      category: 'gaming',
      tags: 'прицел аим кс валорант шутер aim fps',
      accentColor: '#F43F5E',
      secondaryColor: '#FB7185',
      defaultTitle: 'FPS / Squad',
      placeholderHandle: 'Настройки прицела',
      placeholderUrl: '',
      svg: '<svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M11 2v2.07A8.01 8.01 0 0 0 4.07 11H2v2h2.07A8.01 8.01 0 0 0 11 19.93V22h2v-2.07A8.01 8.01 0 0 0 19.93 13H22v-2h-2.07A8.01 8.01 0 0 0 13 4.07V2h-2zm1 4a6 6 0 1 1 0 12 6 6 0 0 1 0-12zm0 4a2 2 0 1 0 0 4 2 2 0 0 0 0-4z"/></svg>'
    },
    {
      id: 'trophy',
      name: 'Кубок / Турнир',
      category: 'gaming',
      tags: 'кубок трофей турнир победа топ',
      accentColor: '#FBBF24',
      secondaryColor: '#F59E0B',
      defaultTitle: 'Турниры',
      placeholderHandle: 'Запись и сетка',
      placeholderUrl: '',
      svg: '<svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M5 3h14v2h3v3.5a4.5 4.5 0 0 1-4.1 4.48A6.01 6.01 0 0 1 13 16.9V19h4v2H7v-2h4v-2.1a6.01 6.01 0 0 1-4.9-3.92A4.5 4.5 0 0 1 2 8.5V5h3V3zm0 4H4v1.5A2.5 2.5 0 0 0 6.2 11c-.13-.48-.2-.98-.2-1.5V7zm14 0v2.5c0 .52-.07 1.02-.2 1.5A2.5 2.5 0 0 0 20 8.5V7h-1z"/></svg>'
    },
    {
      id: 'dice',
      name: 'Кубик / Настолки',
      category: 'gaming',
      tags: 'кубик ролл рандом настолки днд dnd',
      accentColor: '#34D399',
      secondaryColor: '#10B981',
      defaultTitle: 'Рандом / Игры',
      placeholderHandle: 'Крутим рулетку',
      placeholderUrl: '',
      svg: '<svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M5 3h14a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2zm3 4a1.5 1.5 0 1 0 0 3 1.5 1.5 0 0 0 0-3zm8 0a1.5 1.5 0 1 0 0 3 1.5 1.5 0 0 0 0-3zm-4 3.5a1.5 1.5 0 1 0 0 3 1.5 1.5 0 0 0 0-3zM8 14a1.5 1.5 0 1 0 0 3 1.5 1.5 0 0 0 0-3zm8 0a1.5 1.5 0 1 0 0 3 1.5 1.5 0 0 0 0-3z"/></svg>'
    },
    {
      id: 'github',
      name: 'GitHub',
      category: 'gaming',
      tags: 'гитхаб код open source проекты dev',
      accentColor: '#E2E8F0',
      secondaryColor: '#64748B',
      defaultTitle: 'GitHub',
      placeholderHandle: 'github.com/username',
      placeholderUrl: 'https://github.com/username',
      svg: '<svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M12 2a10 10 0 0 0-3.16 19.49c.5.09.68-.22.68-.48v-1.7c-2.78.6-3.37-1.18-3.37-1.18-.45-1.15-1.11-1.46-1.11-1.46-.91-.62.07-.61.07-.61 1 .07 1.53 1.03 1.53 1.03.9 1.53 2.35 1.09 2.92.83.09-.65.35-1.09.64-1.34-2.22-.25-4.55-1.11-4.55-4.94 0-1.09.39-1.98 1.03-2.68-.1-.25-.45-1.27.1-2.65 0 0 .84-.27 2.75 1.02a9.56 9.56 0 0 1 5 0c1.91-1.29 2.75-1.02 2.75-1.02.55 1.38.2 2.4.1 2.65.64.7 1.03 1.59 1.03 2.68 0 3.84-2.34 4.69-4.57 4.93.36.31.68.92.68 1.85v2.75c0 .27.18.58.69.48A10 10 0 0 0 12 2z"/></svg>'
    },
    {
      id: 'gitlab',
      name: 'GitLab',
      category: 'gaming',
      tags: 'гитлаб код проекты',
      accentColor: '#FC6D26',
      secondaryColor: '#E24329',
      defaultTitle: 'GitLab',
      placeholderHandle: 'gitlab.com/username',
      placeholderUrl: 'https://gitlab.com',
      svg: '<svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="m21.94 13.11-1.1-3.38-2.18-6.7a.56.56 0 0 0-1.07 0L15.41 9.7H8.59L6.41 3.03a.56.56 0 0 0-1.07 0l-2.18 6.7-1.1 3.38a1.12 1.12 0 0 0 .41 1.25L12 21.3l9.53-6.94a1.12 1.12 0 0 0 .41-1.25z"/></svg>'
    },
    {
      id: 'terminal',
      name: 'Код / Бот / Dev',
      category: 'gaming',
      tags: 'терминал консоль бот скрипт разработка code',
      accentColor: '#22D3EE',
      secondaryColor: '#3B82F6',
      defaultTitle: 'Dev / Бот',
      placeholderHandle: '!commands в чате',
      placeholderUrl: '',
      svg: '<svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M4 4h16a2 2 0 0 1 2 2v12a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2zm2.3 5.3L10 13l-3.7 3.7 1.4 1.4 5.1-5.1-5.1-5.1-1.4 1.4zM12 16h6v2h-6v-2z"/></svg>'
    },
    {
      id: 'figma',
      name: 'Дизайн / Figma',
      category: 'gaming',
      tags: 'фигма дизайн графика портфолио',
      accentColor: '#A259FF',
      secondaryColor: '#0ACF83',
      defaultTitle: 'Дизайн',
      placeholderHandle: 'Заказ оформления',
      placeholderUrl: 'https://figma.com',
      svg: '<svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M8.5 2A3.5 3.5 0 0 0 5 5.5 3.5 3.5 0 0 0 8.5 9H12V2H8.5zm0 7A3.5 3.5 0 0 0 5 12.5 3.5 3.5 0 0 0 8.5 16H12V9H8.5zm0 7A3.5 3.5 0 0 0 5 19.5 3.5 3.5 0 0 0 12 19.5V16H8.5zM12 2v7h3.5a3.5 3.5 0 1 0 0-7H12zm3.5 7a3.5 3.5 0 1 0 0 7 3.5 3.5 0 0 0 0-7z"/></svg>'
    },

    // ======================== BADGES & UTILITY ========================
    {
      id: 'shop',
      name: 'Магазин / Мерч',
      category: 'badges',
      tags: 'магазин мерч товары покупки store',
      accentColor: '#10B981',
      secondaryColor: '#14B8A6',
      defaultTitle: 'Магазин',
      placeholderHandle: 'shop.example.com',
      placeholderUrl: 'https://example.com',
      svg: '<svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M6 7V6a6 6 0 1 1 12 0v1h2.5a.5.5 0 0 1 .5.5l.9 12a2 2 0 0 1-2 2.15H4.1a2 2 0 0 1-2-2.15L3 7.5a.5.5 0 0 1 .5-.5H6zm2 0h8V6a4 4 0 1 0-8 0v1zm1 4a1 1 0 1 0 2 0V9.5H9V11zm6 0a1 1 0 1 0 2 0V9.5h-2V11z"/></svg>'
    },
    {
      id: 'globe',
      name: 'Сайт / Портал',
      category: 'badges',
      tags: 'сайт веб домен интернет web',
      accentColor: '#38BDF8',
      secondaryColor: '#0284C7',
      defaultTitle: 'Website',
      placeholderHandle: 'mysite.com',
      placeholderUrl: 'https://mysite.com',
      svg: '<svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M12 2a10 10 0 1 0 0 20 10 10 0 0 0 0-20zm6.93 6h-3.17a15.2 15.2 0 0 0-1.38-3.56A8.03 8.03 0 0 1 18.93 8zM12 4.04c.83 1.2 1.48 2.53 1.91 3.96h-3.82c.43-1.43 1.08-2.76 1.91-3.96zM4.26 14C4.1 13.36 4 12.69 4 12s.1-1.36.26-2h3.38c-.08.66-.14 1.32-.14 2s.06 1.34.14 2H4.26zm.81 2h3.17c.32 1.25.78 2.45 1.38 3.56A8.03 8.03 0 0 1 5.07 16zm3.17-8H5.07a8.03 8.03 0 0 1 4.55-3.56C9.02 5.55 8.56 6.75 8.24 8zM12 19.96c-.83-1.2-1.48-2.53-1.91-3.96h3.82c-.43 1.43-1.08 2.76-1.91 3.96zM14.34 14H9.66c-.09-.66-.16-1.32-.16-2s.07-1.35.16-2h4.68c.09.65.16 1.32.16 2s-.07 1.34-.16 2zm.04 5.56c.6-1.11 1.06-2.31 1.38-3.56h3.17a8.03 8.03 0 0 1-4.55 3.56zM16.36 14c.08-.66.14-1.32.14-2s-.06-1.34-.14-2h3.38c.16.64.26 1.31.26 2s-.1 1.36-.26 2h-3.38z"/></svg>'
    },
    {
      id: 'mail',
      name: 'Почта / Email',
      category: 'badges',
      tags: 'почта емейл email контакты сотрудничество',
      accentColor: '#60A5FA',
      secondaryColor: '#3B82F6',
      defaultTitle: 'Сотрудничество',
      placeholderHandle: 'contact@example.com',
      placeholderUrl: 'mailto:contact@example.com',
      svg: '<svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M4 5h16a2 2 0 0 1 2 2v10a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V7a2 2 0 0 1 2-2zm0 2v.4l8 5 8-5V7H4zm16 10V9.7l-7.47 4.67a1 1 0 0 1-1.06 0L4 9.7V17h16z"/></svg>'
    },
    {
      id: 'link',
      name: 'Ссылка / Custom',
      category: 'badges',
      tags: 'ссылка линк мультиссылка linktree',
      accentColor: '#94A3B8',
      secondaryColor: '#64748B',
      defaultTitle: 'Ссылка',
      placeholderHandle: 'linktr.ee/username',
      placeholderUrl: 'https://linktr.ee/username',
      svg: '<svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M10.59 13.41a1 1 0 0 1 0-1.41l3.18-3.18a1 1 0 1 1 1.41 1.41L12 13.41a1 1 0 0 1-1.41 0zm-2.83 5.66a4 4 0 0 1 0-5.66l2.12-2.12a1 1 0 0 1 1.41 1.41L9.17 14.83a2 2 0 1 0 2.83 2.83l2.12-2.12a1 1 0 0 1 1.41 1.41l-2.12 2.12a4 4 0 0 1-5.65 0zm5.66-14.14a4 4 0 0 1 5.65 5.65l-2.12 2.12a1 1 0 0 1-1.41-1.41l2.12-2.12a2 2 0 1 0-2.83-2.83l-2.12 2.12a1 1 0 0 1-1.41-1.41l2.12-2.12z"/></svg>'
    },
    {
      id: 'bell',
      name: 'Колокольчик / Подписка',
      category: 'badges',
      tags: 'колокольчик уведомления подпишись follow',
      accentColor: '#F59E0B',
      secondaryColor: '#FBBF24',
      defaultTitle: 'Не пропусти!',
      placeholderHandle: 'Включай уведомления',
      placeholderUrl: '',
      svg: '<svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M12 2a2 2 0 0 0-2 2v.29A6.5 6.5 0 0 0 5.5 10.5v4.3l-1.7 2.1A1 1 0 0 0 4.6 18.5h14.8a1 1 0 0 0 .8-1.6l-1.7-2.1v-4.3A6.5 6.5 0 0 0 14 4.29V4a2 2 0 0 0-2-2zm-2.5 17.5a2.5 2.5 0 0 0 5 0h-5z"/></svg>'
    },
    {
      id: 'fire',
      name: 'Огонь / Хайп',
      category: 'badges',
      tags: 'огонь пламя топ хайп тренд hot',
      accentColor: '#F97316',
      secondaryColor: '#EF4444',
      defaultTitle: 'Горячее',
      placeholderHandle: 'Новый контент!',
      placeholderUrl: '',
      svg: '<svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M13.5 2c.3 3.2-1.5 5.2-3 6.7-.9.9-1.7 1.8-1.8 3.2 0 1.2.8 2.1 1.8 2.1 1.2 0 1.8-1.2 1.5-2.6 2.2 1.2 3.5 3.3 3.5 5.6 0 2.8-2.2 5-5 5-3.3 0-6-2.7-6-6 0-3.4 2.1-6.4 5.2-9.5C11.4 4.8 12.6 3.5 13.5 2zm2.8 7.5c2 1.8 3.2 4.3 3.2 6.8A6.2 6.2 0 0 1 13.3 22c2.1-.9 3.5-3 3.5-5.3 0-2.1-.9-4.1-2.5-5.5.8-.5 1.4-1.1 2-1.7z"/></svg>'
    },
    {
      id: 'bolt',
      name: 'Молния / Буст',
      category: 'badges',
      tags: 'молния энергия буст быстро',
      accentColor: '#EAB308',
      secondaryColor: '#38BDF8',
      defaultTitle: 'Буст канала',
      placeholderHandle: 'Поддержи активностью!',
      placeholderUrl: '',
      svg: '<svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M13.5 2 4.5 13.5h6.2L9.5 22l9-11.5h-6.2L13.5 2z"/></svg>'
    },
    {
      id: 'star',
      name: 'Звезда / Избранное',
      category: 'badges',
      tags: 'звезда рейтинг премиум бонус',
      accentColor: '#FBBF24',
      secondaryColor: '#F59E0B',
      defaultTitle: 'Бонусы',
      placeholderHandle: 'Лучшие моменты',
      placeholderUrl: '',
      svg: '<svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="m12 2.5 2.9 5.88 6.49.94-4.7 4.58 1.11 6.46L12 17.31l-5.8 3.05 1.11-6.46-4.7-4.58 6.49-.94L12 2.5z"/></svg>'
    },
    {
      id: 'rocket',
      name: 'Ракета / Запуск',
      category: 'badges',
      tags: 'ракета старт буст космос',
      accentColor: '#EC4899',
      secondaryColor: '#8B5CF6',
      defaultTitle: 'Скоро старт',
      placeholderHandle: 'Полетели!',
      placeholderUrl: '',
      svg: '<svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M14.5 3.5c3.2-.4 5.9 0 6.3.4.4.4.8 3.1.4 6.3-.4 3.1-2.1 5.9-4.7 7.9l-2.3 1.8-.8-3.2-4.6-4.6-3.2-.8 1.8-2.3c2-2.6 4.8-4.3 7.9-4.7zM16 9.5a1.5 1.5 0 1 0 0-3 1.5 1.5 0 0 0 0 3zM5.6 14.8l3.6 3.6c-1.4 1.6-4.2 2.3-5.6 2.1-.2-1.4.5-4.2 2-5.7z"/></svg>'
    },
    {
      id: 'calendar',
      name: 'Расписание / Календарь',
      category: 'badges',
      tags: 'календарь расписание дата время стримов',
      accentColor: '#22C55E',
      secondaryColor: '#10B981',
      defaultTitle: 'Расписание',
      placeholderHandle: 'Стримы ПН / СР / ПТ в 19:00',
      placeholderUrl: '',
      svg: '<svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M7 2a1 1 0 0 1 1 1v1h8V3a1 1 0 1 1 2 0v1h1.5A2.5 2.5 0 0 1 22 6.5v13a2.5 2.5 0 0 1-2.5 2.5h-15A2.5 2.5 0 0 1 2 19.5v-13A2.5 2.5 0 0 1 4.5 4H6V3a1 1 0 0 1 1-1zM4 9.5v10c0 .28.22.5.5.5h15a.5.5 0 0 0 .5-.5v-10H4zm3 2.5h3v3H7v-3zm5 0h3v3h-3v-3z"/></svg>'
    },
    {
      id: 'chat',
      name: 'Чат / Общение',
      category: 'badges',
      tags: 'чат общение комьюнити беседа',
      accentColor: '#38BDF8',
      secondaryColor: '#0EA5E9',
      defaultTitle: 'Наш чат',
      placeholderHandle: 'Залетай общаться!',
      placeholderUrl: '',
      svg: '<svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M4 4h16a2 2 0 0 1 2 2v10a2 2 0 0 1-2 2H8l-4 3.5V18H4a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2zm3.5 6a1.25 1.25 0 1 0 0 2.5 1.25 1.25 0 0 0 0-2.5zm4.5 0a1.25 1.25 0 1 0 0 2.5 1.25 1.25 0 0 0 0-2.5zm4.5 0a1.25 1.25 0 1 0 0 2.5 1.25 1.25 0 0 0 0-2.5z"/></svg>'
    },
    {
      id: 'megaphone',
      name: 'Анонсы / Новости',
      category: 'badges',
      tags: 'мегафон рупор анонс новости объявление',
      accentColor: '#F59E0B',
      secondaryColor: '#EF4444',
      defaultTitle: 'Анонсы',
      placeholderHandle: 'Все новости тут',
      placeholderUrl: '',
      svg: '<svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M18.5 3.2 7.5 8H4a2 2 0 0 0-2 2v3a2 2 0 0 0 2 2h1.3l1.4 5h2.5l-1.1-5h.4l10 4.5a1 1 0 0 0 1.4-.9V4.1a1 1 0 0 0-1.4-.9zM21 8.5v6a3 3 0 0 0 0-6z"/></svg>'
    },
    {
      id: 'verified',
      name: 'Галочка / Verified',
      category: 'badges',
      tags: 'галочка проверка официальный значок',
      accentColor: '#3B82F6',
      secondaryColor: '#38BDF8',
      defaultTitle: 'Официальный канал',
      placeholderHandle: '@verified_creator',
      placeholderUrl: '',
      svg: '<svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="m12 2 2.4 1.9 3.1-.2 1.1 2.9 2.6 1.6-.6 3 .6 3-2.6 1.6-1.1 2.9-3.1-.2L12 22l-2.4-1.9-3.1.2-1.1-2.9-2.6-1.6.6-3-.6-3 2.6-1.6 1.1-2.9 3.1.2L12 2zm-1.1 13.5 5.2-5.2-1.4-1.4-3.8 3.8-1.8-1.8-1.4 1.4 3.2 3.2z"/></svg>'
    },
    {
      id: 'camera',
      name: 'Камера / Фото',
      category: 'badges',
      tags: 'камера фото галерея скрины',
      accentColor: '#F472B6',
      secondaryColor: '#A855F7',
      defaultTitle: 'Фото',
      placeholderHandle: 'Фото и бэкстейдж',
      placeholderUrl: '',
      svg: '<svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M9 3h6l1.8 2H20a2 2 0 0 1 2 2v11a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V7a2 2 0 0 1 2-2h3.2L9 3zm3 5a4.5 4.5 0 1 0 0 9 4.5 4.5 0 0 0 0-9zm0 2a2.5 2.5 0 1 1 0 5 2.5 2.5 0 0 1 0-5z"/></svg>'
    },
    {
      id: 'pin',
      name: 'Локация / Город',
      category: 'badges',
      tags: 'пин карта город страна локация место',
      accentColor: '#FB7185',
      secondaryColor: '#F43F5E',
      defaultTitle: 'Локация',
      placeholderHandle: 'Встречи и ивенты',
      placeholderUrl: '',
      svg: '<svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M12 2a7 7 0 0 0-7 7c0 5.25 7 13 7 13s7-7.75 7-13a7 7 0 0 0-7-7zm0 9.5a2.5 2.5 0 1 1 0-5 2.5 2.5 0 0 1 0 5z"/></svg>'
    },
    {
      id: 'shield',
      name: 'Клан / Щит',
      category: 'badges',
      tags: 'щит клан гильдия защита команда',
      accentColor: '#6366F1',
      secondaryColor: '#8B5CF6',
      defaultTitle: 'Клан / Команда',
      placeholderHandle: 'Вступай в гильдию',
      placeholderUrl: '',
      svg: '<svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M12 2 4 5.5v6.2c0 5.1 3.4 9.7 8 10.8 4.6-1.1 8-5.7 8-10.8V5.5L12 2zm-1 13.4-3.3-3.3 1.4-1.4 1.9 1.9 4.1-4.1 1.4 1.4-5.5 5.5z"/></svg>'
    },
    {
      id: 'sparkles',
      name: 'Искры / Магия',
      category: 'badges',
      tags: 'искры звезды магия красиво вайб',
      accentColor: '#C084FC',
      secondaryColor: '#F472B6',
      defaultTitle: 'Вайб',
      placeholderHandle: 'Уютные стримы',
      placeholderUrl: '',
      svg: '<svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="m12 2 1.7 5.3L19 9l-5.3 1.7L12 16l-1.7-5.3L5 9l5.3-1.7L12 2zm7 12 .9 2.6L22.5 17l-2.6.9L19 20.5l-.9-2.6L15.5 17l2.6-.9L19 14zM5.5 15l.8 2.2 2.2.8-2.2.8-.8 2.2-.8-2.2-2.2-.8 2.2-.8.8-2.2z"/></svg>'
    },
    {
      id: 'coffee',
      name: 'Кофе / Посиделки',
      category: 'donate',
      tags: 'кофе чай уют общение just chatting',
      accentColor: '#D97706',
      secondaryColor: '#F59E0B',
      defaultTitle: 'Угостить кофе',
      placeholderHandle: 'Поддержать стримера',
      placeholderUrl: '',
      svg: '<svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M3 8h13v5a5 5 0 0 1-5 5H8a5 5 0 0 1-5-5V8zm13 2h1.5a2.5 2.5 0 0 1 0 5H16v-2h1.5a.5.5 0 0 0 0-1H16v-2zM2 19h15v2H2v-2zM7 3c-.6.8-.6 1.7 0 2.5.6.8.6 1.7 0 2.5h1.8c.6-.8.6-1.7 0-2.5-.6-.8-.6-1.7 0-2.5H7zm4 0c-.6.8-.6 1.7 0 2.5.6.8.6 1.7 0 2.5h1.8c.6-.8.6-1.7 0-2.5-.6-.8-.6-1.7 0-2.5H11z"/></svg>'
    },
    {
      id: 'ticket',
      name: 'Промокод / Билет',
      category: 'badges',
      tags: 'промокод скидка купон билет ивент',
      accentColor: '#10B981',
      secondaryColor: '#34D399',
      defaultTitle: 'Промокод',
      placeholderHandle: 'PROMO20 — скидка 20%',
      placeholderUrl: '',
      svg: '<svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M3 6a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2v3.5a2.5 2.5 0 0 0 0 5V18a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-3.5a2.5 2.5 0 0 0 0-5V6zm7 2v2h4V8h-4zm0 4v2h4v-2h-4zm0 4v2h4v-2h-4z"/></svg>'
    },
    {
      id: 'music',
      name: 'Музыка / Заказ трека',
      category: 'gaming',
      tags: 'музыка трек нота песня заказ',
      accentColor: '#EC4899',
      secondaryColor: '#8B5CF6',
      defaultTitle: 'Музыка',
      placeholderHandle: 'Заказ треков на стриме',
      placeholderUrl: '',
      svg: '<svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M12 3v10.55A4 4 0 1 0 14 17V7h4V3h-6z"/></svg>'
    },
    {
      id: 'book',
      name: 'Блог / Гайды',
      category: 'badges',
      tags: 'книга гайд блог правила faq',
      accentColor: '#60A5FA',
      secondaryColor: '#38BDF8',
      defaultTitle: 'Гайды & Правила',
      placeholderHandle: 'Полезные ссылки',
      placeholderUrl: '',
      svg: '<svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M4 4.5A2.5 2.5 0 0 1 6.5 2H19a1 1 0 0 1 1 1v16a1 1 0 0 1-1 1H6.5A2.5 2.5 0 0 1 4 17.5v-13zm2.5-.5a.5.5 0 0 0-.5.5v10.7c.16-.12.33-.2.5-.2H18V4H6.5zM6 17.5a.5.5 0 0 0 .5.5H18v-1H6.5a.5.5 0 0 0-.5.5z"/></svg>'
    },
    {
      id: 'pc',
      name: 'ПК / Железо',
      category: 'gaming',
      tags: 'пк компьютер железо сетап specs',
      accentColor: '#38BDF8',
      secondaryColor: '#818CF8',
      defaultTitle: 'Мой ПК / Сетап',
      placeholderHandle: 'Характеристики ПК',
      placeholderUrl: '',
      svg: '<svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M4 4h16a2 2 0 0 1 2 2v10a2 2 0 0 1-2 2h-6v2h3v2H7v-2h3v-2H4a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2zm0 2v10h16V6H4z"/></svg>'
    },
    {
      id: 'cube',
      name: 'Куб / Minecraft',
      category: 'gaming',
      tags: 'майнкрафт куб сервер блок minecraft',
      accentColor: '#4ADE80',
      secondaryColor: '#16A34A',
      defaultTitle: 'Сервер Minecraft',
      placeholderHandle: 'play.myserver.ru',
      placeholderUrl: '',
      svg: '<svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M12 2 3.5 6.8v10.4L12 22l8.5-4.8V6.8L12 2zm0 2.3 6.2 3.5L12 11.3 5.8 7.8 12 4.3zM5.5 9.6l5.5 3.1v6.6l-5.5-3.1V9.6zm13 0v6.6L13 19.3v-6.6l5.5-3.1z"/></svg>'
    },
    {
      id: 'art',
      name: 'Арт / Кисть',
      category: 'gaming',
      tags: 'арт рисунок художник кисть творчество',
      accentColor: '#F472B6',
      secondaryColor: '#FB923C',
      defaultTitle: 'Арты',
      placeholderHandle: 'Мои работы',
      placeholderUrl: '',
      svg: '<svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M19.8 3.2a1.8 1.8 0 0 1 1 3l-8.5 8.5-3.1-3.1 8.5-8.5a1.8 1.8 0 0 1 2.1.1zM8.2 12.7l3.1 3.1c-.4 1.6-1.4 3.2-3.3 3.7-2 .5-4-.2-5-1.4 1.2-.2 2-.9 2.3-2.1.3-1.4 1.3-2.6 2.9-3.3z"/></svg>'
    },
    {
      id: 'coin',
      name: 'Монета / Поинты',
      category: 'donate',
      tags: 'монета баллы поинты награды',
      accentColor: '#FBBF24',
      secondaryColor: '#D97706',
      defaultTitle: 'Баллы канала',
      placeholderHandle: 'Копи награды!',
      placeholderUrl: '',
      svg: '<svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M12 2a10 10 0 1 0 0 20 10 10 0 0 0 0-20zm0 3a7 7 0 1 1 0 14 7 7 0 0 1 0-14zm-.9 3v8h1.8V8h-1.8z"/></svg>'
    },
    {
      id: 'bandcamp',
      name: 'Bandcamp',
      category: 'gaming',
      tags: 'бендкемп музыка альбомы',
      accentColor: '#629AA9',
      secondaryColor: '#1DA0C3',
      defaultTitle: 'Bandcamp',
      placeholderHandle: 'artist.bandcamp.com',
      placeholderUrl: 'https://bandcamp.com',
      svg: '<svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M2 18 8.3 6H22l-6.3 12H2z"/></svg>'
    },
    {
      id: 'nintendo',
      name: 'Nintendo Switch',
      category: 'gaming',
      tags: 'нинтендо свитч консоль игры',
      accentColor: '#E60012',
      secondaryColor: '#FF4E45',
      defaultTitle: 'Nintendo',
      placeholderHandle: 'SW-0000-0000-0000',
      placeholderUrl: '',
      svg: '<svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M10.5 3H7a4 4 0 0 0-4 4v10a4 4 0 0 0 4 4h3.5V3zM7 10.5a1.5 1.5 0 1 1 0-3 1.5 1.5 0 0 1 0 3zM17 3h-3.5v18H17a4 4 0 0 0 4-4V7a4 4 0 0 0-4-4zm0 11.5a1.5 1.5 0 1 1 0-3 1.5 1.5 0 0 1 0 3z"/></svg>'
    },
    {
      id: 'goodgame',
      name: 'GoodGame',
      category: 'streaming',
      tags: 'гудгейм стрим gg',
      accentColor: '#3B82F6',
      secondaryColor: '#1D4ED8',
      defaultTitle: 'GoodGame',
      placeholderHandle: 'goodgame.ru/channel',
      placeholderUrl: 'https://goodgame.ru',
      svg: '<svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M12 2a10 10 0 1 0 10 10h-9v3h5.4A6.5 6.5 0 1 1 12 5.5c1.8 0 3.4.7 4.6 1.9l2.2-2.2A9.96 9.96 0 0 0 12 2z"/></svg>'
    },
    {
      id: 'phone',
      name: 'Телефон / Контакт',
      category: 'badges',
      tags: 'телефон звонок контакт ватсап',
      accentColor: '#10B981',
      secondaryColor: '#059669',
      defaultTitle: 'Контакты',
      placeholderHandle: '+7 (000) 000-00-00',
      placeholderUrl: '',
      svg: '<svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M6.6 10.8a15.1 15.1 0 0 0 6.6 6.6l2.2-2.2a1 1 0 0 1 1-.24c1.1.36 2.3.56 3.6.56a1 1 0 0 1 1 1V20a1 1 0 0 1-1 1C10.6 21 3 13.4 3 4a1 1 0 0 1 1-1h3.5a1 1 0 0 1 1 1c0 1.3.2 2.5.56 3.6a1 1 0 0 1-.24 1l-2.22 2.2z"/></svg>'
    },
    {
      id: 'clock',
      name: 'Время / Таймер',
      category: 'badges',
      tags: 'часы время расписание эфир',
      accentColor: '#38BDF8',
      secondaryColor: '#0EA5E9',
      defaultTitle: 'Эфир в 19:00',
      placeholderHandle: 'Каждый день по МСК',
      placeholderUrl: '',
      svg: '<svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M12 2a10 10 0 1 0 0 20 10 10 0 0 0 0-20zm1 10.4 3.7 2.2-1 1.7-4.7-2.8V7h2v5.4z"/></svg>'
    },
    {
      id: 'check',
      name: 'Цель / Чеклист',
      category: 'badges',
      tags: 'цель чеклист готово выполнение',
      accentColor: '#22C55E',
      secondaryColor: '#16A34A',
      defaultTitle: 'Цель стрима',
      placeholderHandle: 'Добиваем цель!',
      placeholderUrl: '',
      svg: '<svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M12 2a10 10 0 1 0 0 20 10 10 0 0 0 0-20zm-1.2 14.2-4-4 1.4-1.4 2.6 2.6 5.4-5.4 1.4 1.4-6.8 6.8z"/></svg>'
    }
  ];

  var PLATFORM_MAP = Object.create(null);
  PLATFORMS.forEach(function (p) {
    PLATFORM_MAP[p.id] = p;
  });

  function getPlatform(id) {
    return PLATFORM_MAP[id] || PLATFORM_MAP.link;
  }

  function getCategories() {
    return CATEGORIES.slice();
  }

  function searchPlatforms(query, category) {
    var q = String(query || '').trim().toLowerCase();
    var cat = category && category !== 'all' ? category : '';
    return PLATFORMS.filter(function (p) {
      if (cat && p.category !== cat) return false;
      if (!q) return true;
      return (
        p.id.toLowerCase().indexOf(q) !== -1 ||
        p.name.toLowerCase().indexOf(q) !== -1 ||
        p.defaultTitle.toLowerCase().indexOf(q) !== -1 ||
        (p.tags && p.tags.toLowerCase().indexOf(q) !== -1)
      );
    });
  }

  function sanitizeSvg(raw) {
    if (typeof raw !== 'string') return '';
    var trimmed = raw.trim();
    if (!trimmed || trimmed.toLowerCase().indexOf('<svg') === -1) return '';

    var cleaned = trimmed
      .replace(/<\?xml[\s\S]*?\?>/gi, '')
      .replace(/<!DOCTYPE[\s\S]*?>/gi, '')
      .replace(/<script[\s\S]*?>[\s\S]*?<\/script>/gi, '')
      .replace(/<script[^>]*\/>/gi, '')
      .replace(/<foreignObject[\s\S]*?>[\s\S]*?<\/foreignObject>/gi, '')
      .replace(/<iframe[\s\S]*?>[\s\S]*?<\/iframe>/gi, '')
      .replace(/<object[\s\S]*?>[\s\S]*?<\/object>/gi, '')
      .replace(/<embed[^>]*>/gi, '')
      .replace(/\son[a-z]+\s*=\s*(?:"[^"]*"|'[^']*'|[^\s>]+)/gi, '')
      .replace(/(?:href|xlink:href|src)\s*=\s*(?:"\s*javascript:[^"]*"|'\s*javascript:[^']*')/gi, '');

    var match = cleaned.match(/<svg[\s\S]*<\/svg>/i);
    if (!match) return '';
    var svg = match[0];

    if (!/\saria-hidden\s*=/i.test(svg)) {
      svg = svg.replace(/<svg/i, '<svg aria-hidden="true"');
    }
    return svg;
  }

  function isSafeImageSrc(src) {
    if (typeof src !== 'string') return false;
    var s = src.trim();
    if (!s) return false;
    if (/^https?:\/\//i.test(s)) return true;
    if (/^\/uploads\/[a-zA-Z0-9._-]+\.(?:png|jpe?g|gif|webp|svg)$/i.test(s) && s.indexOf('..') === -1) return true;
    if (/^data:image\/(?:png|jpeg|jpg|gif|webp|svg\+xml);base64,[a-z0-9+/=]+$/i.test(s)) return true;
    return false;
  }

  function escapeHtml(str) {
    return String(str || '')
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;');
  }

  function renderIconHtml(item) {
    var type = (item && item.iconType) || 'preset';
    if (type === 'image' && isSafeImageSrc(item.iconImage)) {
      return '<img class="card-icon-img" src="' + escapeHtml(item.iconImage.trim()) + '" alt="" draggable="false">';
    }
    if (type === 'svg' && item.iconSvg) {
      var safe = sanitizeSvg(item.iconSvg);
      if (safe) return safe;
    }
    if (type === 'emoji' && item.iconEmoji) {
      return '<span class="card-icon-emoji">' + escapeHtml(String(item.iconEmoji).slice(0, 6)) + '</span>';
    }
    var platform = getPlatform((item && (item.iconPreset || item.platform)) || 'link');
    return platform.svg;
  }

  return {
    CATEGORIES: CATEGORIES,
    PLATFORMS: PLATFORMS,
    getCategories: getCategories,
    getPlatform: getPlatform,
    searchPlatforms: searchPlatforms,
    sanitizeSvg: sanitizeSvg,
    isSafeImageSrc: isSafeImageSrc,
    renderIconHtml: renderIconHtml
  };
});
