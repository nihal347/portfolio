import { createHotContext as __vite__createHotContext } from "/@vite/client";import.meta.hot = __vite__createHotContext("/src/canvas/CanvasSpace.tsx");const useEffect = __vite__cjsImport0_react["useEffect"]; const useRef = __vite__cjsImport0_react["useRef"]; const useCallback = __vite__cjsImport0_react["useCallback"];const _jsxDEV = __vite__cjsImport4_react_jsxDevRuntime["jsxDEV"];import __vite__cjsImport0_react from "/node_modules/.vite/deps/react.js?v=c50e7e66";
import { SpaceEngine } from "/src/canvas/Engine.ts?t=1783624515877";
import { useStore } from "/src/store/useStore.ts";
import { playBeep, startEngine, stopEngine } from "/src/hooks/useSound.ts";
var _jsxFileName = "E:/portfolio website/src/canvas/CanvasSpace.tsx";
import __vite__cjsImport4_react_jsxDevRuntime from "/node_modules/.vite/deps/react_jsx-dev-runtime.js?v=c50e7e66";
var _s = $RefreshSig$();
const LOCK_DURATION = 250;
const ZOOM_IN_DURATION = 800;
const ZOOM_OUT_DURATION = 900;
function easeInOutCubic(t) {
	return t < .5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
}
export function CanvasSpace() {
	_s();
	const canvasRef = useRef(null);
	const engineRef = useRef(null);
	const animRef = useRef(0);
	const lastPlanetRef = useRef(null);
	const settings = useStore((s) => s.settings);
	const handleClick = useCallback((e) => {
		const state = useStore.getState();
		if (state.settings.simpleView) return;
		if (state.ship.phase !== "idle" && state.ship.phase !== "arrived") return;
		const engine = engineRef.current;
		if (!engine) return;
		const mx = e.clientX;
		const my = e.clientY;
		engine.bodies.forEach((b) => {
			const d = Math.hypot(mx - b.x, my - b.y);
			if (d < b.radius + 15) {
				if (!state.achievements.firstVisit) {
					state.unlockAchievement("firstVisit");
				}
				state.addExploration(15);
				document.body.classList.add("glitch-active");
				setTimeout(() => document.body.classList.remove("glitch-active"), 180);
				playBeep(220, "sawtooth", .3, .15);
				setTimeout(() => playBeep(330, "sine", .2, .1), 300);
				setTimeout(() => playBeep(440, "sine", .15, .08), 600);
				state.initiateTravel(b.name);
			}
		});
		// Check project card click
		if (state.activePlanet === "projects" && engine.hoveredProjectIndex >= 0) {
			engine.openProjectLink();
		}
	}, []);
	const handleMouseMove = useCallback((e) => {
		const engine = engineRef.current;
		if (!engine) return;
		engine.setMousePos(e.clientX, e.clientY);
		const canvas = canvasRef.current;
		if (canvas) {
			if (engine.bodies.some((b) => b.hover)) {
				canvas.classList.remove("no-planet-hover");
			} else {
				canvas.classList.add("no-planet-hover");
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
		window.addEventListener("resize", handleResize);
		const engine = new SpaceEngine(canvas);
		engineRef.current = engine;
		window.addEventListener("mousemove", handleMouseMove);
		canvas.addEventListener("click", handleClick);
		const handleWheel = (e) => {
			const { activePlanet } = useStore.getState();
			if (activePlanet === "projects") {
				e.preventDefault();
				engine.projectScrollY += e.deltaY * .5;
			}
		};
		canvas.addEventListener("wheel", handleWheel, { passive: false });
		let lastTime = performance.now();
		const loop = (time) => {
			const dt = Math.min((time - lastTime) / 1e3, .05);
			lastTime = time;
			const { ship: s, activePlanet: ap, controls } = useStore.getState();
			if (s.target) lastPlanetRef.current = s.target;
			if (ap) lastPlanetRef.current = ap;
			if (!settings.simpleView) {
				const ctx = engine.ctx;
				const W = canvas.width;
				const H = canvas.height;
				const isAnimating = s.phase === "locking" || s.phase === "zoomIn" || s.phase === "zoomOut";
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
					const target = engine.bodies.find((b) => b.name === targetName);
					if (s.phase === "locking") {
						const progress = Math.min(elapsed / LOCK_DURATION, 1);
						const ease = easeInOutCubic(progress);
						showReticle = true;
						reticlePulse = progress;
						if (target) {
							camX = W / 2 + (target.x - W / 2) * ease * .3;
							camY = H / 2 + (target.y - H / 2) * ease * .3;
							scale = 1 + ease * .2;
						}
						labelAlpha = 1 - progress * .5;
						if (progress >= 1) {
							const cur = useStore.getState().ship;
							if (cur.phase === "locking") {
								startEngine();
								useStore.getState().pushLog("sys: trajectory locked");
								useStore.setState({ ship: {
									...cur,
									phase: "zoomIn",
									startTime: time
								} });
							}
						}
					} else if (s.phase === "zoomIn") {
						const progress = Math.min(elapsed / ZOOM_IN_DURATION, 1);
						const ease = easeInOutCubic(progress);
						if (target) {
							camX = W / 2 + (target.x - W / 2) * (.3 + ease * .7);
							camY = H / 2 + (target.y - H / 2) * (.3 + ease * .7);
						}
						scale = 1.2 + ease * 3.8;
						starStreak = ease;
						labelAlpha = Math.max(0, .5 - ease * .5);
						if (progress >= 1) {
							const cur = useStore.getState().ship;
							if (cur.phase === "zoomIn") {
								stopEngine();
								flashAlpha = .3;
								useStore.getState().arrive();
								playBeep(600, "sine", .15, .08);
							}
						}
					} else if (s.phase === "zoomOut") {
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
						flashAlpha = Math.max(0, .25 - progress * .3);
						if (progress >= 1) {
							const cur = useStore.getState().ship;
							if (cur.phase === "zoomOut") {
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
					engine.draw(time, labelAlpha > .05, controls.orbits ?? true, controls.radar ?? false, controls.scanActive ?? false);
					ctx.restore();
					if (starStreak > .01) {
						ctx.save();
						ctx.globalAlpha = starStreak * .4;
						const cx = W / 2;
						const cy = H / 2;
						for (let i = 0; i < 40; i++) {
							const angle = i / 40 * Math.PI * 2 + i * .3;
							const innerR = Math.max(W, H) * .05;
							const outerR = Math.max(W, H) * (.2 + starStreak * .6);
							ctx.strokeStyle = i % 3 === 0 ? "rgba(57,255,143,0.3)" : "rgba(255,255,255,0.12)";
							ctx.lineWidth = 1;
							ctx.beginPath();
							ctx.moveTo(cx + Math.cos(angle) * innerR, cy + Math.sin(angle) * innerR);
							ctx.lineTo(cx + Math.cos(angle) * outerR, cy + Math.sin(angle) * outerR);
							ctx.stroke();
						}
						ctx.restore();
					}
					if (flashAlpha > .01) {
						ctx.save();
						ctx.fillStyle = `rgba(255,255,255,${flashAlpha})`;
						ctx.fillRect(0, 0, W, H);
						ctx.restore();
					}
					if (showReticle && target) {
						ctx.save();
						const pulse = 1 + Math.sin(reticlePulse * Math.PI * 4) * .3;
						const r = (target.radius + 20) * pulse;
						ctx.strokeStyle = `rgba(57,255,143,${.8 - reticlePulse * .5})`;
						ctx.lineWidth = 2;
						ctx.setLineDash([4, 4]);
						ctx.beginPath();
						ctx.arc(target.x, target.y, r, 0, Math.PI * 2);
						ctx.stroke();
						ctx.setLineDash([]);
						ctx.lineWidth = 1;
						const ch = r * .6;
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
					if (ap === "techstack") {
						engine.drawTechStackZoomed(time);
					} else if (ap === "projects") {
						engine.drawProjectsZoomed(time);
					} else if (ap === "learning") {
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
						const t = time / 3e3;
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
			window.removeEventListener("resize", handleResize);
			window.removeEventListener("mousemove", handleMouseMove);
			canvas.removeEventListener("click", handleClick);
			canvas.removeEventListener("wheel", handleWheel);
			cancelAnimationFrame(animRef.current);
		};
	}, [
		settings.simpleView,
		handleClick,
		handleMouseMove
	]);
	return /* @__PURE__ */ _jsxDEV("canvas", {
		ref: canvasRef,
		id: "scene",
		className: "fixed inset-0 w-full h-full z-0"
	}, void 0, false, {
		fileName: _jsxFileName,
		lineNumber: 310,
		columnNumber: 5
	}, this);
}
_s(CanvasSpace, "dDO+i+QaQGYh7DRFj6zWTtZHRTA=", false, function() {
	return [useStore];
});
_c = CanvasSpace;
var _c;
$RefreshReg$(_c, "CanvasSpace");
import * as RefreshRuntime from "/@react-refresh";
const inWebWorker = typeof WorkerGlobalScope !== 'undefined' && self instanceof WorkerGlobalScope;
import * as __vite_react_currentExports from "/src/canvas/CanvasSpace.tsx?t=1783624868584";
if (import.meta.hot && !inWebWorker) {
  if (!window.$RefreshReg$) {
    throw new Error(
      "@vitejs/plugin-react can't detect preamble. Something is wrong."
    );
  }

  const currentExports = __vite_react_currentExports;
  queueMicrotask(() => {
    RefreshRuntime.registerExportsForReactRefresh("E:/portfolio website/src/canvas/CanvasSpace.tsx", currentExports);
    import.meta.hot.accept((nextExports) => {
      if (!nextExports) return;
      const invalidateMessage = RefreshRuntime.validateRefreshBoundaryAndEnqueueUpdate("E:/portfolio website/src/canvas/CanvasSpace.tsx", currentExports, nextExports);
      if (invalidateMessage) import.meta.hot.invalidate(invalidateMessage);
    });
  });
}
function $RefreshReg$(type, id) { return RefreshRuntime.register(type, "E:/portfolio website/src/canvas/CanvasSpace.tsx" + ' ' + id); }
function $RefreshSig$() { return RefreshRuntime.createSignatureFunctionForTransform(); }

//# sourceMappingURL=data:application/json;base64,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QWU7R0FDdkQsT0FBTyxvQkFBb0IsU0FBUyxXQUFXO0dBQy9DLE9BQU8sb0JBQW9CLFNBQVMsV0FBVztHQUMvQyxxQkFBcUIsUUFBUSxPQUFPO0VBQ3RDO0NBQ0YsR0FBRztFQUFDLFNBQVM7RUFBWTtFQUFhO0NBQWUsQ0FBQztDQUV0RCxPQUNFLHdCQUFDLFVBQUQ7RUFDRSxLQUFLO0VBQ0wsSUFBRztFQUNILFdBQVU7Q0FDWDs7Ozs7QUFFTCIsIm5hbWVzIjpbXSwic291cmNlcyI6WyJDYW52YXNTcGFjZS50c3giXSwidmVyc2lvbiI6Mywic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IHsgdXNlRWZmZWN0LCB1c2VSZWYsIHVzZUNhbGxiYWNrIH0gZnJvbSAncmVhY3QnO1xuaW1wb3J0IHsgU3BhY2VFbmdpbmUgfSBmcm9tICcuL0VuZ2luZSc7XG5pbXBvcnQgeyB1c2VTdG9yZSB9IGZyb20gJy4uL3N0b3JlL3VzZVN0b3JlJztcbmltcG9ydCB7IHBsYXlCZWVwLCBzdGFydEVuZ2luZSwgc3RvcEVuZ2luZSB9IGZyb20gJy4uL2hvb2tzL3VzZVNvdW5kJztcblxuY29uc3QgTE9DS19EVVJBVElPTiA9IDI1MFxuY29uc3QgWk9PTV9JTl9EVVJBVElPTiA9IDgwMFxuY29uc3QgWk9PTV9PVVRfRFVSQVRJT04gPSA5MDBcblxuZnVuY3Rpb24gZWFzZUluT3V0Q3ViaWModDogbnVtYmVyKSB7XG4gIHJldHVybiB0IDwgMC41ID8gNCAqIHQgKiB0ICogdCA6IDEgLSBNYXRoLnBvdygtMiAqIHQgKyAyLCAzKSAvIDJcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIENhbnZhc1NwYWNlKCkge1xuICBjb25zdCBjYW52YXNSZWYgPSB1c2VSZWY8SFRNTENhbnZhc0VsZW1lbnQ+KG51bGwpO1xuICBjb25zdCBlbmdpbmVSZWYgPSB1c2VSZWY8U3BhY2VFbmdpbmUgfCBudWxsPihudWxsKTtcbiAgY29uc3QgYW5pbVJlZiA9IHVzZVJlZjxudW1iZXI+KDApO1xuICBjb25zdCBsYXN0UGxhbmV0UmVmID0gdXNlUmVmPHN0cmluZyB8IG51bGw+KG51bGwpO1xuXG4gIGNvbnN0IHNldHRpbmdzID0gdXNlU3RvcmUocyA9PiBzLnNldHRpbmdzKTtcblxuICBjb25zdCBoYW5kbGVDbGljayA9IHVzZUNhbGxiYWNrKChlOiBNb3VzZUV2ZW50KSA9PiB7XG4gICAgY29uc3Qgc3RhdGUgPSB1c2VTdG9yZS5nZXRTdGF0ZSgpO1xuICAgIGlmIChzdGF0ZS5zZXR0aW5ncy5zaW1wbGVWaWV3KSByZXR1cm47XG4gICAgaWYgKHN0YXRlLnNoaXAucGhhc2UgIT09ICdpZGxlJyAmJiBzdGF0ZS5zaGlwLnBoYXNlICE9PSAnYXJyaXZlZCcpIHJldHVybjtcblxuICAgIGNvbnN0IGVuZ2luZSA9IGVuZ2luZVJlZi5jdXJyZW50O1xuICAgIGlmICghZW5naW5lKSByZXR1cm47XG5cbiAgICBjb25zdCBteCA9IGUuY2xpZW50WDtcbiAgICBjb25zdCBteSA9IGUuY2xpZW50WTtcblxuICAgIGVuZ2luZS5ib2RpZXMuZm9yRWFjaChiID0+IHtcbiAgICAgIGNvbnN0IGQgPSBNYXRoLmh5cG90KG14IC0gYi54LCBteSAtIGIueSk7XG4gICAgICBpZiAoZCA8IGIucmFkaXVzICsgMTUpIHtcbiAgICAgICAgaWYgKCFzdGF0ZS5hY2hpZXZlbWVudHMuZmlyc3RWaXNpdCkge1xuICAgICAgICAgIHN0YXRlLnVubG9ja0FjaGlldmVtZW50KCdmaXJzdFZpc2l0Jyk7XG4gICAgICAgIH1cbiAgICAgICAgc3RhdGUuYWRkRXhwbG9yYXRpb24oMTUpO1xuXG4gICAgICAgIGRvY3VtZW50LmJvZHkuY2xhc3NMaXN0LmFkZCgnZ2xpdGNoLWFjdGl2ZScpO1xuICAgICAgICBzZXRUaW1lb3V0KCgpID0+IGRvY3VtZW50LmJvZHkuY2xhc3NMaXN0LnJlbW92ZSgnZ2xpdGNoLWFjdGl2ZScpLCAxODApO1xuXG4gICAgICAgIHBsYXlCZWVwKDIyMCwgJ3Nhd3Rvb3RoJywgMC4zLCAwLjE1KTtcbiAgICAgICAgc2V0VGltZW91dCgoKSA9PiBwbGF5QmVlcCgzMzAsICdzaW5lJywgMC4yLCAwLjEpLCAzMDApO1xuICAgICAgICBzZXRUaW1lb3V0KCgpID0+IHBsYXlCZWVwKDQ0MCwgJ3NpbmUnLCAwLjE1LCAwLjA4KSwgNjAwKTtcblxuICAgICAgICBzdGF0ZS5pbml0aWF0ZVRyYXZlbChiLm5hbWUgYXMgYW55KTtcbiAgICAgIH1cbiAgICB9KTtcblxuICAgIC8vIENoZWNrIHByb2plY3QgY2FyZCBjbGlja1xuICAgIGlmIChzdGF0ZS5hY3RpdmVQbGFuZXQgPT09ICdwcm9qZWN0cycgJiYgZW5naW5lLmhvdmVyZWRQcm9qZWN0SW5kZXggPj0gMCkge1xuICAgICAgZW5naW5lLm9wZW5Qcm9qZWN0TGluaygpO1xuICAgIH1cbiAgfSwgW10pO1xuXG4gIGNvbnN0IGhhbmRsZU1vdXNlTW92ZSA9IHVzZUNhbGxiYWNrKChlOiBNb3VzZUV2ZW50KSA9PiB7XG4gICAgY29uc3QgZW5naW5lID0gZW5naW5lUmVmLmN1cnJlbnQ7XG4gICAgaWYgKCFlbmdpbmUpIHJldHVybjtcbiAgICBlbmdpbmUuc2V0TW91c2VQb3MoZS5jbGllbnRYLCBlLmNsaWVudFkpO1xuICAgIGNvbnN0IGNhbnZhcyA9IGNhbnZhc1JlZi5jdXJyZW50O1xuICAgIGlmIChjYW52YXMpIHtcbiAgICAgIGlmIChlbmdpbmUuYm9kaWVzLnNvbWUoYiA9PiBiLmhvdmVyKSkge1xuICAgICAgICBjYW52YXMuY2xhc3NMaXN0LnJlbW92ZSgnbm8tcGxhbmV0LWhvdmVyJyk7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICBjYW52YXMuY2xhc3NMaXN0LmFkZCgnbm8tcGxhbmV0LWhvdmVyJyk7XG4gICAgICB9XG4gICAgfVxuICB9LCBbXSk7XG5cbiAgdXNlRWZmZWN0KCgpID0+IHtcbiAgICBpZiAoIWNhbnZhc1JlZi5jdXJyZW50KSByZXR1cm47XG4gICAgY29uc3QgY2FudmFzID0gY2FudmFzUmVmLmN1cnJlbnQ7XG5cbiAgICBjb25zdCBoYW5kbGVSZXNpemUgPSAoKSA9PiB7XG4gICAgICBjYW52YXMud2lkdGggPSB3aW5kb3cuaW5uZXJXaWR0aDtcbiAgICAgIGNhbnZhcy5oZWlnaHQgPSB3aW5kb3cuaW5uZXJIZWlnaHQ7XG4gICAgICBpZiAoZW5naW5lUmVmLmN1cnJlbnQpIGVuZ2luZVJlZi5jdXJyZW50LnJlc2l6ZSgpO1xuICAgIH07XG4gICAgaGFuZGxlUmVzaXplKCk7XG4gICAgd2luZG93LmFkZEV2ZW50TGlzdGVuZXIoJ3Jlc2l6ZScsIGhhbmRsZVJlc2l6ZSk7XG5cbiAgICBjb25zdCBlbmdpbmUgPSBuZXcgU3BhY2VFbmdpbmUoY2FudmFzKTtcbiAgICBlbmdpbmVSZWYuY3VycmVudCA9IGVuZ2luZTtcblxuICAgIHdpbmRvdy5hZGRFdmVudExpc3RlbmVyKCdtb3VzZW1vdmUnLCBoYW5kbGVNb3VzZU1vdmUpO1xuICAgIGNhbnZhcy5hZGRFdmVudExpc3RlbmVyKCdjbGljaycsIGhhbmRsZUNsaWNrKTtcblxuICAgIGNvbnN0IGhhbmRsZVdoZWVsID0gKGU6IFdoZWVsRXZlbnQpID0+IHtcbiAgICAgIGNvbnN0IHsgYWN0aXZlUGxhbmV0IH0gPSB1c2VTdG9yZS5nZXRTdGF0ZSgpO1xuICAgICAgaWYgKGFjdGl2ZVBsYW5ldCA9PT0gJ3Byb2plY3RzJykge1xuICAgICAgICBlLnByZXZlbnREZWZhdWx0KCk7XG4gICAgICAgIGVuZ2luZS5wcm9qZWN0U2Nyb2xsWSArPSBlLmRlbHRhWSAqIDAuNTtcbiAgICAgIH1cbiAgICB9O1xuICAgIGNhbnZhcy5hZGRFdmVudExpc3RlbmVyKCd3aGVlbCcsIGhhbmRsZVdoZWVsLCB7IHBhc3NpdmU6IGZhbHNlIH0pO1xuXG4gICAgbGV0IGxhc3RUaW1lID0gcGVyZm9ybWFuY2Uubm93KCk7XG5cbiAgICBjb25zdCBsb29wID0gKHRpbWU6IG51bWJlcikgPT4ge1xuICAgICAgY29uc3QgZHQgPSBNYXRoLm1pbigodGltZSAtIGxhc3RUaW1lKSAvIDEwMDAsIDAuMDUpO1xuICAgICAgbGFzdFRpbWUgPSB0aW1lO1xuXG4gICAgICBjb25zdCB7IHNoaXA6IHMsIGFjdGl2ZVBsYW5ldDogYXAsIGNvbnRyb2xzIH0gPSB1c2VTdG9yZS5nZXRTdGF0ZSgpO1xuXG4gICAgICBpZiAocy50YXJnZXQpIGxhc3RQbGFuZXRSZWYuY3VycmVudCA9IHMudGFyZ2V0O1xuICAgICAgaWYgKGFwKSBsYXN0UGxhbmV0UmVmLmN1cnJlbnQgPSBhcDtcblxuICAgICAgaWYgKCFzZXR0aW5ncy5zaW1wbGVWaWV3KSB7XG4gICAgICAgIGNvbnN0IGN0eCA9IGVuZ2luZS5jdHg7XG4gICAgICAgIGNvbnN0IFcgPSBjYW52YXMud2lkdGg7XG4gICAgICAgIGNvbnN0IEggPSBjYW52YXMuaGVpZ2h0O1xuICAgICAgICBjb25zdCBpc0FuaW1hdGluZyA9IHMucGhhc2UgPT09ICdsb2NraW5nJyB8fCBzLnBoYXNlID09PSAnem9vbUluJyB8fCBzLnBoYXNlID09PSAnem9vbU91dCc7XG5cbiAgICAgICAgaWYgKGlzQW5pbWF0aW5nKSB7XG4gICAgICAgICAgY29uc3QgZWxhcHNlZCA9IHRpbWUgLSBzLnN0YXJ0VGltZTtcbiAgICAgICAgICBsZXQgc2NhbGUgPSAxO1xuICAgICAgICAgIGxldCBjYW1YID0gVyAvIDI7XG4gICAgICAgICAgbGV0IGNhbVkgPSBIIC8gMjtcbiAgICAgICAgICBsZXQgc3RhclN0cmVhayA9IDA7XG4gICAgICAgICAgbGV0IGZsYXNoQWxwaGEgPSAwO1xuICAgICAgICAgIGxldCBsYWJlbEFscGhhID0gMTtcbiAgICAgICAgICBsZXQgc2hvd1JldGljbGUgPSBmYWxzZTtcbiAgICAgICAgICBsZXQgcmV0aWNsZVB1bHNlID0gMDtcblxuICAgICAgICAgIGNvbnN0IHRhcmdldE5hbWUgPSBzLnRhcmdldCB8fCBsYXN0UGxhbmV0UmVmLmN1cnJlbnQ7XG4gICAgICAgICAgY29uc3QgdGFyZ2V0ID0gZW5naW5lLmJvZGllcy5maW5kKGIgPT4gYi5uYW1lID09PSB0YXJnZXROYW1lKTtcblxuICAgICAgICAgIGlmIChzLnBoYXNlID09PSAnbG9ja2luZycpIHtcbiAgICAgICAgICAgIGNvbnN0IHByb2dyZXNzID0gTWF0aC5taW4oZWxhcHNlZCAvIExPQ0tfRFVSQVRJT04sIDEpO1xuICAgICAgICAgICAgY29uc3QgZWFzZSA9IGVhc2VJbk91dEN1YmljKHByb2dyZXNzKTtcblxuICAgICAgICAgICAgc2hvd1JldGljbGUgPSB0cnVlO1xuICAgICAgICAgICAgcmV0aWNsZVB1bHNlID0gcHJvZ3Jlc3M7XG5cbiAgICAgICAgICAgIGlmICh0YXJnZXQpIHtcbiAgICAgICAgICAgICAgY2FtWCA9IFcgLyAyICsgKHRhcmdldC54IC0gVyAvIDIpICogZWFzZSAqIDAuMztcbiAgICAgICAgICAgICAgY2FtWSA9IEggLyAyICsgKHRhcmdldC55IC0gSCAvIDIpICogZWFzZSAqIDAuMztcbiAgICAgICAgICAgICAgc2NhbGUgPSAxICsgZWFzZSAqIDAuMjtcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgbGFiZWxBbHBoYSA9IDEgLSBwcm9ncmVzcyAqIDAuNTtcblxuICAgICAgICAgICAgaWYgKHByb2dyZXNzID49IDEpIHtcbiAgICAgICAgICAgICAgY29uc3QgY3VyID0gdXNlU3RvcmUuZ2V0U3RhdGUoKS5zaGlwO1xuICAgICAgICAgICAgICBpZiAoY3VyLnBoYXNlID09PSAnbG9ja2luZycpIHtcbiAgICAgICAgICAgICAgICBzdGFydEVuZ2luZSgpO1xuICAgICAgICAgICAgICAgIHVzZVN0b3JlLmdldFN0YXRlKCkucHVzaExvZygnc3lzOiB0cmFqZWN0b3J5IGxvY2tlZCcpO1xuICAgICAgICAgICAgICAgIHVzZVN0b3JlLnNldFN0YXRlKHsgc2hpcDogeyAuLi5jdXIsIHBoYXNlOiAnem9vbUluJywgc3RhcnRUaW1lOiB0aW1lIH0gfSk7XG4gICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cblxuICAgICAgICAgIH0gZWxzZSBpZiAocy5waGFzZSA9PT0gJ3pvb21JbicpIHtcbiAgICAgICAgICAgIGNvbnN0IHByb2dyZXNzID0gTWF0aC5taW4oZWxhcHNlZCAvIFpPT01fSU5fRFVSQVRJT04sIDEpO1xuICAgICAgICAgICAgY29uc3QgZWFzZSA9IGVhc2VJbk91dEN1YmljKHByb2dyZXNzKTtcblxuICAgICAgICAgICAgaWYgKHRhcmdldCkge1xuICAgICAgICAgICAgICBjYW1YID0gVyAvIDIgKyAodGFyZ2V0LnggLSBXIC8gMikgKiAoMC4zICsgZWFzZSAqIDAuNyk7XG4gICAgICAgICAgICAgIGNhbVkgPSBIIC8gMiArICh0YXJnZXQueSAtIEggLyAyKSAqICgwLjMgKyBlYXNlICogMC43KTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIHNjYWxlID0gMS4yICsgZWFzZSAqIDMuODtcbiAgICAgICAgICAgIHN0YXJTdHJlYWsgPSBlYXNlO1xuICAgICAgICAgICAgbGFiZWxBbHBoYSA9IE1hdGgubWF4KDAsIDAuNSAtIGVhc2UgKiAwLjUpO1xuXG4gICAgICAgICAgICBpZiAocHJvZ3Jlc3MgPj0gMSkge1xuICAgICAgICAgICAgICBjb25zdCBjdXIgPSB1c2VTdG9yZS5nZXRTdGF0ZSgpLnNoaXA7XG4gICAgICAgICAgICAgIGlmIChjdXIucGhhc2UgPT09ICd6b29tSW4nKSB7XG4gICAgICAgICAgICAgICAgc3RvcEVuZ2luZSgpO1xuICAgICAgICAgICAgICAgIGZsYXNoQWxwaGEgPSAwLjM7XG4gICAgICAgICAgICAgICAgdXNlU3RvcmUuZ2V0U3RhdGUoKS5hcnJpdmUoKTtcbiAgICAgICAgICAgICAgICBwbGF5QmVlcCg2MDAsICdzaW5lJywgMC4xNSwgMC4wOCk7XG4gICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cblxuICAgICAgICAgIH0gZWxzZSBpZiAocy5waGFzZSA9PT0gJ3pvb21PdXQnKSB7XG4gICAgICAgICAgICBpZiAoZWxhcHNlZCA8IDUwKSBzdGFydEVuZ2luZSgpO1xuICAgICAgICAgICAgY29uc3QgcHJvZ3Jlc3MgPSBNYXRoLm1pbihlbGFwc2VkIC8gWk9PTV9PVVRfRFVSQVRJT04sIDEpO1xuICAgICAgICAgICAgY29uc3QgZWFzZSA9IGVhc2VJbk91dEN1YmljKHByb2dyZXNzKTtcblxuICAgICAgICAgICAgc2NhbGUgPSA1IC0gZWFzZSAqIDQ7XG5cbiAgICAgICAgICAgIGlmICh0YXJnZXQpIHtcbiAgICAgICAgICAgICAgY2FtWCA9IHRhcmdldC54ICsgKFcgLyAyIC0gdGFyZ2V0LngpICogZWFzZTtcbiAgICAgICAgICAgICAgY2FtWSA9IHRhcmdldC55ICsgKEggLyAyIC0gdGFyZ2V0LnkpICogZWFzZTtcbiAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgIGNhbVggPSBXIC8gMjtcbiAgICAgICAgICAgICAgY2FtWSA9IEggLyAyO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICBzdGFyU3RyZWFrID0gTWF0aC5tYXgoMCwgMSAtIGVhc2UgKiAxLjUpO1xuICAgICAgICAgICAgZmxhc2hBbHBoYSA9IE1hdGgubWF4KDAsIDAuMjUgLSBwcm9ncmVzcyAqIDAuMyk7XG5cbiAgICAgICAgICAgIGlmIChwcm9ncmVzcyA+PSAxKSB7XG4gICAgICAgICAgICAgIGNvbnN0IGN1ciA9IHVzZVN0b3JlLmdldFN0YXRlKCkuc2hpcDtcbiAgICAgICAgICAgICAgaWYgKGN1ci5waGFzZSA9PT0gJ3pvb21PdXQnKSB7XG4gICAgICAgICAgICAgICAgc3RvcEVuZ2luZSgpO1xuICAgICAgICAgICAgICAgIHVzZVN0b3JlLmdldFN0YXRlKCkuZmluaXNoUmV0dXJuKCk7XG4gICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgICB9XG5cbiAgICAgICAgICBjdHguc2F2ZSgpO1xuICAgICAgICAgIGN0eC50cmFuc2xhdGUoVyAvIDIsIEggLyAyKTtcbiAgICAgICAgICBjdHguc2NhbGUoc2NhbGUsIHNjYWxlKTtcbiAgICAgICAgICBjdHgudHJhbnNsYXRlKC1jYW1YLCAtY2FtWSk7XG5cbiAgICAgICAgICBlbmdpbmUudXBkYXRlKGR0KTtcbiAgICAgICAgICBlbmdpbmUuZHJhdyh0aW1lLCBsYWJlbEFscGhhID4gMC4wNSwgY29udHJvbHMub3JiaXRzID8/IHRydWUsIGNvbnRyb2xzLnJhZGFyID8/IGZhbHNlLCBjb250cm9scy5zY2FuQWN0aXZlID8/IGZhbHNlKTtcbiAgICAgICAgICBjdHgucmVzdG9yZSgpO1xuXG4gICAgICAgICAgaWYgKHN0YXJTdHJlYWsgPiAwLjAxKSB7XG4gICAgICAgICAgICBjdHguc2F2ZSgpO1xuICAgICAgICAgICAgY3R4Lmdsb2JhbEFscGhhID0gc3RhclN0cmVhayAqIDAuNDtcbiAgICAgICAgICAgIGNvbnN0IGN4ID0gVyAvIDI7XG4gICAgICAgICAgICBjb25zdCBjeSA9IEggLyAyO1xuICAgICAgICAgICAgZm9yIChsZXQgaSA9IDA7IGkgPCA0MDsgaSsrKSB7XG4gICAgICAgICAgICAgIGNvbnN0IGFuZ2xlID0gKGkgLyA0MCkgKiBNYXRoLlBJICogMiArIGkgKiAwLjM7XG4gICAgICAgICAgICAgIGNvbnN0IGlubmVyUiA9IE1hdGgubWF4KFcsIEgpICogMC4wNTtcbiAgICAgICAgICAgICAgY29uc3Qgb3V0ZXJSID0gTWF0aC5tYXgoVywgSCkgKiAoMC4yICsgc3RhclN0cmVhayAqIDAuNik7XG4gICAgICAgICAgICAgIGN0eC5zdHJva2VTdHlsZSA9IGkgJSAzID09PSAwID8gJ3JnYmEoNTcsMjU1LDE0MywwLjMpJyA6ICdyZ2JhKDI1NSwyNTUsMjU1LDAuMTIpJztcbiAgICAgICAgICAgICAgY3R4LmxpbmVXaWR0aCA9IDE7XG4gICAgICAgICAgICAgIGN0eC5iZWdpblBhdGgoKTtcbiAgICAgICAgICAgICAgY3R4Lm1vdmVUbyhjeCArIE1hdGguY29zKGFuZ2xlKSAqIGlubmVyUiwgY3kgKyBNYXRoLnNpbihhbmdsZSkgKiBpbm5lclIpO1xuICAgICAgICAgICAgICBjdHgubGluZVRvKGN4ICsgTWF0aC5jb3MoYW5nbGUpICogb3V0ZXJSLCBjeSArIE1hdGguc2luKGFuZ2xlKSAqIG91dGVyUik7XG4gICAgICAgICAgICAgIGN0eC5zdHJva2UoKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGN0eC5yZXN0b3JlKCk7XG4gICAgICAgICAgfVxuXG4gICAgICAgICAgaWYgKGZsYXNoQWxwaGEgPiAwLjAxKSB7XG4gICAgICAgICAgICBjdHguc2F2ZSgpO1xuICAgICAgICAgICAgY3R4LmZpbGxTdHlsZSA9IGByZ2JhKDI1NSwyNTUsMjU1LCR7Zmxhc2hBbHBoYX0pYDtcbiAgICAgICAgICAgIGN0eC5maWxsUmVjdCgwLCAwLCBXLCBIKTtcbiAgICAgICAgICAgIGN0eC5yZXN0b3JlKCk7XG4gICAgICAgICAgfVxuXG4gICAgICAgICAgaWYgKHNob3dSZXRpY2xlICYmIHRhcmdldCkge1xuICAgICAgICAgICAgY3R4LnNhdmUoKTtcbiAgICAgICAgICAgIGNvbnN0IHB1bHNlID0gMSArIE1hdGguc2luKHJldGljbGVQdWxzZSAqIE1hdGguUEkgKiA0KSAqIDAuMztcbiAgICAgICAgICAgIGNvbnN0IHIgPSAodGFyZ2V0LnJhZGl1cyArIDIwKSAqIHB1bHNlO1xuICAgICAgICAgICAgY3R4LnN0cm9rZVN0eWxlID0gYHJnYmEoNTcsMjU1LDE0MywkezAuOCAtIHJldGljbGVQdWxzZSAqIDAuNX0pYDtcbiAgICAgICAgICAgIGN0eC5saW5lV2lkdGggPSAyO1xuICAgICAgICAgICAgY3R4LnNldExpbmVEYXNoKFs0LCA0XSk7XG4gICAgICAgICAgICBjdHguYmVnaW5QYXRoKCk7XG4gICAgICAgICAgICBjdHguYXJjKHRhcmdldC54LCB0YXJnZXQueSwgciwgMCwgTWF0aC5QSSAqIDIpO1xuICAgICAgICAgICAgY3R4LnN0cm9rZSgpO1xuXG4gICAgICAgICAgICBjdHguc2V0TGluZURhc2goW10pO1xuICAgICAgICAgICAgY3R4LmxpbmVXaWR0aCA9IDE7XG4gICAgICAgICAgICBjb25zdCBjaCA9IHIgKiAwLjY7XG4gICAgICAgICAgICBjdHguYmVnaW5QYXRoKCk7XG4gICAgICAgICAgICBjdHgubW92ZVRvKHRhcmdldC54IC0gY2gsIHRhcmdldC55KTtcbiAgICAgICAgICAgIGN0eC5saW5lVG8odGFyZ2V0LnggKyBjaCwgdGFyZ2V0LnkpO1xuICAgICAgICAgICAgY3R4Lm1vdmVUbyh0YXJnZXQueCwgdGFyZ2V0LnkgLSBjaCk7XG4gICAgICAgICAgICBjdHgubGluZVRvKHRhcmdldC54LCB0YXJnZXQueSArIGNoKTtcbiAgICAgICAgICAgIGN0eC5zdHJva2UoKTtcbiAgICAgICAgICAgIGN0eC5yZXN0b3JlKCk7XG4gICAgICAgICAgfVxuXG4gICAgICAgIH0gZWxzZSBpZiAoYXApIHtcbiAgICAgICAgICBlbmdpbmUudXBkYXRlKGR0KTtcbiAgICAgICAgICBpZiAoYXAgPT09ICd0ZWNoc3RhY2snKSB7XG4gICAgICAgICAgICBlbmdpbmUuZHJhd1RlY2hTdGFja1pvb21lZCh0aW1lKTtcbiAgICAgICAgICB9IGVsc2UgaWYgKGFwID09PSAncHJvamVjdHMnKSB7XG4gICAgICAgICAgICBlbmdpbmUuZHJhd1Byb2plY3RzWm9vbWVkKHRpbWUpO1xuICAgICAgICAgIH0gZWxzZSBpZiAoYXAgPT09ICdsZWFybmluZycpIHtcbiAgICAgICAgICAgIGVuZ2luZS5kcmF3TGVhcm5pbmdab29tZWQodGltZSk7XG4gICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIGVuZ2luZS5kcmF3Wm9vbWVkUGxhbmV0KGFwLCB0aW1lLCAxKTtcbiAgICAgICAgICB9XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgZW5naW5lLnVwZGF0ZShkdCAqIChjb250cm9scy50aW1lU3BlZWQgPz8gMSkpO1xuICAgICAgICAgIFxuICAgICAgICAgIGN0eC5zYXZlKCk7XG4gICAgICAgICAgbGV0IGNhbVggPSBXIC8gMjtcbiAgICAgICAgICBsZXQgY2FtWSA9IEggLyAyO1xuICAgICAgICAgIFxuICAgICAgICAgIGlmIChjb250cm9scy50cmFjaykge1xuICAgICAgICAgICAgIGNvbnN0IHQgPSB0aW1lIC8gMzAwMDtcbiAgICAgICAgICAgICBjYW1YID0gVyAvIDIgKyBNYXRoLmNvcyh0KSAqIDEwMDtcbiAgICAgICAgICAgICBjYW1ZID0gSCAvIDIgKyBNYXRoLnNpbih0KSAqIDEwMDtcbiAgICAgICAgICB9XG4gICAgICAgICAgXG4gICAgICAgICAgY3R4LnRyYW5zbGF0ZShXIC8gMiwgSCAvIDIpO1xuICAgICAgICAgIGNvbnN0IGN1cnJlbnRab29tID0gY29udHJvbHMuem9vbSA/PyAxO1xuICAgICAgICAgIGN0eC5zY2FsZShjdXJyZW50Wm9vbSwgY3VycmVudFpvb20pO1xuICAgICAgICAgIGN0eC50cmFuc2xhdGUoLWNhbVgsIC1jYW1ZKTtcblxuICAgICAgICAgIGVuZ2luZS5kcmF3KHRpbWUsIGNvbnRyb2xzLmxhYmVscyA/PyB0cnVlLCBjb250cm9scy5vcmJpdHMgPz8gdHJ1ZSwgY29udHJvbHMucmFkYXIgPz8gZmFsc2UsIGNvbnRyb2xzLnNjYW5BY3RpdmUgPz8gZmFsc2UpO1xuICAgICAgICAgIGN0eC5yZXN0b3JlKCk7XG4gICAgICAgIH1cbiAgICAgIH1cblxuICAgICAgYW5pbVJlZi5jdXJyZW50ID0gcmVxdWVzdEFuaW1hdGlvbkZyYW1lKGxvb3ApO1xuICAgIH07XG5cbiAgICBhbmltUmVmLmN1cnJlbnQgPSByZXF1ZXN0QW5pbWF0aW9uRnJhbWUobG9vcCk7XG5cbiAgICByZXR1cm4gKCkgPT4ge1xuICAgICAgd2luZG93LnJlbW92ZUV2ZW50TGlzdGVuZXIoJ3Jlc2l6ZScsIGhhbmRsZVJlc2l6ZSk7XG4gICAgICB3aW5kb3cucmVtb3ZlRXZlbnRMaXN0ZW5lcignbW91c2Vtb3ZlJywgaGFuZGxlTW91c2VNb3ZlKTtcbiAgICAgIGNhbnZhcy5yZW1vdmVFdmVudExpc3RlbmVyKCdjbGljaycsIGhhbmRsZUNsaWNrKTtcbiAgICAgIGNhbnZhcy5yZW1vdmVFdmVudExpc3RlbmVyKCd3aGVlbCcsIGhhbmRsZVdoZWVsKTtcbiAgICAgIGNhbmNlbEFuaW1hdGlvbkZyYW1lKGFuaW1SZWYuY3VycmVudCk7XG4gICAgfTtcbiAgfSwgW3NldHRpbmdzLnNpbXBsZVZpZXcsIGhhbmRsZUNsaWNrLCBoYW5kbGVNb3VzZU1vdmVdKTtcblxuICByZXR1cm4gKFxuICAgIDxjYW52YXNcbiAgICAgIHJlZj17Y2FudmFzUmVmfVxuICAgICAgaWQ9XCJzY2VuZVwiXG4gICAgICBjbGFzc05hbWU9XCJmaXhlZCBpbnNldC0wIHctZnVsbCBoLWZ1bGwgei0wXCJcbiAgICAvPlxuICApO1xufVxuIl19