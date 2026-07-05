import { NextRequest, NextResponse } from 'next/server'
import { S3Client, PutObjectCommand, DeleteObjectCommand } from '@aws-sdk/client-s3'

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
  try {
    const formData = await request.formData()
    const file = formData.get('file') as File | null
    const category = formData.get('category') as string | null

    if (!file || !category) {
      return NextResponse.json({ error: 'File and category are required' }, { status: 400 })
    }

    const sanitizedCategory = category
      .trim().toLowerCase()
      .replace(/[^a-z0-9\/-]/g, '-')
      .replace(/\/+/g, '/')
      .replace(/^\/|\/$/g, '')

    const sanitizedName = file.name.replace(/[^a-zA-Z0-9.-]/g, '-').toLowerCase()
    const key = `site-assets/${sanitizedCategory}/${sanitizedName}`

    const buffer = Buffer.from(await file.arrayBuffer())

    await s3.send(new PutObjectCommand({
      Bucket: BUCKET,
      Key: key,
      Body: buffer,
      ContentType: file.type || 'application/octet-stream',
    }))

    return NextResponse.json({
      url: `${CDN_URL}/${key}`,
      key,
      fileName: sanitizedName,
      category: sanitizedCategory,
    })
  } catch (error) {
    console.error('[Assets] Upload error:', error)
    return NextResponse.json({ error: 'Upload failed' }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { s3Key } = await request.json()

    if (!s3Key) {
      return NextResponse.json({ error: 's3Key is required' }, { status: 400 })
    }

    if (!s3Key.startsWith('site-assets/')) {
      return NextResponse.json({ error: 'Can only delete site-assets' }, { status: 400 })
    }

    await s3.send(new DeleteObjectCommand({
      Bucket: BUCKET,
      Key: s3Key,
    }))

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('[Assets] Delete error:', error)
    return NextResponse.json({ error: 'Delete failed' }, { status: 500 })
  }
}
