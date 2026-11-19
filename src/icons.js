(function (root, factory) {
  if (typeof module === 'object' && module.exports) {
    module.exports = factory();
  } else {
    root.ObsSocialIcons = factory();
  }
})(typeof globalThis !== 'undefined' ? globalThis : this, function () {
  'use strict';

  var PLATFORMS = [
    {
      id: 'telegram',
      name: 'Telegram',
      accentColor: '#2AABEE',
      secondaryColor: '#229ED9',
      defaultTitle: 'Telegram',
      placeholderHandle: '@username',
      placeholderUrl: 'https://t.me/username',
      svg: '<svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M21.94 4.66c.22-1.02-.38-1.42-1.31-1.06L2.88 10.46c-1.21.48-1.2 1.16-.22 1.46l4.54 1.42 10.52-6.64c.5-.31.96-.14.58.19l-8.52 7.69-.31 4.66c.46 0 .66-.21.92-.46l2.21-2.15 4.6 3.39c.85.47 1.45.23 1.66-.78l3.08-14.58z"/></svg>'
    },
    {
      id: 'twitch',
      name: 'Twitch',
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
      accentColor: '#FF0033',
      secondaryColor: '#CC0022',
      defaultTitle: 'YouTube',
      placeholderHandle: '@channel',
      placeholderUrl: 'https://youtube.com/@channel',
      svg: '<svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M23.15 7.2a3.01 3.01 0 0 0-2.12-2.13C19.16 4.56 12 4.56 12 4.56s-7.16 0-9.03.51A3.01 3.01 0 0 0 .85 7.2C.35 9.08.35 12 .35 12s0 2.92.5 4.8a3.01 3.01 0 0 0 2.12 2.13c1.87.51 9.03.51 9.03.51s7.16 0 9.03-.51a3.01 3.01 0 0 0 2.12-2.13c.5-1.88.5-4.8.5-4.8s0-2.92-.5-4.8zM9.67 15.18V8.82L15.27 12l-5.6 3.18z"/></svg>'
    },
    {
      id: 'discord',
      name: 'Discord',
      accentColor: '#5865F2',
      secondaryColor: '#4752C4',
      defaultTitle: 'Discord',
      placeholderHandle: 'discord.gg/server',
      placeholderUrl: 'https://discord.gg/server',
      svg: '<svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M20.32 4.37a19.8 19.8 0 0 0-4.89-1.52.07.07 0 0 0-.08.04c-.21.38-.44.87-.61 1.25a18.27 18.27 0 0 0-5.48 0c-.17-.39-.41-.87-.62-1.25a.08.08 0 0 0-.08-.04A19.74 19.74 0 0 0 3.67 4.37a.07.07 0 0 0-.03.03C.53 9.05-.32 13.58.1 18.06a.08.08 0 0 0 .03.05 19.9 19.9 0 0 0 5.99 3.03.08.08 0 0 0 .08-.03c.46-.63.87-1.3 1.23-2a.08.08 0 0 0-.04-.11 13.1 13.1 0 0 1-1.87-.9.08.08 0 0 1-.01-.12c.13-.09.25-.19.37-.29a.07.07 0 0 1 .08-.01c3.93 1.8 8.18 1.8 12.06 0a.07.07 0 0 1 .08.01c.12.1.25.2.37.29a.08.08 0 0 1-.01.13c-.6.35-1.22.65-1.87.89a.08.08 0 0 0-.04.11c.36.7.78 1.37 1.22 2a.08.08 0 0 0 .08.03 19.83 19.83 0 0 0 6-3.03.08.08 0 0 0 .03-.05c.5-5.18-.84-9.67-3.55-13.66a.06.06 0 0 0-.03-.03zM8.02 15.33c-1.18 0-2.16-1.08-2.16-2.42 0-1.33.96-2.42 2.16-2.42 1.21 0 2.18 1.1 2.16 2.42 0 1.34-.96 2.42-2.16 2.42zm7.97 0c-1.18 0-2.16-1.08-2.16-2.42 0-1.33.96-2.42 2.16-2.42 1.21 0 2.18 1.1 2.16 2.42 0 1.34-.95 2.42-2.16 2.42z"/></svg>'
    },
    {
      id: 'vk',
      name: 'VK',
      accentColor: '#0077FF',
      secondaryColor: '#0055CC',
      defaultTitle: 'ВКонтакте',
      placeholderHandle: 'vk.com/channel',
      placeholderUrl: 'https://vk.com/channel',
      svg: '<svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M13.16 18.25c-6.88 0-10.8-4.72-10.96-12.56h3.44c.11 5.75 2.65 8.18 4.66 8.68V5.69h3.24v4.95c1.98-.21 4.07-2.47 4.77-4.95h3.24c-.54 3.06-2.81 5.32-4.42 6.26 1.61.75 4.2 2.72 5.19 6.3h-3.57c-.76-2.38-2.66-4.22-5.18-4.47v4.47h-.41z"/></svg>'
    },
    {
      id: 'vkplay',
      name: 'VK Video Live',
      accentColor: '#0077FF',
      secondaryColor: '#4F46E5',
      defaultTitle: 'VK Video Live',
      placeholderHandle: 'live.vkvideo.ru/nick',
      placeholderUrl: 'https://live.vkvideo.ru/nick',
      svg: '<svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M4.5 3.5h15A2.5 2.5 0 0 1 22 6v12a2.5 2.5 0 0 1-2.5 2.5h-15A2.5 2.5 0 0 1 2 18V6a2.5 2.5 0 0 1 2.5-2.5zm5.2 4.7v7.6L16.3 12 9.7 8.2z"/></svg>'
    },
    {
      id: 'kick',
      name: 'Kick',
      accentColor: '#53FC18',
      secondaryColor: '#22C55E',
      defaultTitle: 'Kick',
      placeholderHandle: 'kick.com/channel',
      placeholderUrl: 'https://kick.com/channel',
      svg: '<svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M3 2h6.5v6h2.2V5h2.2V2H21v6.5h-3v3h-2.5v1H18v3h3V22h-7.1v-3h-2.2v-3H9.5v6H3V2z"/></svg>'
    },
    {
      id: 'tiktok',
      name: 'TikTok',
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
      accentColor: '#E2E8F0',
      secondaryColor: '#94A3B8',
      defaultTitle: 'X / Twitter',
      placeholderHandle: '@username',
      placeholderUrl: 'https://x.com/username',
      svg: '<svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M18.24 2.25h3.31l-7.23 8.26L22.82 21.75h-6.66l-5.21-6.82-5.97 6.82H1.67l7.73-8.84L1.25 2.25h6.83l4.71 6.23 5.45-6.23zm-1.16 17.52h1.83L7.08 4.13H5.12l11.96 15.64z"/></svg>'
    },
    {
      id: 'boosty',
      name: 'Boosty',
      accentColor: '#F15F2C',
      secondaryColor: '#E11D48',
      defaultTitle: 'Boosty',
      placeholderHandle: 'boosty.to/channel',
      placeholderUrl: 'https://boosty.to/channel',
      svg: '<svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M10.4 2.2 4.8 14.3h4.5l-1.9 7.5L18.9 9.7h-4.8l2.5-7.5h-6.2zm2.6 2.1-1.8 5.4h3.9l-5.1 6.4.9-3.9H7.6L13 4.3z"/></svg>'
    },
    {
      id: 'donationalerts',
      name: 'Донат / Support',
      accentColor: '#F57D07',
      secondaryColor: '#FBBF24',
      defaultTitle: 'Поддержка',
      placeholderHandle: 'donationalerts.com/r/nick',
      placeholderUrl: 'https://donationalerts.com/r/nick',
      svg: '<svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1.2 15.4v1.1h-2.1v-1.12c-1.56-.32-2.66-1.28-2.75-2.63h1.89c.11.71.68 1.2 1.72 1.2 1.07 0 1.65-.45 1.65-1.08 0-.67-.54-.98-2.06-1.31-1.92-.42-3.03-1.11-3.03-2.64 0-1.33 1.04-2.31 2.58-2.62V7.2h2.1v1.11c1.46.31 2.41 1.22 2.52 2.48h-1.88c-.1-.64-.62-1.07-1.49-1.07-.94 0-1.48.41-1.48 1.01 0 .61.53.91 1.98 1.24 2.02.45 3.11 1.15 3.11 2.71 0 1.44-1.1 2.42-2.76 2.72z"/></svg>'
    },
    {
      id: 'steam',
      name: 'Steam',
      accentColor: '#66C0F4',
      secondaryColor: '#1B2838',
      defaultTitle: 'Steam',
      placeholderHandle: 'steamcommunity.com/id/nick',
      placeholderUrl: 'https://steamcommunity.com/id/nick',
      svg: '<svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M12 2a10 10 0 0 0-9.95 9.02l5.35 2.21a2.84 2.84 0 0 1 1.6-.49l2.39-3.46v-.05a3.78 3.78 0 1 1 3.78 3.78h-.09l-3.41 2.43a2.85 2.85 0 0 1-5.64.54l-3.83-1.58A10 10 0 1 0 12 2zm-4.4 14.37-1.22-.5a2.13 2.13 0 0 0 3.86-.23 2.13 2.13 0 0 0-2.64-2.74l1.26.52a1.57 1.57 0 0 1-1.26 2.95zm10.09-7.14a2.52 2.52 0 1 0-5.04 0 2.52 2.52 0 0 0 5.04 0zm-4.41 0a1.89 1.89 0 1 1 3.78 0 1.89 1.89 0 0 1-3.78 0z"/></svg>'
    },
    {
      id: 'trovo',
      name: 'Trovo',
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
      accentColor: '#00A8FF',
      secondaryColor: '#0284C7',
      defaultTitle: 'Rutube',
      placeholderHandle: 'rutube.ru/u/channel',
      placeholderUrl: 'https://rutube.ru/u/channel',
      svg: '<svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M5 4h9.2c3.2 0 5.3 1.9 5.3 4.8 0 2.1-1.1 3.7-2.9 4.4L19.8 20h-4l-2.8-6.1H8.6V20H5V4zm3.6 3v4h5.1c1.3 0 2.1-.7 2.1-2s-.8-2-2.1-2H8.6z"/><circle cx="20.2" cy="5.2" r="2"/></svg>'
    },
    {
      id: 'dzen',
      name: 'Дзен',
      accentColor: '#F8FAFC',
      secondaryColor: '#94A3B8',
      defaultTitle: 'Дзен',
      placeholderHandle: 'dzen.ru/channel',
      placeholderUrl: 'https://dzen.ru/channel',
      svg: '<svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M12 2c.3 6.2 2.8 9.7 10 10-7.2.3-9.7 3.8-10 10-.3-6.2-2.8-9.7-10-10 7.2-.3 9.7-3.8 10-10z"/></svg>'
    },
    {
      id: 'spotify',
      name: 'Spotify',
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
      accentColor: '#FF5500',
      secondaryColor: '#EA580C',
      defaultTitle: 'SoundCloud',
      placeholderHandle: 'soundcloud.com/artist',
      placeholderUrl: 'https://soundcloud.com/artist',
      svg: '<svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M11.5 7.4c-.3 0-.5.2-.5.5v8.6c0 .3.2.5.5.5h7.2c1.8 0 3.3-1.4 3.3-3.2 0-1.6-1.2-3-2.8-3.2-.5-2-2.3-3.5-4.5-3.5-1.2 0-2.3.5-3.1 1.3zm-2.3 1.7a.5.5 0 0 0-.5.5v6.9a.5.5 0 0 0 1 0V9.6a.5.5 0 0 0-.5-.5zm-2.2 1.4a.5.5 0 0 0-.5.5v5.5a.5.5 0 0 0 1 0V11a.5.5 0 0 0-.5-.5zm-2.2 1.2a.5.5 0 0 0-.5.5v4.3a.5.5 0 0 0 1 0v-4.3a.5.5 0 0 0-.5-.5zm-2.2 1.4a.5.5 0 0 0-.5.5v2.9a.5.5 0 0 0 1 0v-2.9a.5.5 0 0 0-.5-.5z"/></svg>'
    },
    {
      id: 'github',
      name: 'GitHub',
      accentColor: '#E2E8F0',
      secondaryColor: '#64748B',
      defaultTitle: 'GitHub',
      placeholderHandle: 'github.com/username',
      placeholderUrl: 'https://github.com/username',
      svg: '<svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M12 2a10 10 0 0 0-3.16 19.49c.5.09.68-.22.68-.48v-1.7c-2.78.6-3.37-1.18-3.37-1.18-.45-1.15-1.11-1.46-1.11-1.46-.91-.62.07-.61.07-.61 1 .07 1.53 1.03 1.53 1.03.9 1.53 2.35 1.09 2.92.83.09-.65.35-1.09.64-1.34-2.22-.25-4.55-1.11-4.55-4.94 0-1.09.39-1.98 1.03-2.68-.1-.25-.45-1.27.1-2.65 0 0 .84-.27 2.75 1.02a9.56 9.56 0 0 1 5 0c1.91-1.29 2.75-1.02 2.75-1.02.55 1.38.2 2.4.1 2.65.64.7 1.03 1.59 1.03 2.68 0 3.84-2.34 4.69-4.57 4.93.36.31.68.92.68 1.85v2.75c0 .27.18.58.69.48A10 10 0 0 0 12 2z"/></svg>'
    },
    {
      id: 'reddit',
      name: 'Reddit',
      accentColor: '#FF4500',
      secondaryColor: '#EA580C',
      defaultTitle: 'Reddit',
      placeholderHandle: 'r/community',
      placeholderUrl: 'https://reddit.com/r/community',
      svg: '<svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M12 2a10 10 0 1 0 0 20 10 10 0 0 0 0-20zm5.8 11.4c.1.2.1.5.1.7 0 2.5-2.9 4.5-6.5 4.5s-6.5-2-6.5-4.5c0-.3 0-.5.1-.7A1.45 1.45 0 0 1 4.2 12a1.5 1.5 0 0 1 2.5-1.1 7.3 7.3 0 0 1 4.8-1.5l.9-4.1a.4.4 0 0 1 .5-.3l2.9.6a1.1 1.1 0 1 1-.2.8l-2.5-.5-.8 3.5a7.3 7.3 0 0 1 4.7 1.5A1.5 1.5 0 0 1 19.8 12c0 .6-.4 1.2-1 1.4zM9.2 12.6a1.1 1.1 0 1 0 0 2.2 1.1 1.1 0 0 0 0-2.2zm5.6 0a1.1 1.1 0 1 0 0 2.2 1.1 1.1 0 0 0 0-2.2zm-5.1 3.7c.7.7 1.8 1 2.8 1s2.1-.3 2.8-1a.4.4 0 0 0-.6-.5c-.5.5-1.4.8-2.2.8-.8 0-1.7-.3-2.2-.8a.4.4 0 1 0-.6.5z"/></svg>'
    },
    {
      id: 'threads',
      name: 'Threads',
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
      accentColor: '#0085FF',
      secondaryColor: '#38BDF8',
      defaultTitle: 'Bluesky',
      placeholderHandle: '@nick.bsky.social',
      placeholderUrl: 'https://bsky.app',
      svg: '<svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M5.2 4.3C7.9 6.3 10.8 10.4 12 12.8c1.2-2.4 4.1-6.5 6.8-8.5 2-1.5 5.2-2.7 5.2 1 0 .7-.4 6-0.7 6.9-.9 3-4 3.8-6.8 3.3 4.8.8 6.1 3.5 3.4 6.2-5 5.1-7.2-1.3-7.8-2.9-.1-.3-.15-.4-.1-.4.05 0 0 .1-.1.4-.6 1.6-2.8 8-7.8 2.9-2.7-2.7-1.4-5.4 3.4-6.2-2.8.5-5.9-.3-6.8-3.3C.4 11.3 0 6 0 5.3c0-3.7 3.2-2.5 5.2-1z"/></svg>'
    },
    {
      id: 'patreon',
      name: 'Patreon',
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
      accentColor: '#FF5E5B',
      secondaryColor: '#FB7185',
      defaultTitle: 'Ko-fi',
      placeholderHandle: 'ko-fi.com/creator',
      placeholderUrl: 'https://ko-fi.com/creator',
      svg: '<svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M3 6h14.5a3.5 3.5 0 0 1 0 7H17v1.5A4.5 4.5 0 0 1 12.5 19h-5A4.5 4.5 0 0 1 3 14.5V6zm14 5h.5a1.5 1.5 0 0 0 0-3H17v3zm-7 4.7 2.8-2.6a1.95 1.95 0 0 0-2.8-2.7 1.95 1.95 0 0 0-2.8 2.7L10 15.7z"/></svg>'
    },
    {
      id: 'gamepad',
      name: 'Игры / Squad',
      accentColor: '#A855F7',
      secondaryColor: '#7C3AED',
      defaultTitle: 'Игры',
      placeholderHandle: 'Играем вместе',
      placeholderUrl: 'https://discord.gg/server',
      svg: '<svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M6.8 6A4.8 4.8 0 0 0 2 10.8v4.1a3.1 3.1 0 0 0 5.4 2l1.8-2h5.6l1.8 2a3.1 3.1 0 0 0 5.4-2v-4.1A4.8 4.8 0 0 0 17.2 6H6.8zM8 9.2h1.6v1.8h1.8v1.6H9.6v1.8H8v-1.8H6.2V11H8V9.2zm7.7.6a1.1 1.1 0 1 1 0 2.2 1.1 1.1 0 0 1 0-2.2zm2.3 2.3a1.1 1.1 0 1 1 0 2.2 1.1 1.1 0 0 1 0-2.2z"/></svg>'
    },
    {
      id: 'heart',
      name: 'Спасибо / Follow',
      accentColor: '#F43F5E',
      secondaryColor: '#EC4899',
      defaultTitle: 'Подпишись',
      placeholderHandle: 'Спасибо за поддержку!',
      placeholderUrl: '',
      svg: '<svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/></svg>'
    },
    {
      id: 'star',
      name: 'VIP / Prime',
      accentColor: '#FBBF24',
      secondaryColor: '#F59E0B',
      defaultTitle: 'VIP / Бонусы',
      placeholderHandle: 'Эксклюзивный контент',
      placeholderUrl: '',
      svg: '<svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="m12 2.5 2.9 5.88 6.49.94-4.7 4.58 1.11 6.46L12 17.31l-5.8 3.05 1.11-6.46-4.7-4.58 6.49-.94L12 2.5z"/></svg>'
    },
    {
      id: 'shop',
      name: 'Мерч / Магазин',
      accentColor: '#10B981',
      secondaryColor: '#14B8A6',
      defaultTitle: 'Магазин',
      placeholderHandle: 'shop.example.com',
      placeholderUrl: 'https://example.com',
      svg: '<svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M6 7V6a6 6 0 1 1 12 0v1h2.5a.5.5 0 0 1 .5.5l.9 12a2 2 0 0 1-2 2.15H4.1a2 2 0 0 1-2-2.15L3 7.5a.5.5 0 0 1 .5-.5H6zm2 0h8V6a4 4 0 1 0-8 0v1zm1 4a1 1 0 1 0 2 0V9.5H9V11zm6 0a1 1 0 1 0 2 0V9.5h-2V11z"/></svg>'
    },
    {
      id: 'globe',
      name: 'Сайт / Website',
      accentColor: '#38BDF8',
      secondaryColor: '#0284C7',
      defaultTitle: 'Website',
      placeholderHandle: 'mysite.com',
      placeholderUrl: 'https://mysite.com',
      svg: '<svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M12 2a10 10 0 1 0 0 20 10 10 0 0 0 0-20zm6.93 6h-3.17a15.2 15.2 0 0 0-1.38-3.56A8.03 8.03 0 0 1 18.93 8zM12 4.04c.83 1.2 1.48 2.53 1.91 3.96h-3.82c.43-1.43 1.08-2.76 1.91-3.96zM4.26 14C4.1 13.36 4 12.69 4 12s.1-1.36.26-2h3.38c-.08.66-.14 1.32-.14 2s.06 1.34.14 2H4.26zm.81 2h3.17c.32 1.25.78 2.45 1.38 3.56A8.03 8.03 0 0 1 5.07 16zm3.17-8H5.07a8.03 8.03 0 0 1 4.55-3.56C9.02 5.55 8.56 6.75 8.24 8zM12 19.96c-.83-1.2-1.48-2.53-1.91-3.96h3.82c-.43 1.43-1.08 2.76-1.91 3.96zM14.34 14H9.66c-.09-.66-.16-1.32-.16-2s.07-1.35.16-2h4.68c.09.65.16 1.32.16 2s-.07 1.34-.16 2zm.04 5.56c.6-1.11 1.06-2.31 1.38-3.56h3.17a8.03 8.03 0 0 1-4.55 3.56zM16.36 14c.08-.66.14-1.32.14-2s-.06-1.34-.14-2h3.38c.16.64.26 1.31.26 2s-.1 1.36-.26 2h-3.38z"/></svg>'
    },
    {
      id: 'mail',
      name: 'Почта / Бизнес',
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
      accentColor: '#94A3B8',
      secondaryColor: '#64748B',
      defaultTitle: 'Ссылка',
      placeholderHandle: 'linktr.ee/username',
      placeholderUrl: 'https://linktr.ee/username',
      svg: '<svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M10.59 13.41a1 1 0 0 1 0-1.41l3.18-3.18a1 1 0 1 1 1.41 1.41L12 13.41a1 1 0 0 1-1.41 0zm-2.83 5.66a4 4 0 0 1 0-5.66l2.12-2.12a1 1 0 0 1 1.41 1.41L9.17 14.83a2 2 0 1 0 2.83 2.83l2.12-2.12a1 1 0 0 1 1.41 1.41l-2.12 2.12a4 4 0 0 1-5.65 0zm5.66-14.14a4 4 0 0 1 5.65 5.65l-2.12 2.12a1 1 0 0 1-1.41-1.41l2.12-2.12a2 2 0 1 0-2.83-2.83l-2.12 2.12a1 1 0 0 1-1.41-1.41l2.12-2.12z"/></svg>'
    }
  ];

  var PLATFORM_MAP = Object.create(null);
  PLATFORMS.forEach(function (p) {
    PLATFORM_MAP[p.id] = p;
  });

  function getPlatform(id) {
    return PLATFORM_MAP[id] || PLATFORM_MAP.link;
  }

  function searchPlatforms(query) {
    var q = String(query || '').trim().toLowerCase();
    if (!q) return PLATFORMS.slice();
    return PLATFORMS.filter(function (p) {
      return (
        p.id.toLowerCase().indexOf(q) !== -1 ||
        p.name.toLowerCase().indexOf(q) !== -1 ||
        p.defaultTitle.toLowerCase().indexOf(q) !== -1
      );
    });
  }

  function sanitizeSvg(raw) {
    if (typeof raw !== 'string') return '';
    var trimmed = raw.trim();
    if (!trimmed || trimmed.toLowerCase().indexOf('<svg') === -1) return '';

    // Strip dangerous elements and event handlers / javascript URIs
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

    // Extract first <svg ...>...</svg> block
    var match = cleaned.match(/<svg[\s\S]*<\/svg>/i);
    if (!match) return '';
    var svg = match[0];

    // Ensure svg has aria-hidden
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
    PLATFORMS: PLATFORMS,
    getPlatform: getPlatform,
    searchPlatforms: searchPlatforms,
    sanitizeSvg: sanitizeSvg,
    isSafeImageSrc: isSafeImageSrc,
    renderIconHtml: renderIconHtml
  };
});
