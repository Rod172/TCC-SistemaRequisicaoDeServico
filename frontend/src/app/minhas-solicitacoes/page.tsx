'use client';

/**
 * @file minhas-solicitacoes/page.tsx
 * @description Painel "Minhas Solicitações" (US06): lista as solicitações do solicitante autenticado,
 * com busca por título e contagem de propostas recebidas por card. No layout da US39, o filtro de
 * status virou abas com a contagem de cada status (calculada sobre a lista carregada), um aviso
 * destaca os pedidos em andamento (com propostas ou contratados) e cada card mostra a próxima ação.
 *
 * BIBLIOTECAS UTILIZADAS:
 * 1. Lucide React (^0.383.0): Ícones para status, busca e navegação.
 *    Doc Oficial: https://lucide.dev/
 * 2. Next.js (^14.2.3): Framework React com App Router.
 *    Doc Oficial: https://nextjs.org/docs
 * 3. Axios (^1.7.2): Requisições HTTP REST à API backend.
 *    Doc Oficial: https://axios-http.com/docs/intro
 */

import React, { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { Bell, Inbox, Plus, Search, X } from 'lucide-react';
import api from '@/services/api';
import Pagina, { CabecalhoPagina } from '@/components/ui/Pagina';
import { Chip, EstadoLista, STATUS_SOLICITACAO } from '@/components/ui/Elementos';
import { PedidoResumo, precisaDeAcao, proximaAcao } from '@/components/home/comum';

interface SolicitacaoResumo extends PedidoResumo {
  descricao: string;
}

const ABAS = [
  { value: '', label: 'Todas' },
  { value: 'ABERTA', label: 'Abertas' },
  { value: 'EM_NEGOCIACAO', label: 'Em negociação' },
  { value: 'CONTRATADA', label: 'Contratadas' },
  { value: 'CONCLUIDA', label: 'Concluídas' },
  { value: 'CANCELADA', label: 'Canceladas' },
];

function formatarData(iso: string) {
  return new Date(iso).toLocaleDateString('pt-BR', { day: '2-digit', month: 'short', year: 'numeric' });
}

export default function MinhasSolicitacoesPage() {
  return <React.Suspense fallback={<main role="status" style={{ padding: '2rem' }}>Carregando solicitações…</main>}><ConteudoMinhasSolicitacoes /></React.Suspense>;
}

function ConteudoMinhasSolicitacoes() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const buscaInicial = searchParams.get('busca') || '';

  const [solicitacoes, setSolicitacoes] = useState<SolicitacaoResumo[]>([]);
  const [status, setStatus] = useState('');
  const [soAtencao, setSoAtencao] = useState(false);
  const [buscaDigitada, setBuscaDigitada] = useState(buscaInicial);
  const [busca, setBusca] = useState(buscaInicial);
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState('');
  const [tentativa, setTentativa] = useState(0);

  useEffect(() => {
    const token = localStorage.getItem('@ServicoFacil:token');
    if (!token) {
      router.replace('/login');
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // A lista vem inteira (filtrada só pela busca) para as abas mostrarem a contagem de cada status;
  // a troca de aba filtra no próprio navegador, sem nova requisição.
  useEffect(() => {
    if (!localStorage.getItem('@ServicoFacil:token')) return;

    let cancelado = false;
    setCarregando(true);
    setErro('');

    api
      .get('/solicitacoes/minhas', { params: { busca } })
      .then((response) => {
        if (!cancelado) setSolicitacoes(response.data.data);
      })
      .catch((err) => {
        if (cancelado) return;
        if (err.response?.status === 401) {
          localStorage.removeItem('@ServicoFacil:token');
          localStorage.removeItem('@ServicoFacil:user');
          router.replace('/login');
          return;
        }
        setErro(err.response?.data?.message || 'Não foi possível carregar suas solicitações.');
      })
      .finally(() => {
        if (!cancelado) setCarregando(false);
      });

    return () => {
      cancelado = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [busca, tentativa]);

  const contagem = useMemo(() => {
    const porStatus: Record<string, number> = { '': solicitacoes.length };
    solicitacoes.forEach((s) => { porStatus[s.status] = (porStatus[s.status] || 0) + 1; });
    return porStatus;
  }, [solicitacoes]);

  const precisam = solicitacoes.filter(precisaDeAcao);
  const visiveis = solicitacoes
    .filter((s) => !status || s.status === status)
    .filter((s) => !soAtencao || precisaDeAcao(s));

  function pesquisar(e: React.FormEvent) {
    e.preventDefault();
    setBusca(buscaDigitada.trim());
  }

  function limparFiltros() {
    setStatus('');
    setSoAtencao(false);
    setBuscaDigitada('');
    setBusca('');
  }

  const filtrando = Boolean(status || busca || soAtencao);

  return (
    <Pagina>
      <CabecalhoPagina
        titulo="Minhas solicitações"
        subtitulo="Acompanhe cada pedido e veja o que fazer a seguir."
        acoes={<Link href="/nova-solicitacao" className="btn btn-primario btn-grande"><Plus size={16} aria-hidden="true" /> Nova solicitação</Link>}
      />

      {!carregando && !erro && precisam.length > 0 && (
        <div className="aviso aviso-alerta" style={{ alignItems: 'center', flexWrap: 'wrap' }}>
          <Bell size={18} aria-hidden="true" />
          <span style={{ flex: '1 1 280px' }}>
            <strong>{precisam.length === 1 ? '1 pedido em andamento' : `${precisam.length} pedidos em andamento`}:</strong>{' '}
            com propostas recebidas ou com serviço contratado, que você confirma ao terminar.
          </span>
          <button type="button" className="btn btn-texto" aria-pressed={soAtencao} onClick={() => setSoAtencao((v) => !v)} style={{ color: 'var(--warning-soft-text)' }}>
            {soAtencao ? 'Mostrar todos' : 'Mostrar só esses'}
          </button>
        </div>
      )}

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', gap: '0.75rem', flexWrap: 'wrap', borderBottom: '1px solid var(--card-border)' }}>
        <div role="tablist" aria-label="Filtrar por status" className="abas" style={{ borderBottom: 0 }}>
          {ABAS.map((aba) => (
            <button key={aba.value || 'todas'} type="button" role="tab" className="aba" aria-selected={status === aba.value} onClick={() => setStatus(aba.value)}>
              {aba.label}<span className="contagem">{carregando ? '·' : contagem[aba.value] || 0}</span>
            </button>
          ))}
        </div>
        <form onSubmit={pesquisar} role="search" style={{ display: 'flex', gap: '0.5rem', paddingBottom: '0.5rem', flexWrap: 'wrap' }}>
          <div style={{ position: 'relative' }}>
            <label htmlFor="busca-solicitacoes" className="sr-only">Buscar pelo título</label>
            <Search size={16} aria-hidden="true" style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-secondary)' }} />
            <input id="busca-solicitacoes" type="search" value={buscaDigitada} onChange={(e) => setBuscaDigitada(e.target.value)} placeholder="Buscar pelo título" className="campo" style={{ width: '240px', minHeight: '42px', paddingLeft: '2.3rem', fontSize: '0.9rem' }} />
          </div>
          <button type="submit" className="btn btn-secundario" style={{ minHeight: '42px' }}>Buscar</button>
          {filtrando && <button type="button" onClick={limparFiltros} className="btn btn-texto discreto" style={{ minHeight: '42px' }}><X size={14} aria-hidden="true" /> Limpar</button>}
        </form>
      </div>

      {carregando && <EstadoLista tipo="carregando">Carregando solicitações...</EstadoLista>}

      {!carregando && erro && (
        <EstadoLista tipo="erro" acao={<button type="button" className="btn btn-secundario" onClick={() => setTentativa((n) => n + 1)}>Tentar novamente</button>}>
          {erro}
        </EstadoLista>
      )}

      {!carregando && !erro && visiveis.length === 0 && (
        <EstadoLista
          tipo="vazio" icone={<Inbox size={28} aria-hidden="true" />}
          acao={solicitacoes.length === 0 && !busca
            ? <Link href="/nova-solicitacao" className="btn btn-primario">Publicar o primeiro pedido</Link>
            : <button type="button" className="btn btn-secundario" onClick={limparFiltros}>Limpar filtros</button>}
        >
          {solicitacoes.length === 0 && !busca ? 'Você ainda não publicou nenhum pedido.' : 'Nenhuma solicitação encontrada com os filtros atuais.'}
        </EstadoLista>
      )}

      {!carregando && !erro && visiveis.length > 0 && (
        <ul className="lista-simples">
          {visiveis.map((s) => {
            const acao = proximaAcao(s);
            const atencao = precisaDeAcao(s);
            return (
              <li key={s.id} className={`card ${atencao ? 'alerta' : ''}`} style={{ display: 'flex', flexWrap: 'wrap', gap: '1rem', alignItems: 'center', padding: '1.1rem 1.25rem' }}>
                <div style={{ flex: '1 1 340px', minWidth: 0, display: 'flex', flexDirection: 'column', gap: '0.45rem' }}>
                  <span className="chips">
                    <Chip status={s.status} mapa={STATUS_SOLICITACAO} />
                    <span className="texto-apoio" style={{ fontSize: '0.8rem' }}>publicado em {formatarData(s.created_at)}</span>
                  </span>
                  <Link href={`/minhas-solicitacoes/${s.id}`} style={{ fontSize: '1.05rem', fontWeight: 700, lineHeight: 1.35, color: 'var(--text-primary)', overflowWrap: 'anywhere' }}>
                    {s.titulo}
                  </Link>
                  <span style={{ fontSize: '0.875rem', color: atencao ? 'var(--warning-text)' : 'var(--text-secondary)' }}>{acao.info}</span>
                </div>
                <Link href={`/minhas-solicitacoes/${s.id}`} className={`btn ${acao.primaria ? 'btn-primario' : 'btn-secundario'}`} aria-label={`${acao.texto}: ${s.titulo}`}>
                  {acao.texto}
                </Link>
              </li>
            );
          })}
        </ul>
      )}
    </Pagina>
  );
}
