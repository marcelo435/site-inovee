# Site Inovee Contabilidade

![Astro](https://img.shields.io/badge/Astro-BC52EE?logo=astro&logoColor=white)
![TypeScript](https://img.shields.io/badge/TypeScript-3178C6?logo=typescript&logoColor=white)
![JavaScript](https://img.shields.io/badge/JavaScript-F7DF1E?logo=javascript&logoColor=black)
![Three.js](https://img.shields.io/badge/Three.js-000000?logo=threedotjs&logoColor=white)
![HTML5](https://img.shields.io/badge/HTML5-E34F26?logo=html5&logoColor=white)
![CSS](https://img.shields.io/badge/CSS-663399?logo=css&logoColor=white)
![Node.js](https://img.shields.io/badge/Node.js-5FA04E?logo=nodedotjs&logoColor=white)
![Cloudflare](https://img.shields.io/badge/Cloudflare_Workers-F38020?logo=cloudflare&logoColor=white)
![Web](https://img.shields.io/badge/Site-Web-0A66C2?logo=googlechrome&logoColor=white)

Site institucional feito com [Astro](https://astro.build). O Astro gera páginas HTML estáticas, que são rápidas, bem lidas pelo Google e podem ser hospedadas de graça.

## Como rodar no computador

É preciso ter o [Node.js](https://nodejs.org) 22 ou mais novo instalado.

```bash
npm install        # só na primeira vez
npm run dev        # abre o site em http://localhost:4321 e atualiza enquanto você edita
npm run build      # gera o site final na pasta dist/
npm run preview    # mostra o site gerado em dist/
```

## Onde alterar cada coisa

| O que mudar | Arquivo |
|---|---|
| Telefone, WhatsApp, e-mail, CNPJ, CRC, horário, Instagram | `src/data/empresa.ts` |
| Serviços (texto, itens, portes) | `src/content/servicos/*.md` |
| Unidades (endereço, CEP, telefone, mapa) | `src/content/unidades/*.md` |
| Artigos do blog | `src/content/blog/*.md` |
| Perguntas frequentes | `src/data/faq.ts` |
| Cores e visual | `src/styles/global.css`: tema claro (padrão) em `:root` e tema escuro em `:root[data-theme='dark']` |
| Símbolo 3D da página inicial (cores, luzes, velocidade) | `src/scripts/simbolo3d.ts` |
| Logo | `src/assets/logo-inovee.png` |
| Textos da página inicial | `src/components/*.astro` |

### Símbolo 3D

O símbolo da Inovee no topo da página inicial é desenhado em tempo real com [Three.js](https://threejs.org). Ele é uma esfera fatiada em faixas sólidas azuis e prateadas, reta como no logo, com o anel azul em volta (aberto em cima). Uma luz azul corre por dentro das frestas entre as faixas e ao longo da meia-lua.

No arquivo `src/scripts/simbolo3d.ts` dá para ajustar:

- o número de faixas (`FAIXAS`) e a largura das frestas (`fresta`);
- a inclinação (`inclinacao.rotation`);
- a velocidade e a força da luz nas frestas (`criarMatLuz`).

- Só carrega depois que o resto da página abriu, para não atrasar o carregamento.
- Pausa quando sai da tela ou quando a aba fica em segundo plano.
- Se o visitante ativou "reduzir movimento" no sistema, aparece parado.
- Se o aparelho não suporta 3D, aparece o logo como imagem.

### Publicar um artigo novo no blog

Crie um arquivo em `src/content/blog/`, por exemplo `mei-limite-faturamento.md`. O nome do arquivo vira o endereço da página: `/blog/mei-limite-faturamento/`.

```markdown
---
titulo: "Título do artigo"
descricao: "Resumo de uma ou duas frases (aparece no Google)."
data: 2026-11-20
categoria: Tributário
---

Texto do artigo. Use ## para subtítulos, **negrito** e - para listas.
```

Use `rascunho: true` para esconder o artigo até ele estar pronto.

### Preencher os dados das unidades

Em cada arquivo de `src/content/unidades/`, preencha `endereco`, `bairro`, `cep` e `telefone`. Para o mapa:

1. Abra a unidade no Google Maps e clique em **Compartilhar → Incorporar um mapa**.
2. Copie só o endereço que está dentro de `src="..."` e cole em `mapaEmbed`.
3. Em `mapaLink`, cole o link do perfil da unidade no Google (Compartilhar → Copiar link).

**Foto da fachada:** coloque a foto em `src/assets/unidades/` (por exemplo `recife.jpg`) e adicione no arquivo da unidade a linha `foto: ../../assets/unidades/recife.jpg`. O site reduz e otimiza a imagem sozinho. Sem foto, aparece um espaço reservado azul com o símbolo.

Campos vazios não aparecem no site.

### Formulário com cópia por e-mail (opcional)

Hoje o formulário abre o WhatsApp com a mensagem já preenchida. Para também receber uma cópia por e-mail:

1. Gere uma chave gratuita em [web3forms.com](https://web3forms.com) usando o e-mail que vai receber as mensagens.
2. Cole a chave em `web3formsKey`, no arquivo `src/data/empresa.ts`.

## Publicação (Cloudflare Workers)

1. Envie esta pasta para um repositório no GitHub.
2. Na Cloudflare, abra **Workers & Pages → Create → Import a repository** e escolha o repositório.
3. Build command: `npm run build`. Deploy command: `npx wrangler deploy` (usa o arquivo `wrangler.jsonc`, que publica a pasta `dist`).
4. Em **Settings → Domains & Routes**, adicione `www.inoveecontabilidade.com`. O endereço sem www vai para o www por uma Redirect Rule da Cloudflare.

Os redirecionamentos dos endereços antigos do Wix ficam em `public/_redirects`.

Depois disso, cada alteração enviada ao GitHub publica o site sozinha, em cerca de 1 minuto.

### Domínio que está no Wix

> ⚠️ **Antes de mexer no DNS, anote todos os registros que existem hoje no Wix**, principalmente os **MX** e os **TXT** (SPF, DKIM, verificação do Google). Sem eles, o e-mail @inoveecontabilidade.com para de funcionar.

1. Adicione o domínio na Cloudflare (plano Free). A Cloudflare importa os registros DNS existentes. Confira se os MX e TXT vieram todos.
2. No painel do Wix, em **Domínios → Configurações avançadas**, troque os servidores de nome (nameservers) para os dois indicados pela Cloudflare.
3. Espere a propagação, que pode levar algumas horas. Depois, conecte o domínio ao projeto na Cloudflare.
4. Teste o site **e o e-mail**, enviando e recebendo. Só depois cancele ou reduza o plano do Wix.

## Antes de publicar (pendências)

- [ ] CNPJ e registro no CRC em `src/data/empresa.ts`
- [ ] Endereços, telefones e mapas das 4 unidades
- [ ] Revisão jurídica da Política de Privacidade (`src/pages/politica-de-privacidade.astro`)
- [ ] Revisão do artigo de exemplo do blog
- [ ] Confirmar o domínio oficial em `astro.config.mjs`, `public/robots.txt` e `src/data/empresa.ts`
