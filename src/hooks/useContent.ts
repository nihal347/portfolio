import { useState, useEffect } from 'react'

interface SkillItem {
  name: string
  level: number
  status: string
}

interface SkillGroup {
  title: string
  skills: SkillItem[]
}

interface TechCategory {
  title: string
  items: SkillItem[]
}

interface LearningItem {
  name: string
  progress: number
  status: string
}

interface LearningPath {
  title: string
  items: LearningItem[]
}

interface Book {
  title: string
  author: string
  status: string
}

interface Satellite {
  name: string
  status: string
  experience: string
  level: number
  description: string
  usedFor: string[]
  category: string
}

export interface SiteContent {
  profile: {
    name: string
    title: string
    languages: string
    focus: string
    project: string
    bio: string
    skillGroups: SkillGroup[]
  }
  techStack: TechCategory[]
  learning: {
    paths: LearningPath[]
    books: Book[]
  }
  techKeywords: string
  satellites: Satellite[]
  asteroidBelt: string[]
}

const DEFAULT_CONTENT: SiteContent = {
  profile: {
    name: 'NIHAL',
    title: 'SELF-TAUGHT DEV',
    languages: 'Python, C, C#',
    focus: 'AI/ML enthusiast',
    project: 'Building Siji v0.1',
    bio: 'Loading bio...',
    skillGroups: []
  },
  techStack: [],
  learning: { paths: [], books: [] },
  techKeywords: '',
  satellites: [],
  asteroidBelt: []
}

export function useContent(): { content: SiteContent; loading: boolean } {
  const [content, setContent] = useState<SiteContent>(() => {
    try {
      const cached = localStorage.getItem('site_content_cache')
      if (cached) {
        const { data, timestamp } = JSON.parse(cached)
        if (Date.now() - timestamp < 3600000) {
          return data
        }
      }
    } catch {}
    return DEFAULT_CONTENT
  })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let cancelled = false

    async function fetchContent() {
      try {
        const base = import.meta.env.BASE_URL || '/'
        const res = await fetch(`${base}content.json?t=` + Date.now())
        if (!res.ok) throw new Error('Failed to load content')
        const data: SiteContent = await res.json()

        if (cancelled) return

        setContent(data)
        try {
          localStorage.setItem('site_content_cache', JSON.stringify({ data, timestamp: Date.now() }))
        } catch {}
      } catch (err) {
        console.error('Content load error:', err)
      } finally {
        if (!cancelled) setLoading(false)
      }
    }

    fetchContent()
    return () => { cancelled = true }
  }, [])

  return { content, loading }
}
