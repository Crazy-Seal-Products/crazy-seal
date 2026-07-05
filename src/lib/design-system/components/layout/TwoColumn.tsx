'use client'
import React from 'react'
import { clsx } from 'clsx'

const gapMap = { sm: 'gap-4', md: 'gap-6', lg: 'gap-8', xl: 'gap-12' }

interface TwoColumnProps {
  children: React.ReactNode
  gap?: keyof typeof gapMap
  reverse?: boolean
  className?: string
}

export function TwoColumn({ children, gap = 'lg', reverse = false, className }: TwoColumnProps) {
  return (
    <div className={clsx(
      'grid grid-cols-1 md:grid-cols-2',
      gapMap[gap],
      reverse && 'md:[&>*:first-child]:order-2',
      className
    )}>
      {children}
    </div>
  )
}
