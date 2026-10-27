'use client';

/**
 * @file Pagina.tsx
 * @description Estrutura comum das telas internas (US39): cabeçalho e rodapé compartilhados, área de
 * conteúdo com largura padronizada e o bloco de título da página (link de voltar, rótulo de área,
 * título, subtítulo e ações).
 *
 * BIBLIOTECAS UTILIZADAS:
 * 1. Lucide React (^0.383.0): Ícones do rodapé e do link de voltar.
 *    Doc Oficial: https://lucide.dev/
 * 2. Next.js (^14.2.3): Navegação com `Link`.
 *    Doc Oficial: https://nextjs.org/docs
 */

import React from 'react';
import Link from 'next/link';
import { Activity, ChevronLeft, Network } from 'lucide-react';
import Cabecalho from './Cabecalho';
import Logo from '@/components/Logo';
import SeletorTema from './SeletorTema';

interface PaginaProps {
  children: React.ReactNode;
  /** Largura máxima do conteúdo: listas e painéis usam "larga"; formulários e perfis, "media"/"estreita". */
  largura?: 'larga' | 'media' | 'estreita';
  onSair?: () => void;
}

export default function Pagina({ children, largura = 'larga', onSair }: PaginaProps) {
  return (
    <div className="pagina">
      <Cabecalho onSair={onSair} />
      <main className={`pagina-conteudo ${largura === 'larga' ? '' : largura}`}>{children}</main>
      <Rodape />
    </div>
  );
}

/** Links do rodapé: documentos legais e canal de privacidade (US40), arquitetura (US41) e status do sistema. */
export function LinksRodape() {
  return (
    <nav aria-label="Documentos do sistema" className="links-rodape">
      <Link href="/termos-de-uso">Termos de Uso</Link>
      <Link href="/politica-de-privacidade">Política de Privacidade</Link>
      <Link href="/privacidade">Central de Privacidade</Link>
      <Link href="/arquitetura"><Network size={14} aria-hidden="true" /> Arquitetura</Link>
      <Link href="/status"><Activity size={14} aria-hidden="true" /> Status do sistema</Link>
    </nav>
  );
}

export function Rodape() {
  return (
    <footer style={{ borderTop: '1px solid var(--card-border)', padding: '1.5rem' }}>
      <div style={{
        maxWidth: '1200px', margin: '0 auto',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '0.75rem',
      }}>
        <span style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flexWrap: 'wrap' }}>
          <Logo tamanho={24} />
          <span style={{ color: 'var(--text-secondary)', fontSize: '0.82rem' }}>TCC Ciência da Computação · UNIP</span>
        </span>
        <span style={{ display: 'flex', alignItems: 'center', gap: '0.75rem 1.25rem', flexWrap: 'wrap' }}>
          <LinksRodape />
          <SeletorTema />
        </span>
      </div>
    </footer>
  );
}

interface CabecalhoPaginaProps {
  voltar?: { href: string; rotulo: string };
  area?: string;
  titulo: React.ReactNode;
  subtitulo?: React.ReactNode;
  /** Botões ou links à direita do título (no celular, vão para baixo dele). */
  acoes?: React.ReactNode;
  /** Conteúdo extra acima do título, como as etiquetas de status de um pedido. */
  antes?: React.ReactNode;
}

export function CabecalhoPagina({ voltar, area, titulo, subtitulo, acoes, antes }: CabecalhoPaginaProps) {
  return (
    <>
      {voltar && (
        <Link href={voltar.href} className="link-voltar">
          <ChevronLeft size={16} aria-hidden="true" /> {voltar.rotulo}
        </Link>
      )}
      <div className="cabecalho-pagina">
        <div>
          {area && <span className="rotulo-area">{area}</span>}
          {antes}
          <h1 className="titulo-pagina">{titulo}</h1>
          {subtitulo && <p className="subtitulo-pagina">{subtitulo}</p>}
        </div>
        {acoes && <div className="acoes">{acoes}</div>}
      </div>
    </>
  );
}
