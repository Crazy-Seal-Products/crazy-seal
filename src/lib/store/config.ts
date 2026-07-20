/**
 * Store presentation config — our own curation layer on top of Shopify data.
 *
 * Shopify remains the source of truth for variants, prices, and checkout, but
 * everything the customer sees (names, categories, ordering, descriptions) is
 * controlled here. Products not listed still appear, uncurated, in "More from
 * Crazy Seal" so new Shopify products are never silently dropped.
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
}

export const PRODUCT_CURATION: ProductCuration[] = [
  // ─── RV Roofing Kits ───
  {
    handle: 'rv-roofing-kit',
    category: 'rv-kits',
    title: 'RV Roofing Kit',
    blurb: 'Our most popular kit. Double-layer seamless protection sized to your RV roof.',
    order: 1,
  },
  {
    handle: 'direct-to-deck-rv-roofing-kit',
    category: 'rv-kits',
    title: 'Direct-to-Deck RV Roofing Kit',
    blurb: 'For RV roofs stripped to the wood deck — seal directly over the decking.',
    order: 2,
  },
  {
    handle: 'crazy-good-rv-repair-kit',
    category: 'rv-kits',
    title: 'Crazy Good RV Repair Kit',
    blurb: 'Small repairs, resealing fixtures, or adding accessories to your RV roof.',
    order: 3,
  },

  // ─── Flat Roof Kits ───
  {
    handle: 'double-layer-kit',
    category: 'roof-kits',
    title: 'Seamless Roofing Kit (Double Layer)',
    blurb: 'Our flagship double-layer system with Crazy Cloth reinforcement.',
    order: 1,
  },
  {
    handle: 'single-layer-kit',
    category: 'roof-kits',
    title: 'Single Layer Kit',
    blurb: 'A single-layer silicone membrane for roofs in good structural condition.',
    order: 2,
  },
  {
    handle: 'direct-to-deck-kit',
    category: 'roof-kits',
    title: 'Direct-to-Deck Kit',
    blurb: 'Seal directly over plywood or OSB decking — no underlayment needed.',
    order: 3,
  },
  {
    handle: 'crazy-good-repair-kit',
    category: 'roof-kits',
    title: 'Crazy Good Repair Kit',
    blurb: 'Patch leaks, seal penetrations, or add a fixture to any Crazy Seal roof.',
    order: 4,
  },

  // ─── Commercial Kits ───
  { handle: '500-sq-ft-commercial-kit', category: 'commercial-kits', title: '500 SQ FT Commercial Kit', order: 1 },
  { handle: '1000-sq-ft-commercial-kit', category: 'commercial-kits', title: '1,000 SQ FT Commercial Kit', order: 2 },
  { handle: '1-500-sq-ft-commercial-kit', category: 'commercial-kits', title: '1,500 SQ FT Commercial Kit', order: 3 },
  { handle: '2000-sq-ft-commercial-kit', category: 'commercial-kits', title: '2,000 SQ FT Commercial Kit', order: 4 },
  { handle: '2500-sq-ft-commercial-kit', category: 'commercial-kits', title: '2,500 SQ FT Commercial Kit', order: 5 },
  { handle: '3000-sq-ft-commercial-kit', category: 'commercial-kits', title: '3,000 SQ FT Commercial Kit', order: 6 },

  // ─── Individual Products ───
  {
    handle: 'crazy-seal',
    category: 'products',
    title: 'Crazy Seal',
    blurb: 'The fiber-infused silicone membrane at the heart of the system.',
    order: 1,
  },
  {
    handle: 'crazy-patch',
    category: 'products',
    title: 'Crazy Patch',
    blurb: 'Fiber-infused silicone mastic for sealing penetrations and patching leaks.',
    order: 2,
  },
  {
    handle: 'crazy-caulk',
    category: 'products',
    title: 'Crazy Caulk',
    blurb: 'Fiber-infused silicone sealant for seams and attachment points.',
    order: 3,
  },
  {
    handle: 'crazy-cloth',
    category: 'products',
    title: 'Crazy Cloth',
    blurb: 'The roofing fabric layer — sandwiched between coats for reinforced strength.',
    order: 4,
  },
  {
    handle: 'crazy-tape',
    category: 'products',
    title: 'Crazy Tape',
    blurb: 'Adhesive-backed repair tape that the Crazy Seal System bonds directly to.',
    order: 5,
  },
  {
    handle: 'industrial-crazy-tape',
    category: 'products',
    title: 'Industrial Crazy Tape',
    blurb: 'Heavy-duty 50 ft roll for industrial-scale seam repairs.',
    order: 6,
  },
  {
    handle: 'crazy-clean',
    category: 'products',
    title: 'Crazy Clean',
    blurb: 'Concentrated, eco-safe cleaner that preps your roof for adhesion.',
    order: 7,
  },

  // ─── Extras ───
  {
    handle: 'free-crazy-seal-swag-pack',
    category: 'extras',
    title: 'Crazy Seal Swag Pack',
    order: 1,
  },
]

/**
 * Shopify handles never shown in the store.
 * crazy-seal-tote is priced at $43,312.50 in Shopify (bad data) — hidden
 * until the price is fixed.
 */
export const HIDDEN_HANDLES = new Set(['test-product', 'crazy-seal-tote'])
