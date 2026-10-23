import type { Metadata } from 'next'
import { ArrowRight, BookOpen, Quote, Trophy } from 'lucide-react'
import {
  Container,
  Grid,
  SectionHeading,
  TestimonialCard,
  LinkButton,
} from '@/lib/design-system'
import {
  Callout,
  Checklist,
  ContactCta,
  DARK_CARD,
  HERO_H1,
  HeroShell,
  MEDIA,
  SECTION_NAVY,
  SECTION_WHITE,
  StatTile,
  fadeDelay,
} from '@/components/system-pages/blocks'
import { VimeoEmbed } from './VimeoEmbed'

export const metadata: Metadata = {
  title: 'About Crazy Seal',
  description:
    'Born into roofing, innovative in spirit. Meet Lee and Carol Thaxton, the 3rd generation roofers behind the Crazy Seal DIY seamless roofing system.',
}

const TESTIMONIALS = [
  {
    name: 'David Vincent, Key Largo, FL',
    text: 'Thank you for a great and reassuring experience! I have already referred this system to 3 family and friends.',
  },
  {
    name: 'Dan Horning, Sarasota, FL',
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
    text: 'After viewing the videos 4 times, I followed the instructions to the letter. The product went on easily.',
  },
]

export default function AboutPage() {
  return (
    <>
      {/* ─── HERO ─── */}
      <Container size="xl">
        <HeroShell innerClassName="text-center">
          <h1 className={HERO_H1} style={fadeDelay(80)}>
            About Us
          </h1>
          <p
            className="animate-fade-up text-lg sm:text-2xl font-extrabold uppercase tracking-wide text-white/90 font-[family-name:var(--font-display)]"
            style={fadeDelay(160)}
          >
            Born Into Roofing. <span className="text-shimmer-highlight">Innovative in Spirit!</span>
          </p>
          <div
            className="animate-fade-up mx-auto mt-8 grid max-w-3xl grid-cols-2 md:grid-cols-4 gap-3"
            style={fadeDelay(260)}
          >
            <StatTile value={70} suffix="+" label="Years in roofing" variant="dark" />
            <StatTile display="3rd" label="Generation roofer" variant="dark" />
            <StatTile display="1946" label="Thaxton Roofers founded" variant="dark" />
            <StatTile value={50} suffix=" yr" label="Product warranty" variant="dark" />
          </div>
        </HeroShell>
      </Container>

      {/* ─── BORN INTO ROOFING ─── */}
      <Container size="xl" className="sm:pt-4 md:pt-8">
        <div className={SECTION_WHITE}>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 lg:gap-14 items-center">
            <div>
              <SectionHeading
                eyebrow="Three Generations"
                heading="I Was Born Into the Roofing Business. It's in My Blood."
                align="left"
                className="mb-4"
              />
              <p className="text-gray-600 leading-relaxed mb-5">
                I am a 3rd generation roofer. My Grandfather (also Lee Thaxton) started Thaxton Roofers, Inc.
                in Northfield, Ohio back in 1946, and my Uncle and Cousin still run that business today. My
                father was a roofing contractor, and my brother, uncles and cousins are in the business too.
              </p>
              <Callout icon={BookOpen} title="Our name says all you need to know" tone="highlight" className="mb-5">
                Thaxton is a derivative of Thatcher, or Thatch for short. Thatching literally means roofing:
                &ldquo;a material, as straw, rushes, leaves, or the like, used to cover roofs.&rdquo;
              </Callout>
              <p className="text-gray-600 leading-relaxed">
                With over 70 years of experience behind us, we know a thing or two about roofing. Although I
                love my family, I&apos;ve always leaned towards innovation and creating new paths. While I can
                appreciate traditional roofing, as it&apos;s been a mainstay in our family for decades, I
                ventured out.
              </p>
            </div>
            <figure className="group relative">
              <div
                aria-hidden="true"
                className="absolute -inset-4 rounded-[2rem] bg-gradient-to-br from-secondary/15 via-transparent to-accent/20 blur-xl"
              />
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={`${MEDIA}/2019/09/Lee-Pointed-Out.jpg`}
                alt="Lee Thaxton with the Thaxton Roofers crew in 1982"
                className="relative rounded-2xl shadow-xl ring-1 ring-primary/10 w-full h-auto transition-transform duration-700 group-hover:-rotate-1"
              />
              <figcaption className="absolute -bottom-4 left-1/2 -translate-x-1/2 whitespace-nowrap rounded-full bg-primary px-4 py-2 text-xs sm:text-sm font-bold text-white shadow-glow-primary">
                Lee Thaxton, 3rd from left, 1982
              </figcaption>
            </figure>
          </div>
        </div>
      </Container>

      {/* ─── NO RV'ER LEFT BEHIND ─── */}
      <Container size="xl" className="sm:pt-4 md:pt-8">
        <div className={SECTION_NAVY}>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 lg:gap-14 items-center">
            <div className="relative order-2 md:order-1">
              <div
                aria-hidden="true"
                className="absolute -inset-3 rounded-[1.75rem] bg-gradient-to-br from-highlight/25 via-secondary/20 to-accent/30 blur-2xl"
              />
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={`${MEDIA}/2019/06/070-Far-Off-Roll-1.jpg`}
                alt="Applying the Crazy Seal roofing system to an RV roof"
                className="relative rounded-2xl shadow-2xl ring-1 ring-white/15 w-full h-auto"
              />
            </div>
            <div className="order-1 md:order-2">
              <SectionHeading
                eyebrow="Fellow RV'ers"
                heading="No RV'er Left Behind"
                align="left"
                variant="dark"
                className="mb-4"
              />
              <p className="text-white/70 leading-relaxed mb-5">
                Carol and I are fellow RV&apos;ers. We travel most of the year in our motorhome and work from
                the road. It&apos;s a great way to see this great country, and with internet virtually
                anywhere, it&apos;s easy to stay on top of our businesses.
              </p>
              <p className="mb-3 text-[11px] font-bold uppercase tracking-[0.18em] text-highlight">
                We&apos;re not new to RV roofing. We created:
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-5">
                {[
                  'The first nationwide, mobile service company offering a seamless, maintenance free roofing system',
                  "The first true Lifetime Material and Labor Warranty for roofing RV's",
                ].map((item) => (
                  <div key={item} className={`group flex items-start gap-3 p-4 ${DARK_CARD}`}>
                    <span className="grid h-8 w-8 shrink-0 place-items-center rounded-lg bg-highlight text-primary transition-transform duration-500 group-hover:-rotate-6">
                      <Trophy className="h-4 w-4" />
                    </span>
                    <p className="text-sm font-semibold text-white/85 leading-snug">{item}</p>
                  </div>
                ))}
              </div>
              <p className="text-white/70 leading-relaxed mb-4">
                Even after thousands of RV roofs, it always troubled us that not every RV or RV&apos;er was a
                good fit for that system. We still get hundreds of requests each year for DIY kits, but our
                roofing system is not easily installed by the average person:
              </p>
              <ul className="flex flex-wrap gap-2 mb-5">
                {['Solvent based', 'Needs primer', 'Needs trained, certified techs'].map((item) => (
                  <li
                    key={item}
                    className="inline-flex items-center rounded-full bg-white/10 px-3.5 py-1.5 text-sm font-semibold text-white ring-1 ring-white/15"
                  >
                    {item}
                  </li>
                ))}
              </ul>
              <p className="text-white/70 leading-relaxed">
                So we made something different, something special, for the average DIY&apos;er — not the
                inferior products you find at most retailers. We spent years working with chemical
                specialists until we found and tested a formula that would stand the test of time.
              </p>
            </div>
          </div>
        </div>
      </Container>

      {/* ─── THE CRAZY SEAL ROOFING SOLUTION ─── */}
      <Container size="xl" className="sm:pt-4 md:pt-8">
        <div className={SECTION_WHITE}>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 lg:gap-14 items-center">
            <div>
              <SectionHeading
                eyebrow="Patented Fiber-Infused Silicone"
                heading="The Crazy Seal Roofing Solution"
                align="left"
                className="mb-4"
              />
              <p className="text-gray-600 text-base md:text-lg leading-relaxed mb-6">
                Crazy Seal is the most advanced fluid applied roofing membrane ever developed: a patented,
                superior grade fiber-infused silicone. Its 3 products (Crazy Caulk, Crazy Patch, and Crazy
                Seal) work together to create an incredibly tough, seamless, maintenance free roof membrane.
              </p>
              <Checklist
                items={[
                  'Goes over multiple surfaces without the need for a primer',
                  'Bonds directly to wood decking, rubber, fiberglass, and more',
                  'Guided DIY system with step by step application instructions for a professional finish',
                  'Installable by any capable person, but stout enough to be covered by a 50-year product warranty',
                ]}
              />
            </div>
            <div className="group relative grid place-items-center py-6">
              <div
                aria-hidden="true"
                className="absolute inset-x-6 inset-y-10 rounded-full bg-gradient-to-br from-secondary/20 via-accent/15 to-highlight/25 blur-2xl"
              />
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={`${MEDIA}/2019/10/09_Double-300-500-White-1024x485.png`}
                alt="Crazy Seal Double Layer roofing kit"
                className="relative w-full h-auto animate-float-slow drop-shadow-[0_24px_30px_rgba(0,32,67,0.25)] transition-transform duration-700 group-hover:scale-105"
              />
            </div>
          </div>
        </div>
      </Container>

      {/* ─── 70+ YEARS OF ROOFING KNOWLEDGE ─── */}
      <Container size="xl" className="sm:pt-4 md:pt-8">
        <div className={SECTION_WHITE}>
          <div className="grid grid-cols-1 md:grid-cols-[1fr_2fr] gap-8 lg:gap-14 items-center">
            <div className="relative flex justify-center">
              <div aria-hidden="true" className="absolute inset-8 rounded-full bg-highlight/30 blur-3xl" />
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={`${MEDIA}/2019/06/50-Year-Warranty-Space-600x600.png`}
                alt="Crazy Seal 50 year warranty badge"
                className="relative w-full max-w-[16rem] md:max-w-xs h-auto animate-float-slow drop-shadow-[0_24px_40px_rgba(0,32,67,0.25)]"
              />
            </div>
            <div>
              <SectionHeading
                eyebrow="What You Get"
                heading="70+ Years of Roofing Knowledge"
                align="left"
                className="mb-5"
              />
              <Checklist
                className="mb-7"
                items={[
                  'Our 70 plus years of roofing knowledge, plus all the experience of installing thousands of RV roofs',
                  'A PDF installation guide and a suite of installation videos to help you succeed with your project',
                  "You won't find Crazy Seal in stores. We manufacture and ship directly to you, and make it easy to figure out how much product you'll need",
                  'Backed by a 50 year warranty that you can register right here on our website',
                  "Not just for RV's: designed for small projects on virtually any flat surface. If you have a small project, there's a pretty good chance Crazy Seal will work",
                ]}
              />
              <div className="flex flex-wrap gap-3">
                <LinkButton href="/installation" variant="primary" size="md">
                  See Installation Guides
                  <ArrowRight className="w-4 h-4" />
                </LinkButton>
                <LinkButton href="/warranty" variant="outline" size="md" className="border-primary/30 text-primary">
                  Learn About Our Warranty
                </LinkButton>
              </div>
            </div>
          </div>
        </div>
      </Container>

      {/* ─── KNOWING WHO YOU ARE DEALING WITH ─── */}
      <Container size="xl" className="sm:pt-4 md:pt-8">
        <div className={SECTION_NAVY}>
          <div className="grid grid-cols-1 md:grid-cols-[2fr_1fr] gap-8 lg:gap-14 items-center">
            <div className="relative">
              <Quote aria-hidden="true" className="absolute -left-2 -top-4 h-16 w-16 rotate-180 text-white/[0.06]" />
              <SectionHeading
                eyebrow="Buy With Confidence"
                heading="It's All About Knowing Who You Are Dealing With"
                align="left"
                variant="dark"
                className="mb-4"
              />
              <p className="text-white/80 text-base md:text-lg leading-relaxed mb-4">
                Crazy Seal is the most advanced seamless roof system ever developed.
              </p>
              <p className="text-white/70 leading-relaxed mb-4">
                You can buy with confidence, because we have a long track record in traditional roofing, own
                a successful RV roofing business, and genuinely care about delivering the best products
                available.
              </p>
              <p className="text-white/70 leading-relaxed mb-7">
                I wish all of you great success on your roof project.
              </p>
              <div className="flex items-center gap-4">
                <span aria-hidden="true" className="h-px w-10 bg-highlight" />
                <div>
                  <p className="text-white font-extrabold text-xl leading-snug font-[family-name:var(--font-display)]">
                    Lee Thaxton
                  </p>
                  <p className="text-white/60 text-sm uppercase tracking-wide">
                    President, Crazy Seal Products, Inc.
                  </p>
                </div>
              </div>
            </div>
            <div className="relative flex justify-center md:justify-end">
              <div
                aria-hidden="true"
                className="absolute inset-6 rounded-[2rem] bg-gradient-to-br from-highlight/25 via-secondary/20 to-accent/30 blur-2xl"
              />
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={`${MEDIA}/2019/09/Lee-and-Carol.jpg`}
                alt="Lee and Carol Thaxton"
                className="relative rounded-2xl shadow-2xl ring-1 ring-white/15 w-full max-w-xs h-auto rotate-2 transition-transform duration-500 hover:rotate-0"
              />
            </div>
          </div>
        </div>
      </Container>

      {/* ─── WANT TO INTERVIEW LEE ─── */}
      <Container size="xl" className="sm:pt-4 md:pt-8">
        <div className={SECTION_WHITE}>
          <SectionHeading eyebrow="Hear From the Founder" heading="Want to Interview Lee?" />
          <div className="relative max-w-3xl mx-auto">
            <div
              aria-hidden="true"
              className="absolute -inset-4 rounded-[2rem] bg-gradient-to-br from-secondary/15 via-transparent to-accent/20 blur-xl"
            />
            <div className="relative">
              <VimeoEmbed
                videoId="1060563463"
                thumbnail={`${MEDIA}/2025/03/Lee-Thaxton-Episode.jpg`}
                title="Lee Thaxton interview episode"
              />
            </div>
          </div>
        </div>
      </Container>

      {/* ─── PHOTOS & REVIEWS ─── */}
      <Container size="xl" className="sm:pt-4 md:pt-8">
        <div className={SECTION_WHITE}>
          <SectionHeading eyebrow="Crazy Reviews" heading="Photos & Reviews" />
          <Grid responsiveCols={{ mobile: 1, tablet: 2, wide: 4 }} gap="lg">
            {TESTIMONIALS.map((t) => (
              <TestimonialCard key={t.name} name={t.name} photo={t.photo} text={t.text} />
            ))}
          </Grid>
          <div className="flex justify-center pt-8 md:pt-10">
            <LinkButton href="/reviews" variant="accent" size="md">
              See More Photos & Reviews
              <ArrowRight className="w-4 h-4" />
            </LinkButton>
          </div>
        </div>
      </Container>

      {/* ─── CONTACT CTA ─── */}
      <Container size="xl" className="sm:pt-4 md:pt-8">
        <ContactCta variant="dark" />
      </Container>
    </>
  )
}
