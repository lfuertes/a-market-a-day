// @ts-check
import { defineConfig } from 'astro/config';

import react from '@astrojs/react';
import tailwindcss from '@tailwindcss/vite';
import node from '@astrojs/node';
import sitemap from '@astrojs/sitemap';

// https://astro.build/config
export default defineConfig({
  site: 'https://amarketaday.com',
  i18n: {
    defaultLocale: "en",
    locales: ["en", "es"],
    routing: {
      prefixDefaultLocale: false
    }
  },
  output: 'server',
  adapter: node({
    mode: 'middleware',
  }),
  integrations: [react(), sitemap({
    customPages: ['https://amarketaday.com/en', 'https://amarketaday.com/es']
  })],

  vite: {
    plugins: [tailwindcss()]
  }
});