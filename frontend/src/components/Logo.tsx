/**
 * @file Logo.tsx
 * @description Logo da marca Eloserv (US37): símbolo de dois elos encadeados — cliente e prestador
 * ligados pelo mesmo serviço — seguido da palavra "eloserv" na fonte Sora. A marca tem duas versões
 * de cores fixas, que não acompanham a paleta da interface: a escura (#818CF8 + #38BDF8) e a clara
 * (#4F46E5 + #0EA5E9, "serv" em #0F172A). O tema escolhe a versão pelos tokens --logo-* do
 * globals.css (US42). O traço grosso na cor do fundo recorta um elo do outro, dando o efeito de
 * corrente encaixada; por isso `corFundo` precisa ser o fundo real de onde o logo está.
 *
 * BIBLIOTECAS UTILIZADAS:
 * 1. React (^18.3.1): Componente funcional com SVG inline.
 *    Doc Oficial: https://react.dev/
 * 2. Google Fonts — Sora (carregada em globals.css): Fonte da palavra "eloserv".
 *    Doc Oficial: https://fonts.google.com/specimen/Sora
 */

import React from 'react';

interface LogoProps {
  /** Altura do símbolo em px; a palavra acompanha proporcionalmente. */
  tamanho?: number;
  /** Mostra a palavra "eloserv" ao lado do símbolo (desligar para usar só o símbolo). */
  comNome?: boolean;
  /** Cor do fundo onde o logo é exibido, usada no recorte entre os elos. */
  corFundo?: string;
}

// Versão da marca definida pelo tema (tokens em globals.css); os valores são as cores fixas do logo.
const INDIGO = 'var(--logo-indigo)';
const AZUL_CEU = 'var(--logo-sky)';

export default function Logo({ tamanho = 32, comNome = true, corFundo = 'var(--bg-color)' }: LogoProps) {
  return (
    <span style={{ display: 'inline-flex', alignItems: 'center', gap: Math.round(tamanho * 0.28) }}>
      <svg width={tamanho} height={tamanho} viewBox="0 0 64 64" fill="none" aria-hidden="true">
        <rect x="5" y="20" width="34" height="24" rx="12" stroke={INDIGO} strokeWidth="6" />
        <rect x="25" y="20" width="34" height="24" rx="12" stroke={corFundo} strokeWidth="12" />
        <rect x="25" y="20" width="34" height="24" rx="12" stroke={AZUL_CEU} strokeWidth="6" />
        <path d="M27 44 A12 12 0 0 0 39 32" stroke={corFundo} strokeWidth="12" />
        <path d="M27 44 A12 12 0 0 0 39 32" stroke={INDIGO} strokeWidth="6" strokeLinecap="round" />
      </svg>
      {comNome && (
        <span style={{
          fontFamily: "'Sora', var(--font-family)", fontSize: Math.round(tamanho * 0.66), fontWeight: 700,
          letterSpacing: '-0.03em', lineHeight: 1, color: 'var(--logo-text)',
        }}>
          <span style={{ color: INDIGO }}>elo</span>serv
        </span>
      )}
    </span>
  );
}
