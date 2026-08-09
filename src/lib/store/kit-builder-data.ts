import { getStoreProducts } from './products'
import { KIT_BUILDER_HANDLES, type KitBuilderCatalog } from './kit-builder'

/**
 * Trimmed live-catalog payload for the Kit Builder client component: only the
 * handles the builder needs, with cart-ready variant GIDs and numeric prices.
 */
export async function getKitBuilderCatalog(): Promise<KitBuilderCatalog> {
  const products = await getStoreProducts()
  const catalog: KitBuilderCatalog = {}

  for (const handle of KIT_BUILDER_HANDLES) {
    const p = products.find((x) => x.handle === handle)
    if (!p) continue
    catalog[handle] = {
      handle: p.handle,
      title: p.displayTitle,
      featuredImage: p.featuredImage,
      options: p.options,
      variants: p.variants.map((v) => ({
        id: v.id,
        title: v.title,
        price: parseFloat(v.price),
        image: v.image ?? p.featuredImage,
        availableForSale: v.availableForSale,
        selectedOptions: v.selectedOptions,
        descriptionHtml: v.descriptionHtml,
      })),
    }
  }

  return catalog
}
