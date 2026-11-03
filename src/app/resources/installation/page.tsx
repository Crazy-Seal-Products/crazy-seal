import type { Metadata } from 'next'
import Link from 'next/link'
import { ArrowUpRight, FileText, PlayCircle } from 'lucide-react'
import { Container, SectionHeading } from '@/lib/design-system'
import { ProVimeoEmbed } from '@/components/pro/ProVimeoEmbed'
import {
  ContentRequestSection,
  ModuleHero,
  ModuleNav,
  ModuleNext,
} from '@/components/pro/ProgramModule'

const MEDIA = 'https://media.crazyseal.com/site-assets/wp-media'

export const metadata: Metadata = {
  title: 'Installation',
  description:
    'Module 5 of the Crazy Seal Business Accelerator Program. Videos and PDFs explaining the Crazy Seal installation process for membrane roofs and direct to deck applications.',
}

const INSTALL_LINKS = [
  {
    title: 'Membrane Roofs',
    image: `${MEDIA}/2020/02/Over-Membrane-For-Installation-Page.jpg`,
    alt: 'Membrane roof installation videos and PDFs',
    href: '/installation/membrane-roof',
  },
  {
    title: 'Direct to Deck',
    image: `${MEDIA}/2020/02/D2D-For-Installation-Page.jpg`,
    alt: 'Direct to Deck installation videos and PDFs',
    href: '/installation/direct-to-deck',
  },
]

export default function ResourcesInstallationPage() {
  return (
    <>
      {/* ─── HERO / MODULE VIDEO ─── */}
      <ModuleHero
        module={5}
        title={<span className="text-shimmer-highlight">Installation</span>}
        tagline="Installation Videos and PDF's"
        intro="Videos and PDFs explaining the Crazy Seal installation process."
        chips={['Membrane roofs', 'Direct to deck']}
        media={
          <ProVimeoEmbed
            videoId="937517369"
            thumbnail={`${MEDIA}/2024/04/Module-5-Thumbnail.jpg`}
            title="Module 5: Installation"
          />
        }
        mediaCaption="Module 5: Installation"
      />

      <ModuleNav current={5} />

      {/* ─── INSTALLATION VIDEOS AND PDFS ─── */}
      <Container size="xl" className="sm:pt-4 md:pt-8">
        <div className="section-bleed bg-white border-y sm:border border-gray-200/80 px-5 py-8 sm:px-6 md:p-8 lg:p-12">
          <SectionHeading
            eyebrow="Step-by-Step"
            heading="Installation Videos and PDF's"
            subheading="Pick your roof type for the full set of installation videos and PDFs."
          />
          <div className="mx-auto grid max-w-5xl grid-cols-1 gap-4 md:grid-cols-2 lg:gap-6">
            {INSTALL_LINKS.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="group relative overflow-hidden rounded-3xl bg-gradient-to-b from-slate-50 to-white shadow-sm ring-1 ring-primary/[0.08] transition-all duration-500 hover:-translate-y-1.5 hover:shadow-xl"
              >
                <div className="overflow-hidden">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={link.image}
                    alt={link.alt}
                    className="h-auto w-full object-cover transition-transform duration-700 ease-out group-hover:scale-[1.06]"
                  />
                </div>
                <div className="flex items-center justify-between gap-4 p-5 sm:p-6">
                  <div>
                    <h3 className="text-xl font-extrabold text-primary">{link.title}</h3>
                    <p className="mt-2 flex flex-wrap gap-2 text-xs font-semibold">
                      <span className="inline-flex items-center gap-1 rounded-full bg-primary/[0.06] px-2.5 py-1 text-primary">
                        <PlayCircle className="h-3.5 w-3.5" />
                        Videos
                      </span>
                      <span className="inline-flex items-center gap-1 rounded-full bg-accent/10 px-2.5 py-1 text-accent-dark">
                        <FileText className="h-3.5 w-3.5" />
                        PDFs
                      </span>
                    </p>
                  </div>
                  <span className="grid h-11 w-11 shrink-0 place-items-center rounded-full bg-primary/[0.06] text-primary transition-all duration-300 group-hover:rotate-45 group-hover:bg-accent group-hover:text-white">
                    <ArrowUpRight className="h-5 w-5" />
                  </span>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </Container>

      {/* ─── CONTINUE TO NEXT MODULE + QUICK LINKS ─── */}
      <ModuleNext current={5} />

      {/* ─── CONTENT / FEATURE REQUEST ─── */}
      <ContentRequestSection sourcePage="resources-installation" />
    </>
  )
}
