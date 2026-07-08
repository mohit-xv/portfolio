/** @jsxImportSource react */
/**
 * ColdOpen — title card shown once per session (§3 master plan).
 * Max 1.6s, skippable, dispatches 'cold-open-complete' when done.
 * Honoured by HeroReveal: hero text waits for this event before animating.
 *
 * Reduced motion: skips immediately, fires event with 0 delay.
 */
import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';

const SESSION_KEY = 'cold-open-shown';
const HOLD_MS     = 1400; // visible duration before exit begins

export default function ColdOpen() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const alreadyShown = sessionStorage.getItem(SESSION_KEY);

    if (alreadyShown || reduced) {
      // Skip — signal hero immediately
      window.dispatchEvent(new CustomEvent('cold-open-complete'));
      return;
    }

    // First visit this session — show the card
    setVisible(true);
    sessionStorage.setItem(SESSION_KEY, '1');

    const timer = setTimeout(() => {
      setVisible(false);
      // Event fires slightly after exit animation starts so hero reveal
      // begins exactly when the overlay starts fading out (feels continuous)
      setTimeout(() => {
        window.dispatchEvent(new CustomEvent('cold-open-complete'));
      }, 200);
    }, HOLD_MS);

    return () => clearTimeout(timer);
  }, []);

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          key="cold-open"
          initial={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
          onClick={() => {
            setVisible(false);
            window.dispatchEvent(new CustomEvent('cold-open-complete'));
          }}
          style={{
            position: 'fixed',
            inset: 0,
            zIndex: 10000,
            backgroundColor: '#0D0B09',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '1rem',
            cursor: 'pointer',
          }}
          aria-label="Click to skip intro"
          role="button"
          tabIndex={0}
          onKeyDown={(e) => {
            if (e.key === 'Enter' || e.key === ' ') {
              setVisible(false);
              window.dispatchEvent(new CustomEvent('cold-open-complete'));
            }
          }}
        >
          {/* Wordmark */}
          <motion.p
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1], delay: 0.1 }}
            style={{
              fontFamily: 'var(--font-mono)',
              fontSize: 'var(--text-xs)',
              letterSpacing: 'var(--tracking-widest)',
              textTransform: 'uppercase',
              color: 'color-mix(in srgb, var(--bone) 35%, transparent)',
            }}
          >
            Mohit Singh
          </motion.p>

          {/* Tagline */}
          <div style={{ overflow: 'hidden' }}>
            <motion.p
              initial={{ y: '105%' }}
              animate={{ y: '0%' }}
              transition={{ duration: 0.9, ease: [0.22, 1, 0.36, 1], delay: 0.18 }}
              style={{
                fontFamily: 'var(--font-display)',
                fontSize: 'clamp(1.5rem, 4vw, 3rem)',
                fontWeight: 300,
                letterSpacing: 'var(--tracking-tight)',
                color: 'var(--bone)',
              }}
            >
              Pay for Compute,
            </motion.p>
          </div>
          <div style={{ overflow: 'hidden' }}>
            <motion.p
              initial={{ y: '105%' }}
              animate={{ y: '0%' }}
              transition={{ duration: 0.9, ease: [0.22, 1, 0.36, 1], delay: 0.26 }}
              style={{
                fontFamily: 'var(--font-display)',
                fontSize: 'clamp(1.5rem, 4vw, 3rem)',
                fontWeight: 300,
                letterSpacing: 'var(--tracking-tight)',
                color: 'var(--bone)',
              }}
            >
              not{' '}
              <em style={{ fontStyle: 'italic', fontWeight: 400, color: 'var(--gold-bright)', textShadow: '0 0 28px rgba(227, 194, 125, 0.32), 0 0 60px rgba(192, 160, 98, 0.14)' }}>
                waste
              </em>
              .
            </motion.p>
          </div>

          {/* Skip hint — fades in late */}
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5, ease: 'easeOut', delay: 0.9 }}
            style={{
              position: 'absolute',
              bottom: 'var(--space-12)',
              fontFamily: 'var(--font-mono)',
              fontSize: 'var(--text-2xs)',
              letterSpacing: 'var(--tracking-widest)',
              textTransform: 'uppercase',
              color: 'color-mix(in srgb, var(--bone) 20%, transparent)',
            }}
          >
            Click to skip
          </motion.p>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
