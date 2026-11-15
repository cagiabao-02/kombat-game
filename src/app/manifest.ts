import type { MetadataRoute } from 'next';

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'Kombat — Sảnh Mini-Game Indie',
    short_name: 'Kombat',
    description: 'Sảnh trò chơi mini gọn nhẹ: Sudoku một người và Cờ vua phòng riêng.',
    start_url: '/',
    display: 'standalone',
    background_color: '#F4F1EA',
    theme_color: '#18181B',
    orientation: 'portrait-primary',
    icons: [
      {
        src: '/icon.svg?v=pixel',
        sizes: 'any',
        type: 'image/svg+xml',
        purpose: 'any',
      },
      {
        src: '/icon.svg?v=pixel',
        sizes: '512x512',
        type: 'image/svg+xml',
        purpose: 'maskable',
      },
    ],
  };
}

