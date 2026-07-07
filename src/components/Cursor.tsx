import { useEffect, useRef } from 'react'

export function Cursor() {
  const dotRef = useRef<HTMLDivElement>(null)
  const ringRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    let mx = 0, my = 0
    let dx = 0, dy = 0

    const onMove = (e: MouseEvent) => {
      mx = e.clientX
      my = e.clientY
      if (dotRef.current) {
        dotRef.current.style.transform = `translate(${mx - 3}px, ${my - 3}px)`
      }
    }

    const loop = () => {
      dx += (mx - dx) * 0.15
      dy += (my - dy) * 0.15
      if (ringRef.current) {
        ringRef.current.style.transform = `translate(${dx - 10}px, ${dy - 10}px)`
      }
      requestAnimationFrame(loop)
    }

    window.addEventListener('mousemove', onMove)
    const raf = requestAnimationFrame(loop)
    return () => {
      window.removeEventListener('mousemove', onMove)
      cancelAnimationFrame(raf)
    }
  }, [])

  return (
    <>
      {/* Real cursor hidden */}
      <style>{`* { cursor: none !important; }`}</style>
      {/* Core dot — below cockpit panels (z-40) but above canvas */}
      <div
        ref={dotRef}
        className="fixed top-0 left-0 z-[35] pointer-events-none"
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
        className="fixed top-0 left-0 z-[35] pointer-events-none"
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
