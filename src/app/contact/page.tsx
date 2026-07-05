import type { Metadata } from 'next'
import { Phone, Mail, Clock, ShoppingCart } from 'lucide-react'
import { Container, Stack } from '@/lib/design-system'
import { ContactForm } from '@/components/forms/ContactForm'

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
    value: 'buy.crazyseal.com',
    href: 'https://buy.crazyseal.com/',
  },
]

export default function ContactPage() {
  return (
    <Container size="xl">
      <Stack gap="lg">
        {/* Hero */}
        <section className="relative section-bleed overflow-hidden bg-primary">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_50%,rgba(18,95,151,0.5),transparent_60%)]" />
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_80%_20%,rgba(91,164,17,0.15),transparent_40%)]" />
          <div className="relative z-10 px-6 py-10 sm:px-10 sm:py-14 md:px-16 text-center">
            <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold text-white mb-3">
              Get in Touch
            </h1>
            <p className="text-white/70 text-base sm:text-lg max-w-xl mx-auto">
              Have any questions? Our Crazy Seal specialists can help! We
              promise to be fun, informative, and will do our very best to
              help you!
            </p>
          </div>
        </section>

        <div className="section-bleed bg-white border-y sm:border border-gray-200/80 px-5 py-6 sm:px-6 md:p-6 lg:p-8">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Form */}
            <div className="lg:col-span-2">
              <h2 className="text-xl font-bold text-primary mb-2">
                Send Us a Quick Message
              </h2>
              <p className="text-gray-600 mb-6">
                Want to get in touch with us? Fill out the form below and one
                of our Crazy Seal specialists will be in touch with you
                shortly.
              </p>
              <ContactForm sourcePage="contact" />
            </div>

            {/* Contact Info Sidebar */}
            <div>
              <Stack gap="md">
                {CONTACT_INFO.map((item) => (
                  <div
                    key={item.label}
                    className="rounded-2xl border border-gray-200/80 bg-gray-50/50 p-4"
                  >
                    <div className="flex items-start gap-3">
                      <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                        <item.icon className="w-5 h-5 text-primary" />
                      </div>
                      <div>
                        <p className="text-xs font-semibold uppercase tracking-wider text-gray-500">{item.label}</p>
                        {item.href ? (
                          <a href={item.href} className="text-sm font-medium text-gray-900 hover:text-primary transition-colors">
                            {item.value}
                          </a>
                        ) : (
                          <p className="text-sm font-medium text-gray-900">{item.value}</p>
                        )}
                      </div>
                    </div>
                  </div>
                ))}

                {/* Crazy Seal logo */}
                <div className="flex justify-center pt-4">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={`${MEDIA}/2019/03/CRAZY-SEAL-LOGO-1000x800-400x320.png`}
                    alt="Crazy Seal"
                    className="h-32 object-contain"
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
