'use client'
import React from 'react'
import { clsx } from 'clsx'

interface ResponsiveCols {
  mobile?: number
  tablet?: number
  desktop?: number
  wide?: number
}

const colsClass = (n: number) => {
  const map: Record<number, string> = {
    1: 'grid-cols-1', 2: 'grid-cols-2', 3: 'grid-cols-3',
    4: 'grid-cols-4', 5: 'grid-cols-5', 6: 'grid-cols-6',
  }
  return map[n] || 'grid-cols-1'
}

const gapMap = { sm: 'gap-2', md: 'gap-4', lg: 'gap-6', xl: 'gap-8' }

interface GridProps {
  children: React.ReactNode
  responsiveCols?: ResponsiveCols
  gap?: keyof typeof gapMap
  className?: string
}

export function Grid({ children, responsiveCols = { mobile: 1, tablet: 2, desktop: 3 }, gap = 'md', className }: GridProps) {
  const classes = clsx(
    'grid',
    gapMap[gap],
    colsClass(responsiveCols.mobile || 1),
    responsiveCols.tablet && `sm:${colsClass(responsiveCols.tablet)}`,
    responsiveCols.desktop && `md:${colsClass(responsiveCols.desktop)}`,
    responsiveCols.wide && `lg:${colsClass(responsiveCols.wide)}`,
    className
  )
  return <div className={classes}>{children}</div>
}
