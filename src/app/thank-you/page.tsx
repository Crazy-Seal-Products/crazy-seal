import type { Metadata } from 'next'
import Link from 'next/link'
import { Phone, ArrowRight, Calculator, PlayCircle, BadgeDollarSign, Wrench } from 'lucide-react'
import { Container } from '@/lib/design-system'
import { GlowOrb } from '@/components/motion'
import { SuccessCheck } from '@/components/forms/form-ui'
import { ThankYouConversion } from './ThankYouConversion'

export const metadata: Metadata = {
  title: 'Thank You',
  description: 'Thank you for contacting Crazy Seal. We will be in touch within 24 hours.',
}

const NEXT_STEPS = {
  quote: [
    {
      href: '/kit-builder',
      icon: Calculator,
      title: 'Build Your Kit',
      desc: 'Get a feel for kit sizes and cost while you wait.',
    },
    {
      href: '/installation',
      icon: PlayCircle,
      title: 'Preview the Install',
      desc: 'Watch how easy it is to put down a seamless roof.',
    },
  ],
  business: [
    {
      href: '/ways-to-earn',
      icon: BadgeDollarSign,
      title: 'Ways to Earn',
      desc: 'See how dealers make money installing Crazy Seal.',
    },
    {
      href: '/business-accelerator-program',
      icon: Wrench,
      title: 'Business Accelerator',
      desc: 'Browse the resources we give our partners.',
    },
  ],
}

export default async function ThankYouPage({
  searchParams,
}: {
  searchParams: Promise<{ type?: string }>
}) {
  const { type } = await searchParams
  const isBusiness = type === 'business'
  const steps = isBusiness ? NEXT_STEPS.business : NEXT_STEPS.quote

  return (
    <Container size="md" className="pt-4 sm:pt-0">
      <ThankYouConversion />
      <div className="relative overflow-hidden rounded-[1.75rem] bg-white shadow-card ring-1 ring-primary/[0.07]">
        {/* Celebration band */}
        <div className="relative overflow-hidden bg-primary px-6 py-10 text-center md:px-12 md:py-14">
          <div
            aria-hidden="true"
            className="absolute inset-0 bg-[radial-gradient(110%_80%_at_0%_0%,rgb(26_123_196/0.45),transparent_55%),radial-gradient(80%_70%_at_100%_100%,rgb(91_164_17/0.22),transparent_60%)]"
          />
          <GlowOrb className="-right-20 -top-20 h-72 w-72" color="rgb(26 123 196 / 0.4)" />
          <div
            aria-hidden="true"
            className="hairline-grid pointer-events-none absolute inset-0 opacity-50 [mask-image:radial-gradient(ellipse_at_center,black,transparent_75%)]"
          />
          <div className="relative flex flex-col items-center">
            <div className="mb-6">
              <SuccessCheck />
            </div>
            <h1
              className="animate-fade-up mb-4 text-3xl font-extrabold tracking-tight text-white sm:text-4xl lg:text-5xl"
              style={{ animationDelay: '200ms' }}
            >
              <span className="text-shimmer-highlight">Thank You!</span>
            </h1>
            <p
              className="animate-fade-up mx-auto max-w-lg text-base leading-relaxed text-white/75 sm:text-lg"
              style={{ animationDelay: '300ms' }}
            >
              {isBusiness
                ? "We've received your inquiry! A member of our team will reach out within 24 hours to talk about the dealer program and how we can grow your business together."
                : "We've received your request! A Crazy Seal specialist will reach out within 24 hours to help build the perfect kit for your roof."}
            </p>
          </div>
        </div>

        <div className="flex flex-col items-center px-6 py-8 md:px-12 md:py-10">
          <a
            href="tel:8009630131"
            className="group animate-fade-up flex w-full max-w-sm items-center gap-4 rounded-2xl bg-gradient-to-r from-primary/[0.04] via-white to-accent/[0.06] px-5 py-4 text-left ring-1 ring-primary/10 transition-all duration-300 hover:-translate-y-0.5 hover:shadow-lg"
            style={{ animationDelay: '400ms' }}
          >
            <span className="grid h-11 w-11 flex-shrink-0 place-items-center rounded-xl bg-gradient-to-br from-primary-light to-primary text-white shadow-glow-primary transition-transform duration-500 group-hover:-rotate-6">
              <Phone className="h-5 w-5" />
            </span>
            <span>
              <span className="block text-sm text-gray-500">Need to talk sooner?</span>
              <span className="block text-lg font-extrabold text-primary">(800) 963-0131</span>
            </span>
          </a>

          {/* Next steps while you wait */}
          <p className="mt-8 mb-3 text-[11px] font-bold uppercase tracking-[0.18em] text-gray-400">
            While you wait
          </p>
          <div className="grid w-full max-w-lg grid-cols-1 gap-4 sm:grid-cols-2">
            {steps.map((step, i) => (
              <Link
                key={step.href}
                href={step.href}
                className="group animate-fade-up rounded-3xl bg-gradient-to-b from-slate-50 to-white p-5 text-left shadow-sm ring-1 ring-primary/[0.08] transition-all duration-500 hover:-translate-y-1.5 hover:shadow-xl"
                style={{ animationDelay: `${500 + i * 100}ms` }}
              >
                <span className="mb-3 grid h-11 w-11 place-items-center rounded-xl bg-gradient-to-br from-accent-light to-accent-dark text-white shadow-glow-accent transition-transform duration-500 group-hover:-rotate-6">
                  <step.icon className="h-5 w-5" />
                </span>
                <p className="mb-1 flex items-center gap-1 font-bold text-primary">
                  {step.title}
                  <ArrowRight className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-1" />
                </p>
                <p className="text-sm leading-relaxed text-gray-500">{step.desc}</p>
              </Link>
            ))}
          </div>

          <div className="flex justify-center pt-8">
            <Link
              href="/"
              className="group flex items-center gap-2 text-sm font-semibold text-gray-600 transition-colors hover:text-primary"
            >
              Back to Home
              <ArrowRight className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-1" />
            </Link>
          </div>
        </div>
      </div>
    </Container>
  )
}
