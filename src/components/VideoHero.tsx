'use client'

import { useState } from 'react'
import { Play, ArrowRight } from 'lucide-react'
import { LinkButton } from '@/lib/design-system'
import { QuoteCta } from '@/components/QuoteButton'

interface VideoHeroProps {
  heading: string
  highlight?: string
  subheading: string
  youtubeId?: string
  imageSrc?: string
  imageAlt?: string
  ctaText?: string
  ctaHref?: string
  badge?: string
  variant?: 'light' | 'dark'
}

export function VideoHero({
  heading,
  highlight,
  subheading,
  youtubeId,
  imageSrc,
  imageAlt = '',
  ctaText,
  ctaHref,
  badge,
  variant = 'light',
}: VideoHeroProps) {
  const isDark = variant === 'dark'
  const [playing, setPlaying] = useState(false)

  return (
    <section className="relative section-bleed overflow-hidden">
      <div className="absolute inset-0 -z-10">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-primary/10 rounded-full blur-3xl" />
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-secondary/10 rounded-full blur-3xl" />
      </div>

      <div className={isDark
        ? 'bg-gradient-to-br from-[#003365] to-[#125F97] px-5 py-4 sm:p-6 md:p-8 lg:p-10'
        : 'bg-gradient-to-br from-primary/5 via-white to-secondary/5 border-y sm:border border-primary/15 px-5 py-4 sm:p-6 md:p-8 lg:p-10'
      }>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-10 items-center">
          <div className="flex flex-col space-y-4">
            {badge && (
              <span className={`inline-flex items-center self-start rounded-full px-3 py-1 text-xs font-semibold uppercase tracking-wide ${
                isDark
                  ? 'bg-[#F9EA1C]/15 text-[#F9EA1C] border border-[#F9EA1C]/30'
                  : 'bg-accent/10 text-accent border border-accent/30'
              }`}>
                {badge}
              </span>
            )}

            <h1 className={`text-2xl sm:text-3xl lg:text-4xl xl:text-5xl font-bold tracking-tight leading-tight ${isDark ? 'text-white' : 'text-gray-900'}`}>
              {heading}
              {highlight && (
                <>
                  <br className="hidden sm:block" />{' '}
                  <span className={isDark ? 'text-[#F9EA1C]' : 'text-primary'}>{highlight}</span>
                </>
              )}
            </h1>

            <p className={`text-base sm:text-lg max-w-xl ${isDark ? 'text-white/80' : 'text-gray-600'}`}>
              {subheading}
            </p>

            {ctaHref ? (
              <div className="flex flex-row flex-wrap items-center gap-3 pt-2">
                <LinkButton href={ctaHref} variant="accent" size="lg">
                  {ctaText}
                  <ArrowRight className="w-5 h-5" />
                </LinkButton>
              </div>
            ) : (
              <QuoteCta
                quoteText={ctaText}
                phoneVariant={isDark ? 'outline-white' : 'outline'}
                className="justify-start pt-2"
              />
            )}
          </div>

          <div className="relative aspect-video rounded-2xl overflow-hidden bg-gray-900 shadow-xl">
            {youtubeId && !playing ? (
              <button
                onClick={() => setPlaying(true)}
                className="absolute inset-0 w-full h-full group cursor-pointer"
                aria-label="Play video"
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={`https://img.youtube.com/vi/${youtubeId}/maxresdefault.jpg`}
                  alt={imageAlt || 'Video thumbnail'}
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-black/30 group-hover:bg-black/20 transition-colors" />
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-white/90 flex items-center justify-center shadow-2xl group-hover:scale-110 transition-transform">
                    <Play className="w-8 h-8 sm:w-10 sm:h-10 text-primary ml-1" />
                  </div>
                </div>
              </button>
            ) : youtubeId && playing ? (
              <iframe
                src={`https://www.youtube.com/embed/${youtubeId}?autoplay=1&rel=0`}
                title="Video"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
                className="absolute inset-0 w-full h-full"
              />
            ) : imageSrc ? (
              /* eslint-disable-next-line @next/next/no-img-element */
              <img
                src={imageSrc}
                alt={imageAlt}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full bg-gradient-to-br from-primary to-secondary flex items-center justify-center">
                <span className="text-white/40 text-sm">Video coming soon</span>
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  )
}
