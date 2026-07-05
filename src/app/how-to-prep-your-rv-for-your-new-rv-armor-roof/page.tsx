import type { Metadata } from 'next'
import Link from 'next/link'
import { Container, Stack, Heading, Text, Card } from '@/lib/design-system'
import { CtaSection } from '@/components/CtaSection'
import { QuoteButton } from '@/components/QuoteButton'

const MEDIA = 'https://media.rv-armor.com/site-assets/wp-media'

export const metadata: Metadata = {
  title: 'How To Prep Your RV For Your New RV Armor Roof | RV ARMOR',
  description: 'Learn how to prepare your RV for an RV Armor installation. Cleaning, warranty info, and scheduling tips.',
}

export default function PrepYourRVPage() {
  return (
    <Container size="xl">
      <Stack gap="lg">
        {/* Hero Image */}
        <section className="relative section-bleed overflow-hidden">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={`${MEDIA}/2018/12/rv-armor-rv-prep-01_orig.jpg`}
            alt="Preparing your RV for RV Armor"
            className="w-full h-48 sm:h-64 md:h-80 object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-[#003365]/80 to-[#003365]/40 flex items-center">
            <div className="px-6 sm:px-10 md:px-16">
              <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-white mb-2">
                How To Prep Your RV For Your New RV Armor Roof
              </h1>
            </div>
          </div>
        </section>

        {/* Content */}
        <article className="max-w-3xl mx-auto">
          <Card className="!p-6 md:!p-10">
            <Stack gap="md">
              <section>
                <Heading level={2} className="!text-[#003365]">Cleaning Your Roof</Heading>
                <Text>
                  Good news: RV Armor handles the prep work! Our technicians will clean and prepare
                  your roof as part of the installation process. The RV Armor system works on
                  fiberglass, rubber/EPDM, TPO, metal, and wood roofs.
                </Text>
              </section>

              <section>
                <Heading level={2} className="!text-[#003365]">Read and Understand the Warranty</Heading>
                <Text>
                  The RV Armor warranty is a life-of-vehicle, transferable warranty that covers both
                  materials and labor. There are no annual inspections required and no renewal fees.
                  When you sell your RV, the warranty transfers automatically.
                </Text>
              </section>

              <section>
                <Heading level={2} className="!text-[#003365]">Set an Appointment</Heading>
                <Text>
                  Our certified technicians come to you &mdash; whether you&apos;re at a campground,
                  in your driveway, or at a storage facility. A full RV Armor application typically
                  takes 2-3 days. Your RV remains usable between work phases.
                </Text>
                <QuoteButton size="sm">Schedule Your Appointment</QuoteButton>
              </section>
            </Stack>
          </Card>
        </article>

        {/* Related Posts */}
        <section>
          <Heading level={3} className="!text-[#003365] text-center">Related Articles</Heading>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 max-w-2xl mx-auto">
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
