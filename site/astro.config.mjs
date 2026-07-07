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
  },
});
