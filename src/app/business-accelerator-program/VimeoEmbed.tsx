'use client'
import React, { useState } from 'react'
import { clsx } from 'clsx'
import { Play } from 'lucide-react'

interface VimeoEmbedProps {
  videoId: string
  poster: string
  title?: string
  className?: string
}

export function VimeoEmbed({
  videoId,
  poster,
  title = 'Vimeo video',
  className,
}: VimeoEmbedProps) {
  const [loaded, setLoaded] = useState(false)
  const embedUrl = `https://player.vimeo.com/video/${videoId}?autoplay=1&title=0&byline=0&portrait=0`

  return (
    <div
      className={clsx(
        'relative aspect-video w-full overflow-hidden rounded-2xl bg-gray-900',
        className
      )}
    >
      {!loaded ? (
        <button
          type="button"
          onClick={() => setLoaded(true)}
          className="absolute inset-0 flex h-full w-full items-center justify-center focus:outline-none focus-visible:ring-2 focus-visible:ring-[#003365] focus-visible:ring-offset-2"
          aria-label="Play video"
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={poster}
            alt={`${title} thumbnail`}
            className="absolute inset-0 h-full w-full object-cover"
          />
          <span className="relative z-10 flex h-16 w-16 items-center justify-center rounded-full bg-[#003365] text-white shadow-lg transition-transform hover:scale-110">
            <Play className="h-8 w-8 fill-current" />
          </span>
        </button>
      ) : (
        <iframe
          src={embedUrl}
          title={title}
          allow="autoplay; fullscreen; picture-in-picture"
          allowFullScreen
          className="absolute inset-0 h-full w-full"
          loading="lazy"
        />
      )}
    </div>
  )
}
