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
} from 'lucide-react';

export default function Home() {
  const router = useRouter();
  const [usuarioLogado, setUsuarioLogado] = useState<{ nome: string; tipo_perfil?: string } | null>(null);
  const [busca, setBusca] = useState('');

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
          display: 'flex', alignItems: 'center', gap: '1.25rem',
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

          {/* Busca pública — dá pra ver oportunidades abertas sem estar logado, como um classificado. */}
          <form onSubmit={handleBuscar} style={{ flex: 1, maxWidth: '520px', position: 'relative' }}>
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

          <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginLeft: 'auto', flexShrink: 0 }}>
            {usuarioLogado ? (
              <>
                {isAdmin && (
                  <Link href="/minhas-solicitacoes" style={estiloLinkNav}>Solicitações</Link>
                )}
                {(usuarioLogado.tipo_perfil === 'PRESTADOR' || isAdmin) && (
                  <Link href="/oportunidades" style={estiloLinkNav}>Oportunidades</Link>
                )}
                {isAdmin && (
                  <Link href="/admin" style={estiloLinkNav}>Painel Admin</Link>
                )}
                <Link href="/perfil" title="Meu Perfil" style={{ color: '#94a3b8', display: 'flex' }}>
                  <UserCircle2 size={20} />
                </Link>
                <button onClick={handleLogout} title="Sair" style={{
                  background: 'transparent', border: 'none', color: '#94a3b8', cursor: 'pointer', display: 'flex',
                }}>
                  <LogOut size={19} />
                </button>
                {(isSolicitante || isAdmin) && (
                  <Link href="/nova-solicitacao" style={{
                    display: 'inline-flex', alignItems: 'center', gap: '0.4rem',
                    background: '#3b82f6', color: '#fff', borderRadius: '8px',
                    padding: '0.5rem 1rem', fontSize: '0.85rem', fontWeight: 700, textDecoration: 'none',
                  }}>
                    <PlusCircle size={15} /> Nova Solicitação
                  </Link>
                )}
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
          <section style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(3, 1fr)',
            gap: '1.25rem',
          }}>
            <ActionCard
              icon={<UserPlus size={26} />}
              iconBg="rgba(59,130,246,0.15)"
              iconColor="#60a5fa"
              borderColor="#3b82f6"
              title="Sou Cliente"
              description="Publique sua necessidade e receba orçamentos de profissionais próximos a você."
              href="/register-solicitante"
              btnColor="#3b82f6"
              btnLabel="Criar conta gratuita"
            />

            <ActionCard
              icon={<Briefcase size={26} />}
              iconBg="rgba(16,185,129,0.15)"
              iconColor="#10b981"
              borderColor="#10b981"
              title="Sou Profissional"
              description="Cadastre seu perfil, defina suas especialidades e conquiste novos clientes."
              href="/register-prestador"
              btnColor="#10b981"
              btnLabel="Criar perfil profissional"
            />

            <ActionCard
              icon={<LogIn size={26} />}
              iconBg="rgba(236,72,153,0.15)"
              iconColor="#ec4899"
              borderColor="#ec4899"
              title="Já tenho conta"
              description="Acesse sua conta para gerenciar solicitações, propostas e mensagens."
              href="/login"
              btnColor="#ec4899"
              btnLabel="Entrar na conta"
            />
          </section>
        )}
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
        gap: '1rem',
        textDecoration: 'none',
        background: hovered
          ? `linear-gradient(135deg, rgba(30,41,59,0.98) 0%, rgba(15,23,42,1) 100%)`
          : 'linear-gradient(135deg, rgba(30,41,59,0.8) 0%, rgba(15,23,42,0.8) 100%)',
        border: `1px solid ${hovered ? borderColor : '#1e293b'}`,
        borderRadius: '16px',
        padding: '1.75rem 1.5rem',
        transition: 'border-color 0.2s, box-shadow 0.2s, transform 0.2s',
        boxShadow: hovered ? `0 0 28px ${borderColor}35` : 'none',
        transform: hovered ? 'translateY(-3px)' : 'none',
        cursor: 'pointer',
      }}
    >
      <div style={{
        display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
        width: '52px', height: '52px', borderRadius: '14px',
        background: iconBg, color: iconColor,
        transition: 'transform 0.2s',
        transform: hovered ? 'scale(1.1)' : 'scale(1)'
      }}>
        {icon}
      </div>

      <div style={{ flex: 1 }}>
        <h2 style={{ fontSize: '1.1rem', fontWeight: 700, color: '#f1f5f9', margin: '0 0 6px' }}>{title}</h2>
        <p style={{ fontSize: '0.875rem', color: '#64748b', lineHeight: 1.5, margin: 0 }}>{description}</p>
      </div>

      <div style={{
        display: 'inline-flex', alignItems: 'center', gap: '6px',
        padding: '0.7rem 1rem',
        background: btnColor,
        color: '#fff',
        borderRadius: '10px',
        fontWeight: 600,
        fontSize: '0.875rem',
        transition: 'opacity 0.2s, transform 0.2s',
        opacity: hovered ? 1 : 0.88,
        transform: hovered ? 'scale(1.02)' : 'scale(1)',
      }}>
        {btnLabel} <ArrowRight size={15} />
      </div>
    </Link>
  );
}
