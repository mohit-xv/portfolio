/**
 * Shared Motion constants — master plan §3 motion language.
 * Slow and confident: 0.8–1.2s expo-out. Springs for gestures only.
 */

export const EASE_EXPO = [0.22, 1, 0.36, 1] as const

export const DUR = {
  fast:    0.30,
  medium:  0.60,
  slow:    0.90,
  glacial: 1.20,
} as const

/** Line-by-line masked reveal: text slides up from behind overflow:hidden */
export const MASK_VARIANTS = {
  hidden:  { y: '105%' },
  visible: { y: '0%' },
} as const

/** Fade + slight upward drift — for blocks, eyebrows, CTAs */
export const FADE_UP_VARIANTS = {
  hidden:  { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0  },
} as const

/** Settle from slight overscan — for cards and exhibit panels */
export const SCALE_SETTLE_VARIANTS = {
  hidden:  { opacity: 0, scale: 1.04 },
  visible: { opacity: 1, scale: 1.00 },
} as const

/** Stagger container — children animate in sequence */
export const STAGGER_CONTAINER_VARIANTS = {
  hidden:  {},
  visible: { transition: { staggerChildren: 0.08, delayChildren: 0 } },
} as const

/** Shared transition — used across all reveal variants */
export const transition = (delay = 0, duration = DUR.slow) => ({
  duration,
  ease: EASE_EXPO,
  delay,
})
