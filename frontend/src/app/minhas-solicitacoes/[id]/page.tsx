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
  Ban, ShieldCheck, CreditCard, MessageCircle, HelpCircle, Clock, Flag,
} from 'lucide-react';
import api from '@/services/api';
import ChatDrawer from '@/components/ChatDrawer';

const BACKEND_ORIGIN = (process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api/v1').replace(/\/api\/v1\/?$/, '');

interface Prestador {
  id: string;
  nome: string;
  foto_url?: string | null;
  perfil_prestador?: {
    nota_media_reputacao: string;
    total_avaliacoes: number;
    descricao_bio?: string | null;
    categorias?: string[] | null;
  } | null;
}

interface Anexo {
  id: string;
  url_arquivo: string;
  nome_original: string;
}

interface Proposta {
  contraproposta_status?: 'PENDENTE' | 'ACEITA' | 'RECUSADA' | null;
  id: string;
  valor: string;
  prazo_dias: number;
  validade_ate: string;
  mensagem: string;
  status: 'ENVIADA' | 'EM_ANALISE' | 'ACEITA' | 'RECUSADA';
  valor_contraproposta: string | null;
  mensagem_contraproposta: string | null;
  contraproposta_em: string | null;
  createdAt: string;
  prestador: Prestador;
}

interface TransacaoCustodia {
  id: string;
  valor: string;
  status_pagamento: 'RETIDO' | 'LIBERADO' | 'REEMBOLSADO';
  metodo_pagamento: 'CARTAO_TESTE' | 'PIX_TESTE';
  referencia_simulada: string;
  retido_em: string;
}

interface Pergunta {
  id: string;
  pergunta: string;
  resposta?: string | null;
  respondida_em?: string | null;
  createdAt: string;
  prestador: { id: string; nome: string; foto_url?: string | null };
}

interface AvaliacaoDados {
  id: string;
  nota: number;
  comentario?: string | null;
  createdAt: string;
  prestador: { id: string; nome: string };
}

interface SolicitacaoDetalhe {
  id: string;
  titulo: string;
  descricao: string;
  status: string;
  motivo_cancelamento?: string | null;
  cancelada_em?: string | null;
  anexos?: Anexo[];
  perguntas?: Pergunta[];
  propostas: Proposta[];
  transacao_custodia?: TransacaoCustodia | null;
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

  const [agora, setAgora] = useState(Date.now());
  useEffect(() => {
    const intervalo = window.setInterval(() => setAgora(Date.now()), 1000);
    return () => window.clearInterval(intervalo);
  }, []);

  const [solicitacao, setSolicitacao] = useState<SolicitacaoDetalhe | null>(null);
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState('');
  const [sucesso, setSucesso] = useState('');
  const [processandoId, setProcessandoId] = useState<string | null>(null);

  const [renegociandoId, setRenegociandoId] = useState<string | null>(null);
  const [novoValor, setNovoValor] = useState('');
  const [novaMensagem, setNovaMensagem] = useState('');

  const [cancelando, setCancelando] = useState(false);
  const [motivoCancelamento, setMotivoCancelamento] = useState('');
  const [processandoCancelamento, setProcessandoCancelamento] = useState(false);

  const [pagando, setPagando] = useState(false);
  const [metodoPagamento, setMetodoPagamento] = useState<'CARTAO_TESTE' | 'PIX_TESTE'>('CARTAO_TESTE');
  const [processandoPagamento, setProcessandoPagamento] = useState(false);

  const [isAdmin, setIsAdmin] = useState(false);

  const [respondendoId, setRespondendoId] = useState<string | null>(null);
  const [textoResposta, setTextoResposta] = useState('');
  const [enviandoResposta, setEnviandoResposta] = useState(false);
  const [chatPropostaId, setChatPropostaId] = useState<string | null>(null);
  const [denunciando, setDenunciando] = useState(false);
  const [motivoDenuncia, setMotivoDenuncia] = useState('');
  const [processandoDenuncia, setProcessandoDenuncia] = useState(false);
  const [processandoCancelContratacao, setProcessandoCancelContratacao] = useState(false);
  const [processandoConclusao, setProcessandoConclusao] = useState(false);
  const [avaliacao, setAvaliacao] = useState<AvaliacaoDados | null>(null);
  const [notaAvaliacao, setNotaAvaliacao] = useState(0);
  const [comentarioAvaliacao, setComentarioAvaliacao] = useState('');
  const [enviandoAvaliacao, setEnviandoAvaliacao] = useState(false);

  useEffect(() => {
    try {
      const userRaw = localStorage.getItem('@ServicoFacil:user');
      const usuario = userRaw ? JSON.parse(userRaw) : null;
      setIsAdmin(usuario?.tipo_perfil === 'ADMIN');
    } catch {
      setIsAdmin(false);
    }
  }, []);

  const carregar = useCallback(async () => {
    setCarregando(true);
    setErro('');
    try {
      const response = await api.get(`/solicitacoes/minhas/${solicitacaoId}/propostas`);
      setSolicitacao(response.data.data);
      if (response.data.data.status === 'CONCLUIDA') {
        const avaliacaoResponse = await api.get(`/solicitacoes/${solicitacaoId}/avaliacao`);
        setAvaliacao(avaliacaoResponse.data.data);
      }
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
      if (acao === 'ACEITAR') {
        setChatPropostaId(null);
        setPagando(true);
      }
    } catch (err: any) {
      if (err.response?.status === 409) {
        await carregar();
        setChatPropostaId(null);
      }
      setErro(err.response?.data?.message || 'Não foi possível atualizar a proposta.');
    } finally {
      setProcessandoId(null);
    }
  }

  async function cancelarContratacao() {
    if (!window.confirm('Deseja realmente cancelar esta contratação? A solicitação volta a aceitar propostas de outros prestadores.')) return;

    setProcessandoCancelContratacao(true);
    setErro('');
    setSucesso('');
    try {
      const response = await api.patch(`/solicitacoes/${solicitacaoId}/cancelar-contratacao`);
      setSucesso(response.data.mensagem);
      await carregar();
    } catch (err: any) {
      setErro(err.response?.data?.message || 'Não foi possível cancelar a contratação.');
    } finally {
      setProcessandoCancelContratacao(false);
    }
  }

  async function concluirServico() {
    if (!window.confirm('Confirmar que o serviço foi concluído? O valor em custódia (se houver) será liberado ao prestador.')) return;

    setProcessandoConclusao(true);
    setErro('');
    setSucesso('');
    try {
      const response = await api.patch(`/solicitacoes/${solicitacaoId}/concluir`);
      setSucesso(response.data.mensagem);
      await carregar();
    } catch (err: any) {
      setErro(err.response?.data?.message || 'Não foi possível concluir o serviço.');
    } finally {
      setProcessandoConclusao(false);
    }
  }

  async function enviarAvaliacao(e: React.FormEvent) {
    e.preventDefault();
    if (notaAvaliacao < 1) return;

    setEnviandoAvaliacao(true);
    setErro('');
    try {
      await api.post(`/solicitacoes/${solicitacaoId}/avaliar`, {
        nota: notaAvaliacao,
        comentario: comentarioAvaliacao.trim() || undefined,
      });
      const avaliacaoResponse = await api.get(`/solicitacoes/${solicitacaoId}/avaliacao`);
      setAvaliacao(avaliacaoResponse.data.data);
    } catch (err: any) {
      setErro(err.response?.data?.message || 'Não foi possível registrar a avaliação.');
    } finally {
      setEnviandoAvaliacao(false);
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
      if (err.response?.status === 409) {
        await carregar();
        setRenegociandoId(null);
      }
      setErro(err.response?.data?.message || 'Não foi possível enviar a contraproposta.');
    } finally {
      setProcessandoId(null);
    }
  }

  async function cancelarSolicitacao(e: React.FormEvent) {
    e.preventDefault();
    setProcessandoCancelamento(true);
    setErro('');
    setSucesso('');
    try {
      const response = await api.patch(`/solicitacoes/${solicitacaoId}/cancelar`, { motivo: motivoCancelamento });
      setSucesso(response.data.mensagem);
      setCancelando(false);
      setMotivoCancelamento('');
      await carregar();
    } catch (err: any) {
      setErro(err.response?.data?.message || 'Não foi possível cancelar esta solicitação.');
    } finally {
      setProcessandoCancelamento(false);
    }
  }

  async function denunciarSolicitacao(e: React.FormEvent) {
    e.preventDefault();
    const motivo = motivoDenuncia.trim();
    if (!motivo) return;

    setProcessandoDenuncia(true);
    setErro('');
    try {
      const response = await api.post(`/solicitacoes/${solicitacaoId}/denunciar`, { motivo });
      setSucesso(response.data.mensagem);
      setDenunciando(false);
      setMotivoDenuncia('');
    } catch (err: any) {
      setErro(err.response?.data?.message || 'Não foi possível registrar a denúncia.');
    } finally {
      setProcessandoDenuncia(false);
    }
  }

  async function simularPagamento(e: React.FormEvent) {
    e.preventDefault();
    setProcessandoPagamento(true);
    setErro('');
    setSucesso('');
    try {
      const response = await api.post(`/solicitacoes/${solicitacaoId}/custodia/simular`, {
        metodo_pagamento: metodoPagamento,
      });
      setSucesso(response.data.mensagem);
      setPagando(false);
      await carregar();
    } catch (err: any) {
      setErro(err.response?.data?.message || 'Não foi possível simular o pagamento.');
    } finally {
      setProcessandoPagamento(false);
    }
  }

  function abrirResposta(pergunta: Pergunta) {
    setRespondendoId(pergunta.id);
    setTextoResposta('');
  }

  async function responderPergunta(e: React.FormEvent, perguntaId: string) {
    e.preventDefault();
    const resposta = textoResposta.trim();
    if (!resposta) return;

    setEnviandoResposta(true);
    setErro('');
    try {
      const response = await api.patch(`/solicitacoes/${solicitacaoId}/perguntas/${perguntaId}/responder`, { resposta });
      setSolicitacao((atual) => (atual
        ? { ...atual, perguntas: (atual.perguntas || []).map((p) => (p.id === perguntaId ? response.data.data : p)) }
        : atual));
      setRespondendoId(null);
    } catch (err: any) {
      setErro(err.response?.data?.message || 'Não foi possível enviar a resposta.');
    } finally {
      setEnviandoResposta(false);
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
        <Link href={isAdmin ? '/admin' : '/minhas-solicitacoes'} style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', color: 'var(--text-secondary)', fontSize: '0.9rem', marginBottom: '1.5rem' }}>
          <ArrowLeft size={16} /> {isAdmin ? 'Voltar para o painel administrativo' : 'Voltar para minhas solicitações'}
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
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.5rem' }}>
        <Link href={isAdmin ? '/admin' : '/minhas-solicitacoes'} style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
          <ArrowLeft size={16} /> {isAdmin ? 'Voltar para o painel administrativo' : 'Voltar para minhas solicitações'}
        </Link>
        {!isAdmin && (
          <button onClick={() => setDenunciando(true)} title="Denunciar esta solicitação" style={{
            display: 'inline-flex', alignItems: 'center', gap: '0.35rem', background: 'transparent',
            border: 'none', color: '#64748b', fontSize: '0.8rem', cursor: 'pointer',
          }}>
            <Flag size={14} /> Denunciar
          </button>
        )}
      </div>

      {denunciando && (
        <form onSubmit={denunciarSolicitacao} style={{
          background: '#0f172a', border: '1px solid var(--danger-color)', borderRadius: '8px',
          padding: '1rem', marginBottom: '1.5rem',
        }}>
          <strong style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.9rem' }}>Denunciar esta solicitação</strong>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.82rem', marginBottom: '0.6rem' }}>
            Conte o que está errado (golpe, informação falsa, conteúdo impróprio no chat etc.). A administração vai revisar.
          </p>
          <input
            value={motivoDenuncia}
            onChange={(e) => setMotivoDenuncia(e.target.value)}
            placeholder="Motivo da denúncia"
            maxLength={1000}
            style={{ width: '100%', padding: '0.55rem 0.7rem', background: '#1e293b', border: '1px solid #334155', borderRadius: '6px', color: '#fff', marginBottom: '0.6rem' }}
          />
          <div style={{ display: 'flex', gap: '0.5rem' }}>
            <button type="submit" disabled={processandoDenuncia || !motivoDenuncia.trim()} style={{
              padding: '0.55rem 1rem', background: 'var(--danger-color)', color: '#fff', border: 'none',
              borderRadius: '6px', fontWeight: 600, fontSize: '0.82rem', cursor: 'pointer',
            }}>
              {processandoDenuncia ? 'Enviando...' : 'Enviar denúncia'}
            </button>
            <button type="button" onClick={() => setDenunciando(false)} style={{
              padding: '0.55rem 0.8rem', background: 'transparent', border: '1px solid #334155', color: '#94a3b8',
              borderRadius: '6px', fontSize: '0.82rem', cursor: 'pointer',
            }}>
              Cancelar
            </button>
          </div>
        </form>
      )}

      {isAdmin && (
        <div style={{
          display: 'inline-flex', alignItems: 'center', gap: '0.4rem', marginBottom: '1rem',
          padding: '0.3rem 0.7rem', borderRadius: '20px', fontSize: '0.78rem', fontWeight: 600,
          background: 'rgba(139,92,246,0.15)', color: '#a78bfa',
        }}>
          <ShieldCheck size={14} /> Modo administrativo — visualização somente leitura
        </div>
      )}

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
          {!isAdmin && ['ABERTA', 'EM_NEGOCIACAO'].includes(solicitacao.status) && !cancelando && (
            <button
              onClick={() => setCancelando(true)}
              style={{
                display: 'inline-flex', alignItems: 'center', gap: '0.35rem', marginTop: '0.75rem',
                background: 'transparent', border: '1px solid var(--danger-color)', color: '#f87171',
                borderRadius: '8px', padding: '0.4rem 0.8rem', fontSize: '0.8rem', fontWeight: 600, cursor: 'pointer',
              }}
            >
              <Ban size={14} /> Cancelar solicitação
            </button>
          )}
        </div>
      </div>

      {solicitacao.status === 'CANCELADA' && solicitacao.motivo_cancelamento && (
        <div style={{
          display: 'flex', alignItems: 'flex-start', gap: '0.75rem',
          background: 'rgba(239, 68, 68, 0.15)', border: '1px solid var(--danger-color)',
          color: '#fca5a5', padding: '1rem', borderRadius: '8px', marginBottom: '1.5rem', fontSize: '0.9rem',
        }}>
          <Ban size={20} style={{ flexShrink: 0, marginTop: '2px' }} />
          <span>{isAdmin ? 'Esta solicitação foi cancelada' : 'Você cancelou esta solicitação'}. Motivo: {solicitacao.motivo_cancelamento}</span>
        </div>
      )}

      {cancelando && (
        <form onSubmit={cancelarSolicitacao} style={{
          background: 'var(--card-bg)', border: '1px solid var(--danger-color)', borderRadius: 'var(--border-radius)',
          padding: '1.25rem', marginBottom: '1.5rem',
        }}>
          <strong style={{ display: 'block', marginBottom: '0.6rem', fontSize: '0.95rem' }}>Cancelar esta solicitação</strong>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', marginBottom: '0.75rem' }}>
            Os prestadores que já enviaram proposta serão notificados do cancelamento.
          </p>
          <label style={{ fontSize: '0.85rem', display: 'block', marginBottom: '0.9rem' }}>
            <span style={{ display: 'block', color: 'var(--text-secondary)', marginBottom: '0.3rem' }}>Motivo do cancelamento</span>
            <input
              type="text" minLength={5} required
              value={motivoCancelamento}
              onChange={(e) => setMotivoCancelamento(e.target.value)}
              placeholder="Ex: Consegui resolver de outra forma"
              style={{ width: '100%', padding: '0.55rem 0.7rem', background: '#1e293b', border: '1px solid #334155', borderRadius: '6px', color: '#fff' }}
            />
          </label>
          <div style={{ display: 'flex', gap: '0.6rem' }}>
            <button type="submit" disabled={processandoCancelamento} style={{ ...botaoBase, background: 'var(--danger-color)' }}>
              {processandoCancelamento ? 'Cancelando...' : 'Confirmar cancelamento'}
            </button>
            <button type="button" onClick={() => setCancelando(false)} style={{ ...botaoBase, background: 'transparent', border: '1px solid #334155', color: '#94a3b8' }}>
              Voltar
            </button>
          </div>
        </form>
      )}

      {solicitacao.status === 'CONTRATADA' && (
        <div style={{
          background: 'var(--card-bg)', border: '1px solid var(--card-border)', borderRadius: 'var(--border-radius)',
          padding: '1.25rem', marginBottom: '1.5rem',
        }}>
          {solicitacao.transacao_custodia?.status_pagamento === 'RETIDO' ? (
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
              <ShieldCheck size={24} color="#34d399" />
              <div>
                <strong style={{ display: 'block', fontSize: '0.95rem' }}>
                  Pagamento retido em custódia — {formatarValor(solicitacao.transacao_custodia.valor)}
                </strong>
                <span style={{ color: 'var(--text-secondary)', fontSize: '0.8rem' }}>
                  O valor será liberado ao prestador quando o serviço for concluído. Referência: {solicitacao.transacao_custodia.referencia_simulada}
                </span>
              </div>
            </div>
          ) : isAdmin ? (
            <span style={{ color: 'var(--text-secondary)', fontSize: '0.85rem' }}>O pagamento desta contratação ainda não foi simulado pelo solicitante.</span>
          ) : !pagando ? (
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '1rem', flexWrap: 'wrap' }}>
              <div>
                <strong style={{ display: 'block', fontSize: '0.95rem', marginBottom: '2px' }}>Proteja o pagamento deste serviço</strong>
                <span style={{ color: 'var(--text-secondary)', fontSize: '0.85rem' }}>
                  Simule o checkout para reter o valor em custódia até a conclusão do serviço.
                </span>
              </div>
              <button onClick={() => setPagando(true)} style={{ ...botaoBase, background: '#3b82f6' }}>
                <CreditCard size={15} /> Simular pagamento
              </button>
            </div>
          ) : (
            <form onSubmit={simularPagamento}>
              <strong style={{ display: 'block', marginBottom: '0.75rem', fontSize: '0.95rem' }}>Checkout simulado</strong>
              <div style={{ display: 'flex', gap: '0.75rem', marginBottom: '1rem' }}>
                <label style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.85rem' }}>
                  <input type="radio" name="metodo" checked={metodoPagamento === 'CARTAO_TESTE'} onChange={() => setMetodoPagamento('CARTAO_TESTE')} />
                  Cartão de teste
                </label>
                <label style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.85rem' }}>
                  <input type="radio" name="metodo" checked={metodoPagamento === 'PIX_TESTE'} onChange={() => setMetodoPagamento('PIX_TESTE')} />
                  PIX de teste
                </label>
              </div>
              <div style={{ display: 'flex', gap: '0.6rem' }}>
                <button type="submit" disabled={processandoPagamento} style={{ ...botaoBase, background: '#3b82f6' }}>
                  {processandoPagamento ? 'Processando...' : 'Confirmar pagamento simulado'}
                </button>
                <button type="button" onClick={() => setPagando(false)} style={{ ...botaoBase, background: 'transparent', border: '1px solid #334155', color: '#94a3b8' }}>
                  Voltar
                </button>
              </div>
            </form>
          )}
        </div>
      )}

      {/* Confirmação de conclusão do serviço (US17) e cancelamento de uma contratação já aceita (US34
          — antes disso, aceitar era irreversível). */}
      {!isAdmin && solicitacao.status === 'CONTRATADA' && (
        <div style={{
          display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '1rem', flexWrap: 'wrap',
          background: 'var(--card-bg)', border: '1px solid var(--card-border)', borderRadius: 'var(--border-radius)',
          padding: '1rem 1.25rem', marginBottom: '1.5rem',
        }}>
          <span style={{ color: 'var(--text-secondary)', fontSize: '0.85rem' }}>
            O serviço já foi realizado? Confirme a conclusão para liberar o pagamento e a avaliação.
          </span>
          <div style={{ display: 'flex', gap: '0.6rem', flexShrink: 0 }}>
            <button onClick={concluirServico} disabled={processandoConclusao} style={{
              display: 'inline-flex', alignItems: 'center', gap: '0.4rem',
              background: '#10b981', color: '#fff', border: 'none',
              borderRadius: '8px', padding: '0.5rem 0.9rem', fontSize: '0.82rem', fontWeight: 600, cursor: 'pointer',
            }}>
              <CheckCircle size={14} /> {processandoConclusao ? 'Confirmando...' : 'Marcar como concluído'}
            </button>
            <button onClick={cancelarContratacao} disabled={processandoCancelContratacao} style={{
              display: 'inline-flex', alignItems: 'center', gap: '0.4rem',
              background: 'transparent', border: '1px solid var(--danger-color)', color: '#f87171',
              borderRadius: '8px', padding: '0.5rem 0.9rem', fontSize: '0.82rem', fontWeight: 600, cursor: 'pointer',
            }}>
              <Ban size={14} /> {processandoCancelContratacao ? 'Cancelando...' : 'Cancelar contratação'}
            </button>
          </div>
        </div>
      )}

      {/* Avaliação de satisfação (US18) — liberada depois que o serviço é concluído (US17). */}
      {!isAdmin && solicitacao.status === 'CONCLUIDA' && (
        <div style={{
          background: 'var(--card-bg)', border: '1px solid var(--card-border)', borderRadius: 'var(--border-radius)',
          padding: '1.25rem', marginBottom: '1.5rem',
        }}>
          {avaliacao ? (
            <div>
              <strong style={{ display: 'block', fontSize: '0.95rem', marginBottom: '0.5rem' }}>Sua avaliação</strong>
              <div style={{ display: 'flex', gap: '2px', marginBottom: '0.5rem' }}>
                {[1, 2, 3, 4, 5].map((n) => (
                  <Star key={n} size={18} color="#fbbf24" fill={n <= avaliacao.nota ? '#fbbf24' : 'none'} />
                ))}
              </div>
              {avaliacao.comentario && <p style={{ color: '#cbd5e1', fontSize: '0.88rem', margin: 0 }}>{avaliacao.comentario}</p>}
            </div>
          ) : (
            <form onSubmit={enviarAvaliacao}>
              <strong style={{ display: 'block', fontSize: '0.95rem', marginBottom: '0.75rem' }}>Como foi o serviço de {solicitacao.propostas.find((p) => p.status === 'ACEITA')?.prestador.nome || 'o prestador'}?</strong>
              <div style={{ display: 'flex', gap: '4px', marginBottom: '0.9rem' }}>
                {[1, 2, 3, 4, 5].map((n) => (
                  <button
                    key={n} type="button" onClick={() => setNotaAvaliacao(n)}
                    aria-label={`Avaliar com ${n} ${n === 1 ? 'estrela' : 'estrelas'}`}
                    aria-pressed={notaAvaliacao === n}
                    style={{ background: 'transparent', border: 'none', cursor: 'pointer', padding: 0 }}
                  >
                    <Star size={26} color="#fbbf24" fill={n <= notaAvaliacao ? '#fbbf24' : 'none'} />
                  </button>
                ))}
              </div>
              <textarea
                value={comentarioAvaliacao}
                onChange={(e) => setComentarioAvaliacao(e.target.value)}
                placeholder="Conte como foi a experiência (opcional)"
                rows={3}
                style={{ width: '100%', padding: '0.6rem 0.7rem', background: '#1e293b', border: '1px solid #334155', borderRadius: '6px', color: '#fff', fontSize: '0.85rem', marginBottom: '0.75rem', resize: 'vertical' }}
              />
              <button type="submit" disabled={enviandoAvaliacao || notaAvaliacao < 1} style={{
                ...botaoBase, background: notaAvaliacao < 1 ? '#475569' : '#3b82f6',
                cursor: notaAvaliacao < 1 ? 'not-allowed' : 'pointer',
              }}>
                {enviandoAvaliacao ? 'Enviando...' : 'Enviar avaliação'}
              </button>
            </form>
          )}
        </div>
      )}

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

      {(solicitacao.perguntas || []).length > 0 && (
        <div style={{
          background: 'var(--card-bg)', border: '1px solid var(--card-border)', borderRadius: 'var(--border-radius)',
          padding: '1.5rem', marginBottom: '1.5rem',
        }}>
          <h2 style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '1.05rem', fontWeight: 700, marginBottom: '1rem' }}>
            <HelpCircle size={18} /> Perguntas de prestadores
          </h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {(solicitacao.perguntas || []).map((p) => (
              <div key={p.id} style={{ background: '#0f172a', border: '1px solid #334155', borderRadius: '8px', padding: '1rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '4px', color: '#64748b', fontSize: '0.75rem', marginBottom: '0.4rem' }}>
                  <User size={11} /> {p.prestador.nome} perguntou · {formatarData(p.createdAt)}
                </div>
                <p style={{ color: '#e2e8f0', fontSize: '0.9rem', margin: '0 0 0.6rem' }}>{p.pergunta}</p>

                {p.resposta ? (
                  <div style={{ paddingLeft: '0.9rem', borderLeft: '2px solid #3b82f6' }}>
                    <div style={{ color: '#60a5fa', fontSize: '0.75rem', marginBottom: '0.2rem', fontWeight: 600 }}>Sua resposta</div>
                    <p style={{ color: '#cbd5e1', fontSize: '0.88rem', margin: 0 }}>{p.resposta}</p>
                  </div>
                ) : isAdmin ? (
                  <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', color: '#fbbf24', fontSize: '0.78rem' }}>
                    <Clock size={12} /> Aguardando resposta do solicitante
                  </span>
                ) : respondendoId === p.id ? (
                  <form onSubmit={(e) => responderPergunta(e, p.id)} style={{ display: 'flex', gap: '0.6rem' }}>
                    <input
                      value={textoResposta}
                      onChange={(e) => setTextoResposta(e.target.value)}
                      placeholder="Escreva sua resposta..."
                      maxLength={1000}
                      autoFocus
                      style={{ flex: 1, padding: '0.5rem 0.7rem', background: '#1e293b', border: '1px solid #334155', borderRadius: '6px', color: '#fff', fontSize: '0.85rem' }}
                    />
                    <button type="submit" disabled={enviandoResposta || !textoResposta.trim()} style={{
                      padding: '0 1rem', background: !textoResposta.trim() ? '#475569' : '#3b82f6', color: '#fff',
                      border: 'none', borderRadius: '6px', fontWeight: 600, fontSize: '0.82rem',
                      cursor: !textoResposta.trim() ? 'not-allowed' : 'pointer',
                    }}>
                      Enviar
                    </button>
                    <button type="button" onClick={() => setRespondendoId(null)} style={{
                      padding: '0 0.8rem', background: 'transparent', border: '1px solid #334155', color: '#94a3b8',
                      borderRadius: '6px', fontSize: '0.82rem', cursor: 'pointer',
                    }}>
                      Cancelar
                    </button>
                  </form>
                ) : (
                  <button onClick={() => abrirResposta(p)} style={{
                    display: 'inline-flex', alignItems: 'center', gap: '4px', background: 'transparent',
                    border: '1px solid #3b82f6', color: '#60a5fa', borderRadius: '6px', padding: '0.35rem 0.7rem',
                    fontSize: '0.8rem', fontWeight: 600, cursor: 'pointer',
                  }}>
                    Responder
                  </button>
                )}
              </div>
            ))}
          </div>
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
          const expirada = !(new Date(proposta.validade_ate).getTime() > agora);
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
                    <Link href={`/prestadores/${proposta.prestador.id}`} style={{ fontSize: '1rem', fontWeight: 700 }}>
                      {proposta.prestador.nome} · Ver perfil
                    </Link>
                    {nota > 0 && (
                      <div style={{ display: 'flex', alignItems: 'center', gap: '3px', marginTop: '2px' }}>
                        <Star size={13} color="#fbbf24" fill="#fbbf24" />
                        <span style={{ fontSize: '0.8rem', color: '#fbbf24' }}>{nota.toFixed(1)}</span>
                        <span style={{ fontSize: '0.78rem', color: '#64748b' }}>
                          ({proposta.prestador.perfil_prestador?.total_avaliacoes} avaliações)
                        </span>
                      </div>
                    )}
                    {proposta.prestador.perfil_prestador?.categorias && proposta.prestador.perfil_prestador.categorias.length > 0 && (
                      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px', marginTop: '4px' }}>
                        {proposta.prestador.perfil_prestador.categorias.map((cat) => (
                          <span key={cat} style={{
                            padding: '0.1rem 0.5rem', borderRadius: '20px', fontSize: '0.68rem', fontWeight: 600,
                            background: '#1e293b', color: '#94a3b8',
                          }}>
                            {cat}
                          </span>
                        ))}
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

              {proposta.prestador.perfil_prestador?.descricao_bio && (
                <p style={{ color: '#94a3b8', fontSize: '0.82rem', fontStyle: 'italic', marginBottom: '0.75rem' }}>
                  "{proposta.prestador.perfil_prestador.descricao_bio}"
                </p>
              )}
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
                  <span style={{ display: 'block', color: '#64748b', fontSize: '0.75rem' }}>Validade comercial até</span>
                  <strong>{new Date(proposta.validade_ate).toLocaleString('pt-BR')}</strong>
                </div>
                <div>
                  <span style={{ display: 'block', color: '#64748b', fontSize: '0.75rem' }}>Recebida em</span>
                  <strong style={{ fontSize: '1.1rem' }}>{formatarData(proposta.createdAt)}</strong>
                </div>
              </div>

              {expirada && ['ENVIADA', 'EM_ANALISE'].includes(proposta.status) && (
                <p role="status" style={{ color: '#fbbf24', fontSize: '0.85rem' }}>
                  Proposta expirada. O aceite e a renegociação estão bloqueados; ainda é possível recusá-la.
                </p>
              )}

              {proposta.valor_contraproposta !== null && (
                <div style={{
                  background: '#0f172a', border: '1px solid #334155', borderRadius: '8px',
                  padding: '0.9rem 1rem', marginBottom: '1rem',
                }}>
                  <span style={{ display: 'block', color: '#64748b', fontSize: '0.75rem', marginBottom: '2px' }}>Sua contraproposta</span>
                  <strong style={{ fontSize: '1rem', color: '#fbbf24' }}>{formatarValor(proposta.valor_contraproposta)}</strong>
                  <p role="status">{proposta.contraproposta_status === 'PENDENTE' ? 'Aguardando resposta do prestador. A contratação fica disponível após a resposta.' : proposta.contraproposta_status === 'ACEITA' ? (proposta.status === 'ACEITA' ? 'Contratação confirmada com o valor da contraproposta.' : 'O prestador aceitou o novo valor. Confira e confirme a contratação.') : proposta.contraproposta_status === 'RECUSADA' ? 'O prestador recusou a contraproposta. O valor anterior foi mantido.' : 'Negociação anterior'}</p>
                  <p style={{ color: '#cbd5e1', fontSize: '0.85rem', margin: '0.4rem 0 0' }}>{proposta.mensagem_contraproposta}</p>
                  {proposta.contraproposta_em && (
                    <small style={{ color: '#64748b' }}>Enviada em {formatarData(proposta.contraproposta_em)}</small>
                  )}
                </div>
              )}

              {!isAdmin && (
                <div style={{ display: 'flex', gap: '0.6rem', flexWrap: 'wrap', marginBottom: podeAlterar && renegociandoId !== proposta.id ? '0.6rem' : 0 }}>
                  {/* Chat liberado desde o envio da proposta (US34) — não precisa mais aceitar antes de conversar. */}
                  <button
                    onClick={() => setChatPropostaId(proposta.id)}
                    style={{ ...botaoBase, background: 'transparent', border: '1px solid #3b82f6', color: '#60a5fa' }}
                  >
                    <MessageCircle size={15} /> {proposta.status === 'RECUSADA' ? 'Ver conversa' : 'Conversar'}
                  </button>
                </div>
              )}

              {!isAdmin && podeAlterar && renegociandoId !== proposta.id && (
                <div style={{ display: 'flex', gap: '0.6rem', flexWrap: 'wrap' }}>
                  <button
                    onClick={() => alterarStatus(proposta, 'ACEITAR')}
                    disabled={processandoId === proposta.id || expirada || proposta.contraproposta_status === 'PENDENTE'}
                    title={expirada ? 'A validade comercial desta proposta expirou.' : undefined}
                    style={{ ...botaoBase, background: '#10b981' }}
                  >
                    <CheckCircle size={15} /> Aceitar proposta
                  </button>
                  <button
                    onClick={() => abrirRenegociacao(proposta)}
                    disabled={processandoId === proposta.id || expirada}
                    title={expirada ? 'A validade comercial desta proposta expirou.' : undefined}
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

              {!isAdmin && podeAlterar && renegociandoId === proposta.id && (
                <form onSubmit={(e) => renegociar(e, proposta)} style={{
                  background: '#0f172a', border: '1px solid #334155', borderRadius: '8px', padding: '1.1rem',
                }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.9rem' }}>
                    <strong style={{ fontSize: '0.9rem' }}>Renegociar proposta</strong>
                    <button type="button" onClick={() => setRenegociandoId(null)} style={{ background: 'transparent', border: 'none', color: '#94a3b8', cursor: 'pointer', fontSize: '0.85rem' }}>
                      Cancelar
                    </button>
                  </div>
                  <div className="grid-2-cols" style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '0.75rem', marginBottom: '0.9rem' }}>
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
                  <button type="submit" disabled={processandoId === proposta.id || expirada} style={{ ...botaoBase, background: '#8b5cf6' }}>
                    {processandoId === proposta.id ? 'Enviando...' : 'Enviar contraproposta'}
                  </button>
                </form>
              )}
            </article>
          );
        })}
      </div>

      {(() => {
        const propostaDoChat = solicitacao.propostas.find((p) => p.id === chatPropostaId) || null;
        return (
          <ChatDrawer
            propostaId={chatPropostaId || ''}
            solicitacaoId={solicitacao.id}
            titulo={`Chat com ${propostaDoChat?.prestador.nome || 'o prestador'}`}
            aberto={!!chatPropostaId}
            onClose={() => setChatPropostaId(null)}
            statusProposta={propostaDoChat?.status}
            onAceitar={propostaDoChat && propostaDoChat.contraproposta_status !== 'PENDENTE' && new Date(propostaDoChat.validade_ate).getTime() > agora
              && ['ABERTA', 'EM_NEGOCIACAO'].includes(solicitacao.status)
              ? () => alterarStatus(propostaDoChat, 'ACEITAR') : undefined}
            onRecusar={propostaDoChat
              && ['ABERTA', 'EM_NEGOCIACAO'].includes(solicitacao.status)
              ? () => alterarStatus(propostaDoChat, 'RECUSAR') : undefined}
            decidindo={processandoId === chatPropostaId}
          />
        );
      })()}
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
