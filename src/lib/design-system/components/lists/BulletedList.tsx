'use client'
import React from 'react'
import { clsx } from 'clsx'

interface BulletedListProps {
  items: React.ReactNode[]
  className?: string
}

export function BulletedList({ items, className }: BulletedListProps) {
  return (
    <ul className={clsx('list-disc list-inside space-y-2 text-gray-600', className)}>
      {items.map((item, i) => (
        <li key={i}>{item}</li>
      ))}
    </ul>
  )
}
