'use client';

/**
 * Perfil público do prestador (US19), acessível sem sessão.
 * React (^18.3.1): estado e efeitos. https://react.dev/reference/react
 * Next.js (^14.2.3): página dinâmica e navegação. https://nextjs.org/docs/app
 * Axios (^1.7.2), pelo serviço api: consulta REST. https://axios-http.com/docs/intro
 */
import { useEffect, useState, type CSSProperties } from 'react';
import Link from 'next/link';
import api from '@/services/api';

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

const cartao: CSSProperties = {
  padding: '1.5rem', background: 'var(--card-bg)', border: '1px solid var(--card-border)',
  borderRadius: 'var(--border-radius)', overflowWrap: 'anywhere',
};
const botao: CSSProperties = {
  padding: '.65rem 1rem', background: 'var(--primary-color)', color: 'white',
  border: 0, borderRadius: 8, cursor: 'pointer', minHeight: 44,
};
const origem = (process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api/v1').replace(/\/api\/v1\/?$/, '');

function fotoPublica(caminho: string | null): string | undefined {
  if (!caminho) return undefined;
  // Aceita apenas imagens HTTP(S) ou uploads servidos pelo backend.
  if (caminho.startsWith('/uploads/')) return `${origem}${caminho}`;
  if (/^https?:\/\//i.test(caminho)) return caminho;
  return undefined;
}

export default function PrestadorPublicoPage({ params }: { params: { id: string } }) {
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

  const foto = fotoPublica(perfil?.foto_url || null);
  return (
    <main style={{ maxWidth: 960, width: '100%', margin: '0 auto', padding: '1.5rem 1rem 3rem' }}>
      <nav aria-label="Navegação" style={{ marginBottom: '1.5rem' }}><Link href="/">← ServiçoFácil</Link></nav>
      <h1 style={{ fontSize: '1.6rem', marginBottom: '1.5rem' }}>Perfil público do prestador</h1>
      {carregando ? <p role="status" style={cartao}>Carregando perfil e avaliações…</p> : erro ? (
        <div role="alert" style={cartao}><p>{erro}</p><button style={{ ...botao, marginTop: 16 }} onClick={() => setTentativa(valor => valor + 1)}>Tentar novamente</button></div>
      ) : perfil && <>
        <section style={cartao} aria-label="Apresentação do prestador">
          <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: '1rem' }}>
            {foto && !fotoFalhou ? <img src={foto} alt={`Foto de ${perfil.nome}`} onError={() => setFotoFalhou(true)} style={{ width: 88, height: 88, borderRadius: '50%', objectFit: 'cover' }} />
              : <div aria-hidden="true" style={{ width: 88, height: 88, borderRadius: '50%', background: 'var(--bg-color)', display: 'grid', placeItems: 'center', fontSize: '2rem' }}>{perfil.nome.charAt(0).toLocaleUpperCase('pt-BR')}</div>}
            <div style={{ minWidth: 0, flex: '1 1 200px' }}><h2>{perfil.nome}</h2><p style={{ color: 'var(--text-secondary)' }}>Prestador de serviços</p></div>
          </div>
          <h3 style={{ marginTop: '1.5rem' }}>Sobre o prestador</h3>
          <p style={{ whiteSpace: 'pre-wrap', marginTop: 8 }}>{perfil.descricao_bio || 'Este prestador ainda não adicionou uma biografia.'}</p>
          <h3 style={{ marginTop: '1.5rem' }}>Categorias de atuação</h3>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginTop: 8 }}>
            {perfil.categorias.length ? perfil.categorias.map((categoria, indice) => <span key={`${categoria}-${indice}`} style={{ padding: '.3rem .7rem', borderRadius: 20, background: 'var(--bg-color)' }}>{categoria}</span>) : <p style={{ color: 'var(--text-secondary)' }}>Categorias não informadas.</p>}
          </div>
        </section>
        <section aria-label="Resumo da reputação" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 200px), 1fr))', gap: 16, margin: '1rem 0' }}>
          <div style={cartao}><h3>Nota média</h3><p style={{ fontSize: '1.7rem' }}>{perfil.total_avaliacoes ? `${perfil.nota_media_reputacao.toLocaleString('pt-BR', { minimumFractionDigits: 1, maximumFractionDigits: 2 })} / 5` : 'Sem avaliações'}</p></div>
          <div style={cartao}><h3>Avaliações</h3><p style={{ fontSize: '1.7rem' }}>{perfil.total_avaliacoes}</p></div>
          <div style={cartao}><h3>Serviços concluídos</h3><p style={{ fontSize: '1.7rem' }}>{perfil.total_servicos_concluidos}</p></div>
        </section>
        <section aria-labelledby="titulo-avaliacoes" style={cartao}>
          <h2 id="titulo-avaliacoes">Avaliações de clientes</h2>
          {!perfil.avaliacoes.length && <p style={{ marginTop: 16, color: 'var(--text-secondary)' }}>{perfil.total_avaliacoes ? 'Nenhuma avaliação nesta página.' : 'Este prestador ainda não recebeu avaliações.'}</p>}
          {perfil.avaliacoes.map(avaliacao => <article key={avaliacao.id} style={{ padding: '1.25rem 0', borderBottom: '1px solid var(--card-border)' }}>
            <h3>{avaliacao.nome_avaliador}</h3>
            <p aria-label={`Nota ${avaliacao.nota} de 5`} style={{ color: '#fbbf24' }}>{'★'.repeat(avaliacao.nota)}{'☆'.repeat(5 - avaliacao.nota)} · {avaliacao.nota}/5</p>
            <time dateTime={avaliacao.created_at} style={{ color: 'var(--text-secondary)', fontSize: '.85rem' }}>{new Date(avaliacao.created_at).toLocaleDateString('pt-BR', { timeZone: 'America/Sao_Paulo' })}</time>
            <p style={{ marginTop: 8, whiteSpace: 'pre-wrap' }}>{avaliacao.comentario || 'O cliente não deixou um comentário.'}</p>
          </article>)}
          {perfil.paginacao.total_paginas > 1 && <nav aria-label="Páginas de avaliações" style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: 12, marginTop: 20 }}>
            <button style={{ ...botao, opacity: pagina === 1 ? .5 : 1 }} disabled={pagina === 1} onClick={() => setPagina(valor => valor - 1)}>Anterior</button>
            <span aria-live="polite">Página {perfil.paginacao.pagina} de {perfil.paginacao.total_paginas}</span>
            <button style={{ ...botao, opacity: pagina >= perfil.paginacao.total_paginas ? .5 : 1 }} disabled={pagina >= perfil.paginacao.total_paginas} onClick={() => setPagina(valor => valor + 1)}>Próxima</button>
          </nav>}
        </section>
      </>}
    </main>
  );
}
