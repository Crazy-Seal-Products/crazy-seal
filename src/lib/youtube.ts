import type { SyntheticEvent } from 'react'

/** YouTube maxresdefault is often missing; placeholder images are ~120px wide. */
const YOUTUBE_PLACEHOLDER_MAX_WIDTH = 120

export function youtubeThumbnailUrl(
  videoId: string,
  quality: 'maxresdefault' | 'hqdefault' | 'sddefault' = 'maxresdefault'
) {
  return `https://img.youtube.com/vi/${videoId}/${quality}.jpg`
}

/**
 * Swap a missing maxresdefault (404 placeholder) for hqdefault.
 * YouTube still returns a tiny JPEG for missing maxres, so onError alone is not enough.
 */
export function handleYouTubeThumbFallback(
  event: SyntheticEvent<HTMLImageElement>,
  videoId: string
) {
  const img = event.currentTarget
  if (img.dataset.ytFallback === '1') return
  if (!img.src.includes('maxresdefault')) return
  if (event.type === 'load' && img.naturalWidth > YOUTUBE_PLACEHOLDER_MAX_WIDTH) {
    return
  }

  img.dataset.ytFallback = '1'
  img.src = youtubeThumbnailUrl(videoId, 'hqdefault')
}
