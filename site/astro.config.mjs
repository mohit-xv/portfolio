// @ts-check
import { defineConfig } from 'astro/config';
import react from '@astrojs/react';
import mdx from '@astrojs/mdx';
import sitemap from '@astrojs/sitemap';

// https://astro.build/config
export default defineConfig({
  site: 'https://mohitsingh.dev', // update when domain is live
  integrations: [
    react(),
    mdx(),
    sitemap(),
  ],
  vite: {
    css: {
      preprocessorOptions: {
        // hand-rolled CSS only — no preprocessor needed
      },
    },
    server: {
      fs: {
        // Allow Vite to serve files from the pnpm workspace root (one level up).
        // Required because pnpm hoists @astrojs/react to my_portfolio_website/node_modules/
        // when the root pnpm-workspace.yaml is present.
        allow: ['..'],
      },
    },
  },
});
