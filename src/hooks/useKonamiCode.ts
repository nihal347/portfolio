import { useEffect, useState } from 'react'

const KONAMI_CODE = [
  'ArrowUp', 'ArrowUp', 'ArrowDown', 'ArrowDown', 
  'ArrowLeft', 'ArrowRight', 'ArrowLeft', 'ArrowRight', 
  'b', 'a'
]

export function useKonamiCode(onUnlock: () => void) {
  const [, setInputSequence] = useState<string[]>([])

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Create new sequence by appending latest key and keeping length bounded
      setInputSequence(prev => {
        const next = [...prev, e.key]
        if (next.length > KONAMI_CODE.length) {
          next.shift()
        }
        
        // Check match
        const isMatch = KONAMI_CODE.every((key, index) => key === next[index])
        if (isMatch) {
          onUnlock()
          return [] // reset
        }
        
        return next
      })
    }
    
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [onUnlock])
}
