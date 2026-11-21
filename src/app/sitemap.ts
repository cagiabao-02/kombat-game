import type { MetadataRoute } from 'next';

const GAME_ROUTES = [
  '/games/sudoku',
  '/games/chess',
  '/games/caro',
  '/games/xiangqi',
  '/games/go',
  '/games/snake',
  '/games/game2048',
  '/games/minesweeper',
  '/games/brick-breaker',
  '/games/t-rex-runner',
  '/games/flappy-bird',
  '/games/block-blast',
  '/games/tetris',
];

export default function sitemap(): MetadataRoute.Sitemap {
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://kombat-red.vercel.app';
  const lastModified = new Date();

  return [
    {
      url: siteUrl,
      lastModified,
      changeFrequency: 'weekly',
      priority: 1,
    },
    ...GAME_ROUTES.map((route) => ({
      url: `${siteUrl}${route}`,
      lastModified,
      changeFrequency: 'monthly' as const,
      priority: 0.8,
    })),
  ];
}
