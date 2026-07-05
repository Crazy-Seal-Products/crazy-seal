'use client'
import React from 'react'
import { clsx } from 'clsx'

const sizeMap = {
  sm: 'max-w-3xl',
  md: 'max-w-5xl',
  default: 'max-w-7xl',
  lg: 'max-w-[1400px]',
  xl: 'max-w-[1600px]',
  full: 'max-w-full',
}

interface ContainerProps {
  children: React.ReactNode
  size?: keyof typeof sizeMap
  className?: string
}

export function Container({ children, size = 'default', className }: ContainerProps) {
  return (
    <div className={clsx('mx-auto w-full px-5 sm:px-6 lg:px-8', sizeMap[size], className)}>
      {children}
    </div>
  )
}
