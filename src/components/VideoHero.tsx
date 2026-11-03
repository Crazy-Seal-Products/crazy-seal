'use client'

import { useState } from 'react'
import { Play, ArrowRight } from 'lucide-react'
import { LinkButton } from '@/lib/design-system'
import { QuoteCta } from '@/components/QuoteButton'
import { GlowOrb } from '@/components/motion'
import {
  handleYouTubeThumbFallback,
  youtubeThumbnailUrl,
} from '@/lib/youtube'

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

// CSS entrance (runs before hydration, so the hero never flashes empty)
const enter = (delayMs: number) => ({
  className: 'animate-fade-up',
  style: { animationDelay: `${delayMs}ms` },
})

export function VideoHero({
  heading,
  highlight,
  subheading,
  youtubeId,
  imageSrc,
  imageAlt = '',
  ctaText,
  ctaHref,
  variant = 'light',
}: VideoHeroProps) {
  const isDark = variant === 'dark'
  const [playing, setPlaying] = useState(false)

  return (
    <section
      className={`relative section-bleed overflow-hidden ${
        isDark
          ? 'bg-primary'
          : 'bg-gradient-to-br from-primary/5 via-white to-secondary/5 border-y sm:border border-primary/15'
      }`}
    >
      {isDark ? (
        <>
          <GlowOrb className="-left-32 top-10 h-96 w-96" color="rgb(26 123 196 / 0.45)" />
          <GlowOrb className="-right-24 -bottom-24 h-80 w-80" color="rgb(91 164 17 / 0.25)" />
          <div
            aria-hidden="true"
            className="hairline-grid pointer-events-none absolute inset-0 opacity-50 [mask-image:radial-gradient(ellipse_at_center,black,transparent_75%)]"
          />
        </>
      ) : (
        <>
          <GlowOrb className="-left-24 -top-24 h-80 w-80" color="rgb(18 95 151 / 0.12)" />
          <GlowOrb className="-right-24 -bottom-24 h-80 w-80" color="rgb(91 164 17 / 0.12)" />
        </>
      )}

      <div className="relative z-10 px-5 py-8 sm:p-6 md:p-8 lg:p-12">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 items-center">
          <div className="flex flex-col space-y-4">

            <h1
              {...enter(100)}
              className={`animate-fade-up text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight leading-[1.08] text-balance ${
                isDark ? 'text-white' : 'text-primary'
              }`}
            >
              {heading}
              {highlight && (
                <>
                  <br className="hidden sm:block" />{' '}
                  <span className={isDark ? 'text-shimmer-highlight' : 'text-accent-dark'}>{highlight}</span>
                </>
              )}
            </h1>

            <p
              {...enter(180)}
              className={`animate-fade-up text-base sm:text-lg max-w-xl leading-relaxed ${
                isDark ? 'text-white/70' : 'text-gray-600'
              }`}
            >
              {subheading}
            </p>

            <div {...enter(260)} className="animate-fade-up">
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
          </div>

          <div {...enter(200)} className="animate-fade-up relative">
            <div
              aria-hidden="true"
              className="absolute -inset-3 rounded-[1.75rem] bg-gradient-to-br from-highlight/30 via-secondary/20 to-accent/30 blur-2xl"
            />
            <div
              className={`relative aspect-video rounded-2xl overflow-hidden bg-gray-900 shadow-2xl ring-1 ${
                isDark ? 'ring-white/15' : 'ring-primary/10'
              }`}
            >
              {youtubeId && !playing ? (
                <button
                  onClick={() => setPlaying(true)}
                  className="absolute inset-0 w-full h-full group cursor-pointer"
                  aria-label="Play video"
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={youtubeThumbnailUrl(youtubeId)}
                    alt={imageAlt || 'Video thumbnail'}
                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                    onLoad={(e) => handleYouTubeThumbFallback(e, youtubeId)}
                    onError={(e) => handleYouTubeThumbFallback(e, youtubeId)}
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-primary-dark/60 via-black/15 to-transparent" />
                  <div className="absolute inset-0 flex items-center justify-center">
                    <span className="relative grid place-items-center">
                      <span className="absolute h-20 w-20 rounded-full bg-white/40 animate-pulse-ring sm:h-24 sm:w-24" />
                      <span className="relative w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-white flex items-center justify-center shadow-2xl group-hover:scale-110 transition-transform duration-300">
                        <Play className="w-7 h-7 sm:w-8 sm:h-8 text-primary ml-1 fill-primary/10" />
                      </span>
                    </span>
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
      </div>
    </section>
  )
}
