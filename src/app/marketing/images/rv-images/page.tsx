import type { Metadata } from 'next'
import {
  ImagePackagePage,
  type ImageGallerySection,
} from '@/components/marketing-assets/ImagePackagePage'

export const metadata: Metadata = {
  title: 'RV Images',
  description:
    'Pre-built Crazy Seal RV image assets ready for your immediate use. Landscape and square before-and-after photos of professional RV roof installations, paired with ready-made ad copy.',
}

const SECTIONS: ImageGallerySection[] = [
  {
    heading: 'Landscape Images',
    images: [
      { full: '2019/07/Monaco-Before-After-Front-to-Back.jpg', thumb: '2019/07/Monaco-Before-After-Front-to-Back-300x157.jpg', alt: 'Monaco before and after, front to back' },
      { full: '2019/07/Monaco-Before-After-Back-to-Front.jpg', thumb: '2019/07/Monaco-Before-After-Back-to-Front-300x157.jpg', alt: 'Monaco before and after, back to front' },
      { full: '2019/07/Aruba-Before-After-Front-to-Back.jpg', thumb: '2019/07/Aruba-Before-After-Front-to-Back-300x157.jpg', alt: 'Aruba before and after, front to back' },
      { full: '2019/07/Aruba-Before-After-Back-to-Front.jpg', thumb: '2019/07/Aruba-Before-After-Back-to-Front-300x157.jpg', alt: 'Aruba before and after, back to front' },
      { full: '2019/07/Winnebago-Arial-After.jpg', thumb: '2019/07/Winnebago-Arial-After-300x150.jpg', alt: 'Winnebago aerial after' },
      { full: '2019/05/Monaco-Arial-After-Crazy-Seal.jpg', thumb: '2019/05/Monaco-Arial-After-Crazy-Seal-300x150.jpg', alt: 'Monaco aerial after Crazy Seal' },
      { full: '2019/05/Aruba-Arial-After-Crazy-Seal.jpg', thumb: '2019/05/Aruba-Arial-After-Crazy-Seal-300x150.jpg', alt: 'Aruba aerial after Crazy Seal' },
      { full: '2024/03/RVDA-Cover.jpg', thumb: '2024/03/RVDA-Cover-300x169.jpg', alt: 'RVDA cover' },
      { full: '2020/03/Dallas-Behrens-BDA-1920.jpg', thumb: '2020/03/Dallas-Behrens-BDA-1920-300x169.jpg', alt: 'Dallas Behrens before, during, after' },
      { full: '2020/03/Darrell-Cove-BDA-1920x1080-1.jpg', thumb: '2020/03/Darrell-Cove-BDA-1920x1080-1-300x169.jpg', alt: 'Darrell Cove before, during, after' },
      { full: '2019/09/Darrell-Cove-BDA-2.jpg', thumb: '2019/09/Darrell-Cove-BDA-2-300x175.jpg', alt: 'Darrell Cove before, during, after 2' },
      { full: '2019/09/Darrell-Cove-BDA-1.jpg', thumb: '2019/09/Darrell-Cove-BDA-1-300x175.jpg', alt: 'Darrell Cove before, during, after 1' },
    ],
  },
  {
    heading: 'Square Images',
    images: [
      { full: '2020/03/Direct-To-Deck-Quote-Image-1.jpg', thumb: '2020/03/Direct-To-Deck-Quote-Image-1-300x300.jpg', alt: 'Direct to deck quote image 1' },
      { full: '2020/03/Square-Direct-To-Deck-Quote.jpg', thumb: '2020/03/Square-Direct-To-Deck-Quote-300x300.jpg', alt: 'Square direct to deck quote' },
      { full: '2019/07/Square-Aruba-Front-to-Back.jpg', thumb: '2019/07/Square-Aruba-Front-to-Back-300x300.jpg', alt: 'Square Aruba front to back' },
      { full: '2019/07/Square-Monaco-Arial-Before-After.jpg', thumb: '2019/07/Square-Monaco-Arial-Before-After-300x300.jpg', alt: 'Square Monaco aerial before and after' },
      { full: '2019/07/Square-Monaco-Back-to-Front.jpg', thumb: '2019/07/Square-Monaco-Back-to-Front-300x300.jpg', alt: 'Square Monaco back to front' },
      { full: '2019/07/Square-Monaco-Front-to-Back.jpg', thumb: '2019/07/Square-Monaco-Front-to-Back-300x300.jpg', alt: 'Square Monaco front to back' },
      { full: '2019/07/Square-Winnebago-Arial-Before-After.jpg', thumb: '2019/07/Square-Winnebago-Arial-Before-After-300x300.jpg', alt: 'Square Winnebago aerial before and after' },
      { full: '2019/07/Square-Winnebago-Back-to-Front.jpg', thumb: '2019/07/Square-Winnebago-Back-to-Front-300x300.jpg', alt: 'Square Winnebago back to front' },
      { full: '2019/07/Square-Winnebago-Front-to-Back.jpg', thumb: '2019/07/Square-Winnebago-Front-to-Back-300x300.jpg', alt: 'Square Winnebago front to back' },
      { full: '2019/07/Square-Aruba-Arial-Before-After.jpg', thumb: '2019/07/Square-Aruba-Arial-Before-After-300x300.jpg', alt: 'Square Aruba aerial before and after' },
      { full: '2019/07/Square-Aruba-Back-to-Front.jpg', thumb: '2019/07/Square-Aruba-Back-to-Front-300x300.jpg', alt: 'Square Aruba back to front' },
      { full: '2019/07/Winnebago-After-2.jpg', thumb: '2019/07/Winnebago-After-2-300x300.jpg', alt: 'Winnebago after 2' },
      { full: '2019/07/Winnebago-After-1.jpg', thumb: '2019/07/Winnebago-After-1-300x300.jpg', alt: 'Winnebago after 1' },
      { full: '2019/05/Aruba-Vertical-After-2-Crazy-Seal.jpg', thumb: '2019/05/Aruba-Vertical-After-2-Crazy-Seal-300x300.jpg', alt: 'Aruba vertical after 2 Crazy Seal' },
      { full: '2019/05/Aruba-Vertical-After-1-Crazy-Seal.jpg', thumb: '2019/05/Aruba-Vertical-After-1-Crazy-Seal-300x300.jpg', alt: 'Aruba vertical after 1 Crazy Seal' },
      { full: '2019/05/Monaco-Vertical-After-2-Crazy-Seal.jpg', thumb: '2019/05/Monaco-Vertical-After-2-Crazy-Seal-300x300.jpg', alt: 'Monaco vertical after 2 Crazy Seal' },
      { full: '2019/05/Monaco-Vertical-After-1-Crazy-Seal.jpg', thumb: '2019/05/Monaco-Vertical-After-1-Crazy-Seal-300x300.jpg', alt: 'Monaco vertical after 1 Crazy Seal' },
      { full: '2021/04/Van-Dusseldorp.jpg', thumb: '2021/04/Van-Dusseldorp-300x300.jpg', alt: 'Van Dusseldorp installation' },
      { full: '2021/04/Tom-Kedzie.jpg', thumb: '2021/04/Tom-Kedzie-300x300.jpg', alt: 'Tom Kedzie installation' },
      { full: '2021/04/Teri-Sessoms.jpg', thumb: '2021/04/Teri-Sessoms-300x300.jpg', alt: 'Teri Sessoms installation' },
      { full: '2021/04/Steven-Tuttle.jpg', thumb: '2021/04/Steven-Tuttle-300x300.jpg', alt: 'Steven Tuttle installation' },
      { full: '2021/04/Stan-Wilson.jpg', thumb: '2021/04/Stan-Wilson-300x300.jpg', alt: 'Stan Wilson installation' },
      { full: '2021/04/Robert-Davies.jpg', thumb: '2021/04/Robert-Davies-300x300.jpg', alt: 'Robert Davies installation' },
      { full: '2021/04/Monty-Leaird.jpg', thumb: '2021/04/Monty-Leaird-300x300.jpg', alt: 'Monty Leaird installation' },
      { full: '2021/04/MELVIN-NIXON.jpg', thumb: '2021/04/MELVIN-NIXON-300x300.jpg', alt: 'Melvin Nixon installation' },
      { full: '2021/04/John-Mooney.jpg', thumb: '2021/04/John-Mooney-300x300.jpg', alt: 'John Mooney installation' },
      { full: '2021/04/Elin-Mac-anbhaird.jpg', thumb: '2021/04/Elin-Mac-anbhaird-300x300.jpg', alt: 'Elin Mac anbhaird installation' },
      { full: '2021/04/DOUG-PENNINGTON-2.jpg', thumb: '2021/04/DOUG-PENNINGTON-2-300x300.jpg', alt: 'Doug Pennington installation 2' },
      { full: '2021/04/DOUG-PENNINGTON-1.jpg', thumb: '2021/04/DOUG-PENNINGTON-1-300x300.jpg', alt: 'Doug Pennington installation 1' },
      { full: '2021/04/David-Hutchins.jpg', thumb: '2021/04/David-Hutchins-300x300.jpg', alt: 'David Hutchins installation' },
      { full: '2021/04/Brian-Schwartztrauber.jpg', thumb: '2021/04/Brian-Schwartztrauber-300x300.jpg', alt: 'Brian Schwartztrauber installation' },
      { full: '2021/04/Brian-Mitchell.jpg', thumb: '2021/04/Brian-Mitchell-300x300.jpg', alt: 'Brian Mitchell installation' },
      { full: '2021/04/Asa-Lawler.jpg', thumb: '2021/04/Asa-Lawler-300x300.jpg', alt: 'Asa Lawler installation' },
      { full: '2021/04/Aaron-Ruslander.jpg', thumb: '2021/04/Aaron-Ruslander-300x300.jpg', alt: 'Aaron Ruslander installation' },
      { full: '2021/04/Vicky-Henderson.jpg', thumb: '2021/04/Vicky-Henderson-300x300.jpg', alt: 'Vicky Henderson installation' },
      { full: '2020/06/William-Lewis-Before-After-Square-1.jpg', thumb: '2020/06/William-Lewis-Before-After-Square-1-300x300.jpg', alt: 'William Lewis before and after square 1' },
      { full: '2020/06/William-Lewis-Before-After-Square-2.jpg', thumb: '2020/06/William-Lewis-Before-After-Square-2-300x300.jpg', alt: 'William Lewis before and after square 2' },
      { full: '2020/06/Gary-Dawson-Square.jpg', thumb: '2020/06/Gary-Dawson-Square-300x300.jpg', alt: 'Gary Dawson square' },
      { full: '2020/06/David-Swanson-Square.jpg', thumb: '2020/06/David-Swanson-Square-300x300.jpg', alt: 'David Swanson square' },
      { full: '2020/06/William-Lewis-Square-2.jpg', thumb: '2020/06/William-Lewis-Square-2-300x300.jpg', alt: 'William Lewis square 2' },
      { full: '2020/05/Doug-Evans.jpg', thumb: '2020/05/Doug-Evans-300x300.jpg', alt: 'Doug Evans installation' },
      { full: '2020/05/Mark-Milstead.jpg', thumb: '2020/05/Mark-Milstead-300x300.jpg', alt: 'Mark Milstead installation' },
      { full: '2020/05/Kirk-Chrysler.jpg', thumb: '2020/05/Kirk-Chrysler-300x300.jpg', alt: 'Kirk Chrysler installation' },
      { full: '2020/05/David-Vincent.jpg', thumb: '2020/05/David-Vincent-300x300.jpg', alt: 'David Vincent installation' },
    ],
  },
]

export default function RvImagesPage() {
  return (
    <ImagePackagePage
      title="RV Images"
      sourcePage="marketing-images-rv"
      sections={SECTIONS}
    />
  )
}
