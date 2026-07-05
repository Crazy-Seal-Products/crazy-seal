'use client'
import React from 'react'
import { twMerge } from 'tailwind-merge'

interface ContentImageSectionProps {
  imageSrc: string
  imageAlt: string
  imagePosition?: 'left' | 'right'
  imageAspect?: string
  imageClassName?: string
  gridCols?: string
  variant?: 'light' | 'dark'
  children: React.ReactNode
  className?: string
}

export function ContentImageSection({
  imageSrc,
  imageAlt,
  imagePosition = 'right',
  imageAspect = 'aspect-[4/3]',
  imageClassName,
  gridCols = 'lg:grid-cols-2',
  variant = 'light',
  children,
  className,
}: ContentImageSectionProps) {
  const isLight = variant === 'light'

  const imageBlock = (
    <div className={twMerge('relative rounded-2xl overflow-hidden shadow-lg', imageClassName)}>
      <div className={imageAspect}>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={imageSrc}
          alt={imageAlt}
          className="w-full h-full object-cover"
        />
      </div>
    </div>
  )

  return (
    <section className={className}>
      <div className={twMerge('grid grid-cols-1 gap-10 lg:gap-16 items-center', gridCols)}>
        {imagePosition === 'left' ? (
          <>
            {imageBlock}
            <div className={isLight ? '' : 'text-white'}>{children}</div>
          </>
        ) : (
          <>
            <div className={isLight ? '' : 'text-white'}>{children}</div>
            {imageBlock}
          </>
        )}
      </div>
    </section>
  )
}
