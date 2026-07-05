'use client'
import React from 'react'
import { clsx } from 'clsx'

const sizeMap = {
  xs: 'text-xs',
  sm: 'text-sm',
  base: 'text-base',
  lg: 'text-lg',
  xl: 'text-xl',
}

interface TextProps {
  children: React.ReactNode
  size?: keyof typeof sizeMap
  className?: string
}

export function Text({ children, size = 'base', className }: TextProps) {
  return <p className={clsx(sizeMap[size], 'text-gray-600 mb-2', className)}>{children}</p>
}
