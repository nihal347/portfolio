import { useEffect, useState } from 'react'
import { CanvasSpace } from './canvas/CanvasSpace'
import { Cockpit } from './components/Cockpit'
import { Cursor } from './components/Cursor'
import { useStore } from './store/useStore'
import { TerminalText } from './components/TerminalText'
import { Hub } from './pages/Hub'
import { Profile } from './pages/Profile'
import { TechStack } from './pages/TechStack'
import { Projects } from './pages/Projects'
import { Missions } from './pages/Missions'
import { Learning } from './pages/Learning'
import { CommsPanel } from './components/CommsPanel'
import { SimpleView } from './pages/SimpleView'
import { TerminalOverlay } from './components/TerminalOverlay'
import Terminal from './components/Terminal'
import { SystemLog } from './components/SystemLog'
import { Toasts } from './components/Toasts'
import { useKonamiCode } from './hooks/useKonamiCode'

function BootSequence() {
  const { setView, unlockAchievement } = useStore()
  const [step, setStep] = useState(0)

  useEffect(() => {
    const timer1 = setTimeout(() => setStep(1), 1500)
    const timer2 = setTimeout(() => setStep(2), 3000)
    const timer3 = setTimeout(() => {
        unlockAchievement('firstVisit')
        setView('hub')
    }, 4500)
    return () => {
      clearTimeout(timer1)
      clearTimeout(timer2)
      clearTimeout(timer3)
    }
  }, [setView, unlockAchievement])

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-void font-mono" style={{ color: 'var(--color-term-green)' }}>
      <div className="max-w-md w-full p-8 border shadow-glow-cyan animate-fade-in" style={{ borderColor: 'rgba(57,255,143,0.2)', background: 'rgba(10,15,28,0.9)', backdropFilter: 'blur(8px)' }}>
        <h1 className="font-pixel text-2xl md:text-4xl text-center mb-2 text-white">VOYAGER-N</h1>
        <p className="text-center text-[10px] font-mono mb-8" style={{ color: 'rgba(57,255,143,0.5)' }}>PILOT: NIHAL</p>
        <div className="space-y-4 text-sm md:text-base">
          <TerminalText text="> INITIALIZING SYSTEM..." />
          {step >= 1 && <div><TerminalText text="> MOUNTING VOLUMES... [OK]" delay={200} /></div>}
          {step >= 2 && <div><TerminalText text="> ACCESS GRANTED." delay={200} /></div>}
          {step >= 2 && (
            <div className="mt-12 text-center animate-blink font-bold text-white">
              [ SYSTEM READY ]
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

function App() {
  const { currentView, settings, unlockAchievement, achievements, ship } = useStore()

  useKonamiCode(() => {
      if (!achievements.konamiCode) {
          unlockAchievement('konamiCode')
          document.body.style.filter = 'hue-rotate(180deg)'
          setTimeout(() => {
              document.body.style.filter = ''
          }, 10000)
      }
  })

  const { addExploration } = useStore()
  useEffect(() => {
      const interval = setInterval(() => {
          if (currentView !== 'boot') {
              addExploration(1)
          }
      }, 5000)
      return () => clearInterval(interval)
  }, [currentView, addExploration])

  const isTraveling = ship.phase === 'locking' || ship.phase === 'zoomIn' || ship.phase === 'zoomOut'

  return (
    <div className="scanlines min-h-screen relative overflow-hidden" style={{ background: 'var(--color-void)', color: 'var(--color-term-green)' }}>
      <CanvasSpace />

      {currentView !== 'boot' && <Cockpit />}

      {!isTraveling && (
        <>
          {currentView === 'boot' && !settings.simpleView && <BootSequence />}
          {currentView === 'hub' && !settings.simpleView && <Hub />}
          {currentView === 'profile' && !settings.simpleView && <Profile />}
          {currentView === 'techstack' && !settings.simpleView && <TechStack />}
          {currentView === 'projects' && !settings.simpleView && <Projects />}
          {currentView === 'missions' && !settings.simpleView && <Missions />}
          {currentView === 'learning' && !settings.simpleView && <Learning />}
          {currentView === 'comms' && !settings.simpleView && <CommsPanel />}
        </>
      )}

      {settings.simpleView && <SimpleView />}

      <TerminalOverlay />
      <Terminal />
      <SystemLog />
      <Toasts />
      {currentView !== 'boot' && !settings.simpleView && <Cursor />}
    </div>
  )
}

export default App
