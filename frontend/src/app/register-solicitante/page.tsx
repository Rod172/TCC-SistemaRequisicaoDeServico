'use client';

/**
 * @file register-solicitante/page.tsx
 * @description Formulário de cadastro de usuário Solicitante (Cliente) em Next.js 14 / React com TypeScript.
 * 
 * BIBLIOTECAS UTILIZADAS:
 * 1. Lucide React (^0.383.0): Ícones para campos do formulário.
 *    Doc Oficial: https://lucide.dev/
 * 2. Next.js (^14.2.3): Framework React com App Router.
 *    Doc Oficial: https://nextjs.org/docs
 */

import React, { useState } from 'react';
import Link from 'next/link';
import { User, Mail, Shield, Phone, MapPin, Lock, CheckCircle, AlertCircle, ArrowLeft, FileText } from 'lucide-react';
import api from '@/services/api';

export default function RegisterSolicitantePage() {
  const [formData, setFormData] = useState({
    nome: '',
    email: '',
    cpf: '',
    telefone: '',
    endereco: '',
    senha: '',
    confirmarSenha: '',
    termoLgpdAceito: false,
  });

  const [loading, setLoading] = useState(false);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setSuccessMsg(null);

    // Validações no cliente
    if (formData.senha !== formData.confirmarSenha) {
      setErrorMsg('As senhas digitadas não coincidem.');
      return;
    }

    if (!formData.termoLgpdAceito) {
      setErrorMsg('É necessário aceitar os termos de uso e política de privacidade (LGPD) para prosseguir.');
      return;
    }

    setLoading(true);

    try {
      const payload = {
        nome: formData.nome,
        email: formData.email,
        cpf: formData.cpf,
        telefone: formData.telefone,
        endereco: formData.endereco,
        senha: formData.senha,
        termo_lgpd_aceito: formData.termoLgpdAceito,
      };

      const response = await api.post('/auth/register/solicitante', payload);
      setSuccessMsg(response.data.message || 'Cadastro realizado com sucesso!');
      
      // Limpa o formulário
      setFormData({
        nome: '',
        email: '',
        cpf: '',
        telefone: '',
        endereco: '',
        senha: '',
        confirmarSenha: '',
        termoLgpdAceito: false,
      });
    } catch (err: any) {
      const apiError = err.response?.data?.message || 'Ocorreu um erro ao realizar o cadastro. Tente novamente.';
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
            background: 'rgba(59, 130, 246, 0.15)',
            color: 'var(--primary-color)',
            marginBottom: '1rem'
          }}>
            <User size={24} />
          </div>
          <h1 style={{ fontSize: '1.75rem', fontWeight: 700, marginBottom: '0.5rem' }}>
            Cadastro de Solicitante
          </h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.95rem' }}>
            Crie sua conta de Cliente para publicar solicitações e receber orçamentos de prestadores.
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
          {/* Nome Completo */}
          <div>
            <label style={{ display: 'block', fontSize: '0.875rem', marginBottom: '0.4rem', color: 'var(--text-secondary)' }}>
              Nome Completo *
            </label>
            <div style={{ position: 'relative' }}>
              <User size={18} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#64748b' }} />
              <input
                type="text"
                name="nome"
                required
                value={formData.nome}
                onChange={handleChange}
                placeholder="Ex: Carlos Eduardo Silva"
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

          {/* E-mail e CPF (2 Colunas) */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '1rem' }}>
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
                  placeholder="carlos@email.com"
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

            <div>
              <label style={{ display: 'block', fontSize: '0.875rem', marginBottom: '0.4rem', color: 'var(--text-secondary)' }}>
                CPF *
              </label>
              <div style={{ position: 'relative' }}>
                <Shield size={18} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#64748b' }} />
                <input
                  type="text"
                  name="cpf"
                  required
                  value={formData.cpf}
                  onChange={handleChange}
                  placeholder="123.456.789-00"
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
          </div>

          {/* Telefone e Endereço */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '1rem' }}>
            <div>
              <label style={{ display: 'block', fontSize: '0.875rem', marginBottom: '0.4rem', color: 'var(--text-secondary)' }}>
                Telefone / WhatsApp *
              </label>
              <div style={{ position: 'relative' }}>
                <Phone size={18} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#64748b' }} />
                <input
                  type="text"
                  name="telefone"
                  required
                  value={formData.telefone}
                  onChange={handleChange}
                  placeholder="(16) 99876-5432"
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

            <div>
              <label style={{ display: 'block', fontSize: '0.875rem', marginBottom: '0.4rem', color: 'var(--text-secondary)' }}>
                Endereço
              </label>
              <div style={{ position: 'relative' }}>
                <MapPin size={18} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#64748b' }} />
                <input
                  type="text"
                  name="endereco"
                  value={formData.endereco}
                  onChange={handleChange}
                  placeholder="Rua, número, bairro"
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
          </div>

          {/* Senha e Confirmar Senha */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '1rem' }}>
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

            <div>
              <label style={{ display: 'block', fontSize: '0.875rem', marginBottom: '0.4rem', color: 'var(--text-secondary)' }}>
                Confirmar Senha *
              </label>
              <div style={{ position: 'relative' }}>
                <Lock size={18} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#64748b' }} />
                <input
                  type="password"
                  name="confirmarSenha"
                  required
                  value={formData.confirmarSenha}
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
          </div>

          {/* Checkbox Termo LGPD */}
          <div style={{
            display: 'flex',
            alignItems: 'flex-start',
            gap: '0.75rem',
            background: '#0f172a',
            padding: '1rem',
            borderRadius: '8px',
            border: '1px solid #334155',
            marginTop: '0.5rem'
          }}>
            <input
              type="checkbox"
              id="termoLgpdAceito"
              name="termoLgpdAceito"
              checked={formData.termoLgpdAceito}
              onChange={handleChange}
              style={{ marginTop: '0.2rem', cursor: 'pointer', width: '18px', height: '18px' }}
            />
            <label htmlFor="termoLgpdAceito" style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', cursor: 'pointer', lineHeight: 1.4 }}>
              Concordo com o tratamento de meus dados pessoais para fins de cadastro e intermediação de serviços, em conformidade com a <strong>LGPD (Lei nº 13.709/2018)</strong> e os Termos de Uso da Plataforma. *
            </label>
          </div>

          {/* Botão de Submissão */}
          <button
            type="submit"
            disabled={loading}
            style={{
              marginTop: '1rem',
              padding: '0.875rem',
              background: loading ? '#475569' : 'var(--primary-color)',
              color: '#fff',
              border: 'none',
              borderRadius: '8px',
              fontWeight: 600,
              fontSize: '1rem',
              cursor: loading ? 'not-allowed' : 'pointer',
              transition: 'background var(--transition-speed)'
            }}
          >
            {loading ? 'Cadastrando...' : 'Finalizar Cadastro de Solicitante'}
          </button>
        </form>
      </div>
    </main>
  );
}
