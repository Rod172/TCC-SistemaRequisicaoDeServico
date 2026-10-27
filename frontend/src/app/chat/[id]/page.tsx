'use client';

/**
 * @file chat/[id]/page.tsx
 * @description Página dedicada do chat (US14/US15) — destino do link de notificação de nova mensagem
 * (US16, `link_redirecionamento: /chat/:id`, onde `:id` é o id da PROPOSTA desde a US34). A experiência
 * do dia a dia é o `ChatDrawer` (painel lateral aberto a partir do detalhe da solicitação/oportunidade);
 * esta página cobre o caso de abrir o link direto (ex.: vindo do sino de notificações) sem passar por lá.
 * Layout da US39: cabeçalho e rodapé compartilhados, a conversa num cartão e, ao lado, os atalhos para
 * as listas e a orientação de pagar sempre pela plataforma.
 *
 * BIBLIOTECAS UTILIZADAS:
 * 1. Next.js (^14.2.3): Framework React com App Router e rotas dinâmicas.
 *    Doc Oficial: https://nextjs.org/docs
 * 2. Lucide React (^0.383.0): Ícones de navegação e de garantia.
 *    Doc Oficial: https://lucide.dev/
 */

import React, { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { ChevronLeft, ShieldCheck } from 'lucide-react';
import ChatPanel from '@/components/ChatPanel';
import Pagina from '@/components/ui/Pagina';

export default function ChatPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const [pronto, setPronto] = useState(false);
  const [prestador, setPrestador] = useState(false);

  useEffect(() => {
    if (!localStorage.getItem('@ServicoFacil:token')) {
      router.replace('/login');
      return;
    }
    try {
      const usuario = JSON.parse(localStorage.getItem('@ServicoFacil:user') || 'null');
      setPrestador(['PRESTADOR', 'ADMIN'].includes(usuario?.tipo_perfil));
    } catch {
      setPrestador(false);
    }
    setPronto(true);
  }, [router]);

  function voltar() {
    if (window.history.length > 1) router.back();
    else router.push('/minhas-solicitacoes');
  }

  if (!pronto) return null;

  return (
    <Pagina>
      <button type="button" onClick={voltar} className="link-voltar btn-texto" style={{ border: 0, background: 'transparent', cursor: 'pointer', font: 'inherit', fontSize: '0.875rem', fontWeight: 600 }}>
        <ChevronLeft size={16} aria-hidden="true" /> Voltar
      </button>
      <div className="layout-lateral">
        <aside aria-label="Sobre esta conversa" className="lateral estreita">
          <section className="card empilhado" style={{ gap: '0.75rem' }}>
            <span className="rotulo-area" style={{ color: 'var(--text-secondary)' }}>Conversa sobre a proposta</span>
            <p className="texto-apoio" style={{ fontSize: '0.875rem', lineHeight: 1.55 }}>
              Use o chat para tirar dúvidas, combinar horário e negociar antes de contratar. Você pode enviar fotos e PDFs.
            </p>
            <Link href="/minhas-solicitacoes" className="btn btn-secundario">Minhas solicitações</Link>
            {prestador && <Link href="/minhas-propostas" className="btn btn-secundario">Minhas propostas</Link>}
          </section>
          <section className="card" style={{ display: 'flex', gap: '0.6rem', alignItems: 'flex-start', background: 'transparent' }}>
            <ShieldCheck size={18} color="var(--brand-sky)" aria-hidden="true" style={{ flexShrink: 0 }} />
            <p className="texto-apoio" style={{ fontSize: '0.8rem', lineHeight: 1.55 }}>Pague sempre pela plataforma: só assim o valor fica protegido pela garantia até a conclusão do serviço.</p>
          </section>
        </aside>
        <section aria-label="Conversa" className="principal card grande" style={{ height: 'min(72vh, 760px)', minHeight: '480px', background: 'var(--bg-highlight)' }}>
          <ChatPanel propostaId={params.id} />
        </section>
      </div>
    </Pagina>
  );
}
