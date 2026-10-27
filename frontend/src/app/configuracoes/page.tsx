'use client';

/**
 * @file configuracoes/page.tsx
 * @description Tela de Configurações de Notificação (US30): um interruptor por tipo de evento,
 * persistido por usuário. Distinto do /perfil (dados pessoais, senha, LGPD), mas com a mesma
 * navegação lateral de "Minha conta" (US39).
 *
 * BIBLIOTECAS UTILIZADAS:
 * 1. Lucide React (^0.383.0): Ícones das categorias de evento.
 *    Doc Oficial: https://lucide.dev/
 * 2. Next.js (^14.2.3): Framework React com App Router.
 *    Doc Oficial: https://nextjs.org/docs
 * 3. Axios (^1.7.2): Requisições HTTP REST à API backend.
 *    Doc Oficial: https://axios-http.com/docs/intro
 */

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Ban, FileText, Handshake, MessageCircle } from 'lucide-react';
import api from '@/services/api';
import LayoutConta from '@/components/ui/LayoutConta';
import { Aviso, EstadoLista } from '@/components/ui/Elementos';

type TipoEvento = 'NOVA_PROPOSTA' | 'PROPOSTA_ACEITA_RECUSADA' | 'NOVA_MENSAGEM_CHAT' | 'SOLICITACAO_CANCELADA';

interface Preferencia {
  tipo_evento: TipoEvento;
  ativo: boolean;
}

const DESCRICAO_EVENTO: Record<TipoEvento, { titulo: string; descricao: string; icone: React.ReactNode }> = {
  NOVA_PROPOSTA: {
    titulo: 'Nova proposta recebida',
    descricao: 'Avisar quando um prestador enviar uma proposta para uma das suas solicitações.',
    icone: <FileText size={18} aria-hidden="true" />,
  },
  PROPOSTA_ACEITA_RECUSADA: {
    titulo: 'Proposta aceita ou recusada',
    descricao: 'Avisar quando o cliente aceitar ou recusar uma proposta que você enviou.',
    icone: <Handshake size={18} aria-hidden="true" />,
  },
  NOVA_MENSAGEM_CHAT: {
    titulo: 'Nova mensagem no chat',
    descricao: 'Avisar quando você receber uma mensagem em uma conversa sobre proposta.',
    icone: <MessageCircle size={18} aria-hidden="true" />,
  },
  SOLICITACAO_CANCELADA: {
    titulo: 'Solicitação cancelada',
    descricao: 'Avisar quando uma solicitação em que você propôs for cancelada pelo cliente.',
    icone: <Ban size={18} aria-hidden="true" />,
  },
};

export default function ConfiguracoesPage() {
  const router = useRouter();
  const [preferencias, setPreferencias] = useState<Preferencia[]>([]);
  const [carregando, setCarregando] = useState(true);
  const [salvando, setSalvando] = useState<TipoEvento | null>(null);
  const [erro, setErro] = useState('');
  const [sucesso, setSucesso] = useState('');

  useEffect(() => {
    const token = localStorage.getItem('@ServicoFacil:token');
    if (!token) {
      router.replace('/login');
      return;
    }
    api
      .get('/perfil/preferencias-notificacao')
      .then((response) => setPreferencias(response.data.data))
      .catch((err) => setErro(err.response?.data?.message || 'Não foi possível carregar suas configurações.'))
      .finally(() => setCarregando(false));
  }, [router]);

  async function alternar(tipo: TipoEvento) {
    const atual = preferencias.find((p) => p.tipo_evento === tipo);
    const novoValor = !atual?.ativo;

    setPreferencias((lista) => lista.map((p) => (p.tipo_evento === tipo ? { ...p, ativo: novoValor } : p)));
    setSalvando(tipo);
    setErro('');
    setSucesso('');
    try {
      await api.put('/perfil/preferencias-notificacao', {
        preferencias: [{ tipo_evento: tipo, ativo: novoValor }],
      });
      setSucesso('Preferências salvas.');
    } catch (err: any) {
      // Reverte em caso de falha, pra UI não mentir sobre o que está salvo de verdade.
      setPreferencias((lista) => lista.map((p) => (p.tipo_evento === tipo ? { ...p, ativo: !novoValor } : p)));
      setErro(err.response?.data?.message || 'Não foi possível salvar essa preferência.');
    } finally {
      setSalvando(null);
    }
  }

  return (
    <LayoutConta pagina="notificacoes">
      <section aria-labelledby="titulo-notificacoes" className="card grande empilhado" style={{ gap: '0.5rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '0.75rem', flexWrap: 'wrap', marginBottom: '0.5rem' }}>
          <div>
            <h1 id="titulo-notificacoes" className="titulo-secao">Notificações</h1>
            <p className="texto-apoio">Escolha o que aparece no sino. Cada mudança é salva na hora.</p>
          </div>
        </div>
        {sucesso && <Aviso tipo="sucesso">{sucesso}</Aviso>}
        {erro && <Aviso tipo="erro">{erro}</Aviso>}

        {carregando ? (
          <EstadoLista tipo="carregando">Carregando...</EstadoLista>
        ) : (
          <ul className="lista-simples" style={{ gap: 0 }}>
            {preferencias.map((p) => {
              const info = DESCRICAO_EVENTO[p.tipo_evento];
              const idTitulo = `pref-${p.tipo_evento}`;
              return (
                <li key={p.tipo_evento} style={{ display: 'flex', alignItems: 'center', gap: '1rem', padding: '1rem 0', borderTop: '1px solid var(--card-border)' }}>
                  <span aria-hidden="true" style={{ width: 38, height: 38, borderRadius: 10, background: 'var(--primary-tint)', color: 'var(--link-color)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                    {info.icone}
                  </span>
                  <span style={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column', gap: '2px' }}>
                    <strong id={idTitulo} style={{ fontSize: '0.95rem' }}>{info.titulo}</strong>
                    <span className="texto-apoio" style={{ fontSize: '0.82rem' }}>{info.descricao}</span>
                  </span>
                  <button
                    type="button" onClick={() => alternar(p.tipo_evento)} disabled={salvando === p.tipo_evento}
                    role="switch" aria-labelledby={idTitulo} aria-checked={p.ativo}
                    style={{
                      position: 'relative', width: '52px', height: '30px', borderRadius: '999px', border: 'none', padding: 0,
                      background: p.ativo ? 'var(--primary-color)' : 'var(--card-border)', cursor: salvando === p.tipo_evento ? 'wait' : 'pointer',
                      flexShrink: 0, transition: 'background 0.15s',
                    }}
                  >
                    <span style={{ position: 'absolute', top: '4px', left: p.ativo ? '26px' : '4px', width: '22px', height: '22px', borderRadius: '50%', background: p.ativo ? 'var(--on-primary)' : 'var(--text-secondary)', transition: 'left 0.15s' }} />
                  </button>
                </li>
              );
            })}
          </ul>
        )}
      </section>
    </LayoutConta>
  );
}
