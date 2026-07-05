import { Metadata } from 'next'
import { PromoPageTemplate } from '@/components/promo/PromoPageTemplate'

export const metadata: Metadata = {
  title: 'Beat the Spring Rush',
  description: 'Get ahead of spring camping season with RV Armor. Schedule your roof application before the rush hits.',
}

export default function BeatTheSpringRushPage() {
  return (
    <PromoPageTemplate
      headline="Beat the Spring Rush"
      subheadline="Spring is the busiest time for RV roof work. Get ahead of the crowd and be road-ready when the weather breaks."
      heroColor="from-[#166534] to-[#5BA411]"
      offerText="Early Bird Pricing -- Schedule Now, Save Later"
      urgencyText="Spring appointments book months in advance. Lock in your spot today."
      sourcePage="beat-the-spring-rush"
      features={[
        { title: 'Be Road-Ready', description: 'Get your roof done now so you are ready to hit the road the moment spring arrives.' },
        { title: 'Skip the Wait', description: 'Spring is our busiest season. Booking early means shorter wait times and priority scheduling.' },
        { title: 'Stop Leak Worries', description: 'Winter damage and spring rains expose weak roofs. Replace worry with lifetime protection.' },
        { title: 'No Maintenance Ever', description: 'Other coatings need annual touch-ups. RV Armor is spray once, done forever.' },
      ]}
    />
  )
}
