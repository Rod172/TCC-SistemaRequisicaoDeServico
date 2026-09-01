'use client';

/**
 * @file login/page.tsx
 * @description Tela de Login de Usuários (Solicitantes e Prestadores) com autenticação JWT e validação no Next.js 14.
 * 
 * BIBLIOTECAS UTILIZADAS:
 * 1. Lucide React (^0.383.0): Ícones para campos do formulário.
 *    Doc Oficial: https://lucide.dev/
 * 2. Next.js (^14.2.3): Framework React com App Router.
 *    Doc Oficial: https://nextjs.org/docs
 * 3. Axios (^1.7.2): Requisições HTTP REST à API backend.
 *    Doc Oficial: https://axios-http.com/docs/intro
 */

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { LogIn, Mail, Lock, CheckCircle, AlertCircle, ArrowLeft } from 'lucide-react';
import api from '@/services/api';

export default function LoginPage() {
  const router = useRouter();

  const [formData, setFormData] = useState({
    email: '',
    senha: '',
  });

  const [loading, setLoading] = useState(false);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setSuccessMsg(null);

    if (!formData.email || !formData.senha) {
      setErrorMsg('Por favor, preencha o e-mail e a senha.');
      return;
    }

    setLoading(true);

    try {
      const response = await api.post('/auth/login', {
        email: formData.email,
        senha: formData.senha,
      });

      const { token, usuario } = response.data.data;

      localStorage.setItem('@ServicoFacil:token', token);
      localStorage.setItem('@ServicoFacil:user', JSON.stringify(usuario));

      setSuccessMsg(`Bem-vindo(a) de volta, ${usuario.nome}! Redirecionando...`);

      setTimeout(() => {
        router.push('/');
      }, 1500);
    } catch (err: any) {
      const apiError = err.response?.data?.message || 'E-mail ou senha incorretos. Tente novamente.';
      setErrorMsg(apiError);
    } finally {
      setLoading(false);
    }
  };

  return (
    <main style={{ maxWidth: '650px', margin: '2rem auto', padding: '0 1.5rem' }}>
      <Link href="/" style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: '0.5rem',
        marginBottom: '1.5rem',
        color: 'var(--text-secondary)',
        fontSize: '0.9rem'
      }}>
        <ArrowLeft size={16} />
        Voltar para a página inicial
      </Link>

      <div style={{
        background: 'var(--card-bg)',
        border: '1px solid var(--card-border)',
        borderRadius: 'var(--border-radius)',
        padding: '2.5rem 2rem',
        boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.3)'
      }}>
        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <div style={{
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            width: '48px',
            height: '48px',
            borderRadius: '50%',
            background: 'rgba(236, 72, 153, 0.15)',
            color: '#ec4899',
            marginBottom: '1rem'
          }}>
            <LogIn size={24} />
          </div>
          <h1 style={{ fontSize: '1.75rem', fontWeight: 700, marginBottom: '0.5rem' }}>
            Entrar na Plataforma
          </h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.95rem' }}>
            Acesse sua conta de Solicitante ou Prestador com e-mail e senha.
          </p>
        </div>

        {errorMsg && (
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.75rem',
            background: 'rgba(239, 68, 68, 0.15)',
            border: '1px solid var(--danger-color)',
            color: '#fca5a5',
            padding: '1rem',
            borderRadius: '8px',
            marginBottom: '1.5rem',
            fontSize: '0.9rem'
          }}>
            <AlertCircle size={20} style={{ flexShrink: 0 }} />
            <span>{errorMsg}</span>
          </div>
        )}

        {successMsg && (
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.75rem',
            background: 'rgba(16, 185, 129, 0.15)',
            border: '1px solid var(--accent-color)',
            color: '#6ee7b7',
            padding: '1rem',
            borderRadius: '8px',
            marginBottom: '1.5rem',
            fontSize: '0.9rem'
          }}>
            <CheckCircle size={20} style={{ flexShrink: 0 }} />
            <span>{successMsg}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          {/* E-mail */}
          <div>
            <label style={{ display: 'block', fontSize: '0.875rem', marginBottom: '0.4rem', color: 'var(--text-secondary)' }}>
              E-mail *
            </label>
            <div style={{ position: 'relative' }}>
              <Mail size={18} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#64748b' }} />
              <input
                type="email"
                name="email"
                required
                value={formData.email}
                onChange={handleChange}
                placeholder="seu.email@exemplo.com"
                style={{
                  width: '100%',
                  padding: '0.75rem 0.75rem 0.75rem 2.5rem',
                  background: '#0f172a',
                  border: '1px solid #334155',
                  borderRadius: '8px',
                  color: '#fff',
                  fontSize: '0.95rem'
                }}
              />
            </div>
          </div>

          {/* Senha */}
          <div>
            <label style={{ display: 'block', fontSize: '0.875rem', marginBottom: '0.4rem', color: 'var(--text-secondary)' }}>
              Senha *
            </label>
            <div style={{ position: 'relative' }}>
              <Lock size={18} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#64748b' }} />
              <input
                type="password"
                name="senha"
                required
                value={formData.senha}
                onChange={handleChange}
                placeholder="••••••••"
                style={{
                  width: '100%',
                  padding: '0.75rem 0.75rem 0.75rem 2.5rem',
                  background: '#0f172a',
                  border: '1px solid #334155',
                  borderRadius: '8px',
                  color: '#fff',
                  fontSize: '0.95rem'
                }}
              />
            </div>
          </div>

          {/* Botão de Submissão */}
          <button
            type="submit"
            disabled={loading}
            style={{
              marginTop: '0.5rem',
              padding: '0.875rem',
              background: loading ? '#475569' : '#ec4899',
              color: '#fff',
              border: 'none',
              borderRadius: '8px',
              fontWeight: 600,
              fontSize: '1rem',
              cursor: loading ? 'not-allowed' : 'pointer',
              transition: 'background var(--transition-speed)'
            }}
          >
            {loading ? 'Autenticando...' : 'Entrar na Conta'}
          </button>
        </form>

        {/* Links de Cadastro */}
        <div style={{
          marginTop: '1.5rem',
          paddingTop: '1.25rem',
          borderTop: '1px solid #334155',
          textAlign: 'center'
        }}>
          <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', marginBottom: '0.75rem' }}>
            Ainda não possui uma conta?
          </p>
          <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', flexWrap: 'wrap' }}>
            <Link href="/register-solicitante" style={{
              padding: '0.5rem 1rem',
              border: '1px solid var(--primary-color)',
              color: 'var(--primary-color)',
              borderRadius: '8px',
              fontSize: '0.875rem',
              fontWeight: 500,
              textDecoration: 'none'
            }}>
              Criar conta de Cliente
            </Link>
            <Link href="/register-prestador" style={{
              padding: '0.5rem 1rem',
              border: '1px solid var(--accent-color)',
              color: 'var(--accent-color)',
              borderRadius: '8px',
              fontSize: '0.875rem',
              fontWeight: 500,
              textDecoration: 'none'
            }}>
              Criar conta de Prestador
            </Link>
          </div>
        </div>
      </div>
    </main>
  );
}
