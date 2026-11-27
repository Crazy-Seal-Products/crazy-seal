/**
 * The store-or-quote switch. While pricing_settings.public_builder_live is
 * off the site sells through the store (Kit Builder, /store/<handle>, cart);
 * once staff turn it on, every store entry point sends people to the public
 * quote builder instead. Pure helpers, safe on the server and the client;
 * the flag itself comes from isPublicBuilderLive() (src/lib/pricing/builder-live.ts)
 * on the server and useBuilderLive() (src/components/layout/StoreMode.tsx) in
 * client components.
 */

export const QUOTE_HREF = '/quote/'

/** The store's paths: the Kit Builder (main shop), Build Your Own Kit, /store and its product pages, /shop. */
const STORE_PATHS = ['/kit-builder', '/build-your-own-kit', '/store', '/shop']

/** True for a site-relative link into the store, with or without a trailing slash, query or hash. */
export function isStoreHref(href: string): boolean {
  if (!href.startsWith('/')) return false
  const path = href.split(/[?#]/)[0].replace(/\/+$/, '') || '/'
  return STORE_PATHS.some((p) => path === p || path.startsWith(`${p}/`))
}

/** A store link as is, or the quote builder once it's live. Other links pass through. */
export function storeOrQuoteHref(href: string, builderLive: boolean): string {
  return builderLive && isStoreHref(href) ? QUOTE_HREF : href
}
