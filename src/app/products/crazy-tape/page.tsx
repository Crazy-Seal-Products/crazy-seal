import type { Metadata } from 'next'
import { Layers, MoveHorizontal, Palette, Ruler } from 'lucide-react'
import { Container } from '@/lib/design-system'
import {
  ContactCta,
  MEDIA,
  OrderPerks,
  ProductDetail,
  ShopHero,
} from '@/components/system-pages/blocks'
import { VideoPlayer } from '../../build-your-own-kit/VideoPlayer'

const SHOP_URL = '/store/crazy-tape'

export const metadata: Metadata = {
  title: 'Crazy Tape',
  description:
    'Crazy Tape is a special repair tape with a strong adhesive on one side and a fabric material on the other, designed to allow the Crazy Seal System to adhere to it. Sold in 25 foot rolls, 4 inches wide, in Charcoal Gray.',
}

export default function CrazyTapePage() {
  return (
    <>
      {/* ─── HERO ─── */}
      <Container size="xl">
        <ShopHero
          eyebrow="Crazy Seal Products"
          title="Crazy Tape"
          lead={
            <p>
              A special tape created for scenarios where repairs are required, with a strong adhesive on one
              side and a fabric material on the other.
            </p>
          }
          shopHref={SHOP_URL}
          shopLabel="Shop Crazy Tape"
          media={
            <VideoPlayer
              youtubeId="zvmb4TqDXtI"
              title="Crazy Tape product video"
              caption="Click to Watch Product Video (0:44)"
            />
          }
          packshot={{ src: `${MEDIA}/2021/12/Crazy-Tape-1395x1395-1-768x768.png`, alt: '', className: 'h-28' }}
          badge={{ icon: Layers, label: 'Adhesive + fabric' }}
          chips={[
            { icon: Ruler, label: '25 ft rolls' },
            { icon: MoveHorizontal, label: '4 inches wide' },
            { icon: Palette, label: 'Charcoal Gray' },
          ]}
        />
      </Container>

      {/* ─── ORDER PERKS ─── */}
      <Container size="xl" className="sm:pt-4 md:pt-6">
        <OrderPerks freeShippingOver="$700" />
      </Container>

      {/* ─── PRODUCT DETAILS ─── */}
      <Container size="xl" className="sm:pt-4 md:pt-8">
        <ProductDetail
          name="Crazy Tape"
          image={`${MEDIA}/2021/12/Crazy-Tape-1395x1395-1.png`}
          imageAlt="Crazy Tape 25 foot roll"
          intro={
            <>
              <p className="mb-4">
                The strong adhesive adds structural integrity to the seam, while the fabric on top is
                designed to allow the Crazy Seal System to adhere to it — opening up many different
                possibilities for repair on your roof.
              </p>
              <p>
                You will see Crazy Tape in our{' '}
                <a
                  href="/direct-to-deck-kit"
                  className="font-semibold text-accent-dark underline decoration-accent/40 underline-offset-4 hover:text-primary"
                >
                  Direct to Deck Kits
                </a>
                . Going directly to wood decking? Crazy Tape will help you permanently seal your seams.
              </p>
            </>
          }
          stats={[
            { value: 25, suffix: ' ft', label: 'Per roll' },
            { value: 4, suffix: '″', label: 'Wide' },
          ]}
          specs={[
            { label: 'Dimensions', value: '4″ x 25′' },
            { label: 'Color Options', value: 'Charcoal Gray' },
            { label: 'Net Contents', value: '25 Foot Rolls, 4 Inches Wide' },
          ]}
          shopHref={SHOP_URL}
          shopLabel="Shop Crazy Tape"
        />
      </Container>

      {/* ─── CTA ─── */}
      <Container size="xl" className="sm:pt-4 md:pt-8">
        <ContactCta />
      </Container>
    </>
  )
}
