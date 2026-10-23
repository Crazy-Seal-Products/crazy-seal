import type { Metadata } from 'next'
import { Droplets, Leaf, ShieldCheck, Sparkles } from 'lucide-react'
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

const SHOP_URL = '/store/crazy-clean'

export const metadata: Metadata = {
  title: 'Crazy Clean',
  description:
    'Crazy Clean is a highly effective concentrated cleaning solution specially formulated to remove surface contaminants such as oils, dirt and oxidation. Environmentally safe and non-toxic. Cleans up to 1,000 SQ FT per gallon.',
}

export default function CrazyCleanPage() {
  return (
    <>
      {/* ─── HERO ─── */}
      <Container size="xl">
        <ShopHero
          eyebrow="Crazy Seal Products"
          title="Crazy Clean"
          lead={
            <p>
              A highly effective concentrated cleaning solution specially formulated to remove surface
              contaminants such as oils, dirt and oxidation.
            </p>
          }
          shopHref={SHOP_URL}
          shopLabel="Shop Crazy Clean"
          media={
            <VideoPlayer
              youtubeId="mDrHEUH0K4I"
              title="Crazy Clean product video"
              caption="Click to Watch Product Video (0:26)"
            />
          }
          packshot={{ src: `${MEDIA}/2019/05/Crazy-Clean.png`, alt: '' }}
          badge={{ icon: Sparkles, label: 'Concentrated formula' }}
          chips={[
            { icon: Leaf, label: 'Environmentally safe' },
            { icon: ShieldCheck, label: 'Non-toxic' },
            { icon: Droplets, label: 'Up to 1,000 SQ FT / gallon' },
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
          name="Crazy Clean"
          image={`${MEDIA}/2019/05/Crazy-Clean.png`}
          imageAlt="Crazy Clean 1 gallon jug"
          intro={
            <p>
              A concentrated cleaner that removes oils, dirt and oxidation. Crazy Clean is environmentally
              safe, non-toxic and leaves no contaminating by-products or pollutants to damage the
              environment.
            </p>
          }
          stats={[
            { value: 1000, label: 'Up to SQ FT per gallon' },
            { display: '1 : 3', label: 'Crazy Clean to water' },
          ]}
          specs={[
            { label: 'Net Contents', value: '1 US GAL / 3.8L' },
            {
              label: 'Coverage Rates',
              value:
                'Because this is a concentrated solution, you can expect to clean up to 1,000 SQ FT with 1 gallon of Crazy Clean mixed with 3 gallons of water.',
            },
          ]}
          shopHref={SHOP_URL}
          shopLabel="Shop Crazy Clean"
          after={<SystemTrail current="Crazy Clean" />}
        />
      </Container>

      {/* ─── CTA ─── */}
      <Container size="xl" className="sm:pt-4 md:pt-8">
        <ContactCta />
      </Container>
    </>
  )
}
