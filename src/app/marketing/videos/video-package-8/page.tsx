import type { Metadata } from 'next'
import { VideoPackagePage } from '@/components/marketing-assets/VideoPackagePage'

export const metadata: Metadata = {
  title: 'Video Package 8',
  description:
    'Pre-built Crazy Seal video advertisement ready for your immediate use. Download the 1080p video file, grab the website embed code, and pair it with ready-made ad copy for every platform.',
}

const EMBED_CODE = `<div style="padding:56.25% 0 0 0;position:relative;"><iframe src="https://player.vimeo.com/video/934344485?badge=0&autopause=0&player_id=0&app_id=58479" frameborder="0" allow="autoplay; fullscreen; picture-in-picture; clipboard-write" style="position:absolute;top:0;left:0;width:100%;height:100%;" title="Video Asset 8"></iframe></div><script src="https://player.vimeo.com/api/player.js"></script>`

export default function VideoPackage8Page() {
  return (
    <VideoPackagePage
      number={8}
      videoId="934344485"
      downloadUrl="https://player.vimeo.com/progressive_redirect/playback/934344485/rendition/1080p/file.mp4?loc=external&log_user=0&signature=9b48dfd7d22bfc2999c5f91a03fafce4795a3738fd408e7b5ed20f05af9d5bcf"
      embedCode={EMBED_CODE}
    />
  )
}
