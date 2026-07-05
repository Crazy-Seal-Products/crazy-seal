import type { MetadataRoute } from 'next'

const BASE_URL = 'https://crazyseal.com'

export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date().toISOString()

  const mainPages = [
    { url: '/', changeFrequency: 'weekly' as const, priority: 1.0 },
    { url: '/crazy-seal/', changeFrequency: 'monthly' as const, priority: 0.9 },
    { url: '/pricing/', changeFrequency: 'monthly' as const, priority: 0.9 },
    { url: '/advantages/', changeFrequency: 'monthly' as const, priority: 0.8 },
    { url: '/products/', changeFrequency: 'monthly' as const, priority: 0.8 },
    { url: '/applications/', changeFrequency: 'monthly' as const, priority: 0.8 },
    { url: '/rv-roofs/', changeFrequency: 'monthly' as const, priority: 0.9 },
    { url: '/commercial-roofing/', changeFrequency: 'monthly' as const, priority: 0.8 },
    { url: '/residential/', changeFrequency: 'monthly' as const, priority: 0.8 },
    { url: '/transportation/', changeFrequency: 'monthly' as const, priority: 0.8 },
    { url: '/facilities/', changeFrequency: 'monthly' as const, priority: 0.7 },
    { url: '/installation/', changeFrequency: 'monthly' as const, priority: 0.8 },
    { url: '/installation/membrane-roof/', changeFrequency: 'monthly' as const, priority: 0.7 },
    { url: '/installation/direct-to-deck/', changeFrequency: 'monthly' as const, priority: 0.7 },
    { url: '/warranty/', changeFrequency: 'monthly' as const, priority: 0.8 },
    { url: '/professionals/', changeFrequency: 'monthly' as const, priority: 0.7 },
    { url: '/business-accelerator-program/', changeFrequency: 'monthly' as const, priority: 0.6 },
    { url: '/professionals/rv/', changeFrequency: 'monthly' as const, priority: 0.6 },
    { url: '/professionals/facilities/', changeFrequency: 'monthly' as const, priority: 0.6 },
    { url: '/professionals/restaurants/', changeFrequency: 'monthly' as const, priority: 0.6 },
    { url: '/ways-to-earn/', changeFrequency: 'monthly' as const, priority: 0.6 },
    { url: '/professional-tools/', changeFrequency: 'monthly' as const, priority: 0.6 },
    { url: '/rv-roofing/', changeFrequency: 'monthly' as const, priority: 0.6 },
    { url: '/facilities-overview/', changeFrequency: 'monthly' as const, priority: 0.6 },
    { url: '/technical-data/', changeFrequency: 'monthly' as const, priority: 0.6 },
    { url: '/ordering/', changeFrequency: 'monthly' as const, priority: 0.6 },
    { url: '/custom-orders/', changeFrequency: 'monthly' as const, priority: 0.6 },
    { url: '/build-your-own-kit/', changeFrequency: 'monthly' as const, priority: 0.6 },
    { url: '/return-policy/', changeFrequency: 'yearly' as const, priority: 0.4 },
    { url: '/about/', changeFrequency: 'monthly' as const, priority: 0.7 },
    { url: '/reviews/', changeFrequency: 'weekly' as const, priority: 0.8 },
    { url: '/contact/', changeFrequency: 'monthly' as const, priority: 0.9 },
    { url: '/faq/', changeFrequency: 'monthly' as const, priority: 0.8 },
  ]

  const legalPages = [
    '/privacy-policy/',
    '/terms-and-conditions/',
  ]

  return [
    ...mainPages.map((page) => ({
      url: `${BASE_URL}${page.url}`,
      lastModified: now,
      changeFrequency: page.changeFrequency,
      priority: page.priority,
    })),
    ...legalPages.map((url) => ({
      url: `${BASE_URL}${url}`,
      lastModified: now,
      changeFrequency: 'yearly' as const,
      priority: 0.3,
    })),
  ]
}
