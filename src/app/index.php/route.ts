import { NextRequest, NextResponse } from 'next/server'

const FORM_HASH_MAP: Record<string, string> = {
  '1': '1-bb43afc9cbb2d99f8dcaabe308d78ac7',
}

const DEFAULT_FORM_HASH = '1-bb43afc9cbb2d99f8dcaabe308d78ac7'

/**
 * Handles old Gravity Forms download URLs from Zoho CRM.
 *
 * Old format: /index.php?gf-download=2026/03/IMG_6547.jpeg&form-id=1&field-id=15&hash=...
 * New: 301 -> https://media.rv-armor.com/gravity-forms/{form-hash}/2026/03/IMG_6547.jpeg
 */
export async function GET(request: NextRequest) {
  const gfDownload = request.nextUrl.searchParams.get('gf-download')

  if (gfDownload) {
    const cdnDomain = process.env.CLOUDFRONT_DOMAIN || 'media.rv-armor.com'
    const formId = request.nextUrl.searchParams.get('form-id') || '1'
    const formHash = FORM_HASH_MAP[formId] || DEFAULT_FORM_HASH
    const cleanPath = decodeURIComponent(gfDownload)
    return NextResponse.redirect(
      `https://${cdnDomain}/gravity-forms/${formHash}/${cleanPath}`,
      301
    )
  }

  return NextResponse.redirect(new URL('/', request.url), 302)
}
