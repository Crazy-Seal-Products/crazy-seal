import { createAdminClient } from '@/lib/supabase/admin'
import { getStoreProducts } from '@/lib/store/products'
import type { KitBuilderCatalog } from '@/lib/store/kit-builder'
import { listUnitPrice, QUOTE_HANDLES, QUOTE_PRODUCTS, round2, variantUnits } from './engine'
import { PRODUCT_KEYS, type PriceList, type ProductKey } from './price-list-2027'
import type { PriceBookRow } from './types'

/**
 * Reads price_book (031_pricing.sql) and the Shopify variants quotes use.
 * Server only. A price_book row is an optional override for one variant: off
 * (never quoted), its own material cost, and with a markup a fixed price of
 * cost x markup in place of the price list.
 */

function toRow(r: Record<string, unknown>): PriceBookRow {
  return {
    variant_id: String(r.variant_id),
    product_handle: String(r.product_handle ?? ''),
    title: String(r.title ?? ''),
    material_cost: r.material_cost == null ? null : Number(r.material_cost),
    markup: r.markup == null ? null : Number(r.markup),
    active: r.active !== false,
    updated_by: (r.updated_by as string | null) ?? null,
    updated_at: (r.updated_at as string | null) ?? null,
  }
}

export async function getPriceBook(): Promise<PriceBookRow[]> {
  const { data, error } = await createAdminClient().from('price_book').select('*').order('product_handle').order('title')
  if (error) throw new Error(`price_book: ${error.message}`)
  return (data ?? []).map((r) => toRow(r as Record<string, unknown>))
}

/**
 * The live catalog, trimmed to the products quotes price (Crazy Seal, Patch,
 * Caulk, Clean, Tape and the Crazy Seal tote), in the kit builder's shape.
 */
export async function getQuoteCatalog(): Promise<KitBuilderCatalog> {
  const products = await getStoreProducts()
  const out: KitBuilderCatalog = {}
  for (const handle of QUOTE_HANDLES) {
    const p = products.find((x) => x.handle === handle)
    if (!p) continue
    out[handle] = {
      handle: p.handle,
      title: p.displayTitle,
      featuredImage: p.featuredImage,
      options: p.options,
      variants: p.variants.map((v) => ({
        id: v.id,
        title: v.title,
        price: parseFloat(v.price),
        image: v.image ?? p.featuredImage,
        availableForSale: v.availableForSale,
        selectedOptions: v.selectedOptions,
        descriptionHtml: null,
      })),
    }
  }
  return out
}

export interface PriceBookEditorRow {
  variant_id: string
  product: ProductKey
  product_handle: string
  product_title: string
  variant_title: string
  /** Units in one: gallons, tubes, 25 ft rolls. Null: a size quotes don't use (e.g. a quart). */
  units: number | null
  /** The Shopify (store) price. */
  shopify_price: number
  /** The price list's retail price for one (a tote: its tote price). */
  retail_price: number | null
  /** The price list's cost for one. */
  sheet_cost: number | null
  material_cost: number | null
  markup: number | null
  active: boolean
  in_book: boolean
  updated_by: string | null
  updated_at: string | null
}

/** One row per variant of the quoted products, with its price-book entry if any. */
export function priceBookEditorRows(catalog: KitBuilderCatalog, book: PriceBookRow[], list: PriceList): PriceBookEditorRow[] {
  const byId = new Map(book.map((r) => [r.variant_id, r]))
  const rows: PriceBookEditorRow[] = []
  for (const product of PRODUCT_KEYS) {
    const handle = QUOTE_PRODUCTS[product]
    const p = catalog[handle]
    if (!p) continue
    for (const v of p.variants) {
      const r = byId.get(v.id)
      const units = variantUnits(product, v, list.tote.gallons)
      rows.push({
        variant_id: v.id,
        product,
        product_handle: handle,
        product_title: p.title,
        variant_title: v.title,
        units,
        shopify_price: v.price,
        retail_price: units ? round2(listUnitPrice(product, { kind: 'retail', band: null }, list) * units) : null,
        sheet_cost: units ? round2(list.costs[product] * units) : null,
        material_cost: r?.material_cost ?? null,
        markup: r?.markup ?? null,
        active: r?.active ?? true,
        in_book: Boolean(r),
        updated_by: r?.updated_by ?? null,
        updated_at: r?.updated_at ?? null,
      })
    }
  }
  return rows
}
