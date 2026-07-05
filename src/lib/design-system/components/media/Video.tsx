'use client'

import React from 'react'
import { clsx } from 'clsx'

/**
 * Derives the MediaConvert-generated thumbnail URL from a video URL.
 *
 * MediaConvert outputs follow this naming convention:
 *   Video:     {base}-1080p.mp4  (or -720p, -original)
 *   Thumbnail: {base}-thumb.0000000.jpg
 */
export function getVideoThumbnailUrl(videoUrl: string): string {
  return videoUrl
    .replace(/-(1080p|720p|original)\.(mp4|mov|webm)$/i, '-thumb.0000000.jpg')
    .replace(/\.(mp4|mov|webm)$/i, '-thumb.0000000.jpg')
}

/**
 * Returns the optimized video URL based on quality preference.
 * Only rewrites URLs that contain /processed/ and don't already have a quality suffix.
 */
export function getOptimizedVideoUrl(
  url: string,
  preferredQuality?: '720p' | '1080p' | 'original'
): string {
  if (url.endsWith('.webm')) return url
  if (url.match(/-(720p|1080p|original)\.(mp4|mov)$/i)) return url
  if (!url.includes('/processed/')) return url

  const quality = preferredQuality || (
    typeof window !== 'undefined' && window.innerWidth < 768 ? '720p' :
    typeof window !== 'undefined' && window.innerWidth < 1440 ? '1080p' :
    'original'
  )

  return url.replace(/\.(mp4|mov)$/i, `-${quality}.mp4`)
}

interface VideoProps extends React.VideoHTMLAttributes<HTMLVideoElement> {
  src: string
  poster?: string
  variant?: 'default' | 'card'
  autoplay?: boolean
  muted?: boolean
  loop?: boolean
  controls?: boolean
  className?: string
  caption?: string
  preload?: 'none' | 'metadata' | 'auto'
}

export const Video = React.forwardRef<HTMLVideoElement, VideoProps>(
  ({
    src,
    poster,
    variant = 'default',
    autoplay = false,
    muted = false,
    loop = false,
    controls = true,
    className = '',
    caption,
    preload = 'metadata',
    ...props
  }, ref) => {
    const videoRef = React.useRef<HTMLVideoElement>(null)
    const [hasStarted, setHasStarted] = React.useState(false)

    React.useImperativeHandle(ref, () => videoRef.current!)

    const variants = {
      default: 'rounded-xl border border-gray-200',
      card: 'rounded-2xl border border-gray-200',
    }

    const resolvedPoster = poster || getVideoThumbnailUrl(src)

    const handlePlay = () => setHasStarted(true)

    const handlePlayButtonClick = () => {
      if (videoRef.current) {
        videoRef.current.play()
      }
    }

    const showPlayOverlay = !hasStarted && !autoplay

    return (
      <div className="flex flex-col">
        <div className={clsx('relative overflow-hidden group', variants[variant], className)}>
          <video
            ref={videoRef}
            src={src}
            poster={resolvedPoster}
            autoPlay={autoplay}
            muted={muted}
            loop={loop}
            controls={hasStarted ? controls : false}
            preload={preload}
            onPlay={handlePlay}
            className="w-full h-auto"
            style={{ aspectRatio: '16/9' }}
            {...props}
          />

          {showPlayOverlay && (
            <div
              className="absolute inset-0 flex items-center justify-center cursor-pointer bg-black/0 hover:bg-black/40 transition-colors duration-300"
              onClick={handlePlayButtonClick}
            >
              <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-white/90 flex items-center justify-center shadow-2xl group-hover:scale-110 transition-transform duration-300">
                <div className="w-0 h-0 border-l-[18px] border-l-[#003365] border-y-[11px] border-y-transparent ml-1" />
              </div>
            </div>
          )}
        </div>

        {caption && (
          <p className="text-center text-sm text-gray-500 mt-2">{caption}</p>
        )}
      </div>
    )
  }
)
Video.displayName = 'Video'
