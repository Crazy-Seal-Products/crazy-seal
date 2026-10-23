import { Phone, ShieldCheck, Truck, MessageSquare, Clock } from 'lucide-react'
import { Container } from '@/lib/design-system'
import { FormModalButton } from '@/components/forms/FormModalButton'
import { GlowOrb } from '@/components/motion'

interface LeadCaptureSectionProps {
  /** Attribution label for the lead, e.g. 'rv-roofs'. */
  sourcePage: string
  /** Preselects the project type in the embedded form. */
  defaultProjectType?: string
  heading?: string
  subheading?: string
}

const PROMISES = [
  { icon: ShieldCheck, text: 'Backed by our 50 year warranty — do it once, do it right' },
  { icon: Truck, text: 'Kits ship straight to your door. Free shipping over $500' },
  { icon: Clock, text: 'Prefer to talk it through? Call us M-F 9AM-6PM EST' },
]

/**
 * Standard end-of-page lead capture: a compact band whose button opens the
 * specialist form in a pop-up (project type preselected), plus the phone line.
 */
export function LeadCaptureSection({
  sourcePage,
  defaultProjectType,
  heading = 'Talk to a Specialist About Your Roof',
  subheading = "Tell us about your project and we'll build the perfect kit with you — no pressure, no obligation.",
}: LeadCaptureSectionProps) {
  return (
    <Container size="xl" className="sm:pt-4 md:pt-8">
      <div className="relative section-bleed bg-primary overflow-hidden px-5 py-8 sm:px-6 md:p-8 lg:px-12 lg:py-10">
        <GlowOrb className="-left-28 -top-24 h-80 w-80" color="rgb(26 123 196 / 0.4)" />
        <GlowOrb className="-right-24 bottom-0 h-96 w-96" color="rgb(91 164 17 / 0.22)" />
        <div
          aria-hidden="true"
          className="hairline-grid pointer-events-none absolute inset-0 opacity-40 [mask-image:radial-gradient(ellipse_at_30%_40%,black,transparent_70%)]"
        />

        <div className="relative z-10 grid grid-cols-1 items-center gap-6 lg:grid-cols-[1.4fr_1fr] lg:gap-12">
          <div className="text-center lg:text-left">
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-white tracking-tight leading-[1.1] mb-3 text-balance">
              {heading}
            </h2>
            <p className="text-white/70 text-sm sm:text-base leading-relaxed max-w-xl mx-auto lg:mx-0">{subheading}</p>
            <ul className="mt-4 flex flex-wrap justify-center gap-x-5 gap-y-2 lg:justify-start">
              {PROMISES.map(({ icon: Icon, text }) => (
                <li key={text} className="flex items-center gap-2 text-xs sm:text-sm text-white/75">
                  <span className="grid h-6 w-6 shrink-0 place-items-center rounded-full bg-accent/20 ring-1 ring-accent/40">
                    <Icon className="h-3 w-3 text-accent-light" />
                  </span>
                  {text}
                </li>
              ))}
            </ul>
          </div>

          <div className="relative">
            <div
              aria-hidden="true"
              className="absolute -inset-3 rounded-[2rem] bg-gradient-to-br from-highlight/25 via-secondary/20 to-accent/30 blur-2xl"
            />
            <div className="relative flex flex-col gap-3 rounded-3xl bg-white/[0.08] p-5 ring-1 ring-white/15 backdrop-blur-md sm:p-6">
              <p className="text-sm font-semibold text-white">Get a kit built for your roof — takes about a minute.</p>
              <FormModalButton
                form="contact"
                sourcePage={sourcePage}
                defaultProjectType={defaultProjectType}
                variant="accent"
                size="lg"
                className="w-full"
              >
                <MessageSquare className="h-5 w-5" />
                Talk to a Specialist
              </FormModalButton>
              <a
                href="tel:8009630131"
                className="group inline-flex items-center justify-center gap-3 rounded-full bg-white/[0.07] py-2 pl-2 pr-5 ring-1 ring-white/15 transition-all duration-300 hover:bg-white/[0.12] hover:ring-white/30"
              >
                <span className="relative grid h-9 w-9 place-items-center">
                  <span className="absolute inset-0 rounded-full bg-accent/50 animate-pulse-ring" />
                  <span className="relative grid h-9 w-9 place-items-center rounded-full bg-gradient-to-br from-accent-light to-accent-dark text-white shadow-glow-accent">
                    <Phone className="h-4 w-4" />
                  </span>
                </span>
                <span className="text-base font-extrabold text-white tracking-tight group-hover:text-highlight transition-colors">
                  (800) 963-0131
                </span>
              </a>
            </div>
          </div>
        </div>
      </div>
    </Container>
  )
}
