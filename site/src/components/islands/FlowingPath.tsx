/** @jsxImportSource react */
/**
 * FlowingPath — cinematic far-orbit gold ribbon.
 *
 * A single cubic bezier arc, fixed to the viewport, that draws progressively
 * as the user scrolls the homepage.
 *
 * ── Cinematic framing ────────────────────────────────────────────────────────
 *
 * The camera is positioned at the far-right edge of a massive planetary orbit.
 * The orbit is so large that:
 *   - Its rightmost turning point is off-screen right (beyond x=1440)
 *   - Its leftmost turning point is also off-screen left (beyond x=0)
 * We see only the near-right arc as it sweeps across the viewport.
 *
 * Entry · (1100, 0) — top of viewport, right of hero headline.
 *   The orbit is heading right here — we're on the near side watching it
 *   curve away toward the top-right.
 *
 * Bow · C 1500,40 1600,140 — exits viewport right (~x=1440 at y≈80).
 *   The orbit curves off-screen right, like watching a massive ring arc
 *   away from the spacecraft. Peak at ~(1550, 150) off-screen.
 *
 * Return · 1480,300 — re-enters from the right edge at y≈330.
 *   The orbit comes back into frame after its off-screen excursion.
 *
 * Sweep · C 1360,460 0,580 -100,700 — long diagonal left-down exit.
 *   The main visible arc of the orbit — sweeping from upper-right to
 *   lower-left across the full page, exiting off-screen bottom-left.
 *
 * ── Rendering ────────────────────────────────────────────────────────────────
 *
 * mix-blend-mode: screen
 *   On dark backgrounds (--ink, --smoke): gold shows clearly.
 *   On bone/light text: screen-blending gold over near-white ≈ near-invisible.
 *   Interacts with CosmicBeams (z-index: -1) for a luminous live effect.
 *
 * Three layers: outer bloom → mid corona → sharp filament.
 * Reduced motion: path is immediately fully drawn.
 */
import { useScroll, useTransform, useSpring, useReducedMotion, motion } from 'motion/react';

// ── Path ──────────────────────────────────────────────────────────────────────
//
// Two-segment path — spacecraft viewpoint of a massive orbit.
//
//   M 1100,0          — entry: top of viewport, right of hero headline
//   C 1500,40         — C1: pulls right, line heads toward top-right corner
//     1600,140        — C2: apex off-screen right (~x=1550, y=150)
//     1480,300        — segment end: re-enters viewport from right edge (~y=330)
//   C 1360,460        — C3: sweeping left and down
//     0,580           — C4: long leftward pull across full viewport width
//     -100,700        — exit: lower-left, off-screen
//
const PATH = 'M 1100,70 C 1500,110 1600,200 1480,340 C 1360,680 0,800 -100,920';

// Drawing starts at 5% scroll (after the cold-open),
// completes at 97% — full arc visible before reaching the absolute page-bottom.
const SCROLL_START = 0.05;
const SCROLL_END   = 0.97;

export default function FlowingPath() {
  const reduced = useReducedMotion();

  const { scrollYProgress } = useScroll();

  const rawLen    = useTransform(scrollYProgress, [SCROLL_START, SCROLL_END], [0, 1]);
  // Physical spring — the ribbon trails rapid scroll then catches up,
  // like a comet following its orbital path.
  const springLen = useSpring(rawLen, { stiffness: 65, damping: 24, restDelta: 0.001 });
  const pathLen   = (reduced ?? false) ? 1 : springLen;

  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 1440 900"
      preserveAspectRatio="none"
      style={{
        position:      'fixed',
        inset:         0,
        width:         '100vw',
        height:        '100vh',
        pointerEvents: 'none',
        zIndex:        0,
        overflow:      'visible',
        mixBlendMode:  'screen',
        // Force GPU compositor layer — prevents mix-blend-mode from blocking
        // layer promotion and eliminates per-frame software rasterisation cost.
        willChange:    'transform',
        transform:     'translateZ(0)',
      }}
    >
      {/* Outer bloom — wide diffuse ambience */}
      <motion.path
        d={PATH}
        fill="none"
        stroke="#C0A062"
        strokeWidth={52}
        style={{ pathLength: pathLen, opacity: 0.055, filter: 'blur(22px)' }}
      />

      {/* Mid corona — tighter glow ring */}
      <motion.path
        d={PATH}
        fill="none"
        stroke="#C0A062"
        strokeWidth={11}
        strokeLinecap="round"
        style={{ pathLength: pathLen, opacity: 0.15, filter: 'blur(4px)' }}
      />

      {/* Sharp filament — the drawn orbital line */}
      <motion.path
        d={PATH}
        fill="none"
        stroke="#E3C27D"
        strokeWidth={1.5}
        strokeLinecap="round"
        style={{ pathLength: pathLen, opacity: 0.90 }}
      />
    </svg>
  );
}
