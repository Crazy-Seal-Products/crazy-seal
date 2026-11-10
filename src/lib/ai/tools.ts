import { createAdminClient } from '@/lib/supabase/admin'
import type { ProUser } from '@/lib/pro/auth'
import { loadJobsForPro, loadProContext, type ProContext } from '@/lib/pro/context'
import { PRO_STATUS_LABEL } from '@/lib/pro/config'
import { createTicket } from '@/lib/support/tickets'
import { formatKnowledge, searchKnowledge } from './knowledge'
import type { ChatTool } from './providers'

/**
 * Lookups the assistants can run. All read-only except the dealer's
 * "open a support request". Dealer lookups only ever see that dealer's own
 * account; staff lookups search everything.
 */

const str = (v: unknown, max = 200) => (typeof v === 'string' ? v.trim().slice(0, max) : '')

function knowledgeTool(includeDealer: boolean): ChatTool {
  return {
    name: 'search_knowledge',
    description:
      'Search the Crazy Seal website pages and staff notes for more reference material when the material you were given does not cover the question. Use short keyword queries.',
    parameters: { type: 'object', properties: { query: { type: 'string', description: 'Keywords, e.g. "EPDM primer cure time"' } }, required: ['query'] },
    run: async (input) => {
      const query = str(input.query)
      if (!query) return 'Give a search query.'
      return formatKnowledge(await searchKnowledge(query, includeDealer, 5))
    },
  }
}

// ─── Dealer (Pro Hub) ────────────────────────────────────────────────────

export function dealerTools(user: ProUser, conversationId: () => string | null): ChatTool[] {
  let ctx: Promise<ProContext> | null = null
  const context = () => (ctx ??= loadProContext(user))

  return [
    knowledgeTool(true),
    {
      name: 'get_my_account',
      description: "This dealer's Pro Hub account: business name, Pro statuses (Member, Pro, Commercial, High volume) and order count.",
      parameters: { type: 'object', properties: {} },
      run: async () => {
        const c = await context()
        return JSON.stringify({
          business: user.business_name,
          name: user.display_name,
          email: user.email,
          statuses: c.statuses.map((s) => PRO_STATUS_LABEL[s]),
          orders: c.customer?.numberOfOrders ?? c.orders.length,
          ...(c.shopifyError ? { note: 'Order data is temporarily unavailable.' } : {}),
        })
      },
    },
    {
      name: 'list_my_orders',
      description: "This dealer's Crazy Seal orders, newest first: order number, date, payment and fulfillment status, total and items.",
      parameters: { type: 'object', properties: { limit: { type: 'number', description: 'How many orders (default 10, max 50)' } } },
      run: async (input) => {
        const c = await context()
        if (c.shopifyError && !c.orders.length) return 'Order data is temporarily unavailable. Suggest they try again later or open a support request.'
        const limit = Math.min(50, Math.max(1, Number(input.limit) || 10))
        const orders = c.orders.slice(0, limit).map((o) => ({
          order: o.name,
          date: o.createdAt.slice(0, 10),
          payment: o.financialStatus,
          fulfillment: o.fulfillmentStatus ?? 'UNFULFILLED',
          total: o.total ? `${o.total} ${o.currency ?? ''}`.trim() : null,
          items: o.lineItems.map((l) => `${l.quantity} × ${l.title}`),
        }))
        return orders.length ? JSON.stringify(orders) : 'This account has no orders yet.'
      },
    },
    {
      name: 'list_my_warranty_jobs',
      description: "This dealer's warranty registrations, claims and transfers with their status (the Jobs page in the Pro Hub).",
      parameters: { type: 'object', properties: {} },
      run: async () => {
        const jobs = await loadJobsForPro(await context())
        return JSON.stringify({
          registrations: jobs.registrations.slice(0, 30).map((r) => ({ customer: r.name, order: r.order_number, install: r.install_type, status: r.status, filed: r.created_at.slice(0, 10) })),
          claims: jobs.claims.slice(0, 20).map((r) => ({ customer: r.name, order: r.order_number, status: r.status, filed: r.created_at.slice(0, 10) })),
          transfers: jobs.transfers.slice(0, 20).map((r) => ({ new_owner: r.new_owner_name, order: r.order_number, status: r.status, filed: r.created_at.slice(0, 10) })),
        })
      },
    },
    {
      name: 'open_support_request',
      description:
        'Open a request for the Crazy Seal team to follow up with this dealer. Only call this after the dealer agrees. Write the summary so a teammate can act without reading the chat.',
      parameters: {
        type: 'object',
        properties: {
          subject: { type: 'string', description: 'One line, e.g. "Order #12345 arrived with a damaged pail"' },
          summary: { type: 'string', description: 'What they need, what you already checked, order numbers involved' },
          urgent: { type: 'boolean', description: 'True if a job is blocked or a roof is leaking now' },
        },
        required: ['subject', 'summary'],
      },
      run: async (input) => {
        const subject = str(input.subject, 200)
        const summary = str(input.summary, 4000)
        if (!subject || !summary) throw new Error('subject and summary are required')
        const ticket = await createTicket({
          kind: 'dealer_support',
          subject,
          body: summary,
          author: { type: 'system', name: 'Pro Hub assistant' },
          conversationId: conversationId(),
          proUserId: user.id,
          contact: { name: user.business_name || user.display_name, email: user.email, phone: user.phone },
          priority: input.urgent === true ? 'high' : 'normal',
        })
        if (!ticket) throw new Error('the request could not be saved')
        return `Opened support request #${ticket.number}. The team will reply in the dealer's Support tab and by email.`
      },
    },
  ]
}

// ─── Staff (Crazy Seal Admin) ────────────────────────────────────────────

/** PostgREST `ilike` pattern for a user-typed term, with wildcards escaped. */
function like(term: string): string {
  return `%${term.replace(/[\\%_]/g, (c) => `\\${c}`)}%`
}

export function staffTools(): ChatTool[] {
  const db = () => createAdminClient()
  return [
    knowledgeTool(true),
    {
      name: 'find_customers',
      description: 'Find Shopify customers by name, email or phone. Returns up to 10 with order count, lifetime spend and dealer/commercial flags.',
      parameters: { type: 'object', properties: { query: { type: 'string' } }, required: ['query'] },
      run: async (input) => {
        const q = str(input.query, 100)
        if (q.length < 2) return 'Search needs at least 2 characters.'
        const cols = 'display_name, email, phone, number_of_orders, amount_spent, is_dealer, is_commercial, tags, legacy_resource_id'
        const [byName, byEmail, byPhone] = await Promise.all([
          db().from('shopify_customers').select(cols).is('deleted_at', null).ilike('display_name', like(q)).limit(10),
          db().from('shopify_customers').select(cols).is('deleted_at', null).ilike('email', like(q)).limit(10),
          db().from('shopify_customers').select(cols).is('deleted_at', null).ilike('phone', like(q.replace(/\D/g, '') || q)).limit(5),
        ])
        const rows = new Map<string, Record<string, unknown>>()
        for (const r of [...(byName.data ?? []), ...(byEmail.data ?? []), ...(byPhone.data ?? [])]) rows.set(String(r.legacy_resource_id), r)
        const list = [...rows.values()].slice(0, 10).map((r) => ({ ...r, admin_link: `/portal/admin/customers/${r.legacy_resource_id}/` }))
        return list.length ? JSON.stringify(list) : `No customers match "${q}".`
      },
    },
    {
      name: 'find_orders',
      description: 'Find orders by order number (e.g. 12345 or #12345), customer email or customer name. Returns up to 10, newest first.',
      parameters: { type: 'object', properties: { query: { type: 'string' } }, required: ['query'] },
      run: async (input) => {
        const q = str(input.query, 100)
        if (q.length < 2) return 'Search needs at least 2 characters.'
        const cols = 'name, processed_at, customer_display_name, customer_email, financial_status, fulfillment_status, current_total_price, currency, cancelled_at, legacy_resource_id'
        const digits = q.replace(/^#/, '')
        const queries = [
          db().from('shopify_orders').select(cols).is('deleted_at', null).ilike('customer_email', like(q)).order('processed_at', { ascending: false }).limit(10),
          db().from('shopify_orders').select(cols).is('deleted_at', null).ilike('customer_display_name', like(q)).order('processed_at', { ascending: false }).limit(10),
        ]
        if (/^\d+$/.test(digits)) queries.unshift(db().from('shopify_orders').select(cols).eq('number', Number(digits)).limit(1))
        const results = await Promise.all(queries)
        const rows = new Map<string, Record<string, unknown>>()
        for (const res of results) for (const r of res.data ?? []) rows.set(String(r.legacy_resource_id), r)
        const list = [...rows.values()].slice(0, 10).map((r) => ({ ...r, admin_link: `/portal/admin/orders/${r.legacy_resource_id}/` }))
        return list.length ? JSON.stringify(list) : `No orders match "${q}".`
      },
    },
    {
      name: 'find_warranties',
      description: 'Find warranty registrations by customer name, email, installer email or order number. Returns up to 10 with status.',
      parameters: { type: 'object', properties: { query: { type: 'string' } }, required: ['query'] },
      run: async (input) => {
        const q = str(input.query, 100)
        if (q.length < 2) return 'Search needs at least 2 characters.'
        const cols = 'id, name, email, order_number, install_type, installer_name, status, created_at'
        const results = await Promise.all(
          ['name', 'email', 'installer_email', 'order_number'].map((col) =>
            db().from('warranty_registrations').select(cols).ilike(col, like(q.replace(/^#/, ''))).order('created_at', { ascending: false }).limit(10),
          ),
        )
        const rows = new Map<string, Record<string, unknown>>()
        for (const res of results) for (const r of res.data ?? []) rows.set(String(r.id), r)
        const list = [...rows.values()].slice(0, 10).map((r) => ({ ...r, admin_link: `/portal/admin/warranties/${r.id}/` }))
        return list.length ? JSON.stringify(list) : `No warranty registrations match "${q}".`
      },
    },
  ]
}
