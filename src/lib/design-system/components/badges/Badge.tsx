'use client'
import React from 'react'
import { clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'

const variantStyles = {
  primary:
    'bg-[#003365]/10 text-[#003365] border-[#003365]/20',
  secondary:
    'bg-[#003365]/10 text-[#003365] border-[#003365]/20',
  accent:
    'bg-[#5BA411]/10 text-[#5BA411] border-[#5BA411]/20',
  highlight:
    'bg-[#5BA411]/10 text-[#5BA411] border-[#5BA411]/20',
  neutral:
    'bg-gray-100 text-gray-700 border-gray-200',
} as const

const sizeStyles = {
  sm: 'px-2 py-0.5 text-xs',
  md: 'px-2.5 py-1 text-sm',
  lg: 'px-3 py-1.5 text-base',
} as const

interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: keyof typeof variantStyles
  size?: keyof typeof sizeStyles
}

export function Badge({
  variant = 'neutral',
  size = 'md',
  className,
  children,
  ...props
}: BadgeProps) {
  return (
    <span
      className={twMerge(
        clsx(
          'inline-flex items-center font-medium rounded-lg border',
          variantStyles[variant],
          sizeStyles[size]
        ),
        className
      )}
      {...props}
    >
      {children}
    </span>
  )
}
