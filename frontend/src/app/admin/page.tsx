'use client';

/**
 * @file admin/page.tsx
 * @description Painel Administrativo (US27): gestão de usuários (listar/filtrar/ativar/desativar) e
 * visão geral de todas as solicitações da plataforma. Acesso restrito a `tipo_perfil = ADMIN`.
 * Layout da US39: cabeçalho compartilhado, aviso de denúncias pendentes, abas num único cartão e
 * tabela de usuários com rolagem horizontal em telas estreitas. O atalho "Atendimento de privacidade"
 * leva à caixa de pedidos dos titulares (US40).
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
import { Users, ClipboardList, Search, UserCheck, UserX, Flag, Check, ShieldCheck } from 'lucide-react';
import api from '@/services/api';
import useConfirmacao from '@/components/useConfirmacao';
import Pagina, { CabecalhoPagina } from '@/components/ui/Pagina';
import { Aviso, Chip, EstadoLista, STATUS_SOLICITACAO } from '@/components/ui/Elementos';

type Aba = 'usuarios' | 'solicitacoes' | 'denuncias';

interface UsuarioAdmin {
  id: string;
  nome: string;
  email: string;
  tipo_perfil: 'SOLICITANTE' | 'PRESTADOR' | 'ADMIN';
  ativo: boolean;
  createdAt: string;
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

interface DenunciaAdmin {
  id: string;
  motivo: string;
  status: 'PENDENTE' | 'RESOLVIDA';
  createdAt: string;
  solicitacao: { id: string; titulo: string; status: string };
  denunciante: { id: string; nome: string; email: string };
}

const TIPO_LABEL: Record<string, string> = { SOLICITANTE: 'Solicitante', PRESTADOR: 'Prestador', ADMIN: 'Admin' };

function formatarData(iso: string) {
  return new Date(iso).toLocaleDateString('pt-BR', { day: '2-digit', month: 'short', year: 'numeric' });
}

export default function AdminPage() {
  const { confirmar, dialogo } = useConfirmacao();
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

  const [denuncias, setDenuncias] = useState<DenunciaAdmin[]>([]);
  const [resolvendoId, setResolvendoId] = useState<string | null>(null);

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

  const carregarDenuncias = useCallback(async () => {
    limparMensagens();
    try {
      const response = await api.get('/admin/denuncias');
      setDenuncias(response.data.data);
    } catch (err: any) {
      trataErro(err, 'Não foi possível carregar as denúncias.');
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

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
    else if (abaAtiva === 'solicitacoes') carregarSolicitacoes();
    else carregarDenuncias();
  }, [autorizado, abaAtiva, carregarUsuarios, carregarSolicitacoes, carregarDenuncias]);

  // Busca as denúncias uma vez ao entrar no painel, só pro contador de pendentes na aba já aparecer
  // certo mesmo antes do admin clicar nela.
  useEffect(() => {
    if (autorizado) carregarDenuncias();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [autorizado]);

  async function resolverDenuncia(denuncia: DenunciaAdmin) {
    setResolvendoId(denuncia.id);
    limparMensagens();
    try {
      const response = await api.patch(`/admin/denuncias/${denuncia.id}/resolver`);
      setSucesso(response.data.mensagem);
      setDenuncias((atual) => atual.map((d) => (d.id === denuncia.id ? { ...d, status: 'RESOLVIDA' } : d)));
    } catch (err: any) {
      trataErro(err, 'Não foi possível resolver a denúncia.');
    } finally {
      setResolvendoId(null);
    }
  }

  async function alterarStatus(usuario: UsuarioAdmin) {
    const acao = usuario.ativo ? 'desativar' : 'ativar';
    if (!await confirmar({ mensagem: `Deseja realmente ${acao} a conta de ${usuario.nome}?` })) return;

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
    return (
      <Pagina>
        <EstadoLista tipo="carregando">Carregando...</EstadoLista>
      </Pagina>
    );
  }

  if (!autorizado) return null;

  const pendentes = denuncias.filter((d) => d.status === 'PENDENTE').length;

  return (
    <Pagina>
      {dialogo}
      <CabecalhoPagina
        area="Administração"
        titulo="Painel administrativo"
        subtitulo="Usuários, pedidos e denúncias da plataforma. Cada ação administrativa fica registrada com quem fez e quando."
        acoes={<Link href="/admin/privacidade" className="btn btn-secundario"><ShieldCheck size={16} aria-hidden="true" /> Atendimento de privacidade</Link>}
      />

      {sucesso && <Aviso tipo="sucesso">{sucesso}</Aviso>}
      {erro && <Aviso tipo="erro">{erro}</Aviso>}
      {pendentes > 0 && abaAtiva !== 'denuncias' && (
        <div className="aviso aviso-alerta" style={{ alignItems: 'center', flexWrap: 'wrap' }}>
          <Flag size={18} aria-hidden="true" />
          <span style={{ flex: '1 1 260px' }}>{pendentes === 1 ? '1 denúncia pendente' : `${pendentes} denúncias pendentes`} aguardando revisão.</span>
          <button type="button" className="btn btn-texto" style={{ color: 'var(--warning-soft-text)' }} onClick={() => { setAbaAtiva('denuncias'); limparMensagens(); }}>Revisar agora</button>
        </div>
      )}

      <section className="card" style={{ padding: 0, overflow: 'hidden' }}>
        <div role="tablist" aria-label="Áreas do painel" className="abas" style={{ padding: '0 0.75rem' }}>
          {([
            { id: 'usuarios', label: 'Usuários', icon: <Users size={16} aria-hidden="true" /> },
            { id: 'solicitacoes', label: 'Solicitações', icon: <ClipboardList size={16} aria-hidden="true" /> },
            { id: 'denuncias', label: 'Denúncias', icon: <Flag size={16} aria-hidden="true" /> },
          ] as { id: Aba; label: string; icon: React.ReactNode }[]).map((aba) => (
            <button key={aba.id} type="button" role="tab" className="aba" aria-selected={abaAtiva === aba.id} onClick={() => { setAbaAtiva(aba.id); limparMensagens(); }} style={{ gap: '0.4rem', minHeight: '50px' }}>
              {aba.icon} {aba.label}
              {aba.id === 'denuncias' && pendentes > 0 && <span className="contagem" style={{ background: 'var(--warning-border)', color: 'var(--warning-soft-text)' }}>{pendentes}</span>}
            </button>
          ))}
        </div>

        {/* ── Aba Usuários ─────────────────────── */}
        {abaAtiva === 'usuarios' && (
          <>
            <div style={{ display: 'flex', gap: '0.6rem', flexWrap: 'wrap', padding: '1rem 1.25rem', borderBottom: '1px solid var(--card-border)' }}>
              <div style={{ flex: '1 1 240px', position: 'relative' }}>
                <label htmlFor="busca-usuario" className="sr-only">Buscar por nome ou e-mail</label>
                <Search size={16} aria-hidden="true" style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-secondary)' }} />
                <input id="busca-usuario" type="search" value={buscaUsuario} onChange={(e) => setBuscaUsuario(e.target.value)} placeholder="Buscar por nome ou e-mail" className="campo" style={{ minHeight: '44px', paddingLeft: '2.3rem', fontSize: '0.9rem' }} />
              </div>
              <label className="texto-apoio" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.82rem' }}>
                Perfil
                <select value={filtroTipo} onChange={(e) => setFiltroTipo(e.target.value)} className="campo" style={{ width: 'auto', minHeight: '44px', fontSize: '0.9rem' }}>
                  <option value="">Todos</option>
                  <option value="SOLICITANTE">Solicitante</option>
                  <option value="PRESTADOR">Prestador</option>
                  <option value="ADMIN">Admin</option>
                </select>
              </label>
              <label className="texto-apoio" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.82rem' }}>
                Situação
                <select value={filtroStatusUsuario} onChange={(e) => setFiltroStatusUsuario(e.target.value)} className="campo" style={{ width: 'auto', minHeight: '44px', fontSize: '0.9rem' }}>
                  <option value="">Todas</option>
                  <option value="ativo">Ativos</option>
                  <option value="inativo">Inativos</option>
                </select>
              </label>
            </div>

            <div className="tabela-rolagem">
              <table className="tabela" style={{ minWidth: '780px' }}>
                <thead>
                  <tr>
                    <th scope="col" style={{ paddingLeft: '1.25rem' }}>Nome</th>
                    <th scope="col">E-mail</th>
                    <th scope="col">Perfil</th>
                    <th scope="col">Situação</th>
                    <th scope="col">Cadastro</th>
                    <th scope="col" style={{ textAlign: 'right', paddingRight: '1.25rem' }}>Ação</th>
                  </tr>
                </thead>
                <tbody>
                  {usuarios.map((u) => (
                    <tr key={u.id}>
                      <td style={{ paddingLeft: '1.25rem', fontWeight: 700 }}>{u.nome}</td>
                      <td style={{ color: 'var(--text-body)' }}>{u.email}</td>
                      <td><span className="chip" style={{ background: 'var(--card-border)', color: 'var(--text-body)' }}>{TIPO_LABEL[u.tipo_perfil] || u.tipo_perfil}</span></td>
                      <td>
                        <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.82rem', fontWeight: 600, color: u.ativo ? 'var(--success-strong)' : 'var(--danger-strong)' }}>
                          <span aria-hidden="true" style={{ width: 7, height: 7, borderRadius: 999, background: 'currentColor' }} />{u.ativo ? 'Ativo' : 'Inativo'}
                        </span>
                      </td>
                      <td style={{ color: 'var(--text-secondary)' }}>{formatarData(u.createdAt)}</td>
                      <td style={{ textAlign: 'right', paddingRight: '1.25rem' }}>
                        {u.tipo_perfil === 'ADMIN' ? (
                          <span className="texto-apoio" style={{ fontSize: '0.78rem' }} title="Não é possível alterar outra conta de administrador por aqui">Conta de administrador</span>
                        ) : (
                          <button type="button" onClick={() => alterarStatus(u)} disabled={processandoId === u.id} className={`btn ${u.ativo ? 'btn-perigo' : 'btn-secundario'}`} style={{ minHeight: '38px', fontSize: '0.82rem', color: u.ativo ? undefined : 'var(--success-soft-text)', borderColor: u.ativo ? undefined : 'var(--success-border)' }}>
                            {u.ativo ? <UserX size={14} aria-hidden="true" /> : <UserCheck size={14} aria-hidden="true" />}
                            {u.ativo ? 'Desativar' : 'Ativar'}
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            {usuarios.length === 0 && <p className="texto-apoio" style={{ padding: '2rem', textAlign: 'center' }}>Nenhum usuário encontrado.</p>}
            {usuarios.length > 0 && <p className="texto-apoio" style={{ padding: '0.85rem 1.25rem', borderTop: '1px solid var(--card-border)', fontSize: '0.8rem' }}>{usuarios.length === 1 ? '1 usuário' : `${usuarios.length} usuários`}</p>}
          </>
        )}

        {/* ── Aba Solicitações ─────────────────── */}
        {abaAtiva === 'solicitacoes' && (
          <div className="empilhado" style={{ padding: '1rem 1.25rem 1.25rem', gap: '0.75rem' }}>
            <label className="texto-apoio" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.82rem', alignSelf: 'flex-start' }}>
              Status
              <select value={filtroStatusSolicitacao} onChange={(e) => setFiltroStatusSolicitacao(e.target.value)} className="campo" style={{ width: 'auto', minHeight: '44px', fontSize: '0.9rem' }}>
                <option value="">Todos</option>
                {Object.entries(STATUS_SOLICITACAO).map(([valor, info]) => (
                  <option key={valor} value={valor}>{info.label}</option>
                ))}
              </select>
            </label>
            <ul className="lista-simples" style={{ gap: '0.6rem' }}>
              {solicitacoes.map((s) => (
                <li key={s.id}>
                  <Link href={`/minhas-solicitacoes/${s.id}`} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '0.75rem', padding: '0.9rem 1rem', borderRadius: '12px', background: 'var(--bg-color)', border: '1px solid var(--card-border)', color: 'inherit' }}>
                    <span style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem', minWidth: 0 }}>
                      <span className="chips">
                        <Chip status={s.status} mapa={STATUS_SOLICITACAO} />
                        {s.categoria && <span className="chip categoria">{s.categoria}</span>}
                      </span>
                      <strong style={{ fontSize: '0.95rem', overflowWrap: 'anywhere' }}>{s.titulo}</strong>
                      <span className="texto-apoio" style={{ fontSize: '0.8rem', overflowWrap: 'anywhere' }}>{s.solicitante.nome} ({s.solicitante.email}){s.cidade && ` · ${s.bairro}, ${s.cidade}`}</span>
                    </span>
                    <span className="texto-apoio" style={{ fontSize: '0.8rem' }}>{formatarData(s.created_at)}</span>
                  </Link>
                </li>
              ))}
            </ul>
            {solicitacoes.length === 0 && <EstadoLista tipo="vazio">Nenhuma solicitação encontrada.</EstadoLista>}
          </div>
        )}

        {/* ── Aba Denúncias ─────────────────────── */}
        {abaAtiva === 'denuncias' && (
          <div className="empilhado" style={{ padding: '1rem 1.25rem 1.25rem', gap: '0.6rem' }}>
            {denuncias.map((d) => (
              <div key={d.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '0.75rem', padding: '0.9rem 1rem', borderRadius: '12px', background: 'var(--bg-color)', border: `1px solid ${d.status === 'PENDENTE' ? 'var(--warning-border)' : 'var(--card-border)'}` }}>
                <div style={{ flex: '1 1 320px', minWidth: 0, display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
                  <span className="chip" style={{ alignSelf: 'flex-start', background: d.status === 'PENDENTE' ? 'var(--warning-tint)' : 'var(--success-tint)', color: d.status === 'PENDENTE' ? 'var(--warning-strong)' : 'var(--success-strong)' }}>
                    {d.status === 'PENDENTE' ? 'Pendente' : 'Resolvida'}
                  </span>
                  <p style={{ fontSize: '0.92rem', overflowWrap: 'anywhere' }}>{d.motivo}</p>
                  <span className="texto-apoio" style={{ fontSize: '0.8rem' }}>Denunciado por {d.denunciante.nome} ({d.denunciante.email}) · {formatarData(d.createdAt)}</span>
                  <Link href={`/minhas-solicitacoes/${d.solicitacao.id}`} style={{ fontSize: '0.85rem', fontWeight: 600 }}>Ver solicitação: {d.solicitacao.titulo}</Link>
                </div>
                {d.status === 'PENDENTE' && (
                  <button type="button" onClick={() => resolverDenuncia(d)} disabled={resolvendoId === d.id} className="btn btn-secundario" style={{ minHeight: '40px' }}>
                    <Check size={15} aria-hidden="true" /> Marcar como resolvida
                  </button>
                )}
              </div>
            ))}
            {denuncias.length === 0 && <EstadoLista tipo="vazio">Nenhuma denúncia registrada.</EstadoLista>}
          </div>
        )}
      </section>
    </Pagina>
  );
}
