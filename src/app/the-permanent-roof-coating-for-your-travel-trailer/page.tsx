import type { Metadata } from 'next'
import Link from 'next/link'
import { Container, Stack, Heading, Text, Card } from '@/lib/design-system'
import { CtaSection } from '@/components/CtaSection'
import { QuoteButton } from '@/components/QuoteButton'

const MEDIA = 'https://media.rv-armor.com/site-assets/wp-media'

export const metadata: Metadata = {
  title: 'The Permanent Roof Coating For Your Travel Trailer | RV ARMOR',
  description: 'RV Armor is a permanent roof coating for travel trailers. Puncture-resistant, UV-stable, and backed by a lifetime guarantee.',
}

export default function PermanentCoatingPage() {
  return (
    <Container size="xl">
      <Stack gap="lg">
        {/* Hero Image */}
        <section className="relative section-bleed overflow-hidden">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={`${MEDIA}/2018/12/rv-armor-permanentcoating-01_orig.jpg`}
            alt="Permanent roof coating for travel trailers"
            className="w-full h-48 sm:h-64 md:h-80 object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-[#003365]/80 to-[#003365]/40 flex items-center">
            <div className="px-6 sm:px-10 md:px-16">
              <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-white mb-2">
                The Permanent Roof Coating For Your Travel Trailer
              </h1>
            </div>
          </div>
        </section>

        {/* Content */}
        <article className="max-w-3xl mx-auto">
          <Card className="!p-6 md:!p-10">
            <Stack gap="md">
              <section>
                <Heading level={2} className="!text-[#003365]">What Is RV Armor?</Heading>
                <Text>
                  RV Armor is a family roofing company that has been in the roofing industry since the
                  1950s. President Lee Thaxton brings decades of commercial and residential roofing
                  expertise to the RV industry, creating a permanent solution for RV roofs.
                </Text>
              </section>

              <section>
                <Heading level={2} className="!text-[#003365]">How Does It Work?</Heading>
                <Text>
                  RV Armor is installed while you live in your trailer &mdash; no need to leave it
                  at a shop. Our proprietary membrane is puncture and tear resistant, available in
                  white, gray, and tan, and provides excellent cooling properties.
                </Text>
                <Text>
                  The system includes UV stabilizers and is rated from -75&deg;F to 350&deg;F. It&apos;s
                  resistant to fungus, salt, acids, and other environmental factors that break down
                  traditional roofing materials.
                </Text>
              </section>

              <section>
                <Heading level={2} className="!text-[#003365]">Getting Started</Heading>
                <Text>
                  Contact RV Armor for a free quote. Our system works on fiberglass, rubber, metal,
                  TPO, vinyl, and wood roofs. We come to your location anywhere in the continental US.
                </Text>
                <QuoteButton size="sm">Get a Free Quote</QuoteButton>
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
            <Link href="/the-care-and-cleaning-of-your-rv-armor-roof" className="block group">
              <Card className="!p-4 group-hover:shadow-lg transition-shadow">
                <div className="relative aspect-video rounded-xl overflow-hidden mb-3">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={`${MEDIA}/2018/12/rv-armor-carecleaning-01_orig.jpg`}
                    alt="Care and cleaning"
                    className="w-full h-full object-cover"
                  />
                </div>
                <p className="text-sm font-semibold text-gray-900">The Care &amp; Cleaning of Your RV Armor Roof</p>
              </Card>
            </Link>
          </div>
        </section>

        <CtaSection />
      </Stack>
    </Container>
  )
}
