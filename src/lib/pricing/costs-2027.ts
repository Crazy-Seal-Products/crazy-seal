// Crazy Seal's material costs (Thermo's 2027 price to Crazy Seal) and the full
// 2027 price list with them. SERVER ONLY: import this only from server code
// (settings, pricing actions, quote creation), never from a 'use client'
// module or anything a client component imports, so costs never reach a
// browser bundle. Prices alone are in price-list-2027.ts.

import { money, normalizeBands, obj, PRICES_2027, PRODUCT_KEYS, type PriceList, type ProductKey } from './price-list-2027'

/** Per unit: gallon (Seal, Patch, Clean), tube (Caulk), 25 ft roll (Tape); a tote per gallon. */
export const COSTS_2027: Record<ProductKey, number> = { seal: 60, patch: 60, caulk: 6, clean: 15, tape: 28, tote: 50 }

/** The whole 2027 sheet: prices and costs. */
export const PRICE_LIST_2027: PriceList = { ...PRICES_2027, costs: COSTS_2027 }

/**
 * pricing_settings.price_list as a PriceList: every field the row has and
 * is a valid amount, the 2027 sheet for the rest (and all of it when the
 * column doesn't exist yet).
 */
export function normalizePriceList(raw: unknown): PriceList {
  const d = PRICE_LIST_2027
  const r = obj(raw)
  const retail = obj(r.retail)
  const project = obj(r.project)
  const tote = obj(r.tote)
  const costs = obj(r.costs)
  const orNull = (v: unknown, fallback: number | null) => (v === null ? null : (money(v) ?? fallback))
  const gallons = money(tote.gallons)
  return {
    retail: {
      seal: money(retail.seal) ?? d.retail.seal,
      patch: money(retail.patch) ?? d.retail.patch,
      caulk: money(retail.caulk) ?? d.retail.caulk,
      clean: 'clean' in retail ? orNull(retail.clean, d.retail.clean) : d.retail.clean,
      tape: 'tape' in retail ? orNull(retail.tape, d.retail.tape) : d.retail.tape,
    },
    bands: normalizeBands(r.bands),
    tote: { gallons: gallons && gallons >= 1 ? Math.round(gallons) : d.tote.gallons, perGallon: money(tote.perGallon) ?? d.tote.perGallon },
    project: {
      caulk: money(project.caulk) ?? d.project.caulk,
      clean: money(project.clean) ?? d.project.clean,
      tape: money(project.tape) ?? d.project.tape,
    },
    costs: Object.fromEntries(PRODUCT_KEYS.map((k) => [k, money(costs[k]) ?? d.costs[k]])) as Record<ProductKey, number>,
  }
}

