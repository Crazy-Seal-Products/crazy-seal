import type { Metadata } from 'next'
import {
  ArrowRight,
  ArrowRightLeft,
  Camera,
  ClipboardCheck,
  FileText,
  ShieldCheck,
  Download,
  Check,
  LifeBuoy,
  X,
} from 'lucide-react'
import { Container, SectionHeading, LinkButton } from '@/lib/design-system'
import { CtaSection } from '@/components/CtaSection'
import { QuoteButton } from '@/components/QuoteButton'
import { FormModalButton } from '@/components/forms/FormModalButton'
import { CountUp, GlowOrb, Stagger, StaggerItem } from '@/components/motion'
import {
  HERO_H1,
  HeroShell,
  MEDIA,
  SECTION_NAVY,
  SECTION_WHITE,
  fadeDelay,
} from '@/components/system-pages/blocks'
import { StepTimeline } from '@/components/system-pages/motion-blocks'

export const metadata: Metadata = {
  title: 'Crazy Seal Warranty',
  description:
    'The Crazy Seal Roofing System is backed by a 50 year warranty. Register your warranty, transfer an existing warranty, or file a claim.',
}

const STEPS = [
  {
    label: 'Step 1',
    title: 'Take Your Photos',
    icon: <Camera className="h-5 w-5" />,
    desc: 'Take before and after photos of your application.',
    link: { label: 'See Photo Guidelines', href: `${MEDIA}/2020/05/Photo-Guidelines.pdf` },
  },
  {
    label: 'Step 2',
    title: 'Submit the Form',
    icon: <FileText className="h-5 w-5" />,
    desc: 'Submit our simple warranty form with your before & after photos.',
    link: { label: 'Warranty Form', href: '#warranty-form' },
  },
  {
    label: 'Step 3',
    title: "You're Covered",
    icon: <ShieldCheck className="h-5 w-5" />,
    desc: 'Congratulations! Your application is covered for 50 years!',
    link: { label: 'Warranty PDF', href: `${MEDIA}/2021/04/Warranty-Certificate-2021.pdf` },
  },
]

const COMPARISON = {
  crazySeal: [
    '50 Year Warranty',
    'We Ship to You',
    'Install Anywhere',
    'No Upkeep',
  ],
  otherGuys: [
    'Pro-Rated or No Warranty',
    'You Wait for Them',
    'Specific Locations',
    'Maintenance Required',
  ],
}

const JUMP_LINKS = [
  { href: '#warranty-form', label: 'Register', icon: ClipboardCheck },
  { href: '#warranty-transfer', label: 'Transfer', icon: ArrowRightLeft },
  { href: '#warranty-claim', label: 'File a claim', icon: LifeBuoy },
]

const WARRANTY_FORMS = [
  {
    id: 'warranty-form',
    form: 'warranty-registration' as const,
    icon: ClipboardCheck,
    eyebrow: '50 years of coverage',
    title: 'Register Your Warranty',
    desc: 'Submit your registration with before & after photos and your application is covered.',
    cta: 'Register Now',
    featured: true,
  },
  {
    id: 'warranty-transfer',
    form: 'warranty-transfer' as const,
    icon: ArrowRightLeft,
    eyebrow: 'Bought a Crazy Seal roof?',
    title: 'Transfer a Warranty',
    desc: "We'll move the existing coverage into your name.",
    cta: 'Start a Transfer',
    featured: false,
  },
  {
    id: 'warranty-claim',
    form: 'warranty-claim' as const,
    icon: LifeBuoy,
    eyebrow: "We've got you covered",
    title: 'File a Claim',
    desc: "In the unlikely event something's wrong, tell us and our team will make it right.",
    cta: 'File a Claim',
    featured: false,
  },
]


export default function WarrantyPage() {
  return (
    <>
      {/* ─── HERO ─── */}
      <Container size="xl">
        <HeroShell>
          <div className="grid grid-cols-1 lg:grid-cols-[1.2fr_0.8fr] gap-10 lg:gap-12 items-center">
            <div className="text-center lg:text-left">
              <h1 className={HERO_H1} style={fadeDelay(80)}>
                Crazy Seal <span className="text-shimmer-highlight">Warranty</span>
              </h1>
              <p
                className="animate-fade-up text-base sm:text-lg text-white/70 max-w-xl mx-auto lg:mx-0 leading-relaxed mb-7"
                style={fadeDelay(160)}
              >
                The Crazy Seal Roofing System is backed by a 50 year warranty — the strongest in the
                business.
              </p>
              <div
                className="animate-fade-up flex flex-wrap items-center justify-center lg:justify-start gap-3"
                style={fadeDelay(240)}
              >
                <LinkButton href="#warranty-form" variant="accent" size="lg">
                  Register Your Warranty
                </LinkButton>
                <LinkButton
                  href={`${MEDIA}/2021/04/Warranty-Certificate-2021.pdf`}
                  variant="outline-white"
                  size="lg"
                  external
                >
                  <Download className="w-5 h-5" />
                  View Warranty PDF
                </LinkButton>
              </div>
              <nav
                aria-label="Warranty forms"
                className="animate-fade-up mt-8 flex flex-wrap justify-center lg:justify-start gap-2"
                style={fadeDelay(320)}
              >
                {JUMP_LINKS.map(({ href, label, icon: Icon }) => (
                  <a
                    key={href}
                    href={href}
                    className="group inline-flex items-center gap-2 rounded-full bg-white/10 py-1.5 pl-1.5 pr-4 text-sm font-semibold text-white/85 ring-1 ring-white/15 transition-all duration-300 hover:bg-white/15 hover:text-white hover:ring-white/30"
                  >
                    <span className="grid h-7 w-7 place-items-center rounded-full bg-accent/20 ring-1 ring-accent/40">
                      <Icon className="h-3.5 w-3.5 text-accent-light" />
                    </span>
                    {label}
                    <ArrowRight className="h-3.5 w-3.5 transition-transform duration-300 group-hover:translate-x-0.5" />
                  </a>
                ))}
              </nav>
            </div>

            {/* Badge + count-up */}
            <div className="animate-fade-up relative mx-auto w-full max-w-xs sm:max-w-sm" style={fadeDelay(200)}>
              <div aria-hidden="true" className="absolute inset-6 rounded-full bg-highlight/25 blur-3xl" />
              <div
                aria-hidden="true"
                className="absolute inset-0 rounded-full border border-dashed border-white/20 animate-spin-slow"
              />
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={`${MEDIA}/2019/06/50-Year-Warranty-Space-600x600.png`}
                alt="Crazy Seal 50 year warranty badge"
                className="relative w-full h-auto p-6 animate-float-slow drop-shadow-[0_24px_40px_rgba(0,0,0,0.4)]"
              />
              <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 sm:left-auto sm:-right-2 sm:translate-x-0 flex items-center gap-3 rounded-2xl bg-white px-4 py-3 shadow-2xl ring-1 ring-primary/10 animate-float">
                <span className="grid h-10 w-10 place-items-center rounded-xl bg-gradient-to-br from-accent-light to-accent-dark text-white shadow-glow-accent">
                  <ShieldCheck className="h-5 w-5" />
                </span>
                <div className="text-left leading-tight whitespace-nowrap">
                  <p className="text-lg font-extrabold text-primary font-[family-name:var(--font-display)]">
                    <CountUp value={50} duration={2} /> Years
                  </p>
                  <p className="text-xs font-medium text-gray-500">Of coverage</p>
                </div>
              </div>
            </div>
          </div>
        </HeroShell>
      </Container>

      {/* ─── HOW TO RECEIVE ─── */}
      <Container size="xl" className="sm:pt-4 md:pt-8">
        <div className={SECTION_WHITE}>
          <SectionHeading
            eyebrow="Simple as 1-2-3"
            heading="How to Receive Your Warranty"
            subheading="Three simple steps to 50 years of coverage."
          />
          <StepTimeline steps={STEPS} className="max-w-5xl mx-auto" />
        </div>
      </Container>

      {/* ─── WARRANTY FORMS (each opens in a pop-up) ─── */}
      <Container size="xl" className="sm:pt-4 md:pt-8">
        <div className={SECTION_WHITE}>
          <SectionHeading
            eyebrow="Warranty Forms"
            heading="Register, Transfer or File a Claim"
            subheading="Each form opens right here and takes just a few minutes."
          />
          <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
            {WARRANTY_FORMS.map((f) => (
              <div
                key={f.id}
                id={f.id}
                className={`group relative flex scroll-mt-24 flex-col overflow-hidden rounded-3xl p-6 ring-1 transition-all duration-500 hover:-translate-y-1.5 hover:shadow-xl ${
                  f.featured
                    ? 'bg-gradient-to-br from-primary via-primary to-secondary text-white ring-white/10 shadow-xl'
                    : 'bg-gradient-to-b from-slate-50 to-white text-primary ring-primary/[0.08] shadow-sm'
                }`}
              >
                {f.featured && (
                  <div aria-hidden="true" className="pointer-events-none absolute -right-12 -top-16 h-44 w-44 rounded-full bg-accent/30 blur-3xl" />
                )}
                <span
                  className={`relative grid h-12 w-12 place-items-center rounded-xl transition-transform duration-500 group-hover:-rotate-6 ${
                    f.featured
                      ? 'bg-highlight text-primary shadow-glow-highlight'
                      : 'bg-gradient-to-br from-accent-light to-accent-dark text-white shadow-glow-accent'
                  }`}
                >
                  <f.icon className="h-5 w-5" />
                </span>
                <p className={`relative mt-4 text-[11px] font-bold uppercase tracking-[0.18em] ${f.featured ? 'text-highlight' : 'text-accent-dark'}`}>
                  {f.eyebrow}
                </p>
                <h3 className="relative mt-1 text-xl font-extrabold">{f.title}</h3>
                <p className={`relative mt-1.5 flex-1 text-sm leading-relaxed ${f.featured ? 'text-white/75' : 'text-gray-600'}`}>
                  {f.desc}
                </p>
                <div className="relative mt-5">
                  <FormModalButton
                    form={f.form}
                    openOnHash={f.id}
                    variant={f.featured ? 'accent' : 'primary'}
                    size="md"
                    className="w-full"
                  >
                    {f.cta}
                    <ArrowRight className="h-4 w-4" />
                  </FormModalButton>
                </div>
              </div>
            ))}
          </div>
          <a
            href={`${MEDIA}/2020/05/Photo-Guidelines.pdf`}
            target="_blank"
            rel="noopener noreferrer"
            className="group/link mx-auto mt-6 flex w-fit items-center gap-3 rounded-2xl bg-white p-2.5 pr-5 text-left shadow-sm ring-1 ring-primary/[0.08] transition-all duration-300 hover:-translate-y-0.5 hover:shadow-md hover:ring-accent/40"
          >
            <span className="grid h-9 w-9 place-items-center rounded-xl bg-accent/15 text-accent-dark">
              <Camera className="h-4 w-4" />
            </span>
            <span>
              <span className="block text-sm font-extrabold text-primary">Photo Guidelines</span>
              <span className="block text-xs text-gray-500">How to shoot your before &amp; after photos</span>
            </span>
            <Download className="h-4 w-4 text-accent-dark transition-transform duration-300 group-hover/link:translate-y-0.5" />
          </a>
        </div>
      </Container>

      {/* ─── COMPARISON ─── */}
      <Container size="xl" className="sm:pt-4 md:pt-8">
        <div className={SECTION_NAVY}>
          <SectionHeading
            eyebrow="Side by Side"
            heading="How the Crazy Seal Warranty Compares"
            variant="dark"
          />
          <div className="relative grid grid-cols-1 md:grid-cols-2 gap-4 lg:gap-8 max-w-4xl mx-auto">
            <div className="relative rounded-3xl bg-white p-6 lg:p-8 shadow-2xl ring-1 ring-white/20">
              <div aria-hidden="true" className="pointer-events-none absolute -top-10 right-6 h-24 w-24 rounded-full bg-accent/25 blur-2xl" />
              <h3 className="relative mb-5 flex items-center justify-center gap-2 text-xl font-extrabold text-primary">
                <ShieldCheck className="h-6 w-6 text-accent" />
                Crazy Seal
              </h3>
              <Stagger className="relative space-y-3" stagger={0.1}>
                {COMPARISON.crazySeal.map((item) => (
                  <StaggerItem key={item} className="flex items-center gap-3 rounded-xl bg-accent/[0.07] px-3 py-2.5">
                    <span className="grid h-7 w-7 shrink-0 place-items-center rounded-full bg-gradient-to-br from-accent-light to-accent-dark text-white shadow-glow-accent">
                      <Check className="h-4 w-4" strokeWidth={3} />
                    </span>
                    <span className="font-bold text-primary">{item}</span>
                  </StaggerItem>
                ))}
              </Stagger>
            </div>
            <div className="rounded-3xl bg-white/[0.05] p-6 lg:p-8 ring-1 ring-white/10">
              <h3 className="mb-5 text-center text-xl font-extrabold text-white/60">The Other Guys</h3>
              <ul className="space-y-3">
                {COMPARISON.otherGuys.map((item) => (
                  <li key={item} className="flex items-center gap-3 rounded-xl px-3 py-2.5">
                    <span className="grid h-7 w-7 shrink-0 place-items-center rounded-full bg-white/10 ring-1 ring-white/15">
                      <X className="h-4 w-4 text-white/50" strokeWidth={3} />
                    </span>
                    <span className="font-semibold text-white/55">{item}</span>
                  </li>
                ))}
              </ul>
            </div>
            <span
              aria-hidden="true"
              className="absolute left-1/2 top-1/2 hidden h-12 w-12 -translate-x-1/2 -translate-y-1/2 place-items-center rounded-full bg-highlight text-sm font-black text-primary shadow-glow-highlight md:grid"
            >
              VS
            </span>
          </div>
        </div>
      </Container>

      {/* ─── WARM TRAFFIC CTA ─── */}
      <Container size="xl" className="sm:pt-4 md:pt-8">
        <div className={`relative ${SECTION_NAVY} text-center`}>
          <GlowOrb className="-left-24 -top-24 h-72 w-72" color="rgb(26 123 196 / 0.45)" />
          <GlowOrb className="-right-20 -bottom-28 h-80 w-80" color="rgb(91 164 17 / 0.25)" />
          <div className="relative z-10 py-4 md:py-6">
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-white tracking-tight mb-3 text-balance max-w-3xl mx-auto">
              Planning Another Roof — or Want to Install Crazy Seal for Others?
            </h2>
            <p className="text-white/70 text-base sm:text-lg mb-7 max-w-xl mx-auto">
              You already know the system. Talk to a specialist about your next project, or join the
              dealer network and get paid to install it.
            </p>
            <div className="flex flex-wrap items-center justify-center gap-3">
              <QuoteButton size="lg" sourcePage="warranty" />
              <LinkButton href="/professionals" variant="outline-white" size="lg">
                Become a Dealer
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
