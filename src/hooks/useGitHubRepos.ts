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
    tech: ['Python', 'FastAPI', 'LangChain'],
    github: `https://github.com/${GITHUB_USERNAME}/SIJI`,
    live: '',
    year: '2026',
    stars: 1,
    language: 'Python',
    topics: ['ai', 'assistant', 'llm']
  },
  {
    id: 'genesis',
    name: 'genesis',
    description: 'AI civilization simulator with emergent behavior',
    tech: ['Python', 'PyTorch', 'OpenGL'],
    github: `https://github.com/${GITHUB_USERNAME}/genesis`,
    live: '',
    year: '2026',
    stars: 0,
    language: 'Python',
    topics: ['ai', 'simulation', 'algorithms']
  },
  {
    id: 'orbital',
    name: 'Orbital',
    description: 'N-body gravity simulator with real-time visualization',
    tech: ['Python', 'OpenGL', 'NumPy'],
    github: `https://github.com/${GITHUB_USERNAME}/Orbital`,
    live: '',
    year: '2026',
    stars: 0,
    language: 'Python',
    topics: ['physics', 'simulation', 'gpu']
  },
  {
    id: 'astromind',
    name: 'ASTROmind',
    description: 'Space intelligence dashboard with NASA APIs and 3D visualization',
    tech: ['Python', 'React', 'Three.js', 'FastAPI'],
    github: `https://github.com/${GITHUB_USERNAME}/ASTROmind`,
    live: '',
    year: '2026',
    stars: 0,
    language: 'Python',
    topics: ['full-stack', '3d', 'space']
  },
  {
    id: 'visionos',
    name: 'vision-OS',
    description: 'Computer vision platform with real-time detection and OCR',
    tech: ['Python', 'OpenCV', 'YOLO', 'FastAPI', 'React'],
    github: `https://github.com/${GITHUB_USERNAME}/vision-OS`,
    live: '',
    year: '2026',
    stars: 0,
    language: 'Python',
    topics: ['computer-vision', 'ai', 'detection']
  },
  {
    id: 'fake-news-detection-system',
    name: 'Fake-News-Detection-System',
    description: 'Machine learning model that can detect fake news',
    tech: ['Python', 'Jupyter Notebook', 'Scikit-learn'],
    github: `https://github.com/${GITHUB_USERNAME}/Fake-News-Detection-System`,
    live: '',
    year: '2025',
    stars: 1,
    language: 'Jupyter Notebook',
    topics: ['machine-learning', 'nlp', 'classification']
  },
  {
    id: 'sentiment-analysis',
    name: 'sentiment-analysis',
    description: 'Movie review sentiment analysis with Naive Bayes using 50K IMDB reviews',
    tech: ['Python', 'NLP', 'Scikit-learn'],
    github: `https://github.com/${GITHUB_USERNAME}/sentiment-analysis`,
    live: '',
    year: '2025',
    stars: 0,
    language: 'Python',
    topics: ['nlp', 'sentiment', 'machine-learning']
  },
  {
    id: 'banking-system',
    name: 'banking-system',
    description: 'Small banking system built in Python',
    tech: ['Python'],
    github: `https://github.com/${GITHUB_USERNAME}/banking-system`,
    live: '',
    year: '2025',
    stars: 0,
    language: 'Python',
    topics: ['python', 'backend', 'finance']
  },
  {
    id: 'automation-projects',
    name: 'automation-projects',
    description: 'Collection of automation projects and scripts',
    tech: ['Python', 'Selenium', 'BeautifulSoup'],
    github: `https://github.com/${GITHUB_USERNAME}/automation-projects`,
    live: '',
    year: '2025',
    stars: 0,
    language: 'Python',
    topics: ['automation', 'scraping', 'scripts']
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
              'Authorization': 'Bearer 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',
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
          .filter(repo => !repo.fork && repo.name !== 'tahmids-website')
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
