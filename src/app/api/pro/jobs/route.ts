import { NextResponse } from 'next/server'
import { getProUser } from '@/lib/pro/auth'
import { certificatePath } from '@/lib/warranty/certificate'
import { loadJobsForPro, loadProContext } from '@/lib/pro/context'

export async function GET() {
  const user = await getProUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const ctx = await loadProContext(user)
  const jobs = await loadJobsForPro(ctx)

  return NextResponse.json({
    registrations: jobs.registrations.map((r) => ({
      ...r,
      certificatePath: certificatePath(r.id),
    })),
    claims: jobs.claims,
    transfers: jobs.transfers,
  })
}
