import { Metadata } from 'next'
import { PromoPageTemplate } from '@/components/promo/PromoPageTemplate'

export const metadata: Metadata = {
  title: 'Relief Sale -- RV Roof Repair',
  description: 'Storm damage? Leaking roof? RV Armor provides permanent relief with a lifetime roofing solution.',
}

export default function ReliefSalePage() {
  return (
    <PromoPageTemplate
      headline="RV Roof Relief Sale"
      subheadline="Storm damage, leaks, or an aging roof? Stop patching and get a permanent solution. RV Armor is the last roof your RV will ever need."
      heroColor="from-[#991b1b] to-[#dc2626]"
      offerText="Special Relief Pricing for Damaged RV Roofs"
      urgencyText="Dealing with roof damage? Do not wait -- contact us today for priority scheduling."
      sourcePage="relief-sale"
      features={[
        { title: 'Permanent Fix', description: 'Stop the cycle of patching and recoating. RV Armor bonds directly over your existing roof for a permanent seal.' },
        { title: 'Insurance Friendly', description: 'We work with insurance adjusters regularly. Our lifetime warranty documentation helps your claim.' },
        { title: 'Fast Turnaround', description: 'Priority scheduling for urgent roof repairs. Most applications completed in 1-2 days.' },
        { title: 'All Damage Types', description: 'Hail, wind, UV breakdown, tree damage -- whatever happened, RV Armor restores and protects.' },
      ]}
    />
  )
}
