"use client";

import { useEffect, useRef, useState } from "react";
import styles from "./preloader.module.css";

type Star = {
  angle: number;
  depth: number;
  speed: number;
  hue: number;
  saturation: number;
  lightness: number;
  layer: number;
};

function starCountFor(width: number) {
  if (width < 700) return 90;
  if (width < 1280) return 170;
  return 240;
}

// Democratic Pulse palette, not a generic starfield: soft white and EU blue carry the
// streaks, EU yellow/gold is a rare accent (~4%) that echoes the "start here" treatment
// on the homepage. No violet/indigo — every hue here sits between white and EU blue.
function randomStarColor() {
  const roll = Math.random();
  if (roll > 0.96) return { hue: 45, saturation: 90, lightness: 70 }; // EU yellow/gold
  if (roll > 0.76) return { hue: 220, saturation: 85, lightness: 60 }; // EU blue
  if (roll > 0.4) return { hue: 216, saturation: 65, lightness: 80 }; // lighter blue
  return { hue: 212, saturation: 25, lightness: 95 }; // soft white
}

function createStars(count: number): Star[] {
  return Array.from({ length: count }, () => ({
    angle: Math.random() * Math.PI * 2,
    depth: Math.pow(Math.random(), 1.9),
    speed: 0.36 + Math.random() * 0.82,
    ...randomStarColor(),
    layer: Math.random() > 0.78 ? 2 : Math.random() > 0.42 ? 1 : 0,
  }));
}

/**
 * Single canvas, single rAF loop, drawn imperatively — no React state per frame.
 * Star strokes use additive blending (`globalCompositeOperation: "lighter"`) for the
 * cinematic glow instead of per-star `shadowBlur`, which is a well-known severe Canvas2D
 * cost (unaccelerated software blur, paid per draw call). Removing it is the single
 * biggest performance fix here — everything else is a minor tune.
 *
 * Self-contained site-entry intro: owns its own reveal/unmount lifecycle so it can sit
 * in front of any page without that page knowing it exists. The optional `onExit` fires
 * once, at the instant the fade-out begins — the single handoff point a page can hook
 * into to start its own post-preloader entrance, without the preloader knowing anything
 * about what happens next.
 */
export default function HyperspacePreloader({ onExit }: { onExit?: () => void } = {}) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [revealing, setRevealing] = useState(false);
  const [mounted, setMounted] = useState(true);
  const onExitRef = useRef(onExit);

  useEffect(() => {
    onExitRef.current = onExit;
  });

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const context = canvas.getContext("2d");
    if (!context) return;

    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    if (reducedMotion) {
      // Skip the star field entirely for reduced-motion users — a short, plain fade is
      // the whole "animation." No canvas work, no rAF loop.
      const revealTimer = window.setTimeout(() => {
        setRevealing(true);
        onExitRef.current?.();
      }, 200);
      const completeTimer = window.setTimeout(() => setMounted(false), 500);
      return () => {
        window.clearTimeout(revealTimer);
        window.clearTimeout(completeTimer);
      };
    }

    const duration = 3500;
    const launchAt = 2740;
    let rafId = 0;
    let launched = false;
    let width = 0;
    let height = 0;
    let stars: Star[] = [];
    let auraGradient: CanvasGradient | null = null;
    let coreGradient: CanvasGradient | null = null;
    const start = performance.now();
    let resizeTimer = 0;

    const buildGradients = () => {
      const cx = width / 2;
      const cy = height / 2;
      const radius = Math.hypot(width, height) * 0.67;
      // Both gradients are built from the site's literal EU-blue value (#003399) so the
      // vanishing point reads as a richer extension of the brand blue, not a generic glow.
      const aura = context.createRadialGradient(cx, cy, 0, cx, cy, radius);
      aura.addColorStop(0, "rgba(0,51,153,.24)");
      aura.addColorStop(0.26, "rgba(0,40,120,.12)");
      aura.addColorStop(1, "rgba(3,7,19,0)");
      auraGradient = aura;

      const coreRadius = Math.min(width, height) * 0.22;
      const core = context.createRadialGradient(cx, cy, 0, cx, cy, coreRadius);
      core.addColorStop(0, "rgba(214,228,255,1)");
      core.addColorStop(0.18, "rgba(0,51,153,.46)");
      core.addColorStop(1, "rgba(0,51,153,0)");
      coreGradient = core;
    };

    const applyCanvasSize = () => {
      const ratio = Math.min(window.devicePixelRatio || 1, 2);
      width = window.innerWidth;
      height = window.innerHeight;
      canvas.width = Math.floor(width * ratio);
      canvas.height = Math.floor(height * ratio);
      canvas.style.width = `${width}px`;
      canvas.style.height = `${height}px`;
      context.setTransform(ratio, 0, 0, ratio, 0, 0);
      buildGradients();
    };

    const ensureStarCount = () => {
      const target = starCountFor(width);
      if (stars.length !== target) stars = createStars(target);
    };

    // Debounced: a resize only reflows the canvas + regenerates the star field if the
    // star-count tier actually changes (e.g. crossing the mobile breakpoint) — an
    // in-place viewport resize (mobile toolbar show/hide, etc.) never teleports particles.
    const onResize = () => {
      window.clearTimeout(resizeTimer);
      resizeTimer = window.setTimeout(() => {
        applyCanvasSize();
        ensureStarCount();
      }, 120);
    };

    const render = (now: number) => {
      const elapsed = now - start;
      const progress = Math.min(elapsed / duration, 1);
      const acceleration = 0.06 + Math.pow(Math.min(progress / 0.8, 1), 2.5) * 2.15;
      const cx = width / 2;
      const cy = height / 2;
      const radius = Math.hypot(width, height) * 0.67;

      context.globalCompositeOperation = "source-over";
      context.globalAlpha = 1;
      context.fillStyle = "#071026";
      context.fillRect(0, 0, width, height);
      if (auraGradient) {
        context.fillStyle = auraGradient;
        context.fillRect(0, 0, width, height);
      }

      context.globalCompositeOperation = "lighter";
      for (let i = 0; i < stars.length; i++) {
        const star = stars[i];
        const layerSpeed = star.layer === 2 ? 1.28 : star.layer === 1 ? 0.84 : 0.5;
        const depth = (star.depth + elapsed * 0.0001 * star.speed * layerSpeed * acceleration) % 1;
        const previousDepth = Math.max(0, depth - (0.003 + acceleration * (0.009 + star.layer * 0.007)) * star.speed);
        const d2 = depth * depth;
        const pd2 = previousDepth * previousDepth;
        const x1 = cx + Math.cos(star.angle) * pd2 * radius;
        const y1 = cy + Math.sin(star.angle) * pd2 * radius;
        const x2 = cx + Math.cos(star.angle) * d2 * radius;
        const y2 = cy + Math.sin(star.angle) * d2 * radius;
        const alpha = Math.min(0.72, 0.13 + depth * 0.62);
        const length = Math.hypot(x2 - x1, y2 - y1);
        context.globalAlpha = alpha;
        context.strokeStyle = `hsl(${star.hue}, ${star.saturation}%, ${star.lightness}%)`;
        context.lineWidth = Math.max(0.45, Math.min(2.6, 0.42 + length * 0.075 + star.layer * 0.18));
        context.beginPath();
        context.moveTo(x1, y1);
        context.lineTo(x2, y2);
        context.stroke();
      }

      context.globalCompositeOperation = "source-over";
      context.globalAlpha = Math.max(0, progress - 0.35) * 0.55;
      if (coreGradient) {
        context.fillStyle = coreGradient;
        context.fillRect(0, 0, width, height);
      }
      context.globalAlpha = 1;

      if (elapsed >= launchAt && !launched) {
        launched = true;
        setRevealing(true);
        onExitRef.current?.();
      }
      if (progress < 1) {
        rafId = requestAnimationFrame(render);
      } else {
        setMounted(false);
      }
    };

    applyCanvasSize();
    ensureStarCount();
    window.addEventListener("resize", onResize, { passive: true });
    rafId = requestAnimationFrame(render);

    return () => {
      cancelAnimationFrame(rafId);
      window.clearTimeout(resizeTimer);
      window.removeEventListener("resize", onResize);
    };
  }, []);

  if (!mounted) return null;

  return (
    <div
      className={`${styles.preloader} ${revealing ? styles.preloaderRevealing : ""}`}
      role="status"
      aria-label="Loading"
    >
      <canvas ref={canvasRef} className={styles.preloaderCanvas} />
      <div className={styles.preloaderVignette} />
    </div>
  );
}
