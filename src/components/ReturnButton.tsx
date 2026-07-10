import { useStore } from '../store/useStore'
import { RotateCcw } from 'lucide-react'

export function ReturnButton({ color = 'rgba(57,255,143,0.6)' }: { color?: string }) {
  const { initiateReturn } = useStore()

  return (
    <button
      onClick={initiateReturn}
      className="fixed bottom-4 left-1/2 -translate-x-1/2 z-[100] flex items-center gap-2 px-6 py-3.5 border font-pixel text-[10px] tracking-wider transition-all duration-300 cursor-pointer hover:scale-105 min-h-[44px]"
      style={{
        borderColor: color,
        background: 'rgba(2,3,8,0.95)',
        color: color,
        backdropFilter: 'blur(8px)',
        boxShadow: `0 0 20px ${color}33`,
      }}
      onMouseEnter={e => {
        e.currentTarget.style.background = `${color}22`
        e.currentTarget.style.boxShadow = `0 0 30px ${color}55`
      }}
      onMouseLeave={e => {
        e.currentTarget.style.background = 'rgba(2,3,8,0.95)'
        e.currentTarget.style.boxShadow = `0 0 20px ${color}33`
      }}
    >
      <RotateCcw size={12} />
      RETURN TO ORBIT
    </button>
  )
}
