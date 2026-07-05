'use client'
import React from 'react'
import { CheckCircle } from 'lucide-react'
import { clsx } from 'clsx'

const variantStyles = {
  default: '',
  checked: 'flex items-start gap-2',
  bullet: 'list-disc list-inside',
} as const

interface ListItemProps {
  variant?: keyof typeof variantStyles
  children: React.ReactNode
  className?: string
}

export function ListItem({
  variant = 'default',
  children,
  className,
}: ListItemProps) {
  if (variant === 'checked') {
    return (
      <li className={clsx(variantStyles.checked, className)}>
        <CheckCircle className="mt-0.5 h-5 w-5 flex-shrink-0 text-[#5BA411]" />
        <span>{children}</span>
      </li>
    )
  }

  return (
    <li className={clsx(variantStyles[variant], className)}>
      {children}
    </li>
  )
}
