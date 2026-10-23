import type { Metadata } from 'next'
import { Phone, Mail, Clock, ShoppingCart, ShieldCheck, Flag, Truck, ArrowUpRight, MessageSquare } from 'lucide-react'
import { Container, Stack } from '@/lib/design-system'
import { FormModalButton } from '@/components/forms/FormModalButton'
import { GlowOrb } from '@/components/motion'

const MEDIA = 'https://media.crazyseal.com/site-assets/wp-media'

export const metadata: Metadata = {
  title: 'Contact Crazy Seal',
  description:
    'Contact the professionals at Crazy Seal. Tell us your roofing story and learn how we can help. Call (800) 963-0131, Mon-Fri 9am-6pm EST.',
}

const CONTACT_INFO = [
  { icon: Phone, label: 'Phone', value: '(800) 963-0131', href: 'tel:8009630131' },
  { icon: Mail, label: 'Email', value: 'info@crazyseal.com', href: 'mailto:info@crazyseal.com' },
  { icon: Clock, label: 'Hours', value: 'Mon - Fri: 9am - 6pm EST', href: undefined },
  {
    icon: ShoppingCart,
    label: 'Online Store',
    value: 'crazyseal.com/kit-builder',
    href: '/kit-builder',
  },
]

const HERO_TRUST = [
  { icon: ShieldCheck, label: '50 Year Warranty' },
  { icon: Flag, label: 'Made in the USA' },
  { icon: Truck, label: 'Ships to your door' },
]

// CSS entrance (runs before hydration, so the hero never flashes empty)
const enter = (delayMs: number) => ({ style: { animationDelay: `${delayMs}ms` } })

export default function ContactPage() {
  return (
    <Container size="xl">
      <Stack gap="lg">
        {/* Hero */}
        <section className="relative section-bleed overflow-hidden bg-primary">
          <GlowOrb className="-left-32 top-0 h-96 w-96" color="rgb(26 123 196 / 0.45)" />
          <GlowOrb className="-right-24 -bottom-24 h-80 w-80" color="rgb(91 164 17 / 0.25)" />
          <div
            aria-hidden="true"
            className="hairline-grid pointer-events-none absolute inset-0 opacity-50 [mask-image:radial-gradient(ellipse_at_center,black,transparent_75%)]"
          />
          <div className="relative z-10 px-6 py-10 sm:px-10 sm:py-14 md:px-16 text-center">
            <h1
              {...enter(80)}
              className="animate-fade-up text-3xl sm:text-4xl md:text-5xl font-extrabold text-white tracking-tight leading-[1.08] mb-4"
            >
              Get in <span className="text-shimmer-highlight">Touch</span>
            </h1>
            <p
              {...enter(160)}
              className="animate-fade-up text-white/70 text-base sm:text-lg max-w-xl mx-auto"
            >
              Have questions? Our Crazy Seal specialists promise to be fun, informative and
              genuinely helpful.
            </p>
            <ul
              {...enter(240)}
              className="animate-fade-up mt-7 flex flex-wrap justify-center gap-x-6 gap-y-2"
            >
              {HERO_TRUST.map(({ icon: Icon, label }) => (
                <li key={label} className="flex items-center gap-2 text-sm font-medium text-white/75">
                  <span className="grid h-7 w-7 place-items-center rounded-full bg-accent/20 ring-1 ring-accent/40">
                    <Icon className="h-3.5 w-3.5 text-accent-light" />
                  </span>
                  {label}
                </li>
              ))}
            </ul>
          </div>
        </section>

        <div className="section-bleed bg-white border-y sm:border border-gray-200/80 px-5 py-8 sm:px-6 md:p-8 lg:p-12">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 lg:gap-12">
            {/* Message CTA (the form opens in a pop-up) */}
            <div className="lg:col-span-2">
              <div className="relative flex h-full flex-col justify-center overflow-hidden rounded-3xl bg-gradient-to-br from-primary via-primary to-secondary p-6 text-white shadow-xl sm:p-8 lg:p-10">
                <div aria-hidden="true" className="pointer-events-none absolute -right-16 -top-20 h-60 w-60 rounded-full bg-accent/25 blur-3xl" />
                <div aria-hidden="true" className="hairline-grid pointer-events-none absolute inset-0 opacity-30 [mask-image:radial-gradient(ellipse_at_80%_20%,black,transparent_70%)]" />
                <div className="relative">
                  <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight mb-2">Send Us a Quick Message</h2>
                  <p className="text-white/70 mb-6 max-w-lg">
                    Tell us about your roof and a Crazy Seal specialist will be in touch shortly — usually the same business day.
                  </p>
                  <div className="flex flex-wrap items-center gap-3">
                    <FormModalButton form="contact" sourcePage="contact" openOnHash="message" variant="accent" size="lg">
                      <MessageSquare className="h-5 w-5" />
                      Send a Message
                    </FormModalButton>
                    <a
                      href="tel:8009630131"
                      className="inline-flex items-center gap-2 rounded-full bg-white/10 px-5 py-3 text-sm font-semibold text-white ring-1 ring-white/20 transition hover:bg-white/15"
                    >
                      <Phone className="h-4 w-4 text-accent-light" />
                      (800) 963-0131
                    </a>
                  </div>
                </div>
              </div>
            </div>

            {/* Contact Info Sidebar */}
            <div className="lg:sticky lg:top-24 lg:self-start">
              <Stack gap="md">
                {CONTACT_INFO.map((item) => {
                  const body = (
                    <div className="flex items-center gap-3.5">
                      <span className="grid h-11 w-11 flex-shrink-0 place-items-center rounded-xl bg-gradient-to-br from-accent-light to-accent-dark text-white shadow-glow-accent transition-transform duration-500 group-hover:-rotate-6">
                        <item.icon className="h-5 w-5" />
                      </span>
                      <div className="min-w-0 flex-1">
                        <p className="text-[11px] font-bold uppercase tracking-[0.16em] text-gray-500">{item.label}</p>
                        <p className="truncate text-sm font-semibold text-primary">{item.value}</p>
                      </div>
                      {item.href && (
                        <span className="grid h-8 w-8 flex-shrink-0 place-items-center rounded-full bg-primary/[0.06] text-primary transition-all duration-300 group-hover:rotate-45 group-hover:bg-accent group-hover:text-white">
                          <ArrowUpRight className="h-4 w-4" />
                        </span>
                      )}
                    </div>
                  )
                  const cardClass =
                    'group block rounded-2xl bg-gradient-to-b from-slate-50 to-white p-4 shadow-sm ring-1 ring-primary/[0.08] transition-all duration-300'
                  return item.href ? (
                    <a
                      key={item.label}
                      href={item.href}
                      className={`${cardClass} hover:-translate-y-0.5 hover:shadow-lg`}
                    >
                      {body}
                    </a>
                  ) : (
                    <div key={item.label} className={cardClass}>
                      {body}
                    </div>
                  )
                })}

                {/* Crazy Seal logo */}
                <div className="relative flex justify-center pt-4">
                  <div
                    aria-hidden="true"
                    className="absolute inset-x-8 bottom-2 top-8 rounded-full bg-gradient-to-br from-secondary/15 via-transparent to-accent/20 blur-2xl"
                  />
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={`${MEDIA}/2019/03/CRAZY-SEAL-LOGO-1000x800-400x320.png`}
                    alt="Crazy Seal"
                    className="relative h-32 object-contain animate-float-slow"
                  />
                </div>
              </Stack>
            </div>
          </div>
        </div>
      </Stack>
    </Container>
  )
}
