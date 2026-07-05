'use client'
import React from 'react'
import { CheckCircle } from 'lucide-react'
import { clsx } from 'clsx'

interface CheckListProps {
  items: string[]
  className?: string
}

export function CheckList({ items, className }: CheckListProps) {
  return (
    <ul className={clsx('space-y-2', className)}>
      {items.map((item, i) => (
        <li key={i} className="flex items-start gap-2">
          <CheckCircle className="mt-0.5 h-5 w-5 flex-shrink-0 text-[#5BA411]" />
          <span className="text-gray-600">{item}</span>
        </li>
      ))}
    </ul>
  )
}
