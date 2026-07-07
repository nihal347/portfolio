import { useEffect, useRef, useCallback } from 'react';
import { SpaceEngine } from './Engine';
import { useStore } from '../store/useStore';
import { playBeep } from '../hooks/useSound';

export function CanvasSpace() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const engineRef = useRef<SpaceEngine | null>(null);
  const animRef = useRef<number>(0);
  const zoomRef = useRef({
    scale: 1, targetX: 0, targetY: 0,
    active: false, direction: 'in' as 'in' | 'out',
    startTime: 0, planetName: ''
  });
  
  const addExploration = useStore(s => s.addExploration);
  const settings = useStore(s => s.settings);
  const unlockAchievement = useStore(s => s.unlockAchievement);
  const achievements = useStore(s => s.achievements);
  const setView = useStore(s => s.setView);
  const setActivePlanet = useStore(s => s.setActivePlanet);
  const setZoomTransition = useStore(s => s.setZoomTransition);
  const activePlanet = useStore(s => s.activePlanet);

  const zoom = zoomRef.current;

  // Expose zoomOut globally so pages can trigger it
  useEffect(() => {
    (window as any).__zoomOut = () => {
      if (zoom.active) return;
      zoom.active = true;
      zoom.direction = 'out';
      zoom.startTime = performance.now();
      zoom.scale = 5; // starts zoomed in
      setZoomTransition({ active: true, phase: 'zooming-out' });
      playBeep(440, 'sine', 0.15, 0.08);
      setTimeout(() => playBeep(330, 'sine', 0.2, 0.1), 200);
      setTimeout(() => playBeep(220, 'sawtooth', 0.3, 0.15), 400);
    };
    return () => { delete (window as any).__zoomOut; };
  }, [setZoomTransition, zoom]);

  const handleClick = useCallback((e: MouseEvent) => {
    if (settings.simpleView) return;
    if (zoom.active) return;
    
    const engine = engineRef.current;
    if (!engine) return;
    
    playBeep(440, 'square', 0.1, 0.05);
    
    const mx = e.clientX;
    const my = e.clientY;
    
    engine.bodies.forEach(b => {
      const d = Math.hypot(mx - b.x, my - b.y);
      if (d < b.radius + 15) {
        if (!achievements.firstVisit) {
          unlockAchievement('firstVisit');
        }
        addExploration(15);
        
        document.body.classList.add('glitch-active');
        setTimeout(() => document.body.classList.remove('glitch-active'), 180);
        
        if (b.name === 'comms') {
          useStore.getState().setCommsOpen(false);
        }
        
        {
          zoom.active = true;
          zoom.direction = 'in';
          zoom.startTime = performance.now();
          zoom.planetName = b.name;
          zoom.targetX = b.x;
          zoom.targetY = b.y;
          zoom.scale = 1;
          
          setZoomTransition({ active: true, phase: 'zooming' });
          playBeep(220, 'sawtooth', 0.3, 0.15);
          setTimeout(() => playBeep(330, 'sine', 0.2, 0.1), 300);
          setTimeout(() => playBeep(440, 'sine', 0.15, 0.08), 600);
        }
      }
    });
  }, [settings.simpleView, achievements.firstVisit, addExploration, unlockAchievement, setZoomTransition, zoom]);

  const handleMouseMove = useCallback((e: MouseEvent) => {
    if (settings.simpleView) return;
    const engine = engineRef.current;
    if (!engine) return;
    engine.setMousePos(e.clientX, e.clientY);
    const canvas = canvasRef.current;
    if (canvas) {
      if (engine.bodies.some(b => b.hover)) {
        canvas.classList.remove('no-planet-hover');
      } else {
        canvas.classList.add('no-planet-hover');
      }
    }
  }, [settings.simpleView]);

  useEffect(() => {
    if (!canvasRef.current) return;
    const canvas = canvasRef.current;
    
    const handleResize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
      if (engineRef.current) engineRef.current.resize();
    };
    handleResize();
    window.addEventListener('resize', handleResize);
    
    const engine = new SpaceEngine(canvas);
    engineRef.current = engine;
    
    window.addEventListener('mousemove', handleMouseMove);
    canvas.addEventListener('click', handleClick);

    let lastTime = performance.now();
    
    const loop = (time: number) => {
      const dt = Math.min((time - lastTime) / 1000, 0.05);
      lastTime = time;
      
      if (!settings.simpleView) {
        const ctx = engine.ctx;
        const W = canvas.width;
        const H = canvas.height;
        
        if (zoom.active) {
          const elapsed = time - zoom.startTime;
          const zoomDuration = 1400;
          const progress = Math.min(elapsed / zoomDuration, 1);
          
          const ease = progress < 0.5
            ? 4 * progress * progress * progress
            : 1 - Math.pow(-2 * progress + 2, 3) / 2;
          
          if (zoom.direction === 'in') {
            zoom.scale = 1 + ease * 4;
          } else {
            // Zoom out: from 5 → 1
            zoom.scale = 5 - ease * 4;
          }
          
          if (progress >= 1) {
            zoom.active = false;
            zoom.scale = 1;
            
            if (zoom.direction === 'in') {
              setActivePlanet(zoom.planetName as any);
              setZoomTransition({ active: false, phase: 'arrived' });
              setView(zoom.planetName as any);
            } else {
              // Zoom out complete
              setActivePlanet(null);
              setZoomTransition({ active: false, phase: 'idle' });
              setView('hub');
            }
            
            setTimeout(() => {
              setZoomTransition({ active: false, phase: 'idle' });
            }, 300);
          } else {
            // Draw zoomed view
            ctx.save();
            const centerX = zoom.direction === 'in' ? zoom.targetX : W / 2;
            const centerY = zoom.direction === 'in' ? zoom.targetY : H / 2;
            
            ctx.translate(W / 2, H / 2);
            ctx.scale(zoom.scale, zoom.scale);
            ctx.translate(-centerX, -centerY);
            
            engine.update(dt);
            if (zoom.direction === 'in') {
              engine.draw(time, false);
            } else {
              // Zooming out: draw the planet background shrinking back to orbit
              if (activePlanet) {
                engine.drawZoomedPlanet(activePlanet, time, 1);
              } else {
                engine.draw(time, false);
              }
            }
            ctx.restore();

            // Draw labels outside zoom transform so they stay in place
            const labelAlpha = zoom.direction === 'in' ? Math.max(0, 1 - ease * 1.5) : Math.min(1, ease * 2);
            if (labelAlpha > 0.01) {
              ctx.save();
              ctx.globalAlpha = labelAlpha;
              ctx.font = "8px 'Press Start 2P', monospace";
              ctx.textAlign = 'center';
              engine.bodies.forEach(b => {
                const labelY = b.y - b.radius - 16;
                const textWidth = ctx.measureText(b.label).width;
                ctx.fillStyle = 'rgba(0,0,0,0.5)';
                ctx.fillRect(b.x - textWidth/2 - 4, labelY - 8, textWidth + 8, 12);
                ctx.fillStyle = b.highlightColor;
                ctx.fillText(b.label, b.x, labelY);
              });
              ctx.restore();
            }
            
            // Speed lines
            ctx.save();
            ctx.globalAlpha = ease * 0.35;
            const lineCount = 24;
            for (let i = 0; i < lineCount; i++) {
              const angle = (i / lineCount) * Math.PI * 2;
              const innerR = Math.max(W, H) * 0.08 * ease;
              const outerR = Math.max(W, H) * (0.5 + ease * 0.5);
              
              ctx.strokeStyle = i % 2 === 0 ? 'rgba(77,243,255,0.25)' : 'rgba(255,255,255,0.12)';
              ctx.lineWidth = 1;
              ctx.beginPath();
              ctx.moveTo(W / 2 + Math.cos(angle) * innerR, H / 2 + Math.sin(angle) * innerR);
              ctx.lineTo(W / 2 + Math.cos(angle) * outerR, H / 2 + Math.sin(angle) * outerR);
              ctx.stroke();
            }
            ctx.restore();
            
            // Flash
            ctx.save();
            const flashAlpha = zoom.direction === 'in'
              ? Math.max(0, 0.25 - progress * 0.35)
              : Math.max(0, 0.15 - progress * 0.2);
            ctx.fillStyle = `rgba(255,255,255,${flashAlpha})`;
            ctx.fillRect(0, 0, W, H);
            ctx.restore();
          }
        } else if (activePlanet) {
          engine.update(dt);
          engine.drawZoomedPlanet(activePlanet, time, 1);
        } else {
          engine.update(dt);
          engine.draw(time);
        }
        
        const coordEl = document.getElementById('coord');
        if (coordEl) {
          coordEl.textContent = `${engine.ship.x.toFixed(1)}, ${engine.ship.y.toFixed(1)}`;
        }
      }
      
      animRef.current = requestAnimationFrame(loop);
    };
    
    animRef.current = requestAnimationFrame(loop);
    
    return () => {
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('mousemove', handleMouseMove);
      canvas.removeEventListener('click', handleClick);
      cancelAnimationFrame(animRef.current);
    };
  }, [settings.simpleView, activePlanet, setActivePlanet, setView, setZoomTransition, handleClick, handleMouseMove, zoom]);

  return (
    <canvas 
      ref={canvasRef} 
      id="scene"
      className="fixed inset-0 w-full h-full z-0"
    />
  );
}
