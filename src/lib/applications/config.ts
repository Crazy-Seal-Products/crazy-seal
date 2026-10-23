/**
 * Config for the niche application pages (barns, sunrooms, box trucks, ...).
 *
 * Every niche page renders through the shared ApplicationPage template
 * (src/components/applications/ApplicationPage.tsx) with one entry from this
 * file. Family-level settings (hub page, recommended kits, project category,
 * before/afters) live in FAMILIES; per-application copy lives in APPLICATIONS.
 */

import type { StoreCategory } from '@/lib/store/config'

const MEDIA = 'https://media.crazyseal.com/site-assets/wp-media'

export type ApplicationFamily = 'rv' | 'residential' | 'commercial' | 'transportation'

export interface Transformation {
  label: string
  before: string
  after: string
  aspect?: string
}

export interface FamilyConfig {
  id: ApplicationFamily
  /** Short family label used in headings, e.g. "RV & Camper" */
  label: string
  hubHref: string
  hubLabel: string
  /** Store category used to pick matching testimonials */
  storeCategory: StoreCategory
  /** Supabase customer-project category */
  projectCategory: string
  /** Category to fall back to when projectCategory has no published projects */
  projectCategoryFallback?: string
  /** Store handles rendered as recommended kit cards */
  kitHandles: string[]
  kitIntro: string
  /** Anchor on /kit-builder (main shop) the hero Shop button points to */
  storeAnchor: string
  heroVideoId: string
  heroVideoThumbnail: string
  heroVideoCaption: string
  transformations: Transformation[]
  problemImage: string
  /** Preselected project type in the lead capture form */
  leadProjectType: string
}

// Before/after sets reused from the legacy pages — vehicle roofs for RV and
// transportation, the sunroom/mobile-home install for buildings.
const VEHICLE_TRANSFORMATIONS: Transformation[] = [
  {
    label: 'Skylight & Solar',
    before: `${MEDIA}/2019/07/Skylight-Solar-Before-1024x683.jpg`,
    after: `${MEDIA}/2019/07/Skylight-Solar-After-1024x683.jpg`,
    aspect: '3/2',
  },
  {
    label: 'Antenna & Penetrations',
    before: `${MEDIA}/2019/07/Antennae-Before-2-1024x683.jpg`,
    after: `${MEDIA}/2019/07/Antennae-After-2-1024x683.jpg`,
    aspect: '3/2',
  },
  {
    label: 'Roof Vent',
    before: `${MEDIA}/2019/07/Vent-Before-1-1024x683.jpg`,
    after: `${MEDIA}/2019/07/Vent-After-1-1024x683.jpg`,
    aspect: '3/2',
  },
  {
    label: 'Full Roof — Aerial',
    before: `${MEDIA}/2019/07/Winnebago-Arial-Before-1024x512.jpg`,
    after: `${MEDIA}/2019/07/Winnebago-Arial-After-1024x512.jpg`,
    aspect: '2/1',
  },
]

const BUILDING_TRANSFORMATIONS: Transformation[] = [
  {
    label: 'Roof — Side',
    before: `${MEDIA}/2019/07/Side-Sunroom-Mobile-Home-Before-1024x576.jpg`,
    after: `${MEDIA}/2019/07/Side-Sunroom-Mobile-Home-After-1024x576.jpg`,
    aspect: '16/9',
  },
  {
    label: 'Roof — Front',
    before: `${MEDIA}/2019/07/Front-Sunroom-Mobile-Home-Before-1024x576.jpg`,
    after: `${MEDIA}/2019/07/Front-Sunroom-Mobile-Home-After-1024x576.jpg`,
    aspect: '16/9',
  },
  {
    label: 'Roof — Angle',
    before: `${MEDIA}/2019/07/Angle-Sunroom-Mobile-Home-Before-1024x576.jpg`,
    after: `${MEDIA}/2019/07/Angle-Sunroom-Mobile-Home-After-1024x576.jpg`,
    aspect: '16/9',
  },
  {
    label: 'Roof — Close Up',
    before: `${MEDIA}/2019/07/Close-Up-Front-Sunrrom-Mobile-Home-Before-1024x576.jpg`,
    after: `${MEDIA}/2019/07/Close-Up-Front-Sunrrom-Mobile-Home-After-1024x576.jpg`,
    aspect: '16/9',
  },
]

export const FAMILIES: Record<ApplicationFamily, FamilyConfig> = {
  rv: {
    id: 'rv',
    label: 'RV & Camper',
    hubHref: '/rv-roofs',
    hubLabel: 'RV Roofs',
    storeCategory: 'rv-kits',
    projectCategory: 'rv',
    kitHandles: ['rv-roofing-kit', 'direct-to-deck-rv-roofing-kit', 'crazy-good-rv-repair-kit'],
    kitIntro:
      'Sized by roof square footage with everything down to the brushes. Pick your size and color — the whole system ships to your door.',
    storeAnchor: 'rv-kits',
    heroVideoId: 'OsJCUv3s2Is',
    heroVideoThumbnail: 'https://img.youtube.com/vi/OsJCUv3s2Is/sddefault.jpg',
    heroVideoCaption: 'Click to Watch the RV System Overview',
    transformations: VEHICLE_TRANSFORMATIONS,
    problemImage: `${MEDIA}/2019/07/Winnebago-Arial-After-1024x512.jpg`,
    leadProjectType: 'RV Roof',
  },
  residential: {
    id: 'residential',
    label: 'Residential',
    hubHref: '/residential',
    hubLabel: 'Residential Flat Roofs',
    storeCategory: 'roof-kits',
    projectCategory: 'residential',
    kitHandles: ['double-layer-kit', 'direct-to-deck-kit', 'crazy-good-repair-kit'],
    kitIntro:
      'Sized by square footage with every product, tool, and instruction you need. Over an existing roof? Double Layer. Bare wood decking? Direct to Deck.',
    storeAnchor: 'roof-kits',
    heroVideoId: 'ji0GvXRUams',
    heroVideoThumbnail: `${MEDIA}/2024/01/21-Reason-Thumbnail-2.jpg`,
    heroVideoCaption: 'Click to Watch the System Overview (5:15)',
    transformations: BUILDING_TRANSFORMATIONS,
    problemImage: `${MEDIA}/2019/07/Front-Sunroom-Mobile-Home-After-1024x576.jpg`,
    leadProjectType: 'Residential Flat Roof',
  },
  commercial: {
    id: 'commercial',
    label: 'Commercial',
    hubHref: '/commercial-roofing',
    hubLabel: 'Commercial Flat Roofs',
    storeCategory: 'commercial-kits',
    projectCategory: 'commercial',
    // No published commercial projects yet — show flat-roof building installs.
    projectCategoryFallback: 'residential',
    kitHandles: [
      '500-sq-ft-commercial-kit',
      '1000-sq-ft-commercial-kit',
      '2000-sq-ft-commercial-kit',
    ],
    kitIntro:
      'Kits scale from 500 to 3,000+ square feet, and large projects can be installed in stages — worst sections first, then expand.',
    storeAnchor: 'commercial-kits',
    heroVideoId: 'ji0GvXRUams',
    heroVideoThumbnail: `${MEDIA}/2024/01/21-Reason-Thumbnail-2.jpg`,
    heroVideoCaption: 'Click to Watch the System Overview (5:15)',
    transformations: BUILDING_TRANSFORMATIONS,
    problemImage: `${MEDIA}/2019/07/Angle-Sunroom-Mobile-Home-After-1024x576.jpg`,
    leadProjectType: 'Commercial Flat Roof',
  },
  transportation: {
    id: 'transportation',
    label: 'Transportation',
    hubHref: '/transportation',
    hubLabel: 'Transportation Roofs',
    storeCategory: 'roof-kits',
    projectCategory: 'transportation',
    projectCategoryFallback: 'rv',
    kitHandles: ['double-layer-kit', 'direct-to-deck-kit', 'crazy-good-repair-kit'],
    kitIntro:
      'The same flat-roof kits, sized by square footage. One kit typically covers a box truck or trailer roof — and one crew can seal a unit in a day.',
    storeAnchor: 'roof-kits',
    heroVideoId: 'ji0GvXRUams',
    heroVideoThumbnail: `${MEDIA}/2024/01/21-Reason-Thumbnail-2.jpg`,
    heroVideoCaption: 'Click to Watch the System Overview (5:15)',
    transformations: VEHICLE_TRANSFORMATIONS,
    problemImage: `${MEDIA}/2019/07/Skylight-Solar-After-1024x683.jpg`,
    leadProjectType: 'Transportation',
  },
}

export interface ApplicationConfig {
  /** Route segment, e.g. 'barns' → /barns */
  slug: string
  /** Short name for cards and chips, e.g. 'Barns' */
  label: string
  family: ApplicationFamily
  metaTitle: string
  metaDescription: string
  h1: string
  /** Highlight line under the H1 */
  tagline: string
  /** One-liner used on related-application and directory cards */
  cardBlurb: string
  problemHeading: string
  problemParagraphs: string[]
  /** "Crazy Seal is perfect for..." checklist, application specific */
  whoBullets: string[]
}

export const APPLICATIONS: ApplicationConfig[] = [
  // ─── RV family ─────────────────────────────────────────────────────────────
  {
    slug: 'pop-up-campers',
    label: 'Pop-Up Campers',
    family: 'rv',
    metaTitle: 'DIY Roofing for Pop-Up Campers',
    metaDescription:
      'Permanently seal your pop-up camper roof with the Crazy Seal DIY roofing system. One weekend, 50 year warranty.',
    h1: 'Pop-Up Camper Roofs',
    tagline: 'Give your pop-up a permanent, watertight roof — in one weekend.',
    cardBlurb: 'Seal cracked ABS and aluminum pop-up tops for good.',
    problemHeading: 'Pop-up roofs fail small, then all at once.',
    problemParagraphs: [
      "Pop-up roofs take a double beating: weather at camp, plus the stress of cranking the top up and down. Hairline cracks in ABS tops and loose seals at vents, marker lights, and lift brackets let water into a ceiling you can't easily reach — and by the time you see a stain, the damage is done.",
      'Crazy Seal wraps the whole top in one seamless, fiber-infused silicone membrane that flexes with every raise and lower and seals every penetration — the toughest roof in the campground, without adding meaningful weight.',
    ],
    whoBullets: [
      'Cracked or chalky ABS plastic and aluminum pop-up tops',
      'Drips around roof vents, marker lights, and lift brackets',
      'Small roofs — most pop-ups need only our smallest kit size',
      'Owners done with the yearly caulk-and-hope routine',
    ],
  },
  {
    slug: 'truck-campers',
    label: 'Truck Campers',
    family: 'rv',
    metaTitle: 'DIY Roofing for Truck Campers',
    metaDescription:
      'Permanently seal your truck camper roof with the Crazy Seal DIY roofing system. Flexes with the road, backed by a 50 year warranty.',
    h1: 'Truck Camper Roofs',
    tagline: 'A roof that flexes with the road instead of cracking against it.',
    cardBlurb: 'Built for cab-over campers that twist and flex on every mile.',
    problemHeading: 'No RV roof works harder than a truck camper roof.',
    problemParagraphs: [
      'A truck camper rides on the truck frame, so its roof twists with every pothole and driveway. Rigid sealants and aging rubber crack right where that movement concentrates — the cab-over nose seam and around vents, fans, and antenna mounts.',
      'Crazy Seal stays permanently flexible, bonds to aluminum, fiberglass, TPO, and EPDM, and covers the whole roof — seams, penetrations, and all — in one continuous layer. Do it once and stop chasing leaks every season.',
    ],
    whoBullets: [
      'Cab-over seam leaks that reappear after every re-caulk',
      'Aluminum and fiberglass roofs with dozens of penetrations',
      'Compact roofs — one small kit covers most truck campers',
      'Full-timers and overlanders who cannot afford water damage',
    ],
  },

  // ─── Residential family ────────────────────────────────────────────────────
  {
    slug: 'barns',
    label: 'Barns',
    family: 'residential',
    metaTitle: 'DIY Roofing for Barns',
    metaDescription:
      'Seal your barn or ag building roof with the Crazy Seal DIY roofing system — stop fastener leaks and rust without a tear-off.',
    h1: 'Barn Roofs',
    tagline: 'Protect the hay, the herd, and the equipment underneath.',
    cardBlurb: 'Stop fastener leaks and rust on metal barn roofs — no tear-off.',
    problemHeading: 'A leaking barn roof costs more than the barn.',
    problemParagraphs: [
      'Most barn roofs are aging metal panels held down by hundreds of fasteners — and every screw is a future leak. Gaskets dry out, laps rust, and water drips on hay, livestock, tack, and machinery worth far more than the building. Replacing a big ag roof runs tens of thousands of dollars.',
      'Crazy Seal goes right over your existing metal — rust treated, screws and laps sealed — under one seamless, fiber-infused silicone membrane. A fraction of the cost of re-roofing, installed yourself, with a bright white finish that keeps the barn cooler all summer.',
    ],
    whoBullets: [
      'Metal panel roofs with leaking screws and rusted laps',
      'Hay lofts, stables, and equipment storage that must stay dry',
      'Large roofs on a budget — no tear-off, no crew required',
      'Pole barns, gambrel barns, loafing sheds, and lean-tos',
    ],
  },
  {
    slug: 'boat-houses',
    label: 'Boat Houses',
    family: 'residential',
    metaTitle: 'DIY Roofing for Boat Houses',
    metaDescription:
      'Seal your boat house roof with the Crazy Seal DIY roofing system — built for constant moisture, UV off the water, and marine conditions.',
    h1: 'Boat House Roofs',
    tagline: 'Made for the one roof that lives over water.',
    cardBlurb: 'A waterproof membrane for roofs in full-time marine conditions.',
    problemHeading: 'Water below, weather above — boat house roofs get it from both sides.',
    problemParagraphs: [
      'A boat house roof never dries out. Humidity rises off the water 24/7, UV reflects up and doubles the sun exposure, and the structure is usually built light — while the boat underneath is often the most valuable thing on the property.',
      "Crazy Seal is 94% silicone — a material that simply doesn't care about water. The fiber-infused membrane seals seams, fasteners, and flashing into one continuous waterproof layer that shrugs off moisture from both directions and relentless reflected UV.",
    ],
    whoBullets: [
      'Metal and low-slope roofs in permanent high humidity',
      'Double UV exposure from sunlight reflecting off the water',
      'Protecting boats and lifts worth more than the structure',
      'Docks, lake cabins, and covered slips with aging roofs',
    ],
  },
  {
    slug: 'outdoor-rooms',
    label: 'Outdoor Rooms',
    family: 'residential',
    metaTitle: 'DIY Roofing for Outdoor Rooms',
    metaDescription:
      'Seal patio covers, lanais, and outdoor living space roofs with the Crazy Seal DIY roofing system.',
    h1: 'Outdoor Room Roofs',
    tagline: 'Keep your outdoor living space livable in any weather.',
    cardBlurb: 'Seamless protection for patio covers, lanais, and pergola roofs.',
    problemHeading: 'Outdoor rooms have indoor expectations.',
    problemParagraphs: [
      "You put real furniture, a TV, maybe an outdoor kitchen under that patio cover — so a \"minor\" leak isn't minor anymore. Most outdoor room roofs are low-slope pans, corrugated panels, or light covers that pond water and drip at the house tie-in.",
      'Crazy Seal makes that cover genuinely waterproof: one seamless membrane over panels, seams, fasteners, and the wall junction where most leaks start. The white or gray finish looks intentional, reflects heat, and carries a 50 year warranty.',
    ],
    whoBullets: [
      'Patio covers and lanais with furniture and electronics below',
      'Leaks at the house tie-in and panel seams',
      'Ponding water on low-slope and pan roofs',
      'A finished look — bright white, gray, or tan membrane',
    ],
  },
  {
    slug: 'porch-roofs',
    label: 'Porch Roofs',
    family: 'residential',
    metaTitle: 'DIY Roofing for Porches',
    metaDescription:
      'Seal your low-slope porch roof with the Crazy Seal DIY roofing system — fix the flashing leak for good.',
    h1: 'Porch Roofs',
    tagline: 'Fix the flashing leak that keeps coming back — permanently.',
    cardBlurb: 'End the wall-flashing leak on low-slope porch roofs.',
    problemHeading: 'The hardest 100 square feet on your house.',
    problemParagraphs: [
      "Porch roofs are small, but they combine everything roofing hates: a slow-draining low slope, a flashing joint where the porch meets the house, and roll roofing or metal near the end of its life. That wall junction lets water in — staining the ceiling, rotting the framing, and defying every tube of caulk you've thrown at it.",
      'Crazy Seal eliminates the junction: our 3-part system seals the flashing, seams, and field into one continuous membrane that runs up the wall line. A porch is a one-weekend project with our smallest kit — with the same 50 year warranty as a whole commercial roof.',
    ],
    whoBullets: [
      'Recurring leaks at the porch-to-wall flashing line',
      'Low-slope roofs over porches, stoops, and entryways',
      'Roll roofing and metal panels past their prime',
      'Small kits sized right — no leftover pallet of material',
    ],
  },
  {
    slug: 'sheds',
    label: 'Sheds',
    family: 'residential',
    metaTitle: 'DIY Roofing for Sheds',
    metaDescription:
      'Seal your shed or workshop roof with the Crazy Seal DIY roofing system — a one-weekend project with a 50 year warranty.',
    h1: 'Shed Roofs',
    tagline: 'One weekend. One kit. A shed roof for the next 50 years.',
    cardBlurb: 'A one-kit weekend fix for workshop and storage shed roofs.',
    problemHeading: "Your shed protects everything you'd hate to replace.",
    problemParagraphs: [
      'Tools, mowers, bikes, that project car — sheds hold thousands of dollars of stuff under the cheapest roof on the property. Roll roofing curls, panel screws loosen, and one wet season quietly rusts and mildews everything inside.',
      'Crazy Seal makes a shed roof permanent: clean it, seal the seams and fasteners, and roll the fiber-infused membrane over the whole thing. Most sheds need only our smallest kit and a single weekend — and the reflective finish keeps a workshop noticeably cooler.',
    ],
    whoBullets: [
      'Workshop, garden, and storage sheds with aging roofs',
      'Curling roll roofing and loosening panel fasteners',
      'Most sheds fit our smallest kit — no waste, no leftovers',
      'A cooler workshop under a reflective white membrane',
    ],
  },
  {
    slug: 'sunrooms',
    label: 'Sunrooms',
    family: 'residential',
    metaTitle: 'DIY Roofing for Sunrooms',
    metaDescription:
      'Seal your sunroom or patio enclosure roof with the Crazy Seal DIY roofing system and stop pan-roof seam leaks permanently.',
    h1: 'Sunroom Roofs',
    tagline: 'The classic sunroom seam leak, solved for good.',
    cardBlurb: 'Stop aluminum pan-roof seam leaks over your living space.',
    problemHeading: 'Sunroom roofs leak by design.',
    problemParagraphs: [
      'Most sunrooms and patio enclosures are capped with aluminum pan roofs whose interlocking seams rely on factory sealant that dries out in a decade. Once those seams open, water lands on drywall, carpet, and furniture — and re-caulking buys a season or two at best.',
      'Our 3-part system fills and bridges every seam, seals the wall tie-in, and covers the whole pan roof with one seamless fiber-infused membrane. The before-and-afters below are an actual sunroom install — slide the bar to see what your roof would get.',
    ],
    whoBullets: [
      'Aluminum pan roofs with failing seam sealant',
      'Finished living space directly under the roof',
      'Wall tie-ins and gutter edges that re-caulking never fixes',
      'Patio enclosures, Florida rooms, and screen room conversions',
    ],
  },
  {
    slug: 'tiny-homes',
    label: 'Tiny Homes',
    family: 'residential',
    metaTitle: 'DIY Roofing for Tiny Homes',
    metaDescription:
      'Seal your tiny home roof with the Crazy Seal DIY roofing system — light, flexible, and backed by a 50 year warranty.',
    h1: 'Tiny Home Roofs',
    tagline: 'When your whole home fits in 300 square feet, the roof is everything.',
    cardBlurb: 'Light, flexible, permanent roofing for tiny houses on or off wheels.',
    problemHeading: 'Tiny homes need full-size roof protection.',
    problemParagraphs: [
      'A tiny home has no attic to catch a leak and no spare room to close off — water hits your living space immediately. Homes on wheels add road flex that opens rigid roofing at the seams, and every pound matters when your house has a tow rating.',
      'Crazy Seal adds a seamless, permanently flexible membrane at a fraction of the weight of new roofing panels. It bonds to metal, membrane, and wood decking, moves with the house instead of cracking, and the reflective finish helps keep a small space cool.',
    ],
    whoBullets: [
      'Tiny houses on wheels that flex going down the road',
      'Weight-conscious builds — a membrane, not another roof layer',
      'No-attic designs where any leak is an emergency',
      'Metal, EPDM, and bare-deck tiny home roofs alike',
    ],
  },

  // ─── Commercial family ─────────────────────────────────────────────────────
  {
    slug: 'industrial',
    label: 'Industrial',
    family: 'commercial',
    metaTitle: 'DIY Industrial Roofing',
    metaDescription:
      'Seal warehouse and industrial facility roofs with the Crazy Seal roofing system — installed by your own crew, in stages, without shutting down.',
    h1: 'Industrial Roofs',
    tagline: 'Fix the roof without stopping the plant.',
    cardBlurb: 'Reseal warehouse and plant roofs in stages, with your own crew.',
    problemHeading: 'Downtime costs more than the roof does.',
    problemParagraphs: [
      'On an industrial building, the roof problem is never just the roof. A tear-off means staging, crews, and exposure risk over production lines and inventory — so leaks get bucket-managed for years while the deck deteriorates and the bill grows.',
      'Crazy Seal changes the math: no tear-off, no specialized crew, no shutdown. Your own maintenance team installs it in stages — worst sections this quarter, the rest next — ending in one seamless, fiber-infused membrane backed by a 50 year warranty.',
    ],
    whoBullets: [
      'Warehouses, plants, and shops that cannot pause operations',
      'Installed by in-house maintenance crews — no contractor required',
      'Stage large roofs across budget cycles, section by section',
      'Metal, TPO, EPDM, and built-up roofs — no tear-off needed',
    ],
  },
  {
    slug: 'metal-buildings',
    label: 'Metal Buildings',
    family: 'commercial',
    metaTitle: 'DIY Roofing for Metal Buildings',
    metaDescription:
      'Seal metal building roofs with the Crazy Seal roofing system — permanently stop fastener leaks, lap rust, and heat gain.',
    h1: 'Metal Building Roofs',
    tagline: 'Every screw head sealed. Every lap seam closed. Permanently.',
    cardBlurb: 'Permanently seal the thousands of fasteners on a metal roof.',
    problemHeading: 'A metal roof is a grid of future leaks.',
    problemParagraphs: [
      'Steel buildings are held down by thousands of screws, each with a rubber washer that has an expiration date. Daily expansion backs screws out and works lap seams open — and once rust starts at the laps, patch coatings become an annual ritual that never ends.',
      'Crazy Seal treats the roof as one system: rust neutralized, every fastener head and lap seam sealed with our 3-part process, and the whole surface locked under a seamless fiber-infused silicone membrane. The reflective finish drops roof temperatures dramatically — and it shows on the cooling bill.',
    ],
    whoBullets: [
      'Screw-down metal roofs with aging washer gaskets',
      'Rust at lap seams, ridge caps, and penetrations',
      'Shops, hangars, and steel buildings of any footprint',
      'Cutting summer heat gain with a reflective white finish',
    ],
  },
  {
    slug: 'self-storage',
    label: 'Self Storage',
    family: 'commercial',
    metaTitle: 'DIY Roofing for Self Storage',
    metaDescription:
      'Seal self storage facility roofs with the Crazy Seal roofing system — protect tenant property without emptying a single unit.',
    h1: 'Self Storage Roofs',
    tagline: "Reseal every building without emptying a single unit.",
    cardBlurb: 'Reseal storage buildings roof by roof, tenants in place.',
    problemHeading: "A storage roof leak is a liability, not a maintenance item.",
    problemParagraphs: [
      "When a storage roof leaks, it leaks onto someone else's belongings — claims, angry tenants, and reviews that cost future occupancy. Long, low metal storage roofs are classic fastener-and-lap leakers, and a traditional re-roof disrupts dozens of occupied units.",
      'Your own crew fixes it building by building: seal the screws and seams, roll the membrane, done — tenants never move a box. It goes straight over the existing metal, can be staged across properties as budget allows, and the 50 year warranty outlasts your loan.',
    ],
    whoBullets: [
      'Occupied facilities — no tenant disruption, no unit turnover',
      'Long metal roofs with hundreds of leak-prone fasteners',
      'Multi-building sites sealed in stages, on your schedule',
      'Reduced liability from water damage claims',
    ],
  },

  // ─── Transportation family ─────────────────────────────────────────────────
  {
    slug: 'box-trucks',
    label: 'Box Trucks',
    family: 'transportation',
    metaTitle: 'DIY Roofing for Box Trucks',
    metaDescription:
      'Seal box truck and delivery vehicle roofs with the Crazy Seal roofing system — one truck, one day, no more cargo claims.',
    h1: 'Box Truck Roofs',
    tagline: 'One truck, one day, zero wet freight.',
    cardBlurb: 'Seal flexing aluminum and FRP truck roofs in a day per unit.',
    problemHeading: 'Box truck roofs live a hard life at 70 mph.',
    problemParagraphs: [
      'A box truck roof is thin aluminum or translucent FRP that flexes every mile, riveted and seamed exactly where water wants in. You usually find a leak from a customer — wet freight, a damage claim, and a truck out of rotation.',
      'Crazy Seal turns that roof into one seamless membrane that moves with the truck body instead of cracking away from it. It bonds to aluminum, FRP, and steel, seals every rivet line and seam, and one crew can do a truck in a day — back on the route tomorrow.',
    ],
    whoBullets: [
      'Aluminum and translucent FRP roofs with rivet-line leaks',
      'Delivery fleets tired of cargo damage claims',
      'One-day installs that keep trucks in rotation',
      'Straight trucks, cube vans, and moving trucks',
    ],
  },
  {
    slug: 'shipping-containers',
    label: 'Shipping Containers',
    family: 'transportation',
    metaTitle: 'DIY Roofing for Shipping Containers',
    metaDescription:
      'Seal shipping container roofs with the Crazy Seal roofing system — stop rust, ponding leaks, and radiant heat on containers used for storage, offices, and homes.',
    h1: 'Shipping Container Roofs',
    tagline: 'Rust-proof, water-proof, and a whole lot cooler inside.',
    cardBlurb: 'Seal dented, rusting container roofs — storage, office, or home.',
    problemHeading: 'Container roofs pond, rust, and bake.',
    problemParagraphs: [
      'Container roofs dent the first time anything lands on them, and every dent becomes a pond. Standing water finds the rust, rust becomes pinholes, and your "weatherproof" steel box drips on inventory, tools, or people. Bare steel also turns the interior into an oven all summer.',
      'Crazy Seal neutralizes surface rust, seals pinholes and seams, and covers the whole roof in a seamless waterproof membrane that fills the low spots standing water exploits. The reflective white finish knocks interior temperatures down dramatically — the biggest livability upgrade a container can get.',
    ],
    whoBullets: [
      'Dented roofs with ponding water and rust pinholes',
      'Container homes, offices, and job-site storage',
      'Cooler interiors under a highly reflective membrane',
      'Single boxes or whole container yards, sealed in stages',
    ],
  },
  {
    slug: 'tractor-trailers',
    label: 'Tractor Trailers',
    family: 'transportation',
    metaTitle: 'DIY Roofing for Tractor Trailers',
    metaDescription:
      'Seal 53-foot trailer roofs with the Crazy Seal roofing system — stop freight claims from cracked translucent panels and seam leaks.',
    h1: 'Tractor Trailer Roofs',
    tagline: "Protect the freight — it's worth more than the trailer.",
    cardBlurb: 'Reseal 53-foot trailer roofs and retire the freight claims.',
    problemHeading: 'A 53-foot roof with a thousand chances to leak.',
    problemParagraphs: [
      "Trailer roofs are fifty-three feet of thin aluminum or brittle translucent panels, seamed and riveted, twisting over every expansion joint on the interstate. Cracked skylight panels and opened rivet lines don't announce themselves — the first sign is a rejected load and a freight claim.",
      "Crazy Seal reseals the whole roof — panels, rivets, seams, and all — as one flexible, seamless membrane that survives the vibration that destroys rigid coatings. One bay crew can turn a trailer around in a day; seal the fleet's worst roofs first and work down the line.",
    ],
    whoBullets: [
      'Cracked translucent roof panels and skylights',
      'Rivet-line and seam leaks along thin aluminum roofs',
      'Fleets sealing trailers on a rotating schedule',
      'Dry vans, reefers, and pups — one day per trailer',
    ],
  },
]

/** Look up one application by its route slug. */
export function getApplication(slug: string): ApplicationConfig | undefined {
  return APPLICATIONS.find((a) => a.slug === slug)
}

/** Sibling applications in the same family (for the related band). */
export function relatedApplications(config: ApplicationConfig): ApplicationConfig[] {
  return APPLICATIONS.filter((a) => a.family === config.family && a.slug !== config.slug)
}
