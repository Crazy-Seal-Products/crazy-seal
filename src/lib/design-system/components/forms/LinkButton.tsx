'use client'
import React from 'react'
import Link from 'next/link'
import { clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'

const variantStyles = {
  primary:
    'btn-sheen bg-gradient-to-b from-primary-light to-primary text-white shadow-[0_6px_18px_-6px_rgba(0,51,101,0.55)] hover:shadow-[0_14px_30px_-10px_rgba(0,51,101,0.6)] hover:-translate-y-0.5',
  accent:
    'btn-sheen bg-gradient-to-b from-accent-light to-accent text-white shadow-[0_6px_18px_-6px_rgba(91,164,17,0.6)] hover:shadow-[0_14px_30px_-10px_rgba(91,164,17,0.65)] hover:-translate-y-0.5',
  outline:
    'bg-white/70 border-2 border-gray-300 text-gray-700 hover:border-primary hover:text-primary hover:bg-white hover:-translate-y-0.5 hover:shadow-md',
  'outline-white':
    'bg-white/5 backdrop-blur-sm border-2 border-white/30 text-white hover:bg-white/15 hover:border-white/60 hover:-translate-y-0.5',
  white:
    'btn-sheen bg-white text-primary shadow-[0_8px_22px_-8px_rgba(0,0,0,0.35)] hover:shadow-[0_16px_32px_-12px_rgba(0,0,0,0.45)] hover:-translate-y-0.5',
} as const

const sizeStyles = {
  sm: 'px-4 py-2 text-sm',
  md: 'px-6 py-2.5 text-sm',
  lg: 'px-6 py-3 text-base',
} as const

interface LinkButtonProps {
  href: string
  variant?: keyof typeof variantStyles
  size?: keyof typeof sizeStyles
  external?: boolean
  children: React.ReactNode
  className?: string
}

export type LinkButtonVariant = keyof typeof variantStyles
export type LinkButtonSize = keyof typeof sizeStyles

/** The LinkButton look for any element (e.g. a <button> that opens a modal). */
export function linkButtonClassName(
  variant: LinkButtonVariant = 'primary',
  size: LinkButtonSize = 'md',
  className?: string
) {
  return twMerge(
    clsx(
      'inline-flex items-center justify-center gap-2 rounded-full font-semibold transition-all duration-300 ease-out active:translate-y-0 active:scale-[0.98] [&>svg]:transition-transform [&:hover>svg:last-child]:translate-x-0.5 cursor-pointer',
      variantStyles[variant],
      sizeStyles[size]
    ),
    className
  )
}

export function LinkButton({
  href,
  variant = 'primary',
  size = 'md',
  external = false,
  children,
  className,
}: LinkButtonProps) {
  const combinedClassName = twMerge(
    clsx(
      'inline-flex items-center justify-center gap-2 rounded-full font-semibold transition-all duration-300 ease-out active:translate-y-0 active:scale-[0.98] [&>svg]:transition-transform [&:hover>svg:last-child]:translate-x-0.5',
      variantStyles[variant],
      sizeStyles[size]
    ),
    className
  )

  // Same-page hash links must be a native <a>. Next.js <Link> intercepts the
  // click and often does nothing on iOS Safari (no scroll, no hash change).
  if (
    external ||
    href.startsWith('#') ||
    href.startsWith('http') ||
    href.startsWith('tel:') ||
    href.startsWith('mailto:')
  ) {
    return (
      <a
        href={href}
        className={combinedClassName}
        {...(href.startsWith('http') ? { target: '_blank', rel: 'noopener noreferrer' } : {})}
      >
        {children}
      </a>
    )
  }

  return (
    <Link href={href} className={combinedClassName}>
      {children}
    </Link>
  )
}
