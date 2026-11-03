'use client'

import React from 'react'
import { useRouter } from 'next/navigation'
import { twMerge } from 'tailwind-merge'
import { hrefWith } from '../ui'
import { inputCls } from '../styles'

/** Picks one Gravity Form (or all) and reloads the archive list with it, keeping the search. */
export function FormPicker({
  forms,
  value,
  total,
  base,
  params,
}: {
  forms: { id: number; title: string; count: number }[]
  value: number | null
  total: number
  base: string
  params: Record<string, string | undefined>
}) {
  const router = useRouter()
  return (
    <select
      aria-label="Form"
      value={value ?? ''}
      onChange={(e) => router.push(hrefWith(base, params, { form: e.target.value || undefined, page: undefined }), { scroll: false })}
      className={twMerge(inputCls, 'w-auto min-w-0 max-w-full cursor-pointer pr-7')}
    >
      <option value="">All forms ({total.toLocaleString()})</option>
      {forms.map((f) => (
        <option key={f.id} value={f.id}>
          {f.title} ({f.count.toLocaleString()})
        </option>
      ))}
    </select>
  )
}
