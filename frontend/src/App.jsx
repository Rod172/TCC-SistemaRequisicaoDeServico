/**
 * Componente Principal da Aplicação Frontend React
 * 
 * Bibliotecas de Terceiros Utilizadas:
 * - react: Biblioteca JavaScript declarativa para construção de interfaces.
 *   Doc: https://react.dev
 * - lucide-react: Biblioteca de ícones moderna e leve para React.
 *   Doc: https://lucide.dev
 */

import React, { useState, useEffect } from 'react';
import { Wrench, CheckCircle2, ShieldCheck, Database, Layers, Server } from 'lucide-react';
import api from './services/api';

export default function App() {
  const [apiStatus, setApiStatus] = useState({ loading: true, online: false, message: '' });

  useEffect(() => {
    // Testa a conexão com o Backend Node.js
    api.get('/health')
      .then(res => {
        setApiStatus({
          loading: false,
          online: true,
          message: res.data.mensagem
        });
      })
      .catch(err => {
        setApiStatus({
          loading: false,
          online: false,
          message: 'Não foi possível conectar ao servidor backend (Execute: cd backend && npm run dev)'
        });
      });
  }, []);

  return (
    <div className="container">
      <header className="header">
        <div className="brand">
          <Wrench size={32} />
          <span>ServiçoFácil TCC</span>
        </div>
        <span className="badge">Ciência da Computação - UNIP 2026</span>
      </header>

      <main>
        <div className="card">
          <h2>🚀 Plataforma de Gerenciamento de Requisições de Serviço</h2>
          <p style={{ color: 'var(--text-secondary)', marginTop: '0.5rem' }}>
            Aplicação Web Bilateral para Intermediação entre Solicitantes de Serviços e Prestadores de Serviços sob Demanda.
          </p>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '1.5rem', marginBottom: '2rem' }}>
          <div className="card">
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1rem' }}>
              <Server color="var(--accent-primary)" size={24} />
              <h3>Backend Node.js & Express</h3>
            </div>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
              API REST estruturada em camadas (Controllers, Services, Models), autenticação JWT e Swagger.
            </p>
          </div>

          <div className="card">
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1rem' }}>
              <Database color="var(--accent-success)" size={24} />
              <h3>Banco de Dados MySQL</h3>
            </div>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
              Mapeamento relacional com ORM Sequelize, Migrations e Seeders de demonstração.
            </p>
          </div>

          <div className="card">
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1rem' }}>
              <ShieldCheck color="var(--accent-warning)" size={24} />
              <h3>Segurança & LGPD</h3>
            </div>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
              Criptografia de senhas com bcrypt, proteção de rotas com JWT e consentimento de dados.
            </p>
          </div>
        </div>

        <div className="card" style={{ borderColor: apiStatus.online ? 'var(--accent-success)' : 'var(--accent-danger)' }}>
          <h3>Status da Conexão com o Backend:</h3>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginTop: '0.75rem' }}>
            {apiStatus.loading ? (
              <span style={{ color: 'var(--text-secondary)' }}>Verificando conexão com a API...</span>
            ) : apiStatus.online ? (
              <>
                <CheckCircle2 color="var(--accent-success)" size={20} />
                <span style={{ color: 'var(--accent-success)', fontWeight: 600 }}>{apiStatus.message}</span>
              </>
            ) : (
              <span style={{ color: 'var(--accent-danger)' }}>{apiStatus.message}</span>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
