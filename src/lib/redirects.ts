import type { Redirect } from 'next/dist/lib/load-custom-routes'

const CDN = 'https://media.crazyseal.com'

export const REDIRECTS: Redirect[] = [
  // ============================================================
  // WordPress media -> CloudFront CDN
  // Gravity Forms uploads keep their exact legacy paths so old
  // warranty photo links keep working. Everything else in the WP
  // media library lives under site-assets/wp-media/.
  // ============================================================
  { source: '/wp-content/uploads/gravity_forms/:path*', destination: `${CDN}/gravity-forms/:path*`, permanent: true },
  { source: '/wp-content/uploads/:path*', destination: `${CDN}/site-assets/wp-media/:path*`, permanent: true },

  // ============================================================
  // Legacy WordPress paths -> new routes
  // ============================================================
  // /store is now our own headless storefront; /shop canonicalizes to it
  { source: '/shop', destination: '/store', permanent: true },
  { source: '/install', destination: '/installation', permanent: true },
  // Instant Quote retired in favor of the Kit Builder (Aug 2026)
  { source: '/pricing', destination: '/kit-builder', permanent: true },
  // Single Layer Kits retired from the lineup (Aug 2026)
  { source: '/single-layer-kit', destination: '/store/double-layer-kit', permanent: true },
  { source: '/store/single-layer-kit', destination: '/store/double-layer-kit', permanent: true },
  // Live site served marketing assets at both /marketing/* and
  // /resources/marketing/*; we canonicalize on /marketing/*
  { source: '/resources/marketing/videos/:path*', destination: '/marketing/videos/:path*', permanent: true },
  { source: '/resources/marketing/images/:path*', destination: '/marketing/images/:path*', permanent: true },
  { source: '/resources/marketing/ai-prompts', destination: '/marketing/ai-prompts', permanent: true },
  { source: '/resources/marketing/email-templates', destination: '/marketing/email-templates', permanent: true },
  { source: '/project-category/:category', destination: '/projects/?category=:category', permanent: true },
  { source: '/view/warranty-downloads', destination: '/warranty', permanent: true },
  { source: '/testimonials', destination: '/reviews', permanent: true },
  { source: '/warranty-registration', destination: '/warranty', permanent: true },
  { source: '/feed', destination: '/', permanent: true },
  { source: '/blog', destination: '/', permanent: false },
  { source: '/blog/:path*', destination: '/', permanent: false },

  // ============================================================
  // Launch parity (Aug 2026): legacy WP pages without a direct
  // equivalent on the new site. Sources: full WP URL inventory in
  // src/lib/generated/wp-url-inventory.json.
  // ============================================================
  // RV application variants consolidated into /rv-roofs
  { source: '/campers', destination: '/rv-roofs', permanent: true },
  { source: '/motor-homes', destination: '/rv-roofs', permanent: true },
  { source: '/fifth-wheels', destination: '/rv-roofs', permanent: true },
  { source: '/travel-trailers', destination: '/rv-roofs', permanent: true },
  { source: '/mobile-homes', destination: '/rv-roofs', permanent: true },
  { source: '/horse-trailers', destination: '/transportation', permanent: true },
  { source: '/hiring-a-contractor', destination: '/professionals', permanent: true },
  // Kit/product listings now live in the headless store
  { source: '/rv-roofing-kits', destination: '/store', permanent: true },
  { source: '/all-kits-and-products', destination: '/store', permanent: true },
  { source: '/products/crazy-cloth', destination: '/store/crazy-cloth', permanent: true },
  // Lead-gen landing pages
  { source: '/fb-free-quote', destination: '/contact', permanent: true },
  { source: '/rep', destination: '/professionals', permanent: true },
  // Business Accelerator / retired Tutor LMS pages
  { source: '/business-accelerator-program-registration', destination: '/business-accelerator-program', permanent: true },
  { source: '/dashboard', destination: '/business-accelerator-program', permanent: true },
  { source: '/tutor-certificate', destination: '/business-accelerator-program', permanent: true },
  { source: '/instructor-registration', destination: '/business-accelerator-program', permanent: true },
  { source: '/student-registration', destination: '/business-accelerator-program', permanent: true },
  // Resources section has no root index page on the new site
  { source: '/resources', destination: '/resources/welcome-to-crazy-seal', permanent: true },
  { source: '/resources/marketing/assets', destination: '/resources/marketing', permanent: true },
  // WordPress-internal pages
  { source: '/form-test', destination: '/', permanent: true },
  { source: '/404-error-page', destination: '/', permanent: true },
  { source: '/wpms-html-sitemap', destination: '/', permanent: true },
  // Blog category archives (site never published blog posts)
  { source: '/category/:path*', destination: '/', permanent: true },
]
