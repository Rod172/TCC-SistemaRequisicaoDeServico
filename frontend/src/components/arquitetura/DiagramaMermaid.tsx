'use client';

/**
 * @file DiagramaMermaid.tsx
 * @description Desenha um bloco Mermaid da página de arquitetura (US41) sobre um "papel" claro, com
 * zoom (afastar, aproximar e ajustar à largura) e download do diagrama em SVG para a monografia.
 * Um erro de sintaxe vira aviso no lugar do diagrama, sem derrubar o resto da página.
 *
 * BIBLIOTECAS UTILIZADAS:
 * 1. Mermaid (11.17.2): Converte o texto dos diagramas (casos de uso, classes, MER e sequência) em SVG.
 *    É carregada sob demanda (import dinâmico), só quando há diagrama na tela, por ser pesada.
 *    Doc Oficial: https://mermaid.js.org/
 * 2. Lucide React (^0.383.0): Ícones dos botões de zoom e download.
 *    Doc Oficial: https://lucide.dev/
 */

import React, { useEffect, useId, useRef, useState } from 'react';
import { Download, Maximize2, ZoomIn, ZoomOut } from 'lucide-react';

type Mermaid = typeof import('mermaid').default;

let mermaidPronto: Promise<Mermaid> | null = null;

/** Carrega e configura o Mermaid uma única vez para todos os diagramas da página. */
function carregarMermaid(): Promise<Mermaid> {
  if (!mermaidPronto) {
    mermaidPronto = import('mermaid').then(({ default: mermaid }) => {
      // 'strict' mantém o HTML dos rótulos sanitizado; o tema claro é o mesmo do SVG baixado.
      // suppressErrorRendering evita que o Mermaid injete o desenho de erro dele no fim da página.
      mermaid.initialize({ startOnLoad: false, securityLevel: 'strict', theme: 'default', suppressErrorRendering: true });
      return mermaid;
    });
  }
  return mermaidPronto;
}

const ESCALA_MIN = 0.25;
const ESCALA_MAX = 4;

interface DiagramaMermaidProps {
  codigo: string;
  /** Título da seção onde o diagrama aparece, usado no rótulo acessível e no nome do arquivo. */
  titulo: string;
  /** Nome do arquivo SVG baixado, sem extensão. */
  nomeArquivo: string;
}

export default function DiagramaMermaid({ codigo, titulo, nomeArquivo }: DiagramaMermaidProps) {
  const id = `diagrama-${useId().replace(/[^a-zA-Z0-9]/g, '')}`;
  const papelRef = useRef<HTMLDivElement>(null);
  const [svg, setSvg] = useState<string | null>(null);
  const [erro, setErro] = useState<string | null>(null);
  // null = ajustar à largura disponível (sem passar do tamanho natural).
  const [escala, setEscala] = useState<number | null>(null);

  useEffect(() => {
    let ativo = true;
    setSvg(null);
    setErro(null);
    carregarMermaid()
      .then((mermaid) => mermaid.render(id, codigo))
      .then((resultado) => { if (ativo) setSvg(resultado.svg); })
      .catch((e: unknown) => { if (ativo) setErro(e instanceof Error ? e.message : String(e)); });
    return () => { ativo = false; };
  }, [codigo, id]);

  // Largura natural do desenho, lida do viewBox que o Mermaid gera.
  const larguraNatural = svg ? Number(svg.match(/viewBox="[\d.-]+ [\d.-]+ ([\d.]+)/)?.[1]) || 800 : 800;

  function escalaAtual() {
    if (escala !== null) return escala;
    const disponivel = (papelRef.current?.clientWidth ?? larguraNatural) - 24;
    return Math.min(1, disponivel / larguraNatural);
  }

  function aproximar() { setEscala(Math.min(ESCALA_MAX, escalaAtual() * 1.25)); }
  function afastar() { setEscala(Math.max(ESCALA_MIN, escalaAtual() / 1.25)); }

  function baixar() {
    if (!svg) return;
    const url = URL.createObjectURL(new Blob([svg], { type: 'image/svg+xml;charset=utf-8' }));
    const link = document.createElement('a');
    link.href = url;
    link.download = `${nomeArquivo}.svg`;
    link.click();
    URL.revokeObjectURL(url);
  }

  if (erro) {
    return (
      <div role="alert" className="aviso aviso-erro diagrama-erro">
        <div style={{ flex: 1, minWidth: 0 }}>
          <strong>Não foi possível desenhar o diagrama “{titulo}”.</strong> Confira a sintaxe do bloco no arquivo de origem.
          <details style={{ marginTop: '0.4rem' }}>
            <summary>Detalhes do erro</summary>
            <pre>{erro}</pre>
          </details>
        </div>
      </div>
    );
  }

  const percentual = Math.round((escala ?? escalaAtual()) * 100);

  return (
    <figure className="diagrama" aria-label={`Diagrama: ${titulo}`}>
      <div className="diagrama-barra">
        <span className="texto-apoio" aria-live="polite">{svg ? `Zoom ${escala === null ? 'ajustado' : `${percentual}%`}` : 'Desenhando o diagrama...'}</span>
        <div className="grupo-botoes">
          <button type="button" className="btn btn-secundario btn-diagrama" onClick={afastar} disabled={!svg} aria-label="Afastar">
            <ZoomOut size={16} aria-hidden="true" />
          </button>
          <button type="button" className="btn btn-secundario btn-diagrama" onClick={aproximar} disabled={!svg} aria-label="Aproximar">
            <ZoomIn size={16} aria-hidden="true" />
          </button>
          <button type="button" className="btn btn-secundario btn-diagrama" onClick={() => setEscala(null)} disabled={!svg || escala === null}>
            <Maximize2 size={15} aria-hidden="true" /> Ajustar
          </button>
          {/* Atalho para diagramas largos (como o MER completo), que pelo zoom gradual exigiriam muitos cliques. */}
          <button type="button" className="btn btn-secundario btn-diagrama" onClick={() => setEscala(1)} disabled={!svg || escala === 1} aria-label="Tamanho real (100%)">
            100%
          </button>
          <button type="button" className="btn btn-secundario btn-diagrama" onClick={baixar} disabled={!svg}>
            <Download size={15} aria-hidden="true" /> Baixar SVG
          </button>
        </div>
      </div>
      {/* Área rolável e focável: com zoom, o teclado também consegue percorrer o diagrama. */}
      <div ref={papelRef} className="diagrama-papel" tabIndex={0} role="region" aria-label={`Área do diagrama ${titulo}`}>
        {svg ? (
          <div
            className="diagrama-svg"
            style={escala === null ? { width: '100%', maxWidth: `${larguraNatural}px` } : { width: `${larguraNatural * escala}px` }}
            // O SVG vem do próprio Mermaid, que sanitiza os rótulos com securityLevel 'strict'.
            dangerouslySetInnerHTML={{ __html: svg }}
          />
        ) : (
          <div className="diagrama-carregando" aria-hidden="true" />
        )}
      </div>
    </figure>
  );
}
