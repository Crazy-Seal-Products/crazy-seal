import type { Metadata } from 'next'
import Link from 'next/link'
import { ClipboardList, Phone, Mail, Shield, ArrowRight, CheckCircle } from 'lucide-react'
import { Container, Stack, Heading, Text, Card, Grid } from '@/lib/design-system'
import { CtaSection } from '@/components/CtaSection'

export const metadata: Metadata = {
  title: 'Insurance Adjusters - RV Armor',
  description: 'Resources for insurance adjusters evaluating RV roof claims. RV Armor documentation, specifications, and contact information.',
}

export default function InsuranceAdjustersPage() {
  return (
    <Container size="xl">
      <Stack gap="lg">
        <section>
          <div className="section-bleed bg-white border-y sm:border border-gray-200/80 px-5 py-10 sm:px-6 sm:py-12 md:p-14 lg:p-16 text-center">
            <Heading level={1}>For Insurance Adjusters</Heading>
            <Text className="max-w-2xl mx-auto">
              Resources and documentation for adjusters evaluating RV roof claims involving RV Armor.
            </Text>
          </div>
        </section>

        <section>
          <div className="section-bleed bg-white border-y sm:border border-gray-200/80 px-5 py-6 sm:px-6 md:p-6 lg:p-8">
            <Grid responsiveCols={{ mobile: 1, tablet: 2 }} gap="lg">
              <Card className="!p-6 md:!p-8">
                <ClipboardList className="w-10 h-10 text-[#003365] mb-4" />
                <Heading level={3}>Product Specifications</Heading>
                <ul className="space-y-2 mt-4">
                  {[
                    'Seamless, multi-layer membrane system',
                    'Custom-manufactured on-site for each RV',
                    'Applied over existing roof substrate',
                    'Compatible with rubber, fiberglass, TPO, metal, and wood decking',
                    'Proprietary products: Armor Base, Armor Finish, Armor Seal, and more',
                  ].map((item) => (
                    <li key={item} className="flex items-start gap-2">
                      <CheckCircle className="w-4 h-4 text-[#5BA411] mt-1 flex-shrink-0" />
                      <span className="text-sm text-gray-700">{item}</span>
                    </li>
                  ))}
                </ul>
              </Card>

              <Card className="!p-6 md:!p-8">
                <Shield className="w-10 h-10 text-[#003365] mb-4" />
                <Heading level={3}>Warranty Information</Heading>
                <ul className="space-y-2 mt-4">
                  {[
                    'Transferable lifetime warranty on materials and labor',
                    'Covers the entire roof system including all penetrations',
                    'Eliminates future claims from the same failure mode',
                    'One-and-done solution vs repeated patch repairs',
                    'Consistent pricing nationwide (all lower 48 states)',
                  ].map((item) => (
                    <li key={item} className="flex items-start gap-2">
                      <CheckCircle className="w-4 h-4 text-[#5BA411] mt-1 flex-shrink-0" />
                      <span className="text-sm text-gray-700">{item}</span>
                    </li>
                  ))}
                </ul>
              </Card>
            </Grid>
          </div>
        </section>

        <Card className="!p-6 md:!p-8 rounded-3xl border-2 border-[#003365]/15">
          <div className="text-center">
            <Heading level={2} className="!text-[#003365]">Claims Verification &amp; Contact</Heading>
            <Text className="max-w-2xl mx-auto !mb-6">
              For claims verification, cost comparison data, or to discuss a specific claim,
              contact our dedicated insurance team directly.
            </Text>
            <div className="flex flex-row flex-wrap items-center justify-center gap-3">
              <a
                href="tel:8557827667"
                className="inline-flex items-center gap-2 rounded-full bg-[#003365] px-6 py-3 text-base font-semibold text-white hover:bg-[#002A54] transition-all"
              >
                <Phone className="w-5 h-5" />
                (855) 782-7667
              </a>
              <a
                href="mailto:info@rv-armor.com"
                className="inline-flex items-center gap-2 rounded-full border-2 border-[#003365] px-6 py-3 text-base font-semibold text-[#003365] hover:bg-[#003365]/5 transition-all"
              >
                <Mail className="w-5 h-5" />
                info@rv-armor.com
              </a>
            </div>
          </div>
        </Card>

        <section>
          <div className="section-bleed bg-white border-y sm:border border-gray-200/80 px-5 py-6 sm:px-6 md:p-6 lg:p-8 text-center">
            <Link
              href="/insurance"
              className="inline-flex items-center gap-2 text-[#003365] font-semibold hover:underline"
            >
              <ArrowRight className="w-4 h-4 rotate-180" />
              Back to Insurance Claims
            </Link>
          </div>
        </section>

        <CtaSection />
      </Stack>
    </Container>
  )
}
