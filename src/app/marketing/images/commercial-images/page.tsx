import type { Metadata } from 'next'
import {
  ImagePackagePage,
  type ImageGallerySection,
} from '@/components/marketing-assets/ImagePackagePage'

export const metadata: Metadata = {
  title: 'Commercial Images',
  description:
    'Pre-built Crazy Seal commercial image assets ready for your immediate use. Photos of professional commercial flat roof installations, paired with ready-made ad copy.',
}

const SECTIONS: ImageGallerySection[] = [
  {
    images: [
      { full: '2022/01/Left-Go-Pro.jpg', thumb: '2022/01/Left-Go-Pro.jpg', alt: 'Commercial roof, left GoPro view' },
      { full: '2022/01/Full-1-After-Line-0.jpg', thumb: '2022/01/Full-1-After-Line-0.jpg', alt: 'Commercial roof, full view after' },
      { full: '2022/01/Right-Angle-5.jpg', thumb: '2022/01/Right-Angle-5.jpg', alt: 'Commercial roof, right angle 5' },
      { full: '2022/01/Center-Angle-1.jpg', thumb: '2022/01/Center-Angle-1.jpg', alt: 'Commercial roof, center angle 1' },
      { full: '2022/01/Center-Angle-2.5.jpg', thumb: '2022/01/Center-Angle-2.5.jpg', alt: 'Commercial roof, center angle 2.5' },
      { full: '2022/01/Center-Angle-2.jpg', thumb: '2022/01/Center-Angle-2.jpg', alt: 'Commercial roof, center angle 2' },
      { full: '2022/01/Left-Angle-4.jpg', thumb: '2022/01/Left-Angle-4.jpg', alt: 'Commercial roof, left angle 4' },
      { full: '2022/01/Right-Angle-4.jpg', thumb: '2022/01/Right-Angle-4.jpg', alt: 'Commercial roof, right angle 4' },
      { full: '2022/01/Right-Angle-2.jpg', thumb: '2022/01/Right-Angle-2.jpg', alt: 'Commercial roof, right angle 2' },
      { full: '2022/01/Right-Angle-2-2.jpg', thumb: '2022/01/Right-Angle-2-2.jpg', alt: 'Commercial roof, right angle 2-2' },
      { full: '2022/01/Right-Angle-1.jpg', thumb: '2022/01/Right-Angle-1.jpg', alt: 'Commercial roof, right angle 1' },
      { full: '2022/01/Center-Angle-3.jpg', thumb: '2022/01/Center-Angle-3.jpg', alt: 'Commercial roof, center angle 3' },
      { full: '2022/01/Right-Angle-3.jpg', thumb: '2022/01/Right-Angle-3.jpg', alt: 'Commercial roof, right angle 3' },
      { full: '2022/01/Center-Full-2-After.jpg', thumb: '2022/01/Center-Full-2-After.jpg', alt: 'Commercial roof, center full view after' },
      { full: '2022/01/Right-From-Angle-On-Roof.jpg', thumb: '2022/01/Right-From-Angle-On-Roof.jpg', alt: 'Commercial roof, right angle on roof' },
      { full: '2022/01/Angled-Building-Graphic.jpg', thumb: '2022/01/Angled-Building-Graphic.jpg', alt: 'Angled building graphic' },
    ],
  },
]

export default function CommercialImagesPage() {
  return (
    <ImagePackagePage
      title="Commercial Images"
      sourcePage="marketing-images-commercial"
      sections={SECTIONS}
    />
  )
}
