'use client'
import React from 'react'
import { Star } from 'lucide-react'
import { twMerge } from 'tailwind-merge'

interface TestimonialCardProps {
  name: string
  photo: string
  text: string
  rating?: number
  variant?: 'light' | 'dark'
  className?: string
}

export function TestimonialCard({
  name,
  photo,
  text,
  rating = 5,
  variant = 'light',
  className,
}: TestimonialCardProps) {
  const isLight = variant === 'light'

  return (
    <div
      className={twMerge(
        'rounded-2xl p-6 md:p-8 transition-all duration-300 hover:-translate-y-1',
        isLight
          ? 'bg-white border border-gray-200/80 shadow-sm hover:shadow-lg'
          : 'bg-white/10 border border-white/10 hover:bg-white/15',
        className
      )}
    >
      <div className="flex items-center gap-4 mb-5">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={photo}
          alt={name}
          className="w-14 h-14 rounded-full object-cover ring-2 ring-primary/10"
        />
        <div>
          <p className={twMerge('font-semibold', isLight ? 'text-gray-900' : 'text-white')}>
            {name}
          </p>
          {rating > 0 && (
            <div className="flex gap-0.5 mt-1">
              {Array.from({ length: rating }).map((_, i) => (
                <Star key={i} className="w-4 h-4 text-amber-400 fill-amber-400" />
              ))}
            </div>
          )}
        </div>
      </div>
      <p
        className={twMerge(
          'leading-relaxed',
          isLight ? 'text-gray-600' : 'text-white/80'
        )}
      >
        &ldquo;{text}&rdquo;
      </p>
    </div>
  )
}
