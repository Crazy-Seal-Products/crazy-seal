'use client'
import React from 'react'
import { twMerge } from 'tailwind-merge'

const levelStyles: Record<number, string> = {
  1: 'text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight mb-4',
  2: 'text-xl md:text-2xl lg:text-3xl font-bold tracking-tight mb-2',
  3: 'text-lg md:text-xl lg:text-2xl font-semibold mb-2',
  4: 'text-base md:text-lg font-semibold mb-2',
  5: 'text-sm md:text-base font-semibold mb-2',
  6: 'text-xs md:text-sm font-semibold uppercase tracking-wider mb-2',
}

interface HeadingProps {
  level?: 1 | 2 | 3 | 4 | 5 | 6
  children: React.ReactNode
  className?: string
}

export function Heading({ level = 2, children, className }: HeadingProps) {
  const Tag = `h${level}` as keyof React.JSX.IntrinsicElements
  return <Tag className={twMerge(levelStyles[level], 'text-primary', className)}>{children}</Tag>
}
