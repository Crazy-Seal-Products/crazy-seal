'use client'

import React from 'react'
import { cn } from '@/lib/utils'
import { PRO_STATUS_LABEL, type ProStatus } from '@/lib/pro/config'

const PILL: Record<ProStatus, string> = {
  member: 'bg-white/15 text-white',
  pro: 'bg-[#5BA411] text-white',
  commercial: 'bg-[#125F97] text-white',
  high_volume: 'bg-[#F9EA1C] text-[#003365]',
}

const PILL_LIGHT: Record<ProStatus, string> = {
  member: 'bg-gray-100 text-gray-700',
  pro: 'bg-[#5BA411] text-white',
  commercial: 'bg-[#125F97] text-white',
  high_volume: 'bg-[#F9EA1C] text-[#003365]',
}

export function StatusPills({
  statuses,
  variant = 'light',
}: {
  statuses: ProStatus[]
  variant?: 'light' | 'dark'
}) {
  return (
    <div className="flex flex-wrap gap-1.5">
      {statuses.map((status) => (
        <span
          key={status}
          className={cn(
            'inline-flex items-center rounded-full px-2.5 py-0.5 text-[11px] font-bold tracking-wide',
            variant === 'dark' ? PILL[status] : PILL_LIGHT[status],
          )}
        >
          {PRO_STATUS_LABEL[status]}
        </span>
      ))}
    </div>
  )
}
