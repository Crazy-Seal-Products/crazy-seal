import { shopifyAdminGraphql } from '@/lib/shopify/admin'
import { HIGH_VOLUME_ORDER_THRESHOLD } from './config'

export interface ShopifyCustomerSummary {
  id: string
  displayName: string
  email: string | null
  phone: string | null
  tags: string[]
  numberOfOrders: number
  amountSpent: string | null
}

export interface ShopifyOrderLine {
  title: string
  quantity: number
  variantId: string | null
  sku: string | null
}

export interface ShopifyOrder {
  id: string
  name: string
  createdAt: string
  fulfillmentStatus: string | null
  financialStatus: string | null
  total: string | null
  currency: string | null
  lineItems: ShopifyOrderLine[]
}

interface CustomersQuery {
  customers: {
    nodes: Array<{
      id: string
      displayName: string
      email?: string | null
      phone?: string | null
      tags: string[]
      numberOfOrders: number
      amountSpent?: { amount: string; currencyCode: string } | null
    }>
  }
}

interface CustomerOrdersQuery {
  customer: {
    id: string
    displayName: string
    email?: string | null
    phone?: string | null
    tags: string[]
    numberOfOrders: number
    orders: {
      nodes: Array<{
        id: string
        name: string
        createdAt: string
        displayFulfillmentStatus?: string | null
        displayFinancialStatus?: string | null
        totalPriceSet?: { shopMoney: { amount: string; currencyCode: string } }
        lineItems: {
          nodes: Array<{
            title: string
            quantity: number
            variant?: { id: string; sku?: string | null } | null
          }>
        }
      }>
    }
  } | null
}

const CUSTOMER_FIELDS = `
  id
  displayName
  email
  phone
  tags
  numberOfOrders
  amountSpent { amount currencyCode }
`

function mapCustomer(node: CustomersQuery['customers']['nodes'][number]): ShopifyCustomerSummary {
  return {
    id: node.id,
    displayName: node.displayName,
    email: node.email ?? null,
    phone: node.phone ?? null,
    tags: node.tags ?? [],
    numberOfOrders: Number(node.numberOfOrders) || 0,
    amountSpent: node.amountSpent
      ? `${node.amountSpent.amount} ${node.amountSpent.currencyCode}`
      : null,
  }
}

export async function findShopifyCustomerByEmail(email: string): Promise<ShopifyCustomerSummary | null> {
  const escaped = email.replace(/"/g, '')
  const data = await shopifyAdminGraphql<CustomersQuery>(
    `query CustomersByEmail($query: String!) {
      customers(first: 10, query: $query) { nodes { ${CUSTOMER_FIELDS} } }
    }`,
    { query: `email:${escaped}` },
  )
  const nodes = data.customers?.nodes ?? []
  const exact = nodes.find((n) => n.email?.toLowerCase() === email.toLowerCase())
  const pick = exact ?? nodes[0]
  return pick ? mapCustomer(pick) : null
}

export async function getShopifyOrdersForCustomer(customerId: string): Promise<ShopifyOrder[]> {
  const data = await shopifyAdminGraphql<CustomerOrdersQuery>(
    `query CustomerOrders($id: ID!) {
      customer(id: $id) {
        id
        displayName
        email
        phone
        tags
        numberOfOrders
        orders(first: 50, sortKey: CREATED_AT, reverse: true) {
          nodes {
            id
            name
            createdAt
            displayFulfillmentStatus
            displayFinancialStatus
            totalPriceSet { shopMoney { amount currencyCode } }
            lineItems(first: 40) {
              nodes {
                title
                quantity
                variant { id sku }
              }
            }
          }
        }
      }
    }`,
    { id: customerId },
  )
  const orders = data.customer?.orders?.nodes ?? []
  return orders.map((o) => ({
    id: o.id,
    name: o.name,
    createdAt: o.createdAt,
    fulfillmentStatus: o.displayFulfillmentStatus ?? null,
    financialStatus: o.displayFinancialStatus ?? null,
    total: o.totalPriceSet?.shopMoney.amount ?? null,
    currency: o.totalPriceSet?.shopMoney.currencyCode ?? null,
    lineItems: (o.lineItems?.nodes ?? []).map((li) => ({
      title: li.title,
      quantity: li.quantity,
      variantId: li.variant?.id ?? null,
      sku: li.variant?.sku ?? null,
    })),
  }))
}

export async function listTaggedDealers(limit = 50): Promise<ShopifyCustomerSummary[]> {
  const data = await shopifyAdminGraphql<CustomersQuery>(
    `query TaggedDealers($query: String!, $first: Int!) {
      customers(first: $first, query: $query, sortKey: ORDERS_COUNT, reverse: true) {
        nodes { ${CUSTOMER_FIELDS} }
      }
    }`,
    { query: 'tag:dealer', first: limit },
  )
  return (data.customers?.nodes ?? []).map(mapCustomer)
}

export async function listHighVolumeCustomers(limit = 50): Promise<ShopifyCustomerSummary[]> {
  const data = await shopifyAdminGraphql<CustomersQuery>(
    `query HighVolumeCustomers($first: Int!) {
      customers(first: $first, sortKey: ORDERS_COUNT, reverse: true) {
        nodes { ${CUSTOMER_FIELDS} }
      }
    }`,
    { first: limit },
  )
  return (data.customers?.nodes ?? [])
    .map(mapCustomer)
    .filter((c) => c.numberOfOrders >= HIGH_VOLUME_ORDER_THRESHOLD)
}

export function shopifyErrorMessage(err: unknown): string {
  const message = err instanceof Error ? err.message : String(err)
  if (/access denied|not authorized|ACCESS_DENIED/i.test(message)) {
    return 'Shopify app is missing read_customers / read_orders scopes. Add them in the Dev Dashboard and retry.'
  }
  return message
}
