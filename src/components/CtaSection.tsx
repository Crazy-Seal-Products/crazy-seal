import { QuoteCta } from '@/components/QuoteButton'

export function CtaSection() {
  return (
    <section className="relative section-bleed overflow-hidden bg-white border-y sm:border border-gray-200/80 py-10 sm:py-16 md:py-20 px-5 sm:px-8 md:px-12">
      <div className="relative z-10 max-w-2xl mx-auto text-center">
        <p className="text-xs font-bold uppercase tracking-[0.2em] text-accent mb-4">
          Get Started Today
        </p>
        <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold text-[#003365] mb-4 tracking-tight">
          Ready to Protect Your RV?
        </h2>
        <p className="text-gray-500 text-base sm:text-lg mb-6 md:mb-10 leading-relaxed">
          Get a free, no-obligation quote. Our certified technicians come to you anywhere in the continental US.
        </p>
        <QuoteCta />
      </div>
    </section>
  )
}
