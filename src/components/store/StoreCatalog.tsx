import { Container } from '@/lib/design-system'
import type { StoreProduct } from '@/lib/store/products'
import { SHOP_CATEGORIES, STORE_CATEGORIES } from '@/lib/store/config'
import { ProductCard } from '@/components/store/ProductCard'

/**
 * The shop's product list: RV Roofing Kits and Individual Products only (the
 * flat-roof and commercial kits are built through the Kit Builder now). Kept
 * compact so both sections fit in a scroll or two.
 */
export function StoreCatalog({ products }: { products: StoreProduct[] }) {
  const sections = SHOP_CATEGORIES.map((id) => ({
    ...STORE_CATEGORIES.find((c) => c.id === id)!,
    products: products.filter((p) => p.category === id),
  })).filter((s) => s.products.length > 0)

  return (
    <Container size="xl" className="space-y-8 py-6 md:space-y-10 md:py-8">
      {sections.map((section) => (
        <section key={section.id} id={section.id} className="scroll-mt-24">
          <div className="mb-3 flex flex-wrap items-end justify-between gap-x-4 gap-y-1">
            <div>
              <h2 className="text-xl font-extrabold tracking-tight text-primary sm:text-2xl">{section.label}</h2>
              <p className="text-sm text-gray-500">{section.blurb}</p>
            </div>
            {sections.length > 1 && (
              <nav aria-label="Shop sections" className="flex gap-1.5">
                {sections
                  .filter((s) => s.id !== section.id)
                  .map((s) => (
                    <a
                      key={s.id}
                      href={`#${s.id}`}
                      className="rounded-full bg-white px-3 py-1 text-xs font-semibold text-primary ring-1 ring-primary/10 transition hover:ring-accent/50"
                    >
                      {s.label} ↓
                    </a>
                  ))}
              </nav>
            )}
          </div>
          <div
            className={
              section.id === 'products'
                ? 'grid grid-cols-2 gap-2.5 sm:gap-3 md:grid-cols-3 lg:grid-cols-4'
                : 'grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3'
            }
          >
            {section.products.map((product) => (
              <ProductCard key={product.handle} product={product} compact />
            ))}
          </div>
        </section>
      ))}
    </Container>
  )
}
