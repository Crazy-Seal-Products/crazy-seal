import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { certificatePath } from '@/lib/warranty/certificate'

/**
 * Legacy Gravity PDF links, e.g. /pdf/5ee8e8d1cf096/17879/ — sent in every
 * old warranty confirmation email. The first segment is the Gravity PDF feed
 * id (not needed); the second is the Gravity Forms entry id, which we carry
 * as gf_entry_id on warranty_registrations. Redirect to the signed
 * certificate page for that entry.
 *
 * 302 (not 301) so entries mapped after launch (via
 * scripts/map-legacy-warranty.mjs) start resolving without cache problems.
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ pdfId: string; entryId: string; rest?: string[] }> }
) {
  const { entryId } = await params
  const gfEntryId = parseInt(entryId, 10)

  if (Number.isFinite(gfEntryId) && gfEntryId > 0) {
    const supabase = createAdminClient()
    const { data } = await supabase
      .from('warranty_registrations')
      .select('id')
      .eq('gf_entry_id', gfEntryId)
      .limit(1)
      .maybeSingle()

    if (data) {
      return NextResponse.redirect(new URL(certificatePath(data.id), request.url), 302)
    }
  }

  // Unknown entry (unmapped or non-warranty PDF) — send to the warranty hub
  return NextResponse.redirect(new URL('/warranty', request.url), 302)
}
