'use client'
import React from 'react'
import { twMerge } from 'tailwind-merge'

interface FeatureCardProps {
  icon?: React.ReactNode
  image?: string
  imageAlt?: string
  title: string
  description: string
  variant?: 'light' | 'dark'
  className?: string
  stepNumber?: number
}

export function FeatureCard({
  icon,
  image,
  imageAlt,
  title,
  description,
  variant = 'light',
  className,
  stepNumber,
}: FeatureCardProps) {
  const isLight = variant === 'light'

  return (
    <div
      className={twMerge(
        'group relative rounded-2xl transition-all duration-500 ease-out hover:-translate-y-1.5 overflow-hidden',
        image ? '' : 'p-6 md:p-8',
        isLight
          ? 'ring-glow bg-gradient-to-b from-white to-slate-50/80 border border-primary/[0.08] shadow-sm hover:shadow-xl'
          : 'bg-white/[0.07] border border-white/10 backdrop-blur-sm hover:bg-white/[0.12] hover:border-white/20 hover:shadow-[0_20px_40px_-20px_rgba(0,0,0,0.5)]',
        className
      )}
    >
      {stepNumber !== undefined && (
        <div className="flex justify-center pt-5 pb-1">
          <span className={twMerge(
            'w-10 h-10 rounded-full flex items-center justify-center text-lg font-bold',
            isLight
              ? 'bg-primary text-white'
              : 'bg-white/20 text-white'
          )}>
            {stepNumber}
          </span>
        </div>
      )}
      {image && (
        <div className="relative aspect-[16/10] overflow-hidden">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={image}
            alt={imageAlt || title}
            className="w-full h-full object-cover group-hover:scale-[1.06] transition-transform duration-700 ease-out"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-primary/30 via-transparent to-transparent opacity-60 transition-opacity duration-500 group-hover:opacity-90" />
        </div>
      )}
      <div className={twMerge(
        image ? 'p-6 md:p-8 text-center' : '',
        icon && !image ? 'flex items-start gap-4 md:block' : ''
      )}>
        {icon && !image && (
          <div className="mb-0 md:mb-5 flex-shrink-0">
            <div
              className={twMerge(
                'w-12 h-12 md:w-14 md:h-14 rounded-2xl flex items-center justify-center transition-all duration-500 group-hover:scale-110 group-hover:-rotate-3',
                isLight
                  ? 'bg-gradient-to-br from-accent/15 to-primary/10 ring-1 ring-primary/10 shadow-sm group-hover:shadow-md'
                  : 'bg-white/10 ring-1 ring-white/10 group-hover:bg-white/20'
              )}
            >
              {icon}
            </div>
          </div>
        )}
        <div>
          <h3
            className={twMerge(
              'text-lg font-bold mb-2',
              isLight ? 'text-primary' : 'text-white'
            )}
          >
            {title}
          </h3>
          <p
            className={twMerge(
              'text-sm leading-relaxed',
              isLight ? 'text-gray-600' : 'text-white/70'
            )}
          >
            {description}
          </p>
        </div>
      </div>
    </div>
  )
}
