import type { Metadata } from 'next'
import { Download, FileText, ShieldAlert } from 'lucide-react'
import { Container, SectionHeading } from '@/lib/design-system'
import {
  ContactCta,
  HERO_H1,
  HeroChips,
  HeroShell,
  MEDIA,
  SECTION_WHITE,
  fadeDelay,
} from '@/components/system-pages/blocks'

export const metadata: Metadata = {
  title: 'Technical Data',
  description:
    'Technical data sheets and safety data sheets for every Crazy Seal product: Crazy Seal, Crazy Patch, Crazy Caulk, Crazy Clean, and Crazy Tape.',
}

const TECH_DATA_SHEETS = [
  {
    name: 'Crazy Seal Technical Data Sheet',
    href: `${MEDIA}/2020/05/Crazy-Seal-Tech-Data-031720.pdf`,
  },
  {
    name: 'Crazy Patch Technical Data Sheet',
    href: `${MEDIA}/2020/05/Crazy-Patch-Tech-Data-031720.pdf`,
  },
  {
    name: 'Crazy Caulk Technical Data Sheet',
    href: `${MEDIA}/2020/05/Crazy-Caulk-Tech-Data-031720.pdf`,
  },
  {
    name: 'Crazy Clean Technical Data Sheet',
    href: `${MEDIA}/2020/05/Crazy-Clean-Tech-Data-031720.pdf`,
  },
  {
    name: 'Crazy Tape Technical Data Sheet',
    href: `${MEDIA}/2020/05/Crazy-Tape-Tech-Data-031720.pdf`,
  },
]

const SAFETY_DATA_SHEETS = [
  {
    name: 'Crazy Caulk Safety Data Sheet',
    href: `${MEDIA}/2020/05/Crazy-Caulk-SDS-03-20.pdf`,
  },
  {
    name: 'Crazy Patch Safety Data Sheet',
    href: `${MEDIA}/2020/05/Crazy-Patch-SDS-03-20.pdf`,
  },
  {
    name: 'Crazy Seal Safety Data Sheet',
    href: `${MEDIA}/2020/05/Crazy-Seal-SDS-03-20.pdf`,
  },
  {
    name: 'Crazy Clean Safety Data Sheet',
    href: `${MEDIA}/2020/05/Crazy-Clean-SDS-03-20.pdf`,
  },
]

const PRODUCTS = [
  { name: 'Crazy Seal', image: `${MEDIA}/2019/05/Crazy-Seal-5-Gal-Gray-Bottom-400x586.png` },
  { name: 'Crazy Patch', image: `${MEDIA}/2019/05/Crazy-Patch-400x560.png` },
  { name: 'Crazy Caulk', image: `${MEDIA}/2019/04/Crazy-Caulk-1-Tube.png` },
  { name: 'Crazy Clean', image: `${MEDIA}/2019/05/Crazy-Clean-400x561.png` },
  { name: 'Crazy Tape', image: `${MEDIA}/2021/12/Crazy-Tape-1395x1395-1-768x768.png` },
]

/** One row per product: its technical + safety sheet (if any). */
const ROWS = PRODUCTS.map((product) => ({
  ...product,
  tds: TECH_DATA_SHEETS.find((s) => s.name.startsWith(`${product.name} `)),
  sds: SAFETY_DATA_SHEETS.find((s) => s.name.startsWith(`${product.name} `)),
}))

function SheetLink({
  sheet,
  kind,
}: {
  sheet?: { name: string; href: string }
  kind: 'TDS' | 'SDS'
}) {
  if (!sheet) {
    return (
      <span className="text-sm font-medium text-gray-400">
        <span aria-hidden="true">—</span>
        <span className="sr-only">No {kind === 'TDS' ? 'technical' : 'safety'} data sheet</span>
      </span>
    )
  }
  const Icon = kind === 'TDS' ? FileText : ShieldAlert
  return (
    <a
      href={sheet.href}
      target="_blank"
      rel="noopener noreferrer"
      className="group inline-flex items-center gap-2 rounded-full bg-white py-1.5 pl-1.5 pr-4 text-sm font-bold text-primary shadow-sm ring-1 ring-primary/10 transition-all duration-300 hover:-translate-y-0.5 hover:shadow-md hover:ring-accent/40"
    >
      <span className="grid h-7 w-7 place-items-center rounded-full bg-primary/[0.06] transition-colors duration-300 group-hover:bg-accent group-hover:text-white">
        <Icon className="h-3.5 w-3.5" />
      </span>
      <span className="sr-only">{sheet.name}</span>
      <span aria-hidden="true">{kind} · PDF</span>
      <Download className="h-4 w-4 text-accent-dark transition-transform duration-300 group-hover:translate-y-0.5" />
    </a>
  )
}

export default function TechnicalDataPage() {
  return (
    <>
      {/* ─── HERO ─── */}
      <Container size="xl">
        <HeroShell innerClassName="text-center">
          <h1 className={HERO_H1} style={fadeDelay(80)}>
            Technical <span className="text-shimmer-highlight">Data</span>
          </h1>
          <p
            className="animate-fade-up text-base sm:text-lg text-white/70 max-w-2xl mx-auto leading-relaxed"
            style={fadeDelay(160)}
          >
            Download the technical data sheets and safety data sheets for every product in the Crazy Seal
            Roofing System.
          </p>
          <HeroChips
            delay={260}
            className="mt-7 justify-center"
            items={[
              { icon: FileText, label: `${TECH_DATA_SHEETS.length} technical data sheets` },
              { icon: ShieldAlert, label: `${SAFETY_DATA_SHEETS.length} safety data sheets` },
              { icon: Download, label: 'Free PDF downloads' },
            ]}
          />
        </HeroShell>
      </Container>

      {/* ─── TECHNICAL + SAFETY DATA SHEETS ─── */}
      <Container size="xl" className="sm:pt-4 md:pt-8">
        <div className={SECTION_WHITE}>
          <SectionHeading
            eyebrow="Product Specifications"
            heading="Technical & Safety Data Sheets"
            subheading="Every sheet, organized by product."
          />

          {/* Desktop / tablet: product matrix */}
          <div className="hidden md:block max-w-5xl mx-auto overflow-hidden rounded-3xl ring-1 ring-primary/[0.08] shadow-sm">
            <table className="w-full text-left">
              <caption className="sr-only">Crazy Seal technical data sheets and safety data sheets by product</caption>
              <thead className="bg-primary text-white">
                <tr>
                  <th scope="col" className="px-6 py-4 text-[11px] font-bold uppercase tracking-[0.18em]">
                    Product
                  </th>
                  <th scope="col" className="px-6 py-4 text-[11px] font-bold uppercase tracking-[0.18em]">
                    <span className="inline-flex items-center gap-2">
                      <FileText className="h-4 w-4 text-highlight" />
                      Technical Data Sheet
                    </span>
                  </th>
                  <th scope="col" className="px-6 py-4 text-[11px] font-bold uppercase tracking-[0.18em]">
                    <span className="inline-flex items-center gap-2">
                      <ShieldAlert className="h-4 w-4 text-highlight" />
                      Safety Data Sheet
                    </span>
                  </th>
                </tr>
              </thead>
              <tbody>
                {ROWS.map((row) => (
                  <tr
                    key={row.name}
                    className="group border-b last:border-b-0 border-primary/[0.06] bg-white even:bg-slate-50/80 transition-colors hover:bg-accent/[0.05]"
                  >
                    <th scope="row" className="px-6 py-4">
                      <span className="flex items-center gap-4">
                        <span className="grid h-14 w-14 shrink-0 place-items-center rounded-2xl bg-gradient-to-br from-slate-50 via-white to-accent/10 ring-1 ring-primary/[0.08]">
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img
                            src={row.image}
                            alt=""
                            className="max-h-11 w-auto max-w-[80%] object-contain transition-transform duration-500 group-hover:scale-110 group-hover:-rotate-6"
                          />
                        </span>
                        <span className="font-extrabold text-primary">{row.name}</span>
                      </span>
                    </th>
                    <td className="px-6 py-4">
                      <SheetLink sheet={row.tds} kind="TDS" />
                    </td>
                    <td className="px-6 py-4">
                      <SheetLink sheet={row.sds} kind="SDS" />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Mobile: one card per product */}
          <div className="grid grid-cols-1 gap-3 md:hidden">
            {ROWS.map((row) => (
              <div
                key={row.name}
                className="rounded-2xl bg-gradient-to-b from-slate-50 to-white p-4 ring-1 ring-primary/[0.08] shadow-sm"
              >
                <div className="mb-3 flex items-center gap-3">
                  <span className="grid h-12 w-12 shrink-0 place-items-center rounded-xl bg-white ring-1 ring-primary/[0.08]">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={row.image} alt="" className="max-h-9 w-auto max-w-[80%] object-contain" />
                  </span>
                  <h3 className="font-extrabold text-primary">{row.name}</h3>
                </div>
                <div className="flex flex-wrap gap-2">
                  <SheetLink sheet={row.tds} kind="TDS" />
                  {row.sds && <SheetLink sheet={row.sds} kind="SDS" />}
                </div>
              </div>
            ))}
          </div>
        </div>
      </Container>

      {/* ─── CTA ─── */}
      <Container size="xl" className="sm:pt-4 md:pt-8">
        <ContactCta variant="dark" />
      </Container>
    </>
  )
}
