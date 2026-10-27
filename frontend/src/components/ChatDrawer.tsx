'use client';

/**
 * @file ChatDrawer.tsx
 * @description Painel lateral (drawer) que abre o chat (US14/US15) por cima da tela de detalhe da
 * solicitação/oportunidade, sem perder o contexto — em vez de navegar para uma página separada.
 * A página dedicada `/chat/[id]` continua existindo à parte (destino do link da notificação da US16).
 * Inclui também "Denunciar" (US32), pra sinalizar a solicitação direto de dentro da conversa.
 *
 * Desde a US34, o chat é escopado por proposta (não mais por solicitação) e liberado assim que o
 * prestador envia a proposta — por isso o drawer também pode exibir, para o Solicitante, os botões
 * "Aceitar"/"Recusar" direto na conversa, sem precisar sair da tela pra decidir.
 *
 * BIBLIOTECAS UTILIZADAS:
 * 1. Lucide React (^0.383.0): Ícones de fechar, chat e denúncia.
 *    Doc Oficial: https://lucide.dev/
 * 2. Axios (^1.7.2): Requisições HTTP REST à API backend.
 *    Doc Oficial: https://axios-http.com/docs/intro
 */

import React, { useEffect, useState } from 'react';
import { X, MessageCircle, Flag, CheckCircle, XCircle } from 'lucide-react';
import api from '@/services/api';
import ChatPanel from './ChatPanel';

interface ChatDrawerProps {
  propostaId: string;
  solicitacaoId: string;
  titulo?: string;
  aberto: boolean;
  onClose: () => void;
  /** Status atual da proposta cuja conversa está aberta — controla se os botões de decisão aparecem. */
  statusProposta?: 'ENVIADA' | 'EM_ANALISE' | 'ACEITA' | 'RECUSADA';
  /** Só o Solicitante recebe essas duas — decidir sem sair do chat (US34). */
  onAceitar?: () => void;
  onRecusar?: () => void;
  decidindo?: boolean;
}

export default function ChatDrawer({
  propostaId, solicitacaoId, titulo, aberto, onClose, statusProposta, onAceitar, onRecusar, decidindo,
}: ChatDrawerProps) {
  const [denunciando, setDenunciando] = useState(false);
  const [motivo, setMotivo] = useState('');
  const [enviando, setEnviando] = useState(false);
  const [mensagem, setMensagem] = useState('');

  // Fecha com a tecla Esc, e trava o scroll da página por trás enquanto o drawer está aberto.
  useEffect(() => {
    if (!aberto) return;
    function aoTeclar(e: KeyboardEvent) {
      if (e.key === 'Escape') onClose();
    }
    document.addEventListener('keydown', aoTeclar);
    const overflowOriginal = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', aoTeclar);
      document.body.style.overflow = overflowOriginal;
    };
  }, [aberto, onClose]);

  async function enviarDenuncia(e: React.FormEvent) {
    e.preventDefault();
    const texto = motivo.trim();
    if (!texto) return;

    setEnviando(true);
    setMensagem('');
    try {
      const response = await api.post(`/solicitacoes/${solicitacaoId}/denunciar`, { motivo: texto });
      setMensagem(response.data.mensagem);
      setMotivo('');
      setTimeout(() => setDenunciando(false), 1500);
    } catch (err: any) {
      setMensagem(err.response?.data?.message || 'Não foi possível registrar a denúncia.');
    } finally {
      setEnviando(false);
    }
  }

  if (!aberto) return null;

  const podeDecidir = !!(onAceitar || onRecusar) && statusProposta && !['ACEITA', 'RECUSADA'].includes(statusProposta);

  return (
    <>
      {/* ── Fundo escurecido ─────────────── */}
      <div
        onClick={onClose}
        style={{ position: 'fixed', inset: 0, background: 'var(--overlay-soft)', zIndex: 150 }}
      />

      {/* ── Painel deslizante ─────────────── */}
      <div style={{
        position: 'fixed', top: 0, right: 0, bottom: 0, width: 'min(420px, 100vw)',
        background: 'var(--bg-sunken)', borderLeft: '1px solid var(--card-border)', zIndex: 151,
        display: 'flex', flexDirection: 'column', padding: '1.25rem',
        boxShadow: 'var(--shadow-drawer)',
        animation: 'chatDrawerSlideIn 0.2s ease-out',
      }}>
        <style>{`
          @keyframes chatDrawerSlideIn {
            from { transform: translateX(100%); }
            to { transform: translateX(0); }
          }
        `}</style>

        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.75rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <MessageCircle size={18} color="var(--link-color)" />
            <strong style={{ fontSize: '0.95rem' }}>{titulo || 'Chat'}</strong>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <button
              onClick={() => setDenunciando((v) => !v)}
              title="Denunciar esta conversa/solicitação"
              style={{ background: 'transparent', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', display: 'flex' }}
            >
              <Flag size={16} />
            </button>
            <button
              onClick={onClose}
              title="Fechar"
              style={{ background: 'transparent', border: 'none', color: 'var(--text-secondary)', cursor: 'pointer', display: 'flex' }}
            >
              <X size={20} />
            </button>
          </div>
        </div>

        {statusProposta === 'RECUSADA' && (
          <div style={{
            background: 'var(--neutral-tint-soft)', border: '1px solid var(--card-border)', borderRadius: '8px',
            padding: '0.6rem 0.8rem', marginBottom: '0.75rem', fontSize: '0.78rem', color: 'var(--text-secondary)',
          }}>
            Esta negociação foi encerrada — a conversa fica disponível só para consulta.
          </div>
        )}

        {podeDecidir && (
          <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '0.75rem' }}>
            <button
              onClick={onAceitar}
              disabled={decidindo}
              style={{
                flex: 1, display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: '0.35rem',
                background: 'var(--accent-color)', color: 'var(--on-accent)', border: 'none', borderRadius: '8px',
                padding: '0.5rem', fontSize: '0.8rem', fontWeight: 600, cursor: decidindo ? 'default' : 'pointer',
                opacity: decidindo ? 0.7 : 1,
              }}
            >
              <CheckCircle size={14} /> Aceitar proposta
            </button>
            <button
              onClick={onRecusar}
              disabled={decidindo}
              style={{
                flex: 1, display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: '0.35rem',
                background: 'transparent', border: '1px solid var(--danger-color)', color: 'var(--danger-strong)', borderRadius: '8px',
                padding: '0.5rem', fontSize: '0.8rem', fontWeight: 600, cursor: decidindo ? 'default' : 'pointer',
                opacity: decidindo ? 0.7 : 1,
              }}
            >
              <XCircle size={14} /> Recusar
            </button>
          </div>
        )}

        {denunciando && (
          <form onSubmit={enviarDenuncia} style={{
            background: 'var(--bg-raised)', border: '1px solid var(--danger-color)', borderRadius: '8px',
            padding: '0.75rem', marginBottom: '0.75rem',
          }}>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.78rem', marginBottom: '0.5rem' }}>
              Denunciar esta solicitação para a administração revisar.
            </p>
            {mensagem && <p style={{ color: 'var(--success-soft-text)', fontSize: '0.78rem', marginBottom: '0.5rem' }}>{mensagem}</p>}
            <input
              value={motivo}
              onChange={(e) => setMotivo(e.target.value)}
              placeholder="Motivo da denúncia"
              maxLength={1000}
              style={{ width: '100%', padding: '0.5rem 0.6rem', background: 'var(--bg-color)', border: '1px solid var(--field-border)', borderRadius: '6px', color: 'var(--text-primary)', fontSize: '0.82rem', marginBottom: '0.5rem' }}
            />
            <button type="submit" disabled={enviando || !motivo.trim()} style={{
              padding: '0.45rem 0.9rem', background: 'var(--danger-color)', color: 'var(--on-primary)', border: 'none',
              borderRadius: '6px', fontWeight: 600, fontSize: '0.8rem', cursor: 'pointer',
            }}>
              {enviando ? 'Enviando...' : 'Enviar denúncia'}
            </button>
          </form>
        )}

        <div style={{ flex: 1, minHeight: 0 }}>
          <ChatPanel propostaId={propostaId} somenteLeitura={statusProposta === 'RECUSADA'} />
        </div>
      </div>
    </>
  );
}
