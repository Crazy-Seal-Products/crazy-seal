import type { ReactNode } from 'react'
import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { Paperclip } from 'lucide-react'
import { twMerge } from 'tailwind-merge'
import { requirePortalAdmin } from '@/lib/portal/admin/auth'
import { answerUrls, entryAnswers, entryEmail, entryName, formTitle, getArchiveEntry, isImageUrl } from '@/lib/portal/admin/archive'
import { isWarrantyRegistrationForm } from '@/lib/warranty/legacy'
import { dateTime } from '@/lib/portal/admin/format'
import { BackLink, Badge, CellLink, KV, PageHeader, Panel } from '@/components/portal/admin/ui'
import { BUTTON } from '@/components/portal/admin/styles'
import { ResendConfirmation } from '@/components/portal/admin/archive/ResendConfirmation'

type Params = Promise<{ id: string }>

export async function generateMetadata({ params }: { params: Params }): Promise<Metadata> {
  const found = await getArchiveEntry((await params).id)
  return { title: found ? `Form archive · ${entryName(found.entry)}` : 'Form archive' }
}

function fileName(url: string) {
  try {
    return decodeURIComponent(new URL(url).pathname.split('/').pop() ?? url)
  } catch {
    return url.split('/').pop() ?? url
  }
}

export default async function AdminArchiveEntryPage({ params }: { params: Params }) {
  await requirePortalAdmin()
  const found = await getArchiveEntry((await params).id)
  if (!found) notFound()
  const { entry: e, registration } = found
  const answers = entryAnswers(e)
  const files = e.file_urls ?? []
  const email = entryEmail(e)
  const warranty = isWarrantyRegistrationForm(e.gf_form_id)
  const sourceUrl = Object.entries(e.entry_data ?? {}).find(([k, v]) => /^source url/i.test(k) && v)?.[1]

  return (
    <>
      <BackLink href="/portal/admin/archive/">Form archive</BackLink>
      <PageHeader
        title={
          <span className="flex flex-wrap items-center gap-2">
            <span className="break-words">{entryName(e)}</span>
            <Badge tone={warranty ? 'gold' : 'neutral'} dot={false}>
              {formTitle(e)}
            </Badge>
          </span>
        }
        description={`Gravity Forms entry #${e.gf_entry_id} · submitted ${e.submitted_at ? dateTime(e.submitted_at) : 'date unknown'} on the old WordPress site`}
      />

      <div className="grid gap-2 xl:grid-cols-[minmax(0,1fr)_340px]">
        <div className="grid min-w-0 content-start gap-2">
          <Panel title="Answers" meta={`${answers.length} fields`} tone="sales">
            {answers.length ? (
              <dl className="grid gap-x-4 gap-y-2.5 p-3 @xl:grid-cols-2">
                {answers.map(([k, v]) => {
                  const urls = answerUrls(v)
                  return (
                    <div key={k} className={twMerge('min-w-0', v.length > 120 && '@xl:col-span-2')}>
                      <dt className="text-[10.5px] font-semibold uppercase tracking-[0.08em] text-adm-muted">{k}</dt>
                      {urls ? (
                        <dd className="mt-0.5 grid gap-0.5 text-[12.5px] leading-relaxed">
                          {urls.map((url) => (
                            <a key={url} href={url} target="_blank" rel="noopener noreferrer" className="break-all text-adm-blue-bright hover:underline">
                              {urls.length > 1 ? fileName(url) : url}
                            </a>
                          ))}
                        </dd>
                      ) : (
                        <dd className="mt-0.5 whitespace-pre-wrap break-words text-[12.5px] leading-relaxed text-adm-text">{v}</dd>
                      )}
                    </div>
                  )
                })}
              </dl>
            ) : (
              <p className="px-3 py-4 text-center text-[12.5px] text-adm-muted">This entry has no answers.</p>
            )}
          </Panel>

          {files.length > 0 && (
            <Panel title="Files" meta={`${files.length}`}>
              <div className="grid grid-cols-3 gap-1.5 p-2 @md:grid-cols-5 @3xl:grid-cols-7">
                {files.map((url, i) => (
                  <a
                    key={url}
                    href={url}
                    target="_blank"
                    rel="noopener noreferrer"
                    title={fileName(url)}
                    className="block overflow-hidden rounded-md border border-adm-line transition hover:border-adm-blue-bright"
                  >
                    {isImageUrl(url) ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={url} alt={`File ${i + 1}`} loading="lazy" className="aspect-square w-full object-cover" />
                    ) : (
                      <span className="flex aspect-square w-full flex-col items-center justify-center gap-1 bg-adm-input px-1.5 text-center text-[10.5px] text-adm-muted">
                        <Paperclip className="h-4 w-4" />
                        <span className="line-clamp-2 break-all">{fileName(url)}</span>
                      </span>
                    )}
                  </a>
                ))}
              </div>
            </Panel>
          )}
        </div>

        <div className="grid content-start gap-2">
          {warranty && (
            <Panel title="Confirmation emails" tone="dealers">
              <div className="grid gap-2 px-3 py-2.5 text-[12.5px] text-adm-muted">
                {email ? (
                  <p>
                    Customer:{' '}
                    <a href={`mailto:${email}`} className="break-all text-adm-blue-bright hover:underline">
                      {email}
                    </a>
                  </p>
                ) : (
                  <p>No customer email on this entry.</p>
                )}
                <p>
                  {registration ? (
                    <>
                      In Warranties as{' '}
                      <CellLink href={`/portal/admin/warranties/${registration.id}/`}>{registration.name || 'this registration'}</CellLink>. Re-sends its confirmation (with the certificate link) to the customer, and to the installer if they gave a different email.
                    </>
                  ) : (
                    'Not in Warranties yet. Sending adds it as an approved registration first, then emails the confirmation (with the certificate link) to the customer, and to the installer if they gave a different email.'
                  )}
                </p>
                {email ? (
                  <ResendConfirmation legacyId={e.id} gfEntryId={e.gf_entry_id} email={email} />
                ) : (
                  <button type="button" disabled className={twMerge(BUTTON.default, 'justify-self-start')}>
                    Resend confirmation emails
                  </button>
                )}
              </div>
            </Panel>
          )}
          <Panel title="Submission" tone="info">
            <KV
              rows={[
                ['Form', formTitle(e)],
                ['Entry #', `${e.gf_entry_id}`],
                ['Submitted', e.submitted_at ? dateTime(e.submitted_at) : '—'],
                ['Imported', dateTime(e.imported_at)],
                ...(sourceUrl ? ([['From page', <span key="s" className="break-all">{String(sourceUrl)}</span>]] as [string, ReactNode][]) : []),
                ['Files', files.length ? `${files.length}` : 'None'],
              ]}
            />
          </Panel>
        </div>
      </div>
    </>
  )
}
