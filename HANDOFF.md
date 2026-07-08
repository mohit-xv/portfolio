# Phase 4 Handoff — SpineScroll Roller-Coaster Redesign

**Date:** 2026-07-07  
**Context at pause:** ~53% (106.5k / 200k tokens) — session still alive but pausing cleanly.  
**Resume trigger:** After 5-hour rate limit resets. Open with: *"implement the roller coaster spine plan"*

---

## 1. The Goal

Replace the current straight gold spine line in `SelectedWork` with a **roller-coaster curved SVG path** that:

- **Originates** from near the tail of the "Selected Work" heading — visually feels like the gold line "grows out of" the typography (specifically near the descender/serif of the "k" in "Work")
- **Curves dramatically** left → right → left across the full section width (not centred, full-width sweep)
- **Reveals content on the opposite side** as it swings: when path curves RIGHT, the LEFT exhibit card fades in; when path swings LEFT, the RIGHT exhibit card fades in
- **All driven by scroll** — `pathLength` 0→1 as user scrolls through the section, spring-smoothed

The goal is the visual language of a **$100k agency site** — something Resn, Active Theory, or Locomotive would ship. The line is the narrative thread; it's alive.

---

## 2. Current State (what's in the repo right now)

### Phase 4 — DONE ✅
- **ColdOpen** (`src/components/islands/ColdOpen.tsx`) — full-screen title card, once/session, fires `cold-open-complete` event
- **HeroReveal** (`src/components/islands/HeroReveal.tsx`) — masked h1 line reveal, waits for cold-open event
- **Hero.astro** (`src/components/sections/Hero.astro`) — fully rewritten; `data-hero-reveal` CSS reveal system for wordmark/subline/CTA/scroll-cue
- **CosmicBeams.astro** (`src/components/islands/CosmicBeams.astro`) — viewport-fixed animated gold beam canvas, persists through scroll, cleans up on View Transitions
- **Lenis** smooth scroll — init in Base.astro, re-init on `astro:page-load`
- **ClientRouter** (Astro 7 View Transitions) — in Base.astro
- **`[data-reveal]` global reveal system** — IntersectionObserver in Base.astro + CSS in global.css; applied to SelectedWork heading/eyebrow, TheIndex rows, LaurelWall badges, ContactCTA

### SpineScroll — PARTIALLY DONE ⚠️ (needs redesign)
- **`src/components/islands/SpineScroll.tsx`** — EXISTS but is a straight 2px-wide centred vertical line. Technically working (pathLength draws on scroll, spring-smoothed, dual glow+filament), but visually wrong — not the roller coaster the user asked for.
- **`SelectedWork.astro`** — mounts `<SpineScroll client:visible />`, exhibits have `data-reveal data-reveal-dir="left/right"` (this also needs to change — see §5)

### Type check
`pnpm astro check` → **0 errors / 0 warnings / 0 hints** (30 files) as of this session.

---

## 3. User's Last Prompt (exact)

> "the line you made is good but it not what i exactly wanted, i wanted a curved line like a roller coaster, that originated suddenly from somewhere like the lower tip of k or word work or somewhere it feels expensive or somewhere it gives a feel of expensive 100k website and like a roller coaster while it is more of the right side it reveals something on left and while it curves to left side it reveals content on right, it all happens on scroll like a roller coaster, i want you to just think about it, understand, research, plan it, because we had reached 98% limit, we will correct it after resetting 5 hour limit"

---

## 4. The Plan (researched and ready to implement)

### 4a. SVG path redesign

Change the SVG from `viewBox="0 0 2 800"` (2px wide, useless) to **`viewBox="0 0 1000 700"`** — full stage width, maps via `preserveAspectRatio="none"` to real pixel dimensions.

The SVG element changes from `width: 2px; height: 100%; position: absolute; left: 50%` to `width: 100%; height: 100%; position: absolute; top: 0; left: 0`.

**The roller-coaster cubic bezier path:**
```
M 680,  0         ← origin: under the "k" in "Work" (~68% across stage)
C 680, 60  880,120  880,200    ← falls right (path "exhales" off the letter)
C 880,280  120,340  120,440    ← big LEFT sweep — Exhibit I (left card) appears here
C 120,520  880,580  880,640    ← swings back RIGHT — Exhibit II (right card) appears here
C 880,680  540,700  540,700    ← trails off toward centre-right
```

Shape intuition: a gold thread dropped from the serif of "k" — it swings left with gravity, overshoots, swings back right, then settles. Weighted, not geometric.

**Origin point (Option B — precise):**  
On mount, `getBoundingClientRect()` on the `<h2 class="selected-work__heading">` element, estimate the x-position of the last character ("k"), compute the SVG viewBox x-coordinate:
```ts
const headingRect = headingEl.getBoundingClientRect();
const stageRect = stageEl.getBoundingClientRect();
// approximate "k" as ~94% of heading width
const kX = headingRect.left - stageRect.left + headingRect.width * 0.94;
const svgX = (kX / stageRect.width) * 1000; // map to viewBox units
// then use svgX as the M origin x
```
If the heading isn't found, fallback to `680`.

### 4b. Reveal logic — imperative, not CSS `[data-reveal]`

Remove `data-reveal` / `data-reveal-dir` from the exhibit cards in `SelectedWork.astro`.  
Add a scoped CSS rule that starts them hidden:
```css
.exhibit {
  opacity: 0;
  transform: translateX(0);
  will-change: opacity, transform;
}
```

The `SpineScroll.tsx` island takes full control using `useMotionValueEvent` — direct DOM style mutation, no React re-renders, no CSS transitions:

```tsx
useMotionValueEvent(scrollYProgress, 'change', (v) => {
  const ex1 = document.querySelector<HTMLElement>('.exhibit--left');
  const ex2 = document.querySelector<HTMLElement>('.exhibit--right');

  // Exhibit I: enters as path sweeps LEFT (scroll 0.15 → 0.45)
  const p1 = Math.min(1, Math.max(0, (v - 0.15) / 0.30));
  const e1 = easeOutExpo(p1); // cubic-bezier(0.22,1,0.36,1) approximation
  if (ex1) {
    ex1.style.opacity = e1.toFixed(3);
    ex1.style.transform = `translateX(${((1 - e1) * -22).toFixed(1)}px)`;
  }

  // Exhibit II: enters as path swings RIGHT (scroll 0.45 → 0.75)
  const p2 = Math.min(1, Math.max(0, (v - 0.45) / 0.30));
  const e2 = easeOutExpo(p2);
  if (ex2) {
    ex2.style.opacity = e2.toFixed(3);
    ex2.style.transform = `translateX(${((1 - e2) * 22).toFixed(1)}px)`;
  }
});

function easeOutExpo(t: number): number {
  return t === 1 ? 1 : 1 - Math.pow(2, -10 * t);
}
```

**Scroll progress → reveal mapping:**

| scrollYProgress | Path side | What reveals |
|---|---|---|
| 0.00 → 0.15 | Right (falling from "k") | Nothing yet |
| 0.15 → 0.45 | Sweeping hard LEFT | **Exhibit I** (left card) drifts in from left |
| 0.45 → 0.75 | Swinging back RIGHT | **Exhibit II** (right card) drifts in from right |
| 0.75 → 1.00 | Trailing centre | Both fully visible |

**Reduced motion:** In the `useEffect`, if `prefersReduced`, set both exhibits to opacity 1 / transform none immediately and skip the `useMotionValueEvent`.

### 4c. The "tiny dot" at the origin (optional but premium)

Add a small `<circle cx={originX} cy="0" r="2" fill="var(--gold-bright)" opacity="0.8" />` at the path origin — the visual "nib" where the line begins. This is the 1% detail that separates a good site from a 100/100 site.

---

## 5. Files to Change

| File | Change |
|---|---|
| `src/components/islands/SpineScroll.tsx` | Full rewrite — new viewBox, roller-coaster path, origin computation, imperative reveal logic |
| `src/components/sections/SelectedWork.astro` | Remove `data-reveal`/`data-reveal-dir` from exhibits; add `will-change: opacity, transform` to `.exhibit` CSS |
| No other files | Everything else stays as-is |

---

## 6. Things Tried That Failed / Didn't Fit

- **Straight vertical line** — what's currently in `SpineScroll.tsx`. Functional (pathLength draws on scroll, spring-smoothed), but not what the user wanted. Too static, no narrative.
- **`data-reveal` for exhibits** — currently wired but needs to be removed once the imperative scroll handler takes over. Can't have both systems fighting.
- **CSS custom properties for scroll-driven values** — considered but rejected: requires `@property` registration for animation to work, adds complexity. Direct `el.style.opacity` is simpler and faster.

---

## 7. What Has NOT Been Done Yet (Phase 4 remainder after SpineScroll)

After the SpineScroll roller-coaster is implemented, Phase 4 still has:
- [ ] Lighthouse check (target ≥ 95 with motion layer)  
- [ ] Mobile review at 360px (spine hides on mobile already; verify exhibits still readable)  
- [ ] Reduced-motion audit pass across all islands  
- [ ] Visual verify: cold open → hero reveal handoff in browser (not done this session, server running at localhost:4321)

---

## 8. Dev Server

Running at **`http://localhost:4321`** (pid 37848, background).  
Check: `pnpm astro dev status`  
Restart if needed: `pnpm astro dev --background`

---

## 9. Key Technical Constraints to Remember

- **Astro 7.0.6** — View Transitions is `ClientRouter` from `astro:transitions` (NOT `ViewTransitions`)
- **Motion v12** — imported as `motion/react`, not `framer-motion`
- **`astro-island` wrapper** — custom element, `display: inline` by default; the `.selected-work__stage > astro-island { display: contents; }` rule handles it
- **`useScroll({ target: stageRef })`** — the ref goes on SpineScroll's own outer div (`position: absolute; inset: 0`), which fills the stage via the stage's `position: relative`. This is what makes scroll tracking work.
- **`pnpm astro check`** must pass 0 errors before committing any change
