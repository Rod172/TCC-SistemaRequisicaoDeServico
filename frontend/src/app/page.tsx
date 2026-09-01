'use client';

/**
 * @file page.tsx
 * @description Página inicial da plataforma ServiçoFácil com design premium e responsivo.
 * 
 * BIBLIOTECAS UTILIZADAS:
 * 1. Lucide React (^0.383.0): Ícones vetoriais em React/TypeScript.
 *    Doc Oficial: https://lucide.dev/
 * 2. Next.js (^14.2.3): Framework React para aplicações Web.
 *    Doc Oficial: https://nextjs.org/docs
 */

import { useEffect, useState } from 'react';
import Link from 'next/link';
import {
  Activity, CheckCircle2, Server, Sparkles, Layers,
  UserPlus, Briefcase, LogIn, ArrowRight, Star,
  Shield, Zap, Clock, UserCircle2, LogOut, ClipboardList
} from 'lucide-react';
import api from '@/services/api';

interface HealthStatus {
  status: string;
  service: string;
  version: string;
  environment: string;
}

export default function Home() {
  const [apiStatus, setApiStatus] = useState<'checking' | 'online' | 'offline'>('checking');
  const [healthData, setHealthData] = useState<HealthStatus | null>(null);
  const [usuarioLogado, setUsuarioLogado] = useState<{ nome: string; tipo_perfil?: string } | null>(null);

  useEffect(() => {
    async function checkBackendHealth() {
      try {
        const response = await api.get<HealthStatus>('/health');
        setHealthData(response.data);
        setApiStatus('online');
      } catch {
        setApiStatus('offline');
      }
    }
    checkBackendHealth();

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

  return (
    <main style={{ maxWidth: '960px', margin: '0 auto', padding: '3rem 1.5rem 5rem' }}>

      {/* ── BARRA DE SESSÃO ─────────────────────── */}
      {usuarioLogado && (
        <div style={{
          display: 'flex', alignItems: 'center', justifyContent: 'flex-end',
          gap: '0.75rem', marginBottom: '1.5rem',
        }}>
          <span style={{ color: '#94a3b8', fontSize: '0.9rem' }}>
            Olá, <strong style={{ color: '#fff' }}>{usuarioLogado.nome}</strong>
          </span>
          <Link href="/perfil" style={{
            display: 'inline-flex', alignItems: 'center', gap: '0.4rem',
            background: 'rgba(139,92,246,0.15)', color: '#a78bfa',
            border: '1px solid #8b5cf6', borderRadius: '8px',
            padding: '0.4rem 0.85rem', fontSize: '0.85rem', fontWeight: 600,
          }}>
            <UserCircle2 size={15} /> Meu Perfil
          </Link>
          <button onClick={handleLogout} style={{
            display: 'inline-flex', alignItems: 'center', gap: '0.4rem',
            background: 'transparent', border: '1px solid #334155', color: '#94a3b8',
            borderRadius: '8px', padding: '0.4rem 0.85rem', fontSize: '0.85rem', cursor: 'pointer',
          }}>
            <LogOut size={15} /> Sair
          </button>
        </div>
      )}

      {/* ── HERO ─────────────────────────────── */}
      <header style={{ textAlign: 'center', marginBottom: '3.5rem' }}>
        <div style={{
          display: 'inline-flex', alignItems: 'center', gap: '0.5rem',
          padding: '0.4rem 1rem',
          background: 'rgba(59,130,246,0.12)',
          border: '1px solid rgba(59,130,246,0.35)',
          borderRadius: '20px', color: '#60a5fa',
          fontSize: '0.8rem', fontWeight: 600,
          letterSpacing: '0.05em', textTransform: 'uppercase',
          marginBottom: '1.25rem'
        }}>
          <Sparkles size={14} />
          TCC · Ciência da Computação · UNIP
        </div>

        <h1 style={{
          fontSize: 'clamp(2rem, 5vw, 3rem)',
          fontWeight: 800, lineHeight: 1.15,
          background: 'linear-gradient(135deg, #fff 0%, #94a3b8 100%)',
          WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
          backgroundClip: 'text',
          marginBottom: '1rem'
        }}>
          ServiçoFácil
        </h1>

        <p style={{
          color: '#94a3b8', fontSize: '1.1rem', maxWidth: '560px',
          margin: '0 auto 2rem', lineHeight: 1.6
        }}>
          A plataforma que conecta quem precisa de serviços a profissionais qualificados — com orçamentos, chat e avaliações em tempo real.
        </p>

        {/* Badges de diferenciais */}
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.75rem', justifyContent: 'center' }}>
          {[
            { icon: <Shield size={14} />, text: 'Seguro & LGPD' },
            { icon: <Zap size={14} />, text: 'Orçamentos rápidos' },
            { icon: <Star size={14} />, text: 'Sistema de reputação' },
            { icon: <Clock size={14} />, text: 'Chat em tempo real' },
          ].map(({ icon, text }) => (
            <span key={text} style={{
              display: 'inline-flex', alignItems: 'center', gap: '6px',
              padding: '0.35rem 0.85rem',
              background: 'rgba(30,41,59,0.8)',
              border: '1px solid #334155',
              borderRadius: '20px', color: '#94a3b8', fontSize: '0.8rem'
            }}>
              {icon}{text}
            </span>
          ))}
        </div>
      </header>

      {/* ── CARDS DE AÇÃO ──────────────────────── */}
      {usuarioLogado ? (
        <section style={{
          display: 'grid',
          gridTemplateColumns: usuarioLogado.tipo_perfil === 'SOLICITANTE' ? 'repeat(2, 1fr)' : '1fr',
          gap: '1.25rem',
          marginBottom: '3rem',
        }}>
          {usuarioLogado.tipo_perfil === 'SOLICITANTE' && (
            <ActionCard
              icon={<ClipboardList size={28} />}
              iconBg="rgba(59,130,246,0.15)"
              iconColor="#60a5fa"
              borderColor="#3b82f6"
              title="Minhas Solicitações"
              description="Acompanhe suas solicitações, compare propostas e aceite a melhor oferta."
              href="/minhas-solicitacoes"
              btnColor="#3b82f6"
              btnLabel="Ver minhas solicitações"
            />
          )}

          <ActionCard
            icon={<UserCircle2 size={28} />}
            iconBg="rgba(139,92,246,0.15)"
            iconColor="#a78bfa"
            borderColor="#8b5cf6"
            title="Meu Perfil"
            description="Edite seus dados, foto de perfil, senha e preferências de privacidade (LGPD)."
            href="/perfil"
            btnColor="#8b5cf6"
            btnLabel="Gerenciar minha conta"
          />
        </section>
      ) : (
        <section style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(3, 1fr)',
          gap: '1.25rem',
          marginBottom: '3rem'
        }}>

          {/* Solicitante */}
          <ActionCard
            icon={<UserPlus size={28} />}
            iconBg="rgba(59,130,246,0.15)"
            iconColor="#60a5fa"
            borderColor="#3b82f6"
            title="Sou Cliente"
            description="Publique sua necessidade e receba orçamentos de profissionais próximos a você."
            href="/register-solicitante"
            btnColor="#3b82f6"
            btnLabel="Criar conta gratuita"
          />

          {/* Prestador */}
          <ActionCard
            icon={<Briefcase size={28} />}
            iconBg="rgba(16,185,129,0.15)"
            iconColor="#10b981"
            borderColor="#10b981"
            title="Sou Profissional"
            description="Cadastre seu perfil, defina suas especialidades e conquiste novos clientes."
            href="/register-prestador"
            btnColor="#10b981"
            btnLabel="Criar perfil profissional"
          />

          {/* Login */}
          <ActionCard
            icon={<LogIn size={28} />}
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

      {/* ── STATUS DA API ──────────────────────── */}
      <section style={{
        background: 'rgba(15,23,42,0.7)',
        border: '1px solid #1e293b',
        borderRadius: '16px',
        padding: '1.5rem 2rem',
        marginBottom: '1.5rem',
        backdropFilter: 'blur(8px)'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <Server size={20} color="#60a5fa" />
            <span style={{ fontWeight: 600, fontSize: '0.95rem' }}>Status da API Backend</span>
          </div>

          <div style={{
            display: 'flex', alignItems: 'center', gap: '0.5rem',
            padding: '0.35rem 0.9rem', borderRadius: '20px',
            background: apiStatus === 'online' ? 'rgba(16,185,129,0.15)' : apiStatus === 'offline' ? 'rgba(239,68,68,0.15)' : 'rgba(148,163,184,0.15)',
            color: apiStatus === 'online' ? '#34d399' : apiStatus === 'offline' ? '#f87171' : '#94a3b8',
            fontWeight: 600, fontSize: '0.8rem'
          }}>
            <span style={{
              width: '8px', height: '8px', borderRadius: '50%',
              background: apiStatus === 'online' ? '#34d399' : apiStatus === 'offline' ? '#f87171' : '#94a3b8',
              boxShadow: apiStatus === 'online' ? '0 0 6px #34d399' : 'none'
            }} />
            <Activity size={14} />
            {apiStatus === 'online' ? 'ONLINE' : apiStatus === 'offline' ? 'OFFLINE' : 'VERIFICANDO...'}
          </div>
        </div>

        {apiStatus === 'online' && healthData && (
          <div style={{
            marginTop: '1rem', paddingTop: '1rem',
            borderTop: '1px solid #1e293b',
            display: 'flex', gap: '2rem', flexWrap: 'wrap'
          }}>
            {[
              { label: 'SERVIÇO', value: healthData.service },
              { label: 'VERSÃO', value: healthData.version },
              { label: 'AMBIENTE', value: healthData.environment.toUpperCase() },
            ].map(({ label, value }) => (
              <div key={label}>
                <div style={{ fontSize: '0.7rem', color: '#64748b', letterSpacing: '0.08em', marginBottom: '2px' }}>{label}</div>
                <div style={{ fontWeight: 600, fontSize: '0.9rem', color: '#e2e8f0' }}>{value}</div>
              </div>
            ))}
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginLeft: 'auto', color: '#34d399', fontSize: '0.85rem' }}>
              <CheckCircle2 size={16} /> Conexão com MySQL estabelecida
            </div>
          </div>
        )}

        {apiStatus === 'offline' && (
          <p style={{ color: '#f87171', fontSize: '0.875rem', marginTop: '0.75rem' }}>
            ⚠️ Não foi possível conectar à API em <code style={{ background: '#1e293b', padding: '2px 6px', borderRadius: '4px' }}>http://localhost:3001</code>. Verifique se o backend está rodando.
          </p>
        )}
      </section>

      {/* ── TECH STACK ──────────────────────────── */}
      <section style={{
        background: 'rgba(15,23,42,0.7)',
        border: '1px solid #1e293b',
        borderRadius: '16px',
        padding: '1.5rem 2rem',
        backdropFilter: 'blur(8px)'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1.25rem' }}>
          <Layers size={20} color="#10b981" />
          <span style={{ fontWeight: 600, fontSize: '0.95rem' }}>Stack Tecnológica</span>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '0.75rem' }}>
          {[
            { name: 'Next.js 14', sub: 'App Router + React 18', color: '#60a5fa' },
            { name: 'TypeScript 5', sub: 'Tipagem ponta a ponta', color: '#10b981' },
            { name: 'Node.js + Express', sub: 'API REST & Middlewares', color: '#f59e0b' },
            { name: 'Sequelize + MySQL', sub: 'ORM & Banco Relacional', color: '#a78bfa' },
            { name: 'JWT + Bcrypt', sub: 'Autenticação segura', color: '#ec4899' },
            { name: 'Docker Compose', sub: 'Conteinerização', color: '#38bdf8' },
          ].map(({ name, sub, color }) => (
            <div key={name} style={{
              background: '#0f172a', border: '1px solid #1e293b',
              borderRadius: '10px', padding: '0.85rem 1rem'
            }}>
              <div style={{ fontWeight: 700, color, fontSize: '0.9rem', marginBottom: '2px' }}>{name}</div>
              <div style={{ color: '#64748b', fontSize: '0.78rem' }}>{sub}</div>
            </div>
          ))}
        </div>
      </section>

    </main>
  );
}

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

