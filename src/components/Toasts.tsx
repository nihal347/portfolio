import { useEffect, useState } from 'react'
import { useStore } from '../store/useStore'
import { Trophy } from 'lucide-react'

export function Toasts() {
  const { achievements } = useStore()
  const [activeToasts, setActiveToasts] = useState<{id: string, title: string, desc: string}[]>([])

  const [prev, setPrev] = useState(achievements)

  useEffect(() => {
    const newToasts: typeof activeToasts = []
    
    if (achievements.firstVisit && !prev.firstVisit) {
      newToasts.push({ id: 'firstVisit', title: 'ACHIEVEMENT UNLOCKED', desc: 'Boot Sequence Complete' })
    }
    if (achievements.hiddenTerminal && !prev.hiddenTerminal) {
      newToasts.push({ id: 'hiddenTerminal', title: 'ACHIEVEMENT UNLOCKED', desc: 'Found the Hidden Terminal' })
    }
    if (achievements.konamiCode && !prev.konamiCode) {
      newToasts.push({ id: 'konamiCode', title: 'ACHIEVEMENT UNLOCKED', desc: '30 Lives Granted (Konami Code)' })
    }
    if (achievements.fullExploration && !prev.fullExploration) {
      newToasts.push({ id: 'fullExploration', title: 'ACHIEVEMENT UNLOCKED', desc: '100% Memory Explored' })
    }
    if (achievements.resumeDownloaded && !prev.resumeDownloaded) {
      newToasts.push({ id: 'resumeDownloaded', title: 'ACHIEVEMENT UNLOCKED', desc: 'Resume Obtained' })
    }

    if (newToasts.length > 0) {
      setActiveToasts(current => [...current, ...newToasts])
      
      newToasts.forEach(t => {
        setTimeout(() => {
          setActiveToasts(current => current.filter(x => x.id !== t.id))
        }, 5000)
      })
    }
    
    setPrev(achievements)
  }, [achievements, prev])

  if (activeToasts.length === 0) return null

  return (
    <div className="fixed bottom-4 right-4 md:bottom-8 md:right-8 z-[70] flex flex-col gap-2 pointer-events-none">
      {activeToasts.map(toast => (
        <div key={toast.id} className="bg-black/95 border border-yellow-500/50 p-4 shadow-[0_0_15px_rgba(234,179,8,0.2)] flex items-center gap-4 animate-fade-in text-yellow-500 font-mono w-[300px]">
            <Trophy size={24} className="animate-bounce" />
            <div>
                <h4 className="font-pixel text-[8px] text-white mb-1 leading-relaxed">{toast.title}</h4>
                <p className="text-xs">{toast.desc}</p>
            </div>
        </div>
      ))}
    </div>
  )
}
