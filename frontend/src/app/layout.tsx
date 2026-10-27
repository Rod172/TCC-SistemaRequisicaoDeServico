/**
 * @file layout.tsx
 * @description Layout raiz da aplicação Next.js (App Router) com Next.js 14 e TypeScript.
 * 
 * O script do <head> aplica o tema (US42) antes da primeira pintura: a página já nasce no tema certo,
 * sem piscar. O atributo `data-tema` que ele escreve no <html> não vem do servidor, por isso o
 * `suppressHydrationWarning`.
 *
 * BIBLIOTECAS UTILIZADAS:
 * 1. Next.js (^14.2.3): Framework React com suporte a SSR e App Router.
 *    Doc Oficial: https://nextjs.org/docs
 */

import './globals.css';
import { Metadata } from 'next';
import TemaSincronizado from '@/components/TemaSincronizado';
import { SCRIPT_TEMA_INICIAL } from '@/utils/tema';

export const metadata: Metadata = {
  title: 'Eloserv | Plataforma de Requisição de Serviços',
  description: 'Plataforma bilateral para intermediação de serviços sob demanda.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="pt-BR" suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: SCRIPT_TEMA_INICIAL }} />
      </head>
      <body>
        <TemaSincronizado />
        {children}
      </body>
    </html>
  );
}
