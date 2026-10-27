import { NextRequest, NextResponse } from 'next/server'
import { PutObjectCommand, S3Client } from '@aws-sdk/client-s3'
import { getPortalAdmin } from '@/lib/portal/admin/auth'

/**
 * Project photo upload for the admin's project editor. Same S3 bucket and
 * key layout as the site admin's asset uploader (site-assets/projects/<slug>/).
 * The browser shrinks photos before sending, so bodies stay well under the
 * hosting request limit.
 */

const s3 = new S3Client({
  region: process.env.AWS_REGION || 'us-east-1',
  credentials: { accessKeyId: process.env.AWS_ACCESS_KEY_ID!, secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY! },
})
const BUCKET = process.env.S3_BUCKET_NAME || 'crazy-seal-media'
const CDN_URL = process.env.NEXT_PUBLIC_CLOUDFRONT_URL || `https://${process.env.CLOUDFRONT_DOMAIN || 'media.crazyseal.com'}`
const MAX_BYTES = 8 * 1024 * 1024

export async function POST(request: NextRequest) {
  if (!(await getPortalAdmin())) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const form = await request.formData()
  const file = form.get('file')
  const slug = String(form.get('slug') ?? '')
    .toLowerCase()
    .replace(/[^a-z0-9-]/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '') || 'unsorted'
  if (!(file instanceof File)) return NextResponse.json({ error: 'No file' }, { status: 400 })
  if (!file.type.startsWith('image/')) return NextResponse.json({ error: 'Only images can be uploaded' }, { status: 400 })
  if (file.size > MAX_BYTES) return NextResponse.json({ error: 'Image is larger than 8 MB' }, { status: 413 })

  const name = file.name.toLowerCase().replace(/[^a-z0-9.-]/g, '-').replace(/-+/g, '-')
  const key = `site-assets/projects/${slug}/${Date.now().toString(36)}-${name}`
  try {
    await s3.send(new PutObjectCommand({ Bucket: BUCKET, Key: key, Body: Buffer.from(await file.arrayBuffer()), ContentType: file.type }))
  } catch (err) {
    console.error('[portal/admin] project upload', err)
    return NextResponse.json({ error: 'Upload failed' }, { status: 500 })
  }
  return NextResponse.json({ url: `${CDN_URL}/${key}` })
}
