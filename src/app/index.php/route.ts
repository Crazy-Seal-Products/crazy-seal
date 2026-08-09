import { NextRequest, NextResponse } from 'next/server'

/**
 * Upload dirs per Gravity Forms form id, in priority order. Forms 4, 5 and 7
 * have two hash dirs on the old server (the form was duplicated/reset at some
 * point); gf-download URLs omit the dir hash, so we probe candidates on the
 * CDN. Direct /wp-content/uploads/gravity_forms/... links carry the full path
 * and don't need this map.
 */
const FORM_HASH_MAP: Record<string, string[]> = {
  '3': ['3-9da3f630e86ceae58f85adf1bf7d95c3'],
  '4': ['4-da9fb5521a526a6657587613b14048ee', '4-d8be8d4759dff97cddb2704d925be7f6'],
  '5': ['5-9d22b459ec59146a67aaed6589edffcc', '5-efb0a4d3c6f26642770c3420f1840f88'],
  '7': ['7-7d3874df7adc6716d68af6399424ff24', '7-238f35589900a70ceecf857f2526c36f'],
  '13': ['13-c4109da20d47608c5bbc18f969e8fc5c'],
  '15': ['15-5f20b43c138090156024b49802796060'],
}

const DEFAULT_FORM_HASHES = FORM_HASH_MAP['4']

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
    const formHashes = FORM_HASH_MAP[formId] || DEFAULT_FORM_HASHES
    const cleanPath = decodeURIComponent(gfDownload)

    // Probe candidate dirs on the CDN; permanent redirect once confirmed.
    for (const formHash of formHashes) {
      const url = `https://${cdnDomain}/gravity-forms/${formHash}/${cleanPath}`
      try {
        const head = await fetch(url, { method: 'HEAD', cache: 'no-store' })
        if (head.ok) return NextResponse.redirect(url, 301)
      } catch {
        // CDN unreachable — fall through to the default redirect below
      }
    }

    // File not in S3 (yet) — temporary redirect to the primary location so
    // the link starts working as soon as the media delta sync runs.
    return NextResponse.redirect(
      `https://${cdnDomain}/gravity-forms/${formHashes[0]}/${cleanPath}`,
      302
    )
  }

  return NextResponse.redirect(new URL('/', request.url), 302)
}
