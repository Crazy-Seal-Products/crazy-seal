import type { Metadata } from 'next'
import Link from 'next/link'
import { ArrowUpRight } from 'lucide-react'
import { Container, SectionHeading } from '@/lib/design-system'
import { ProVimeoEmbed } from '@/components/pro/ProVimeoEmbed'
import {
  AiPromptsBand,
  ContentRequestSection,
  ModuleHero,
  ModuleNav,
  ModuleNext,
} from '@/components/pro/ProgramModule'

const MEDIA = 'https://media.crazyseal.com/site-assets/wp-media'

export const metadata: Metadata = {
  title: 'Sales',
  description:
    'Module 3 of the Crazy Seal Business Accelerator Program. Digital and physical assets for your arsenal to close deals, including digital presentation pages, PDFs, and more.',
}

const ASSET_SECTIONS = [
  {
    heading: 'RV Assets',
    desc: 'Presentation page, savings PDF, brochure, Trailer Life feature and loopable videos.',
    image: `${MEDIA}/2022/01/Sections_RVs.png`,
    alt: 'RV sales assets',
    href: '/resources/sales/rv/',
    linkText: 'See RV Assets',
  },
  {
    heading: 'Facilities Assets',
    desc: 'Presentation page, RFMA magazine feature, brochure and full video explainer.',
    image: `${MEDIA}/2022/01/Sections_Commercial.png`,
    alt: 'Facilities sales assets',
    href: '/resources/sales/facilities/',
    linkText: 'See Facilities Assets',
  },
]

export default function ResourcesSalesPage() {
  return (
    <>
      {/* ─── HERO / MODULE VIDEO ─── */}
      <ModuleHero
        module={3}
        title={
          <>
            <span className="text-shimmer-highlight">Sales</span>
          </>
        }
        tagline="Digital and Physical Assets"
        intro="Everything in your arsenal to close deals: digital presentation pages, PDFs and more."
        media={
          <ProVimeoEmbed
            videoId="937517448"
            thumbnail={`${MEDIA}/2024/04/Module-3-Thumbnail.jpg`}
            title="Module 3: Sales"
          />
        }
        mediaCaption="Module 3: Sales"
      />

      <ModuleNav current={3} />

      {/* ─── ASSET SECTIONS ─── */}
      <Container size="xl" className="sm:pt-4 md:pt-8">
        <div className="section-bleed bg-white border-y sm:border border-gray-200/80 px-5 py-8 sm:px-6 md:p-8 lg:p-12">
          <SectionHeading eyebrow="Assets to Close Deals" heading="Sales Assets by Application" />
          <div className="mx-auto grid max-w-5xl grid-cols-1 gap-4 md:grid-cols-2 lg:gap-6">
            {ASSET_SECTIONS.map((section) => (
              <Link
                key={section.heading}
                href={section.href}
                className="group relative overflow-hidden rounded-3xl bg-gradient-to-b from-slate-50 to-white shadow-sm ring-1 ring-primary/[0.08] transition-all duration-500 hover:-translate-y-1.5 hover:shadow-xl"
              >
                <div className="overflow-hidden">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={section.image}
                    alt={section.alt}
                    className="h-auto w-full object-cover transition-transform duration-700 ease-out group-hover:scale-[1.06]"
                  />
                </div>
                <div className="flex items-center justify-between gap-4 p-5 sm:p-6">
                  <div>
                    <h2 className="text-xl font-extrabold text-primary">{section.heading}</h2>
                    <p className="mt-1 text-sm leading-relaxed text-gray-500">{section.desc}</p>
                    <span className="mt-3 inline-block text-sm font-bold text-accent-dark">{section.linkText}</span>
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

      {/* ─── AI PROMPTS ─── */}
      <AiPromptsBand href="/resources/sales/ai-prompts/" label="See AI Prompts for Sales" variant="light" />

      {/* ─── CONTINUE TO NEXT MODULE + QUICK LINKS ─── */}
      <ModuleNext current={3} />

      {/* ─── CONTENT / FEATURE REQUEST ─── */}
      <ContentRequestSection sourcePage="resources-sales" />
    </>
  )
}
