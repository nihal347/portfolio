import { useState } from 'react'
import { TerminalText } from '../components/TerminalText'
import { ExternalLink, GitBranch, Clock, Cpu, Bot, Code, Brain } from 'lucide-react'

const PROJECTS = [
  {
    id: 'siji',
    name: 'Siji v0.1',
    cmd: '$ run siji --start',
    icon: <Bot size={20} />,
    difficulty: 5,
    tags: ['Souls-like', 'Python', 'AI/ML'],
    desc: 'In-progress JARVIS-styled AI assistant. Integrates LLMs, voice recognition, and system control into a single unified interface.',
    links: { github: '#', live: '#' },
    tech: 'Python, LangChain, PyTorch, SpeechRecognition',
    year: '2025'
  },
  {
    id: 'voice',
    name: 'GPT-4All + ESP32',
    cmd: '$ exec voice_assistant.sh',
    icon: <Cpu size={20} />,
    difficulty: 4,
    tags: ['Hardware', 'C++', 'Python'],
    desc: 'A voice assistant running locally via GPT-4All, interfacing with an ESP32 microcontroller for hardware control and sensory input.',
    links: { github: '#' },
    tech: 'C++, Python, ESP32, GPT-4All',
    year: '2025'
  },
  {
    id: 'cs50',
    name: 'CS50 AI Capstone',
    cmd: '$ python capstone.py',
    icon: <Brain size={20} />,
    difficulty: 4,
    tags: ['Python', 'AI', 'Algorithms'],
    desc: 'Final project for Harvard\'s CS50 AI course. Implements various search algorithms, machine learning models, and optimization techniques.',
    links: { github: '#' },
    tech: 'Python, NumPy, scikit-learn',
    year: '2024'
  },
  {
    id: 'scrapers',
    name: 'Scrapers & CLI',
    cmd: '$ ./scrape_all.sh',
    icon: <Code size={20} />,
    difficulty: 2,
    tags: ['Python', 'CLI', 'Automation'],
    desc: 'A collection of terminal tools and web scrapers built to automate mundane tasks and extract structured data from various sources.',
    links: { github: '#' },
    tech: 'Python, BeautifulSoup, Click',
    year: '2024'
  },
  {
    id: 'pomodoro',
    name: 'Pomodoro Timer',
    cmd: '$ run pomodoro_timer.py',
    icon: <Clock size={20} />,
    difficulty: 1,
    tags: ['Python', 'GUI'],
    desc: 'A sleek, distraction-free pomodoro timer with customizable intervals and native desktop notifications.',
    links: { github: '#' },
    tech: 'Python, Tkinter',
    year: '2024'
  }
]

export function Missions() {
  const [activeProject, setActiveProject] = useState<string | null>(null)
  const [executing, setExecuting] = useState<string | null>(null)

  const handleExecute = (id: string) => {
    setExecuting(id)
    setActiveProject(id)
  }

  return (
    <div className="page-scroll">
      <div className="max-w-6xl w-full mx-auto space-y-6 animate-fade-in pt-12">
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            
            {/* Mission Cards */}
            <div className="space-y-3">
                {PROJECTS.map((p) => (
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
                            {p.icon}
                        </div>
                        <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-1">
                              <h3 className="font-pixel text-[11px] text-white truncate">{p.name}</h3>
                              <span className="text-[8px] font-mono px-1 border" style={{ color: 'rgba(196,145,90,0.4)', borderColor: 'rgba(196,145,90,0.2)' }}>{p.year}</span>
                            </div>
                            <div className="flex gap-1.5 text-[10px] flex-wrap">
                                {p.tags.map(tag => (
                                    <span key={tag} className="px-1 py-0.5 border" style={{
                                      background: tag === 'Souls-like' ? 'rgba(127,29,29,0.5)' : 'rgba(196,145,90,0.08)',
                                      color: tag === 'Souls-like' ? '#f87171' : 'rgba(196,145,90,0.7)',
                                      borderColor: tag === 'Souls-like' ? 'rgba(239,68,68,0.5)' : 'rgba(196,145,90,0.25)'
                                    }}>
                                        {tag}
                                    </span>
                                ))}
                            </div>
                        </div>
                        <div className="text-right text-[10px] font-mono shrink-0" style={{ color: 'rgba(196,145,90,0.5)' }}>
                            <div className="mb-0.5">LV</div>
                            <div style={{ color: 'var(--color-jupiter)' }}>
                                {'★'.repeat(p.difficulty)}{'☆'.repeat(5 - p.difficulty)}
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
                {activeProject ? (
                    (() => {
                        const project = PROJECTS.find(p => p.id === activeProject)!;
                        const isExecuting = executing === project.id;
                        
                        return (
                            <div key={project.id} className="h-full flex flex-col font-mono text-sm leading-relaxed">
                                <div className="flex items-center justify-between pb-3 mb-4" style={{ borderBottom: '1px solid rgba(196,145,90,0.3)' }}>
                                  <span className="text-white/40 text-xs">&gt; {project.cmd}</span>
                                  <span className="text-[9px] font-pixel" style={{ color: 'rgba(196,145,90,0.4)' }}>{project.year}</span>
                                </div>
                                
                                <div className="text-[10px] mb-4 pb-3" style={{ borderBottom: '1px solid rgba(196,145,90,0.15)', color: 'rgba(196,145,90,0.5)' }}>
                                  STACK: {project.tech}
                                </div>
                                
                                {isExecuting && (
                                    <div className="flex-1">
                                        <TerminalText 
                                            text={`[EXECUTING MISSION: ${project.name}]\n\n${project.desc}`} 
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
                                            {project.desc}
                                        </p>
                                        
                                        <div className="mt-5 pt-3" style={{ borderTop: '1px solid rgba(196,145,90,0.2)' }}>
                                          <div className="text-[9px] font-pixel mb-2" style={{ color: 'rgba(196,145,90,0.5)' }}>DIFFICULTY</div>
                                          <div className="flex gap-1">
                                            {[1,2,3,4,5].map(i => (
                                              <div key={i} className="h-[6px] flex-1 border" style={{ 
                                                borderColor: 'rgba(196,145,90,0.2)',
                                                background: i <= project.difficulty ? 'var(--color-jupiter)' : 'rgba(196,145,90,0.05)'
                                              }} />
                                            ))}
                                          </div>
                                        </div>

                                        <div className="mt-5 pt-3 flex gap-4" style={{ borderTop: '1px solid rgba(196,145,90,0.2)' }}>
                                            {project.links.github && (
                                                <a href={project.links.github} target="_blank" rel="noreferrer" className="flex items-center gap-2 hover:text-white text-xs transition-colors" style={{ color: 'var(--color-jupiter)' }}>
                                                    <GitBranch size={14} /> [SOURCE]
                                                </a>
                                            )}
                                            {project.links.live && (
                                                <a href={project.links.live} target="_blank" rel="noreferrer" className="flex items-center gap-2 hover:text-white text-xs transition-colors" style={{ color: 'var(--color-jupiter)' }}>
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
  )
}
