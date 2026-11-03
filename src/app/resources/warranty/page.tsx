import type { Metadata } from 'next'
import { ArrowRight, Check, Download, ShieldCheck } from 'lucide-react'
import { Container, SectionHeading, LinkButton } from '@/lib/design-system'
import { ProVimeoEmbed } from '@/components/pro/ProVimeoEmbed'
import {
  ContentRequestSection,
  ModuleHero,
  ModuleNav,
  ModuleNext,
} from '@/components/pro/ProgramModule'

const MEDIA = 'https://media.crazyseal.com/site-assets/wp-media'

const WARRANTY_PDF = `${MEDIA}/2019/06/Crazy-Seal-Warranty-Certificate-Download.pdf`

export const metadata: Metadata = {
  title: 'Warranty',
  description:
    'Module 6 of the Crazy Seal Business Accelerator Program. Learn how to file the 50 year product warranty form on behalf of your customers on completed projects.',
}

const WARRANTY_STEPS = [
  'Install a kit, then fill out our warranty form with before and after pictures',
  'Your customer gets a confirmation PDF by email, and so do you',
  'Warranties are also transferrable on the same page',
]

export default function ResourcesWarrantyPage() {
  return (
    <>
      {/* ─── HERO / MODULE VIDEO ─── */}
      <ModuleHero
        module={6}
        title={<span className="text-shimmer-highlight">Warranty</span>}
        tagline="We offer a 50 year Product Warranty on Completed Projects"
        intro={
          <ul className="mx-auto w-fit space-y-2.5 text-left text-base lg:mx-0">
            {WARRANTY_STEPS.map((step) => (
              <li key={step} className="flex items-start gap-2.5">
                <span className="mt-0.5 grid h-5 w-5 shrink-0 place-items-center rounded-full bg-accent/20 ring-1 ring-accent/40">
                  <Check className="h-3 w-3 text-accent-light" strokeWidth={3} />
                </span>
                {step}
              </li>
            ))}
          </ul>
        }
        actions={
          <LinkButton href="/warranty" variant="accent" size="lg">
            Submit Warranty Form
            <ArrowRight className="h-4 w-4" />
          </LinkButton>
        }
        media={
          <ProVimeoEmbed
            videoId="937517390"
            thumbnail={`${MEDIA}/2024/04/Module-6-Thumbnail.jpg`}
            title="Module 6: Warranty"
          />
        }
        mediaCaption="Module 6: Warranty"
      />

      <ModuleNav current={6} />

      {/* ─── WARRANTY PDF ─── */}
      <Container size="xl" className="sm:pt-4 md:pt-8">
        <div className="section-bleed bg-white border-y sm:border border-gray-200/80 px-5 py-8 sm:px-6 md:p-8 lg:p-12">
          <div className="grid grid-cols-1 items-center gap-8 md:grid-cols-2 lg:gap-14">
            <div className="text-center md:text-left">
              <SectionHeading
                eyebrow="50 Year Product Warranty"
                heading="View or Download Our Warranty PDF Below"
                align="left"
                className="mb-6 text-center md:text-left"
              />
              <LinkButton href={WARRANTY_PDF} variant="primary" size="lg" external>
                <Download className="h-5 w-5" />
                Warranty PDF
              </LinkButton>
            </div>
            <a
              href={WARRANTY_PDF}
              target="_blank"
              rel="noopener noreferrer"
              className="group relative mx-auto block w-full max-w-lg"
            >
              <div
                aria-hidden="true"
                className="absolute -inset-4 rounded-[2rem] bg-gradient-to-br from-highlight/25 via-transparent to-accent/25 blur-2xl"
              />
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={`${MEDIA}/2021/04/Warranty-Certificate-2021-1-1024x791.jpg`}
                alt="Crazy Seal 50 year warranty certificate"
                className="relative w-full -rotate-2 rounded-2xl shadow-2xl ring-1 ring-primary/10 transition-transform duration-500 group-hover:rotate-0 group-hover:scale-[1.02]"
              />
              <span className="absolute -bottom-4 -right-2 inline-flex items-center gap-2 rounded-2xl bg-white px-4 py-2.5 shadow-2xl ring-1 ring-primary/10 animate-float sm:-right-4">
                <span className="grid h-8 w-8 place-items-center rounded-lg bg-gradient-to-br from-accent-light to-accent-dark text-white shadow-glow-accent">
                  <ShieldCheck className="h-4 w-4" />
                </span>
                <span className="text-sm font-extrabold text-primary">50 Years</span>
              </span>
            </a>
          </div>
        </div>
      </Container>

      {/* ─── LAST MODULE CTA + QUICK LINKS ─── */}
      <ModuleNext current={6} />

      {/* ─── CONTENT / FEATURE REQUEST ─── */}
      <ContentRequestSection sourcePage="resources-warranty" />
    </>
  )
}
