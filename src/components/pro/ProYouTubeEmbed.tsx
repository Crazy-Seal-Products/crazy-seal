'use client'

import { handleYouTubeThumbFallback, youtubeThumbnailUrl } from '@/lib/youtube'
import { ClickToPlayVideo } from './VideoFrame'

interface ProYouTubeEmbedProps {
  videoId: string
  /**
   * Custom cover image. Needed for videos (e.g. C5FvTulPDaY) that have no
   * maxresdefault thumbnail on img.youtube.com. When omitted, the YouTube
   * thumbnail is used (falling back to hqdefault if maxres is missing).
   */
  thumbnail?: string
  title: string
  /** Optional label shown along the bottom of the poster. */
  caption?: string
  /** Soft gradient glow behind the frame. On by default. */
  halo?: boolean
}

export function ProYouTubeEmbed({ videoId, thumbnail, title, caption, halo = true }: ProYouTubeEmbedProps) {
  return (
    <ClickToPlayVideo
      embedSrc={`https://www.youtube.com/embed/${videoId}?autoplay=1&rel=0`}
      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
      thumbnail={thumbnail || youtubeThumbnailUrl(videoId)}
      title={title}
      caption={caption}
      halo={halo}
      onThumbnailEvent={thumbnail ? undefined : (e) => handleYouTubeThumbFallback(e, videoId)}
    />
  )
}
