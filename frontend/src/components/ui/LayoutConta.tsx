'use client';

/**
 * @file LayoutConta.tsx
 * @description Estrutura de "Minha conta" (US39), compartilhada por Meu perfil, Configurações de
 * notificação e Central de Privacidade (US40): título da área, navegação lateral entre as seções (dados
 * pessoais, senha, notificações, privacidade e desativação da conta) e o conteúdo da seção ao lado.
 * No celular, a navegação fica acima do conteúdo.
 *
 * BIBLIOTECAS UTILIZADAS:
 * 1. Lucide React (^0.383.0): Ícones das seções.
 *    Doc Oficial: https://lucide.dev/
 * 2. Next.js (^14.2.3): Navegação com `Link` e `useRouter`.
 *    Doc Oficial: https://nextjs.org/docs
 */

import React from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Bell, Lock, LogOut, ShieldCheck, UserCircle2, UserX } from 'lucide-react';
import Pagina, { CabecalhoPagina } from './Pagina';

interface LayoutContaProps {
  /** Página atual: em "perfil" os itens rolam até a seção; nas demais, levam de volta ao perfil. */
  pagina: 'perfil' | 'notificacoes' | 'privacidade';
  children: React.ReactNode;
}

const estiloItem: React.CSSProperties = {
  display: 'flex', alignItems: 'center', gap: '0.6rem', minHeight: '46px', padding: '0 0.9rem',
  borderRadius: '10px', color: 'var(--text-secondary)', fontSize: '0.9rem', fontWeight: 600, textDecoration: 'none',
};
const estiloItemAtivo: React.CSSProperties = {
  ...estiloItem, background: 'var(--card-bg)', boxShadow: 'inset 3px 0 0 var(--accent-indigo)', color: 'var(--text-primary)', fontWeight: 700,
};

export default function LayoutConta({ pagina, children }: LayoutContaProps) {
  const router = useRouter();
  const prefixo = pagina === 'perfil' ? '' : '/perfil';

  function sair() {
    localStorage.removeItem('@ServicoFacil:token');
    localStorage.removeItem('@ServicoFacil:user');
    router.push('/');
  }

  const itens = [
    { href: `${prefixo}#dados`, rotulo: 'Dados pessoais', icone: <UserCircle2 size={18} aria-hidden="true" />, ativo: pagina === 'perfil' },
    { href: `${prefixo}#senha`, rotulo: 'Senha', icone: <Lock size={18} aria-hidden="true" />, ativo: false },
    { href: '/configuracoes', rotulo: 'Notificações', icone: <Bell size={18} aria-hidden="true" />, ativo: pagina === 'notificacoes' },
    { href: '/privacidade', rotulo: 'Central de Privacidade', icone: <ShieldCheck size={18} aria-hidden="true" />, ativo: pagina === 'privacidade' },
    { href: `${prefixo}#desativar`, rotulo: 'Desativar conta', icone: <UserX size={18} aria-hidden="true" />, ativo: false },
  ];

  return (
    <Pagina largura="media">
      <CabecalhoPagina titulo="Minha conta" subtitulo="Dados pessoais, senha, notificações, privacidade e desativação da conta." />
      <div className="layout-lateral">
        <nav aria-label="Seções da conta" className="lateral estreita" style={{ gap: '0.25rem', flexBasis: '220px' }}>
          {itens.map((item) => (
            <Link key={item.rotulo} href={item.href} aria-current={item.ativo ? 'page' : undefined} style={item.ativo ? estiloItemAtivo : estiloItem}>
              {item.icone}{item.rotulo}
            </Link>
          ))}
          <button type="button" onClick={sair} style={{ ...estiloItem, marginTop: '0.5rem', border: 0, borderTop: '1px solid var(--card-border)', borderRadius: 0, background: 'transparent', color: 'var(--danger-text)', font: 'inherit', fontSize: '0.9rem', fontWeight: 600, cursor: 'pointer', textAlign: 'left' }}>
            <LogOut size={18} aria-hidden="true" /> Sair da conta
          </button>
        </nav>
        <div className="principal">{children}</div>
      </div>
    </Pagina>
  );
}
