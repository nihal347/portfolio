import { useState, useRef, useEffect, useCallback } from 'react'
import { useStore } from '../store/useStore'
import { playBeep } from '../hooks/useSound'

interface TerminalLine {
  text: string
  type: 'input' | 'output' | 'error' | 'system'
}

const COMMANDS: Record<string, (args: string[]) => TerminalLine[]> = {
  help: () => [
    { text: '╔══════════════════════════════════════════╗', type: 'system' },
    { text: '║       TERMINAL v1.0 — COMMAND LIST       ║', type: 'system' },
    { text: '╚══════════════════════════════════════════╝', type: 'system' },
    { text: '', type: 'output' },
    { text: '  help       — Show this command list', type: 'output' },
    { text: '  scan       — Scan nearby celestial bodies', type: 'output' },
    { text: '  status     — Ship system status', type: 'output' },
    { text: '  clear      — Clear terminal buffer', type: 'output' },
    { text: '  time       — Show current time', type: 'output' },
    { text: '  goto <x>   — Navigate to a planet', type: 'output' },
    { text: '  resume     — Download pilot resume', type: 'output' },
    { text: '  github     — Open GitHub profile', type: 'output' },
    { text: '  linkedin   — Open LinkedIn profile', type: 'output' },
    { text: '', type: 'output' },
    { text: '  Planets: about, tech, projects, missions, learning, comms', type: 'system' },
  ],

  scan: () => {
    const store = useStore.getState()
    store.triggerScan()
    return [
      { text: '▶ INITIATING DEEP SCAN...', type: 'system' },
      { text: '', type: 'output' },
      { text: '  [■■■■■■■■■■■■■■■■■■■■] 100%', type: 'system' },
      { text: '', type: 'output' },
      { text: '  ORBIT 70  — MERCURY-CLASS  │ ABOUT ME      │ STATUS: MAPPED', type: 'output' },
      { text: '  ORBIT 120 — VENUS-CLASS    │ TECH STACK    │ STATUS: MAPPED', type: 'output' },
      { text: '  ORBIT 175 — EARTH-CLASS    │ PROJECTS      │ STATUS: MAPPED', type: 'output' },
      { text: '  ORBIT 230 — JUPITER-CLASS  │ MISSIONS      │ STATUS: MAPPED', type: 'output' },
      { text: '  ORBIT 320 — SATURN-CLASS   │ LEARNING      │ STATUS: MAPPED', type: 'output' },
      { text: '  ORBIT 400 — COMM-RELAY     │ COMMS         │ STATUS: ONLINE', type: 'output' },
      { text: '', type: 'output' },
      { text: '  SCAN COMPLETE — 6 BODIES DETECTED', type: 'system' },
    ]
  },

  goto: (args) => {
    const planetMap: Record<string, string> = {
      about: 'about',
      profile: 'about',
      mercury: 'about',
      tech: 'techstack',
      techstack: 'techstack',
      venus: 'techstack',
      projects: 'projects',
      earth: 'projects',
      missions: 'missions',
      jupiter: 'missions',
      learning: 'learning',
      saturn: 'learning',
      comms: 'comms',
      comm: 'comms',
    }

    const target = args[0]?.toLowerCase()
    if (!target) {
      return [
        { text: 'ERROR: Specify destination. Usage: goto <planet>', type: 'error' },
        { text: '  Planets: about, tech, projects, missions, learning, comms', type: 'system' },
      ]
    }

    const planet = planetMap[target]
    if (!planet) {
      return [
        { text: `ERROR: Unknown destination "${target}"`, type: 'error' },
        { text: '  Use "scan" to list available planets.', type: 'system' },
      ]
    }

    // Trigger navigation
    const store = useStore.getState()
    if (store.ship.phase === 'idle' || store.ship.phase === 'arrived') {
      store.initiateTravel(planet as any)
      return [
        { text: `▶ LOCKING TRAJECTORY TO ${target.toUpperCase()}...`, type: 'system' },
        { text: '  Engaging thrusters. Stand by.', type: 'output' },
      ]
    }

    return [
      { text: 'ERROR: Ship already in transit.', type: 'error' },
    ]
  },

  about: () => {
    const store = useStore.getState()
    if (store.ship.phase === 'idle' || store.ship.phase === 'arrived') {
      store.initiateTravel('about')
      return [
        { text: '▶ NAVIGATING TO ABOUT ME...', type: 'system' },
      ]
    }
    return [{ text: 'ERROR: Ship in transit.', type: 'error' }]
  },

  projects: () => {
    const store = useStore.getState()
    if (store.ship.phase === 'idle' || store.ship.phase === 'arrived') {
      store.initiateTravel('projects')
      return [
        { text: '▶ NAVIGATING TO PROJECTS...', type: 'system' },
      ]
    }
    return [{ text: 'ERROR: Ship in transit.', type: 'error' }]
  },

  tech: () => {
    const store = useStore.getState()
    if (store.ship.phase === 'idle' || store.ship.phase === 'arrived') {
      store.initiateTravel('techstack')
      return [
        { text: '▶ NAVIGATING TO TECH STACK...', type: 'system' },
      ]
    }
    return [{ text: 'ERROR: Ship in transit.', type: 'error' }]
  },

  learning: () => {
    const store = useStore.getState()
    if (store.ship.phase === 'idle' || store.ship.phase === 'arrived') {
      store.initiateTravel('learning')
      return [
        { text: '▶ NAVIGATING TO LEARNING...', type: 'system' },
      ]
    }
    return [{ text: 'ERROR: Ship in transit.', type: 'error' }]
  },

  comms: () => {
    const store = useStore.getState()
    if (store.ship.phase === 'idle' || store.ship.phase === 'arrived') {
      store.initiateTravel('comms')
      return [
        { text: '▶ OPENING COMM CHANNEL...', type: 'system' },
      ]
    }
    return [{ text: 'ERROR: Ship in transit.', type: 'error' }]
  },

  resume: () => [
    { text: '▶ INITIATING DOWNLOAD...', type: 'system' },
    { text: '  Opening resume.pdf...', type: 'output' },
    { text: '  DOWNLOAD COMPLETE', type: 'system' },
  ],

  contact: () => {
    const store = useStore.getState()
    if (store.ship.phase === 'idle' || store.ship.phase === 'arrived') {
      store.initiateTravel('comms')
      return [
        { text: '▶ OPENING COMMS PANEL...', type: 'system' },
      ]
    }
    return [{ text: 'ERROR: Ship in transit.', type: 'error' }]
  },

  clear: () => [],

  status: () => [
    { text: '╔══════════════════════════════════════════╗', type: 'system' },
    { text: '║          SHIP SYSTEM STATUS              ║', type: 'system' },
    { text: '╚══════════════════════════════════════════╝', type: 'system' },
    { text: '', type: 'output' },
    { text: '  [■■■■■■■■■■] HULL        100%', type: 'output' },
    { text: '  [■■■■■■■■■■] SHIELDS     100%', type: 'output' },
    { text: '  [■■■■■■■■■■] WEAPONS     100%', type: 'output' },
    { text: '  [■■■■■■■■■■] ENGINES     100%', type: 'output' },
    { text: '  [■■■■■■■■■■] SENSORS     100%', type: 'output' },
    { text: '  [■■■■■■■■■■] COMMS       100%', type: 'output' },
    { text: '', type: 'output' },
    { text: '  ALL SYSTEMS NOMINAL', type: 'system' },
  ],

  whoami: () => [
    { text: '▶ PILOT DOSSIER', type: 'system' },
    { text: '', type: 'output' },
    { text: '  NAME:        Nihal', type: 'output' },
    { text: '  RANK:        AI Engineer', type: 'output' },
    { text: '  VESSEL:      PORTFOLIO-CLASS', type: 'output' },
    { text: '  MISSION:     Explore. Learn. Build.', type: 'output' },
  ],

  time: () => {
    const now = new Date()
    const ts = now.toLocaleTimeString('en-US', { hour12: false })
    const ds = now.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })
    return [
      { text: '▶ SHIP CLOCK', type: 'system' },
      { text: '', type: 'output' },
      { text: `  TIME:   ${ts}`, type: 'output' },
      { text: `  DATE:   ${ds}`, type: 'output' },
      { text: `  UPTIME: ${Math.floor((Date.now() - performance.timeOrigin) / 1000)}s`, type: 'output' },
    ]
  },

  github: () => [
    { text: '▶ OPENING GITHUB...', type: 'system' },
    { text: '  Launching github.com/nihal...', type: 'output' },
  ],

  linkedin: () => [
    { text: '▶ OPENING LINKEDIN...', type: 'system' },
    { text: '  Launching linkedin.com/in/nihal...', type: 'output' },
  ],
}

export default function Terminal() {
  const { terminalOpen, toggleTerminal } = useStore()
  const [lines, setLines] = useState<TerminalLine[]>([
    { text: '╔══════════════════════════════════════════╗', type: 'system' },
    { text: '║    PORTFOLIO TERMINAL v1.0               ║', type: 'system' },
    { text: '║    Type "help" for commands              ║', type: 'system' },
    { text: '╚══════════════════════════════════════════╝', type: 'system' },
    { text: '', type: 'output' },
  ])
  const [input, setInput] = useState('')
  const [history, setHistory] = useState<string[]>([])
  const [historyIndex, setHistoryIndex] = useState(-1)
  const endRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [lines])

  useEffect(() => {
    if (terminalOpen) {
      setTimeout(() => inputRef.current?.focus(), 100)
    }
  }, [terminalOpen])

  const processCommand = useCallback((cmd: string) => {
    const trimmed = cmd.trim()
    if (!trimmed) return

    const parts = trimmed.split(/\s+/)
    const command = parts[0].toLowerCase()
    const args = parts.slice(1)

    playBeep(800, 'square', 0.08, 0.05)

    setHistory(h => [...h, trimmed])
    setHistoryIndex(-1)

    const outputLines = COMMANDS[command]?.(args)
    if (outputLines) {
      if (command === 'clear') {
        setLines([])
      } else {
        setLines(prev => [
          ...prev,
          { text: `$ ${trimmed}`, type: 'input' },
          ...outputLines,
          { text: '', type: 'output' },
        ])
      }
    } else {
      setLines(prev => [
        ...prev,
        { text: `$ ${trimmed}`, type: 'input' },
        { text: `ERROR: Unknown command "${command}"`, type: 'error' },
        { text: '  Type "help" for available commands.', type: 'system' },
        { text: '', type: 'output' },
      ])
    }

    setInput('')
  }, [])

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      processCommand(input)
    } else if (e.key === 'ArrowUp') {
      e.preventDefault()
      if (history.length > 0) {
        const newIndex = historyIndex < history.length - 1 ? historyIndex + 1 : historyIndex
        setHistoryIndex(newIndex)
        setInput(history[history.length - 1 - newIndex])
      }
    } else if (e.key === 'ArrowDown') {
      e.preventDefault()
      if (historyIndex > 0) {
        const newIndex = historyIndex - 1
        setHistoryIndex(newIndex)
        setInput(history[history.length - 1 - newIndex])
      } else {
        setHistoryIndex(-1)
        setInput('')
      }
    } else if (e.key === 'Escape') {
      toggleTerminal()
    }
  }

  if (!terminalOpen) return null

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center bg-black/70 backdrop-blur-sm">
      <div className="w-[700px] max-w-[90vw] h-[500px] max-h-[80vh] flex flex-col bg-[#0a0f1c] border border-[#39ff8f]/40 rounded shadow-[0_0_30px_rgba(57,255,143,0.15)]">
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-2 border-b border-[#39ff8f]/30">
          <span className="text-[#39ff8f] text-[8px] tracking-widest font-['Press_Start_2P']">
            TERMINAL
          </span>
          <button
            onClick={toggleTerminal}
            className="text-[#39ff8f] hover:text-[#ff3939] text-[10px] font-['Press_Start_2P'] transition-colors"
          >
            [X]
          </button>
        </div>

        {/* Output */}
        <div className="flex-1 overflow-y-auto p-4 font-['JetBrains_Mono'] text-xs leading-relaxed">
          {lines.map((line, i) => (
            <div
              key={i}
              className={`whitespace-pre font-mono ${
                line.type === 'input'
                  ? 'text-[#39ff8f]'
                  : line.type === 'error'
                  ? 'text-[#ff3939]'
                  : line.type === 'system'
                  ? 'text-[#39ff8f]/70'
                  : 'text-[#39ff8f]/50'
              }`}
            >
              {line.text}
            </div>
          ))}
          <div ref={endRef} />
        </div>

        {/* Input */}
        <div className="flex items-center px-4 py-3 border-t border-[#39ff8f]/30 bg-[#060a14]">
          <span className="text-[#39ff8f] mr-2 text-xs font-['JetBrains_Mono']">$</span>
          <input
            ref={inputRef}
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            className="flex-1 bg-transparent text-[#39ff8f] text-xs font-['JetBrains_Mono'] outline-none caret-[#39ff8f]"
            placeholder="Type a command..."
            spellCheck={false}
            autoComplete="off"
          />
        </div>
      </div>
    </div>
  )
}
