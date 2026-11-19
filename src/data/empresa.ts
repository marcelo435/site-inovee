// ─────────────────────────────────────────────────────────────
// DADOS CENTRAIS DA EMPRESA
// Altere aqui e o site inteiro é atualizado (cabeçalho, rodapé,
// botões de WhatsApp, formulário, SEO).
// ─────────────────────────────────────────────────────────────

export const empresa = {
  nome: 'Inovee Contabilidade',
  razaoSocial: 'Inovee Consultoria e Contabilidade',

  // CNPJs: ver "controladores" mais abaixo (são duas empresas).
  // Registro no Conselho Regional de Contabilidade; vazio = não aparece no rodapé.
  crc: '', // ex.: 'CRC-PE 000000/O-0'

  site: 'https://www.inoveecontabilidade.com',
  email: 'atendimento@inoveecontabilidade.com',

  telefone: '(81) 3197-2688',
  telefoneLink: '+558131972688',

  whatsapp: '(81) 99628-3491',
  whatsappNumero: '5581996283491', // só números, com 55 + DDD

  instagram: 'inoveeoficial',
  portalCliente: 'https://inoveeicontabilidadedigital.osayk.com.br/#/login',

  horario: 'Seg–Sex: 08h–18h | Sáb: 08h–12h',

  // Opcional: chave gratuita do https://web3forms.com para o formulário
  // também enviar uma cópia por e-mail. Vazio = só abre o WhatsApp.
  web3formsKey: '',
};

// ─────────────────────────────────────────────────────────────
// PRIVACIDADE (LGPD) — usado na Política de Privacidade
// ─────────────────────────────────────────────────────────────

/** Empresas controladoras dos dados tratados pelo site (dados dos comprovantes de CNPJ). */
export const controladores = [
  {
    razaoSocial: 'INOVEE CONSULTORIA & CONTABILIDADE LTDA',
    cnpj: '35.095.101/0001-78',
    sede: 'Recife - PE',
    unidades: 'Recife (matriz) e Carpina (filial, CNPJ 35.095.101/0002-59)',
  },
  {
    razaoSocial: 'INOVEE CONSULTORIA E CONTABILIDADE LTDA',
    cnpj: '17.435.878/0001-52',
    sede: 'Orobó - PE',
    unidades: 'Orobó (matriz) e Surubim (filial, CNPJ 17.435.878/0002-33)',
  },
];

export const privacidade = {
  /** Canal para pedidos dos titulares (acompanhado pela equipe). */
  email: 'atendimento@inoveecontabilidade.com',
  /** Dados de quem pede contato e não se torna cliente. */
  prazoContatos: '12 (doze) meses',
  /** Data da versão publicada da política. */
  atualizado: '19 de novembro de 2026',
};

export const MENSAGEM_PADRAO = 'Olá! Gostaria de saber mais sobre os serviços da Inovee.';

/** Gera o link do WhatsApp com uma mensagem pronta. */
export function linkWhatsApp(mensagem: string = MENSAGEM_PADRAO): string {
  return `https://wa.me/${empresa.whatsappNumero}?text=${encodeURIComponent(mensagem)}`;
}

export const linkInstagram = `https://instagram.com/${empresa.instagram}`;

export const portes = [
  { id: 'mei', nome: 'MEI' },
  { id: 'pequena', nome: 'Pequena' },
  { id: 'media', nome: 'Média' },
  { id: 'grande', nome: 'Grande' },
] as const;
