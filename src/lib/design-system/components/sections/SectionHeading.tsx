'use client'
import React from 'react'
import { twMerge } from 'tailwind-merge'

interface SectionHeadingProps {
  /** Deprecated: sections lead with the heading; kept so existing callers compile. */
  eyebrow?: string
  heading: string
  subheading?: string
  level?: 1 | 2 | 3 | 4 | 5 | 6
  align?: 'center' | 'left'
  variant?: 'light' | 'dark'
  className?: string
}

export function SectionHeading({
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
      <Tag
        className={twMerge(
          'font-extrabold tracking-tight mb-3 text-balance',
          level <= 2 ? 'text-3xl md:text-4xl lg:text-5xl' : 'text-2xl md:text-3xl',
          isLight ? 'text-primary' : 'text-white'
        )}
      >
        {heading}
      </Tag>
      {subheading && (
        <p
          className={twMerge(
            'text-base md:text-lg leading-relaxed mt-4 text-pretty',
            align === 'center' && 'max-w-2xl mx-auto',
            isLight ? 'text-gray-500' : 'text-white/70'
          )}
        >
          {subheading}
        </p>
      )}
    </div>
  )
}
