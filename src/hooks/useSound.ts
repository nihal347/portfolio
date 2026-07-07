import { useStore } from '../store/useStore'

// Simple Web Audio API synthesizer for retro sound effects
export function playBeep(freq = 440, type: OscillatorType = 'square', duration = 0.1, vol = 0.1) {
  const { settings } = useStore.getState()
  if (!settings.soundEnabled) return

  try {
      const AudioContext = window.AudioContext || (window as any).webkitAudioContext
      if (!AudioContext) return
      
      const ctx = new AudioContext()
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
  } catch (e) {
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
