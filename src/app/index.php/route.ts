import { NextRequest, NextResponse } from 'next/server'

/**
 * Primary upload dir per Gravity Forms form id (the prefix holding the
 * bulk of the files). Both legacy prefixes exist in S3, so direct
 * /wp-content/uploads/gravity_forms/... links always work; this map only
 * matters for gf-download style URLs that omit the directory hash.
 */
const FORM_HASH_MAP: Record<string, string> = {
  '3': '3-9da3f630e86ceae58f85adf1bf7d95c3',
  '4': '4-da9fb5521a526a6657587613b14048ee',
  '5': '5-9d22b459ec59146a67aaed6589edffcc',
  '7': '7-7d3874df7adc6716d68af6399424ff24',
  '13': '13-c4109da20d47608c5bbc18f969e8fc5c',
  '15': '15-5f20b43c138090156024b49802796060',
}

const DEFAULT_FORM_HASH = FORM_HASH_MAP['4']

/**
 * Handles old Gravity Forms download URLs (e.g. links saved in emails/CRM).
 *
 * Old format: /index.php?gf-download=2020/05/IMG_6547.jpeg&form-id=4&field-id=15&hash=...
 * New: 301 -> https://media.crazyseal.com/gravity-forms/{form-hash}/2020/05/IMG_6547.jpeg
 */
export async function GET(request: NextRequest) {
  const gfDownload = request.nextUrl.searchParams.get('gf-download')

  if (gfDownload) {
    const cdnDomain = process.env.CLOUDFRONT_DOMAIN || 'media.crazyseal.com'
    const formId = request.nextUrl.searchParams.get('form-id') || '4'
    const formHash = FORM_HASH_MAP[formId] || DEFAULT_FORM_HASH
    const cleanPath = decodeURIComponent(gfDownload)
    return NextResponse.redirect(
      `https://${cdnDomain}/gravity-forms/${formHash}/${cleanPath}`,
      301
    )
  }

  return NextResponse.redirect(new URL('/', request.url), 302)
}
