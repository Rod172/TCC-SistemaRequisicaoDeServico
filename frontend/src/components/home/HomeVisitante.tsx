'use client';

/**
 * @file HomeVisitante.tsx
 * @description Conteúdo da página inicial para quem não está logado (US38): destaque com o campo de
 * pedido e um card de exemplo, "Como funciona" em cinco passos e o bloco "Para prestadores", separado
 * do conteúdo do cliente, com os pedidos abertos reais do feed público (US08/US36).
 *
 * BIBLIOTECAS UTILIZADAS:
 * 1. Lucide React (^0.383.0): Ícones dos passos, da garantia e da localização.
 *    Doc Oficial: https://lucide.dev/
 * 2. Next.js (^14.2.3): Navegação com `Link` e `useRouter`.
 *    Doc Oficial: https://nextjs.org/docs
 */

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Lock, PencilLine, ClipboardList, MessageCircle, ShieldCheck, Star, ArrowRight, MapPin, Inbox } from 'lucide-react';
import api from '@/services/api';
import {
  CATEGORIAS_ATALHO, STATUS_SOLICITACAO, OportunidadeResumo, destinoNovoPedido, estiloBotaoPrimario,
  estiloBotaoSecundario, estiloCard, estiloChip, formatarMoeda, formatarRelativo, localDaOportunidade,
} from './comum';

const PASSOS = [
  { icone: <PencilLine size={22} />, titulo: 'Publique o pedido', texto: 'Conte o que precisa, onde e, se quiser, quanto pretende pagar.' },
  { icone: <ClipboardList size={22} />, titulo: 'Compare propostas', texto: 'Veja valor, prazo, nota e o perfil de cada prestador lado a lado.' },
  { icone: <MessageCircle size={22} />, titulo: 'Converse pelo chat', texto: 'Tire dúvidas e negocie com cada prestador antes de decidir.' },
  { icone: <ShieldCheck size={22} />, titulo: 'Pague com garantia', texto: 'O valor fica retido na plataforma e só é liberado quando você confirma a conclusão.' },
  { icone: <Star size={22} />, titulo: 'Avalie o serviço', texto: 'Sua nota e seu comentário ajudam outros clientes a escolher.' },
];

// Card ilustrativo do destaque: não são dados reais, por isso o título diz que é um exemplo.
const PROPOSTAS_EXEMPLO = [
  { iniciais: 'ME', nome: 'Maria Encanamentos', detalhe: '★ 4,9 · em 2 dias', valor: 'R$ 180', menorPreco: true },
  { iniciais: 'CH', nome: 'Carlos Hidráulica', detalhe: '★ 4,7 · amanhã', valor: 'R$ 210', menorPreco: false },
  { iniciais: 'PR', nome: 'Pedro Reparos', detalhe: '★ 4,8 · hoje', valor: 'R$ 240', menorPreco: false },
];

const CONTAINER: React.CSSProperties = { maxWidth: '1200px', margin: '0 auto', padding: '0 1.5rem', width: '100%', boxSizing: 'border-box' };

export default function HomeVisitante() {
  const router = useRouter();
  const [pedido, setPedido] = useState('');
  const [oportunidades, setOportunidades] = useState<OportunidadeResumo[]>([]);
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState(false);

  useEffect(() => {
    api
      .get('/prestador/oportunidades', { params: { ordenacao: 'recentes' } })
      .then((response) => setOportunidades((response.data.dados || []).slice(0, 6)))
      .catch(() => setErro(true))
      .finally(() => setCarregando(false));
  }, []);

  function pedirPropostas(e?: React.FormEvent, categoria = '') {
    e?.preventDefault();
    router.push(destinoNovoPedido({ titulo: pedido.trim(), categoria }));
  }

  return (
    <>
      {/* ── DESTAQUE (cliente) ─────────────────── */}
      <section style={{ background: 'var(--bg-highlight)', borderBottom: '1px solid var(--card-border)' }}>
        <div style={{ ...CONTAINER, paddingTop: '4rem', paddingBottom: '4rem', display: 'flex', flexWrap: 'wrap', gap: '3rem', alignItems: 'center' }}>
          <div style={{ flex: '1 1 460px', minWidth: 0, display: 'flex', flexDirection: 'column', gap: '1.4rem' }}>
            <span style={{ ...estiloChip({ bg: 'var(--sky-bg)', fg: 'var(--brand-sky)' }), alignSelf: 'flex-start', fontSize: '0.8rem', padding: '0.35rem 0.8rem' }}>
              O elo entre quem precisa e quem faz
            </span>
            <h1 style={{ fontSize: 'clamp(2rem, 5vw, 3rem)', lineHeight: 1.08, fontWeight: 800, letterSpacing: '-0.035em', maxWidth: '560px' }}>
              Receba propostas de prestadores perto de você.
            </h1>
            <p style={{ fontSize: '1.1rem', lineHeight: 1.6, color: 'var(--text-secondary)', maxWidth: '540px' }}>
              Descreva o serviço, compare preço, prazo e avaliações, converse pelo chat e contrate quem fizer mais sentido.
            </p>
            <form onSubmit={pedirPropostas} style={{ display: 'flex', gap: '0.6rem', flexWrap: 'wrap' }}>
              <label htmlFor="pedido-visitante" className="sr-only">O que você precisa?</label>
              <input
                id="pedido-visitante" value={pedido} onChange={(e) => setPedido(e.target.value)}
                placeholder="Ex.: trocar o sifão do banheiro" maxLength={120}
                style={{
                  flex: '1 1 260px', minWidth: 0, height: '52px', padding: '0 1rem', borderRadius: '12px',
                  border: '1px solid var(--card-border)', background: 'var(--card-bg)', color: 'var(--text-primary)', fontSize: '1rem',
                }}
              />
              <button type="submit" style={{ ...estiloBotaoPrimario, height: '52px', padding: '0 1.5rem', fontSize: '1rem' }}>
                Pedir propostas
              </button>
            </form>
            <p style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.9rem', color: 'var(--text-secondary)' }}>
              <Lock size={16} color="var(--brand-sky)" aria-hidden="true" style={{ flexShrink: 0 }} />
              Pagamento com garantia: o prestador só recebe quando você confirma o serviço concluído.
            </p>
            <div role="group" aria-label="Pedir por categoria" style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
              {CATEGORIAS_ATALHO.map((categoria) => (
                <button
                  key={categoria} type="button" onClick={() => pedirPropostas(undefined, categoria)}
                  style={{
                    minHeight: '36px', padding: '0 0.9rem', borderRadius: '999px', border: '1px solid var(--card-border)',
                    background: 'transparent', color: 'var(--text-primary)', fontSize: '0.82rem', fontWeight: 500, cursor: 'pointer',
                  }}
                >
                  {categoria}
                </button>
              ))}
            </div>
          </div>

          <div style={{ ...estiloCard, flex: '1 1 380px', minWidth: 0, borderRadius: '20px', padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1rem', boxShadow: 'var(--shadow-card)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '0.75rem', flexWrap: 'wrap' }}>
              <span style={{ fontSize: '0.72rem', fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase', color: 'var(--text-secondary)' }}>
                Exemplo: assim chegam as propostas
              </span>
              <span style={estiloChip({ bg: 'var(--sky-bg)', fg: 'var(--brand-sky)' })}>3 propostas</span>
            </div>
            <strong style={{ fontSize: '1.2rem', lineHeight: 1.3 }}>Troca de sifão e conserto de vazamento no banheiro</strong>
            <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
              {PROPOSTAS_EXEMPLO.map((p) => (
                <li key={p.nome} style={{
                  display: 'flex', alignItems: 'center', gap: '0.75rem', padding: '0.75rem', borderRadius: '12px',
                  border: p.menorPreco ? '2px solid var(--accent-indigo)' : '1px solid var(--card-border)',
                }}>
                  <span aria-hidden="true" style={{ width: '40px', height: '40px', borderRadius: '50%', background: 'var(--sky-bg)', color: 'var(--brand-sky)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.85rem', fontWeight: 700, flexShrink: 0 }}>
                    {p.iniciais}
                  </span>
                  <span style={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column', gap: '2px' }}>
                    <span style={{ fontSize: '0.9rem', fontWeight: 600 }}>{p.nome}</span>
                    <span style={{ fontSize: '0.78rem', color: 'var(--text-secondary)' }}>{p.detalhe}</span>
                  </span>
                  <span style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '4px' }}>
                    {p.menorPreco && <span style={estiloChip({ bg: 'var(--primary-color)', fg: 'var(--on-primary)' })}>Menor preço</span>}
                    <strong style={{ fontSize: '1rem' }}>{p.valor}</strong>
                  </span>
                </li>
              ))}
            </ul>
            <button type="button" onClick={() => pedirPropostas()} style={{ ...estiloBotaoPrimario, height: '48px' }}>
              Publicar meu pedido <ArrowRight size={18} aria-hidden="true" />
            </button>
          </div>
        </div>
      </section>

      {/* ── COMO FUNCIONA ─────────────────────── */}
      <section id="como-funciona" style={{ ...CONTAINER, paddingTop: '4.5rem', paddingBottom: '4rem', display: 'flex', flexDirection: 'column', gap: '2rem', scrollMarginTop: '1rem' }}>
        <div>
          <h2 style={{ fontSize: '1.9rem', fontWeight: 800, letterSpacing: '-0.02em', marginBottom: '0.4rem' }}>Como funciona</h2>
          <p style={{ color: 'var(--text-secondary)' }}>Do pedido à avaliação, tudo acontece na plataforma.</p>
        </div>
        <ol style={{ listStyle: 'none', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1.1rem' }}>
          {PASSOS.map((passo, i) => (
            <li key={passo.titulo} style={{ ...estiloCard, padding: '1.4rem', display: 'flex', flexDirection: 'column', gap: '0.7rem' }}>
              <span aria-hidden="true" style={{ width: '44px', height: '44px', borderRadius: '12px', background: 'var(--sky-bg)', color: 'var(--brand-sky)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                {passo.icone}
              </span>
              <span style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-secondary)' }}>Passo {i + 1}</span>
              <strong style={{ fontSize: '1.08rem' }}>{passo.titulo}</strong>
              <p style={{ fontSize: '0.88rem', lineHeight: 1.55, color: 'var(--text-secondary)' }}>{passo.texto}</p>
            </li>
          ))}
        </ol>
      </section>

      {/* ── PARA PRESTADORES ──────────────────── */}
      <section id="prestadores" style={{ ...CONTAINER, paddingBottom: '4.5rem', scrollMarginTop: '1rem' }}>
        <div style={{ ...estiloCard, borderRadius: '24px', padding: 'clamp(1.25rem, 4vw, 2.5rem)', display: 'flex', flexDirection: 'column', gap: '2rem' }}>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '1.5rem', alignItems: 'flex-end', justifyContent: 'space-between' }}>
            <div style={{ flex: '1 1 420px', minWidth: 0, display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
              <span style={{ fontSize: '0.8rem', fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--link-color)' }}>Para prestadores</span>
              <h2 style={{ fontSize: '1.9rem', fontWeight: 800, letterSpacing: '-0.02em' }}>Encontre clientes perto de você</h2>
              <p style={{ lineHeight: 1.55, color: 'var(--text-secondary)' }}>
                Monte seu perfil, veja os pedidos abertos na sua região e envie propostas. Você recebe com garantia ao concluir o serviço.
              </p>
            </div>
            <div style={{ display: 'flex', gap: '0.6rem', flexWrap: 'wrap' }}>
              <Link href="/oportunidades" style={estiloBotaoSecundario}>Ver todas as oportunidades</Link>
              <Link href="/register-prestador" style={estiloBotaoPrimario}>Quero ser prestador</Link>
            </div>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <h3 style={{ fontSize: '1rem', fontWeight: 700 }}>Pedidos abertos agora</h3>
            {carregando && <p role="status" style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>Carregando pedidos…</p>}
            {!carregando && erro && <p role="alert" style={{ color: 'var(--danger-text)', fontSize: '0.9rem' }}>Não foi possível carregar os pedidos abertos agora.</p>}
            {!carregando && !erro && oportunidades.length === 0 && (
              <p style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
                <Inbox size={18} aria-hidden="true" /> Nenhum pedido aberto no momento.
              </p>
            )}
            {oportunidades.length > 0 && (
              <ul style={{ listStyle: 'none', display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(min(100%, 280px), 1fr))', gap: '1rem' }}>
                {oportunidades.map((o) => (
                  <li key={o.id}>
                    <CardOportunidade oportunidade={o} />
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      </section>
    </>
  );
}

export function CardOportunidade({ oportunidade: o, comChamada = false }: { oportunidade: OportunidadeResumo; comChamada?: boolean }) {
  const status = STATUS_SOLICITACAO[o.status] ?? STATUS_SOLICITACAO.ABERTA;
  return (
    <Link href={`/oportunidades/${o.id}`} style={{
      display: 'flex', flexDirection: 'column', gap: '0.7rem', height: '100%', boxSizing: 'border-box',
      padding: '1.2rem', borderRadius: '16px', border: '1px solid var(--card-border)', background: 'var(--bg-color)',
      color: 'var(--text-primary)', textDecoration: 'none',
    }}>
      <span style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap' }}>
        <span style={{ display: 'flex', gap: '0.4rem', flexWrap: 'wrap' }}>
          <span style={estiloChip(status)}>{status.label}</span>
          {o.categoria && <span style={estiloChip({ bg: 'var(--sky-bg)', fg: 'var(--brand-sky)' })}>{o.categoria}</span>}
        </span>
        <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>{formatarRelativo(o.created_at)}</span>
      </span>
      <strong style={{ fontSize: '1rem', lineHeight: 1.35, overflowWrap: 'anywhere' }}>{o.titulo}</strong>
      <span style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', fontSize: '0.82rem', color: 'var(--text-secondary)' }}>
        <MapPin size={14} aria-hidden="true" /> {localDaOportunidade(o)}
      </span>
      <span style={{ marginTop: 'auto', display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '0.5rem', paddingTop: '0.7rem', borderTop: '1px solid var(--card-border)' }}>
        {comChamada
          ? <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.3rem', fontSize: '0.88rem', fontWeight: 700, color: 'var(--link-color)' }}>Enviar proposta <ArrowRight size={15} aria-hidden="true" /></span>
          : <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>Orçamento do cliente</span>}
        <strong style={{ fontSize: '0.95rem' }}>{formatarMoeda(o.orcamento_cliente)}</strong>
      </span>
    </Link>
  );
}
