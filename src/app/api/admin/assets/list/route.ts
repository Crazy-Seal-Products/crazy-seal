import { NextRequest, NextResponse } from 'next/server'
import { S3Client, ListObjectsV2Command } from '@aws-sdk/client-s3'

const s3 = new S3Client({
  region: process.env.AWS_REGION || 'us-east-1',
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!,
  },
})

const BUCKET = process.env.S3_BUCKET_NAME || 'crazy-seal-media'
const CDN_URL = process.env.NEXT_PUBLIC_CLOUDFRONT_URL || `https://${process.env.CLOUDFRONT_DOMAIN || 'media.crazyseal.com'}`
const PREFIX = 'site-assets/'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const category = searchParams.get('category')

    if (!category) {
      const command = new ListObjectsV2Command({
        Bucket: BUCKET,
        Prefix: PREFIX,
        Delimiter: '/',
      })

      const response = await s3.send(command)
      const categories = (response.CommonPrefixes || [])
        .map(p => p.Prefix?.replace(PREFIX, '').replace(/\/$/, '') || '')
        .filter(Boolean)
        .sort()

      return NextResponse.json({ categories })
    }

    const fullPrefix = `${PREFIX}${category}/`
    const command = new ListObjectsV2Command({
      Bucket: BUCKET,
      Prefix: fullPrefix,
      Delimiter: '/',
    })

    const response = await s3.send(command)

    const subfolders = (response.CommonPrefixes || [])
      .map(p => p.Prefix?.replace(fullPrefix, '').replace(/\/$/, '') || '')
      .filter(Boolean)
      .sort()

    const files = (response.Contents || [])
      .filter(obj => {
        const key = obj.Key || ''
        if (key === fullPrefix) return false
        if (key.endsWith('.keep')) return false
        return true
      })
      .map(obj => {
        const key = obj.Key || ''
        const name = key.split('/').pop() || ''
        return {
          key,
          url: `${CDN_URL}/${key}`,
          name,
          size: obj.Size || 0,
          lastModified: obj.LastModified,
          category,
          path: key.replace(PREFIX, ''),
        }
      })
      .sort((a, b) => a.name.localeCompare(b.name))

    return NextResponse.json({ category, subfolders, files })
  } catch (error) {
    console.error('[Assets] List error:', error)
    return NextResponse.json({ error: 'Failed to list assets' }, { status: 500 })
  }
}
