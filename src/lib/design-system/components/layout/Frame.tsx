'use client'
import React from 'react'
import { clsx } from 'clsx'

interface FrameProps {
  children: React.ReactNode
  ratio?: string
  className?: string
}

export function Frame({ children, ratio = '16/9', className }: FrameProps) {
  return (
    <div className={clsx('relative overflow-hidden', className)} style={{ aspectRatio: ratio }}>
      {children}
    </div>
  )
}
