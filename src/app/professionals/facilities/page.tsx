import type { Metadata } from 'next'
import { FacilityAudiencePage } from '@/components/pro/FacilityAudiencePage'

export const metadata: Metadata = {
  title: 'Facilities',
  description:
    'Facility owners and operators choose Crazy Seal to stretch their roofing budgets. Our one and done system can be applied in stages, ultimately resulting in a full seamless roof.',
}

export default function FacilitiesProfessionalsPage() {
  return (
    <FacilityAudiencePage
      audienceHeading="Facilities"
      audienceIntro="Facility owners and operators choose Crazy Seal to stretch their roofing budgets. Our one and done system can be applied in stages, ultimately resulting in a full seamless roof. We'd love to have a conversation to see how we can help stretch your budget!"
      sourcePage="professionals-facilities"
    />
  )
}
