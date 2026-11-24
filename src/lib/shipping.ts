/**
 * Free shipping on orders over this amount (continental USA; see /shipping/).
 * Every page and the cart read it from here, and it is the quote builder's
 * default (pricing_settings.free_shipping_over). What checkout actually
 * charges comes from Shopify's shipping rates, so change those to match
 * whenever this changes ($750 from the 2027 price list).
 */
export const FREE_SHIPPING_OVER = 750

/** The amount as copy: "$750". */
export const FREE_SHIPPING_OVER_TEXT = `$${FREE_SHIPPING_OVER.toLocaleString('en-US')}`
