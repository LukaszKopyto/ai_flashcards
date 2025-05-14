// @ts-check
import { defineConfig } from 'astro/config';

import vue from '@astrojs/vue';
import tailwindcss from '@tailwindcss/vite';

import cloudflare from '@astrojs/cloudflare';

// https://astro.build/config
export default defineConfig({
  output: 'server',
  adapter: cloudflare({
    platformProxy: {
      enabled: true,
    },
  }),
  experimental: {
    session: true,
  },
  integrations: [vue()],
  vite: {
    plugins: [tailwindcss()],
    build: {
      minify: false,
    },
  },
});
