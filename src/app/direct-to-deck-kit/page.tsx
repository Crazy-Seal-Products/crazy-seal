import type { Metadata } from 'next'
import { Hammer, Layers, Package, Palette, TreePine } from 'lucide-react'
import { Container, SectionHeading } from '@/lib/design-system'
import {
  BiggerRoofBanner,
  Callout,
  ColorSwatches,
  ContactCta,
  KitAbout,
  KitSizeGrid,
  MEDIA,
  OrderPerks,
  OtherKits,
  SECTION_WHITE,
  ShopHero,
  StatTile,
  SwagPack,
} from '@/components/system-pages/blocks'
import { LayerMeter } from '@/components/system-pages/motion-blocks'
import { VideoPlayer } from '../build-your-own-kit/VideoPlayer'

const SHOP_KIT = '/store/direct-to-deck-kit'

export const metadata: Metadata = {
  title: 'Direct To Deck Kit',
  description:
    'The Direct to Deck Kit gives you everything you need to apply two layers of the entire Crazy Seal system directly to wood decking, including Crazy Tape to seal your wood seams and edges. In-stock and ready to ship with free shipping on orders over $500.',
}

const KIT_SIZES = [
  {
    label: '0-75 SQ FT',
    image: `${MEDIA}/2019/10/00_Direct-0-75-White.png`,
    contents: [
      '(2) Rolls of Crazy Tape',
      '(1) Tube of Crazy Caulk',
      '(1) Gallon of Crazy Patch',
      '(2) Gallons of Crazy Seal',
    ],
  },
  {
    label: '75-150 SQ FT',
    image: `${MEDIA}/2019/10/01_Direct-75-150-White-1024x473.png`,
    contents: [
      '(4) Rolls of Crazy Tape',
      '(3) Tubes of Crazy Caulk',
      '(1) Gallon of Crazy Patch',
      '(1) Gallon of Crazy Seal',
      '(1) 3 Gallon Bucket of Crazy Seal',
    ],
  },
  {
    label: '150-225 SQ FT',
    image: `${MEDIA}/2019/10/02_Direct-150-225-White-1024x416.png`,
    contents: [
      '(5) Rolls of Crazy Tape',
      '(4) Tubes of Crazy Caulk',
      '(1) Gallon of Crazy Patch',
      '(2) 3 Gallon Buckets of Crazy Seal',
    ],
  },
  {
    label: '225-300 SQ FT',
    image: `${MEDIA}/2019/10/03_Direct-225-300-White-1024x503.png`,
    contents: [
      '(7) Rolls of Crazy Tape',
      '(5) Tubes of Crazy Caulk',
      '(2) Gallon of Crazy Patch',
      '(1) 5 Gallon Bucket of Crazy Seal',
      '(1) 3 Gallon Bucket of Crazy Seal',
    ],
  },
  {
    label: '300-375 SQ FT',
    image: `${MEDIA}/2019/10/04_Direct-300-375-White-1024x498.png`,
    contents: [
      '(9) Rolls of Crazy Tape',
      '(6) Tubes of Crazy Caulk',
      '(2) Gallons of Crazy Patch',
      '(2) 5 Gallon Buckets of Crazy Seal',
    ],
  },
  {
    label: '375-450 SQ FT',
    image: `${MEDIA}/2019/10/05_Direct-375-450-White-1024x526.png`,
    contents: [
      '(10) Rolls of Crazy Tape',
      '(6) Tubes of Crazy Caulk',
      '(2) Gallons of Crazy Patch',
      '(1) 3 Gallon Bucket of Crazy Seal',
      '(2) 5 Gallon Buckets of Crazy Seal',
    ],
  },
]

const OTHER_KITS = [
  {
    title: 'Double Layer Kit',
    desc: 'Our most popular kit with double layer protection.',
    href: '/double-layer-kit',
    image: `${MEDIA}/2021/12/Double-Layer-Kit-Featured-Image-768x384.png`,
    tag: 'Most popular',
  },
  {
    title: 'Build Your Own Kit',
    desc: 'Build your own custom kit from our lineup of roofing products.',
    href: '/build-your-own-kit',
    image: `${MEDIA}/2021/12/Build-Your-Own-Kit-Featured-Image-768x384.png`,
  },
  {
    title: 'Crazy Good Repair Kit',
    desc: 'Kit for small repairs or adding a fixture to a Crazy Seal roof.',
    href: '/crazy-good-repair-kit',
    image: `${MEDIA}/2021/12/Repair-Kit-Featured-Image-768x384.png`,
  },
]

export default function DirectToDeckKitPage() {
  return (
    <>
      {/* ─── HERO ─── */}
      <Container size="xl">
        <ShopHero
          eyebrow="Crazy Seal Roofing Kits"
          title={
            <>
              Direct To Deck <span className="text-shimmer-highlight">Kit</span>
            </>
          }
          lead={
            <p>
              Everything you need to apply two layers of the entire Crazy Seal system directly to wood
              decking — including enough Crazy Tape to seal your wood seams and edges.
            </p>
          }
          shopHref={SHOP_KIT}
          shopLabel="Shop This Kit"
          media={
            <VideoPlayer
              youtubeId="ZNhBmVKJX7k"
              title="Direct To Deck Kit product video"
              caption="Click to Watch Product Video (1:51)"
            />
          }
          badge={{ icon: TreePine, label: 'Straight onto wood decking' }}
          chips={[
            { icon: Layers, label: 'Two full layers' },
            { icon: Package, label: 'Crazy Tape included' },
            { icon: Palette, label: 'White, Gray or Tan' },
          ]}
        />
      </Container>

      {/* ─── ORDER PERKS ─── */}
      <Container size="xl" className="sm:pt-4 md:pt-6">
        <OrderPerks freeShippingOver="$500" />
      </Container>

      {/* ─── KIT DETAILS BY SQUARE FOOTAGE (+ bigger roofs) ─── */}
      <Container size="xl" className="sm:pt-4 md:pt-8">
        <div className={SECTION_WHITE}>
          <SectionHeading
            eyebrow="Sized to Your Roof"
            heading="Kit Details By Square Footage"
            subheading="Every kit includes the full Crazy Seal system. Comes in White, Gray, or Tan — all of the products in the kit will be the color that you choose."
          />
          <KitSizeGrid sizes={KIT_SIZES} altPrefix="Direct To Deck Kit " />
          <BiggerRoofBanner className="mt-6 md:mt-8" />
        </div>
      </Container>

      {/* ─── ABOUT THIS KIT ─── */}
      <Container size="xl" className="sm:pt-4 md:pt-8">
        <KitAbout
          heading="Direct to Deck Kit"
          lead={
            <p>
              Our &ldquo;Direct To Deck Kit&rdquo; gives you everything you need to apply two layers of the
              entire Crazy Seal system directly to wood decking.
            </p>
          }
          checklist={[
            'Enough Crazy Caulk and Crazy Patch to seal your seams and penetrations',
            'Enough Crazy Tape to seal your wood seams and edges',
            'Enough Crazy Seal to apply two layers of the Crazy Seal Roof Membrane directly to a wood surface',
            'Calculated at 75 SQ FT of coverage to the gallon — wood has a tendency to soak up product more than a normal roofing application due to porosity',
          ]}
          shopHref={SHOP_KIT}
          shopLabel="Shop the Direct To Deck Kit"
          aside={
            <>
              <div className="grid grid-cols-3 gap-3">
                <StatTile value={75} label="SQ FT / gallon" />
                <StatTile value={20} label="Mils per layer" />
                <StatTile value={40} prefix="~" label="Mils total" />
              </div>
              <LayerMeter
                title="Membrane thickness"
                total="~40 mils"
                layers={[
                  { label: 'Layer 1', value: 20 },
                  { label: 'Layer 2', value: 20 },
                ]}
                note="Properly applied at 75 SQ FT per gallon. Thicker in areas where you put down caulk and mastic to seal the seams and penetrations."
              />
              <Callout icon={Hammer} title="Perfect for existing roof damage">
                Our Direct to Deck System is the perfect solution for those who have existing damage to
                their roof. You can also use it as a hybrid, going over a partly normal roof and a partly
                repaired roof with wood decking, to blend one final seamless look across the entire
                application.
              </Callout>
            </>
          }
        />
      </Container>

      {/* ─── SWAG PACK ─── */}
      <Container size="xl" className="sm:pt-4 md:pt-8">
        <SwagPack />
      </Container>

      {/* ─── COLORS ─── */}
      <Container size="xl" className="sm:pt-4 md:pt-8">
        <ColorSwatches />
      </Container>

      {/* ─── OTHER KIT OPTIONS ─── */}
      <Container size="xl" className="sm:pt-4 md:pt-8">
        <OtherKits kits={OTHER_KITS} />
      </Container>

      {/* ─── CTA ─── */}
      <Container size="xl" className="sm:pt-4 md:pt-8">
        <ContactCta />
      </Container>
    </>
  )
}
