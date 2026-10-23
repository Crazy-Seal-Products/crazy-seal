'use client'

import { useState, type ReactNode, type SyntheticEvent } from 'react'
import { Play } from 'lucide-react'
import { twMerge } from 'tailwind-merge'

/**
 * 16:9 media frame with a soft brand-gradient halo behind it. Shared by every
 * pro video embed so heroes, grids and asset pages all get the same treatment.
 */
export function HaloFrame({
  children,
  halo = true,
  className,
}: {
  children: ReactNode
  halo?: boolean
  className?: string
}) {
  return (
    <div className={twMerge('relative', className)}>
      {halo && (
        <div
          aria-hidden="true"
          className="pointer-events-none absolute -inset-2 rounded-[1.75rem] bg-gradient-to-br from-highlight/25 via-secondary/25 to-accent/30 opacity-70 blur-2xl sm:-inset-3"
        />
      )}
      <div className="relative aspect-video overflow-hidden rounded-2xl bg-primary-dark shadow-2xl ring-1 ring-white/15">
        {children}
      </div>
    </div>
  )
}

interface ClickToPlayVideoProps {
  embedSrc: string
  allow: string
  thumbnail: string
  title: string
  caption?: string
  halo?: boolean
  onThumbnailEvent?: (event: SyntheticEvent<HTMLImageElement>) => void
}

/** Poster with a pulsing play button that swaps to the iframe on click. */
export function ClickToPlayVideo({
  embedSrc,
  allow,
  thumbnail,
  title,
  caption,
  halo = true,
  onThumbnailEvent,
}: ClickToPlayVideoProps) {
  const [playing, setPlaying] = useState(false)

  return (
    <HaloFrame halo={halo}>
      {!playing ? (
        <button
          type="button"
          onClick={() => setPlaying(true)}
          className="group absolute inset-0 h-full w-full cursor-pointer"
          aria-label={`Play video: ${title}`}
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={thumbnail}
            alt={title}
            onLoad={onThumbnailEvent}
            onError={onThumbnailEvent}
            className="h-full w-full object-cover transition-transform duration-700 ease-out group-hover:scale-105"
          />
          <span
            aria-hidden="true"
            className="absolute inset-0 bg-gradient-to-t from-primary-dark/70 via-black/15 to-transparent transition-opacity duration-500 group-hover:opacity-75"
          />
          <span className="absolute inset-0 flex items-center justify-center">
            <span className="relative grid place-items-center">
              <span
                aria-hidden="true"
                className="absolute h-20 w-20 rounded-full bg-white/40 animate-pulse-ring sm:h-24 sm:w-24"
              />
              <span className="relative flex h-16 w-16 items-center justify-center rounded-full bg-white shadow-2xl transition-transform duration-300 group-hover:scale-110 sm:h-20 sm:w-20">
                <Play className="ml-1 h-7 w-7 fill-primary/10 text-primary sm:h-8 sm:w-8" />
              </span>
            </span>
          </span>
          {caption && (
            <span className="absolute inset-x-0 bottom-3 px-4 text-center text-xs font-semibold tracking-wide text-white drop-shadow sm:text-sm">
              {caption}
            </span>
          )}
        </button>
      ) : (
        <iframe
          src={embedSrc}
          title={title}
          allow={allow}
          allowFullScreen
          className="absolute inset-0 h-full w-full"
        />
      )}
    </HaloFrame>
  )
}
