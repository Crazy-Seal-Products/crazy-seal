import type { Metadata } from 'next'
import Link from 'next/link'
import { ArrowUpRight, Image as ImageIcon } from 'lucide-react'
import { Container, SectionHeading } from '@/lib/design-system'
import { AssetPageFooter } from '@/components/marketing-assets/AssetPageFooter'
import { ModuleHero, ModuleNav } from '@/components/pro/ProgramModule'

const MEDIA = 'https://media.crazyseal.com/site-assets/wp-media'

export const metadata: Metadata = {
  title: 'Image Packages',
  description:
    'Pre-built Crazy Seal image advertising packages ready for your immediate use. RV, commercial, and residential image assets for your Crazy Seal business.',
}

const IMAGE_PACKAGES = [
  {
    heading: 'RV Images',
    desc: 'Landscape and square before & after photos.',
    image: `${MEDIA}/2022/01/Areas_RVs.png`,
    href: '/marketing/images/rv-images/',
  },
  {
    heading: 'Commercial Images',
    desc: 'Professional commercial flat roof installs.',
    image: `${MEDIA}/2022/01/Areas_Commercial.png`,
    href: '/marketing/images/commercial-images/',
  },
  {
    heading: 'Residential Images',
    desc: 'Sunrooms and residential roof installs.',
    image: `${MEDIA}/2022/01/Areas_Residential.png`,
    href: '/marketing/images/residential-images/',
  },
]

export default function MarketingImagesPage() {
  return (
    <>
      {/* ─── HERO ─── */}
      <ModuleHero
        module={2}
        kicker="Marketing Assets"
        icon={ImageIcon}
        title={
          <>
            Image <span className="text-shimmer-highlight">Packages</span>
          </>
        }
        intro="Pre-built image ads for RV, commercial and residential roofs, ready for your immediate use."
        chips={['Full-size files', 'Ready-made ad copy']}
      />

      <ModuleNav current={2} />

      {/* ─── IMAGE PACKAGES ─── */}
      <Container size="xl" className="sm:pt-4 md:pt-8">
        <div className="section-bleed bg-white border-y sm:border border-gray-200/80 px-5 py-8 sm:px-6 md:p-8 lg:p-12">
          <SectionHeading eyebrow="Pick a Package" heading="Images" />
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 lg:gap-6">
            {IMAGE_PACKAGES.map((pkg) => (
              <Link
                key={pkg.heading}
                href={pkg.href}
                className="group relative overflow-hidden rounded-3xl bg-gradient-to-b from-slate-50 to-white shadow-sm ring-1 ring-primary/[0.08] transition-all duration-500 hover:-translate-y-1.5 hover:shadow-xl"
              >
                <div className="relative overflow-hidden">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={pkg.image}
                    alt={pkg.heading}
                    className="aspect-[9/7] w-full object-cover transition-transform duration-700 ease-out group-hover:scale-[1.06]"
                  />
                  <span className="absolute left-3 top-3 inline-flex items-center gap-1.5 rounded-full bg-white/95 px-2.5 py-1 text-[11px] font-bold uppercase tracking-wider text-primary shadow-sm">
                    <ImageIcon className="h-3 w-3" />
                    Images
                  </span>
                </div>
                <div className="flex items-center justify-between gap-3 p-5">
                  <div>
                    <h2 className="text-lg font-extrabold text-primary">{pkg.heading}</h2>
                    <p className="text-sm leading-relaxed text-gray-500">{pkg.desc}</p>
                    <span className="mt-2 inline-block text-sm font-bold text-accent-dark">View Marketing Asset</span>
                  </div>
                  <span className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-primary/[0.06] text-primary transition-all duration-300 group-hover:rotate-45 group-hover:bg-accent group-hover:text-white">
                    <ArrowUpRight className="h-5 w-5" />
                  </span>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </Container>

      {/* ─── BACK / CONTINUE + QUICK LINKS + CONTENT REQUEST ─── */}
      <AssetPageFooter
        module={2}
        sourcePage="marketing-images"
        back={{
          heading: 'Back to Marketing Page',
          label: 'Marketing',
          href: '/resources/marketing',
        }}
        next={{
          heading: 'Continue On to Sales',
          label: 'Sales',
          href: '/resources/sales',
        }}
      />
    </>
  )
}
