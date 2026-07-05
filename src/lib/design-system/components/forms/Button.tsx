'use client'
import React from 'react'
import { clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'

const variantStyles = {
  primary:
    'bg-[#003365] text-white hover:bg-[#002A54] shadow-[0_4px_14px_rgba(0,0,0,0.15)] hover:shadow-[0_6px_20px_rgba(0,51,101,0.3)] hover:-translate-y-0.5',
  secondary:
    'bg-[#003365] text-white hover:bg-[#002A54] shadow-[0_4px_14px_rgba(0,0,0,0.15)] hover:shadow-[0_6px_20px_rgba(0,51,101,0.3)] hover:-translate-y-0.5',
  accent:
    'bg-[#5BA411] text-white hover:bg-[#4A870E] shadow-[0_4px_14px_rgba(0,0,0,0.15)] hover:shadow-[0_6px_20px_rgba(91,164,17,0.3)] hover:-translate-y-0.5',
  highlight:
    'bg-[#5BA411] text-white hover:bg-[#4A870E] shadow-[0_4px_14px_rgba(0,0,0,0.15)] hover:shadow-[0_6px_20px_rgba(91,164,17,0.3)] hover:-translate-y-0.5',
  ghost:
    'bg-transparent text-gray-700 hover:bg-gray-100 focus-visible:ring-2 focus-visible:ring-[#003365] focus-visible:ring-offset-2',
  outline:
    'bg-transparent border-2 border-gray-300 text-gray-700 hover:border-[#003365] hover:text-[#003365] focus-visible:ring-2 focus-visible:ring-[#003365] focus-visible:ring-offset-2',
  danger:
    'bg-red-600 text-white hover:bg-red-700 shadow-[0_4px_14px_rgba(0,0,0,0.15)] hover:-translate-y-0.5 focus-visible:ring-2 focus-visible:ring-red-500 focus-visible:ring-offset-2',
} as const

const sizeStyles = {
  sm: 'h-8 px-4 text-sm rounded-lg md:px-5',
  md: 'h-10 px-5 text-sm rounded-xl md:px-7',
  lg: 'h-12 px-6 text-base rounded-xl md:px-10',
  xl: 'h-14 px-8 text-base rounded-xl md:px-12',
} as const

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: keyof typeof variantStyles
  size?: keyof typeof sizeStyles
  asChild?: boolean
  children: React.ReactNode
  className?: string
}

export function Button({
  variant = 'primary',
  size = 'md',
  asChild = false,
  children,
  className,
  disabled,
  ...props
}: ButtonProps) {
  const baseStyles =
    'inline-flex items-center justify-center font-semibold transition-all duration-300 focus:outline-none focus-visible:ring-2 focus-visible:ring-[#003365] focus-visible:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:translate-y-0'
  const combinedClassName = twMerge(
    clsx(baseStyles, variantStyles[variant], sizeStyles[size]),
    className
  )

  if (asChild && React.isValidElement(children)) {
    const child = children as React.ReactElement<{ className?: string }>
    return React.cloneElement(child, {
      className: twMerge(combinedClassName, child.props.className),
      ...props,
    })
  }

  return (
    <button
      type="button"
      className={combinedClassName}
      disabled={disabled}
      {...props}
    >
      {children}
    </button>
  )
}
