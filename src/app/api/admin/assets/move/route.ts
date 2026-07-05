import { NextRequest, NextResponse } from 'next/server'
import { S3Client, CopyObjectCommand, DeleteObjectCommand } from '@aws-sdk/client-s3'

const s3 = new S3Client({
  region: process.env.AWS_REGION || 'us-east-1',
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!,
  },
})

const BUCKET = process.env.S3_BUCKET_NAME || 'rv-armor-media'

export async function POST(request: NextRequest) {
  try {
    const { fileKeys, targetFolder } = await request.json()

    if (!fileKeys?.length || !targetFolder) {
      return NextResponse.json({ error: 'fileKeys and targetFolder are required' }, { status: 400 })
    }

    let movedCount = 0
    const errors: string[] = []

    for (const oldKey of fileKeys) {
      try {
        const fileName = oldKey.split('/').pop()
        const newKey = `site-assets/${targetFolder}/${fileName}`

        await s3.send(new CopyObjectCommand({
          Bucket: BUCKET,
          CopySource: `${BUCKET}/${oldKey}`,
          Key: newKey,
        }))

        await s3.send(new DeleteObjectCommand({
          Bucket: BUCKET,
          Key: oldKey,
        }))

        movedCount++
      } catch (err) {
        errors.push(`${oldKey}: ${err instanceof Error ? err.message : 'Unknown'}`)
      }
    }

    return NextResponse.json({ success: true, movedCount, errors })
  } catch (error) {
    console.error('[Assets] Move error:', error)
    return NextResponse.json({ error: 'Failed to move files' }, { status: 500 })
  }
}
