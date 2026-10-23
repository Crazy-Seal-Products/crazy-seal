'use client'
import React from 'react'
import { clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'

const variantStyles = {
  default:
    'bg-white border border-primary/[0.08] shadow-sm hover:shadow-md',
  elevated:
    'bg-white border border-primary/[0.06] shadow-md hover:shadow-xl',
  outlined:
    'bg-white border-2 border-gray-200',
  dark:
    'bg-primary text-white border border-white/10',
  glass:
    'bg-white/60 backdrop-blur-sm border border-white/80 shadow-sm',
} as const

interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: keyof typeof variantStyles
  hoverLift?: boolean
}

export function Card({
  variant = 'default',
  hoverLift = false,
  className,
  children,
  ...props
}: CardProps) {
  return (
    <div
      className={twMerge(
        clsx(
          'rounded-2xl p-6 md:p-8 transition-all duration-300',
          variantStyles[variant],
          hoverLift && 'hover:-translate-y-1.5'
        ),
        className
      )}
      {...props}
    >
      {children}
    </div>
  )
}
