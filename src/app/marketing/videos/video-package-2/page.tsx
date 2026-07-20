import type { Metadata } from 'next'
import { VideoPackagePage } from '@/components/marketing-assets/VideoPackagePage'

export const metadata: Metadata = {
  title: 'Video Package 2',
  description:
    'Pre-built Crazy Seal video advertisement ready for your immediate use. Download the 1080p video file and pair it with ready-made ad copy for every platform.',
}

export default function VideoPackage2Page() {
  return (
    <VideoPackagePage
      number={2}
      videoId="934344427"
      downloadUrl="https://player.vimeo.com/progressive_redirect/download/934344427/rendition/1080p/video_asset_2%20%281080p%29.mp4?loc=external&signature=97eb414e867a91b8e8ceffb1069ec2aa0d3a47dfe24b87af80d8f29f7aca1fa9"
      embedCode={null}
    />
  )
}
