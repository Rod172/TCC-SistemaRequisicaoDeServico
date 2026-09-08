'use client';

/**
 * @file oportunidades/[id]/page.tsx
 * @description Detalhes de uma oportunidade de serviço (US09) e envio de proposta pelo Prestador (US10).
 *
 * BIBLIOTECAS UTILIZADAS:
 * 1. Lucide React (^0.383.0): Ícones de local, cliente e status.
 *    Doc Oficial: https://lucide.dev/
 * 2. Next.js (^14.2.3): Framework React com App Router e rotas dinâmicas.
 *    Doc Oficial: https://nextjs.org/docs
 * 3. Axios (^1.7.2): Requisições HTTP REST à API backend.
 *    Doc Oficial: https://axios-http.com/docs/intro
 */

import React, { useCallback, useEffect, useState } from 'react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import { ArrowLeft, MapPin, User, CheckCircle, AlertCircle, Send, Paperclip, FileText } from 'lucide-react';
import api from '@/services/api';

const BACKEND_ORIGIN = (process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api/v1').replace(/\/api\/v1\/?$/, '');

interface Solicitante {
  id: string;
  nome: string;
  foto_url?: string | null;
}

interface Anexo {
  id: string;
  url_arquivo: string;
  nome_original: string;
}

interface MinhaProposta {
  id: string;
  valor: string;
  prazo_dias: number;
  mensagem: string;
  status: string;
  created_at: string;
}

interface Oportunidade {
  id: string;
  titulo: string;
  categoria: string | null;
  cidade: string | null;
  bairro: string | null;
  descricao: string;
  orcamento_cliente: string | null;
  status: string;
  created_at: string;
  solicitante: Solicitante;
  anexos?: Anexo[];
  pode_enviar_proposta: boolean;
  minha_proposta: MinhaProposta | null;
}

function formatarOrcamento(valor: string | null) {
  if (valor === null) return 'A combinar';
  return Number(valor).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
}

function formatarMoeda(valor: string | number) {
  return Number(valor).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
}

function formatarData(iso: string) {
  return new Date(iso).toLocaleDateString('pt-BR', { day: '2-digit', month: 'short', year: 'numeric' });
}

const PROPOSTA_INICIAL = { valor: '', prazo_dias: '', mensagem: '' };

const STATUS_SOLICITACAO: Record<string, { label: string; bg: string; fg: string }> = {
  ABERTA: { label: 'Aberta', bg: 'rgba(59,130,246,0.15)', fg: '#60a5fa' },
  EM_NEGOCIACAO: { label: 'Em negociação', bg: 'rgba(245,158,11,0.15)', fg: '#fbbf24' },
  CONTRATADA: { label: 'Contratada', bg: 'rgba(139,92,246,0.15)', fg: '#a78bfa' },
  CONCLUIDA: { label: 'Concluída', bg: 'rgba(16,185,129,0.15)', fg: '#34d399' },
  CANCELADA: { label: 'Cancelada', bg: 'rgba(239,68,68,0.15)', fg: '#f87171' },
};

export default function OportunidadeDetalhePage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();

  const [oportunidade, setOportunidade] = useState<Oportunidade | null>(null);
  const [formulario, setFormulario] = useState(PROPOSTA_INICIAL);
  const [carregando, setCarregando] = useState(true);
  const [enviando, setEnviando] = useState(false);
  const [erro, setErro] = useState('');
  const [sucesso, setSucesso] = useState('');
  const [logado, setLogado] = useState(false);

  useEffect(() => {
    setLogado(!!localStorage.getItem('@ServicoFacil:token'));
  }, []);

  const carregar = useCallback(async () => {
    setCarregando(true);
    setErro('');
    try {
      const response = await api.get(`/prestador/oportunidades/${params.id}`);
      setOportunidade(response.data.dados);
    } catch (err: any) {
      if (err.response?.status === 401) {
        localStorage.removeItem('@ServicoFacil:token');
        localStorage.removeItem('@ServicoFacil:user');
        router.replace('/login');
        return;
      }
      setErro(err.response?.data?.message || 'Não foi possível carregar esta oportunidade.');
    } finally {
      setCarregando(false);
    }
  }, [params.id]);

  // A visualização é pública (como um classificado): só o envio de proposta exige login.
  useEffect(() => {
    carregar();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [carregar]);

  function alterarCampo(e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) {
    const { name, value } = e.target;
    setFormulario((atual) => ({ ...atual, [name]: value }));
  }

  async function submeterProposta(e: React.FormEvent) {
    e.preventDefault();
    setEnviando(true);
    setErro('');
    setSucesso('');
    try {
      const response = await api.post(`/prestador/oportunidades/${params.id}/propostas`, {
        valor: Number(formulario.valor),
        prazo_dias: Number(formulario.prazo_dias),
        mensagem: formulario.mensagem.trim(),
      });
      setOportunidade((atual) => (atual ? { ...atual, pode_enviar_proposta: false, minha_proposta: response.data.dados } : atual));
      setFormulario(PROPOSTA_INICIAL);
      setSucesso(response.data.mensagem);
    } catch (err: any) {
      setErro(err.response?.data?.message || 'Não foi possível enviar sua proposta.');
    } finally {
      setEnviando(false);
    }
  }

  if (carregando) {
    return <main style={{ maxWidth: '960px', margin: '4rem auto', padding: '0 1.5rem', textAlign: 'center', color: 'var(--text-secondary)' }}>Carregando oportunidade...</main>;
  }

  if (!oportunidade) {
    return (
      <main style={{ maxWidth: '960px', margin: '2rem auto', padding: '0 1.5rem' }}>
        <Link href="/oportunidades" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', color: 'var(--text-secondary)', fontSize: '0.9rem', marginBottom: '1.5rem' }}>
          <ArrowLeft size={16} /> Voltar para oportunidades
        </Link>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', background: 'rgba(239, 68, 68, 0.15)', border: '1px solid var(--danger-color)', color: '#fca5a5', padding: '1rem', borderRadius: '8px', fontSize: '0.9rem' }}>
          <AlertCircle size={20} /> <span>{erro}</span>
        </div>
      </main>
    );
  }

  const proposta = oportunidade.minha_proposta;

  return (
    <main style={{ maxWidth: '960px', margin: '2rem auto', padding: '0 1.5rem 4rem' }}>
      <Link href="/oportunidades" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', color: 'var(--text-secondary)', fontSize: '0.9rem', marginBottom: '1.5rem' }}>
        <ArrowLeft size={16} /> Voltar para oportunidades
      </Link>

      <header style={{ marginBottom: '1.5rem' }}>
        <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '0.6rem' }}>
          <span style={{ padding: '0.25rem 0.7rem', borderRadius: '20px', fontSize: '0.75rem', fontWeight: 600, background: (STATUS_SOLICITACAO[oportunidade.status] || STATUS_SOLICITACAO.ABERTA).bg, color: (STATUS_SOLICITACAO[oportunidade.status] || STATUS_SOLICITACAO.ABERTA).fg }}>
            {(STATUS_SOLICITACAO[oportunidade.status] || STATUS_SOLICITACAO.ABERTA).label}
          </span>
          {oportunidade.categoria && <span style={{ padding: '0.25rem 0.7rem', borderRadius: '20px', fontSize: '0.75rem', fontWeight: 600, background: '#1e293b', color: '#cbd5e1' }}>{oportunidade.categoria}</span>}
        </div>
        <h1 style={{ fontSize: '1.5rem', fontWeight: 700, margin: '0 0 0.4rem' }}>{oportunidade.titulo}</h1>
        <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>Confira os detalhes do serviço e envie sua proposta ao cliente.</p>
      </header>

      <div style={{ display: 'grid', gridTemplateColumns: '1.4fr 1fr', gap: '1.5rem' }}>
        {/* ── Detalhes ─────────────────────────── */}
        <article style={{ background: 'var(--card-bg)', border: '1px solid var(--card-border)', borderRadius: 'var(--border-radius)', padding: '1.5rem' }}>
          <h2 style={{ fontSize: '1.05rem', fontWeight: 700, marginBottom: '0.9rem' }}>Detalhes da solicitação</h2>
          <p style={{ color: '#cbd5e1', fontSize: '0.9rem', lineHeight: 1.6, marginBottom: '1rem' }}>{oportunidade.descricao}</p>

          {oportunidade.anexos && oportunidade.anexos.length > 0 && (
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem', marginBottom: '1.25rem' }}>
              {oportunidade.anexos.map((anexo) => (
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

          <div style={{ background: '#0f172a', border: '1px solid #334155', borderRadius: '8px', padding: '1rem', marginBottom: '1.25rem' }}>
            <span style={{ display: 'block', color: '#64748b', fontSize: '0.78rem', marginBottom: '2px' }}>Orçamento informado pelo cliente</span>
            <strong style={{ fontSize: '1.15rem', color: '#34d399' }}>{formatarOrcamento(oportunidade.orcamento_cliente)}</strong>
            <p style={{ color: '#64748b', fontSize: '0.78rem', margin: '0.4rem 0 0' }}>Use este valor como referência para preparar sua proposta.</p>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            <div>
              <span style={{ display: 'flex', alignItems: 'center', gap: '4px', color: '#64748b', fontSize: '0.75rem', marginBottom: '3px' }}>
                <User size={13} /> Cliente
              </span>
              <strong style={{ fontSize: '0.9rem' }}>{oportunidade.solicitante.nome}</strong>
            </div>
            <div>
              <span style={{ display: 'flex', alignItems: 'center', gap: '4px', color: '#64748b', fontSize: '0.75rem', marginBottom: '3px' }}>
                <MapPin size={13} /> Local
              </span>
              <strong style={{ fontSize: '0.9rem' }}>{oportunidade.bairro}, {oportunidade.cidade}</strong>
            </div>
            <div>
              <span style={{ display: 'block', color: '#64748b', fontSize: '0.75rem', marginBottom: '3px' }}>Categoria</span>
              <strong style={{ fontSize: '0.9rem' }}>{oportunidade.categoria || 'Não informada'}</strong>
            </div>
            <div>
              <span style={{ display: 'block', color: '#64748b', fontSize: '0.75rem', marginBottom: '3px' }}>Publicada em</span>
              <strong style={{ fontSize: '0.9rem' }}>{formatarData(oportunidade.created_at)}</strong>
            </div>
          </div>
        </article>

        {/* ── Proposta ─────────────────────────── */}
        <aside style={{ background: 'var(--card-bg)', border: '1px solid var(--card-border)', borderRadius: 'var(--border-radius)', padding: '1.5rem', alignSelf: 'flex-start' }}>
          {proposta ? (
            <div>
              <CheckCircle size={28} color="#34d399" style={{ marginBottom: '0.75rem' }} />
              <span style={{ display: 'inline-block', padding: '0.2rem 0.6rem', borderRadius: '20px', fontSize: '0.72rem', fontWeight: 600, background: 'rgba(148,163,184,0.15)', color: '#cbd5e1', marginBottom: '0.5rem' }}>
                {proposta.status}
              </span>
              <h2 style={{ fontSize: '1.05rem', fontWeight: 700, marginBottom: '0.75rem' }}>Proposta já enviada</h2>
              {sucesso && (
                <p style={{ color: '#6ee7b7', fontSize: '0.85rem', marginBottom: '0.75rem' }}>{sucesso}</p>
              )}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', marginBottom: '0.9rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.88rem' }}>
                  <span style={{ color: '#64748b' }}>Valor</span> <strong>{formatarMoeda(proposta.valor)}</strong>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.88rem' }}>
                  <span style={{ color: '#64748b' }}>Prazo</span> <strong>{proposta.prazo_dias} dias</strong>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.88rem' }}>
                  <span style={{ color: '#64748b' }}>Enviada em</span> <strong>{formatarData(proposta.created_at)}</strong>
                </div>
              </div>
              <p style={{ color: '#cbd5e1', fontSize: '0.85rem', marginBottom: '0.75rem' }}>{proposta.mensagem}</p>
              <small style={{ color: '#64748b' }}>O cliente poderá analisar, aceitar, recusar ou enviar uma contraproposta.</small>
            </div>
          ) : !logado ? (
            <div>
              <User size={28} color="#94a3b8" style={{ marginBottom: '0.75rem' }} />
              <h2 style={{ fontSize: '1.05rem', fontWeight: 700, marginBottom: '0.5rem' }}>Entre para enviar uma proposta</h2>
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', marginBottom: '1rem' }}>
                Você pode ver os detalhes livremente, mas precisa de uma conta de Prestador para enviar proposta a este cliente.
              </p>
              <Link href="/login" style={{
                display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem',
                padding: '0.8rem', width: '100%', background: '#10b981', color: '#fff',
                borderRadius: '8px', fontWeight: 600, fontSize: '0.9rem', textDecoration: 'none',
              }}>
                Entrar na conta
              </Link>
            </div>
          ) : !oportunidade.pode_enviar_proposta ? (
            <div>
              <AlertCircle size={28} color="#94a3b8" style={{ marginBottom: '0.75rem' }} />
              <h2 style={{ fontSize: '1.05rem', fontWeight: 700, marginBottom: '0.5rem' }}>Oportunidade indisponível</h2>
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem' }}>
                Esta solicitação não está mais aberta para novas propostas.
              </p>
            </div>
          ) : (
            <>
              <h2 style={{ fontSize: '1.05rem', fontWeight: 700, marginBottom: '0.4rem' }}>Enviar proposta</h2>
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', marginBottom: '1rem' }}>
                Informe o valor, o prazo estimado e como pretende realizar o serviço.
              </p>

              {erro && (
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', background: 'rgba(239, 68, 68, 0.15)', border: '1px solid var(--danger-color)', color: '#fca5a5', padding: '0.75rem', borderRadius: '8px', marginBottom: '1rem', fontSize: '0.85rem' }}>
                  <AlertCircle size={16} /> <span>{erro}</span>
                </div>
              )}

              <form onSubmit={submeterProposta} style={{ display: 'flex', flexDirection: 'column', gap: '0.9rem' }}>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                  <label style={{ fontSize: '0.85rem' }}>
                    <span style={{ display: 'block', color: 'var(--text-secondary)', marginBottom: '0.3rem' }}>Valor (R$)</span>
                    <input type="number" name="valor" min="0.01" max="99999999.99" step="0.01" required value={formulario.valor} onChange={alterarCampo} placeholder="850,00" style={campoInput} />
                  </label>
                  <label style={{ fontSize: '0.85rem' }}>
                    <span style={{ display: 'block', color: 'var(--text-secondary)', marginBottom: '0.3rem' }}>Prazo (dias)</span>
                    <input type="number" name="prazo_dias" min="1" max="3650" step="1" required value={formulario.prazo_dias} onChange={alterarCampo} placeholder="5" style={campoInput} />
                  </label>
                </div>

                <label style={{ fontSize: '0.85rem' }}>
                  <span style={{ display: 'block', color: 'var(--text-secondary)', marginBottom: '0.3rem' }}>Mensagem para o cliente</span>
                  <textarea
                    name="mensagem" minLength={10} maxLength={2000} required
                    value={formulario.mensagem} onChange={alterarCampo} rows={4}
                    placeholder="Apresente sua proposta e explique como realizará o serviço."
                    style={{ ...campoInput, resize: 'vertical' }}
                  />
                  <small style={{ color: '#64748b' }}>{formulario.mensagem.length}/2000 caracteres</small>
                </label>

                <button type="submit" disabled={enviando} style={{
                  display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem',
                  padding: '0.8rem', background: enviando ? '#475569' : '#10b981', color: '#fff',
                  border: 'none', borderRadius: '8px', fontWeight: 600, fontSize: '0.9rem',
                  cursor: enviando ? 'not-allowed' : 'pointer',
                }}>
                  <Send size={16} /> {enviando ? 'Enviando...' : 'Enviar proposta ao cliente'}
                </button>
              </form>
            </>
          )}
        </aside>
      </div>
    </main>
  );
}

const campoInput: React.CSSProperties = {
  width: '100%', padding: '0.6rem 0.7rem', background: '#0f172a',
  border: '1px solid #334155', borderRadius: '6px', color: '#fff', fontSize: '0.9rem',
};
