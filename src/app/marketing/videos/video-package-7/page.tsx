import type { Metadata } from 'next'
import { VideoPackagePage } from '@/components/marketing-assets/VideoPackagePage'

export const metadata: Metadata = {
  title: 'Video Package 7',
  description:
    'Pre-built Crazy Seal video advertisement ready for your immediate use. Download the 1080p video file, grab the website embed code, and pair it with ready-made ad copy for every platform.',
}

const EMBED_CODE = `<div style="padding:56.25% 0 0 0;position:relative;"><iframe src="https://player.vimeo.com/video/934344472?badge=0&autopause=0&player_id=0&app_id=58479" frameborder="0" allow="autoplay; fullscreen; picture-in-picture; clipboard-write" style="position:absolute;top:0;left:0;width:100%;height:100%;" title="Video Asset 7"></iframe></div><script src="https://player.vimeo.com/api/player.js"></script>`

export default function VideoPackage7Page() {
  return (
    <VideoPackagePage
      number={7}
      videoId="934344472"
      downloadUrl="https://player.vimeo.com/progressive_redirect/download/934344472/rendition/1080p/video_asset_7%20%281080p%29.mp4?loc=external&signature=34cba4384a1e2cd7507731f4b75619e1808928871ed19c00c321a0e7967b8b83"
      embedCode={EMBED_CODE}
    />
  )
}
