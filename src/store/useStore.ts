import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export type ViewState = 'boot' | 'hub' | 'profile' | 'projects' | 'comms' | 'techstack' | 'missions' | 'learning'
export type PlanetType = 'about' | 'techstack' | 'projects' | 'missions' | 'learning' | 'comms' | null
export type ShipPhase = 'idle' | 'locking' | 'zoomIn' | 'arrived' | 'zoomOut'

interface LogEntry {
  msg: string
  time: number
}

interface AppState {
  currentView: ViewState
  activePlanet: PlanetType
  exploration: number
  terminalOpen: boolean
  logsOpen: boolean
  classifiedClicks: number
  classifiedUnlocked: boolean
  achievements: {
    firstVisit: boolean
    hiddenTerminal: boolean
    konamiCode: boolean
    fullExploration: boolean
    resumeDownloaded: boolean
    easterEgg: boolean
  }
  settings: {
    soundEnabled: boolean
    simpleView: boolean
  }
  controls: {
    radar: boolean
    track: boolean
    zoom: number
    orbits: boolean
    labels: boolean
    timeSpeed: number
    scanActive: boolean
  }

  ship: {
    phase: ShipPhase
    target: PlanetType
    startTime: number
  }

  log: LogEntry[]

  setView: (view: ViewState) => void
  setActivePlanet: (planet: PlanetType) => void
  addExploration: (amount: number) => void
  unlockAchievement: (key: keyof AppState['achievements']) => void
  toggleSound: () => void
  toggleSimpleView: () => void
  resetState: () => void
  pushLog: (msg: string) => void

  initiateTravel: (target: PlanetType) => void
  arrive: () => void
  initiateReturn: () => void
  finishReturn: () => void
  toggleTerminal: () => void
  toggleLogs: () => void
  toggleRadar: () => void
  toggleTrack: () => void
  cycleZoom: () => void
  toggleOrbits: () => void
  toggleLabels: () => void
  cycleTimeSpeed: () => void
  triggerScan: () => void
  setScanActive: (v: boolean) => void
  incrementClassifiedClicks: () => void
  resetControls: () => void
}

export const useStore = create<AppState>()(
  persist(
    (set, get) => ({
      currentView: 'boot',
      activePlanet: null,
      exploration: 0,
      terminalOpen: false,
      logsOpen: false,
      classifiedClicks: 0,
      classifiedUnlocked: false,
      ship: { phase: 'idle', target: null, startTime: 0 },
      log: [{ msg: 'sys: orbit engine nominal', time: Date.now() }],
      achievements: {
        firstVisit: false,
        hiddenTerminal: false,
        konamiCode: false,
        fullExploration: false,
        resumeDownloaded: false,
        easterEgg: false,
      },
      settings: {
        soundEnabled: true,
        simpleView: false,
      },
      controls: {
        radar: false,
        track: false,
        zoom: 1,
        orbits: true,
        labels: true,
        timeSpeed: 1,
        scanActive: false,
      },

      setActivePlanet: (planet) => set({ activePlanet: planet }),
      setView: (view) => set({ currentView: view }),

      pushLog: (msg) =>
        set((s) => ({
          log: [...s.log.slice(-49), { msg, time: Date.now() }],
        })),

      addExploration: (amount) => {
        const current = get().exploration
        if (current >= 100) return
        const next = Math.min(100, current + amount)
        set({ exploration: next })
        if (next === 100 && !get().achievements.fullExploration) {
          get().unlockAchievement('fullExploration')
        }
      },

      unlockAchievement: (key) =>
        set((s) => ({
          achievements: { ...s.achievements, [key]: true },
        })),

      toggleSound: () => {
        const next = !get().settings.soundEnabled
        set((s) => ({
          settings: { ...s.settings, soundEnabled: next },
        }))
        get().pushLog(next ? 'Audio enabled' : 'Audio muted')
      },

      toggleSimpleView: () =>
        set((s) => ({
          settings: { ...s.settings, simpleView: !s.settings.simpleView },
        })),

      toggleTerminal: () =>
        set((s) => ({
          terminalOpen: !s.terminalOpen,
        })),

      toggleLogs: () =>
        set((s) => ({
          logsOpen: !s.logsOpen,
        })),

      toggleRadar: () => {
        const next = !get().controls.radar
        set((s) => ({
          controls: { ...s.controls, radar: next },
        }))
        get().pushLog(next ? 'Radar: ACTIVE' : 'Radar: OFFLINE')
      },

      toggleTrack: () => {
        const next = !get().controls.track
        set((s) => ({
          controls: { ...s.controls, track: next },
        }))
        get().pushLog(next ? 'Camera tracking: ENABLED' : 'Camera tracking: DISABLED')
      },

      cycleZoom: () => {
        const levels = [0.4, 0.65, 1, 1.5, 2]
        const current = get().controls.zoom
        const idx = levels.indexOf(current)
        const next = levels[(idx + 1) % levels.length]
        set((s) => ({
          controls: { ...s.controls, zoom: next },
        }))
        get().pushLog(`Zoom: ${Math.round(next * 100)}%`)
      },

      toggleOrbits: () => {
        const next = !get().controls.orbits
        set((s) => ({
          controls: { ...s.controls, orbits: next },
        }))
        get().pushLog(next ? 'Orbit guides: ON' : 'Orbit guides: OFF')
      },

      toggleLabels: () => {
        const next = !get().controls.labels
        set((s) => ({
          controls: { ...s.controls, labels: next },
        }))
        get().pushLog(next ? 'Labels: ON' : 'Labels: OFF')
      },

      cycleTimeSpeed: () => {
        const speeds = [0.5, 1, 2, 4]
        const current = get().controls.timeSpeed
        const idx = speeds.indexOf(current)
        const next = speeds[(idx + 1) % speeds.length]
        set((s) => ({
          controls: { ...s.controls, timeSpeed: next },
        }))
        get().pushLog(`Time speed: ${next}x`)
      },

      triggerScan: () => {
        set((s) => ({
          controls: { ...s.controls, scanActive: true },
        }))
        get().pushLog('▶ Scanning nearby objects...')
        setTimeout(() => {
          set((s) => ({
            controls: { ...s.controls, scanActive: false },
          }))
          get().pushLog('Scan complete')
        }, 3000)
      },

      setScanActive: (v) =>
        set((s) => ({
          controls: { ...s.controls, scanActive: v },
        })),

      incrementClassifiedClicks: () => {
        const clicks = get().classifiedClicks + 1
        set({ classifiedClicks: clicks })
        if (clicks >= 5 && !get().classifiedUnlocked) {
          set({ classifiedUnlocked: true })
          get().pushLog('CLASSIFIED MODE UNLOCKED')
          get().unlockAchievement('easterEgg')
        }
      },

      resetControls: () => {
        set({
          controls: {
            radar: false,
            track: false,
        zoom: 0.4,
            orbits: true,
            labels: true,
            timeSpeed: 1,
            scanActive: false,
          },
          ship: { phase: 'idle', target: null, startTime: 0 },
          activePlanet: null,
          currentView: 'hub',
        })
        get().pushLog('System reset to defaults')
      },

      initiateTravel: (target) => {
        set({
          ship: { phase: 'locking', target, startTime: performance.now() },
        })
        get().pushLog(`Locking trajectory to ${target?.toUpperCase()}`)
      },

      arrive: () => {
        const target = get().ship.target
        const viewMap: Record<string, string> = {
          about: 'profile',
          techstack: 'techstack',
          projects: 'projects',
          missions: 'missions',
          learning: 'learning',
          comms: 'comms',
        }
        set((s) => ({
          ship: { ...s.ship, phase: 'arrived' },
          activePlanet: target,
          currentView: ((target && viewMap[target]) || 'hub') as ViewState,
        }))
        if (target) {
          get().addExploration(15)
          get().pushLog(`Entered ${target.toUpperCase()} sector`)
        }
      },

      initiateReturn: () => {
        set((s) => ({
          ship: { ...s.ship, phase: 'zoomOut', startTime: performance.now() },
        }))
        get().pushLog('Returning to orbit')
      },

      finishReturn: () => {
        set({
          ship: { phase: 'idle', target: null, startTime: 0 },
          activePlanet: null,
          currentView: 'hub',
        })
        get().pushLog('Returned to orbit')
      },

      resetState: () =>
        set({
          currentView: 'boot',
          exploration: 0,
          ship: { phase: 'idle', target: null, startTime: 0 },
          achievements: {
            firstVisit: false,
            hiddenTerminal: false,
            konamiCode: false,
            fullExploration: false,
            resumeDownloaded: false,
            easterEgg: false,
          },
        }),
    }),
    {
      name: 'portfolio-store',
      partialize: (state) => ({
        achievements: state.achievements,
        settings: state.settings,
        classifiedClicks: state.classifiedClicks,
        classifiedUnlocked: state.classifiedUnlocked,
      }),
    }
  )
)
