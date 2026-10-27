'use client';

/**
 * @file TemaSincronizado.tsx
 * @description Mantém o tema da página em dia depois do carregamento (US42), sem desenhar nada:
 * - no modo Automático, acompanha a troca de tema do sistema operacional com a página aberta;
 * - quando a escolha muda em outra aba, aplica aqui também e atualiza os seletores;
 * - ajusta a cor da barra do navegador no celular (meta theme-color) ao tema aplicado.
 * O tema inicial já foi aplicado pelo script do <head> (`SCRIPT_TEMA_INICIAL`).
 *
 * BIBLIOTECAS UTILIZADAS:
 * 1. React (^18.3.1): `useEffect` para registrar e remover os ouvintes.
 *    Doc Oficial: https://react.dev/reference/react/useEffect
 */

import { useEffect } from 'react';
import { CHAVE_TEMA, EVENTO_TEMA, aplicarTema, consultaTemaDoSistema, lerPreferencia } from '@/utils/tema';

export default function TemaSincronizado() {
  useEffect(() => {
    aplicarTema(lerPreferencia());

    const consulta = consultaTemaDoSistema();
    function sistemaMudou() {
      if (lerPreferencia() === 'automatico') aplicarTema('automatico');
    }
    function outraAbaMudou(e: StorageEvent) {
      if (e.key !== null && e.key !== CHAVE_TEMA) return;
      const preferencia = lerPreferencia();
      aplicarTema(preferencia);
      window.dispatchEvent(new CustomEvent(EVENTO_TEMA, { detail: preferencia }));
    }

    consulta?.addEventListener('change', sistemaMudou);
    window.addEventListener('storage', outraAbaMudou);
    return () => {
      consulta?.removeEventListener('change', sistemaMudou);
      window.removeEventListener('storage', outraAbaMudou);
    };
  }, []);

  return null;
}
