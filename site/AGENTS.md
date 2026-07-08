## Development

When starting the dev server, use background mode:

```
astro dev --background
```

Manage the background server with `astro dev stop`, `astro dev status`, and `astro dev logs`.

## Documentation

Full documentation: https://docs.astro.build

Consult these guides before working on related tasks:

- [Adding pages, dynamic routes, or middleware](https://docs.astro.build/en/guides/routing/)
- [Working with Astro components](https://docs.astro.build/en/basics/astro-components/)
- [Using React, Vue, Svelte, or other framework components](https://docs.astro.build/en/guides/framework-components/)
- [Adding or managing content](https://docs.astro.build/en/guides/content-collections/)
- [Adding styles or using Tailwind](https://docs.astro.build/en/guides/styling/)
- [Supporting multiple languages](https://docs.astro.build/en/guides/internationalization/)

# MOHIT SINGH — Master plan (plan of record)

Planning: **closed** · Build: **authorized** · July 2026 · v1.1

> v1.1 amendments: wordmark reverts to "Mohit Singh" (XV retired; roman numerals kept as ceremony). Repositioned as a pure portfolio, not a freelance pitch — the two-door contact collapses to one, /method folds into /about as "Approach". Motion stack changed: Framer Motion (Motion) via React islands replaces GSAP; Lenis retained.

## 0. The one-line brief

A fully typographic, cinema-grade portfolio for Mohit Singh that proves one claim — he removes waste from cloud infrastructure — by running visibly waste-free itself. It is a portfolio, not a pitch: it demonstrates rather than sells, which is what makes it read as a six-figure site. Godfather energy through cinematography (warm black, gold, patience), never costume. Signature element: the scroll-drawn gold spine. Everything around it stays quiet and disciplined.

## 1. Positioning

Hero: **"Pay for compute, not *waste*."** — Fraunces display, italic gold lands on "waste".
Subline: `CLOUD COST OPTIMISATION · DEVOPS · 5× AWS CERTIFIED`

Voice rule: the site never claims mastery — it demonstrates it. Every claim carries a receipt: a number, a laurel, a link, or the site's own bill.

Audience: recruiters and founders equally — one voice, two doors. The fork happens only at /contact: "For teams" (roles and internships — short form, resume PDF, Credly) and "For founders" ("Your AWS bill looks wrong? Send it." — brief form with scope and timeline).

## 2. Brand system

Wordmark: "Mohit Singh" set in Fraunces (XV retired). Credits line: "Written, designed & deployed by Mohit Singh."

Roman numerals are ceremony — earned because the work is genuinely a curated sequence: EST. MMXXIV, PART I–III chapter heads, exhibits No. I–II, Index years (MMXXIV, MMXXV…). Arabic numerals are evidence: ₹, milliseconds, percentages, counts. The two roles never mix. Exactly one Godfather wink exists on the entire site; it lives on the 404.

Palette tokens (one file, CSS custom properties):
`--ink #0D0B09` page background, never pure black · `--smoke #17140F` raised panels · `--bone #EDE4D3` all body text · `--gold #C0A062` accents, capped at ~5% of any viewport · `--gold-bright #E3C27D` hover states and the italic word only · `--oxblood #6E2B33` optional, under 1%. Grain at ~3% opacity, CSS/SVG-generated, zero asset weight. Gold passes contrast at display sizes only — body copy is always bone.

Type — three families, strict roles, all free, self-hosted through Astro 6's Fonts API: **Fraunces** for display, **General Sans** (Fontshare) for UI and body, **Space Mono** for eyebrows, labels, metrics, and Index metadata. Banned: Inter, and any fan-made "Godfather/Corleone" font.

Imagery: none required. The site is fully typographic — type, the thread, and numbers carry it. A duotone portrait slot stays reserved on /story for whenever one exists (recipe: single light source at 45°, room dark, expose for the lit side; finish with warm-black duotone and grain).

The signature — the scroll-drawn spine: on the homepage's Selected Work section, a curved gold line runs down the centre and draws itself as the reader scrolls, while the two exhibits materialise from the left and right, blank to solid, arriving in sequence rather than together. Technique: Motion's `useScroll` gives 0→1 progress; that value binds to the path's `pathLength` (the draw) and to each exhibit's `opacity` + `x` drift across staggered progress slices. The section is pinned so the draw plays over one full viewport of scroll. Mobile: the curve straightens to a hairline, exhibits stack and rise instead of entering from the wings. Reduced-motion: the final composed state, no draw. Only two exhibits ride the spine; the Index sits below it, so the moment stays scarce. It is the poster's string motif, abstracted — never literal.

## 3. Motion language

Slow and confident: 0.8–1.2s tweens with an expo-out cubic-bézier (`[0.22, 1, 0.36, 1]`) for entrances; springs reserved for interactive gestures only. Masked line-by-line headline reveals (`whileInView`, `once: true`); blocks settle from 1.04 to 1.00 scale; the spine draws on scroll; Lenis smooth scrolling feeding Motion's `useScroll`; Astro View Transitions between pages. Cold open: a title card of at most 1.6 seconds, once per session (sessionStorage), skippable, honoring prefers-reduced-motion. Every animation ships with a reduced-motion twin — wrap substantial movement in `<MotionConfig reducedMotion="user">` and gate transforms behind `useReducedMotion()`. Banned: bouncy springs on entrances, parallax soup, autoplay audio, custom cursors on touch devices.

## 4. Information architecture

Five pages, portfolio-shaped: Home · Work (+ two case studies) · About · Contact · 404.

- `/` — cold open → hero → PART I · Selected Work on the scroll-drawn spine (Exhibits I–II) → The Index → the laurel wall → a quiet "get in touch" line → credits footer
- `/work/this-website` — **Exhibit I**, the FinOps flagship: interactive architecture diagram (hover a component to see its role, monthly cost, and Terraform module), every cost decision explained, and the running-cost module — "Running cost this month: ₹0" — the receipt beside the claim
- `/work/stock-screener` — **Exhibit II**, on-demand infrastructure: `terraform apply` to run it, benchmark it (400ms scans plus cost-per-run), a thirty-second demo clip, `terraform destroy` when done. Not-live is the thesis: idle compute is the disease being cured. No fake live badges, ever.
- `/about` — the narrative, plus **Approach** (Audit · Architect · Automate · Account) folded in as "how I think about infrastructure" — competence shown to a recruiter, not a service menu. Portrait slot reserved; the video-editing background appears here as a taste receipt for the site's own cinematic finish.
- `/contact` — one composed page: a single line, email, the form, resume download, Credly, GitHub. No sales doors. Expensive work doesn't ask for the job.
- `404` — the wink

The Index (on `/`): a typographic ledger, no thumbnails. Launch rows: SHROOM — hallucination detector (PyTorch · MMXXV · ↗), Video edit commissions (Premiere + AE · MMXXIV · ↗), GitHub — all public work (@mohit-xv · LIVE · ↗). Every future project is one new MDX row.

Cut from the site: the colophon page, CAD/3D printing, German A1, GSSoC marquee billing.

## 5. Stack — frozen

Frontend: Astro 6 (Node 22+); hand-rolled CSS on custom properties (no Tailwind); MDX content collections so a new project or Index row is one file. Motion layer: **Framer Motion (Motion, `motion/react`) via targeted React islands** — only the sections that move are hydrated; everything else ships as zero-JS static Astro. Lenis for weighted smooth-scroll, feeding Motion's `useScroll`. GSAP dropped — one animation library, chosen because the signature scroll-draw is exactly what `useScroll` + `pathLength` is built for.

Backend: Python 3.12 Lambdas behind API Gateway — `contact` (SES sandbox → verified Gmail, plus a free Telegram bot ping; SNS SMS rejected due to India DLT registration and per-message fees), `stats` (EventBridge schedule → GitHub API → DynamoDB cache), `analytics` (cookieless collector → DynamoDB). Cloudflare Turnstile plus a honeypot on all forms.

Infrastructure: Terraform end-to-end; GitHub Actions deploying via OIDC with no stored keys; one public monorepo — `/site`, `/functions`, `/infra`.

Hosting ruling: **AWS.** S3 + CloudFront serve the entire frontend (the Astro output is plain static files — this is a traditional website with a high finish). Vercel rejected: it contradicts the FinOps brand, and the free Hobby tier is licensed non-commercial. Migration remains a one-afternoon adapter swap if ever wanted.

Upgrade 01 (dormant): a custom domain, ~₹999/year — registrar's free DNS, free ACM certificate, one Terraform variable. Route 53 not required. Zero rework on activation.

## 6. Cost and safety

Target ₹0. Zero always-on resources by design — no EC2, no NAT gateway, no RDS, none of the bill-horror products. Always-free tiers cover the load: CloudFront 1TB/month, Lambda 1M requests/month, DynamoDB 25GB. Day-one guardrails: an AWS Budgets zero-spend alert plus a ₹50 billing alarm; `terraform destroy` is the eject seat. Realistic bill after any free-tier expiry: under ₹10/month. Until Upgrade 01, the site ships on the CloudFront URL — the one accepted crack in the facade, filed on record.

## 7. Non-negotiables — the launch checklist

1. LCP under 2.0s on 4G, CLS near zero, Lighthouse ≥95 — before *and* after the motion layer.
2. Two exhibits at full case-study depth: problem → architecture → decisions → numbers → links.
3. The laurel wall: every AWS certification as a film laurel linking to its Credly badge.
4. The cold open within the discipline defined in §3.
5. A contact pipeline that converts: form → Lambda → Gmail + Telegram in under 5 seconds; Turnstile + honeypot; a stated reply-time promise on the page.
6. Live signals: cached GitHub activity, a "currently building" line, a last-deployed timestamp in the footer.
7. Mobile is the primary cut: thumb-zone navigation, tap equivalents for every hover, reviewed at 360px at every phase gate.
8. Accessibility floor: AA contrast, full keyboard navigation, gold focus states, a reduced-motion path for everything.
9. Findability: Person and project structured data, branded OG images, sitemap. (Weakened until Upgrade 01 — accepted and on record.)
10. The running-cost module inside Exhibit I, with the real number.
11. The 404 wink.
12. Ownership: public repo, self-rolled analytics, zero third-party trackers.

## 8. Roadmap

Standing rules: words before motion — nothing animates until copy is final; the performance gate travels with every phase; mobile is reviewed at every approval, never at the end.

- **Phase 0 — Content payload** (you): nearly closed; the remainder is §9.
- **Phase 1 — Design system in code** (me): token file, type scale, grain, eyebrow/laurel/button/Index-row components, a living `/styleguide` route, the hero built for real. Exit: your approval at 1440px and 360px.
- **Phase 2 — Copy** (both): both exhibits, the about narrative + approach, contact, microcopy. Exit: final words on every page; no placeholder text anywhere, ever.
- **Phase 3 — Static build** (me): all routes, OG images, structured data. Exit: Lighthouse ≥95 with zero animation shipped.
- **Phase 4 — Motion** (me): cold open, the thread, reveals, transitions. Exit: Lighthouse still ≥95; the reduced-motion audit passes.
- **Phase 5 — Backend + infra** (we pair — you learn Terraform on your own estate): modules for site, api, contact, stats, analytics; the OIDC pipeline. Exit: fresh clone → `terraform apply` → live; the form delivers in under 5 seconds; the cost dashboard reads ₹0.
- **Phase 6 — Launch** (both): the twelve-point checklist, a mid-range Android on 4G, the screener demo clip recorded. Exit: all green, site public.

## 9. Your immediate to-do — closes Phase 0

1. AWS account ready, with the zero-spend Budgets alert and ₹50 billing alarm set.
2. GitHub: confirm the handle (LinkedIn says mohit-xv) and create the public repo.
3. Install: Git, Node 22+, pnpm, Python 3.12 with uv, Terraform CLI, AWS CLI v2.
4. Send the individual share URL for each Credly badge — the profile page is JS-rendered, so each laurel links per-badge.
5. Telegram: create a bot via @BotFather when we reach Phase 5 (two minutes, free).
6. Optional, anytime: shoot the /story portrait per the recipe in §2.
