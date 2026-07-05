import type { Metadata } from 'next'
import { ArrowRight, Phone } from 'lucide-react'
import {
  Container,
  Grid,
  SectionHeading,
  TestimonialCard,
  LinkButton,
} from '@/lib/design-system'

const MEDIA = 'https://media.crazyseal.com/site-assets/wp-media'

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
        <div className="relative section-bleed bg-primary overflow-hidden">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_50%,rgba(18,95,151,0.5),transparent_60%)]" />
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_80%_20%,rgba(91,164,17,0.15),transparent_40%)]" />
          <div className="relative z-10 px-5 py-8 sm:px-6 sm:py-12 lg:px-8 lg:py-14">
            <div className="grid grid-cols-1 md:grid-cols-[3fr_1fr] gap-6 items-center">
              <div className="text-center md:text-left">
                <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-white tracking-tight mb-2">
                  Installation Instructions
                </h1>
                <p className="text-lg sm:text-xl text-highlight font-semibold uppercase tracking-wide mb-4">
                  A Brain & A Brush
                </p>
                <p className="text-white/70 leading-relaxed max-w-2xl">
                  Wondering if you (or your friends or brother-in-law or
                  husband or wife or kids) will be able to apply Crazy Seal to
                  your application? Our comprehensive step-by-step
                  instructions, including detailed videos and PDFs, show you
                  exactly how to get the job done! Crazy Curtis says, &ldquo;As
                  long as you have a brain and a brush, you will be able to
                  apply our Crazy Seal system to your application.&rdquo;
                </p>
              </div>
              <div className="flex justify-center md:justify-end">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={`${MEDIA}/2019/05/SEAL-with-Hat-and-Brush.png`}
                  alt="Crazy Seal mascot with a hat and brush"
                  className="h-40 sm:h-48 lg:h-56 w-auto"
                />
              </div>
            </div>
          </div>
        </div>
      </Container>

      {/* ─── INSTALLATION TYPES ─── */}
      <Container size="xl" className="sm:pt-4 md:pt-8">
        <div className="section-bleed bg-white border-y sm:border border-gray-200/80 px-5 py-6 sm:px-6 md:p-6 lg:p-8">
          <SectionHeading heading="Click an Installation Type to Get Started" />
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl mx-auto">
            {INSTALLATION_TYPES.map((type) => (
              <a
                key={type.title}
                href={type.href}
                className="group rounded-2xl border border-gray-200 bg-white overflow-hidden transition-all duration-300 hover:-translate-y-1 hover:shadow-lg"
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={type.image}
                  alt={`${type.title} installation`}
                  className="w-full h-auto object-cover"
                />
                <div className="p-6 text-center">
                  <h3 className="text-xl font-bold text-primary mb-2">{type.title}</h3>
                  <p className="text-sm text-gray-500 leading-relaxed mb-4">{type.desc}</p>
                  <span className="inline-flex items-center gap-1 font-semibold text-accent group-hover:gap-2 transition-all">
                    See Installation Videos & PDF&apos;s
                    <ArrowRight className="w-4 h-4" />
                  </span>
                </div>
              </a>
            ))}
          </div>
        </div>
      </Container>

      {/* ─── PHOTOS & REVIEWS ─── */}
      <Container size="xl" className="sm:pt-4 md:pt-8">
        <div className="section-bleed bg-white border-y sm:border border-gray-200/80 px-5 py-6 sm:px-6 md:p-6 lg:p-8">
          <SectionHeading heading="Photos & Reviews" />
          <Grid responsiveCols={{ mobile: 1, tablet: 3 }} gap="lg">
            {TESTIMONIALS.map((t) => (
              <TestimonialCard
                key={t.name}
                name={t.name}
                photo={t.photo}
                text={t.text}
              />
            ))}
          </Grid>
          <div className="flex justify-center pt-6 md:pt-10">
            <LinkButton href="/reviews" variant="accent" size="md">
              See More Photos & Reviews
              <ArrowRight className="w-4 h-4" />
            </LinkButton>
          </div>
        </div>
      </Container>

      {/* ─── CONTACT CTA ─── */}
      <Container size="xl" className="sm:pt-4 md:pt-8">
        <div className="section-bleed bg-primary overflow-hidden px-5 py-10 sm:px-6 md:p-10 lg:p-14 text-center">
          <h2 className="text-3xl sm:text-4xl font-bold text-white tracking-tight mb-3">
            Let&apos;s Get in Touch
          </h2>
          <p className="text-white/70 text-base sm:text-lg mb-6 max-w-xl mx-auto">
            Have any questions? Our Crazy Seal specialists can help!
          </p>
          <div className="flex flex-wrap items-center justify-center gap-3">
            <LinkButton href="/contact" variant="accent" size="lg">
              Contact Us
            </LinkButton>
            <LinkButton href="/pricing" variant="white" size="lg">
              Get an Instant Quote
            </LinkButton>
            <a
              href="tel:8009630131"
              className="flex items-center gap-2 text-white/80 hover:text-white font-semibold transition-colors"
            >
              <Phone className="w-5 h-5" />
              (800) 963-0131
            </a>
          </div>
        </div>
      </Container>
    </>
  )
}
