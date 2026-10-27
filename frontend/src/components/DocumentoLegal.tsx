/**
 * @file DocumentoLegal.tsx
 * @description Página de documento legal (US40) — Termos de Uso ou Política de Privacidade, na versão
 * vigente ou numa versão publicada anteriormente — no visual da US39: cabeçalho e rodapé compartilhados,
 * texto em cartão e, ao lado, o sumário, o contato do responsável e as referências oficiais. No
 * celular, o sumário vira um bloco recolhível acima do texto.
 *
 * BIBLIOTECAS UTILIZADAS:
 * 1. Next.js (^14.2.3): Navegação com `Link`.
 *    Doc Oficial: https://nextjs.org/docs/14/app/api-reference/components/link
 * 2. Lucide React (^0.383.0): Ícones de contato e links externos.
 *    Doc Oficial: https://lucide.dev/
 */

import Link from 'next/link';
import { ArrowUpRight, Mail, ShieldCheck } from 'lucide-react';
import Pagina, { CabecalhoPagina } from '@/components/ui/Pagina';
import { Aviso } from '@/components/ui/Elementos';
import documentos from '@/conteudo/documentos-legais.json';

interface DocumentoLegalProps {
  titulo: 'Termos de Uso' | 'Política de Privacidade';
  versao: string;
  secoes: string[][];
  dadosPublicacao?: typeof documentos;
}

const REFERENCIAS = [
  { href: 'https://www.planalto.gov.br/ccivil_03/_ato2015-2018/2018/lei/l13709compilado.htm', rotulo: 'Lei Geral de Proteção de Dados Pessoais' },
  { href: 'https://www.gov.br/anpd/pt-br/assuntos/titular-de-dados/direito-dos-titulares', rotulo: 'ANPD: direitos dos titulares' },
  { href: 'https://developers.google.com/fonts/faq/privacy', rotulo: 'Google Fonts: informações de privacidade' },
];

function Sumario({ secoes }: { secoes: string[][] }) {
  return (
    <ol className="sumario-legal">
      {secoes.map(([nome], i) => <li key={nome}><a href={`#secao-${i + 1}`}>{nome}</a></li>)}
    </ol>
  );
}

export default function DocumentoLegal({ titulo, versao, secoes, dadosPublicacao = documentos }: DocumentoLegalProps) {
  const publicadoEm = dadosPublicacao.publicado_em.split('-').reverse().join('/');
  const outro = titulo === 'Termos de Uso'
    ? { href: '/politica-de-privacidade', rotulo: 'Política de Privacidade' }
    : { href: '/termos-de-uso', rotulo: 'Termos de Uso' };

  return (
    <Pagina>
      <CabecalhoPagina
        voltar={{ href: '/', rotulo: 'Página inicial' }}
        area="Documentos legais"
        titulo={titulo}
        subtitulo={`Versão ${versao} · publicada em ${publicadoEm}`}
        acoes={<Link href={outro.href} className="btn btn-secundario">{outro.rotulo}</Link>}
      />

      <Aviso tipo="info">
        Documento do protótipo acadêmico Eloserv, elaborado com base na LGPD (Lei nº 13.709/2018). Descreve os recursos desta versão; não é certificação de conformidade jurídica.
      </Aviso>

      <details className="card so-telas-estreitas">
        <summary style={{ fontWeight: 700, cursor: 'pointer', minHeight: '28px' }}>Nesta página ({secoes.length} seções)</summary>
        <Sumario secoes={secoes} />
      </details>

      <div className="layout-lateral">
        <article className="principal card grande texto-legal">
          {secoes.map(([nome, texto], i) => (
            <section key={nome} id={`secao-${i + 1}`} aria-labelledby={`titulo-secao-${i + 1}`}>
              <h2 id={`titulo-secao-${i + 1}`}>{nome}</h2>
              <p>{texto}</p>
            </section>
          ))}
        </article>

        <aside className="lateral">
          <nav aria-label="Seções do documento" className="card so-telas-largas">
            <h2 className="titulo-secao" style={{ fontSize: '0.95rem', marginBottom: '0.6rem' }}>Nesta página</h2>
            <Sumario secoes={secoes} />
          </nav>

          <section aria-labelledby="titulo-contato-legal" className="card empilhado" style={{ gap: '0.6rem' }}>
            <h2 id="titulo-contato-legal" className="titulo-secao" style={{ fontSize: '0.95rem' }}>Contato sobre seus dados</h2>
            <p style={{ fontSize: '0.875rem' }}>{dadosPublicacao.responsavel}</p>
            <a href={`mailto:${dadosPublicacao.email_privacidade}`} style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.875rem', overflowWrap: 'anywhere' }}>
              <Mail size={15} aria-hidden="true" /> {dadosPublicacao.email_privacidade}
            </a>
            <Link href="/privacidade" className="btn btn-secundario btn-bloco" style={{ marginTop: '0.35rem' }}>
              <ShieldCheck size={16} aria-hidden="true" /> Central de Privacidade
            </Link>
          </section>

          <section aria-labelledby="titulo-referencias" className="card empilhado" style={{ gap: '0.5rem' }}>
            <h2 id="titulo-referencias" className="titulo-secao" style={{ fontSize: '0.95rem' }}>Referências oficiais</h2>
            <ul className="lista-simples" style={{ gap: '0.35rem' }}>
              {REFERENCIAS.map((r) => (
                <li key={r.href}>
                  <a href={r.href} target="_blank" rel="noopener noreferrer" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.3rem', fontSize: '0.85rem' }}>
                    {r.rotulo} <ArrowUpRight size={14} aria-hidden="true" /><span className="sr-only"> (abre em outra aba)</span>
                  </a>
                </li>
              ))}
            </ul>
          </section>
        </aside>
      </div>
    </Pagina>
  );
}
