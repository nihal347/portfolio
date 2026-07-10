import { ReturnButton } from '../components/ReturnButton'
import { TerminalText } from '../components/TerminalText'
import { GitBranch, Bot, Eye, Globe, Orbit, Cpu, ExternalLink, Star, Loader2 } from 'lucide-react'
import { useGitHubRepos } from '../hooks/useGitHubRepos'

const ICON_MAP: Record<string, JSX.Element> = {
  siji: <Bot size={18} />,
  visionos: <Eye size={18} />,
  astromind: <Globe size={18} />,
  orbital: <Orbit size={18} />,
  genesis: <Cpu size={18} />,
}

function getIcon(name: string): JSX.Element {
  const lower = name.toLowerCase()
  if (ICON_MAP[lower]) return ICON_MAP[lower]
  if (lower.includes('ai') || lower.includes('ml') || lower.includes('llm')) return <Bot size={18} />
  if (lower.includes('vision') || lower.includes('cv') || lower.includes('detect')) return <Eye size={18} />
  if (lower.includes('web') || lower.includes('full') || lower.includes('dashboard')) return <Globe size={18} />
  if (lower.includes('sim') || lower.includes('physics') || lower.includes('orbital')) return <Orbit size={18} />
  if (lower.includes('scrap') || lower.includes('auto')) return <Cpu size={18} />
  return <Code size={18} />
}

import { Code } from 'lucide-react'

export function Projects() {
  const { projects, loading, error } = useGitHubRepos()

  return (
    <>
    <div className="fixed inset-0 z-30 overflow-y-auto" style={{ background: 'rgba(2,3,8,0.92)', backdropFilter: 'blur(12px)' }}>
      <div className="max-w-6xl w-full mx-auto space-y-6 animate-fade-in pt-16 pb-24 px-4">
        
        <div className="text-center mb-6">
          <h2 className="font-pixel text-lg text-white mb-2">PROJECTS LOG</h2>
          <div className="text-[10px] font-mono" style={{ color: 'rgba(57,255,143,0.5)' }}>
            // {projects.length} PROJECTS LOADED FROM GITHUB
          </div>
          {loading && (
            <div className="flex items-center justify-center gap-2 mt-2">
              <Loader2 size={12} className="animate-spin" style={{ color: '#39ff8f' }} />
              <span className="text-[10px] font-mono" style={{ color: 'rgba(57,255,143,0.5)' }}>SYNCING REPOSITORIES...</span>
            </div>
          )}
          {error && (
            <div className="text-[10px] font-mono mt-2" style={{ color: 'rgba(255,100,100,0.6)' }}>
              // Using cached data — {error}
            </div>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {projects.map((p) => (
            <div key={p.id} className="border p-5 transition-all duration-300 hover:border-[#39ff8f]/60" style={{
              borderColor: 'rgba(57,255,143,0.2)',
              background: 'rgba(2,3,8,0.8)',
              backdropFilter: 'blur(8px)',
              boxShadow: '0 0 20px rgba(57,255,143,0.05)'
            }}>
              <div className="flex items-start gap-3 mb-3">
                <div className="w-10 h-10 flex items-center justify-center border shrink-0" style={{
                  background: 'rgba(57,255,143,0.06)',
                  borderColor: 'rgba(57,255,143,0.3)',
                  color: '#39ff8f'
                }}>
                  {getIcon(p.name)}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className="font-pixel text-[11px] text-white truncate">{p.name}</h3>
                    {p.stars > 0 && (
                      <span className="flex items-center gap-1 text-[8px] font-mono px-1 border" style={{
                        color: '#fbbf24',
                        borderColor: 'rgba(251,191,36,0.3)'
                      }}>
                        <Star size={8} /> {p.stars}
                      </span>
                    )}
                  </div>
                  <p className="text-[10px] font-mono leading-relaxed" style={{ color: 'rgba(57,255,143,0.6)' }}>
                    {p.description}
                  </p>
                </div>
              </div>

              <div className="flex flex-wrap gap-1.5 mb-3">
                {p.tech.map(t => (
                  <span key={t} className="text-[8px] font-mono px-1.5 py-0.5 border" style={{
                    color: 'rgba(100,200,255,0.7)',
                    borderColor: 'rgba(100,200,255,0.2)',
                    background: 'rgba(100,200,255,0.05)'
                  }}>{t}</span>
                ))}
              </div>

              <div className="flex items-center justify-between pt-2" style={{ borderTop: '1px solid rgba(57,255,143,0.1)' }}>
                <span className="text-[8px] font-mono" style={{ color: 'rgba(57,255,143,0.3)' }}>{p.year}</span>
                <div className="flex gap-3">
                  <a href={p.github} target="_blank" rel="noreferrer" className="flex items-center gap-1.5 text-[9px] font-mono transition-colors hover:text-white" style={{ color: '#39ff8f' }}>
                    <GitBranch size={10} /> SOURCE
                  </a>
                  {p.live && (
                    <a href={p.live} target="_blank" rel="noreferrer" className="flex items-center gap-1.5 text-[9px] font-mono transition-colors hover:text-white" style={{ color: '#39ff8f' }}>
                      <ExternalLink size={10} /> LIVE
                    </a>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="border p-4 text-center" style={{
          borderColor: 'rgba(57,255,143,0.15)',
          background: 'rgba(2,3,8,0.6)',
        }}>
          <TerminalText text="> Projects auto-synced from GitHub. New repos appear automatically." speed={15} />
        </div>
      </div>
    </div>
    <ReturnButton />
    </>
  )
}
