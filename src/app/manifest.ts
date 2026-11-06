import type { MetadataRoute } from 'next';

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'Kombat — Sảnh Mini-Game Indie',
    short_name: 'Kombat',
    description: 'Sảnh trò chơi mini gọn nhẹ: Sudoku một người và Cờ vua phòng riêng.',
    start_url: '/',
    display: 'standalone',
    background_color: '#F6F7FB',
    theme_color: '#4F46E5',
    orientation: 'portrait-primary',
    icons: [
      {
        src: '/icon.svg',
        sizes: 'any',
        type: 'image/svg+xml',
        purpose: 'any',
      },
      {
        src: '/icon.svg',
        sizes: '512x512',
        type: 'image/svg+xml',
        purpose: 'maskable',
      },
    ],
  };
}

