'use client';

/**
 * @file admin/page.tsx
 * @description Painel Administrativo (US27): gestão de usuários (listar/filtrar/ativar/desativar) e
 * visão geral de todas as solicitações da plataforma. Acesso restrito a `tipo_perfil = ADMIN`.
 *
 * BIBLIOTECAS UTILIZADAS:
 * 1. Lucide React (^0.383.0): Ícones para tabelas, filtros e ações.
 *    Doc Oficial: https://lucide.dev/
 * 2. Next.js (^14.2.3): Framework React com App Router.
 *    Doc Oficial: https://nextjs.org/docs
 * 3. Axios (^1.7.2): Requisições HTTP REST à API backend.
 *    Doc Oficial: https://axios-http.com/docs/intro
 */

import React, { useCallback, useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  ArrowLeft, ShieldCheck, Users, ClipboardList, Search,
  UserCheck, UserX, AlertCircle, CheckCircle, LogOut,
} from 'lucide-react';
import api from '@/services/api';

type Aba = 'usuarios' | 'solicitacoes';

interface UsuarioAdmin {
  id: string;
  nome: string;
  email: string;
  tipo_perfil: 'SOLICITANTE' | 'PRESTADOR' | 'ADMIN';
  ativo: boolean;
  created_at: string;
}

interface SolicitacaoAdmin {
  id: string;
  titulo: string;
  status: string;
  categoria: string | null;
  cidade: string | null;
  bairro: string | null;
  created_at: string;
  solicitante: { id: string; nome: string; email: string };
}

const TIPO_LABEL: Record<string, string> = { SOLICITANTE: 'Solicitante', PRESTADOR: 'Prestador', ADMIN: 'Admin' };

const STATUS_SOLICITACAO: Record<string, { label: string; bg: string; fg: string }> = {
  ABERTA: { label: 'Aberta', bg: 'rgba(59,130,246,0.15)', fg: '#60a5fa' },
  EM_NEGOCIACAO: { label: 'Em negociação', bg: 'rgba(245,158,11,0.15)', fg: '#fbbf24' },
  CONTRATADA: { label: 'Contratada', bg: 'rgba(139,92,246,0.15)', fg: '#a78bfa' },
  CONCLUIDA: { label: 'Concluída', bg: 'rgba(16,185,129,0.15)', fg: '#34d399' },
  CANCELADA: { label: 'Cancelada', bg: 'rgba(239,68,68,0.15)', fg: '#f87171' },
};

function formatarData(iso: string) {
  return new Date(iso).toLocaleDateString('pt-BR', { day: '2-digit', month: 'short', year: 'numeric' });
}

export default function AdminPage() {
  const router = useRouter();

  const [abaAtiva, setAbaAtiva] = useState<Aba>('usuarios');
  const [carregando, setCarregando] = useState(true);
  const [autorizado, setAutorizado] = useState(false);
  const [erro, setErro] = useState('');
  const [sucesso, setSucesso] = useState('');

  const [usuarios, setUsuarios] = useState<UsuarioAdmin[]>([]);
  const [filtroTipo, setFiltroTipo] = useState('');
  const [filtroStatusUsuario, setFiltroStatusUsuario] = useState('');
  const [buscaUsuario, setBuscaUsuario] = useState('');
  const [processandoId, setProcessandoId] = useState<string | null>(null);

  const [solicitacoes, setSolicitacoes] = useState<SolicitacaoAdmin[]>([]);
  const [filtroStatusSolicitacao, setFiltroStatusSolicitacao] = useState('');

  function limparMensagens() {
    setErro('');
    setSucesso('');
  }

  function trataErro(err: any, fallback: string) {
    if (err.response?.status === 401) {
      localStorage.removeItem('@ServicoFacil:token');
      localStorage.removeItem('@ServicoFacil:user');
      router.replace('/login');
      return;
    }
    setErro(err.response?.data?.message || fallback);
  }

  const carregarUsuarios = useCallback(async () => {
    limparMensagens();
    try {
      const response = await api.get('/admin/usuarios', {
        params: { tipo_perfil: filtroTipo, status: filtroStatusUsuario, busca: buscaUsuario },
      });
      setUsuarios(response.data.data);
    } catch (err: any) {
      trataErro(err, 'Não foi possível carregar os usuários.');
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filtroTipo, filtroStatusUsuario, buscaUsuario]);

  const carregarSolicitacoes = useCallback(async () => {
    limparMensagens();
    try {
      const response = await api.get('/admin/solicitacoes', { params: { status: filtroStatusSolicitacao } });
      setSolicitacoes(response.data.data);
    } catch (err: any) {
      trataErro(err, 'Não foi possível carregar as solicitações.');
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filtroStatusSolicitacao]);

  useEffect(() => {
    const token = localStorage.getItem('@ServicoFacil:token');
    if (!token) {
      router.replace('/login');
      return;
    }
    const userRaw = localStorage.getItem('@ServicoFacil:user');
    const usuario = userRaw ? JSON.parse(userRaw) : null;
    if (usuario?.tipo_perfil !== 'ADMIN') {
      router.replace('/');
      return;
    }
    setAutorizado(true);
    setCarregando(false);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (!autorizado) return;
    if (abaAtiva === 'usuarios') carregarUsuarios();
    else carregarSolicitacoes();
  }, [autorizado, abaAtiva, carregarUsuarios, carregarSolicitacoes]);

  async function alterarStatus(usuario: UsuarioAdmin) {
    const acao = usuario.ativo ? 'desativar' : 'ativar';
    if (!window.confirm(`Deseja realmente ${acao} a conta de ${usuario.nome}?`)) return;

    setProcessandoId(usuario.id);
    limparMensagens();
    try {
      const response = await api.patch(`/admin/usuarios/${usuario.id}/status`, { ativo: !usuario.ativo });
      setSucesso(response.data.message);
      setUsuarios((atual) => atual.map((u) => (u.id === usuario.id ? { ...u, ativo: !usuario.ativo } : u)));
    } catch (err: any) {
      trataErro(err, 'Não foi possível atualizar o status do usuário.');
    } finally {
      setProcessandoId(null);
    }
  }

  if (carregando) {
    return <main style={{ maxWidth: '1000px', margin: '4rem auto', padding: '0 1.5rem', textAlign: 'center', color: 'var(--text-secondary)' }}>Carregando...</main>;
  }

  if (!autorizado) return null;

  return (
    <main style={{ maxWidth: '1000px', margin: '2rem auto', padding: '0 1.5rem 4rem' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.5rem' }}>
        <Link href="/" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
          <ArrowLeft size={16} /> Voltar para a página inicial
        </Link>
        <button onClick={() => { localStorage.removeItem('@ServicoFacil:token'); localStorage.removeItem('@ServicoFacil:user'); router.push('/'); }} style={{
          display: 'inline-flex', alignItems: 'center', gap: '0.4rem', background: 'transparent',
          border: '1px solid #334155', color: '#94a3b8', borderRadius: '8px', padding: '0.5rem 0.9rem', fontSize: '0.85rem', cursor: 'pointer',
        }}>
          <LogOut size={15} /> Sair
        </button>
      </div>

      <header style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1.5rem' }}>
        <div style={{
          width: '44px', height: '44px', borderRadius: '12px', background: 'rgba(139,92,246,0.15)',
          display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#a78bfa',
        }}>
          <ShieldCheck size={24} />
        </div>
        <div>
          <h1 style={{ fontSize: '1.4rem', fontWeight: 700, margin: 0 }}>Painel Administrativo</h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', margin: 0 }}>Gestão de usuários e visão geral das solicitações da plataforma.</p>
        </div>
      </header>

      {sucesso && (
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', background: 'rgba(16, 185, 129, 0.15)', border: '1px solid var(--accent-color)', color: '#6ee7b7', padding: '1rem', borderRadius: '8px', marginBottom: '1.5rem', fontSize: '0.9rem' }}>
          <CheckCircle size={20} /> <span>{sucesso}</span>
        </div>
      )}
      {erro && (
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', background: 'rgba(239, 68, 68, 0.15)', border: '1px solid var(--danger-color)', color: '#fca5a5', padding: '1rem', borderRadius: '8px', marginBottom: '1.5rem', fontSize: '0.9rem' }}>
          <AlertCircle size={20} /> <span>{erro}</span>
        </div>
      )}

      {/* ── Abas ─────────────────────────────── */}
      <div style={{ display: 'flex', gap: '0.5rem', borderBottom: '1px solid #334155', marginBottom: '1.5rem' }}>
        {([
          { id: 'usuarios', label: 'Usuários', icon: <Users size={16} /> },
          { id: 'solicitacoes', label: 'Solicitações', icon: <ClipboardList size={16} /> },
        ] as { id: Aba; label: string; icon: React.ReactNode }[]).map((aba) => (
          <button
            key={aba.id}
            onClick={() => { setAbaAtiva(aba.id); limparMensagens(); }}
            style={{
              display: 'inline-flex', alignItems: 'center', gap: '0.4rem',
              background: 'transparent', border: 'none',
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

      {/* ── Aba Usuários ─────────────────────── */}
      {abaAtiva === 'usuarios' && (
        <>
          <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap', marginBottom: '1.25rem' }}>
            <div style={{ flex: '1 1 220px', position: 'relative' }}>
              <Search size={16} style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)', color: '#64748b' }} />
              <input
                value={buscaUsuario}
                onChange={(e) => setBuscaUsuario(e.target.value)}
                placeholder="Buscar por nome ou e-mail"
                style={{ ...campoInput, paddingLeft: '2.2rem' }}
              />
            </div>
            <select value={filtroTipo} onChange={(e) => setFiltroTipo(e.target.value)} style={{ ...campoInput, flex: '0 1 170px' }}>
              <option value="">Todos os perfis</option>
              <option value="SOLICITANTE">Solicitante</option>
              <option value="PRESTADOR">Prestador</option>
              <option value="ADMIN">Admin</option>
            </select>
            <select value={filtroStatusUsuario} onChange={(e) => setFiltroStatusUsuario(e.target.value)} style={{ ...campoInput, flex: '0 1 150px' }}>
              <option value="">Todos os status</option>
              <option value="ativo">Ativos</option>
              <option value="inativo">Inativos</option>
            </select>
          </div>

          <div style={{ background: 'var(--card-bg)', border: '1px solid var(--card-border)', borderRadius: 'var(--border-radius)', overflow: 'hidden' }}>
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.88rem' }}>
                <thead>
                  <tr style={{ borderBottom: '1px solid #334155', textAlign: 'left' }}>
                    <th style={estiloTh}>Nome</th>
                    <th style={estiloTh}>E-mail</th>
                    <th style={estiloTh}>Perfil</th>
                    <th style={estiloTh}>Status</th>
                    <th style={estiloTh}>Cadastro</th>
                    <th style={estiloTh}>Ação</th>
                  </tr>
                </thead>
                <tbody>
                  {usuarios.map((u) => (
                    <tr key={u.id} style={{ borderBottom: '1px solid #1e293b' }}>
                      <td style={estiloTd}>{u.nome}</td>
                      <td style={{ ...estiloTd, color: '#94a3b8' }}>{u.email}</td>
                      <td style={estiloTd}>{TIPO_LABEL[u.tipo_perfil] || u.tipo_perfil}</td>
                      <td style={estiloTd}>
                        <span style={{
                          padding: '0.2rem 0.6rem', borderRadius: '20px', fontSize: '0.75rem', fontWeight: 600,
                          background: u.ativo ? 'rgba(16,185,129,0.15)' : 'rgba(239,68,68,0.15)',
                          color: u.ativo ? '#34d399' : '#f87171',
                        }}>
                          {u.ativo ? 'Ativo' : 'Inativo'}
                        </span>
                      </td>
                      <td style={{ ...estiloTd, color: '#64748b' }}>{formatarData(u.created_at)}</td>
                      <td style={estiloTd}>
                        <button
                          onClick={() => alterarStatus(u)}
                          disabled={processandoId === u.id || u.tipo_perfil === 'ADMIN'}
                          title={u.tipo_perfil === 'ADMIN' ? 'Não é possível alterar outra conta de administrador por aqui' : undefined}
                          style={{
                            display: 'inline-flex', alignItems: 'center', gap: '0.35rem',
                            padding: '0.35rem 0.7rem', borderRadius: '6px', border: 'none',
                            fontSize: '0.8rem', fontWeight: 600, cursor: (processandoId === u.id || u.tipo_perfil === 'ADMIN') ? 'not-allowed' : 'pointer',
                            opacity: u.tipo_perfil === 'ADMIN' ? 0.4 : 1,
                            background: u.ativo ? 'rgba(239,68,68,0.15)' : 'rgba(16,185,129,0.15)',
                            color: u.ativo ? '#f87171' : '#34d399',
                          }}
                        >
                          {u.ativo ? <UserX size={14} /> : <UserCheck size={14} />}
                          {u.ativo ? 'Desativar' : 'Ativar'}
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            {usuarios.length === 0 && (
              <div style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-secondary)' }}>Nenhum usuário encontrado.</div>
            )}
          </div>
        </>
      )}

      {/* ── Aba Solicitações ─────────────────── */}
      {abaAtiva === 'solicitacoes' && (
        <>
          <div style={{ marginBottom: '1.25rem' }}>
            <select value={filtroStatusSolicitacao} onChange={(e) => setFiltroStatusSolicitacao(e.target.value)} style={{ ...campoInput, width: '220px' }}>
              <option value="">Todos os status</option>
              {Object.entries(STATUS_SOLICITACAO).map(([valor, info]) => (
                <option key={valor} value={valor}>{info.label}</option>
              ))}
            </select>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            {solicitacoes.map((s) => {
              const cor = STATUS_SOLICITACAO[s.status] || { label: s.status, bg: '#1e293b', fg: '#94a3b8' };
              return (
                <div key={s.id} style={{
                  background: 'var(--card-bg)', border: '1px solid var(--card-border)',
                  borderRadius: 'var(--border-radius)', padding: '1.1rem 1.25rem',
                  display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '0.75rem',
                }}>
                  <div>
                    <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '0.4rem' }}>
                      <span style={{ padding: '0.2rem 0.6rem', borderRadius: '20px', fontSize: '0.72rem', fontWeight: 600, background: cor.bg, color: cor.fg }}>{cor.label}</span>
                      {s.categoria && <span style={{ padding: '0.2rem 0.6rem', borderRadius: '20px', fontSize: '0.72rem', fontWeight: 600, background: '#1e293b', color: '#cbd5e1' }}>{s.categoria}</span>}
                    </div>
                    <strong style={{ fontSize: '0.95rem' }}>{s.titulo}</strong>
                    <div style={{ color: '#64748b', fontSize: '0.8rem', marginTop: '2px' }}>
                      {s.solicitante.nome} ({s.solicitante.email}) {s.cidade && `· ${s.bairro}, ${s.cidade}`}
                    </div>
                  </div>
                  <span style={{ color: '#64748b', fontSize: '0.8rem' }}>{formatarData(s.created_at)}</span>
                </div>
              );
            })}
            {solicitacoes.length === 0 && (
              <div style={{
                textAlign: 'center', padding: '2.5rem 1rem', color: 'var(--text-secondary)',
                background: 'var(--card-bg)', border: '1px solid var(--card-border)', borderRadius: 'var(--border-radius)',
              }}>
                Nenhuma solicitação encontrada.
              </div>
            )}
          </div>
        </>
      )}
    </main>
  );
}

const campoInput: React.CSSProperties = {
  padding: '0.6rem 0.75rem', background: '#0f172a', border: '1px solid #334155',
  borderRadius: '8px', color: '#fff', fontSize: '0.9rem', width: '100%',
};

const estiloTh: React.CSSProperties = { padding: '0.75rem 1rem', color: '#94a3b8', fontWeight: 600, fontSize: '0.78rem', textTransform: 'uppercase', letterSpacing: '0.03em' };
const estiloTd: React.CSSProperties = { padding: '0.75rem 1rem' };
