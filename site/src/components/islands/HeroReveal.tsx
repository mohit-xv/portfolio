/** @jsxImportSource react */
/**
 * HeroReveal — masked line-by-line headline reveal.
 * Handles ONLY the h1; the rest of the hero uses CSS transitions
 * triggered by the 'cold-open-complete' event (see Hero.astro <script>).
 *
 * Uses inline CSS custom property references so Astro's scoped CSS is
 * never a concern — all design tokens work as inline style values.
 */
import { useState, useEffect } from 'react';
import { motion, useAnimation, useReducedMotion } from 'motion/react';
import { EASE_EXPO, DUR } from '../../lib/motion';

function MaskLine({
  children,
  delay,
  controls,
  style,
}: {
  children: React.ReactNode;
  delay: number;
  controls: ReturnType<typeof useAnimation>;
  style?: React.CSSProperties;
}) {
  return (
    <span style={{ display: 'block', overflow: 'hidden', lineHeight: 'inherit', ...style }}>
      <motion.span
        style={{ display: 'block' }}
        animate={controls}
        initial="hidden"
        variants={{
          hidden:  { y: '105%' },
          visible: { y: '0%'   },
        }}
        transition={{ duration: DUR.slow, ease: EASE_EXPO, delay }}
      >
        {children}
      </motion.span>
    </span>
  );
}

export default function HeroReveal() {
  const [ready, setReady] = useState(false);
  const reduced = useReducedMotion();
  const controls = useAnimation();

  useEffect(() => {
    const prefers = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const alreadyShown = sessionStorage.getItem('cold-open-shown');

    // On a repeat visit this session, cold open is skipped → animate immediately
    // alreadyShown is set to '1' by ColdOpen BEFORE dispatching the event,
    // but on a subsequent navigation in the same session, the value is '1'
    // and ColdOpen skips → fires event synchronously.
    // So we always wait for the event; it fires either immediately or after cold open.
    if (prefers || alreadyShown) {
      setReady(true);
      return;
    }

    const handler = () => setReady(true);
    window.addEventListener('cold-open-complete', handler, { once: true });
    return () => window.removeEventListener('cold-open-complete', handler);
  }, []);

  useEffect(() => {
    if (!ready) return;
    if (reduced) {
      controls.set('visible');
    } else {
      controls.start('visible');
    }
  }, [ready, reduced, controls]);

  return (
    <h1
      style={{
        fontFamily: 'var(--font-display)',
        fontSize:   'var(--text-5xl)',
        fontWeight: 300,
        lineHeight: 'var(--leading-tight)',
        letterSpacing: 'var(--tracking-tight)',
        color: 'var(--heading-warm)',
        maxWidth: '14ch',
        margin: 0,
      }}
    >
      <MaskLine delay={0.05} controls={controls}>
        Pay for Compute,
      </MaskLine>
      <MaskLine delay={0.14} controls={controls}>
        not{' '}
        <em
          style={{
            fontStyle:  'italic',
            fontWeight: 400,
            color:      'var(--gold-bright)',
          }}
        >
          waste
        </em>
        .
      </MaskLine>
    </h1>
  );
}
