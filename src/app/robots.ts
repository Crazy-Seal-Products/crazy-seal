import type { MetadataRoute } from 'next'

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: ['/admin/', '/pro/', '/api/'],
      },
    ],
    sitemap: 'https://crazyseal.com/sitemap.xml',
  }
}
