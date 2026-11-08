'use client';

/**
 * @file login/page.tsx
 * @description Tela de Login de Usuários (Solicitantes e Prestadores) com autenticação JWT e validação no Next.js 14.
 * Layout em duas colunas (US39): marca e benefícios de um lado, formulário do outro, com opção de
 * mostrar a senha. O "login rápido" com as contas de demonstração do seeder (US25) fica num bloco
 * secundário, pra facilitar testar os perfis sem competir com o login de verdade. Como a tela não usa
 * o rodapé compartilhado, os links dos documentos legais (US40) ficam no fim da coluna do formulário.
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
import { ChevronLeft, Eye, EyeOff, MessageCircle, ShieldCheck, Star } from 'lucide-react';
import api from '@/services/api';
import Logo from '@/components/Logo';
import { Aviso } from '@/components/ui/Elementos';
import { LinksRodape } from '@/components/ui/Pagina';
import SeletorTema from '@/components/ui/SeletorTema';

const CONTAS_DEMO = [
  { rotulo: 'Solicitante', email: 'ana.ribeiro@example.com' },
  { rotulo: 'Admin', email: 'admin@example.com' },
  { rotulo: 'Prestador · Elétrica', email: 'joao.pereira@example.com' },
  { rotulo: 'Prestador · Encanamento', email: 'maria.oliveira@example.com' },
];
const SENHA_DEMO = 'Demo@123';

const BENEFICIOS = [
  { icone: <ShieldCheck size={17} />, texto: 'Pagamento retido com garantia até você confirmar o serviço.' },
  { icone: <MessageCircle size={17} />, texto: 'Chat com cada prestador antes de contratar.' },
  { icone: <Star size={17} />, texto: 'Avaliações reais de outros clientes.' },
];

export default function LoginPage() {
  const router = useRouter();

  const [formData, setFormData] = useState({
    email: '',
    senha: '',
  });
  const [mostrarSenha, setMostrarSenha] = useState(false);

  const [loading, setLoading] = useState(false);
  const [loadingDemo, setLoadingDemo] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  async function efetuarLogin(email: string, senha: string) {
    setErrorMsg(null);
    setSuccessMsg(null);
    try {
      const response = await api.post('/auth/login', { email, senha });
      const { token, usuario } = response.data.data;

      localStorage.setItem('@ServicoFacil:token', token);
      localStorage.setItem('@ServicoFacil:user', JSON.stringify(usuario));

      setSuccessMsg(`Bem-vindo(a) de volta, ${usuario.nome}! Redirecionando...`);
      setTimeout(() => router.push('/'), 1200);
      return true;
    } catch (err: any) {
      setErrorMsg(err.response?.data?.message || 'E-mail ou senha incorretos. Tente novamente.');
      return false;
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.email || !formData.senha) {
      setErrorMsg('Por favor, preencha o e-mail e a senha.');
      return;
    }
    setLoading(true);
    await efetuarLogin(formData.email, formData.senha);
    setLoading(false);
  };

  async function loginRapido(email: string) {
    setLoadingDemo(email);
    await efetuarLogin(email, SENHA_DEMO);
    setLoadingDemo(null);
  }

  const ocupado = loading || loadingDemo !== null;

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexWrap: 'wrap' }}>
      {/* ── Lado da marca ───────────────────── */}
      <section style={{
        flex: '1 1 460px', minWidth: 0, background: 'var(--bg-highlight)', borderRight: '1px solid var(--card-border)',
        padding: '2.5rem clamp(1.25rem, 5vw, 4.5rem)', display: 'flex', flexDirection: 'column', gap: '3rem',
      }}>
        <Link href="/" aria-label="Eloserv — página inicial" style={{ alignSelf: 'flex-start', display: 'inline-flex' }}>
          <Logo tamanho={36} corFundo="var(--bg-highlight)" />
        </Link>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', maxWidth: '460px', margin: 'auto 0' }}>
          <h1 style={{ fontSize: 'clamp(1.9rem, 4vw, 2.6rem)', lineHeight: 1.1, fontWeight: 800, letterSpacing: '-0.03em' }}>
            Que bom ver você de novo.
          </h1>
          <p style={{ fontSize: '1.05rem', lineHeight: 1.6, color: 'var(--text-secondary)' }}>
            Entre para acompanhar seus pedidos, responder propostas e conversar com quem vai fazer o serviço.
          </p>
          <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '0.85rem', marginTop: '0.75rem' }}>
            {BENEFICIOS.map((b) => (
              <li key={b.texto} style={{ display: 'flex', gap: '0.75rem', alignItems: 'flex-start', fontSize: '0.95rem', lineHeight: 1.5 }}>
                <span aria-hidden="true" style={{ width: '32px', height: '32px', borderRadius: '10px', background: 'var(--sky-bg)', color: 'var(--brand-sky)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  {b.icone}
                </span>
                {b.texto}
              </li>
            ))}
          </ul>
        </div>
        <span style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>TCC Ciência da Computação · UNIP</span>
      </section>

      {/* ── Formulário ──────────────────────── */}
      <main style={{ flex: '1 1 460px', minWidth: 0, padding: '2.5rem clamp(1.25rem, 5vw, 4.5rem)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ width: '100%', maxWidth: '420px', display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          <Link href="/" className="link-voltar"><ChevronLeft size={16} aria-hidden="true" /> Página inicial</Link>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
            <h2 className="titulo-pagina">Entrar</h2>
            <p className="subtitulo-pagina">Use o e-mail e a senha da sua conta de cliente ou de prestador.</p>
          </div>

          {errorMsg && <Aviso tipo="erro">{errorMsg}</Aviso>}
          {successMsg && <Aviso tipo="sucesso">{successMsg}</Aviso>}

          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <div className="campo-grupo">
              <label htmlFor="login-email" className="rotulo">E-mail</label>
              <input
                id="login-email" type="email" name="email" required autoComplete="email" className="campo"
                value={formData.email} onChange={handleChange} placeholder="seu.email@exemplo.com"
              />
            </div>
            <div className="campo-grupo">
              <label htmlFor="login-senha" className="rotulo">Senha</label>
              <div style={{ position: 'relative' }}>
                <input
                  id="login-senha" type={mostrarSenha ? 'text' : 'password'} name="senha" required autoComplete="current-password"
                  className="campo" style={{ paddingRight: '3.2rem' }}
                  value={formData.senha} onChange={handleChange}
                />
                <button
                  type="button" onClick={() => setMostrarSenha((v) => !v)}
                  aria-label={mostrarSenha ? 'Ocultar senha' : 'Mostrar senha'} aria-pressed={mostrarSenha}
                  style={{ position: 'absolute', right: '2px', top: '2px', width: '44px', height: '44px', border: 0, background: 'transparent', color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}
                >
                  {mostrarSenha ? <EyeOff size={18} aria-hidden="true" /> : <Eye size={18} aria-hidden="true" />}
                </button>
              </div>
            </div>
            <button type="submit" disabled={ocupado} className="btn btn-primario btn-grande btn-bloco">
              {loading ? 'Entrando...' : 'Entrar'}
            </button>
          </form>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem', paddingTop: '1.25rem', borderTop: '1px solid var(--card-border)' }}>
            <span className="texto-apoio">Ainda não tem conta?</span>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, minmax(0, 1fr))', gap: '0.6rem' }}>
              <Link href="/register-solicitante" className="card" style={{ padding: '0.75rem 0.9rem', display: 'flex', flexDirection: 'column', gap: '2px', color: 'var(--text-primary)', background: 'transparent' }}>
                <strong style={{ fontSize: '0.9rem' }}>Sou cliente</strong>
                <span style={{ fontSize: '0.78rem', color: 'var(--text-secondary)' }}>Quero contratar</span>
              </Link>
              <Link href="/register-prestador" className="card" style={{ padding: '0.75rem 0.9rem', display: 'flex', flexDirection: 'column', gap: '2px', color: 'var(--text-primary)', background: 'transparent' }}>
                <strong style={{ fontSize: '0.9rem' }}>Sou prestador</strong>
                <span style={{ fontSize: '0.78rem', color: 'var(--text-secondary)' }}>Quero atender</span>
              </Link>
            </div>
          </div>

          {/* ── Login rápido (contas de demonstração do seeder, US25) ── */}
          <details open style={{ border: '1px dashed var(--card-border)', borderRadius: '12px', padding: '0.75rem 0.9rem' }}>
            <summary style={{ minHeight: '28px', fontSize: '0.82rem', fontWeight: 600, color: 'var(--warning-text)', cursor: 'pointer' }}>
              Contas de demonstração (para a banca)
            </summary>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, minmax(0, 1fr))', gap: '0.5rem', marginTop: '0.6rem' }}>
              {CONTAS_DEMO.map((conta) => (
                <button
                  key={conta.email} type="button" onClick={() => loginRapido(conta.email)} disabled={ocupado}
                  className="btn btn-secundario" style={{ minHeight: '40px', fontSize: '0.8rem', padding: '0 0.5rem', whiteSpace: 'normal', background: 'var(--card-bg)' }}
                >
                  {loadingDemo === conta.email ? 'Entrando...' : conta.rotulo}
                </button>
              ))}
            </div>
          </details>

          <LinksRodape />
          <SeletorTema compacto />
        </div>
      </main>
    </div>
  );
}
