'use client'
import React from 'react'
import { twMerge } from 'tailwind-merge'

interface SectionHeadingProps {
  eyebrow?: string
  heading: string
  subheading?: string
  level?: 1 | 2 | 3 | 4 | 5 | 6
  align?: 'center' | 'left'
  variant?: 'light' | 'dark'
  className?: string
}

export function SectionHeading({
  eyebrow,
  heading,
  subheading,
  level = 2,
  align = 'center',
  variant = 'light',
  className,
}: SectionHeadingProps) {
  const Tag = `h${level}` as keyof React.JSX.IntrinsicElements
  const isLight = variant === 'light'

  return (
    <div
      className={twMerge(
        align === 'center' ? 'text-center' : 'text-left',
        'mb-6 md:mb-10',
        className
      )}
    >
      {eyebrow && (
        <p
          className={twMerge(
            'text-xs font-bold uppercase tracking-[0.2em] mb-3',
            isLight ? 'text-accent' : 'text-accent'
          )}
        >
          {eyebrow}
        </p>
      )}
      <Tag
        className={twMerge(
          'font-bold tracking-tight mb-3',
          level <= 2 ? 'text-3xl md:text-4xl lg:text-5xl' : 'text-2xl md:text-3xl',
          isLight ? 'text-primary' : 'text-white'
        )}
      >
        {heading}
      </Tag>
      {subheading && (
        <p
          className={twMerge(
            'text-base md:text-lg leading-relaxed mt-4',
            align === 'center' && 'max-w-2xl mx-auto',
            isLight ? 'text-gray-500' : 'text-white/60'
          )}
        >
          {subheading}
        </p>
      )}
    </div>
  )
}
