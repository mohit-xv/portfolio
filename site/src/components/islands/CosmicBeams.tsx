/** @jsxImportSource react */
import { useEffect, useRef } from 'react';

/**
 * CosmicBeams — animated diagonal gold light shafts behind the hero section.
 * Canvas-based React island. Uses Astro `client:only="react"` so it never runs SSR.
 *
 * Colors mapped to site design tokens:
 *   --gold        #C0A062  →  DEEP  rgb(192, 160,  98)
 *   --gold-bright #E3C27D  →  MID   rgb(227, 194, 125)
 *   (above both)           →  CORE  rgb(255, 244, 209)  warm cream highlight
 *
 * Performance: beams are grouped by layer before drawing so ctx.filter changes
 * drop from 2×beams (36) to 2×layers (6) per frame.
 *
 * Accessibility: canvas is aria-hidden. prefers-reduced-motion skips RAF
 * and renders only the static background + glow.
 */

const CORE = [255, 244, 209] as const;
const MID  = [227, 194, 125] as const;
const DEEP = [192, 160,  98] as const;

const LAYERS          = 3;
const BEAMS_PER_LAYER = 6;

function c(rgb: readonly [number, number, number], a: number) {
  return `rgba(${rgb[0]},${rgb[1]},${rgb[2]},${a.toFixed(3)})`;
}

interface Beam {
  x: number;
  y: number;
  width: number;
  length: number;
  angleDeg: number;
  speed: number;
  baseOpacity: number;
  pulse: number;
  pulseSpeed: number;
  layer: number;
}

function makeBeam(w: number, h: number, layer: number): Beam {
  const t = layer / LAYERS; // 0.33 … 1.0
  return {
    x:           Math.random() * w,
    y:           Math.random() * h,
    width:       10 + layer * 8,             // 18 | 26 | 34 px
    length:      h * 2.4,
    angleDeg:    -30 - Math.random() * 10,   // –30° … –40°
    speed:       0.22 + t * 0.28 + Math.random() * 0.12,
    baseOpacity: 0.14 + t * 0.12 + Math.random() * 0.07,
    pulse:       Math.random() * Math.PI * 2,
    pulseSpeed:  0.007 + Math.random() * 0.010,
    layer,
  };
}

function drawBackground(ctx: CanvasRenderingContext2D, w: number, h: number) {
  // Warm-black ground — #0D0B09 (--ink) grading to amber-undertone at bottom
  const bg = ctx.createLinearGradient(0, 0, 0, h);
  bg.addColorStop(0,   '#0D0B09');
  bg.addColorStop(0.6, '#0F0C08');
  bg.addColorStop(1,   '#120D07');
  ctx.fillStyle = bg;
  ctx.fillRect(0, 0, w, h);

  // Top-centre gold glow — soft radial spotlight from above
  const glow = ctx.createRadialGradient(w * 0.5, 0, 0, w * 0.5, 0, h * 0.65);
  glow.addColorStop(0,   c(MID, 0.14));
  glow.addColorStop(0.4, c(MID, 0.06));
  glow.addColorStop(1,   c(DEEP, 0));
  ctx.fillStyle = glow;
  ctx.fillRect(0, 0, w, h);
}

function drawOuterGlow(ctx: CanvasRenderingContext2D, beam: Beam) {
  const pulsed = beam.baseOpacity * (0.70 + Math.sin(beam.pulse) * 0.38);
  ctx.save();
  ctx.translate(beam.x, beam.y);
  ctx.rotate((beam.angleDeg * Math.PI) / 180);

  const g = ctx.createLinearGradient(0, 0, 0, beam.length);
  g.addColorStop(0,    c(CORE, 0));
  g.addColorStop(0.15, c(CORE, pulsed * 0.40));
  g.addColorStop(0.42, c(MID,  pulsed * 1.00));
  g.addColorStop(0.55, c(CORE, pulsed * 0.75));
  g.addColorStop(0.80, c(DEEP, pulsed * 0.55));
  g.addColorStop(1,    c(DEEP, 0));

  ctx.fillStyle = g;
  ctx.fillRect(-beam.width / 2, 0, beam.width, beam.length);
  ctx.restore();
}

function drawCoreFilament(ctx: CanvasRenderingContext2D, beam: Beam) {
  const pulsed = beam.baseOpacity * (0.70 + Math.sin(beam.pulse) * 0.38);
  ctx.save();
  ctx.translate(beam.x, beam.y);
  ctx.rotate((beam.angleDeg * Math.PI) / 180);

  const g = ctx.createLinearGradient(0, 0, 0, beam.length);
  g.addColorStop(0,    c(CORE, 0));
  g.addColorStop(0.35, c(CORE, pulsed * 0.65));
  g.addColorStop(0.55, c(CORE, pulsed * 0.65));
  g.addColorStop(1,    c(CORE, 0));

  ctx.fillStyle = g;
  ctx.fillRect(-beam.width / 7, 0, beam.width / 3.5, beam.length);
  ctx.restore();
}

export default function CosmicBeams() {
  const ref = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = ref.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    let beams: Beam[] = [];
    let raf = 0;

    function resize() {
      const parent = canvas!.parentElement;
      if (!parent) return;
      const dpr = Math.min(window.devicePixelRatio ?? 1, 2);
      const w   = parent.offsetWidth;
      const h   = parent.offsetHeight;

      canvas!.width  = Math.round(w * dpr);
      canvas!.height = Math.round(h * dpr);
      canvas!.style.width  = `${w}px`;
      canvas!.style.height = `${h}px`;
      ctx!.setTransform(1, 0, 0, 1, 0, 0);
      ctx!.scale(dpr, dpr);

      beams = [];
      for (let layer = 1; layer <= LAYERS; layer++) {
        for (let i = 0; i < BEAMS_PER_LAYER; i++) {
          beams.push(makeBeam(w, h, layer));
        }
      }
    }

    function frame() {
      const w = canvas!.offsetWidth;
      const h = canvas!.offsetHeight;

      drawBackground(ctx!, w, h);

      // ── outer glows grouped by layer (3 filter changes) ──
      for (let layer = 1; layer <= LAYERS; layer++) {
        ctx!.filter = `blur(${2 + layer * 2}px)`;
        for (const b of beams) {
          if (b.layer !== layer) continue;
          b.y     -= b.speed;
          b.pulse += b.pulseSpeed;
          if (b.y + b.length < 0) {
            b.y = h + 10;
            b.x = Math.random() * w;
          }
          drawOuterGlow(ctx!, b);
        }
      }

      // ── core filaments grouped by layer (3 filter changes) ──
      for (let layer = 1; layer <= LAYERS; layer++) {
        ctx!.filter = `blur(${0.5 + layer * 0.4}px)`;
        for (const b of beams) {
          if (b.layer !== layer) continue;
          drawCoreFilament(ctx!, b);
        }
      }

      ctx!.filter = 'none';
      raf = requestAnimationFrame(frame);
    }

    resize();

    if (reduced) {
      // Static: background + glow only, no beams
      drawBackground(ctx, canvas.offsetWidth, canvas.offsetHeight);
    } else {
      raf = requestAnimationFrame(frame);
    }

    const ro = new ResizeObserver(resize);
    if (canvas.parentElement) ro.observe(canvas.parentElement);

    return () => {
      cancelAnimationFrame(raf);
      ro.disconnect();
    };
  }, []);

  return (
    <canvas
      ref={ref}
      aria-hidden="true"
      style={{
        position: 'absolute',
        inset: 0,
        width: '100%',
        height: '100%',
        pointerEvents: 'none',
        zIndex: 0,
        display: 'block',
      }}
    />
  );
}
