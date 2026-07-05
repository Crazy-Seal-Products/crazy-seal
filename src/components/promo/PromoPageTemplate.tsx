'use client'

import { Container, Stack, Heading, Text, Card } from '@/lib/design-system'
import { ContactForm } from '@/components/forms/ContactForm'
import { Shield, Clock, Award, Wrench, Phone } from 'lucide-react'

interface PromoPageTemplateProps {
  headline: string
  subheadline: string
  heroColor?: string
  offerText: string
  urgencyText?: string
  features?: { title: string; description: string }[]
  sourcePage: string
}

const DEFAULT_FEATURES = [
  { title: 'Lifetime Warranty', description: 'One application lasts the life of your RV. No recoating, no maintenance, no worries.' },
  { title: 'Mobile Service', description: 'We come to you. Nationwide mobile application means zero downtime at a shop.' },
  { title: 'All RV Types', description: 'Motorhomes, travel trailers, fifth wheels, toy haulers, and more. If it has a roof, we cover it.' },
  { title: 'Seamless Membrane', description: 'No seams means no leaks. Our spray-applied membrane bonds directly to your existing roof.' },
]

const FEATURE_ICONS = [Shield, Clock, Award, Wrench]

export function PromoPageTemplate({
  headline,
  subheadline,
  heroColor = 'from-[#003365] to-[#125F97]',
  offerText,
  urgencyText,
  features = DEFAULT_FEATURES,
  sourcePage,
}: PromoPageTemplateProps) {
  return (
    <div className="-mt-8">
      {/* Hero Section */}
      <section className={`bg-gradient-to-br ${heroColor} text-white py-16 md:py-24 px-4`}>
        <Container size="xl">
          <div className="max-w-3xl mx-auto text-center">
            <Heading level={1} className="text-3xl md:text-5xl font-bold text-white mb-4 leading-tight">
              {headline}
            </Heading>
            <Text className="text-lg md:text-xl text-white/90 mb-8 max-w-2xl mx-auto">
              {subheadline}
            </Text>
            <div className="inline-block bg-white/15 backdrop-blur-sm border border-white/25 rounded-2xl px-6 py-4 md:px-8 md:py-5">
              <Text className="text-lg md:text-2xl font-bold text-white">
                {offerText}
              </Text>
            </div>
          </div>
        </Container>
      </section>

      <Container size="xl">
        <Stack gap="lg" className="py-12 md:py-16">
          {/* Urgency Banner */}
          {urgencyText && (
            <div className="bg-[#5BA411]/10 border-2 border-[#5BA411]/30 rounded-2xl p-6 text-center">
              <Text className="text-lg font-semibold text-[#5BA411]">
                {urgencyText}
              </Text>
            </div>
          )}

          {/* Value Props Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {features.map((feature, i) => {
              const Icon = FEATURE_ICONS[i % FEATURE_ICONS.length]
              return (
                <Card key={i} variant="elevated" className="p-6">
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 bg-[#003365]/10 rounded-xl flex items-center justify-center shrink-0">
                      <Icon className="w-6 h-6 text-[#003365]" />
                    </div>
                    <div>
                      <Heading level={3} className="text-lg font-bold text-gray-900 mb-1">
                        {feature.title}
                      </Heading>
                      <Text className="text-gray-600">{feature.description}</Text>
                    </div>
                  </div>
                </Card>
              )
            })}
          </div>

          {/* Why RV Armor */}
          <Card variant="elevated" className="p-8 bg-gray-50">
            <Heading level={2} className="text-2xl font-bold text-gray-900 mb-4 text-center">
              Why Choose RV Armor?
            </Heading>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 text-center">
              <div>
                <Text className="text-3xl font-bold text-[#003365]">3 Gen</Text>
                <Text className="text-gray-600 mt-1">Roofing Experience</Text>
              </div>
              <div>
                <Text className="text-3xl font-bold text-[#003365]">Lifetime</Text>
                <Text className="text-gray-600 mt-1">Transferable Warranty</Text>
              </div>
              <div>
                <Text className="text-3xl font-bold text-[#003365]">$175</Text>
                <Text className="text-gray-600 mt-1">Per Linear Foot</Text>
              </div>
            </div>
          </Card>

          {/* Embedded Quote Form */}
          <div id="quote-form">
            <Card variant="elevated" className="p-6 md:p-8">
              <div className="max-w-2xl mx-auto">
                <div className="text-center mb-8">
                  <Heading level={2} className="text-2xl md:text-3xl font-bold text-gray-900 mb-2">
                    Get Your Free Quote Today
                  </Heading>
                  <Text className="text-gray-600">
                    Fill out the form below and we will get back to you within 24 hours.
                  </Text>
                </div>
                <ContactForm sourcePage={sourcePage} />
              </div>
            </Card>
          </div>

          {/* Phone CTA */}
          <div className="text-center py-6">
            <Text className="text-gray-500 mb-2">Prefer to talk? Call us directly:</Text>
            <a href="tel:+18559782767" className="inline-flex items-center gap-2 text-2xl font-bold text-[#003365] hover:text-[#002A54] transition-colors">
              <Phone className="w-6 h-6" />
              (855) 978-2767
            </a>
          </div>
        </Stack>
      </Container>
    </div>
  )
}
