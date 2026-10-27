'use client';

/**
 * @file AceiteDocumentos.tsx
 * @description Seção "Termos e privacidade" dos cadastros (US40), no visual da US39: dois sinais
 * distintos e desmarcados (aceite dos Termos de Uso e ciência da Política de Privacidade), sem
 * consentimento genérico, com os documentos abrindo em outra aba para não perder o preenchimento.
 *
 * BIBLIOTECAS UTILIZADAS:
 * 1. React (^18.3.1): Caixas de seleção controladas e `useId` para associar rótulos.
 *    Doc Oficial: https://react.dev/reference/react-dom/components/input
 * 2. Next.js (^14.2.3): Navegação com `Link`.
 *    Doc Oficial: https://nextjs.org/docs/14/app/api-reference/components/link
 * 3. Lucide React (^0.383.0): Ícone dos links externos.
 *    Doc Oficial: https://lucide.dev/
 */

import { useId } from 'react';
import Link from 'next/link';
import { ArrowUpRight } from 'lucide-react';
import documentos from '@/conteudo/documentos-legais.json';

interface AceiteDocumentosProps {
  /** Número da seção no formulário, seguindo as seções numeradas do cadastro. */
  numero?: number;
  termos: boolean;
  ciencia: boolean;
  alterarTermos: (valor: boolean) => void;
  alterarCiencia: (valor: boolean) => void;
}

export default function AceiteDocumentos({ numero, termos, ciencia, alterarTermos, alterarCiencia }: AceiteDocumentosProps) {
  const id = useId();
  return (
    <fieldset className="secao-form">
      <legend>{numero ? `${numero}. ` : ''}Termos e privacidade</legend>
      <p className="texto-apoio" style={{ fontSize: '0.875rem', lineHeight: 1.55 }}>
        Leia os documentos antes de criar a conta. Eles abrem em outra aba, sem perder o que você já preencheu.
      </p>
      <div className="grupo-botoes">
        <Link href={documentos.termos_url} target="_blank" rel="noopener noreferrer" className="btn btn-secundario">
          Termos de Uso <ArrowUpRight size={15} aria-hidden="true" /><span className="sr-only"> (abre em outra aba)</span>
        </Link>
        <Link href={documentos.privacidade_url} target="_blank" rel="noopener noreferrer" className="btn btn-secundario">
          Política de Privacidade <ArrowUpRight size={15} aria-hidden="true" /><span className="sr-only"> (abre em outra aba)</span>
        </Link>
      </div>
      <label htmlFor={`${id}-termos`} className="caixa-opcao">
        <input type="checkbox" id={`${id}-termos`} checked={termos} onChange={(e) => alterarTermos(e.target.checked)} />
        <span>Aceito os Termos de Uso, versão {documentos.versao_termos}.</span>
      </label>
      <label htmlFor={`${id}-ciencia`} className="caixa-opcao">
        <input type="checkbox" id={`${id}-ciencia`} checked={ciencia} onChange={(e) => alterarCiencia(e.target.checked)} />
        <span>Li a Política de Privacidade, versão {documentos.versao_privacidade}, e estou ciente do tratamento descrito.</span>
      </label>
      <p className="ajuda">
        A ciência da Política não autoriza qualquer uso dos seus dados. Os direitos de titular previstos na LGPD (Lei nº 13.709/2018) podem ser exercidos pela{' '}
        <Link href="/privacidade" target="_blank" rel="noopener noreferrer">Central de Privacidade</Link>.
      </p>
    </fieldset>
  );
}
