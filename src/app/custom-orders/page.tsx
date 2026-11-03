import type { Metadata } from 'next'
import { ArrowRight, ArrowUpRight, Calculator, Headset } from 'lucide-react'
import { Container } from '@/lib/design-system'
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
  title: 'Custom Orders',
  description:
    'Need assistance with a custom Crazy Seal kit? Get in touch with a specialist or build your kit online.',
}

const OPTIONS = [
  {
    title: 'Get in touch with a Specialist',
    desc: 'Our team of Crazy Seal specialists will help you build the perfect custom kit for your project.',
    href: '/contact',
    image: `${MEDIA}/2022/01/Crazy-Seal-Specialist-Image-768x768.png`,
    cta: 'Contact Us',
    tag: 'Option 1',
  },
  {
    title: 'Build My Kit Online',
    desc: 'Answer a few quick questions about your roof and get instant pricing for your application.',
    href: '/kit-builder',
    image: `${MEDIA}/2022/01/Crazy-Seal-Instant-Quote-Image-768x768.png`,
    cta: 'Build My Kit',
    tag: 'Option 2',
  },
]

export default function CustomOrdersPage() {
  return (
    <>
      {/* ─── HERO ─── */}
      <Container size="xl">
        <HeroShell innerClassName="text-center">
          <h1 className={HERO_H1} style={fadeDelay(80)}>
            Need Assistance With a <span className="text-shimmer-highlight">Custom Kit?</span>
          </h1>
          <p
            className="animate-fade-up text-base sm:text-lg text-white/70 max-w-2xl mx-auto leading-relaxed"
            style={fadeDelay(160)}
          >
            Every roof is different. Whether your project is large, complicated, or just plain unusual,
            we&apos;ll help you put together exactly what you need.
          </p>
          <HeroChips
            delay={260}
            className="mt-7 justify-center"
            items={[
              { icon: Headset, label: 'Work with a specialist' },
              { icon: Calculator, label: 'Or get instant pricing online' },
            ]}
          />
        </HeroShell>
      </Container>

      {/* ─── TWO PATHS ─── */}
      <Container size="xl" className="sm:pt-4 md:pt-8">
        <div className={SECTION_WHITE}>
          <div className="relative grid grid-cols-1 md:grid-cols-2 gap-4 lg:gap-8 max-w-4xl mx-auto">
            {OPTIONS.map((option) => (
              <a
                key={option.title}
                href={option.href}
                className={`group relative flex flex-col overflow-hidden ${LIGHT_CARD}`}
              >
                <div className="relative aspect-[4/3] overflow-hidden bg-gradient-to-br from-slate-50 via-white to-accent/10">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={option.image}
                    alt={option.title}
                    className="h-full w-full object-contain p-4 transition-transform duration-700 ease-out group-hover:scale-[1.06]"
                  />
                  <span className="absolute left-4 top-4 rounded-full bg-highlight px-3 py-1 text-[10px] font-extrabold uppercase tracking-wider text-primary shadow-sm">
                    {option.tag}
                  </span>
                </div>
                <div className="flex flex-1 items-end justify-between gap-4 p-5 md:p-6">
                  <div>
                    <h2 className="text-xl md:text-2xl font-extrabold text-primary mb-1.5">{option.title}</h2>
                    <p className="text-sm text-gray-500 leading-relaxed mb-4">{option.desc}</p>
                    <span className="inline-flex items-center gap-1 text-sm font-bold text-accent-dark">
                      {option.cta}
                      <ArrowRight className="w-4 h-4 transition-transform duration-300 group-hover:translate-x-1" />
                    </span>
                  </div>
                  <span className="hidden sm:grid h-12 w-12 shrink-0 place-items-center rounded-full bg-primary/[0.06] text-primary transition-all duration-300 group-hover:bg-accent group-hover:text-white group-hover:rotate-45">
                    <ArrowUpRight className="h-5 w-5" />
                  </span>
                </div>
              </a>
            ))}
            <span
              aria-hidden="true"
              className="absolute left-1/2 top-[38%] hidden h-12 w-12 -translate-x-1/2 -translate-y-1/2 place-items-center rounded-full bg-primary text-sm font-extrabold uppercase text-white shadow-glow-primary ring-4 ring-white md:grid"
            >
              or
            </span>
          </div>
        </div>
      </Container>

      {/* ─── CTA ─── */}
      <Container size="xl" className="sm:pt-4 md:pt-8">
        <ContactCta variant="dark" />
      </Container>
    </>
  )
}
