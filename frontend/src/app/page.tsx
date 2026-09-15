'use client';

/**
 * @file page.tsx
 * @description Página inicial da plataforma ServiçoFácil — ponto de entrada do sistema, com barra de
 * navegação (busca embutida, ao estilo OLX) e atalhos de acordo com o perfil autenticado. Status
 * técnico da API fica em /status.
 *
 * BIBLIOTECAS UTILIZADAS:
 * 1. Lucide React (^0.383.0): Ícones vetoriais em React/TypeScript.
 *    Doc Oficial: https://lucide.dev/
 * 2. Next.js (^14.2.3): Framework React para aplicações Web.
 *    Doc Oficial: https://nextjs.org/docs
 */

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  UserPlus, Briefcase, LogIn, ArrowRight,
  UserCircle2, LogOut, ClipboardList, ShieldCheck, Activity, PlusCircle, Search,
  MapPin, ChevronRight, Inbox, Settings,
} from 'lucide-react';
import api from '@/services/api';
import NotificationBell from '@/components/NotificationBell';

interface OportunidadeResumo {
  id: string;
  titulo: string;
  categoria: string | null;
  cidade: string | null;
  bairro: string | null;
  orcamento_cliente: string | null;
  created_at: string;
}

function formatarOrcamento(valor: string | null) {
  if (valor === null) return 'A combinar';
  return Number(valor).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
}

export default function Home() {
  const router = useRouter();
  const [usuarioLogado, setUsuarioLogado] = useState<{ nome: string; tipo_perfil?: string } | null>(null);
  const [busca, setBusca] = useState('');
  const [oportunidadesRecentes, setOportunidadesRecentes] = useState<OportunidadeResumo[]>([]);
  const [carregandoOportunidades, setCarregandoOportunidades] = useState(true);

  useEffect(() => {
    const userRaw = localStorage.getItem('@ServicoFacil:user');
    if (userRaw) {
      try {
        setUsuarioLogado(JSON.parse(userRaw));
      } catch {
        setUsuarioLogado(null);
      }
    }
  }, []);

  // Prévia pública do feed (como uma vitrine de classificados) — visível mesmo sem login.
  useEffect(() => {
    api
      .get('/prestador/oportunidades', { params: { ordenacao: 'recentes' } })
      .then((response) => setOportunidadesRecentes((response.data.dados || []).slice(0, 6)))
      .catch(() => setOportunidadesRecentes([]))
      .finally(() => setCarregandoOportunidades(false));
  }, []);

  function handleLogout() {
    localStorage.removeItem('@ServicoFacil:token');
    localStorage.removeItem('@ServicoFacil:user');
    setUsuarioLogado(null);
  }

  const isAdmin = usuarioLogado?.tipo_perfil === 'ADMIN';
  const isSolicitante = usuarioLogado?.tipo_perfil === 'SOLICITANTE';

  // A busca da barra de navegação leva pra listagem certa de cada perfil: o solicitante busca nas
  // próprias solicitações, o prestador busca no feed de oportunidades. O admin, que enxerga tudo,
  // busca no feed de oportunidades (é a listagem com busca textual mais abrangente da plataforma).
  const destinoBusca = isSolicitante ? '/minhas-solicitacoes' : '/oportunidades';
  const placeholderBusca = isSolicitante ? 'Buscar nas minhas solicitações...' : 'Buscar oportunidades abertas...';

  function handleBuscar(e: React.FormEvent) {
    e.preventDefault();
    const query = busca.trim();
    router.push(query ? `${destinoBusca}?busca=${encodeURIComponent(query)}` : destinoBusca);
  }

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      {/* ── BARRA DE NAVEGAÇÃO ─────────────────── */}
      <header style={{
        borderBottom: '1px solid #1e293b',
        background: 'rgba(15,23,42,0.6)',
        backdropFilter: 'blur(8px)',
      }}>
        <div style={{
          maxWidth: '1280px', margin: '0 auto', padding: '0.85rem 1.5rem',
          display: 'flex', alignItems: 'center', gap: '1rem', flexWrap: 'wrap', rowGap: '0.6rem',
        }}>
          <Link href="/" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', textDecoration: 'none', flexShrink: 0 }}>
            <div style={{
              width: '32px', height: '32px', borderRadius: '8px',
              background: 'linear-gradient(135deg, #3b82f6, #8b5cf6)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              color: '#fff', fontWeight: 800, fontSize: '0.95rem',
            }}>
              S
            </div>
            <span style={{ fontWeight: 700, fontSize: '1.05rem', color: '#f1f5f9' }}>ServiçoFácil</span>
          </Link>

          {/* Busca pública — dá pra ver oportunidades abertas sem estar logado, como um classificado.
              `flex: 1 1 200px` deixa ela encolher/quebrar linha graciosamente em telas estreitas, em
              vez de forçar o header inteiro pra fora da largura da tela. */}
          <form onSubmit={handleBuscar} style={{ flex: '1 1 200px', maxWidth: '520px', minWidth: '160px', position: 'relative' }}>
            <Search size={16} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#64748b' }} />
            <input
              value={busca}
              onChange={(e) => setBusca(e.target.value)}
              placeholder={placeholderBusca}
              style={{
                width: '100%', padding: '0.55rem 0.75rem 0.55rem 2.2rem',
                background: '#0f172a', border: '1px solid #334155', borderRadius: '8px',
                color: '#fff', fontSize: '0.875rem',
              }}
            />
          </form>

          <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginLeft: 'auto', flexWrap: 'wrap', rowGap: '0.5rem' }}>
            {usuarioLogado ? (
              <>
                {/* Qualquer perfil logado pode publicar/ver suas próprias solicitações (US33 — o Prestador também pode contratar serviços). */}
                <Link href="/minhas-solicitacoes" style={estiloLinkNav}>Minhas Solicitações</Link>
                {(usuarioLogado.tipo_perfil === 'PRESTADOR' || isAdmin) && (
                  <>
                    <Link href="/oportunidades" style={estiloLinkNav}>Oportunidades</Link>
                    <Link href="/minhas-propostas" style={estiloLinkNav}>Minhas Propostas</Link>
                  </>
                )}
                {isAdmin && (
                  <Link href="/admin" style={estiloLinkNav}>Painel Admin</Link>
                )}
                <NotificationBell />
                <Link href="/configuracoes" title="Configurações de Notificação" style={{ color: '#94a3b8', display: 'flex' }}>
                  <Settings size={19} />
                </Link>
                <Link href="/perfil" title="Meu Perfil" style={{ color: '#94a3b8', display: 'flex' }}>
                  <UserCircle2 size={20} />
                </Link>
                <button onClick={handleLogout} title="Sair" style={{
                  background: 'transparent', border: 'none', color: '#94a3b8', cursor: 'pointer', display: 'flex',
                }}>
                  <LogOut size={19} />
                </button>
                <Link href="/nova-solicitacao" style={{
                  display: 'inline-flex', alignItems: 'center', gap: '0.4rem',
                  background: '#3b82f6', color: '#fff', borderRadius: '8px',
                  padding: '0.5rem 1rem', fontSize: '0.85rem', fontWeight: 700, textDecoration: 'none',
                }}>
                  <PlusCircle size={15} /> Nova Solicitação
                </Link>
              </>
            ) : (
              <>
                <Link href="/login" style={{ padding: '0.5rem 1rem', color: '#cbd5e1', fontSize: '0.875rem', fontWeight: 600, textDecoration: 'none' }}>
                  Entrar
                </Link>
                <Link href="/register-solicitante" style={{
                  padding: '0.5rem 1rem', background: '#3b82f6', color: '#fff',
                  borderRadius: '8px', fontSize: '0.875rem', fontWeight: 600, textDecoration: 'none',
                }}>
                  Criar conta
                </Link>
              </>
            )}
          </div>
        </div>
      </header>

      <main style={{ maxWidth: '1080px', margin: '0 auto', padding: '2.5rem 1.5rem 4rem', flex: 1, width: '100%' }}>
        {!usuarioLogado && (
          <div style={{ marginBottom: '2rem' }}>
            <h1 style={{ fontSize: '1.5rem', fontWeight: 700, marginBottom: '0.4rem' }}>Bem-vindo ao ServiçoFácil</h1>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.95rem' }}>
              Plataforma de intermediação de serviços sob demanda entre clientes e prestadores.
            </p>
          </div>
        )}

        {!usuarioLogado && (
          <section className="grid-3-cols" style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(3, 1fr)',
            gap: '0.85rem',
            marginBottom: '2.5rem',
          }}>
            <ActionCard
              icon={<UserPlus size={18} />}
              iconBg="rgba(59,130,246,0.15)"
              iconColor="#60a5fa"
              borderColor="#3b82f6"
              title="Sou Cliente"
              description="Publique sua necessidade e receba orçamentos de profissionais."
              href="/register-solicitante"
              btnColor="#3b82f6"
              btnLabel="Criar conta gratuita"
            />

            <ActionCard
              icon={<Briefcase size={18} />}
              iconBg="rgba(16,185,129,0.15)"
              iconColor="#10b981"
              borderColor="#10b981"
              title="Sou Profissional"
              description="Cadastre seu perfil e conquiste novos clientes."
              href="/register-prestador"
              btnColor="#10b981"
              btnLabel="Criar perfil profissional"
            />

            <ActionCard
              icon={<LogIn size={18} />}
              iconBg="rgba(236,72,153,0.15)"
              iconColor="#ec4899"
              borderColor="#ec4899"
              title="Já tenho conta"
              description="Acesse pra gerenciar solicitações e propostas."
              href="/login"
              btnColor="#ec4899"
              btnLabel="Entrar na conta"
            />
          </section>
        )}

        {/* Chamada grande e óbvia pra quem está logado e não sabe bem por onde começar (feedback de
            teste real: o botão "Nova Solicitação" só no canto do header passava despercebido). */}
        {usuarioLogado && (
          <Link href="/nova-solicitacao" style={{
            display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '1rem',
            background: 'linear-gradient(135deg, rgba(59,130,246,0.18), rgba(139,92,246,0.18))',
            border: '1px solid #3b82f6', borderRadius: 'var(--border-radius)',
            padding: '1.25rem 1.5rem', marginBottom: '2rem', textDecoration: 'none', color: 'inherit',
          }}>
            <div>
              <strong style={{ display: 'block', fontSize: '1.05rem', marginBottom: '0.25rem' }}>Precisa de um serviço?</strong>
              <span style={{ color: 'var(--text-secondary)', fontSize: '0.88rem' }}>
                Publique sua necessidade agora e receba propostas de profissionais.
              </span>
            </div>
            <span style={{
              display: 'inline-flex', alignItems: 'center', gap: '0.4rem', flexShrink: 0,
              background: '#3b82f6', color: '#fff', borderRadius: '8px',
              padding: '0.6rem 1.1rem', fontSize: '0.88rem', fontWeight: 700,
            }}>
              <PlusCircle size={16} /> Solicitar serviço
            </span>
          </Link>
        )}

        {/* ── Prévia pública do feed de oportunidades ─────────── */}
        <section>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: '1rem' }}>
            <h2 style={{ fontSize: '1.1rem', fontWeight: 700, margin: 0 }}>Solicitações recentes</h2>
            <Link href="/oportunidades" style={{ display: 'inline-flex', alignItems: 'center', gap: '3px', color: '#34d399', fontSize: '0.85rem', fontWeight: 600, textDecoration: 'none' }}>
              Ver todas <ChevronRight size={14} />
            </Link>
          </div>

          {carregandoOportunidades && (
            <div style={{ textAlign: 'center', color: 'var(--text-secondary)', padding: '2rem 0', fontSize: '0.9rem' }}>Carregando...</div>
          )}

          {!carregandoOportunidades && oportunidadesRecentes.length === 0 && (
            <div style={{
              textAlign: 'center', padding: '2rem 1rem', color: 'var(--text-secondary)',
              background: 'var(--card-bg)', border: '1px solid var(--card-border)', borderRadius: 'var(--border-radius)', fontSize: '0.9rem',
            }}>
              <Inbox size={26} style={{ marginBottom: '0.5rem', opacity: 0.6 }} />
              <p style={{ margin: 0 }}>Nenhuma solicitação aberta no momento.</p>
            </div>
          )}

          {!carregandoOportunidades && oportunidadesRecentes.length > 0 && (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: '0.85rem' }}>
              {oportunidadesRecentes.map((o) => (
                <Link key={o.id} href={`/oportunidades/${o.id}`} style={{
                  display: 'block', textDecoration: 'none', color: 'inherit',
                  background: 'var(--card-bg)', border: '1px solid var(--card-border)',
                  borderRadius: 'var(--border-radius)', padding: '1rem',
                }}>
                  <div style={{ display: 'flex', gap: '0.4rem', marginBottom: '0.5rem' }}>
                    {o.categoria && (
                      <span style={{ padding: '0.2rem 0.6rem', borderRadius: '20px', fontSize: '0.7rem', fontWeight: 600, background: '#1e293b', color: '#cbd5e1' }}>
                        {o.categoria}
                      </span>
                    )}
                  </div>
                  <h3 style={{
                    fontSize: '0.92rem', fontWeight: 700, margin: '0 0 0.5rem',
                    overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
                  }}>
                    {o.titulo}
                  </h3>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ display: 'inline-flex', alignItems: 'center', gap: '3px', color: '#94a3b8', fontSize: '0.78rem' }}>
                      <MapPin size={12} /> {o.bairro || o.cidade || 'Não informado'}
                    </span>
                    <strong style={{ fontSize: '0.85rem', color: '#34d399' }}>{formatarOrcamento(o.orcamento_cliente)}</strong>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </section>
      </main>

      {/* ── RODAPÉ ───────────────────────────── */}
      <footer style={{ borderTop: '1px solid #1e293b', padding: '1.25rem 1.5rem' }}>
        <div style={{
          maxWidth: '1080px', margin: '0 auto',
          display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '0.75rem',
        }}>
          <span style={{ color: '#64748b', fontSize: '0.8rem' }}>
            ServiçoFácil · TCC Ciência da Computação · UNIP
          </span>
          <Link href="/status" style={{
            display: 'inline-flex', alignItems: 'center', gap: '0.4rem',
            color: '#64748b', fontSize: '0.8rem', textDecoration: 'none',
          }}>
            <Activity size={13} /> Status do sistema
          </Link>
        </div>
      </footer>
    </div>
  );
}

const estiloLinkNav: React.CSSProperties = {
  color: '#cbd5e1', fontSize: '0.85rem', fontWeight: 600, textDecoration: 'none',
};

/* ── Componente de Card de Ação (card inteiro clicável) ──────────────── */
function ActionCard({
  icon, iconBg, iconColor, borderColor,
  title, description, href, btnColor, btnLabel
}: {
  icon: React.ReactNode;
  iconBg: string;
  iconColor: string;
  borderColor: string;
  title: string;
  description: string;
  href: string;
  btnColor: string;
  btnLabel: string;
}) {
  const [hovered, setHovered] = useState(false);

  return (
    <Link
      href={href}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        display: 'flex',
        flexDirection: 'column',
        gap: '0.6rem',
        textDecoration: 'none',
        background: hovered
          ? `linear-gradient(135deg, rgba(30,41,59,0.98) 0%, rgba(15,23,42,1) 100%)`
          : 'linear-gradient(135deg, rgba(30,41,59,0.8) 0%, rgba(15,23,42,0.8) 100%)',
        border: `1px solid ${hovered ? borderColor : '#1e293b'}`,
        borderRadius: '12px',
        padding: '1.1rem',
        transition: 'border-color 0.2s, box-shadow 0.2s, transform 0.2s',
        boxShadow: hovered ? `0 0 20px ${borderColor}35` : 'none',
        transform: hovered ? 'translateY(-2px)' : 'none',
        cursor: 'pointer',
      }}
    >
      <div style={{
        display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
        width: '34px', height: '34px', borderRadius: '10px',
        background: iconBg, color: iconColor,
        transition: 'transform 0.2s',
        transform: hovered ? 'scale(1.1)' : 'scale(1)'
      }}>
        {icon}
      </div>

      <div style={{ flex: 1 }}>
        <h2 style={{ fontSize: '0.95rem', fontWeight: 700, color: '#f1f5f9', margin: '0 0 4px' }}>{title}</h2>
        <p style={{ fontSize: '0.8rem', color: '#64748b', lineHeight: 1.4, margin: 0 }}>{description}</p>
      </div>

      <div style={{
        display: 'inline-flex', alignItems: 'center', gap: '5px',
        padding: '0.5rem 0.8rem',
        background: btnColor,
        color: '#fff',
        borderRadius: '8px',
        fontWeight: 600,
        fontSize: '0.8rem',
        transition: 'opacity 0.2s, transform 0.2s',
        opacity: hovered ? 1 : 0.88,
        transform: hovered ? 'scale(1.02)' : 'scale(1)',
      }}>
        {btnLabel} <ArrowRight size={13} />
      </div>
    </Link>
  );
}
