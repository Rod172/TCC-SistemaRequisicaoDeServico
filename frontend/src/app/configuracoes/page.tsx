'use client';

/**
 * @file configuracoes/page.tsx
 * @description Tela de Configurações de Notificação (US30): um interruptor por tipo de evento,
 * persistido por usuário. Distinto do /perfil (dados pessoais, senha, LGPD).
 *
 * BIBLIOTECAS UTILIZADAS:
 * 1. Lucide React (^0.383.0): Ícones de navegação e categorias de evento.
 *    Doc Oficial: https://lucide.dev/
 * 2. Next.js (^14.2.3): Framework React com App Router.
 *    Doc Oficial: https://nextjs.org/docs
 * 3. Axios (^1.7.2): Requisições HTTP REST à API backend.
 *    Doc Oficial: https://axios-http.com/docs/intro
 */

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ArrowLeft, AlertCircle, CheckCircle, FileText, Handshake, MessageCircle, Ban } from 'lucide-react';
import api from '@/services/api';

type TipoEvento = 'NOVA_PROPOSTA' | 'PROPOSTA_ACEITA_RECUSADA' | 'NOVA_MENSAGEM_CHAT' | 'SOLICITACAO_CANCELADA';

interface Preferencia {
  tipo_evento: TipoEvento;
  ativo: boolean;
}

const DESCRICAO_EVENTO: Record<TipoEvento, { titulo: string; descricao: string; icone: React.ReactNode }> = {
  NOVA_PROPOSTA: {
    titulo: 'Nova proposta recebida',
    descricao: 'Avisar quando um prestador enviar uma proposta para uma das suas solicitações.',
    icone: <FileText size={18} />,
  },
  PROPOSTA_ACEITA_RECUSADA: {
    titulo: 'Proposta aceita ou recusada',
    descricao: 'Avisar quando o cliente aceitar ou recusar uma proposta que você enviou.',
    icone: <Handshake size={18} />,
  },
  NOVA_MENSAGEM_CHAT: {
    titulo: 'Nova mensagem no chat',
    descricao: 'Avisar quando você receber uma mensagem no chat de uma contratação.',
    icone: <MessageCircle size={18} />,
  },
  SOLICITACAO_CANCELADA: {
    titulo: 'Solicitação cancelada',
    descricao: 'Avisar quando uma solicitação em que você propôs for cancelada pelo cliente.',
    icone: <Ban size={18} />,
  },
};

export default function ConfiguracoesPage() {
  const router = useRouter();
  const [preferencias, setPreferencias] = useState<Preferencia[]>([]);
  const [carregando, setCarregando] = useState(true);
  const [salvando, setSalvando] = useState<TipoEvento | null>(null);
  const [erro, setErro] = useState('');
  const [sucesso, setSucesso] = useState('');

  useEffect(() => {
    const token = localStorage.getItem('@ServicoFacil:token');
    if (!token) {
      router.replace('/login');
      return;
    }
    api
      .get('/perfil/preferencias-notificacao')
      .then((response) => setPreferencias(response.data.data))
      .catch((err) => setErro(err.response?.data?.message || 'Não foi possível carregar suas configurações.'))
      .finally(() => setCarregando(false));
  }, [router]);

  async function alternar(tipo: TipoEvento) {
    const atual = preferencias.find((p) => p.tipo_evento === tipo);
    const novoValor = !atual?.ativo;

    setPreferencias((lista) => lista.map((p) => (p.tipo_evento === tipo ? { ...p, ativo: novoValor } : p)));
    setSalvando(tipo);
    setErro('');
    setSucesso('');
    try {
      await api.put('/perfil/preferencias-notificacao', {
        preferencias: [{ tipo_evento: tipo, ativo: novoValor }],
      });
      setSucesso('Preferências salvas.');
    } catch (err: any) {
      // Reverte em caso de falha, pra UI não mentir sobre o que está salvo de verdade.
      setPreferencias((lista) => lista.map((p) => (p.tipo_evento === tipo ? { ...p, ativo: !novoValor } : p)));
      setErro(err.response?.data?.message || 'Não foi possível salvar essa preferência.');
    } finally {
      setSalvando(null);
    }
  }

  return (
    <main style={{ maxWidth: '640px', margin: '2rem auto', padding: '0 1.5rem 4rem' }}>
      <Link href="/perfil" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', color: 'var(--text-secondary)', fontSize: '0.9rem', marginBottom: '1.5rem' }}>
        <ArrowLeft size={16} /> Voltar para o perfil
      </Link>

      <header style={{ marginBottom: '1.5rem' }}>
        <h1 style={{ fontSize: '1.4rem', fontWeight: 700, margin: '0 0 0.4rem' }}>Configurações de Notificação</h1>
        <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
          Escolha quais eventos você quer ver na sua central de notificações.
        </p>
      </header>

      {sucesso && (
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', background: 'rgba(16, 185, 129, 0.15)', border: '1px solid var(--accent-color)', color: '#6ee7b7', padding: '0.85rem', borderRadius: '8px', marginBottom: '1rem', fontSize: '0.85rem' }}>
          <CheckCircle size={18} /> <span>{sucesso}</span>
        </div>
      )}
      {erro && (
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', background: 'rgba(239, 68, 68, 0.15)', border: '1px solid var(--danger-color)', color: '#fca5a5', padding: '0.85rem', borderRadius: '8px', marginBottom: '1rem', fontSize: '0.85rem' }}>
          <AlertCircle size={18} /> <span>{erro}</span>
        </div>
      )}

      {carregando ? (
        <div style={{ textAlign: 'center', color: 'var(--text-secondary)', padding: '2rem 0' }}>Carregando...</div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
          {preferencias.map((p) => {
            const info = DESCRICAO_EVENTO[p.tipo_evento];
            return (
              <div key={p.tipo_evento} style={{
                display: 'flex', alignItems: 'center', gap: '1rem',
                background: 'var(--card-bg)', border: '1px solid var(--card-border)', borderRadius: 'var(--border-radius)',
                padding: '1.1rem 1.25rem',
              }}>
                <div style={{
                  width: '38px', height: '38px', borderRadius: '10px', background: 'rgba(59,130,246,0.15)',
                  color: '#60a5fa', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
                }}>
                  {info.icone}
                </div>
                <div style={{ flex: 1 }}>
                  <strong style={{ display: 'block', fontSize: '0.92rem', marginBottom: '2px' }}>{info.titulo}</strong>
                  <span style={{ color: 'var(--text-secondary)', fontSize: '0.8rem' }}>{info.descricao}</span>
                </div>
                <button
                  onClick={() => alternar(p.tipo_evento)}
                  disabled={salvando === p.tipo_evento}
                  role="switch"
                  aria-label={info.titulo}
                  aria-checked={p.ativo}
                  style={{
                    position: 'relative', width: '44px', height: '24px', borderRadius: '999px', border: 'none',
                    background: p.ativo ? '#3b82f6' : '#334155', cursor: salvando === p.tipo_evento ? 'wait' : 'pointer',
                    flexShrink: 0, transition: 'background 0.15s',
                  }}
                >
                  <span style={{
                    position: 'absolute', top: '3px', left: p.ativo ? '23px' : '3px',
                    width: '18px', height: '18px', borderRadius: '50%', background: '#fff', transition: 'left 0.15s',
                  }} />
                </button>
              </div>
            );
          })}
        </div>
      )}
    </main>
  );
}
