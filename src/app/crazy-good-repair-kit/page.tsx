import type { Metadata } from 'next'
import { Blend, Package, Palette, PiggyBank, Ruler, Wrench } from 'lucide-react'
import { Container, SectionHeading } from '@/lib/design-system'
import {
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
import { VideoPlayer } from '../build-your-own-kit/VideoPlayer'

const SHOP_KIT = '/store/crazy-good-repair-kit'

export const metadata: Metadata = {
  title: 'Crazy Good Repair Kit',
  description:
    'The Crazy Good Repair Kit gives you everything you need to repair a small area of your roof or add a new roof component to an existing Crazy Seal System. Best for small repair applications under 25 SQ FT. In-stock and ready to ship.',
}

const KIT_OPTIONS = [
  {
    label: 'Repair Kit (No Crazy Tape)',
    image: `${MEDIA}/2020/05/Repair-Kit-1024x683.png`,
    contents: [
      '(1) Tube of Crazy Caulk',
      '(1) Quart of Crazy Patch',
      '(1) Quart of Crazy Seal',
    ],
  },
  {
    label: 'Repair Kit (With Crazy Tape)',
    image: `${MEDIA}/2020/05/Repair-Kit-White-With-Tape-1024x512.png`,
    contents: [
      '(1) 25 FT Roll of Crazy Tape',
      '(1) Tube of Crazy Caulk',
      '(1) Quart of Crazy Patch',
      '(1) Quart of Crazy Seal',
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
]

export default function CrazyGoodRepairKitPage() {
  return (
    <>
      {/* ─── HERO ─── */}
      <Container size="xl">
        <ShopHero
          eyebrow="Crazy Seal Roofing Kits"
          title={
            <>
              Crazy Good <span className="text-shimmer-highlight">Repair Kit</span>
            </>
          }
          lead={
            <p>
              Everything you need to repair a small area of your roof or add a new roof component to an
              existing Crazy Seal System. Quart sized pails, best for small repairs under 25 SQ FT.
            </p>
          }
          shopHref={SHOP_KIT}
          shopLabel="Shop This Kit"
          media={
            <VideoPlayer
              youtubeId="lRWZTz5utbU"
              title="Crazy Good Repair Kit product video"
              caption="Click to Watch Product Video (0:37)"
            />
          }
          badge={{ icon: Wrench, label: 'Small repairs & add-ons' }}
          chips={[
            { icon: Ruler, label: 'Under 25 SQ FT' },
            { icon: Package, label: 'With or without Crazy Tape' },
            { icon: Palette, label: 'White, Gray or Tan' },
          ]}
        />
      </Container>

      {/* ─── ORDER PERKS ─── */}
      <Container size="xl" className="sm:pt-4 md:pt-6">
        <OrderPerks freeShippingOver="$700" />
      </Container>

      {/* ─── KIT DETAILS ─── */}
      <Container size="xl" className="sm:pt-4 md:pt-8">
        <div className={SECTION_WHITE}>
          <SectionHeading
            eyebrow="Two Options"
            heading="Kit Details"
            subheading="Choose the repair kit that fits your project, with or without Crazy Tape. Comes in White, Gray, or Tan — all of the products in the kit will be the color that you choose."
          />
          <KitSizeGrid sizes={KIT_OPTIONS} className="max-w-5xl mx-auto" />
        </div>
      </Container>

      {/* ─── ABOUT THIS KIT ─── */}
      <Container size="xl" className="sm:pt-4 md:pt-8">
        <KitAbout
          heading="Crazy Good Repair Kit"
          lead={
            <p>
              Our &ldquo;Crazy Good Repair Kit&rdquo; gives you everything you need to repair a small area
              of your roof or add a new roof component to an existing Crazy Seal System.
            </p>
          }
          checklist={[
            'Enough Crazy Caulk and Crazy Patch to seal your penetrations',
            'Enough Crazy Seal to apply a small layer of the Crazy Seal Roof Membrane',
            'Quart sized pails of Crazy Patch and Crazy Seal — best for small repair applications under 25 SQ FT',
          ]}
          shopHref={SHOP_KIT}
          shopLabel="Shop the Crazy Good Repair Kit"
          aside={
            <>
              <div className="grid grid-cols-2 gap-3">
                <StatTile value={25} prefix="<" label="SQ FT repairs" />
                <StatTile value={2} label="Kit options" />
              </div>
              <Callout icon={Blend} title="Already have a Crazy Seal roof?">
                If you already have a full Crazy Seal kit installed, this is a perfect add-on to blend a new
                roof component into your existing system!
              </Callout>
              <Callout icon={PiggyBank} title="Saving money? Read this first." tone="navy">
                We understand people are trying to save money where they can, and a repair kit can help you
                do that. However, we recommend our{' '}
                <a
                  href="/ordering"
                  className="font-semibold text-accent-dark underline decoration-accent/40 underline-offset-4 hover:text-primary"
                >
                  Full Roofing Kits
                </a>{' '}
                in most instances. A full roof membrane layer will be best in the long term to ensure your
                roof is fully protected over time.
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
