import type { Metadata } from 'next'
import { ArrowRight, Phone } from 'lucide-react'
import { Container, LinkButton } from '@/lib/design-system'

const MEDIA = 'https://media.crazyseal.com/site-assets/wp-media'

export const metadata: Metadata = {
  title: 'Custom Orders',
  description:
    'Need assistance with a custom Crazy Seal kit? Get in touch with a specialist or get an instant quote online.',
}

const OPTIONS = [
  {
    title: 'Get in touch with a Specialist',
    desc: 'Our team of Crazy Seal specialists will help you build the perfect custom kit for your project.',
    href: '/contact',
    image: `${MEDIA}/2022/01/Crazy-Seal-Specialist-Image-768x768.png`,
    cta: 'Contact Us',
  },
  {
    title: 'Get an Instant Quote Online',
    desc: 'Answer a few quick questions about your roof and get instant pricing for your application.',
    href: '/pricing',
    image: `${MEDIA}/2022/01/Crazy-Seal-Instant-Quote-Image-768x768.png`,
    cta: 'Get an Instant Quote',
  },
]

export default function CustomOrdersPage() {
  return (
    <>
      {/* ─── HERO ─── */}
      <Container size="xl">
        <div className="relative section-bleed bg-primary overflow-hidden">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_50%,rgba(18,95,151,0.5),transparent_60%)]" />
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_80%_20%,rgba(91,164,17,0.15),transparent_40%)]" />
          <div className="relative z-10 px-5 py-10 sm:px-6 sm:py-14 lg:px-8 lg:py-16 text-center">
            <p className="text-xs font-bold uppercase tracking-[0.2em] text-accent mb-3">
              Custom Orders
            </p>
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-white tracking-tight mb-4">
              Need Assistance With a Custom Kit?
            </h1>
            <p className="text-base sm:text-lg text-white/60 max-w-2xl mx-auto leading-relaxed">
              Every roof is different. Whether your project is large,
              complicated, or just plain unusual, we&apos;ll help you put
              together exactly what you need.
            </p>
          </div>
        </div>
      </Container>

      {/* ─── TWO PATHS ─── */}
      <Container size="xl" className="sm:pt-4 md:pt-8">
        <div className="section-bleed bg-white border-y sm:border border-gray-200/80 px-5 py-6 sm:px-6 md:p-6 lg:p-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl mx-auto">
            {OPTIONS.map((option) => (
              <a
                key={option.title}
                href={option.href}
                className="group rounded-2xl border border-gray-200 bg-white overflow-hidden transition-all duration-300 hover:-translate-y-1 hover:shadow-lg"
              >
                <div className="aspect-square overflow-hidden bg-gray-50">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={option.image}
                    alt={option.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                </div>
                <div className="p-6 text-center">
                  <h2 className="text-xl font-bold text-primary mb-2">{option.title}</h2>
                  <p className="text-sm text-gray-500 leading-relaxed mb-4">{option.desc}</p>
                  <span className="inline-flex items-center gap-1 font-semibold text-accent group-hover:gap-2 transition-all">
                    {option.cta} <ArrowRight className="w-4 h-4" />
                  </span>
                </div>
              </a>
            ))}
          </div>
        </div>
      </Container>

      {/* ─── CTA ─── */}
      <Container size="xl" className="sm:pt-4 md:pt-8">
        <div className="section-bleed bg-primary overflow-hidden py-10 sm:py-16 px-5 sm:px-8 text-center">
          <p className="text-xs font-bold uppercase tracking-[0.2em] text-accent mb-4">
            Let&apos;s Get In Touch
          </p>
          <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4 tracking-tight">
            Have Any Questions? Our Crazy Seal Specialists Can Help!
          </h2>
          <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
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
