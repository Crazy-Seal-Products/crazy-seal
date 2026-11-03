import { NextResponse } from 'next/server'
import { requireStaff } from '@/lib/admin/require-staff'
import { createAdminClient } from '@/lib/supabase/admin'
import { buildSitemapEntries } from '@/lib/sitemap-data'

export const dynamic = 'force-dynamic'

export async function GET() {
  const staff = await requireStaff()
  if (!staff) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const supabase = createAdminClient()
  const { data } = await supabase
    .from('managed_redirects')
    .select('source,destination')
    .eq('enabled', true)

  const entries = await buildSitemapEntries(data || [])
  return NextResponse.json({ entries })
}
