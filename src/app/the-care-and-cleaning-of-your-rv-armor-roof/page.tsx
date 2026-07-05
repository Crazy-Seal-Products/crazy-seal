import type { Metadata } from 'next'
import Link from 'next/link'
import { ArrowRight } from 'lucide-react'
import { Container, Stack, Heading, Text, Card } from '@/lib/design-system'
import { CtaSection } from '@/components/CtaSection'

const MEDIA = 'https://media.rv-armor.com/site-assets/wp-media'

export const metadata: Metadata = {
  title: 'The Care & Cleaning of Your RV Armor Roof | RV ARMOR',
  description: 'Your RV Armor roof requires little to no maintenance. Learn about occasional cleaning and inspection tips.',
}

export default function CareAndCleaningPage() {
  return (
    <Container size="xl">
      <Stack gap="lg">
        {/* Hero Image */}
        <section className="relative section-bleed overflow-hidden">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={`${MEDIA}/2018/12/rv-armor-carecleaning-01_orig.jpg`}
            alt="Care and cleaning of your RV Armor roof"
            className="w-full h-48 sm:h-64 md:h-80 object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-[#003365]/80 to-[#003365]/40 flex items-center">
            <div className="px-6 sm:px-10 md:px-16">
              <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-white mb-2">
                The Care &amp; Cleaning of Your RV Armor Roof
              </h1>
            </div>
          </div>
        </section>

        {/* Content */}
        <article className="max-w-3xl mx-auto">
          <Card className="!p-6 md:!p-10">
            <Stack gap="md">
              <section>
                <Heading level={2} className="!text-[#003365]">Inspect Your Roof Frequently</Heading>
                <Text>
                  Your RV Armor roof is watertight, puncture-proof, and UV-resistant. While the
                  membrane itself requires no maintenance, it&apos;s good practice to give it an
                  occasional rinse to remove dirt and debris buildup.
                </Text>
              </section>

              <section>
                <Heading level={2} className="!text-[#003365]">Low to No Maintenance</Heading>
                <Text>
                  One of the biggest advantages of RV Armor is that it requires little or no
                  maintenance. Unlike traditional RV roofs that need annual resealing and recoating,
                  your RV Armor roof is a permanent, maintenance-free solution.
                </Text>
                <Text>
                  For cleaning, use water-based cleaners like Simple Green or LA&apos;s Totally
                  Awesome with a soft brush and garden hose. Avoid harsh chemicals or
                  pressure washers.
                </Text>
              </section>

              <section>
                <Link
                  href="/contact"
                  className="inline-flex items-center gap-2 rounded-full bg-[#5BA411] px-5 py-2.5 text-sm font-semibold text-white hover:bg-[#4A870E] transition-all"
                >
                  Questions? Contact Us
                  <ArrowRight className="w-4 h-4" />
                </Link>
              </section>
            </Stack>
          </Card>
        </article>

        {/* Related Posts */}
        <section>
          <Heading level={3} className="!text-[#003365] text-center">Related Articles</Heading>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 max-w-2xl mx-auto">
            <Link href="/how-to-prep-your-rv-for-your-new-rv-armor-roof" className="block group">
              <Card className="!p-4 group-hover:shadow-lg transition-shadow">
                <div className="relative aspect-video rounded-xl overflow-hidden mb-3">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={`${MEDIA}/2018/12/rv-armor-rv-prep-01_orig.jpg`}
                    alt="RV prep guide"
                    className="w-full h-full object-cover"
                  />
                </div>
                <p className="text-sm font-semibold text-gray-900">How To Prep Your RV For Your New RV Armor Roof</p>
              </Card>
            </Link>
            <Link href="/the-permanent-roof-coating-for-your-travel-trailer" className="block group">
              <Card className="!p-4 group-hover:shadow-lg transition-shadow">
                <div className="relative aspect-video rounded-xl overflow-hidden mb-3">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={`${MEDIA}/2018/12/rv-armor-permanentcoating-01_orig.jpg`}
                    alt="Permanent roof coating"
                    className="w-full h-full object-cover"
                  />
                </div>
                <p className="text-sm font-semibold text-gray-900">The Permanent Roof Coating For Your Travel Trailer</p>
              </Card>
            </Link>
          </div>
        </section>

        <CtaSection />
      </Stack>
    </Container>
  )
}
