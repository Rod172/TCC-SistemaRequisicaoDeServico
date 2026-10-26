'use client';

/**
 * @file perfil/page.tsx
 * @description Tela "Meu Perfil" (US04) do usuário autenticado: edição de dados cadastrais e foto,
 * troca de senha e exclusão de conta (LGPD). Consome a API protegida por JWT em /api/v1/perfil.
 *
 * BIBLIOTECAS UTILIZADAS:
 * 1. Lucide React (^0.383.0): Ícones para campos do formulário e abas.
 *    Doc Oficial: https://lucide.dev/
 * 2. Next.js (^14.2.3): Framework React com App Router.
 *    Doc Oficial: https://nextjs.org/docs
 * 3. Axios (^1.7.2): Requisições HTTP REST à API backend, incluindo upload multipart da foto.
 *    Doc Oficial: https://axios-http.com/docs/intro
 */

import React, { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  User, Phone, MapPin, Camera, Lock, ShieldAlert, CheckCircle,
  AlertCircle, ArrowLeft, LogOut, Save, Trash2, KeyRound, Settings,
} from 'lucide-react';
import api from '@/services/api';

const BACKEND_ORIGIN = (process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api/v1').replace(/\/api\/v1\/?$/, '');

type Aba = 'dados' | 'senha' | 'privacidade';

interface PerfilData {
  id: string;
  nome: string;
  email: string;
  telefone: string;
  endereco?: string;
  foto_url?: string;
  tipo_perfil: 'SOLICITANTE' | 'PRESTADOR' | 'ADMIN';
}

export default function PerfilPage() {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [abaAtiva, setAbaAtiva] = useState<Aba>('dados');
  const [perfil, setPerfil] = useState<PerfilData | null>(null);
  const [carregando, setCarregando] = useState(true);

  const [dadosForm, setDadosForm] = useState({ nome: '', telefone: '', endereco: '' });
  const [salvandoDados, setSalvandoDados] = useState(false);
  const [enviandoFoto, setEnviandoFoto] = useState(false);

  const [senhaForm, setSenhaForm] = useState({ senha_atual: '', nova_senha: '', confirmar_senha: '' });
  const [salvandoSenha, setSalvandoSenha] = useState(false);

  const [excluindo, setExcluindo] = useState(false);
  const [confirmarExclusao, setConfirmarExclusao] = useState(false);

  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  useEffect(() => {
    const token = localStorage.getItem('@ServicoFacil:token');
    if (!token) {
      router.replace('/login');
      return;
    }

    async function carregarPerfil() {
      try {
        const response = await api.get('/perfil');
        const dados: PerfilData = response.data.data;
        setPerfil(dados);
        setDadosForm({
          nome: dados.nome || '',
          telefone: dados.telefone || '',
          endereco: dados.endereco || '',
        });
      } catch (err: any) {
        if (err.response?.status === 401) {
          localStorage.removeItem('@ServicoFacil:token');
          localStorage.removeItem('@ServicoFacil:user');
          router.replace('/login');
          return;
        }
        setErrorMsg(err.response?.data?.message || 'Não foi possível carregar os dados do seu perfil.');
      } finally {
        setCarregando(false);
      }
    }

    carregarPerfil();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function limparMensagens() {
    setSuccessMsg(null);
    setErrorMsg(null);
  }

  function handleLogout() {
    localStorage.removeItem('@ServicoFacil:token');
    localStorage.removeItem('@ServicoFacil:user');
    router.push('/');
  }

  async function handleSalvarDados(e: React.FormEvent) {
    e.preventDefault();
    limparMensagens();
    setSalvandoDados(true);

    try {
      const response = await api.put('/perfil', dadosForm);
      setPerfil((prev) => (prev ? { ...prev, ...response.data.data } : prev));
      localStorage.setItem('@ServicoFacil:user', JSON.stringify(response.data.data));
      setSuccessMsg('Dados do perfil atualizados com sucesso!');
    } catch (err: any) {
      setErrorMsg(err.response?.data?.message || 'Não foi possível atualizar seus dados.');
    } finally {
      setSalvandoDados(false);
    }
  }

  async function handleSelecionarFoto(e: React.ChangeEvent<HTMLInputElement>) {
    const arquivo = e.target.files?.[0];
    if (!arquivo) return;

    limparMensagens();
    setEnviandoFoto(true);

    const formData = new FormData();
    formData.append('foto', arquivo);

    try {
      const response = await api.post('/perfil/foto', formData, {
        headers: { 'Content-Type': undefined },
      });
      const { foto_url } = response.data.data;
      setPerfil((prev) => (prev ? { ...prev, foto_url } : prev));
      setSuccessMsg('Foto de perfil atualizada com sucesso!');
    } catch (err: any) {
      setErrorMsg(err.response?.data?.message || 'Não foi possível enviar a foto. Use JPEG, PNG ou WEBP de até 5MB.');
    } finally {
      setEnviandoFoto(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  }

  async function handleAlterarSenha(e: React.FormEvent) {
    e.preventDefault();
    limparMensagens();

    if (senhaForm.nova_senha !== senhaForm.confirmar_senha) {
      setErrorMsg('A confirmação da nova senha não coincide.');
      return;
    }

    setSalvandoSenha(true);
    try {
      await api.put('/perfil/senha', {
        senha_atual: senhaForm.senha_atual,
        nova_senha: senhaForm.nova_senha,
      });
      setSuccessMsg('Senha alterada com sucesso!');
      setSenhaForm({ senha_atual: '', nova_senha: '', confirmar_senha: '' });
    } catch (err: any) {
      setErrorMsg(err.response?.data?.message || 'Não foi possível alterar a senha.');
    } finally {
      setSalvandoSenha(false);
    }
  }

  async function handleExcluirConta() {
    limparMensagens();
    setExcluindo(true);
    try {
      await api.delete('/perfil');
      localStorage.removeItem('@ServicoFacil:token');
      localStorage.removeItem('@ServicoFacil:user');
      router.push('/');
    } catch (err: any) {
      setErrorMsg(err.response?.data?.message || 'Não foi possível excluir sua conta agora.');
      setExcluindo(false);
    }
  }

  if (carregando) {
    return (
      <main style={{ maxWidth: '760px', margin: '4rem auto', padding: '0 1.5rem', textAlign: 'center', color: 'var(--text-secondary)' }}>
        Carregando seu perfil...
      </main>
    );
  }

  if (!perfil) {
    return (
      <main style={{ maxWidth: '760px', margin: '2rem auto', padding: '0 1.5rem 4rem' }}>
        <Link href="/" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', color: 'var(--text-secondary)', fontSize: '0.9rem', marginBottom: '1.5rem' }}>
          <ArrowLeft size={16} /> Voltar para a página inicial
        </Link>
        <div style={{
          display: 'flex', alignItems: 'center', gap: '0.75rem',
          background: 'rgba(239, 68, 68, 0.15)', border: '1px solid var(--danger-color)',
          color: '#fca5a5', padding: '1rem', borderRadius: '8px', fontSize: '0.9rem',
        }}>
          <AlertCircle size={20} />
          <span>{errorMsg || 'Não foi possível carregar os dados do seu perfil.'}</span>
        </div>
      </main>
    );
  }

  return (
    <main style={{ maxWidth: '760px', margin: '2rem auto', padding: '0 1.5rem 4rem' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.5rem' }}>
        <Link href="/" style={{
          display: 'inline-flex', alignItems: 'center', gap: '0.5rem',
          color: 'var(--text-secondary)', fontSize: '0.9rem',
        }}>
          <ArrowLeft size={16} />
          Voltar para a página inicial
        </Link>

        <button onClick={handleLogout} style={{
          display: 'inline-flex', alignItems: 'center', gap: '0.4rem',
          background: 'transparent', border: '1px solid #334155', color: '#94a3b8',
          borderRadius: '8px', padding: '0.5rem 0.9rem', fontSize: '0.85rem', cursor: 'pointer',
        }}>
          <LogOut size={15} /> Sair
        </button>
      </div>

      {/* ── Cabeçalho com Avatar ─────────────────────────── */}
      <div style={{
        background: 'var(--card-bg)', border: '1px solid var(--card-border)',
        borderRadius: 'var(--border-radius)', padding: 'clamp(1.25rem, 5vw, 2rem)',
        display: 'flex', alignItems: 'center', gap: '1.5rem', marginBottom: '1.5rem', flexWrap: 'wrap',
      }}>
        <div style={{ position: 'relative', flexShrink: 0 }}>
          <div style={{
            width: '84px', height: '84px', borderRadius: '50%', overflow: 'hidden',
            background: '#0f172a', border: '2px solid #8b5cf6',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            {perfil?.foto_url ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={`${BACKEND_ORIGIN}${perfil.foto_url}`}
                alt="Foto de perfil"
                style={{ width: '100%', height: '100%', objectFit: 'cover' }}
              />
            ) : (
              <User size={36} color="#8b5cf6" />
            )}
          </div>
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            disabled={enviandoFoto}
            title="Alterar foto de perfil"
            style={{
              position: 'absolute', bottom: '-2px', right: '-2px',
              width: '30px', height: '30px', borderRadius: '50%',
              background: '#8b5cf6', border: '2px solid var(--card-bg)',
              color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center',
              cursor: enviandoFoto ? 'not-allowed' : 'pointer',
            }}
          >
            <Camera size={14} />
          </button>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/jpeg,image/png,image/webp"
            onChange={handleSelecionarFoto}
            hidden
          />
        </div>

        <div>
          <h1 style={{ fontSize: '1.4rem', fontWeight: 700, marginBottom: '0.25rem' }}>
            {perfil?.nome}
          </h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginBottom: '0.5rem' }}>
            {perfil?.email}
          </p>
          <span style={{
            display: 'inline-block', padding: '0.25rem 0.7rem', borderRadius: '20px',
            fontSize: '0.75rem', fontWeight: 600,
            background: 'rgba(139,92,246,0.15)', color: '#a78bfa',
          }}>
            {perfil?.tipo_perfil === 'PRESTADOR' ? 'Prestador de Serviço' : perfil?.tipo_perfil === 'ADMIN' ? 'Administrador' : 'Solicitante'}
          </span>
          <div>
            <Link href="/configuracoes" style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', marginTop: '0.6rem', color: '#60a5fa', fontSize: '0.8rem', textDecoration: 'none' }}>
              <Settings size={13} /> Configurações de notificação
            </Link>
          </div>
        </div>
      </div>

      {/* ── Alertas ──────────────────────────────────────── */}
      {errorMsg && (
        <div style={{
          display: 'flex', alignItems: 'center', gap: '0.75rem',
          background: 'rgba(239, 68, 68, 0.15)', border: '1px solid var(--danger-color)',
          color: '#fca5a5', padding: '1rem', borderRadius: '8px', marginBottom: '1.5rem', fontSize: '0.9rem',
        }}>
          <AlertCircle size={20} />
          <span>{errorMsg}</span>
        </div>
      )}
      {successMsg && (
        <div style={{
          display: 'flex', alignItems: 'center', gap: '0.75rem',
          background: 'rgba(16, 185, 129, 0.15)', border: '1px solid var(--accent-color)',
          color: '#6ee7b7', padding: '1rem', borderRadius: '8px', marginBottom: '1.5rem', fontSize: '0.9rem',
        }}>
          <CheckCircle size={20} />
          <span>{successMsg}</span>
        </div>
      )}

      {/* ── Abas ─────────────────────────────────────────── */}
      <div style={{ display: 'flex', gap: '0.5rem', borderBottom: '1px solid #334155', marginBottom: '1.75rem', overflowX: 'auto' }}>
        {([
          { id: 'dados', label: 'Dados Pessoais', icon: <User size={16} /> },
          { id: 'senha', label: 'Alterar Senha', icon: <KeyRound size={16} /> },
          { id: 'privacidade', label: 'Privacidade (LGPD)', icon: <ShieldAlert size={16} /> },
        ] as { id: Aba; label: string; icon: React.ReactNode }[]).map((aba) => (
          <button
            key={aba.id}
            onClick={() => { setAbaAtiva(aba.id); limparMensagens(); }}
            style={{
              display: 'inline-flex', alignItems: 'center', gap: '0.4rem', flexShrink: 0,
              background: 'transparent', border: 'none', whiteSpace: 'nowrap',
              borderBottom: abaAtiva === aba.id ? '2px solid #8b5cf6' : '2px solid transparent',
              color: abaAtiva === aba.id ? '#fff' : 'var(--text-secondary)',
              padding: '0.75rem 0.25rem', marginRight: '1.25rem',
              fontSize: '0.9rem', fontWeight: 600, cursor: 'pointer',
            }}
          >
            {aba.icon} {aba.label}
          </button>
        ))}
      </div>

      {/* ── Conteúdo: Dados Pessoais ───────────────────────── */}
      {abaAtiva === 'dados' && (
        <form onSubmit={handleSalvarDados} style={{
          background: 'var(--card-bg)', border: '1px solid var(--card-border)',
          borderRadius: 'var(--border-radius)', padding: 'clamp(1.25rem, 5vw, 2rem)',
          display: 'flex', flexDirection: 'column', gap: '1.25rem',
        }}>
          <Campo label="Nome completo" icon={<User size={18} />}>
            <input
              type="text"
              value={dadosForm.nome}
              onChange={(e) => setDadosForm((p) => ({ ...p, nome: e.target.value }))}
              required
              style={estiloInput}
            />
          </Campo>

          <Campo label="Telefone" icon={<Phone size={18} />}>
            <input
              type="tel"
              value={dadosForm.telefone}
              onChange={(e) => setDadosForm((p) => ({ ...p, telefone: e.target.value }))}
              required
              style={estiloInput}
            />
          </Campo>

          <Campo label="Endereço" icon={<MapPin size={18} />}>
            <input
              type="text"
              value={dadosForm.endereco}
              onChange={(e) => setDadosForm((p) => ({ ...p, endereco: e.target.value }))}
              placeholder="Rua, número, bairro, cidade"
              style={estiloInput}
            />
          </Campo>

          <button type="submit" disabled={salvandoDados} style={{ ...estiloBotao, alignSelf: 'flex-start' }}>
            <Save size={16} /> {salvandoDados ? 'Salvando...' : 'Salvar alterações'}
          </button>
        </form>
      )}

      {/* ── Conteúdo: Alterar Senha ───────────────────────── */}
      {abaAtiva === 'senha' && (
        <form onSubmit={handleAlterarSenha} style={{
          background: 'var(--card-bg)', border: '1px solid var(--card-border)',
          borderRadius: 'var(--border-radius)', padding: 'clamp(1.25rem, 5vw, 2rem)',
          display: 'flex', flexDirection: 'column', gap: '1.25rem',
        }}>
          <Campo label="Senha atual" icon={<Lock size={18} />}>
            <input
              type="password"
              value={senhaForm.senha_atual}
              onChange={(e) => setSenhaForm((p) => ({ ...p, senha_atual: e.target.value }))}
              required
              style={estiloInput}
            />
          </Campo>

          <Campo label="Nova senha" icon={<Lock size={18} />}>
            <input
              type="password"
              value={senhaForm.nova_senha}
              onChange={(e) => setSenhaForm((p) => ({ ...p, nova_senha: e.target.value }))}
              required
              minLength={6}
              style={estiloInput}
            />
          </Campo>

          <Campo label="Confirmar nova senha" icon={<Lock size={18} />}>
            <input
              type="password"
              value={senhaForm.confirmar_senha}
              onChange={(e) => setSenhaForm((p) => ({ ...p, confirmar_senha: e.target.value }))}
              required
              minLength={6}
              style={estiloInput}
            />
          </Campo>

          <button type="submit" disabled={salvandoSenha} style={{ ...estiloBotao, alignSelf: 'flex-start' }}>
            <KeyRound size={16} /> {salvandoSenha ? 'Alterando...' : 'Alterar senha'}
          </button>
        </form>
      )}

      {/* ── Conteúdo: Privacidade (LGPD) ───────────────────── */}
      {abaAtiva === 'privacidade' && (
        <div style={{
          background: 'var(--card-bg)', border: '1px solid var(--card-border)',
          borderRadius: 'var(--border-radius)', padding: 'clamp(1.25rem, 5vw, 2rem)',
        }}>
          <div style={{ display: 'flex', gap: '0.75rem', marginBottom: '1.25rem' }}>
            <ShieldAlert size={22} color="#f87171" style={{ flexShrink: 0, marginTop: '2px' }} />
            <div>
              <h2 style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: '0.5rem' }}>
                Exclusão de conta e dados pessoais
              </h2>
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', lineHeight: 1.6 }}>
                Em conformidade com a Lei Geral de Proteção de Dados (Lei nº 13.709/2018), você pode
                solicitar a desativação da sua conta a qualquer momento. Seus dados serão desativados
                imediatamente (você não conseguirá mais fazer login). O histórico dos serviços permanece
                registrado. Esta ação não pode ser desfeita pelo próprio usuário.
              </p>
            </div>
          </div>

          {!confirmarExclusao ? (
            <button
              type="button"
              onClick={() => setConfirmarExclusao(true)}
              style={{ ...estiloBotao, background: 'transparent', border: '1px solid var(--danger-color)', color: '#f87171' }}
            >
              <Trash2 size={16} /> Solicitar exclusão da conta
            </button>
          ) : (
            <div style={{
              background: 'rgba(239, 68, 68, 0.1)', border: '1px solid var(--danger-color)',
              borderRadius: '8px', padding: '1.25rem',
            }}>
              <p style={{ fontSize: '0.9rem', marginBottom: '1rem' }}>
                Tem certeza? Você será desconectado imediatamente e perderá o acesso à sua conta.
              </p>
              <div style={{ display: 'flex', gap: '0.75rem' }}>
                <button
                  type="button"
                  onClick={handleExcluirConta}
                  disabled={excluindo}
                  style={{ ...estiloBotao, background: 'var(--danger-color)' }}
                >
                  <Trash2 size={16} /> {excluindo ? 'Excluindo...' : 'Sim, excluir minha conta'}
                </button>
                <button
                  type="button"
                  onClick={() => setConfirmarExclusao(false)}
                  style={{ ...estiloBotao, background: 'transparent', border: '1px solid #334155', color: '#94a3b8' }}
                >
                  Cancelar
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </main>
  );
}

/* ── Subcomponentes e estilos compartilhados ──────────────────────── */

function Campo({ label, icon, children }: { label: string; icon: React.ReactNode; children: React.ReactNode }) {
  const campoId = React.useId();
  return (
    <div>
      <label htmlFor={campoId} style={{ display: 'block', fontSize: '0.875rem', marginBottom: '0.4rem', color: 'var(--text-secondary)' }}>
        {label}
      </label>
      <div style={{ position: 'relative' }}>
        <span style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#64748b', display: 'flex' }}>
          {icon}
        </span>
        {React.isValidElement(children) ? React.cloneElement(children as React.ReactElement<{ id?: string }>, { id: campoId }) : children}
      </div>
    </div>
  );
}

const estiloInput: React.CSSProperties = {
  width: '100%',
  padding: '0.75rem 0.75rem 0.75rem 2.5rem',
  background: '#0f172a',
  border: '1px solid #334155',
  borderRadius: '8px',
  color: '#fff',
  fontSize: '0.95rem',
};

const estiloBotao: React.CSSProperties = {
  display: 'inline-flex',
  alignItems: 'center',
  gap: '0.5rem',
  padding: '0.75rem 1.25rem',
  background: '#8b5cf6',
  color: '#fff',
  border: 'none',
  borderRadius: '8px',
  fontWeight: 600,
  fontSize: '0.9rem',
  cursor: 'pointer',
  transition: 'background var(--transition-speed)',
};
