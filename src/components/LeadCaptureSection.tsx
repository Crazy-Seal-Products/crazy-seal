import { Phone, ShieldCheck, Truck, MessageSquare } from 'lucide-react'
import { Container } from '@/lib/design-system'
import { ContactForm } from '@/components/forms/ContactForm'

interface LeadCaptureSectionProps {
  /** Attribution label for the lead, e.g. 'rv-roofs'. */
  sourcePage: string
  /** Preselects the project type in the embedded form. */
  defaultProjectType?: string
  heading?: string
  subheading?: string
}

/**
 * Standard end-of-page lead capture: embedded contact form + phone.
 * Drop this at the bottom of application / niche pages instead of a
 * link-out-only CTA.
 */
export function LeadCaptureSection({
  sourcePage,
  defaultProjectType,
  heading = 'Talk to a Specialist About Your Roof',
  subheading = "Tell us about your project and we'll build the perfect kit with you — no pressure, no obligation.",
}: LeadCaptureSectionProps) {
  return (
    <Container size="xl" className="sm:pt-4 md:pt-8">
      <div className="section-bleed bg-primary overflow-hidden px-5 py-10 sm:px-6 md:p-10 lg:p-14">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 items-start">
          <div className="text-center lg:text-left lg:sticky lg:top-24">
            <p className="text-xs font-bold uppercase tracking-[0.2em] text-accent mb-4">
              <MessageSquare className="w-4 h-4 inline mr-1 -mt-0.5" />
              Free Kit Consultation
            </p>
            <h2 className="text-3xl sm:text-4xl font-bold text-white tracking-tight mb-4">
              {heading}
            </h2>
            <p className="text-white/60 text-base sm:text-lg leading-relaxed mb-6">
              {subheading}
            </p>
            <ul className="space-y-3 text-white/80 text-sm sm:text-base text-left max-w-md mx-auto lg:mx-0 mb-6">
              <li className="flex items-start gap-3">
                <ShieldCheck className="w-5 h-5 text-highlight flex-shrink-0 mt-0.5" />
                Backed by our 50 year warranty — do it once, do it right
              </li>
              <li className="flex items-start gap-3">
                <Truck className="w-5 h-5 text-highlight flex-shrink-0 mt-0.5" />
                Kits ship straight to your door. Free shipping over $500
              </li>
              <li className="flex items-start gap-3">
                <Phone className="w-5 h-5 text-highlight flex-shrink-0 mt-0.5" />
                Prefer to talk it through? Call us M-F 9AM-6PM EST
              </li>
            </ul>
            <a
              href="tel:8009630131"
              className="inline-flex items-center gap-2 text-white font-bold text-lg hover:text-highlight transition-colors"
            >
              <Phone className="w-5 h-5" />
              (800) 963-0131
            </a>
          </div>

          <div className="rounded-2xl bg-white shadow-2xl p-5 sm:p-6 lg:p-8">
            <ContactForm sourcePage={sourcePage} defaultProjectType={defaultProjectType} />
          </div>
        </div>
      </div>
    </Container>
  )
}
