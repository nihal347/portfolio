import { useState } from 'react'
import { TerminalText } from '../components/TerminalText'
import { ReturnButton } from '../components/ReturnButton'
import { ExternalLink, GitBranch, Bot, Eye, Globe, Orbit, Cpu, Code, Star, Loader2 } from 'lucide-react'
import { useGitHubRepos } from '../hooks/useGitHubRepos'
import React from 'react'

const ICON_MAP: Record<string, React.ReactNode> = {
  siji: <Bot size={20} />,
  visionos: <Eye size={20} />,
  astromind: <Globe size={20} />,
  orbital: <Orbit size={20} />,
  genesis: <Cpu size={20} />,
}

function getIcon(name: string): React.ReactNode {
  const lower = name.toLowerCase()
  if (ICON_MAP[lower]) return ICON_MAP[lower]
  if (lower.includes('ai') || lower.includes('ml') || lower.includes('llm')) return <Bot size={20} />
  if (lower.includes('vision') || lower.includes('cv') || lower.includes('detect')) return <Eye size={20} />
  if (lower.includes('web') || lower.includes('full') || lower.includes('dashboard')) return <Globe size={20} />
  if (lower.includes('sim') || lower.includes('physics') || lower.includes('orbital')) return <Orbit size={20} />
  if (lower.includes('scrap') || lower.includes('auto')) return <Cpu size={20} />
  return <Code size={20} />
}

function getDifficulty(p: { stars: number; topics: string[]; language: string | null }): number {
  let diff = 2
  if (p.stars > 10) diff += 1
  if (p.topics.length > 3) diff += 1
  if (['C++', 'Rust', 'Go', 'CUDA'].includes(p.language || '')) diff += 1
  return Math.min(5, Math.max(1, diff))
}

export function Missions() {
  const [activeProject, setActiveProject] = useState<string | null>(null)
  const [executing, setExecuting] = useState<string | null>(null)
  const { projects, loading } = useGitHubRepos()

  const handleExecute = (id: string) => {
    setExecuting(id)
    setActiveProject(id)
  }

  const active = projects.find(p => p.id === activeProject)

  return (
    <>
    <div className="fixed inset-0 z-50 overflow-y-auto" style={{ background: 'rgba(2,3,8,0.92)', backdropFilter: 'blur(12px)' }}>
      <div className="max-w-6xl w-full mx-auto space-y-6 animate-fade-in pt-16 pb-24 px-4">
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            
            {/* Mission Cards */}
            <div className="space-y-3">
                {loading && (
                  <div className="flex items-center justify-center gap-2 p-4">
                    <Loader2 size={14} className="animate-spin" style={{ color: 'var(--color-jupiter)' }} />
                    <span className="text-[10px] font-mono" style={{ color: 'rgba(196,145,90,0.5)' }}>SYNCING REPOSITORIES...</span>
                  </div>
                )}
                {projects.map((p) => (
                    <button
                        key={p.id}
                        onClick={() => handleExecute(p.id)}
                        className={`w-full text-left border p-4 flex gap-4 items-center transition-all duration-300 cursor-pointer ${
                            activeProject === p.id ? '' : 'hover:bg-black/40'
                        }`}
                        style={{ 
                          borderColor: activeProject === p.id ? 'var(--color-jupiter)' : 'rgba(196,145,90,0.25)',
                          background: activeProject === p.id ? 'rgba(196,145,90,0.1)' : 'rgba(2,3,8,0.7)',
                          backdropFilter: 'blur(6px)',
                          boxShadow: activeProject === p.id ? '0 0 20px rgba(196,145,90,0.15)' : 'none',
                          color: 'var(--color-jupiter)'
                        }}
                    >
                        <div className="w-11 h-11 flex items-center justify-center border shrink-0" style={{ 
                          background: 'rgba(196,145,90,0.06)', 
                          borderColor: 'rgba(196,145,90,0.3)', 
                          color: 'var(--color-jupiter)' 
                        }}>
                            {getIcon(p.name)}
                        </div>
                        <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-1">
                              <h3 className="font-pixel text-[11px] text-white truncate">{p.name}</h3>
                              {p.stars > 0 && (
                                <span className="flex items-center gap-1 text-[8px] font-mono px-1" style={{ color: '#fbbf24' }}>
                                  <Star size={8} /> {p.stars}
                                </span>
                              )}
                            </div>
                            <div className="flex gap-1.5 text-[10px] flex-wrap">
                                {p.tech.slice(0, 4).map(tag => (
                                    <span key={tag} className="px-1 py-0.5 border" style={{
                                      background: 'rgba(196,145,90,0.08)',
                                      color: 'rgba(196,145,90,0.7)',
                                      borderColor: 'rgba(196,145,90,0.25)'
                                    }}>
                                        {tag}
                                    </span>
                                ))}
                                {p.tech.length > 4 && (
                                  <span className="px-1 py-0.5" style={{ color: 'rgba(196,145,90,0.4)' }}>
                                    +{p.tech.length - 4}
                                  </span>
                                )}
                            </div>
                        </div>
                        <div className="text-right text-[10px] font-mono shrink-0" style={{ color: 'rgba(196,145,90,0.5)' }}>
                            <div className="mb-0.5">LV</div>
                            <div style={{ color: 'var(--color-jupiter)' }}>
                                {'★'.repeat(getDifficulty(p))}{'☆'.repeat(5 - getDifficulty(p))}
                            </div>
                        </div>
                    </button>
                ))}
            </div>

            {/* Terminal Details Panel */}
            <div className="border p-6 relative min-h-[400px]" style={{ 
              borderColor: 'rgba(196,145,90,0.3)', 
              background: 'rgba(2,3,8,0.8)', 
              backdropFilter: 'blur(8px)',
              boxShadow: '0 0 30px rgba(196,145,90,0.08), inset 0 0 20px rgba(196,145,90,0.03)' 
            }}>
                {active ? (
                    (() => {
                        const isExecuting = executing === active.id;
                        const diff = getDifficulty(active)
                        
                        return (
                            <div key={active.id} className="h-full flex flex-col font-mono text-sm leading-relaxed">
                                <div className="flex items-center justify-between pb-3 mb-4" style={{ borderBottom: '1px solid rgba(196,145,90,0.3)' }}>
                                  <span className="text-white/40 text-xs">&gt; $ run {active.name.toLowerCase()} --start</span>
                                  <span className="text-[9px] font-pixel" style={{ color: 'rgba(196,145,90,0.4)' }}>{active.year}</span>
                                </div>
                                
                                <div className="text-[10px] mb-4 pb-3" style={{ borderBottom: '1px solid rgba(196,145,90,0.15)', color: 'rgba(196,145,90,0.5)' }}>
                                  STACK: {active.tech.join(', ')}
                                </div>
                                
                                {isExecuting && (
                                    <div className="flex-1">
                                        <TerminalText 
                                            text={`[EXECUTING MISSION: ${active.name}]\n\n${active.description}`} 
                                            speed={20}
                                            onComplete={() => setExecuting(null)}
                                        />
                                    </div>
                                )}
                                
                                {!isExecuting && (
                                    <div className="flex-1 animate-fade-in">
                                        <p className="whitespace-pre-wrap text-xs leading-relaxed">
                                            <span className="text-white">[MISSION STATUS: READY]</span>
                                            {'\n\n'}
                                            {active.description}
                                        </p>
                                        
                                        <div className="mt-5 pt-3" style={{ borderTop: '1px solid rgba(196,145,90,0.2)' }}>
                                          <div className="text-[9px] font-pixel mb-2" style={{ color: 'rgba(196,145,90,0.5)' }}>DIFFICULTY</div>
                                          <div className="flex gap-1">
                                            {[1,2,3,4,5].map(i => (
                                              <div key={i} className="h-[6px] flex-1 border" style={{ 
                                                borderColor: 'rgba(196,145,90,0.2)',
                                                background: i <= diff ? 'var(--color-jupiter)' : 'rgba(196,145,90,0.05)'
                                              }} />
                                            ))}
                                          </div>
                                        </div>

                                        {active.topics.length > 0 && (
                                          <div className="mt-4 pt-3" style={{ borderTop: '1px solid rgba(196,145,90,0.2)' }}>
                                            <div className="text-[9px] font-pixel mb-2" style={{ color: 'rgba(196,145,90,0.5)' }}>TOPICS</div>
                                            <div className="flex flex-wrap gap-1">
                                              {active.topics.map(t => (
                                                <span key={t} className="text-[8px] font-mono px-1.5 py-0.5 border" style={{
                                                  color: 'rgba(196,145,90,0.6)',
                                                  borderColor: 'rgba(196,145,90,0.2)',
                                                  background: 'rgba(196,145,90,0.05)'
                                                }}>{t}</span>
                                              ))}
                                            </div>
                                          </div>
                                        )}

                                        <div className="mt-5 pt-3 flex gap-4" style={{ borderTop: '1px solid rgba(196,145,90,0.2)' }}>
                                            <a href={active.github} target="_blank" rel="noreferrer" className="flex items-center gap-2 hover:text-white text-xs transition-colors" style={{ color: 'var(--color-jupiter)' }}>
                                                <GitBranch size={14} /> [SOURCE]
                                            </a>
                                            {active.live && (
                                                <a href={active.live} target="_blank" rel="noreferrer" className="flex items-center gap-2 hover:text-white text-xs transition-colors" style={{ color: 'var(--color-jupiter)' }}>
                                                    <ExternalLink size={14} /> [LIVE]
                                                </a>
                                            )}
                                        </div>
                                    </div>
                                )}
                            </div>
                        )
                    })()
                ) : (
                    <div className="h-full flex items-center justify-center opacity-40 flex-col gap-3">
                        <TerminalText text="> SELECT A MISSION..." />
                        <p className="text-[9px] font-mono" style={{ color: 'rgba(196,145,90,0.3)' }}>Click a mission card to view details</p>
                    </div>
                )}
            </div>

        </div>
      </div>
    </div>
    <ReturnButton color="rgba(196,145,90,0.6)" />
    </>
  )
}
