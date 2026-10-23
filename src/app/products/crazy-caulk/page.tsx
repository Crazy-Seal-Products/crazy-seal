import type { Metadata } from 'next'
import { Layers, Package, Palette, Ruler } from 'lucide-react'
import { Container } from '@/lib/design-system'
import {
  ContactCta,
  MEDIA,
  OrderPerks,
  ProductDetail,
  ShopHero,
  SystemTrail,
} from '@/components/system-pages/blocks'
import { VideoPlayer } from '../../build-your-own-kit/VideoPlayer'

const SHOP_URL = '/store/crazy-caulk'

export const metadata: Metadata = {
  title: 'Crazy Caulk',
  description:
    'Crazy Caulk is a fiber-infused silicone, moisture-curing sealant with excellent adhesion to most surfaces. Available in White, Gray, or Tan in 11 ounce tubes or 1 gallon pails. Covers approximately 40 ft per tube.',
}

export default function CrazyCaulkPage() {
  return (
    <>
      {/* ─── HERO ─── */}
      <Container size="xl">
        <ShopHero
          eyebrow="Crazy Seal Products"
          title="Crazy Caulk"
          lead={
            <p>
              A fiber-infused silicone, moisture-curing sealant with excellent adhesion to most surfaces.
              A component of the Crazy Seal monolithic system.
            </p>
          }
          shopHref={SHOP_URL}
          shopLabel="Shop Crazy Caulk"
          media={
            <VideoPlayer
              youtubeId="pk-958WYDA8"
              title="Crazy Caulk product video"
              caption="Click to Watch Product Video (0:49)"
            />
          }
          packshot={{ src: `${MEDIA}/2019/04/Crazy-Caulk-1-Tube.png`, alt: '' }}
          badge={{ icon: Layers, label: 'Fiber-infused silicone' }}
          chips={[
            { icon: Ruler, label: '~40 ft per tube' },
            { icon: Package, label: '11 oz tube or 1 gallon' },
            { icon: Palette, label: 'White, Gray or Tan' },
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
          name="Crazy Caulk"
          image={`${MEDIA}/2019/04/Crazy-Caulk-1-Tube.png`}
          imageAlt="Crazy Caulk 11 ounce tube"
          intro={
            <p>
              Generally used to seal seams — like the seams along the sides of an RV, or where components
              such as gutter systems attach to the roof. Crazy Caulk is a component of the Crazy
              Seal&trade; monolithic system.
            </p>
          }
          stats={[
            { value: 40, prefix: '~', suffix: ' ft', label: 'Per tube, on average' },
            { value: 8, prefix: '≈', suffix: ' tubes', label: 'In one gallon' },
          ]}
          specs={[
            {
              label: 'Coverage Rates',
              value:
                'Depends on the size of the bead you run. On average, you can expect approximately 40 ft per tube.',
            },
            { label: 'Gallon Form', value: 'A gallon is the equivalent of about 8 tubes of caulk.' },
            { label: 'Colors', value: 'Available in White, Gray, or Tan' },
            { label: 'Net Contents (2 Size Options)', value: '11 Ounce Tube or 1 US GAL / 3.8 L' },
          ]}
          shopHref={SHOP_URL}
          shopLabel="Shop Crazy Caulk"
          after={<SystemTrail current="Crazy Caulk" />}
        />
      </Container>

      {/* ─── CTA ─── */}
      <Container size="xl" className="sm:pt-4 md:pt-8">
        <ContactCta />
      </Container>
    </>
  )
}
