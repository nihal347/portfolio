import { useState, useEffect, useRef } from 'react'
import { useStore } from '../store/useStore'

export function TerminalOverlay() {
  const [isOpen, setIsOpen] = useState(false)
  const [input, setInput] = useState('')
  const [history, setHistory] = useState<{type: 'cmd'|'res', text: string}[]>([
    {type: 'res', text: 'NEXUS_OS Terminal v3.0.0\nType "help" for a list of commands.'}
  ])
  const { unlockAchievement, achievements } = useStore()
  
  const inputRef = useRef<HTMLInputElement>(null)
  const endRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === '`' || (e.ctrlKey && e.key === '\\')) {
        e.preventDefault()
        setIsOpen(prev => {
            const next = !prev;
            if (next && !achievements.hiddenTerminal) {
                unlockAchievement('hiddenTerminal')
            }
            return next;
        })
      }
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [unlockAchievement, achievements.hiddenTerminal])

  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 100)
    }
  }, [isOpen])

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [history])

  if (!isOpen) return null

  const handleCommand = (e: React.FormEvent) => {
    e.preventDefault()
    if (!input.trim()) return

    const cmd = input.trim().toLowerCase()
    setHistory(prev => [...prev, { type: 'cmd', text: `> ${input}` }])
    setInput('')
    
    let response = ''
    switch (cmd) {
      case 'help':
        response = 'Available commands:\n  help         - Show this message\n  whoami       - Display user identity\n  ls projects  - List available mission files\n  sudo hire-me - Grant elevated access to contact relay\n  clear        - Clear terminal output\n  exit         - Close terminal'
        break
      case 'whoami':
        response = 'user: guest_pilot\nclearance: low\nobjective: explore the portfolio\nstatus: motivated'
        break
      case 'ls projects':
        response = 'pomodoro_timer.py\nvoice_assistant.sh\ncapstone.py\nscrape_all.sh\nsiji_v0.1/'
        break
      case 'sudo hire-me':
        response = '[SUDO] Password for guest_pilot: *******\nAccess Granted.\nRedirecting to Comms_Relay... Please use the GUI to send your message. We look forward to working with you.'
        break
      case 'clear':
        setHistory([])
        return
      case 'exit':
        setIsOpen(false)
        return
      default:
        response = `Command not found: ${cmd}`
    }
    
    setTimeout(() => {
        setHistory(prev => [...prev, { type: 'res', text: response }])
    }, 100)
  }

  return (
    <div className="fixed inset-x-4 top-4 md:inset-x-[15%] h-[50vh] bg-black/90 border z-[60] p-4 font-mono text-sm md:text-base flex flex-col animate-fade-in" style={{ borderColor: 'rgba(57,255,143,0.5)', boxShadow: '0 0 20px rgba(0,255,65,0.2)', backdropFilter: 'blur(12px)', color: 'var(--color-term-green)' }}>
        <div className="flex justify-between items-center pb-2 mb-4" style={{ borderBottom: '1px solid rgba(57,255,143,0.3)' }}>
            <span className="font-pixel text-xs text-white">ROOT@NEXUS_OS ~</span>
            <button onClick={() => setIsOpen(false)} className="px-2 transition-colors cursor-pointer" style={{ color: 'var(--color-term-green)' }}
              onMouseEnter={e => { e.currentTarget.style.background = 'var(--color-term-green)'; e.currentTarget.style.color = '#000' }}
              onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = 'var(--color-term-green)' }}
            >X</button>
        </div>
        
        <div className="flex-1 overflow-y-auto custom-scrollbar pr-2">
            {history.map((h, i) => (
                <div key={i} className={`mb-2 ${h.type === 'cmd' ? 'text-white' : ''}`} style={h.type === 'res' ? { color: 'rgba(57,255,143,0.8)' } : undefined}>
                    <span className="whitespace-pre-wrap">{h.text}</span>
                </div>
            ))}
            <div ref={endRef} />
        </div>
        
        <form onSubmit={handleCommand} className="mt-4 flex items-center gap-2 pt-4" style={{ borderTop: '1px solid rgba(57,255,143,0.3)' }}>
            <span className="text-white">&gt;</span>
            <input 
                ref={inputRef}
                type="text" 
                value={input}
                onChange={e => setInput(e.target.value)}
                className="flex-1 bg-transparent outline-none text-white border-none"
                autoComplete="off"
                spellCheck="false"
            />
            <span className="animate-blink inline-block w-2 h-4 ml-1 align-middle" style={{ background: 'var(--color-term-green)' }}></span>
        </form>
    </div>
  )
}
