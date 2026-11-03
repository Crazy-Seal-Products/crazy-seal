import type { Metadata } from 'next'
import Link from 'next/link'
import { ArrowRight, Lock, Pencil, Plus, X } from 'lucide-react'
import { twMerge } from 'tailwind-merge'
import { requirePortalAdmin } from '@/lib/portal/admin/auth'
import { CODE_REDIRECTS, getManagedRedirects, matchesRedirect, REDIRECT_FILTERS, type ManagedRedirect } from '@/lib/portal/admin/redirects'
import { dateShort, dateTime, num } from '@/lib/portal/admin/format'
import { one, pick, type SearchParams } from '@/lib/portal/admin/params'
import { Badge, Empty, hrefWith, PageHeader, Panel, SearchBox, Segmented, Stat, StatGrid, Toolbar } from '@/components/portal/admin/ui'
import { BUTTON } from '@/components/portal/admin/styles'
import { RedirectForm } from '@/components/portal/admin/redirects/RedirectForm'
import { DeleteRedirectButton, EnabledSwitch } from '@/components/portal/admin/redirects/RedirectControls'

export const metadata: Metadata = { title: 'Redirects' }

const BASE = '/portal/admin/redirects/'

function Route({ source, destination, permanent }: { source: string; destination: string; permanent: boolean }) {
  return (
    <span className="flex min-w-0 flex-wrap items-center gap-x-1.5 gap-y-0.5 text-[12.5px]">
      <span className="break-all font-semibold text-adm-ink">{source}</span>
      <ArrowRight aria-label="redirects to" className="h-3 w-3 shrink-0 text-adm-faint" />
      <span className="break-all text-adm-blue-bright">{destination}</span>
      <Badge tone={permanent ? 'neutral' : 'warn'} dot={false}>
        {permanent ? '301' : '302'}
      </Badge>
    </span>
  )
}

export default async function AdminRedirectsPage({ searchParams }: { searchParams: SearchParams }) {
  await requirePortalAdmin()
  const sp = await searchParams
  const q = one(sp.q)
  const show = pick(sp.show, REDIRECT_FILTERS, 'all')
  const edit = one(sp.edit)

  const all = await getManagedRedirects()
  const searched = all.filter((r) => matchesRedirect(r, q))
  const byShow = (s: string) => (r: ManagedRedirect) => s === 'all' || (s === 'enabled' ? r.enabled : !r.enabled)
  const rows = searched.filter(byShow(show))
  const code = CODE_REDIRECTS.filter((r) => matchesRedirect(r, q))
  const live = all.filter((r) => r.enabled).length

  const params = { show: show === 'all' ? undefined : show, q }
  const closeHref = hrefWith(BASE, params, {})
  const editing = edit && edit !== 'new' ? all.find((r) => r.id === edit) ?? null : null
  const editorOpen = edit === 'new' || !!editing

  return (
    <>
      <PageHeader
        title="Redirects"
        description="Redirects added here go live on crazyseal.com within a minute, no deploy needed. Turn one off to stop it without deleting it."
        actions={
          <Link href={hrefWith(BASE, params, { edit: 'new' })} scroll={false} className={BUTTON.gold}>
            <Plus className="h-3.5 w-3.5" /> Add redirect
          </Link>
        }
      >
        <StatGrid className="md:grid-cols-3 xl:grid-cols-3">
          <Stat hero label="Live redirects" value={num(live)} sub={`of ${num(all.length)} managed here`} />
          <Stat label="Turned off" value={num(all.length - live)} tone="info" />
          <Stat label="In code" value={num(CODE_REDIRECTS.length)} sub="change with a deploy" tone="info" />
        </StatGrid>
        <Toolbar>
          <Segmented
            options={REDIRECT_FILTERS.map((f) => ({ ...f, count: searched.filter(byShow(f.key)).length }))}
            value={show}
            param="show"
            base={BASE}
            params={params}
          />
          <SearchBox base={BASE} params={params} value={q} placeholder="Search source or destination…" />
        </Toolbar>
      </PageHeader>

      <div className="grid gap-2">
        {editorOpen && (
          <Panel
            title={editing ? 'Edit redirect' : 'New redirect'}
            tone="dealers"
            actions={
              <Link href={closeHref} scroll={false} aria-label="Close" className="grid h-6 w-6 place-items-center rounded-md text-adm-muted transition hover:bg-adm-ink/[0.06] hover:text-adm-ink">
                <X className="h-3.5 w-3.5" />
              </Link>
            }
          >
            <RedirectForm
              key={edit}
              id={editing?.id ?? null}
              closeHref={closeHref}
              initial={{
                source: editing?.source ?? '',
                destination: editing?.destination ?? '',
                permanent: editing?.permanent ?? true,
                notes: editing?.notes ?? '',
              }}
            />
          </Panel>
        )}

        <Panel title="Managed redirects" meta={`${num(rows.length)} ${rows.length === 1 ? 'redirect' : 'redirects'}`} tone="sales">
          {rows.length ? (
            <ul className="divide-y divide-adm-line-soft">
              {rows.map((r) => (
                <li key={r.id} className={twMerge('flex flex-wrap items-center gap-x-3 gap-y-1.5 px-3 py-2', editing?.id === r.id && 'bg-adm-blue-bright/[0.06]')}>
                  <div className={twMerge('min-w-0 flex-1 basis-60', !r.enabled && 'opacity-55')}>
                    <Route source={r.source} destination={r.destination} permanent={r.permanent} />
                    {r.notes && <p className="mt-0.5 break-words text-[11.5px] text-adm-muted">{r.notes}</p>}
                  </div>
                  <span className="text-[11px] text-adm-muted" title={`Created ${dateTime(r.created_at)}${r.updated_at ? ` · updated ${dateTime(r.updated_at)}` : ''}`}>
                    {r.updated_at && r.updated_at !== r.created_at ? `Updated ${dateShort(r.updated_at)}` : `Added ${dateShort(r.created_at)}`}
                  </span>
                  <span className="ml-auto flex items-center gap-1">
                    <EnabledSwitch id={r.id} enabled={r.enabled} label={`Redirect ${r.source} live`} />
                    <Link
                      href={hrefWith(BASE, params, { edit: r.id })}
                      title="Edit"
                      aria-label={`Edit redirect ${r.source}`}
                      className="inline-grid h-7 w-7 place-items-center rounded-md text-adm-muted transition hover:bg-adm-ink/[0.06] hover:text-adm-ink"
                    >
                      <Pencil className="h-3.5 w-3.5" />
                    </Link>
                    <DeleteRedirectButton id={r.id} source={r.source} destination={r.destination} />
                  </span>
                </li>
              ))}
            </ul>
          ) : (
            <Empty>{all.length ? 'No managed redirects match.' : 'No managed redirects yet. Use “Add redirect” to create one.'}</Empty>
          )}
        </Panel>

        <Panel
          title={
            <>
              <Lock className="h-3 w-3 text-adm-muted" /> Code-defined redirects
            </>
          }
          meta={`${num(code.length)} · read-only`}
        >
          <details className="group" open={!!q}>
            <summary className="cursor-pointer list-none px-3 py-1.5 text-[12px] text-adm-muted hover:text-adm-ink [&::-webkit-details-marker]:hidden">
              <span className="group-open:hidden">Show {num(code.length)} redirects</span>
              <span className="hidden group-open:inline">Hide</span>
            </summary>
            {code.length ? (
              <ul className="divide-y divide-adm-line-soft border-t border-adm-line-soft">
                {code.map((r) => (
                  <li key={r.source} className="px-3 py-1.5">
                    <Route source={r.source} destination={r.destination} permanent={r.permanent} />
                  </li>
                ))}
              </ul>
            ) : (
              <Empty>No code-defined redirects match.</Empty>
            )}
            <p className="border-t border-adm-line-soft px-3 py-1.5 text-[11.5px] text-adm-muted">
              These live in <code className="rounded bg-adm-ink/[0.06] px-1 text-adm-soft">src/lib/redirects.ts</code>, run before the ones above, and need a deploy to change.
            </p>
          </details>
        </Panel>
      </div>
    </>
  )
}
