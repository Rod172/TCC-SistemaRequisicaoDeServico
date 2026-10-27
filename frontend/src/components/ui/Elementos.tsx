'use client';

/**
 * @file Elementos.tsx
 * @description Peças pequenas reutilizadas pelas telas (US39): etiqueta de status, aviso, etapas do
 * andamento, estado de lista (carregando/vazio/erro) e avatar. As cores de status seguem a prancha de
 * componentes do design: a mesma cor tem o mesmo significado em todo o app.
 *
 * BIBLIOTECAS UTILIZADAS:
 * 1. Lucide React (^0.383.0): Ícones dos avisos e das etapas.
 *    Doc Oficial: https://lucide.dev/
 */

import React from 'react';
import { AlertCircle, AlertTriangle, Check, CheckCircle2, Info } from 'lucide-react';

export interface CorStatus {
  bg: string;
  fg: string;
  label: string;
}

const FALLBACK: CorStatus = { bg: 'var(--neutral-tint)', fg: 'var(--text-body)', label: '—' };

export const STATUS_SOLICITACAO: Record<string, CorStatus> = {
  ABERTA: { bg: 'var(--primary-tint)', fg: 'var(--link-color)', label: 'Aberta' },
  EM_NEGOCIACAO: { bg: 'var(--warning-tint)', fg: 'var(--warning-strong)', label: 'Em negociação' },
  CONTRATADA: { bg: 'var(--violet-tint)', fg: 'var(--violet-text)', label: 'Contratada' },
  CONCLUIDA: { bg: 'var(--success-tint)', fg: 'var(--success-strong)', label: 'Concluída' },
  CANCELADA: { bg: 'var(--danger-tint)', fg: 'var(--danger-strong)', label: 'Cancelada' },
};

export const STATUS_PROPOSTA: Record<string, CorStatus> = {
  ENVIADA: { bg: 'var(--primary-tint)', fg: 'var(--link-color)', label: 'Enviada' },
  EM_ANALISE: { bg: 'var(--warning-tint)', fg: 'var(--warning-strong)', label: 'Em análise' },
  ACEITA: { bg: 'var(--success-tint)', fg: 'var(--success-strong)', label: 'Aceita' },
  RECUSADA: { bg: 'var(--danger-tint)', fg: 'var(--danger-strong)', label: 'Recusada' },
};

export const STATUS_PAGAMENTO: Record<string, CorStatus> = {
  RETIDO: { bg: 'var(--sky-tint)', fg: 'var(--sky-text)', label: 'Retido com garantia' },
  LIBERADO: { bg: 'var(--success-tint)', fg: 'var(--success-strong)', label: 'Liberado ao prestador' },
  REEMBOLSADO: { bg: 'var(--neutral-tint)', fg: 'var(--text-body)', label: 'Reembolsado' },
};

/** Etiqueta colorida de status. Aceita uma cor pronta ou procura o status em um dos mapas acima. */
export function Chip({ cor, status, mapa, children }: { cor?: CorStatus; status?: string; mapa?: Record<string, CorStatus>; children?: React.ReactNode }) {
  const c = cor ?? (status && mapa ? mapa[status] : undefined) ?? FALLBACK;
  return (
    <span className="chip" style={{ background: c.bg, color: c.fg }}>
      <span className="ponto" aria-hidden="true" />
      {children ?? c.label}
    </span>
  );
}

type TipoAviso = 'sucesso' | 'erro' | 'info' | 'alerta';

const ICONES: Record<TipoAviso, React.ReactNode> = {
  sucesso: <CheckCircle2 size={18} aria-hidden="true" />,
  erro: <AlertCircle size={18} aria-hidden="true" />,
  info: <Info size={18} aria-hidden="true" />,
  alerta: <AlertTriangle size={18} aria-hidden="true" />,
};

/** Aviso em faixa. Sucesso e erro são anunciados por leitores de tela (status/alert). */
export function Aviso({ tipo, children, style }: { tipo: TipoAviso; children: React.ReactNode; style?: React.CSSProperties }) {
  const role = tipo === 'erro' ? 'alert' : tipo === 'sucesso' ? 'status' : undefined;
  return (
    <div role={role} className={`aviso aviso-${tipo}`} style={style}>
      {ICONES[tipo]}
      <div style={{ flex: 1, minWidth: 0 }}>{children}</div>
    </div>
  );
}

/** Linha de andamento: etapas antes de `atual` aparecem concluídas; `atual` igual ao total = todas concluídas. */
export function Etapas({ etapas, atual, rotulo }: { etapas: { nome: string; detalhe?: string }[]; atual: number; rotulo: string }) {
  return (
    <ol className="etapas" aria-label={rotulo}>
      {etapas.map((etapa, i) => {
        const estado = i < atual ? 'feita' : i === atual ? 'atual' : 'futura';
        return (
          <li key={etapa.nome} className={estado} aria-current={estado === 'atual' ? 'step' : undefined}>
            <span className="marca" aria-hidden="true">{estado === 'feita' ? <Check size={14} strokeWidth={3} /> : i + 1}</span>
            <span>
              {etapa.nome}
              {etapa.detalhe && <span className="detalhe">{etapa.detalhe}</span>}
              {estado === 'feita' && <span className="sr-only"> (concluída)</span>}
            </span>
          </li>
        );
      })}
    </ol>
  );
}

/** Estado de uma lista: carregando, vazia ou com erro (com ação opcional, como "Tentar novamente"). */
export function EstadoLista({ tipo, icone, children, acao }: { tipo: 'carregando' | 'vazio' | 'erro'; icone?: React.ReactNode; children: React.ReactNode; acao?: React.ReactNode }) {
  return (
    <div className={`estado-lista ${tipo === 'erro' ? 'erro' : ''}`} role={tipo === 'carregando' ? 'status' : tipo === 'erro' ? 'alert' : undefined}>
      {icone}
      <span style={{ fontSize: '0.95rem', fontWeight: 600 }}>{children}</span>
      {acao}
    </div>
  );
}

export function iniciais(nome: string) {
  return nome.split(' ').filter(Boolean).slice(0, 2).map((p) => p[0]?.toUpperCase()).join('') || '?';
}

/** Avatar redondo: foto quando houver, senão as iniciais do nome. */
export function Avatar({ nome, foto, tamanho = 44 }: { nome: string; foto?: string | null; tamanho?: number }) {
  return (
    <span className="avatar" aria-hidden="true" style={{ width: tamanho, height: tamanho, fontSize: Math.round(tamanho * 0.34) }}>
      {foto ? <img src={foto} alt="" /> : iniciais(nome)}
    </span>
  );
}
