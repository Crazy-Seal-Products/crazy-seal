'use client'

import { ViewHeader } from '@/components/portal/ui'

/** The personal portal's greeting: name, business and status pills. */
export function PersonalHeader({ firstName, businessName, pills }: { firstName: string; businessName: string | null; pills: React.ReactNode }) {
  return (
    <ViewHeader
      kicker="Your shop at a glance"
      title={`Hey ${firstName}${businessName ? ` — ${businessName}` : ''}`}
      description="Your Crazy Seal orders, warranties and rewards in one place. File jobs straight from your orders."
    >
      {pills}
    </ViewHeader>
  )
}
