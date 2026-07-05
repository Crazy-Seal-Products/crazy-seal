const CDN_URL = process.env.NEXT_PUBLIC_CLOUDFRONT_URL || 'https://media.crazyseal.com'
const SITE_ASSETS_PREFIX = 'site-assets/'
const PRESIGNED_THRESHOLD = 4 * 1024 * 1024

export function getSiteAssetUrl(path: string): string {
  const cleanPath = path.startsWith('/') ? path.slice(1) : path
  return `${CDN_URL}/${cleanPath}`
}

async function uploadWithXHRProgress(
  url: string,
  file: File,
  onProgress?: (progress: number) => void
): Promise<void> {
  return new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest()
    xhr.upload.onprogress = (event) => {
      if (event.lengthComputable && onProgress) {
        onProgress(Math.round((event.loaded / event.total) * 100))
      }
    }
    xhr.onload = () => {
      if (xhr.status >= 200 && xhr.status < 300) resolve()
      else reject(new Error(`Upload failed: ${xhr.status} ${xhr.statusText}`))
    }
    xhr.onerror = () => reject(new Error('Network error during upload'))
    xhr.ontimeout = () => reject(new Error('Upload timed out'))
    xhr.timeout = file.size > 100 * 1024 * 1024 ? 7200000 : 600000
    xhr.open('PUT', url)
    xhr.setRequestHeader('Content-Type', file.type || 'application/octet-stream')
    xhr.send(file)
  })
}

async function getSiteAssetPresignedUrl(
  category: string,
  fileName: string,
  fileType: string
): Promise<{ uploadUrl: string; key: string; finalUrl: string }> {
  const sanitizedCategory = category
    .trim().toLowerCase()
    .replace(/[^a-z0-9\/-]/g, '-')
    .replace(/\/+/g, '/')
    .replace(/^\/|\/$/g, '')

  const sanitizedName = fileName.replace(/[^a-zA-Z0-9.-]/g, '-').toLowerCase()
  const key = sanitizedCategory
    ? `${SITE_ASSETS_PREFIX}${sanitizedCategory}/${sanitizedName}`
    : `${SITE_ASSETS_PREFIX}${sanitizedName}`

  const response = await fetch('/api/admin/assets/presigned', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ key, fileType }),
  })

  if (!response.ok) {
    const errorData = await response.json()
    throw new Error(errorData.error || 'Failed to get presigned URL')
  }

  const { presignedUrl, publicUrl } = await response.json()
  return { uploadUrl: presignedUrl, key, finalUrl: publicUrl || `${CDN_URL}/${key}` }
}

async function uploadViaApiRoute(
  category: string,
  file: File,
  onProgress?: (progress: number) => void
): Promise<{ url: string; key: string; fileName: string; category: string }> {
  const formData = new FormData()
  formData.append('file', file)
  formData.append('category', category)

  const response = await fetch('/api/admin/assets/upload', {
    method: 'POST',
    body: formData,
  })

  if (!response.ok) {
    const errorData = await response.json()
    throw new Error(errorData.error || 'Upload failed')
  }

  const result = await response.json()
  if (onProgress) onProgress(100)
  return { url: result.url, key: result.key, fileName: result.fileName, category: result.category }
}

export async function uploadSiteAsset(
  category: string,
  file: File,
  onProgress?: (progress: number) => void
): Promise<{ url: string; key: string; fileName: string; category: string }> {
  if (file.size > PRESIGNED_THRESHOLD) {
    const { uploadUrl, key, finalUrl } = await getSiteAssetPresignedUrl(
      category, file.name, file.type || 'application/octet-stream'
    )
    await uploadWithXHRProgress(uploadUrl, file, onProgress)
    if (onProgress) onProgress(100)

    const sanitizedFileName = key.split('/').pop() || file.name
    const sanitizedCategory = category
      .trim().toLowerCase()
      .replace(/[^a-z0-9\/-]/g, '-')
      .replace(/\/+/g, '/')
      .replace(/^\/|\/$/g, '')

    return { url: finalUrl, key, fileName: sanitizedFileName, category: sanitizedCategory }
  }
  return uploadViaApiRoute(category, file, onProgress)
}

export async function uploadSiteAssetToPath(
  baseCategory: string,
  file: File,
  relativePath: string,
  onProgress?: (progress: number) => void
): Promise<{ url: string; key: string; fileName: string; category: string }> {
  const dir = relativePath.includes('/') ? relativePath.substring(0, relativePath.lastIndexOf('/')) : ''
  const category = dir ? `${baseCategory}/${dir}`.replace(/\/+/g, '/').replace(/^\/|\/$/g, '') : baseCategory
  return uploadSiteAsset(category, file, onProgress)
}

export async function uploadMultipleSiteAssetsWithPaths(
  baseCategory: string,
  items: Array<{ file: File; relativePath: string }>,
  onProgress?: (progress: number) => void,
  onFileProgress?: (fileName: string, status: 'uploading' | 'success' | 'error', progress?: number) => void
): Promise<{ url: string; key: string; fileName: string; category: string; error?: string }[]> {
  const results: { url: string; key: string; fileName: string; category: string; error?: string }[] = []

  for (let index = 0; index < items.length; index++) {
    const { file, relativePath } = items[index]
    const displayName = relativePath || file.name

    if (onFileProgress) onFileProgress(displayName, 'uploading', 0)

    try {
      const result = await uploadSiteAssetToPath(baseCategory, file, relativePath, (progress) => {
        if (onFileProgress) onFileProgress(displayName, 'uploading', progress)
        if (onProgress) {
          const completedProgress = (index / items.length) * 100
          const currentProgress = (progress / 100 / items.length) * 100
          onProgress(Math.round(completedProgress + currentProgress))
        }
      })
      if (onFileProgress) onFileProgress(displayName, 'success', 100)
      results.push({ ...result, error: undefined })
      if (index < items.length - 1) await new Promise(resolve => setTimeout(resolve, 300))
    } catch (error) {
      if (onFileProgress) onFileProgress(displayName, 'error')
      results.push({
        url: '', key: '', fileName: file.name, category: baseCategory,
        error: error instanceof Error ? error.message : 'Upload failed',
      })
    }
  }
  return results
}
