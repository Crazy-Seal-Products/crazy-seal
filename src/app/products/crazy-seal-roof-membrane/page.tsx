import type { Metadata } from 'next'
import { Layers, Palette, Sun, Waves } from 'lucide-react'
import { Container, SectionHeading } from '@/lib/design-system'
import {
  ContactCta,
  LIGHT_CARD,
  MEDIA,
  OrderPerks,
  ProductDetail,
  SECTION_WHITE,
  ShopHero,
  SystemTrail,
} from '@/components/system-pages/blocks'
import { VideoPlayer } from '../../build-your-own-kit/VideoPlayer'

const SHOP_URL = '/store/crazy-seal'

export const metadata: Metadata = {
  title: 'Crazy Seal Roof Membrane',
  description:
    'Crazy Seal is a weatherproof, fiber-infused silicone, fluid-applied membrane that protects any weathered roof substrate against harsh UV rays, severe weather, mold and mildew. Available in White, Gray, or Tan in 1, 3, and 5 gallon sizes.',
}

const SIZES = [
  {
    label: '1 US GAL / 3.8 L',
    image: `${MEDIA}/2019/04/Crazy-Seal-1-Gal-White-1000x1395-768x1071.png`,
    height: 'h-36 sm:h-40',
  },
  {
    label: '3 US GAL / 11.4 L',
    image: `${MEDIA}/2019/04/Crazy-Seal-3-Gal-White-1000x1395-768x1071.png`,
    height: 'h-44 sm:h-48',
  },
  {
    label: '5 US GAL / 18.9 L',
    image: `${MEDIA}/2019/04/Crazy-Seal-5-Gal-White-1000x1395-768x1071.png`,
    height: 'h-52 sm:h-56',
  },
]

export default function CrazySealRoofMembranePage() {
  return (
    <>
      {/* ─── HERO ─── */}
      <Container size="xl">
        <ShopHero
          eyebrow="Crazy Seal Products"
          title="Crazy Seal"
          lead={
            <p>
              A weatherproof, fiber-infused silicone, fluid-applied membrane that protects any weathered
              roof substrate against harsh UV rays, severe weather, mold and mildew.
            </p>
          }
          shopHref={SHOP_URL}
          shopLabel="Shop Crazy Seal"
          media={
            <VideoPlayer
              youtubeId="7UdhprChv1Q"
              title="Crazy Seal product video"
              caption="Click to Watch Product Video (0:44)"
            />
          }
          packshot={{
            src: `${MEDIA}/2019/04/Crazy-Seal-5-Gal-White-1000x1395-768x1071.png`,
            alt: '',
            className: 'h-32',
          }}
          badge={{ icon: Layers, label: 'Fiber-infused silicone' }}
          chips={[
            { icon: Sun, label: 'Will not chalk or blister' },
            { icon: Waves, label: 'Permanently flexible' },
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
          name="Crazy Seal"
          image={`${MEDIA}/2019/04/Crazy-Seal-5-Gal-White-1000x1395-768x1071.png`}
          imageAlt="Crazy Seal 5 gallon bucket"
          intro={
            <p>
              Applying Crazy Seal to any weathered roof substrate helps protect it against degradation
              caused by harsh UV rays, severe weather, mold and mildew. It will not chalk or blister, and
              its fiber-infused silicone makeup remains permanently flexible yet strong. When properly
              applied, Crazy Seal&trade; provides a weatherproof monolithic silicone roof coating.
            </p>
          }
          stats={[
            { value: 100, label: 'SQ FT / gal on rubber' },
            { value: 75, label: 'SQ FT / gal on wood' },
            { value: 3, label: 'Size options' },
          ]}
          specs={[
            { label: 'Color Options', value: 'Available in White, Gray, or Tan' },
            {
              label: 'Coverage Rates',
              value:
                '100 SQ FT / Gallon on standard surface like rubber. 75 SQ FT / Gallon when applied directly to wood decking.',
            },
            {
              label: 'Net Contents (3 Size Options)',
              value: '5 US GAL / 18.9 L, 3 US GAL / 11.4 L, or 1 US GAL / 3.8 L',
            },
          ]}
          shopHref={SHOP_URL}
          shopLabel="Shop Crazy Seal"
          after={<SystemTrail current="Crazy Seal" />}
        />
      </Container>

      {/* ─── SIZES ─── */}
      <Container size="xl" className="sm:pt-4 md:pt-8">
        <div className={SECTION_WHITE}>
          <SectionHeading eyebrow="3 Size Options" heading="Pick Your Pail" />
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 lg:gap-6 max-w-4xl mx-auto items-end">
            {SIZES.map((size) => (
              <div key={size.label} className={`group text-center px-5 pt-8 pb-6 ${LIGHT_CARD}`}>
                <div className="relative grid place-items-end justify-center">
                  <div aria-hidden="true" className="absolute bottom-0 h-5 w-2/3 rounded-full bg-primary/15 blur-lg" />
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={size.image}
                    alt={`Crazy Seal ${size.label} bucket`}
                    className={`relative ${size.height} w-auto object-contain transition-transform duration-700 ease-out group-hover:-translate-y-2 group-hover:scale-105`}
                  />
                </div>
                <p className="mt-5 inline-flex rounded-full bg-primary/[0.06] px-4 py-1.5 text-sm font-extrabold text-primary ring-1 ring-primary/10">
                  {size.label}
                </p>
              </div>
            ))}
          </div>
        </div>
      </Container>

      {/* ─── CTA ─── */}
      <Container size="xl" className="sm:pt-4 md:pt-8">
        <ContactCta />
      </Container>
    </>
  )
}
