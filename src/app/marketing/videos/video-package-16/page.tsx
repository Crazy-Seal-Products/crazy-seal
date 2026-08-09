import type { Metadata } from 'next'
import { VideoPackagePage } from '@/components/marketing-assets/VideoPackagePage'

export const metadata: Metadata = {
  title: 'Video Package 16',
  description:
    'Pre-built Crazy Seal video advertisement ready for your immediate use. Download the 1080p video file, grab the website embed code, and pair it with ready-made ad copy for every platform.',
}

const EMBED_CODE = `<div style="padding:56.25% 0 0 0;position:relative;"><iframe src="https://player.vimeo.com/video/934344572?badge=0&autopause=0&player_id=0&app_id=58479" frameborder="0" allow="autoplay; fullscreen; picture-in-picture; clipboard-write" style="position:absolute;top:0;left:0;width:100%;height:100%;" title="Video Asset 16"></iframe></div><script src="https://player.vimeo.com/api/player.js"></script>`

export default function VideoPackage16Page() {
  return (
    <VideoPackagePage
      number={16}
      videoId="934344572"
      downloadUrl="https://player.vimeo.com/progressive_redirect/download/934344572/rendition/1080p/video_asset_16%20%281080p%29.mp4?loc=external&signature=864c852d1bd44a6a38611ef22ae9901966a75879b6e2b707baba600ccbe7648a"
      embedCode={EMBED_CODE}
    />
  )
}
