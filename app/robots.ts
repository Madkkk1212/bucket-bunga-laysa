import type { MetadataRoute } from 'next';

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: '*',
      allow: '/',
      disallow: [
        '/lys-atelier-vault-89x',
        '/lys-atelier-vault-89x/*',
        '/admin',
        '/admin/*',
        '/api/admin/*',
        '/api/settings/*',
      ],
    },
    sitemap: 'https://giftbucket.web.id/sitemap.xml',
  };
}
