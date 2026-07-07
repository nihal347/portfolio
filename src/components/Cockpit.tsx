import { useEffect, useState } from 'react'
import { useStore } from '../store/useStore'

const SECTOR_MAP: Record<string, string> = {
  hub: 'ORBIT',
  profile: 'EARTH-CLASS',
  missions: 'GAS-GIANT',
  comms: 'COMM-RELAY',
}

export function Cockpit() {
  const { exploration, settings, toggleSound, toggleSimpleView, currentView, zoomTransition, activePlanet } = useStore()
  const [logIdx, setLogIdx] = useState(0)

  const logMsgs = [
    'sys: orbit engine nominal',
    'sys: parallax layers synced',
    'sys: awaiting pilot input...',
    'sys: comms relay standing by',
    'sys: warp drive charged',
    'sys: scanning sector...',
    'sys: shields at maximum',
    'sys: reactor stable',
  ]

  useEffect(() => {
    const timer = setInterval(() => {
      setLogIdx((prev) => (prev + 1) % logMsgs.length)
    }, 3200)
    return () => clearInterval(timer)
  }, [logMsgs.length])

  const isZooming = zoomTransition.active
  const zoomPhase = zoomTransition.phase
  const targetSector = activePlanet ? SECTOR_MAP[activePlanet] : SECTOR_MAP[currentView] || 'UNKNOWN'

  return (
    <div className="fixed inset-0 z-40 pointer-events-none">
      {/* ── Viewport Frame (SVG) ── */}
      <svg className="absolute inset-0 w-full h-full" style={{ pointerEvents: 'none' }}>
        <defs>
          <filter id="glow">
            <feGaussianBlur stdDeviation="2" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>

        {/* Top edge */}
        <polygon points="0,0 100%,0 100%,28 28,28 0,55" fill="rgba(2,3,8,0.85)" stroke="#39ff8f" strokeWidth="1.5" filter="url(#glow)" style={{ pointerEvents: 'none' }} />
        {/* Bottom edge */}
        <polygon points="0,100% 100%,100% 100%,calc(100% - 28) calc(100% - 28),calc(100% - 28) 0,calc(100% - 55)" fill="rgba(2,3,8,0.85)" stroke="#39ff8f" strokeWidth="1.5" filter="url(#glow)" style={{ pointerEvents: 'none' }} />
        {/* Left edge */}
        <polygon points="0,0 0,100% 28,calc(100% - 28) 28,28" fill="rgba(2,3,8,0.85)" stroke="#39ff8f" strokeWidth="1.5" filter="url(#glow)" style={{ pointerEvents: 'none' }} />
        {/* Right edge */}
        <polygon points="100%,0 100%,100% calc(100% - 28),calc(100% - 28) calc(100% - 28),28" fill="rgba(2,3,8,0.85)" stroke="#39ff8f" strokeWidth="1.5" filter="url(#glow)" style={{ pointerEvents: 'none' }} />

        {/* Corner rivets */}
        {[
          [16, 16], ['calc(100% - 16)', 16],
          [16, 'calc(100% - 16)'], ['calc(100% - 16)', 'calc(100% - 16)'],
        ].map(([cx, cy], i) => (
          <circle key={i} cx={cx} cy={cy} r="3" fill="#1a6b45" stroke="#39ff8f" strokeWidth="0.5" style={{ pointerEvents: 'none' }} />
        ))}

        {/* Center crosshair (faint) */}
        <line x1="50%" y1="45%" x2="50%" y2="55%" stroke="rgba(57,255,143,0.15)" strokeWidth="1" style={{ pointerEvents: 'none' }} />
        <line x1="45%" y1="50%" x2="55%" y2="50%" stroke="rgba(57,255,143,0.15)" strokeWidth="1" style={{ pointerEvents: 'none' }} />
      </svg>

      {/* ── Panel: Top-Left — Ship Status ── */}
      <div className="absolute top-9 left-9 min-w-[150px]" style={{ pointerEvents: 'auto' }}>
        <div className="border px-3 py-2" style={{ borderColor: '#1a6b45', background: 'rgba(2,3,8,0.7)', backdropFilter: 'blur(4px)' }}>
          <div className="text-[8px] font-pixel tracking-wider mb-2 pb-1" style={{ color: '#39ff8f88', borderBottom: '1px solid #1a6b4555' }}>
            SHIP STATUS
          </div>
          {[
            { label: 'SHIELD', value: Math.min(100, 60 + exploration * 0.4) },
            { label: 'POWER', value: 88 },
            { label: 'REACTOR', value: Math.min(100, 70 + exploration * 0.3) },
          ].map(s => (
            <div key={s.label} className="mb-1.5 last:mb-0">
              <div className="flex justify-between text-[7px] font-mono mb-0.5">
                <span style={{ color: '#39ff8f66' }}>{s.label}</span>
                <span style={{ color: '#39ff8f' }}>{Math.round(s.value)}%</span>
              </div>
              <div className="h-[4px] border relative" style={{ borderColor: '#1a6b4544' }}>
                <div className="h-full" style={{ width: `${s.value}%`, background: 'linear-gradient(to right, #39ff8f, #1a6b45)' }} />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* ── Panel: Top-Right — Nav + Controls ── */}
      <div className="absolute top-9 right-9 text-right flex flex-col items-end" style={{ pointerEvents: 'auto' }}>
        <div className="flex gap-2 mb-3">
          <button
            onClick={toggleSimpleView}
            className="cursor-pointer bg-transparent border font-mono text-[10px] px-2.5 py-1 transition-all"
            style={{ borderColor: '#1a6b45', color: '#1a6b45' }}
            onMouseEnter={e => { e.currentTarget.style.borderColor = '#39ff8f'; e.currentTarget.style.color = '#39ff8f'; e.currentTarget.style.boxShadow = '0 0 10px rgba(57,255,143,0.4)' }}
            onMouseLeave={e => { e.currentTarget.style.borderColor = '#1a6b45'; e.currentTarget.style.color = '#1a6b45'; e.currentTarget.style.boxShadow = 'none' }}
            title="Simple view for recruiters/ATS"
          >
            SIMPLE
          </button>
          <button
            onClick={toggleSound}
            className="cursor-pointer bg-transparent border font-mono text-[10px] px-2.5 py-1 transition-all"
            style={{ borderColor: '#1a6b45', color: '#1a6b45' }}
            onMouseEnter={e => { e.currentTarget.style.borderColor = '#39ff8f'; e.currentTarget.style.color = '#39ff8f'; e.currentTarget.style.boxShadow = '0 0 10px rgba(57,255,143,0.4)' }}
            onMouseLeave={e => { e.currentTarget.style.borderColor = '#1a6b45'; e.currentTarget.style.color = '#1a6b45'; e.currentTarget.style.boxShadow = 'none' }}
          >
            SFX: {settings.soundEnabled ? 'ON' : 'OFF'}
          </button>
        </div>

        <div className="border px-3 py-2 min-w-[160px]" style={{ borderColor: '#1a6b4555', background: 'rgba(2,3,8,0.7)', backdropFilter: 'blur(4px)' }}>
          <div className="flex justify-between items-center mb-1.5">
            <span className="text-[8px] font-pixel tracking-wider" style={{ color: '#39ff8f88' }}>SECTOR</span>
            <span className="text-[9px] font-pixel" style={{ color: '#39ff8f' }}>{targetSector}</span>
          </div>
          <div className="flex justify-between items-center mb-1.5">
            <span className="text-[8px] font-pixel tracking-wider" style={{ color: '#39ff8f88' }}>SYS LOAD</span>
            <span className="text-[9px] font-pixel" style={{ color: '#39ff8f' }}>{Math.round(exploration)}%</span>
          </div>
          <div className="w-full h-[6px] border relative" style={{ borderColor: '#1a6b4544' }}>
            <div
              className="h-full transition-all duration-700 ease-out"
              style={{
                width: `${exploration}%`,
                background: exploration >= 80
                  ? 'linear-gradient(to right, #39ff8f, #ffa500)'
                  : 'linear-gradient(to right, #39ff8f, #1a6b45)',
                boxShadow: '0 0 6px rgba(57,255,143,0.3)',
              }}
            />
            {[25, 50, 75].map(tick => (
              <div key={tick} className="absolute top-0 bottom-0 w-[1px]" style={{ left: `${tick}%`, background: '#1a6b4533' }} />
            ))}
          </div>
        </div>
      </div>

      {/* ── Panel: Bottom-Left — System Log ── */}
      <div className="absolute bottom-10 left-9 max-w-[280px]" style={{ pointerEvents: 'auto' }}>
        <div className="border px-3 py-2" style={{ borderColor: '#1a6b4555', background: 'rgba(2,3,8,0.7)', backdropFilter: 'blur(4px)' }}>
          <div className="text-[8px] font-pixel tracking-wider mb-1.5 pb-1" style={{ color: '#39ff8f88', borderBottom: '1px solid #1a6b4555' }}>
            SYSTEM LOG
          </div>
          <div className="flex items-center gap-2 overflow-hidden">
            <div className="w-1.5 h-1.5 rounded-full animate-pulse shrink-0" style={{ background: '#39ff8f', boxShadow: '0 0 4px #39ff8f' }} />
            <div className="whitespace-nowrap overflow-hidden text-ellipsis text-[10px] font-mono" style={{ color: '#39ff8f66' }}>
              &gt; {logMsgs[logIdx]}
              <span className="animate-cursor-blink inline-block w-[6px] h-[11px] ml-[2px] align-[-2px]" style={{ background: '#39ff8f' }} />
            </div>
          </div>
        </div>
      </div>

      {/* ── Panel: Bottom-Right — Comms Signal + Coords ── */}
      <div className="absolute bottom-10 right-9 text-right" style={{ pointerEvents: 'auto' }}>
        <div className="border px-3 py-2 min-w-[130px]" style={{ borderColor: '#1a6b4555', background: 'rgba(2,3,8,0.7)', backdropFilter: 'blur(4px)' }}>
          <div className="text-[8px] font-pixel tracking-wider mb-1.5 pb-1" style={{ color: '#39ff8f88', borderBottom: '1px solid #1a6b4555' }}>
            COMMS
          </div>
          <div className="flex justify-between items-center mb-1">
            <span className="text-[7px] font-mono" style={{ color: '#39ff8f66' }}>SIGNAL</span>
            <div className="flex gap-[2px] items-end">
              {[4, 6, 8, 10, 12].map((h, i) => (
                <div key={i} className="w-[3px]" style={{ height: `${h}px`, background: i < 4 ? '#39ff8f' : '#1a6b4544' }} />
              ))}
            </div>
          </div>
          <div className="text-[9px] font-mono" style={{ color: '#39ff8f44' }}>
            COORD: <span id="coord" style={{ color: '#39ff8f' }}>000.0, 000.0</span>
          </div>
        </div>
      </div>

      {/* ── Zoom Text Overlay ── */}
      {isZooming && (
        <div className="absolute inset-0 flex items-center justify-center" style={{ pointerEvents: 'none' }}>
          <div className="text-center animate-fade-in">
            <p className="font-pixel text-sm md:text-base tracking-widest" style={{
              color: '#39ff8f',
              textShadow: '0 0 20px rgba(57,255,143,0.8), 0 0 40px rgba(57,255,143,0.4)',
            }}>
              {zoomPhase === 'zooming' ? `APPROACHING ${targetSector}...` : 'RETURNING TO ORBIT...'}
            </p>
            <div className="mt-3 mx-auto w-48 h-[2px] overflow-hidden" style={{ background: 'rgba(57,255,143,0.15)' }}>
              <div className="h-full animate-pulse" style={{
                width: '60%',
                background: '#39ff8f',
                animation: 'cockpit-scan 1s ease-in-out infinite',
              }} />
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
