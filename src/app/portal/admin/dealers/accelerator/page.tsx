import type { Metadata } from 'next'
import Link from 'next/link'
import { ArrowUpRight } from 'lucide-react'
import { requirePortalAdmin } from '@/lib/portal/admin/auth'
import { getAcceleratorAdmin } from '@/lib/portal/admin/accelerator'
import { toPortalModule } from '@/lib/portal/accelerator'
import { moduleMinutes } from '@/lib/portal/modules'
import { ago, num } from '@/lib/portal/admin/format'
import { Badge, PageHeader, Panel, Stat, StatGrid } from '@/components/portal/admin/ui'
import { BUTTON } from '@/components/portal/admin/styles'
import { AddModuleButton } from '@/components/portal/admin/accelerator/AddModuleButton'
import { ModuleRowControls } from '@/components/portal/admin/accelerator/ModuleRowControls'
import { ProgramForm } from '@/components/portal/admin/accelerator/ProgramForm'
import { MODULE_ICON_META, previewHref } from '@/components/portal/admin/accelerator/icons'

export const metadata: Metadata = { title: 'Accelerator Program' }

const BASE = '/portal/admin/dealers/accelerator/'

export default async function AdminAcceleratorPage() {
  await requirePortalAdmin('accelerator')
  const { program, modules } = await getAcceleratorAdmin()

  let number = 0
  const rows = modules.map((row) => {
    const mod = toPortalModule(row, row.is_published ? ++number : 0)
    return { row, mod, minutes: moduleMinutes(mod) }
  })
  const live = rows.filter((r) => r.row.is_published)
  const drafts = rows.length - live.length
  const lessons = live.reduce((n, r) => n + r.mod.lessons.length, 0)
  const videos = live.reduce((n, r) => n + r.mod.lessons.filter((l) => l.kind === 'video').length, 0)
  const minutes = live.reduce((n, r) => n + r.minutes, 0)
  const lastEdit = [...modules.map((m) => ({ at: m.updated_at, by: m.updated_by })), { at: program.updated_at, by: program.updated_by }]
    .filter((e) => e.at)
    .sort((a, b) => b.at!.localeCompare(a.at!))[0]

  return (
    <>
      <PageHeader
        title="Accelerator Program"
        description="The training dealers work through in the new Pro Portal. Changes show there as soon as you save."
        actions={
          <>
            <a href={previewHref()} target="_blank" rel="noopener noreferrer" className={BUTTON.default}>
              Preview in portal <ArrowUpRight className="h-3.5 w-3.5 opacity-70" />
            </a>
            <AddModuleButton />
          </>
        }
      >
        <StatGrid className="xl:grid-cols-4">
          <Stat label="Published modules" value={num(live.length)} sub={drafts ? `plus ${drafts} draft${drafts === 1 ? '' : 's'}` : 'no drafts'} tone="dealers" />
          <Stat label="Lessons" value={num(lessons)} sub={`${num(videos)} videos`} />
          <Stat label="Total time" value={`${(minutes / 60).toFixed(1)} hrs`} sub="every lesson, start to finish" tone="info" />
          <Stat label="Last edit" value={lastEdit ? ago(lastEdit.at) : '—'} sub={lastEdit?.by ?? undefined} tone="info" />
        </StatGrid>
      </PageHeader>

      <div className="grid gap-2 xl:grid-cols-[minmax(0,1fr)_340px]">
        <Panel title="Modules" meta="in the order dealers take them" tone="dealers">
          <ol className="divide-y divide-adm-line-soft">
            {rows.map(({ row, mod, minutes }, i) => {
              const Icon = MODULE_ICON_META[mod.icon].icon
              const href = `${BASE}${row.slug}/`
              return (
                <li key={row.id} className="flex items-center gap-3 px-3 py-2.5">
                  <span
                    className={
                      row.is_published
                        ? 'grid h-7 w-7 shrink-0 place-items-center rounded-full bg-adm-gold/15 text-[12px] font-bold text-adm-gold-text ring-1 ring-inset ring-adm-gold/40'
                        : 'grid h-7 w-7 shrink-0 place-items-center rounded-full bg-adm-ink/[0.05] text-adm-muted ring-1 ring-inset ring-adm-ink/15'
                    }
                    title={row.is_published ? `Module ${mod.number}` : 'Draft'}
                  >
                    {row.is_published ? mod.number : <Icon className="h-3.5 w-3.5" />}
                  </span>
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={mod.thumbnail} alt="" className="hidden h-11 w-[72px] shrink-0 rounded-md object-cover ring-1 ring-adm-line sm:block" />
                  <div className="min-w-0 flex-1">
                    <Link href={href} className="flex items-center gap-2 text-[13px] font-semibold text-adm-ink hover:underline">
                      <span className="truncate">{row.title}</span>
                      {!row.is_published && <Badge tone="warn">Draft</Badge>}
                    </Link>
                    <p className="truncate text-[11.5px] text-adm-muted">
                      {row.eyebrow} · {mod.lessons.length} lesson{mod.lessons.length === 1 ? '' : 's'} · {minutes} min
                      <span className="hidden @2xl:inline">
                        {' · '}edited {ago(row.updated_at)}
                        {row.updated_by && ` by ${row.updated_by}`}
                      </span>
                    </p>
                  </div>
                  <ModuleRowControls slug={row.slug} published={row.is_published} first={i === 0} last={i === rows.length - 1} />
                  <Link href={href} className={BUTTON.default}>
                    Edit
                  </Link>
                </li>
              )
            })}
          </ol>
        </Panel>

        <Panel title="Program details" meta="top of the portal's program page">
          <ProgramForm initial={{ name: program.name, title: program.title, description: program.description }} />
          {program.updated_at && (
            <p className="border-t border-adm-line px-3 py-1.5 text-[11px] text-adm-faint">
              Saved {ago(program.updated_at)}
              {program.updated_by && ` by ${program.updated_by}`}
            </p>
          )}
        </Panel>
      </div>
    </>
  )
}
