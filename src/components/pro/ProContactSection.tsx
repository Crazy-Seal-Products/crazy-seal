import { clsx } from 'clsx'
import { ArrowRight, Check, Clock, Phone } from 'lucide-react'
import { Container } from '@/lib/design-system'
import { FormModalButton, type FormKind } from '@/components/forms/FormModalButton'

const DEFAULT_POINTS = [
  'A specialist gets back to you shortly',
  'Fun, informative answers',
  "We'll do our very best to help",
]

/**
 * "Have any questions?" block used across the pro pages: a compact band with
 * the pitch on the left and a button that opens the form in a pop-up.
 */
export function ProContactSection({
  id,
  form = 'professional',
  sourcePage,
  buttonLabel = 'Start a Conversation',
  heading = 'Have Any Questions? Our Crazy Seal Specialists Can Help!',
  subheading = 'Tell us a little about you and one of our specialists will be in touch shortly.',
  points = DEFAULT_POINTS,
}: {
  id?: string
  form?: FormKind
  sourcePage: string
  buttonLabel?: string
  eyebrow?: string
  heading?: string
  subheading?: string
  points?: string[]
}) {
  return (
    <Container size="xl" className="sm:pt-4 md:pt-8">
      <div
        id={id}
        className={clsx(
          'section-bleed bg-white border-y sm:border border-gray-200/80 px-5 py-7 sm:px-6 md:p-8 lg:px-12 lg:py-10',
          id && 'scroll-mt-24'
        )}
      >
        <div className="grid grid-cols-1 items-center gap-6 lg:grid-cols-[1.35fr_1fr] lg:gap-12">
          <div className="text-center lg:text-left">
            <h2 className="text-2xl font-extrabold tracking-tight text-primary text-balance sm:text-3xl">{heading}</h2>
            <p className="mx-auto mt-2 max-w-xl text-sm leading-relaxed text-gray-600 sm:text-base lg:mx-0">{subheading}</p>
            <ul className="mt-4 flex flex-wrap justify-center gap-x-5 gap-y-2 lg:justify-start">
              {points.map((point) => (
                <li key={point} className="flex items-center gap-2 text-sm text-gray-700">
                  <span className="grid h-5 w-5 shrink-0 place-items-center rounded-full bg-accent/15 text-accent-dark">
                    <Check className="h-3 w-3" strokeWidth={3} />
                  </span>
                  {point}
                </li>
              ))}
            </ul>
          </div>

          <div className="flex flex-col gap-3 rounded-3xl bg-gradient-to-b from-slate-50 to-white p-5 shadow-sm ring-1 ring-primary/[0.08] sm:p-6">
            <FormModalButton
              form={form}
              sourcePage={sourcePage}
              openOnHash={id}
              variant="accent"
              size="lg"
              className="w-full"
            >
              {buttonLabel}
              <ArrowRight className="h-4 w-4" />
            </FormModalButton>
            <a
              href="tel:8009630131"
              className="group flex items-center justify-center gap-3 rounded-2xl px-4 py-2 transition-colors hover:bg-primary/[0.04]"
            >
              <span className="grid h-9 w-9 place-items-center rounded-xl bg-gradient-to-br from-accent-light to-accent-dark text-white shadow-glow-accent transition-transform duration-500 group-hover:-rotate-6">
                <Phone className="h-4 w-4" />
              </span>
              <span className="text-left">
                <span className="block text-base font-extrabold text-primary">(800) 963-0131</span>
                <span className="flex items-center gap-1.5 text-xs font-medium text-gray-500">
                  <Clock className="h-3.5 w-3.5" />
                  M&ndash;F 9AM&ndash;6PM EST
                </span>
              </span>
            </a>
          </div>
        </div>
      </div>
    </Container>
  )
}
