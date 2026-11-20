/**
 * Free shipping on orders over this amount (continental USA; see /shipping/).
 * Every page and the cart read it from here. What checkout actually charges
 * comes from Shopify's shipping rates, so change those to match whenever this
 * changes.
 */
export const FREE_SHIPPING_OVER = 700

/** The amount as copy: "$700". */
export const FREE_SHIPPING_OVER_TEXT = `$${FREE_SHIPPING_OVER.toLocaleString('en-US')}`
