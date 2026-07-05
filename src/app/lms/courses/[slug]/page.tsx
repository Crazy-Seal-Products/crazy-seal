'use client'

import { useState, useEffect, useCallback } from 'react'
import { useParams } from 'next/navigation'
import Link from 'next/link'
import {
  ArrowLeft,
  BookOpen,
  CheckCircle,
  ChevronDown,
  ChevronRight,
  Clock,
  PlayCircle,
  FileText,
  HelpCircle,
  Lock,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { createClient } from '@/lib/supabase/client'

interface Lesson {
  id: string
  title: string
  description: string | null
  content_type: 'video' | 'text' | 'quiz'
  duration_minutes: number | null
  sort_order: number
}

interface Module {
  id: string
  title: string
  description: string | null
  sort_order: number
  lms_lessons: Lesson[]
}

interface Course {
  id: string
  title: string
  slug: string
  description: string
  thumbnail_url: string | null
  lms_modules: Module[]
}

const lessonTypeIcon: Record<string, typeof PlayCircle> = {
  video: PlayCircle,
  text: FileText,
  quiz: HelpCircle,
}

export default function CourseDetailPage() {
  const params = useParams()
  const slug = params.slug as string
  const [course, setCourse] = useState<Course | null>(null)
  const [progress, setProgress] = useState<Record<string, string>>({})
  const [expandedModules, setExpandedModules] = useState<Set<string>>(new Set())
  const [loading, setLoading] = useState(true)
  const [technicianId, setTechnicianId] = useState<string | null>(null)

  const loadCourse = useCallback(async () => {
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

    const found = courses?.find((c: Course) => c.slug === slug)
    setCourse(found || null)
    setProgress(progressData || {})

    if (found?.lms_modules?.length) {
      setExpandedModules(new Set([found.lms_modules[0].id]))
    }

    setLoading(false)
  }, [slug])

  useEffect(() => { loadCourse() }, [loadCourse])

  const toggleModule = (moduleId: string) => {
    setExpandedModules((prev) => {
      const next = new Set(prev)
      if (next.has(moduleId)) next.delete(moduleId)
      else next.add(moduleId)
      return next
    })
  }

  const getLessonStatus = (lessonId: string) => progress[lessonId] || 'not_started'

  if (loading) {
    return (
      <div className="p-6 md:p-10">
        <div className="animate-pulse space-y-6">
          <div className="h-5 bg-gray-200 rounded w-32" />
          <div className="h-8 bg-gray-200 rounded w-80" />
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-16 bg-gray-100 rounded-xl" />
            ))}
          </div>
        </div>
      </div>
    )
  }

  if (!course) {
    return (
      <div className="p-6 md:p-10">
        <Link href="/lms" className="inline-flex items-center gap-1 text-xs text-gray-500 hover:text-gray-700 mb-6">
          <ArrowLeft className="w-3.5 h-3.5" />
          Back to Dashboard
        </Link>
        <div className="text-center py-16">
          <BookOpen className="w-12 h-12 text-gray-300 mx-auto mb-4" />
          <h3 className="text-sm font-medium text-gray-900 mb-1">Course not found</h3>
          <p className="text-xs text-gray-500">This course may have been removed or is not yet available.</p>
        </div>
      </div>
    )
  }

  const allLessons = course.lms_modules.flatMap((m) => m.lms_lessons)
  const totalLessons = allLessons.length
  const completedLessons = allLessons.filter((l) => getLessonStatus(l.id) === 'completed').length
  const pct = totalLessons > 0 ? Math.round((completedLessons / totalLessons) * 100) : 0
  const totalMinutes = allLessons.reduce((sum, l) => sum + (l.duration_minutes || 0), 0)

  return (
    <div className="p-6 md:p-10 max-w-4xl">
      <Link href="/lms" className="inline-flex items-center gap-1 text-xs text-gray-500 hover:text-gray-700 mb-6 transition-colors">
        <ArrowLeft className="w-3.5 h-3.5" />
        Back to Dashboard
      </Link>

      {/* Course Header */}
      <div className="bg-gradient-to-br from-[#003365] to-[#125F97] rounded-2xl p-6 md:p-8 mb-8">
        <h1 className="text-xl md:text-2xl font-bold text-white mb-2">{course.title}</h1>
        <p className="text-sm text-white/70 max-w-xl mb-6">{course.description}</p>

        <div className="flex flex-wrap items-center gap-4 text-xs text-white/60 mb-4">
          <span className="flex items-center gap-1.5">
            <BookOpen className="w-3.5 h-3.5" />
            {totalLessons} lessons
          </span>
          <span className="flex items-center gap-1.5">
            <Clock className="w-3.5 h-3.5" />
            {course.lms_modules.length} modules
          </span>
          {totalMinutes > 0 && (
            <span className="flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5" />
              {totalMinutes} min total
            </span>
          )}
        </div>

        <div className="flex items-center gap-3">
          <div className="flex-1 h-2 bg-white/15 rounded-full overflow-hidden">
            <div
              className="h-full bg-[#5BA411] rounded-full transition-all duration-500"
              style={{ width: `${pct}%` }}
            />
          </div>
          <span className="text-sm font-semibold text-white">{pct}%</span>
        </div>
      </div>

      {/* Module Accordion */}
      <div className="space-y-3">
        {course.lms_modules.map((module, moduleIdx) => {
          const isExpanded = expandedModules.has(module.id)
          const moduleLessons = module.lms_lessons
          const moduleCompleted = moduleLessons.filter((l) => getLessonStatus(l.id) === 'completed').length
          const moduleTotal = moduleLessons.length
          const allDone = moduleTotal > 0 && moduleCompleted === moduleTotal

          return (
            <div key={module.id} className="bg-white rounded-xl border border-gray-200 overflow-hidden">
              <button
                onClick={() => toggleModule(module.id)}
                className="w-full flex items-center gap-3 p-4 text-left hover:bg-gray-50 transition-colors"
              >
                <div className={cn(
                  'w-8 h-8 rounded-lg flex items-center justify-center text-xs font-bold shrink-0',
                  allDone ? 'bg-[#5BA411]/10 text-[#5BA411]' : 'bg-gray-100 text-gray-500',
                )}>
                  {allDone ? <CheckCircle className="w-4 h-4" /> : (moduleIdx + 1)}
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="text-sm font-semibold text-gray-900 truncate">{module.title}</h3>
                  <p className="text-[11px] text-gray-400">{moduleCompleted}/{moduleTotal} lessons completed</p>
                </div>
                {isExpanded
                  ? <ChevronDown className="w-4 h-4 text-gray-400 shrink-0" />
                  : <ChevronRight className="w-4 h-4 text-gray-400 shrink-0" />
                }
              </button>

              {isExpanded && moduleLessons.length > 0 && (
                <div className="border-t border-gray-100">
                  {moduleLessons.map((lesson, lessonIdx) => {
                    const status = getLessonStatus(lesson.id)
                    const Icon = lessonTypeIcon[lesson.content_type] || FileText
                    const hasContent = lesson.content_type === 'video' || lesson.content_type === 'text'

                    return (
                      <Link
                        key={lesson.id}
                        href={hasContent ? `/lms/courses/${slug}/lessons/${lesson.id}` : '#'}
                        className={cn(
                          'flex items-center gap-3 px-4 py-3 transition-colors',
                          hasContent ? 'hover:bg-gray-50 cursor-pointer' : 'cursor-default opacity-60',
                          lessonIdx < moduleLessons.length - 1 && 'border-b border-gray-50',
                        )}
                      >
                        <div className={cn(
                          'w-6 h-6 rounded-full flex items-center justify-center shrink-0',
                          status === 'completed' ? 'bg-[#5BA411] text-white' :
                          status === 'in_progress' ? 'bg-[#125F97] text-white' :
                          'bg-gray-100 text-gray-400',
                        )}>
                          {status === 'completed' ? (
                            <CheckCircle className="w-3.5 h-3.5" />
                          ) : status === 'in_progress' ? (
                            <PlayCircle className="w-3.5 h-3.5" />
                          ) : !hasContent ? (
                            <Lock className="w-3 h-3" />
                          ) : (
                            <Icon className="w-3 h-3" />
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className={cn(
                            'text-xs font-medium truncate',
                            status === 'completed' ? 'text-gray-500' : 'text-gray-900',
                          )}>
                            {lesson.title}
                          </p>
                          {lesson.description && (
                            <p className="text-[10px] text-gray-400 truncate mt-0.5">{lesson.description}</p>
                          )}
                        </div>
                        <div className="flex items-center gap-2 shrink-0">
                          {lesson.duration_minutes && (
                            <span className="text-[10px] text-gray-400">{lesson.duration_minutes} min</span>
                          )}
                          <span className={cn(
                            'text-[9px] font-medium px-1.5 py-0.5 rounded-full',
                            lesson.content_type === 'video' ? 'bg-blue-50 text-blue-600' :
                            lesson.content_type === 'quiz' ? 'bg-purple-50 text-purple-600' :
                            'bg-gray-50 text-gray-500',
                          )}>
                            {lesson.content_type}
                          </span>
                        </div>
                      </Link>
                    )
                  })}
                </div>
              )}

              {isExpanded && moduleLessons.length === 0 && (
                <div className="px-4 py-6 text-center border-t border-gray-100">
                  <p className="text-xs text-gray-400">No lessons in this module yet.</p>
                </div>
              )}
            </div>
          )
        })}
      </div>

      {course.lms_modules.length === 0 && (
        <div className="text-center py-16">
          <BookOpen className="w-12 h-12 text-gray-300 mx-auto mb-4" />
          <h3 className="text-sm font-medium text-gray-900 mb-1">No modules yet</h3>
          <p className="text-xs text-gray-500">Course content will appear here once it is published.</p>
        </div>
      )}
    </div>
  )
}
