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
        'group rounded-2xl transition-all duration-300 hover:-translate-y-1 overflow-hidden',
        image ? '' : 'p-6 md:p-8',
        isLight
          ? 'bg-white border border-gray-200/80 shadow-sm hover:shadow-lg hover:border-primary/20'
          : 'bg-white/10 border border-white/10 hover:bg-white/15',
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
        <div className="aspect-[16/10] overflow-hidden">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={image}
            alt={imageAlt || title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          />
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
                'w-12 h-12 md:w-14 md:h-14 rounded-xl flex items-center justify-center transition-colors duration-300',
                isLight
                  ? 'bg-primary/8 group-hover:bg-primary/15'
                  : 'bg-white/10 group-hover:bg-white/20'
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
              isLight ? 'text-primary' : 'text-white',
              image && 'inline-block bg-primary/8 rounded-lg px-3 py-1'
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
