'use client';

/**
 * Perfil público do prestador (US19), acessível sem sessão.
 * Layout da US39: cartão de apresentação com o resumo da reputação, "Sobre" e as avaliações dos
 * clientes com paginação.
 * React (^18.3.1): estado e efeitos. https://react.dev/reference/react
 * Next.js (^14.2.3): página dinâmica e navegação. https://nextjs.org/docs/app
 * Axios (^1.7.2), pelo serviço api: consulta REST. https://axios-http.com/docs/intro
 * Lucide React (^0.383.0): ícones de voltar e estrela. https://lucide.dev/
 */
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { ChevronLeft, Star } from 'lucide-react';
import api from '@/services/api';
import Pagina from '@/components/ui/Pagina';
import { EstadoLista, iniciais } from '@/components/ui/Elementos';

interface PerfilPublico {
  id: string;
  nome: string;
  foto_url: string | null;
  descricao_bio: string | null;
  categorias: string[];
  nota_media_reputacao: number;
  total_avaliacoes: number;
  total_servicos_concluidos: number;
  avaliacoes: { id: string; nota: number; comentario: string | null; nome_avaliador: string; created_at: string }[];
  paginacao: { pagina: number; limite: number; total: number; total_paginas: number };
}

const origem = (process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api/v1').replace(/\/api\/v1\/?$/, '');

function fotoPublica(caminho: string | null): string | undefined {
  if (!caminho) return undefined;
  // Aceita apenas imagens HTTP(S) ou uploads servidos pelo backend.
  if (caminho.startsWith('/uploads/')) return `${origem}${caminho}`;
  if (/^https?:\/\//i.test(caminho)) return caminho;
  return undefined;
}

export default function PrestadorPublicoPage({ params }: { params: { id: string } }) {
  const router = useRouter();
  const [perfil, setPerfil] = useState<PerfilPublico | null>(null);
  const [pagina, setPagina] = useState(1);
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState('');
  const [tentativa, setTentativa] = useState(0);
  const [fotoFalhou, setFotoFalhou] = useState(false);

  useEffect(() => { setPagina(1); setFotoFalhou(false); }, [params.id]);

  useEffect(() => {
    const cancelamento = new AbortController();
    setCarregando(true);
    setErro('');
    api.get<{ data: PerfilPublico }>(`/prestadores/${encodeURIComponent(params.id)}/perfil-publico`, {
      params: { pagina, limite: 10 }, signal: cancelamento.signal,
    }).then(resposta => {
      if (!cancelamento.signal.aborted) setPerfil(resposta.data.data);
    }).catch((falha: unknown) => {
      if (cancelamento.signal.aborted) return;
      const status = (falha as { response?: { status?: number } }).response?.status;
      setPerfil(null);
      setErro(status === 404 ? 'Prestador não encontrado ou indisponível.'
        : status === 400 ? 'O endereço deste perfil é inválido.'
          : 'Não foi possível carregar o perfil. Tente novamente.');
    }).finally(() => { if (!cancelamento.signal.aborted) setCarregando(false); });
    return () => cancelamento.abort();
  }, [params.id, pagina, tentativa]);

  // O perfil costuma ser aberto a partir de uma proposta: "Voltar" retorna para onde a pessoa estava.
  function voltar() {
    if (window.history.length > 1) router.back();
    else router.push('/');
  }

  const foto = fotoPublica(perfil?.foto_url || null);
  const nota = perfil?.total_avaliacoes ? perfil.nota_media_reputacao.toLocaleString('pt-BR', { minimumFractionDigits: 1, maximumFractionDigits: 1 }) : null;

  return (
    <Pagina largura="estreita">
      <button type="button" onClick={voltar} className="link-voltar btn-texto" style={{ border: 0, background: 'transparent', cursor: 'pointer', font: 'inherit', fontSize: '0.875rem', fontWeight: 600 }}>
        <ChevronLeft size={16} aria-hidden="true" /> Voltar
      </button>

      {carregando ? <EstadoLista tipo="carregando">Carregando perfil e avaliações…</EstadoLista> : erro ? (
        <EstadoLista tipo="erro" acao={<button type="button" className="btn btn-secundario" onClick={() => setTentativa(valor => valor + 1)}>Tentar novamente</button>}>{erro}</EstadoLista>
      ) : perfil && <>
        <section aria-label="Apresentação do prestador" className="card" style={{ padding: 0, overflow: 'hidden' }}>
          <div aria-hidden="true" style={{ height: '88px', background: 'var(--bg-highlight)', borderBottom: '1px solid var(--card-border)' }} />
          <div style={{ padding: '0 1.5rem 1.5rem', display: 'flex', flexWrap: 'wrap', gap: '1.25rem', alignItems: 'flex-end', marginTop: '-48px' }}>
            {foto && !fotoFalhou
              ? <img src={foto} alt={`Foto de ${perfil.nome}`} onError={() => setFotoFalhou(true)} style={{ width: 104, height: 104, borderRadius: '50%', objectFit: 'cover', border: '4px solid var(--card-bg)', flexShrink: 0 }} />
              : <span aria-hidden="true" style={{ width: 104, height: 104, borderRadius: '50%', background: 'var(--sky-bg)', border: '4px solid var(--card-bg)', color: 'var(--brand-sky)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '2rem', fontWeight: 800, flexShrink: 0 }}>{iniciais(perfil.nome)}</span>}
            <div style={{ flex: '1 1 260px', minWidth: 0, display: 'flex', flexDirection: 'column', gap: '0.5rem', paddingTop: '56px' }}>
              <h1 className="titulo-pagina">{perfil.nome}</h1>
              <span className="texto-apoio">Prestador de serviços</span>
              {perfil.categorias.length > 0 && (
                <div className="chips">{perfil.categorias.map((categoria, indice) => <span key={`${categoria}-${indice}`} className="chip categoria">{categoria}</span>)}</div>
              )}
            </div>
          </div>
          <dl aria-label="Resumo da reputação" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 160px), 1fr))', borderTop: '1px solid var(--card-border)' }}>
            <div style={{ padding: '1.1rem 1.5rem', borderRight: '1px solid var(--card-border)' }}>
              <dt className="texto-apoio">Nota média</dt>
              <dd style={{ marginTop: '0.35rem', display: 'flex', alignItems: 'center', gap: '0.45rem', fontSize: '1.7rem', fontWeight: 800 }}>
                {nota ? <><Star size={22} color="var(--warning-strong)" fill="var(--warning-strong)" aria-hidden="true" />{nota}</> : <span style={{ fontSize: '1.1rem', color: 'var(--text-secondary)' }}>Sem avaliações</span>}
              </dd>
            </div>
            <div style={{ padding: '1.1rem 1.5rem', borderRight: '1px solid var(--card-border)' }}>
              <dt className="texto-apoio">Avaliações</dt><dd style={{ marginTop: '0.35rem', fontSize: '1.7rem', fontWeight: 800 }}>{perfil.total_avaliacoes}</dd>
            </div>
            <div style={{ padding: '1.1rem 1.5rem' }}>
              <dt className="texto-apoio">Serviços concluídos</dt><dd style={{ marginTop: '0.35rem', fontSize: '1.7rem', fontWeight: 800 }}>{perfil.total_servicos_concluidos}</dd>
            </div>
          </dl>
        </section>

        <section aria-labelledby="titulo-sobre" className="card grande empilhado" style={{ gap: '0.6rem' }}>
          <h2 id="titulo-sobre" className="titulo-secao">Sobre</h2>
          <p style={{ whiteSpace: 'pre-wrap', lineHeight: 1.65, color: perfil.descricao_bio ? 'var(--text-body)' : 'var(--text-secondary)', overflowWrap: 'anywhere' }}>
            {perfil.descricao_bio || 'Este prestador ainda não adicionou uma biografia.'}
          </p>
        </section>

        <section aria-labelledby="titulo-avaliacoes" className="empilhado" style={{ gap: '0.85rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '0.75rem', flexWrap: 'wrap' }}>
            <h2 id="titulo-avaliacoes" className="titulo-secao" style={{ fontSize: '1.3rem' }}>O que os clientes dizem</h2>
            {perfil.paginacao.total_paginas > 1 && <span className="texto-apoio" aria-live="polite">Página {perfil.paginacao.pagina} de {perfil.paginacao.total_paginas}</span>}
          </div>
          {!perfil.avaliacoes.length && (
            <EstadoLista tipo="vazio">{perfil.total_avaliacoes ? 'Nenhuma avaliação nesta página.' : 'Este prestador ainda não recebeu avaliações.'}</EstadoLista>
          )}
          {perfil.avaliacoes.length > 0 && (
            <ul className="lista-simples">
              {perfil.avaliacoes.map(avaliacao => (
                <li key={avaliacao.id} className="card empilhado" style={{ gap: '0.6rem', padding: '1.1rem 1.25rem' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '0.75rem', flexWrap: 'wrap' }}>
                    <span style={{ display: 'flex', gap: '0.6rem', alignItems: 'center' }}>
                      <span aria-hidden="true" className="avatar" style={{ width: 36, height: 36, fontSize: '0.8rem', background: 'var(--card-border)', color: 'var(--text-body)' }}>{iniciais(avaliacao.nome_avaliador)}</span>
                      <span style={{ display: 'flex', flexDirection: 'column' }}>
                        <strong style={{ fontSize: '0.92rem' }}>{avaliacao.nome_avaliador}</strong>
                        <time dateTime={avaliacao.created_at} className="texto-apoio" style={{ fontSize: '0.78rem' }}>{new Date(avaliacao.created_at).toLocaleDateString('pt-BR', { timeZone: 'America/Sao_Paulo' })}</time>
                      </span>
                    </span>
                    <span role="img" aria-label={`Nota ${avaliacao.nota} de 5`} style={{ fontSize: '1.05rem', letterSpacing: '2px', color: 'var(--warning-strong)' }}>
                      {'★'.repeat(avaliacao.nota)}<span style={{ color: 'var(--card-border)' }}>{'★'.repeat(5 - avaliacao.nota)}</span>
                    </span>
                  </div>
                  <p style={{ whiteSpace: 'pre-wrap', lineHeight: 1.6, color: avaliacao.comentario ? 'var(--text-body)' : 'var(--text-muted)', fontStyle: avaliacao.comentario ? 'normal' : 'italic', overflowWrap: 'anywhere' }}>
                    {avaliacao.comentario || 'O cliente não deixou um comentário.'}
                  </p>
                </li>
              ))}
            </ul>
          )}
          {perfil.paginacao.total_paginas > 1 && (
            <nav aria-label="Páginas de avaliações" style={{ display: 'flex', justifyContent: 'space-between', gap: '0.75rem' }}>
              <button type="button" className="btn btn-secundario" disabled={pagina === 1} onClick={() => setPagina(valor => valor - 1)}>‹ Anteriores</button>
              <button type="button" className="btn btn-secundario" disabled={pagina >= perfil.paginacao.total_paginas} onClick={() => setPagina(valor => valor + 1)}>Próximas ›</button>
            </nav>
          )}
        </section>
      </>}
    </Pagina>
  );
}
