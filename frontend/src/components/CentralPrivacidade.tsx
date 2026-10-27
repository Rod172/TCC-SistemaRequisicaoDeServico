'use client';

/**
 * @file CentralPrivacidade.tsx
 * @description Canal do titular e caixa administrativa de privacidade (US40), no visual da US39.
 * - Titular com sessão: dentro de "Minha conta", com o formulário de novo pedido, a lista de protocolos
 *   e, ao lado, o registro de aceite do cadastro e o contato do responsável.
 * - Visitante: explica o canal por e-mail e leva ao login.
 * - Administração: protocolos paginados (pendentes primeiro) com o formulário de resposta em cada um.
 * Nenhuma ação daqui exclui ou exporta dados automaticamente; as respostas são registradas para análise.
 *
 * BIBLIOTECAS UTILIZADAS:
 * 1. React (^18.3.1): Estado do formulário e carregamento dos protocolos.
 *    Doc Oficial: https://react.dev/reference/react
 * 2. Axios (^1.7.2): Cliente centralizado com JWT (`services/api`).
 *    Doc Oficial: https://axios-http.com/docs/intro
 * 3. Next.js (^14.2.3): Navegação com `Link`.
 *    Doc Oficial: https://nextjs.org/docs/14/app/api-reference/components/link
 * 4. Lucide React (^0.383.0): Ícones de seções e ações.
 *    Doc Oficial: https://lucide.dev/
 */

import React, { useCallback, useEffect, useState } from 'react';
import Link from 'next/link';
import { ChevronLeft, ChevronRight, FileText, Inbox, Mail, Send } from 'lucide-react';
import api from '@/services/api';
import documentos from '@/conteudo/documentos-legais.json';
import Pagina, { CabecalhoPagina } from '@/components/ui/Pagina';
import LayoutConta from '@/components/ui/LayoutConta';
import { Aviso, Chip, CorStatus, EstadoLista } from '@/components/ui/Elementos';

const TIPOS: Record<string, string> = {
  ACESSO: 'Acesso ou confirmação de tratamento',
  CORRECAO: 'Correção de dados',
  EXCLUSAO: 'Exclusão, bloqueio ou anonimização',
  INFORMACAO: 'Informações, compartilhamento ou portabilidade',
  REVOGACAO: 'Revogação de consentimento específico',
};

const STATUS_PEDIDO: Record<string, CorStatus> = {
  PENDENTE: { bg: 'var(--warning-tint)', fg: 'var(--warning-strong)', label: 'Pendente de análise' },
  RESPONDIDA: { bg: 'var(--success-tint)', fg: 'var(--success-strong)', label: 'Respondida' },
};

const DESCRICAO_MINIMA = 10;
const DESCRICAO_MAXIMA = 2000;

interface Pedido { id: string; tipo: string; descricao: string; status: string; resposta: string | null; respondida_em: string | null; createdAt: string; titular?: { nome: string; email: string } }
interface Aceite { termos_uso_versao: string | null; privacidade_versao: string | null; documentos_aceitos_em: string | null }

function data(valor: string | null) { return valor ? new Date(valor).toLocaleString('pt-BR') : 'Não registrado'; }

export default function CentralPrivacidade({ administracao = false }: { administracao?: boolean }) {
  const [pagina, setPagina] = useState(1);
  const [paginacao, setPaginacao] = useState({ total: 0, total_paginas: 1 });
  const [sessao, setSessao] = useState<boolean | null>(null);
  const [pedidos, setPedidos] = useState<Pedido[]>([]);
  const [aceite, setAceite] = useState<Aceite | null>(null);
  const [tipo, setTipo] = useState('ACESSO');
  const [descricao, setDescricao] = useState('');
  const [respostas, setRespostas] = useState<Record<string, string>>({});
  const [erro, setErro] = useState('');
  const [sucesso, setSucesso] = useState('');
  const [salvando, setSalvando] = useState(false);
  const [carregando, setCarregando] = useState(true);

  const carregar = useCallback(async () => {
    setCarregando(true); setErro('');
    if (!localStorage.getItem('@ServicoFacil:token')) { setSessao(false); setCarregando(false); return; }
    setSessao(true);
    try {
      const r = await api.get(administracao ? `/admin/privacidade?pagina=${pagina}` : '/privacidade/minha-central');
      if (administracao) setPaginacao(r.data.paginacao || { total: r.data.data.length, total_paginas: 1 });
      setPedidos(administracao ? r.data.data : r.data.data.solicitacoes);
      if (!administracao) setAceite(r.data.data.aceite);
    } catch (e: any) {
      if (e.response?.status === 401) setSessao(false);
      setErro(e.response?.data?.message || 'Não foi possível carregar os protocolos.');
    } finally { setCarregando(false); }
  }, [administracao, pagina]);

  useEffect(() => { void carregar(); }, [carregar]);

  async function enviar(e: React.FormEvent) {
    e.preventDefault(); setSalvando(true); setErro(''); setSucesso('');
    try {
      const r = await api.post('/privacidade/solicitacoes', { tipo, descricao });
      setDescricao(''); await carregar();
      setSucesso(`Pedido registrado. Protocolo: ${r.data.data.id}`);
    } catch (e: any) { setErro(e.response?.data?.message || 'Não foi possível registrar o pedido.'); } finally { setSalvando(false); }
  }

  async function responder(e: React.FormEvent, id: string) {
    e.preventDefault(); setSalvando(true); setErro(''); setSucesso('');
    try {
      await api.patch(`/admin/privacidade/${id}/resposta`, { resposta: respostas[id] });
      await carregar();
      setSucesso('Resposta registrada para o titular. Nenhuma exclusão de dados foi executada automaticamente.');
    } catch (e: any) { setErro(e.response?.data?.message || 'Não foi possível registrar a resposta.'); } finally { setSalvando(false); }
  }

  const mensagens = (
    <>
      {erro && <Aviso tipo="erro">{erro}</Aviso>}
      {sucesso && <Aviso tipo="sucesso"><span style={{ overflowWrap: 'anywhere' }}>{sucesso}</span></Aviso>}
    </>
  );

  const contato = (
    <section aria-labelledby="titulo-contato-privacidade" className="card empilhado" style={{ gap: '0.6rem' }}>
      <h2 id="titulo-contato-privacidade" className="titulo-secao" style={{ fontSize: '0.95rem' }}>Responsável pelos dados</h2>
      <p style={{ fontSize: '0.875rem' }}>{documentos.responsavel}</p>
      <a href={`mailto:${documentos.email_privacidade}`} style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.875rem', overflowWrap: 'anywhere' }}>
        <Mail size={15} aria-hidden="true" /> {documentos.email_privacidade}
      </a>
      <p className="ajuda">Atendimento gratuito. Sem acesso à conta, use o e-mail acima; a equipe verificará sua identidade quando necessário.</p>
      <div className="grupo-botoes" style={{ marginTop: '0.25rem' }}>
        <Link href="/termos-de-uso" className="btn btn-texto"><FileText size={15} aria-hidden="true" /> Termos de Uso</Link>
        <Link href="/politica-de-privacidade" className="btn btn-texto"><FileText size={15} aria-hidden="true" /> Política de Privacidade</Link>
      </div>
    </section>
  );

  const listaProtocolos = (
    <section aria-labelledby="titulo-protocolos" className="empilhado" style={{ gap: '0.75rem' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', gap: '0.75rem', flexWrap: 'wrap' }}>
        <h2 id="titulo-protocolos" className="titulo-secao">{administracao ? 'Protocolos dos titulares' : 'Meus protocolos'}</h2>
        {administracao && <span className="texto-apoio" style={{ fontSize: '0.85rem' }}>{paginacao.total === 1 ? '1 protocolo' : `${paginacao.total} protocolos`}</span>}
      </div>
      {!pedidos.length && <EstadoLista tipo="vazio" icone={<Inbox size={28} aria-hidden="true" />}>Nenhum protocolo para exibir.</EstadoLista>}
      {pedidos.map((p) => (
        <article key={p.id} className={`card empilhado ${p.status === 'PENDENTE' ? 'alerta' : ''}`} style={{ gap: '0.65rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '0.75rem', flexWrap: 'wrap' }}>
            <h3 style={{ fontSize: '1rem', fontWeight: 700 }}>{TIPOS[p.tipo] || p.tipo}</h3>
            <Chip status={p.status} mapa={STATUS_PEDIDO} />
          </div>
          <p className="texto-apoio" style={{ fontSize: '0.8rem', overflowWrap: 'anywhere' }}>
            Protocolo <span style={{ fontFamily: 'ui-monospace, monospace' }}>{p.id}</span> · criado em {data(p.createdAt)}
          </p>
          {administracao && <p style={{ fontSize: '0.85rem', overflowWrap: 'anywhere' }}><strong>Titular:</strong> {p.titular?.nome} · {p.titular?.email}</p>}
          <p style={{ whiteSpace: 'pre-wrap', fontSize: '0.92rem', lineHeight: 1.6, overflowWrap: 'anywhere' }}>{p.descricao}</p>
          {p.resposta && (
            <section aria-label="Resposta ao pedido" style={{ padding: '0.85rem 1rem', borderRadius: '12px', background: 'var(--bg-color)', border: '1px solid var(--success-border)' }}>
              <h4 style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--success-soft-text)', marginBottom: '0.35rem' }}>Resposta da equipe</h4>
              <p style={{ whiteSpace: 'pre-wrap', fontSize: '0.9rem', lineHeight: 1.6, overflowWrap: 'anywhere' }}>{p.resposta}</p>
              <p className="texto-apoio" style={{ fontSize: '0.78rem', marginTop: '0.35rem' }}>Respondido em {data(p.respondida_em)}</p>
            </section>
          )}
          {administracao && p.status === 'PENDENTE' && (
            <form onSubmit={(e) => responder(e, p.id)} className="empilhado" style={{ gap: '0.6rem', paddingTop: '0.5rem', borderTop: '1px solid var(--card-border)' }}>
              <div className="campo-grupo">
                <label htmlFor={`resposta-${p.id}`} className="rotulo">Resposta ao titular</label>
                <textarea id={`resposta-${p.id}`} required minLength={DESCRICAO_MINIMA} maxLength={DESCRICAO_MAXIMA} rows={4} className="campo" value={respostas[p.id] || ''} onChange={(e) => setRespostas({ ...respostas, [p.id]: e.target.value })} />
              </div>
              <button type="submit" disabled={salvando || (respostas[p.id] || '').trim().length < DESCRICAO_MINIMA} className="btn btn-primario" style={{ alignSelf: 'flex-start' }}>
                <Send size={15} aria-hidden="true" /> Registrar resposta
              </button>
            </form>
          )}
        </article>
      ))}
      {administracao && paginacao.total_paginas > 1 && (
        <nav aria-label="Páginas dos protocolos" style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'center' }}>
          <button type="button" disabled={pagina <= 1 || carregando} onClick={() => setPagina(pagina - 1)} className="btn btn-secundario"><ChevronLeft size={16} aria-hidden="true" /> Anterior</button>
          <span className="texto-apoio" style={{ fontSize: '0.875rem' }}>Página {pagina} de {paginacao.total_paginas}</span>
          <button type="button" disabled={pagina >= paginacao.total_paginas || carregando} onClick={() => setPagina(pagina + 1)} className="btn btn-secundario">Próxima <ChevronRight size={16} aria-hidden="true" /></button>
        </nav>
      )}
    </section>
  );

  // ── Administração ────────────────────────────────────────────────────────
  if (administracao) {
    return (
      <Pagina>
        <CabecalhoPagina
          voltar={{ href: '/admin', rotulo: 'Painel administrativo' }}
          area="Administração"
          titulo="Atendimento de privacidade"
          subtitulo="Pedidos dos titulares, com os pendentes primeiro. Verifique a identidade e faça a análise necessária antes de responder."
        />
        {mensagens}
        <Aviso tipo="info">Responder registra o texto e a data para o titular. Este formulário não exclui nem exporta dados automaticamente.</Aviso>
        {carregando ? <EstadoLista tipo="carregando">Carregando protocolos...</EstadoLista>
          : !sessao ? <EstadoLista tipo="erro" acao={<Link href="/login" className="btn btn-primario">Entrar</Link>}>Entre com uma conta de administrador para ver os protocolos.</EstadoLista>
          : listaProtocolos}
      </Pagina>
    );
  }

  // ── Visitante (sem sessão) ou carregando ─────────────────────────────────
  if (!sessao) {
    return (
      <Pagina largura="media">
        <CabecalhoPagina
          voltar={{ href: '/', rotulo: 'Página inicial' }}
          area="Privacidade"
          titulo="Central de Privacidade"
          subtitulo="Exerça os direitos de titular previstos no art. 18 da LGPD: peça acesso, correção ou exclusão dos seus dados e acompanhe cada pedido por protocolo."
        />
        {mensagens}
        {carregando ? <EstadoLista tipo="carregando">Carregando...</EstadoLista> : (
          <div className="layout-lateral">
            <section className="principal card grande empilhado" style={{ gap: '0.9rem' }}>
              <h2 className="titulo-secao">Entre para registrar um pedido</h2>
              <p style={{ fontSize: '0.92rem', lineHeight: 1.6, color: 'var(--text-body)' }}>
                Com a conta, você registra pedidos, acompanha os protocolos e vê as versões dos documentos que aceitou no cadastro.
                O contato por e-mail continua disponível sem login.
              </p>
              <div className="grupo-botoes">
                <Link href="/login" className="btn btn-primario">Entrar na conta</Link>
                <a href={`mailto:${documentos.email_privacidade}`} className="btn btn-secundario"><Mail size={16} aria-hidden="true" /> Enviar e-mail</a>
              </div>
            </section>
            <aside className="lateral">{contato}</aside>
          </div>
        )}
      </Pagina>
    );
  }

  // ── Titular com sessão ───────────────────────────────────────────────────
  return (
    <LayoutConta pagina="privacidade">
      <div className="empilhado" style={{ gap: '0.3rem' }}>
        <h2 className="titulo-secao" style={{ fontSize: '1.25rem' }}>Central de Privacidade</h2>
        <p className="texto-apoio" style={{ fontSize: '0.9rem' }}>Exerça os direitos de titular previstos no art. 18 da LGPD: peça acesso, correção ou exclusão dos seus dados e acompanhe cada pedido por protocolo.</p>
      </div>
      {mensagens}
      {carregando ? <EstadoLista tipo="carregando">Carregando protocolos...</EstadoLista> : (
        <>
          {aceite && (
            <section aria-labelledby="registro-aceite" className="card empilhado" style={{ gap: '0.75rem' }}>
              <h2 id="registro-aceite" className="titulo-secao">Registro do seu cadastro</h2>
              <dl className="dados">
                <div><dt>Termos de Uso</dt><dd>{aceite.termos_uso_versao || 'Versão não registrada'}</dd></div>
                <div><dt>Política de Privacidade</dt><dd>{aceite.privacidade_versao || 'Versão não registrada'}</dd></div>
                <div><dt>Aceite e ciência em</dt><dd>{data(aceite.documentos_aceitos_em)}</dd></div>
              </dl>
              {(!aceite.termos_uso_versao || !aceite.privacidade_versao) && (
                <p className="ajuda">Seu cadastro é anterior ao registro de versões. Não atribuímos a você aceite retroativo dos documentos atuais; consulte os textos públicos e tire dúvidas pelo pedido abaixo.</p>
              )}
            </section>
          )}

          {aceite && (
            <form onSubmit={enviar} aria-labelledby="titulo-novo-pedido" className="card grande empilhado" style={{ gap: '1rem' }}>
              <h2 id="titulo-novo-pedido" className="titulo-secao">Novo pedido</h2>
              <div className="campo-grupo">
                <label htmlFor="tipo-privacidade" className="rotulo">Tipo de pedido</label>
                <select id="tipo-privacidade" className="campo" value={tipo} onChange={(e) => setTipo(e.target.value)}>
                  {Object.entries(TIPOS).map(([id, nome]) => <option key={id} value={id}>{nome}</option>)}
                </select>
              </div>
              <div className="campo-grupo">
                <label htmlFor="descricao-privacidade" className="rotulo">Descreva seu pedido</label>
                <textarea id="descricao-privacidade" required minLength={DESCRICAO_MINIMA} maxLength={DESCRICAO_MAXIMA} rows={4} className="campo" value={descricao} onChange={(e) => setDescricao(e.target.value)} aria-describedby="descricao-privacidade-ajuda" />
                <span id="descricao-privacidade-ajuda" className="ajuda">
                  {descricao.trim().length < DESCRICAO_MINIMA ? `Pelo menos ${DESCRICAO_MINIMA} caracteres.` : `${descricao.length} de ${DESCRICAO_MAXIMA} caracteres.`}{' '}
                  Não envie senha, documento completo ou dados sensíveis.
                </span>
              </div>
              <Aviso tipo="info">
                O protocolo registra o pedido para análise manual. Desativar a conta não exclui os dados, e um pedido de exclusão também não os apaga automaticamente.
                A resposta deve observar seus direitos e os prazos legais aplicáveis.
              </Aviso>
              <button type="submit" disabled={salvando || descricao.trim().length < DESCRICAO_MINIMA} className="btn btn-primario" style={{ alignSelf: 'flex-start' }}>
                <Send size={15} aria-hidden="true" /> {salvando ? 'Registrando...' : 'Registrar pedido'}
              </button>
            </form>
          )}

          {listaProtocolos}
          {contato}
          <p className="ajuda">Ambiente de TCC com contas de demonstração compartilhadas: use dados fictícios nos testes.</p>
        </>
      )}
    </LayoutConta>
  );
}
