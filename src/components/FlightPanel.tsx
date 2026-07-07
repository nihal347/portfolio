import { useStore } from '../store/useStore'
import { TerminalText } from './TerminalText'

export function FlightPanel() {
  const { flightPanel } = useStore()
  
  if (!flightPanel.isOpen) return null;
  
  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center flex-col" style={{ background: 'rgba(2,4,10,0.95)' }}>
      <h2 className="font-pixel text-[16px] tracking-[1px] mb-[18px] mt-8 text-center" style={{ color: 'var(--color-cyan)', textShadow: '0 0 14px rgba(77,243,255,0.8)' }}>
        {flightPanel.title}
      </h2>
      
      <div className="flex items-center justify-center h-32" style={{ color: 'var(--color-term-green)' }}>
        <TerminalText text="> ENGAGING WARP DRIVE..." speed={25} />
      </div>
      
      <div className="mt-8 w-64 h-1 overflow-hidden" style={{ background: 'rgba(77,243,255,0.2)' }}>
        <div className="h-full animate-pulse" style={{ width: '60%', background: 'var(--color-cyan)', animation: 'loading 1s ease-in-out infinite' }} />
      </div>
      
      <style>{`
        @keyframes loading {
          0% { transform: translateX(-100%); }
          100% { transform: translateX(200%); }
        }
      `}</style>
    </div>
  )
}
