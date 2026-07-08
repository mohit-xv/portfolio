/// <reference path="../.astro/types.d.ts" />

interface ImportMetaEnv {
  /** API Gateway base URL — set via PUBLIC_API_URL env var at build time */
  readonly PUBLIC_API_URL?: string;
  /** Cloudflare Turnstile site key — set via PUBLIC_TURNSTILE_SITE_KEY */
  readonly PUBLIC_TURNSTILE_SITE_KEY?: string;
}
