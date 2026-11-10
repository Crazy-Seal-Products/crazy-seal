import { NextRequest, NextResponse } from 'next/server'
import { PutObjectCommand, S3Client } from '@aws-sdk/client-s3'
import { adminCan, getPortalAdmin } from '@/lib/portal/admin/auth'

/**
 * Admin-only: upload a contractor's logo to the media CDN and return its URL.
 * The editor puts the URL in the logo field; nothing changes on the page
 * until the contractor is saved. PNG, JPEG or WebP up to 2 MB (no SVG, which
 * can carry scripts).
 */

const TYPES: Record<string, string> = { 'image/png': 'png', 'image/jpeg': 'jpg', 'image/webp': 'webp' }
const MAX_BYTES = 2 * 1024 * 1024

const s3 = new S3Client({
  region: process.env.AWS_REGION || 'us-east-1',
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!,
  },
})
const BUCKET = process.env.S3_BUCKET_NAME || 'crazy-seal-media'
const CDN_URL = process.env.NEXT_PUBLIC_CLOUDFRONT_URL || `https://${process.env.CLOUDFRONT_DOMAIN || 'media.crazyseal.com'}`

export async function POST(request: NextRequest) {
  const url = new URL(request.url)
  const origin = request.headers.get('origin')
  if (origin && origin !== url.origin) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  if (!(await getPortalAdmin()) || !(await adminCan('contractors'))) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const form = await request.formData()
  // No id yet while a new contractor is being added.
  const id = String(form.get('id') ?? '')
  const file = form.get('file')
  if ((id && !/^[0-9a-f-]{36}$/i.test(id)) || !(file instanceof File)) return NextResponse.json({ error: 'Pick an image to upload.' }, { status: 400 })
  const ext = TYPES[file.type]
  if (!ext) return NextResponse.json({ error: 'Use a PNG, JPEG or WebP image.' }, { status: 400 })
  if (file.size > MAX_BYTES) return NextResponse.json({ error: 'Keep the logo under 2 MB.' }, { status: 400 })

  const key = `site-assets/contractors/${id || 'new'}/logo-${Date.now()}.${ext}`
  try {
    await s3.send(
      new PutObjectCommand({
        Bucket: BUCKET,
        Key: key,
        Body: Buffer.from(await file.arrayBuffer()),
        ContentType: file.type,
        CacheControl: 'public, max-age=31536000, immutable',
      }),
    )
  } catch (err) {
    console.error('[contractors/logo] upload failed', err)
    return NextResponse.json({ error: 'Upload failed. Try again.' }, { status: 500 })
  }
  return NextResponse.json({ url: `${CDN_URL}/${key}` })
}
