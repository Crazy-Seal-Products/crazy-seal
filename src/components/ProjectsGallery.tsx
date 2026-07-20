'use client'

import { useState } from 'react'
import Link from 'next/link'
import { MapPin, ArrowRight } from 'lucide-react'
import { PROJECT_CATEGORIES, categoryLabel, type Project } from '@/lib/projects'

type ProjectCard = Pick<
  Project,
  'slug' | 'project_number' | 'title' | 'category' | 'location' | 'cover_photo' | 'customer_type'
>

export function ProjectsGallery({
  projects,
  initialCategory,
}: {
  projects: ProjectCard[]
  initialCategory?: string
}) {
  const [category, setCategory] = useState<string | null>(
    initialCategory && PROJECT_CATEGORIES.some((c) => c.slug === initialCategory)
      ? initialCategory
      : null
  )

  const filtered = category ? projects.filter((p) => p.category === category) : projects
  const counts = new Map<string, number>()
  for (const p of projects) {
    if (p.category) counts.set(p.category, (counts.get(p.category) || 0) + 1)
  }

  return (
    <>
      {/* Category filter */}
      <div className="flex flex-wrap justify-center gap-2 mb-8">
        <FilterPill
          label={`All Projects (${projects.length})`}
          active={category === null}
          onClick={() => setCategory(null)}
        />
        {PROJECT_CATEGORIES.filter((c) => counts.get(c.slug)).map((c) => (
          <FilterPill
            key={c.slug}
            label={`${c.label} (${counts.get(c.slug)})`}
            active={category === c.slug}
            onClick={() => setCategory(c.slug)}
          />
        ))}
      </div>

      {/* Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
        {filtered.map((p) => (
          <Link
            key={p.slug}
            href={`/project/${p.slug}/`}
            className="group rounded-2xl overflow-hidden bg-white border border-gray-200 hover:border-[#003365]/30 hover:shadow-lg transition-all duration-300"
          >
            <div className="relative aspect-[4/3] overflow-hidden bg-gray-100">
              {p.cover_photo ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={p.cover_photo}
                  alt={`Project #${p.project_number}: ${p.title}`}
                  loading="lazy"
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-gray-300 text-sm">
                  No photo
                </div>
              )}
              {p.category && (
                <span className="absolute top-3 left-3 bg-[#003365] text-white text-[11px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full">
                  {categoryLabel(p.category)}
                </span>
              )}
            </div>
            <div className="p-4 sm:p-5">
              <p className="text-xs font-bold uppercase tracking-wider text-accent mb-1">
                Project #{p.project_number}
              </p>
              <h3 className="text-lg font-bold text-[#003365] leading-snug mb-2 group-hover:underline decoration-2 underline-offset-2">
                {p.title}
              </h3>
              <div className="flex items-center justify-between text-sm text-gray-500">
                {p.location ? (
                  <span className="flex items-center gap-1">
                    <MapPin className="w-3.5 h-3.5" />
                    {p.location}
                  </span>
                ) : (
                  <span />
                )}
                <ArrowRight className="w-4 h-4 text-gray-300 group-hover:text-[#5ba411] group-hover:translate-x-0.5 transition-all" />
              </div>
            </div>
          </Link>
        ))}
      </div>

      {filtered.length === 0 && (
        <p className="text-center text-gray-500 py-16">
          No projects in this category yet. Check back soon!
        </p>
      )}
    </>
  )
}

function FilterPill({
  label,
  active,
  onClick,
}: {
  label: string
  active: boolean
  onClick: () => void
}) {
  return (
    <button
      onClick={onClick}
      className={`px-4 py-2 rounded-full text-sm font-semibold transition-colors cursor-pointer ${
        active
          ? 'bg-[#003365] text-white'
          : 'bg-white text-gray-600 border border-gray-200 hover:border-[#003365]/40 hover:text-[#003365]'
      }`}
    >
      {label}
    </button>
  )
}
