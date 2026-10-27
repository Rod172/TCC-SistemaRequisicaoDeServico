'use client';

/**
 * @file minhas-propostas/page.tsx
 * @description Painel "Minhas Propostas Enviadas" do Prestador (US28): lista todas as propostas
 * enviadas, com destaque visual para as aceitas. No layout da US39, o filtro de status virou abas com
 * contagem (calculada sobre a lista carregada) e cada proposta mostra valor, prazo, validade e o que
 * fazer a seguir.
 *
 * BIBLIOTECAS UTILIZADAS:
 * 1. Lucide React (^0.383.0): Ícones de status e navegação.
 *    Doc Oficial: https://lucide.dev/
 * 2. Next.js (^14.2.3): Framework React com App Router.
 *    Doc Oficial: https://nextjs.org/docs
 * 3. Axios (^1.7.2): Requisições HTTP REST à API backend.
 *    Doc Oficial: https://axios-http.com/docs/intro
 */

import React, { useCallback, useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ArrowRight, Inbox } from 'lucide-react';
import api from '@/services/api';
import Pagina, { CabecalhoPagina } from '@/components/ui/Pagina';
import { Chip, EstadoLista, STATUS_PROPOSTA } from '@/components/ui/Elementos';

interface PropostaResumo {
  id: string;
  valor: string;
  prazo_dias: number;
  status: 'ENVIADA' | 'EM_ANALISE' | 'ACEITA' | 'RECUSADA';
  validade_ate?: string;
  created_at: string;
  solicitacao: { id: string; titulo: string; status: string };
}

const ABAS = [
  { valor: '', rotulo: 'Todas', filtro: () => true },
  { valor: 'AGUARDANDO', rotulo: 'Aguardando cliente', filtro: (p: PropostaResumo) => p.status === 'ENVIADA' || p.status === 'EM_ANALISE' },
  { valor: 'ACEITA', rotulo: 'Aceitas', filtro: (p: PropostaResumo) => p.status === 'ACEITA' },
  { valor: 'RECUSADA', rotulo: 'Recusadas', filtro: (p: PropostaResumo) => p.status === 'RECUSADA' },
];

function formatarValor(valor: string) {
  return Number(valor).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
}

function formatarData(iso: string) {
  return new Date(iso).toLocaleDateString('pt-BR', { day: '2-digit', month: 'short', year: 'numeric' });
}

/** O que a proposta pede agora, em uma frase, e se ela merece destaque. */
function situacao(p: PropostaResumo, agora: number): { texto: string; tipo: 'sucesso' | 'alerta' | 'neutro' } {
  if (p.status === 'ACEITA') {
    if (p.solicitacao.status === 'CONTRATADA') return { texto: 'Você foi contratado. O pagamento fica retido com garantia e é liberado quando o serviço for concluído.', tipo: 'sucesso' };
    if (p.solicitacao.status === 'CONCLUIDA') return { texto: 'Serviço concluído.', tipo: 'neutro' };
    return { texto: 'Proposta aceita.', tipo: 'neutro' };
  }
  if (p.status === 'RECUSADA') return { texto: 'O cliente escolheu outra proposta.', tipo: 'neutro' };
  if (p.validade_ate && new Date(p.validade_ate).getTime() <= agora) return { texto: 'A validade comercial expirou: o cliente não pode mais aceitar.', tipo: 'neutro' };
  if (p.status === 'EM_ANALISE') return { texto: 'O cliente está negociando. Abra a proposta para ver se há contraproposta para responder.', tipo: 'alerta' };
  return { texto: 'Aguardando o cliente analisar.', tipo: 'neutro' };
}

export default function MinhasPropostasPage() {
  const router = useRouter();
  const [propostas, setPropostas] = useState<PropostaResumo[]>([]);
  const [aba, setAba] = useState('');
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState('');
  const [agora] = useState(() => Date.now());

  // A lista vem inteira para as abas mostrarem a contagem de cada status; a troca de aba filtra no navegador.
  const carregar = useCallback(async () => {
    setCarregando(true);
    setErro('');
    try {
      const response = await api.get('/prestador/propostas');
      setPropostas(response.data.dados);
    } catch (err: any) {
      if (err.response?.status === 401) {
        localStorage.removeItem('@ServicoFacil:token');
        localStorage.removeItem('@ServicoFacil:user');
        router.replace('/login');
        return;
      }
      setErro(err.response?.data?.message || 'Não foi possível carregar suas propostas.');
    } finally {
      setCarregando(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    const token = localStorage.getItem('@ServicoFacil:token');
    if (!token) {
      router.replace('/login');
      return;
    }
    carregar();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [carregar]);

  const contagem = useMemo(() => Object.fromEntries(ABAS.map((a) => [a.valor, propostas.filter(a.filtro).length])), [propostas]);
  const abaAtual = ABAS.find((a) => a.valor === aba) || ABAS[0];
  const visiveis = propostas.filter(abaAtual.filtro);

  return (
    <Pagina>
      <CabecalhoPagina
        area="Área do prestador"
        titulo="Minhas propostas"
        subtitulo="Tudo o que você já propôs, com o que fazer a seguir."
        acoes={<Link href="/oportunidades" className="btn btn-secundario">Buscar oportunidades <ArrowRight size={16} aria-hidden="true" /></Link>}
      />

      <div role="tablist" aria-label="Filtrar por status" className="abas">
        {ABAS.map((a) => (
          <button key={a.valor || 'todas'} type="button" role="tab" className="aba" aria-selected={aba === a.valor} onClick={() => setAba(a.valor)}>
            {a.rotulo}<span className="contagem">{carregando ? '·' : contagem[a.valor]}</span>
          </button>
        ))}
      </div>

      {carregando && <EstadoLista tipo="carregando">Carregando propostas...</EstadoLista>}
      {!carregando && erro && <EstadoLista tipo="erro" acao={<button type="button" className="btn btn-secundario" onClick={carregar}>Tentar novamente</button>}>{erro}</EstadoLista>}
      {!carregando && !erro && visiveis.length === 0 && (
        <EstadoLista tipo="vazio" icone={<Inbox size={28} aria-hidden="true" />} acao={propostas.length === 0 ? <Link href="/oportunidades" className="btn btn-primario">Ver oportunidades</Link> : undefined}>
          Nenhuma proposta encontrada{aba ? ' com esse status' : ' ainda'}.
        </EstadoLista>
      )}

      {!carregando && !erro && visiveis.length > 0 && (
        <ul className="lista-simples">
          {visiveis.map((p) => {
            const s = situacao(p, agora);
            const expirada = Boolean(p.validade_ate && new Date(p.validade_ate).getTime() <= agora && ['ENVIADA', 'EM_ANALISE'].includes(p.status));
            return (
              <li key={p.id} className={`card empilhado ${s.tipo === 'sucesso' ? 'sucesso' : s.tipo === 'alerta' ? 'alerta' : ''}`} style={{ gap: '0.75rem', padding: '1.1rem 1.25rem' }}>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '1rem', alignItems: 'center' }}>
                  <div style={{ flex: '1 1 320px', minWidth: 0, display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
                    <span className="chips">
                      <Chip status={p.status} mapa={STATUS_PROPOSTA} />
                      <span className="texto-apoio" style={{ fontSize: '0.8rem' }}>enviada em {formatarData(p.created_at)}</span>
                    </span>
                    <Link href={`/oportunidades/${p.solicitacao.id}`} style={{ fontSize: '1.05rem', fontWeight: 700, lineHeight: 1.35, color: 'var(--text-primary)', overflowWrap: 'anywhere' }}>{p.solicitacao.titulo}</Link>
                  </div>
                  <dl style={{ display: 'flex', gap: '1.3rem', flexWrap: 'wrap' }}>
                    <div><dt className="texto-apoio" style={{ fontSize: '0.75rem' }}>Sua proposta</dt><dd style={{ fontSize: '1.15rem', fontWeight: 800 }}>{formatarValor(p.valor)}</dd></div>
                    <div><dt className="texto-apoio" style={{ fontSize: '0.75rem' }}>Prazo</dt><dd style={{ fontWeight: 600, paddingTop: '3px' }}>{p.prazo_dias} {p.prazo_dias === 1 ? 'dia' : 'dias'}</dd></div>
                    {p.validade_ate && (
                      <div><dt className="texto-apoio" style={{ fontSize: '0.75rem' }}>Válida até</dt><dd style={{ fontWeight: 600, paddingTop: '3px', color: expirada ? 'var(--danger-text)' : undefined }}>{formatarData(p.validade_ate)}</dd></div>
                    )}
                  </dl>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '0.75rem', flexWrap: 'wrap' }}>
                  <span style={{ fontSize: '0.875rem', color: s.tipo === 'sucesso' ? 'var(--success-text)' : s.tipo === 'alerta' ? 'var(--warning-text)' : 'var(--text-secondary)', flex: '1 1 260px' }}>{s.texto}</span>
                  <Link href={`/oportunidades/${p.solicitacao.id}`} className={`btn ${s.tipo === 'neutro' ? 'btn-secundario' : 'btn-primario'}`} aria-label={`Ver detalhes: ${p.solicitacao.titulo}`}>
                    {p.status === 'ACEITA' && p.solicitacao.status === 'CONTRATADA' ? 'Ver serviço' : s.tipo === 'alerta' ? 'Ver negociação' : 'Ver detalhes'}
                  </Link>
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </Pagina>
  );
}
