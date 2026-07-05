'use client'
import React from 'react'
import { twMerge } from 'tailwind-merge'

interface GradientSectionProps {
  children: React.ReactNode
  className?: string
}

export function GradientSection({ children, className }: GradientSectionProps) {
  return (
    <section
      className={twMerge(
        'rounded-2xl border border-[#003365]/20 bg-gradient-to-br from-[#003365]/5 via-white to-[#003365]/5 p-4 md:p-6 lg:p-8',
        className
      )}
    >
      {children}
    </section>
  )
}
