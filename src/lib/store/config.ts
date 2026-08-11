/**
 * Store presentation config — our own curation layer on top of Shopify data.
 *
 * Shopify remains the source of truth for variants, prices, and checkout, but
 * everything the customer sees (names, categories, ordering, descriptions) is
 * controlled here. Products not listed still appear, uncurated, in "More from
 * Crazy Seal" so new Shopify products are never silently dropped.
 *
 * YouTube IDs were scraped from buy.crazyseal.com product pages (Jul 2026).
 */

export type StoreCategory = 'rv-kits' | 'roof-kits' | 'commercial-kits' | 'products' | 'extras'

export const STORE_CATEGORIES: Array<{ id: StoreCategory; label: string; blurb: string }> = [
  {
    id: 'rv-kits',
    label: 'RV Roofing Kits',
    blurb: 'Complete kits sized for your RV — everything you need to seal your roof for good.',
  },
  {
    id: 'roof-kits',
    label: 'Flat Roof Kits',
    blurb: 'Seamless roofing kits for residential and light commercial flat roofs.',
  },
  {
    id: 'commercial-kits',
    label: 'Commercial Kits',
    blurb: 'Pre-built kits for large commercial flat roofs, from 500 to 3,000 square feet.',
  },
  {
    id: 'products',
    label: 'Individual Products',
    blurb: 'Every component of the Crazy Seal System, available individually.',
  },
  {
    id: 'extras',
    label: 'Extras',
    blurb: 'Crazy Seal gear and add-ons.',
  },
]

export interface ProductCuration {
  /** Shopify handle */
  handle: string
  category: StoreCategory
  /** Overrides the Shopify title */
  title?: string
  /** Short card blurb; falls back to truncated Shopify description */
  blurb?: string
  /** Sort order within category (lower first) */
  order: number
  /** YouTube video IDs from the legacy Shopify product pages */
  youtubeIds?: string[]
  /** Marketing badge shown on store cards and the product page (e.g. "Most Popular") */
  badge?: string
  /** Handles cross-sold in "Complete Your System" on the product page */
  companions?: string[]
  /** Stat callouts shown on the product page (e.g. { value: '20+', label: 'Years' }) */
  proofPoints?: Array<{ value: string; label: string }>
  /**
   * Detail bullets for the "Why This Kit Works" band, sourced from the
   * product video transcripts. Falls back to category defaults.
   */
  whyItWorks?: Array<{ lead: string; text: string }>
  /**
   * Hand-picked customer project slugs for the "Real Projects" section,
   * shown in order. Falls back to the best quote-backed projects in the
   * product's matching category.
   */
  featuredProjects?: string[]
}

/** Shared "Why It Works" bullets, sourced from the kit video transcripts. */
const DIRECT_TO_DECK_WHY: Array<{ lead: string; text: string }> = [
  {
    lead: 'Bonds straight to wood.',
    text: 'Designed to apply directly over plywood or OSB decking — no underlayment, and Crazy Tape seals your edges and seams first.',
  },
  {
    lead: '75 sq ft per gallon.',
    text: 'Rated for porous wood that soaks up more product than a normal roof, so your kit never runs short.',
  },
  {
    lead: '40 mils of finished membrane.',
    text: 'Two 20-mil layers, even thicker over taped edges and sealed penetrations.',
  },
  {
    lead: 'Hybrid-ready.',
    text: 'Blend repaired wood sections into your existing roof for one final seamless membrane across the entire application.',
  },
  {
    lead: '50-year no-hassle warranty.',
    text: 'Finish the install, fill out a simple form, and your roof is covered.',
  },
]

const REPAIR_KIT_WHY: Array<{ lead: string; text: string }> = [
  {
    lead: 'The whole system, sized small.',
    text: 'Crazy Caulk, Crazy Patch, and Crazy Seal — everything for a full-system application up to 25 sq ft.',
  },
  {
    lead: 'Keep one onboard.',
    text: 'RVers carry this kit so they can mount a new roof component to their Crazy Seal roof anywhere down the road.',
  },
  {
    lead: 'Same seamless membrane.',
    text: 'Bonds right into an existing Crazy Seal roof — a repair that disappears into the membrane, not a patchwork fix.',
  },
]

const CRAZY_TAPE_WHY: Array<{ lead: string; text: string }> = [
  {
    lead: 'Adhesive one side, fabric the other.',
    text: 'Instant hold underneath, and a surface the Crazy Seal membrane bonds directly to on top.',
  },
  {
    lead: 'Made for wood decking.',
    text: 'Creates a seal over seams where the system is applied direct to deck.',
  },
  {
    lead: 'Hybrid transitions.',
    text: 'Bridge the membrane from existing roofing material onto wood decking in one repair.',
  },
]

/** Category fallback for commercial kits (from the commercial overview video). */
export const COMMERCIAL_KIT_WHY: Array<{ lead: string; text: string }> = [
  {
    lead: 'Begin with a repair, go from there.',
    text: 'The fluid-applied system lets you solve immediate problems now and complete your roof in stages to stretch annual budgets.',
  },
  {
    lead: 'A few square feet to thousands.',
    text: 'The same system scales from spot repairs to full commercial roofs — restaurants, warehouses, self-storage, and more.',
  },
  {
    lead: 'Ends the repair-repair-replace cycle.',
    text: 'A seamless, permanent silicone membrane instead of another band-aid that has to be torn off later.',
  },
  {
    lead: '50-year product warranty.',
    text: 'The strongest warranty in the roofing industry, registered with a simple form.',
  },
]

export const PRODUCT_CURATION: ProductCuration[] = [
  // ─── RV Roofing Kits ───
  {
    handle: 'rv-roofing-kit',
    category: 'rv-kits',
    title: 'RV Roofing Kit',
    blurb: 'Our most popular kit. Double-layer seamless protection sized to your RV roof.',
    order: 1,
    youtubeIds: ['DUt04pcOCYw'],
    badge: 'Most Popular',
    companions: ['crazy-tape', 'crazy-clean', 'crazy-caulk', 'free-crazy-seal-swag-pack'],
    whyItWorks: [
      {
        lead: '40 mils of cured membrane.',
        text: 'Two full layers at 20 mils each — even thicker where Crazy Caulk and Crazy Patch seal your seams and penetrations.',
      },
      {
        lead: '100 sq ft per gallon.',
        text: 'Kits are calculated by square footage, so the kit sized to your RV has exactly what the roof needs.',
      },
      {
        lead: 'Seals everything first.',
        text: 'Enough Crazy Caulk and Crazy Patch to seal every seam and penetration before the seamless membrane goes down.',
      },
      {
        lead: 'You never install alone.',
        text: 'Step-by-step video suite, installation PDFs, and in-house project specialists standing by.',
      },
      {
        lead: '50-year no-hassle warranty.',
        text: 'Finish the install, fill out a simple form, and your roof is covered.',
      },
    ],
  },
  {
    handle: 'direct-to-deck-rv-roofing-kit',
    category: 'rv-kits',
    title: 'Direct-to-Deck RV Roofing Kit',
    blurb: 'For RV roofs stripped to the wood deck — seal directly over the decking.',
    order: 2,
    youtubeIds: ['ZNhBmVKJX7k'],
    companions: ['crazy-tape', 'crazy-clean', 'crazy-caulk', 'free-crazy-seal-swag-pack'],
    whyItWorks: DIRECT_TO_DECK_WHY,
  },
  {
    handle: 'crazy-good-rv-repair-kit',
    category: 'rv-kits',
    title: 'Crazy Good RV Repair Kit',
    blurb: 'Small repairs, resealing fixtures, or adding accessories to your RV roof.',
    order: 3,
    youtubeIds: ['lRWZTz5utbU'],
    companions: ['crazy-tape', 'crazy-clean', 'crazy-seal', 'rv-roofing-kit'],
    whyItWorks: REPAIR_KIT_WHY,
  },

  // ─── Flat Roof Kits ───
  {
    handle: 'double-layer-kit',
    category: 'roof-kits',
    title: 'Seamless Roofing Kit (Double Layer)',
    blurb: 'Our flagship double-layer system with Crazy Cloth reinforcement.',
    order: 1,
    youtubeIds: ['DUt04pcOCYw'],
    badge: 'Best Seller',
    companions: ['crazy-cloth', 'crazy-tape', 'crazy-clean', 'free-crazy-seal-swag-pack'],
    whyItWorks: [
      {
        lead: '40 mils of cured membrane.',
        text: 'The first layer cures to 20 mils; the second doubles it to 40 — even thicker where Crazy Caulk and Crazy Patch seal seams and penetrations.',
      },
      {
        lead: '100 sq ft per gallon.',
        text: 'Kits are calculated by square footage, so the kit sized to your roof has exactly what it needs.',
      },
      {
        lead: 'Built for imperfect installers.',
        text: 'We recommend the double layer in most instances — the second coat guarantees proper coverage everywhere.',
      },
      {
        lead: 'You never install alone.',
        text: 'Step-by-step video suite, installation PDFs, and in-house project specialists standing by.',
      },
      {
        lead: '50-year no-hassle warranty.',
        text: 'Finish the install, fill out a simple form, and your roof is covered.',
      },
    ],
    featuredProjects: [
      'order-5344-residential-roof-diy-installation',
      'project-4438-from-worn-flat-roof-to-seamless-commercial-strength',
      'project-3524-residential-roof-transformation-with-diy-precision',
    ],
  },
  {
    handle: 'direct-to-deck-kit',
    category: 'roof-kits',
    title: 'Direct-to-Deck Kit',
    blurb: 'Seal directly over plywood or OSB decking — no underlayment needed.',
    order: 2,
    youtubeIds: ['ZNhBmVKJX7k'],
    companions: ['crazy-cloth', 'crazy-tape', 'crazy-clean', 'free-crazy-seal-swag-pack'],
    whyItWorks: DIRECT_TO_DECK_WHY,
  },
  {
    handle: 'crazy-good-repair-kit',
    category: 'roof-kits',
    title: 'Crazy Good Repair Kit',
    blurb: 'Patch leaks, seal penetrations, or add a fixture to any Crazy Seal roof.',
    order: 3,
    youtubeIds: ['lRWZTz5utbU'],
    companions: ['crazy-tape', 'crazy-clean', 'crazy-seal', 'double-layer-kit'],
    whyItWorks: REPAIR_KIT_WHY,
  },

  // ─── Commercial Kits ───
  {
    handle: '500-sq-ft-commercial-kit',
    category: 'commercial-kits',
    title: '500 SQ FT Commercial Kit',
    order: 1,
    youtubeIds: ['XZrXvweEo-U'],
  },
  {
    handle: '1000-sq-ft-commercial-kit',
    category: 'commercial-kits',
    title: '1,000 SQ FT Commercial Kit',
    order: 2,
    youtubeIds: ['XZrXvweEo-U'],
  },
  {
    handle: '1-500-sq-ft-commercial-kit',
    category: 'commercial-kits',
    title: '1,500 SQ FT Commercial Kit',
    order: 3,
    youtubeIds: ['XZrXvweEo-U'],
  },
  {
    handle: '2000-sq-ft-commercial-kit',
    category: 'commercial-kits',
    title: '2,000 SQ FT Commercial Kit',
    order: 4,
    youtubeIds: ['XZrXvweEo-U'],
  },
  {
    handle: '2500-sq-ft-commercial-kit',
    category: 'commercial-kits',
    title: '2,500 SQ FT Commercial Kit',
    order: 5,
    youtubeIds: ['XZrXvweEo-U'],
  },
  {
    handle: '3000-sq-ft-commercial-kit',
    category: 'commercial-kits',
    title: '3,000 SQ FT Commercial Kit',
    order: 6,
    youtubeIds: ['XZrXvweEo-U'],
  },

  // ─── Individual Products ───
  {
    handle: 'crazy-seal',
    category: 'products',
    title: 'Crazy Seal',
    blurb: 'The fiber-infused silicone membrane at the heart of the system.',
    order: 1,
    youtubeIds: ['7UdhprChv1Q'],
    badge: 'The Core Product',
    companions: ['crazy-clean', 'crazy-caulk', 'crazy-patch', 'crazy-cloth'],
    whyItWorks: [
      {
        lead: 'The final membrane.',
        text: 'The central component that ties the entire system together and forms the finished seamless membrane.',
      },
      {
        lead: 'UV, severe weather, mold & mildew.',
        text: 'Protects any weathered roof substrate against the degradation that kills conventional roofs.',
      },
      {
        lead: '100 sq ft per gallon, per layer.',
        text: 'Each layer cures to 20 mils — two layers is the recommended system for 40 mils of protection.',
      },
    ],
  },
  {
    handle: 'crazy-patch',
    category: 'products',
    title: 'Crazy Patch',
    blurb: 'Fiber-infused silicone mastic for sealing penetrations and patching leaks.',
    order: 2,
    youtubeIds: ['DW4FxoRinWg'],
    companions: ['crazy-caulk', 'crazy-seal', 'crazy-clean', 'crazy-tape'],
    whyItWorks: [
      {
        lead: 'Fiber-infused silicone mastic.',
        text: 'Moisture-curing with excellent adhesion to most surfaces.',
      },
      {
        lead: 'Seals every penetration.',
        text: 'Wherever sealant was previously applied on your roof, Crazy Patch goes down to seal it for good.',
      },
      {
        lead: 'Part of one seamless system.',
        text: 'The Crazy Seal membrane bonds directly over it — extra thickness exactly where roofs leak first.',
      },
    ],
  },
  {
    handle: 'crazy-caulk',
    category: 'products',
    title: 'Crazy Caulk',
    blurb: 'Fiber-infused silicone sealant for seams and attachment points.',
    order: 3,
    youtubeIds: ['pk-958WYDA8'],
    companions: ['crazy-patch', 'crazy-seal', 'crazy-clean', 'crazy-tape'],
    whyItWorks: [
      {
        lead: 'Fiber-infused silicone sealant.',
        text: 'Moisture-curing with excellent adhesion to most surfaces.',
      },
      {
        lead: 'About 50 feet per tube.',
        text: 'Running a quarter-inch bead — and a one-gallon container equals about eight tubes.',
      },
      {
        lead: 'Built for seams.',
        text: 'The seams along the sides of an RV, gutter attachments — anywhere components meet the roof.',
      },
    ],
  },
  {
    handle: 'crazy-cloth',
    category: 'products',
    title: 'Crazy Cloth',
    blurb: 'The roofing fabric layer — sandwiched between coats for reinforced strength.',
    order: 4,
    companions: ['crazy-seal', 'crazy-caulk', 'crazy-patch', 'crazy-clean'],
    whyItWorks: [
      {
        lead: 'Reinforcement where roofs fail.',
        text: 'Roofing fabric sandwiched between coats of Crazy Seal for reinforced strength at seams and transitions.',
      },
      {
        lead: 'Becomes part of the membrane.',
        text: 'The membrane saturates the cloth, locking it into one continuous seamless layer.',
      },
    ],
  },
  {
    handle: 'crazy-tape',
    category: 'products',
    title: 'Crazy Tape',
    blurb: 'Adhesive-backed repair tape that the Crazy Seal System bonds directly to.',
    order: 5,
    youtubeIds: ['zvmb4TqDXtI'],
    companions: ['crazy-seal', 'crazy-patch', 'crazy-caulk', 'crazy-clean'],
    whyItWorks: CRAZY_TAPE_WHY,
  },
  {
    handle: 'industrial-crazy-tape',
    category: 'products',
    title: 'Industrial Crazy Tape',
    blurb: 'Heavy-duty 50 ft roll for industrial-scale seam repairs.',
    order: 6,
    youtubeIds: ['zvmb4TqDXtI'],
    companions: ['crazy-seal-tote', 'crazy-seal', 'crazy-patch', 'crazy-clean'],
    whyItWorks: [
      {
        lead: '50 feet per roll.',
        text: 'Heavy-duty length for long seam runs on industrial-scale roofs.',
      },
      ...CRAZY_TAPE_WHY,
    ],
  },
  {
    handle: 'crazy-clean',
    category: 'products',
    title: 'Crazy Clean',
    blurb: 'Concentrated, eco-safe cleaner that preps your roof for adhesion.',
    order: 7,
    youtubeIds: ['mDrHEUH0K4I'],
    companions: ['crazy-seal', 'crazy-caulk', 'crazy-patch', 'crazy-cloth'],
    whyItWorks: [
      {
        lead: 'Up to 1,000 sq ft per gallon.',
        text: 'A concentrated solution that goes a crazy long way.',
      },
      {
        lead: 'Environmentally safe.',
        text: 'Highly effective cleaning without harsh chemistry.',
      },
      {
        lead: 'The step adhesion depends on.',
        text: 'Specially formulated to prep your roof so the membrane bonds to the roof — not the dirt.',
      },
    ],
  },
  {
    handle: 'crazy-seal-tote',
    category: 'products',
    title: 'Crazy Seal Tote',
    blurb: 'A large industrial tote filled with Crazy Seal — for big commercial jobs.',
    order: 8,
    youtubeIds: ['XZrXvweEo-U'],
    badge: 'Pro Favorite',
    companions: ['industrial-crazy-tape', 'crazy-clean', 'crazy-patch', 'crazy-caulk'],
    whyItWorks: [
      {
        lead: 'Bulk Crazy Seal.',
        text: 'An industrial tote of the same fiber-infused membrane, sized for thousands of square feet.',
      },
      {
        lead: 'Complete your roof in stages.',
        text: 'Fluid-applied, so you can solve problem areas now and expand across the roof as budget allows.',
      },
      {
        lead: 'One seamless result.',
        text: 'Every stage blends into a single permanent membrane backed by the 50-year warranty.',
      },
    ],
  },

  // ─── Extras ───
  {
    handle: 'free-crazy-seal-swag-pack',
    category: 'extras',
    title: 'Crazy Seal Swag Pack',
    order: 1,
  },
]

/** Shopify handles never shown in the store. */
export const HIDDEN_HANDLES = new Set(['test-product', 'single-layer-kit'])
