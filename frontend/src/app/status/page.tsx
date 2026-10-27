'use client';

/**
 * @file status/page.tsx
 * @description Página de status técnico do sistema: saúde da API backend e stack tecnológica
 * utilizada, para fins de demonstração acadêmica (movida para fora da home em 08/09/2026).
 * Layout da US39: cartão de saúde da API com hora da verificação, botão para verificar de novo e
 * link para a documentação Swagger, seguido da grade de tecnologias.
 *
 * BIBLIOTECAS UTILIZADAS:
 * 1. Lucide React (^0.383.0): Ícones vetoriais em React/TypeScript.
 *    Doc Oficial: https://lucide.dev/
 * 2. Next.js (^14.2.3): Framework React para aplicações Web.
 *    Doc Oficial: https://nextjs.org/docs
 * 3. Axios (^1.7.2): Requisições HTTP REST à API backend.
 *    Doc Oficial: https://axios-http.com/docs/intro
 */

import { useCallback, useEffect, useState } from 'react';
import { Activity, ArrowUpRight, CheckCircle2, RefreshCw } from 'lucide-react';
import api from '@/services/api';
import Pagina, { CabecalhoPagina } from '@/components/ui/Pagina';
import { Aviso } from '@/components/ui/Elementos';

interface HealthStatus {
  status: string;
  service: string;
  version: string;
  environment: string;
}

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api/v1';
const ORIGEM_API = API_BASE_URL.replace(/\/api\/v1\/?$/, '');

const STACK = [
  { name: 'Next.js 14', sub: 'App Router + React 18', color: 'var(--text-primary)' },
  { name: 'TypeScript 5', sub: 'Tipagem ponta a ponta', color: 'var(--accent-indigo)' },
  { name: 'Node.js + Express', sub: 'API REST & Middlewares', color: 'var(--success-strong)' },
  { name: 'Sequelize + MySQL', sub: 'ORM & Banco Relacional', color: 'var(--violet-strong)' },
  { name: 'JWT + Bcrypt', sub: 'Autenticação segura', color: 'var(--warning-strong)' },
  { name: 'Docker Compose', sub: 'Conteinerização', color: 'var(--brand-sky)' },
];

export default function StatusPage() {
  const [apiStatus, setApiStatus] = useState<'checking' | 'online' | 'offline'>('checking');
  const [healthData, setHealthData] = useState<HealthStatus | null>(null);
  const [verificadoEm, setVerificadoEm] = useState<Date | null>(null);

  const checkBackendHealth = useCallback(async () => {
    setApiStatus('checking');
    try {
      const response = await api.get<HealthStatus>('/health');
      setHealthData(response.data);
      setApiStatus('online');
    } catch {
      setApiStatus('offline');
    } finally {
      setVerificadoEm(new Date());
    }
  }, []);

  useEffect(() => {
    checkBackendHealth();
  }, [checkBackendHealth]);

  const cor = apiStatus === 'online' ? 'var(--success-strong)' : apiStatus === 'offline' ? 'var(--danger-strong)' : 'var(--text-secondary)';

  return (
    <Pagina largura="estreita">
      <CabecalhoPagina
        area="Para a banca e para desenvolvimento"
        titulo="Status do sistema"
        subtitulo="Diagnóstico técnico da API e da stack utilizada no projeto, para fins de demonstração."
      />

      {/* ── STATUS DA API ──────────────────────── */}
      <section aria-labelledby="titulo-api" aria-busy={apiStatus === 'checking'} className={`card grande empilhado ${apiStatus === 'online' ? 'sucesso' : apiStatus === 'offline' ? 'perigo' : ''}`} style={{ gap: '1rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <span aria-hidden="true" style={{ width: 52, height: 52, borderRadius: 16, background: apiStatus === 'online' ? 'var(--success-bg)' : apiStatus === 'offline' ? 'var(--danger-bg)' : 'var(--bg-color)', color: cor, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
              <Activity size={26} />
            </span>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.2rem' }}>
              <h2 id="titulo-api" className="titulo-secao" style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', flexWrap: 'wrap' }}>
                API {apiStatus === 'online' ? 'online' : apiStatus === 'offline' ? 'fora do ar' : 'verificando…'}
                <span role="status" className="chip" style={{ background: apiStatus === 'online' ? 'var(--success-tint)' : apiStatus === 'offline' ? 'var(--danger-tint)' : 'var(--neutral-tint)', color: cor }}>
                  {apiStatus === 'online' ? 'Operacional' : apiStatus === 'offline' ? 'Offline' : 'Verificando'}
                </span>
              </h2>
              <span className="texto-apoio" style={{ fontSize: '0.85rem', overflowWrap: 'anywhere' }}>
                {verificadoEm ? `Verificado às ${verificadoEm.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })} · ` : ''}{API_BASE_URL}
              </span>
            </div>
          </div>
          <button type="button" onClick={checkBackendHealth} disabled={apiStatus === 'checking'} className="btn btn-secundario">
            <RefreshCw size={16} aria-hidden="true" /> Verificar de novo
          </button>
        </div>

        {apiStatus === 'online' && healthData && (
          <>
            <dl className="dados">
              <div><dt>Serviço</dt><dd>{healthData.service}</dd></div>
              <div><dt>Versão</dt><dd>{healthData.version}</dd></div>
              <div><dt>Ambiente</dt><dd>{healthData.environment.toUpperCase()}</dd></div>
            </dl>
            <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', alignItems: 'center' }}>
              <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem', color: 'var(--success-strong)', fontSize: '0.9rem' }}>
                <CheckCircle2 size={17} aria-hidden="true" /> Conexão com MySQL estabelecida
              </span>
              <a href={`${ORIGEM_API}/api-docs`} target="_blank" rel="noopener noreferrer" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.3rem', fontSize: '0.9rem', fontWeight: 600 }}>
                Documentação da API (Swagger) <ArrowUpRight size={15} aria-hidden="true" />
              </a>
            </div>
          </>
        )}

        {apiStatus === 'offline' && (
          <Aviso tipo="erro">
            Não foi possível conectar à API em <code style={{ background: 'var(--bg-color)', padding: '2px 6px', borderRadius: '4px' }}>{ORIGEM_API}</code>. Verifique se o backend está rodando.
          </Aviso>
        )}
      </section>

      {/* ── TECH STACK ──────────────────────────── */}
      <section aria-labelledby="titulo-stack" className="empilhado" style={{ gap: '0.85rem' }}>
        <h2 id="titulo-stack" className="titulo-secao">Tecnologias</h2>
        <ul style={{ listStyle: 'none', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 220px), 1fr))', gap: '0.75rem' }}>
          {STACK.map(({ name, sub, color }) => (
            <li key={name} className="card" style={{ display: 'flex', gap: '0.75rem', alignItems: 'center', padding: '1rem 1.1rem' }}>
              <span aria-hidden="true" style={{ width: 10, height: 36, borderRadius: 999, background: color, flexShrink: 0 }} />
              <span style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
                <strong style={{ fontSize: '0.95rem' }}>{name}</strong>
                <span className="texto-apoio" style={{ fontSize: '0.8rem' }}>{sub}</span>
              </span>
            </li>
          ))}
        </ul>
      </section>
    </Pagina>
  );
}
