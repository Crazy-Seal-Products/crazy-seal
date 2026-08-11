import { HubPage, type HubPageConfig } from '@/components/applications/HubPage'

const config: HubPageConfig = {
  family: 'transportation',
  h1: 'Transportation Roofing',
  tagline: 'Seal a unit in a day. Keep it on the road for good.',
  installsLine: 'Thousands of successful installations',
  pitch: [
    'Crazy Seal is a seamless, fiber-infused silicone membrane for tractor trailers, box trucks, and delivery vehicles — built for the constant flexing that vibrates ordinary sealant apart. One crew can seal a unit in a day, in your own yard.',
    "One kit typically covers a box truck or trailer roof. A fire department sealed a 24' rescue trailer for about $1,000 in product instead of spending $40,000 on a replacement. Sealing a fleet? Talk to us about volume.",
  ],
  priceNote:
    "A 24' trailer runs about $1,200 in product — versus writing off the unit over a roof.",
  primaryCta: { label: 'Get a Quick Price Estimate', href: '/kit-builder' },
  secondaryCta: { label: 'Contact Us', href: '/contact' },
  video: {
    type: 'vimeo',
    id: '717595036',
    thumbnail:
      'https://i.vimeocdn.com/video/1445939956-3a69ea8d25a2a5b445f99e98907391c10b1e5163a5f774010657c974fee12df2-d_640?region=us',
    caption: 'Watch the Transportation Overview (4:02)',
  },
  kitsHeading: 'Pick a Pre-Built Kit',
  kitsNote:
    'Vehicle roofs use the same flat-roof kits, sized by square footage. One kit typically covers a box truck or trailer roof — and one crew can seal a unit in a day.',
  projectsHeading: 'Real Vehicle Roofs, Documented Start to Finish',
  sourcePage: 'transportation',
  leadHeading: 'Talk to a Specialist About Your Vehicles',
  leadSubheading:
    "One unit or a whole fleet — tell us what you're running and we'll size the right kits with you.",
}

export default function TransportationPage() {
  return <HubPage config={config} />
}
