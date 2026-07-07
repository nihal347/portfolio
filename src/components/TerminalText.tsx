import { useState, useEffect } from 'react'

interface TerminalTextProps {
  text: string
  speed?: number
  delay?: number
  onComplete?: () => void
  className?: string
  as?: React.ElementType
  glitch?: boolean
  showCursor?: boolean
}

export function TerminalText({ 
  text, 
  speed = 30, 
  delay = 0, 
  onComplete,
  className = '',
  as: Component = 'span',
  glitch = false,
  showCursor = true
}: TerminalTextProps) {
  const [displayedText, setDisplayedText] = useState('')
  const [isTyping, setIsTyping] = useState(false)
  const prefersReducedMotion = typeof window !== 'undefined' 
    ? window.matchMedia('(prefers-reduced-motion: reduce)').matches 
    : false
  
  useEffect(() => {
    let timeoutId: number
    let currentIndex = 0
    let isCancelled = false

    const typeChar = () => {
      if (isCancelled) return
      
      if (currentIndex < text.length) {
        setDisplayedText(text.substring(0, currentIndex + 1))
        currentIndex++
        // Randomize speed slightly for realism
        const nextSpeed = speed + (Math.random() * 20 - 10)
        timeoutId = window.setTimeout(typeChar, nextSpeed)
      } else {
        setIsTyping(false)
        if (onComplete) onComplete()
      }
    }

    timeoutId = window.setTimeout(() => {
      setIsTyping(true)
      typeChar()
    }, delay)

    return () => {
      isCancelled = true
      clearTimeout(timeoutId)
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [text, speed, delay])

  // Simple glitch effect
  const [glitchText, setGlitchText] = useState(text)
  useEffect(() => {
    if (!glitch || prefersReducedMotion || isTyping) return
    const glitchChars = '!<>-_\\/[]{}—=+*^?#_'
    
    const interval = setInterval(() => {
      if (Math.random() > 0.95) { // 5% chance to glitch
        const charArray = text.split('')
        const glitchIndex = Math.floor(Math.random() * charArray.length)
        if (charArray[glitchIndex] !== ' ' && charArray[glitchIndex] !== '\n') {
            charArray[glitchIndex] = glitchChars[Math.floor(Math.random() * glitchChars.length)]
            setGlitchText(charArray.join(''))
            setTimeout(() => setGlitchText(text), 100)
        }
      }
    }, 200)
    
    return () => clearInterval(interval)
  }, [text, glitch, isTyping, prefersReducedMotion])

  return (
    <Component className={`whitespace-pre-wrap ${className}`}>
      {glitch && !isTyping ? glitchText : displayedText}
      {(isTyping || (!isTyping && showCursor)) && (
        <span className="animate-blink inline-block w-[0.5em] h-[1em] ml-1 align-middle opacity-80" style={{ background: 'var(--color-term-green)', boxShadow: '0 0 8px rgba(0,255,65,0.8)' }}></span>
      )}
    </Component>
  )
}
