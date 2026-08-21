'use client';

/**
 * @file page.tsx
 * @description Página inicial da aplicação Next.js testando conectividade em tempo real com o backend Node.js.
 * 
 * BIBLIOTECAS UTILIZADAS:
 * 1. Lucide React (^0.383.0): Ícones vetoriais em React/TypeScript.
 *    Doc Oficial: https://lucide.dev/
 * 2. Next.js (^14.2.3): Framework React para aplicações Web.
 *    Doc Oficial: https://nextjs.org/docs
 */

import { useEffect, useState } from 'react';
import { Activity, CheckCircle2, ShieldCheck, Server, Sparkles, Layers } from 'lucide-react';
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

  useEffect(() => {
    async function checkBackendHealth() {
      try {
        const response = await api.get<HealthStatus>('/health');
        setHealthData(response.data);
        setApiStatus('online');
      } catch (error) {
        console.error('Erro ao conectar com o backend:', error);
        setApiStatus('offline');
      }
    }

    checkBackendHealth();
  }, []);

  return (
    <main style={{ maxWidth: '900px', margin: '0 auto', padding: '3rem 1.5rem' }}>
      <header style={{ textAlign: 'center', marginBottom: '3rem' }}>
        <div style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: '0.5rem',
          padding: '0.5rem 1rem',
          background: 'rgba(59, 130, 246, 0.1)',
          border: '1px solid rgba(59, 130, 246, 0.3)',
          borderRadius: '20px',
          color: '#60a5fa',
          fontSize: '0.875rem',
          marginBottom: '1rem'
        }}>
          <Sparkles size={16} />
          <span>TCC - Ciência da Computação (UNIP)</span>
        </div>

        <h1 style={{ fontSize: '2.5rem', fontWeight: 700, marginBottom: '0.5rem' }}>
          ServiçoFácil Platform
        </h1>
        <p style={{ color: 'var(--text-secondary)', fontSize: '1.1rem' }}>
          Plataforma de Gerenciamento de Requisições de Serviço (Next.js + TypeScript)
        </p>
      </header>

      <section style={{
        background: 'var(--card-bg)',
        border: '1px solid var(--card-border)',
        borderRadius: 'var(--border-radius)',
        padding: '2rem',
        marginBottom: '2rem'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.5rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <Server size={24} color="var(--primary-color)" />
            <h2 style={{ fontSize: '1.25rem', fontWeight: 600 }}>Status da API Backend (Node.js)</h2>
          </div>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
            padding: '0.4rem 0.8rem',
            borderRadius: '20px',
            background: apiStatus === 'online' ? 'rgba(16, 185, 129, 0.15)' : apiStatus === 'offline' ? 'rgba(239, 68, 68, 0.15)' : 'rgba(148, 163, 184, 0.15)',
            color: apiStatus === 'online' ? 'var(--accent-color)' : apiStatus === 'offline' ? 'var(--danger-color)' : 'var(--text-secondary)',
            fontWeight: 500,
            fontSize: '0.875rem'
          }}>
            <Activity size={16} />
            <span>{apiStatus === 'online' ? 'ONLINE' : apiStatus === 'offline' ? 'OFFLINE' : 'VERIFICANDO...'}</span>
          </div>
        </div>

        {apiStatus === 'online' && healthData ? (
          <div style={{ background: '#0f172a', padding: '1.25rem', borderRadius: '8px', border: '1px solid #334155' }}>
            <p style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem', color: 'var(--accent-color)' }}>
              <CheckCircle2 size={18} />
              <strong>Conexão efetuada com sucesso!</strong>
            </p>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '1rem', marginTop: '1rem' }}>
              <div>
                <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>SERVIÇO</span>
                <p style={{ fontWeight: 600 }}>{healthData.service}</p>
              </div>
              <div>
                <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>VERSÃO</span>
                <p style={{ fontWeight: 600 }}>{healthData.version}</p>
              </div>
              <div>
                <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>AMBIENTE</span>
                <p style={{ fontWeight: 600, textTransform: 'uppercase' }}>{healthData.environment}</p>
              </div>
            </div>
          </div>
        ) : apiStatus === 'offline' ? (
          <p style={{ color: 'var(--danger-color)' }}>
            ⚠️ Não foi possível conectar à API backend em <code>http://localhost:3001</code>. Verifique se o servidor Node.js está rodando.
          </p>
        ) : (
          <p style={{ color: 'var(--text-secondary)' }}>Verificando comunicação com o servidor backend...</p>
        )}
      </section>

      <section style={{
        background: 'var(--card-bg)',
        border: '1px solid var(--card-border)',
        borderRadius: 'var(--border-radius)',
        padding: '2rem'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1rem' }}>
          <Layers size={24} color="var(--accent-color)" />
          <h2 style={{ fontSize: '1.25rem', fontWeight: 600 }}>Tecnologias Habilitadas no Projeto</h2>
        </div>
        <ul style={{ listStyle: 'none', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1rem' }}>
          <li style={{ background: '#0f172a', padding: '1rem', borderRadius: '8px', border: '1px solid #334155' }}>
            <strong style={{ color: 'var(--primary-color)' }}>Next.js 14 + React</strong>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>App Router & Componentes</p>
          </li>
          <li style={{ background: '#0f172a', padding: '1rem', borderRadius: '8px', border: '1px solid #334155' }}>
            <strong style={{ color: 'var(--accent-color)' }}>TypeScript 5</strong>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>Tipagem estática ponta a ponta</p>
          </li>
          <li style={{ background: '#0f172a', padding: '1rem', borderRadius: '8px', border: '1px solid #334155' }}>
            <strong style={{ color: '#f59e0b' }}>Node.js + Sequelize</strong>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>API REST e ORM MySQL</p>
          </li>
          <li style={{ background: '#0f172a', padding: '1rem', borderRadius: '8px', border: '1px solid #334155' }}>
            <strong style={{ color: '#ec4899' }}>JWT & Swagger UI</strong>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>Auth e Documentação OpenAPI</p>
          </li>
        </ul>
      </section>
    </main>
  );
}
