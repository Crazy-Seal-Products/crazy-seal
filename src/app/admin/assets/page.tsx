'use client'

import { useState, useEffect } from 'react'
import {
  Container,
  Card,
  Button,
  Badge,
  Input,
  Stack,
  Heading,
  Text,
  Spinner,
} from '@/lib/design-system'
import {
  Upload,
  Copy,
  Check,
  Image as ImageIcon,
  Video,
  Music,
  File,
  Folder,
  Plus,
  ChevronRight,
  ArrowLeft,
  CheckCircle2,
  X,
  Search,
  Trash2,
  Play,
  Pause,
  ChevronLeft,
  FileText,
  Grid,
  List,
  Clapperboard,
  Loader2,
} from 'lucide-react'
import { uploadMultipleSiteAssetsWithPaths } from '@/lib/storage/site-assets'

type SelectedItem = { file: File; relativePath: string }

interface AssetFile {
  key: string
  url: string
  name: string
  size: number
  lastModified?: Date
  category: string
  path?: string
  variants?: VideoVariant[]
}

interface VideoVariant {
  type: 'original' | '1080p' | '720p' | 'thumb'
  key: string
  url: string
  size?: number
}

interface ImageDimensions { width: number; height: number; loaded: boolean }
interface CategoryData {
  category?: string
  categories?: string[]
  subfolders?: string[]
  files?: AssetFile[]
}

function groupVideoVariants(files: AssetFile[]): AssetFile[] {
  const fileMap = new Map<string, AssetFile>()
  const variantMap = new Map<string, VideoVariant[]>()

  files.forEach(file => {
    const variantMatch = file.name.match(/^(.+)-(original|1080p|720p|thumb)(?:\.\d+)?\.(mp4|jpg|jpeg)$/i)
    if (variantMatch) {
      const baseName = variantMatch[1]
      const variantType = variantMatch[2].toLowerCase() as VideoVariant['type']
      const baseKey = file.key.replace(/-(original|1080p|720p|thumb)(?:\.\d+)?\.(mp4|jpg|jpeg)$/i, '')

      if (!variantMap.has(baseKey)) variantMap.set(baseKey, [])
      variantMap.get(baseKey)!.push({ type: variantType, key: file.key, url: file.url, size: file.size })

      if (!fileMap.has(baseKey)) {
        fileMap.set(baseKey, {
          ...file,
          name: baseName + (variantType === 'thumb' ? '.jpg' : '.mp4'),
          key: baseKey,
          variants: [],
        })
      }
    } else {
      fileMap.set(file.key, file)
    }
  })

  variantMap.forEach((variants, baseKey) => {
    const baseFile = fileMap.get(baseKey)
    if (baseFile) baseFile.variants = variants
  })

  return Array.from(fileMap.values())
}

function formatFileSize(bytes: number) {
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
}

function getFileIcon(fileName: string) {
  const ext = fileName.split('.').pop()?.toLowerCase()
  if (['jpg', 'jpeg', 'png', 'gif', 'webp', 'svg'].includes(ext || '')) return ImageIcon
  if (['mp4', 'webm', 'mov', 'avi'].includes(ext || '')) return Video
  if (['mp3', 'wav', 'ogg', 'm4a'].includes(ext || '')) return Music
  if (ext === 'pdf') return FileText
  return File
}

function getFileType(fileName: string) {
  return fileName.split('.').pop()?.toUpperCase() || 'Unknown'
}

async function readEntriesFromDrop(items: DataTransferItemList): Promise<SelectedItem[]> {
  const result: SelectedItem[] = []
  const getEntry = (item: DataTransferItem) =>
    (item as DataTransferItem & { webkitGetAsEntry?: () => FileSystemEntry | null }).webkitGetAsEntry?.()

  async function readDir(entry: FileSystemDirectoryEntry, basePath: string): Promise<void> {
    const reader = entry.createReader()
    const readBatch = (): Promise<FileSystemEntry[]> =>
      new Promise((resolve, reject) => { reader.readEntries(resolve, reject) })
    let entries: FileSystemEntry[] = []
    let batch: FileSystemEntry[]
    do { batch = await readBatch(); entries = entries.concat(batch) } while (batch.length > 0)

    for (const e of entries) {
      const path = basePath ? `${basePath}/${e.name}` : e.name
      if (e.isFile) {
        const file = await new Promise<File>((res, rej) => { (e as FileSystemFileEntry).file(res, rej) })
        result.push({ file, relativePath: path })
      } else if (e.isDirectory) {
        await readDir(e as FileSystemDirectoryEntry, path)
      }
    }
  }

  for (let i = 0; i < items.length; i++) {
    const entry = getEntry(items[i])
    if (!entry) {
      const file = items[i].getAsFile()
      if (file) result.push({ file, relativePath: file.name })
      continue
    }
    if (entry.isFile) {
      const file = await new Promise<File>((res, rej) => { (entry as FileSystemFileEntry).file(res, rej) })
      result.push({ file, relativePath: file.name })
    } else if (entry.isDirectory) {
      await readDir(entry as FileSystemDirectoryEntry, entry.name)
    }
  }
  return result
}

export default function AssetsAdminPage() {
  const [loading, setLoading] = useState(true)
  const [uploading, setUploading] = useState(false)
  const [currentPath, setCurrentPath] = useState<string[]>([])
  const [categories, setCategories] = useState<string[]>([])
  const [subfolders, setSubfolders] = useState<string[]>([])
  const [files, setFiles] = useState<AssetFile[]>([])
  const [copiedUrl, setCopiedUrl] = useState<string | null>(null)
  const [newFolder, setNewFolder] = useState('')
  const [showUploadForm, setShowUploadForm] = useState(false)
  const [selectedItems, setSelectedItems] = useState<SelectedItem[]>([])
  const [uploadCategory, setUploadCategory] = useState('')
  const [imageDimensions, setImageDimensions] = useState<Record<string, ImageDimensions>>({})
  const [uploadProgress, setUploadProgress] = useState<Record<string, number>>({})
  const [uploadStatus, setUploadStatus] = useState<Record<string, 'pending' | 'uploading' | 'success' | 'error'>>({})
  const [successMessage, setSuccessMessage] = useState<{ title: string; details?: string[] } | null>(null)
  const [errorMessage, setErrorMessage] = useState<{ title: string; details?: string[] } | null>(null)
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedFileKeys, setSelectedFileKeys] = useState<Set<string>>(new Set())
  const [selectedFileOrder, setSelectedFileOrder] = useState<string[]>([])
  const [deleting, setDeleting] = useState(false)
  const [deletingKeys, setDeletingKeys] = useState<Set<string>>(new Set())
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
  const [isDragging, setIsDragging] = useState(false)
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid')
  const [draggedFiles, setDraggedFiles] = useState<string[]>([])
  const [dragOverFolder, setDragOverFolder] = useState<string | null>(null)
  const [imageLightboxOpen, setImageLightboxOpen] = useState(false)
  const [imageLightboxUrl, setImageLightboxUrl] = useState<string>('')
  const [imageLightboxIndex, setImageLightboxIndex] = useState(0)
  const [imageLightboxFiles, setImageLightboxFiles] = useState<AssetFile[]>([])
  const [playingAudio, setPlayingAudio] = useState<string | null>(null)
  const [audioElements, setAudioElements] = useState<Record<string, HTMLAudioElement>>({})
  const [processingVideos, setProcessingVideos] = useState<Set<string>>(new Set())

  const fetchAssets = async () => {
    try {
      setLoading(true)
      const response = await fetch('/api/admin/assets/list')
      if (!response.ok) throw new Error('Failed to fetch assets')
      const data: CategoryData = await response.json()
      setCategories(data.categories || [])
      setSubfolders([])
      setFiles([])
    } catch (error) {
      console.error('Error fetching assets:', error)
    } finally {
      setLoading(false)
    }
  }

  const fetchCurrentPathAssets = async () => {
    try {
      const categoryPath = currentPath.join('/')
      const response = await fetch(`/api/admin/assets/list?category=${encodeURIComponent(categoryPath)}`)
      if (!response.ok) throw new Error('Failed to fetch assets')
      const data: CategoryData = await response.json()
      setSubfolders(data.subfolders || [])
      setFiles(groupVideoVariants(data.files || []))
    } catch (error) {
      console.error('Error fetching assets:', error)
    }
  }

  useEffect(() => { fetchAssets() }, [])
  useEffect(() => { fetchCurrentPathAssets() }, [currentPath])

  useEffect(() => {
    files.forEach(file => {
      const isImage = file.name.match(/\.(jpg|jpeg|png|gif|webp|svg)$/i)
      if (isImage && !imageDimensions[file.key]?.loaded) {
        const img = new window.Image()
        img.onload = () => setImageDimensions(prev => ({ ...prev, [file.key]: { width: img.width, height: img.height, loaded: true } }))
        img.onerror = () => setImageDimensions(prev => ({ ...prev, [file.key]: { width: 0, height: 0, loaded: true } }))
        img.src = file.url
      }
    })
  }, [files])

  const navigateToPath = (path: string[]) => setCurrentPath(path)
  const navigateToSubfolder = (subfolder: string) => setCurrentPath([...currentPath, subfolder])

  const processSelectedItems = (items: SelectedItem[]) => {
    if (items.length === 0) return
    setSelectedItems(items)
    const status: Record<string, 'pending'> = {}
    const progress: Record<string, number> = {}
    items.forEach(({ relativePath }) => { status[relativePath] = 'pending'; progress[relativePath] = 0 })
    setUploadStatus(status)
    setUploadProgress(progress)
    if (!uploadCategory && currentPath.length > 0) setUploadCategory(currentPath.join('/'))
    else if (!uploadCategory && items.length > 0) {
      const first = items[0].file
      if (first.type.startsWith('image/')) setUploadCategory('images')
      else if (first.type.startsWith('video/')) setUploadCategory('video')
      else if (first.type.startsWith('audio/')) setUploadCategory('audio')
    }
    if (!showUploadForm) setShowUploadForm(true)
  }

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const fileList = Array.from(e.target.files || [])
    if (fileList.length > 0) {
      processSelectedItems(fileList.map(f => ({
        file: f,
        relativePath: (f as File & { webkitRelativePath?: string }).webkitRelativePath || f.name,
      })))
    }
  }

  const handleDragEnter = (e: React.DragEvent) => { e.preventDefault(); e.stopPropagation(); setIsDragging(true) }
  const handleDragLeave = (e: React.DragEvent) => { e.preventDefault(); e.stopPropagation(); if (e.currentTarget === e.target) setIsDragging(false) }
  const handleDragOver = (e: React.DragEvent) => { e.preventDefault(); e.stopPropagation() }
  const handleDrop = async (e: React.DragEvent) => {
    e.preventDefault(); e.stopPropagation(); setIsDragging(false)
    const items = e.dataTransfer.items
    const filesSnapshot = Array.from(e.dataTransfer.files || [])
    let hasDirectory = false
    const getEntry = (item: DataTransferItem) =>
      (item as DataTransferItem & { webkitGetAsEntry?: () => FileSystemEntry | null }).webkitGetAsEntry?.()
    if (items?.length) {
      for (let i = 0; i < items.length; i++) { if (getEntry(items[i])?.isDirectory) { hasDirectory = true; break } }
    }
    if (hasDirectory && items?.length) {
      try {
        const parsed = await readEntriesFromDrop(items)
        if (parsed.length > 0) { processSelectedItems(parsed); return }
      } catch (err) { console.error('Error reading dropped folder:', err) }
    }
    if (filesSnapshot.length > 0) processSelectedItems(filesSnapshot.map(f => ({ file: f, relativePath: f.name })))
  }

  const removeFile = (relativePath: string) => {
    setSelectedItems(prev => prev.filter(item => item.relativePath !== relativePath))
    setUploadStatus(prev => { const next = { ...prev }; delete next[relativePath]; return next })
    setUploadProgress(prev => { const next = { ...prev }; delete next[relativePath]; return next })
  }

  const handleUpload = async () => {
    if (selectedItems.length === 0 || !uploadCategory) {
      setErrorMessage({ title: 'Upload Error', details: ['Please select at least one file and category/path'] })
      setTimeout(() => setErrorMessage(null), 3000); return
    }
    try {
      setUploading(true)
      const results = await uploadMultipleSiteAssetsWithPaths(uploadCategory, selectedItems, undefined, (displayName, status, progress) => {
        if (status === 'uploading') { setUploadStatus(prev => ({ ...prev, [displayName]: 'uploading' })); setUploadProgress(prev => ({ ...prev, [displayName]: progress || 0 })) }
        else if (status === 'success') { setUploadStatus(prev => ({ ...prev, [displayName]: 'success' })); setUploadProgress(prev => ({ ...prev, [displayName]: 100 })) }
        else if (status === 'error') { setUploadStatus(prev => ({ ...prev, [displayName]: 'error' })) }
      })
      const uploaded = results.filter(r => !r.error)
      const errors = results.filter(r => r.error).map(r => `${r.fileName}: ${r.error}`)
      await fetchCurrentPathAssets()
      if (errors.length === 0) {
        setSuccessMessage({ title: `${uploaded.length} file${uploaded.length > 1 ? 's' : ''} uploaded successfully!` })
        setSelectedItems([]); setUploadCategory(''); setUploadStatus({}); setUploadProgress({})
        setTimeout(() => setSuccessMessage(null), 4000)
      } else if (uploaded.length > 0) {
        setSuccessMessage({ title: `${uploaded.length} uploaded`, details: [`${errors.length} failed`, ...errors] })
      } else {
        setErrorMessage({ title: 'Upload failed', details: errors })
        setTimeout(() => setErrorMessage(null), 5000)
      }
    } catch (error) {
      setErrorMessage({ title: 'Upload failed', details: [error instanceof Error ? error.message : 'Unknown error'] })
      setTimeout(() => setErrorMessage(null), 5000)
    } finally { setUploading(false) }
  }

  const copyToClipboard = async (url: string) => {
    try {
      const urlObj = new URL(url)
      const encodedPath = urlObj.pathname.split('/').map(segment => encodeURIComponent(segment)).join('/')
      await navigator.clipboard.writeText(`${urlObj.origin}${encodedPath}${urlObj.search}${urlObj.hash}`)
      setCopiedUrl(url); setTimeout(() => setCopiedUrl(null), 2000)
    } catch { setErrorMessage({ title: 'Copy Failed' }); setTimeout(() => setErrorMessage(null), 3000) }
  }

  const toggleFileSelection = (fileKey: string) => {
    setSelectedFileKeys(prev => { const next = new Set(prev); if (next.has(fileKey)) next.delete(fileKey); else next.add(fileKey); return next })
    setSelectedFileOrder(prev => prev.includes(fileKey) ? prev.filter(k => k !== fileKey) : [...prev, fileKey])
  }

  const selectAllFiles = () => {
    if (selectedFileKeys.size === filteredFiles.length) { setSelectedFileKeys(new Set()); setSelectedFileOrder([]) }
    else { const allKeys = filteredFiles.map(f => f.key); setSelectedFileKeys(new Set(allKeys)); setSelectedFileOrder(allKeys) }
  }

  const copySelectedLinks = async () => {
    if (selectedFileOrder.length === 0) return
    const urls = selectedFileOrder.map(key => files.find(f => f.key === key)).filter((f): f is AssetFile => !!f).map(f => f.url).join('\n')
    await navigator.clipboard.writeText(urls)
    setSuccessMessage({ title: `Copied ${selectedFileOrder.length} link${selectedFileOrder.length !== 1 ? 's' : ''}` })
    setTimeout(() => setSuccessMessage(null), 3000)
  }

  const confirmDelete = async () => {
    setShowDeleteConfirm(false)
    try {
      setDeleting(true)
      const filesToDelete = Array.from(selectedFileKeys)
      const deletedFiles: string[] = []; const errors: string[] = []
      for (const fileKey of filesToDelete) {
        try {
          setDeletingKeys(prev => new Set(prev).add(fileKey))
          const file = files.find(f => f.key === fileKey)
          const keysToDelete = [fileKey, ...(file?.variants?.map(v => v.key) || [])]
          for (const key of keysToDelete) {
            const res = await fetch('/api/admin/assets/upload', { method: 'DELETE', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ s3Key: key }) })
            if (!res.ok) throw new Error((await res.json()).error || 'Delete failed')
          }
          deletedFiles.push(fileKey)
        } catch (err) {
          errors.push(`${files.find(f => f.key === fileKey)?.name || fileKey}: ${err instanceof Error ? err.message : 'Unknown'}`)
        } finally {
          setDeletingKeys(prev => { const next = new Set(prev); next.delete(fileKey); return next })
        }
      }
      await fetchCurrentPathAssets(); setSelectedFileKeys(new Set()); setSelectedFileOrder([])
      if (errors.length === 0) setSuccessMessage({ title: `${deletedFiles.length} file${deletedFiles.length > 1 ? 's' : ''} deleted!` })
      else if (deletedFiles.length > 0) setSuccessMessage({ title: `${deletedFiles.length} deleted`, details: [`${errors.length} failed`, ...errors] })
      else { setErrorMessage({ title: 'Delete failed', details: errors }); setTimeout(() => setErrorMessage(null), 5000) }
    } catch (error) {
      setErrorMessage({ title: 'Delete failed', details: [error instanceof Error ? error.message : 'Unknown'] }); setTimeout(() => setErrorMessage(null), 5000)
    } finally { setDeleting(false) }
  }

  const handleDragStart = (e: React.DragEvent, fileKeys: string[]) => { e.stopPropagation(); setDraggedFiles(fileKeys); e.dataTransfer.effectAllowed = 'move'; if (e.currentTarget instanceof HTMLElement) e.currentTarget.style.opacity = '0.5' }
  const handleDragEnd = (e: React.DragEvent) => { e.stopPropagation(); setDraggedFiles([]); setDragOverFolder(null); if (e.currentTarget instanceof HTMLElement) e.currentTarget.style.opacity = '1' }
  const handleDragOverFolder = (e: React.DragEvent, folder: string) => { e.preventDefault(); e.stopPropagation(); e.dataTransfer.dropEffect = 'move'; setDragOverFolder(folder) }
  const handleDragLeaveFolder = () => setDragOverFolder(null)
  const handleDropOnFolder = async (e: React.DragEvent, targetFolder: string) => {
    e.preventDefault(); e.stopPropagation(); setDragOverFolder(null)
    if (draggedFiles.length === 0) return
    try {
      const targetPath = currentPath.length === 0 ? targetFolder : [...currentPath, targetFolder].join('/')
      const res = await fetch('/api/admin/assets/move', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ fileKeys: draggedFiles, targetFolder: targetPath }) })
      if (!res.ok) throw new Error((await res.json()).message || 'Failed to move')
      const result = await res.json()
      setSuccessMessage({ title: `${result.movedCount} file${result.movedCount > 1 ? 's' : ''} moved to ${targetFolder}` })
      setTimeout(() => setSuccessMessage(null), 3000)
      await fetchCurrentPathAssets(); setSelectedFileKeys(new Set()); setSelectedFileOrder([]); setDraggedFiles([])
    } catch (error) {
      setErrorMessage({ title: 'Failed to move files', details: [error instanceof Error ? error.message : 'Unknown'] }); setTimeout(() => setErrorMessage(null), 5000)
    }
  }

  const toggleAudio = (fileKey: string, url: string) => {
    if (playingAudio === fileKey) {
      audioElements[fileKey]?.pause(); setPlayingAudio(null)
    } else {
      if (playingAudio && audioElements[playingAudio]) audioElements[playingAudio].pause()
      let audio = audioElements[fileKey]
      if (!audio) {
        audio = new Audio(url)
        audio.addEventListener('ended', () => setPlayingAudio(null))
        setAudioElements(prev => ({ ...prev, [fileKey]: audio }))
      }
      setPlayingAudio(fileKey)
      audio.play().catch(() => setPlayingAudio(null))
    }
  }

  useEffect(() => { return () => { Object.values(audioElements).forEach(a => { a?.pause(); a.src = '' }) } }, [audioElements])

  const triggerMediaConvert = async (file: AssetFile) => {
    setProcessingVideos(prev => new Set(prev).add(file.key))
    try {
      const res = await fetch('/api/admin/mediaconvert/trigger', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ inputKey: file.key, filename: file.name }),
      })
      if (!res.ok) {
        const data = await res.json()
        throw new Error(data.error || 'Failed to trigger processing')
      }
      const data = await res.json()
      setSuccessMessage({
        title: 'Video processing started',
        details: [
          `Job ID: ${data.jobId}`,
          'Outputs: thumbnail, original, 1080p, 720p',
          'Processing typically takes 2-5 minutes.',
        ],
      })
      setTimeout(() => setSuccessMessage(null), 8000)
    } catch (error) {
      setErrorMessage({
        title: 'Failed to process video',
        details: [error instanceof Error ? error.message : 'Unknown error'],
      })
      setTimeout(() => setErrorMessage(null), 5000)
    } finally {
      setProcessingVideos(prev => { const next = new Set(prev); next.delete(file.key); return next })
    }
  }

  const filteredFiles = files.filter(file => {
    if (!searchQuery.trim()) return true
    const q = searchQuery.toLowerCase().trim()
    return file.name.toLowerCase().includes(q) || getFileType(file.name).toLowerCase().includes(q) || (file.category?.toLowerCase() || '').includes(q)
  })
  const filteredSubfolders = subfolders.filter(f => !searchQuery.trim() || f.toLowerCase().includes(searchQuery.toLowerCase().trim()))

  const openImageLightbox = (file: AssetFile, index: number) => {
    const imageFiles = filteredFiles.filter(f => ['jpg', 'jpeg', 'png', 'gif', 'webp', 'svg'].includes(f.name.split('.').pop()?.toLowerCase() || ''))
    setImageLightboxFiles(imageFiles); setImageLightboxIndex(index); setImageLightboxUrl(file.url); setImageLightboxOpen(true)
  }
  const closeImageLightbox = () => { setImageLightboxOpen(false); setImageLightboxUrl(''); setImageLightboxFiles([]) }
  const nextImage = () => { if (imageLightboxFiles.length > 0) { const n = (imageLightboxIndex + 1) % imageLightboxFiles.length; setImageLightboxIndex(n); setImageLightboxUrl(imageLightboxFiles[n].url) } }
  const prevImage = () => { if (imageLightboxFiles.length > 0) { const p = (imageLightboxIndex - 1 + imageLightboxFiles.length) % imageLightboxFiles.length; setImageLightboxIndex(p); setImageLightboxUrl(imageLightboxFiles[p].url) } }

  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (imageLightboxOpen) { if (e.key === 'Escape') closeImageLightbox(); else if (e.key === 'ArrowLeft') prevImage(); else if (e.key === 'ArrowRight') nextImage() }
    }
    window.addEventListener('keydown', handleKey); return () => window.removeEventListener('keydown', handleKey)
  }, [imageLightboxOpen, imageLightboxIndex, imageLightboxFiles])

  return (
    <>
      {showDeleteConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <Card variant="elevated" className="max-w-md w-full border-red-200 shadow-2xl">
            <div className="space-y-6 p-6">
              <div className="flex items-start gap-4">
                <div className="flex-shrink-0 w-12 h-12 bg-red-100 rounded-full flex items-center justify-center border-2 border-red-500">
                  <Trash2 className="w-6 h-6 text-red-500" />
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="text-xl font-bold text-gray-900 mb-2">Delete {selectedFileKeys.size} File{selectedFileKeys.size !== 1 ? 's' : ''}?</h3>
                  <p className="text-sm text-gray-600">This cannot be undone.</p>
                </div>
              </div>
              <div className="flex gap-3">
                <Button variant="outline" className="flex-1" onClick={() => setShowDeleteConfirm(false)}>Cancel</Button>
                <Button variant="danger" className="flex-1" onClick={confirmDelete}><Trash2 className="w-4 h-4 mr-2" />Delete</Button>
              </div>
            </div>
          </Card>
        </div>
      )}

      {successMessage && (
        <div className="fixed top-4 right-4 z-50 max-w-md animate-in slide-in-from-right duration-300">
          <Card variant="elevated" className="bg-blue-50 border-blue-200 shadow-lg">
            <div className="flex items-start gap-4 p-4">
              <div className="flex-shrink-0 w-10 h-10 bg-[#003365] rounded-full flex items-center justify-center"><CheckCircle2 className="w-6 h-6 text-white" /></div>
              <div className="flex-1 min-w-0">
                <h3 className="text-base font-semibold text-[#003365] mb-1">{successMessage.title}</h3>
                {successMessage.details?.map((d, i) => <p key={i} className="text-sm text-gray-600">{d}</p>)}
              </div>
              <button onClick={() => setSuccessMessage(null)} className="text-gray-400 hover:text-gray-600"><X className="w-5 h-5" /></button>
            </div>
          </Card>
        </div>
      )}

      {errorMessage && (
        <div className="fixed top-4 right-4 z-50 max-w-md animate-in slide-in-from-right duration-300">
          <Card variant="elevated" className="bg-red-50 border-red-200 shadow-lg">
            <div className="flex items-start gap-4 p-4">
              <div className="flex-shrink-0 w-10 h-10 bg-red-500 rounded-full flex items-center justify-center"><X className="w-6 h-6 text-white" /></div>
              <div className="flex-1 min-w-0">
                <h3 className="text-base font-semibold text-red-600 mb-1">{errorMessage.title}</h3>
                {errorMessage.details?.map((d, i) => <p key={i} className="text-sm text-gray-600">{d}</p>)}
              </div>
              <button onClick={() => setErrorMessage(null)} className="text-gray-400 hover:text-gray-600"><X className="w-5 h-5" /></button>
            </div>
          </Card>
        </div>
      )}

      {imageLightboxOpen && (
        <div className="fixed inset-0 bg-black/90 z-50 flex items-center justify-center" onClick={closeImageLightbox}>
          <div className="relative w-full h-full flex items-center justify-center p-4" onClick={e => e.stopPropagation()}>
            <button onClick={closeImageLightbox} className="absolute top-4 right-4 z-10 p-2 bg-black/50 rounded-full text-white"><X className="w-6 h-6" /></button>
            {imageLightboxFiles.length > 1 && (
              <>
                <button onClick={prevImage} className="absolute left-4 z-10 p-2 bg-black/50 rounded-full text-white"><ChevronLeft className="w-6 h-6" /></button>
                <button onClick={nextImage} className="absolute right-4 z-10 p-2 bg-black/50 rounded-full text-white"><ChevronRight className="w-6 h-6" /></button>
              </>
            )}
            <div className="max-w-6xl max-h-full flex flex-col items-center gap-4">
              <img src={imageLightboxUrl} alt="Preview" className="max-w-full max-h-[calc(100vh-200px)] object-contain" />
              <Button variant="primary" onClick={e => { e.stopPropagation(); copyToClipboard(imageLightboxUrl) }}>
                {copiedUrl === imageLightboxUrl ? <><Check className="w-4 h-4 mr-2" />Copied!</> : <><Copy className="w-4 h-4 mr-2" />Copy Link</>}
              </Button>
            </div>
            {imageLightboxFiles.length > 1 && (
              <div className="absolute bottom-4 left-1/2 -translate-x-1/2 bg-black/50 text-white px-3 py-1 rounded-full text-sm">
                {imageLightboxIndex + 1} of {imageLightboxFiles.length}
              </div>
            )}
          </div>
        </div>
      )}

      <div className="p-4 md:p-6 lg:p-8">
        <Container size="xl">
          <Stack gap="lg">
            <div className="mb-6 md:mb-8" onDragEnter={handleDragEnter} onDragLeave={handleDragLeave} onDragOver={handleDragOver} onDrop={handleDrop}>
              {isDragging && (
                <div className="fixed inset-0 z-40 bg-[#003365]/20 backdrop-blur-sm flex items-center justify-center pointer-events-none">
                  <div className="bg-white border-4 border-dashed border-[#003365] rounded-2xl p-12 text-center shadow-xl">
                    <Upload className="w-16 h-16 text-[#003365] mx-auto mb-4" />
                    <h3 className="text-2xl font-bold text-gray-900 mb-2">Drop files or folders to upload</h3>
                    <p className="text-gray-600">Release to add to {currentPath.length > 0 ? currentPath.join('/') : 'root'}</p>
                  </div>
                </div>
              )}
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 mb-4">
                <div>
                  <Heading level={1} className="text-2xl md:text-3xl font-bold text-gray-900 mb-2">Site Assets Manager</Heading>
                  <Text className="text-sm text-gray-500">Upload and manage site assets organized by category</Text>
                </div>
                <Button variant="primary" size="sm" onClick={() => setShowUploadForm(!showUploadForm)}>
                  <Plus className="w-4 h-4 mr-2" />Upload Asset
                </Button>
              </div>
              <div className="flex gap-3">
                <div className="relative flex-1">
                  <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <Input type="text" value={searchQuery} onChange={e => setSearchQuery(e.target.value)} placeholder="Search files by name, type, or folder..." className="w-full pl-12 pr-4" />
                  {searchQuery && <button onClick={() => setSearchQuery('')} className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"><X className="w-5 h-5" /></button>}
                </div>
                <div className="flex gap-1 bg-gray-200 rounded-lg p-1">
                  <button onClick={() => setViewMode('grid')} className={`p-2 rounded ${viewMode === 'grid' ? 'bg-[#003365] text-white' : 'text-gray-500 hover:text-gray-700'}`}><Grid className="w-5 h-5" /></button>
                  <button onClick={() => setViewMode('list')} className={`p-2 rounded ${viewMode === 'list' ? 'bg-[#003365] text-white' : 'text-gray-500 hover:text-gray-700'}`}><List className="w-5 h-5" /></button>
                </div>
              </div>
            </div>

            {filteredFiles.length > 0 && (
              <div className="mb-4 p-4 bg-gray-100 rounded-lg border border-gray-200">
                <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
                  <div className="flex items-center gap-2">
                    <Button variant={selectedFileKeys.size === filteredFiles.length ? 'primary' : 'outline'} size="sm" onClick={selectAllFiles}>
                      <CheckCircle2 className="w-4 h-4 mr-2" />{selectedFileKeys.size === filteredFiles.length ? 'Deselect All' : `Select All (${filteredFiles.length})`}
                    </Button>
                    {selectedFileKeys.size > 0 && <Badge variant="primary">{selectedFileKeys.size} of {filteredFiles.length} selected</Badge>}
                  </div>
                  {selectedFileKeys.size > 0 && (
                    <div className="flex gap-2">
                      <Button variant="primary" size="sm" onClick={copySelectedLinks}><Copy className="w-4 h-4 mr-2" />Copy {selectedFileKeys.size} Link{selectedFileKeys.size !== 1 ? 's' : ''}</Button>
                      <Button variant="danger" size="sm" onClick={() => setShowDeleteConfirm(true)} disabled={deleting}><Trash2 className="w-4 h-4 mr-2" />{deleting ? 'Deleting...' : `Delete ${selectedFileKeys.size}`}</Button>
                    </div>
                  )}
                </div>
              </div>
            )}

            {currentPath.length > 0 && (
              <Card variant="outlined" className="p-4">
                <div className="flex items-center gap-2 flex-wrap">
                  <Button variant="ghost" size="sm" onClick={() => navigateToPath([])}><Folder className="w-4 h-4 mr-1" />Root</Button>
                  {currentPath.map((segment, i) => (
                    <div key={i} className="flex items-center gap-2">
                      <ChevronRight className="w-4 h-4 text-gray-400" />
                      <Button variant="ghost" size="sm" onClick={() => navigateToPath(currentPath.slice(0, i + 1))}>{segment}</Button>
                    </div>
                  ))}
                </div>
              </Card>
            )}

            {showUploadForm && (
              <Card variant="elevated" className="p-6">
                <h2 className="text-lg font-semibold text-gray-900 mb-4">Upload New Asset</h2>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Category</label>
                    <Input type="text" value={uploadCategory} onChange={e => setUploadCategory(e.target.value)} placeholder={currentPath.length > 0 ? `e.g., ${currentPath.join('/')}/filename` : 'e.g., video/marketing or images/brand'} />
                    <p className="text-xs text-gray-500 mt-1">Use forward slashes for nested folders.</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Files</label>
                    <div className={`border-2 border-dashed rounded-xl p-8 transition-all ${isDragging ? 'border-[#003365] bg-[#003365]/5' : 'border-gray-300 bg-gray-50 hover:border-[#003365]/50'}`}
                      onDragEnter={handleDragEnter} onDragLeave={handleDragLeave} onDragOver={handleDragOver} onDrop={handleDrop}>
                      <div className="flex flex-col items-center gap-4">
                        <div className={`w-16 h-16 rounded-full flex items-center justify-center ${isDragging ? 'bg-[#003365]' : 'bg-gray-200'}`}>
                          <Upload className={`w-8 h-8 ${isDragging ? 'text-white' : 'text-gray-500'}`} />
                        </div>
                        <p className="font-medium text-gray-900 text-center">{isDragging ? 'Drop files or folders here' : 'Drag and drop files or folders here'}</p>
                        <div className="flex gap-3 flex-wrap justify-center">
                          <input type="file" multiple onChange={handleFileSelect} className="hidden" id="file-input" />
                          <label htmlFor="file-input" className="px-6 py-3 bg-[#003365] hover:bg-[#002A54] text-white font-semibold rounded-full cursor-pointer">Choose Files</label>
                          <input type="file" multiple onChange={handleFileSelect} className="hidden" id="folder-input" {...({ webkitdirectory: '' } as React.InputHTMLAttributes<HTMLInputElement>)} />
                          <label htmlFor="folder-input" className="px-6 py-3 bg-gray-200 hover:bg-gray-300 text-gray-800 font-semibold rounded-full cursor-pointer">Choose Folder</label>
                        </div>
                      </div>
                    </div>
                    {selectedItems.length > 0 && (
                      <div className="mt-3 space-y-2 max-h-60 overflow-y-auto">
                        {selectedItems.map(({ file, relativePath }) => (
                          <div key={relativePath} className="flex items-center justify-between p-2 bg-gray-100 rounded-lg">
                            <div className="flex-1 min-w-0">
                              <p className="text-sm text-gray-900 truncate" title={relativePath}>{relativePath !== file.name ? `${relativePath} (${formatFileSize(file.size)})` : `${file.name} (${formatFileSize(file.size)})`}</p>
                              {uploadStatus[relativePath] === 'uploading' && <div className="mt-1 w-full bg-gray-200 rounded-full h-1.5"><div className="bg-[#003365] h-1.5 rounded-full" style={{ width: `${uploadProgress[relativePath] || 0}%` }} /></div>}
                              {uploadStatus[relativePath] === 'success' && <p className="text-xs text-[#003365] mt-1">Uploaded</p>}
                              {uploadStatus[relativePath] === 'error' && <p className="text-xs text-red-600 mt-1">Failed</p>}
                            </div>
                            {uploadStatus[relativePath] === 'pending' && <button onClick={() => removeFile(relativePath)} className="ml-2 text-gray-500 hover:text-red-600" type="button">X</button>}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                  <div className="flex gap-3">
                    <Button variant="primary" onClick={handleUpload} disabled={selectedItems.length === 0 || !uploadCategory || uploading}>{uploading ? 'Uploading...' : `Upload ${selectedItems.length} File(s)`}</Button>
                    <Button variant="outline" onClick={() => { setShowUploadForm(false); setSelectedItems([]); setUploadCategory(''); setUploadStatus({}); setUploadProgress({}) }}>Cancel</Button>
                  </div>
                </div>
              </Card>
            )}

            <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
              <Card variant="elevated" className="p-4 lg:sticky lg:top-4 lg:self-start">
                <h2 className="text-lg font-semibold text-gray-900 mb-4">{currentPath.length === 0 ? 'Categories' : 'Folders'}</h2>
                {currentPath.length > 0 && <Button variant="ghost" className="w-full justify-start mb-2" onClick={() => navigateToPath(currentPath.slice(0, -1))}><ArrowLeft className="w-4 h-4 mr-2" />Back</Button>}
                <Button variant={currentPath.length === 0 ? 'primary' : 'ghost'} className="w-full justify-start mb-2" onClick={() => navigateToPath([])}><Folder className="w-4 h-4 mr-2" />Root</Button>
                {loading ? <div className="flex items-center gap-2"><Spinner size="sm" /> Loading...</div> : (
                  <>
                    {(currentPath.length === 0 ? categories : (searchQuery ? filteredSubfolders : subfolders)).map(folder => (
                      <Button key={folder} variant="ghost" className="w-full justify-start" onClick={() => currentPath.length === 0 ? navigateToPath([folder]) : navigateToSubfolder(folder)}>
                        <Folder className="w-4 h-4 mr-2" />{folder}
                      </Button>
                    ))}
                    <div className="pt-4 border-t border-gray-200 mt-4">
                      <Input type="text" value={newFolder} onChange={e => setNewFolder(e.target.value)} placeholder="New folder..." className="mb-2" />
                      <Button variant="outline" size="sm" className="w-full" onClick={async () => {
                        if (!newFolder.trim()) return
                        try {
                          const res = await fetch('/api/admin/assets/create-folder', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ folderName: newFolder.trim(), parentPath: currentPath }) })
                          if (!res.ok) throw new Error((await res.json()).error || 'Failed')
                          setNewFolder(''); await fetchCurrentPathAssets()
                          setSuccessMessage({ title: `Folder "${newFolder.trim()}" created!` }); setTimeout(() => setSuccessMessage(null), 3000)
                        } catch (error) {
                          setErrorMessage({ title: 'Failed to create folder', details: [error instanceof Error ? error.message : 'Unknown'] }); setTimeout(() => setErrorMessage(null), 5000)
                        }
                      }}>Create Folder</Button>
                    </div>
                  </>
                )}
              </Card>

              <div className="lg:col-span-3">
                {loading ? (
                  <Card className="p-12 text-center"><Spinner className="mx-auto mb-4" /><p className="text-gray-500">Loading assets...</p></Card>
                ) : currentPath.length === 0 && categories.length === 0 ? (
                  <Card className="p-12 text-center"><Folder className="w-16 h-16 text-gray-400 mx-auto mb-4" /><p className="text-gray-600 mb-2">No folders found</p><p className="text-sm text-gray-500">Upload a file to create your first folder</p></Card>
                ) : filteredSubfolders.length === 0 && filteredFiles.length === 0 && !searchQuery ? (
                  <Card className="p-12 text-center"><File className="w-16 h-16 text-gray-400 mx-auto mb-4" /><p className="text-gray-600 mb-2">No assets in this folder</p><Button variant="outline" onClick={() => { setShowUploadForm(true); setUploadCategory(currentPath.join('/')) }}>Upload to {currentPath.length > 0 ? currentPath.join('/') : 'root'}</Button></Card>
                ) : filteredSubfolders.length === 0 && filteredFiles.length === 0 && searchQuery ? (
                  <Card className="p-12 text-center"><Search className="w-16 h-16 text-gray-400 mx-auto mb-4" /><p className="text-gray-600 mb-2">No matches for &quot;{searchQuery}&quot;</p><Button variant="outline" onClick={() => setSearchQuery('')}>Clear Search</Button></Card>
                ) : viewMode === 'grid' ? (
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    {filteredSubfolders.map(folder => (
                      <Card key={folder} variant="elevated" className={`overflow-hidden cursor-pointer hover:border-[#003365] ${dragOverFolder === folder ? 'ring-2 ring-[#003365] border-[#003365]' : ''}`}
                        onClick={() => currentPath.length === 0 ? setCurrentPath([folder]) : setCurrentPath([...currentPath, folder])}
                        onDragOver={e => handleDragOverFolder(e, folder)} onDragLeave={handleDragLeaveFolder} onDrop={e => handleDropOnFolder(e, folder)}>
                        <div className="aspect-square bg-gray-100 flex flex-col items-center justify-center">
                          <Folder className="w-20 h-20 text-[#003365] mb-2" /><span className="text-sm font-medium text-gray-700">{folder}</span>
                        </div>
                        <div className="p-3"><p className="text-sm font-semibold text-gray-900 truncate">{folder}</p><Badge variant="secondary" className="text-xs">Folder</Badge></div>
                      </Card>
                    ))}
                    {filteredFiles.map(file => {
                      const FileIcon = getFileIcon(file.name)
                      const isImage = file.name.match(/\.(jpg|jpeg|png|gif|webp|svg)$/i)
                      const isVideo = file.name.match(/\.(mp4|webm|mov|avi)$/i) || (file.variants && file.variants.length > 0)
                      const thumb = file.variants?.find(v => v.type === 'thumb')
                      const isAudio = file.name.match(/\.(mp3|wav|ogg|m4a)$/i)
                      const isPDF = file.name.match(/\.pdf$/i)
                      const isSelected = selectedFileKeys.has(file.key)
                      const isDeleting = deletingKeys.has(file.key)
                      const dims = imageDimensions[file.key]

                      return (
                        <Card key={file.key} variant="elevated" className={`overflow-hidden ${isSelected ? 'ring-2 ring-[#003365] border-[#003365]' : ''} ${isDeleting ? 'opacity-50' : ''}`}
                          draggable={isSelected} onDragStart={e => handleDragStart(e, isSelected ? Array.from(selectedFileKeys) : [file.key])} onDragEnd={handleDragEnd}>
                          <div className="relative aspect-square bg-gray-100 flex items-center justify-center overflow-hidden group cursor-pointer"
                            onClick={e => { const t = e.target as HTMLElement; if (!t.closest('.audio-play-btn')) toggleFileSelection(file.key) }}>
                            {isVideo ? (thumb?.url ? <img src={thumb.url} alt={file.name} className="max-w-full max-h-full object-cover" /> : <Video className="w-16 h-16 text-gray-400" />)
                              : isImage ? <img src={file.url} alt={file.name} className="max-w-full max-h-full object-contain cursor-pointer" onClick={e => { e.stopPropagation(); const imgs = filteredFiles.filter(f => ['jpg','jpeg','png','gif','webp','svg'].includes(f.name.split('.').pop()?.toLowerCase() || '')); openImageLightbox(file, Math.max(0, imgs.findIndex(f => f.key === file.key))) }} />
                              : isAudio ? <div className="flex flex-col items-center gap-3"><Music className="w-16 h-16 text-gray-400" /><button className="audio-play-btn w-12 h-12 bg-[#003365] rounded-full flex items-center justify-center hover:bg-[#002A54]" onClick={e => { e.stopPropagation(); toggleAudio(file.key, file.url) }}>{playingAudio === file.key ? <Pause className="w-6 h-6 text-white" /> : <Play className="w-6 h-6 text-white ml-0.5" />}</button></div>
                              : isPDF ? <div className="flex flex-col items-center gap-3 cursor-pointer" onClick={e => { e.stopPropagation(); window.open(file.url, '_blank') }}><FileText className="w-16 h-16 text-red-500" /><span className="text-xs text-gray-500">Click to view</span></div>
                              : <FileIcon className="w-16 h-16 text-gray-400" />}
                            <div className={`absolute top-2 left-2 w-6 h-6 rounded border-2 flex items-center justify-center ${isSelected ? 'bg-[#003365] border-[#003365]' : 'bg-white/80 border-gray-400'}`}>
                              {isSelected && <Check className="w-4 h-4 text-white" />}
                            </div>
                          </div>
                          <div className="p-3 space-y-2">
                            <p className="text-sm font-medium text-gray-900 truncate">{file.name}</p>
                            <div className="flex items-center gap-2 flex-wrap">
                              <Badge variant="secondary" className="text-xs">{getFileType(file.name)}</Badge>
                              <span className="text-xs text-gray-500">{formatFileSize(file.size)}</span>
                              {isImage && dims?.loaded && dims.width > 0 && <span className="text-xs text-gray-500">{dims.width} x {dims.height}</span>}
                            </div>
                            <Button variant="primary" size="sm" className="w-full" onClick={e => { e.stopPropagation(); copyToClipboard(file.url) }}>
                              {copiedUrl === file.url ? <><Check className="w-4 h-4 mr-2" />Copied!</> : <><Copy className="w-4 h-4 mr-2" />Copy Link</>}
                            </Button>
                            {isVideo && !file.variants?.length && (
                              <Button variant="outline" size="sm" className="w-full" disabled={processingVideos.has(file.key)} onClick={e => { e.stopPropagation(); triggerMediaConvert(file) }}>
                                {processingVideos.has(file.key) ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" />Processing...</> : <><Clapperboard className="w-4 h-4 mr-2" />Process Video</>}
                              </Button>
                            )}
                            {isVideo && file.variants && file.variants.length > 0 && (
                              <div className="flex items-center gap-1 flex-wrap">
                                {file.variants.map(v => (
                                  <Badge key={v.type} variant="primary" className="text-xs">{v.type}</Badge>
                                ))}
                              </div>
                            )}
                          </div>
                        </Card>
                      )
                    })}
                  </div>
                ) : (
                  <div className="flex flex-col gap-2">
                    {filteredSubfolders.map(folder => (
                      <Card key={folder} variant="elevated" className={`!p-0 cursor-pointer hover:border-[#003365] ${dragOverFolder === folder ? 'ring-2 ring-[#003365]' : ''}`}
                        onClick={() => currentPath.length === 0 ? setCurrentPath([folder]) : setCurrentPath([...currentPath, folder])}
                        onDragOver={e => handleDragOverFolder(e, folder)} onDragLeave={handleDragLeaveFolder} onDrop={e => handleDropOnFolder(e, folder)}>
                        <div className="flex items-center gap-3 p-3"><Folder className="w-10 h-10 text-[#003365]" /><div className="flex-1 min-w-0"><p className="text-sm font-semibold text-gray-900 truncate">{folder}</p><p className="text-xs text-gray-500">Folder</p></div><ChevronRight className="w-5 h-5 text-gray-400" /></div>
                      </Card>
                    ))}
                    {filteredFiles.map(file => {
                      const FileIcon = getFileIcon(file.name)
                      const isImage = file.name.match(/\.(jpg|jpeg|png|gif|webp|svg)$/i)
                      const isVideo = file.name.match(/\.(mp4|webm|mov|avi)$/i) || (file.variants && file.variants.length > 0)
                      const thumb = file.variants?.find(v => v.type === 'thumb')
                      const isAudio = file.name.match(/\.(mp3|wav|ogg|m4a)$/i)
                      const isPDF = file.name.match(/\.pdf$/i)
                      const isSelected = selectedFileKeys.has(file.key)
                      const isDeleting = deletingKeys.has(file.key)

                      return (
                        <Card key={file.key} variant="elevated" className={`!p-0 ${isSelected ? 'ring-2 ring-[#003365] border-[#003365]' : ''} ${isDeleting ? 'opacity-50' : ''}`}
                          draggable={isSelected} onDragStart={e => handleDragStart(e, isSelected ? Array.from(selectedFileKeys) : [file.key])} onDragEnd={handleDragEnd}>
                          <div className="flex items-center gap-3 p-3">
                            <button onClick={e => { e.stopPropagation(); toggleFileSelection(file.key) }}>
                              <div className={`w-6 h-6 rounded flex items-center justify-center border-2 ${isSelected ? 'bg-[#003365] border-[#003365]' : 'border-gray-400'}`}>
                                {isSelected && <Check className="w-4 h-4 text-white" />}
                              </div>
                            </button>
                            <div className="w-16 h-16 bg-gray-100 rounded flex items-center justify-center flex-shrink-0">
                              {isVideo && thumb?.url ? <img src={thumb.url} alt="" className="w-full h-full object-cover rounded" />
                                : isImage ? <img src={file.url} alt="" className="max-w-full max-h-full object-cover rounded cursor-pointer" onClick={() => openImageLightbox(file, 0)} />
                                : isAudio ? <button className="audio-play-btn w-10 h-10 bg-[#003365] rounded-full flex items-center justify-center" onClick={e => { e.stopPropagation(); toggleAudio(file.key, file.url) }}>{playingAudio === file.key ? <Pause className="w-5 h-5 text-white" /> : <Play className="w-5 h-5 text-white ml-0.5" />}</button>
                                : isPDF ? <FileText className="w-8 h-8 text-red-500" />
                                : <FileIcon className="w-8 h-8 text-gray-400" />}
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="text-sm font-semibold text-gray-900 truncate">{file.name}</p>
                              <div className="flex items-center gap-2 mt-1"><Badge variant="secondary" className="text-xs">{getFileType(file.name)}</Badge><span className="text-xs text-gray-500">{formatFileSize(file.size)}</span></div>
                            </div>
                            {isVideo && !file.variants?.length && (
                              <Button variant="outline" size="sm" disabled={processingVideos.has(file.key)} onClick={e => { e.stopPropagation(); triggerMediaConvert(file) }}>
                                {processingVideos.has(file.key) ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" />Processing...</> : <><Clapperboard className="w-4 h-4 mr-2" />Process</>}
                              </Button>
                            )}
                            {isVideo && file.variants && file.variants.length > 0 && (
                              <div className="flex items-center gap-1">
                                {file.variants.map(v => (
                                  <Badge key={v.type} variant="primary" className="text-xs">{v.type}</Badge>
                                ))}
                              </div>
                            )}
                            <Button variant="primary" size="sm" onClick={e => { e.stopPropagation(); copyToClipboard(file.url) }}>
                              {copiedUrl === file.url ? <><Check className="w-4 h-4 mr-2" />Copied!</> : <><Copy className="w-4 h-4 mr-2" />Copy</>}
                            </Button>
                          </div>
                        </Card>
                      )
                    })}
                  </div>
                )}
              </div>
            </div>
          </Stack>
        </Container>
      </div>
    </>
  )
}
