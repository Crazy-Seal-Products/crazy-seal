'use client'

import { useState, useEffect, useCallback } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import {
  ArrowLeft,
  ArrowRight,
  CheckCircle,
  Clock,
  PlayCircle,
  FileText,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { createClient } from '@/lib/supabase/client'

interface Lesson {
  id: string
  title: string
  description: string | null
  content_type: 'video' | 'text' | 'quiz'
  video_url: string | null
  content: string | null
  duration_minutes: number | null
  sort_order: number
}

interface Module {
  id: string
  title: string
  sort_order: number
  lms_lessons: Lesson[]
}

interface Course {
  id: string
  title: string
  slug: string
  lms_modules: Module[]
}

export default function LessonViewerPage() {
  const params = useParams()
  const router = useRouter()
  const slug = params.slug as string
  const lessonId = params.lessonId as string

  const [course, setCourse] = useState<Course | null>(null)
  const [lesson, setLesson] = useState<Lesson | null>(null)
  const [moduleName, setModuleName] = useState('')
  const [progress, setProgress] = useState<Record<string, string>>({})
  const [technicianId, setTechnicianId] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const [marking, setMarking] = useState(false)

  const loadData = useCallback(async () => {
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return

    const verifyRes = await fetch('/api/lms/auth/verify', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ auth_user_id: user.id }),
    })
    const { technician } = await verifyRes.json()
    if (!technician) return

    setTechnicianId(technician.id)

    const coursesRes = await fetch(`/api/lms/courses?technician_id=${technician.id}`)
    const { courses, progress: progressData } = await coursesRes.json()

    const foundCourse = courses?.find((c: Course) => c.slug === slug)
    setCourse(foundCourse || null)
    setProgress(progressData || {})

    if (foundCourse) {
      for (const mod of foundCourse.lms_modules) {
        const foundLesson = mod.lms_lessons.find((l: Lesson) => l.id === lessonId)
        if (foundLesson) {
          setLesson(foundLesson)
          setModuleName(mod.title)
          break
        }
      }
    }

    if (progressData && !progressData[lessonId]) {
      await fetch('/api/lms/progress', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          technician_id: technician.id,
          lesson_id: lessonId,
          status: 'in_progress',
        }),
      })
    }

    setLoading(false)
  }, [slug, lessonId])

  useEffect(() => { loadData() }, [loadData])

  const markComplete = async () => {
    if (!technicianId || marking) return
    setMarking(true)

    await fetch('/api/lms/progress', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        technician_id: technicianId,
        lesson_id: lessonId,
        status: 'completed',
      }),
    })

    setProgress((prev) => ({ ...prev, [lessonId]: 'completed' }))
    setMarking(false)
  }

  const getAllLessons = (): { lesson: Lesson; moduleTitle: string }[] => {
    if (!course) return []
    return course.lms_modules.flatMap((mod) =>
      mod.lms_lessons.map((l) => ({ lesson: l, moduleTitle: mod.title }))
    )
  }

  const getAdjacentLessons = () => {
    const all = getAllLessons()
    const idx = all.findIndex((item) => item.lesson.id === lessonId)
    return {
      prev: idx > 0 ? all[idx - 1] : null,
      next: idx < all.length - 1 ? all[idx + 1] : null,
    }
  }

  if (loading) {
    return (
      <div className="p-6 md:p-10">
        <div className="animate-pulse space-y-6">
          <div className="h-5 bg-gray-200 rounded w-48" />
          <div className="h-8 bg-gray-200 rounded w-96" />
          <div className="h-[400px] bg-gray-100 rounded-2xl" />
        </div>
      </div>
    )
  }

  if (!lesson || !course) {
    return (
      <div className="p-6 md:p-10">
        <Link href={`/lms/courses/${slug}`} className="inline-flex items-center gap-1 text-xs text-gray-500 hover:text-gray-700 mb-6">
          <ArrowLeft className="w-3.5 h-3.5" />
          Back to Course
        </Link>
        <div className="text-center py-16">
          <FileText className="w-12 h-12 text-gray-300 mx-auto mb-4" />
          <h3 className="text-sm font-medium text-gray-900 mb-1">Lesson not found</h3>
        </div>
      </div>
    )
  }

  const status = progress[lessonId] || 'not_started'
  const isCompleted = status === 'completed'
  const { prev, next } = getAdjacentLessons()

  return (
    <div className="p-6 md:p-10 max-w-4xl">
      {/* Breadcrumb */}
      <Link href={`/lms/courses/${slug}`} className="inline-flex items-center gap-1 text-xs text-gray-500 hover:text-gray-700 mb-4 transition-colors">
        <ArrowLeft className="w-3.5 h-3.5" />
        {course.title}
      </Link>

      {/* Lesson Header */}
      <div className="mb-6">
        <p className="text-[11px] text-[#125F97] font-medium mb-1">{moduleName}</p>
        <h1 className="text-xl font-bold text-gray-900 mb-2">{lesson.title}</h1>
        <div className="flex items-center gap-3 text-xs text-gray-400">
          {lesson.duration_minutes && (
            <span className="flex items-center gap-1">
              <Clock className="w-3.5 h-3.5" />
              {lesson.duration_minutes} min
            </span>
          )}
          <span className={cn(
            'inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-medium',
            isCompleted ? 'bg-[#5BA411]/10 text-[#5BA411]' :
            status === 'in_progress' ? 'bg-[#125F97]/10 text-[#125F97]' :
            'bg-gray-100 text-gray-500',
          )}>
            {isCompleted ? <CheckCircle className="w-3 h-3" /> : <PlayCircle className="w-3 h-3" />}
            {isCompleted ? 'Completed' : status === 'in_progress' ? 'In Progress' : 'Not Started'}
          </span>
        </div>
      </div>

      {/* Video Player */}
      {lesson.content_type === 'video' && lesson.video_url && (
        <div className="relative w-full aspect-video bg-black rounded-2xl overflow-hidden mb-6">
          <video
            src={lesson.video_url}
            controls
            className="w-full h-full"
            controlsList="nodownload"
          />
        </div>
      )}

      {lesson.content_type === 'video' && !lesson.video_url && (
        <div className="w-full aspect-video bg-gray-100 rounded-2xl flex items-center justify-center mb-6">
          <div className="text-center">
            <PlayCircle className="w-12 h-12 text-gray-300 mx-auto mb-2" />
            <p className="text-sm text-gray-400">Video coming soon</p>
          </div>
        </div>
      )}

      {/* Text Content */}
      {lesson.content_type === 'text' && lesson.content && (
        <div className="bg-white rounded-2xl border border-gray-200 p-6 md:p-8 mb-6 prose prose-sm max-w-none">
          <div dangerouslySetInnerHTML={{ __html: lesson.content }} />
        </div>
      )}

      {lesson.content_type === 'text' && !lesson.content && (
        <div className="bg-white rounded-2xl border border-gray-200 p-8 mb-6 text-center">
          <FileText className="w-12 h-12 text-gray-300 mx-auto mb-2" />
          <p className="text-sm text-gray-400">Content coming soon</p>
        </div>
      )}

      {/* Description */}
      {lesson.description && (
        <div className="bg-gray-50 rounded-xl p-4 mb-6">
          <p className="text-xs text-gray-600">{lesson.description}</p>
        </div>
      )}

      {/* Mark Complete Button */}
      {!isCompleted && (
        <button
          onClick={markComplete}
          disabled={marking}
          className="w-full py-3 bg-[#5BA411] hover:bg-[#4A870E] text-white text-sm font-medium rounded-xl transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
        >
          <CheckCircle className="w-4 h-4" />
          {marking ? 'Marking...' : 'Mark as Complete'}
        </button>
      )}

      {isCompleted && (
        <div className="w-full py-3 bg-[#5BA411]/10 text-[#5BA411] text-sm font-medium rounded-xl flex items-center justify-center gap-2">
          <CheckCircle className="w-4 h-4" />
          Lesson Completed
        </div>
      )}

      {/* Navigation */}
      <div className="flex items-center justify-between mt-6 pt-6 border-t border-gray-100">
        {prev ? (
          <Link
            href={`/lms/courses/${slug}/lessons/${prev.lesson.id}`}
            className="flex items-center gap-2 text-xs text-gray-500 hover:text-gray-700 transition-colors"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <div>
              <p className="text-[10px] text-gray-400">Previous</p>
              <p className="font-medium">{prev.lesson.title}</p>
            </div>
          </Link>
        ) : (
          <div />
        )}

        {next ? (
          <Link
            href={`/lms/courses/${slug}/lessons/${next.lesson.id}`}
            className="flex items-center gap-2 text-xs text-gray-500 hover:text-gray-700 transition-colors text-right"
          >
            <div>
              <p className="text-[10px] text-gray-400">Next</p>
              <p className="font-medium">{next.lesson.title}</p>
            </div>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        ) : (
          <Link
            href={`/lms/courses/${slug}`}
            className="flex items-center gap-2 text-xs text-[#003365] hover:text-[#002A54] font-medium transition-colors"
          >
            Back to Course Overview
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        )}
      </div>
    </div>
  )
}
