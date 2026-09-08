'use client';

/**
 * @file minhas-solicitacoes/page.tsx
 * @description Painel "Minhas Solicitações" (US06): lista as solicitações do solicitante autenticado,
 * com filtro por status, busca por título e contagem de propostas recebidas por card.
 *
 * BIBLIOTECAS UTILIZADAS:
 * 1. Lucide React (^0.383.0): Ícones para status, busca e navegação.
 *    Doc Oficial: https://lucide.dev/
 * 2. Next.js (^14.2.3): Framework React com App Router.
 *    Doc Oficial: https://nextjs.org/docs
 * 3. Axios (^1.7.2): Requisições HTTP REST à API backend.
 *    Doc Oficial: https://axios-http.com/docs/intro
 */

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { ArrowLeft, Search, Inbox, AlertCircle, ChevronRight, X, Plus } from 'lucide-react';
import api from '@/services/api';

interface SolicitacaoResumo {
  id: string;
  titulo: string;
  descricao: string;
  status: string;
  created_at: string;
  propostas_recebidas: number;
}

const STATUS_OPCOES = [
  { value: '', label: 'Todos os status' },
  { value: 'ABERTA', label: 'Aberta' },
  { value: 'EM_NEGOCIACAO', label: 'Em negociação' },
  { value: 'CONTRATADA', label: 'Contratada' },
  { value: 'CONCLUIDA', label: 'Concluída' },
  { value: 'CANCELADA', label: 'Cancelada' },
];

const STATUS_COR: Record<string, { bg: string; fg: string; label: string }> = {
  ABERTA: { bg: 'rgba(59,130,246,0.15)', fg: '#60a5fa', label: 'Aberta' },
  EM_NEGOCIACAO: { bg: 'rgba(245,158,11,0.15)', fg: '#fbbf24', label: 'Em negociação' },
  CONTRATADA: { bg: 'rgba(139,92,246,0.15)', fg: '#a78bfa', label: 'Contratada' },
  CONCLUIDA: { bg: 'rgba(16,185,129,0.15)', fg: '#34d399', label: 'Concluída' },
  CANCELADA: { bg: 'rgba(239,68,68,0.15)', fg: '#f87171', label: 'Cancelada' },
};

function formatarData(iso: string) {
  return new Date(iso).toLocaleDateString('pt-BR', { day: '2-digit', month: 'short', year: 'numeric' });
}

export default function MinhasSolicitacoesPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const buscaInicial = searchParams.get('busca') || '';

  const [solicitacoes, setSolicitacoes] = useState<SolicitacaoResumo[]>([]);
  const [status, setStatus] = useState('');
  const [buscaDigitada, setBuscaDigitada] = useState(buscaInicial);
  const [busca, setBusca] = useState(buscaInicial);
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState('');

  useEffect(() => {
    const token = localStorage.getItem('@ServicoFacil:token');
    if (!token) {
      router.replace('/login');
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (!localStorage.getItem('@ServicoFacil:token')) return;

    let cancelado = false;
    setCarregando(true);
    setErro('');

    api
      .get('/solicitacoes/minhas', { params: { status, busca } })
      .then((response) => {
        if (!cancelado) setSolicitacoes(response.data.data);
      })
      .catch((err) => {
        if (cancelado) return;
        if (err.response?.status === 401) {
          localStorage.removeItem('@ServicoFacil:token');
          localStorage.removeItem('@ServicoFacil:user');
          router.replace('/login');
          return;
        }
        setErro(err.response?.data?.message || 'Não foi possível carregar suas solicitações.');
      })
      .finally(() => {
        if (!cancelado) setCarregando(false);
      });

    return () => {
      cancelado = true;
    };
  }, [status, busca]);

  function pesquisar(e: React.FormEvent) {
    e.preventDefault();
    setBusca(buscaDigitada.trim());
  }

  function limparFiltros() {
    setStatus('');
    setBuscaDigitada('');
    setBusca('');
  }

  return (
    <main style={{ maxWidth: '860px', margin: '2rem auto', padding: '0 1.5rem 4rem' }}>
      <Link href="/" style={{
        display: 'inline-flex', alignItems: 'center', gap: '0.5rem',
        marginBottom: '1.5rem', color: 'var(--text-secondary)', fontSize: '0.9rem',
      }}>
        <ArrowLeft size={16} />
        Voltar para a página inicial
      </Link>

      <header style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <span style={{ color: '#a78bfa', fontSize: '0.8rem', fontWeight: 600, letterSpacing: '0.05em', textTransform: 'uppercase' }}>
            Área do solicitante
          </span>
          <h1 style={{ fontSize: '1.6rem', fontWeight: 700, margin: '0.25rem 0' }}>Minhas Solicitações</h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
            Acompanhe o andamento dos seus pedidos e as propostas recebidas.
          </p>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
          <div style={{ textAlign: 'right' }}>
            <strong style={{ fontSize: '1.5rem' }}>{carregando ? '—' : solicitacoes.length}</strong>
            <div style={{ color: 'var(--text-secondary)', fontSize: '0.8rem' }}>
              {solicitacoes.length === 1 ? 'solicitação' : 'solicitações'}
            </div>
          </div>
          <Link href="/nova-solicitacao" style={{
            display: 'inline-flex', alignItems: 'center', gap: '0.4rem',
            padding: '0.6rem 1.1rem', background: '#3b82f6', color: '#fff',
            borderRadius: '8px', fontWeight: 600, fontSize: '0.875rem', textDecoration: 'none',
          }}>
            <Plus size={16} /> Nova Solicitação
          </Link>
        </div>
      </header>

      {/* ── Filtros ─────────────────────────────── */}
      <form onSubmit={pesquisar} style={{
        display: 'flex', gap: '0.75rem', flexWrap: 'wrap', alignItems: 'flex-end',
        background: 'var(--card-bg)', border: '1px solid var(--card-border)',
        borderRadius: 'var(--border-radius)', padding: '1.25rem', marginBottom: '1.5rem',
      }}>
        <div style={{ flex: '1 1 220px' }}>
          <label style={{ display: 'block', fontSize: '0.8rem', color: 'var(--text-secondary)', marginBottom: '0.4rem' }}>
            Buscar pelo título
          </label>
          <div style={{ position: 'relative' }}>
            <Search size={16} style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)', color: '#64748b' }} />
            <input
              type="search"
              value={buscaDigitada}
              onChange={(e) => setBuscaDigitada(e.target.value)}
              placeholder="Ex.: instalação elétrica"
              style={{
                width: '100%', padding: '0.6rem 0.75rem 0.6rem 2.2rem',
                background: '#0f172a', border: '1px solid #334155', borderRadius: '8px',
                color: '#fff', fontSize: '0.9rem',
              }}
            />
          </div>
        </div>

        <div style={{ flex: '0 1 200px' }}>
          <label style={{ display: 'block', fontSize: '0.8rem', color: 'var(--text-secondary)', marginBottom: '0.4rem' }}>
            Status
          </label>
          <select
            value={status}
            onChange={(e) => setStatus(e.target.value)}
            style={{
              width: '100%', padding: '0.6rem 0.75rem', background: '#0f172a',
              border: '1px solid #334155', borderRadius: '8px', color: '#fff', fontSize: '0.9rem',
            }}
          >
            {STATUS_OPCOES.map((opcao) => (
              <option value={opcao.value} key={opcao.value || 'todos'}>{opcao.label}</option>
            ))}
          </select>
        </div>

        <button type="submit" style={{
          padding: '0.6rem 1.1rem', background: '#8b5cf6', color: '#fff', border: 'none',
          borderRadius: '8px', fontWeight: 600, fontSize: '0.9rem', cursor: 'pointer',
        }}>
          Buscar
        </button>
        <button type="button" onClick={limparFiltros} style={{
          display: 'inline-flex', alignItems: 'center', gap: '0.3rem',
          padding: '0.6rem 1rem', background: 'transparent', border: '1px solid #334155',
          color: '#94a3b8', borderRadius: '8px', fontSize: '0.9rem', cursor: 'pointer',
        }}>
          <X size={14} /> Limpar
        </button>
      </form>

      {/* ── Estados ─────────────────────────────── */}
      {carregando && (
        <div style={{ textAlign: 'center', color: 'var(--text-secondary)', padding: '3rem 0' }}>
          Carregando solicitações...
        </div>
      )}

      {!carregando && erro && (
        <div style={{
          display: 'flex', alignItems: 'center', gap: '0.75rem',
          background: 'rgba(239, 68, 68, 0.15)', border: '1px solid var(--danger-color)',
          color: '#fca5a5', padding: '1rem', borderRadius: '8px', fontSize: '0.9rem',
        }}>
          <AlertCircle size={20} />
          <span>{erro}</span>
        </div>
      )}

      {!carregando && !erro && solicitacoes.length === 0 && (
        <div style={{
          textAlign: 'center', padding: '3rem 1rem', color: 'var(--text-secondary)',
          background: 'var(--card-bg)', border: '1px solid var(--card-border)', borderRadius: 'var(--border-radius)',
        }}>
          <Inbox size={32} style={{ marginBottom: '0.75rem', opacity: 0.6 }} />
          <p>Nenhuma solicitação encontrada com os filtros atuais.</p>
        </div>
      )}

      {/* ── Lista ───────────────────────────────── */}
      {!carregando && !erro && solicitacoes.length > 0 && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.9rem' }}>
          {solicitacoes.map((s) => {
            const cor = STATUS_COR[s.status] || { bg: '#1e293b', fg: '#94a3b8', label: s.status };
            return (
              <Link
                key={s.id}
                href={`/minhas-solicitacoes/${s.id}`}
                style={{
                  display: 'flex', flexDirection: 'column', gap: '0.6rem',
                  textDecoration: 'none', color: 'inherit',
                  background: 'var(--card-bg)', border: '1px solid var(--card-border)',
                  borderRadius: 'var(--border-radius)', padding: '1.25rem',
                  transition: 'border-color 0.2s',
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{
                    display: 'inline-block', padding: '0.25rem 0.7rem', borderRadius: '20px',
                    fontSize: '0.75rem', fontWeight: 600, background: cor.bg, color: cor.fg,
                  }}>
                    {cor.label}
                  </span>
                  <span style={{ color: '#64748b', fontSize: '0.8rem' }}>{formatarData(s.created_at)}</span>
                </div>

                <h2 style={{ fontSize: '1.05rem', fontWeight: 700, margin: 0 }}>{s.titulo}</h2>
                <p style={{
                  color: 'var(--text-secondary)', fontSize: '0.875rem', margin: 0,
                  overflow: 'hidden', textOverflow: 'ellipsis', display: '-webkit-box',
                  WebkitLineClamp: 2, WebkitBoxOrient: 'vertical',
                }}>
                  {s.descricao}
                </p>

                <div style={{
                  display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                  marginTop: '0.25rem', paddingTop: '0.75rem', borderTop: '1px solid #1e293b',
                }}>
                  <span style={{ fontSize: '0.85rem', color: '#cbd5e1' }}>
                    <strong>{s.propostas_recebidas}</strong> {s.propostas_recebidas === 1 ? 'proposta recebida' : 'propostas recebidas'}
                  </span>
                  <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.25rem', color: '#a78bfa', fontSize: '0.85rem', fontWeight: 600 }}>
                    Ver propostas <ChevronRight size={15} />
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
