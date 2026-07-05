import type { Metadata } from 'next'
import { Download } from 'lucide-react'
import {
  Container,
  Grid,
  SectionHeading,
  TestimonialCard,
  LinkButton,
} from '@/lib/design-system'
import { BeforeAfterSlider } from '@/components/BeforeAfterSlider'
import { ProVimeoEmbed } from '@/components/pro/ProVimeoEmbed'

const MEDIA = 'https://media.crazyseal.com/site-assets/wp-media'

export const metadata: Metadata = {
  title: 'RV Roofing',
  description:
    'The Crazy Seal RV Roof System, professionally installed. A seamless, fiber-infused silicone roofing membrane backed by a 50 year product warranty.',
}

const TESTIMONIALS = [
  {
    name: 'David Vincent, Key Largo, FL',
    photo: `${MEDIA}/2021/04/Van-Dusseldorp-400x400.jpg`,
    text: 'Thank you for a great and reassuring experience! I have already referred this system to 3 family and friends.',
  },
  {
    name: 'Dan Horning, Sarasota, FL',
    photo: `${MEDIA}/2019/07/Metal-Closeup-400x400.jpg`,
    text: "I loved the product. I'd recommend it to anybody!",
  },
  {
    name: 'Philip Posey, Tuscumbia, AL',
    photo: `${MEDIA}/2021/11/Philip-Posey-400x400-1.jpg`,
    text: 'We could not be more pleased with the Crazy Seal product.',
  },
  {
    name: 'Douglas Evans, Overton, NV',
    photo: `${MEDIA}/2020/05/Doug-Evans-400x400.jpg`,
    text: 'After viewing the DIY videos 4 times, I followed the instructions to the letter. The product went on easily.',
  },
]

const THREE_PART_SYSTEM = [
  { label: 'Crazy Caulk', image: `${MEDIA}/2019/06/045-Caulk-Seams.jpg` },
  { label: 'Crazy Patch', image: `${MEDIA}/2019/06/049-Patch-After.jpg` },
  { label: 'Crazy Seal', image: `${MEDIA}/2019/06/100-Roller.jpg` },
]

const TRADITIONAL_ROOF_IMAGES = [
  `${MEDIA}/2020/03/Traditional-Roof-1-1024x576.jpg`,
  `${MEDIA}/2020/03/Traditional-Roof-2-1024x576.jpg`,
  `${MEDIA}/2020/03/Traditional-Roof-3-960.jpg`,
]

const WATER_DAMAGE = [
  `${MEDIA}/2020/07/Roof-Water-Damage-3-1024x576.jpg`,
  `${MEDIA}/2020/07/Roof-Water-Damage-1-1024x576.jpg`,
  `${MEDIA}/2020/07/Roof-Water-Damage-4-1024x576.jpg`,
]

const TRANSFORMATIONS = [
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
    label: 'Termination Bar',
    before: `${MEDIA}/2019/07/Termination-Bar-Before-1-1024x683.jpg`,
    after: `${MEDIA}/2019/07/Termination-Bar-After-1-1024x683.jpg`,
    aspect: '3/2',
  },
  {
    label: 'Roof Vent',
    before: `${MEDIA}/2019/07/Vent-Before-1-1024x683.jpg`,
    after: `${MEDIA}/2019/07/Vent-After-1-1024x683.jpg`,
    aspect: '3/2',
  },
]

const FULL_ROOF_TRANSFORMATIONS = [
  {
    label: 'Winnebago Front',
    before: `${MEDIA}/2019/07/Winnebago-Before-1-1024x1024.jpg`,
    after: `${MEDIA}/2019/07/Winnebago-After-1-1024x1024.jpg`,
    aspect: '1/1',
  },
  {
    label: 'Winnebago Aerial',
    before: `${MEDIA}/2019/07/Winnebago-Arial-Before-1024x512.jpg`,
    after: `${MEDIA}/2019/07/Winnebago-Arial-After-1024x512.jpg`,
    aspect: '2/1',
  },
  {
    label: 'Winnebago Rear',
    before: `${MEDIA}/2019/07/Winnebago-Before-2-1024x1024.jpg`,
    after: `${MEDIA}/2019/07/Winnebago-After-2-1024x1024.jpg`,
    aspect: '1/1',
  },
]

const DOUBLE_LAYER_TRANSFORMATIONS = [
  {
    label: 'Monaco Coach 1',
    before: `${MEDIA}/2019/05/Monaco-Vertical-Before-2-Crazy-Seal.jpg`,
    after: `${MEDIA}/2019/05/Monaco-Vertical-After-2-Crazy-Seal.jpg`,
  },
  {
    label: 'Monaco Coach 2',
    before: `${MEDIA}/2019/05/Monaco-Vertical-Before-1-Crazy-Seal.jpg`,
    after: `${MEDIA}/2019/05/Monaco-Vertical-After-1-Crazy-Seal.jpg`,
  },
  {
    label: 'Aruba Trailer 1',
    before: `${MEDIA}/2019/05/Aruba-Vertical-Before-1-Crazy-Seal.jpg`,
    after: `${MEDIA}/2019/05/Aruba-Vertical-After-1-Crazy-Seal.jpg`,
  },
  {
    label: 'Aruba Trailer 2',
    before: `${MEDIA}/2019/05/Aruba-Vertical-Before-2-Crazy-Seal.jpg`,
    after: `${MEDIA}/2019/05/Aruba-Vertical-After-2-Crazy-Seal.jpg`,
  },
]

const ROOF_TYPES = ['TPO', 'EPDM', 'Rubber', 'Vinyl', 'Aluminum', 'Fiberglass']

export default function RvRoofingPage() {
  return (
    <>
      {/* ─── HERO / PRESENTATION VIDEO ─── */}
      <Container size="xl">
        <div className="relative section-bleed bg-primary overflow-hidden">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_50%,rgba(18,95,151,0.5),transparent_60%)]" />
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_80%_20%,rgba(91,164,17,0.15),transparent_40%)]" />
          <div className="relative z-10 px-5 py-10 sm:px-6 sm:py-12 md:px-6 md:py-14 lg:px-8 lg:py-18">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-10 items-center">
              <div className="text-center lg:text-left">
                <p className="text-xs font-bold uppercase tracking-[0.2em] text-accent mb-4">
                  Professional Installation
                </p>
                <h1 className="text-4xl sm:text-5xl font-bold text-white tracking-tight mb-4">
                  RV Roofing
                </h1>
                <p className="text-xl sm:text-2xl font-semibold text-highlight mb-4">
                  The Crazy Seal RV Roof System
                </p>
                <p className="text-white/60 leading-relaxed max-w-lg mx-auto lg:mx-0">
                  Watch the video to see how the professionally installed Crazy
                  Seal RV Roof System permanently seals your RV roof with a
                  seamless, fiber-infused silicone membrane.
                </p>
              </div>
              <div>
                <ProVimeoEmbed
                  videoId="418309408"
                  thumbnail={`${MEDIA}/2021/11/Pro-Installation-Video-Cover.jpg`}
                  title="The Crazy Seal RV Roof System professional installation"
                />
                <p className="text-center text-white/70 text-sm font-medium mt-3">
                  Click to watch the professional installation video
                </p>
              </div>
            </div>
          </div>
        </div>
      </Container>

      {/* ─── TRAILER LIFE FEATURE ─── */}
      <Container size="xl" className="sm:pt-4 md:pt-8">
        <div className="section-bleed bg-white border-y sm:border border-gray-200/80 px-5 py-6 sm:px-6 md:p-6 lg:p-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 lg:gap-10 items-center">
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.2em] text-accent mb-3">
                Featured in Trailer Life Magazine
              </p>
              <h2 className="text-3xl sm:text-4xl font-bold text-primary tracking-tight mb-4">
                See Our Feature Article
              </h2>
              <p className="text-gray-600 text-base sm:text-lg leading-relaxed mb-4 md:mb-8">
                Download our featured article from Trailer Life Magazine
                explaining our revolutionary Crazy Seal roofing system.
              </p>
              <LinkButton
                href={`${MEDIA}/2020/07/Crazy-Seal-Trailer-Life.pdf`}
                variant="primary"
                size="lg"
                external
              >
                <Download className="w-5 h-5" />
                See Feature PDF
              </LinkButton>
            </div>
            <div className="grid grid-cols-2 gap-4">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={`${MEDIA}/2020/04/Trailer-Life-May-2020-Cover-Large-600x800.jpg`}
                alt="Trailer Life Magazine May 2020 cover"
                className="rounded-2xl shadow-lg w-full h-auto"
              />
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={`${MEDIA}/2020/04/Trailer-Life-May-2020-Page-1-Small.jpg`}
                alt="Trailer Life Magazine article about Crazy Seal"
                className="rounded-2xl shadow-lg w-full h-auto"
              />
            </div>
          </div>
        </div>
      </Container>

      {/* ─── IMAGES & REVIEWS ─── */}
      <Container size="xl" className="sm:pt-4 md:pt-8">
        <div className="section-bleed bg-white border-y sm:border border-gray-200/80 px-5 py-6 sm:px-6 md:p-6 lg:p-8">
          <SectionHeading heading="Images & Reviews" />
          <Grid responsiveCols={{ mobile: 1, tablet: 2, desktop: 4 }} gap="lg">
            {TESTIMONIALS.map((t) => (
              <TestimonialCard key={t.name} name={t.name} photo={t.photo} text={t.text} />
            ))}
          </Grid>
        </div>
      </Container>

      {/* ─── HOW MUCH COULD YOU SAVE ─── */}
      <Container size="xl" className="sm:pt-4 md:pt-8">
        <div className="section-bleed bg-primary overflow-hidden px-5 py-6 sm:px-6 md:p-6 lg:p-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 lg:gap-10 items-center">
            <div className="text-center md:text-left">
              <h2 className="text-3xl sm:text-4xl font-bold text-white tracking-tight mb-4">
                How Much Could You Save?
              </h2>
              <p className="text-white/60 leading-relaxed mb-6">
                Check out this PDF to see how you can save an RV load of cash by
                having the Crazy Seal System professionally installed.
              </p>
              <LinkButton
                href={`${MEDIA}/2022/09/Crazy-Seal-Dealer-F-I-Two-Sheet-Final.pdf`}
                variant="white"
                size="lg"
                external
              >
                <Download className="w-5 h-5" />
                See Savings PDF
              </LinkButton>
            </div>
            <div className="grid grid-cols-2 gap-4">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={`${MEDIA}/2021/12/Crazy-Seal-Dealer-F-I-Two-Sheet-Final-791x1024-1.jpg`}
                alt="Crazy Seal savings sheet page 1"
                className="rounded-2xl shadow-lg w-full h-auto"
              />
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={`${MEDIA}/2021/12/Crazy-Seal-Dealer-F-I-Two-Sheet-Final2-791x1024-1.jpg`}
                alt="Crazy Seal savings sheet page 2"
                className="rounded-2xl shadow-lg w-full h-auto"
              />
            </div>
          </div>
        </div>
      </Container>

      {/* ─── WHY CRAZY SEAL FOR YOUR ROOF ─── */}
      <Container size="xl" className="sm:pt-4 md:pt-8">
        <div className="section-bleed bg-white border-y sm:border border-gray-200/80 px-5 py-6 sm:px-6 md:p-6 lg:p-8">
          <SectionHeading
            heading="Why Crazy Seal For Your Roof?"
            subheading="Our multi-component system flips the roofing equation upside down."
          />
          <Grid responsiveCols={{ mobile: 1, tablet: 3 }} gap="md">
            {THREE_PART_SYSTEM.map((part) => (
              <div key={part.label} className="text-center">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={part.image}
                  alt={`${part.label} being applied`}
                  className="rounded-2xl shadow-md w-full h-auto mb-3"
                />
                <p className="font-bold uppercase tracking-wide text-primary">
                  {part.label}
                </p>
              </div>
            ))}
          </Grid>
          <div className="pt-8 md:pt-12">
            <h3 className="text-xl font-bold text-primary text-center mb-3">
              Traditional Roofing
            </h3>
            <p className="text-gray-600 leading-relaxed max-w-3xl mx-auto text-center mb-6">
              The application of our system completely flips the roofing
              equation upside down. In typical roofing, you have a substrate
              like rubber, EPDM, etc. that is laid down first with adhesive.
              Roof components are then installed on top of this substrate with
              screws, tacks, and nails creating hundreds of potential leak
              points. Then a layer of sealant is applied on top of the
              penetrations. At this point, the only protection over those
              penetrations is that layer of sealant, which over time can rot or
              deteriorate, leaving your roof vulnerable to water intrusion.
            </p>
            <Grid responsiveCols={{ mobile: 1, tablet: 3 }} gap="md">
              {TRADITIONAL_ROOF_IMAGES.map((src, i) => (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  key={src}
                  src={src}
                  alt={`Traditional roofing penetrations example ${i + 1}`}
                  className="rounded-2xl shadow-md w-full h-auto"
                />
              ))}
            </Grid>
          </div>
          <div className="pt-8 md:pt-12">
            <h3 className="text-xl font-bold text-primary text-center mb-2">
              Water Intrusion Examples
            </h3>
            <p className="text-gray-500 text-center max-w-2xl mx-auto mb-6">
              Deterioration leading to water intrusion can be incredibly
              destructive to your RV and everything inside. Here are a few
              examples of how much damage water can do.
            </p>
            <Grid responsiveCols={{ mobile: 1, tablet: 3 }} gap="md">
              {WATER_DAMAGE.map((src, i) => (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  key={src}
                  src={src}
                  alt={`Roof water damage example ${i + 1}`}
                  className="rounded-2xl shadow-md w-full h-auto"
                />
              ))}
            </Grid>
          </div>
          <div className="pt-8 md:pt-12 max-w-3xl mx-auto text-center">
            <h3 className="text-xl font-bold text-primary mb-3">
              The Crazy Seal System
            </h3>
            <p className="text-gray-600 leading-relaxed mb-4">
              Crazy Seal does exactly the opposite! Our system begins first by
              using our specially formulated caulk and mastic to seal all seams
              and penetrations. From there a final membrane is applied on top of
              the sealed penetrations. The entire roof is now sealed under one
              giant chemically bonded molecule.
            </p>
            <p className="text-gray-600 leading-relaxed">
              All components are derived from the same base formula and merge
              seamlessly together into a single membrane. The end result seals
              all penetrations and fortifies your roof with a seamless, custom
              fit membrane covering every square inch of your roof. See the
              before and after sliders below to see how Crazy Seal creates a
              seamless membrane on every inch of your roof.
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 lg:gap-6 pt-8">
            {TRANSFORMATIONS.map((t) => (
              <div key={t.label}>
                <BeforeAfterSlider
                  beforeSrc={t.before}
                  afterSrc={t.after}
                  aspectRatio={t.aspect}
                />
                <p className="text-center text-sm font-semibold text-gray-600 mt-2">
                  {t.label}
                </p>
              </div>
            ))}
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 lg:gap-6 pt-6 items-end">
            {FULL_ROOF_TRANSFORMATIONS.map((t) => (
              <div key={t.label}>
                <BeforeAfterSlider
                  beforeSrc={t.before}
                  afterSrc={t.after}
                  aspectRatio={t.aspect}
                />
                <p className="text-center text-sm font-semibold text-gray-600 mt-2">
                  {t.label}
                </p>
              </div>
            ))}
          </div>
        </div>
      </Container>

      {/* ─── DOUBLE LAYER KIT INSTALLATION EXAMPLES ─── */}
      <Container size="xl" className="sm:pt-4 md:pt-8">
        <div className="section-bleed bg-white border-y sm:border border-gray-200/80 px-5 py-6 sm:px-6 md:p-6 lg:p-8">
          <SectionHeading
            heading="Double Layer Kit Installation Examples"
            subheading="Slide the center bar back and forth to see the before and after transformations!"
          />
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {DOUBLE_LAYER_TRANSFORMATIONS.map((t) => (
              <BeforeAfterSlider
                key={t.label}
                beforeSrc={t.before}
                afterSrc={t.after}
                aspectRatio="1/1"
              />
            ))}
          </div>
        </div>
      </Container>

      {/* ─── ROOF TEMPERATURE ─── */}
      <Container size="xl" className="sm:pt-4 md:pt-8">
        <div className="section-bleed bg-primary overflow-hidden px-5 py-6 sm:px-6 md:p-6 lg:p-8">
          <SectionHeading
            heading="Reduce Your Average Roof Temperature Dramatically"
            subheading="Shot before & after applying the Crazy Seal system at 95 degrees Fahrenheit outdoor temperature."
            variant="dark"
          />
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="text-center">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={`${MEDIA}/2019/07/TEMP-GAUGES-160-1024x582.jpg`}
                alt="Roof temperature gauge reading 160 degrees before Crazy Seal"
                className="rounded-2xl shadow-lg w-full h-auto mb-3"
              />
              <p className="font-bold uppercase tracking-wide text-white">
                Before Crazy Seal
              </p>
            </div>
            <div className="text-center">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={`${MEDIA}/2019/07/TEMP-GAUGES-104-1024x582.jpg`}
                alt="Roof temperature gauge reading 104 degrees after Crazy Seal"
                className="rounded-2xl shadow-lg w-full h-auto mb-3"
              />
              <p className="font-bold uppercase tracking-wide text-white">
                After Crazy Seal
              </p>
            </div>
          </div>
        </div>
      </Container>

      {/* ─── ROOF TYPES ─── */}
      <Container size="xl" className="sm:pt-4 md:pt-8">
        <div className="section-bleed bg-white border-y sm:border border-gray-200/80 px-5 py-6 sm:px-6 md:p-6 lg:p-8">
          <SectionHeading heading="Crazy Seal Can Be Applied to All Roof Types" />
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
            {ROOF_TYPES.map((type) => (
              <div
                key={type}
                className="rounded-xl bg-gray-50 border border-gray-200/80 py-5 text-center font-bold uppercase tracking-wide text-primary"
              >
                {type}
              </div>
            ))}
          </div>
        </div>
      </Container>

      {/* ─── HYBRID ROOF SYSTEM ─── */}
      <Container size="xl" className="sm:pt-4 md:pt-8">
        <div className="section-bleed bg-white border-y sm:border border-gray-200/80 px-5 py-6 sm:px-6 md:p-6 lg:p-8">
          <SectionHeading heading="The Crazy Seal Hybrid Roof System" />
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 lg:gap-10 items-center">
            <div>
              <p className="text-gray-600 leading-relaxed mb-4">
                Crazy Seal&apos;s hybrid roof is the most advanced system ever
                developed! Originally developed for RV&apos;s, it had to be
                better for vehicles that were twisting, turning, starting,
                stopping, and screaming down the highway at 70 miles per hour in
                all types of environments.
              </p>
              <p className="text-gray-600 leading-relaxed">
                Imagine taking roofing fabric and infusing it with the highest
                grade silicone money can buy. As each piece of the Crazy Seal
                System cures, fiber strands bond to each other in a complex
                interstitial network that delivers the strength of roofing
                fabric with the durability, flexibility, and longevity of
                silicone. The result is a seamless, fiber reinforced roofing
                membrane that is waterproof, highly reflective, scratch
                resistant, flexible, tough, and maintenance free.
              </p>
            </div>
            <div>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={`${MEDIA}/2019/10/03_Direct-225-300-White-1024x503.png`}
                alt="Crazy Seal hybrid roof system product lineup"
                className="w-full h-auto"
              />
            </div>
          </div>
        </div>
      </Container>

      {/* ─── DEALER CTA ─── */}
      <Container size="xl" className="sm:pt-4 md:pt-8">
        <div className="section-bleed bg-primary overflow-hidden px-5 py-10 sm:px-6 md:p-10 lg:p-14 text-center">
          <h2 className="text-3xl sm:text-4xl font-bold text-white tracking-tight">
            Contact your dealer for more information!
          </h2>
        </div>
      </Container>
    </>
  )
}
