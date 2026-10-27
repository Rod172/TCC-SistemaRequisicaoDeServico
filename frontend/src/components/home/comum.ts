/**
 * @file comum.ts
 * @description Tipos, constantes e utilitários compartilhados pela página inicial (US38): categorias
 * dos atalhos, cores de status, formatação de valores e datas, e o rascunho do pedido que o visitante
 * começa antes de entrar na conta (lido depois pela tela de nova solicitação).
 */

import type { CSSProperties } from 'react';

export interface UsuarioSessao {
  nome: string;
  tipo_perfil?: string;
}

export interface OportunidadeResumo {
  status: 'ABERTA' | 'EM_NEGOCIACAO';
  id: string;
  titulo: string;
  categoria: string | null;
  cidade: string | null;
  bairro: string | null;
  orcamento_cliente: string | null;
  created_at: string;
}

export interface NotificacaoResumo {
  id: string;
  titulo: string;
  mensagem: string;
  link_redirecionamento?: string | null;
  lida: boolean;
  createdAt: string;
}

// Mesmas categorias do formulário de nova solicitação (sem "T.I." e "Outro", que não cabem como atalho).
export const CATEGORIAS_ATALHO = ['Elétrica', 'Encanamento', 'Pintura', 'Limpeza', 'Marcenaria', 'Jardinagem'];

// As cores de status ficam num lugar só (US39), para terem o mesmo significado visual em todo o app.
export { STATUS_SOLICITACAO, STATUS_PROPOSTA } from '@/components/ui/Elementos';

export function formatarMoeda(valor: string | number | null | undefined) {
  if (valor === null || valor === undefined) return 'A combinar';
  return Number(valor).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
}

export function formatarRelativo(iso: string) {
  const minutos = Math.floor((Date.now() - new Date(iso).getTime()) / 60000);
  if (minutos < 1) return 'agora';
  if (minutos < 60) return `há ${minutos} min`;
  const horas = Math.floor(minutos / 60);
  if (horas < 24) return `há ${horas} h`;
  return new Date(iso).toLocaleDateString('pt-BR', { day: '2-digit', month: 'short' });
}

export function localDaOportunidade(o: Pick<OportunidadeResumo, 'bairro' | 'cidade'>) {
  return [o.bairro, o.cidade].filter(Boolean).join(', ') || 'Local não informado';
}

export function plural(n: number, singular: string, pluralTexto: string) {
  return `${n} ${n === 1 ? singular : pluralTexto}`;
}

// ── Próxima ação de um pedido ─────────────────────────────────────────────────
// Usada na página inicial logada (US38) e em "Minhas solicitações" (US39), para o mesmo pedido
// mostrar sempre o mesmo próximo passo.
export interface PedidoResumo {
  id: string;
  titulo: string;
  status: string;
  created_at: string;
  propostas_recebidas: number;
}

export function proximaAcao(p: Pick<PedidoResumo, 'status' | 'propostas_recebidas'>): { texto: string; info: string; primaria: boolean } {
  switch (p.status) {
    case 'ABERTA':
      return p.propostas_recebidas > 0
        ? { texto: 'Comparar propostas', info: plural(p.propostas_recebidas, 'proposta recebida', 'propostas recebidas'), primaria: true }
        : { texto: 'Ver pedido', info: 'Aguardando as primeiras propostas', primaria: false };
    case 'EM_NEGOCIACAO':
      return { texto: 'Continuar negociação', info: `Em negociação · ${plural(p.propostas_recebidas, 'proposta recebida', 'propostas recebidas')}`, primaria: true };
    case 'CONTRATADA':
      return { texto: 'Acompanhar serviço', info: 'Confirme a conclusão quando o serviço terminar', primaria: true };
    case 'CONCLUIDA':
      return { texto: 'Ver detalhes', info: 'Serviço concluído', primaria: false };
    default:
      return { texto: 'Ver detalhes', info: 'Pedido cancelado', primaria: false };
  }
}

/**
 * Pedidos em andamento que pedem acompanhamento: com propostas recebidas ou com serviço contratado.
 * `propostas_recebidas` conta todas as propostas (inclusive recusadas), então não dá para afirmar que
 * há proposta pendente — os textos que usam esta função falam em "propostas recebidas".
 */
export function precisaDeAcao(p: Pick<PedidoResumo, 'status' | 'propostas_recebidas'>) {
  return ((p.status === 'ABERTA' || p.status === 'EM_NEGOCIACAO') && p.propostas_recebidas > 0) || p.status === 'CONTRATADA';
}

// ── Rascunho do pedido ────────────────────────────────────────────────────────
// O visitante pode digitar o que precisa antes de ter conta. O texto fica no sessionStorage (só nesta
// aba), sobrevive ao login e é consumido pela tela de nova solicitação.
const CHAVE_RASCUNHO = '@ServicoFacil:rascunhoPedido';

export interface RascunhoPedido {
  titulo: string;
  categoria: string;
}

export function guardarRascunhoPedido(rascunho: RascunhoPedido) {
  try {
    sessionStorage.setItem(CHAVE_RASCUNHO, JSON.stringify(rascunho));
  } catch {
    // Armazenamento indisponível (aba privada, bloqueio): o pedido segue sem o rascunho.
  }
}

export function lerRascunhoPedido(): RascunhoPedido | null {
  try {
    const bruto = sessionStorage.getItem(CHAVE_RASCUNHO);
    if (!bruto) return null;
    const dados = JSON.parse(bruto);
    return { titulo: String(dados.titulo ?? ''), categoria: String(dados.categoria ?? '') };
  } catch {
    return null;
  }
}

export function limparRascunhoPedido() {
  try {
    sessionStorage.removeItem(CHAVE_RASCUNHO);
  } catch {
    // Nada a limpar quando o armazenamento está indisponível.
  }
}

/** Destino de "Pedir propostas": a tela de nova solicitação, ou o login quando não há sessão. */
export function destinoNovoPedido(rascunho: RascunhoPedido) {
  guardarRascunhoPedido(rascunho);
  if (!localStorage.getItem('@ServicoFacil:token')) return '/login';
  const params = new URLSearchParams();
  if (rascunho.titulo) params.set('titulo', rascunho.titulo);
  if (rascunho.categoria) params.set('categoria', rascunho.categoria);
  const query = params.toString();
  return query ? `/nova-solicitacao?${query}` : '/nova-solicitacao';
}

// ── Estilos reutilizados ──────────────────────────────────────────────────────
export const estiloCard: CSSProperties = {
  background: 'var(--card-bg)', border: '1px solid var(--card-border)', borderRadius: '16px',
};

export const estiloBotaoPrimario: CSSProperties = {
  display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: '0.45rem',
  minHeight: '44px', padding: '0 1.15rem', border: 'none', borderRadius: '10px',
  background: 'var(--primary-color)', color: '#fff', fontWeight: 700, fontSize: '0.92rem',
  textDecoration: 'none', cursor: 'pointer', whiteSpace: 'nowrap',
};

export const estiloBotaoSecundario: CSSProperties = {
  ...estiloBotaoPrimario,
  background: 'transparent', border: '1px solid var(--card-border)', color: 'var(--text-primary)', fontWeight: 600,
};

export const estiloChip = (cor: { bg: string; fg: string }): CSSProperties => ({
  display: 'inline-block', padding: '0.2rem 0.6rem', borderRadius: '999px',
  fontSize: '0.72rem', fontWeight: 700, background: cor.bg, color: cor.fg,
});
