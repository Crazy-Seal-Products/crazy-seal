/**
 * Social proof content for the store — testimonials, brand persuasion videos,
 * proof stats, and the store-category → project-category mapping that powers
 * the "Real Projects" sections on product pages.
 *
 * Testimonials are a curated subset of /reviews, picked per store category so
 * an RV kit shows RV-owner voices and a commercial kit shows contractor voices.
 */

import { COMMERCIAL_KIT_WHY, type StoreCategory } from './config'

const MEDIA = 'https://media.crazyseal.com/site-assets/wp-media'

// ─── Testimonials ───────────────────────────────────────────────────────────

export interface StoreTestimonial {
  name: string
  photo?: string
  text: string
}

const RV_TESTIMONIALS: StoreTestimonial[] = [
  {
    name: 'Mark Milstead from Leroy, AL',
    photo: `${MEDIA}/2020/05/Mark-Milstead.jpg`,
    text: 'Installation was not bad with easy to follow videos on website. Seems to be a great product. I will put it to the test as I plan on using my RV a bunch this year, thanks!',
  },
  {
    name: 'Steven Tuttle',
    photo: `${MEDIA}/2021/04/Steven-Tuttle.jpg`,
    text: "The support videos are outstanding. Product support and customer service is fantastic. And the product application was very easy. I've already recommended this to some of my camping friends.",
  },
  {
    name: 'Monty Leaird',
    photo: `${MEDIA}/2021/04/Monty-Leaird.jpg`,
    text: 'Applying Crazy Seal was easy and once it cured it felt very durable. I have a lot of confidence in the product now and am not worried about my roof leaking.',
  },
  {
    name: 'Tom Kedzie',
    photo: `${MEDIA}/2021/04/Tom-Kedzie.jpg`,
    text: 'Lots of prep work but the install was easy. I love the final product! No more worry when it rains. Thanks',
  },
]

const ROOF_TESTIMONIALS: StoreTestimonial[] = [
  {
    name: 'David Vincent from Key Largo, FL',
    photo: `${MEDIA}/2020/05/David-Vincent.jpg`,
    text: "THANK YOU for a great and reassuring experience! I have already referred this system to 3 family and friends. I'm looking forward to a very long, assured feeling of protection from water intrusion.",
  },
  {
    name: 'Philip Posey from Tuscumbia, AL',
    photo: `${MEDIA}/2021/11/Philip-Posey-400x400-1.jpg`,
    text: 'We could not be more pleased with the Crazy Seal product. We are expecting to have many years of enjoyment from our sunroom now that we do not have to worry about leaks.',
  },
  {
    name: 'Douglas Evans from Overton, NV',
    photo: `${MEDIA}/2020/05/Doug-Evans-400x400.jpg`,
    text: 'After viewing the DIY videos 4 times, I followed the instructions to the letter. The product went on easily.',
  },
  {
    name: 'Dennis Van Dusseldorp',
    photo: `${MEDIA}/2021/04/Van-Dusseldorp.jpg`,
    text: 'Great product, went on like advertised and ended up with a great looking roof that will last a long time.',
  },
]

const PRO_TESTIMONIALS: StoreTestimonial[] = [
  {
    name: 'Melvin Nixon',
    photo: `${MEDIA}/2021/04/MELVIN-NIXON.jpg`,
    text: 'I am an independent contractor and this stuff is different (in a good way) than anything I have ever used. I could tell by how well it adhered that it is very strong and flexible. Very impressed so far.',
  },
  {
    name: 'Robert Davies',
    photo: `${MEDIA}/2021/04/Robert-Davies.jpg`,
    text: 'Very satisfied. Best product ever! Would recommend it to anyone looking to be "Once & Done"',
  },
  {
    name: 'Brian Mitchell',
    photo: `${MEDIA}/2021/04/Brian-Mitchell.jpg`,
    text: 'Pretty easy install. Followed the directions exactly as prescribed and looks great. Water beads up on the roof and just sheets off now. Very satisfied with how easy it was.',
  },
  {
    name: 'David Hutchins',
    photo: `${MEDIA}/2021/04/David-Hutchins.jpg`,
    text: 'Very happy with the product and the customer service is second to none. All the work is in the prep. Take your time with that and everything will go well.',
  },
]

/** Category-matched testimonials for a product page. */
export function testimonialsFor(category: StoreCategory): StoreTestimonial[] {
  switch (category) {
    case 'rv-kits':
      return RV_TESTIMONIALS
    case 'commercial-kits':
      return PRO_TESTIMONIALS
    default:
      return ROOF_TESTIMONIALS
  }
}

/** Mixed set for the store landing page's social proof band. */
export const STORE_PAGE_TESTIMONIALS: StoreTestimonial[] = [
  RV_TESTIMONIALS[1],
  ROOF_TESTIMONIALS[0],
  PRO_TESTIMONIALS[1],
]

// ─── Real projects mapping ──────────────────────────────────────────────────

/**
 * Maps a store product to the customer-project category whose installs used
 * kits like it. Direct-to-deck kits get their own project category.
 */
export function projectCategoryFor(product: {
  category: StoreCategory
  handle: string
}): string | null {
  if (product.handle.includes('direct-to-deck')) return 'direct-to-deck'
  switch (product.category) {
    case 'rv-kits':
      return 'rv'
    case 'roof-kits':
      return 'residential'
    case 'commercial-kits':
      return 'commercial'
    default:
      return null
  }
}

// ─── Brand persuasion videos ────────────────────────────────────────────────

export interface BrandVideo {
  videoId: string
  title: string
  caption: string
  thumbnail: string
}

export const WHY_CRAZY_SEAL_VIDEOS: BrandVideo[] = [
  {
    videoId: 'C5FvTulPDaY',
    title: '21 1/2 Reasons Why to Choose Crazy Seal',
    caption: '21½ Reasons Why — Full Overview (10:24)',
    thumbnail: `${MEDIA}/2024/01/21-Reason-Thumbnail-2.jpg`,
  },
  {
    videoId: 'AJpCXi3hqOI',
    title: 'Why is Crazy Seal More Expensive?',
    caption: 'Why is Crazy Seal More Expensive?',
    thumbnail: `${MEDIA}/2023/07/Why-is-Crazy-Seal-More-Expensive-Thumbnail.jpg`,
  },
  {
    videoId: 'VoPjXn8YCk4',
    title: "Let's Get Crazy",
    caption: "Let's Get Crazy — Watch Our Crazy Tests (5:24)",
    thumbnail: `${MEDIA}/2021/11/Lets-Get-Crazy-Video-Cover-1024x576.jpg`,
  },
]

export const REASONS_PDF_URL = `${MEDIA}/2020/02/21-Reasons.pdf`

// ─── "Why It Works" details (sourced from the product video transcripts) ────

export interface WhyItWorksPoint {
  lead: string
  text: string
}

const KIT_WHY_DEFAULTS: WhyItWorksPoint[] = [
  {
    lead: '40 mils of cured membrane.',
    text: 'Two full layers at 20 mils each — even thicker where Crazy Caulk and Crazy Patch seal seams and penetrations.',
  },
  {
    lead: 'You never install alone.',
    text: 'Step-by-step video suite, installation PDFs, and in-house project specialists standing by.',
  },
  {
    lead: '50-year no-hassle warranty.',
    text: 'Finish the install, fill out a simple form, and your roof is covered.',
  },
]

const PRODUCT_WHY_DEFAULTS: WhyItWorksPoint[] = [
  {
    lead: 'One piece of a seamless system.',
    text: 'Every Crazy Seal product is designed to combine into a single membrane covering every square inch of your roof.',
  },
  {
    lead: 'Made in the USA.',
    text: 'Manufactured in our own facility and shipped straight to your door.',
  },
  {
    lead: '50-year system warranty.',
    text: 'Registered Crazy Seal systems carry the strongest warranty in the roofing industry.',
  },
]

/** Transcript-based detail bullets: curated override or category default. */
export function whyItWorksFor(product: {
  category: StoreCategory
  whyItWorks?: WhyItWorksPoint[]
}): WhyItWorksPoint[] {
  if (product.whyItWorks?.length) return product.whyItWorks
  if (product.category === 'commercial-kits') return COMMERCIAL_KIT_WHY
  return product.category === 'products' || product.category === 'extras'
    ? PRODUCT_WHY_DEFAULTS
    : KIT_WHY_DEFAULTS
}

// ─── Companion cross-sell ("Complete Your System") ─────────────────────────

/** One-line reason a companion product belongs in the same order. */
export const COMPANION_REASONS: Record<string, string> = {
  'crazy-clean': 'Every install starts here — preps the surface for maximum adhesion.',
  'crazy-caulk': 'Seals seams, screws, and attachment points before the membrane goes down.',
  'crazy-patch': 'The heavy-duty mastic for penetrations, tears, and trouble spots.',
  'crazy-cloth': 'Reinforces seams and transitions — extra strength where roofs fail first.',
  'crazy-tape': 'Instant hold for tears and seams — Crazy Seal bonds right over it.',
  'industrial-crazy-tape': 'A 50 ft roll for long seam runs on big roofs.',
  'crazy-seal': 'The fiber-infused membrane itself — grab extra for full coverage.',
  'crazy-seal-tote': 'Bulk Crazy Seal for serious square footage.',
  'free-crazy-seal-swag-pack': 'Free with orders over $700 — shirt, hat, and tote on us.',
  'rv-roofing-kit': 'Ready to go beyond a repair? Seal the whole roof for good.',
  'double-layer-kit': 'Ready to go beyond a repair? Seal the whole roof for good.',
}

/** Fallback companions when a product has no curated list. */
export function defaultCompanionsFor(product: {
  category: StoreCategory
  handle: string
}): string[] {
  switch (product.category) {
    case 'rv-kits':
      return ['crazy-tape', 'crazy-clean', 'crazy-caulk', 'free-crazy-seal-swag-pack']
    case 'roof-kits':
      return ['crazy-cloth', 'crazy-tape', 'crazy-clean', 'free-crazy-seal-swag-pack']
    case 'commercial-kits':
      return ['industrial-crazy-tape', 'crazy-cloth', 'crazy-clean', 'free-crazy-seal-swag-pack']
    case 'products':
      return ['crazy-seal', 'crazy-caulk', 'crazy-patch', 'crazy-clean'].filter(
        (h) => h !== product.handle
      )
    default:
      return []
  }
}
