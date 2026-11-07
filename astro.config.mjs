// @ts-check
import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';

// Endereço oficial do site (usado no sitemap, nas tags de SEO e no link canônico).
export default defineConfig({
  site: 'https://www.inoveecontabilidade.com',
  integrations: [sitemap()],
});
