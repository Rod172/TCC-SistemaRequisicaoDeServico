'use client';

/**
 * Painéis pessoais das US20 e US21, com acesso do profissional como solicitante (US33).
 * Layout da US39: seletor Prestador/Solicitante ao lado do título, indicadores do mês, carteira
 * simulada em destaque e atalhos para as listas. O prestador abre direto no painel profissional.
 * React (^18.3.1): estado e ciclo de vida. https://react.dev/reference/react
 * Next.js (^14.2.3): navegação pelo App Router. https://nextjs.org/docs/app
 * Axios (^1.7.2): cliente centralizado com JWT e cancelamento das consultas.
 * Documentação oficial: https://axios-http.com/docs/cancellation
 * Lucide React (^0.383.0): ícones da carteira e dos atalhos. https://lucide.dev/
 */
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ChevronRight, ShieldCheck, Wallet } from 'lucide-react';
import api from '@/services/api';
import Pagina, { CabecalhoPagina } from '@/components/ui/Pagina';
import { EstadoLista } from '@/components/ui/Elementos';

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
interface Indicador { titulo: string; valor: string; descricao: string; href: string; barra?: number }

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
      // O prestador abre no painel profissional; o seletor continua permitindo ver como solicitante (US33).
      if (usuario.tipo_perfil === 'PRESTADOR') setAba('prestador');
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
    { titulo: 'Propostas enviadas', valor: numero(prestador.propostas_enviadas_mes), descricao: 'Todas as propostas criadas neste mês.', href: '/minhas-propostas' },
    { titulo: 'Propostas aceitas', valor: numero(prestador.propostas_aceitas_mes), descricao: 'Propostas deste mês que estão aceitas.', href: '/minhas-propostas' },
    { titulo: 'Taxa de conversão', valor: `${numero(prestador.taxa_conversao)}%`, descricao: 'Aceitas entre as propostas enviadas no mês.', href: '/minhas-propostas', barra: prestador.taxa_conversao },
    { titulo: 'Reputação atual', valor: prestador.nota_reputacao === null ? 'Sem avaliações' : `★ ${numero(prestador.nota_reputacao)}`, descricao: `${numero(prestador.total_avaliacoes)} avaliações recebidas ao longo do tempo.`, href: '/perfil' },
  ] : [];

  function selecionar(novaAba: Aba) {
    if (novaAba === aba) return;
    setCarregando(true);
    setErro('');
    setAba(novaAba);
  }

  const atalhos = [
    { href: '/minhas-solicitacoes', titulo: 'Minhas solicitações', detalhe: 'Pedidos que você publicou' },
    { href: '/nova-solicitacao', titulo: 'Nova solicitação', detalhe: 'Peça propostas para um serviço' },
    ...(profissional ? [
      { href: '/minhas-propostas', titulo: 'Minhas propostas', detalhe: 'Propostas que você enviou' },
      { href: '/oportunidades', titulo: 'Encontrar oportunidades', detalhe: 'Pedidos abertos na sua região' },
    ] : []),
  ];

  return (
    <Pagina>
      <CabecalhoPagina
        titulo="Meu painel"
        subtitulo={aba === 'prestador' && prestador ? `Seus resultados na plataforma em ${prestador.periodo.referencia}.` : 'Acompanhe suas solicitações e seus resultados na plataforma.'}
        acoes={profissional && (
          <div role="group" aria-label="Selecionar painel" className="segmentado">
            {(['prestador', 'solicitante'] as const).map(opcao => (
              <button key={opcao} type="button" aria-pressed={aba === opcao} onClick={() => selecionar(opcao)}>
                {opcao === 'solicitante' ? 'Como solicitante' : 'Como prestador'}
              </button>
            ))}
          </div>
        )}
      />

      <section aria-label={aba === 'solicitante' ? 'Indicadores de solicitações' : 'Indicadores profissionais'} aria-busy={carregando} className="empilhado" style={{ gap: '1.5rem' }}>
        {carregando && <EstadoLista tipo="carregando">Carregando seus indicadores...</EstadoLista>}
        {!carregando && erro && (
          <EstadoLista tipo="erro" acao={<button type="button" className="btn btn-secundario" onClick={() => { setCarregando(true); setTentativa(valor => valor + 1); }}>Tentar novamente</button>}>{erro}</EstadoLista>
        )}
        {!carregando && !erro && (
          <>
            <div className="empilhado" style={{ gap: '0.75rem' }}>
              <h2 className="rotulo-area" style={{ color: 'var(--text-secondary)' }}>{aba === 'solicitante' ? 'Minhas solicitações' : 'Este mês'}</h2>
              {aba === 'prestador' && prestador && (
                <p className="texto-apoio" style={{ fontSize: '0.82rem' }}>Propostas enviadas de {prestador.periodo.inicio} até {prestador.periodo.fim_exclusivo} (data final não incluída), no horário de Brasília.</p>
              )}
              <ul style={{ listStyle: 'none', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 220px), 1fr))', gap: '1rem' }}>
                {indicadores.map(indicador => (
                  <li key={indicador.titulo} className="card" style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                    <h3 style={{ fontSize: '0.9rem', fontWeight: 600, color: 'var(--text-secondary)' }}>{indicador.titulo}</h3>
                    <strong style={{ fontSize: '2rem', fontWeight: 800, lineHeight: 1.1 }}>{indicador.valor}</strong>
                    {indicador.barra !== undefined && (
                      <span role="img" aria-label={`${numero(indicador.barra)}% de conversão`} style={{ height: '8px', borderRadius: '999px', background: 'var(--card-border)', overflow: 'hidden' }}>
                        <span style={{ display: 'block', width: `${Math.min(100, Math.max(0, indicador.barra))}%`, height: '100%', background: 'var(--brand-sky)' }} />
                      </span>
                    )}
                    <p className="texto-apoio" style={{ fontSize: '0.82rem', flexGrow: 1 }}>{indicador.descricao}</p>
                    <Link href={indicador.href} aria-label={`Ver detalhes de ${indicador.titulo.toLocaleLowerCase('pt-BR')}`} style={{ fontSize: '0.875rem', fontWeight: 600 }}>Ver detalhes →</Link>
                  </li>
                ))}
              </ul>
            </div>

            {aba === 'prestador' && prestador && (
              <div className="empilhado" style={{ gap: '0.75rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '0.75rem', flexWrap: 'wrap' }}>
                  <h2 className="rotulo-area" style={{ color: 'var(--text-secondary)' }}>Carteira simulada · todos os períodos</h2>
                  <span style={{ fontSize: '0.78rem', color: 'var(--warning-text)' }}>Valores fictícios de demonstração</span>
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 280px), 1fr))', gap: '1rem' }}>
                  <div className="card sucesso" style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
                    <span aria-hidden="true" style={{ width: 48, height: 48, borderRadius: 14, background: 'var(--success-bg)', color: 'var(--success-strong)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}><Wallet size={24} /></span>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.2rem' }}>
                      <span className="texto-apoio" style={{ fontWeight: 600 }}>Saldo simulado disponível</span>
                      <strong style={{ fontSize: '1.8rem', fontWeight: 800 }}>{moeda(prestador.saldo_liberado)}</strong>
                      <span className="texto-apoio" style={{ fontSize: '0.8rem' }}>Liberado depois que os clientes confirmaram a conclusão.</span>
                    </div>
                  </div>
                  <div className="card" style={{ display: 'flex', gap: '1rem', alignItems: 'center', borderColor: 'var(--sky-border)' }}>
                    <span aria-hidden="true" style={{ width: 48, height: 48, borderRadius: 14, background: 'var(--sky-bg)', color: 'var(--brand-sky)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}><ShieldCheck size={24} /></span>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.2rem' }}>
                      <span className="texto-apoio" style={{ fontWeight: 600 }}>Em custódia</span>
                      <strong style={{ fontSize: '1.8rem', fontWeight: 800 }}>{moeda(prestador.valor_em_custodia)}</strong>
                      <span className="texto-apoio" style={{ fontSize: '0.8rem' }}>Retido até a conclusão dos serviços em andamento.</span>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </>
        )}
      </section>

      <nav aria-label="Ações do painel" className="empilhado" style={{ gap: '0.75rem' }}>
        <h2 className="rotulo-area" style={{ color: 'var(--text-secondary)' }}>Atalhos</h2>
        <ul style={{ listStyle: 'none', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 240px), 1fr))', gap: '0.75rem' }}>
          {atalhos.map((a) => (
            <li key={a.href}>
              <Link href={a.href} className="card" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '0.75rem', background: 'transparent', color: 'var(--text-primary)', height: '100%' }}>
                <span style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}><strong style={{ fontSize: '0.95rem' }}>{a.titulo}</strong><span className="texto-apoio" style={{ fontSize: '0.8rem' }}>{a.detalhe}</span></span>
                <ChevronRight size={18} aria-hidden="true" />
              </Link>
            </li>
          ))}
        </ul>
      </nav>
    </Pagina>
  );
}
