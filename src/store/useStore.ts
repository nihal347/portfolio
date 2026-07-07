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
}

export const useStore = create<AppState>()(
  persist(
    (set, get) => ({
      currentView: 'boot',
      activePlanet: null,
      exploration: 0,
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
        soundEnabled: false,
        simpleView: false,
      },

      setActivePlanet: (planet) => set({ activePlanet: planet }),
      setView: (view) => set({ currentView: view }),

      pushLog: (msg) =>
        set((s) => ({
          log: [...s.log.slice(-19), { msg, time: Date.now() }],
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

      toggleSound: () =>
        set((s) => ({
          settings: { ...s.settings, soundEnabled: !s.settings.soundEnabled },
        })),

      toggleSimpleView: () =>
        set((s) => ({
          settings: { ...s.settings, simpleView: !s.settings.simpleView },
        })),

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

      initiateTravel: (target) => {
        const s = get()
        if (!target) return
        // Cancel any in-progress transition and start fresh
        if (s.ship.phase !== 'idle' && s.ship.phase !== 'arrived') {
          get().pushLog('sys: aborting previous trajectory')
        }
        const label = target.toUpperCase()
        get().pushLog(`sys: engaging thrusters → ${label}`)
        set({
          ship: { phase: 'locking', target, startTime: performance.now() },
        })
      },

      arrive: () => {
        const s = get()
        const target = s.ship.target
        if (!target) return
        const viewMap: Record<string, ViewState> = { about: 'profile', techstack: 'techstack', projects: 'projects', missions: 'missions', learning: 'learning', comms: 'comms' }
        const view = viewMap[target] || 'hub'
        get().pushLog(`sys: arrived at ${target.toUpperCase()}`)
        set({
          ship: { phase: 'arrived', target, startTime: performance.now() },
          activePlanet: target,
          currentView: view,
        })
        setTimeout(() => {
          set({ ship: { phase: 'idle', target: null, startTime: 0 } })
        }, 100)
      },

      initiateReturn: () => {
        const s = get()
        if (s.ship.phase !== 'idle') return
        get().pushLog('sys: returning to orbit...')
        set({
          ship: { phase: 'zoomOut', target: null, startTime: performance.now() },
        })
      },

      finishReturn: () => {
        set({
          ship: { phase: 'idle', target: null, startTime: 0 },
          activePlanet: null,
          currentView: 'hub',
        })
        get().pushLog('sys: orbit established')
      },
    }),
    {
      name: 'jacked-in-storage',
      partialize: (state) => ({
        achievements: state.achievements,
        settings: state.settings,
      }),
    }
  )
)
