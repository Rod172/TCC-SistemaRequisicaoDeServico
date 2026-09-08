'use client';

/**
 * @file status/page.tsx
 * @description Página de status técnico do sistema: saúde da API backend e stack tecnológica
 * utilizada, para fins de demonstração acadêmica (movida para fora da home em 08/09/2026).
 *
 * BIBLIOTECAS UTILIZADAS:
 * 1. Lucide React (^0.383.0): Ícones vetoriais em React/TypeScript.
 *    Doc Oficial: https://lucide.dev/
 * 2. Next.js (^14.2.3): Framework React para aplicações Web.
 *    Doc Oficial: https://nextjs.org/docs
 * 3. Axios (^1.7.2): Requisições HTTP REST à API backend.
 *    Doc Oficial: https://axios-http.com/docs/intro
 */

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { ArrowLeft, Activity, CheckCircle2, Server, Layers } from 'lucide-react';
import api from '@/services/api';

interface HealthStatus {
  status: string;
  service: string;
  version: string;
  environment: string;
}

export default function StatusPage() {
  const [apiStatus, setApiStatus] = useState<'checking' | 'online' | 'offline'>('checking');
  const [healthData, setHealthData] = useState<HealthStatus | null>(null);

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
  }, []);

  return (
    <main style={{ maxWidth: '960px', margin: '2rem auto', padding: '0 1.5rem 4rem' }}>
      <Link href="/" style={{
        display: 'inline-flex', alignItems: 'center', gap: '0.5rem',
        marginBottom: '1.5rem', color: 'var(--text-secondary)', fontSize: '0.9rem',
      }}>
        <ArrowLeft size={16} />
        Voltar para a página inicial
      </Link>

      <header style={{ marginBottom: '1.75rem' }}>
        <h1 style={{ fontSize: '1.5rem', fontWeight: 700, marginBottom: '0.4rem' }}>Status do Sistema</h1>
        <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
          Diagnóstico técnico da API e da stack utilizada no projeto, para fins de demonstração.
        </p>
      </header>

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
