// @ts-check
import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';

// Endereço oficial do site (usado no sitemap, nas tags de SEO e no link canônico).
export default defineConfig({
  site: 'https://www.inoveecontabilidade.com',
  integrations: [sitemap()],
  // Endereços do site antigo (Wix) levando para a página equivalente.
  // (/contato continua existindo como página própria.)
  redirects: {
    '/sobre': '/#sobre',
    '/services-7': '/servicos/',
  },
});
