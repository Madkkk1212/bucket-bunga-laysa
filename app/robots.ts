import type { MetadataRoute } from 'next';

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: '*',
      allow: '/',
      disallow: ['/admin', '/admin/*', '/api/admin/*', '/api/settings/*'],
    },
    sitemap: 'https://bucketbunga-laysa.vercel.app/sitemap.xml',
  };
}
