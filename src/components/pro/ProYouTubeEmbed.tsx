'use client'

import { useState } from 'react'
import { Play } from 'lucide-react'

interface ProYouTubeEmbedProps {
  videoId: string
  /**
   * Custom cover image. Needed for videos (e.g. C5FvTulPDaY) that have no
   * maxresdefault thumbnail on img.youtube.com.
   */
  thumbnail: string
  title: string
}

export function ProYouTubeEmbed({ videoId, thumbnail, title }: ProYouTubeEmbedProps) {
  const [playing, setPlaying] = useState(false)

  return (
    <div className="relative aspect-video rounded-2xl overflow-hidden shadow-lg ring-1 ring-black/5 bg-gray-900">
      {!playing ? (
        <button
          onClick={() => setPlaying(true)}
          className="absolute inset-0 w-full h-full group cursor-pointer"
          aria-label={`Play video: ${title}`}
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={thumbnail}
            alt={title}
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-black/30 group-hover:bg-black/20 transition-colors" />
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-white flex items-center justify-center shadow-2xl group-hover:scale-110 transition-transform duration-300">
              <Play className="w-7 h-7 sm:w-8 sm:h-8 text-primary ml-1" />
            </div>
          </div>
        </button>
      ) : (
        <iframe
          src={`https://www.youtube.com/embed/${videoId}?autoplay=1&rel=0`}
          title={title}
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen
          className="absolute inset-0 w-full h-full"
        />
      )}
    </div>
  )
}
