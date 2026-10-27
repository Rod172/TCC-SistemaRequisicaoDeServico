'use client';

/**
 * @file oportunidades/page.tsx
 * @description Feed de oportunidades de serviço para o Prestador (US08): lista solicitações abertas,
 * com busca textual e filtros por categoria, cidade, bairro e ordenação por data. Layout da US39:
 * filtros numa coluna lateral, filtros ativos como etiquetas removíveis e resultados em grade.
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
import { ArrowRight, Filter, Inbox, MapPin, X } from 'lucide-react';
import api from '@/services/api';
import Pagina, { CabecalhoPagina } from '@/components/ui/Pagina';
import { Chip, EstadoLista, STATUS_SOLICITACAO } from '@/components/ui/Elementos';

interface Oportunidade {
  status: 'ABERTA' | 'EM_NEGOCIACAO';
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
type Filtros = typeof FILTROS_INICIAIS;

function formatarOrcamento(valor: string | null) {
  if (valor === null) return 'A combinar';
  return Number(valor).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
}

function formatarData(iso: string) {
  return new Date(iso).toLocaleDateString('pt-BR', { day: '2-digit', month: 'short', year: 'numeric' });
}

export default function FeedOportunidadesPage() {
  return <React.Suspense fallback={<main role="status" style={{ padding: '2rem' }}>Carregando oportunidades…</main>}><ConteudoOportunidades /></React.Suspense>;
}

function ConteudoOportunidades() {
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
    // eslint-disable-next-line react-hooks/exhaustive-deps
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

  function removerFiltro(campo: keyof Filtros) {
    const limpo = { [campo]: '', ...(campo === 'cidade' ? { bairro: '' } : {}) };
    setFormulario((atual) => ({ ...atual, ...limpo }));
    setFiltrosAplicados((atual) => ({ ...atual, ...limpo }));
  }

  const filtrosAtivos = (['busca', 'categoria', 'cidade', 'bairro'] as const)
    .filter((campo) => filtrosAplicados[campo])
    .map((campo) => ({ campo, valor: campo === 'busca' ? `“${filtrosAplicados.busca}”` : filtrosAplicados[campo] }));

  return (
    <Pagina>
      <CabecalhoPagina
        area="Área do prestador"
        titulo="Oportunidades"
        subtitulo="Pedidos que ainda aceitam propostas. Filtre pela sua área e pela região onde você atende."
        acoes={(
          <span className="texto-apoio" aria-live="polite">
            <strong style={{ fontSize: '1.4rem', color: 'var(--text-primary)' }}>{carregando ? '—' : oportunidades.length}</strong>{' '}
            {oportunidades.length === 1 ? 'pedido encontrado' : 'pedidos encontrados'}
          </span>
        )}
      />

      <div className="layout-lateral">
        <form onSubmit={aplicarBusca} aria-label="Filtros" className="lateral estreita card empilhado" style={{ order: 0, gap: '0.9rem' }}>
          <h2 className="titulo-cartao" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}><Filter size={16} aria-hidden="true" /> Filtros</h2>
          <div className="campo-grupo">
            <label htmlFor="filtro-busca" className="rotulo" style={{ fontSize: '0.82rem' }}>Buscar serviço</label>
            <input id="filtro-busca" name="busca" type="search" value={formulario.busca} onChange={alterarCampo} placeholder="Ex.: instalação elétrica" className="campo" style={{ minHeight: '44px', fontSize: '0.9rem' }} />
          </div>
          <div className="campo-grupo">
            <label htmlFor="filtro-categoria" className="rotulo" style={{ fontSize: '0.82rem' }}>Categoria</label>
            <select id="filtro-categoria" name="categoria" value={formulario.categoria} onChange={alterarCampo} className="campo" style={{ minHeight: '44px', fontSize: '0.9rem' }}>
              <option value="">Todas</option>
              {categorias.map((c) => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>
          <div className="campo-grupo">
            <label htmlFor="filtro-cidade" className="rotulo" style={{ fontSize: '0.82rem' }}>Cidade</label>
            <select id="filtro-cidade" name="cidade" value={formulario.cidade} onChange={alterarCampo} className="campo" style={{ minHeight: '44px', fontSize: '0.9rem' }}>
              <option value="">Todas</option>
              {cidadesDisponiveis.map((c) => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>
          <div className="campo-grupo">
            <label htmlFor="filtro-bairro" className="rotulo" style={{ fontSize: '0.82rem' }}>Bairro</label>
            <select id="filtro-bairro" name="bairro" value={formulario.bairro} onChange={alterarCampo} className="campo" style={{ minHeight: '44px', fontSize: '0.9rem' }}>
              <option value="">Todos</option>
              {bairrosDisponiveis.map((b) => <option key={b} value={b}>{b}</option>)}
            </select>
          </div>
          <div className="campo-grupo">
            <label htmlFor="filtro-ordem" className="rotulo" style={{ fontSize: '0.82rem' }}>Ordenar</label>
            <select id="filtro-ordem" name="ordenacao" value={formulario.ordenacao} onChange={alterarCampo} className="campo" style={{ minHeight: '44px', fontSize: '0.9rem' }}>
              <option value="recentes">Mais recentes</option>
              <option value="antigas">Mais antigas</option>
            </select>
          </div>
          <button type="submit" className="btn btn-primario">Buscar</button>
          <button type="button" onClick={limparFiltros} className="btn btn-texto discreto">Limpar filtros</button>
        </form>

        <section aria-label="Resultados" className="principal" style={{ gap: '0.9rem' }}>
          {filtrosAtivos.length > 0 && (
            <div className="chips" style={{ gap: '0.5rem' }}>
              <span className="texto-apoio" style={{ fontSize: '0.82rem' }}>Filtrando por:</span>
              {filtrosAtivos.map((f) => (
                <button key={f.campo} type="button" onClick={() => removerFiltro(f.campo)} aria-label={`Remover filtro ${f.valor}`} className="btn" style={{ minHeight: '34px', padding: '0 0.7rem', borderRadius: '999px', border: '1px solid var(--info-border)', background: 'var(--primary-tint)', color: 'var(--info-text)', fontSize: '0.82rem' }}>
                  {f.valor} <X size={13} aria-hidden="true" />
                </button>
              ))}
            </div>
          )}

          {carregando && <EstadoLista tipo="carregando">Carregando oportunidades...</EstadoLista>}
          {!carregando && erro && <EstadoLista tipo="erro" acao={<button type="button" className="btn btn-secundario" onClick={() => setFiltrosAplicados({ ...filtrosAplicados })}>Tentar novamente</button>}>{erro}</EstadoLista>}
          {!carregando && !erro && oportunidades.length === 0 && (
            <EstadoLista tipo="vazio" icone={<Inbox size={28} aria-hidden="true" />} acao={filtrosAtivos.length > 0 ? <button type="button" className="btn btn-secundario" onClick={limparFiltros}>Limpar filtros</button> : undefined}>
              Nenhuma oportunidade encontrada com os filtros atuais.
            </EstadoLista>
          )}

          {!carregando && !erro && oportunidades.length > 0 && (
            <ul style={{ listStyle: 'none', display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(min(100%, 300px), 1fr))', gap: '0.9rem' }}>
              {oportunidades.map((o) => (
                <li key={o.id} className="card" style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem', padding: '1.1rem' }}>
                  <span style={{ display: 'flex', justifyContent: 'space-between', gap: '0.5rem', flexWrap: 'wrap', alignItems: 'center' }}>
                    <span className="chips">
                      <Chip status={o.status} mapa={STATUS_SOLICITACAO} />
                      {o.categoria && <span className="chip categoria">{o.categoria}</span>}
                    </span>
                    <span className="texto-apoio" style={{ fontSize: '0.75rem' }}>{formatarData(o.created_at)}</span>
                  </span>
                  <Link href={`/oportunidades/${o.id}`} style={{ fontSize: '1.05rem', fontWeight: 700, lineHeight: 1.35, color: 'var(--text-primary)', overflowWrap: 'anywhere' }}>{o.titulo}</Link>
                  <p className="texto-apoio" style={{ lineHeight: 1.5, overflow: 'hidden', textOverflow: 'ellipsis', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical' }}>{o.descricao}</p>
                  <span className="texto-apoio" style={{ display: 'flex', gap: '0.35rem', alignItems: 'center', fontSize: '0.82rem' }}>
                    <MapPin size={14} aria-hidden="true" /> {[o.bairro, o.cidade].filter(Boolean).join(', ') || 'Local não informado'}
                  </span>
                  <span style={{ marginTop: 'auto', display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '0.5rem', paddingTop: '0.75rem', borderTop: '1px solid var(--card-border)', flexWrap: 'wrap' }}>
                    <span style={{ display: 'flex', flexDirection: 'column' }}>
                      <span className="texto-apoio" style={{ fontSize: '0.75rem' }}>Orçamento do cliente</span>
                      <strong>{formatarOrcamento(o.orcamento_cliente)}</strong>
                    </span>
                    <Link href={`/oportunidades/${o.id}`} className="btn btn-primario" style={{ minHeight: '40px' }} aria-label={`Ver e propor: ${o.titulo}`}>
                      Ver e propor <ArrowRight size={15} aria-hidden="true" />
                    </Link>
                  </span>
                </li>
              ))}
            </ul>
          )}
        </section>
      </div>
    </Pagina>
  );
}
