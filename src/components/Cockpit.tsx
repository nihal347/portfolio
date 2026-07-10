import { useState, useEffect, useCallback, useRef } from 'react'
import { useStore } from '../store/useStore'
import { GitBranch, Mail, ExternalLink, FileDown } from 'lucide-react'
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

function CtrlBtn({
  label,
  active,
  onClick,
  tooltip,
  sub,
}: {
  label: string
  active: boolean
  onClick: () => void
  tooltip: string
  sub?: string
}) {
  const [showTip, setShowTip] = useState(false)
  return (
    <div className="relative">
      <button
        onClick={() => { playClick(); onClick() }}
        className="fb-square-btn"
        style={active ? { color: '#39ff8f', borderColor: 'rgba(57,255,143,0.5)', textShadow: '0 0 8px rgba(57,255,143,0.6)' } : { color: '#ff3939', borderColor: 'rgba(255,57,57,0.3)' }}
        onMouseEnter={() => setShowTip(true)}
        onMouseLeave={() => setShowTip(false)}
      >
        {label}
        {sub && <span className="block text-[5px] opacity-60 mt-0.5">{sub}</span>}
      </button>
      {showTip && (
        <div className="absolute left-full ml-2 top-1/2 -translate-y-1/2 z-[300] pointer-events-none">
          <div className="bg-[#0a0f1c] border border-[#39ff8f]/30 px-2 py-1 rounded text-[7px] text-[#39ff8f]/70 font-['JetBrains_Mono'] whitespace-nowrap shadow-[0_0_10px_rgba(57,255,143,0.1)]">
            {tooltip}
          </div>
        </div>
      )}
    </div>
  )
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
  const toggleTerminal = useStore(s => s.toggleTerminal)
  const toggleLogs = useStore(s => s.toggleLogs)
  const controls = useStore(s => s.controls)
  const settings = useStore(s => s.settings)
  const classifiedClicks = useStore(s => s.classifiedClicks)
  const classifiedUnlocked = useStore(s => s.classifiedUnlocked)
  const toggleRadar = useStore(s => s.toggleRadar)
  const toggleTrack = useStore(s => s.toggleTrack)
  const cycleZoom = useStore(s => s.cycleZoom)
  const toggleOrbits = useStore(s => s.toggleOrbits)
  const toggleLabels = useStore(s => s.toggleLabels)
  const cycleTimeSpeed = useStore(s => s.cycleTimeSpeed)
  const triggerScan = useStore(s => s.triggerScan)
  const incrementClassifiedClicks = useStore(s => s.incrementClassifiedClicks)
  const resetControls = useStore(s => s.resetControls)

  const [roleText, setRoleText] = useState('')
  const [roleIndex, setRoleIndex] = useState(0)
  const [isTyping, setIsTyping] = useState(true)
  const targetMouse = useRef({ x: 0.5, y: 0.5 })
  const [mousePos, setMousePos] = useState({ x: 0.5, y: 0.5 })
  const [winSize, setWinSize] = useState({ w: window.innerWidth, h: window.innerHeight })
  const currentRole = ROLES[roleIndex]

  const handleMouseMove = useCallback((e: MouseEvent) => {
    targetMouse.current = {
      x: e.clientX / window.innerWidth,
      y: e.clientY / window.innerHeight
    }
  }, [])

  useEffect(() => {
    let raf: number
    let cx = 0.5, cy = 0.5
    const loop = () => {
      cx += (targetMouse.current.x - cx) * 0.05
      cy += (targetMouse.current.y - cy) * 0.05
      
      setMousePos(prev => {
        if (Math.abs(prev.x - cx) > 0.0001 || Math.abs(prev.y - cy) > 0.0001) {
          return { x: cx, y: cy }
        }
        return prev
      })
      raf = requestAnimationFrame(loop)
    }
    raf = requestAnimationFrame(loop)

    window.addEventListener('mousemove', handleMouseMove)
    const handleResize = () => setWinSize({ w: window.innerWidth, h: window.innerHeight })
    window.addEventListener('resize', handleResize)
    return () => {
      window.removeEventListener('mousemove', handleMouseMove)
      window.removeEventListener('resize', handleResize)
      cancelAnimationFrame(raf)
    }
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

  const showViewport = ship.phase === 'idle' || ship.phase === 'zoomOut'
  const isOnPage = currentView !== 'hub' && currentView !== 'boot'
  const isAnimating = ship.phase === 'locking' || ship.phase === 'zoomIn' || ship.phase === 'zoomOut'
  const isReturning = ship.phase === 'zoomOut'
  const travelTarget = ship.target ? SECTOR_MAP[ship.target] || ship.target.toUpperCase() : ''
  const latestLog = log.length > 0 ? log[log.length - 1].msg : 'sys: awaiting pilot input...'
  const shield = Math.round(Math.min(100, 60 + exploration * 0.4))
  const reactor = Math.round(Math.min(100, 70 + exploration * 0.3))
  const targetSector = activePlanet ? SECTOR_MAP[activePlanet] : SECTOR_MAP[currentView] || 'UNKNOWN'

  const handleClassified = () => {
    playClick()
    incrementClassifiedClicks()
  }

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

      <div className="fixed inset-0 z-40 pointer-events-none" style={{ transform: `translate(${(mousePos.x - 0.5) * 15}px, ${(mousePos.y - 0.5) * 15}px)` }}>
        {/* ═══ HEADER ═══ */}
        <div className="absolute top-0 left-0 right-0 h-8 flex items-center justify-center z-10" style={{
          background: 'linear-gradient(to bottom, rgba(2,3,8,0.9), transparent)',
        }}>
          <div className="font-pixel text-[9px] tracking-[0.25em] text-[#39ff8f]/80">
            // WELCOME ABOARD / <span className="text-[#39ff8f]">{roleText}</span>
            <span className="animate-cursor-blink inline-block w-[5px] h-[8px] ml-[2px] align-[-1px]" style={{ background: '#39ff8f' }} />
          </div>
        </div>

        {/* ═══ TOP LEFT — SHIP STATUS ═══ */}
        <div className="floating-box absolute top-12 left-4" style={{ minWidth: '160px' }}>
          <div className="fb-title">SHIP STATUS</div>
          <div className="fb-big text-[8px] mb-1" style={{ color: '#39ff8f' }}>VOYAGER-N</div>
          <div className="fb-row"><span>HULL</span><span className="text-[#39ff8f]">100%</span></div>
          <div className="fb-bar"><div className="fb-bar-fill" style={{ width: '100%' }} /></div>
          <div className="fb-row"><span>SHIELDS</span><span>{shield}%</span></div>
          <div className="fb-bar"><div className="fb-bar-fill" style={{ width: `${shield}%` }} /></div>
          <div className="fb-row"><span>REACTOR</span><span>{reactor}%</span></div>
          <div className="fb-bar"><div className="fb-bar-fill" style={{ width: `${reactor}%` }} /></div>
          <div className="fb-row mt-1 pt-1" style={{ borderTop: '1px solid rgba(57,255,143,0.15)' }}>
            <span>MISSIONS</span><span style={{ color: '#39ff8f' }}>{Math.floor(exploration / 15)}/6</span>
          </div>
          <div className="fb-row"><span>UPTIME</span><span>{Math.floor((Date.now() - performance.timeOrigin) / 60000)}m</span></div>
        </div>

        {/* ═══ TOP RIGHT — SECTOR ═══ */}
        <div className="floating-box absolute top-12 right-4" style={{ minWidth: '150px' }}>
          <div className="fb-title">SECTOR</div>
          <div className="fb-big">{targetSector}</div>
          <div className="fb-row"><span>SYS LOAD</span><span>{Math.round(exploration)}%</span></div>
          <div className="fb-bar"><div className="fb-bar-fill" style={{ width: `${exploration}%` }} /></div>
        </div>

        {/* ═══ LEFT — button bank ═══ */}
        <div className="absolute top-1/2 left-[6%] -translate-y-1/2 pointer-events-auto">
          <div className="flex flex-col items-center gap-1">
            <CtrlBtn label="SFX" active={settings.soundEnabled} onClick={toggleSound} tooltip="Toggle interface sounds" sub={settings.soundEnabled ? 'ON' : 'OFF'} />
            <CtrlBtn label="SCAN" active={controls.scanActive} onClick={triggerScan} tooltip="Initiate solar system scan" />
            <CtrlBtn label="RADAR" active={controls.radar} onClick={toggleRadar} tooltip="Toggle radar sweep" sub={controls.radar ? 'ACTIVE' : 'OFFLINE'} />
            <CtrlBtn label="TRACK" active={controls.track} onClick={toggleTrack} tooltip="Camera follows planets" sub={controls.track ? 'ENABLED' : 'DISABLED'} />
            <CtrlBtn label="ZOOM" active={controls.zoom !== 1} onClick={cycleZoom} tooltip="Cycle zoom level" sub={`${Math.round(controls.zoom * 100)}%`} />
            <CtrlBtn label="ORBITS" active={controls.orbits} onClick={toggleOrbits} tooltip="Toggle orbit ring guides" />
          </div>
        </div>

        {/* ═══ RIGHT — button bank ═══ */}
        <div className="absolute top-1/2 right-[6%] -translate-y-1/2 pointer-events-auto">
          <div className="flex flex-col items-center gap-1">
            <CtrlBtn label="TERMINAL" active={false} onClick={toggleTerminal} tooltip="Open command terminal" />
            <CtrlBtn label="TIME" active={controls.timeSpeed !== 1} onClick={cycleTimeSpeed} tooltip="Cycle simulation speed" sub={`${controls.timeSpeed}x`} />
            <CtrlBtn label="LABELS" active={controls.labels} onClick={toggleLabels} tooltip="Toggle planet labels" />
            <CtrlBtn label="RESET" active={false} onClick={resetControls} tooltip="Reset simulation defaults" />
            <CtrlBtn label="LOGS" active={false} onClick={toggleLogs} tooltip="Open system log panel" />
            <CtrlBtn label="CLASSIFIED" active={classifiedUnlocked} onClick={handleClassified} tooltip={classifiedUnlocked ? 'CLASSIFIED MODE ACTIVE' : classifiedClicks > 0 ? `Access level: ${classifiedClicks}/5` : '???'} />
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
            <a href="https://github.com/Nihal347" target="_blank" rel="noreferrer" className="fb-square-btn"><GitBranch size={10} /> GIT</a>
            <a href="https://www.linkedin.com/in/nihal-akndo/" target="_blank" rel="noreferrer" className="fb-square-btn"><ExternalLink size={10} /> LIN</a>
            <a href="mailto:nihalakndo321@gmail.com" className="fb-square-btn"><Mail size={10} /> MAIL</a>
            <button onClick={() => {
              playClick()
              const link = document.createElement('a')
              link.href = (import.meta.env.BASE_URL || '/') + 'resume.pdf'
              link.download = 'nihal_resume.pdf'
              document.body.appendChild(link)
              link.click()
              document.body.removeChild(link)
              if (!achievements.resumeDownloaded) unlockAchievement('resumeDownloaded')
            }} className="fb-square-btn"><FileDown size={10} /> CV</button>
            <button onClick={() => { playClick(); toggleSimpleView() }} className="fb-square-btn">SIMP</button>
          </div>
        </div>

        {/* ═══ BOTTOM CENTER — Language Mastery ═══ */}
        {!isOnPage && (
        <div className="floating-box absolute bottom-4 left-1/2 -translate-x-1/2" style={{ minWidth: '180px' }}>
          <div className="fb-title text-center mb-2">LANGUAGE MASTERY</div>
          <div className="flex flex-col gap-1.5">
            <div className="flex flex-col gap-0.5">
              <div className="flex justify-between text-[7px] font-['JetBrains_Mono'] text-[#39ff8f]/80"><span>PYTHON</span><span>90%</span></div>
              <div className="h-1 bg-[#0a0f1c] border border-[#39ff8f]/30 relative overflow-hidden">
                <div className="absolute top-0 left-0 h-full bg-[#39ff8f]" style={{ width: '90%', boxShadow: '0 0 5px #39ff8f' }} />
              </div>
            </div>
            <div className="flex flex-col gap-0.5">
              <div className="flex justify-between text-[7px] font-['JetBrains_Mono'] text-[#39ff8f]/80"><span>TYPESCRIPT</span><span>80%</span></div>
              <div className="h-1 bg-[#0a0f1c] border border-[#39ff8f]/30 relative overflow-hidden">
                <div className="absolute top-0 left-0 h-full bg-[#39ff8f]" style={{ width: '80%', boxShadow: '0 0 5px #39ff8f' }} />
              </div>
            </div>
            <div className="flex flex-col gap-0.5">
              <div className="flex justify-between text-[7px] font-['JetBrains_Mono'] text-[#39ff8f]/80"><span>C/C++</span><span>75%</span></div>
              <div className="h-1 bg-[#0a0f1c] border border-[#39ff8f]/30 relative overflow-hidden">
                <div className="absolute top-0 left-0 h-full bg-[#39ff8f]" style={{ width: '75%', boxShadow: '0 0 5px #39ff8f' }} />
              </div>
            </div>
          </div>
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
            </div>
          </div>
        )}

      </div>

      {/* ═══ COCKPIT VIEWPORT ═══ */}
      <div className="fixed inset-0 z-30 pointer-events-none" style={{
        opacity: showViewport ? 1 : 0,
        transform: showViewport ? 'scale(1)' : 'scale(3)',
        transition: 'opacity 0.8s ease-in-out, transform 0.8s ease-in-out'
      }}>
        <div className="absolute inset-0" style={{ transform: `translate(${(mousePos.x - 0.5) * 25}px, ${(mousePos.y - 0.5) * 25}px)` }}>
          {(() => {
            const ox = (mousePos.x - 0.5) * 25
            const oy = (mousePos.y - 0.5) * 25
            const cx = winSize.w / 2 + ox
            const cy = winSize.h / 2 + oy
            const half = 110
            const tl = { x: cx - half, y: cy - half }
            const tr = { x: cx + half, y: cy - half }
            const bl = { x: cx - half, y: cy + half }
            const br = { x: cx + half, y: cy + half }
            return (
              <svg className="absolute inset-0 w-full h-full" viewBox={`0 0 ${winSize.w} ${winSize.h}`} preserveAspectRatio="none">
                <line x1="0" y1="0" x2={tl.x} y2={tl.y} stroke="#39ff8f" strokeWidth="1" opacity="0.3" />
                <line x1={winSize.w} y1="0" x2={tr.x} y2={tr.y} stroke="#39ff8f" strokeWidth="1" opacity="0.3" />
                <line x1="0" y1={winSize.h} x2={bl.x} y2={bl.y} stroke="#39ff8f" strokeWidth="1" opacity="0.3" />
                <line x1={winSize.w} y1={winSize.h} x2={br.x} y2={br.y} stroke="#39ff8f" strokeWidth="1" opacity="0.3" />
              </svg>
            )
          })()}
          <div className="absolute left-1/2 top-1/2 w-[220px] h-[220px] -translate-x-1/2 -translate-y-1/2 border border-[#39ff8f]/30">
            <div className="absolute -top-[1px] -left-[1px] w-3 h-3 border-t-2 border-l-2 border-[#39ff8f]/60" />
            <div className="absolute -top-[1px] -right-[1px] w-3 h-3 border-t-2 border-r-2 border-[#39ff8f]/60" />
            <div className="absolute -bottom-[1px] -left-[1px] w-3 h-3 border-b-2 border-l-2 border-[#39ff8f]/60" />
            <div className="absolute -bottom-[1px] -right-[1px] w-3 h-3 border-b-2 border-r-2 border-[#39ff8f]/60" />
          </div>
        </div>
      </div>
    </>
  )
}
