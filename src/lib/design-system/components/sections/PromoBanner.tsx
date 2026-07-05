'use client'
import React from 'react'
import Link from 'next/link'
import { clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'
import { ArrowRight } from 'lucide-react'
import { Container } from '../layout/Container'

const variantStyles = {
  primary: {
    wrapper: 'bg-primary',
    button: 'bg-highlight text-primary-dark hover:bg-highlight/90 font-bold',
  },
  secondary: {
    wrapper: 'bg-secondary',
    button: 'bg-highlight text-primary-dark hover:bg-highlight/90 font-bold',
  },
  accent: {
    wrapper: 'bg-accent',
    button: 'bg-white text-accent hover:bg-gray-50',
  },
  white: {
    wrapper: 'bg-white border-y sm:border border-gray-200/80 text-gray-900',
    button: 'bg-accent text-white hover:bg-accent-dark',
  },
} as const

interface PromoBannerProps {
  children: React.ReactNode
  buttonText: string
  buttonHref?: string
  onButtonClick?: () => void
  variant?: keyof typeof variantStyles
  className?: string
}

export function PromoBanner({
  children,
  buttonText,
  buttonHref,
  onButtonClick,
  variant = 'primary',
  className,
}: PromoBannerProps) {
  const styles = variantStyles[variant]

  const buttonClasses = clsx(
    'inline-flex items-center gap-2 rounded-full px-6 py-3 text-sm font-semibold transition-all duration-300 shadow-lg hover:shadow-xl hover:-translate-y-0.5',
    styles.button
  )

  return (
    <section
      className={twMerge(
        'section-bleed py-5 sm:py-6 text-white',
        styles.wrapper,
        className
      )}
    >
      <Container size="xl" className="flex flex-row flex-wrap items-center justify-center sm:justify-between gap-3">
        <div>{children}</div>
        {buttonHref ? (
          <Link href={buttonHref} className={buttonClasses}>
            {buttonText}
            <ArrowRight className="w-4 h-4" />
          </Link>
        ) : (
          <button onClick={onButtonClick} className={clsx(buttonClasses, 'cursor-pointer')}>
            {buttonText}
            <ArrowRight className="w-4 h-4" />
          </button>
        )}
      </Container>
    </section>
  )
}
