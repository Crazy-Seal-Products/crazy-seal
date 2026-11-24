// Crazy Seal's roof systems for the contractor portal's Systems page
// (Thermo's system master, adapted): one Crazy Seal system installed over an
// existing roof or direct to a wood deck, on RVs and buildings. Every line is
// the public site's own (src/app/installation/**, src/app/products/**,
// src/app/rv-roofing, src/lib/applications/config.ts, the FAQ and the new-TPO
// note), so the portal never promises more than crazyseal.com does. Coverage
// and prices come from pricing settings at render time. Plain module: safe to
// import from client components.

import type { ProductKey } from '@/lib/pricing/price-list-2027'
import type { Application, InstallMethod } from '@/lib/pricing/types'
import { NEW_TPO_SHORT } from '@/lib/warranty/new-tpo'

const MEDIA = 'https://media.crazyseal.com/site-assets/wp-media'

export type SystemFamily = 'rv' | 'building'

export const SYSTEM_FAMILY_LABEL: Record<SystemFamily, string> = { rv: 'RV & vehicle', building: 'Buildings' }

export interface SystemComponent {
  product: ProductKey
  /** Where it goes in this system. */
  use: string
}

export interface SystemGuide {
  label: string
  href: string
}

export interface RoofSystem {
  id: string
  name: string
  family: SystemFamily
  /** How quotes price it (the quote builder's answers). */
  application: Application
  installMethod: InstallMethod
  summary: string
  /** Surfaces it goes over. */
  roofTypes: string[]
  /** In install order. Crazy Seal's coats and rate come from coverage. */
  components: SystemComponent[]
  /** What it's for, from the site's application pages. */
  fits: string[]
  notes: string[]
  guides: SystemGuide[]
  /** The sample job its cost is worked out on (editable on the page). */
  sample: { sqft?: number; rvLengthFt?: number; seamsFt: number }
}

const MEMBRANE_GUIDE: SystemGuide = { label: 'Membrane roof installation', href: '/installation/membrane-roof/' }
const MEMBRANE_PDF: SystemGuide = { label: 'Installation PDF', href: `${MEDIA}/2020/05/Crazy-Seal-Over-Membrane-Installation-Instructions.pdf` }
const DECK_GUIDE: SystemGuide = { label: 'Direct to deck installation', href: '/installation/direct-to-deck/' }
const DECK_PDF: SystemGuide = { label: 'Installation PDF', href: `${MEDIA}/2023/06/Crazy-Seal-Direct-To-Deck-Installation.pdf` }
const TOOLS_PDF: SystemGuide = { label: 'Tool list', href: `${MEDIA}/2020/03/Crazy-Seal-Tool-List.pdf` }
const PHOTO_PDF: SystemGuide = { label: 'Warranty photo guidelines', href: `${MEDIA}/2020/05/Photo-Guidelines.pdf` }

const CLEAN: SystemComponent = { product: 'clean', use: 'Wash and scrub the roof and clean off old sealants: removes oils, dirt and oxidation so the membrane bonds.' }
const SEAL: SystemComponent = { product: 'seal', use: 'The membrane over every square inch, in coats.' }

const HYBRID = 'Part wood deck, part intact rubber/EPDM/TPO? Install the membrane sections per the membrane roof instructions.'

export const ROOF_SYSTEMS: readonly RoofSystem[] = [
  {
    id: 'rv-over-existing',
    name: 'RV roof, over the existing roof',
    family: 'rv',
    application: 'rv',
    installMethod: 'over-existing',
    summary: 'Caulk and mastic seal every seam and penetration first; the membrane goes on top and merges with them into one seamless, chemically bonded roof.',
    roofTypes: ['TPO', 'EPDM', 'Rubber', 'Vinyl', 'Aluminum', 'Fiberglass'],
    components: [
      CLEAN,
      { product: 'caulk', use: 'Seams along the sides and where components attach to the roof.' },
      { product: 'patch', use: 'Every existing penetration: vents, antennas, skylights, solar mounts.' },
      SEAL,
    ],
    fits: ['RVs, motorhomes, 5th wheels, travel trailers, pop-ups, park models and semi-trailers', 'Aluminum and fiberglass roofs with dozens of penetrations'],
    notes: [NEW_TPO_SHORT],
    guides: [MEMBRANE_GUIDE, MEMBRANE_PDF, TOOLS_PDF, PHOTO_PDF],
    sample: { rvLengthFt: 30, seamsFt: 60 },
  },
  {
    id: 'rv-direct-to-deck',
    name: 'RV roof, direct to deck',
    family: 'rv',
    application: 'rv',
    installMethod: 'direct-to-deck',
    summary: 'For a roof stripped to bare wood decking: Crazy Tape closes the deck seams, then the membrane goes straight onto the wood.',
    roofTypes: ['Bare wood decking'],
    components: [
      CLEAN,
      { product: 'tape', use: 'Every deck seam: adhesive side down for strength, fabric side up so Crazy Seal bonds to it.' },
      { product: 'caulk', use: 'Seams along the sides and where components attach to the roof.' },
      { product: 'patch', use: 'Every penetration through the deck.' },
      SEAL,
    ],
    fits: ['RV roofs with the old membrane removed down to the wood', 'Every direct-to-deck RV kit includes Crazy Tape'],
    notes: [HYBRID],
    guides: [DECK_GUIDE, DECK_PDF, TOOLS_PDF, PHOTO_PDF],
    sample: { rvLengthFt: 30, seamsFt: 60 },
  },
  {
    id: 'metal',
    name: 'Metal roof',
    family: 'building',
    application: 'commercial',
    installMethod: 'over-existing',
    summary: 'Treats the roof as one system: every fastener head and lap seam sealed, then the whole surface locked under the seamless membrane. The reflective finish cuts roof temperatures.',
    roofTypes: ['Screw-down metal', 'Steel buildings', 'Shops and hangars'],
    components: [
      { product: 'clean', use: 'Removes oils, dirt and oxidation before anything goes on.' },
      { product: 'patch', use: 'Every fastener head and penetration.' },
      { product: 'caulk', use: 'Lap seams, ridge caps and where components attach.' },
      SEAL,
    ],
    fits: ['Screw-down metal roofs with aging washer gaskets', 'Rust at lap seams, ridge caps and penetrations', 'Shops, hangars and steel buildings of any footprint', 'Cutting summer heat gain with a reflective white finish'],
    notes: [],
    guides: [MEMBRANE_GUIDE, MEMBRANE_PDF, TOOLS_PDF, PHOTO_PDF],
    sample: { sqft: 5000, seamsFt: 400 },
  },
  {
    id: 'flat-membrane',
    name: 'Flat and low-slope membrane roof',
    family: 'building',
    application: 'residential',
    installMethod: 'over-existing',
    summary: 'Over an existing rubber, EPDM, TPO or fiberglass membrane, with no tear-off: seams and penetrations sealed first, then the membrane over everything.',
    roofTypes: ['TPO', 'EPDM', 'Rubber', 'Fiberglass', 'Built-up'],
    components: [
      CLEAN,
      { product: 'caulk', use: 'Seams, wall tie-ins and gutter edges.' },
      { product: 'patch', use: 'Every existing penetration, wherever sealant was applied before.' },
      SEAL,
    ],
    fits: ['Sunrooms, porch roofs, mobile homes and storage buildings', 'Flat residential roofs with living space right below'],
    notes: [NEW_TPO_SHORT],
    guides: [MEMBRANE_GUIDE, MEMBRANE_PDF, TOOLS_PDF, PHOTO_PDF],
    sample: { sqft: 1200, seamsFt: 120 },
  },
  {
    id: 'commercial-flat',
    name: 'Commercial flat roof',
    family: 'building',
    application: 'commercial',
    installMethod: 'over-existing',
    summary: 'No tear-off, no shutdown: the membrane goes over the existing roof in stages, worst sections first, ending in one seamless, fiber-infused membrane.',
    roofTypes: ['Metal', 'TPO', 'EPDM', 'Built-up'],
    components: [
      CLEAN,
      { product: 'caulk', use: 'Seams and where equipment attaches to the roof.' },
      { product: 'patch', use: 'Every penetration and old sealant line.' },
      { product: 'seal', use: 'The membrane, in coats; by the 275-gallon tote once a job needs a tote’s worth.' },
    ],
    fits: ['Warehouses, plants and shops that can’t pause operations', 'Large roofs staged across budget cycles, section by section', 'Multi-building sites sealed one building at a time'],
    notes: [NEW_TPO_SHORT],
    guides: [MEMBRANE_GUIDE, MEMBRANE_PDF, TOOLS_PDF, PHOTO_PDF],
    sample: { sqft: 15000, seamsFt: 800 },
  },
  {
    id: 'deck-buildings',
    name: 'Bare wood deck',
    family: 'building',
    application: 'residential',
    installMethod: 'direct-to-deck',
    summary: 'For a building roof with no membrane left, straight onto the wood decking: Crazy Tape on the deck seams, then the membrane.',
    roofTypes: ['Wood decking'],
    components: [
      CLEAN,
      { product: 'tape', use: 'Every deck seam: adhesive side down for strength, fabric side up so Crazy Seal bonds to it.' },
      { product: 'caulk', use: 'Edges and where components attach.' },
      { product: 'patch', use: 'Every penetration through the deck.' },
      SEAL,
    ],
    fits: ['Residential flat roofs down to bare wood decking', 'Tiny home roofs, on or off wheels, down to the deck'],
    notes: [HYBRID],
    guides: [DECK_GUIDE, DECK_PDF, TOOLS_PDF, PHOTO_PDF],
    sample: { sqft: 600, seamsFt: 120 },
  },
]

/** What every system shares, from the site. */
export const SYSTEM_WARRANTY = '50 year, fully transferable warranty'
