'use client'
import React from 'react'
import { clsx } from 'clsx'

interface PageLayoutProps {
  children: React.ReactNode
  className?: string
  id?: string
}

export function PageLayout({ children, className, id }: PageLayoutProps) {
  return (
    <main id={id} className={clsx('flex-1', className)}>
      {children}
    </main>
  )
}
