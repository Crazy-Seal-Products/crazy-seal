import type { Metadata } from 'next'
import { Shield, RefreshCw, Briefcase, Check, X, Download } from 'lucide-react'
import { Container, Stack, Heading, Text, Card, Grid } from '@/lib/design-system'
import { VideoHero } from '@/components/VideoHero'
import { CtaSection } from '@/components/CtaSection'

const MEDIA = 'https://media.rv-armor.com/site-assets/wp-media'

export const metadata: Metadata = {
  title: 'Warranty | RV ARMOR',
  description: 'RV Armor lifetime warranty covers materials and labor for life. Fully transferable. VIN-tracked. No fine print.',
}

const WARRANTY_FEATURES = [
  {
    icon: Shield,
    title: 'Lifetime Guarantee',
    description: 'Our warranty is VIN-tracked and covers your RV Armor roof for the life of the vehicle. No time limits, no renewal fees, no annual inspections.',
  },
  {
    icon: Briefcase,
    title: 'Material & Labor',
    description: 'Both materials and labor are fully covered. If you ever need warranty service, our nationwide technician network handles it at no cost to you.',
  },
  {
    icon: RefreshCw,
    title: 'Fully Transferable',
    description: 'The warranty is tied to the VIN, not the owner. When you sell your RV, the warranty automatically transfers to the new owner, adding resale value.',
  },
]

const WARRANTY_COMPARISON = [
  { feature: 'Covers materials', rvArmor: true, prorated: true },
  { feature: 'Covers labor', rvArmor: true, prorated: false },
  { feature: 'Lifetime duration', rvArmor: true, prorated: false },
  { feature: 'Fully transferable', rvArmor: true, prorated: false },
  { feature: 'No annual inspection required', rvArmor: true, prorated: false },
  { feature: 'No renewal fees', rvArmor: true, prorated: false },
  { feature: 'Value decreases over time', rvArmor: false, prorated: true },
  { feature: 'Requires annual maintenance', rvArmor: false, prorated: true },
]

export default function WarrantyPage() {
  return (
    <Container size="xl">
      <Stack gap="lg">
        <VideoHero
          heading="The Last RV Roof You Will Ever Need."
          highlight="Guaranteed!"
          subheading="Not all warranties are created equal. Our lifetime guarantee covers materials and labor for the life of your RV. Watch the video to learn more."
          youtubeId="jynyiZBsfng"
          imageAlt="RV Armor warranty explained"
          badge="Lifetime Guarantee"
          variant="dark"
        />

        {/* Shield + Guarantee */}
        <section>
          <div className="section-bleed bg-gradient-to-br from-[#003365]/5 to-[#125F97]/5 border-y sm:border border-[#003365]/15 px-5 py-6 sm:px-6 md:p-6 lg:p-8">
            <div className="flex flex-col md:flex-row items-center gap-6">
              <div className="flex-shrink-0">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={`${MEDIA}/2018/12/Guarantee-Shield-960.png`}
                  alt="RV Armor Guarantee Shield"
                  className="w-24 h-24 md:w-32 md:h-32 object-contain"
                />
              </div>
              <div className="text-center md:text-left">
                <Heading level={3}>Our Guarantee Is Simple</Heading>
                <Text>
                  Many warranties put the responsibility back on the customer for maintenance, resealing,
                  and regular inspections. Other warranties require you to drive your RV to a service
                  center for costly resealing work. RV Armor is different.
                </Text>
                <Text className="!mb-0">
                  We offer a true material and labor warranty backed by a nationwide technician network.
                  Our one-and-done system means no maintenance, no resealing, and no fine print. If you
                  ever need warranty service, we stand behind our work &mdash; 100%.
                </Text>
              </div>
            </div>
          </div>
        </section>

        {/* Warranty Features */}
        <section>
          <div className="section-bleed bg-white border-y sm:border border-gray-200/80 px-5 py-6 sm:px-6 md:p-6 lg:p-8">
            <div className="text-center mb-8">
              <Heading level={2} className="!text-[#003365]">Not All Warranties Are Created Equal</Heading>
            </div>
            <Grid responsiveCols={{ mobile: 1, tablet: 3 }} gap="md">
              {WARRANTY_FEATURES.map((item) => (
                <Card key={item.title}>
                  <div className="w-12 h-12 rounded-full bg-[#5BA411]/10 flex items-center justify-center mb-4">
                    <item.icon className="w-6 h-6 text-[#5BA411]" />
                  </div>
                  <Heading level={4}>{item.title}</Heading>
                  <Text size="sm" className="!mb-0">{item.description}</Text>
                </Card>
              ))}
            </Grid>
          </div>
        </section>

        {/* Lifetime vs Pro-Rated Comparison */}
        <section>
          <div className="section-bleed bg-white border-y sm:border border-gray-200/80 px-5 py-6 sm:px-6 md:p-6 lg:p-8">
            <Heading level={2} className="!text-[#003365]">
              Lifetime Warranty vs Pro-Rated Warranty
            </Heading>
            <div className="overflow-x-auto mt-4">
              <table className="w-full border-collapse rounded-2xl overflow-hidden border border-gray-200">
              <thead>
                <tr className="bg-[#003365] text-white">
                  <th className="px-4 py-3 text-left font-semibold">Feature</th>
                  <th className="px-4 py-3 text-center font-semibold">RV Armor Lifetime</th>
                  <th className="px-4 py-3 text-center font-semibold">Pro-Rated</th>
                </tr>
              </thead>
              <tbody>
                {WARRANTY_COMPARISON.map((row, i) => (
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
                      {row.prorated ? (
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

        {/* Advantages mini */}
        <section>
          <div className="section-bleed bg-white border-y sm:border border-gray-200/80 px-5 py-6 sm:px-6 md:p-6 lg:p-8">
            <div className="text-center mb-8">
              <Heading level={2} className="!text-[#003365]">RV Armor Advantages</Heading>
            </div>
            <Grid responsiveCols={{ mobile: 2, tablet: 3, desktop: 6 }} gap="sm">
              {['Guaranteed', 'Affordable', 'Convenient', 'Nationwide', 'Comprehensive', 'Permanent'].map((item) => (
                <div key={item} className="text-center p-4 rounded-xl bg-[#003365]/5">
                  <p className="font-bold text-[#003365] uppercase text-sm">{item}</p>
                </div>
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
