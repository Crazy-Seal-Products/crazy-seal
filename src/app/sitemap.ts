import type { MetadataRoute } from 'next'
import { getPublishedProjects } from '@/lib/projects'
import { getStoreProducts } from '@/lib/store/products'

const BASE_URL = 'https://crazyseal.com'

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
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
    { url: '/projects/', changeFrequency: 'weekly' as const, priority: 0.8 },
    { url: '/contact/', changeFrequency: 'monthly' as const, priority: 0.9 },
    { url: '/faq/', changeFrequency: 'monthly' as const, priority: 0.8 },
    // Kit pages
    { url: '/single-layer-kit/', changeFrequency: 'monthly' as const, priority: 0.7 },
    { url: '/double-layer-kit/', changeFrequency: 'monthly' as const, priority: 0.7 },
    { url: '/direct-to-deck-kit/', changeFrequency: 'monthly' as const, priority: 0.7 },
    { url: '/crazy-good-repair-kit/', changeFrequency: 'monthly' as const, priority: 0.6 },
    // Product detail pages
    { url: '/products/crazy-seal-roof-membrane/', changeFrequency: 'monthly' as const, priority: 0.6 },
    { url: '/products/crazy-caulk/', changeFrequency: 'monthly' as const, priority: 0.6 },
    { url: '/products/crazy-tape/', changeFrequency: 'monthly' as const, priority: 0.6 },
    { url: '/products/crazy-patch/', changeFrequency: 'monthly' as const, priority: 0.6 },
    { url: '/products/crazy-clean/', changeFrequency: 'monthly' as const, priority: 0.6 },
    // Application landing pages
    { url: '/roofing-applications/', changeFrequency: 'monthly' as const, priority: 0.6 },
    { url: '/barns/', changeFrequency: 'monthly' as const, priority: 0.5 },
    { url: '/boat-houses/', changeFrequency: 'monthly' as const, priority: 0.5 },
    { url: '/box-trucks/', changeFrequency: 'monthly' as const, priority: 0.5 },
    { url: '/industrial/', changeFrequency: 'monthly' as const, priority: 0.5 },
    { url: '/metal-buildings/', changeFrequency: 'monthly' as const, priority: 0.5 },
    { url: '/outdoor-rooms/', changeFrequency: 'monthly' as const, priority: 0.5 },
    { url: '/pop-up-campers/', changeFrequency: 'monthly' as const, priority: 0.5 },
    { url: '/porch-roofs/', changeFrequency: 'monthly' as const, priority: 0.5 },
    { url: '/self-storage/', changeFrequency: 'monthly' as const, priority: 0.5 },
    { url: '/sheds/', changeFrequency: 'monthly' as const, priority: 0.5 },
    { url: '/shipping-containers/', changeFrequency: 'monthly' as const, priority: 0.5 },
    { url: '/sunrooms/', changeFrequency: 'monthly' as const, priority: 0.5 },
    { url: '/tiny-homes/', changeFrequency: 'monthly' as const, priority: 0.5 },
    { url: '/tractor-trailers/', changeFrequency: 'monthly' as const, priority: 0.5 },
    { url: '/truck-campers/', changeFrequency: 'monthly' as const, priority: 0.5 },
    // Business Accelerator resources
    { url: '/resources/welcome-to-crazy-seal/', changeFrequency: 'monthly' as const, priority: 0.4 },
    { url: '/resources/marketing/', changeFrequency: 'monthly' as const, priority: 0.4 },
    { url: '/resources/sales/', changeFrequency: 'monthly' as const, priority: 0.4 },
    { url: '/resources/sales/facilities/', changeFrequency: 'monthly' as const, priority: 0.4 },
    { url: '/resources/building-a-kit/', changeFrequency: 'monthly' as const, priority: 0.4 },
    { url: '/resources/installation/', changeFrequency: 'monthly' as const, priority: 0.4 },
    { url: '/resources/warranty/', changeFrequency: 'monthly' as const, priority: 0.4 },
    { url: '/resources/sales/rv/', changeFrequency: 'monthly' as const, priority: 0.4 },
    { url: '/resources/sales/ai-prompts/', changeFrequency: 'monthly' as const, priority: 0.4 },
    { url: '/resources/sales/loopable-videos/', changeFrequency: 'monthly' as const, priority: 0.3 },
    { url: '/marketing/videos/', changeFrequency: 'monthly' as const, priority: 0.4 },
    { url: '/marketing/videos/video-package-1/', changeFrequency: 'monthly' as const, priority: 0.3 },
    { url: '/marketing/videos/video-package-2/', changeFrequency: 'monthly' as const, priority: 0.3 },
    { url: '/marketing/videos/video-package-3/', changeFrequency: 'monthly' as const, priority: 0.3 },
    { url: '/marketing/videos/video-package-4/', changeFrequency: 'monthly' as const, priority: 0.3 },
    { url: '/marketing/videos/video-package-5/', changeFrequency: 'monthly' as const, priority: 0.3 },
    { url: '/marketing/videos/video-package-6/', changeFrequency: 'monthly' as const, priority: 0.3 },
    { url: '/marketing/images/', changeFrequency: 'monthly' as const, priority: 0.4 },
    { url: '/marketing/images/rv-images/', changeFrequency: 'monthly' as const, priority: 0.3 },
    { url: '/marketing/images/residential-images/', changeFrequency: 'monthly' as const, priority: 0.3 },
    { url: '/marketing/images/commercial-images/', changeFrequency: 'monthly' as const, priority: 0.3 },
    { url: '/marketing/email-templates/', changeFrequency: 'monthly' as const, priority: 0.4 },
    { url: '/marketing/ai-prompts/', changeFrequency: 'monthly' as const, priority: 0.4 },
    // Misc
    { url: '/shipping/', changeFrequency: 'yearly' as const, priority: 0.4 },
    { url: '/affiliates/', changeFrequency: 'monthly' as const, priority: 0.4 },
  ]

  const legalPages = [
    '/privacy-policy/',
    '/terms-and-conditions/',
  ]

  const projects = await getPublishedProjects()
  const storeProducts = await getStoreProducts().catch(() => [])

  return [
    {
      url: `${BASE_URL}/store/`,
      lastModified: now,
      changeFrequency: 'weekly' as const,
      priority: 0.9,
    },
    ...storeProducts.map((p) => ({
      url: `${BASE_URL}/store/${p.handle}/`,
      lastModified: now,
      changeFrequency: 'weekly' as const,
      priority: 0.7,
    })),
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
    ...projects.map((p) => ({
      url: `${BASE_URL}/project/${p.slug}/`,
      lastModified: p.created_at || now,
      changeFrequency: 'yearly' as const,
      priority: 0.5,
    })),
  ]
}
