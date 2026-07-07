import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export type ViewState = 'boot' | 'hub' | 'profile' | 'missions' | 'comms'
export type PlanetType = 'comms' | 'profile' | 'missions' | null

interface AppState {
  currentView: ViewState
  activePlanet: PlanetType
  zoomTransition: { active: boolean; phase: 'zooming' | 'zooming-out' | 'arrived' | 'idle' }
  exploration: number
  achievements: {
    firstVisit: boolean
    hiddenTerminal: boolean
    konamiCode: boolean
    fullExploration: boolean
    resumeDownloaded: boolean
  }
  settings: {
    soundEnabled: boolean
    simpleView: boolean
  }
  
  // Actions
  setView: (view: ViewState) => void
  setActivePlanet: (planet: PlanetType) => void
  setZoomTransition: (t: { active: boolean; phase: 'zooming' | 'zooming-out' | 'arrived' | 'idle' }) => void
  addExploration: (amount: number) => void
  unlockAchievement: (key: keyof AppState['achievements']) => void
  toggleSound: () => void
  toggleSimpleView: () => void
  resetState: () => void
  
  // UI Overlays
  commsOpen: boolean
  setCommsOpen: (isOpen: boolean) => void
  flightPanel: { isOpen: boolean, title: string, targetView: ViewState | null }
  setFlightPanel: (panel: { isOpen: boolean, title: string, targetView: ViewState | null }) => void
}

export const useStore = create<AppState>()(
  persist(
    (set, get) => ({
      currentView: 'boot',
      activePlanet: null,
      zoomTransition: { active: false, phase: 'idle' },
      commsOpen: false,
      flightPanel: { isOpen: false, title: '', targetView: null },
      exploration: 0,
      achievements: {
        firstVisit: false,
        hiddenTerminal: false,
        konamiCode: false,
        fullExploration: false,
        resumeDownloaded: false
      },
      settings: {
        soundEnabled: false,
        simpleView: false
      },
      
      setCommsOpen: (isOpen) => set({ commsOpen: isOpen }),
      setFlightPanel: (panel) => set({ flightPanel: panel }),
      setActivePlanet: (planet) => set({ activePlanet: planet }),
      setZoomTransition: (t) => set({ zoomTransition: t }),
      
      setView: (view) => set({ currentView: view }),
      addExploration: (amount) => {
        const current = get().exploration;
        if (current >= 100) return;
        const next = Math.min(100, current + amount);
        set({ exploration: next });
        if (next === 100 && !get().achievements.fullExploration) {
          get().unlockAchievement('fullExploration');
        }
      },
      unlockAchievement: (key) => set((state) => ({
        achievements: { ...state.achievements, [key]: true }
      })),
      toggleSound: () => set((state) => ({
        settings: { ...state.settings, soundEnabled: !state.settings.soundEnabled }
      })),
      toggleSimpleView: () => set((state) => ({
        settings: { ...state.settings, simpleView: !state.settings.simpleView }
      })),
      resetState: () => set({
        currentView: 'boot',
        exploration: 0,
        achievements: { firstVisit: false, hiddenTerminal: false, konamiCode: false, fullExploration: false, resumeDownloaded: false }
      })
    }),
    {
      name: 'jacked-in-storage',
      partialize: (state) => ({ 
        achievements: state.achievements, 
        settings: state.settings 
      }),
    }
  )
)
