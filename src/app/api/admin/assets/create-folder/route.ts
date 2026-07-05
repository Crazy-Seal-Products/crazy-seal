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

export async function POST(request: NextRequest) {
  try {
    const { folderName, parentPath } = await request.json()

    if (!folderName) {
      return NextResponse.json({ error: 'folderName is required' }, { status: 400 })
    }

    const sanitizedName = folderName.trim().toLowerCase().replace(/[^a-z0-9-]/g, '-')
    const parentPrefix = Array.isArray(parentPath) && parentPath.length > 0
      ? parentPath.join('/') + '/'
      : ''

    const key = `site-assets/${parentPrefix}${sanitizedName}/.keep`

    await s3.send(new PutObjectCommand({
      Bucket: BUCKET,
      Key: key,
      Body: '',
      ContentType: 'application/x-empty',
    }))

    return NextResponse.json({ success: true, key })
  } catch (error) {
    console.error('[Assets] Create folder error:', error)
    return NextResponse.json({ error: 'Failed to create folder' }, { status: 500 })
  }
}
