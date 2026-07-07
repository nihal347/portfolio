import { useEffect, useState } from 'react'
import { useStore } from '../store/useStore'

const PLANET_COLORS: Record<string, { primary: string; dim: string; glow: string }> = {
  hub: { primary: '#39ff8f', dim: '#1a6b45', glow: 'rgba(57,255,143,0.4)' },
  profile: { primary: '#6db3f2', dim: '#1e5b8a', glow: 'rgba(109,179,242,0.4)' },
  missions: { primary: '#c4915a', dim: '#7a5530', glow: 'rgba(196,145,90,0.4)' },
}

export function HUD() {
  const { exploration, settings, toggleSound, toggleSimpleView, currentView, activePlanet } = useStore()
  const [logIdx, setLogIdx] = useState(0)

  const logMsgs = [
    'system.log: orbit engine nominal',
    'system.log: parallax layers synced',
    'system.log: awaiting pilot input...',
    'system.log: comms relay standing by',
    'system.log: warp drive charged',
    'system.log: scanning sector...'
  ]

  useEffect(() => {
    const timer = setInterval(() => {
      setLogIdx((prev) => (prev + 1) % logMsgs.length)
    }, 3200)
    return () => clearInterval(timer)
  }, [logMsgs.length])

  const colors = activePlanet ? PLANET_COLORS[activePlanet] || PLANET_COLORS.hub : PLANET_COLORS.hub

  return (
    <>
      {/* Top-left — coordinates + nav hint */}
      <div className="fixed z-30 top-5 left-5 leading-relaxed pointer-events-none" style={{ color: colors.primary, textShadow: `0 0 10px ${colors.glow}` }}>
        <div className="text-[12px] tracking-wide font-mono">&gt; COORD: <span id="coord" className="text-white">000.0, 000.0</span></div>
        <div className="text-[10px] mt-1 opacity-40 font-mono">
          {activePlanet ? 'click RETURN TO ORBIT to go back' : 'click a planet to travel'}
        </div>
      </div>

      {/* Top-right — controls + system load */}
      <div className="fixed z-30 top-5 right-5 text-right leading-relaxed flex flex-col items-end pointer-events-auto" style={{ color: colors.primary, textShadow: `0 0 10px ${colors.glow}` }}>
        
        {/* Buttons */}
        <div className="flex gap-2 mb-3">
          <button 
            onClick={toggleSimpleView} 
            className="cursor-pointer bg-transparent border font-mono text-[10px] px-2.5 py-1 transition-all"
            style={{ borderColor: colors.dim, color: colors.dim }}
            onMouseEnter={e => { e.currentTarget.style.borderColor = colors.primary; e.currentTarget.style.color = colors.primary; e.currentTarget.style.boxShadow = `0 0 10px ${colors.glow}` }}
            onMouseLeave={e => { e.currentTarget.style.borderColor = colors.dim; e.currentTarget.style.color = colors.dim; e.currentTarget.style.boxShadow = 'none' }}
            title="Simple view for recruiters/ATS"
          >
            SIMPLE
          </button>
          <button 
            onClick={toggleSound} 
            className="cursor-pointer bg-transparent border font-mono text-[10px] px-2.5 py-1 transition-all"
            style={{ borderColor: colors.dim, color: colors.dim }}
            onMouseEnter={e => { e.currentTarget.style.borderColor = colors.primary; e.currentTarget.style.color = colors.primary; e.currentTarget.style.boxShadow = `0 0 10px ${colors.glow}` }}
            onMouseLeave={e => { e.currentTarget.style.borderColor = colors.dim; e.currentTarget.style.color = colors.dim; e.currentTarget.style.boxShadow = 'none' }}
          >
            SFX: {settings.soundEnabled ? 'ON' : 'OFF'}
          </button>
        </div>
        
        {/* System load — bigger */}
        <div className="border px-3 py-2 min-w-[160px]" style={{ 
          borderColor: `${colors.dim}55`, 
          background: 'rgba(2,3,8,0.6)',
          backdropFilter: 'blur(4px)'
        }}>
          <div className="flex justify-between items-center mb-1.5">
            <span className="text-[10px] font-pixel tracking-wider" style={{ color: `${colors.primary}88` }}>SYSTEM LOAD</span>
            <span className="text-[11px] font-pixel" style={{ color: colors.primary }}>{Math.round(exploration)}%</span>
          </div>
          <div className="w-full h-[8px] border relative" style={{ borderColor: `${colors.dim}44` }}>
            <div 
              className="h-full transition-all duration-700 ease-out" 
              style={{ 
                width: `${exploration}%`, 
                background: `linear-gradient(to right, ${colors.primary}, ${colors.dim})`,
                boxShadow: `0 0 8px ${colors.glow}`
              }} 
            />
            {/* Tick marks */}
            {[25, 50, 75].map(tick => (
              <div key={tick} className="absolute top-0 bottom-0 w-[1px]" style={{ left: `${tick}%`, background: `${colors.dim}33` }} />
            ))}
          </div>
          <div className="flex justify-between mt-1">
            <span className="text-[8px] font-mono" style={{ color: `${colors.dim}88` }}>0</span>
            <span className="text-[8px] font-mono" style={{ color: `${colors.dim}88` }}>100</span>
          </div>
        </div>
      </div>

      {/* Bottom bar — log + location */}
      <div className="fixed z-30 left-5 bottom-4 right-5 flex justify-between items-end gap-4 pointer-events-none" style={{ color: colors.primary, textShadow: `0 0 8px ${colors.glow}` }}>
        
        {/* Scrolling log */}
        <div className="flex items-center gap-2 overflow-hidden">
          <div className="w-1.5 h-1.5 rounded-full animate-pulse shrink-0" style={{ background: colors.primary, boxShadow: `0 0 4px ${colors.primary}` }} />
          <div className="opacity-70 whitespace-nowrap overflow-hidden text-ellipsis text-[11px] font-mono" style={{ color: colors.dim }}>
            &gt; {logMsgs[logIdx]}
            <span className="animate-cursor-blink inline-block w-[7px] h-[13px] ml-[2px] align-[-2px]" style={{ background: colors.primary }}></span>
          </div>
        </div>
        
        {/* Location tag */}
        <div className="shrink-0 border px-2.5 py-1 text-[10px] font-pixel" style={{ 
          borderColor: `${colors.dim}33`, 
          background: 'rgba(2,3,8,0.5)',
          color: colors.dim 
        }}>
          {currentView === 'hub' ? '◇ ORBIT' : currentView === 'profile' ? '◈ EARTH' : currentView === 'comms' ? '◈ COMMS' : '◈ JUPITER'}
          <span className="ml-2 opacity-40 font-mono text-[8px]">` terminal</span>
        </div>
      </div>
    </>
  )
}
