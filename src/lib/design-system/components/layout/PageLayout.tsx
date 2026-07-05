'use client'
import React from 'react'
import { clsx } from 'clsx'

interface PageLayoutProps {
  children: React.ReactNode
  className?: string
}

export function PageLayout({ children, className }: PageLayoutProps) {
  return (
    <main className={clsx('flex-1', className)}>
      {children}
    </main>
  )
}
