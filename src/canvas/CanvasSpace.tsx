import { useEffect, useRef, useCallback } from 'react';
import { SpaceEngine } from './Engine';
import { useStore } from '../store/useStore';
import { playBeep, startEngine, stopEngine } from '../hooks/useSound';

const LOCK_DURATION = 250
const ZOOM_IN_DURATION = 800
const ZOOM_OUT_DURATION = 900

function easeInOutCubic(t: number) {
  return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2
}

export function CanvasSpace() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const engineRef = useRef<SpaceEngine | null>(null);
  const animRef = useRef<number>(0);
  const lastPlanetRef = useRef<string | null>(null);

  const settings = useStore(s => s.settings);

  const handleClick = useCallback((e: MouseEvent) => {
    const state = useStore.getState();
    if (state.settings.simpleView) return;
    if (state.ship.phase !== 'idle' && state.ship.phase !== 'arrived') return;

    const engine = engineRef.current;
    if (!engine) return;

    const mx = e.clientX;
    const my = e.clientY;

    engine.bodies.forEach(b => {
      const d = Math.hypot(mx - b.x, my - b.y);
      if (d < b.radius + 15) {
        if (!state.achievements.firstVisit) {
          state.unlockAchievement('firstVisit');
        }
        state.addExploration(15);

        document.body.classList.add('glitch-active');
        setTimeout(() => document.body.classList.remove('glitch-active'), 180);

        playBeep(220, 'sawtooth', 0.3, 0.15);
        setTimeout(() => playBeep(330, 'sine', 0.2, 0.1), 300);
        setTimeout(() => playBeep(440, 'sine', 0.15, 0.08), 600);

        state.initiateTravel(b.name as any);
      }
    });

    // Check project card click
    if (state.activePlanet === 'projects' && engine.hoveredProjectIndex >= 0) {
      engine.openProjectLink();
    }
  }, []);

  const handleMouseMove = useCallback((e: MouseEvent) => {
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
  }, []);

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
    engine.loadContent();
    engineRef.current = engine;

    window.addEventListener('mousemove', handleMouseMove);
    canvas.addEventListener('click', handleClick);

    const handleWheel = (e: WheelEvent) => {
      const { activePlanet } = useStore.getState();
      if (activePlanet === 'projects') {
        e.preventDefault();
        engine.projectScrollY += e.deltaY * 0.5;
      }
    };
    canvas.addEventListener('wheel', handleWheel, { passive: false });

    let lastTime = performance.now();

    const loop = (time: number) => {
      const dt = Math.min((time - lastTime) / 1000, 0.05);
      lastTime = time;

      const { ship: s, activePlanet: ap, controls } = useStore.getState();

      if (s.target) lastPlanetRef.current = s.target;
      if (ap) lastPlanetRef.current = ap;

      if (!settings.simpleView) {
        const ctx = engine.ctx;
        const W = canvas.width;
        const H = canvas.height;
        const isAnimating = s.phase === 'locking' || s.phase === 'zoomIn' || s.phase === 'zoomOut';

        if (isAnimating) {
          const elapsed = time - s.startTime;
          let scale = 1;
          let camX = W / 2;
          let camY = H / 2;
          let starStreak = 0;
          let flashAlpha = 0;
          let labelAlpha = 1;
          let showReticle = false;
          let reticlePulse = 0;

          const targetName = s.target || lastPlanetRef.current;
          const target = engine.bodies.find(b => b.name === targetName);

          if (s.phase === 'locking') {
            const progress = Math.min(elapsed / LOCK_DURATION, 1);
            const ease = easeInOutCubic(progress);

            showReticle = true;
            reticlePulse = progress;

            if (target) {
              camX = W / 2 + (target.x - W / 2) * ease * 0.3;
              camY = H / 2 + (target.y - H / 2) * ease * 0.3;
              scale = 1 + ease * 0.2;
            }

            labelAlpha = 1 - progress * 0.5;

            if (progress >= 1) {
              const cur = useStore.getState().ship;
              if (cur.phase === 'locking') {
                startEngine();
                useStore.getState().pushLog('sys: trajectory locked');
                useStore.setState({ ship: { ...cur, phase: 'zoomIn', startTime: time } });
              }
            }

          } else if (s.phase === 'zoomIn') {
            const progress = Math.min(elapsed / ZOOM_IN_DURATION, 1);
            const ease = easeInOutCubic(progress);

            if (target) {
              camX = W / 2 + (target.x - W / 2) * (0.3 + ease * 0.7);
              camY = H / 2 + (target.y - H / 2) * (0.3 + ease * 0.7);
            }
            scale = 1.2 + ease * 3.8;
            starStreak = ease;
            labelAlpha = Math.max(0, 0.5 - ease * 0.5);

            if (progress >= 1) {
              const cur = useStore.getState().ship;
              if (cur.phase === 'zoomIn') {
                stopEngine();
                flashAlpha = 0.3;
                useStore.getState().arrive();
                playBeep(600, 'sine', 0.15, 0.08);
              }
            }

          } else if (s.phase === 'zoomOut') {
            if (elapsed < 50) startEngine();
            const progress = Math.min(elapsed / ZOOM_OUT_DURATION, 1);
            const ease = easeInOutCubic(progress);

            scale = 5 - ease * 4;

            if (target) {
              camX = target.x + (W / 2 - target.x) * ease;
              camY = target.y + (H / 2 - target.y) * ease;
            } else {
              camX = W / 2;
              camY = H / 2;
            }

            starStreak = Math.max(0, 1 - ease * 1.5);
            flashAlpha = Math.max(0, 0.25 - progress * 0.3);

            if (progress >= 1) {
              const cur = useStore.getState().ship;
              if (cur.phase === 'zoomOut') {
                stopEngine();
                useStore.getState().finishReturn();
              }
            }
          }

          ctx.save();
          ctx.translate(W / 2, H / 2);
          ctx.scale(scale, scale);
          ctx.translate(-camX, -camY);

          engine.update(dt);
          engine.draw(time, labelAlpha > 0.05, controls.orbits ?? true, controls.radar ?? false, controls.scanActive ?? false);
          ctx.restore();

          if (starStreak > 0.01) {
            ctx.save();
            ctx.globalAlpha = starStreak * 0.4;
            const cx = W / 2;
            const cy = H / 2;
            for (let i = 0; i < 40; i++) {
              const angle = (i / 40) * Math.PI * 2 + i * 0.3;
              const innerR = Math.max(W, H) * 0.05;
              const outerR = Math.max(W, H) * (0.2 + starStreak * 0.6);
              ctx.strokeStyle = i % 3 === 0 ? 'rgba(57,255,143,0.3)' : 'rgba(255,255,255,0.12)';
              ctx.lineWidth = 1;
              ctx.beginPath();
              ctx.moveTo(cx + Math.cos(angle) * innerR, cy + Math.sin(angle) * innerR);
              ctx.lineTo(cx + Math.cos(angle) * outerR, cy + Math.sin(angle) * outerR);
              ctx.stroke();
            }
            ctx.restore();
          }

          if (flashAlpha > 0.01) {
            ctx.save();
            ctx.fillStyle = `rgba(255,255,255,${flashAlpha})`;
            ctx.fillRect(0, 0, W, H);
            ctx.restore();
          }

          if (showReticle && target) {
            ctx.save();
            const pulse = 1 + Math.sin(reticlePulse * Math.PI * 4) * 0.3;
            const r = (target.radius + 20) * pulse;
            ctx.strokeStyle = `rgba(57,255,143,${0.8 - reticlePulse * 0.5})`;
            ctx.lineWidth = 2;
            ctx.setLineDash([4, 4]);
            ctx.beginPath();
            ctx.arc(target.x, target.y, r, 0, Math.PI * 2);
            ctx.stroke();

            ctx.setLineDash([]);
            ctx.lineWidth = 1;
            const ch = r * 0.6;
            ctx.beginPath();
            ctx.moveTo(target.x - ch, target.y);
            ctx.lineTo(target.x + ch, target.y);
            ctx.moveTo(target.x, target.y - ch);
            ctx.lineTo(target.x, target.y + ch);
            ctx.stroke();
            ctx.restore();
          }

        } else if (ap) {
          engine.update(dt);
          if (ap === 'techstack') {
            engine.drawTechStackZoomed(time);
          } else if (ap === 'projects') {
            engine.drawProjectsZoomed(time);
          } else if (ap === 'learning') {
            engine.drawLearningZoomed(time);
          } else {
            engine.drawZoomedPlanet(ap, time, 1);
          }
        } else {
          engine.update(dt * (controls.timeSpeed ?? 1));
          
          ctx.save();
          let camX = W / 2;
          let camY = H / 2;
          
          if (controls.track) {
             const t = time / 3000;
             camX = W / 2 + Math.cos(t) * 100;
             camY = H / 2 + Math.sin(t) * 100;
          }
          
          ctx.translate(W / 2, H / 2);
          const currentZoom = controls.zoom ?? 1;
          ctx.scale(currentZoom, currentZoom);
          ctx.translate(-camX, -camY);

          engine.draw(time, controls.labels ?? true, controls.orbits ?? true, controls.radar ?? false, controls.scanActive ?? false);
          ctx.restore();
        }
      }

      animRef.current = requestAnimationFrame(loop);
    };

    animRef.current = requestAnimationFrame(loop);

    return () => {
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('mousemove', handleMouseMove);
      canvas.removeEventListener('click', handleClick);
      canvas.removeEventListener('wheel', handleWheel);
      cancelAnimationFrame(animRef.current);
    };
  }, [settings.simpleView, handleClick, handleMouseMove]);

  return (
    <canvas
      ref={canvasRef}
      id="scene"
      className="fixed inset-0 w-full h-full z-0"
    />
  );
}
