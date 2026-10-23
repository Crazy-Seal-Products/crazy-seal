import type { Metadata } from 'next'
import { Layers, Palette, ShieldCheck, Wrench } from 'lucide-react'
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

const SHOP_URL = '/store/crazy-patch'

export const metadata: Metadata = {
  title: 'Crazy Patch',
  description:
    'Crazy Patch is a fiber-infused silicone, moisture-curing mastic with excellent adhesion to most surfaces. Used to seal existing penetrations or alone as a single component repair product to patch leaks. Available in White, Gray, or Tan.',
}

export default function CrazyPatchPage() {
  return (
    <>
      {/* ─── HERO ─── */}
      <Container size="xl">
        <ShopHero
          eyebrow="Crazy Seal Products"
          title="Crazy Patch"
          lead={
            <p>
              A fiber-infused silicone, moisture-curing mastic with excellent adhesion to most surfaces.
              Seal penetrations or patch leaks as a single component repair product.
            </p>
          }
          shopHref={SHOP_URL}
          shopLabel="Shop Crazy Patch"
          media={
            <VideoPlayer
              youtubeId="DW4FxoRinWg"
              title="Crazy Patch product video"
              caption="Click to Watch Product Video (0:35)"
            />
          }
          packshot={{ src: `${MEDIA}/2019/05/Crazy-Patch.png`, alt: '', className: 'h-32' }}
          badge={{ icon: Layers, label: 'Fiber-infused silicone' }}
          chips={[
            { icon: ShieldCheck, label: 'Seals penetrations' },
            { icon: Wrench, label: 'Patches leaks' },
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
          name="Crazy Patch"
          image={`${MEDIA}/2019/05/Crazy-Patch.png`}
          imageAlt="Crazy Patch 1 gallon pail"
          intro={
            <p>
              Generally used to seal all existing penetrations: wherever sealant was previously applied to
              cover penetrations, Crazy Patch ensures they are sealed. It can also be used alone as a
              single component repair product to patch leaks. A component of the Crazy Seal&trade;
              monolithic silicone system.
            </p>
          }
          stats={[
            { value: 75, prefix: '~', suffix: ' ft', label: 'Linear ft / gal, 3″ brush' },
            { value: 3, label: 'Color options' },
          ]}
          specs={[
            { label: 'Net Contents', value: '1 US GAL / 3.8 L' },
            {
              label: 'Coverage',
              value:
                'You can expect to cover about 75 linear ft with a 3″ brush. Actual cover rates vary depending on application thickness.',
            },
            { label: 'Colors', value: 'Available in White, Gray, or Tan' },
          ]}
          shopHref={SHOP_URL}
          shopLabel="Shop Crazy Patch"
          after={<SystemTrail current="Crazy Patch" />}
        />
      </Container>

      {/* ─── CTA ─── */}
      <Container size="xl" className="sm:pt-4 md:pt-8">
        <ContactCta />
      </Container>
    </>
  )
}
