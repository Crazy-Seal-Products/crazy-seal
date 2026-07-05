'use client'
import React from 'react'
import { clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'

const variantStyles = {
  dark: 'bg-[#003365] text-white',
  light: 'bg-gray-100 text-gray-800 border-b border-gray-200',
} as const

interface HeaderBarSectionProps {
  icon?: React.ReactNode
  label: string
  variant?: keyof typeof variantStyles
  children: React.ReactNode
  className?: string
}

export function HeaderBarSection({
  icon,
  label,
  variant = 'dark',
  children,
  className,
}: HeaderBarSectionProps) {
  return (
    <section className={twMerge('w-full', className)}>
      <div
        className={clsx(
          'flex items-center gap-2 px-4 py-3 md:px-6 md:py-4',
          variantStyles[variant]
        )}
      >
        {icon && <span className="flex-shrink-0">{icon}</span>}
        <span className="font-semibold text-sm md:text-base">{label}</span>
      </div>
      <div className="p-4 md:p-6">{children}</div>
    </section>
  )
}
