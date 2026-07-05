import { NextRequest, NextResponse } from 'next/server'
import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3'
import { getSignedUrl } from '@aws-sdk/s3-request-presigner'

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
    const { key, fileType } = await request.json()

    if (!key || !fileType) {
      return NextResponse.json({ error: 'key and fileType are required' }, { status: 400 })
    }

    if (!key.startsWith('site-assets/')) {
      return NextResponse.json({ error: 'Key must start with site-assets/' }, { status: 400 })
    }

    const command = new PutObjectCommand({
      Bucket: BUCKET,
      Key: key,
      ContentType: fileType,
    })

    const presignedUrl = await getSignedUrl(s3, command, { expiresIn: 7200 })
    const publicUrl = `${CDN_URL}/${key}`

    return NextResponse.json({ presignedUrl, publicUrl })
  } catch (error) {
    console.error('[Assets] Presigned URL error:', error)
    return NextResponse.json({ error: 'Failed to generate presigned URL' }, { status: 500 })
  }
}
