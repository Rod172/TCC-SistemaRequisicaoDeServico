/**
 * @file ConteudoMarkdown.tsx
 * @description Mostra um arquivo de `docs/diagramas` na página de arquitetura (US41): títulos,
 * parágrafos, listas e tabelas do Markdown, com cada bloco ```mermaid trocado pelo componente
 * `DiagramaMermaid`. Os links entre os arquivos `.md` viram links para a aba correspondente.
 * Roda no servidor; só o desenho dos diagramas acontece no navegador.
 *
 * BIBLIOTECAS UTILIZADAS:
 * 1. react-markdown (9.0.1): Converte Markdown em elementos React, sem interpretar HTML embutido.
 *    Doc Oficial: https://github.com/remarkjs/react-markdown
 * 2. remark-gfm (4.0.0): Extensão GitHub Flavored Markdown, necessária para as tabelas dos diagramas.
 *    Doc Oficial: https://github.com/remarkjs/remark-gfm
 * 3. Next.js (^14.2.3): Navegação entre as abas com `Link`.
 *    Doc Oficial: https://nextjs.org/docs
 */

import React from 'react';
import Link from 'next/link';
import ReactMarkdown, { type Components } from 'react-markdown';
import remarkGfm from 'remark-gfm';
import DiagramaMermaid from './DiagramaMermaid';
import { abaDoArquivo } from './abas';

interface InfoDiagrama { titulo: string; nomeArquivo: string }

function slug(texto: string) {
  return texto.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase()
    .replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
}

/**
 * Percorre o Markdown e associa cada bloco Mermaid ao título da seção onde ele está, para dar
 * nome ao diagrama (rótulo acessível e arquivo SVG baixado).
 */
function mapearDiagramas(markdown: string, prefixo: string) {
  const mapa = new Map<string, InfoDiagrama>();
  let tituloAtual = prefixo;
  let bloco: string[] | null = null;
  let contador = 0;
  for (const linha of markdown.split('\n')) {
    if (bloco) {
      if (linha.startsWith('```')) {
        contador += 1;
        mapa.set(bloco.join('\n').trimEnd(), {
          titulo: tituloAtual,
          nomeArquivo: `eloserv-${prefixo}-${contador}-${slug(tituloAtual)}`.slice(0, 90),
        });
        bloco = null;
      } else {
        bloco.push(linha);
      }
    } else if (linha.startsWith('```mermaid')) {
      bloco = [];
    } else if (/^#{1,3} /.test(linha)) {
      tituloAtual = linha.replace(/^#+ /, '').trim();
    }
  }
  return mapa;
}

function textoDe(children: React.ReactNode): string {
  return React.Children.toArray(children).map((c) => (typeof c === 'string' ? c : '')).join('');
}

export default function ConteudoMarkdown({ markdown, prefixo }: { markdown: string; prefixo: string }) {
  const diagramas = mapearDiagramas(markdown, prefixo);

  const componentes: Components = {
    // A página já tem o próprio h1: os níveis do arquivo descem um degrau.
    h1: ({ children }) => <h2 className="md-h1">{children}</h2>,
    h2: ({ children }) => <h3 className="md-h2">{children}</h3>,
    h3: ({ children }) => <h4 className="md-h3">{children}</h4>,
    pre({ node, children }) {
      const filho = node?.children[0];
      const ehMermaid = filho?.type === 'element' && filho.tagName === 'code'
        && Array.isArray(filho.properties.className) && filho.properties.className.includes('language-mermaid');
      // O bloco Mermaid já vira <figure>; não faz sentido envolvê-lo num <pre>.
      return ehMermaid ? <>{children}</> : <pre className="md-pre">{children}</pre>;
    },
    code({ className, children }) {
      if (className?.includes('language-mermaid')) {
        const codigo = textoDe(children).trimEnd();
        const info = diagramas.get(codigo) ?? { titulo: prefixo, nomeArquivo: `eloserv-${prefixo}` };
        return <DiagramaMermaid codigo={codigo} titulo={info.titulo} nomeArquivo={info.nomeArquivo} />;
      }
      return <code className={className}>{children}</code>;
    },
    a({ href, children }) {
      if (href && /^https?:\/\//.test(href)) {
        return <a href={href} target="_blank" rel="noopener noreferrer">{children}</a>;
      }
      const arquivo = href?.match(/^([\w-]+\.md)(?:#.*)?$/)?.[1];
      const aba = arquivo ? abaDoArquivo(arquivo) : undefined;
      if (aba) return <Link href={`/arquitetura?aba=${aba}`}>{children}</Link>;
      // Caminhos do repositório (ex.: arquivos de código) não existem no site: ficam só como texto.
      return <span className="md-caminho">{children}</span>;
    },
    table: ({ children }) => (
      <div className="tabela-rolavel" tabIndex={0} role="region" aria-label="Tabela (role para os lados no celular)">
        <table>{children}</table>
      </div>
    ),
  };

  return (
    <div className="texto-diagramas">
      <ReactMarkdown remarkPlugins={[remarkGfm]} components={componentes}>{markdown}</ReactMarkdown>
    </div>
  );
}
