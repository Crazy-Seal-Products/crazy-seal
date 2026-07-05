import type { MetadataRoute } from 'next'

const BASE_URL = 'https://rv-armor.com'

export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date().toISOString()

  const mainPages = [
    { url: '/', changeFrequency: 'weekly' as const, priority: 1.0 },
    { url: '/rv-armor/', changeFrequency: 'monthly' as const, priority: 0.9 },
    { url: '/pricing/', changeFrequency: 'monthly' as const, priority: 0.9 },
    { url: '/advantages/', changeFrequency: 'monthly' as const, priority: 0.8 },
    { url: '/warranty/', changeFrequency: 'monthly' as const, priority: 0.8 },
    { url: '/insurance/', changeFrequency: 'monthly' as const, priority: 0.8 },
    { url: '/insurance/adjusters/', changeFrequency: 'monthly' as const, priority: 0.7 },
    { url: '/services/', changeFrequency: 'monthly' as const, priority: 0.8 },
    { url: '/about/', changeFrequency: 'monthly' as const, priority: 0.7 },
    { url: '/photos/', changeFrequency: 'weekly' as const, priority: 0.8 },
    { url: '/reviews/', changeFrequency: 'weekly' as const, priority: 0.8 },
    { url: '/contact/', changeFrequency: 'monthly' as const, priority: 0.9 },
    { url: '/faq/', changeFrequency: 'monthly' as const, priority: 0.8 },
    { url: '/financing/', changeFrequency: 'monthly' as const, priority: 0.7 },
    { url: '/our-work/', changeFrequency: 'weekly' as const, priority: 0.7 },
    { url: '/blog/', changeFrequency: 'weekly' as const, priority: 0.6 },
    { url: '/techs/', changeFrequency: 'monthly' as const, priority: 0.5 },
    { url: '/tech-application/', changeFrequency: 'monthly' as const, priority: 0.4 },
    { url: '/newsletter/', changeFrequency: 'monthly' as const, priority: 0.4 },
  ]

  const contentPages = [
    '/how-to-prep-your-rv-for-your-new-rv-armor-roof/',
    '/the-permanent-roof-coating-for-your-travel-trailer/',
    '/the-care-and-cleaning-of-your-rv-armor-roof/',
  ]

  const promoPages = [
    '/beat-the-spring-rush/',
    '/christmas-in-july/',
    '/end-of-the-year-sale/',
    '/fall-into-savings/',
    '/relief-sale/',
    '/southern-savings/',
    '/year-end-and-southern-savings-sale/',
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
    ...contentPages.map((url) => ({
      url: `${BASE_URL}${url}`,
      lastModified: now,
      changeFrequency: 'monthly' as const,
      priority: 0.6,
    })),
    ...promoPages.map((url) => ({
      url: `${BASE_URL}${url}`,
      lastModified: now,
      changeFrequency: 'monthly' as const,
      priority: 0.5,
    })),
    ...legalPages.map((url) => ({
      url: `${BASE_URL}${url}`,
      lastModified: now,
      changeFrequency: 'yearly' as const,
      priority: 0.3,
    })),
  ]
}
