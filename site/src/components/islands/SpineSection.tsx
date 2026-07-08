/** @jsxImportSource react */
/**
 * SpineSection — scroll-pinned Selected Work section.
 *
 * Desktop (>768px): 200vh outer (scroll travel) + 100vh sticky inner.
 * The exhibit cards drift in from each side as you scroll through the pin.
 *
 * The gold flowing ribbon is owned by the page-level FlowingPath island —
 * not here. This component handles only the sticky layout and card animations.
 *
 * Mobile (≤768px): normal-flow stack, hairline accent, InView reveals.
 * Reduced motion: immediate composed state, no animation.
 */
import { useRef } from 'react';
import {
  motion,
  useScroll,
  useTransform,
  useReducedMotion,
  useInView,
} from 'motion/react';
import { EASE_EXPO, DUR } from '../../lib/motion';

// Exhibit card entrance windows (desktop scroll progress 0–1)
const EX1_ENTER = [0.06, 0.44] as const; // left card — arrives early
const EX2_ENTER = [0.22, 0.58] as const; // right card — staggered after

// ── Exhibit data ──────────────────────────────────────────────────────────────
const EXHIBITS = [
  {
    number:     'No. I',
    title:      'This Website',
    discipline: 'FinOps · Infrastructure · DevOps',
    statALabel: 'Running cost', statA: '₹0 / mo',
    statBLabel: 'Stack',        statB: 'Astro · AWS S3 · CloudFront · Terraform',
    href:       '/work/this-website',
  },
  {
    number:     'No. II',
    title:      'Stock Screener',
    discipline: 'On-demand Infrastructure · Python · FinOps',
    statALabel: 'Scan speed',   statA: '400 ms',
    statBLabel: 'Cost per run', statB: '₹0.002',
    href:       '/work/stock-screener',
  },
] as const;

type Exhibit = (typeof EXHIBITS)[number];

const CARD: React.CSSProperties = {
  display:        'flex',
  flexDirection:  'column',
  gap:            '1rem',
  padding:        'clamp(1.5rem, 3vw, 3rem) clamp(1.25rem, 2.5vw, 2rem)',
  background:     'var(--smoke)',
  border:         '1px solid color-mix(in srgb, var(--gold) 15%, transparent)',
  borderRadius:   '2px',
  textDecoration: 'none',
  color:          'var(--bone)',
  position:       'relative',
  zIndex:         2,
};

// ── Card inner content ────────────────────────────────────────────────────────
function CardInner({ ex }: { ex: Exhibit }) {
  return (
    <>
      <span style={{
        fontFamily:    'var(--font-mono)',
        fontSize:      'var(--text-xs)',
        letterSpacing: 'var(--tracking-widest)',
        color:         'var(--gold)',
        textTransform: 'uppercase',
      }}>
        {ex.number}
      </span>

      <span style={{
        fontFamily:    'var(--font-display)',
        fontSize:      'var(--text-2xl)',
        fontWeight:    400,
        lineHeight:    'var(--leading-snug)',
        letterSpacing: 'var(--tracking-tight)',
      }}>
        {ex.title}
      </span>

      <span style={{
        fontFamily:    'var(--font-mono)',
        fontSize:      'var(--text-xs)',
        letterSpacing: 'var(--tracking-wide)',
        color:         'color-mix(in srgb, var(--bone) 50%, transparent)',
      }}>
        {ex.discipline}
      </span>

      <dl style={{
        display:             'grid',
        gridTemplateColumns: 'auto 1fr',
        gap:                 '0.5rem 1.5rem',
        marginTop:           'auto',
      }}>
        <dt style={{
          fontFamily:    'var(--font-mono)',
          fontSize:      'var(--text-xs)',
          letterSpacing: 'var(--tracking-wide)',
          color:         'color-mix(in srgb, var(--bone) 40%, transparent)',
          textTransform: 'uppercase',
          alignSelf:     'center',
        }}>
          {ex.statALabel}
        </dt>
        <dd style={{
          fontFamily: 'var(--font-mono)',
          fontSize:   'var(--text-lg)',
          color:      'var(--gold-bright)',
        }}>
          {ex.statA}
        </dd>
        <dt style={{
          fontFamily:    'var(--font-mono)',
          fontSize:      'var(--text-xs)',
          letterSpacing: 'var(--tracking-wide)',
          color:         'color-mix(in srgb, var(--bone) 40%, transparent)',
          textTransform: 'uppercase',
          alignSelf:     'center',
        }}>
          {ex.statBLabel}
        </dt>
        <dd style={{
          fontFamily: 'var(--font-ui)',
          fontSize:   'var(--text-sm)',
          color:      'var(--bone)',
        }}>
          {ex.statB}
        </dd>
      </dl>

      <span style={{
        fontFamily:    'var(--font-mono)',
        fontSize:      'var(--text-xs)',
        letterSpacing: 'var(--tracking-wider)',
        color:         'var(--gold)',
        textTransform: 'uppercase',
        marginTop:     '1rem',
      }}>
        Read the case study →
      </span>
    </>
  );
}

// ── Mobile exhibit — rises into view via useInView ────────────────────────────
function MobileExhibit({ ex }: { ex: Exhibit }) {
  const ref     = useRef<HTMLDivElement>(null);
  const inView  = useInView(ref, { once: true, margin: '-8% 0px' });
  const reduced = useReducedMotion();

  return (
    <div ref={ref}>
      <motion.a
        href={ex.href}
        style={CARD}
        initial={{ opacity: 0, y: 24 }}
        animate={(reduced ?? false) || inView ? { opacity: 1, y: 0 } : { opacity: 0, y: 24 }}
        transition={{ duration: DUR.slow, ease: EASE_EXPO }}
        whileHover={{ y: -2, transition: { duration: DUR.fast } }}
      >
        <CardInner ex={ex} />
      </motion.a>
    </div>
  );
}

// ── Chapter heading ───────────────────────────────────────────────────────────
function ChapterHead() {
  return (
    <div style={{ position: 'relative', zIndex: 2 }}>
      <p style={{
        fontFamily:    'var(--font-mono)',
        fontSize:      'var(--text-xs)',
        letterSpacing: 'var(--tracking-widest)',
        textTransform: 'uppercase',
        color:         'color-mix(in srgb, var(--gold) 80%, transparent)',
        marginBottom:  '0.75rem',
      }}>
        Part I
      </p>
      <h2 style={{
        fontFamily:    'var(--font-display)',
        fontSize:      'var(--text-4xl)',
        fontWeight:    300,
        letterSpacing: 'var(--tracking-tight)',
        color:         'var(--bone)',
      }}>
        Selected Work
      </h2>
    </div>
  );
}

// ── Root component ────────────────────────────────────────────────────────────
export default function SpineSection() {
  const outerRef = useRef<HTMLDivElement>(null);
  const reduced  = useReducedMotion();

  // Scroll progress over the 200vh outer container (0 → 1 during the pin).
  const { scrollYProgress } = useScroll({
    target: outerRef,
    offset: ['start start', 'end end'],
  });

  // Exhibit card entrance transforms (desktop only)
  const ex1Opacity = useTransform(scrollYProgress, [...EX1_ENTER], [0, 1]);
  const ex1X       = useTransform(scrollYProgress, [...EX1_ENTER], [-36, 0]);
  const ex2Opacity = useTransform(scrollYProgress, [...EX2_ENTER], [0, 1]);
  const ex2X       = useTransform(scrollYProgress, [...EX2_ENTER], [36, 0]);

  const desktopEx1Style = (reduced ?? false)
    ? { ...CARD, opacity: 1 }
    : { ...CARD, opacity: ex1Opacity, x: ex1X };

  const desktopEx2Style = (reduced ?? false)
    ? { ...CARD, opacity: 1 }
    : { ...CARD, opacity: ex2Opacity, x: ex2X };

  return (
    <>
      {/* ════════════════════════════════════════════════════════════════
          Desktop (>768px) — 200vh outer + 100vh sticky inner
          CSS class .spine-desktop is display:none at ≤768px.
          ════════════════════════════════════════════════════════════════ */}
      <div
        ref={outerRef}
        className="spine-desktop"
        style={{ position: 'relative', height: '200vh' }}
      >
        <div style={{
          position:       'sticky',
          top:            0,
          height:         '100vh',
          display:        'flex',
          flexDirection:  'column',
          justifyContent: 'center',
          gap:            'clamp(1.5rem, 4vh, 3rem)',
          padding:        '0 var(--gutter)',
          overflow:       'hidden',
        }}>

          {/* Chapter heading */}
          <div style={{ maxWidth: 'var(--max-w)', margin: '0 auto', width: '100%' }}>
            <ChapterHead />
          </div>

          {/* Exhibit cards — 2-column grid */}
          <div style={{
            maxWidth:            'var(--max-w)',
            margin:              '0 auto',
            width:               '100%',
            display:             'grid',
            gridTemplateColumns: '1fr 1fr',
            gap:                 'clamp(2rem, 5vw, 4rem)',
            position:            'relative',
          }}>
            {/* Exhibit I — drifts in from the left */}
            {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
            <motion.a href={EXHIBITS[0].href} style={desktopEx1Style as any}
              whileHover={{ y: -2, transition: { duration: DUR.fast } }}>
              <CardInner ex={EXHIBITS[0]} />
            </motion.a>

            {/* Exhibit II — drifts in from the right, staggered */}
            {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
            <motion.a href={EXHIBITS[1].href} style={desktopEx2Style as any}
              whileHover={{ y: -2, transition: { duration: DUR.fast } }}>
              <CardInner ex={EXHIBITS[1]} />
            </motion.a>
          </div>
        </div>
      </div>

      {/* ════════════════════════════════════════════════════════════════
          Mobile (≤768px) — normal flow, hairline accent, rise reveals
          CSS class .spine-mobile is display:none above 768px.
          ════════════════════════════════════════════════════════════════ */}
      <div className="spine-mobile">
        <div style={{
          maxWidth:     'var(--max-w)',
          margin:       '0 auto',
          padding:      '0 var(--gutter)',
          marginBottom: 'var(--space-12)',
        }}>
          <ChapterHead />
        </div>

        <div style={{
          maxWidth:      'var(--max-w)',
          margin:        '0 auto',
          padding:       '0 var(--gutter)',
          display:       'flex',
          flexDirection: 'column',
          gap:           'var(--space-6)',
          position:      'relative',
        }}>
          {/* Hairline — mobile stand-in for the flowing path */}
          <div
            aria-hidden="true"
            style={{
              position:      'absolute',
              left:          '50%',
              top:           0,
              bottom:        0,
              width:         '1px',
              transform:     'translateX(-50%)',
              background:    'linear-gradient(to bottom, transparent, var(--gold) 15%, var(--gold) 85%, transparent)',
              opacity:       0.25,
              pointerEvents: 'none',
            }}
          />
          {EXHIBITS.map(ex => (
            <MobileExhibit key={ex.href} ex={ex} />
          ))}
        </div>
      </div>
    </>
  );
}
