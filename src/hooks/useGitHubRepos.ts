import { useState, useEffect } from 'react'

interface GitHubRepo {
  id: number
  name: string
  description: string | null
  html_url: string
  homepage: string | null
  topics: string[]
  language: string | null
  created_at: string
  updated_at: string
  pushed_at: string
  stargazers_count: number
  forks_count: number
  fork: boolean
}

export interface Project {
  id: string
  name: string
  description: string
  tech: string[]
  github: string
  live: string
  year: string
  stars: number
  language: string | null
  topics: string[]
}

const GITHUB_USERNAME = 'Nihal347'

// Fallback projects if API fails or for pinned repos
const PINNED_PROJECTS: Project[] = [
  {
    id: 'siji',
    name: 'SIJI',
    description: 'AI desktop assistant with voice interaction, LLMs, and automation',
    tech: ['Python', 'FastAPI', 'Whisper', 'LangChain', 'FAISS', 'SQLite'],
    github: `https://github.com/${GITHUB_USERNAME}/SIJI`,
    live: '',
    year: '2025',
    stars: 0,
    language: 'Python',
    topics: ['ai', 'voice', 'llm']
  },
  {
    id: 'visionos',
    name: 'VisionOS',
    description: 'Computer vision platform with real-time detection and OCR',
    tech: ['PyTorch', 'OpenCV', 'YOLO', 'FastAPI', 'React'],
    github: `https://github.com/${GITHUB_USERNAME}/VisionOS`,
    live: '',
    year: '2025',
    stars: 0,
    language: 'Python',
    topics: ['computer-vision', 'ai', 'detection']
  },
  {
    id: 'astromind',
    name: 'AstroMind',
    description: 'Space intelligence dashboard with NASA APIs and 3D viz',
    tech: ['Python', 'React', 'Three.js', 'FastAPI', 'NASA APIs'],
    github: `https://github.com/${GITHUB_USERNAME}/AstroMind`,
    live: '',
    year: '2025',
    stars: 0,
    language: 'Python',
    topics: ['full-stack', '3d', 'space']
  },
  {
    id: 'orbital',
    name: 'Orbital',
    description: 'N-body gravity simulator with CUDA and real-time viz',
    tech: ['Python', 'OpenGL', 'CUDA', 'NumPy'],
    github: `https://github.com/${GITHUB_USERNAME}/Orbital`,
    live: '',
    year: '2025',
    stars: 0,
    language: 'Python',
    topics: ['physics', 'simulation', 'gpu']
  },
  {
    id: 'genesis',
    name: 'Genesis',
    description: 'AI civilization simulator with emergent behavior and ECS',
    tech: ['Python', 'C++', 'PyTorch', 'OpenGL', 'ECS'],
    github: `https://github.com/${GITHUB_USERNAME}/Genesis`,
    live: '',
    year: '2025',
    stars: 0,
    language: 'Python',
    topics: ['ai', 'simulation', 'algorithms']
  },
]

function getTechFromRepo(repo: GitHubRepo): string[] {
  const tech: string[] = []
  
  if (repo.language) tech.push(repo.language)
  
  // Map topics to tech
  const topicMap: Record<string, string> = {
    'python': 'Python',
    'javascript': 'JavaScript',
    'csharp': 'C#',
    'react': 'React',
    'nodejs': 'Node.js',
    'fastapi': 'FastAPI',
    'flask': 'Flask',
    'django': 'Django',
    'pytorch': 'PyTorch',
    'tensorflow': 'TensorFlow',
    'opencv': 'OpenCV',
    'yolo': 'YOLO',
    'langchain': 'LangChain',
    'llm': 'LLMs',
    'ai': 'AI',
    'machine-learning': 'ML',
    'deep-learning': 'Deep Learning',
    'computer-vision': 'Computer Vision',
    'nlp': 'NLP',
    'api': 'REST API',
    'docker': 'Docker',
    'postgresql': 'PostgreSQL',
    'sqlite': 'SQLite',
    'mongodb': 'MongoDB',
    'threejs': 'Three.js',
    'webgl': 'WebGL',
    'cuda': 'CUDA',
    'opengl': 'OpenGL',
    'simulation': 'Simulation',
    'scraping': 'Web Scraping',
    'automation': 'Automation',
    'cli': 'CLI',
    'gui': 'GUI',
    'web': 'Web',
    'fullstack': 'Full-Stack',
    'backend': 'Backend',
    'frontend': 'Frontend',
  }
  
  if (repo.topics) {
    repo.topics.forEach(topic => {
      const mapped = topicMap[topic.toLowerCase()]
      if (mapped && !tech.includes(mapped)) {
        tech.push(mapped)
      }
    })
  }
  
  return tech.length > 0 ? tech : [repo.language || 'Code']
}

function getYearFromDate(dateStr: string): string {
  return new Date(dateStr).getFullYear().toString()
}

export function useGitHubRepos(): { projects: Project[]; loading: boolean; error: string | null } {
  const [projects, setProjects] = useState<Project[]>(() => {
    // Try to load from cache first
    try {
      const cached = localStorage.getItem('github_repos_cache')
      if (cached) {
        const { data, timestamp } = JSON.parse(cached)
        // Cache for 1 hour
        if (Date.now() - timestamp < 3600000) {
          return data
        }
      }
    } catch {}
    return PINNED_PROJECTS
  })
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let cancelled = false

    async function fetchRepos() {
      try {
        setLoading(true)
        const response = await fetch(
          `https://api.github.com/users/${GITHUB_USERNAME}/repos?sort=updated&per_page=100`,
          {
            headers: {
              'Accept': 'application/vnd.github.v3+json',
            },
          }
        )

        if (!response.ok) {
          throw new Error(`GitHub API error: ${response.status}`)
        }

        const repos: GitHubRepo[] = await response.json()

        if (cancelled) return

        // Filter out forks and map to Project format
        const fetchedProjects: Project[] = repos
          .filter(repo => !repo.fork)
          .map(repo => ({
            id: repo.name.toLowerCase(),
            name: repo.name,
            description: repo.description || 'No description provided',
            tech: getTechFromRepo(repo),
            github: repo.html_url,
            live: repo.homepage || '',
            year: getYearFromDate(repo.pushed_at || repo.created_at),
            stars: repo.stargazers_count,
            language: repo.language,
            topics: repo.topics || [],
          }))

        // Merge: keep pinned projects, add new ones from GitHub
        const pinnedNames = PINNED_PROJECTS.map(p => p.name.toLowerCase())
        const newRepos = fetchedProjects.filter(p => !pinnedNames.includes(p.name.toLowerCase()))
        
        // Update pinned projects with GitHub data if available
        const updatedPinned = PINNED_PROJECTS.map(pinned => {
          const githubVersion = fetchedProjects.find(f => f.name.toLowerCase() === pinned.name.toLowerCase())
          if (githubVersion) {
            return {
              ...pinned,
              stars: githubVersion.stars,
              description: githubVersion.description || pinned.description,
              live: githubVersion.live || pinned.live,
              year: githubVersion.year,
            }
          }
          return pinned
        })

        const merged = [...updatedPinned, ...newRepos]
        setProjects(merged)
        setError(null)

        // Cache the result
        try {
          localStorage.setItem('github_repos_cache', JSON.stringify({ data: merged, timestamp: Date.now() }))
        } catch {}
      } catch (err) {
        if (!cancelled) {
          console.error('Failed to fetch GitHub repos:', err)
          setError(err instanceof Error ? err.message : 'Failed to fetch repos')
          // Keep using cached or pinned projects as fallback
        }
      } finally {
        if (!cancelled) {
          setLoading(false)
        }
      }
    }

    fetchRepos()

    return () => {
      cancelled = true
    }
  }, [])

  return { projects, loading, error }
}
