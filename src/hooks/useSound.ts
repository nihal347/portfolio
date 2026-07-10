import { useStore } from '../store/useStore'

// Shared AudioContext to avoid browser limit of ~6-8 contexts
let sharedCtx: AudioContext | null = null

function getAudioContext(): AudioContext | null {
  if (sharedCtx && sharedCtx.state !== 'closed') return sharedCtx
  try {
    const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext
    if (!AudioContextClass) return null
    sharedCtx = new AudioContextClass()
    return sharedCtx
  } catch {
    return null
  }
}

// Simple Web Audio API synthesizer for retro sound effects
export function playBeep(freq = 440, type: OscillatorType = 'square', duration = 0.1, vol = 0.1) {
  const { settings } = useStore.getState()
  if (!settings.soundEnabled) return

  try {
      const ctx = getAudioContext()
      if (!ctx) return
      
      const osc = ctx.createOscillator()
      const gain = ctx.createGain()
      
      osc.type = type
      osc.frequency.setValueAtTime(freq, ctx.currentTime)
      
      gain.gain.setValueAtTime(vol, ctx.currentTime)
      gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + duration)
      
      osc.connect(gain)
      gain.connect(ctx.destination)
      
      osc.start()
      osc.stop(ctx.currentTime + duration)
  } catch {
      // Ignore audio errors
  }
}

export function playHover() {
    playBeep(600, 'square', 0.05, 0.02)
}

export function playClick() {
    playBeep(1200, 'square', 0.05, 0.05)
    setTimeout(() => playBeep(1800, 'square', 0.1, 0.05), 50)
}

let engineOsc: OscillatorNode | null = null
let engineGain: GainNode | null = null

export function startEngine() {
    const { settings } = useStore.getState()
    if (!settings.soundEnabled) return
    if (engineOsc) return

    try {
        const ctx = getAudioContext()
        if (!ctx) return
        
        engineOsc = ctx.createOscillator()
        engineGain = ctx.createGain()
        
        engineOsc.type = 'sawtooth'
        engineOsc.frequency.setValueAtTime(80, ctx.currentTime)
        
        engineGain.gain.setValueAtTime(0, ctx.currentTime)
        engineGain.gain.linearRampToValueAtTime(0.06, ctx.currentTime + 0.5)
        
        engineOsc.connect(engineGain)
        engineGain.connect(ctx.destination)
        
        engineOsc.start()
    } catch {
        // Ignore audio errors
    }
}

export function stopEngine() {
    if (engineOsc && engineGain) {
        try {
            const ctx = engineOsc.context
            engineGain.gain.linearRampToValueAtTime(0, ctx.currentTime + 0.3)
            setTimeout(() => {
                engineOsc?.stop()
                engineOsc = null
                engineGain = null
            }, 350)
        } catch {
            engineOsc = null
            engineGain = null
        }
    }
}
