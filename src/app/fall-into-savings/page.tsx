import { Metadata } from 'next'
import { PromoPageTemplate } from '@/components/promo/PromoPageTemplate'

export const metadata: Metadata = {
  title: 'Fall Into Savings',
  description: 'Fall savings on RV Armor roofing. Protect your RV before winter arrives with a lifetime roof solution.',
}

export default function FallIntoSavingsPage() {
  return (
    <PromoPageTemplate
      headline="Fall Into Savings"
      subheadline="The best time to roof is before you need it. Get your RV protected before winter weather arrives and save this fall."
      heroColor="from-[#78350f] to-[#b45309]"
      offerText="Fall Seasonal Savings on Lifetime RV Roofing"
      urgencyText="Winter is coming. Protect your roof now before freezing temps make repairs harder and more expensive."
      sourcePage="fall-into-savings"
      features={[
        { title: 'Winter-Proof Your RV', description: 'Get ahead of freezing temps, ice dams, and snow load. RV Armor handles it all.' },
        { title: 'Perfect Application Weather', description: 'Fall temperatures are ideal for RV Armor application. Better adhesion, faster curing.' },
        { title: 'End-of-Season Availability', description: 'As camping season winds down, our schedule opens up. Faster booking, shorter waits.' },
        { title: 'Lifetime Peace of Mind', description: 'Park your RV for winter knowing the roof is permanently sealed. No spring surprises.' },
      ]}
    />
  )
}
