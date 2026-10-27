'use client';

/**
 * @file MenuConta.tsx
 * @description Menu da conta no cabeçalho (US38): um botão com as iniciais do usuário que abre Meu
 * painel, Meu perfil, Configurações, o seletor de tema (US42) e Sair, no lugar dos ícones soltos que ficavam no cabeçalho. Fecha ao
 * clicar fora, com Escape (devolvendo o foco ao botão) e ao escolher uma opção.
 *
 * BIBLIOTECAS UTILIZADAS:
 * 1. Lucide React (^0.383.0): Ícones das opções do menu.
 *    Doc Oficial: https://lucide.dev/
 * 2. Next.js (^14.2.3): Navegação com `Link`.
 *    Doc Oficial: https://nextjs.org/docs
 */

import React, { useEffect, useId, useRef, useState } from 'react';
import Link from 'next/link';
import { UserCircle2, Settings, LogOut, ChevronDown, LayoutDashboard } from 'lucide-react';
import SeletorTema from './ui/SeletorTema';

interface MenuContaProps {
  nome: string;
  onSair: () => void;
  /** Links do cabeçalho que, em telas estreitas, saem da barra e passam a aparecer aqui. */
  linksTelaEstreita?: { href: string; rotulo: string }[];
}

const estiloItem: React.CSSProperties = {
  display: 'flex', alignItems: 'center', gap: '0.6rem', width: '100%', minHeight: '44px', padding: '0 1rem',
  background: 'transparent', border: 'none', color: 'var(--text-primary)', fontSize: '0.9rem', fontWeight: 500,
  textDecoration: 'none', cursor: 'pointer', textAlign: 'left', boxSizing: 'border-box',
};

export default function MenuConta({ nome, onSair, linksTelaEstreita = [] }: MenuContaProps) {
  const [aberto, setAberto] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const botaoRef = useRef<HTMLButtonElement>(null);
  const idPainel = useId();
  const iniciais = nome.split(' ').filter(Boolean).slice(0, 2).map((parte) => parte[0]?.toUpperCase()).join('') || '?';

  useEffect(() => {
    if (!aberto) return;
    function fecharAoClicarFora(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) setAberto(false);
    }
    function fecharComEscape(e: KeyboardEvent) {
      if (e.key === 'Escape') {
        setAberto(false);
        botaoRef.current?.focus();
      }
    }
    document.addEventListener('mousedown', fecharAoClicarFora);
    document.addEventListener('keydown', fecharComEscape);
    return () => {
      document.removeEventListener('mousedown', fecharAoClicarFora);
      document.removeEventListener('keydown', fecharComEscape);
    };
  }, [aberto]);

  return (
    <div ref={containerRef} style={{ position: 'relative' }}>
      <button
        ref={botaoRef} type="button" onClick={() => setAberto((v) => !v)}
        aria-expanded={aberto} aria-controls={idPainel} aria-label={`Menu da conta de ${nome}`}
        style={{ display: 'flex', alignItems: 'center', gap: '0.2rem', minHeight: '44px', padding: '0 0.25rem', background: 'transparent', border: 'none', color: 'var(--text-secondary)', cursor: 'pointer' }}
      >
        <span aria-hidden="true" style={{ width: '34px', height: '34px', borderRadius: '50%', background: 'var(--sky-bg)', color: 'var(--brand-sky)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.8rem', fontWeight: 700 }}>
          {iniciais}
        </span>
        <ChevronDown size={16} aria-hidden="true" />
      </button>

      {aberto && (
        <div id={idPainel} className="notif-dropdown" style={{
          position: 'absolute', top: 'calc(100% + 6px)', right: 0, width: '220px', padding: '0.4rem 0',
          background: 'var(--bg-color)', border: '1px solid var(--card-border)', borderRadius: '12px',
          boxShadow: 'var(--shadow-menu)', zIndex: 50,
        }}>
          <p style={{ padding: '0.5rem 1rem 0.6rem', fontSize: '0.8rem', color: 'var(--text-secondary)', borderBottom: '1px solid var(--card-border)', marginBottom: '0.3rem', overflowWrap: 'anywhere' }}>
            {nome}
          </p>
          {linksTelaEstreita.map((link) => (
            <Link key={link.href} href={link.href} onClick={() => setAberto(false)} className="so-telas-estreitas" style={estiloItem}>
              {link.rotulo}
            </Link>
          ))}
          <Link href="/dashboard" onClick={() => setAberto(false)} style={estiloItem}>
            <LayoutDashboard size={18} aria-hidden="true" /> Meu painel
          </Link>
          <Link href="/perfil" onClick={() => setAberto(false)} style={estiloItem}>
            <UserCircle2 size={18} aria-hidden="true" /> Meu perfil
          </Link>
          <Link href="/configuracoes" onClick={() => setAberto(false)} style={estiloItem}>
            <Settings size={18} aria-hidden="true" /> Configurações
          </Link>
          {/* Tema da interface (US42): a troca vale na hora, sem fechar o menu. */}
          <div style={{ padding: '0.6rem 1rem', margin: '0.3rem 0', borderTop: '1px solid var(--card-border)', borderBottom: '1px solid var(--card-border)' }}>
            <SeletorTema />
          </div>
          <button type="button" onClick={() => { setAberto(false); onSair(); }} style={{ ...estiloItem, color: 'var(--danger-text)' }}>
            <LogOut size={18} aria-hidden="true" /> Sair
          </button>
        </div>
      )}
    </div>
  );
}
