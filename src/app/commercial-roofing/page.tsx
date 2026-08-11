import { HubPage, type HubPageConfig } from '@/components/applications/HubPage'
import { youtubeThumbnailUrl } from '@/lib/youtube'

const config: HubPageConfig = {
  family: 'commercial',
  h1: 'Commercial Roofing',
  tagline: 'Break the repair-repair-replace cycle.',
  installsLine: 'Trusted on thousands of roofs nationwide',
  pitch: [
    'Crazy Seal is a seamless, fiber-infused silicone system your own crew — or any local contractor — can install over an existing commercial roof, in stages, as budget allows. Every repair chemically bonds to the last until the whole roof is one permanent membrane.',
    "While we have pre-built kits as examples, 99% of commercial kits are custom built by a professional or a specialist on our team. Tell us about your roof and we'll spec it with you — or run your square footage through the Kit Builder for a quick price estimate.",
  ],
  priceNote:
    'Most commercial projects are custom quoted — staged installs let you spread the cost across budget years.',
  primaryCta: { label: 'Contact Us', href: '/contact' },
  secondaryCta: { label: 'Get a Quick Price Estimate', href: '/kit-builder' },
  video: {
    type: 'youtube',
    id: 'XZrXvweEo-U',
    thumbnail: youtubeThumbnailUrl('XZrXvweEo-U'),
    caption: 'Watch the Facilities Overview',
  },
  stagedAssurance: true,
  kitsHeading: 'Example Pre-Built Commercial Kits',
  kitsNote:
    "These pre-built sizes show what a commercial system costs. 99% of commercial kits are custom built by a professional or a specialist on our team — contact us and we'll spec yours.",
  projectsHeading: 'Real Flat Roofs, Documented Start to Finish',
  sourcePage: 'commercial-roofing',
  leadHeading: 'Talk to a Specialist About Your Facility',
  leadSubheading:
    "Tell us about your roof — square footage, current problems, budget cycle — and we'll spec a custom kit and a staged plan with you.",
}

export default function CommercialRoofingPage() {
  return <HubPage config={config} />
}
