'use client'
import React, { useState } from 'react'
import { clsx } from 'clsx'
import { Play } from 'lucide-react'

interface YouTubeEmbedProps {
  videoId: string
  variant?: 'default' | 'card'
  className?: string
}

export function YouTubeEmbed({
  videoId,
  variant = 'default',
  className,
}: YouTubeEmbedProps) {
  const [loaded, setLoaded] = useState(false)
  const embedUrl = `https://www.youtube.com/embed/${videoId}?autoplay=1`
  const thumbnailUrl = `https://img.youtube.com/vi/${videoId}/maxresdefault.jpg`

  const handleClick = () => setLoaded(true)

  return (
    <div
      className={clsx(
        'relative aspect-video w-full overflow-hidden bg-gray-900',
        variant === 'card' && 'rounded-2xl',
        className
      )}
    >
      {!loaded ? (
        <button
          type="button"
          onClick={handleClick}
          className="absolute inset-0 flex h-full w-full items-center justify-center focus:outline-none focus-visible:ring-2 focus-visible:ring-[#003365] focus-visible:ring-offset-2"
          aria-label="Play video"
        >
          <img
            src={thumbnailUrl}
            alt="Video thumbnail"
            className="absolute inset-0 h-full w-full object-cover"
          />
          <span className="relative z-10 flex h-16 w-16 items-center justify-center rounded-full bg-[#003365] text-white shadow-lg transition-transform hover:scale-110">
            <Play className="h-8 w-8 fill-current" />
          </span>
        </button>
      ) : (
        <iframe
          src={embedUrl}
          title="YouTube video"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen
          className="absolute inset-0 h-full w-full"
          loading="lazy"
        />
      )}
    </div>
  )
}
