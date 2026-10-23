'use client'

import { useState } from 'react'
import { Play } from 'lucide-react'
import { twMerge } from 'tailwind-merge'

/** Click-to-play Vimeo/YouTube frame with a branded poster. */
export function VideoFrame({
  vimeoId,
  youtubeId,
  poster,
  title,
  className,
}: {
  vimeoId?: string
  youtubeId?: string
  poster?: string
  title: string
  className?: string
}) {
  const [playing, setPlaying] = useState(false)
  const src = vimeoId
    ? `https://player.vimeo.com/video/${vimeoId}?autoplay=1&title=0&byline=0&portrait=0`
    : youtubeId
      ? `https://www.youtube.com/embed/${youtubeId}?autoplay=1&rel=0`
      : null

  return (
    <div className={twMerge('relative aspect-video overflow-hidden rounded-2xl bg-black ring-1 ring-white/10 shadow-2xl', className)}>
      {playing && src ? (
        <iframe
          src={src}
          title={title}
          allow="autoplay; fullscreen; picture-in-picture; encrypted-media"
          allowFullScreen
          className="absolute inset-0 h-full w-full"
        />
      ) : (
        <button
          type="button"
          onClick={() => setPlaying(true)}
          className="group absolute inset-0 h-full w-full cursor-pointer"
          aria-label={`Play ${title}`}
        >
          {poster ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={poster} alt="" className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105" />
          ) : (
            <div className="h-full w-full bg-gradient-to-br from-primary to-secondary" />
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/10 to-black/10" />
          <span className="absolute inset-0 grid place-items-center">
            <span className="relative grid place-items-center">
              <span className="absolute h-20 w-20 rounded-full bg-white/40 animate-pulse-ring" />
              <span className="relative grid h-16 w-16 place-items-center rounded-full bg-white shadow-2xl transition-transform duration-300 group-hover:scale-110">
                <Play className="ml-1 h-7 w-7 fill-primary/15 text-primary" />
              </span>
            </span>
          </span>
          <span className="absolute bottom-3 left-4 right-4 truncate text-left text-sm font-semibold text-white">{title}</span>
        </button>
      )}
    </div>
  )
}
