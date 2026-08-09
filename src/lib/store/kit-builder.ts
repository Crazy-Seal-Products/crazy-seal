/**
 * Kit Builder logic — pure, client-safe helpers that turn project criteria
 * (application, install method, size, color) into concrete Shopify
 * variants and quantities ready to drop into the cart.
 *
 * All prices come from the live catalog payload built server-side in
 * kit-builder-data.ts — nothing here is hardcoded, so Shopify stays the
 * source of truth.
 */

export type KitApplication = 'rv' | 'commercial' | 'residential' | 'transportation'
export type KitInstallMethod = 'over-existing' | 'direct-to-deck'

export const KIT_COLORS = ['White', 'Gray', 'Tan'] as const
export type KitColor = (typeof KIT_COLORS)[number]

export interface KitVariant {
  /** Shopify Admin GID, e.g. gid://shopify/ProductVariant/123 — cart-ready. */
  id: string
  title: string
  price: number
  image: string | null
  availableForSale: boolean
  selectedOptions: Array<{ name: string; value: string }>
}

export interface KitProduct {
  handle: string
  title: string
  featuredImage: string | null
  options: Array<{ name: string; values: string[] }>
  variants: KitVariant[]
}

/** Trimmed live-catalog payload keyed by Shopify handle. */
export type KitBuilderCatalog = Record<string, KitProduct>

export const KIT_BUILDER_HANDLES = [
  // Sized kits
  'double-layer-kit',
  'direct-to-deck-kit',
  'rv-roofing-kit',
  'direct-to-deck-rv-roofing-kit',
  // Individual products for custom builds
  'crazy-seal',
  'crazy-patch',
  'crazy-caulk',
  'crazy-clean',
  // Pre-built commercial kits for large flat roofs
  '1000-sq-ft-commercial-kit',
  '1-500-sq-ft-commercial-kit',
  '2000-sq-ft-commercial-kit',
  '2500-sq-ft-commercial-kit',
  '3000-sq-ft-commercial-kit',
] as const

/**
 * RV/transport roof length buckets for over-existing installs. Each bucket
 * maps to a kit size tier by index (matches the legacy WP quote tool).
 * Direct-to-deck RV kits carry FT ranges as their own size option, so those
 * come straight from the live product instead.
 */
export const RV_LENGTH_BUCKETS = [
  { value: '0-12', label: '0 FT - 12 FT', tierIndex: 0 },
  { value: '13-25', label: '13 FT - 25 FT', tierIndex: 1 },
  { value: '26-37', label: '26 FT - 37 FT', tierIndex: 2 },
  { value: '38-45', label: '38 FT - 45 FT', tierIndex: 3 },
] as const

// Material coverage formulas (from the legacy WP calculator)
const SQFT_PER_GALLON_SEAL_PER_LAYER = 100
const SEAM_FT_PER_GALLON_PATCH = 70
const SQFT_PER_TUBE_CAULK = 400
const SQFT_PER_GALLON_CLEAN = 1000

const SIZE_OPTION_RE = /size|length/i
const COLOR_OPTION_RE = /color/i

/** Name of the product option holding sizes, e.g. "CHOOSE PROJECT KIT SIZE". */
export function sizeOptionName(product: KitProduct): string | null {
  return product.options.find((o) => SIZE_OPTION_RE.test(o.name))?.name ?? null
}

/** Ordered size option values, e.g. ["<100 SQ FT", "100-200 SQ FT", ...]. */
export function sizeValues(product: KitProduct): string[] {
  const name = sizeOptionName(product)
  return name ? (product.options.find((o) => o.name === name)?.values ?? []) : []
}

/** Upper bound of a size value: "<100 SQ FT" → 100, "Over 45 FT" → Infinity. */
export function sizeUpperBound(value: string): number {
  if (/^\s*over/i.test(value)) return Infinity
  const nums = value.match(/\d+(?:\.\d+)?/g)
  if (!nums) return NaN
  return parseFloat(nums[nums.length - 1])
}

/** First size tier that covers the given measurement (sqft or ft). */
export function findSizeForMeasure(product: KitProduct, measure: number): string | null {
  return sizeValues(product).find((s) => measure <= sizeUpperBound(s)) ?? null
}

/** Largest measurement the product's sized variants can cover. */
export function maxCoveredMeasure(product: KitProduct): number {
  const bounds = sizeValues(product).map(sizeUpperBound).filter((n) => Number.isFinite(n))
  return bounds.length ? Math.max(...bounds) : 0
}

/**
 * Find the variant matching a size and/or color. Option-name matching is
 * fuzzy ("CHOOSE ROOF COLOR" and "Color" both count as color) and values are
 * compared case-insensitively ("WHITE" matches "White").
 */
export function findVariant(
  product: KitProduct,
  wanted: { size?: string | null; color?: string | null }
): KitVariant | null {
  return (
    product.variants.find((v) =>
      v.selectedOptions.every((o) => {
        if (SIZE_OPTION_RE.test(o.name)) {
          return !wanted.size || o.value.toLowerCase() === wanted.size.toLowerCase()
        }
        if (COLOR_OPTION_RE.test(o.name)) {
          return !wanted.color || o.value.toLowerCase() === wanted.color.toLowerCase()
        }
        return true // "Title: Default Title" and other passthrough options
      })
    ) ?? null
  )
}

// ─── Standard sized-kit recommendation ───

export interface KitRecommendation {
  product: KitProduct
  variant: KitVariant
  sizeLabel: string
}

function recommend(
  catalog: KitBuilderCatalog,
  handle: string,
  size: string | null,
  color: KitColor
): KitRecommendation | null {
  const product = catalog[handle]
  if (!product || !size) return null
  const variant = findVariant(product, { size, color })
  return variant ? { product, variant, sizeLabel: size } : null
}

/** Sized kit for a flat roof (returns null when the roof exceeds all tiers). */
export function recommendFlatRoofKit(
  catalog: KitBuilderCatalog,
  params: { sqft: number; installMethod: KitInstallMethod; color: KitColor }
): KitRecommendation | null {
  const handle =
    params.installMethod === 'direct-to-deck' ? 'direct-to-deck-kit' : 'double-layer-kit'
  const product = catalog[handle]
  if (!product) return null
  return recommend(catalog, handle, findSizeForMeasure(product, params.sqft), params.color)
}

/** Sized kit for an RV/transport roof. */
export function recommendRvKit(
  catalog: KitBuilderCatalog,
  params: {
    installMethod: KitInstallMethod
    /** Over-existing: RV_LENGTH_BUCKETS value. Direct-to-deck: the kit's own size value. */
    lengthValue: string
    color: KitColor
  }
): KitRecommendation | null {
  if (params.installMethod === 'direct-to-deck') {
    return recommend(catalog, 'direct-to-deck-rv-roofing-kit', params.lengthValue, params.color)
  }
  const bucket = RV_LENGTH_BUCKETS.find((b) => b.value === params.lengthValue)
  if (!bucket) return null
  const handle = 'rv-roofing-kit'
  const product = catalog[handle]
  if (!product) return null
  return recommend(catalog, handle, sizeValues(product)[bucket.tierIndex] ?? null, params.color)
}

// ─── Pre-built commercial kits ───

const COMMERCIAL_KITS: Array<{ maxSqft: number; handle: string }> = [
  { maxSqft: 1000, handle: '1000-sq-ft-commercial-kit' },
  { maxSqft: 1500, handle: '1-500-sq-ft-commercial-kit' },
  { maxSqft: 2000, handle: '2000-sq-ft-commercial-kit' },
  { maxSqft: 2500, handle: '2500-sq-ft-commercial-kit' },
  { maxSqft: 3000, handle: '3000-sq-ft-commercial-kit' },
]

/** Smallest pre-built commercial kit that covers the roof, if any. */
export function findCommercialKit(
  catalog: KitBuilderCatalog,
  sqft: number
): KitRecommendation | null {
  const entry = COMMERCIAL_KITS.find((k) => sqft <= k.maxSqft)
  if (!entry) return null
  const product = catalog[entry.handle]
  const variant = product?.variants[0]
  return product && variant
    ? { product, variant, sizeLabel: `${entry.maxSqft.toLocaleString()} SQ FT` }
    : null
}

// ─── Custom itemized builds ───

export interface CustomKitLine {
  product: KitProduct
  variant: KitVariant
  quantity: number
  /** Human-readable reason, e.g. "20 gallons — 2 coats at 100 sq ft per gallon". */
  detail: string
}

export interface CustomKitBuild {
  lines: CustomKitLine[]
  total: number
  sealGallons: number
  patchGallons: number
  caulkTubes: number
  cleanGallons: number
  /** Products we couldn't match to a live variant — send these to a specialist. */
  missing: string[]
}

/** Split N gallons into the fewest containers (5 / 3 / 1 gallon sizes). */
function splitGallons(gallons: number): Array<{ container: string; count: number }> {
  const parts: Array<{ container: string; count: number }> = []
  const fives = Math.floor(gallons / 5)
  let rest = gallons - fives * 5
  if (fives > 0) parts.push({ container: '5 Gallon', count: fives })
  if (rest >= 3) {
    parts.push({ container: '3 Gallon', count: 1 })
    rest -= 3
  }
  if (rest > 0) parts.push({ container: '1 Gallon', count: rest })
  return parts
}

/**
 * Build an itemized custom kit from the coverage formulas, resolved against
 * live variants. Used for flat roofs larger than the biggest sized kit.
 */
export function buildCustomKit(
  catalog: KitBuilderCatalog,
  params: { sqft: number; seams: number; color: KitColor }
): CustomKitBuild {
  const layersCount: number = 2
  const sealGallons = Math.ceil(params.sqft / SQFT_PER_GALLON_SEAL_PER_LAYER) * layersCount
  const patchGallons = Math.ceil(params.seams / SEAM_FT_PER_GALLON_PATCH)
  const caulkTubes = Math.ceil(params.sqft / SQFT_PER_TUBE_CAULK)
  const cleanGallons = Math.ceil(params.sqft / SQFT_PER_GALLON_CLEAN)

  const lines: CustomKitLine[] = []
  const missing: string[] = []

  const seal = catalog['crazy-seal']
  if (seal) {
    for (const part of splitGallons(sealGallons)) {
      const variant = findVariant(seal, { size: part.container, color: params.color })
      if (variant) {
        lines.push({
          product: seal,
          variant,
          quantity: part.count,
          detail: `${sealGallons} gallons total — ${layersCount} ${layersCount === 1 ? 'coat' : 'coats'} at ${SQFT_PER_GALLON_SEAL_PER_LAYER} sq ft per gallon`,
        })
      } else {
        missing.push(`Crazy Seal (${part.container})`)
      }
    }
  } else {
    missing.push('Crazy Seal')
  }

  if (patchGallons > 0) {
    const patch = catalog['crazy-patch']
    const variant = patch ? findVariant(patch, { size: '1 Gallon', color: params.color }) : null
    if (patch && variant) {
      lines.push({
        product: patch,
        variant,
        quantity: patchGallons,
        detail: `Covers ${params.seams} linear ft of seams`,
      })
    } else {
      missing.push('Crazy Patch')
    }
  }

  if (caulkTubes > 0) {
    const caulk = catalog['crazy-caulk']
    const variant = caulk ? findVariant(caulk, { size: '1 Tube', color: params.color }) : null
    if (caulk && variant) {
      lines.push({
        product: caulk,
        variant,
        quantity: caulkTubes,
        detail: 'For penetrations and attachment points',
      })
    } else {
      missing.push('Crazy Caulk')
    }
  }

  if (cleanGallons > 0) {
    const clean = catalog['crazy-clean']
    const variant = clean ? findVariant(clean, { size: '1 Gallon' }) : null
    if (clean && variant) {
      lines.push({
        product: clean,
        variant,
        quantity: cleanGallons,
        detail: 'Preps the roof surface for adhesion',
      })
    } else {
      missing.push('Crazy Clean')
    }
  }

  const total = lines.reduce((sum, l) => sum + l.variant.price * l.quantity, 0)
  return { lines, total, sealGallons, patchGallons, caulkTubes, cleanGallons, missing }
}
