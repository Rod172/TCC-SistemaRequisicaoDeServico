'use client';

/**
 * @file page.tsx
 * @description Página inicial da plataforma Eloserv (US38). Usa o cabeçalho e o rodapé compartilhados
 * (US39), que mudam com a sessão; o conteúdo fica em `HomeVisitante` e `HomeLogado`. Status técnico
 * da API fica em /status.
 *
 * BIBLIOTECAS UTILIZADAS:
 * 1. Next.js (^14.2.3): Framework React para aplicações Web.
 *    Doc Oficial: https://nextjs.org/docs
 */

import React, { useEffect, useState } from 'react';
import Cabecalho from '@/components/ui/Cabecalho';
import { Rodape } from '@/components/ui/Pagina';
import HomeVisitante from '@/components/home/HomeVisitante';
import HomeLogado from '@/components/home/HomeLogado';
import { UsuarioSessao } from '@/components/home/comum';

export default function Home() {
  const [usuarioLogado, setUsuarioLogado] = useState<UsuarioSessao | null>(null);
  // Evita mostrar por um instante a página do visitante para quem já está logado.
  const [sessaoVerificada, setSessaoVerificada] = useState(false);

  useEffect(() => {
    const userRaw = localStorage.getItem('@ServicoFacil:user');
    if (userRaw && localStorage.getItem('@ServicoFacil:token')) {
      try {
        setUsuarioLogado(JSON.parse(userRaw));
      } catch {
        setUsuarioLogado(null);
      }
    }
    setSessaoVerificada(true);
  }, []);

  return (
    <div className="pagina">
      {/* Ao sair pelo menu da conta, a página troca para a versão de visitante sem recarregar. */}
      <Cabecalho onSair={() => setUsuarioLogado(null)} />

      {!sessaoVerificada && <main style={{ flex: 1 }} aria-busy="true" />}
      {sessaoVerificada && usuarioLogado && <HomeLogado usuario={usuarioLogado} />}
      {sessaoVerificada && !usuarioLogado && <main style={{ flex: 1 }}><HomeVisitante /></main>}

      <Rodape />
    </div>
  );
}
