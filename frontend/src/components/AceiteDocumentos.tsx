'use client';
/** React 18: dois sinais distintos, sem pré-seleção nem consentimento genérico.
 * https://react.dev/reference/react-dom/components/input
 * Next.js 14 Link: abrir documento sem perder o formulário. https://nextjs.org/docs/14/app/api-reference/components/link */
import Link from 'next/link';
import estilosLegais from './legal.module.css';
import documentos from '@/conteudo/documentos-legais.json';
export default function AceiteDocumentos({ termos, ciencia, alterarTermos, alterarCiencia }: {
 termos: boolean; ciencia: boolean; alterarTermos: (valor: boolean)=>void; alterarCiencia: (valor: boolean)=>void;
}) {
 return <fieldset className={estilosLegais.conteudo} style={{ padding: '1rem', border: '1px solid var(--card-border)', borderRadius: 8, margin: '1rem 0', lineHeight: 1.6 }}>
  <legend>Documentos do cadastro</legend>
  <p><Link href={documentos.termos_url} target="_blank" rel="noopener noreferrer">Ler Termos de Uso</Link> · <Link href={documentos.privacidade_url} target="_blank" rel="noopener noreferrer">Ler Política de Privacidade</Link> (abrem em outra aba)</p>
  <label style={{ display: 'flex', alignItems: 'flex-start', gap: '.5rem', marginTop: '.75rem' }}><input type="checkbox" checked={termos} onChange={e=>alterarTermos(e.target.checked)} />Aceito os Termos de Uso, versão {documentos.versao_termos}.</label>
  <label style={{ display: 'flex', alignItems: 'flex-start', gap: '.5rem', marginTop: '.75rem' }}><input type="checkbox" checked={ciencia} onChange={e=>alterarCiencia(e.target.checked)} />Li a Política de Privacidade, versão {documentos.versao_privacidade}, e estou ciente do tratamento descrito.</label>
  <p style={{ fontSize: '.85rem', marginTop: '.75rem' }}>A ciência da Política não autoriza qualquer uso dos seus dados. Pedidos e dúvidas podem ser enviados pela <Link href="/privacidade" target="_blank" rel="noopener noreferrer">Central de Privacidade</Link>.</p>
 </fieldset>;
}
