// The Crazy Seal product line as the contractor portal's Catalog and Systems
// pages show it: each product on the price list with its category, what it
// does, its packshot, its page on the site and its technical and safety data
// sheets. The words and links are the public site's own (src/app/products/**,
// src/app/technical-data/page.tsx), so the portal never says more than the
// site does. Coverage comes from pricing_settings.coverage, the rates quotes
// use. Plain module: safe to import from client components.

import { PRODUCT_INFO, TAPE_ROLL_FT, type ProductKey } from '@/lib/pricing/price-list-2027'
import type { Coverage } from '@/lib/pricing/types'

const MEDIA = 'https://media.crazyseal.com/site-assets/wp-media'

export const CATALOG_CATEGORIES = ['coatings', 'seams', 'prep', 'bulk'] as const
export type CatalogCategory = (typeof CATALOG_CATEGORIES)[number]

export const CATEGORY_INFO: Record<CatalogCategory, { name: string; short: string }> = {
  coatings: { name: 'Coatings', short: 'Coating' },
  seams: { name: 'Seam & repair', short: 'Seam & repair' },
  prep: { name: 'Prep', short: 'Prep' },
  bulk: { name: 'Bulk', short: 'Bulk' },
}

export interface ProductDoc {
  label: string
  href: string
}

export interface ProductLineItem {
  key: ProductKey
  name: string
  category: CatalogCategory
  /** What it does in the system, in a few words (the site's product cards). */
  role: string
  blurb: string
  /** The site's packshot; the store's photo is used when Shopify has one. */
  image: string
  /** Sizes, for when the live store can't be read. */
  sizes: string
  /** The product's page on crazyseal.com, when it has one. */
  page: string | null
  docs: ProductDoc[]
}

const TDS = (file: string): ProductDoc => ({ label: 'Technical data', href: `${MEDIA}/2020/05/${file}` })
const SDS = (file: string): ProductDoc => ({ label: 'Safety data', href: `${MEDIA}/2020/05/${file}` })

const SEAL_DOCS = [TDS('Crazy-Seal-Tech-Data-031720.pdf'), SDS('Crazy-Seal-SDS-03-20.pdf')]

/** In the order the catalog lists them: the membrane, seams and repair, prep, then bulk. */
export const PRODUCT_LINE: readonly ProductLineItem[] = [
  {
    key: 'seal',
    name: PRODUCT_INFO.seal.name,
    category: 'coatings',
    role: 'Roof membrane',
    blurb:
      'A weatherproof, fiber-infused silicone, fluid-applied membrane that protects against harsh UV rays, severe weather, mold and mildew. It will not chalk or blister, and stays permanently flexible yet strong.',
    image: `${MEDIA}/2019/05/Crazy-Seal-5-Gal-Gray-Bottom-400x586.png`,
    sizes: '1, 3 and 5 gallon pails',
    page: '/products/crazy-seal-roof-membrane/',
    docs: SEAL_DOCS,
  },
  {
    key: 'patch',
    name: PRODUCT_INFO.patch.name,
    category: 'seams',
    role: 'Seals penetrations',
    blurb:
      'A fiber-infused silicone, moisture-curing mastic that seals all existing penetrations wherever sealant was previously applied. Also works alone as a single component repair product to patch leaks.',
    image: `${MEDIA}/2019/05/Crazy-Patch-400x560.png`,
    sizes: '1 gallon',
    page: '/products/crazy-patch/',
    docs: [TDS('Crazy-Patch-Tech-Data-031720.pdf'), SDS('Crazy-Patch-SDS-03-20.pdf')],
  },
  {
    key: 'caulk',
    name: PRODUCT_INFO.caulk.name,
    category: 'seams',
    role: 'Seals seams',
    blurb:
      'A fiber-infused silicone, moisture-curing sealant with excellent adhesion to most surfaces. Seals seams, like the sides of an RV, or where gutter systems attach to the roof.',
    image: `${MEDIA}/2019/04/Crazy-Caulk-1-Tube.png`,
    sizes: '11 oz tube',
    page: '/products/crazy-caulk/',
    docs: [TDS('Crazy-Caulk-Tech-Data-031720.pdf'), SDS('Crazy-Caulk-SDS-03-20.pdf')],
  },
  {
    key: 'tape',
    name: PRODUCT_INFO.tape.name,
    category: 'seams',
    role: 'Repairs & wood seams',
    blurb:
      'Strong adhesive on one side adds structural integrity to the seam; fabric on the other lets the Crazy Seal system adhere to it. In every direct-to-deck kit, to seal wood decking seams.',
    image: `${MEDIA}/2021/12/Crazy-Tape-1395x1395-1-768x768.png`,
    sizes: `${TAPE_ROLL_FT} ft roll, 4″ wide`,
    page: '/products/crazy-tape/',
    docs: [TDS('Crazy-Tape-Tech-Data-031720.pdf')],
  },
  {
    key: 'clean',
    name: PRODUCT_INFO.clean.name,
    category: 'prep',
    role: 'Prep & clean',
    blurb:
      'A concentrated cleaning solution that removes oils, dirt and oxidation. Environmentally safe, non-toxic, and leaves no contaminating by-products or pollutants behind.',
    image: `${MEDIA}/2019/05/Crazy-Clean-400x561.png`,
    sizes: '1 gallon',
    page: '/products/crazy-clean/',
    docs: [TDS('Crazy-Clean-Tech-Data-031720.pdf'), SDS('Crazy-Clean-SDS-03-20.pdf')],
  },
  {
    key: 'tote',
    name: 'Crazy Seal 275-gallon tote',
    category: 'bulk',
    role: 'Bulk membrane',
    blurb: 'Crazy Seal by the tote for large roofs. Quotes switch to whole totes once a job needs a tote’s worth of Crazy Seal, with pails for the rest.',
    image: `${MEDIA}/2019/05/Crazy-Seal-5-Gal-Gray-Bottom-400x586.png`,
    sizes: '275 gallon tote',
    page: '/products/crazy-seal-roof-membrane/',
    docs: SEAL_DOCS,
  },
]

export function productLine(key: ProductKey): ProductLineItem {
  return PRODUCT_LINE.find((p) => p.key === key)!
}

const n = (v: number) => v.toLocaleString('en-US')

/**
 * How far a product goes, at the rates quotes use (pricing_settings.coverage)
 * and, for Crazy Patch, Crazy Caulk and Crazy Tape, the product pages' own
 * figures.
 */
export function coverageLines(key: ProductKey, c: Coverage, toteGallons: number): string[] {
  const over = c.sealSqftPerGallonPerCoat['over-existing']
  const deck = c.sealSqftPerGallonPerCoat['direct-to-deck']
  switch (key) {
    case 'seal':
      return [`${n(over)} sq ft per gallon per coat over an existing roof`, `${n(deck)} sq ft per gallon per coat direct to deck`, `${c.coats} coats`]
    case 'patch':
      return ['About 75 linear ft per gallon with a 3″ brush', `Quotes count ${n(c.patchFtPerGallon)} ft of seams per gallon`]
    case 'caulk':
      return [`About 40 ft per tube, by the bead`, `Quotes count 1 tube per ${n(c.caulkSqftPerTube)} sq ft of roof`]
    case 'clean':
      return [`Up to ${n(c.cleanSqftPerGallon)} sq ft per gallon, mixed with 3 gallons of water`]
    case 'tape':
      return [`${TAPE_ROLL_FT} ft of seam per roll`]
    case 'tote': {
      const sqft = Math.floor((toteGallons * over) / Math.max(1, c.coats))
      return [`${n(toteGallons)} gallons: about ${n(sqft)} sq ft at ${c.coats} coats over an existing roof`]
    }
  }
}

/** Color swatches for the store's color names. */
export const COLOR_SWATCH: Record<string, string> = {
  white: '#F4F4F2',
  gray: '#9AA1AA',
  grey: '#9AA1AA',
  tan: '#D4BF98',
  clear: 'rgba(255,255,255,0.12)',
  'charcoal gray': '#3F4650',
  charcoal: '#3F4650',
}

/** The patent line under the system's name (the sign-in page and the site's own wording). */
export const CRAZY_SEAL_LINE = 'Patented, fluid-applied, seamless roofing system · U.S. Patent #12,146,061 · Made in the USA'
