import { HubPage, type HubPageConfig } from '@/components/applications/HubPage'
import { youtubeThumbnailUrl } from '@/lib/youtube'

const config: HubPageConfig = {
  family: 'residential',
  h1: 'Residential Flat Roofing',
  tagline: 'Fix your flat roof once. Yourself.',
  installsLine: 'Thousands of successful installations',
  pitch: [
    "Crazy Seal is a seamless, fiber-infused silicone membrane for the flat and low-slope roofs regular roofers won't touch — sunrooms, porches, additions, mobile homes. One continuous layer over the whole roof, no tear-off, no seams for standing water to find.",
    'Kits are sized by square footage and ship free to your door with every product, tool, and instruction you need.',
  ],
  priceNote:
    'Typical sunroom and porch roofs run $750-$2,200 all-in, installed by you over a weekend.',
  primaryCta: { label: 'Get a Quick Price Estimate', href: '/kit-builder' },
  secondaryCta: { label: 'Contact Us', href: '/contact' },
  video: {
    type: 'youtube',
    id: 'ji0GvXRUams',
    thumbnail: youtubeThumbnailUrl('ji0GvXRUams'),
    caption: 'Watch the System Overview (5:15)',
  },
  kitsHeading: 'Pick a Pre-Built Roof Kit',
  kitsNote:
    'Going over an existing roof? Double Layer. Bare wood decking? Direct to Deck. Not sure? The Kit Builder sorts it out in three questions.',
  projectsHeading: 'Real Homes, Documented Start to Finish',
  sourcePage: 'residential',
  leadHeading: 'Talk to a Specialist About Your Roof',
  leadSubheading:
    "Tell us about your roof and we'll size the right kit with you — no pressure, no obligation.",
}

export default function ResidentialPage() {
  return <HubPage config={config} />
}
