'use client';

/**
 * @file minhas-propostas/page.tsx
 * @description Painel "Minhas Propostas Enviadas" do Prestador (US28): lista todas as propostas
 * enviadas, com filtro por status e destaque visual para as aceitas.
 *
 * BIBLIOTECAS UTILIZADAS:
 * 1. Lucide React (^0.383.0): Ícones de status e navegação.
 *    Doc Oficial: https://lucide.dev/
 * 2. Next.js (^14.2.3): Framework React com App Router.
 *    Doc Oficial: https://nextjs.org/docs
 * 3. Axios (^1.7.2): Requisições HTTP REST à API backend.
 *    Doc Oficial: https://axios-http.com/docs/intro
 */

import React, { useCallback, useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Inbox, AlertCircle, ChevronRight, Trophy } from 'lucide-react';
import api from '@/services/api';
import NotificationBell from '@/components/NotificationBell';

interface PropostaResumo {
  id: string;
  valor: string;
  prazo_dias: number;
  status: 'ENVIADA' | 'EM_ANALISE' | 'ACEITA' | 'RECUSADA';
  created_at: string;
  solicitacao: { id: string; titulo: string; status: string };
}

const STATUS_PROPOSTA: Record<string, { label: string; bg: string; fg: string }> = {
  ENVIADA: { label: 'Enviada', bg: 'rgba(148,163,184,0.15)', fg: '#cbd5e1' },
  EM_ANALISE: { label: 'Em análise', bg: 'rgba(245,158,11,0.15)', fg: '#fbbf24' },
  ACEITA: { label: 'Aceita', bg: 'rgba(16,185,129,0.15)', fg: '#34d399' },
  RECUSADA: { label: 'Recusada', bg: 'rgba(239,68,68,0.15)', fg: '#f87171' },
};

function formatarValor(valor: string) {
  return Number(valor).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
}

function formatarData(iso: string) {
  return new Date(iso).toLocaleDateString('pt-BR', { day: '2-digit', month: 'short', year: 'numeric' });
}

export default function MinhasPropostasPage() {
  const router = useRouter();
  const [propostas, setPropostas] = useState<PropostaResumo[]>([]);
  const [filtroStatus, setFiltroStatus] = useState('');
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState('');

  const carregar = useCallback(async () => {
    setCarregando(true);
    setErro('');
    try {
      const response = await api.get('/prestador/propostas', { params: { status: filtroStatus } });
      setPropostas(response.data.dados);
    } catch (err: any) {
      if (err.response?.status === 401) {
        localStorage.removeItem('@ServicoFacil:token');
        localStorage.removeItem('@ServicoFacil:user');
        router.replace('/login');
        return;
      }
      setErro(err.response?.data?.message || 'Não foi possível carregar suas propostas.');
    } finally {
      setCarregando(false);
    }
  }, [filtroStatus]);

  useEffect(() => {
    const token = localStorage.getItem('@ServicoFacil:token');
    if (!token) {
      router.replace('/login');
      return;
    }
    carregar();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [carregar]);

  return (
    <main style={{ maxWidth: '860px', margin: '2rem auto', padding: '0 1.5rem 4rem' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.5rem' }}>
        <Link href="/" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
          <ArrowLeft size={16} /> Voltar para a página inicial
        </Link>
        <NotificationBell />
      </div>

      <header style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <span style={{ color: '#34d399', fontSize: '0.8rem', fontWeight: 600, letterSpacing: '0.05em', textTransform: 'uppercase' }}>
            Área do prestador
          </span>
          <h1 style={{ fontSize: '1.6rem', fontWeight: 700, margin: '0.25rem 0' }}>Minhas Propostas Enviadas</h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>Acompanhe o status de tudo que você já propôs.</p>
        </div>
        <select
          value={filtroStatus}
          onChange={(e) => setFiltroStatus(e.target.value)}
          style={{ padding: '0.6rem 0.75rem', background: '#0f172a', border: '1px solid #334155', borderRadius: '8px', color: '#fff', fontSize: '0.9rem' }}
        >
          <option value="">Todos os status</option>
          {Object.entries(STATUS_PROPOSTA).map(([valor, info]) => (
            <option key={valor} value={valor}>{info.label}</option>
          ))}
        </select>
      </header>

      {carregando && <div style={{ textAlign: 'center', color: 'var(--text-secondary)', padding: '3rem 0' }}>Carregando propostas...</div>}

      {!carregando && erro && (
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', background: 'rgba(239, 68, 68, 0.15)', border: '1px solid var(--danger-color)', color: '#fca5a5', padding: '1rem', borderRadius: '8px', fontSize: '0.9rem' }}>
          <AlertCircle size={20} /> <span>{erro}</span>
        </div>
      )}

      {!carregando && !erro && propostas.length === 0 && (
        <div style={{ textAlign: 'center', padding: '3rem 1rem', color: 'var(--text-secondary)', background: 'var(--card-bg)', border: '1px solid var(--card-border)', borderRadius: 'var(--border-radius)' }}>
          <Inbox size={32} style={{ marginBottom: '0.75rem', opacity: 0.6 }} />
          <p>Nenhuma proposta encontrada{filtroStatus ? ' com esse status' : ' ainda'}.</p>
        </div>
      )}

      {!carregando && !erro && propostas.length > 0 && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.9rem' }}>
          {propostas.map((p) => {
            const cor = STATUS_PROPOSTA[p.status];
            const aceita = p.status === 'ACEITA';
            return (
              <Link key={p.id} href={`/oportunidades/${p.solicitacao.id}`} style={{
                display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '1.5rem', flexWrap: 'wrap',
                textDecoration: 'none', color: 'inherit',
                background: aceita ? 'rgba(16,185,129,0.08)' : 'var(--card-bg)',
                border: `1px solid ${aceita ? '#10b981' : 'var(--card-border)'}`,
                borderRadius: 'var(--border-radius)', padding: '1.25rem',
              }}>
                <div style={{ flex: '1 1 260px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
                    {aceita && <Trophy size={15} color="#34d399" />}
                    <span style={{ padding: '0.25rem 0.7rem', borderRadius: '20px', fontSize: '0.75rem', fontWeight: 600, background: cor.bg, color: cor.fg }}>
                      {cor.label}
                    </span>
                  </div>
                  <h2 style={{ fontSize: '1.02rem', fontWeight: 700, margin: 0 }}>{p.solicitacao.titulo}</h2>
                </div>

                <div style={{ textAlign: 'right', flex: '0 0 auto' }}>
                  <strong style={{ fontSize: '1.05rem' }}>{formatarValor(p.valor)}</strong>
                  <div style={{ color: '#64748b', fontSize: '0.8rem', marginTop: '2px' }}>Prazo de {p.prazo_dias} dias</div>
                  <div style={{ color: '#64748b', fontSize: '0.78rem', marginTop: '2px' }}>Enviada em {formatarData(p.created_at)}</div>
                  <span style={{ display: 'inline-flex', alignItems: 'center', gap: '3px', color: '#34d399', fontSize: '0.85rem', fontWeight: 600, marginTop: '0.5rem' }}>
                    Ver detalhes <ChevronRight size={14} />
                  </span>
                </div>
              </Link>
            );
          })}
        </div>
      )}
    </main>
  );
}
