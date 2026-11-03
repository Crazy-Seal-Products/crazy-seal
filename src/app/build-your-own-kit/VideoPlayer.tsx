'use client'

import { useState } from 'react'
import { Play } from 'lucide-react'
import {
  handleYouTubeThumbFallback,
  youtubeThumbnailUrl,
} from '@/lib/youtube'

interface VideoPlayerProps {
  youtubeId: string
  title: string
  caption?: string
  thumbnail?: string
}

export function VideoPlayer({
  youtubeId,
  title,
  caption,
  thumbnail,
}: VideoPlayerProps) {
  const [playing, setPlaying] = useState(false)
  const thumbnailUrl = thumbnail || youtubeThumbnailUrl(youtubeId)

  return (
    <div className="relative aspect-video rounded-2xl overflow-hidden bg-primary-dark shadow-2xl ring-1 ring-black/5">
      {!playing ? (
        <button
          onClick={() => setPlaying(true)}
          className="absolute inset-0 w-full h-full group cursor-pointer"
          aria-label={`Play video: ${title}`}
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={thumbnailUrl}
            alt={title}
            className="w-full h-full object-cover transition-transform duration-700 ease-out group-hover:scale-105"
            onLoad={
              thumbnail
                ? undefined
                : (e) => handleYouTubeThumbFallback(e, youtubeId)
            }
            onError={
              thumbnail
                ? undefined
                : (e) => handleYouTubeThumbFallback(e, youtubeId)
            }
          />
          <div className="absolute inset-0 bg-gradient-to-t from-primary-dark/75 via-black/15 to-transparent transition-opacity duration-500 group-hover:opacity-80" />
          <div className="absolute inset-0 flex items-center justify-center">
            <span className="relative grid place-items-center">
              <span className="absolute h-16 w-16 rounded-full bg-white/40 animate-pulse-ring sm:h-20 sm:w-20" />
              <span className="relative w-14 h-14 sm:w-16 sm:h-16 rounded-full bg-white flex items-center justify-center shadow-2xl transition-transform duration-300 group-hover:scale-110">
                <Play className="w-6 h-6 sm:w-7 sm:h-7 text-primary ml-1 fill-primary/10" />
              </span>
            </span>
          </div>
          {caption && (
            <p className="absolute bottom-3 left-0 right-0 px-3 text-center text-white text-sm font-semibold tracking-wide drop-shadow">
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
