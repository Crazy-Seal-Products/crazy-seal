import { createAdminClient } from '@/lib/supabase/admin'
import { normalizePriceList, PRICE_LIST_2027 } from './costs-2027'
import { FREE_SHIPPING_OVER_2027, JOB_DISCOUNTS_2027, normalizeJobDiscounts } from './price-list-2027'
import { DEFAULT_COVERAGE, type Coverage, type PricingSettings } from './types'

/**
 * Reads the one pricing_settings row (031_pricing.sql, 036_price_list.sql).
 * Server only. It selects '*', so it works before 036 is applied: the price
 * list, job discounts and free-shipping line then come from the built-in 2027
 * defaults (price-list-2027.ts).
 */

/** The table's defaults, used only if the row can't be read. */
export const DEFAULT_SETTINGS: PricingSettings = {
  default_markup: 2,
  offer_discount_pct: 10,
  offer_hours: 72,
  free_shipping_under: 3500,
  free_shipping_over: FREE_SHIPPING_OVER_2027,
  price_list: PRICE_LIST_2027,
  job_discounts: JOB_DISCOUNTS_2027,
  has_price_list: false,
  capture_phone_at: 1000,
  capture_address_at: 3500,
  reminder_hours: 24,
  auto_reoffer: false,
  public_builder_live: false,
  coverage: DEFAULT_COVERAGE,
  updated_by: null,
  updated_at: null,
}

const n = (v: unknown, fallback: number) => {
  const x = Number(v)
  return v != null && Number.isFinite(x) ? x : fallback
}

export function normalizeCoverage(raw: unknown): Coverage {
  const c = (raw && typeof raw === 'object' ? raw : {}) as Record<string, unknown>
  const seal = (c.sealSqftPerGallonPerCoat && typeof c.sealSqftPerGallonPerCoat === 'object' ? c.sealSqftPerGallonPerCoat : {}) as Record<string, unknown>
  return {
    coats: n(c.coats, DEFAULT_COVERAGE.coats),
    caulkSqftPerTube: n(c.caulkSqftPerTube, DEFAULT_COVERAGE.caulkSqftPerTube),
    patchFtPerGallon: n(c.patchFtPerGallon, DEFAULT_COVERAGE.patchFtPerGallon),
    cleanSqftPerGallon: n(c.cleanSqftPerGallon, DEFAULT_COVERAGE.cleanSqftPerGallon),
    sealSqftPerGallonPerCoat: {
      'over-existing': n(seal['over-existing'], DEFAULT_COVERAGE.sealSqftPerGallonPerCoat['over-existing']),
      'direct-to-deck': n(seal['direct-to-deck'], DEFAULT_COVERAGE.sealSqftPerGallonPerCoat['direct-to-deck']),
    },
  }
}

export function normalizeSettings(row: Record<string, unknown> | null): PricingSettings {
  if (!row) return DEFAULT_SETTINGS
  const d = DEFAULT_SETTINGS
  return {
    default_markup: n(row.default_markup, d.default_markup),
    offer_discount_pct: n(row.offer_discount_pct, d.offer_discount_pct),
    offer_hours: n(row.offer_hours, d.offer_hours),
    free_shipping_under: n(row.free_shipping_under, d.free_shipping_under),
    free_shipping_over: n(row.free_shipping_over, d.free_shipping_over),
    price_list: normalizePriceList(row.price_list),
    job_discounts: 'job_discounts' in row ? normalizeJobDiscounts(row.job_discounts) : d.job_discounts,
    has_price_list: 'price_list' in row,
    capture_phone_at: n(row.capture_phone_at, d.capture_phone_at),
    capture_address_at: n(row.capture_address_at, d.capture_address_at),
    reminder_hours: n(row.reminder_hours, d.reminder_hours),
    auto_reoffer: row.auto_reoffer === true,
    public_builder_live: row.public_builder_live === true,
    coverage: normalizeCoverage(row.coverage),
    updated_by: (row.updated_by as string | null) ?? null,
    updated_at: (row.updated_at as string | null) ?? null,
  }
}

export async function getPricingSettings(): Promise<PricingSettings> {
  const { data, error } = await createAdminClient().from('pricing_settings').select('*').eq('id', true).maybeSingle()
  if (error) throw new Error(`pricing_settings: ${error.message}`)
  return normalizeSettings(data as Record<string, unknown> | null)
}
