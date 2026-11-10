import { NextResponse } from 'next/server'
import { requireStaff } from '@/lib/admin/require-staff'
import { listEvalCases } from '@/lib/support/admin'

/** Active test cases as JSON, for the bake-off / regression runner in scripts/ai-bakeoff. */
export async function GET() {
  if (!(await requireStaff('ai_review'))) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const cases = (await listEvalCases()).filter((c) => c.active)
  return new NextResponse(
    JSON.stringify(
      cases.map((c) => ({
        id: c.id,
        audience: c.assistant,
        question: c.question,
        expected_facts: c.expected_facts,
        expected_behavior: c.expected_behavior,
        notes: c.notes,
        origin_ticket_id: c.origin_ticket_id,
      })),
      null,
      2,
    ),
    { headers: { 'content-type': 'application/json', 'content-disposition': 'attachment; filename="crazy-seal-ai-test-cases.json"' } },
  )
}
