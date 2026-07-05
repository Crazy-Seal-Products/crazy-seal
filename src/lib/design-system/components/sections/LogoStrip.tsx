'use client'
import React from 'react'
import { twMerge } from 'tailwind-merge'

interface Logo {
  name: string
  src: string
}

interface LogoStripProps {
  logos: Logo[]
  className?: string
}

export function LogoStrip({ logos, className }: LogoStripProps) {
  return (
    <div
      className={twMerge(
        'grid gap-6',
        className
      )}
      style={{ gridTemplateColumns: `repeat(${logos.length}, 1fr)` }}
    >
      {logos.map((logo) => (
        <div key={logo.name} className="flex items-center justify-center">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={logo.src}
            alt={logo.name}
            className="w-full h-auto max-h-52 object-contain"
          />
        </div>
      ))}
    </div>
  )
}
