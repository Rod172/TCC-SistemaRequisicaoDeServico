'use client';

/**
 * @file oportunidades/[id]/page.tsx
 * @description Detalhes de uma oportunidade de serviço (US09) e envio de proposta pelo Prestador (US10).
 * Layout da US39: descrição, fotos e perguntas à esquerda; à direita, o orçamento do cliente e o
 * formulário de proposta (ou o acompanhamento da proposta já enviada), com o resumo do que o cliente
 * vai ver antes de enviar.
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
import { CheckCircle, AlertCircle, Send, FileText, MessageCircle, HelpCircle, Clock, Ban, Flag, Star } from 'lucide-react';
import api from '@/services/api';
import useConfirmacao from '@/components/useConfirmacao';
import ChatDrawer from '@/components/ChatDrawer';
import Pagina, { CabecalhoPagina } from '@/components/ui/Pagina';
import { Aviso, Chip, EstadoLista, STATUS_PROPOSTA, STATUS_SOLICITACAO } from '@/components/ui/Elementos';

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
  pagamento_contratacao: 'RETIDO' | 'LIBERADO' | 'REEMBOLSADO' | null;
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
    return (
      <Pagina>
        <EstadoLista tipo="carregando">Carregando oportunidade...</EstadoLista>
      </Pagina>
    );
  }

  if (!oportunidade) {
    return (
      <Pagina>
        <CabecalhoPagina voltar={{ href: '/oportunidades', rotulo: 'Oportunidades' }} titulo="Oportunidade" />
        <EstadoLista tipo="erro" acao={<button type="button" className="btn btn-secundario" onClick={carregar}>Tentar novamente</button>}>{erro}</EstadoLista>
      </Pagina>
    );
  }

  const proposta = oportunidade.minha_proposta;
  const propostaExpirada = proposta ? !(new Date(proposta.validade_ate).getTime() > agora) : false;
  const validadePrevista = formulario.validade_dias
    ? new Date(agora + Number(formulario.validade_dias) * 86400000).toLocaleDateString('pt-BR', { day: '2-digit', month: 'short' })
    : null;

  return (
    <Pagina>
      {dialogo}
      <CabecalhoPagina
        voltar={{ href: '/oportunidades', rotulo: 'Oportunidades' }}
        antes={(
          <div className="chips">
            <Chip status={oportunidade.status} mapa={STATUS_SOLICITACAO} />
            {oportunidade.categoria && <span className="chip categoria">{oportunidade.categoria}</span>}
          </div>
        )}
        titulo={oportunidade.titulo}
        subtitulo={`Publicada em ${formatarData(oportunidade.created_at)} · ${[oportunidade.bairro, oportunidade.cidade].filter(Boolean).join(', ') || 'Local não informado'}`}
        acoes={oportunidade.minha_proposta && (
          <button type="button" onClick={() => setDenunciando(true)} className="btn btn-texto discreto"><Flag size={15} aria-hidden="true" /> Denunciar</button>
        )}
      />

      {oportunidade.status === 'CANCELADA' && oportunidade.motivo_cancelamento && (
        <Aviso tipo="erro">Esta solicitação foi cancelada pelo cliente. Motivo: {oportunidade.motivo_cancelamento}</Aviso>
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

      <div className="layout-lateral">
        <div className="principal">
          {/* ── Detalhes ─────────────────────────── */}
          <article aria-labelledby="titulo-detalhes" className="card grande empilhado">
            <h2 id="titulo-detalhes" className="titulo-secao">O que o cliente precisa</h2>
            <p style={{ color: 'var(--text-body)', fontSize: '0.95rem', lineHeight: 1.65, whiteSpace: 'pre-wrap', overflowWrap: 'anywhere' }}>{oportunidade.descricao}</p>

            {imagens.length > 0 && (
              <div className="empilhado" style={{ gap: '0.5rem' }}>
                <div style={{ borderRadius: '12px', overflow: 'hidden', border: '1px solid var(--card-border)', background: 'var(--bg-color)', maxHeight: '380px' }}>
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={`${BACKEND_ORIGIN}${(imagemSelecionada || imagens[0]).url_arquivo}`}
                    alt={(imagemSelecionada || imagens[0]).nome_original}
                    style={{ width: '100%', maxHeight: '380px', objectFit: 'contain', display: 'block' }}
                  />
                </div>
                {imagens.length > 1 && (
                  <div className="chips" style={{ gap: '0.5rem' }}>
                    {imagens.map((imagem, i) => (
                      <button
                        key={imagem.id} type="button" onClick={() => setImagemSelecionadaId(imagem.id)} title={imagem.nome_original}
                        aria-label={`Ver foto ${i + 1} de ${imagens.length}`} aria-pressed={(imagemSelecionada || imagens[0]).id === imagem.id}
                        style={{
                          width: '64px', height: '64px', borderRadius: '10px', overflow: 'hidden', padding: 0, cursor: 'pointer', background: 'var(--bg-color)',
                          border: `2px solid ${(imagemSelecionada || imagens[0]).id === imagem.id ? 'var(--accent-indigo)' : 'var(--card-border)'}`,
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
              <ul className="chips" aria-label="Documentos anexados" style={{ listStyle: 'none', gap: '0.5rem' }}>
                {documentos.map((anexo) => (
                  <li key={anexo.id}>
                    <a href={`${BACKEND_ORIGIN}${anexo.url_arquivo}`} target="_blank" rel="noopener noreferrer" title={anexo.nome_original} style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem', minHeight: '40px', padding: '0 0.75rem', borderRadius: '10px', background: 'var(--bg-color)', border: '1px solid var(--card-border)', color: 'var(--text-body)', fontSize: '0.82rem', maxWidth: '220px' }}>
                      <FileText size={15} aria-hidden="true" />
                      <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{anexo.nome_original}</span>
                    </a>
                  </li>
                ))}
              </ul>
            )}

            <dl className="dados">
              <div><dt>Cliente</dt><dd>{oportunidade.solicitante.nome}</dd></div>
              <div><dt>Local</dt><dd>{[oportunidade.bairro, oportunidade.cidade].filter(Boolean).join(', ') || 'Não informado'}</dd></div>
              <div><dt>Categoria</dt><dd>{oportunidade.categoria || 'Não informada'}</dd></div>
              <div><dt>Publicada em</dt><dd>{formatarData(oportunidade.created_at)}</dd></div>
            </dl>
          </article>

          {/* ── Perguntas e Respostas (US29) ─────────────── */}
          <article aria-labelledby="titulo-perguntas" className="card grande empilhado">
            <h2 id="titulo-perguntas" className="titulo-secao" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap' }}>
              <HelpCircle size={18} aria-hidden="true" /> Perguntas e respostas <span className="texto-apoio" style={{ fontWeight: 500 }}>— públicas para todos os prestadores</span>
            </h2>

            {(oportunidade.perguntas || []).length === 0 && (
              <p className="texto-apoio">Nenhuma pergunta ainda. Se algo não ficou claro na descrição, pergunte ao cliente antes de propor.</p>
            )}

            {(oportunidade.perguntas || []).map((p) => (
              <div key={p.id} className="empilhado" style={{ gap: '0.4rem', paddingBottom: '0.9rem', borderBottom: '1px solid var(--card-border)' }}>
                <span className="texto-apoio" style={{ fontSize: '0.8rem' }}>{p.prestador.nome} perguntou · {formatarData(p.createdAt)}</span>
                <p style={{ fontSize: '0.92rem', fontWeight: 600, overflowWrap: 'anywhere' }}>{p.pergunta}</p>
                {p.resposta ? (
                  <p style={{ paddingLeft: '0.75rem', borderLeft: '2px solid var(--accent-indigo)', fontSize: '0.9rem', color: 'var(--text-body)', overflowWrap: 'anywhere' }}>
                    <strong style={{ color: 'var(--link-color)' }}>Cliente:</strong> {p.resposta}
                  </p>
                ) : (
                  <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', color: 'var(--warning-strong)', fontSize: '0.82rem' }}><Clock size={13} aria-hidden="true" /> Aguardando resposta do cliente</span>
                )}
              </div>
            ))}

            {logado ? (
              <form onSubmit={enviarPergunta} className="empilhado" style={{ gap: '0.5rem' }}>
                {erroPergunta && <span role="alert" className="erro-campo"><AlertCircle size={14} aria-hidden="true" />{erroPergunta}</span>}
                <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                  <label htmlFor="nova-pergunta" className="sr-only">Sua pergunta</label>
                  <input id="nova-pergunta" value={novaPergunta} onChange={(e) => setNovaPergunta(e.target.value)} placeholder="Ex.: O local tem acesso para veículo grande?" maxLength={1000} className="campo" style={{ flex: '1 1 260px', width: 'auto' }} />
                  <button type="submit" disabled={enviandoPergunta || !novaPergunta.trim()} className="btn btn-secundario" style={{ minHeight: '48px' }}>Perguntar</button>
                </div>
              </form>
            ) : (
              <Link href="/login" style={{ fontSize: '0.9rem', fontWeight: 600 }}>Entre na sua conta para fazer uma pergunta.</Link>
            )}
          </article>
        </div>

        {/* ── Proposta ─────────────────────────── */}
        <aside className="lateral">
          <div className="card destaque" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '0.75rem' }}>
            <span style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
              <span className="texto-apoio" style={{ fontSize: '0.78rem' }}>Orçamento informado pelo cliente</span>
              <strong style={{ fontSize: '1.3rem' }}>{formatarOrcamento(oportunidade.orcamento_cliente)}</strong>
              <span className="texto-apoio" style={{ fontSize: '0.75rem' }}>Use como referência para sua proposta.</span>
            </span>
          </div>

          {proposta ? (
            <section aria-labelledby="titulo-minha-proposta" className={`card grande empilhado ${proposta.status === 'ACEITA' ? 'sucesso' : ''}`} style={{ gap: '0.85rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap' }}>
                <h2 id="titulo-minha-proposta" className="titulo-secao" style={{ fontSize: '1.1rem' }}>Sua proposta</h2>
                <Chip status={proposta.status} mapa={STATUS_PROPOSTA} />
              </div>
              <dl className="dados" style={{ gridTemplateColumns: 'repeat(2, minmax(0, 1fr))' }}>
                <div><dt>Valor</dt><dd style={{ fontSize: '1.15rem' }}>{formatarMoeda(proposta.valor)}</dd></div>
                <div><dt>Prazo</dt><dd>{proposta.prazo_dias} {proposta.prazo_dias === 1 ? 'dia' : 'dias'}</dd></div>
                <div><dt>Enviada em</dt><dd>{formatarData(proposta.created_at)}</dd></div>
                <div><dt>Válida até</dt><dd style={{ color: propostaExpirada && ['ENVIADA', 'EM_ANALISE'].includes(proposta.status) ? 'var(--danger-text)' : undefined }}>{new Date(proposta.validade_ate).toLocaleString('pt-BR', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' })}</dd></div>
              </dl>
              <p style={{ color: 'var(--text-body)', fontSize: '0.875rem', lineHeight: 1.55, overflowWrap: 'anywhere' }}>“{proposta.mensagem}”</p>
              {['ENVIADA', 'EM_ANALISE'].includes(proposta.status) && propostaExpirada && (
                <Aviso tipo="erro">Proposta expirada. O cliente não pode aceitar nem renegociar esta proposta.</Aviso>
              )}

              {proposta.valor_contraproposta != null && (
                <section aria-label="Contraproposta do cliente" className={`aviso ${proposta.contraproposta_status === 'PENDENTE' ? 'aviso-alerta' : 'aviso-info'}`} style={{ flexDirection: 'column', gap: '0.4rem' }}>
                  <span>Contraproposta do cliente: <strong>{formatarMoeda(proposta.valor_contraproposta)}</strong></span>
                  {proposta.mensagem_contraproposta && <span style={{ color: 'var(--text-body)' }}>“{proposta.mensagem_contraproposta}”</span>}
                  <span role="status">{proposta.contraproposta_status === 'PENDENTE' ? 'Aguardando sua resposta' : proposta.contraproposta_status === 'ACEITA' ? 'Você aceitou o novo valor. O cliente ainda deve confirmar a contratação.' : 'Você recusou. O orçamento anterior foi mantido.'}</span>
                  {proposta.contraproposta_status === 'PENDENTE' && proposta.status === 'EM_ANALISE'
                    && ['ABERTA', 'EM_NEGOCIACAO'].includes(oportunidade.status) && !propostaExpirada && (
                    <div className="grupo-botoes" style={{ marginTop: '0.35rem' }}>
                      <button type="button" disabled={respondendoContraproposta} onClick={() => responderContraproposta('ACEITAR')} className="btn btn-primario">Aceitar contraproposta</button>
                      <button type="button" disabled={respondendoContraproposta} onClick={() => responderContraproposta('RECUSAR')} className="btn btn-secundario">Recusar</button>
                    </div>
                  )}
                </section>
              )}

              {/* Chat liberado desde o envio da proposta (US34) — não é mais preciso esperar o aceite
                  pra poder negociar detalhes com o cliente. */}
              <button type="button" onClick={() => setChatAberto(true)} className={`btn btn-bloco ${proposta.status === 'ACEITA' && oportunidade.status === 'CONTRATADA' ? 'btn-secundario' : 'btn-primario'}`}>
                <MessageCircle size={16} aria-hidden="true" /> {proposta.status === 'RECUSADA' ? 'Ver conversa' : proposta.status === 'ACEITA' ? 'Conversar com o cliente' : 'Conversar sobre a proposta'}
              </button>

              {proposta.status === 'ACEITA' && oportunidade.status === 'CONTRATADA' ? (
                <>
                  {/* A conclusão exige o pagamento simulado retido em custódia (US17). */}
                  {oportunidade.pagamento_contratacao === 'RETIDO' ? (
                    <Aviso tipo="sucesso">Você foi contratado. O pagamento está retido com garantia e é liberado quando o serviço for concluído.</Aviso>
                  ) : (
                    <div id="aviso-pagamento-pendente">
                      <Aviso tipo="alerta">Você foi contratado, mas o cliente ainda não confirmou o pagamento simulado. A conclusão fica disponível quando o valor estiver retido em custódia.</Aviso>
                    </div>
                  )}
                  <button type="button" onClick={concluirServico} disabled={processandoConclusao || oportunidade.pagamento_contratacao !== 'RETIDO'}
                    aria-describedby={oportunidade.pagamento_contratacao === 'RETIDO' ? undefined : 'aviso-pagamento-pendente'} className="btn btn-primario btn-bloco">
                    <CheckCircle size={16} aria-hidden="true" /> {processandoConclusao ? 'Confirmando...' : 'Marcar como concluído'}
                  </button>
                  {!desistindo ? (
                    <button type="button" onClick={() => setDesistindo(true)} className="btn btn-perigo btn-bloco">
                      <Ban size={15} aria-hidden="true" /> Desistir da contratação
                    </button>
                  ) : (
                    <form onSubmit={desistirContratacao} className="empilhado" style={{ gap: '0.6rem', padding: '0.9rem', borderRadius: '12px', border: '1px solid var(--danger-border)', background: 'var(--bg-color)' }}>
                      <p className="texto-apoio" style={{ fontSize: '0.82rem' }}>O cliente será avisado e a solicitação volta a aceitar propostas de outros prestadores.</p>
                      <label htmlFor="motivo-desistencia" className="sr-only">Motivo da desistência</label>
                      <input id="motivo-desistencia" value={motivoDesistencia} onChange={(e) => setMotivoDesistencia(e.target.value)} placeholder="Motivo da desistência" maxLength={500} className="campo" style={{ background: 'var(--card-bg)' }} />
                      <div className="grupo-botoes">
                        <button type="submit" disabled={processandoDesistencia || !motivoDesistencia.trim()} className="btn btn-perigo" style={{ flex: 1 }}>{processandoDesistencia ? 'Enviando...' : 'Confirmar desistência'}</button>
                        <button type="button" onClick={() => setDesistindo(false)} className="btn btn-secundario">Voltar</button>
                      </div>
                    </form>
                  )}
                </>
              ) : proposta.status === 'ACEITA' && oportunidade.status === 'CONCLUIDA' ? (
                avaliacao ? (
                  <div className="empilhado" style={{ gap: '0.4rem' }}>
                    <strong style={{ fontSize: '0.9rem' }}>Avaliação do cliente</strong>
                    <div role="img" aria-label={`${avaliacao.nota} de 5 estrelas`} style={{ display: 'flex', gap: '2px' }}>
                      {[1, 2, 3, 4, 5].map((n) => <Star key={n} size={18} color="var(--warning-strong)" fill={n <= avaliacao.nota ? 'var(--warning-strong)' : 'none'} aria-hidden="true" />)}
                    </div>
                    {avaliacao.comentario && <p style={{ color: 'var(--text-body)', fontSize: '0.85rem' }}>{avaliacao.comentario}</p>}
                  </div>
                ) : (
                  <p className="texto-apoio" style={{ fontSize: '0.85rem' }}>Serviço concluído — aguardando o cliente avaliar.</p>
                )
              ) : (
                <p className="texto-apoio" style={{ fontSize: '0.85rem' }}>{propostaExpirada ? 'A validade comercial expirou; aceite e renegociação estão bloqueados.' : 'O cliente poderá analisar, aceitar, recusar ou enviar uma contraproposta.'}</p>
              )}
            </section>
          ) : !logado ? (
            <section className="card grande empilhado" style={{ gap: '0.75rem' }}>
              <h2 className="titulo-secao" style={{ fontSize: '1.1rem' }}>Entre para enviar uma proposta</h2>
              <p className="texto-apoio">Você pode ver os detalhes livremente, mas precisa de uma conta de Prestador para enviar proposta a este cliente.</p>
              <Link href="/login" className="btn btn-primario btn-bloco">Entrar na conta</Link>
              <Link href="/register-prestador" className="btn btn-texto">Criar conta de prestador</Link>
            </section>
          ) : !souPrestador ? (
            <section className="card grande empilhado" style={{ gap: '0.6rem' }}>
              <h2 className="titulo-secao" style={{ fontSize: '1.1rem' }}>Área do prestador</h2>
              <p className="texto-apoio">Só contas de Prestador podem enviar proposta. Sua conta é de Solicitante — você pode ver os detalhes e fazer perguntas, mas não propor.</p>
            </section>
          ) : !oportunidade.pode_enviar_proposta ? (
            <section className="card grande empilhado" style={{ gap: '0.6rem' }}>
              <h2 className="titulo-secao" style={{ fontSize: '1.1rem' }}>Oportunidade indisponível</h2>
              <p className="texto-apoio">Esta solicitação não está mais aberta para novas propostas.</p>
            </section>
          ) : (
            <form onSubmit={submeterProposta} aria-labelledby="titulo-enviar-proposta" className="card grande foco empilhado" style={{ gap: '0.9rem' }}>
              <div>
                <h2 id="titulo-enviar-proposta" className="titulo-secao" style={{ fontSize: '1.15rem', marginBottom: '0.2rem' }}>Enviar proposta</h2>
                <p className="texto-apoio" style={{ fontSize: '0.85rem' }}>Diga quanto cobra, em quanto tempo faz e como vai fazer.</p>
              </div>
              <div className="grade-campos" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 130px), 1fr))', gap: '0.75rem' }}>
                <div className="campo-grupo">
                  <label htmlFor="proposta-valor" className="rotulo">Valor</label>
                  <div className="campo-com-prefixo">
                    <span aria-hidden="true">R$</span>
                    <input id="proposta-valor" type="number" name="valor" min="0.01" max="99999999.99" step="0.01" required value={formulario.valor} onChange={alterarCampo} placeholder="850,00" className="campo" style={{ fontWeight: 700 }} />
                  </div>
                </div>
                <div className="campo-grupo">
                  <label htmlFor="proposta-prazo" className="rotulo">Prazo de execução (dias)</label>
                  <input id="proposta-prazo" type="number" name="prazo_dias" min="1" max="3650" step="1" required value={formulario.prazo_dias} onChange={alterarCampo} placeholder="5" className="campo" />
                </div>
              </div>
              <div className="campo-grupo">
                <label htmlFor="proposta-validade" className="rotulo">Validade da proposta (dias)</label>
                <input id="proposta-validade" type="number" name="validade_dias" min="1" max="365" step="1" required value={formulario.validade_dias} onChange={alterarCampo} className="campo" aria-describedby="proposta-validade-ajuda" />
                <span id="proposta-validade-ajuda" className="ajuda">Tempo que o cliente tem para aceitar ou negociar{validadePrevista ? ` (até ${validadePrevista})` : ''}. Não é o prazo de execução.</span>
              </div>
              <div className="campo-grupo">
                <label htmlFor="proposta-mensagem" className="rotulo">Mensagem para o cliente</label>
                <textarea
                  id="proposta-mensagem" name="mensagem" minLength={10} maxLength={2000} required className="campo"
                  value={formulario.mensagem} onChange={alterarCampo} rows={4} aria-describedby="proposta-mensagem-contador"
                  placeholder="Apresente sua proposta e explique como realizará o serviço."
                />
                <span id="proposta-mensagem-contador" className="ajuda">{formulario.mensagem.length}/2000 caracteres</span>
              </div>
              {formulario.valor && formulario.prazo_dias && (
                <p style={{ padding: '0.75rem 0.9rem', borderRadius: '12px', background: 'var(--bg-color)', fontSize: '0.85rem', lineHeight: 1.55, color: 'var(--text-body)' }}>
                  O cliente vai ver: <strong style={{ color: 'var(--text-primary)' }}>{formatarMoeda(formulario.valor)} · {formulario.prazo_dias} {Number(formulario.prazo_dias) === 1 ? 'dia' : 'dias'}{validadePrevista ? ` · válida até ${validadePrevista}` : ''}</strong>. Ele pode aceitar, recusar ou mandar uma contraproposta.
                </p>
              )}
              <button type="submit" disabled={enviando} className="btn btn-primario btn-grande btn-bloco">
                <Send size={17} aria-hidden="true" /> {enviando ? 'Enviando...' : 'Enviar proposta'}
              </button>
            </form>
          )}
        </aside>
      </div>

      <ChatDrawer
        propostaId={proposta?.id || ''}
        solicitacaoId={oportunidade.id}
        titulo={`Chat com ${oportunidade.solicitante.nome}`}
        aberto={chatAberto}
        onClose={() => setChatAberto(false)}
      />
    </Pagina>
  );
}
