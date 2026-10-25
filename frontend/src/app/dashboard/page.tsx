'use client';

/**
 * Painéis pessoais das US20 e US21, com acesso do profissional como solicitante (US33).
 * React (^18.3.1): estado e ciclo de vida. https://react.dev/reference/react
 * Next.js (^14.2.3): navegação pelo App Router. https://nextjs.org/docs/app
 * Axios (^1.7.2): cliente centralizado com JWT e cancelamento das consultas.
 * Documentação oficial: https://axios-http.com/docs/cancellation
 */
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import api from '@/services/api';

interface SolicitanteDTO {
  servicos_abertos: number;
  propostas_pendentes: number;
  servicos_em_andamento: number;
  servicos_concluidos: number;
}
interface PrestadorDTO {
  propostas_enviadas_mes: number;
  propostas_aceitas_mes: number;
  taxa_conversao: number;
  nota_reputacao: number | null;
  total_avaliacoes: number;
  saldo_liberado: number;
  valor_em_custodia: number;
  periodo: { inicio: string; fim_exclusivo: string; referencia: string };
}
type Aba = 'solicitante' | 'prestador';
interface Indicador { titulo: string; valor: string; descricao: string; href: string }

export default function DashboardPage() {
  const router = useRouter();
  const [perfil, setPerfil] = useState<string | null>(null);
  const [aba, setAba] = useState<Aba>('solicitante');
  const [solicitante, setSolicitante] = useState<SolicitanteDTO | null>(null);
  const [prestador, setPrestador] = useState<PrestadorDTO | null>(null);
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState('');
  const [tentativa, setTentativa] = useState(0);
  const profissional = perfil === 'PRESTADOR' || perfil === 'ADMIN';

  useEffect(() => {
    try {
      const token = localStorage.getItem('@ServicoFacil:token');
      const usuario = JSON.parse(localStorage.getItem('@ServicoFacil:user') || 'null');
      if (!token || !['SOLICITANTE', 'PRESTADOR', 'ADMIN'].includes(usuario?.tipo_perfil)) {
        router.replace('/login');
        return;
      }
      setPerfil(usuario.tipo_perfil);
    } catch {
      router.replace('/login');
    }
  }, [router]);

  useEffect(() => {
    if (!perfil) return;
    const consulta = new AbortController();
    setCarregando(true);
    setErro('');
    async function carregar() {
      try {
        if (aba === 'solicitante') {
          const resposta = await api.get<{ dados: SolicitanteDTO }>('/dashboards/solicitante', { signal: consulta.signal });
          if (!consulta.signal.aborted) setSolicitante(resposta.data.dados);
        } else {
          const resposta = await api.get<{ dados: PrestadorDTO }>('/dashboards/prestador', { signal: consulta.signal });
          if (!consulta.signal.aborted) setPrestador(resposta.data.dados);
        }
      } catch (falha: unknown) {
        if (consulta.signal.aborted) return;
        const status = (falha as { response?: { status?: number } }).response?.status;
        if (status === 401) {
          localStorage.removeItem('@ServicoFacil:token');
          localStorage.removeItem('@ServicoFacil:user');
          router.replace('/login');
          return;
        }
        setErro(status === 403 ? 'Seu perfil não possui acesso a este painel.' : 'Não foi possível carregar seus indicadores. Tente novamente.');
      } finally {
        if (!consulta.signal.aborted) setCarregando(false);
      }
    }
    carregar();
    return () => consulta.abort();
  }, [perfil, aba, tentativa, router]);

  const numero = (valor: number) => valor.toLocaleString('pt-BR', { maximumFractionDigits: 2 });
  const moeda = (valor: number) => valor.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
  const indicadores: Indicador[] = aba === 'solicitante' && solicitante ? [
    { titulo: 'Serviços abertos', valor: numero(solicitante.servicos_abertos), descricao: 'Solicitações abertas ou em negociação.', href: '/minhas-solicitacoes' },
    { titulo: 'Propostas pendentes', valor: numero(solicitante.propostas_pendentes), descricao: 'Propostas recebidas aguardando sua análise.', href: '/minhas-solicitacoes' },
    { titulo: 'Serviços em andamento', valor: numero(solicitante.servicos_em_andamento), descricao: 'Serviços que você já contratou.', href: '/minhas-solicitacoes' },
    { titulo: 'Serviços concluídos', valor: numero(solicitante.servicos_concluidos), descricao: 'Solicitações finalizadas.', href: '/minhas-solicitacoes' },
  ] : aba === 'prestador' && prestador ? [
    { titulo: 'Propostas enviadas no mês', valor: numero(prestador.propostas_enviadas_mes), descricao: 'Todas as propostas criadas neste mês.', href: '/minhas-propostas' },
    { titulo: 'Propostas aceitas no mês', valor: numero(prestador.propostas_aceitas_mes), descricao: 'Propostas deste mês que estão aceitas.', href: '/minhas-propostas' },
    { titulo: 'Taxa de conversão', valor: `${numero(prestador.taxa_conversao)}%`, descricao: 'Aceitas entre as propostas enviadas no mês.', href: '/minhas-propostas' },
    { titulo: 'Reputação atual', valor: prestador.nota_reputacao === null ? 'Sem avaliações' : `${numero(prestador.nota_reputacao)} / 5`, descricao: `${numero(prestador.total_avaliacoes)} avaliações recebidas ao longo do tempo.`, href: '/perfil' },
    { titulo: 'Saldo simulado disponível', valor: moeda(prestador.saldo_liberado), descricao: 'Valores simulados liberados após a conclusão dos serviços, de todos os períodos.', href: '/minhas-propostas' },
    { titulo: 'Em custódia', valor: moeda(prestador.valor_em_custodia), descricao: 'Valores simulados retidos até a conclusão dos serviços, de todos os períodos.', href: '/minhas-propostas' },
  ] : [];

  function selecionar(novaAba: Aba) {
    if (novaAba === aba) return;
    setCarregando(true);
    setErro('');
    setAba(novaAba);
  }

  return (
    <main style={{ maxWidth: 1100, margin: '2rem auto', padding: '0 1.25rem 4rem' }}>
      <Link href="/" style={{ color: 'var(--text-secondary)' }}>← Voltar para a página inicial</Link>
      <header style={{ margin: '2rem 0' }}>
        <h1 style={{ fontSize: 'clamp(1.6rem, 5vw, 2.3rem)', marginBottom: '.5rem' }}>Meu painel</h1>
        <p style={{ color: 'var(--text-secondary)' }}>Acompanhe suas solicitações e seus resultados na plataforma.</p>
      </header>

      {profissional && (
        <div role="group" aria-label="Selecionar painel" style={{ display: 'flex', flexWrap: 'wrap', gap: '.75rem', marginBottom: '1.5rem' }}>
          {(['solicitante', 'prestador'] as const).map(opcao => (
            <button key={opcao} type="button" aria-pressed={aba === opcao} onClick={() => selecionar(opcao)} style={{ padding: '.75rem 1rem', borderRadius: 8, border: '1px solid var(--card-border)', background: aba === opcao ? 'var(--primary-color, #2563eb)' : 'var(--card-bg)', color: 'var(--text-primary)', cursor: 'pointer' }}>
              {opcao === 'solicitante' ? 'Como solicitante' : 'Como prestador'}
            </button>
          ))}
        </div>
      )}

      <section aria-label={aba === 'solicitante' ? 'Indicadores de solicitações' : 'Indicadores profissionais'} aria-busy={carregando}>
        {carregando && <p role="status" style={{ padding: '3rem 0' }}>Carregando seus indicadores...</p>}
        {!carregando && erro && (
          <div role="alert" style={{ padding: '1.5rem', border: '1px solid var(--danger-color, #ef4444)', borderRadius: 12 }}>
            <p>{erro}</p>
            <button type="button" onClick={() => { setCarregando(true); setTentativa(valor => valor + 1); }} style={{ marginTop: '1rem', padding: '.75rem 1rem', cursor: 'pointer' }}>Tentar novamente</button>
          </div>
        )}
        {!carregando && !erro && (
          <>
            <h2 style={{ fontSize: '1.2rem', marginBottom: '1rem' }}>{aba === 'solicitante' ? 'Minhas solicitações' : 'Minha atividade profissional'}</h2>
            {aba === 'prestador' && prestador && (
              <p style={{ color: 'var(--text-secondary)', marginBottom: '1.25rem' }}>Referência: {prestador.periodo.referencia}. Propostas enviadas de {prestador.periodo.inicio} até {prestador.periodo.fim_exclusivo} (data final não incluída), no horário de Brasília.</p>
            )}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 230px), 1fr))', gap: '1rem' }}>
              {indicadores.map(indicador => (
                <article key={indicador.titulo} style={{ display: 'flex', flexDirection: 'column', gap: '.75rem', padding: '1.5rem', background: 'var(--card-bg)', border: '1px solid var(--card-border)', borderRadius: 'var(--border-radius, 12px)' }}>
                  <h3 style={{ fontSize: '1rem' }}>{indicador.titulo}</h3>
                  <strong style={{ fontSize: '1.9rem' }}>{indicador.valor}</strong>
                  <p style={{ color: 'var(--text-secondary)', flexGrow: 1 }}>{indicador.descricao}</p>
                  <Link href={indicador.href} aria-label={`Ver detalhes de ${indicador.titulo.toLocaleLowerCase('pt-BR')}`}>Ver detalhes →</Link>
                </article>
              ))}
            </div>
          </>
        )}
      </section>
      <nav aria-label="Ações do painel" style={{ display: 'flex', flexWrap: 'wrap', gap: '1.25rem', marginTop: '2rem' }}>
        <Link href="/minhas-solicitacoes">Minhas solicitações</Link>
        <Link href="/nova-solicitacao">Nova solicitação</Link>
        {profissional && <Link href="/minhas-propostas">Minhas propostas</Link>}
        {profissional && <Link href="/oportunidades">Encontrar oportunidades</Link>}
      </nav>
    </main>
  );
}
