import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { ChevronRight, Truck, ShieldCheck, Phone } from 'lucide-react'
import { Container } from '@/lib/design-system'
import { getStoreProducts, getStoreProduct, formatPrice } from '@/lib/store/products'
import { STORE_CATEGORIES } from '@/lib/store/config'
import { ProductDetail } from '@/components/store/ProductDetail'

export const revalidate = 300

interface PageProps {
  params: Promise<{ handle: string }>
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { handle } = await params
  const product = await getStoreProduct(handle)
  if (!product) return { title: 'Product Not Found' }
  return {
    title: `${product.displayTitle} | Store`,
    description: product.blurb,
    openGraph: product.featuredImage ? { images: [product.featuredImage] } : undefined,
  }
}

export default async function ProductPage({ params }: PageProps) {
  const { handle } = await params
  const product = await getStoreProduct(handle)
  if (!product) notFound()

  const category = STORE_CATEGORIES.find((c) => c.id === product.category)
  const allProducts = await getStoreProducts()
  const related = allProducts
    .filter((p) => p.category === product.category && p.handle !== product.handle)
    .slice(0, 4)

  return (
    <Container size="xl" className="py-8 sm:py-10">
      {/* Breadcrumb */}
      <nav className="flex items-center gap-1.5 text-sm text-gray-500 mb-6 flex-wrap">
        <Link href="/store" className="hover:text-[#003365] font-medium">
          Store
        </Link>
        {category && (
          <>
            <ChevronRight className="w-4 h-4" />
            <Link href={`/store#${category.id}`} className="hover:text-[#003365] font-medium">
              {category.label}
            </Link>
          </>
        )}
        <ChevronRight className="w-4 h-4" />
        <span className="text-gray-900 font-medium">{product.displayTitle}</span>
      </nav>

      <ProductDetail product={product}>
        {/* Trust strip */}
        <div className="mt-8 grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div className="flex items-center gap-2.5 rounded-xl border border-gray-200 bg-white px-4 py-3">
            <Truck className="w-5 h-5 text-[#5BA411] flex-shrink-0" />
            <p className="text-xs text-gray-600">
              <span className="font-semibold text-gray-900">Free shipping</span> on orders over
              $500
            </p>
          </div>
          <div className="flex items-center gap-2.5 rounded-xl border border-gray-200 bg-white px-4 py-3">
            <ShieldCheck className="w-5 h-5 text-[#5BA411] flex-shrink-0" />
            <p className="text-xs text-gray-600">
              <span className="font-semibold text-gray-900">50 year warranty</span> when registered
            </p>
          </div>
        </div>

        {/* Description */}
        {product.descriptionHtml && (
          <div
            className="prose prose-sm max-w-none mt-8 text-gray-600 [&_h1]:text-lg [&_h2]:text-lg [&_h3]:text-base [&_strong]:text-gray-900"
            dangerouslySetInnerHTML={{ __html: product.descriptionHtml }}
          />
        )}

        {/* Help */}
        <div className="mt-8 flex items-center gap-3 rounded-xl bg-blue-50 border border-blue-100 px-4 py-3.5">
          <Phone className="w-5 h-5 text-[#003365] flex-shrink-0" />
          <p className="text-sm text-gray-700">
            Questions about sizing or installation?{' '}
            <a href="tel:8009630131" className="font-semibold text-[#003365] hover:underline">
              Call (800) 963-0131
            </a>{' '}
            — we&apos;ll make sure you get exactly what your roof needs.
          </p>
        </div>
      </ProductDetail>

      {/* Related products */}
      {related.length > 0 && (
        <section className="mt-16">
          <h2 className="text-2xl font-bold text-[#003365] tracking-tight mb-6">
            You Might Also Need
          </h2>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-5">
            {related.map((p) => (
              <Link
                key={p.handle}
                href={`/store/${p.handle}`}
                className="group rounded-2xl border border-gray-200 bg-white overflow-hidden hover:shadow-lg hover:-translate-y-1 transition-all duration-300"
              >
                <div className="aspect-square bg-gray-50">
                  {p.featuredImage && (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={p.featuredImage}
                      alt={p.displayTitle}
                      className="w-full h-full object-contain p-5 group-hover:scale-105 transition-transform duration-300"
                      loading="lazy"
                    />
                  )}
                </div>
                <div className="p-4">
                  <h3 className="text-sm font-bold text-gray-900 group-hover:text-[#003365] line-clamp-2">
                    {p.displayTitle}
                  </h3>
                  <p className="mt-1 text-sm font-bold text-[#003365]">
                    {p.priceMin === p.priceMax
                      ? formatPrice(p.priceMin)
                      : `From ${formatPrice(p.priceMin)}`}
                  </p>
                </div>
              </Link>
            ))}
          </div>
        </section>
      )}
    </Container>
  )
}
