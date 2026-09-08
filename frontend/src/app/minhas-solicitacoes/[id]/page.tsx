'use client';

/**
 * @file minhas-solicitacoes/[id]/page.tsx
 * @description Comparação de propostas recebidas (US11) e aceite/recusa/renegociação (US12) para
 * uma solicitação específica do solicitante autenticado.
 *
 * BIBLIOTECAS UTILIZADAS:
 * 1. Lucide React (^0.383.0): Ícones de status, estrelas de reputação e ações.
 *    Doc Oficial: https://lucide.dev/
 * 2. Next.js (^14.2.3): Framework React com App Router e rotas dinâmicas.
 *    Doc Oficial: https://nextjs.org/docs
 * 3. Axios (^1.7.2): Requisições HTTP REST à API backend.
 *    Doc Oficial: https://axios-http.com/docs/intro
 */

import React, { useCallback, useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  ArrowLeft, Star, CheckCircle, XCircle, Handshake, AlertCircle, User, Paperclip, FileText,
} from 'lucide-react';
import api from '@/services/api';

const BACKEND_ORIGIN = (process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api/v1').replace(/\/api\/v1\/?$/, '');

interface Prestador {
  id: string;
  nome: string;
  foto_url?: string | null;
  perfil_prestador?: { nota_media_reputacao: string; total_avaliacoes: number } | null;
}

interface Anexo {
  id: string;
  url_arquivo: string;
  nome_original: string;
}

interface Proposta {
  id: string;
  valor: string;
  prazo_dias: number;
  mensagem: string;
  status: 'ENVIADA' | 'EM_ANALISE' | 'ACEITA' | 'RECUSADA';
  valor_contraproposta: string | null;
  mensagem_contraproposta: string | null;
  contraproposta_em: string | null;
  createdAt: string;
  prestador: Prestador;
}

interface SolicitacaoDetalhe {
  id: string;
  titulo: string;
  descricao: string;
  status: string;
  anexos?: Anexo[];
  propostas: Proposta[];
}

const STATUS_SOLICITACAO_LABEL: Record<string, string> = {
  ABERTA: 'Aberta',
  EM_NEGOCIACAO: 'Em negociação',
  CONTRATADA: 'Contratada',
  CONCLUIDA: 'Concluída',
  CANCELADA: 'Cancelada',
};

const STATUS_PROPOSTA: Record<string, { label: string; bg: string; fg: string }> = {
  ENVIADA: { label: 'Enviada', bg: 'rgba(148,163,184,0.15)', fg: '#cbd5e1' },
  EM_ANALISE: { label: 'Em análise', bg: 'rgba(245,158,11,0.15)', fg: '#fbbf24' },
  ACEITA: { label: 'Aceita', bg: 'rgba(16,185,129,0.15)', fg: '#34d399' },
  RECUSADA: { label: 'Recusada', bg: 'rgba(239,68,68,0.15)', fg: '#f87171' },
};

function formatarValor(valor: string | number) {
  return Number(valor).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
}

function formatarData(iso: string) {
  return new Date(iso).toLocaleDateString('pt-BR', { day: '2-digit', month: 'short', year: 'numeric' });
}

export default function DetalhePropostasPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const solicitacaoId = params.id;

  const [solicitacao, setSolicitacao] = useState<SolicitacaoDetalhe | null>(null);
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState('');
  const [sucesso, setSucesso] = useState('');
  const [processandoId, setProcessandoId] = useState<string | null>(null);

  const [renegociandoId, setRenegociandoId] = useState<string | null>(null);
  const [novoValor, setNovoValor] = useState('');
  const [novaMensagem, setNovaMensagem] = useState('');

  const carregar = useCallback(async () => {
    setCarregando(true);
    setErro('');
    try {
      const response = await api.get(`/solicitacoes/minhas/${solicitacaoId}/propostas`);
      setSolicitacao(response.data.data);
    } catch (err: any) {
      if (err.response?.status === 401) {
        localStorage.removeItem('@ServicoFacil:token');
        localStorage.removeItem('@ServicoFacil:user');
        router.replace('/login');
        return;
      }
      setErro(err.response?.data?.message || 'Não foi possível carregar esta solicitação.');
    } finally {
      setCarregando(false);
    }
  }, [solicitacaoId]);

  useEffect(() => {
    const token = localStorage.getItem('@ServicoFacil:token');
    if (!token) {
      router.replace('/login');
      return;
    }
    carregar();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [carregar]);

  async function alterarStatus(proposta: Proposta, acao: 'ACEITAR' | 'RECUSAR') {
    const verbo = acao === 'ACEITAR' ? 'aceitar' : 'recusar';
    if (!window.confirm(`Deseja realmente ${verbo} a proposta de ${proposta.prestador.nome}?`)) return;

    setProcessandoId(proposta.id);
    setErro('');
    setSucesso('');
    try {
      const response = await api.patch(`/solicitacoes/minhas/${solicitacaoId}/propostas/${proposta.id}/status`, { acao });
      setSucesso(response.data.mensagem);
      await carregar();
    } catch (err: any) {
      setErro(err.response?.data?.message || 'Não foi possível atualizar a proposta.');
    } finally {
      setProcessandoId(null);
    }
  }

  function abrirRenegociacao(proposta: Proposta) {
    setRenegociandoId(proposta.id);
    setNovoValor(proposta.valor_contraproposta || proposta.valor);
    setNovaMensagem(proposta.mensagem_contraproposta || 'Gostaria de negociar o valor desta proposta.');
    setSucesso('');
  }

  async function renegociar(e: React.FormEvent, proposta: Proposta) {
    e.preventDefault();
    setProcessandoId(proposta.id);
    setErro('');
    setSucesso('');
    try {
      const response = await api.post(`/solicitacoes/minhas/${solicitacaoId}/propostas/${proposta.id}/renegociar`, {
        valor: Number(novoValor),
        mensagem: novaMensagem,
      });
      setSucesso(response.data.mensagem);
      setRenegociandoId(null);
      await carregar();
    } catch (err: any) {
      setErro(err.response?.data?.message || 'Não foi possível enviar a contraproposta.');
    } finally {
      setProcessandoId(null);
    }
  }

  if (carregando) {
    return (
      <main style={{ maxWidth: '860px', margin: '4rem auto', padding: '0 1.5rem', textAlign: 'center', color: 'var(--text-secondary)' }}>
        Carregando propostas...
      </main>
    );
  }

  if (!solicitacao) {
    return (
      <main style={{ maxWidth: '860px', margin: '2rem auto', padding: '0 1.5rem' }}>
        <Link href="/minhas-solicitacoes" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', color: 'var(--text-secondary)', fontSize: '0.9rem', marginBottom: '1.5rem' }}>
          <ArrowLeft size={16} /> Voltar para minhas solicitações
        </Link>
        <div style={{
          display: 'flex', alignItems: 'center', gap: '0.75rem',
          background: 'rgba(239, 68, 68, 0.15)', border: '1px solid var(--danger-color)',
          color: '#fca5a5', padding: '1rem', borderRadius: '8px', fontSize: '0.9rem',
        }}>
          <AlertCircle size={20} />
          <span>{erro}</span>
        </div>
      </main>
    );
  }

  const menorPreco = Math.min(...solicitacao.propostas.map((p) => Number(p.valor)));

  return (
    <main style={{ maxWidth: '860px', margin: '2rem auto', padding: '0 1.5rem 4rem' }}>
      <Link href="/minhas-solicitacoes" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', color: 'var(--text-secondary)', fontSize: '0.9rem', marginBottom: '1.5rem' }}>
        <ArrowLeft size={16} /> Voltar para minhas solicitações
      </Link>

      {/* ── Cabeçalho da Solicitação ─────────────── */}
      <div style={{
        background: 'var(--card-bg)', border: '1px solid var(--card-border)',
        borderRadius: 'var(--border-radius)', padding: '1.5rem', marginBottom: '1.5rem',
        display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '1rem', flexWrap: 'wrap',
      }}>
        <div>
          <span style={{
            display: 'inline-block', padding: '0.25rem 0.7rem', borderRadius: '20px', marginBottom: '0.6rem',
            fontSize: '0.75rem', fontWeight: 600, background: 'rgba(139,92,246,0.15)', color: '#a78bfa',
          }}>
            {STATUS_SOLICITACAO_LABEL[solicitacao.status] || solicitacao.status}
          </span>
          <h1 style={{ fontSize: '1.35rem', fontWeight: 700, margin: '0 0 0.4rem' }}>{solicitacao.titulo}</h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', maxWidth: '520px' }}>{solicitacao.descricao}</p>

          {solicitacao.anexos && solicitacao.anexos.length > 0 && (
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem', marginTop: '0.9rem' }}>
              {solicitacao.anexos.map((anexo) => (
                <a
                  key={anexo.id}
                  href={`${BACKEND_ORIGIN}${anexo.url_arquivo}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  title={anexo.nome_original}
                  style={{
                    display: 'inline-flex', alignItems: 'center', gap: '0.35rem',
                    padding: '0.35rem 0.7rem', borderRadius: '6px',
                    background: '#0f172a', border: '1px solid #334155',
                    color: '#94a3b8', fontSize: '0.78rem', textDecoration: 'none', maxWidth: '160px',
                  }}
                >
                  {anexo.url_arquivo.endsWith('.pdf') ? <FileText size={13} /> : <Paperclip size={13} />}
                  <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{anexo.nome_original}</span>
                </a>
              ))}
            </div>
          )}
        </div>
        <div style={{ textAlign: 'right' }}>
          <strong style={{ fontSize: '1.5rem' }}>{solicitacao.propostas.length}</strong>
          <div style={{ color: 'var(--text-secondary)', fontSize: '0.8rem' }}>propostas recebidas</div>
        </div>
      </div>

      {sucesso && (
        <div style={{
          display: 'flex', alignItems: 'center', gap: '0.75rem',
          background: 'rgba(16, 185, 129, 0.15)', border: '1px solid var(--accent-color)',
          color: '#6ee7b7', padding: '1rem', borderRadius: '8px', marginBottom: '1.5rem', fontSize: '0.9rem',
        }}>
          <CheckCircle size={20} />
          <span>{sucesso}</span>
        </div>
      )}
      {erro && (
        <div style={{
          display: 'flex', alignItems: 'center', gap: '0.75rem',
          background: 'rgba(239, 68, 68, 0.15)', border: '1px solid var(--danger-color)',
          color: '#fca5a5', padding: '1rem', borderRadius: '8px', marginBottom: '1.5rem', fontSize: '0.9rem',
        }}>
          <AlertCircle size={20} />
          <span>{erro}</span>
        </div>
      )}

      <h2 style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: '1rem' }}>Propostas recebidas</h2>

      {solicitacao.propostas.length === 0 && (
        <div style={{
          textAlign: 'center', padding: '2.5rem 1rem', color: 'var(--text-secondary)',
          background: 'var(--card-bg)', border: '1px solid var(--card-border)', borderRadius: 'var(--border-radius)',
        }}>
          Esta solicitação ainda não recebeu propostas.
        </div>
      )}

      <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        {solicitacao.propostas.map((proposta) => {
          const podeAlterar = !['ACEITA', 'RECUSADA'].includes(proposta.status)
            && !['CONTRATADA', 'CONCLUIDA', 'CANCELADA'].includes(solicitacao.status);
          const cor = STATUS_PROPOSTA[proposta.status];
          const ehMelhorPreco = Number(proposta.valor) === menorPreco && solicitacao.propostas.length > 1;
          const nota = proposta.prestador.perfil_prestador ? Number(proposta.prestador.perfil_prestador.nota_media_reputacao) : 0;

          return (
            <article key={proposta.id} style={{
              background: 'var(--card-bg)', border: '1px solid var(--card-border)',
              borderRadius: 'var(--border-radius)', padding: '1.5rem',
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '1rem', marginBottom: '0.75rem', flexWrap: 'wrap' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                  <div style={{
                    width: '42px', height: '42px', borderRadius: '50%', overflow: 'hidden', flexShrink: 0,
                    background: '#0f172a', border: '1px solid #334155',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                  }}>
                    {proposta.prestador.foto_url ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={proposta.prestador.foto_url} alt={proposta.prestador.nome} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    ) : (
                      <User size={20} color="#8b5cf6" />
                    )}
                  </div>
                  <div>
                    <span style={{ display: 'block', color: '#64748b', fontSize: '0.75rem' }}>Proposta de</span>
                    <strong style={{ fontSize: '1rem' }}>{proposta.prestador.nome}</strong>
                    {nota > 0 && (
                      <div style={{ display: 'flex', alignItems: 'center', gap: '3px', marginTop: '2px' }}>
                        <Star size={13} color="#fbbf24" fill="#fbbf24" />
                        <span style={{ fontSize: '0.8rem', color: '#fbbf24' }}>{nota.toFixed(1)}</span>
                        <span style={{ fontSize: '0.78rem', color: '#64748b' }}>
                          ({proposta.prestador.perfil_prestador?.total_avaliacoes} avaliações)
                        </span>
                      </div>
                    )}
                  </div>
                </div>

                <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                  {ehMelhorPreco && (
                    <span style={{
                      padding: '0.25rem 0.6rem', borderRadius: '20px', fontSize: '0.72rem', fontWeight: 600,
                      background: 'rgba(16,185,129,0.15)', color: '#34d399',
                    }}>
                      Menor preço
                    </span>
                  )}
                  <span style={{
                    padding: '0.25rem 0.7rem', borderRadius: '20px', fontSize: '0.75rem', fontWeight: 600,
                    background: cor.bg, color: cor.fg,
                  }}>
                    {cor.label}
                  </span>
                </div>
              </div>

              <p style={{ color: '#cbd5e1', fontSize: '0.9rem', marginBottom: '1rem' }}>{proposta.mensagem}</p>

              <div style={{ display: 'flex', gap: '2rem', marginBottom: '1rem', flexWrap: 'wrap' }}>
                <div>
                  <span style={{ display: 'block', color: '#64748b', fontSize: '0.75rem' }}>Valor</span>
                  <strong style={{ fontSize: '1.1rem' }}>{formatarValor(proposta.valor)}</strong>
                </div>
                <div>
                  <span style={{ display: 'block', color: '#64748b', fontSize: '0.75rem' }}>Prazo estimado</span>
                  <strong style={{ fontSize: '1.1rem' }}>{proposta.prazo_dias} dias</strong>
                </div>
                <div>
                  <span style={{ display: 'block', color: '#64748b', fontSize: '0.75rem' }}>Recebida em</span>
                  <strong style={{ fontSize: '1.1rem' }}>{formatarData(proposta.createdAt)}</strong>
                </div>
              </div>

              {proposta.valor_contraproposta !== null && (
                <div style={{
                  background: '#0f172a', border: '1px solid #334155', borderRadius: '8px',
                  padding: '0.9rem 1rem', marginBottom: '1rem',
                }}>
                  <span style={{ display: 'block', color: '#64748b', fontSize: '0.75rem', marginBottom: '2px' }}>Sua contraproposta</span>
                  <strong style={{ fontSize: '1rem', color: '#fbbf24' }}>{formatarValor(proposta.valor_contraproposta)}</strong>
                  <p style={{ color: '#cbd5e1', fontSize: '0.85rem', margin: '0.4rem 0 0' }}>{proposta.mensagem_contraproposta}</p>
                  {proposta.contraproposta_em && (
                    <small style={{ color: '#64748b' }}>Enviada em {formatarData(proposta.contraproposta_em)}</small>
                  )}
                </div>
              )}

              {podeAlterar && renegociandoId !== proposta.id && (
                <div style={{ display: 'flex', gap: '0.6rem', flexWrap: 'wrap' }}>
                  <button
                    onClick={() => alterarStatus(proposta, 'ACEITAR')}
                    disabled={processandoId === proposta.id}
                    style={{ ...botaoBase, background: '#10b981' }}
                  >
                    <CheckCircle size={15} /> Aceitar proposta
                  </button>
                  <button
                    onClick={() => abrirRenegociacao(proposta)}
                    disabled={processandoId === proposta.id}
                    style={{ ...botaoBase, background: 'transparent', border: '1px solid #8b5cf6', color: '#a78bfa' }}
                  >
                    <Handshake size={15} /> Renegociar valor
                  </button>
                  <button
                    onClick={() => alterarStatus(proposta, 'RECUSAR')}
                    disabled={processandoId === proposta.id}
                    style={{ ...botaoBase, background: 'transparent', border: '1px solid var(--danger-color)', color: '#f87171' }}
                  >
                    <XCircle size={15} /> Recusar
                  </button>
                </div>
              )}

              {podeAlterar && renegociandoId === proposta.id && (
                <form onSubmit={(e) => renegociar(e, proposta)} style={{
                  background: '#0f172a', border: '1px solid #334155', borderRadius: '8px', padding: '1.1rem',
                }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.9rem' }}>
                    <strong style={{ fontSize: '0.9rem' }}>Renegociar proposta</strong>
                    <button type="button" onClick={() => setRenegociandoId(null)} style={{ background: 'transparent', border: 'none', color: '#94a3b8', cursor: 'pointer', fontSize: '0.85rem' }}>
                      Cancelar
                    </button>
                  </div>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '0.75rem', marginBottom: '0.9rem' }}>
                    <label style={{ fontSize: '0.85rem' }}>
                      <span style={{ display: 'block', color: 'var(--text-secondary)', marginBottom: '0.3rem' }}>Novo valor (R$)</span>
                      <input
                        type="number" min="0.01" step="0.01" required
                        value={novoValor}
                        onChange={(e) => setNovoValor(e.target.value)}
                        style={{ width: '100%', padding: '0.55rem 0.7rem', background: '#1e293b', border: '1px solid #334155', borderRadius: '6px', color: '#fff' }}
                      />
                    </label>
                    <label style={{ fontSize: '0.85rem' }}>
                      <span style={{ display: 'block', color: 'var(--text-secondary)', marginBottom: '0.3rem' }}>Mensagem para o prestador</span>
                      <input
                        type="text" minLength={5} required
                        value={novaMensagem}
                        onChange={(e) => setNovaMensagem(e.target.value)}
                        style={{ width: '100%', padding: '0.55rem 0.7rem', background: '#1e293b', border: '1px solid #334155', borderRadius: '6px', color: '#fff' }}
                      />
                    </label>
                  </div>
                  <button type="submit" disabled={processandoId === proposta.id} style={{ ...botaoBase, background: '#8b5cf6' }}>
                    {processandoId === proposta.id ? 'Enviando...' : 'Enviar contraproposta'}
                  </button>
                </form>
              )}
            </article>
          );
        })}
      </div>
    </main>
  );
}

const botaoBase: React.CSSProperties = {
  display: 'inline-flex',
  alignItems: 'center',
  gap: '0.4rem',
  padding: '0.6rem 1rem',
  color: '#fff',
  border: 'none',
  borderRadius: '8px',
  fontWeight: 600,
  fontSize: '0.85rem',
  cursor: 'pointer',
};
