import type { Redirect } from 'next/dist/lib/load-custom-routes'

export const REDIRECTS: Redirect[] = [
  // ============================================================
  // FAQ Items -> /faq with anchor
  // ============================================================
  { source: '/faq-items/are-you-fully-insured', destination: '/faq#transferable-warranty', permanent: true },
  { source: '/faq-items/do-your-men-wear-safety-shoes', destination: '/faq#warranty-cost', permanent: true },
  { source: '/faq-items/are-our-goods-safe', destination: '/faq#diy', permanent: true },
  { source: '/faq-items/how-much-notice-do-you-need', destination: '/faq#diy-coatings', permanent: true },
  { source: '/faq-items/do-you-offer-storage-services', destination: '/faq#drive-to-you', permanent: true },
  { source: '/faq-items/are-your-quotes-no-obligation', destination: '/faq#application-time', permanent: true },
  { source: '/faq-items/what-are-your-payment-terms', destination: '/faq#all-rvs', permanent: true },
  { source: '/faq-items/what-kinds-of-rv-roofs-can-rv-armor-be-applied-to', destination: '/faq#roof-types', permanent: true },
  { source: '/faq-items/what-kind-of-costs-am-i-looking-at', destination: '/faq#costs', permanent: true },

  // ============================================================
  // Blog posts -> /blog (posts without dedicated pages)
  // ============================================================
  { source: '/the-ease-of-an-rv-armor-roof', destination: '/blog', permanent: false },
  { source: '/upfront-costs-for-years-of-savings', destination: '/blog', permanent: false },
  { source: '/the-rv-roof-membrane-youll-never-have-to-maintain', destination: '/blog', permanent: false },
  { source: '/camper-roof-maintenance-you-can-count-on-for-life', destination: '/blog', permanent: false },
  { source: '/protect-your-travel-trailer-with-one-simple-step', destination: '/blog', permanent: false },
  { source: '/the-best-rubber-rv-roof-delivers-service-statewide', destination: '/blog', permanent: false },
  { source: '/motorhome-roof-replacement-just-got-tons-easier', destination: '/blog', permanent: false },
  { source: '/easiest-way-to-install-a-new-rubber-roof-on-your-rv', destination: '/blog', permanent: false },
  { source: '/roof-coating-for-motorhomes-that-lasts-forever', destination: '/blog', permanent: false },
  { source: '/motorhome-roof-repair-that-lasts-forever', destination: '/blog', permanent: false },
  { source: '/choosing-the-best-rv-roof-material', destination: '/blog', permanent: false },
  { source: '/the-best-rv-roof-requires-no-maintenance', destination: '/blog', permanent: false },
  { source: '/trust-your-rv-roof-to-3-generations-of-roofing-experience', destination: '/blog', permanent: false },
  { source: '/lifetime-of-fun', destination: '/blog', permanent: false },
  { source: '/update-your-rv-with-a-premium-roof', destination: '/blog', permanent: false },
  { source: '/how-to-have-fun-traveling', destination: '/blog', permanent: false },
  { source: '/bring-you-a-lifetime-of-fun', destination: '/blog', permanent: false },
  { source: '/mission-on-wheels', destination: '/blog', permanent: false },
  { source: '/blog-bringfun-original', destination: '/blog', permanent: false },

  // ============================================================
  // Old WordPress .html pages -> new Next.js routes
  // ============================================================
  { source: '/advantages.html', destination: '/advantages', permanent: true },
  { source: '/the-process.html', destination: '/rv-armor', permanent: true },
  { source: '/contact-us.html', destination: '/contact', permanent: true },

  // ============================================================
  // Deprecated pages -> homepage
  // ============================================================
  { source: '/home-old', destination: '/', permanent: true },
  { source: '/test-form', destination: '/', permanent: true },

  // ============================================================
  // Old testimonials URL -> new reviews page
  // ============================================================
  { source: '/testimonials', destination: '/reviews', permanent: true },

  // ============================================================
  // WordPress media -> CloudFront CDN (maps old WP path to actual S3 path)
  // ============================================================
  { source: '/wp-content/uploads/:path*', destination: 'https://media.rv-armor.com/site-assets/wp-media/:path*', permanent: true },
]
