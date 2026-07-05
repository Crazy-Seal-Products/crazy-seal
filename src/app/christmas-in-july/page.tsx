import { Metadata } from 'next'
import { PromoPageTemplate } from '@/components/promo/PromoPageTemplate'

export const metadata: Metadata = {
  title: 'Christmas in July Sale | RV ARMOR',
  description: 'The biggest discounts in RV Armor company history. Book your installation for Southern States and save.',
}

export default function ChristmasInJulyPage() {
  return (
    <PromoPageTemplate
      headline="Christmas in July Sale"
      subheadline="Now through August 31st, 2025. Summer is here, but winter is coming! Book your installation in a Southern State between October 1, 2025 and April 30, 2026 and receive the biggest discounts in company history."
      heroColor="from-[#003365] to-[#125F97]"
      offerText="The Biggest Discounts in Company History"
      urgencyText="Southern State installations Oct 1, 2025 - Apr 30, 2026. Limited spots available."
      sourcePage="christmas-in-july"
      features={[
        { title: '1. Fill Out the Form or Call', description: 'Contact us to get started with a free, no-obligation quote for your RV.' },
        { title: '2. Book Your Roof', description: 'Schedule your installation at a Southern State location between Oct-Apr.' },
        { title: '3. Get Your Discount', description: 'Receive the biggest discount in RV Armor history upon job completion.' },
        { title: 'Why the Sale?', description: 'We want to keep our technicians busy year-round. Southern installations in the winter months mean savings for you.' },
      ]}
    />
  )
}
