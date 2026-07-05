'use client'
import React from 'react'
import { clsx } from 'clsx'

const sizeStyles = {
  sm: 'w-4 h-4 border-2',
  md: 'w-6 h-6 border-2',
  lg: 'w-8 h-8 border-[3px]',
  xl: 'w-10 h-10 border-[3px]',
} as const

interface SpinnerProps {
  size?: keyof typeof sizeStyles
  className?: string
}

export function Spinner({ size = 'md', className }: SpinnerProps) {
  return (
    <div
      className={clsx(
        'animate-spin rounded-full border-[#003365] border-t-transparent',
        sizeStyles[size],
        className
      )}
      role="status"
      aria-label="Loading"
    />
  )
}
