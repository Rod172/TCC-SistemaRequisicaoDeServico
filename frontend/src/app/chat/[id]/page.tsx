'use client';

/**
 * @file chat/[id]/page.tsx
 * @description Página dedicada do chat (US14/US15) — destino do link de notificação de nova mensagem
 * (US16, `link_redirecionamento: /chat/:id`, onde `:id` é o id da PROPOSTA desde a US34). A experiência
 * do dia a dia é o `ChatDrawer` (painel lateral aberto a partir do detalhe da solicitação/oportunidade);
 * esta página cobre o caso de abrir o link direto (ex.: vindo do sino de notificações) sem passar por lá.
 *
 * BIBLIOTECAS UTILIZADAS:
 * 1. Next.js (^14.2.3): Framework React com App Router e rotas dinâmicas.
 *    Doc Oficial: https://nextjs.org/docs
 * 2. Lucide React (^0.383.0): Ícone de navegação.
 *    Doc Oficial: https://lucide.dev/
 */

import React, { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import ChatPanel from '@/components/ChatPanel';

export default function ChatPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const [pronto, setPronto] = useState(false);

  useEffect(() => {
    if (!localStorage.getItem('@ServicoFacil:token')) {
      router.replace('/login');
      return;
    }
    setPronto(true);
  }, [router]);

  if (!pronto) return null;

  return (
    <main style={{ maxWidth: '760px', margin: '2rem auto', padding: '0 1.5rem 2rem', display: 'flex', flexDirection: 'column', height: 'calc(100vh - 4rem)' }}>
      <Link href="/minhas-solicitacoes" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', color: 'var(--text-secondary)', fontSize: '0.9rem', textDecoration: 'none', marginBottom: '1rem' }}>
        <ArrowLeft size={16} /> Voltar
      </Link>
      <div style={{ flex: 1, minHeight: 0 }}>
        <ChatPanel propostaId={params.id} />
      </div>
    </main>
  );
}
