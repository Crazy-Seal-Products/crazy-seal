'use client'

import { ClickToPlayVideo } from './VideoFrame'

interface ProVimeoEmbedProps {
  videoId: string
  thumbnail: string
  title: string
  /** Optional label shown along the bottom of the poster. */
  caption?: string
  /** Soft gradient glow behind the frame. On by default. */
  halo?: boolean
}

export function ProVimeoEmbed({ videoId, thumbnail, title, caption, halo = true }: ProVimeoEmbedProps) {
  return (
    <ClickToPlayVideo
      embedSrc={`https://player.vimeo.com/video/${videoId}?autoplay=1&title=0&portrait=0&byline=0`}
      allow="autoplay; fullscreen; picture-in-picture"
      thumbnail={thumbnail}
      title={title}
      caption={caption}
      halo={halo}
    />
  )
}
