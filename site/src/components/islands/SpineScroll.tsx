/** @jsxImportSource react */
/**
 * SpineScroll — scroll-drawn gold spine for the SelectedWork section.
 *
 * Renders a full-stage transparent overlay (position:absolute; inset:0) so
 * useScroll can track the section's viewport progress via the ref.
 * The SVG spine is centred at left:50% inside that overlay.
 *
 * pathLength: 0 (section not yet visible) → 1 (fully drawn) as user scrolls.
 * Spring-smoothed for an organic, weighted feel.
 * prefers-reduced-motion: path is drawn at full length immediately.
 */
import { useRef } from 'react';
import {
  motion,
  useScroll,
  useTransform,
  useSpring,
  useReducedMotion,
} from 'motion/react';

export default function SpineScroll() {
  const stageRef = useRef<HTMLDivElement>(null);
  const prefersReduced = useReducedMotion();

  // Track when the stage div (= the section) passes through the viewport
  const { scrollYProgress } = useScroll({
    target: stageRef,
    offset: ['start 85%', 'end 20%'],
  });

  const rawLength = useTransform(scrollYProgress, [0, 1], [0, 1]);

  // Spring gives the path a slight lag — it "draws" behind your scroll then
  // catches up, which reads as weight rather than mechanical tracking
  const springLength = useSpring(rawLength, {
    stiffness: 50,
    damping: 18,
    restDelta: 0.001,
  });

  // Reduced-motion: show the full line immediately (no drawing animation)
  const pathLengthValue: number | typeof springLength = prefersReduced
    ? 1
    : springLength;

  return (
    <div
      ref={stageRef}
      style={{
        position: 'absolute',
        inset: 0,
        pointerEvents: 'none',
        zIndex: 0,
      }}
      aria-hidden="true"
    >
      <svg
        viewBox="0 0 2 800"
        preserveAspectRatio="none"
        xmlns="http://www.w3.org/2000/svg"
        aria-hidden="true"
        style={{
          position: 'absolute',
          left: '50%',
          top: 0,
          width: '2px',
          height: '100%',
          transform: 'translateX(-50%)',
          display: 'block',
          overflow: 'visible',
        }}
      >
        {/* Soft glow halo behind the core filament */}
        <motion.path
          d="M1,0 C1,200 1,600 1,800"
          stroke="var(--gold)"
          strokeWidth="5"
          fill="none"
          strokeLinecap="round"
          style={{
            pathLength: pathLengthValue,
            opacity: 0.18,
            filter: 'blur(2px)',
          }}
        />

        {/* Core filament — bright centre of the beam */}
        <motion.path
          d="M1,0 C1,200 1,600 1,800"
          stroke="var(--gold-bright)"
          strokeWidth="1"
          fill="none"
          strokeLinecap="round"
          style={{
            pathLength: pathLengthValue,
            opacity: 0.65,
          }}
        />
      </svg>
    </div>
  );
}
