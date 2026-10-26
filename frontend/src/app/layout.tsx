/**
 * @file layout.tsx
 * @description Layout raiz da aplicação Next.js (App Router) com Next.js 14 e TypeScript.
 * 
 * BIBLIOTECAS UTILIZADAS:
 * 1. Next.js (^14.2.3): Framework React com suporte a SSR e App Router.
 *    Doc Oficial: https://nextjs.org/docs
 */

import './globals.css';
import RodapeLegal from '@/components/RodapeLegal';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'ServiçoFácil | Plataforma de Requisição de Serviços',
  description: 'Plataforma bilateral para intermediação de serviços sob demanda.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="pt-BR">
      <body>{children}<RodapeLegal /></body>
    </html>
  );
}
