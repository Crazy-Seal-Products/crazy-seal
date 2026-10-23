import Link from 'next/link'
import { Phone, ShieldCheck } from 'lucide-react'
import { QuoteButton } from '@/components/QuoteButton'

export function CtaSection() {
  return (
    <section className="relative section-bleed overflow-hidden bg-gradient-to-br from-[#FFF3A6] via-[#F7D51D] to-[#E3AE0C] py-12 sm:py-16 md:py-20 px-5 sm:px-8 md:px-12 sm:shadow-[0_30px_60px_-30px_rgb(199_150_10/0.65)]">
      {/* Warm light + texture */}
      <div aria-hidden="true" className="pointer-events-none absolute -left-24 -top-28 h-80 w-80 rounded-full bg-white/50 blur-3xl" />
      <div aria-hidden="true" className="pointer-events-none absolute -bottom-32 -right-24 h-96 w-96 rounded-full bg-accent/25 blur-3xl" />
      <div aria-hidden="true" className="pointer-events-none absolute inset-0 opacity-50 [background-image:radial-gradient(rgb(0_51_101/0.08)_1px,transparent_1.4px)] [background-size:22px_22px] [mask-image:radial-gradient(ellipse_at_center,black,transparent_75%)]" />
      <div aria-hidden="true" className="pointer-events-none absolute left-1/2 top-1/2 h-[34rem] w-[34rem] -translate-x-1/2 -translate-y-1/2 rounded-full border border-primary/10" />
      <div aria-hidden="true" className="pointer-events-none absolute left-1/2 top-1/2 h-[24rem] w-[24rem] -translate-x-1/2 -translate-y-1/2 rounded-full border border-white/50" />
      {/* Navy-to-green rule across the top */}
      <div aria-hidden="true" className="pointer-events-none absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-transparent via-primary/70 to-transparent" />

      <div className="relative z-10 max-w-2xl mx-auto text-center">
        <span className="mx-auto mb-5 grid h-14 w-14 place-items-center rounded-2xl bg-gradient-to-br from-primary-light to-primary text-highlight shadow-glow-primary">
          <ShieldCheck className="h-7 w-7" />
        </span>
        <h2 className="text-3xl sm:text-4xl md:text-5xl font-extrabold text-primary mb-4 tracking-tight text-balance">
          Do It Once.{' '}
          <span className="bg-gradient-to-r from-accent-dark to-accent bg-clip-text text-transparent">Do It Right.</span>
        </h2>
        <p className="text-primary/80 text-base sm:text-lg mb-7 md:mb-9 leading-relaxed">
          A Crazy Seal specialist builds the right kit for your roof — then we ship it to your door.
        </p>
        <div className="flex flex-row flex-wrap items-center justify-center gap-3">
          <QuoteButton
            sourcePage="cta-section"
            className="btn-sheen inline-flex items-center justify-center gap-2 rounded-full bg-gradient-to-b from-primary-light to-primary px-6 py-3 text-base font-bold text-white shadow-[0_10px_26px_-8px_rgb(0_51_101/0.6)] transition-all duration-300 hover:-translate-y-0.5 hover:shadow-[0_16px_32px_-10px_rgb(0_51_101/0.65)] active:scale-[0.98] cursor-pointer"
          >
            Talk to a Specialist
          </QuoteButton>
          <a
            href="tel:8009630131"
            className="inline-flex items-center gap-2 rounded-full border-2 border-primary/30 bg-white/40 px-6 py-2.5 text-base font-semibold text-primary backdrop-blur-sm transition-all hover:-translate-y-0.5 hover:border-primary/60 hover:bg-white/70"
          >
            <Phone className="h-4 w-4 text-accent-dark" />
            (800) 963-0131
          </a>
        </div>
        <p className="mt-6 text-sm text-primary/75">
          Prefer to do it yourself?{' '}
          <Link href="/kit-builder" className="font-semibold text-primary underline decoration-accent decoration-2 underline-offset-4 transition-colors hover:text-accent-dark">
            Build your kit or shop the catalog
          </Link>
          .
        </p>
      </div>
    </section>
  )
}
