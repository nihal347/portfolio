import { useState, useEffect } from 'react'
import { useStore } from '../store/useStore'
import { GitBranch, Mail, ExternalLink } from 'lucide-react'

const ROLES = [
  'PROGRAMMER',
  'AI ENGINEER',
  'GAME DEV',
  'SYSTEM BUILDER',
  'ML EXPLORER',
  'PYTHONIST',
]

export function Hub() {
  const zoomTransition = useStore(s => s.zoomTransition)
  const [roleText, setRoleText] = useState('')
  const [roleIndex, setRoleIndex] = useState(0)
  const [isTyping, setIsTyping] = useState(true)

  const currentRole = ROLES[roleIndex]

  useEffect(() => {
    let timeout: number

    if (isTyping) {
      if (roleText.length < currentRole.length) {
        timeout = window.setTimeout(() => {
          setRoleText(currentRole.slice(0, roleText.length + 1))
        }, 70 + Math.random() * 40)
      } else {
        timeout = window.setTimeout(() => setIsTyping(false), 2000)
      }
    } else {
      if (roleText.length > 0) {
        timeout = window.setTimeout(() => {
          setRoleText(roleText.slice(0, -1))
        }, 30)
      } else {
        setRoleIndex((roleIndex + 1) % ROLES.length)
        setIsTyping(true)
      }
    }

    return () => clearTimeout(timeout)
  }, [roleText, isTyping, currentRole, roleIndex])

  const faded = zoomTransition.active && zoomTransition.phase === 'zooming'

  return (
    <div className="absolute inset-0 z-20 flex flex-col pointer-events-none overflow-hidden">
      
      {/* Center content — ship main console */}
      <div className="flex-1 flex items-center justify-center p-4 transition-opacity duration-300" style={{ opacity: faded ? 0 : 1 }}>
        <div className="relative max-w-2xl w-full animate-fade-in">
          
          {/* Console frame */}
          <div className="relative border px-6 py-8 md:px-10 md:py-10" style={{
            borderColor: '#39ff8f33',
            background: 'rgba(2,3,8,0.55)',
            backdropFilter: 'blur(6px)',
            boxShadow: '0 0 30px rgba(57,255,143,0.06), inset 0 0 60px rgba(57,255,143,0.03)',
          }}>
            {/* Corner accents */}
            <div className="absolute top-0 left-0 w-4 h-4 border-t-2 border-l-2" style={{ borderColor: '#39ff8f', boxShadow: '0 0 6px #39ff8f' }} />
            <div className="absolute top-0 right-0 w-4 h-4 border-t-2 border-r-2" style={{ borderColor: '#39ff8f', boxShadow: '0 0 6px #39ff8f' }} />
            <div className="absolute bottom-0 left-0 w-4 h-4 border-b-2 border-l-2" style={{ borderColor: '#39ff8f', boxShadow: '0 0 6px #39ff8f' }} />
            <div className="absolute bottom-0 right-0 w-4 h-4 border-b-2 border-r-2" style={{ borderColor: '#39ff8f', boxShadow: '0 0 6px #39ff8f' }} />

            {/* Scanline overlay on console */}
            <div className="absolute inset-0 pointer-events-none" style={{
              background: 'repeating-linear-gradient(to bottom, rgba(57,255,143,0.03) 0px, rgba(57,255,143,0.03) 1px, transparent 1px, transparent 3px)',
            }} />

            {/* Console header bar */}
            <div className="flex items-center justify-between mb-6 pb-2" style={{ borderBottom: '1px solid #39ff8f22' }}>
              <span className="text-[8px] font-pixel tracking-wider" style={{ color: '#39ff8f55' }}>NEXUS_OS // MAIN CONSOLE</span>
              <div className="flex gap-1.5">
                <div className="w-2 h-2 rounded-full" style={{ background: '#39ff8f', boxShadow: '0 0 4px #39ff8f' }} />
                <div className="w-2 h-2 rounded-full" style={{ background: '#1a6b45' }} />
                <div className="w-2 h-2 rounded-full" style={{ background: '#1a6b45' }} />
              </div>
            </div>

            <div className="text-center">
              <p className="text-[10px] font-mono tracking-[0.3em] mb-4" style={{ color: '#39ff8f55' }}>
                // PORTFOLIO OF
              </p>
              <h1 className="font-pixel text-3xl md:text-5xl leading-tight mb-3" style={{ color: '#ffffff', textShadow: '0 0 40px rgba(57,255,143,0.25), 0 0 80px rgba(57,255,143,0.1)' }}>
                NIHAL
              </h1>
              <div className="flex items-center justify-center gap-3 mb-5">
                <div className="h-[1px] w-16" style={{ background: 'linear-gradient(to right, transparent, #39ff8f55)' }} />
                <p className="text-[10px] font-pixel h-4" style={{ color: '#39ff8f88' }}>
                  {roleText}
                  <span className="animate-blink ml-0.5 inline-block w-[6px] h-[10px] align-middle" style={{ background: '#39ff8f' }} />
                </p>
                <div className="h-[1px] w-16" style={{ background: 'linear-gradient(to left, transparent, #39ff8f55)' }} />
              </div>
              <p className="text-xs font-mono mb-2 max-w-md mx-auto" style={{ color: '#39ff8f44' }}>
                Building AI tools, training models, and forging the future.
              </p>
              <p className="text-[10px] font-mono" style={{ color: '#39ff8f22' }}>
                [ SELECT TARGET TO ENGAGE ]
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom bar — language mastery + links */}
      <div className="pointer-events-auto px-4 pb-4 transition-opacity duration-300" style={{ opacity: faded ? 0 : 1 }}>
        <div className="max-w-3xl mx-auto space-y-2">
          
          {/* Language mastery bars */}
          <div className="border px-4 py-3 flex flex-col sm:flex-row items-stretch gap-4" style={{ 
            borderColor: '#39ff8f22',
            background: 'rgba(2,3,8,0.5)',
            backdropFilter: 'blur(4px)',
          }}>
            <LangBar name="Python" level={75} color="#39ff8f" />
            <LangBar name="C" level={40} color="#4df3ff" />
            <LangBar name="C#" level={30} color="#c4915a" />
            <LangBar name="TypeScript" level={60} color="#6db3f2" />
          </div>

          {/* Links row */}
          <div className="flex gap-2">
            <a 
              href="https://github.com" 
              target="_blank" 
              rel="noreferrer"
              className="flex items-center gap-2 border px-3 py-1.5 transition-all pointer-events-auto"
              style={{ borderColor: '#39ff8f22', color: '#39ff8f55' }}
              onMouseEnter={e => { e.currentTarget.style.borderColor = '#39ff8f66'; e.currentTarget.style.color = '#39ff8f'; e.currentTarget.style.boxShadow = '0 0 10px rgba(57,255,143,0.2)' }}
              onMouseLeave={e => { e.currentTarget.style.borderColor = '#39ff8f22'; e.currentTarget.style.color = '#39ff8f55'; e.currentTarget.style.boxShadow = 'none' }}
            >
              <GitBranch size={12} />
              <span className="text-[9px] font-mono">GITHUB</span>
            </a>
            <a 
              href="https://linkedin.com" 
              target="_blank" 
              rel="noreferrer"
              className="flex items-center gap-2 border px-3 py-1.5 transition-all pointer-events-auto"
              style={{ borderColor: '#39ff8f22', color: '#39ff8f55' }}
              onMouseEnter={e => { e.currentTarget.style.borderColor = '#39ff8f66'; e.currentTarget.style.color = '#39ff8f'; e.currentTarget.style.boxShadow = '0 0 10px rgba(57,255,143,0.2)' }}
              onMouseLeave={e => { e.currentTarget.style.borderColor = '#39ff8f22'; e.currentTarget.style.color = '#39ff8f55'; e.currentTarget.style.boxShadow = 'none' }}
            >
              <ExternalLink size={12} />
              <span className="text-[9px] font-mono">LINKEDIN</span>
            </a>
            <a 
              href="mailto:your.email@example.com"
              className="flex items-center gap-2 border px-3 py-1.5 transition-all pointer-events-auto"
              style={{ borderColor: '#39ff8f22', color: '#39ff8f55' }}
              onMouseEnter={e => { e.currentTarget.style.borderColor = '#39ff8f66'; e.currentTarget.style.color = '#39ff8f'; e.currentTarget.style.boxShadow = '0 0 10px rgba(57,255,143,0.2)' }}
              onMouseLeave={e => { e.currentTarget.style.borderColor = '#39ff8f22'; e.currentTarget.style.color = '#39ff8f55'; e.currentTarget.style.boxShadow = 'none' }}
            >
              <Mail size={12} />
              <span className="text-[9px] font-mono">EMAIL</span>
            </a>
          </div>
        </div>
      </div>
    </div>
  )
}

function LangBar({ name, level, color }: { name: string; level: number; color: string }) {
  return (
    <div className="flex-1 flex items-center gap-3">
      <span className="text-[10px] font-pixel w-20 text-right shrink-0" style={{ color: `${color}88` }}>{name}</span>
      <div className="flex-1 h-[8px] border relative" style={{ borderColor: `${color}22` }}>
        <div 
          className="h-full transition-all duration-1000" 
          style={{ width: `${level}%`, background: `linear-gradient(to right, ${color}, ${color}44)`, boxShadow: `0 0 6px ${color}33` }} 
        />
      </div>
      <span className="text-[9px] font-mono w-8 shrink-0" style={{ color: `${color}66` }}>{level}%</span>
    </div>
  )
}
