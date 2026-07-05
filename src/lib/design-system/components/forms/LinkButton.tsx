'use client'
import React from 'react'
import Link from 'next/link'
import { clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'

const variantStyles = {
  primary:
    'bg-primary text-white hover:bg-primary-dark shadow-[0_4px_14px_rgba(0,0,0,0.15)] hover:shadow-[0_6px_20px_rgba(0,51,101,0.3)] hover:-translate-y-0.5',
  accent:
    'bg-accent text-white hover:bg-accent-dark shadow-[0_4px_14px_rgba(0,0,0,0.15)] hover:shadow-[0_6px_20px_rgba(91,164,17,0.3)] hover:-translate-y-0.5',
  outline:
    'bg-transparent border-2 border-gray-300 text-gray-700 hover:border-primary hover:text-primary',
  'outline-white':
    'bg-transparent border-2 border-white/30 text-white hover:bg-white/10',
  white:
    'bg-white text-primary hover:bg-gray-100 shadow-md',
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
      'inline-flex items-center justify-center gap-2 rounded-full font-semibold transition-all duration-300',
      variantStyles[variant],
      sizeStyles[size]
    ),
    className
  )

  if (external || href.startsWith('http') || href.startsWith('tel:') || href.startsWith('mailto:')) {
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
