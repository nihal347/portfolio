import { useRef, useEffect } from 'react'
import { useStore } from '../store/useStore'
import { playClick } from '../hooks/useSound'

export function SystemLog() {
  const logsOpen = useStore(s => s.logsOpen)
  const toggleLogs = useStore(s => s.toggleLogs)
  const log = useStore(s => s.log)
  const endRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [log, logsOpen])

  if (!logsOpen) return null

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center bg-black/60 backdrop-blur-sm">
      <div className="w-[500px] max-w-[90vw] h-[400px] max-h-[70vh] flex flex-col bg-[#0a0f1c] border border-[#39ff8f]/30 rounded shadow-[0_0_30px_rgba(57,255,143,0.1)]">
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-2 border-b border-[#39ff8f]/20">
          <span className="text-[#39ff8f] text-[8px] tracking-widest font-['Press_Start_2P']">
            SYSTEM LOG
          </span>
          <button
            onClick={() => { playClick(); toggleLogs() }}
            className="text-[#39ff8f] hover:text-[#ff3939] text-[10px] font-['Press_Start_2P'] transition-colors"
          >
            [X]
          </button>
        </div>

        {/* Log entries */}
        <div className="flex-1 overflow-y-auto p-4 font-['JetBrains_Mono'] text-[10px] leading-relaxed">
          {log.map((entry, i) => {
            const d = new Date(entry.time)
            const ts = `${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}:${String(d.getSeconds()).padStart(2, '0')}`
            const isSystem = entry.msg.startsWith('sys:') || entry.msg.startsWith('▶')
            const isError = entry.msg.startsWith('ERROR')
            return (
              <div key={i} className={`flex gap-2 mb-1 ${isError ? 'text-[#ff3939]' : isSystem ? 'text-[#39ff8f]/70' : 'text-[#39ff8f]/50'}`}>
                <span className="text-[#39ff8f]/30 shrink-0">[{ts}]</span>
                <span>{entry.msg}</span>
              </div>
            )
          })}
          <div ref={endRef} />
        </div>

        {/* Footer */}
        <div className="px-4 py-2 border-t border-[#39ff8f]/20 text-[7px] text-[#39ff8f]/40 font-['JetBrains_Mono']">
          {log.length} ENTRIES RECORDED
        </div>
      </div>
    </div>
  )
}
