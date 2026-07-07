import { useState, useEffect, useCallback } from 'react'
import { useStore } from '../store/useStore'
import { RotateCcw, GitBranch, Mail, ExternalLink, FileDown } from 'lucide-react'
import { playClick } from '../hooks/useSound'

const ROLES = [
  'CALLSIGN: NIHAL',
  'CLASS: FULL-STACK',
  'DIVISION: AI/ML ENGINEER',
  'STATUS: AVAILABLE',
  'MISSION: BUILD THE FUTURE',
  'ROLE: SYSTEM ARCHITECT',
  'RANK: CODE WARRIOR',
  'POST: PYTHON ENGINEER',
]

const SECTOR_MAP: Record<string, string> = {
  hub: 'ORBIT',
  about: 'MERCURY-CLASS',
  profile: 'MERCURY-CLASS',
  techstack: 'VENUS-CLASS',
  projects: 'EARTH-CLASS',
  missions: 'JUPITER-CLASS',
  learning: 'SATURN-CLASS',
  comms: 'COMM-RELAY',
}

export function Cockpit() {
  const exploration = useStore(s => s.exploration)
  const toggleSound = useStore(s => s.toggleSound)
  const toggleSimpleView = useStore(s => s.toggleSimpleView)
  const currentView = useStore(s => s.currentView)
  const activePlanet = useStore(s => s.activePlanet)
  const ship = useStore(s => s.ship)
  const log = useStore(s => s.log)
  const unlockAchievement = useStore(s => s.unlockAchievement)
  const achievements = useStore(s => s.achievements)
  const initiateReturn = useStore(s => s.initiateReturn)

  const [roleText, setRoleText] = useState('')
  const [roleIndex, setRoleIndex] = useState(0)
  const [isTyping, setIsTyping] = useState(true)
  const [mousePos, setMousePos] = useState({ x: 0.5, y: 0.5 })
  const [btnToggles, setBtnToggles] = useState<Record<string, boolean>>({
    BTN1: false, BTN2: false, BTN3: false, BTN4: false, SFX: true, BTN6: false,
    BTN7: false, BTN8: false, BTN9: false, BTN10: false, BTN11: false, BTN12: false,
  })
  const currentRole = ROLES[roleIndex]

  const toggleBtn = (id: string) => {
    setBtnToggles(prev => ({ ...prev, [id]: !prev[id] }))
  }

  const handleMouseMove = useCallback((e: MouseEvent) => {
    setMousePos({
      x: e.clientX / window.innerWidth,
      y: e.clientY / window.innerHeight
    })
  }, [])

  useEffect(() => {
    window.addEventListener('mousemove', handleMouseMove)
    return () => window.removeEventListener('mousemove', handleMouseMove)
  }, [handleMouseMove])

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

  const isOnPage = currentView !== 'hub' && currentView !== 'boot'
  const isAnimating = ship.phase === 'locking' || ship.phase === 'zoomIn' || ship.phase === 'zoomOut'
  const isReturning = ship.phase === 'zoomOut'
  const travelTarget = ship.target ? SECTOR_MAP[ship.target] || ship.target.toUpperCase() : ''
  const latestLog = log.length > 0 ? log[log.length - 1].msg : 'sys: awaiting pilot input...'
  const shield = Math.round(Math.min(100, 60 + exploration * 0.4))
  const reactor = Math.round(Math.min(100, 70 + exploration * 0.3))
  const targetSector = activePlanet ? SECTOR_MAP[activePlanet] : SECTOR_MAP[currentView] || 'UNKNOWN'

  return (
    <>
      <div className="cockpit-frame" />

      {/* Hex corner accents */}
      <div className="cockpit-hex-corner cockpit-hex-corner--tl">
        <svg viewBox="0 0 80 80" fill="none">
          <path d="M0 40 L20 20 L40 0" stroke="#39ff8f" strokeWidth="1" opacity="0.4" />
          <path d="M0 60 L30 30 L60 0" stroke="#39ff8f" strokeWidth="0.5" opacity="0.25" />
          <polygon points="10,30 20,20 30,30 30,40 20,50 10,40" stroke="#39ff8f" strokeWidth="0.5" fill="rgba(57,255,143,0.03)" opacity="0.5" />
          <polygon points="25,15 35,5 45,15 45,25 35,35 25,25" stroke="#39ff8f" strokeWidth="0.5" fill="rgba(57,255,143,0.02)" opacity="0.4" />
          <circle cx="20" cy="20" r="2" fill="#39ff8f" opacity="0.5" />
        </svg>
      </div>
      <div className="cockpit-hex-corner cockpit-hex-corner--tr">
        <svg viewBox="0 0 80 80" fill="none">
          <path d="M0 40 L20 20 L40 0" stroke="#39ff8f" strokeWidth="1" opacity="0.4" />
          <path d="M0 60 L30 30 L60 0" stroke="#39ff8f" strokeWidth="0.5" opacity="0.25" />
          <polygon points="10,30 20,20 30,30 30,40 20,50 10,40" stroke="#39ff8f" strokeWidth="0.5" fill="rgba(57,255,143,0.03)" opacity="0.5" />
          <polygon points="25,15 35,5 45,15 45,25 35,35 25,25" stroke="#39ff8f" strokeWidth="0.5" fill="rgba(57,255,143,0.02)" opacity="0.4" />
          <circle cx="20" cy="20" r="2" fill="#39ff8f" opacity="0.5" />
        </svg>
      </div>
      <div className="cockpit-hex-corner cockpit-hex-corner--bl">
        <svg viewBox="0 0 80 80" fill="none">
          <path d="M0 40 L20 20 L40 0" stroke="#39ff8f" strokeWidth="1" opacity="0.4" />
          <path d="M0 60 L30 30 L60 0" stroke="#39ff8f" strokeWidth="0.5" opacity="0.25" />
          <polygon points="10,30 20,20 30,30 30,40 20,50 10,40" stroke="#39ff8f" strokeWidth="0.5" fill="rgba(57,255,143,0.03)" opacity="0.5" />
          <polygon points="25,15 35,5 45,15 45,25 35,35 25,25" stroke="#39ff8f" strokeWidth="0.5" fill="rgba(57,255,143,0.02)" opacity="0.4" />
          <circle cx="20" cy="20" r="2" fill="#39ff8f" opacity="0.5" />
        </svg>
      </div>
      <div className="cockpit-hex-corner cockpit-hex-corner--br">
        <svg viewBox="0 0 80 80" fill="none">
          <path d="M0 40 L20 20 L40 0" stroke="#39ff8f" strokeWidth="1" opacity="0.4" />
          <path d="M0 60 L30 30 L60 0" stroke="#39ff8f" strokeWidth="0.5" opacity="0.25" />
          <polygon points="10,30 20,20 30,30 30,40 20,50 10,40" stroke="#39ff8f" strokeWidth="0.5" fill="rgba(57,255,143,0.03)" opacity="0.5" />
          <polygon points="25,15 35,5 45,15 45,25 35,35 25,25" stroke="#39ff8f" strokeWidth="0.5" fill="rgba(57,255,143,0.02)" opacity="0.4" />
          <circle cx="20" cy="20" r="2" fill="#39ff8f" opacity="0.5" />
        </svg>
      </div>

      {/* Edge lines */}
      <div className="cockpit-hex-edge cockpit-hex-edge--top" />
      <div className="cockpit-hex-edge cockpit-hex-edge--bottom" />
      <div className="cockpit-hex-edge cockpit-hex-edge--left" />
      <div className="cockpit-hex-edge cockpit-hex-edge--right" />

      <div className="fixed inset-0 z-40 pointer-events-none">
        {/* ═══ HEADER ═══ */}
        <div className="absolute top-0 left-0 right-0 h-8 flex items-center justify-center z-10" style={{
          background: 'linear-gradient(to bottom, rgba(2,3,8,0.8), transparent)',
        }}>
          <p className="fb-text tracking-[0.3em]" style={{ fontSize: '10px', opacity: isOnPage ? 0.4 : 1, transition: 'opacity 0.5s' }}>
            // WELCOME ABOARD / {roleText}
            <span className="animate-blink ml-0.5 inline-block w-[4px] h-[7px] align-[-1px]" style={{ background: '#39ff8f' }} />
          </p>
        </div>

        {/* ═══ CENTER — targeting square + corner lines ═══ */}
        <div className="absolute inset-0" style={{ 
          opacity: isOnPage && !isAnimating ? 0 : 0.15,
          transition: 'opacity 0.4s ease-out',
        }}>
          <svg className="w-full h-full" viewBox="0 0 1000 600" preserveAspectRatio="none">
            {(() => {
              const offsetX = (mousePos.x - 0.5) * 40
              const offsetY = (mousePos.y - 0.5) * 40
              const cx = 500 + offsetX
              const cy = 300 + offsetY
              const s = 40
              return (
                <>
                  <rect x={cx - s} y={cy - s} width={s * 2} height={s * 2} stroke="#39ff8f" strokeWidth="1" fill="none" />
                  <rect x={cx - s + 5} y={cy - s + 5} width={s * 2 - 10} height={s * 2 - 10} stroke="#39ff8f" strokeWidth="0.5" fill="none" opacity="0.5" />
                  <line x1={cx - s} y1={cy - s} x2="0" y2="0" stroke="#39ff8f" strokeWidth="0.5" />
                  <line x1={cx + s} y1={cy - s} x2="1000" y2="0" stroke="#39ff8f" strokeWidth="0.5" />
                  <line x1={cx - s} y1={cy + s} x2="0" y2="600" stroke="#39ff8f" strokeWidth="0.5" />
                  <line x1={cx + s} y1={cy + s} x2="1000" y2="600" stroke="#39ff8f" strokeWidth="0.5" />
                  <line x1={cx} y1={cy - s - 10} x2={cx} y2={cy + s + 10} stroke="#39ff8f" strokeWidth="0.5" opacity="0.6" />
                  <line x1={cx - s - 10} y1={cy} x2={cx + s + 10} y2={cy} stroke="#39ff8f" strokeWidth="0.5" opacity="0.6" />
                  <circle cx={cx} cy={cy} r="3" fill="#39ff8f" opacity="0.6" />
                </>
              )
            })()}
          </svg>
        </div>

        {/* ═══ TOP LEFT — ship status ═══ */}
        <div className="floating-box absolute top-4 left-4" style={{ minWidth: '140px' }}>
          <div className="fb-title">SHIP STATUS</div>
          <div className="fb-row"><span>SHD</span><span>{shield}%</span></div>
          <div className="fb-bar"><div className="fb-bar-fill" style={{ width: `${shield}%` }} /></div>
          <div className="fb-row"><span>PWR</span><span>88%</span></div>
          <div className="fb-bar"><div className="fb-bar-fill" style={{ width: '88%' }} /></div>
          <div className="fb-row"><span>RCT</span><span>{reactor}%</span></div>
          <div className="fb-bar"><div className="fb-bar-fill" style={{ width: `${reactor}%` }} /></div>
        </div>

        {/* ═══ TOP RIGHT — sector ═══ */}
        <div className="floating-box absolute top-4 right-4 text-right" style={{ minWidth: '140px' }}>
          <div className="fb-title">SECTOR</div>
          <div className="fb-big">{targetSector}</div>
          <div className="fb-row"><span>SYS LOAD</span><span>{Math.round(exploration)}%</span></div>
          <div className="fb-bar"><div className="fb-bar-fill" style={{ width: `${exploration}%` }} /></div>
        </div>

        {/* ═══ LEFT — button bank ═══ */}
        <div className="absolute top-1/2 left-[8%] -translate-y-1/2 pointer-events-auto">
          <div className="flex flex-col items-center gap-1.5">
            <div className="flex gap-1.5">
              {['BTN1', 'BTN2', 'BTN3'].map(btn => (
                <button key={btn} onClick={() => { playClick(); toggleBtn(btn) }} className="fb-square-btn" style={btnToggles[btn] === false ? { color: '#ff3939', borderColor: 'rgba(255,57,57,0.4)' } : undefined}>{btn}</button>
              ))}
            </div>
            <div className="flex gap-1.5">
              <button onClick={() => { playClick(); toggleBtn('BTN4') }} className="fb-square-btn" style={btnToggles['BTN4'] === false ? { color: '#ff3939', borderColor: 'rgba(255,57,57,0.4)' } : undefined}>BTN4</button>
              <button onClick={() => { playClick(); toggleBtn('SFX'); toggleSound() }} className="fb-square-btn" style={btnToggles['SFX'] === false ? { color: '#ff3939', borderColor: 'rgba(255,57,57,0.4)' } : undefined}>SFX</button>
            </div>
            <button onClick={() => { playClick(); toggleBtn('BTN6') }} className="fb-square-btn" style={btnToggles['BTN6'] === false ? { color: '#ff3939', borderColor: 'rgba(255,57,57,0.4)' } : undefined}>BTN6</button>
          </div>
        </div>

        {/* ═══ RIGHT — button bank ═══ */}
        <div className="absolute top-1/2 right-[8%] -translate-y-1/2 pointer-events-auto">
          <div className="flex flex-col items-center gap-1.5">
            <div className="flex gap-1.5">
              {['BTN7', 'BTN8', 'BTN9'].map(btn => (
                <button key={btn} onClick={() => { playClick(); toggleBtn(btn) }} className="fb-square-btn" style={btnToggles[btn] === false ? { color: '#ff3939', borderColor: 'rgba(255,57,57,0.4)' } : undefined}>{btn}</button>
              ))}
            </div>
            <div className="flex gap-1.5">
              {['BTN10', 'BTN11'].map(btn => (
                <button key={btn} onClick={() => { playClick(); toggleBtn(btn) }} className="fb-square-btn" style={btnToggles[btn] === false ? { color: '#ff3939', borderColor: 'rgba(255,57,57,0.4)' } : undefined}>{btn}</button>
              ))}
            </div>
            <button onClick={() => { playClick(); toggleBtn('BTN12') }} className="fb-square-btn" style={btnToggles['BTN12'] === false ? { color: '#ff3939', borderColor: 'rgba(255,57,57,0.4)' } : undefined}>BTN12</button>
          </div>
        </div>

        {/* ═══ BOTTOM LEFT — system log ═══ */}
        <div className="floating-box absolute bottom-4 left-4" style={{ minWidth: '160px' }}>
          <div className="fb-title">SYSTEM LOG</div>
          <div className="fb-text" style={{ fontSize: '8px' }}>
            &gt; {latestLog}
            <span className="animate-cursor-blink inline-block w-[4px] h-[7px] ml-[1px] align-[-1px]" style={{ background: '#39ff8f' }} />
          </div>
        </div>

        {/* ═══ BOTTOM RIGHT — controls ═══ */}
        <div className="floating-box absolute bottom-4 right-4" style={{ minWidth: '160px' }}>
          <div className="fb-title">CONTROLS</div>
          <div className="flex flex-wrap gap-1">
            <a href="https://github.com" target="_blank" rel="noreferrer" className="fb-square-btn"><GitBranch size={10} /> GIT</a>
            <a href="https://linkedin.com" target="_blank" rel="noreferrer" className="fb-square-btn"><ExternalLink size={10} /> LIN</a>
            <a href="mailto:your.email@example.com" className="fb-square-btn"><Mail size={10} /> MAIL</a>
            <button onClick={() => {
              playClick()
              const link = document.createElement('a')
              link.href = '/resume.pdf'
              link.download = 'nihal_resume.pdf'
              document.body.appendChild(link)
              link.click()
              document.body.removeChild(link)
              if (!achievements.resumeDownloaded) unlockAchievement('resumeDownloaded')
            }} className="fb-square-btn"><FileDown size={10} /> CV</button>
            <button onClick={() => { playClick(); toggleSimpleView() }} className="fb-square-btn">SIMP</button>
          </div>
        </div>

        {/* ═══ CENTER — return button ═══ */}
        {isOnPage && !isAnimating && (
          <div className="absolute bottom-16 left-1/2 -translate-x-1/2 pointer-events-auto animate-fade-in">
            <button onClick={() => { playClick(); initiateReturn() }} className="fb-btn fb-btn-lg">
              <RotateCcw size={11} /> RETURN TO ORBIT
            </button>
          </div>
        )}

        {/* ═══ Travel overlay ═══ */}
        {isAnimating && (
          <div className="absolute inset-0 flex items-center justify-center z-50" style={{ pointerEvents: 'none' }}>
            <div className="text-center animate-fade-in">
              <p className="font-pixel text-sm tracking-[0.3em]" style={{
                color: '#39ff8f',
                textShadow: '0 0 20px rgba(57,255,143,0.8), 0 0 40px rgba(57,255,143,0.4)',
              }}>
                {isReturning ? 'RETURNING TO ORBIT...' : `APPROACHING ${travelTarget}...`}
              </p>
              <div className="mt-3 mx-auto w-48 h-[2px] overflow-hidden" style={{ background: 'rgba(57,255,143,0.15)' }}>
                <div className="h-full" style={{
                  width: '60%',
                  background: '#39ff8f',
                  boxShadow: '0 0 8px #39ff8f',
                  animation: 'cockpit-scan 1s ease-in-out infinite',
                }} />
        </div>

        {/* ═══ CENTER — targeting square + corner lines ═══ */}
        <div className="absolute inset-0" style={{ 
          opacity: isOnPage ? 0 : 0.15,
          transform: isOnPage ? 'scale(0.5)' : 'scale(1)',
          transition: 'opacity 0.4s ease-out, transform 0.4s ease-out',
          transformOrigin: 'center center'
        }}>
          <svg className="w-full h-full" viewBox="0 0 1000 600" preserveAspectRatio="none">
            {/* Center square */}
            <rect x="460" y="260" width="80" height="80" 
              stroke="#39ff8f" strokeWidth="1" fill="none" />
            <rect x="465" y="265" width="70" height="70" 
              stroke="#39ff8f" strokeWidth="0.5" fill="none" opacity="0.5" />
            
            {/* Lines to corners */}
            <line x1="460" y1="260" x2="0" y2="0" 
              stroke="#39ff8f" strokeWidth="0.5" />
            <line x1="540" y1="260" x2="1000" y2="0" 
              stroke="#39ff8f" strokeWidth="0.5" />
            <line x1="460" y1="340" x2="0" y2="600" 
              stroke="#39ff8f" strokeWidth="0.5" />
            <line x1="540" y1="340" x2="1000" y2="600" 
              stroke="#39ff8f" strokeWidth="0.5" />
            
            {/* Center crosshair */}
            <line x1="500" y1="210" x2="500" y2="390" 
              stroke="#39ff8f" strokeWidth="0.5" opacity="0.6" />
            <line x1="410" y1="300" x2="590" y2="300" 
              stroke="#39ff8f" strokeWidth="0.5" opacity="0.6" />
            
            {/* Center dot */}
            <circle cx="500" cy="300" r="3" fill="#39ff8f" opacity="0.6" />
          </svg>
        </div>

            </div>
          </div>
        )}
      </div>
    </>
  )
}
