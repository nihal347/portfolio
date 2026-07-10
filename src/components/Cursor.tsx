import { useEffect, useRef } from 'react'

export function Cursor() {
  const dotRef = useRef<HTMLDivElement>(null)
  const ringRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    let mx = 0, my = 0
    let dx = 0, dy = 0
    let rafId = 0
    let active = true

    const onMove = (e: MouseEvent) => {
      mx = e.clientX
      my = e.clientY
      if (dotRef.current) {
        dotRef.current.style.transform = `translate(${mx - 3}px, ${my - 3}px)`
      }
    }

    const loop = () => {
      if (!active) return
      dx += (mx - dx) * 0.15
      dy += (my - dy) * 0.15
      if (ringRef.current) {
        ringRef.current.style.transform = `translate(${dx - 10}px, ${dy - 10}px)`
      }
      rafId = requestAnimationFrame(loop)
    }

    window.addEventListener('mousemove', onMove)
    rafId = requestAnimationFrame(loop)
    return () => {
      active = false
      window.removeEventListener('mousemove', onMove)
      cancelAnimationFrame(rafId)
    }
  }, [])

  return (
    <>
      {/* Real cursor hidden */}
      <style>{`* { cursor: none !important; }`}</style>
      {/* Core dot — on top of everything */}
      <div
        ref={dotRef}
        className="fixed top-0 left-0 z-[9999] pointer-events-none"
        style={{
          width: 6,
          height: 6,
          background: '#39ff8f',
          boxShadow: '0 0 6px #39ff8f, 0 0 12px rgba(57,255,143,0.4)',
        }}
      />
      {/* Trailing ring */}
      <div
        ref={ringRef}
        className="fixed top-0 left-0 z-[9999] pointer-events-none"
        style={{
          width: 20,
          height: 20,
          border: '1.5px solid rgba(57,255,143,0.5)',
          boxShadow: '0 0 6px rgba(57,255,143,0.2)',
        }}
      />
    </>
  )
}
