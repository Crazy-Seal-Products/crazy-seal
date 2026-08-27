/**
 * Admin GraphQL selections for a local copy of Shopify customers and orders.
 * API version: 2026-07 (see src/lib/shopify/admin.ts).
 */

export const MAILING_ADDRESS_FIELDS = `
  address1
  address2
  city
  province
  provinceCode
  zip
  country
  countryCodeV2
  firstName
  lastName
  name
  company
  phone
`

export const MONEY_BAG = `
  shopMoney { amount currencyCode }
`

export const CUSTOMER_NODE_FIELDS = `
  id
  legacyResourceId
  displayName
  firstName
  lastName
  note
  tags
  state
  locale
  taxExempt
  taxExemptions
  verifiedEmail
  numberOfOrders
  createdAt
  updatedAt
  amountSpent { amount currencyCode }
  defaultEmailAddress {
    emailAddress
    marketingState
    marketingOptInLevel
    marketingUpdatedAt
    validFormat
  }
  defaultPhoneNumber {
    phoneNumber
    marketingState
  }
  defaultAddress { ${MAILING_ADDRESS_FIELDS} }
  addressesV2(first: 25) {
    nodes { ${MAILING_ADDRESS_FIELDS} }
  }
  lastOrder { id name createdAt }
`

export const LINE_ITEM_NODE_FIELDS = `
  id
  title
  name
  sku
  vendor
  variantTitle
  quantity
  currentQuantity
  unfulfilledQuantity
  requiresShipping
  taxable
  isGiftCard
  customAttributes { key value }
  originalUnitPriceSet { ${MONEY_BAG} }
  discountedUnitPriceSet { ${MONEY_BAG} }
  originalTotalSet { ${MONEY_BAG} }
  discountedTotalSet { ${MONEY_BAG} }
  variant { id sku title }
  product { id title handle }
`

export const ORDER_NODE_FIELDS = `
  id
  legacyResourceId
  name
  number
  confirmationNumber
  email
  phone
  note
  tags
  createdAt
  updatedAt
  processedAt
  cancelledAt
  cancelReason
  closedAt
  displayFinancialStatus
  displayFulfillmentStatus
  returnStatus
  currencyCode
  presentmentCurrencyCode
  sourceName
  poNumber
  test
  taxesIncluded
  taxExempt
  fullyPaid
  unpaid
  confirmed
  customerAcceptsMarketing
  customerLocale
  discountCode
  discountCodes
  paymentGatewayNames
  customAttributes { key value }
  subtotalPriceSet { ${MONEY_BAG} }
  totalPriceSet { ${MONEY_BAG} }
  totalTaxSet { ${MONEY_BAG} }
  totalDiscountsSet { ${MONEY_BAG} }
  totalShippingPriceSet { ${MONEY_BAG} }
  totalRefundedSet { ${MONEY_BAG} }
  totalOutstandingSet { ${MONEY_BAG} }
  currentTotalPriceSet { ${MONEY_BAG} }
  currentSubtotalPriceSet { ${MONEY_BAG} }
  currentTotalDiscountsSet { ${MONEY_BAG} }
  currentTotalTaxSet { ${MONEY_BAG} }
  shippingAddress { ${MAILING_ADDRESS_FIELDS} }
  billingAddress { ${MAILING_ADDRESS_FIELDS} }
  customer {
    id
    displayName
    defaultEmailAddress { emailAddress }
  }
  discountApplications(first: 20) {
    nodes {
      allocationMethod
      index
      targetSelection
      targetType
      value {
        ... on MoneyV2 { amount currencyCode }
        ... on PricingPercentageValue { percentage }
      }
      ... on DiscountCodeApplication { code }
      ... on AutomaticDiscountApplication { title }
      ... on ManualDiscountApplication { title }
      ... on ScriptDiscountApplication { title }
    }
  }
  shippingLines(first: 10) {
    nodes {
      id
      title
      code
      source
      originalPriceSet { ${MONEY_BAG} }
      discountedPriceSet { ${MONEY_BAG} }
    }
  }
  lineItems(first: 100) {
    nodes { ${LINE_ITEM_NODE_FIELDS} }
  }
  fulfillments(first: 20) {
    id
    status
    displayStatus
    createdAt
    updatedAt
    deliveredAt
    estimatedDeliveryAt
    trackingInfo { company number url }
  }
  refunds(first: 20) {
    id
    note
    createdAt
    totalRefundedSet { ${MONEY_BAG} }
  }
  transactions(first: 40) {
    id
    kind
    status
    gateway
    formattedGateway
    processedAt
    errorCode
    amountSet { ${MONEY_BAG} }
  }
  taxLines {
    title
    rate
    ratePercentage
    priceSet { ${MONEY_BAG} }
  }
`

export const CUSTOMERS_PAGE_QUERY = /* GraphQL */ `
  query ShopifyCustomersPage($cursor: String) {
    customers(first: 50, after: $cursor, sortKey: UPDATED_AT) {
      pageInfo { hasNextPage endCursor }
      nodes { ${CUSTOMER_NODE_FIELDS} }
    }
  }
`

export const ORDERS_PAGE_QUERY = /* GraphQL */ `
  query ShopifyOrdersPage($cursor: String) {
    orders(first: 25, after: $cursor, sortKey: UPDATED_AT) {
      pageInfo { hasNextPage endCursor }
      nodes { ${ORDER_NODE_FIELDS} }
    }
  }
`

export const CUSTOMER_BY_ID_QUERY = /* GraphQL */ `
  query ShopifyCustomerById($id: ID!) {
    customer(id: $id) { ${CUSTOMER_NODE_FIELDS} }
  }
`

export const ORDER_BY_ID_QUERY = /* GraphQL */ `
  query ShopifyOrderById($id: ID!) {
    order(id: $id) { ${ORDER_NODE_FIELDS} }
  }
`
