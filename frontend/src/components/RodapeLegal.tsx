/** Next.js 14: links legais públicos em todas as páginas (US40).
 * https://nextjs.org/docs/14/app/api-reference/components/link */
import Link from 'next/link';
import estilosLegais from './legal.module.css';
export default function RodapeLegal() {
 return <footer className={estilosLegais.conteudo} style={{ padding: '1.5rem 1.25rem', borderTop: '1px solid var(--card-border)', marginTop: '2rem' }}>
  <nav aria-label="Documentos e privacidade" style={{ display: 'flex', justifyContent: 'center', gap: '1rem', flexWrap: 'wrap' }}>
   <Link href="/termos-de-uso">Termos de Uso</Link><Link href="/politica-de-privacidade">Política de Privacidade</Link><Link href="/privacidade">Central de Privacidade</Link>
  </nav>
 </footer>;
}
