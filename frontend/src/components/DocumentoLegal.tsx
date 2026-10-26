/** Next.js 14 Link: navegação pública dos documentos (US40).
 * Documentação oficial: https://nextjs.org/docs/14/app/api-reference/components/link */
import Link from 'next/link';
import estilosLegais from './legal.module.css';
import documentos from '@/conteudo/documentos-legais.json';
export default function DocumentoLegal({ titulo, versao, secoes, dadosPublicacao = documentos }: { titulo: string; versao: string; secoes: string[][]; dadosPublicacao?: typeof documentos }) {
 return <main className={estilosLegais.conteudo} style={{ maxWidth: 850, margin: '2rem auto', padding: '0 1.25rem 3rem', lineHeight: 1.75, overflowWrap: 'anywhere' }}>
  <Link href="/">← Voltar para a página inicial</Link>
  <h1 style={{ marginTop: '1.5rem', fontSize: 'clamp(1.6rem,5vw,2.3rem)' }}>{titulo}</h1>
  <p>Versão {versao} · Publicação em {dadosPublicacao.publicado_em.split('-').reverse().join('/')}</p>
  <p>Documento do protótipo acadêmico Eloserv / ServiçoFácil. Descreve os recursos desta versão; não é certificação de conformidade jurídica.</p>
  <nav aria-label="Seções do documento"><ul>{secoes.map(([nome],i)=><li key={nome}><a href={`#secao-${i+1}`}>{nome}</a></li>)}</ul></nav>
  {secoes.map(([nome,texto],i)=><section key={nome} id={`secao-${i+1}`} style={{ marginTop: '2rem', scrollMarginTop: '1rem' }}><h2 style={{ fontSize: '1.25rem' }}>{nome}</h2><p>{texto}</p></section>)}
  <section style={{ marginTop: '2rem' }}><h2>Contato e referências</h2>
   <p>{dadosPublicacao.responsavel} · <a href={`mailto:${dadosPublicacao.email_privacidade}`}>{dadosPublicacao.email_privacidade}</a></p>
   <p><Link href="/privacidade">Central de Privacidade</Link> · <Link href="/termos-de-uso">Termos de Uso</Link> · <Link href="/politica-de-privacidade">Política de Privacidade</Link></p>
   <ul><li><a href="https://www.planalto.gov.br/ccivil_03/_ato2015-2018/2018/lei/l13709compilado.htm" target="_blank" rel="noopener noreferrer">Lei Geral de Proteção de Dados Pessoais</a></li>
   <li><a href="https://www.gov.br/anpd/pt-br/assuntos/titular-de-dados/direito-dos-titulares" target="_blank" rel="noopener noreferrer">ANPD: direitos dos titulares</a></li>
   <li><a href="https://developers.google.com/fonts/faq/privacy" target="_blank" rel="noopener noreferrer">Google Fonts: informações de privacidade</a></li></ul>
  </section>
 </main>;
}
