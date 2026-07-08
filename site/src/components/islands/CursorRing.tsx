/** @jsxImportSource react */
/**
 * CursorRing — a gold ring that lags behind the mouse cursor on fine-pointer
 * (non-touch) devices. Overlays the OS cursor rather than replacing it.
 *
 * The spring lag (stiffness: 155) creates a "weighted" trailing feel —
 * the ring catches up rather than snapping, which reads as premium.
 *
 * Hover expansion: when the ring enters an interactive element the ring
 * scales to 1.75× via a tighter spring, giving a magnetic "attractor" feel.
 *
 * Accessibility: aria-hidden, pointer-events: none — invisible to AT and
 * never intercepts clicks or keyboard focus.
 */
import { useEffect } from 'react';
import { motion, useMotionValue, useSpring } from 'motion/react';

const SIZE = 20;

export default function CursorRing() {
  const x     = useMotionValue(-100);
  const y     = useMotionValue(-100);
  const scale = useMotionValue(1);

  // Loose spring on position — lags noticeably behind the cursor
  const springX = useSpring(x, { stiffness: 155, damping: 17, restDelta: 0.001 });
  const springY = useSpring(y, { stiffness: 155, damping: 17, restDelta: 0.001 });
  // Tighter spring on scale — snaps to hover state quickly
  const springScale = useSpring(scale, { stiffness: 260, damping: 22, restDelta: 0.001 });

  useEffect(() => {
    // Only activate on fine-pointer (mouse / stylus) devices
    if (!window.matchMedia('(pointer: fine)').matches) return;

    const onMove = (e: MouseEvent) => {
      x.set(e.clientX);
      y.set(e.clientY);
    };

    // Event delegation — catches dynamically rendered React islands too
    const onOver = (e: MouseEvent) => {
      if ((e.target as Element).closest('a, button, [role="button"], label')) {
        scale.set(1.75);
      }
    };
    const onOut = (e: MouseEvent) => {
      const rel = e.relatedTarget as Element | null;
      if (!rel?.closest('a, button, [role="button"], label')) {
        scale.set(1);
      }
    };

    window.addEventListener('mousemove', onMove);
    window.addEventListener('mouseover', onOver);
    window.addEventListener('mouseout',  onOut);

    return () => {
      window.removeEventListener('mousemove', onMove);
      window.removeEventListener('mouseover', onOver);
      window.removeEventListener('mouseout',  onOut);
    };
  }, [x, y, scale]);

  return (
    <motion.div
      aria-hidden="true"
      style={{
        position:      'fixed',
        // Offset by half SIZE so the ring is centred on the cursor
        top:           -(SIZE / 2),
        left:          -(SIZE / 2),
        width:         SIZE,
        height:        SIZE,
        borderRadius:  '50%',
        border:        '1px solid rgba(192, 160, 98, 0.48)',
        pointerEvents: 'none',
        zIndex:        99999,
        x:             springX,
        y:             springY,
        scale:         springScale,
      }}
    />
  );
}
