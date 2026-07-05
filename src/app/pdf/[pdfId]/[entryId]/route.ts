import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { getPdfUrl } from '@/app/api/tech-applications/[id]/pdf/route'

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ pdfId: string; entryId: string }> }
) {
  const { entryId } = await params
  const gfEntryId = parseInt(entryId, 10)

  if (isNaN(gfEntryId)) {
    return NextResponse.json({ error: 'Invalid entry ID' }, { status: 400 })
  }

  const supabase = createAdminClient()
  const { data: app, error } = await supabase
    .from('tech_applications')
    .select('id')
    .eq('gf_entry_id', gfEntryId)
    .single()

  if (error || !app) {
    return NextResponse.json(
      { error: 'Application not found. This legacy PDF link could not be resolved.' },
      { status: 404 }
    )
  }

  const pdfUrl = getPdfUrl(app.id)
  return NextResponse.redirect(pdfUrl, 301)
}
