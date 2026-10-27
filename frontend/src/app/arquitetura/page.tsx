/**
 * @file page.tsx (rota /arquitetura)
 * @description Página pública de arquitetura e modelagem (US41): mostra, em abas, os diagramas de
 * casos de uso, classes, MER e sequência da contratação. O conteúdo é lido a cada acesso dos
 * arquivos `docs/diagramas/*.md`, a fonte única dos diagramas; a página não guarda cópia deles.
 *
 * BIBLIOTECAS UTILIZADAS:
 * 1. Node.js `fs/promises` e `path` (nativos): Leitura dos arquivos Markdown no servidor.
 *    Doc Oficial: https://nodejs.org/api/fs.html#promises-api
 * 2. Next.js (^14.2.3): Server Component, `searchParams` da aba e navegação com `Link`.
 *    Doc Oficial: https://nextjs.org/docs/app/building-your-application/rendering/server-components
 */

import fs from 'node:fs/promises';
import path from 'node:path';
import Link from 'next/link';
import Pagina, { CabecalhoPagina } from '@/components/ui/Pagina';
import { Aviso } from '@/components/ui/Elementos';
import ConteudoMarkdown from '@/components/arquitetura/ConteudoMarkdown';
import { ABAS_ARQUITETURA } from '@/components/arquitetura/abas';

// Lê os arquivos a cada acesso: uma edição nos diagramas aparece sem precisar gerar o site de novo.
export const dynamic = 'force-dynamic';
export const metadata = { title: 'Arquitetura e modelagem | Eloserv' };

// No desenvolvimento local o processo roda em frontend/; no Docker, em /app, com docs/diagramas montado em /docs/diagramas.
const PASTA_DIAGRAMAS = process.env.DIAGRAMAS_DIR || path.join(process.cwd(), '..', 'docs', 'diagramas');

export default async function PaginaArquitetura({ searchParams }: { searchParams: { aba?: string } }) {
  const aba = ABAS_ARQUITETURA.find((a) => a.id === searchParams.aba) ?? ABAS_ARQUITETURA[0];
  let markdown: string | null = null;
  try {
    markdown = await fs.readFile(path.join(PASTA_DIAGRAMAS, aba.arquivo), 'utf-8');
  } catch {
    markdown = null;
  }

  return (
    <Pagina>
      <CabecalhoPagina
        area="Documentação do TCC"
        titulo="Arquitetura e modelagem"
        subtitulo="Diagramas UML e MER do Eloserv, gerados a partir do código e do banco de dados atuais."
      />
      <nav aria-label="Diagramas" className="abas" style={{ marginBottom: '1.25rem' }}>
        {ABAS_ARQUITETURA.map((a) => (
          <Link key={a.id} href={`/arquitetura?aba=${a.id}`} className="aba" aria-current={a.id === aba.id ? 'page' : undefined}>
            {a.rotulo}
          </Link>
        ))}
      </nav>
      {markdown === null ? (
        <Aviso tipo="erro">
          Não foi possível ler <code>docs/diagramas/{aba.arquivo}</code>. Confira se a pasta <code>docs/diagramas</code> existe ao lado de <code>frontend</code> (ou o volume no Docker).
        </Aviso>
      ) : (
        <article className="card grande">
          <ConteudoMarkdown markdown={markdown} prefixo={aba.id} />
        </article>
      )}
    </Pagina>
  );
}
