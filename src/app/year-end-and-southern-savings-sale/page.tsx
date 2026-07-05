import { Metadata } from 'next'
import { PromoPageTemplate } from '@/components/promo/PromoPageTemplate'

export const metadata: Metadata = {
  title: 'Year-End & Southern Savings Sale',
  description: 'Special year-end pricing for Southern states. Protect your RV from heat, humidity, and UV with RV Armor.',
}

export default function YearEndSouthernSavingsPage() {
  return (
    <PromoPageTemplate
      headline="Year-End & Southern Savings"
      subheadline="Special pricing for RV owners in the South. Our teams are in your area -- take advantage of local scheduling and save."
      heroColor="from-[#92400e] to-[#5BA411]"
      offerText="Regional Savings for Southern RV Owners"
      urgencyText="Our mobile teams have limited availability in your area. Request a quote while slots remain."
      sourcePage="year-end-and-southern-savings-sale"
      features={[
        { title: 'Built for Southern Heat', description: 'RV Armor reflects UV and resists extreme heat -- critical in southern climates.' },
        { title: 'Humidity Proof', description: 'Seamless application means no seams for moisture to penetrate. Prevents mold and rot.' },
        { title: 'Local Mobile Teams', description: 'Our technicians are already in your region. Local scheduling means faster service.' },
        { title: 'Lifetime Warranty', description: 'One application, permanent protection. The warranty transfers if you sell your RV.' },
      ]}
    />
  )
}
