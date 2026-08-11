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

const ALLOWED_FOLDERS = ['lead-photos', 'warranty', 'content-requests'] as const
const MAX_FILE_SIZE = 30 * 1024 * 1024

/**
 * Issues a presigned S3 PUT URL so form photos can bypass the serverless
 * request-body limit (large iPhone photos were failing via /api/upload).
 * Scoped to image uploads under user-uploads/<allowed folder>/.
 */
export async function POST(request: NextRequest) {
  try {
    const { fileName, fileType, fileSize, folder: folderInput } = await request.json()

    if (!fileName || !fileType) {
      return NextResponse.json({ error: 'fileName and fileType are required' }, { status: 400 })
    }
    if (!fileType.startsWith('image/')) {
      return NextResponse.json({ error: 'Only image uploads are allowed' }, { status: 400 })
    }
    if (typeof fileSize === 'number' && fileSize > MAX_FILE_SIZE) {
      return NextResponse.json({ error: 'File too large (max 30MB)' }, { status: 400 })
    }

    const folder = ALLOWED_FOLDERS.includes(folderInput as typeof ALLOWED_FOLDERS[number])
      ? folderInput
      : 'lead-photos'
    const key = `user-uploads/${folder}/${Date.now()}-${String(fileName).replace(/[^a-zA-Z0-9._-]/g, '_')}`

    const command = new PutObjectCommand({
      Bucket: BUCKET,
      Key: key,
      ContentType: fileType,
    })

    const presignedUrl = await getSignedUrl(s3, command, { expiresIn: 600 })

    return NextResponse.json({ presignedUrl, publicUrl: `${CDN_URL}/${key}` })
  } catch (error) {
    console.error('[Upload] Presign error:', error)
    return NextResponse.json({ error: 'Failed to generate upload URL' }, { status: 500 })
  }
}
