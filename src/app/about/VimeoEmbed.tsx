'use client'

import { useState } from 'react'
import { Play } from 'lucide-react'

interface VimeoEmbedProps {
  videoId: string
  thumbnail: string
  title: string
}

export function VimeoEmbed({ videoId, thumbnail, title }: VimeoEmbedProps) {
  const [playing, setPlaying] = useState(false)

  return (
    <div className="relative aspect-video rounded-2xl overflow-hidden shadow-2xl ring-1 ring-black/5 bg-primary-dark">
      {!playing ? (
        <button
          onClick={() => setPlaying(true)}
          className="absolute inset-0 w-full h-full group cursor-pointer"
          aria-label="Play video"
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={thumbnail}
            alt={title}
            className="w-full h-full object-cover transition-transform duration-700 ease-out group-hover:scale-105"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-primary-dark/70 via-black/15 to-transparent" />
          <div className="absolute inset-0 flex items-center justify-center">
            <span className="relative grid place-items-center">
              <span className="absolute h-20 w-20 rounded-full bg-white/40 animate-pulse-ring sm:h-24 sm:w-24" />
              <span className="relative w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-white flex items-center justify-center shadow-2xl transition-transform duration-300 group-hover:scale-110">
                <Play className="w-7 h-7 sm:w-8 sm:h-8 text-primary ml-1 fill-primary/10" />
              </span>
            </span>
          </div>
        </button>
      ) : (
        <iframe
          src={`https://player.vimeo.com/video/${videoId}?autoplay=1&title=0&portrait=0&byline=0`}
          title={title}
          allow="autoplay; fullscreen; picture-in-picture"
          allowFullScreen
          className="absolute inset-0 w-full h-full"
        />
      )}
    </div>
  )
}
