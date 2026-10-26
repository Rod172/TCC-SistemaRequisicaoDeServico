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

import React, { useCallback, useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import { ArrowLeft, MapPin, User, CheckCircle, AlertCircle, Send, FileText, MessageCircle, HelpCircle, Clock, Ban, Flag, Star } from 'lucide-react';
import api from '@/services/api';
import useConfirmacao from '@/components/useConfirmacao';
import ChatDrawer from '@/components/ChatDrawer';

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
  valor_contraproposta?: string | null;
  mensagem_contraproposta?: string | null;
  contraproposta_status?: 'PENDENTE' | 'ACEITA' | 'RECUSADA' | null;
  id: string;
  valor: string;
  prazo_dias: number;
  validade_ate: string;
  mensagem: string;
  status: string;
  created_at: string;
}

interface AvaliacaoDados {
  id: string;
  nota: number;
  comentario?: string | null;
}

interface Pergunta {
  id: string;
  pergunta: string;
  resposta?: string | null;
  respondida_em?: string | null;
  createdAt: string;
  prestador: { id: string; nome: string; foto_url?: string | null };
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
  motivo_cancelamento?: string | null;
  created_at: string;
  solicitante: Solicitante;
  anexos?: Anexo[];
  perguntas?: Pergunta[];
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

const PROPOSTA_INICIAL = { valor: '', prazo_dias: '', validade_dias: '7', mensagem: '' };

const STATUS_SOLICITACAO: Record<string, { label: string; bg: string; fg: string }> = {
  ABERTA: { label: 'Aberta', bg: 'rgba(59,130,246,0.15)', fg: '#60a5fa' },
  EM_NEGOCIACAO: { label: 'Em negociação', bg: 'rgba(245,158,11,0.15)', fg: '#fbbf24' },
  CONTRATADA: { label: 'Contratada', bg: 'rgba(139,92,246,0.15)', fg: '#a78bfa' },
  CONCLUIDA: { label: 'Concluída', bg: 'rgba(16,185,129,0.15)', fg: '#34d399' },
  CANCELADA: { label: 'Cancelada', bg: 'rgba(239,68,68,0.15)', fg: '#f87171' },
};

export default function OportunidadeDetalhePage() {
  const { confirmar, dialogo } = useConfirmacao();
  const params = useParams<{ id: string }>();
  const router = useRouter();

  const [agora, setAgora] = useState(Date.now());
  useEffect(() => {
    const intervalo = window.setInterval(() => setAgora(Date.now()), 1000);
    return () => window.clearInterval(intervalo);
  }, []);

  const [oportunidade, setOportunidade] = useState<Oportunidade | null>(null);
  const [formulario, setFormulario] = useState(PROPOSTA_INICIAL);
  const [carregando, setCarregando] = useState(true);
  const [enviando, setEnviando] = useState(false);
  const [respondendoContraproposta, setRespondendoContraproposta] = useState(false);
  const [erro, setErro] = useState('');
  const [sucesso, setSucesso] = useState('');
  const [logado, setLogado] = useState(false);
  const [souPrestador, setSouPrestador] = useState(false);
  const [imagemSelecionadaId, setImagemSelecionadaId] = useState<string | null>(null);
  const [novaPergunta, setNovaPergunta] = useState('');
  const [enviandoPergunta, setEnviandoPergunta] = useState(false);
  const [erroPergunta, setErroPergunta] = useState('');
  const [chatAberto, setChatAberto] = useState(false);
  const [desistindo, setDesistindo] = useState(false);
  const [motivoDesistencia, setMotivoDesistencia] = useState('');
  const [processandoDesistencia, setProcessandoDesistencia] = useState(false);
  const [denunciando, setDenunciando] = useState(false);
  const [motivoDenuncia, setMotivoDenuncia] = useState('');
  const [processandoDenuncia, setProcessandoDenuncia] = useState(false);
  const [processandoConclusao, setProcessandoConclusao] = useState(false);
  const [avaliacao, setAvaliacao] = useState<AvaliacaoDados | null>(null);

  useEffect(() => {
    setLogado(!!localStorage.getItem('@ServicoFacil:token'));
    try {
      const userRaw = localStorage.getItem('@ServicoFacil:user');
      const usuario = userRaw ? JSON.parse(userRaw) : null;
      setSouPrestador(['PRESTADOR', 'ADMIN'].includes(usuario?.tipo_perfil));
    } catch {
      setSouPrestador(false);
    }
  }, []);

  const carregar = useCallback(async () => {
    setCarregando(true);
    setErro('');
    try {
      const response = await api.get(`/prestador/oportunidades/${params.id}`);
      setOportunidade(response.data.dados);
      if (response.data.dados.status === 'CONCLUIDA') {
        const avaliacaoResponse = await api.get(`/solicitacoes/${params.id}/avaliacao`);
        setAvaliacao(avaliacaoResponse.data.data);
      }
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

  const EXTENSOES_IMAGEM = ['.jpg', '.jpeg', '.png', '.webp'];
  const imagens = useMemo(
    () => (oportunidade?.anexos || []).filter((anexo) => EXTENSOES_IMAGEM.some((ext) => anexo.url_arquivo.toLowerCase().endsWith(ext))),
    [oportunidade]
  );
  const documentos = useMemo(
    () => (oportunidade?.anexos || []).filter((anexo) => !EXTENSOES_IMAGEM.some((ext) => anexo.url_arquivo.toLowerCase().endsWith(ext))),
    [oportunidade]
  );
  const imagemSelecionada = imagens.find((imagem) => imagem.id === imagemSelecionadaId) || imagens[0];

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
        validade_dias: Number(formulario.validade_dias),
        mensagem: formulario.mensagem.trim(),
      });
      // Releitura do detalhe usa o mesmo contrato das consultas (created_at) e atualiza
      // também o status da solicitação, que passa para EM_NEGOCIACAO após o envio.
      await carregar();
      setFormulario(PROPOSTA_INICIAL);
      setSucesso(response.data.mensagem);
    } catch (err: any) {
      if (err.response?.status === 409) await carregar();
      setErro(err.response?.data?.message || 'Não foi possível enviar sua proposta.');
    } finally {
      setEnviando(false);
    }
  }

  async function responderContraproposta(acao: 'ACEITAR' | 'RECUSAR') {
    if (!oportunidade?.minha_proposta) return;
    setRespondendoContraproposta(true);
    setErro('');
    try {
      const resposta = await api.post(`/prestador/oportunidades/${params.id}/propostas/${oportunidade.minha_proposta.id}/contraproposta/responder`, { acao });
      await carregar();
      setSucesso(resposta.data.mensagem);
    } catch (err: any) { setErro(err.response?.data?.message || 'Não foi possível responder à contraproposta.'); }
    finally { setRespondendoContraproposta(false); }
  }

  async function enviarPergunta(e: React.FormEvent) {
    e.preventDefault();
    const pergunta = novaPergunta.trim();
    if (!pergunta) return;

    setEnviandoPergunta(true);
    setErroPergunta('');
    try {
      const response = await api.post(`/solicitacoes/${params.id}/perguntas`, { pergunta });
      setOportunidade((atual) => (atual ? { ...atual, perguntas: [...(atual.perguntas || []), response.data.data] } : atual));
      setNovaPergunta('');
    } catch (err: any) {
      setErroPergunta(err.response?.data?.message || 'Não foi possível enviar sua pergunta.');
    } finally {
      setEnviandoPergunta(false);
    }
  }

  async function desistirContratacao(e: React.FormEvent) {
    e.preventDefault();
    const motivo = motivoDesistencia.trim();
    if (!motivo) return;

    setProcessandoDesistencia(true);
    setErro('');
    try {
      const response = await api.patch(`/prestador/oportunidades/${params.id}/desistir`, { motivo });
      setSucesso(response.data.mensagem);
      setDesistindo(false);
      setMotivoDesistencia('');
      const detalhe = await api.get(`/prestador/oportunidades/${params.id}`);
      setOportunidade(detalhe.data.dados);
    } catch (err: any) {
      setErro(err.response?.data?.message || 'Não foi possível registrar a desistência.');
    } finally {
      setProcessandoDesistencia(false);
    }
  }

  async function concluirServico() {
    if (!await confirmar({ mensagem: 'Confirmar que o serviço foi concluído?' })) return;

    setProcessandoConclusao(true);
    setErro('');
    try {
      const response = await api.patch(`/solicitacoes/${params.id}/concluir`);
      setSucesso(response.data.mensagem);
      await carregar();
    } catch (err: any) {
      setErro(err.response?.data?.message || 'Não foi possível concluir o serviço.');
    } finally {
      setProcessandoConclusao(false);
    }
  }

  async function denunciarSolicitacao(e: React.FormEvent) {
    e.preventDefault();
    const motivo = motivoDenuncia.trim();
    if (!motivo) return;

    setProcessandoDenuncia(true);
    setErro('');
    try {
      const response = await api.post(`/solicitacoes/${params.id}/denunciar`, { motivo });
      setSucesso(response.data.mensagem);
      setDenunciando(false);
      setMotivoDenuncia('');
    } catch (err: any) {
      setErro(err.response?.data?.message || 'Não foi possível registrar a denúncia.');
    } finally {
      setProcessandoDenuncia(false);
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
      {dialogo}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.5rem' }}>
        <Link href="/oportunidades" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
          <ArrowLeft size={16} /> Voltar para oportunidades
        </Link>
        {oportunidade.minha_proposta && (
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
            style={{ ...campoInput, marginBottom: '0.6rem' }}
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

      {oportunidade.status === 'CANCELADA' && oportunidade.motivo_cancelamento && (
        <div style={{
          display: 'flex', alignItems: 'flex-start', gap: '0.75rem',
          background: 'rgba(239, 68, 68, 0.15)', border: '1px solid var(--danger-color)',
          color: '#fca5a5', padding: '1rem', borderRadius: '8px', marginBottom: '1.5rem', fontSize: '0.9rem',
        }}>
          <AlertCircle size={20} style={{ flexShrink: 0, marginTop: '2px' }} />
          <span>Esta solicitação foi cancelada pelo cliente. Motivo: {oportunidade.motivo_cancelamento}</span>
        </div>
      )}

      <div className="grid-main-aside" style={{ display: 'grid', gridTemplateColumns: '1.4fr 1fr', gap: '1.5rem' }}>
        {/* ── Detalhes ─────────────────────────── */}
        <article style={{ background: 'var(--card-bg)', border: '1px solid var(--card-border)', borderRadius: 'var(--border-radius)', padding: '1.5rem' }}>
          <h2 style={{ fontSize: '1.05rem', fontWeight: 700, marginBottom: '0.9rem' }}>Detalhes da solicitação</h2>
          <p style={{ color: '#cbd5e1', fontSize: '0.9rem', lineHeight: 1.6, marginBottom: '1rem' }}>{oportunidade.descricao}</p>

          {imagens.length > 0 && (
            <div style={{ marginBottom: '1.25rem' }}>
              <div style={{
                borderRadius: '10px', overflow: 'hidden', border: '1px solid #334155',
                background: '#0f172a', marginBottom: '0.5rem', maxHeight: '380px',
              }}>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={`${BACKEND_ORIGIN}${(imagemSelecionada || imagens[0]).url_arquivo}`}
                  alt={(imagemSelecionada || imagens[0]).nome_original}
                  style={{ width: '100%', maxHeight: '380px', objectFit: 'contain', display: 'block' }}
                />
              </div>
              {imagens.length > 1 && (
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.4rem' }}>
                  {imagens.map((imagem) => (
                    <button
                      key={imagem.id}
                      type="button"
                      onClick={() => setImagemSelecionadaId(imagem.id)}
                      title={imagem.nome_original}
                      style={{
                        width: '56px', height: '56px', borderRadius: '6px', overflow: 'hidden', padding: 0,
                        cursor: 'pointer', background: '#0f172a',
                        border: `2px solid ${(imagemSelecionada || imagens[0]).id === imagem.id ? '#3b82f6' : '#334155'}`,
                      }}
                    >
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={`${BACKEND_ORIGIN}${imagem.url_arquivo}`} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    </button>
                  ))}
                </div>
              )}
            </div>
          )}

          {documentos.length > 0 && (
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem', marginBottom: '1.25rem' }}>
              {documentos.map((anexo) => (
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
                  <FileText size={13} />
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
              <p style={{ color: '#94a3b8', fontSize: '0.85rem' }}>
                Validade comercial até {new Date(proposta.validade_ate).toLocaleString('pt-BR')}.
              </p>
              {['ENVIADA', 'EM_ANALISE'].includes(proposta.status) && !(new Date(proposta.validade_ate).getTime() > agora) && (
                <p role="status" style={{ color: '#fbbf24', fontSize: '0.85rem' }}>
                  Proposta expirada. O cliente não pode aceitar nem renegociar esta proposta.
                </p>
              )}
              <p style={{ color: '#cbd5e1', fontSize: '0.85rem', marginBottom: '0.75rem' }}>{proposta.mensagem}</p>
              {proposta.valor_contraproposta != null && (
                <section aria-label="Contraproposta do cliente" style={{ padding: '1rem', border: '1px solid #475569', borderRadius: '8px', marginBottom: '1rem' }}>
                  <h3 style={{ fontSize: '1rem' }}>Contraproposta do cliente</h3>
                  <strong>{formatarMoeda(proposta.valor_contraproposta)}</strong>
                  <p>{proposta.mensagem_contraproposta}</p>
                  <p role="status">{proposta.contraproposta_status === 'PENDENTE' ? 'Aguardando sua resposta' : proposta.contraproposta_status === 'ACEITA' ? 'Você aceitou o novo valor. O cliente ainda deve confirmar a contratação.' : 'Você recusou. O orçamento anterior foi mantido.'}</p>
                  {proposta.contraproposta_status === 'PENDENTE' && proposta.status === 'EM_ANALISE'
                    && ['ABERTA', 'EM_NEGOCIACAO'].includes(oportunidade.status) && new Date(proposta.validade_ate).getTime() > agora && (
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem', marginTop: '0.75rem' }}>
                      <button disabled={respondendoContraproposta} onClick={() => responderContraproposta('ACEITAR')} style={{ padding: '0.65rem', background: '#059669', border: 0, borderRadius: '6px', color: '#fff' }}>Aceitar contraproposta</button>
                      <button disabled={respondendoContraproposta} onClick={() => responderContraproposta('RECUSAR')} style={{ padding: '0.65rem', background: '#475569', border: 0, borderRadius: '6px', color: '#fff' }}>Recusar contraproposta</button>
                    </div>
                  )}
                </section>
              )}

              {/* Chat liberado desde o envio da proposta (US34) — não é mais preciso esperar o aceite
                  pra poder negociar detalhes com o cliente. */}
              <button onClick={() => setChatAberto(true)} style={{
                display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem',
                padding: '0.75rem', width: '100%', background: '#3b82f6', color: '#fff', border: 'none',
                borderRadius: '8px', fontWeight: 600, fontSize: '0.88rem', cursor: 'pointer', marginBottom: '0.6rem',
              }}>
                <MessageCircle size={16} /> {proposta.status === 'RECUSADA' ? 'Ver conversa' : proposta.status === 'ACEITA' ? 'Conversar com o cliente' : 'Conversar sobre a proposta'}
              </button>

              {proposta.status === 'ACEITA' && oportunidade.status === 'CONTRATADA' ? (
                <>
                  <button onClick={concluirServico} disabled={processandoConclusao} style={{
                    display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: '0.4rem',
                    padding: '0.6rem', width: '100%', background: '#10b981', border: 'none',
                    color: '#fff', borderRadius: '8px', fontWeight: 600, fontSize: '0.82rem', cursor: 'pointer', marginBottom: '0.6rem',
                  }}>
                    <CheckCircle size={14} /> {processandoConclusao ? 'Confirmando...' : 'Marcar como concluído'}
                  </button>

                  {!desistindo ? (
                    <button onClick={() => setDesistindo(true)} style={{
                      display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: '0.4rem',
                      padding: '0.6rem', width: '100%', background: 'transparent', border: '1px solid var(--danger-color)',
                      color: '#f87171', borderRadius: '8px', fontWeight: 600, fontSize: '0.82rem', cursor: 'pointer',
                    }}>
                      <Ban size={14} /> Desistir da contratação
                    </button>
                  ) : (
                    <form onSubmit={desistirContratacao} style={{
                      background: '#0f172a', border: '1px solid var(--danger-color)', borderRadius: '8px', padding: '0.9rem',
                    }}>
                      <p style={{ color: 'var(--text-secondary)', fontSize: '0.8rem', marginBottom: '0.6rem' }}>
                        O cliente será avisado e a solicitação volta a aceitar propostas de outros prestadores.
                      </p>
                      <input
                        value={motivoDesistencia}
                        onChange={(e) => setMotivoDesistencia(e.target.value)}
                        placeholder="Motivo da desistência"
                        maxLength={500}
                        style={{ ...campoInput, marginBottom: '0.6rem' }}
                      />
                      <div style={{ display: 'flex', gap: '0.5rem' }}>
                        <button type="submit" disabled={processandoDesistencia || !motivoDesistencia.trim()} style={{
                          flex: 1, padding: '0.55rem', background: 'var(--danger-color)', color: '#fff', border: 'none',
                          borderRadius: '6px', fontWeight: 600, fontSize: '0.82rem', cursor: 'pointer',
                        }}>
                          {processandoDesistencia ? 'Enviando...' : 'Confirmar desistência'}
                        </button>
                        <button type="button" onClick={() => setDesistindo(false)} style={{
                          padding: '0.55rem 0.8rem', background: 'transparent', border: '1px solid #334155', color: '#94a3b8',
                          borderRadius: '6px', fontSize: '0.82rem', cursor: 'pointer',
                        }}>
                          Voltar
                        </button>
                      </div>
                    </form>
                  )}
                </>
              ) : proposta.status === 'ACEITA' && oportunidade.status === 'CONCLUIDA' ? (
                <div>
                  <button onClick={() => setChatAberto(true)} style={{
                    display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem',
                    padding: '0.6rem', width: '100%', background: 'transparent', border: '1px solid #3b82f6', color: '#60a5fa',
                    borderRadius: '8px', fontWeight: 600, fontSize: '0.82rem', cursor: 'pointer', marginBottom: '0.75rem',
                  }}>
                    <MessageCircle size={14} /> Ver conversa
                  </button>
                  {avaliacao ? (
                    <div>
                      <strong style={{ display: 'block', fontSize: '0.85rem', marginBottom: '0.4rem' }}>Avaliação do cliente</strong>
                      <div style={{ display: 'flex', gap: '2px', marginBottom: '0.4rem' }}>
                        {[1, 2, 3, 4, 5].map((n) => (
                          <Star key={n} size={16} color="#fbbf24" fill={n <= avaliacao.nota ? '#fbbf24' : 'none'} />
                        ))}
                      </div>
                      {avaliacao.comentario && <p style={{ color: '#cbd5e1', fontSize: '0.82rem', margin: 0 }}>{avaliacao.comentario}</p>}
                    </div>
                  ) : (
                    <small style={{ color: '#64748b' }}>Serviço concluído — aguardando o cliente avaliar.</small>
                  )}
                </div>
              ) : (
                <small style={{ color: '#64748b' }}>{!(new Date(proposta.validade_ate).getTime() > agora) ? 'A validade comercial expirou; aceite e renegociação estão bloqueados.' : 'O cliente poderá analisar, aceitar, recusar ou enviar uma contraproposta.'}</small>
              )}
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
          ) : !souPrestador ? (
            <div>
              <AlertCircle size={28} color="#94a3b8" style={{ marginBottom: '0.75rem' }} />
              <h2 style={{ fontSize: '1.05rem', fontWeight: 700, marginBottom: '0.5rem' }}>Área do prestador</h2>
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem' }}>
                Só contas de Prestador podem enviar proposta. Sua conta é de Solicitante — você pode ver os detalhes e fazer perguntas, mas não propor.
              </p>
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
                  <span style={{ display: 'block', color: 'var(--text-secondary)', marginBottom: '0.3rem' }}>Validade comercial (dias)</span>
                  <input type="number" name="validade_dias" min="1" max="365" step="1" required value={formulario.validade_dias} onChange={alterarCampo} style={campoInput} />
                  <small style={{ color: '#94a3b8' }}>Período para aceitar ou renegociar a proposta, contado do envio. Não é o prazo de execução.</small>
                </label>

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

      {/* ── Perguntas e Respostas ─────────────── */}
      <article style={{
        background: 'var(--card-bg)', border: '1px solid var(--card-border)', borderRadius: 'var(--border-radius)',
        padding: '1.5rem', marginTop: '1.5rem',
      }}>
        <h2 style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '1.05rem', fontWeight: 700, marginBottom: '1rem' }}>
          <HelpCircle size={18} /> Perguntas e Respostas
        </h2>

        {(oportunidade.perguntas || []).length === 0 && (
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.88rem', marginBottom: '1rem' }}>
            Nenhuma pergunta ainda. Se algo não ficou claro na descrição, pergunte ao cliente antes de propor.
          </p>
        )}

        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', marginBottom: '1.25rem' }}>
          {(oportunidade.perguntas || []).map((p) => (
            <div key={p.id} style={{ background: '#0f172a', border: '1px solid #334155', borderRadius: '8px', padding: '1rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '4px', color: '#64748b', fontSize: '0.75rem', marginBottom: '0.4rem' }}>
                <User size={11} /> {p.prestador.nome} perguntou · {formatarData(p.createdAt)}
              </div>
              <p style={{ color: '#e2e8f0', fontSize: '0.9rem', margin: '0 0 0.6rem' }}>{p.pergunta}</p>
              {p.resposta ? (
                <div style={{ paddingLeft: '0.9rem', borderLeft: '2px solid #3b82f6' }}>
                  <div style={{ color: '#60a5fa', fontSize: '0.75rem', marginBottom: '0.2rem', fontWeight: 600 }}>Resposta do cliente</div>
                  <p style={{ color: '#cbd5e1', fontSize: '0.88rem', margin: 0 }}>{p.resposta}</p>
                </div>
              ) : (
                <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', color: '#fbbf24', fontSize: '0.78rem' }}>
                  <Clock size={12} /> Aguardando resposta do cliente
                </span>
              )}
            </div>
          ))}
        </div>

        {logado ? (
          <form onSubmit={enviarPergunta}>
            {erroPergunta && (
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#f87171', fontSize: '0.82rem', marginBottom: '0.6rem' }}>
                <AlertCircle size={14} /> {erroPergunta}
              </div>
            )}
            <div style={{ display: 'flex', gap: '0.6rem' }}>
              <input
                value={novaPergunta}
                onChange={(e) => setNovaPergunta(e.target.value)}
                placeholder="Ex.: O local tem acesso para veículo grande?"
                maxLength={1000}
                style={{ ...campoInput, flex: 1 }}
              />
              <button type="submit" disabled={enviandoPergunta || !novaPergunta.trim()} style={{
                display: 'inline-flex', alignItems: 'center', gap: '0.4rem', padding: '0 1.1rem',
                background: !novaPergunta.trim() ? '#475569' : '#3b82f6', color: '#fff', border: 'none',
                borderRadius: '6px', fontWeight: 600, fontSize: '0.85rem', cursor: !novaPergunta.trim() ? 'not-allowed' : 'pointer',
              }}>
                Perguntar
              </button>
            </div>
          </form>
        ) : (
          <Link href="/login" style={{ color: '#60a5fa', fontSize: '0.85rem', textDecoration: 'none' }}>
            Entre na sua conta para fazer uma pergunta.
          </Link>
        )}
      </article>

      <ChatDrawer
        propostaId={proposta?.id || ''}
        solicitacaoId={oportunidade.id}
        titulo={`Chat com ${oportunidade.solicitante.nome}`}
        aberto={chatAberto}
        onClose={() => setChatAberto(false)}
      />
    </main>
  );
}

const campoInput: React.CSSProperties = {
  width: '100%', padding: '0.6rem 0.7rem', background: '#0f172a',
  border: '1px solid #334155', borderRadius: '6px', color: '#fff', fontSize: '0.9rem',
};
