/**
 * Full Shopify customers + orders backfill into Supabase.
 *
 *   node --experimental-strip-types scripts/backfill-shopify-commerce.mjs
 *   node --experimental-strip-types scripts/backfill-shopify-commerce.mjs --reset
 */
import { readFileSync } from 'node:fs'
import { createClient } from '@supabase/supabase-js'
import {
  CUSTOMERS_PAGE_QUERY,
  ORDERS_PAGE_QUERY,
} from '../src/lib/shopify/commerce-queries.ts'

const reset = process.argv.includes('--reset')
const DEALER_TAGS = ['dealer', 'pro', 'professional']
const COMMERCIAL_TAGS = ['commercial', 'fleet', 'facility', 'facilities', 'shop']

const envText = readFileSync(new URL('../.env.local', import.meta.url), 'utf8')
for (const line of envText.split('\n')) {
  if (!line || line.startsWith('#') || !line.includes('=')) continue
  const i = line.indexOf('=')
  const key = line.slice(0, i).trim()
  let value = line.slice(i + 1).trim()
  if (
    (value.startsWith('"') && value.endsWith('"')) ||
    (value.startsWith("'") && value.endsWith("'"))
  ) {
    value = value.slice(1, -1)
  }
  if (!process.env[key]) process.env[key] = value
}

const domain = process.env.SHOPIFY_STORE_DOMAIN
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SECRET_KEY,
)

function moneyAmount(bag) {
  const raw = bag?.shopMoney?.amount
  if (raw == null || raw === '') return null
  const n = Number(raw)
  return Number.isFinite(n) ? n : null
}

function tagsOf(tags) {
  return (tags ?? []).map((t) => t.trim()).filter(Boolean)
}

function customerRow(node) {
  const tags = tagsOf(node.tags)
  const lower = tags.map((t) => t.toLowerCase())
  return {
    shopify_id: node.id,
    legacy_resource_id: node.legacyResourceId != null ? String(node.legacyResourceId) : null,
    email: node.defaultEmailAddress?.emailAddress?.trim() || null,
    phone: node.defaultPhoneNumber?.phoneNumber?.trim() || null,
    first_name: node.firstName ?? null,
    last_name: node.lastName ?? null,
    display_name: node.displayName ?? null,
    note: node.note ?? null,
    tags,
    state: node.state ?? null,
    locale: node.locale ?? null,
    tax_exempt: node.taxExempt ?? null,
    verified_email: node.verifiedEmail ?? null,
    number_of_orders: Number(node.numberOfOrders) || 0,
    amount_spent: node.amountSpent?.amount != null ? Number(node.amountSpent.amount) : null,
    amount_spent_currency: node.amountSpent?.currencyCode ?? null,
    default_address: node.defaultAddress ?? null,
    addresses: node.addressesV2?.nodes ?? [],
    email_marketing_state: node.defaultEmailAddress?.marketingState ?? null,
    sms_marketing_state: node.defaultPhoneNumber?.marketingState ?? null,
    is_dealer: lower.some((t) => DEALER_TAGS.includes(t)),
    is_commercial: lower.some((t) => COMMERCIAL_TAGS.some((c) => t.includes(c))),
    shopify_created_at: node.createdAt ?? null,
    shopify_updated_at: node.updatedAt ?? null,
    deleted_at: null,
    synced_at: new Date().toISOString(),
    payload: node,
  }
}

function orderRow(node) {
  const tags = tagsOf(node.tags)
  return {
    shopify_id: node.id,
    legacy_resource_id: node.legacyResourceId != null ? String(node.legacyResourceId) : null,
    name: node.name,
    number: node.number ?? null,
    confirmation_number: node.confirmationNumber ?? null,
    email: node.email ?? node.customer?.defaultEmailAddress?.emailAddress ?? null,
    phone: node.phone ?? null,
    customer_shopify_id: node.customer?.id ?? null,
    customer_email: node.customer?.defaultEmailAddress?.emailAddress ?? node.email ?? null,
    customer_display_name: node.customer?.displayName ?? null,
    financial_status: node.displayFinancialStatus ?? null,
    fulfillment_status: node.displayFulfillmentStatus ?? null,
    return_status: node.returnStatus ?? null,
    cancelled_at: node.cancelledAt ?? null,
    cancel_reason: node.cancelReason ?? null,
    closed_at: node.closedAt ?? null,
    processed_at: node.processedAt ?? null,
    currency: node.currencyCode ?? node.totalPriceSet?.shopMoney?.currencyCode ?? null,
    presentment_currency: node.presentmentCurrencyCode ?? null,
    subtotal_price: moneyAmount(node.subtotalPriceSet),
    total_price: moneyAmount(node.totalPriceSet),
    total_tax: moneyAmount(node.totalTaxSet),
    total_discounts: moneyAmount(node.totalDiscountsSet),
    total_shipping: moneyAmount(node.totalShippingPriceSet),
    total_refunded: moneyAmount(node.totalRefundedSet),
    total_outstanding: moneyAmount(node.totalOutstandingSet),
    current_total_price: moneyAmount(node.currentTotalPriceSet),
    tags,
    note: node.note ?? null,
    source_name: node.sourceName ?? null,
    po_number: node.poNumber ?? null,
    test: Boolean(node.test),
    taxes_included: node.taxesIncluded ?? null,
    tax_exempt: node.taxExempt ?? null,
    fully_paid: node.fullyPaid ?? null,
    unpaid: node.unpaid ?? null,
    confirmed: node.confirmed ?? null,
    shipping_address: node.shippingAddress ?? null,
    billing_address: node.billingAddress ?? null,
    shipping_lines: node.shippingLines?.nodes ?? [],
    fulfillments: node.fulfillments ?? [],
    refunds: node.refunds ?? [],
    transactions: node.transactions ?? [],
    discount_codes: node.discountCodes ?? (node.discountCode ? [node.discountCode] : []),
    discount_applications: node.discountApplications?.nodes ?? [],
    custom_attributes: node.customAttributes ?? [],
    payment_gateway_names: node.paymentGatewayNames ?? [],
    shopify_created_at: node.createdAt ?? null,
    shopify_updated_at: node.updatedAt ?? null,
    deleted_at: null,
    synced_at: new Date().toISOString(),
    payload: node,
  }
}

function lineItemRows(orderId, orderShopifyId, nodes) {
  return (nodes ?? []).map((node) => ({
    shopify_id: node.id,
    order_id: orderId,
    order_shopify_id: orderShopifyId,
    title: node.title ?? null,
    name: node.name ?? null,
    sku: node.sku ?? node.variant?.sku ?? null,
    vendor: node.vendor ?? null,
    variant_title: node.variantTitle ?? node.variant?.title ?? null,
    quantity: node.quantity ?? null,
    current_quantity: node.currentQuantity ?? null,
    unfulfilled_quantity: node.unfulfilledQuantity ?? null,
    variant_shopify_id: node.variant?.id ?? null,
    product_shopify_id: node.product?.id ?? null,
    product_title: node.product?.title ?? null,
    product_handle: node.product?.handle ?? null,
    original_unit_price: moneyAmount(node.originalUnitPriceSet),
    discounted_unit_price: moneyAmount(node.discountedUnitPriceSet),
    original_total: moneyAmount(node.originalTotalSet),
    discounted_total: moneyAmount(node.discountedTotalSet),
    requires_shipping: node.requiresShipping ?? null,
    taxable: node.taxable ?? null,
    is_gift_card: node.isGiftCard ?? null,
    custom_attributes: node.customAttributes ?? [],
    payload: node,
  }))
}

let cachedToken = null
async function adminToken() {
  if (cachedToken && Date.now() < cachedToken.expiresAt) return cachedToken.token
  const res = await fetch(`https://${domain}/admin/oauth/access_token`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      grant_type: 'client_credentials',
      client_id: process.env.SHOPIFY_CLIENT_ID,
      client_secret: process.env.SHOPIFY_CLIENT_SECRET,
    }),
  })
  if (!res.ok) throw new Error(`Shopify token exchange failed: HTTP ${res.status}`)
  const data = await res.json()
  cachedToken = {
    token: data.access_token,
    expiresAt: Date.now() + (data.expires_in - 300) * 1000,
  }
  return cachedToken.token
}

async function graphql(query, variables, attempt = 1) {
  const token = await adminToken()
  const res = await fetch(`https://${domain}/admin/api/2026-07/graphql.json`, {
    method: 'POST',
    headers: {
      'X-Shopify-Access-Token': token,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ query, variables }),
  })
  if (res.status === 429 && attempt < 8) {
    const wait = Number(res.headers.get('retry-after') || 2) * 1000 * attempt
    console.log(`throttled, waiting ${wait}ms`)
    await new Promise((r) => setTimeout(r, wait))
    return graphql(query, variables, attempt + 1)
  }
  if (!res.ok) throw new Error(`Shopify Admin API error: HTTP ${res.status}`)
  const json = await res.json()
  const throttled = json.errors?.some((e) => /throttl/i.test(e.message || ''))
  if (throttled && attempt < 8) {
    const wait = 1500 * attempt
    console.log(`graphql throttle, waiting ${wait}ms`)
    await new Promise((r) => setTimeout(r, wait))
    return graphql(query, variables, attempt + 1)
  }
  if (json.errors?.length) throw new Error(`Shopify GraphQL error: ${JSON.stringify(json.errors)}`)
  return json.data
}

async function loadState(resource) {
  const { data } = await supabase
    .from('shopify_sync_state')
    .select('cursor, records_synced')
    .eq('resource', resource)
    .maybeSingle()
  return data
}

async function saveState(resource, cursor, records, error = null) {
  const { error: saveError } = await supabase.from('shopify_sync_state').upsert({
    resource,
    cursor,
    records_synced: records,
    last_completed_at: cursor ? null : new Date().toISOString(),
    last_error: error,
    updated_at: new Date().toISOString(),
  }, { onConflict: 'resource' })
  if (saveError) throw new Error(`sync state save failed: ${saveError.message}`)
}

async function syncCustomers() {
  const previous = reset ? null : await loadState('customers')
  let cursor = previous?.cursor ?? null
  let records = previous?.cursor ? previous.records_synced : 0
  let page = 0
  console.log(`customers: starting ${cursor ? 'resume' : 'from beginning'} synced=${records}`)

  while (true) {
    const data = await graphql(CUSTOMERS_PAGE_QUERY, { cursor })
    const nodes = data.customers?.nodes ?? []
    if (nodes.length) {
      const { error } = await supabase
        .from('shopify_customers')
        .upsert(nodes.map(customerRow), { onConflict: 'shopify_id' })
      if (error) throw new Error(`customer upsert failed: ${error.message}`)
      records += nodes.length
    }
    page += 1
    const hasMore = Boolean(data.customers?.pageInfo?.hasNextPage)
    cursor = hasMore ? data.customers.pageInfo.endCursor : null
    await saveState('customers', cursor, records)
    console.log(`customers: page ${page} +${nodes.length} total=${records} hasMore=${hasMore}`)
    if (!hasMore) break
  }
  return records
}

async function syncOrders() {
  const previous = reset ? null : await loadState('orders')
  let cursor = previous?.cursor ?? null
  let records = previous?.cursor ? previous.records_synced : 0
  let page = 0
  let lineItems = 0
  console.log(`orders: starting ${cursor ? 'resume' : 'from beginning'} synced=${records}`)

  while (true) {
    const data = await graphql(ORDERS_PAGE_QUERY, { cursor })
    const nodes = data.orders?.nodes ?? []
    if (nodes.length) {
      const { data: saved, error } = await supabase
        .from('shopify_orders')
        .upsert(nodes.map(orderRow), { onConflict: 'shopify_id' })
        .select('id, shopify_id')
      if (error) throw new Error(`order upsert failed: ${error.message}`)
      const idByShopify = new Map((saved ?? []).map((r) => [r.shopify_id, r.id]))
      const items = []
      for (const node of nodes) {
        const orderId = idByShopify.get(node.id)
        if (!orderId) continue
        items.push(...lineItemRows(orderId, node.id, node.lineItems?.nodes ?? []))
      }
      if (items.length) {
        const { error: lineError } = await supabase
          .from('shopify_order_line_items')
          .upsert(items, { onConflict: 'shopify_id' })
        if (lineError) throw new Error(`line item upsert failed: ${lineError.message}`)
        lineItems += items.length
      }
      records += nodes.length
    }
    page += 1
    const hasMore = Boolean(data.orders?.pageInfo?.hasNextPage)
    cursor = hasMore ? data.orders.pageInfo.endCursor : null
    await saveState('orders', cursor, records)
    console.log(`orders: page ${page} +${nodes.length} total=${records} lineItems=${lineItems} hasMore=${hasMore}`)
    if (!hasMore) break
  }
  return records
}

const started = Date.now()
try {
  const customers = await syncCustomers()
  const orders = await syncOrders()
  const { count: customerCount } = await supabase
    .from('shopify_customers').select('id', { count: 'exact', head: true }).is('deleted_at', null)
  const { count: orderCount } = await supabase
    .from('shopify_orders').select('id', { count: 'exact', head: true }).is('deleted_at', null)
  const { count: lineCount } = await supabase
    .from('shopify_order_line_items').select('id', { count: 'exact', head: true })
  const secs = ((Date.now() - started) / 1000).toFixed(1)
  console.log(`done in ${secs}s. this run: customers=${customers} orders=${orders}`)
  console.log(`database totals: customers=${customerCount} orders=${orderCount} line_items=${lineCount}`)
} catch (err) {
  console.error(err.message || err)
  process.exit(1)
}
