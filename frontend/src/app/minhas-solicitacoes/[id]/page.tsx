'use client';

/**
 * @file minhas-solicitacoes/[id]/page.tsx
 * @description Comparação de propostas recebidas (US11) e aceite/recusa/renegociação (US12) para
 * uma solicitação específica do solicitante autenticado. Layout da US39: linha do andamento do
 * pedido, propostas comparáveis (valor, prazo e validade alinhados, com ordenação) e, na lateral,
 * o pedido e as perguntas dos prestadores; depois do aceite, pagamento com garantia, conclusão e
 * avaliação aparecem em sequência.
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
  Star, CheckCircle, XCircle, Handshake, Paperclip, FileText,
  Ban, ShieldCheck, CreditCard, MessageCircle, HelpCircle, Clock, Flag, Lock,
} from 'lucide-react';
import api from '@/services/api';
import useConfirmacao from '@/components/useConfirmacao';
import ChatDrawer from '@/components/ChatDrawer';
import Pagina, { CabecalhoPagina } from '@/components/ui/Pagina';
import {
  Aviso, Avatar, Chip, Etapas, EstadoLista, STATUS_PAGAMENTO, STATUS_PROPOSTA, STATUS_SOLICITACAO,
} from '@/components/ui/Elementos';

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

function formatarValor(valor: string | number) {
  return Number(valor).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
}

function formatarData(iso: string) {
  return new Date(iso).toLocaleDateString('pt-BR', { day: '2-digit', month: 'short', year: 'numeric' });
}

export default function DetalhePropostasPage() {
  const { confirmar, dialogo } = useConfirmacao();
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

  const [ordenacao, setOrdenacao] = useState<'preco' | 'nota' | 'prazo' | 'recentes'>('preco');
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
    if (!await confirmar({ mensagem: `Deseja realmente ${verbo} a proposta de ${proposta.prestador.nome}?` })) return;

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
    if (!await confirmar({ mensagem: 'Deseja realmente cancelar esta contratação? A solicitação volta a aceitar propostas de outros prestadores.' })) return;

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
    if (!await confirmar({ mensagem: 'Confirmar que o serviço foi concluído? O valor em custódia (se houver) será liberado ao prestador.' })) return;

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

  const voltar = isAdmin
    ? { href: '/admin', rotulo: 'Painel administrativo' }
    : { href: '/minhas-solicitacoes', rotulo: 'Minhas solicitações' };

  if (carregando) {
    return (
      <Pagina>
        <EstadoLista tipo="carregando">Carregando propostas...</EstadoLista>
      </Pagina>
    );
  }

  if (!solicitacao) {
    return (
      <Pagina>
        <CabecalhoPagina voltar={voltar} titulo="Solicitação" />
        <EstadoLista tipo="erro" acao={<button type="button" className="btn btn-secundario" onClick={carregar}>Tentar novamente</button>}>{erro}</EstadoLista>
      </Pagina>
    );
  }

  const menorPreco = Math.min(...solicitacao.propostas.map((p) => Number(p.valor)));
  const aberta = ['ABERTA', 'EM_NEGOCIACAO'].includes(solicitacao.status);
  const propostaAceita = solicitacao.propostas.find((p) => p.status === 'ACEITA');
  const perguntasPendentes = (solicitacao.perguntas || []).filter((p) => !p.resposta).length;
  const etapaAtual = solicitacao.status === 'CONTRATADA' ? 2
    : solicitacao.status === 'CONCLUIDA' ? (avaliacao ? 5 : 4)
      : 1;
  const propostasOrdenadas = [...solicitacao.propostas].sort((a, b) => {
    if (ordenacao === 'nota') return Number(b.prestador.perfil_prestador?.nota_media_reputacao || 0) - Number(a.prestador.perfil_prestador?.nota_media_reputacao || 0);
    if (ordenacao === 'prazo') return a.prazo_dias - b.prazo_dias;
    if (ordenacao === 'recentes') return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    return Number(a.valor) - Number(b.valor);
  });
  const custodia = solicitacao.transacao_custodia;
  const chipPagamento = custodia
    ? STATUS_PAGAMENTO[custodia.status_pagamento]
    : { bg: 'var(--warning-tint)', fg: 'var(--warning-strong)', label: 'Aguardando pagamento' };

  return (
    <Pagina>
      {dialogo}
      <CabecalhoPagina
        voltar={voltar}
        antes={(
          <div className="chips">
            <Chip status={solicitacao.status} mapa={STATUS_SOLICITACAO} />
            {isAdmin && <span className="chip" style={{ background: 'var(--violet-tint)', color: 'var(--violet-text)' }}><ShieldCheck size={13} aria-hidden="true" /> Modo administrativo — somente leitura</span>}
          </div>
        )}
        titulo={solicitacao.titulo}
        subtitulo={solicitacao.propostas.length === 1 ? '1 proposta recebida' : `${solicitacao.propostas.length} propostas recebidas`}
        acoes={!isAdmin && (
          <>
            <button type="button" onClick={() => setDenunciando(true)} className="btn btn-texto discreto"><Flag size={15} aria-hidden="true" /> Denunciar</button>
            {aberta && !cancelando && (
              <button type="button" onClick={() => setCancelando(true)} className="btn btn-perigo"><Ban size={15} aria-hidden="true" /> Cancelar pedido</button>
            )}
          </>
        )}
      />

      {solicitacao.status !== 'CANCELADA' && (
        <Etapas
          rotulo="Andamento do pedido" atual={etapaAtual}
          etapas={[
            { nome: 'Publicado' },
            { nome: 'Propostas', detalhe: `${solicitacao.propostas.length} recebida${solicitacao.propostas.length === 1 ? '' : 's'}` },
            { nome: 'Contratado', detalhe: 'pagamento com garantia' },
            { nome: 'Concluído', detalhe: 'você confirma' },
            { nome: 'Avaliado', detalhe: 'nota e comentário' },
          ]}
        />
      )}

      {solicitacao.status === 'CANCELADA' && solicitacao.motivo_cancelamento && (
        <Aviso tipo="erro">{isAdmin ? 'Esta solicitação foi cancelada' : 'Você cancelou esta solicitação'}. Motivo: {solicitacao.motivo_cancelamento}</Aviso>
      )}
      {sucesso && <Aviso tipo="sucesso">{sucesso}</Aviso>}
      {erro && <Aviso tipo="erro">{erro}</Aviso>}

      {denunciando && (
        <form onSubmit={denunciarSolicitacao} className="card perigo empilhado" style={{ gap: '0.75rem' }}>
          <h2 className="titulo-cartao">Denunciar esta solicitação</h2>
          <p className="texto-apoio">Conte o que está errado (golpe, informação falsa, conteúdo impróprio no chat etc.). A administração vai revisar.</p>
          <label htmlFor="motivo-denuncia" className="sr-only">Motivo da denúncia</label>
          <input id="motivo-denuncia" value={motivoDenuncia} onChange={(e) => setMotivoDenuncia(e.target.value)} placeholder="Motivo da denúncia" maxLength={1000} className="campo" />
          <div className="grupo-botoes">
            <button type="submit" disabled={processandoDenuncia || !motivoDenuncia.trim()} className="btn btn-perigo">{processandoDenuncia ? 'Enviando...' : 'Enviar denúncia'}</button>
            <button type="button" onClick={() => setDenunciando(false)} className="btn btn-secundario">Cancelar</button>
          </div>
        </form>
      )}

      {cancelando && (
        <form onSubmit={cancelarSolicitacao} className="card perigo empilhado" style={{ gap: '0.75rem' }}>
          <h2 className="titulo-cartao">Cancelar esta solicitação</h2>
          <p className="texto-apoio">Os prestadores que já enviaram proposta serão notificados do cancelamento.</p>
          <div className="campo-grupo">
            <label htmlFor="motivo-cancelamento" className="rotulo">Motivo do cancelamento</label>
            <input id="motivo-cancelamento" type="text" minLength={5} required value={motivoCancelamento} onChange={(e) => setMotivoCancelamento(e.target.value)} placeholder="Ex: Consegui resolver de outra forma" className="campo" />
          </div>
          <div className="grupo-botoes">
            <button type="submit" disabled={processandoCancelamento} className="btn btn-perigo">{processandoCancelamento ? 'Cancelando...' : 'Confirmar cancelamento'}</button>
            <button type="button" onClick={() => setCancelando(false)} className="btn btn-secundario">Voltar</button>
          </div>
        </form>
      )}

      <div className="layout-lateral">
        <div className="principal">
          {/* ── Pagamento com garantia (US13) ─────────── */}
          {(solicitacao.status === 'CONTRATADA' || custodia) && (
            <section aria-labelledby="titulo-pagamento" className={`card grande empilhado ${solicitacao.status === 'CONTRATADA' && !custodia ? 'foco' : ''}`} style={{ overflowWrap: 'anywhere', minWidth: 0 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '0.75rem', flexWrap: 'wrap' }}>
                <h2 id="titulo-pagamento" className="titulo-secao">Pagamento com garantia</h2>
                <Chip cor={chipPagamento} />
              </div>
              <Aviso tipo="alerta">Demonstração acadêmica: nenhum dinheiro será cobrado ou transferido. Não informe dados bancários ou de cartão.</Aviso>
              {solicitacao.status === 'CONTRATADA' && propostaAceita && (
                <dl className="dados">
                  <div><dt>Prestador contratado</dt><dd>{propostaAceita.prestador.nome}</dd></div>
                  <div><dt>Valor total contratado</dt><dd style={{ fontSize: '1.3rem' }}>{formatarValor(propostaAceita.valor)}</dd></div>
                  <div><dt>Situação</dt><dd>{custodia?.status_pagamento === 'RETIDO' ? 'Pagamento confirmado e retido em custódia' : 'Aguardando confirmação do pagamento simulado'}</dd></div>
                </dl>
              )}
              {custodia && (
                <Aviso tipo={custodia.status_pagamento === 'REEMBOLSADO' ? 'info' : 'sucesso'}>
                  <strong>{custodia.status_pagamento === 'LIBERADO' ? 'Pagamento liberado ao prestador após a conclusão' : custodia.status_pagamento === 'REEMBOLSADO' ? 'Pagamento reembolsado ao solicitante' : 'Valor protegido em custódia'} — {formatarValor(custodia.valor)}.</strong>{' '}
                  {custodia.metodo_pagamento === 'PIX_TESTE' ? 'PIX de teste' : 'Cartão de teste'} · comprovante {custodia.referencia_simulada}
                </Aviso>
              )}
              {solicitacao.status !== 'CONTRATADA' ? null : custodia?.status_pagamento === 'RETIDO' ? (
                <p className="texto-apoio" style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                  <ShieldCheck size={18} color="var(--success-strong)" aria-hidden="true" /> O valor será liberado ao prestador quando o serviço for concluído.
                </p>
              ) : isAdmin ? (
                <p className="texto-apoio">O pagamento desta contratação ainda não foi simulado pelo solicitante.</p>
              ) : !pagando ? (
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '1rem', flexWrap: 'wrap' }}>
                  <div>
                    <strong style={{ display: 'block', marginBottom: '2px' }}>Proteja o pagamento deste serviço</strong>
                    <span className="texto-apoio">Simule o checkout para reter o valor em custódia até a conclusão do serviço.</span>
                  </div>
                  <button type="button" onClick={() => setPagando(true)} className="btn btn-primario"><CreditCard size={16} aria-hidden="true" /> Simular pagamento</button>
                </div>
              ) : (
                <form onSubmit={simularPagamento} className="empilhado" style={{ gap: '0.85rem' }}>
                  <fieldset className="secao-form" style={{ gap: '0.6rem' }}>
                    <legend style={{ fontSize: '0.95rem', marginBottom: '0.6rem' }}>Escolha o método de teste</legend>
                    <div className="grade-campos" style={{ gap: '0.6rem' }}>
                      <label className="caixa-opcao" style={{ borderColor: metodoPagamento === 'CARTAO_TESTE' ? 'var(--accent-indigo)' : undefined }}>
                        <input type="radio" name="metodo" checked={metodoPagamento === 'CARTAO_TESTE'} onChange={() => setMetodoPagamento('CARTAO_TESTE')} />
                        <span><strong style={{ display: 'block' }}>Cartão de teste</strong><span className="texto-apoio" style={{ fontSize: '0.8rem' }}>Aprovação imediata, sem dados reais</span></span>
                      </label>
                      <label className="caixa-opcao" style={{ borderColor: metodoPagamento === 'PIX_TESTE' ? 'var(--accent-indigo)' : undefined }}>
                        <input type="radio" name="metodo" checked={metodoPagamento === 'PIX_TESTE'} onChange={() => setMetodoPagamento('PIX_TESTE')} />
                        <span><strong style={{ display: 'block' }}>PIX de teste</strong><span className="texto-apoio" style={{ fontSize: '0.8rem' }}>Simula a confirmação do PIX</span></span>
                      </label>
                    </div>
                  </fieldset>
                  <div className="grupo-botoes">
                    <button type="submit" disabled={processandoPagamento} className="btn btn-primario btn-grande">
                      <Lock size={16} aria-hidden="true" /> {processandoPagamento ? 'Processando...' : `Confirmar pagamento simulado${propostaAceita ? ` · ${formatarValor(propostaAceita.valor)}` : ''}`}
                    </button>
                    <button type="button" disabled={processandoPagamento} onClick={() => setPagando(false)} className="btn btn-secundario">Voltar</button>
                  </div>
                </form>
              )}
            </section>
          )}

          {/* Confirmação de conclusão do serviço (US17) e cancelamento de uma contratação já aceita (US34
              — antes disso, aceitar era irreversível). */}
          {!isAdmin && solicitacao.status === 'CONTRATADA' && (
            <section aria-labelledby="titulo-conclusao" className="card grande empilhado" style={{ gap: '0.75rem' }}>
              <h2 id="titulo-conclusao" className="titulo-secao">O serviço foi feito?</h2>
              {/* A conclusão exige o pagamento simulado retido em custódia (US17). */}
              {custodia?.status_pagamento === 'RETIDO' ? (
                <p className="texto-apoio">Quando {propostaAceita?.prestador.nome || 'o prestador'} terminar, confirme aqui. O pagamento é liberado e você pode avaliar o serviço.</p>
              ) : (
                <p id="aviso-conclusao-sem-pagamento" className="texto-apoio">Confirme o pagamento simulado na seção de pagamento para poder concluir. O valor fica retido e só é liberado a {propostaAceita?.prestador.nome || 'o prestador'} quando você confirmar a conclusão.</p>
              )}
              <div className="grupo-botoes">
                <button type="button" onClick={concluirServico} disabled={processandoConclusao || custodia?.status_pagamento !== 'RETIDO'}
                  aria-describedby={custodia?.status_pagamento === 'RETIDO' ? undefined : 'aviso-conclusao-sem-pagamento'} className="btn btn-primario">
                  <CheckCircle size={16} aria-hidden="true" /> {processandoConclusao ? 'Confirmando...' : 'Confirmar que o serviço foi concluído'}
                </button>
                <button type="button" onClick={cancelarContratacao} disabled={processandoCancelContratacao} className="btn btn-perigo">
                  <Ban size={15} aria-hidden="true" /> {processandoCancelContratacao ? 'Cancelando...' : 'Cancelar contratação'}
                </button>
              </div>
            </section>
          )}

          {/* Avaliação de satisfação (US18) — liberada depois que o serviço é concluído (US17). */}
          {!isAdmin && solicitacao.status === 'CONCLUIDA' && (
            <section aria-labelledby="titulo-avaliacao" className={`card grande empilhado ${avaliacao ? '' : 'foco'}`} style={{ gap: '0.85rem' }}>
              {avaliacao ? (
                <>
                  <h2 id="titulo-avaliacao" className="titulo-secao">Sua avaliação</h2>
                  <div role="img" aria-label={`${avaliacao.nota} de 5 estrelas`} style={{ display: 'flex', gap: '2px' }}>
                    {[1, 2, 3, 4, 5].map((n) => <Star key={n} size={22} color="var(--warning-strong)" fill={n <= avaliacao.nota ? 'var(--warning-strong)' : 'none'} aria-hidden="true" />)}
                  </div>
                  {avaliacao.comentario && <p style={{ color: 'var(--text-body)', fontSize: '0.92rem' }}>{avaliacao.comentario}</p>}
                </>
              ) : (
                <form onSubmit={enviarAvaliacao} className="empilhado" style={{ gap: '0.85rem' }}>
                  <h2 id="titulo-avaliacao" className="titulo-secao">Como foi o serviço de {propostaAceita?.prestador.nome || 'o prestador'}?</h2>
                  <div role="group" aria-label="Nota de 1 a 5 estrelas" style={{ display: 'flex', gap: '2px', alignItems: 'center', flexWrap: 'wrap' }}>
                    {[1, 2, 3, 4, 5].map((n) => (
                      <button
                        key={n} type="button" onClick={() => setNotaAvaliacao(n)}
                        aria-label={`Avaliar com ${n} ${n === 1 ? 'estrela' : 'estrelas'}`} aria-pressed={notaAvaliacao === n}
                        style={{ width: '44px', height: '44px', background: 'transparent', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                      >
                        <Star size={30} color="var(--warning-strong)" fill={n <= notaAvaliacao ? 'var(--warning-strong)' : 'none'} aria-hidden="true" />
                      </button>
                    ))}
                    <span style={{ marginLeft: '0.5rem', fontSize: '0.875rem', color: 'var(--warning-soft-text)' }}>
                      {notaAvaliacao ? `${['', 'Ruim', 'Regular', 'Bom', 'Muito bom', 'Excelente'][notaAvaliacao]} · ${notaAvaliacao}/5` : 'Escolha de 1 a 5'}
                    </span>
                  </div>
                  <div className="campo-grupo">
                    <label htmlFor="comentario-avaliacao" className="rotulo">Comentário <span className="opcional">(opcional — aparece no perfil público do prestador)</span></label>
                    <textarea id="comentario-avaliacao" value={comentarioAvaliacao} onChange={(e) => setComentarioAvaliacao(e.target.value)} placeholder="Conte como foi a experiência" rows={3} className="campo" />
                  </div>
                  <button type="submit" disabled={enviandoAvaliacao || notaAvaliacao < 1} className="btn btn-primario" style={{ alignSelf: 'flex-start' }}>
                    {enviandoAvaliacao ? 'Enviando...' : 'Enviar avaliação'}
                  </button>
                </form>
              )}
            </section>
          )}

          {/* ── Propostas (US11/US12) ─────────────────── */}
          <section aria-labelledby="titulo-propostas" className="empilhado" style={{ gap: '0.9rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '0.75rem', flexWrap: 'wrap' }}>
              <h2 id="titulo-propostas" className="titulo-secao" style={{ fontSize: '1.35rem' }}>
                {solicitacao.propostas.length === 1 ? '1 proposta recebida' : `${solicitacao.propostas.length} propostas recebidas`}
              </h2>
              {solicitacao.propostas.length > 1 && (
                <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }} className="texto-apoio">
                  Ordenar por
                  <select value={ordenacao} onChange={(e) => setOrdenacao(e.target.value as typeof ordenacao)} className="campo" style={{ width: 'auto', minHeight: '40px', fontSize: '0.875rem' }}>
                    <option value="preco">Menor preço</option>
                    <option value="nota">Melhor avaliação</option>
                    <option value="prazo">Menor prazo</option>
                    <option value="recentes">Mais recentes</option>
                  </select>
                </label>
              )}
            </div>

            {solicitacao.propostas.length === 0 && (
              <EstadoLista tipo="vazio" icone={<Clock size={26} aria-hidden="true" />}>Esta solicitação ainda não recebeu propostas.</EstadoLista>
            )}

            {propostasOrdenadas.map((proposta) => {
              const expirada = !(new Date(proposta.validade_ate).getTime() > agora);
              const podeAlterar = !['ACEITA', 'RECUSADA'].includes(proposta.status)
                && !['CONTRATADA', 'CONCLUIDA', 'CANCELADA'].includes(solicitacao.status);
              const ehMelhorPreco = Number(proposta.valor) === menorPreco && solicitacao.propostas.length > 1;
              const nota = proposta.prestador.perfil_prestador ? Number(proposta.prestador.perfil_prestador.nota_media_reputacao) : 0;
              const destaque = (ehMelhorPreco && podeAlterar) || proposta.status === 'ACEITA';

              return (
                <article key={proposta.id} className={`card grande empilhado ${destaque ? 'foco' : ''}`} style={{ gap: '0.9rem', opacity: proposta.status === 'RECUSADA' || (expirada && podeAlterar) ? 0.8 : 1 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '1rem', flexWrap: 'wrap' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', minWidth: 0 }}>
                      <Avatar nome={proposta.prestador.nome} foto={proposta.prestador.foto_url} tamanho={48} />
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '3px', minWidth: 0 }}>
                        <span className="chips">
                          <Link href={`/prestadores/${proposta.prestador.id}`} style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--text-primary)' }}>{proposta.prestador.nome}</Link>
                          {ehMelhorPreco && <span className="chip" style={{ background: 'var(--primary-color)', color: 'var(--on-primary)' }}>Menor preço</span>}
                          <Chip status={proposta.status} mapa={STATUS_PROPOSTA} />
                        </span>
                        <span className="texto-apoio" style={{ fontSize: '0.82rem' }}>
                          {nota > 0 ? <>★ {nota.toFixed(1).replace('.', ',')} · {proposta.prestador.perfil_prestador?.total_avaliacoes} avaliações · </> : 'Sem avaliações · '}
                          <Link href={`/prestadores/${proposta.prestador.id}`} style={{ fontWeight: 600 }}>Ver perfil</Link>
                        </span>
                      </div>
                    </div>
                    <dl style={{ display: 'flex', gap: '1.4rem', flexWrap: 'wrap' }}>
                      <div><dt className="texto-apoio" style={{ fontSize: '0.75rem' }}>Valor</dt><dd style={{ fontSize: '1.35rem', fontWeight: 800 }}>{formatarValor(proposta.valor)}</dd></div>
                      <div><dt className="texto-apoio" style={{ fontSize: '0.75rem' }}>Prazo</dt><dd style={{ fontSize: '1rem', fontWeight: 700, paddingTop: '4px' }}>{proposta.prazo_dias} {proposta.prazo_dias === 1 ? 'dia' : 'dias'}</dd></div>
                      <div><dt className="texto-apoio" style={{ fontSize: '0.75rem' }}>Válida até</dt><dd style={{ fontSize: '1rem', fontWeight: 700, paddingTop: '4px', color: expirada && podeAlterar ? 'var(--danger-text)' : undefined }}>{new Date(proposta.validade_ate).toLocaleString('pt-BR', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' })}</dd></div>
                    </dl>
                  </div>

                  <p style={{ padding: '0.75rem 0.9rem', borderRadius: '12px', background: 'var(--bg-color)', fontSize: '0.92rem', lineHeight: 1.55, color: 'var(--text-body)', overflowWrap: 'anywhere' }}>“{proposta.mensagem}”</p>
                  {proposta.prestador.perfil_prestador?.descricao_bio && (
                    <p className="texto-apoio" style={{ fontSize: '0.82rem', fontStyle: 'italic' }}>Sobre: {proposta.prestador.perfil_prestador.descricao_bio}</p>
                  )}
                  {proposta.prestador.perfil_prestador?.categorias && proposta.prestador.perfil_prestador.categorias.length > 0 && (
                    <div className="chips">{proposta.prestador.perfil_prestador.categorias.map((cat) => <span key={cat} className="chip categoria">{cat}</span>)}</div>
                  )}
                  <span className="texto-apoio" style={{ fontSize: '0.78rem' }}>Recebida em {formatarData(proposta.createdAt)}</span>

                  {expirada && ['ENVIADA', 'EM_ANALISE'].includes(proposta.status) && (
                    <Aviso tipo="erro">Proposta expirada. O aceite e a renegociação estão bloqueados; ainda é possível recusá-la.</Aviso>
                  )}

                  {proposta.valor_contraproposta !== null && (
                    <div className={`aviso ${proposta.contraproposta_status === 'PENDENTE' ? 'aviso-alerta' : proposta.contraproposta_status === 'ACEITA' ? 'aviso-sucesso' : 'aviso-info'}`} style={{ flexDirection: 'column', gap: '0.3rem' }}>
                      <span>Sua contraproposta: <strong>{formatarValor(proposta.valor_contraproposta)}</strong>{proposta.contraproposta_em && <> · enviada em {formatarData(proposta.contraproposta_em)}</>}</span>
                      <span role="status">{proposta.contraproposta_status === 'PENDENTE' ? 'Aguardando resposta do prestador. A contratação fica disponível após a resposta.' : proposta.contraproposta_status === 'ACEITA' ? (proposta.status === 'ACEITA' ? 'Contratação confirmada com o valor da contraproposta.' : 'O prestador aceitou o novo valor. Confira e confirme a contratação.') : proposta.contraproposta_status === 'RECUSADA' ? 'O prestador recusou a contraproposta. O valor anterior foi mantido.' : 'Negociação anterior'}</span>
                      {proposta.mensagem_contraproposta && <span style={{ color: 'var(--text-body)', fontSize: '0.85rem' }}>“{proposta.mensagem_contraproposta}”</span>}
                    </div>
                  )}

                  {!isAdmin && renegociandoId !== proposta.id && (
                    <div className="grupo-botoes">
                      {podeAlterar && (
                        <>
                          <button
                            type="button" onClick={() => alterarStatus(proposta, 'ACEITAR')}
                            disabled={processandoId === proposta.id || expirada || proposta.contraproposta_status === 'PENDENTE'}
                            title={expirada ? 'A validade comercial desta proposta expirou.' : undefined}
                            className="btn btn-primario"
                          >
                            <CheckCircle size={16} aria-hidden="true" /> Aceitar e contratar
                          </button>
                          <button
                            type="button" onClick={() => abrirRenegociacao(proposta)}
                            disabled={processandoId === proposta.id || expirada}
                            title={expirada ? 'A validade comercial desta proposta expirou.' : undefined}
                            className="btn btn-secundario"
                          >
                            <Handshake size={16} aria-hidden="true" /> Propor outro valor
                          </button>
                        </>
                      )}
                      {/* Chat liberado desde o envio da proposta (US34) — não precisa mais aceitar antes de conversar. */}
                      <button type="button" onClick={() => setChatPropostaId(proposta.id)} className="btn btn-secundario">
                        <MessageCircle size={16} aria-hidden="true" /> {proposta.status === 'RECUSADA' ? 'Ver conversa' : 'Conversar'}
                      </button>
                      {podeAlterar && (
                        <button type="button" onClick={() => alterarStatus(proposta, 'RECUSAR')} disabled={processandoId === proposta.id} className="btn btn-texto perigo" style={{ marginLeft: 'auto' }}>
                          <XCircle size={16} aria-hidden="true" /> Recusar
                        </button>
                      )}
                    </div>
                  )}

                  {!isAdmin && podeAlterar && renegociandoId === proposta.id && (
                    <form onSubmit={(e) => renegociar(e, proposta)} className="empilhado" style={{ gap: '0.85rem', padding: '1rem', borderRadius: '12px', background: 'var(--bg-color)', border: '1px solid var(--card-border)' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <strong>Propor outro valor</strong>
                        <button type="button" onClick={() => setRenegociandoId(null)} className="btn btn-texto discreto">Cancelar</button>
                      </div>
                      <div className="grade-campos">
                        <div className="campo-grupo">
                          <label htmlFor={`novo-valor-${proposta.id}`} className="rotulo">Novo valor</label>
                          <div className="campo-com-prefixo">
                            <span aria-hidden="true">R$</span>
                            <input id={`novo-valor-${proposta.id}`} type="number" min="0.01" step="0.01" required value={novoValor} onChange={(e) => setNovoValor(e.target.value)} className="campo" style={{ background: 'var(--card-bg)' }} />
                          </div>
                        </div>
                        <div className="campo-grupo">
                          <label htmlFor={`nova-msg-${proposta.id}`} className="rotulo">Mensagem para o prestador</label>
                          <input id={`nova-msg-${proposta.id}`} type="text" minLength={5} required value={novaMensagem} onChange={(e) => setNovaMensagem(e.target.value)} className="campo" style={{ background: 'var(--card-bg)' }} />
                        </div>
                      </div>
                      <button type="submit" disabled={processandoId === proposta.id || expirada} className="btn btn-primario" style={{ alignSelf: 'flex-start' }}>
                        {processandoId === proposta.id ? 'Enviando...' : 'Enviar contraproposta'}
                      </button>
                    </form>
                  )}
                </article>
              );
            })}

            {aberta && solicitacao.propostas.length > 1 && (
              <details className="card destaque" style={{ padding: '0.9rem 1.1rem' }}>
                <summary style={{ minHeight: '28px', fontSize: '0.9rem', fontWeight: 600, cursor: 'pointer' }}>Como escolher? <span className="texto-apoio" style={{ fontWeight: 400 }}>Preço não é tudo</span></summary>
                <p className="texto-apoio" style={{ marginTop: '0.6rem', lineHeight: 1.6, color: 'var(--text-body)' }}>Compare também a nota e os comentários no perfil, o prazo e o que está incluso na mensagem. Na dúvida, converse antes de aceitar — o chat fica disponível para cada proposta.</p>
              </details>
            )}
          </section>
        </div>

        <aside className="lateral">
          <section aria-labelledby="titulo-pedido" className="card empilhado" style={{ gap: '0.85rem' }}>
            <h2 id="titulo-pedido" className="titulo-cartao">{isAdmin ? 'Pedido' : 'Seu pedido'}</h2>
            <p style={{ fontSize: '0.9rem', lineHeight: 1.6, color: 'var(--text-body)', whiteSpace: 'pre-wrap', overflowWrap: 'anywhere' }}>{solicitacao.descricao}</p>
            {solicitacao.anexos && solicitacao.anexos.length > 0 && (
              <ul className="lista-simples" style={{ gap: '0.4rem' }} aria-label="Anexos">
                {solicitacao.anexos.map((anexo) => (
                  <li key={anexo.id}>
                    <a href={`${BACKEND_ORIGIN}${anexo.url_arquivo}`} target="_blank" rel="noopener noreferrer" title={anexo.nome_original} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', minHeight: '40px', padding: '0 0.75rem', borderRadius: '10px', background: 'var(--bg-color)', border: '1px solid var(--card-border)', color: 'var(--text-body)', fontSize: '0.82rem' }}>
                      {anexo.url_arquivo.endsWith('.pdf') ? <FileText size={15} aria-hidden="true" /> : <Paperclip size={15} aria-hidden="true" />}
                      <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{anexo.nome_original}</span>
                    </a>
                  </li>
                ))}
              </ul>
            )}
          </section>

          {(solicitacao.perguntas || []).length > 0 && (
            <section aria-labelledby="titulo-perguntas" className={`card empilhado ${perguntasPendentes > 0 && !isAdmin ? 'alerta' : ''}`} style={{ gap: '0.85rem' }}>
              <h2 id="titulo-perguntas" className="titulo-cartao" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap' }}>
                <HelpCircle size={17} aria-hidden="true" /> Perguntas dos prestadores
                {perguntasPendentes > 0 && <span className="chip" style={{ background: 'var(--warning-border)', color: 'var(--warning-soft-text)' }}>{perguntasPendentes} sem resposta</span>}
              </h2>
              {(solicitacao.perguntas || []).map((p) => (
                <div key={p.id} className="empilhado" style={{ gap: '0.45rem', paddingTop: '0.75rem', borderTop: '1px solid var(--card-border)' }}>
                  <span className="texto-apoio" style={{ fontSize: '0.78rem' }}>{p.prestador.nome} · {formatarData(p.createdAt)}</span>
                  <p style={{ fontSize: '0.9rem', overflowWrap: 'anywhere' }}>{p.pergunta}</p>
                  {p.resposta ? (
                    <p style={{ paddingLeft: '0.75rem', borderLeft: '2px solid var(--accent-indigo)', fontSize: '0.875rem', color: 'var(--text-body)', overflowWrap: 'anywhere' }}>
                      <strong style={{ color: 'var(--link-color)' }}>{isAdmin ? 'Resposta' : 'Sua resposta'}:</strong> {p.resposta}
                    </p>
                  ) : isAdmin ? (
                    <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', color: 'var(--warning-strong)', fontSize: '0.8rem' }}><Clock size={13} aria-hidden="true" /> Aguardando resposta do solicitante</span>
                  ) : respondendoId === p.id ? (
                    <form onSubmit={(e) => responderPergunta(e, p.id)} className="empilhado" style={{ gap: '0.5rem' }}>
                      <label htmlFor={`resposta-${p.id}`} className="sr-only">Sua resposta</label>
                      <textarea id={`resposta-${p.id}`} value={textoResposta} onChange={(e) => setTextoResposta(e.target.value)} placeholder="Escreva sua resposta (todos os prestadores verão)" maxLength={1000} autoFocus rows={2} className="campo" style={{ minHeight: '72px', fontSize: '0.9rem' }} />
                      <div className="grupo-botoes" style={{ justifyContent: 'flex-end' }}>
                        <button type="button" onClick={() => setRespondendoId(null)} className="btn btn-texto discreto">Cancelar</button>
                        <button type="submit" disabled={enviandoResposta || !textoResposta.trim()} className="btn btn-primario">Responder</button>
                      </div>
                    </form>
                  ) : (
                    <button type="button" onClick={() => abrirResposta(p)} className="btn btn-secundario" style={{ alignSelf: 'flex-start', minHeight: '40px' }}>Responder</button>
                  )}
                </div>
              ))}
            </section>
          )}

          {aberta && (
            <section className="card" style={{ display: 'flex', gap: '0.75rem', alignItems: 'flex-start', background: 'transparent' }}>
              <ShieldCheck size={20} color="var(--brand-sky)" aria-hidden="true" style={{ flexShrink: 0 }} />
              <p className="texto-apoio" style={{ fontSize: '0.82rem', lineHeight: 1.55 }}>Ao aceitar, você paga pela plataforma e o valor fica retido. O prestador só recebe quando você confirmar que o serviço foi concluído.</p>
            </section>
          )}
        </aside>
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
    </Pagina>
  );
}
