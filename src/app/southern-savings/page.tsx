import { Metadata } from 'next'
import { PromoPageTemplate } from '@/components/promo/PromoPageTemplate'

export const metadata: Metadata = {
  title: 'Southern Savings on RV Roofing',
  description: 'Special pricing for Southern RV owners. Protect your RV from sun, heat, and humidity with RV Armor.',
}

export default function SouthernSavingsPage() {
  return (
    <PromoPageTemplate
      headline="Southern Savings on RV Armor"
      subheadline="Exclusive savings for RV owners in the South. Our mobile teams are serving your area with priority scheduling."
      heroColor="from-[#92400e] to-[#d97706]"
      offerText="Special Regional Pricing -- Limited Availability"
      urgencyText="Mobile team slots in southern states fill quickly. Secure your appointment now."
      sourcePage="southern-savings"
      features={[
        { title: 'UV Protection', description: 'Southern sun is brutal on RV roofs. RV Armor reflects heat and blocks UV degradation.' },
        { title: 'Storm Ready', description: 'Hurricane season, severe thunderstorms -- our seamless membrane stands up to extreme weather.' },
        { title: 'No Maintenance', description: 'In southern humidity, coatings degrade fast. RV Armor needs zero maintenance, ever.' },
        { title: 'Mobile Service', description: 'We drive to your location. No towing your RV to a shop, no downtime.' },
      ]}
    />
  )
}
