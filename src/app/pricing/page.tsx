import type { Metadata } from 'next'
import { DollarSign, Check, X, Shield, CheckCircle, Download } from 'lucide-react'
import { Container, Stack, Heading, Text, Card, Grid } from '@/lib/design-system'
import { VideoHero } from '@/components/VideoHero'
import { CtaSection } from '@/components/CtaSection'

const MEDIA = 'https://media.rv-armor.com/site-assets/wp-media'

export const metadata: Metadata = {
  title: 'Pricing | RV ARMOR',
  description: 'RV Armor pricing starts at ~$190 per linear foot with a $4,560 minimum. Compare to traditional roofing costs of $10,000-$20,000+.',
}

const COMPARISON = [
  { feature: 'Lifetime warranty', rvArmor: true, traditional: false },
  { feature: 'Zero maintenance', rvArmor: true, traditional: false },
  { feature: 'Seamless membrane', rvArmor: true, traditional: false },
  { feature: 'Mobile service', rvArmor: true, traditional: false },
  { feature: '2-3 day installation', rvArmor: true, traditional: false },
  { feature: 'Transferable warranty', rvArmor: true, traditional: false },
  { feature: 'Recoating every 3-5 years', rvArmor: false, traditional: true },
  { feature: 'Seam failures and leaks', rvArmor: false, traditional: true },
]

export default function PricingPage() {
  return (
    <Container size="xl">
      <Stack gap="lg">
        <VideoHero
          heading="Pricing"
          highlight="Comparison"
          subheading="The RV Armor Roofing System provides the best value in the industry. See how we compare to traditional roofing options."
          youtubeId="5qvcS-Ba9uU"
          imageAlt="RV Armor pricing overview"
          badge="Best Value"
          variant="dark"
        />

        {/* Three pricing columns */}
        <section>
          <div className="section-bleed bg-white border-y sm:border border-gray-200/80 px-5 py-6 sm:px-6 md:p-6 lg:p-8">
            <div className="text-center mb-8">
              <Heading level={2} className="!text-[#003365]">Pricing Advantages</Heading>
              <Text className="max-w-2xl mx-auto">
                Compare RV Armor to traditional roofing options over a 10-year period.
              </Text>
            </div>
            <Grid responsiveCols={{ mobile: 1, tablet: 3 }} gap="md">
              <Card className="!p-6 border-2 border-gray-300 text-center">
                <h3 className="text-lg font-bold text-gray-500 uppercase mb-2">Standard EPDM/TPO/Vinyl</h3>
                <p className="text-3xl font-bold text-gray-700 mb-4">$10,000&ndash;$18,000+</p>
                <ul className="space-y-2 text-sm text-left text-gray-600">
                  <li className="flex items-start gap-2"><X className="w-4 h-4 text-red-400 flex-shrink-0 mt-0.5" /> Recoating every 3-5 years</li>
                  <li className="flex items-start gap-2"><X className="w-4 h-4 text-red-400 flex-shrink-0 mt-0.5" /> Resealing seams annually</li>
                  <li className="flex items-start gap-2"><X className="w-4 h-4 text-red-400 flex-shrink-0 mt-0.5" /> Pro-rated warranty only</li>
                  <li className="flex items-start gap-2"><X className="w-4 h-4 text-red-400 flex-shrink-0 mt-0.5" /> Same material that failed</li>
                </ul>
              </Card>

              <Card className="!p-6 border-2 border-[#5BA411] text-center relative">
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-[#5BA411] text-white text-xs font-bold px-3 py-1 rounded-full uppercase">
                  Best Value
                </div>
                <h3 className="text-lg font-bold text-[#5BA411] uppercase mb-2">RV Armor</h3>
                <p className="text-3xl font-bold text-[#003365] mb-1">Starting at $4,560</p>
                <p className="text-sm text-gray-500 mb-4">~$190 per linear foot</p>
                <ul className="space-y-2 text-sm text-left">
                  <li className="flex items-start gap-2"><CheckCircle className="w-4 h-4 text-[#5BA411] flex-shrink-0 mt-0.5" /> 1/3 of typical replacement cost</li>
                  <li className="flex items-start gap-2"><CheckCircle className="w-4 h-4 text-[#5BA411] flex-shrink-0 mt-0.5" /> Lifetime material &amp; labor warranty</li>
                  <li className="flex items-start gap-2"><CheckCircle className="w-4 h-4 text-[#5BA411] flex-shrink-0 mt-0.5" /> Zero maintenance forever</li>
                  <li className="flex items-start gap-2"><CheckCircle className="w-4 h-4 text-[#5BA411] flex-shrink-0 mt-0.5" /> Fully transferable</li>
                </ul>
              </Card>

              <Card className="!p-6 border-2 border-gray-300 text-center">
                <h3 className="text-lg font-bold text-gray-500 uppercase mb-2">Standard Fiberglass</h3>
                <p className="text-3xl font-bold text-gray-700 mb-4">$11,500&ndash;$20,000+</p>
                <ul className="space-y-2 text-sm text-left text-gray-600">
                  <li className="flex items-start gap-2"><X className="w-4 h-4 text-red-400 flex-shrink-0 mt-0.5" /> Weeks at the dealership</li>
                  <li className="flex items-start gap-2"><X className="w-4 h-4 text-red-400 flex-shrink-0 mt-0.5" /> Seam failures over time</li>
                  <li className="flex items-start gap-2"><X className="w-4 h-4 text-red-400 flex-shrink-0 mt-0.5" /> Pro-rated warranty</li>
                  <li className="flex items-start gap-2"><X className="w-4 h-4 text-red-400 flex-shrink-0 mt-0.5" /> Must bring RV to dealer</li>
                </ul>
              </Card>
            </Grid>
          </div>
        </section>

        {/* Components to Pricing */}
        <section>
          <div className="section-bleed bg-white border-y sm:border border-gray-200/80 px-5 py-6 sm:px-6 md:p-6 lg:p-8">
            <div className="flex flex-col md:flex-row items-center gap-6">
              <div className="w-16 h-16 rounded-full bg-[#5BA411]/10 flex items-center justify-center flex-shrink-0">
                <DollarSign className="w-8 h-8 text-[#5BA411]" />
              </div>
              <div className="text-center md:text-left">
                <Heading level={3}>Components to Pricing</Heading>
                <Text className="!mb-2">
                  RV Armor is priced by linear foot at approximately $190 per foot, with a minimum
                  project cost of $4,560. Final cost depends on your RV length and roof condition.
                  Repairs to the underlying structure, if needed, are priced separately.
                </Text>
                <Text size="sm" className="!mb-0 text-[#5BA411] font-medium">
                  We provide detailed, no-obligation quotes. Call (855) 782-7667 or fill out our contact form.
                </Text>
              </div>
            </div>
          </div>
        </section>

        {/* Comparison Table */}
        <section>
          <div className="section-bleed bg-white border-y sm:border border-gray-200/80 px-5 py-6 sm:px-6 md:p-6 lg:p-8">
            <Heading level={2} className="!text-[#003365]">RV Armor vs Traditional Roofing</Heading>
            <div className="overflow-x-auto mt-4">
              <table className="w-full border-collapse rounded-2xl overflow-hidden border border-gray-200">
              <thead>
                <tr className="bg-[#003365] text-white">
                  <th className="px-4 py-3 text-left font-semibold">Feature</th>
                  <th className="px-4 py-3 text-center font-semibold">RV Armor</th>
                  <th className="px-4 py-3 text-center font-semibold">Traditional</th>
                </tr>
              </thead>
              <tbody>
                {COMPARISON.map((row, i) => (
                  <tr
                    key={row.feature}
                    className={i % 2 === 0 ? 'bg-white' : 'bg-gray-50'}
                  >
                    <td className="px-4 py-3 text-gray-900">{row.feature}</td>
                    <td className="px-4 py-3 text-center">
                      {row.rvArmor ? (
                        <Check className="w-5 h-5 text-[#5BA411] mx-auto" />
                      ) : (
                        <X className="w-5 h-5 text-gray-300 mx-auto" />
                      )}
                    </td>
                    <td className="px-4 py-3 text-center">
                      {row.traditional ? (
                        <Check className="w-5 h-5 text-[#5BA411] mx-auto" />
                      ) : (
                        <X className="w-5 h-5 text-gray-300 mx-auto" />
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            </div>
          </div>
        </section>

        {/* Not All Roofing Systems Are Created Equal */}
        <section>
          <div className="section-bleed bg-gradient-to-br from-[#003365]/5 to-[#125F97]/5 border-y sm:border border-[#003365]/15 px-5 py-6 sm:px-6 md:p-6 lg:p-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-center">
              <div>
                <Heading level={3} className="!text-[#003365]">Not All Roofing Systems Are Created Equal</Heading>
                <Text>
                  Dealership service departments will remove your old roof and replace it with the
                  exact same material that failed in the first place. That means in 10-15 years
                  you&apos;ll be doing it all over again, spending the same or more money.
                </Text>
                <Text className="!mb-0">
                  RV Armor applies a permanent, seamless membrane &mdash; a completely different approach
                  that eliminates the cycle of repair and replacement.
                </Text>
              </div>
              <div className="flex justify-center">
                <div className="w-32 h-32 md:w-40 md:h-40">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={`${MEDIA}/2018/12/RVARMOR_shield_1080_space.png`}
                    alt="RV Armor shield"
                    className="w-full h-full object-contain"
                  />
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Advantages Grid */}
        <section>
          <div className="section-bleed bg-white border-y sm:border border-gray-200/80 px-5 py-6 sm:px-6 md:p-6 lg:p-8">
            <div className="text-center mb-8">
              <Heading level={2} className="!text-[#003365]">RV Armor Advantages</Heading>
            </div>
            <Grid responsiveCols={{ mobile: 2, tablet: 3, desktop: 6 }} gap="sm">
              {[
                { title: 'Guaranteed', desc: 'Fully transferrable lifetime material & labor warranty.' },
                { title: 'Affordable', desc: '30%-50% less than a tear off and replacement.' },
                { title: 'Convenient', desc: 'We come to you anywhere in the continental US.' },
                { title: 'Nationwide', desc: 'Nationwide network of certified technicians.' },
                { title: 'Comprehensive', desc: 'Works on all RV roof types and conditions.' },
                { title: 'Permanent', desc: 'No resealing, no recoating, no maintenance.' },
              ].map((item) => (
                <Card key={item.title} className="text-center !p-4">
                  <h4 className="font-bold text-[#003365] uppercase text-sm mb-1">{item.title}</h4>
                  <p className="text-xs text-gray-600">{item.desc}</p>
                </Card>
              ))}
            </Grid>
          </div>
        </section>

        {/* Tough Skin Brochure */}
        <section>
          <div className="section-bleed bg-primary overflow-hidden px-5 pt-6 pb-4 sm:px-6 md:p-6 lg:p-8">
            <div className="grid grid-cols-1 md:grid-cols-[1fr_3fr] gap-6 md:gap-4 lg:gap-6 items-center">
              <div className="order-2 md:order-1 relative flex items-center justify-center md:justify-start">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={`${MEDIA}/2018/12/RV-Armor-Tough-Skin-Brochure-b.jpg`}
                  alt="Tough Skin Brochure"
                  className="rounded-2xl shadow-2xl ring-1 ring-white/10 h-auto md:max-h-[400px] object-contain"
                />
              </div>
              <div className="order-1 md:order-2 text-center md:text-left">
                <p className="text-xs font-bold uppercase tracking-[0.2em] text-accent mb-3">
                  Featured in Trailer Life Magazine
                </p>
                <h2 className="text-3xl sm:text-4xl font-bold text-white tracking-tight mb-4">
                  Tough Skin
                </h2>
                <p className="text-white/60 text-base sm:text-lg leading-relaxed mb-4 md:mb-8">
                  Read what Trailer Life Magazine has to say about RV Armor. Our proprietary roofing
                  system has been featured in major RV publications for its durability and value.
                </p>
                <a
                  href={`${MEDIA}/2018/12/RV-Armor-Tough-Skin-Brochure.jpg`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 rounded-full bg-white px-5 py-2.5 text-sm font-semibold text-primary hover:bg-gray-100 transition-all"
                >
                  <Download className="w-5 h-5" />
                  View Brochure
                </a>
              </div>
            </div>
          </div>
        </section>

        <CtaSection />
      </Stack>
    </Container>
  )
}
