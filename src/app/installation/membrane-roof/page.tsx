import type { Metadata } from 'next'
import { Download, Phone, ShieldCheck } from 'lucide-react'
import {
  Container,
  Grid,
  SectionHeading,
  LinkButton,
  YouTubeEmbed,
} from '@/lib/design-system'

const MEDIA = 'https://media.crazyseal.com/site-assets/wp-media'

export const metadata: Metadata = {
  title: 'Membrane Roof Installation',
  description:
    'Step-by-step membrane roof installation instructions for the Crazy Seal roofing system, including downloadable PDFs, a full installation video, and breakout videos for every step.',
}

const PDFS = [
  {
    title: 'Photo Guidelines',
    desc: 'How to photograph your project before and after for your 50 year warranty.',
    href: `${MEDIA}/2020/05/Photo-Guidelines.pdf`,
    image: `${MEDIA}/2020/05/Submit-Photos-for-Warranty.jpg`,
  },
  {
    title: 'Installation PDF',
    desc: 'The complete over-membrane installation instructions in PDF form.',
    href: `${MEDIA}/2020/05/Crazy-Seal-Over-Membrane-Installation-Instructions.pdf`,
    image: `${MEDIA}/2019/06/Crazy-Seal-Installation-Cover-Small.jpg`,
  },
  {
    title: 'Tools PDF',
    desc: 'The full list of tools you will need to complete your installation.',
    href: `${MEDIA}/2020/03/Crazy-Seal-Tool-List.pdf`,
    image: `${MEDIA}/2020/03/Crazy-Seal-Tools-Full-scaled.jpg`,
  },
]

const BREAKOUT_VIDEOS = [
  { id: '1YRViSrC5Fs', title: 'Getting Started' },
  { id: 'Wxhkt6VD9GY', title: 'Step 1: Inspection' },
  { id: 'VYLiauwV0DM', title: 'Step 2: Clean & Prep' },
  { id: 'JfnINcNwuvQ', title: 'Wash and Scrub' },
  { id: 'inlKNOnHy0k', title: 'Cleaning Sealants' },
  { id: 'WycL8mTKWBw', title: 'Tape Off Fixtures' },
  { id: 'DD93T08npso', title: 'Step 3: Seal the Roof' },
  { id: '5yZNFn1jJSQ', title: 'Apply Crazy Caulk' },
  { id: 'lmMd6CEhWbU', title: 'Apply Crazy Patch' },
  { id: 'TOe6s4ub_18', title: 'Apply Crazy Seal' },
  { id: 'hm2f-AyLhs4', title: 'Additional Coats' },
  { id: 'd4pSSqrQ55s', title: 'Finalizing the Installation' },
]

export default function MembraneRoofPage() {
  return (
    <>
      {/* ─── HERO ─── */}
      <Container size="xl">
        <div className="relative section-bleed bg-primary overflow-hidden">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_50%,rgba(18,95,151,0.5),transparent_60%)]" />
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_80%_20%,rgba(91,164,17,0.15),transparent_40%)]" />
          <div className="relative z-10 px-5 py-10 sm:px-6 sm:py-14 lg:px-8 lg:py-16 text-center">
            <p className="text-xs font-bold uppercase tracking-[0.2em] text-accent mb-3">
              Installation Guide
            </p>
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-white tracking-tight">
              Membrane Roof Installation Instructions
            </h1>
          </div>
        </div>
      </Container>

      {/* ─── DOWNLOADABLE PDFS ─── */}
      <Container size="xl" className="sm:pt-4 md:pt-8">
        <div className="section-bleed bg-white border-y sm:border border-gray-200/80 px-5 py-6 sm:px-6 md:p-6 lg:p-8">
          <SectionHeading heading="Downloadable PDF's" />
          <Grid responsiveCols={{ mobile: 1, tablet: 3 }} gap="lg">
            {PDFS.map((pdf) => (
              <a
                key={pdf.title}
                href={pdf.href}
                target="_blank"
                rel="noopener noreferrer"
                className="group rounded-2xl border border-gray-200 bg-white overflow-hidden transition-all duration-300 hover:-translate-y-1 hover:shadow-lg"
              >
                <div className="aspect-[16/10] overflow-hidden bg-gray-50">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={pdf.image}
                    alt={pdf.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                </div>
                <div className="p-5 text-center">
                  <h3 className="font-bold text-primary mb-1">{pdf.title}</h3>
                  <p className="text-sm text-gray-500 leading-relaxed mb-3">{pdf.desc}</p>
                  <span className="inline-flex items-center gap-1 text-sm font-semibold text-accent group-hover:gap-2 transition-all">
                    <Download className="w-4 h-4" />
                    Download PDF
                  </span>
                </div>
              </a>
            ))}
          </Grid>
        </div>
      </Container>

      {/* ─── FULL INSTALLATION VIDEO ─── */}
      <Container size="xl" className="sm:pt-4 md:pt-8">
        <div className="section-bleed bg-primary overflow-hidden px-5 py-6 sm:px-6 md:p-6 lg:p-8">
          <SectionHeading
            eyebrow="Installation Videos"
            heading="Full Installation Video"
            subheading="There is a full installation video that will take you through the entire installation process as well as breakout videos you can watch as you get to each step."
            variant="dark"
          />
          <div className="max-w-3xl mx-auto">
            <YouTubeEmbed videoId="ttfgscV2Dzw" variant="card" />
            <p className="text-center text-white/60 text-sm font-medium mt-3">
              Click to watch the full video (less than 23&frac12; minutes)
            </p>
          </div>
        </div>
      </Container>

      {/* ─── BREAKOUT VIDEOS ─── */}
      <Container size="xl" className="sm:pt-4 md:pt-8">
        <div className="section-bleed bg-white border-y sm:border border-gray-200/80 px-5 py-6 sm:px-6 md:p-6 lg:p-8">
          <SectionHeading heading="Breakout Videos" />
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 lg:gap-6">
            {BREAKOUT_VIDEOS.map((video, index) => (
              <div
                key={video.id}
                className="rounded-2xl border border-gray-200/80 bg-white shadow-sm overflow-hidden"
              >
                <YouTubeEmbed videoId={video.id} />
                <div className="p-4 text-center">
                  <p className="text-xs font-bold uppercase tracking-[0.15em] text-accent mb-1">
                    Video {index + 1}
                  </p>
                  <p className="font-semibold text-primary">{video.title}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </Container>

      {/* ─── WARRANTY ─── */}
      <Container size="xl" className="sm:pt-4 md:pt-8">
        <div className="section-bleed bg-primary overflow-hidden px-5 py-6 sm:px-6 md:p-6 lg:p-8">
          <div className="grid grid-cols-1 md:grid-cols-[1fr_3fr] gap-6 items-center">
            <div className="flex justify-center md:justify-start">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={`${MEDIA}/2019/06/50-Year-Warranty-Space-600x600.png`}
                alt="Crazy Seal 50 year warranty badge"
                className="w-full max-w-[220px] h-auto"
              />
            </div>
            <div className="text-center md:text-left">
              <h2 className="text-2xl sm:text-3xl font-bold text-white tracking-tight mb-4">
                Finished With Your Installation? Great Job! Now It&apos;s Time
                to Submit Your Warranty!
              </h2>
              <p className="text-white/70 leading-relaxed mb-6">
                We stand behind our products with a 50 year product warranty.
                Once you&apos;ve purchased a kit, you have 90 days to apply
                your new Crazy Seal system to your application. Within 90 days
                of purchase, simply fill out our warranty form with before and
                after pictures of your project and you will be covered!
              </p>
              <LinkButton href="/warranty" variant="accent" size="lg">
                <ShieldCheck className="w-5 h-5" />
                Submit Warranty Form
              </LinkButton>
            </div>
          </div>
        </div>
      </Container>

      {/* ─── CONTACT CTA ─── */}
      <Container size="xl" className="sm:pt-4 md:pt-8">
        <div className="section-bleed bg-white border-y sm:border border-gray-200/80 px-5 py-10 sm:px-6 md:p-10 lg:p-14 text-center">
          <h2 className="text-3xl sm:text-4xl font-bold text-primary tracking-tight mb-3">
            Let&apos;s Get in Touch
          </h2>
          <p className="text-gray-500 text-base sm:text-lg mb-6 max-w-xl mx-auto">
            Have any questions? Our Crazy Seal specialists can help!
          </p>
          <div className="flex flex-wrap items-center justify-center gap-3">
            <LinkButton href="/contact" variant="accent" size="lg">
              Contact Us
            </LinkButton>
            <LinkButton href="/pricing" variant="primary" size="lg">
              Get an Instant Quote
            </LinkButton>
            <a
              href="tel:8009630131"
              className="flex items-center gap-2 text-gray-600 hover:text-primary font-semibold transition-colors"
            >
              <Phone className="w-5 h-5" />
              (800) 963-0131
            </a>
          </div>
        </div>
      </Container>
    </>
  )
}
