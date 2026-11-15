import type { MetadataRoute } from 'next';

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'Kombat — Sảnh Trò Chơi Indie 16-Bit',
    short_name: 'Kombat',
    description: 'Sảnh trò chơi mini phong cách arcade cổ điển: Sudoku, Cờ vua, Cờ tướng và Cờ Caro.',
    start_url: '/',
    id: '/',
    display: 'standalone',
    background_color: '#F4F1EA',
    theme_color: '#18181B',
    orientation: 'portrait-primary',
    categories: ['games', 'entertainment'],
    lang: 'vi',
    icons: [
      {
        src: '/icon-192.png',
        sizes: '192x192',
        type: 'image/png',
        purpose: 'any',
      },
      {
        src: '/icon-512.png',
        sizes: '512x512',
        type: 'image/png',
        purpose: 'any',
      },
      {
        src: '/icon-512.png',
        sizes: '512x512',
        type: 'image/png',
        purpose: 'maskable',
      },
      {
        src: '/icon.svg?v=pixel',
        sizes: 'any',
        type: 'image/svg+xml',
        purpose: 'any',
      },
    ],
  };
}

