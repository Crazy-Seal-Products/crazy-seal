import type { Metadata } from 'next'
import { ArrowRight, ArrowUpRight, FileText, PlayCircle, Quote } from 'lucide-react'
import {
  Container,
  Grid,
  SectionHeading,
  TestimonialCard,
  LinkButton,
} from '@/lib/design-system'
import {
  ContactCta,
  HERO_H1,
  HeroChips,
  HeroShell,
  LIGHT_CARD,
  MEDIA,
  SECTION_WHITE,
  fadeDelay,
} from '@/components/system-pages/blocks'

export const metadata: Metadata = {
  title: 'Crazy Seal Installation',
  description: 'Learn how to fully install your new Crazy Seal Roofing System.',
}

const INSTALLATION_TYPES = [
  {
    title: 'Membrane Roof',
    desc: 'Installing over an existing rubber, EPDM, TPO, fiberglass, or metal membrane.',
    href: '/installation/membrane-roof',
    image: `${MEDIA}/2020/02/Over-Membrane-For-Installation-Page.jpg`,
  },
  {
    title: 'Direct to Deck',
    desc: 'Installing directly over wood decking with no existing roof membrane.',
    href: '/installation/direct-to-deck',
    image: `${MEDIA}/2020/02/D2D-For-Installation-Page.jpg`,
  },
]

const TESTIMONIALS = [
  {
    name: 'David Vincent, Key Largo, FL',
    text: 'Thank you for a great and reassuring experience! I have already referred this system to 3 family and friends.',
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

export default function InstallationPage() {
  return (
    <>
      {/* ─── HERO ─── */}
      <Container size="xl">
        <HeroShell>
          <div className="grid grid-cols-1 md:grid-cols-[3fr_1fr] gap-8 items-center">
            <div className="text-center md:text-left">
              <h1 className={HERO_H1} style={fadeDelay(80)}>
                Installation Instructions
              </h1>
              <p
                className="animate-fade-up text-xl sm:text-2xl font-extrabold uppercase tracking-wide mb-5 font-[family-name:var(--font-display)]"
                style={fadeDelay(140)}
              >
                <span className="text-shimmer-highlight">A Brain &amp; A Brush</span>
              </p>
              <p
                className="animate-fade-up text-white/70 text-base sm:text-lg leading-relaxed max-w-2xl mx-auto md:mx-0 mb-6"
                style={fadeDelay(200)}
              >
                Wondering if you (or your friends or brother-in-law or husband or wife or kids) will be able
                to apply Crazy Seal? Our step-by-step instructions, including detailed videos and PDFs, show
                you exactly how to get the job done!
              </p>
              <figure
                className="animate-fade-up relative mx-auto md:mx-0 max-w-2xl rounded-2xl bg-white/[0.07] p-5 pl-14 text-left ring-1 ring-white/15 backdrop-blur-sm"
                style={fadeDelay(280)}
              >
                <Quote aria-hidden="true" className="absolute left-4 top-5 h-6 w-6 rotate-180 text-highlight" />
                <blockquote className="text-white/90 font-semibold leading-relaxed">
                  &ldquo;As long as you have a brain and a brush, you will be able to apply our Crazy Seal
                  system to your application.&rdquo;
                </blockquote>
                <figcaption className="mt-2 text-xs font-bold uppercase tracking-[0.18em] text-white/60">
                  Crazy Curtis
                </figcaption>
              </figure>
              <HeroChips
                delay={360}
                className="mt-6 justify-center md:justify-start"
                items={[
                  { icon: PlayCircle, label: 'Detailed videos' },
                  { icon: FileText, label: 'Downloadable PDFs' },
                ]}
              />
            </div>
            <div className="animate-fade-up relative flex justify-center md:justify-end" style={fadeDelay(200)}>
              <div aria-hidden="true" className="absolute inset-6 rounded-full bg-highlight/25 blur-3xl" />
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={`${MEDIA}/2019/05/SEAL-with-Hat-and-Brush.png`}
                alt="Crazy Seal mascot with a hat and brush"
                className="relative h-44 sm:h-56 lg:h-72 w-auto animate-float drop-shadow-[0_24px_30px_rgba(0,0,0,0.4)]"
              />
            </div>
          </div>
        </HeroShell>
      </Container>

      {/* ─── INSTALLATION TYPES ─── */}
      <Container size="xl" className="sm:pt-4 md:pt-8">
        <div className={SECTION_WHITE}>
          <SectionHeading eyebrow="Choose Your Roof" heading="Click an Installation Type to Get Started" />
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 lg:gap-6 max-w-5xl mx-auto">
            {INSTALLATION_TYPES.map((type, i) => (
              <a key={type.title} href={type.href} className={`group relative flex flex-col overflow-hidden ${LIGHT_CARD}`}>
                <div className="relative overflow-hidden">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={type.image}
                    alt={`${type.title} installation`}
                    className="w-full h-auto object-cover transition-transform duration-700 ease-out group-hover:scale-[1.06]"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-primary/50 via-transparent to-transparent" />
                  <span className="absolute left-4 top-4 grid h-11 w-11 place-items-center rounded-xl bg-gradient-to-br from-accent-light to-accent-dark text-base font-extrabold text-white shadow-glow-accent font-[family-name:var(--font-display)]">
                    0{i + 1}
                  </span>
                </div>
                <div className="flex flex-1 items-center justify-between gap-4 p-5 md:p-6">
                  <div>
                    <h3 className="text-xl md:text-2xl font-extrabold text-primary">{type.title}</h3>
                    <p className="mt-1 text-sm text-gray-500 leading-relaxed">{type.desc}</p>
                    <span className="mt-3 inline-flex items-center gap-1 text-sm font-bold text-accent-dark">
                      See Installation Videos &amp; PDF&apos;s
                      <ArrowRight className="w-4 h-4 transition-transform duration-300 group-hover:translate-x-1" />
                    </span>
                  </div>
                  <span className="hidden sm:grid h-12 w-12 shrink-0 place-items-center rounded-full bg-primary/[0.06] text-primary transition-all duration-300 group-hover:bg-accent group-hover:text-white group-hover:rotate-45">
                    <ArrowUpRight className="h-5 w-5" />
                  </span>
                </div>
              </a>
            ))}
          </div>
        </div>
      </Container>

      {/* ─── PHOTOS & REVIEWS ─── */}
      <Container size="xl" className="sm:pt-4 md:pt-8">
        <div className={SECTION_WHITE}>
          <SectionHeading eyebrow="Crazy Reviews" heading="Photos & Reviews" />
          <Grid responsiveCols={{ mobile: 1, tablet: 3 }} gap="lg">
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
