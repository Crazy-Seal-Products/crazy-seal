import type { Metadata } from 'next'
import { Phone, Mail, MapPin, Clock } from 'lucide-react'
import { Container, Stack } from '@/lib/design-system'
import { ContactForm } from '@/components/forms/ContactForm'

const MEDIA = 'https://media.rv-armor.com/site-assets/wp-media'

export const metadata: Metadata = {
  title: 'Contact RV Armor | Get a Free Quote | RV ARMOR',
  description: 'Get a free, no-obligation quote for your RV roof. Our technicians come to you anywhere in the USA. Call (855) 782-7667.',
}

const CONTACT_INFO = [
  { icon: Phone, label: 'Call Us', value: '(855) 782-7667', href: 'tel:8557827667' },
  { icon: Mail, label: 'Email', value: 'info@rv-armor.com', href: 'mailto:info@rv-armor.com' },
  { icon: MapPin, label: 'Service Area', value: 'Nationwide Mobile Service', href: undefined },
  { icon: Clock, label: 'Response Time', value: 'Within 24 hours', href: undefined },
]

export default function ContactPage() {
  return (
    <Container size="xl">
      <Stack gap="lg">
        {/* Hero with background image */}
        <section className="relative section-bleed overflow-hidden">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={`${MEDIA}/2018/12/On-the-Road-RV-Armor.jpg`}
            alt="RV on the road"
            className="w-full h-48 sm:h-64 object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-[#003365]/80 to-[#003365]/40 flex items-center">
            <div className="px-6 sm:px-10 md:px-16">
              <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-white mb-2">
                Let&apos;s Get in Touch
              </h1>
              <p className="text-white/80 text-sm sm:text-base max-w-lg">
                Wondering how much it would cost to put RV Armor on your roof? Our trained
                specialists can help!
              </p>
            </div>
          </div>
        </section>

        <div className="section-bleed bg-white border-y sm:border border-gray-200/80 px-5 py-6 sm:px-6 md:p-6 lg:p-8">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Form */}
            <div className="lg:col-span-2">
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
                      <div className="w-10 h-10 rounded-full bg-[#003365]/10 flex items-center justify-center flex-shrink-0">
                        <item.icon className="w-5 h-5 text-[#003365]" />
                      </div>
                      <div>
                        <p className="text-xs font-semibold uppercase tracking-wider text-gray-500">{item.label}</p>
                        {item.href ? (
                          <a href={item.href} className="text-sm font-medium text-gray-900 hover:text-[#003365] transition-colors">
                            {item.value}
                          </a>
                        ) : (
                          <p className="text-sm font-medium text-gray-900">{item.value}</p>
                        )}
                      </div>
                    </div>
                  </div>
                ))}

                {/* RV Armor logo */}
                <div className="flex justify-center pt-4">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={`${MEDIA}/2018/12/RV-Armor-RV.png`}
                    alt="RV Armor"
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
