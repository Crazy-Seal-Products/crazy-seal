'use client'
import React from 'react'
import { clsx } from 'clsx'

const gapMap = {
  xs: 'gap-1',
  sm: 'gap-2',
  md: 'gap-4',
  lg: 'gap-8',
  xl: 'gap-12',
  '2xl': 'gap-16',
}

interface StackProps {
  children: React.ReactNode
  gap?: keyof typeof gapMap
  className?: string
}

export function Stack({ children, gap = 'md', className }: StackProps) {
  return (
    <div className={clsx('flex flex-col', gapMap[gap], className)}>
      {children}
    </div>
  )
}
