import { NextRequest, NextResponse } from 'next/server'
import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3'

const s3 = new S3Client({
  region: process.env.AWS_REGION || 'us-east-1',
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!,
  },
})

const BUCKET = process.env.S3_BUCKET_NAME || 'crazy-seal-media'
const CDN_URL = process.env.NEXT_PUBLIC_CLOUDFRONT_URL || `https://${process.env.CLOUDFRONT_DOMAIN || 'media.crazyseal.com'}`

const ALLOWED_FOLDERS = ['lead-photos', 'warranty', 'content-requests'] as const
const EXT_TO_MIME: Record<string, string> = {
  heic: 'image/heic', heif: 'image/heif', jpg: 'image/jpeg', jpeg: 'image/jpeg',
  png: 'image/png', gif: 'image/gif', webp: 'image/webp', bmp: 'image/bmp',
  tif: 'image/tiff', tiff: 'image/tiff',
}

/**
 * Files with a MIME type the browser doesn't recognize (common for HEIC)
 * arrive as application/octet-stream, so fall back to the extension.
 */
function imageContentType(file: File): string | null {
  if (file.type.startsWith('image/')) return file.type
  if (!file.type || file.type === 'application/octet-stream') {
    const ext = file.name.split('.').pop()?.toLowerCase() || ''
    return EXT_TO_MIME[ext] || null
  }
  return null
}

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData()
    const files = formData.getAll('files') as File[]
    const folderInput = formData.get('folder') as string | null
    const folder = ALLOWED_FOLDERS.includes(folderInput as typeof ALLOWED_FOLDERS[number])
      ? folderInput
      : 'lead-photos'

    if (!files.length) {
      return NextResponse.json({ error: 'No files provided' }, { status: 400 })
    }

    const urls: string[] = []

    for (const file of files) {
      const contentType = imageContentType(file)
      if (!contentType) continue

      const key = `user-uploads/${folder}/${Date.now()}-${file.name.replace(/[^a-zA-Z0-9._-]/g, '_')}`
      const buffer = Buffer.from(await file.arrayBuffer())

      await s3.send(new PutObjectCommand({
        Bucket: BUCKET,
        Key: key,
        Body: buffer,
        ContentType: contentType,
      }))

      urls.push(`${CDN_URL}/${key}`)
    }

    return NextResponse.json({ urls })
  } catch (error) {
    console.error('[Upload] Error:', error)
    return NextResponse.json({ error: 'Upload failed' }, { status: 500 })
  }
}
