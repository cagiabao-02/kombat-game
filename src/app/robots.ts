import type { MetadataRoute } from 'next';

export default function robots(): MetadataRoute.Robots {
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://kombat-red.vercel.app';

  return {
    rules: [
      {
        userAgent: '*',
        allow: ['/', '/games/'],
        disallow: ['/api/'],
      },
    ],
    sitemap: `${siteUrl}/sitemap.xml`,
  };
}
