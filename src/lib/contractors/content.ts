import type { Segment } from './types'

/**
 * The copy every contractor page shares. It's Crazy Seal's own wording from
 * /rv-roofing and /commercial-roofing, so a contractor page never promises
 * more than the main site does. Only the contractor's name, contact details
 * and brand change from page to page.
 */

const MEDIA = 'https://media.crazyseal.com/site-assets/wp-media'

export interface Transformation {
  label: string
  before: string
  after: string
  aspect: string
}

export interface SegmentCopy {
  eyebrow: string
  heroLines: [string, string]
  lead: (name: string) => string
  trust: string[]
  heroShot: Transformation
  /** Surfaces it goes over (RV) or a short promise strip (commercial). */
  marquee: string[]
  stepsHeading: string
  steps: { title: string; body: string; image: string }[]
  traits: string[]
  galleryHeading: string
  gallery: Transformation[]
  faq: (name: string) => { q: string; a: string }[]
  closing: string
}

const TRAITS = ['Waterproof', 'Highly reflective', 'Scratch resistant', 'Flexible', 'Tough', 'Maintenance free']

const sharedFaq = (name: string) => [
  {
    q: `Who does the work?`,
    a: `${name} is an independent contractor certified to install the Crazy Seal system. You work with them directly on your quote, scheduling and install.`,
  },
  {
    q: 'How do I get a quote?',
    a: `Call or email ${name} with a few details and photos of your roof if you have them. They'll take it from there.`,
  },
]

export const SEGMENT_COPY: Record<Segment, SegmentCopy> = {
  rv: {
    eyebrow: 'RV roofing',
    heroLines: ['Your RV roof,', 'sealed for good.'],
    lead: (name) =>
      `${name} installs the Crazy Seal RV Roof System: a seamless, fiber-infused silicone membrane over every seam and penetration, backed by a 50 year product warranty.`,
    trust: ['50 Year Product Warranty', 'Seamless silicone membrane', 'Professionally installed'],
    heroShot: {
      label: 'Winnebago, full roof',
      before: `${MEDIA}/2019/07/Winnebago-Before-1-1024x1024.jpg`,
      after: `${MEDIA}/2019/07/Winnebago-After-1-1024x1024.jpg`,
      aspect: '1/1',
    },
    marquee: ['TPO', 'EPDM', 'Rubber', 'Vinyl', 'Aluminum', 'Fiberglass'],
    stepsHeading: 'Sealed in three steps',
    steps: [
      {
        title: 'Seal the seams',
        body: 'Specially formulated caulk and mastic seal every seam and penetration first.',
        image: `${MEDIA}/2019/06/045-Caulk-Seams.jpg`,
      },
      {
        title: 'Coat the roof',
        body: 'A final membrane goes on top of the sealed penetrations.',
        image: `${MEDIA}/2019/06/049-Patch-After.jpg`,
      },
      {
        title: 'One membrane',
        body: 'Every part shares the same base formula, merging into one seamless, chemically bonded membrane over every square inch.',
        image: `${MEDIA}/2019/06/100-Roller.jpg`,
      },
    ],
    traits: TRAITS,
    galleryHeading: 'Every seam, every penetration',
    gallery: [
      {
        label: 'Skylight & solar',
        before: `${MEDIA}/2019/07/Skylight-Solar-Before-1024x683.jpg`,
        after: `${MEDIA}/2019/07/Skylight-Solar-After-1024x683.jpg`,
        aspect: '3/2',
      },
      {
        label: 'Antenna & penetrations',
        before: `${MEDIA}/2019/07/Antennae-Before-2-1024x683.jpg`,
        after: `${MEDIA}/2019/07/Antennae-After-2-1024x683.jpg`,
        aspect: '3/2',
      },
      {
        label: 'Roof vent',
        before: `${MEDIA}/2019/07/Vent-Before-1-1024x683.jpg`,
        after: `${MEDIA}/2019/07/Vent-After-1-1024x683.jpg`,
        aspect: '3/2',
      },
    ],
    faq: (name) => [
      {
        q: 'What kinds of RV roofs does it go over?',
        a: 'TPO, EPDM, rubber, vinyl, aluminum and fiberglass.',
      },
      { q: 'What’s the warranty?', a: 'The Crazy Seal RV Roof System is backed by a 50 year product warranty.' },
      ...sharedFaq(name),
    ],
    closing: 'Ready for a roof you can stop worrying about?',
  },
  commercial: {
    eyebrow: 'Commercial roofing',
    heroLines: ['Break the', 'repair-replace cycle.'],
    lead: (name) =>
      `${name} installs the Crazy Seal commercial roof system: a seamless, fiber-infused silicone membrane that goes over your existing roof, in stages, as budget allows.`,
    trust: ['Seamless silicone membrane', 'Installs over the existing roof', 'Staged to fit your budget'],
    heroShot: {
      label: 'Flat roof, full coverage',
      before: `${MEDIA}/2022/01/Center-Full-2-Before-1024x576.jpg`,
      after: `${MEDIA}/2022/01/Center-Full-2-After-1024x576.jpg`,
      aspect: '16/9',
    },
    marquee: ['Over the existing roof', 'Staged installs', 'One permanent membrane', 'Trusted on thousands of roofs nationwide'],
    stepsHeading: 'A permanent roof, one stage at a time',
    steps: [
      {
        title: 'Spec the roof',
        body: 'Square footage, current problems and your budget cycle shape a custom kit and a staged plan.',
        image: `${MEDIA}/2024/02/Restaurant-Phase-1-1024x576.jpg`,
      },
      {
        title: 'Install in stages',
        body: 'Each stage goes over the existing roof, so you can spread the cost across budget years.',
        image: `${MEDIA}/2024/02/Restaurant-Phase-3-1024x576.jpg`,
      },
      {
        title: 'One membrane',
        body: 'Every repair chemically bonds to the last until the whole roof is one permanent membrane.',
        image: `${MEDIA}/2024/02/Restaurant-Phase-4-Complete-1024x576.jpg`,
      },
    ],
    traits: TRAITS,
    galleryHeading: 'Real flat roofs, start to finish',
    gallery: [
      {
        label: 'Full roof',
        before: `${MEDIA}/2022/01/Full-1-Before-1-Line-0-1024x576.jpg`,
        after: `${MEDIA}/2022/01/Full-1-After-Line-0-1024x576.jpg`,
        aspect: '16/9',
      },
      {
        label: 'Left section',
        before: `${MEDIA}/2022/01/Left-1-Before-Square-1024x1024.jpg`,
        after: `${MEDIA}/2022/01/Left-1-After-Square-1024x1024.jpg`,
        aspect: '1/1',
      },
      {
        label: 'Right section',
        before: `${MEDIA}/2022/01/Right-1-Before-Square-1024x1024.jpg`,
        after: `${MEDIA}/2022/01/Right-1-After-Square-1024x1024.jpg`,
        aspect: '1/1',
      },
    ],
    faq: (name) => [
      { q: 'Does the old roof have to come off?', a: 'No. The system installs over the existing roof.' },
      { q: 'Can we spread out the cost?', a: 'Yes. Staged installs let you spread the cost across budget years.' },
      ...sharedFaq(name),
    ],
    closing: 'Ready to stop patching the same roof?',
  },
}
