import { COMMERCIAL_TAGS, DEALER_TAGS } from '@/lib/pro/status'

export interface MoneyBag {
  shopMoney?: { amount: string; currencyCode: string } | null
}

export interface MailingAddress {
  address1?: string | null
  address2?: string | null
  city?: string | null
  province?: string | null
  provinceCode?: string | null
  zip?: string | null
  country?: string | null
  countryCodeV2?: string | null
  firstName?: string | null
  lastName?: string | null
  name?: string | null
  company?: string | null
  phone?: string | null
}

export interface ShopifyCustomerNode {
  id: string
  legacyResourceId?: string | number | null
  displayName?: string | null
  firstName?: string | null
  lastName?: string | null
  note?: string | null
  tags?: string[] | null
  state?: string | null
  locale?: string | null
  taxExempt?: boolean | null
  taxExemptions?: string[] | null
  verifiedEmail?: boolean | null
  numberOfOrders?: string | number | null
  createdAt?: string | null
  updatedAt?: string | null
  amountSpent?: { amount: string; currencyCode: string } | null
  defaultEmailAddress?: {
    emailAddress?: string | null
    marketingState?: string | null
    marketingOptInLevel?: string | null
    marketingUpdatedAt?: string | null
    validFormat?: boolean | null
  } | null
  defaultPhoneNumber?: {
    phoneNumber?: string | null
    marketingState?: string | null
  } | null
  defaultAddress?: MailingAddress | null
  addressesV2?: { nodes?: MailingAddress[] | null } | null
  lastOrder?: { id: string; name?: string | null; createdAt?: string | null } | null
}

export interface ShopifyLineItemNode {
  id: string
  title?: string | null
  name?: string | null
  sku?: string | null
  vendor?: string | null
  variantTitle?: string | null
  quantity?: number | null
  currentQuantity?: number | null
  unfulfilledQuantity?: number | null
  requiresShipping?: boolean | null
  taxable?: boolean | null
  isGiftCard?: boolean | null
  customAttributes?: Array<{ key?: string | null; value?: string | null }> | null
  originalUnitPriceSet?: MoneyBag | null
  discountedUnitPriceSet?: MoneyBag | null
  originalTotalSet?: MoneyBag | null
  discountedTotalSet?: MoneyBag | null
  variant?: { id: string; sku?: string | null; title?: string | null } | null
  product?: { id: string; title?: string | null; handle?: string | null } | null
}

export interface ShopifyOrderNode {
  id: string
  legacyResourceId?: string | number | null
  name: string
  number?: number | null
  confirmationNumber?: string | null
  email?: string | null
  phone?: string | null
  note?: string | null
  tags?: string[] | null
  createdAt?: string | null
  updatedAt?: string | null
  processedAt?: string | null
  cancelledAt?: string | null
  cancelReason?: string | null
  closedAt?: string | null
  displayFinancialStatus?: string | null
  displayFulfillmentStatus?: string | null
  returnStatus?: string | null
  currencyCode?: string | null
  presentmentCurrencyCode?: string | null
  sourceName?: string | null
  poNumber?: string | null
  test?: boolean | null
  taxesIncluded?: boolean | null
  taxExempt?: boolean | null
  fullyPaid?: boolean | null
  unpaid?: boolean | null
  confirmed?: boolean | null
  customerAcceptsMarketing?: boolean | null
  customerLocale?: string | null
  discountCode?: string | null
  discountCodes?: string[] | null
  paymentGatewayNames?: string[] | null
  customAttributes?: Array<{ key?: string | null; value?: string | null }> | null
  subtotalPriceSet?: MoneyBag | null
  totalPriceSet?: MoneyBag | null
  totalTaxSet?: MoneyBag | null
  totalDiscountsSet?: MoneyBag | null
  totalShippingPriceSet?: MoneyBag | null
  totalRefundedSet?: MoneyBag | null
  totalOutstandingSet?: MoneyBag | null
  currentTotalPriceSet?: MoneyBag | null
  currentSubtotalPriceSet?: MoneyBag | null
  currentTotalDiscountsSet?: MoneyBag | null
  currentTotalTaxSet?: MoneyBag | null
  shippingAddress?: MailingAddress | null
  billingAddress?: MailingAddress | null
  customer?: {
    id: string
    displayName?: string | null
    defaultEmailAddress?: { emailAddress?: string | null } | null
  } | null
  discountApplications?: { nodes?: unknown[] | null } | null
  shippingLines?: { nodes?: unknown[] | null } | null
  lineItems?: { nodes?: ShopifyLineItemNode[] | null } | null
  fulfillments?: unknown[] | null
  refunds?: unknown[] | null
  transactions?: unknown[] | null
  taxLines?: unknown[] | null
}

export interface ConnectionPage<T> {
  pageInfo: { hasNextPage: boolean; endCursor: string | null }
  nodes: T[]
}

function moneyAmount(bag?: MoneyBag | null): number | null {
  const raw = bag?.shopMoney?.amount
  if (raw == null || raw === '') return null
  const n = Number(raw)
  return Number.isFinite(n) ? n : null
}

function moneyCurrency(bag?: MoneyBag | null): string | null {
  return bag?.shopMoney?.currencyCode ?? null
}

function asString(value: string | number | null | undefined): string | null {
  if (value == null) return null
  return String(value)
}

function tagsOf(tags?: string[] | null): string[] {
  return (tags ?? []).map((t) => t.trim()).filter(Boolean)
}

export function customerFlags(tags: string[]): { is_dealer: boolean; is_commercial: boolean } {
  const lower = tags.map((t) => t.toLowerCase())
  return {
    is_dealer: lower.some((t) => DEALER_TAGS.includes(t)),
    is_commercial: lower.some((t) => COMMERCIAL_TAGS.some((c) => t.includes(c))),
  }
}

export function customerRow(node: ShopifyCustomerNode) {
  const tags = tagsOf(node.tags)
  const flags = customerFlags(tags)
  const email = node.defaultEmailAddress?.emailAddress?.trim() || null
  const phone = node.defaultPhoneNumber?.phoneNumber?.trim() || null

  return {
    shopify_id: node.id,
    legacy_resource_id: asString(node.legacyResourceId),
    email,
    phone,
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
    is_dealer: flags.is_dealer,
    is_commercial: flags.is_commercial,
    shopify_created_at: node.createdAt ?? null,
    shopify_updated_at: node.updatedAt ?? null,
    deleted_at: null,
    synced_at: new Date().toISOString(),
    payload: node,
  }
}

export function orderRow(node: ShopifyOrderNode) {
  const tags = tagsOf(node.tags)
  return {
    shopify_id: node.id,
    legacy_resource_id: asString(node.legacyResourceId),
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
    currency: node.currencyCode ?? moneyCurrency(node.totalPriceSet),
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

export function lineItemRows(orderId: string, orderShopifyId: string, nodes: ShopifyLineItemNode[]) {
  return nodes.map((node) => ({
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

export function gidFromRest(
  resource: 'Customer' | 'Order',
  payload: { admin_graphql_api_id?: string; id?: number | string },
) {
  if (payload.admin_graphql_api_id) return payload.admin_graphql_api_id
  if (payload.id == null) return null
  return `gid://shopify/${resource}/${payload.id}`
}
