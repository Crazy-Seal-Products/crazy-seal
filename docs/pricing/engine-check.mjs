// Checks the quote engine (src/lib/pricing/engine.ts) against the 2027 price
// list, worked by hand. Pure: no database, no Shopify. Run with Node 22.18+
// (it loads the TypeScript directly):
//
//   node --no-warnings docs/pricing/engine-check.mjs
//
// The catalog below is a stand-in for the live one, with the live handles and
// the size/colour options the engine reads (Container Size "5 Gallon",
// "1 Tube", tape's "25 FT Roll", the tote's colours only).

import { registerHooks } from 'node:module'
import { test } from 'node:test'
import assert from 'node:assert/strict'

const SRC = new URL('../../src/', import.meta.url)
registerHooks({
  resolve(specifier, context, next) {
    const spec = specifier.startsWith('@/') ? new URL(specifier.slice(2), SRC).href : specifier
    try {
      return next(spec, context)
    } catch (err) {
      if (/^(\.|\/|file:)/.test(spec) && !/\.[cm]?[jt]s$/.test(spec)) return next(`${spec}.ts`, context)
      throw err
    }
  },
})

const engine = await import('../../src/lib/pricing/engine.ts')
const { priceQuote, buildPriceMap, withoutCosts, splitContainers, splitTotes, materialsFor, priceBasisFor, pickDiscount, shippingFor, missingInfo, decideHandoff, offerExpiresAt, jobDiscountFor, nextJobDiscount } = engine
const { DEFAULT_COVERAGE, discountLabel } = await import('../../src/lib/pricing/types.ts')
const { JOB_DISCOUNTS_2027, normalizeJobDiscounts, clientPriceList } = await import('../../src/lib/pricing/price-list-2027.ts')
const { PRICE_LIST_2027, normalizePriceList } = await import('../../src/lib/pricing/costs-2027.ts')
const { FREE_SHIPPING_OVER } = await import('../../src/lib/shipping.ts')
const { formatCountdown } = await import('../../src/lib/quotes/types.ts')

const opt = (name, size, color) => [{ name, value: size }, ...(color ? [{ name: 'Color', value: color }] : [])]
const v = (id, size, color, price, sizeOption = 'Container Size') => ({
  id,
  title: [size, color].filter(Boolean).join(' / '),
  price,
  image: null,
  availableForSale: true,
  selectedOptions: size ? opt(sizeOption, size, color) : [{ name: 'Color', value: color }],
  descriptionHtml: null,
})
const product = (handle, title, variants, options) => ({ handle, title, featuredImage: null, options, variants })
const SIZE_COLOR = [{ name: 'Container Size', values: [] }, { name: 'Color', values: ['White', 'Gray', 'Tan'] }]
const catalog = {
  'crazy-seal': product('crazy-seal', 'Crazy Seal', [v('s5w', '5 Gallon', 'White', 1125), v('s3w', '3 Gallon', 'White', 675), v('s1w', '1 Gallon', 'White', 225), v('s5g', '5 Gallon', 'Gray', 1125)], SIZE_COLOR),
  'crazy-patch': product('crazy-patch', 'Crazy Patch', [v('p1w', '1 Gallon', 'White', 225), v('pqw', '1 Quart', 'White', 75)], SIZE_COLOR),
  'crazy-caulk': product('crazy-caulk', 'Crazy Caulk', [v('c1w', '1 Tube', 'White', 25)], SIZE_COLOR),
  'crazy-clean': product('crazy-clean', 'Crazy Clean', [v('k1', '1 Gallon', 'Clear', 45)], [{ name: 'Container Size', values: [] }, { name: 'Color', values: ['Clear'] }]),
  'crazy-tape': product('crazy-tape', 'Crazy Tape', [v('t1', '25 FT Roll', 'White', 88, 'Quantity')], [{ name: 'Quantity', values: [] }, { name: 'Color', values: ['White'] }]),
  'crazy-seal-tote': product('crazy-seal-tote', 'Crazy Seal Tote', [v('tw', null, 'White', 43312.5), v('tg', null, 'Gray', 43312.5)], [{ name: 'Color', values: ['White', 'Gray', 'Tan'] }]),
}
const list = PRICE_LIST_2027
const prices = buildPriceMap(catalog, [], list)
const settings = {
  free_shipping_under: 3500,
  free_shipping_over: 750,
  capture_phone_at: 1000,
  capture_address_at: 3500,
  coverage: DEFAULT_COVERAGE,
  offer_discount_pct: 10,
  job_discounts: JOB_DISCOUNTS_2027,
}
const roof = (patch) => ({ application: 'commercial', installMethod: 'over-existing', sqft: 1000, rvLengthFt: null, seamsFt: 0, color: 'White', ...patch })
const quote = (inputs, extra = {}) => priceQuote({ inputs, catalog, prices, priceList: list, settings, tiers: [], audience: 'public', buyer: { phone: '555-555-5555', shipTo: { street: '1 A St', city: 'Dallas', state: 'TX', zip: '75001' } }, ...extra })
const line = (r, id) => r.lines.find((l) => l.variant_id === id)
const qty = (r) => Object.fromEntries(r.lines.map((l) => [l.variant_id, l.quantity]))

test('the 2027 sheet is the built-in price list', () => {
  assert.deepEqual(list.retail, { seal: 225, patch: 225, caulk: 25, clean: null, tape: null })
  assert.deepEqual(list.bands, [
    { minSqft: 1500, maxSqft: 5000, perGallon: 145 },
    { minSqft: 5001, maxSqft: 10000, perGallon: 135 },
    { minSqft: 10001, maxSqft: null, perGallon: 120 },
  ])
  assert.deepEqual(list.tote, { gallons: 275, perGallon: 100 })
  assert.deepEqual(list.project, { caulk: 12, clean: 30, tape: 48 })
  assert.deepEqual(list.costs, { seal: 60, patch: 60, caulk: 6, clean: 15, tape: 28, tote: 50 })
  assert.deepEqual(JOB_DISCOUNTS_2027, [{ minOrders: 26, pct: 20 }, { minOrders: 51, pct: 30 }])
  assert.equal(FREE_SHIPPING_OVER, 750)
  // Before 036 (no columns) and for a partial row, the 2027 sheet fills in.
  assert.deepEqual(normalizePriceList(undefined), list)
  assert.deepEqual(normalizePriceList({ retail: { seal: 230 } }).retail, { ...list.retail, seal: 230 })
  assert.deepEqual(normalizeJobDiscounts(undefined), JOB_DISCOUNTS_2027)
  assert.deepEqual(normalizeJobDiscounts([]), [])
  assert.equal('costs' in clientPriceList(list), false)
})

test('variants: sizes, sheet costs, price-book overrides', () => {
  assert.deepEqual(prices.s5w, { product: 'seal', units: 5, cost: 300, fixedFull: null })
  assert.deepEqual(prices.tw, { product: 'tote', units: 275, cost: 13750, fixedFull: null })
  assert.deepEqual(prices.t1, { product: 'tape', units: 1, cost: 28, fixedFull: null })
  assert.equal(prices.pqw, undefined) // a quart isn't a size quotes use
  const book = [
    { variant_id: 's3w', material_cost: 170, markup: null, active: true },
    { variant_id: 's1w', material_cost: null, markup: 3, active: true },
    { variant_id: 's5g', material_cost: null, markup: null, active: false },
  ]
  const p = buildPriceMap(catalog, book, list)
  assert.equal(p.s3w.cost, 170)
  assert.equal(p.s3w.fixedFull, null)
  assert.equal(p.s1w.fixedFull, 180) // $60 sheet cost x 3
  assert.equal(p.s5g, undefined) // off: never quoted
  assert.equal(withoutCosts(p).s3w.cost, null)
})

test('containers: 5 / 3 / 1 gallon pails, and 275-gallon totes', () => {
  const sizes = [5, 3, 1].map((size) => ({ size, variant: size }))
  const split = (n) => splitContainers(n, sizes).map((x) => `${x.size}x${x.count}`).join(' ')
  assert.equal(split(9), '5x1 3x1 1x1')
  assert.equal(split(20), '5x4')
  assert.equal(split(7), '5x1 1x2')
  assert.deepEqual(splitTotes(274, 275), { totes: 0, pailGallons: 274 })
  assert.deepEqual(splitTotes(275, 275), { totes: 1, pailGallons: 0 })
  assert.deepEqual(splitTotes(600, 275), { totes: 2, pailGallons: 50 })
})

test('materials from coverage', () => {
  assert.deepEqual(materialsFor(roof({ seamsFt: 100 }), DEFAULT_COVERAGE), { sqft: 1000, sealGallons: 20, patchGallons: 2, caulkTubes: 3, cleanGallons: 1 })
  assert.equal(materialsFor(roof({ installMethod: 'direct-to-deck' }), DEFAULT_COVERAGE).sealGallons, 28)
  assert.equal(materialsFor(roof({ application: 'rv', sqft: null, rvLengthFt: 30 }), DEFAULT_COVERAGE).sealGallons, 6)
})

test('retail below 1,500 sq ft and for RVs; each project band at its boundaries', () => {
  const basis = (sqft, rv = false) => {
    const b = priceBasisFor(sqft, { rv, bands: list.bands })
    return b.kind === 'retail' ? 'retail' : b.band.perGallon
  }
  assert.equal(basis(1499), 'retail')
  assert.equal(basis(1500), 145)
  assert.equal(basis(5000), 145)
  assert.equal(basis(5001), 135)
  assert.equal(basis(10000), 135)
  assert.equal(basis(10001), 120)
  assert.equal(basis(250_000), 120)
  assert.equal(basis(2000, true), 'retail') // an RV roof is always retail

  // The same roof sizes through the whole engine: a 1 gallon pail of seal at each price.
  const unit = (sqft) => line(quote(roof({ sqft })), 's5w').unit_full / 5
  assert.equal(unit(1499), 225)
  assert.equal(unit(1500), 145)
  assert.equal(unit(5000), 145)
  assert.equal(unit(5001), 135)
  assert.equal(unit(10000), 135)
  assert.equal(unit(10001), 120)
})

test('caulk, clean and tape: project prices on project quotes; retail caulk $25, clean and tape at the project price', () => {
  const retail = quote(roof({ sqft: 1000 }))
  assert.equal(line(retail, 'c1w').unit_full, 25)
  assert.equal(line(retail, 'k1').unit_full, 30)
  const project = quote(roof({ sqft: 2000 }))
  assert.equal(line(project, 'c1w').unit_full, 12)
  assert.equal(line(project, 'k1').unit_full, 30)
  assert.equal(engine.listUnitPrice('tape', { kind: 'retail', band: null }, list), 48)
  assert.equal(engine.listUnitPrice('tape', { kind: 'project', band: list.bands[0] }, list), 48)
  assert.equal(engine.listUnitPrice('patch', { kind: 'project', band: list.bands[2] }, list), 120)
})

test('totes: whole 275-gallon totes once a job needs 275, pails at the band price for the rest', () => {
  // 13,700 sq ft x 2 coats at 100 = 274 gallons: no tote.
  const under = quote(roof({ sqft: 13_700 }))
  assert.equal(under.lines.some((l) => l.variant_id === 'tw'), false)
  assert.deepEqual(qty(under), { s5w: 54, s3w: 1, s1w: 1, c1w: 35, k1: 14 })
  // 13,800 sq ft: 276 gallons = one tote ($27,500) + 1 gallon at the band's $120.
  const one = quote(roof({ sqft: 13_800 }))
  assert.equal(line(one, 'tw').quantity, 1)
  assert.equal(line(one, 'tw').unit_full, 27_500)
  assert.equal(line(one, 's1w').quantity, 1)
  assert.equal(line(one, 's1w').unit_full, 120)
  // 27,500 sq ft: exactly 550 gallons = two totes, no pails.
  const exact = quote(roof({ sqft: 27_500 }))
  assert.equal(line(exact, 'tw').quantity, 2)
  assert.equal(exact.lines.some((l) => l.product_handle === 'crazy-seal'), false)
  // 30,000 sq ft: 600 gallons = 2 totes (550) + 50 gallons in 10 x 5 at $120.
  const two = quote(roof({ sqft: 30_000 }))
  assert.equal(line(two, 'tw').quantity, 2)
  assert.equal(line(two, 's5w').quantity, 10)
  assert.equal(line(two, 's5w').unit_full, 600)
  // Gray has a tote; Tan doesn't, so a Tan job stays in pails rather than fail.
  assert.equal(line(quote(roof({ sqft: 13_800, color: 'Gray' })), 'tg').quantity, 1)
  const tan = quote(roof({ sqft: 13_800, color: 'Tan' }))
  assert.equal(tan.lines.some((l) => l.product_handle === 'crazy-seal-tote'), false)
})

test('the live offer: 10% off the full price for everyone', () => {
  const r = quote(roof({ sqft: 1000 }))
  assert.equal(r.discount_kind, 'offer')
  assert.equal(r.tier_name, 'Live offer')
  assert.equal(r.discount_pct, 10)
  assert.equal(discountLabel(r.tier_name, r.discount_pct), 'Live offer 10%')
  assert.equal(line(r, 's5w').unit_price, 1012.5)
})

test('job discounts replace the 10% (never stack); best of offer, order count and assigned tier', () => {
  const contractor = (orderCount, extra = {}) => quote(roof({ sqft: 1000 }), { audience: 'contractor', orderCount, ...extra })
  assert.equal(contractor(25).discount_pct, 10)
  assert.equal(contractor(26).discount_pct, 20)
  assert.equal(contractor(26).tier_name, 'Contractor 26+ orders')
  assert.equal(contractor(50).discount_pct, 20)
  assert.equal(contractor(51).discount_pct, 30)
  assert.equal(discountLabel(contractor(51).tier_name, 30), 'Contractor 51+ orders 30%')
  // 20%, not 10% + 20%: one 5 gallon pail at $1,125 -> $900.
  assert.equal(line(contractor(26), 's5w').unit_price, 900)
  // The public never gets an order-count discount.
  assert.equal(quote(roof({ sqft: 1000 }), { orderCount: 99 }).discount_pct, 10)

  const tiers = [
    { id: 'mil', name: 'Military', audience: 'contractor', discount_pct: 20, min_subtotal: null, active: true, sort: 0 },
    { id: 'old', name: 'Old', audience: 'contractor', discount_pct: 40, min_subtotal: null, active: false, sort: 0 },
  ]
  const mil = contractor(3, { tiers, contractorTierId: 'mil' })
  assert.equal(mil.discount_pct, 20)
  assert.equal(mil.tier_id, 'mil')
  assert.equal(discountLabel(mil.tier_name, mil.discount_pct), 'Military 20%')
  assert.equal(contractor(60, { tiers, contractorTierId: 'mil' }).discount_pct, 30) // 51+ beats Military 20%
  assert.equal(contractor(30, { tiers, contractorTierId: 'mil' }).tier_name, 'Military') // a tie goes to the assigned tier
  assert.equal(contractor(3, { tiers, contractorTierId: 'old' }).discount_pct, 10) // an inactive tier doesn't count
  assert.equal(pickDiscount({ offerPct: 0, jobDiscounts: [], tiers: [], audience: 'public', subtotalFull: 100 }), null)
  assert.deepEqual(jobDiscountFor(51, JOB_DISCOUNTS_2027), { minOrders: 51, pct: 30 })
  assert.equal(jobDiscountFor(25, JOB_DISCOUNTS_2027), null)
  assert.deepEqual(nextJobDiscount(31, JOB_DISCOUNTS_2027), { minOrders: 51, pct: 30 })
  assert.equal(nextJobDiscount(51, JOB_DISCOUNTS_2027), null)
})

test('shipping: at checkout under $750, free from $750, freight from $3,500 (discounted total)', () => {
  assert.deepEqual(shippingFor(749.99, 3500, 750), { shipping: 'free', shipping_total: null })
  assert.deepEqual(shippingFor(750, 3500, 750), { shipping: 'free', shipping_total: 0 })
  assert.deepEqual(shippingFor(3499.99, 3500, 750), { shipping: 'free', shipping_total: 0 })
  assert.deepEqual(shippingFor(3500, 3500, 750), { shipping: 'freight', shipping_total: null })
  assert.deepEqual(shippingFor(3500, 3500, 750, 410), { shipping: 'freight', shipping_total: 410 })
  // Through the engine: on the total after the discount.
  const small = quote(roof({ application: 'rv', sqft: null, rvLengthFt: 12 })) // 96 sq ft
  assert.ok(small.total < 750)
  assert.equal(small.shipping_total, null)
})

test('expiry: the live offer holds offer_hours (72) from pricing', () => {
  const priced = Date.parse('2027-01-04T15:00:00Z')
  assert.equal(new Date(offerExpiresAt(priced, 72)).toISOString(), '2027-01-07T15:00:00.000Z')
  assert.equal(offerExpiresAt(priced, 72) - priced, 72 * 3_600_000)
  assert.equal(formatCountdown((2 * 24 + 14) * 3_600_000 + 3 * 60_000 + 59_000), '2d 14h 03m')
  assert.equal(formatCountdown(14 * 3_600_000 + 3 * 60_000 + 9_000), '14h 03m 09s')
  assert.equal(formatCountdown(-5), '0h 00m 00s')
})

test('missing details and handoff order', () => {
  const s = { capture_phone_at: 1000, capture_address_at: 3500 }
  assert.deepEqual(missingInfo(999, {}, s), [])
  assert.deepEqual(missingInfo(3500, { phone: '1' }, s), ['ship_to'])
  assert.equal(decideHandoff({ shipping: 'freight', audience: 'contractor', paymentTerms: 'terms', missing: ['phone'] }), 'freight')
  assert.equal(decideHandoff({ shipping: 'free', audience: 'contractor', paymentTerms: 'terms', missing: [] }), 'terms')
  assert.equal(decideHandoff({ shipping: 'free', audience: 'public', missing: [], unavailable: ['Crazy Patch (Tan)'] }), 'no_access')
  assert.equal(decideHandoff({ shipping: 'free', audience: 'public', missing: ['phone'] }), 'incomplete')
})

test('a staff price replaces every discount', () => {
  const r = quote(roof({ sqft: 5000 }), { audience: 'contractor', orderCount: 60, override: { discountPct: 15, freight: 250 } })
  assert.equal(r.tier_name, 'Staff price')
  assert.equal(r.discount_pct, 15)
  assert.equal(r.shipping, 'freight')
  assert.equal(r.total, Math.round((r.subtotal_full - r.discount_total + 250) * 100) / 100)
})

// ─── The three worked examples in the report ─────────────────────────────

test('example 1: a 38 ft RV (304 sq ft), 40 ft of seams, public: retail, live offer, free shipping', () => {
  const r = quote(roof({ application: 'rv', sqft: null, rvLengthFt: 38, seamsFt: 40 }))
  assert.equal(r.basis.kind, 'retail')
  // 8 gal seal (5 + 3) $1,800, 1 gal patch $225, 1 caulk $25, 1 clean $30 (project price: no retail)
  assert.deepEqual(qty(r), { s5w: 1, s3w: 1, p1w: 1, c1w: 1, k1: 1 })
  assert.equal(r.subtotal_full, 2080)
  assert.equal(r.discount_total, 208)
  assert.equal(r.total, 1872)
  assert.equal(r.shipping_total, 0)
  assert.equal(r.cost_total, 561) // 480 + 60 + 6 + 15
})

test('example 2: 4,000 sq ft public roof, 200 ft of seams: band $145, live offer 10%, freight', () => {
  const r = quote(roof({ sqft: 4000, seamsFt: 200 }))
  assert.equal(r.basis.band.perGallon, 145)
  // 80 gal seal = 16 x 5 at $725 = $11,600; 3 gal patch $435; 10 caulk $120; 4 clean $120
  assert.deepEqual(qty(r), { s5w: 16, p1w: 3, c1w: 10, k1: 4 })
  assert.equal(r.subtotal_full, 12275)
  assert.equal(r.discount_total, 1227.5)
  assert.equal(r.total, 11047.5)
  assert.equal(r.shipping, 'freight')
  assert.equal(r.handoff, 'freight')
  assert.equal(r.cost_total, 5100)
})

test('example 3: 12,000 sq ft direct-to-deck contractor roof, 55 orders: band $120, a tote, 30% off', () => {
  const r = quote(roof({ sqft: 12_000, installMethod: 'direct-to-deck', seamsFt: 300 }), { audience: 'contractor', orderCount: 55 })
  assert.equal(r.basis.band.perGallon, 120)
  // 320 gal seal = 1 tote (275) + 45 gal (9 x 5); 5 gal patch; 30 caulk; 12 clean
  assert.deepEqual(qty(r), { tw: 1, s5w: 9, p1w: 5, c1w: 30, k1: 12 })
  assert.equal(r.subtotal_full, 34220) // 27,500 + 5,400 + 600 + 360 + 360
  assert.equal(r.tier_name, 'Contractor 51+ orders')
  assert.equal(r.discount_pct, 30)
  assert.equal(r.total, 23954)
  assert.equal(r.cost_total, 17110) // 13,750 + 2,700 + 300 + 180 + 180
  assert.equal(r.shipping, 'freight')
})
