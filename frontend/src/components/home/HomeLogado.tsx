'use client';

/**
 * @file HomeLogado.tsx
 * @description Página inicial depois do login (US38). O solicitante vê os próprios pedidos com a
 * próxima ação de cada um; o prestador vê seus indicadores, oportunidades e últimas propostas; o admin
 * vê o atalho para o painel administrativo. Todos os dados vêm de rotas já existentes da API — não há
 * endpoint novo. O card de mensagens usa as notificações de nova mensagem do chat (US14/US16), já que
 * a API não tem uma rota de conversas recentes.
 *
 * BIBLIOTECAS UTILIZADAS:
 * 1. Lucide React (^0.383.0): Ícones de garantia, mensagens e navegação.
 *    Doc Oficial: https://lucide.dev/
 * 2. Next.js (^14.2.3): Navegação com `Link` e `useRouter`.
 *    Doc Oficial: https://nextjs.org/docs
 * 3. Axios (^1.7.2): Requisições às rotas de dashboard, solicitações, propostas e notificações.
 *    Doc Oficial: https://axios-http.com/docs/intro
 */

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ShieldCheck, MessageCircle, ArrowRight, Inbox, ShieldAlert } from 'lucide-react';
import api from '@/services/api';
import { CardOportunidade } from './HomeVisitante';
import {
  NotificacaoResumo, OportunidadeResumo, PedidoResumo, STATUS_PROPOSTA, STATUS_SOLICITACAO, UsuarioSessao,
  destinoNovoPedido, estiloBotaoPrimario, estiloBotaoSecundario, estiloCard, estiloChip,
  formatarMoeda, formatarRelativo, lerRascunhoPedido, plural, proximaAcao,
} from './comum';

interface DashboardSolicitante {
  servicos_abertos: number;
  propostas_pendentes: number;
  servicos_em_andamento: number;
  servicos_concluidos: number;
}

interface DashboardPrestador {
  valor_em_custodia: number;
  nota_reputacao: number | null;
  total_avaliacoes: number;
}

interface PropostaResumo {
  id: string;
  valor: string;
  status: string;
  solicitacao: { id: string; titulo: string; status: string };
}

/** Estado de uma lista carregada da API: `null` enquanto carrega, `'erro'` se falhou. */
type Carga<T> = T | null | 'erro';

function carregar<T>(promessa: Promise<T>, definir: (valor: Carga<T>) => void) {
  promessa.then(definir).catch(() => definir('erro'));
}

export default function HomeLogado({ usuario }: { usuario: UsuarioSessao }) {
  const primeiroNome = usuario.nome.split(' ')[0];
  const perfil = usuario.tipo_perfil;

  return (
    <main style={{ maxWidth: '1200px', margin: '0 auto', padding: '2.5rem 1.5rem 4.5rem', width: '100%', boxSizing: 'border-box', flex: 1, display: 'flex', flexDirection: 'column', gap: '2rem' }}>
      {perfil === 'PRESTADOR' && <PainelPrestador primeiroNome={primeiroNome} />}
      {perfil === 'ADMIN' && <PainelAdmin primeiroNome={primeiroNome} />}
      {perfil !== 'PRESTADOR' && perfil !== 'ADMIN' && <PainelSolicitante primeiroNome={primeiroNome} />}
    </main>
  );
}

function Saudacao({ primeiroNome, resumo }: { primeiroNome: string; resumo: string | null }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
      <h1 style={{ fontSize: '2rem', fontWeight: 800, letterSpacing: '-0.02em' }}>Olá, {primeiroNome}</h1>
      <p role="status" style={{ color: 'var(--text-secondary)', minHeight: '1.5em' }}>{resumo ?? ''}</p>
    </div>
  );
}

// ── SOLICITANTE ──────────────────────────────────────────────────────────────

function PainelSolicitante({ primeiroNome }: { primeiroNome: string }) {
  const router = useRouter();
  const [pedido, setPedido] = useState('');
  const [dashboard, setDashboard] = useState<Carga<DashboardSolicitante>>(null);
  const [pedidos, setPedidos] = useState<Carga<PedidoResumo[]>>(null);

  useEffect(() => {
    // Rascunho digitado antes do login (página do visitante): volta preenchido para continuar.
    const rascunho = lerRascunhoPedido();
    if (rascunho?.titulo) setPedido(rascunho.titulo);
    carregar(api.get('/dashboards/solicitante').then((r) => r.data.dados), setDashboard);
    carregar(api.get('/solicitacoes/minhas').then((r) => (r.data.data || []).slice(0, 4)), setPedidos);
  }, []);

  const resumo = dashboard === null ? null
    : dashboard === 'erro' ? ''
      : dashboard.propostas_pendentes > 0
        ? `Você tem ${plural(dashboard.propostas_pendentes, 'proposta aguardando', 'propostas aguardando')} sua análise.`
        : 'Nenhuma proposta nova esperando por você agora.';

  function pedirPropostas(e: React.FormEvent) {
    e.preventDefault();
    router.push(destinoNovoPedido({ titulo: pedido.trim(), categoria: lerRascunhoPedido()?.categoria ?? '' }));
  }

  return (
    <>
      <Saudacao primeiroNome={primeiroNome} resumo={resumo} />
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '1.75rem', alignItems: 'flex-start' }}>
        <div style={{ flex: '999 1 560px', minWidth: 0, display: 'flex', flexDirection: 'column', gap: '1.75rem' }}>
          <section aria-labelledby="titulo-novo-pedido" style={{ ...estiloCard, background: 'var(--bg-highlight)', borderRadius: '20px', padding: '1.6rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <div>
              <h2 id="titulo-novo-pedido" style={{ fontSize: '1.35rem', fontWeight: 800, marginBottom: '0.25rem' }}>Precisa de outro serviço?</h2>
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.92rem' }}>Descreva o que precisa e receba propostas de prestadores da região.</p>
            </div>
            <form onSubmit={pedirPropostas} style={{ display: 'flex', gap: '0.6rem', flexWrap: 'wrap' }}>
              <label htmlFor="pedido-logado" className="sr-only">O que você precisa?</label>
              <input
                id="pedido-logado" value={pedido} onChange={(e) => setPedido(e.target.value)} maxLength={120}
                placeholder="Ex.: pintar o quarto das crianças"
                style={{ flex: '1 1 240px', minWidth: 0, height: '50px', padding: '0 1rem', borderRadius: '12px', border: '1px solid var(--card-border)', background: 'var(--card-bg)', color: 'var(--text-primary)', fontSize: '1rem' }}
              />
              <button type="submit" style={{ ...estiloBotaoPrimario, height: '50px' }}>Pedir propostas</button>
            </form>
          </section>

          <section aria-labelledby="titulo-seus-pedidos" style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '1rem' }}>
              <h2 id="titulo-seus-pedidos" style={{ fontSize: '1.25rem', fontWeight: 800 }}>Seus pedidos</h2>
              <Link href="/minhas-solicitacoes" style={{ padding: '0.6rem 0', fontSize: '0.9rem', fontWeight: 600 }}>Ver todos</Link>
            </div>
            {pedidos === null && <p role="status" style={{ color: 'var(--text-secondary)' }}>Carregando seus pedidos…</p>}
            {pedidos === 'erro' && <p role="alert" style={{ color: 'var(--danger-text)' }}>Não foi possível carregar seus pedidos agora.</p>}
            {Array.isArray(pedidos) && pedidos.length === 0 && (
              <div style={{ ...estiloCard, padding: '1.5rem', color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                <Inbox size={20} aria-hidden="true" /> Você ainda não publicou nenhum pedido. Use o campo acima para começar.
              </div>
            )}
            {Array.isArray(pedidos) && pedidos.length > 0 && (
              <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                {pedidos.map((p) => {
                  const status = STATUS_SOLICITACAO[p.status] ?? STATUS_SOLICITACAO.ABERTA;
                  const acao = proximaAcao(p);
                  return (
                    <li key={p.id} style={{ ...estiloCard, padding: '1.2rem', display: 'flex', flexWrap: 'wrap', gap: '1rem', alignItems: 'center' }}>
                      <div style={{ flex: '1 1 280px', minWidth: 0, display: 'flex', flexDirection: 'column', gap: '0.45rem' }}>
                        <span style={{ display: 'flex', gap: '0.5rem', alignItems: 'center', flexWrap: 'wrap' }}>
                          <span style={estiloChip(status)}>{status.label}</span>
                          <span style={{ fontSize: '0.78rem', color: 'var(--text-secondary)' }}>publicado {formatarRelativo(p.created_at)}</span>
                        </span>
                        <strong style={{ fontSize: '1.05rem', lineHeight: 1.35, overflowWrap: 'anywhere' }}>{p.titulo}</strong>
                        <span style={{ fontSize: '0.88rem', color: 'var(--text-secondary)' }}>{acao.info}</span>
                      </div>
                      <Link href={`/minhas-solicitacoes/${p.id}`} style={acao.primaria ? estiloBotaoPrimario : estiloBotaoSecundario}>
                        {acao.texto}
                      </Link>
                    </li>
                  );
                })}
              </ul>
            )}
          </section>
        </div>

        <aside style={{ flex: '1 1 300px', minWidth: 0, display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          <CardMensagens />
          <section aria-labelledby="titulo-garantia" style={{ ...estiloCard, padding: '1.25rem', display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
            <h2 id="titulo-garantia" style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', fontSize: '1rem', fontWeight: 700 }}>
              <span aria-hidden="true" style={{ width: '36px', height: '36px', borderRadius: '10px', background: 'var(--sky-bg)', color: 'var(--brand-sky)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <ShieldCheck size={18} />
              </span>
              Pagamento com garantia
            </h2>
            <p style={{ fontSize: '0.86rem', lineHeight: 1.55, color: 'var(--text-secondary)' }}>
              Ao contratar, o valor fica retido na plataforma e só é liberado para o prestador quando você confirma a conclusão do serviço.
            </p>
            {dashboard !== null && dashboard !== 'erro' && dashboard.servicos_em_andamento > 0 && (
              <p style={{ fontSize: '0.86rem', fontWeight: 600 }}>
                Você tem {plural(dashboard.servicos_em_andamento, 'serviço contratado', 'serviços contratados')} em andamento.
              </p>
            )}
          </section>
        </aside>
      </div>
    </>
  );
}

// ── PRESTADOR ────────────────────────────────────────────────────────────────

function PainelPrestador({ primeiroNome }: { primeiroNome: string }) {
  const [dashboard, setDashboard] = useState<Carga<DashboardPrestador>>(null);
  const [propostas, setPropostas] = useState<Carga<PropostaResumo[]>>(null);
  const [oportunidades, setOportunidades] = useState<Carga<OportunidadeResumo[]>>(null);

  useEffect(() => {
    carregar(api.get('/dashboards/prestador').then((r) => r.data.dados), setDashboard);
    carregar(api.get('/prestador/propostas').then((r) => r.data.dados || []), setPropostas);
    carregar(api.get('/prestador/oportunidades', { params: { ordenacao: 'recentes' } }).then((r) => (r.data.dados || []).slice(0, 4)), setOportunidades);
  }, []);

  const listaPropostas = Array.isArray(propostas) ? propostas : [];
  const aguardando = listaPropostas.filter((p) => p.status === 'ENVIADA' || p.status === 'EM_ANALISE').length;
  const emAndamento = listaPropostas.filter((p) => p.status === 'ACEITA' && p.solicitacao?.status === 'CONTRATADA').length;
  const dash = dashboard !== null && dashboard !== 'erro' ? dashboard : null;

  const resumo = propostas === null ? null
    : propostas === 'erro' ? ''
      : aguardando > 0
        ? `${plural(aguardando, 'proposta sua aguarda', 'propostas suas aguardam')} resposta do cliente.`
        : 'Veja os pedidos abertos e envie sua próxima proposta.';

  const indicadores = [
    { rotulo: 'Propostas aguardando resposta', valor: propostas === null ? '…' : propostas === 'erro' ? '—' : String(aguardando) },
    { rotulo: 'Serviços contratados em andamento', valor: propostas === null ? '…' : propostas === 'erro' ? '—' : String(emAndamento) },
    { rotulo: 'A receber (retido com garantia)', valor: dashboard === null ? '…' : dash ? formatarMoeda(dash.valor_em_custodia) : '—' },
    {
      rotulo: 'Sua reputação',
      valor: dashboard === null ? '…' : !dash ? '—' : dash.nota_reputacao === null ? 'Sem notas' : `★ ${dash.nota_reputacao.toFixed(1).replace('.', ',')}`,
      detalhe: dash && dash.nota_reputacao !== null ? plural(dash.total_avaliacoes, 'avaliação', 'avaliações') : undefined,
    },
  ];

  return (
    <>
      <Saudacao primeiroNome={primeiroNome} resumo={resumo} />
      <ul aria-label="Seus indicadores" style={{ listStyle: 'none', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: '1rem' }}>
        {indicadores.map((ind) => (
          <li key={ind.rotulo} style={{ ...estiloCard, padding: '1.2rem', display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
            <span style={{ fontSize: '0.82rem', fontWeight: 600, color: 'var(--text-secondary)' }}>{ind.rotulo}</span>
            <span style={{ fontSize: '1.75rem', fontWeight: 800 }}>
              {ind.valor}
              {ind.detalhe && <span style={{ fontSize: '0.85rem', fontWeight: 500, color: 'var(--text-secondary)' }}> · {ind.detalhe}</span>}
            </span>
          </li>
        ))}
      </ul>

      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '1.75rem', alignItems: 'flex-start' }}>
        <section aria-labelledby="titulo-oportunidades" style={{ flex: '999 1 560px', minWidth: 0, display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '1rem' }}>
            <h2 id="titulo-oportunidades" style={{ fontSize: '1.25rem', fontWeight: 800 }}>Oportunidades para você</h2>
            <Link href="/oportunidades" style={{ padding: '0.6rem 0', fontSize: '0.9rem', fontWeight: 600 }}>Ver todas</Link>
          </div>
          {oportunidades === null && <p role="status" style={{ color: 'var(--text-secondary)' }}>Carregando oportunidades…</p>}
          {oportunidades === 'erro' && <p role="alert" style={{ color: 'var(--danger-text)' }}>Não foi possível carregar as oportunidades agora.</p>}
          {Array.isArray(oportunidades) && oportunidades.length === 0 && (
            <p style={{ color: 'var(--text-secondary)' }}>Nenhum pedido aberto no momento.</p>
          )}
          {Array.isArray(oportunidades) && oportunidades.length > 0 && (
            <ul style={{ listStyle: 'none', display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(min(100%, 260px), 1fr))', gap: '1rem' }}>
              {oportunidades.map((o) => (
                <li key={o.id}><CardOportunidade oportunidade={o} comChamada /></li>
              ))}
            </ul>
          )}
        </section>

        <aside style={{ flex: '1 1 300px', minWidth: 0, display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          <section aria-labelledby="titulo-suas-propostas" style={{ ...estiloCard, padding: '1.25rem', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <h2 id="titulo-suas-propostas" style={{ fontSize: '1rem', fontWeight: 700 }}>Suas propostas</h2>
              <Link href="/minhas-propostas" style={{ padding: '0.5rem 0', fontSize: '0.85rem', fontWeight: 600 }}>Ver todas</Link>
            </div>
            {propostas === null && <p role="status" style={{ color: 'var(--text-secondary)', fontSize: '0.88rem' }}>Carregando…</p>}
            {propostas === 'erro' && <p role="alert" style={{ color: 'var(--danger-text)', fontSize: '0.88rem' }}>Não foi possível carregar suas propostas.</p>}
            {Array.isArray(propostas) && propostas.length === 0 && (
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.88rem' }}>Você ainda não enviou propostas.</p>
            )}
            {listaPropostas.length > 0 && (
              <ul style={{ listStyle: 'none' }}>
                {listaPropostas.slice(0, 3).map((p) => {
                  const status = STATUS_PROPOSTA[p.status] ?? STATUS_PROPOSTA.ENVIADA;
                  return (
                    <li key={p.id} style={{ borderTop: '1px solid var(--card-border)' }}>
                      <Link href={`/oportunidades/${p.solicitacao.id}`} style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem', padding: '0.75rem 0', color: 'var(--text-primary)', textDecoration: 'none' }}>
                        <span style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '0.5rem' }}>
                          <span style={estiloChip(status)}>{status.label}</span>
                          <strong style={{ fontSize: '0.92rem' }}>{formatarMoeda(p.valor)}</strong>
                        </span>
                        <span style={{ fontSize: '0.88rem', fontWeight: 600, lineHeight: 1.35, overflowWrap: 'anywhere' }}>{p.solicitacao.titulo}</span>
                      </Link>
                    </li>
                  );
                })}
              </ul>
            )}
          </section>

          <CardMensagens />

          <Link href="/nova-solicitacao" style={{ ...estiloCard, background: 'var(--bg-highlight)', padding: '1.25rem', display: 'flex', flexDirection: 'column', gap: '0.35rem', color: 'var(--text-primary)', textDecoration: 'none' }}>
            <strong style={{ fontSize: '0.95rem' }}>Também precisa de um serviço?</strong>
            <span style={{ fontSize: '0.84rem', lineHeight: 1.5, color: 'var(--text-secondary)' }}>Como prestador, você também pode publicar pedidos e receber propostas.</span>
            <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.3rem', fontSize: '0.88rem', fontWeight: 700, color: 'var(--link-color)' }}>
              Pedir propostas <ArrowRight size={15} aria-hidden="true" />
            </span>
          </Link>
        </aside>
      </div>
    </>
  );
}

// ── ADMIN ────────────────────────────────────────────────────────────────────

function PainelAdmin({ primeiroNome }: { primeiroNome: string }) {
  return (
    <>
      <Saudacao primeiroNome={primeiroNome} resumo="Você está conectado com o perfil de administrador." />
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 280px), 1fr))', gap: '1rem' }}>
        <Link href="/admin" style={{ ...estiloCard, padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '0.5rem', color: 'var(--text-primary)', textDecoration: 'none' }}>
          <ShieldAlert size={22} color="var(--brand-sky)" aria-hidden="true" />
          <strong style={{ fontSize: '1.05rem' }}>Painel administrativo</strong>
          <span style={{ fontSize: '0.88rem', color: 'var(--text-secondary)' }}>Usuários, solicitações e denúncias da plataforma.</span>
        </Link>
        <Link href="/oportunidades" style={{ ...estiloCard, padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '0.5rem', color: 'var(--text-primary)', textDecoration: 'none' }}>
          <Inbox size={22} color="var(--brand-sky)" aria-hidden="true" />
          <strong style={{ fontSize: '1.05rem' }}>Oportunidades</strong>
          <span style={{ fontSize: '0.88rem', color: 'var(--text-secondary)' }}>Feed público de pedidos que ainda aceitam propostas.</span>
        </Link>
      </div>
    </>
  );
}

// ── MENSAGENS (via notificações) ─────────────────────────────────────────────

// As notificações não guardam o tipo do evento; as do chat são criadas com o título
// "Nova mensagem de <nome>" (chatService), e é por ele que o card as reconhece.
const PREFIXO_MENSAGEM = 'Nova mensagem de ';

function CardMensagens() {
  const [mensagens, setMensagens] = useState<Carga<NotificacaoResumo[]>>(null);

  useEffect(() => {
    carregar(
      api.get('/notificacoes').then((r) => ((r.data.dados || []) as NotificacaoResumo[]).filter((n) => n.titulo.startsWith(PREFIXO_MENSAGEM)).slice(0, 3)),
      setMensagens,
    );
  }, []);

  return (
    <section aria-labelledby="titulo-mensagens" style={{ ...estiloCard, padding: '1.25rem', display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
      <h2 id="titulo-mensagens" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '1rem', fontWeight: 700 }}>
        <MessageCircle size={18} aria-hidden="true" /> Mensagens recentes
      </h2>
      {mensagens === null && <p role="status" style={{ color: 'var(--text-secondary)', fontSize: '0.88rem' }}>Carregando…</p>}
      {mensagens === 'erro' && <p role="alert" style={{ color: 'var(--danger-text)', fontSize: '0.88rem' }}>Não foi possível carregar as mensagens.</p>}
      {Array.isArray(mensagens) && mensagens.length === 0 && (
        <p style={{ color: 'var(--text-secondary)', fontSize: '0.88rem' }}>Nenhuma mensagem nova no chat.</p>
      )}
      {Array.isArray(mensagens) && mensagens.length > 0 && (
        <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
          {mensagens.map((m) => {
            const nome = m.titulo.slice(PREFIXO_MENSAGEM.length);
            const iniciais = nome.split(' ').filter(Boolean).slice(0, 2).map((p) => p[0]?.toUpperCase()).join('');
            const conteudo = (
              <>
                <span aria-hidden="true" style={{ width: '38px', height: '38px', borderRadius: '50%', background: 'var(--sky-bg)', color: 'var(--brand-sky)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.8rem', fontWeight: 700, flexShrink: 0 }}>
                  {iniciais || '?'}
                </span>
                <span style={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column', gap: '2px' }}>
                  <span style={{ display: 'flex', justifyContent: 'space-between', gap: '0.5rem' }}>
                    <span style={{ fontSize: '0.88rem', fontWeight: m.lida ? 500 : 700 }}>{nome}</span>
                    <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', flexShrink: 0 }}>{formatarRelativo(m.createdAt)}</span>
                  </span>
                  <span style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{m.mensagem}</span>
                </span>
              </>
            );
            const estiloLinha: React.CSSProperties = { display: 'flex', alignItems: 'center', gap: '0.7rem', color: 'var(--text-primary)', textDecoration: 'none' };
            return (
              <li key={m.id}>
                {m.link_redirecionamento
                  ? <Link href={m.link_redirecionamento} style={estiloLinha}>{conteudo}</Link>
                  : <div style={estiloLinha}>{conteudo}</div>}
              </li>
            );
          })}
        </ul>
      )}
    </section>
  );
}
