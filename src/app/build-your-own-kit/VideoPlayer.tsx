'use client'

import { useState } from 'react'
import { Play } from 'lucide-react'

interface VideoPlayerProps {
  youtubeId: string
  title: string
  caption?: string
}

export function VideoPlayer({ youtubeId, title, caption }: VideoPlayerProps) {
  const [playing, setPlaying] = useState(false)

  return (
    <div className="relative aspect-video rounded-2xl overflow-hidden bg-gray-900 shadow-xl">
      {!playing ? (
        <button
          onClick={() => setPlaying(true)}
          className="absolute inset-0 w-full h-full group cursor-pointer"
          aria-label={`Play video: ${title}`}
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={`https://img.youtube.com/vi/${youtubeId}/maxresdefault.jpg`}
            alt={title}
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-black/40 group-hover:bg-black/30 transition-colors" />
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-full bg-white flex items-center justify-center shadow-2xl group-hover:scale-110 transition-transform duration-300">
              <Play className="w-6 h-6 sm:w-7 sm:h-7 text-primary ml-1" />
            </div>
          </div>
          {caption && (
            <p className="absolute bottom-3 left-0 right-0 text-center text-white text-sm font-medium">
              {caption}
            </p>
          )}
        </button>
      ) : (
        <iframe
          src={`https://www.youtube.com/embed/${youtubeId}?autoplay=1&rel=0`}
          title={title}
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen
          className="absolute inset-0 w-full h-full"
        />
      )}
    </div>
  )
}
