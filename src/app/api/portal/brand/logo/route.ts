import { NextRequest, NextResponse } from 'next/server'
import { PutObjectCommand, S3Client } from '@aws-sdk/client-s3'
import { portalAction } from '@/lib/contractor/guard'

/**
 * Contractor portal: upload the contractor's logo for their page (Your page)
 * to the media CDN and return its URL. Same rules as the admin's upload
 * (/api/admin/contractors/logo): PNG, JPEG or WebP up to 2 MB, no SVG (it can
 * carry scripts). Nothing changes on their page until they save.
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
  const g = await portalAction('brand.manage')
  if (!g.ok) return NextResponse.json({ error: g.error }, { status: 403 })

  const form = await request.formData().catch(() => null)
  const file = form?.get('file')
  if (!(file instanceof File)) return NextResponse.json({ error: 'Pick an image to upload.' }, { status: 400 })
  const ext = TYPES[file.type]
  if (!ext) return NextResponse.json({ error: 'Use a PNG, JPEG or WebP image.' }, { status: 400 })
  if (file.size > MAX_BYTES) return NextResponse.json({ error: 'Keep the logo under 2 MB.' }, { status: 400 })

  const key = `site-assets/contractors/${g.viewer.contractor.id}/logo-${Date.now()}.${ext}`
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
    console.error('[portal/brand/logo] upload failed', err)
    return NextResponse.json({ error: 'Upload failed. Try again.' }, { status: 500 })
  }
  return NextResponse.json({ url: `${CDN_URL}/${key}` })
}
