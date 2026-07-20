import type { Metadata } from 'next'
import { VideoPackagePage } from '@/components/marketing-assets/VideoPackagePage'

export const metadata: Metadata = {
  title: 'Video Package 6',
  description:
    'Pre-built Crazy Seal video advertisement ready for your immediate use. Download the 1080p video file, grab the website embed code, and pair it with ready-made ad copy for every platform.',
}

const EMBED_CODE = `<div style="padding:56.25% 0 0 0;position:relative;"><iframe src="https://player.vimeo.com/video/934344461?badge=0&autopause=0&player_id=0&app_id=58479" frameborder="0" allow="autoplay; fullscreen; picture-in-picture; clipboard-write" style="position:absolute;top:0;left:0;width:100%;height:100%;" title="Video Asset 6"></iframe></div><script src="https://player.vimeo.com/api/player.js"></script>`

export default function VideoPackage6Page() {
  return (
    <VideoPackagePage
      number={6}
      videoId="934344461"
      downloadUrl="https://player.vimeo.com/progressive_redirect/download/934344461/rendition/1080p/video_asset_6%20%281080p%29.mp4?loc=external&signature=73387dd4c3965089739982b7a5a0c830931ff1ed7452f72371a17ac402151a48"
      embedCode={EMBED_CODE}
    />
  )
}
