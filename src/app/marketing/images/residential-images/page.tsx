import type { Metadata } from 'next'
import {
  ImagePackagePage,
  type ImageGallerySection,
} from '@/components/marketing-assets/ImagePackagePage'

export const metadata: Metadata = {
  title: 'Residential Images',
  description:
    'Pre-built Crazy Seal residential image assets ready for your immediate use. Photos of professional residential roof installations, paired with ready-made ad copy.',
}

const SECTIONS: ImageGallerySection[] = [
  {
    images: [
      { full: '2022/01/Non-RV-Sunroom-2.jpg', thumb: '2022/01/Non-RV-Sunroom-2-300x300.jpg', alt: 'Sunroom installation 2' },
      { full: '2022/01/Non-RV-Sunroom-1.jpg', thumb: '2022/01/Non-RV-Sunroom-1-300x300.jpg', alt: 'Sunroom installation 1' },
      { full: '2022/01/Non-RV-Philip-Posey.jpg', thumb: '2022/01/Non-RV-Philip-Posey-300x300.jpg', alt: 'Philip Posey installation' },
      { full: '2022/01/Non-RV-John-Aiton-2.jpg', thumb: '2022/01/Non-RV-John-Aiton-2-300x300.jpg', alt: 'John Aiton installation 2' },
      { full: '2022/01/Non-RV-John-Aiton-1.jpg', thumb: '2022/01/Non-RV-John-Aiton-1-300x300.jpg', alt: 'John Aiton installation 1' },
      { full: '2022/01/Non-RV-Gene-Rogers-2.jpg', thumb: '2022/01/Non-RV-Gene-Rogers-2-300x300.jpg', alt: 'Gene Rogers installation 2' },
      { full: '2022/01/Non-RV-Gene-Rogers-1.jpg', thumb: '2022/01/Non-RV-Gene-Rogers-1-300x300.jpg', alt: 'Gene Rogers installation 1' },
      { full: '2022/01/Non-RV-Dan-Horning.jpg', thumb: '2022/01/Non-RV-Dan-Horning-300x300.jpg', alt: 'Dan Horning installation' },
    ],
  },
]

export default function ResidentialImagesPage() {
  return (
    <ImagePackagePage
      title="Residential Images"
      sourcePage="marketing-images-residential"
      sections={SECTIONS}
    />
  )
}
