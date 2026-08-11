import { HubPage, type HubPageConfig } from '@/components/applications/HubPage'
import { youtubeThumbnailUrl } from '@/lib/youtube'

const config: HubPageConfig = {
  family: 'rv',
  h1: 'RV Roofing',
  tagline: 'The last roof your RV will ever need.',
  installsLine: 'Thousands of successful RV installations',
  pitch: [
    'Crazy Seal is a seamless, fiber-infused silicone membrane you roll over your entire RV roof — every seam, vent, and skylight sealed under one continuous layer. No more seasonal re-caulking, no more watching the ceiling for stains.',
    'Kits are sized to your rig and ship free to your door with everything down to the brushes. Most owners install in a weekend.',
  ],
  priceNote:
    'Most RV roofs run $750-$1,700 all-in — a fraction of a $10,000+ roof replacement.',
  primaryCta: { label: 'Get a Quick Price Estimate', href: '/kit-builder' },
  secondaryCta: { label: 'Contact Us', href: '/contact' },
  video: {
    type: 'youtube',
    id: 'lrfVHAG86UE',
    thumbnail: youtubeThumbnailUrl('lrfVHAG86UE', 'hqdefault'),
    caption: 'Watch the RV System Overview (5:23)',
  },
  kitsHeading: 'Pick a Pre-Built RV Kit',
  kitsNote:
    "Most RVs fit a standard kit — pick your roof size and color, and the whole system ships to your door. Not sure which one? The Kit Builder sizes it from your rig's length.",
  projectsHeading: 'Real RV Roofs, Documented Start to Finish',
  sourcePage: 'rv-roofs',
  leadHeading: 'Talk to a Specialist About Your RV Roof',
  leadSubheading:
    "Tell us about your rig and we'll build the perfect kit with you — no pressure, no obligation. Prefer a pro install? We'll point you to our Pro Network.",
}

export default function RvRoofsPage() {
  return <HubPage config={config} />
}
