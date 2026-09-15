'use client';

/**
 * @file oportunidades/page.tsx
 * @description Feed de oportunidades de serviço para o Prestador (US08): lista solicitações abertas,
 * com busca textual e filtros por categoria, cidade, bairro e ordenação por data.
 *
 * BIBLIOTECAS UTILIZADAS:
 * 1. Lucide React (^0.383.0): Ícones para busca, local e navegação.
 *    Doc Oficial: https://lucide.dev/
 * 2. Next.js (^14.2.3): Framework React com App Router.
 *    Doc Oficial: https://nextjs.org/docs
 * 3. Axios (^1.7.2): Requisições HTTP REST à API backend.
 *    Doc Oficial: https://axios-http.com/docs/intro
 */

import React, { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { ArrowLeft, Search, Inbox, AlertCircle, MapPin, ChevronRight, X } from 'lucide-react';
import api from '@/services/api';
import NotificationBell from '@/components/NotificationBell';

interface Oportunidade {
  id: string;
  titulo: string;
  categoria: string | null;
  cidade: string | null;
  bairro: string | null;
  descricao: string;
  orcamento_cliente: string | null;
  created_at: string;
}

interface Local {
  cidade: string;
  bairro: string;
}

const FILTROS_INICIAIS = { busca: '', categoria: '', cidade: '', bairro: '', ordenacao: 'recentes' };

function formatarOrcamento(valor: string | null) {
  if (valor === null) return 'A combinar';
  return Number(valor).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
}

function formatarData(iso: string) {
  return new Date(iso).toLocaleDateString('pt-BR', { day: '2-digit', month: 'short', year: 'numeric' });
}

export default function FeedOportunidadesPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const filtrosDaUrl = { ...FILTROS_INICIAIS, busca: searchParams.get('busca') || '' };

  const [formulario, setFormulario] = useState(filtrosDaUrl);
  const [filtrosAplicados, setFiltrosAplicados] = useState(filtrosDaUrl);
  const [oportunidades, setOportunidades] = useState<Oportunidade[]>([]);
  const [categorias, setCategorias] = useState<string[]>([]);
  const [locais, setLocais] = useState<Local[]>([]);
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState('');
  const [logado, setLogado] = useState(false);

  useEffect(() => {
    setLogado(!!localStorage.getItem('@ServicoFacil:token'));
  }, []);

  // O feed é público (como um classificado): não exige login pra visualizar, só pra enviar proposta.
  useEffect(() => {
    let cancelado = false;
    setCarregando(true);
    setErro('');

    api
      .get('/prestador/oportunidades', { params: filtrosAplicados })
      .then((response) => {
        if (cancelado) return;
        setOportunidades(response.data.dados);
        setCategorias(response.data.filtrosDisponiveis.categorias);
        setLocais(response.data.filtrosDisponiveis.locais);
      })
      .catch((err) => {
        if (cancelado) return;
        if (err.response?.status === 401) {
          localStorage.removeItem('@ServicoFacil:token');
          localStorage.removeItem('@ServicoFacil:user');
          router.replace('/login');
          return;
        }
        setErro(err.response?.data?.message || 'Não foi possível carregar o feed de oportunidades.');
      })
      .finally(() => {
        if (!cancelado) setCarregando(false);
      });

    return () => {
      cancelado = true;
    };
  }, [filtrosAplicados]);

  const cidadesDisponiveis = useMemo(() => {
    return Array.from(new Set(locais.map((l) => l.cidade)));
  }, [locais]);

  const bairrosDisponiveis = useMemo(() => {
    return Array.from(new Set(locais.filter((l) => !formulario.cidade || l.cidade === formulario.cidade).map((l) => l.bairro)));
  }, [formulario.cidade, locais]);

  function alterarCampo(e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) {
    const { name, value } = e.target;
    setFormulario((atual) => ({ ...atual, [name]: value, ...(name === 'cidade' ? { bairro: '' } : {}) }));
    if (name !== 'busca') {
      setFiltrosAplicados((atual) => ({ ...atual, [name]: value, ...(name === 'cidade' ? { bairro: '' } : {}) }));
    }
  }

  function aplicarBusca(e: React.FormEvent) {
    e.preventDefault();
    setFiltrosAplicados(formulario);
  }

  function limparFiltros() {
    setFormulario(FILTROS_INICIAIS);
    setFiltrosAplicados(FILTROS_INICIAIS);
  }

  return (
    <main style={{ maxWidth: '960px', margin: '2rem auto', padding: '0 1.5rem 4rem' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.5rem' }}>
        <Link href="/" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
          <ArrowLeft size={16} /> Voltar para a página inicial
        </Link>
        {logado && <NotificationBell />}
      </div>

      <header style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <span style={{ color: '#34d399', fontSize: '0.8rem', fontWeight: 600, letterSpacing: '0.05em', textTransform: 'uppercase' }}>
            Área do prestador
          </span>
          <h1 style={{ fontSize: '1.6rem', fontWeight: 700, margin: '0.25rem 0' }}>Oportunidades de Serviços</h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>Encontre solicitações abertas compatíveis com sua atuação e região.</p>
        </div>
        <div style={{ textAlign: 'right' }}>
          <strong style={{ fontSize: '1.5rem' }}>{carregando ? '—' : oportunidades.length}</strong>
          <div style={{ color: 'var(--text-secondary)', fontSize: '0.8rem' }}>{oportunidades.length === 1 ? 'oportunidade' : 'oportunidades'}</div>
        </div>
      </header>

      {/* ── Filtros ─────────────────────────────── */}
      <form onSubmit={aplicarBusca} style={{
        display: 'flex', gap: '0.75rem', flexWrap: 'wrap', alignItems: 'flex-end',
        background: 'var(--card-bg)', border: '1px solid var(--card-border)',
        borderRadius: 'var(--border-radius)', padding: '1.25rem', marginBottom: '1.5rem',
      }}>
        <div style={{ flex: '1 1 200px' }}>
          <label style={campoLabel}>Buscar serviço</label>
          <div style={{ position: 'relative' }}>
            <Search size={16} style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)', color: '#64748b' }} />
            <input name="busca" value={formulario.busca} onChange={alterarCampo} placeholder="Ex.: instalação elétrica" style={{ ...campoInput, paddingLeft: '2.2rem' }} />
          </div>
        </div>

        <div style={{ flex: '0 1 160px' }}>
          <label style={campoLabel}>Categoria</label>
          <select name="categoria" value={formulario.categoria} onChange={alterarCampo} style={campoInput}>
            <option value="">Todas</option>
            {categorias.map((c) => <option key={c} value={c}>{c}</option>)}
          </select>
        </div>

        <div style={{ flex: '0 1 160px' }}>
          <label style={campoLabel}>Cidade</label>
          <select name="cidade" value={formulario.cidade} onChange={alterarCampo} style={campoInput}>
            <option value="">Todas</option>
            {cidadesDisponiveis.map((c) => <option key={c} value={c}>{c}</option>)}
          </select>
        </div>

        <div style={{ flex: '0 1 160px' }}>
          <label style={campoLabel}>Bairro</label>
          <select name="bairro" value={formulario.bairro} onChange={alterarCampo} style={campoInput}>
            <option value="">Todos</option>
            {bairrosDisponiveis.map((b) => <option key={b} value={b}>{b}</option>)}
          </select>
        </div>

        <div style={{ flex: '0 1 160px' }}>
          <label style={campoLabel}>Ordenar</label>
          <select name="ordenacao" value={formulario.ordenacao} onChange={alterarCampo} style={campoInput}>
            <option value="recentes">Mais recentes</option>
            <option value="antigas">Mais antigas</option>
          </select>
        </div>

        <button type="submit" style={{ padding: '0.6rem 1.1rem', background: '#10b981', color: '#fff', border: 'none', borderRadius: '8px', fontWeight: 600, fontSize: '0.9rem', cursor: 'pointer' }}>
          Buscar
        </button>
        <button type="button" onClick={limparFiltros} style={{ display: 'inline-flex', alignItems: 'center', gap: '0.3rem', padding: '0.6rem 1rem', background: 'transparent', border: '1px solid #334155', color: '#94a3b8', borderRadius: '8px', fontSize: '0.9rem', cursor: 'pointer' }}>
          <X size={14} /> Limpar
        </button>
      </form>

      {carregando && <div style={{ textAlign: 'center', color: 'var(--text-secondary)', padding: '3rem 0' }}>Carregando oportunidades...</div>}

      {!carregando && erro && (
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', background: 'rgba(239, 68, 68, 0.15)', border: '1px solid var(--danger-color)', color: '#fca5a5', padding: '1rem', borderRadius: '8px', fontSize: '0.9rem' }}>
          <AlertCircle size={20} /> <span>{erro}</span>
        </div>
      )}

      {!carregando && !erro && oportunidades.length === 0 && (
        <div style={{ textAlign: 'center', padding: '3rem 1rem', color: 'var(--text-secondary)', background: 'var(--card-bg)', border: '1px solid var(--card-border)', borderRadius: 'var(--border-radius)' }}>
          <Inbox size={32} style={{ marginBottom: '0.75rem', opacity: 0.6 }} />
          <p>Nenhuma oportunidade encontrada com os filtros atuais.</p>
        </div>
      )}

      {!carregando && !erro && oportunidades.length > 0 && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.9rem' }}>
          {oportunidades.map((o) => (
            <Link key={o.id} href={`/oportunidades/${o.id}`} style={{
              display: 'flex', justifyContent: 'space-between', gap: '1.5rem', flexWrap: 'wrap',
              textDecoration: 'none', color: 'inherit',
              background: 'var(--card-bg)', border: '1px solid var(--card-border)',
              borderRadius: 'var(--border-radius)', padding: '1.25rem',
            }}>
              <div style={{ flex: '1 1 320px' }}>
                <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '0.6rem' }}>
                  <span style={{ padding: '0.25rem 0.7rem', borderRadius: '20px', fontSize: '0.75rem', fontWeight: 600, background: 'rgba(59,130,246,0.15)', color: '#60a5fa' }}>Aberta</span>
                  {o.categoria && <span style={{ padding: '0.25rem 0.7rem', borderRadius: '20px', fontSize: '0.75rem', fontWeight: 600, background: '#1e293b', color: '#cbd5e1' }}>{o.categoria}</span>}
                </div>
                <h2 style={{ fontSize: '1.05rem', fontWeight: 700, margin: '0 0 0.4rem' }}>{o.titulo}</h2>
                <p style={{
                  color: 'var(--text-secondary)', fontSize: '0.875rem', margin: 0,
                  overflow: 'hidden', textOverflow: 'ellipsis', display: '-webkit-box',
                  WebkitLineClamp: 2, WebkitBoxOrient: 'vertical',
                }}>
                  {o.descricao}
                </p>
              </div>

              <div style={{ textAlign: 'right', flex: '0 0 auto' }}>
                <span style={{ display: 'block', color: '#64748b', fontSize: '0.75rem' }}>Orçamento do cliente</span>
                <strong style={{ fontSize: '1.05rem' }}>{formatarOrcamento(o.orcamento_cliente)}</strong>
                <div style={{ display: 'flex', alignItems: 'center', gap: '4px', justifyContent: 'flex-end', color: '#94a3b8', fontSize: '0.8rem', marginTop: '0.5rem' }}>
                  <MapPin size={13} /> {o.bairro}, {o.cidade}
                </div>
                <div style={{ color: '#64748b', fontSize: '0.78rem', marginTop: '2px' }}>Publicada em {formatarData(o.created_at)}</div>
                <span style={{ display: 'inline-flex', alignItems: 'center', gap: '3px', color: '#34d399', fontSize: '0.85rem', fontWeight: 600, marginTop: '0.5rem' }}>
                  Ver oportunidade <ChevronRight size={14} />
                </span>
              </div>
            </Link>
          ))}
        </div>
      )}
    </main>
  );
}

const campoLabel: React.CSSProperties = { display: 'block', fontSize: '0.8rem', color: 'var(--text-secondary)', marginBottom: '0.4rem' };
const campoInput: React.CSSProperties = { width: '100%', padding: '0.6rem 0.75rem', background: '#0f172a', border: '1px solid #334155', borderRadius: '8px', color: '#fff', fontSize: '0.9rem' };
