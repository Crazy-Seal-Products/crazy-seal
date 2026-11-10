import type { Metadata } from 'next'
import Link from 'next/link'
import { Plus } from 'lucide-react'
import { twMerge } from 'tailwind-merge'
import { requirePortalAdmin } from '@/lib/portal/admin/auth'
import { ago } from '@/lib/portal/admin/format'
import { one, type SearchParams } from '@/lib/portal/admin/params'
import { createAdminClient } from '@/lib/supabase/admin'
import { assistantSettings } from '@/lib/ai/config'
import { isAssistantConfigured, NOT_CONFIGURED_MESSAGE } from '@/lib/ai/chat'
import { getConversation, getMessages } from '@/lib/ai/store'
import { sendStaffFeedback } from '@/lib/support/actions'
import { PageHeader, Panel } from '@/components/portal/admin/ui'
import { AdminAssistant } from '@/components/portal/admin/support/AdminAssistant'
import { StaffFeedbackForm } from '@/components/portal/admin/support/forms'

export const metadata: Metadata = { title: 'Assistant' }

export default async function AdminAssistantPage({ searchParams }: { searchParams: SearchParams }) {
  const admin = await requirePortalAdmin('assistant')
  const sp = await searchParams
  const email = admin.email.toLowerCase()
  const wanted = one(sp.chat)

  const conversation = wanted ? await getConversation(wanted) : null
  const own = conversation && conversation.assistant === 'staff' && conversation.staff_email === email ? conversation : null
  const [messages, chats] = await Promise.all([
    own ? getMessages(own.id) : [],
    createAdminClient()
      .from('ai_conversations')
      .select('id, title, last_message_at')
      .eq('assistant', 'staff')
      .eq('staff_email', email)
      .order('last_message_at', { ascending: false })
      .limit(20)
      .then((r) => r.data ?? []),
  ])
  const settings = assistantSettings('staff')

  return (
    <>
      <PageHeader title="Assistant" description={`Ask about customers, orders, warranties and the products. Read-only. ${settings.model} · ${settings.effort} effort.`} />
      <div className="grid gap-2 xl:grid-cols-[240px_minmax(0,1fr)_320px]">
        <Panel
          title="Your chats"
          actions={
            <Link href="/portal/admin/assistant/" className="inline-flex items-center gap-1 text-[12px] font-medium text-adm-blue-bright hover:underline">
              <Plus className="h-3.5 w-3.5" /> New
            </Link>
          }
        >
          {chats.length ? (
            <ul className="max-h-[70vh] overflow-y-auto py-1">
              {chats.map((c) => (
                <li key={c.id as string}>
                  <Link
                    href={`/portal/admin/assistant/?chat=${c.id}`}
                    className={twMerge('block px-3 py-1.5 text-[12.5px] hover:bg-adm-ink/[0.04]', own?.id === c.id ? 'bg-adm-blue-bright/10 text-adm-ink' : 'text-adm-text')}
                  >
                    <span className="block truncate">{(c.title as string) || 'Untitled'}</span>
                    <span className="text-[11px] text-adm-muted">{ago(c.last_message_at as string)}</span>
                  </Link>
                </li>
              ))}
            </ul>
          ) : (
            <p className="px-3 py-2.5 text-[12.5px] text-adm-muted">No chats yet.</p>
          )}
        </Panel>

        <Panel className="h-[calc(100vh-180px)] min-h-[480px]" bodyClassName="flex min-h-0 flex-col">
          <AdminAssistant
            chatId={own?.id ?? null}
            messages={messages
              .filter((m) => m.content || m.error)
              .map((m) => ({ role: m.role, content: m.content, failed: Boolean(m.error) && !m.content }))}
            disabledReason={isAssistantConfigured('staff') ? null : NOT_CONFIGURED_MESSAGE}
          />
        </Panel>

        <Panel title="Send feedback" tone="dealers" meta="goes to the Support inbox">
          <StaffFeedbackForm action={sendStaffFeedback} />
        </Panel>
      </div>
    </>
  )
}
