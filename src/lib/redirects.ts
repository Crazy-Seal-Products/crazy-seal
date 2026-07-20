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
  { source: '/store', destination: 'https://buy.crazyseal.com/', permanent: true },
  { source: '/shop', destination: 'https://buy.crazyseal.com/', permanent: true },
  { source: '/install', destination: '/installation', permanent: true },
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
]
