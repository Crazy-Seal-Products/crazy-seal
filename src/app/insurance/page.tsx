import type { Metadata } from 'next'
import Link from 'next/link'
import { FileCheck, CheckCircle, ArrowRight } from 'lucide-react'
import { Container, Stack, Heading, Text, Card, Grid } from '@/lib/design-system'
import { VideoHero } from '@/components/VideoHero'
import { CtaSection } from '@/components/CtaSection'
import { QuoteCta } from '@/components/QuoteButton'
import { InsuranceGalleryPreview } from '@/components/InsuranceGalleryPreview'

const MEDIA = 'https://media.rv-armor.com/site-assets/wp-media'

export const metadata: Metadata = {
  title: 'Insurance Claims | RV ARMOR',
  description: 'RV Armor works with your insurance company on hail damage, storm damage, and other covered roof repairs.',
}

export default function InsurancePage() {
  return (
    <Container size="xl">
      <Stack gap="lg">
        {/* Hero with Insurance video */}
        <VideoHero
          heading="Insurance Claim?"
          highlight="We Can Help!"
          subheading="If your RV roof has been damaged by hail, storms, or other covered events, RV Armor can work with your insurance company to get you a permanent roof solution."
          youtubeId="r67rMkRrmJc"
          imageAlt="RV Armor insurance claims"
          badge="Insurance Claims"
          variant="dark"
        />

        {/* Storm Damage Section */}
        <section>
          <Card className="!p-6 md:!p-8 rounded-3xl">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
              <div>
                <Heading level={2} className="!text-[#003365]">Storm &amp; Hail Damage</Heading>
                <Text>
                  Storm and hail damage can compromise your RV roof&apos;s integrity. If your
                  insurance covers the damage, RV Armor can provide a permanent replacement instead
                  of a patch job that will need replacing again in a few years.
                </Text>
                <Text className="!mb-0">
                  Our team has extensive experience working with insurance adjusters and can help
                  guide you through the claims process.
                </Text>
              </div>
              <div className="relative aspect-video rounded-2xl overflow-hidden">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={`${MEDIA}/2018/12/Insurance-Storm.jpg`}
                  alt="Storm damage to RV roof"
                  className="w-full h-full object-cover"
                />
              </div>
            </div>
          </Card>
        </section>

        {/* Completed Installations Gallery */}
        <section>
          <div className="section-bleed bg-white border-y sm:border border-gray-200/80 px-5 py-6 sm:px-6 md:p-6 lg:p-8">
            <div className="text-center mb-6">
              <Heading level={2} className="!text-[#003365]">Completed Installations</Heading>
              <Text className="max-w-2xl mx-auto">
                See examples of completed RV Armor installations. Whether it&apos;s storm damage, hail damage,
                or a worn-out roof, we deliver a permanent solution.
              </Text>
            </div>
            <InsuranceGalleryPreview />
          </div>
        </section>

        {/* Why Work with RV Armor */}
        <section>
          <div className="section-bleed bg-white border-y sm:border border-gray-200/80 px-5 py-6 sm:px-6 md:p-6 lg:p-8">
            <div className="text-center mb-8">
              <Heading level={2} className="!text-[#003365]">Why Work with RV Armor for Your Insurance Claim?</Heading>
            </div>
            <Grid responsiveCols={{ mobile: 1, tablet: 2, desktop: 3 }} gap="md">
              {[
                { title: 'Consistent Pricing', desc: 'We offer the same pricing anywhere in the country (all lower 48 states).' },
                { title: 'Convenient', desc: "You don't have to go anywhere. We can come to you for insurance work." },
                { title: 'Assistance', desc: 'Dedicated, in-house staff to work with your adjuster, agent, or Insurance Carrier.' },
                { title: 'Comprehensive', desc: 'We work on all make & models. (Class A, C, 5th Wheel, Travel Trailers, Horse Trailers, etc.)' },
                { title: 'Nationwide', desc: 'RV Roof System is installed by certified technicians nationwide.' },
                { title: 'Specialized', desc: 'Our certified technicians are highly specialized in RV roof repair.' },
                { title: 'One & Done', desc: 'Our one & done system eliminates any potential of future claims.' },
                { title: 'Happy Campers', desc: "We've worked with thousands of happy campers across the country!" },
                { title: 'Guaranteed', desc: 'Your new RV Armor roof is fully guaranteed (Material and Labor) for the life of the unit.' },
                { title: 'Any Condition', desc: 'We offer a complete operation from wood replacement to a total tear-off.' },
                { title: 'Versatile', desc: 'RV Armor can be installed over Rubber, Fiberglass, TPO, Metal, & directly to the wood decking.' },
                { title: 'Permanent', desc: 'Our Roof Membrane and System is the last roof your RV will ever need.' },
              ].map((item) => (
                <Card key={item.title} className="!p-5">
                  <div className="flex items-start gap-3">
                    <CheckCircle className="w-5 h-5 text-[#5BA411] mt-0.5 flex-shrink-0" />
                    <div>
                      <p className="font-bold text-gray-900 mb-1">{item.title}</p>
                      <Text size="sm" className="!mb-0">{item.desc}</Text>
                    </div>
                  </div>
                </Card>
              ))}
            </Grid>
          </div>
        </section>

        {/* For Adjusters */}
        <section>
          <Card className="!p-6 md:!p-8 rounded-3xl border-2 border-[#003365]/15">
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 rounded-full bg-[#003365]/10 flex items-center justify-center flex-shrink-0">
                <FileCheck className="w-6 h-6 text-[#003365]" />
              </div>
              <div>
                <Heading level={3}>For Insurance Adjusters</Heading>
                <Text>
                  Adjusters can find detailed information, documentation, and specifications
                  on our dedicated adjusters page.
                </Text>
                <Link
                  href="/insurance/adjusters"
                  className="inline-flex items-center gap-2 text-[#003365] font-semibold hover:underline"
                >
                  View Adjuster Information
                  <ArrowRight className="w-4 h-4" />
                </Link>
              </div>
            </div>
          </Card>
        </section>

        {/* Contact for Insurance */}
        <section className="text-center">
          <Card className="!p-6 md:!p-10 rounded-3xl bg-gradient-to-br from-[#003365]/5 to-[#125F97]/5">
            <Heading level={2} className="!text-[#003365]">Contact RV Armor for Your Insurance Claim</Heading>
            <Text className="max-w-xl mx-auto !mb-6">
              Our dedicated staff will work with your insurance carrier to set you up with the
              best RV roofing system in the industry.
            </Text>
            <QuoteCta quoteText="Start Your Claim" />
          </Card>
        </section>

        <CtaSection />
      </Stack>
    </Container>
  )
}
