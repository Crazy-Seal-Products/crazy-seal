import type { Metadata } from 'next'
import {
  Shield,
  Clock,
  MapPin,
  Wrench,
  Zap,
  CheckCircle,
  Download,
  Layers,
  Droplets,
  Hammer,
  Ban,
  Sun,
  Feather,
  FlaskConical,
  Thermometer,
  Leaf,
  Puzzle,
  Construction,
  MoveHorizontal,
} from 'lucide-react'
import {
  Container,
  Grid,
  SectionHeading,
  FeatureCard,
  ContentImageSection,
  LinkButton,
} from '@/lib/design-system'
import { VideoHero } from '@/components/VideoHero'
import { CtaSection } from '@/components/CtaSection'

const MEDIA = 'https://media.rv-armor.com/site-assets/wp-media'

export const metadata: Metadata = {
  title: 'RV Armor Advantages | RV ARMOR',
  description: 'Discover why RV owners choose RV Armor: lifetime warranty, zero maintenance, mobile service, and seamless protection.',
}

export default function AdvantagesPage() {
  return (
    <>
      {/* ─── HERO ─── */}
      <Container size="xl">
        <VideoHero
          heading="RV Armor"
          highlight="Advantages"
          subheading="Incredible value and convenience. Not all roofing systems are created equal. See why thousands of RV owners have chosen RV Armor for permanent roof protection."
          youtubeId="4ptAJz64Zok"
          imageAlt="RV Armor advantages overview"
          badge="Permanent Protection"
          variant="dark"
        />
      </Container>

      {/* ─── NOT ALL ROOFING SYSTEMS ─── */}
      <Container size="xl" className="sm:pt-4 md:pt-8">
        <div className="section-bleed bg-white border-y sm:border border-gray-200/80 px-5 py-6 sm:px-6 md:p-6 lg:p-8">
          <ContentImageSection
            imageSrc={`${MEDIA}/2018/12/RV-Roof-White.jpg`}
            imageAlt="RV Armor white roof installation"
            gridCols="lg:grid-cols-[7fr_3fr]"
          >
            <p className="text-xs font-bold uppercase tracking-[0.2em] text-accent mb-3">The Problem</p>
            <h2 className="text-3xl sm:text-4xl font-bold text-primary tracking-tight mb-4">
              Not All Roofing Systems Are Created Equal
            </h2>
            <p className="text-gray-500 leading-relaxed mb-4">
              If you take your RV to a dealership service department, they will remove your old
              roof and replace it with the exact same material that failed in the first place.
              That means in 10-15 years you&apos;ll be doing it all over again.
            </p>
            <p className="text-gray-500 leading-relaxed">
              RV Armor is different. Our proprietary seamless membrane is custom-manufactured
              directly on your RV, creating a permanent barrier with a lifetime guarantee.
            </p>
          </ContentImageSection>
        </div>
      </Container>

      {/* ─── COMPARISON (card) ─── */}
      <Container size="xl" className="sm:pt-4 md:pt-8">
        <div className="section-bleed bg-white border-y sm:border border-gray-200/80 px-5 py-6 sm:px-6 md:p-6 lg:p-8">
          <SectionHeading
            eyebrow="Compare"
            heading="RV Armor vs Standard Fiberglass"
            subheading="See how RV Armor stacks up against a standard fiberglass roof replacement."
          />
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
            <div className="rounded-2xl bg-white border-2 border-accent/30 p-8 shadow-sm relative overflow-hidden">
              <div className="absolute top-0 left-0 right-0 h-1 bg-accent" />
              <div className="text-center mb-6">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={`${MEDIA}/2018/12/RV-Armor-RV.png`}
                  alt="RV with RV Armor roof"
                  className="h-36 mx-auto object-contain mb-4"
                />
                <h3 className="text-xl font-bold text-accent">RV Armor</h3>
              </div>
              <ul className="space-y-3 text-sm">
                {[
                  '1/3 of typical fiberglass cost',
                  'Lifetime material and labor warranty',
                  'Zero maintenance required',
                  'Fully transferable warranty',
                  'We come to your location',
                  '2-3 day installation',
                ].map((item) => (
                  <li key={item} className="flex items-start gap-3">
                    <CheckCircle className="w-5 h-5 text-accent flex-shrink-0 mt-0.5" />
                    <span className="text-gray-700">{item}</span>
                  </li>
                ))}
              </ul>
            </div>
            <div className="rounded-2xl bg-white border border-gray-200 p-8 shadow-sm relative overflow-hidden">
              <div className="absolute top-0 left-0 right-0 h-1 bg-gray-300" />
              <div className="text-center mb-6">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={`${MEDIA}/2018/12/Other-Guys-RV.png`}
                  alt="Standard RV roof"
                  className="h-36 mx-auto object-contain mb-4"
                />
                <h3 className="text-xl font-bold text-gray-400">Standard Fiberglass</h3>
              </div>
              <ul className="space-y-3 text-sm">
                {[
                  '$11,500-$20,000+ cost',
                  'Pro-rated warranty only',
                  'Requires annual maintenance',
                  'Warranty not transferable',
                  'Must bring RV to dealer',
                  'Weeks at the dealership',
                ].map((item) => (
                  <li key={item} className="flex items-start gap-3">
                    <span className="w-5 h-5 rounded-full bg-red-100 text-red-400 flex items-center justify-center flex-shrink-0 mt-0.5 text-xs font-bold">&#10005;</span>
                    <span className="text-gray-500">{item}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </Container>

      {/* ─── COLORS ─── */}
      <Container size="xl" className="sm:pt-4 md:pt-8">
        <div className="section-bleed bg-white border-y sm:border border-gray-200/80 px-5 py-6 sm:px-6 md:p-6 lg:p-8">
          <SectionHeading heading="Available in 3 Colors" subheading="Actual coating color may vary slightly depending on screen resolution and contrast of your viewing device." />
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-8 max-w-4xl mx-auto">
            {[
              { label: 'White', file: 'RV-Roof-White.jpg' },
              { label: 'Tan', file: 'Tan.jpg' },
              { label: 'Gray', file: 'RV-Roof-Gray.jpg' },
            ].map((color) => (
              <div key={color.label} className="group">
                <div className="rounded-2xl overflow-hidden shadow-sm hover:shadow-lg transition-all duration-300">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={`${MEDIA}/2018/12/${color.file}`}
                    alt={`${color.label} RV Armor roof`}
                    className="w-full aspect-square object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                </div>
                <p className="text-lg font-bold text-primary text-center mt-4">{color.label}</p>
              </div>
            ))}
          </div>
        </div>
      </Container>

      {/* ─── ALL ROOF TYPES (card) ─── */}
      <Container size="xl" className="sm:pt-4 md:pt-8">
        <div className="section-bleed bg-primary overflow-hidden px-5 py-6 sm:px-6 md:p-6 lg:p-8">
          <SectionHeading heading="We Do All Roof Types" variant="dark" />
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 max-w-3xl mx-auto">
            {['Rubber (EPDM)', 'Fiberglass', 'TPO', 'Metal', 'Vinyl', 'Wood Decking', 'Aluminum', 'Direct to Deck'].map((type) => (
              <div key={type} className="flex items-center gap-3 bg-white/10 rounded-xl px-4 py-3">
                <CheckCircle className="w-5 h-5 text-accent flex-shrink-0" />
                <span className="text-sm font-medium text-white">{type}</span>
              </div>
            ))}
          </div>
        </div>
      </Container>

      {/* ─── ADVANTAGES GRID ─── */}
      <Container size="xl" className="sm:pt-4 md:pt-8">
        <div className="section-bleed bg-white border-y sm:border border-gray-200/80 px-5 py-6 sm:px-6 md:p-6 lg:p-8">
          <SectionHeading eyebrow="The Details" heading="Every Advantage Matters" />
          <Grid responsiveCols={{ mobile: 1, tablet: 2, desktop: 4 }} gap="lg">
            {[
              { icon: <Shield className="w-6 h-6 text-primary" />, title: 'Guaranteed', desc: 'Fully transferable lifetime material and labor warranty.' },
              { icon: <MapPin className="w-6 h-6 text-primary" />, title: 'Convenient', desc: 'We come to you. Your driveway. Your campground. Wherever you are.' },
              { icon: <Zap className="w-6 h-6 text-primary" />, title: 'Affordable', desc: '30%-50% less than a tear off and replacement.' },
              { icon: <Clock className="w-6 h-6 text-primary" />, title: 'Nationwide', desc: 'Installed by certified technicians nationwide.' },
              { icon: <Wrench className="w-6 h-6 text-primary" />, title: 'Comprehensive', desc: 'All makes and models. Class A, C, 5th Wheel, Travel Trailers, Horse Trailers, etc.' },
              { icon: <Hammer className="w-6 h-6 text-primary" />, title: 'Durable', desc: 'Tensile strength of 2140 psi.' },
              { icon: <Sun className="w-6 h-6 text-primary" />, title: 'UV Protection', desc: 'Loaded with UV stabilizers for superior solar protection.' },
              { icon: <Ban className="w-6 h-6 text-primary" />, title: 'Wear Resistant', desc: 'Antioxidants prevent cracking, chalking, and fading.' },
              { icon: <Layers className="w-6 h-6 text-primary" />, title: 'Permanent', desc: 'The last roof your RV will ever need.' },
              { icon: <Droplets className="w-6 h-6 text-primary" />, title: 'Solvent Based', desc: 'Resists mold penetration.' },
              { icon: <Feather className="w-6 h-6 text-primary" />, title: 'Lightweight', desc: "Won't add stress to roof or chassis." },
              { icon: <FlaskConical className="w-6 h-6 text-primary" />, title: 'Resistant', desc: 'Resistant to fungus, salt, acids, and chemicals.' },
              { icon: <Shield className="w-6 h-6 text-primary" />, title: 'Tear Resistant', desc: 'Puncture and tear resistant.' },
              { icon: <CheckCircle className="w-6 h-6 text-primary" />, title: 'No Upkeep', desc: "Won't crack, chip, peel, or streak. No need to climb on your RV roof again." },
              { icon: <Puzzle className="w-6 h-6 text-primary" />, title: 'Custom Fit', desc: 'Starts as liquid, dries into a seamless, maintenance-free roof.' },
              { icon: <Thermometer className="w-6 h-6 text-primary" />, title: 'Extreme', desc: 'Handles temperatures from -75\u00B0F to +350\u00B0F.' },
              { icon: <Leaf className="w-6 h-6 text-primary" />, title: 'Energy Efficient', desc: 'Reflective properties reduce interior temperature and A/C expense.' },
              { icon: <Construction className="w-6 h-6 text-primary" />, title: 'Versatile', desc: 'Can be installed over Rubber, Fiberglass, TPO, Metal, and directly to wood decking.' },
              { icon: <Wrench className="w-6 h-6 text-primary" />, title: 'Any Condition', desc: 'Complete operation from wood replacement to total tear-off.' },
              { icon: <MoveHorizontal className="w-6 h-6 text-primary" />, title: 'Flexible', desc: 'Elongation of 830%.' },
            ].map((item) => (
              <FeatureCard
                key={item.title}
                icon={item.icon}
                title={item.title}
                description={item.desc}
              />
            ))}
          </Grid>
        </div>
      </Container>

      {/* ─── TOUGH SKIN (card) ─── */}
      <Container size="xl" className="sm:pt-4 md:pt-8">
        <div className="section-bleed bg-primary overflow-hidden px-5 pt-6 pb-4 sm:px-6 md:p-6 lg:p-8">
          <div className="grid grid-cols-1 md:grid-cols-[1fr_3fr] gap-6 md:gap-4 lg:gap-6 items-center">
            <div className="order-2 md:order-1 relative flex items-center justify-center md:justify-start">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={`${MEDIA}/2018/12/RV-Armor-Tough-Skin-Brochure-b.jpg`}
                alt="Trailer Life Magazine - RV Armor Tough Skin article"
                className="rounded-2xl shadow-2xl ring-1 ring-white/10 h-auto md:max-h-[400px] object-contain"
              />
            </div>
            <div className="order-1 md:order-2 text-center md:text-left">
              <p className="text-xs font-bold uppercase tracking-[0.2em] text-accent mb-3">
                Featured in Trailer Life Magazine
              </p>
              <h2 className="text-3xl sm:text-4xl font-bold text-white tracking-tight mb-4">
                Tough Skin
              </h2>
              <p className="text-white/60 text-base sm:text-lg leading-relaxed mb-4 md:mb-8">
                Read what Trailer Life Magazine has to say about RV Armor. Our proprietary roofing
                system has been featured in major RV publications for its durability and value.
              </p>
              <LinkButton
                href={`${MEDIA}/2018/12/RV-Armor-Tough-Skin-Brochure.jpg`}
                variant="white"
                size="lg"
                external
              >
                <Download className="w-5 h-5" />
                Read the Article
              </LinkButton>
            </div>
          </div>
        </div>
      </Container>

      {/* ─── CTA ─── */}
      <Container size="xl" className="sm:pt-4 md:pt-8">
        <CtaSection />
      </Container>
    </>
  )
}
