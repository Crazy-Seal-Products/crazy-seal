import { Metadata } from 'next'
import { PromoPageTemplate } from '@/components/promo/PromoPageTemplate'

export const metadata: Metadata = {
  title: 'End of Year Sale',
  description: 'Year-end savings on RV Armor roofing. Start the new year with a roof that lasts a lifetime.',
}

export default function EndOfYearSalePage() {
  return (
    <PromoPageTemplate
      headline="End of the Year Sale"
      subheadline="Close out the year right. Get your RV Armor roof installed before the new year and save."
      heroColor="from-[#003365] to-[#0f766e]"
      offerText="Year-End Savings on Lifetime RV Roofing"
      urgencyText="End-of-year slots are limited. Reserve your appointment before the calendar fills up."
      sourcePage="end-of-the-year-sale"
      features={[
        { title: 'Start Fresh', description: 'Begin the new year knowing your RV roof is permanently protected. No spring maintenance needed.' },
        { title: 'Winter Protection', description: 'Our seamless membrane handles snow, ice, and freezing temps without cracking or peeling.' },
        { title: 'Lifetime Warranty', description: 'This is the last roof your RV will ever need. Fully transferable if you sell.' },
        { title: 'Flexible Scheduling', description: 'We work around your holiday schedule. Mobile service comes to your location.' },
      ]}
    />
  )
}
