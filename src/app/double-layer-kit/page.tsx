import type { Metadata } from 'next'
import { Award, Layers, Palette, Ruler, ThumbsUp } from 'lucide-react'
import { Container, SectionHeading } from '@/lib/design-system'
import {
  BeforeAfterGrid,
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

const SHOP_KIT = '/store/double-layer-kit'

export const metadata: Metadata = {
  title: 'Double Layer Kit',
  description:
    'Our most popular kit! The Double Layer Kit gives you everything you need to apply two layers of the entire Crazy Seal system for around 40 mils of seamless membrane protection. In-stock and ready to ship with free shipping on orders over $500.',
}

const KIT_SIZES = [
  {
    label: '0-100 SQ FT',
    image: `${MEDIA}/2019/10/06_Double-0-100-White-1024x351.png`,
    contents: [
      '(1) Gallon of Crazy Clean',
      '(1) Tube of Crazy Caulk',
      '(1) Gallon of Crazy Patch',
      '(2) Gallons of Crazy Seal',
    ],
  },
  {
    label: '100-200 SQ FT',
    image: `${MEDIA}/2019/10/07_Double-100-200-White-1024x304.png`,
    contents: [
      '(1) Gallon of Crazy Clean',
      '(1) Tube of Crazy Caulk',
      '(1) Gallon of Crazy Patch',
      '(4) Gallons of Crazy Seal',
    ],
  },
  {
    label: '200-300 SQ FT',
    image: `${MEDIA}/2019/10/08_Double-200-300-White-1024x336.png`,
    contents: [
      '(1) Gallon of Crazy Clean',
      '(1) Tube of Crazy Caulk',
      '(1) Gallon of Crazy Patch',
      '(6) Gallons of Crazy Seal',
    ],
  },
  {
    label: '300-400 SQ FT',
    image: `${MEDIA}/2020/03/400-White-Tiny-1024x484.png`,
    contents: [
      '(1) Gallon of Crazy Clean',
      '(2) Tubes of Crazy Caulk',
      '(1) Gallon of Crazy Patch',
      '(8) Gallons of Crazy Seal',
    ],
  },
  {
    label: '400-500 SQ FT',
    image: `${MEDIA}/2019/10/09_Double-300-500-White-1024x485.png`,
    contents: [
      '(1) Gallon of Crazy Clean',
      '(1) Tube of Crazy Caulk',
      '(1) Gallon of Crazy Patch',
      '(10) Gallons of Crazy Seal',
    ],
  },
]

const INSTALLATION_EXAMPLES = [
  {
    label: 'Monaco RV Roof',
    before: `${MEDIA}/2019/05/Monaco-Vertical-Before-2-Crazy-Seal.jpg`,
    after: `${MEDIA}/2019/05/Monaco-Vertical-After-2-Crazy-Seal.jpg`,
    aspect: '1/1',
  },
  {
    label: 'Monaco RV Roof',
    before: `${MEDIA}/2019/05/Monaco-Vertical-Before-1-Crazy-Seal.jpg`,
    after: `${MEDIA}/2019/05/Monaco-Vertical-After-1-Crazy-Seal.jpg`,
    aspect: '1/1',
  },
  {
    label: 'Aruba RV Roof',
    before: `${MEDIA}/2019/05/Aruba-Vertical-Before-1-Crazy-Seal.jpg`,
    after: `${MEDIA}/2019/05/Aruba-Vertical-After-1-Crazy-Seal.jpg`,
    aspect: '1/1',
  },
  {
    label: 'Aruba RV Roof',
    before: `${MEDIA}/2019/05/Aruba-Vertical-Before-2-Crazy-Seal.jpg`,
    after: `${MEDIA}/2019/05/Aruba-Vertical-After-2-Crazy-Seal.jpg`,
    aspect: '1/1',
  },
]

const OTHER_KITS = [
  {
    title: 'Direct To Deck Kit',
    desc: 'A special kit for sealing directly over wood decking.',
    href: '/direct-to-deck-kit',
    image: `${MEDIA}/2021/12/Direct-to-Deck-Layer-Kit-Featured-Image-768x384.png`,
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

export default function DoubleLayerKitPage() {
  return (
    <>
      {/* ─── HERO ─── */}
      <Container size="xl">
        <ShopHero
          eyebrow="Most Popular Kit"
          eyebrowIcon={Award}
          title={
            <>
              Double Layer <span className="text-shimmer-highlight">Kit</span>
            </>
          }
          lead={
            <p>
              Everything you need to apply two layers of the entire Crazy Seal system — enough Crazy Caulk
              and Crazy Patch to seal your penetrations, plus enough Crazy Seal for two layers of the Crazy
              Seal Roof Membrane.
            </p>
          }
          shopHref={SHOP_KIT}
          shopLabel="Shop This Kit"
          media={
            <VideoPlayer
              youtubeId="DUt04pcOCYw"
              title="Double Layer Kit product video"
              caption="Click to Watch Product Video (1:23)"
            />
          }
          badge={{ icon: Layers, label: '~40 mils of membrane' }}
          chips={[
            { icon: Layers, label: 'Two full layers' },
            { icon: Ruler, label: 'Kits up to 500 SQ FT' },
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
          <KitSizeGrid sizes={KIT_SIZES} altPrefix="Double Layer Kit " />
          <BiggerRoofBanner className="mt-6 md:mt-8" />
        </div>
      </Container>

      {/* ─── ABOUT THIS KIT ─── */}
      <Container size="xl" className="sm:pt-4 md:pt-8">
        <KitAbout
          heading="Double Layer Kit (Most Popular)"
          lead={
            <p>
              Our &ldquo;Double Layer Kit&rdquo; gives you everything you need to apply two layers of the
              entire Crazy Seal system.
            </p>
          }
          checklist={[
            'Enough Crazy Caulk and Crazy Patch to seal your penetrations',
            'Enough Crazy Seal to apply two layers of the Crazy Seal Roof Membrane',
            'Kits are calculated by square footage at 100 SQ FT of coverage to the gallon',
            'About 20 mils of thickness per layer — around 40 mils total, thicker where caulk and mastic seal the seams and penetrations',
          ]}
          shopHref={SHOP_KIT}
          shopLabel="Shop the Double Layer Kit"
          aside={
            <>
              <div className="grid grid-cols-3 gap-3">
                <StatTile value={100} label="SQ FT / gallon" />
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
                note="Thicker in areas where Crazy Caulk and Crazy Patch are applied."
              />
              <Callout icon={ThumbsUp} title="Why we recommend two layers">
                We recommend our &ldquo;Double Layer System&rdquo; in most instances because most of us
                aren&apos;t perfect installers. The second layer of Crazy Seal ensures proper coverage and
                increases your total millage from 20 to 40 mils.
              </Callout>
            </>
          }
        />
      </Container>

      {/* ─── INSTALLATION EXAMPLES ─── */}
      <Container size="xl" className="sm:pt-4 md:pt-8">
        <div className={SECTION_WHITE}>
          <SectionHeading
            eyebrow="Before & After"
            heading="Double Layer Kit Installation Examples"
            subheading="Slide the center bar back and forth to see the transformations!"
          />
          <BeforeAfterGrid items={INSTALLATION_EXAMPLES} cols={4} />
        </div>
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
