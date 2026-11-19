import { defineCollection } from 'astro:content';
import { glob } from 'astro/loaders';
import { z } from 'astro/zod';

// Serviços: um arquivo .md por serviço em src/content/servicos/
const servicos = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/servicos' }),
  schema: z.object({
    titulo: z.string(),
    icone: z.string(),
    resumo: z.string(),
    descricaoSeo: z.string(),
    portes: z.array(z.enum(['mei', 'pequena', 'media', 'grande'])),
    itens: z.array(z.string()),
    ordem: z.number(),
  }),
});

// Unidades: um arquivo .md por cidade em src/content/unidades/
const unidades = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/unidades' }),
  schema: ({ image }) =>
    z.object({
    cidade: z.string(),
    uf: z.string().default('PE'),
    regiao: z.string(),
    descricao: z.string(),
    ordem: z.number(),
    sede: z.boolean().default(false),
    // Preencha quando tiver os dados — os campos vazios ficam ocultos no site.
    endereco: z.string().default(''),
    bairro: z.string().default(''),
    cep: z.string().default(''),
    telefone: z.string().default(''),
    // Link "Compartilhar > Incorporar mapa" do Google Maps (só o endereço do src)
    mapaEmbed: z.string().default(''),
    // Link do perfil no Google Meu Negócio / Google Maps
    mapaLink: z.string().default(''),
    // Foto da fachada (coloque o arquivo em src/assets/unidades/ e informe o caminho,
    // ex.: foto: ../../assets/unidades/recife.jpg). Sem foto, o cartão aparece sem a área de imagem.
    foto: image().optional(),
  }),
});

// Blog: um arquivo .md por artigo em src/content/blog/
const blog = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/blog' }),
  schema: z.object({
    titulo: z.string(),
    descricao: z.string(),
    data: z.coerce.date(),
    autor: z.string().default('Equipe Inovee'),
    categoria: z.string().default('Contabilidade'),
    rascunho: z.boolean().default(false),
  }),
});

export const collections = { servicos, unidades, blog };
