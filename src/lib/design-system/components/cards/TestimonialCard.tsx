'use client'
import React from 'react'
import { Quote, Star } from 'lucide-react'
import { twMerge } from 'tailwind-merge'

interface TestimonialCardProps {
  name: string
  photo?: string
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
        'group relative overflow-hidden rounded-2xl p-6 md:p-8 transition-all duration-500 ease-out hover:-translate-y-1.5',
        isLight
          ? 'ring-glow bg-gradient-to-b from-white to-slate-50/80 border border-primary/[0.08] shadow-sm hover:shadow-xl'
          : 'bg-white/[0.07] border border-white/10 hover:bg-white/[0.12]',
        className
      )}
    >
      <Quote
        aria-hidden="true"
        className={twMerge(
          'absolute right-5 top-5 h-10 w-10 rotate-180 transition-transform duration-500 group-hover:-translate-y-1',
          isLight ? 'text-accent/15' : 'text-white/10'
        )}
      />
      <div className="flex items-center gap-4 mb-5">
        {photo ? (
          /* eslint-disable-next-line @next/next/no-img-element */
          <img
            src={photo}
            alt={name}
            className="w-14 h-14 rounded-full object-cover ring-2 ring-primary/10"
          />
        ) : (
          <div
            className={twMerge(
              'w-14 h-14 rounded-full flex items-center justify-center font-bold text-lg ring-2 ring-primary/10',
              isLight ? 'bg-primary/10 text-primary' : 'bg-white/20 text-white'
            )}
          >
            {name.charAt(0)}
          </div>
        )}
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
