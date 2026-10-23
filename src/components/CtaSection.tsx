import Link from 'next/link'
import { ArrowRight, Phone, ShieldCheck } from 'lucide-react'
import { QuoteButton } from '@/components/QuoteButton'

export function CtaSection() {
  return (
    <section className="relative section-bleed overflow-hidden bg-gradient-to-r from-primary-dark via-primary to-secondary px-5 py-7 sm:px-8 md:py-8 lg:px-12 sm:shadow-[0_24px_48px_-28px_rgb(0_32_67/0.6)]">
      {/* Gold rule, gold + green glows, faint grid */}
      <div aria-hidden="true" className="pointer-events-none absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-transparent via-highlight to-transparent" />
      <div aria-hidden="true" className="pointer-events-none absolute -left-16 -top-24 h-56 w-56 rounded-full bg-highlight/20 blur-3xl" />
      <div aria-hidden="true" className="pointer-events-none absolute -bottom-24 right-10 h-56 w-56 rounded-full bg-accent/25 blur-3xl" />
      <div aria-hidden="true" className="hairline-grid pointer-events-none absolute inset-0 opacity-30 [mask-image:linear-gradient(to_right,transparent,black_30%,black_70%,transparent)]" />

      <div className="relative z-10 flex flex-col items-center gap-5 text-center lg:flex-row lg:justify-between lg:gap-10 lg:text-left">
        <div className="flex flex-col items-center gap-4 sm:flex-row lg:items-center">
          <span className="grid h-12 w-12 shrink-0 place-items-center rounded-2xl bg-gradient-to-br from-highlight-light to-highlight text-primary shadow-glow-highlight">
            <ShieldCheck className="h-6 w-6" />
          </span>
          <div>
            <h2 className="text-2xl font-extrabold tracking-tight text-white sm:text-3xl">
              Do It Once. <span className="text-shimmer-highlight">Do It Right.</span>
            </h2>
            <p className="mt-1 text-sm text-white/70 sm:text-base">
              A specialist builds the right kit for your roof — shipped to your door.
            </p>
          </div>
        </div>

        <div className="flex flex-col items-center gap-2 lg:items-end">
          <div className="flex flex-wrap items-center justify-center gap-3">
            <QuoteButton
              sourcePage="cta-section"
              className="btn-sheen inline-flex items-center justify-center gap-2 rounded-full bg-gradient-to-b from-highlight-light to-highlight px-5 py-2.5 text-sm font-bold text-primary shadow-[0_10px_24px_-10px_rgb(199_186_22/0.8)] transition-all duration-300 hover:-translate-y-0.5 hover:shadow-[0_14px_28px_-10px_rgb(199_186_22/0.9)] active:scale-[0.98] cursor-pointer sm:text-base"
            >
              Talk to a Specialist
            </QuoteButton>
            <a
              href="tel:8009630131"
              className="inline-flex items-center gap-2 rounded-full border border-white/25 bg-white/10 px-5 py-2.5 text-sm font-semibold text-white transition-all hover:-translate-y-0.5 hover:bg-white/15 sm:text-base"
            >
              <Phone className="h-4 w-4 text-accent-light" />
              (800) 963-0131
            </a>
          </div>
          <Link
            href="/kit-builder"
            className="group inline-flex items-center gap-1 text-xs font-semibold text-white/65 transition-colors hover:text-highlight sm:text-sm"
          >
            Or build your kit online
            <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5" />
          </Link>
        </div>
      </div>
    </section>
  )
}
