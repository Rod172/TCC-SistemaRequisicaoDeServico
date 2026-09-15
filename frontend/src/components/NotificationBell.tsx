'use client';

/**
 * @file NotificationBell.tsx
 * @description Sino de notificações no header, com contador de não lidas e dropdown (US16).
 * Reutilizado nas telas principais (home, oportunidades, minhas solicitações, admin). Atualiza em
 * tempo real via WebSocket (mesma conexão Socket.io do chat, US14) e também busca ao montar.
 *
 * BIBLIOTECAS UTILIZADAS:
 * 1. Socket.io Client (^4.8.3): Recebe o evento `nova-notificacao` em tempo real.
 *    Doc Oficial: https://socket.io/docs/v4/client-api/
 * 2. Lucide React (^0.383.0): Ícone de sino.
 *    Doc Oficial: https://lucide.dev/
 * 3. Next.js (^14.2.3): Navegação via `useRouter`.
 *    Doc Oficial: https://nextjs.org/docs
 */

import React, { useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { io, Socket } from 'socket.io-client';
import { Bell, Check } from 'lucide-react';
import api from '@/services/api';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api/v1';
const SOCKET_ORIGIN = API_BASE_URL.replace(/\/api\/v1\/?$/, '');

interface Notificacao {
  id: string;
  titulo: string;
  mensagem: string;
  link_redirecionamento?: string | null;
  lida: boolean;
  createdAt: string;
}

function formatarRelativo(iso: string) {
  const diffMs = Date.now() - new Date(iso).getTime();
  const minutos = Math.floor(diffMs / 60000);
  if (minutos < 1) return 'agora';
  if (minutos < 60) return `há ${minutos} min`;
  const horas = Math.floor(minutos / 60);
  if (horas < 24) return `há ${horas}h`;
  return new Date(iso).toLocaleDateString('pt-BR', { day: '2-digit', month: 'short' });
}

export default function NotificationBell() {
  const router = useRouter();
  const [aberto, setAberto] = useState(false);
  const [notificacoes, setNotificacoes] = useState<Notificacao[]>([]);
  const [naoLidas, setNaoLidas] = useState(0);
  const containerRef = useRef<HTMLDivElement>(null);

  async function carregar() {
    try {
      const response = await api.get('/notificacoes');
      setNotificacoes(response.data.dados);
      setNaoLidas(response.data.nao_lidas);
    } catch {
      // Silencioso: o sino não deve travar a página se a API de notificações falhar.
    }
  }

  useEffect(() => {
    const token = localStorage.getItem('@ServicoFacil:token');
    if (!token) return;

    carregar();

    const socket: Socket = io(SOCKET_ORIGIN, { auth: { token } });
    socket.on('nova-notificacao', () => carregar());

    return () => {
      socket.disconnect();
    };
  }, []);

  useEffect(() => {
    function fechaAoClicarFora(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setAberto(false);
      }
    }
    document.addEventListener('mousedown', fechaAoClicarFora);
    return () => document.removeEventListener('mousedown', fechaAoClicarFora);
  }, []);

  async function abrirNotificacao(n: Notificacao) {
    if (!n.lida) {
      setNotificacoes((atual) => atual.map((x) => (x.id === n.id ? { ...x, lida: true } : x)));
      setNaoLidas((atual) => Math.max(0, atual - 1));
      api.patch(`/notificacoes/${n.id}/lida`).catch(() => {});
    }
    setAberto(false);
    if (n.link_redirecionamento) router.push(n.link_redirecionamento);
  }

  async function marcarTodasComoLidas() {
    setNotificacoes((atual) => atual.map((n) => ({ ...n, lida: true })));
    setNaoLidas(0);
    api.patch('/notificacoes/lidas').catch(() => {});
  }

  return (
    <div ref={containerRef} style={{ position: 'relative' }}>
      <button
        onClick={() => setAberto((v) => !v)}
        title="Notificações"
        style={{
          position: 'relative', background: 'transparent', border: 'none', color: '#94a3b8',
          cursor: 'pointer', display: 'flex', padding: '4px',
        }}
      >
        <Bell size={20} />
        {naoLidas > 0 && (
          <span style={{
            position: 'absolute', top: '-2px', right: '-2px', minWidth: '16px', height: '16px',
            borderRadius: '999px', background: '#ef4444', color: '#fff', fontSize: '0.65rem', fontWeight: 700,
            display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '0 3px',
          }}>
            {naoLidas > 9 ? '9+' : naoLidas}
          </span>
        )}
      </button>

      {aberto && (
        <div className="notif-dropdown" style={{
          position: 'absolute', top: 'calc(100% + 8px)', right: 0, width: '320px', maxHeight: '420px',
          overflowY: 'auto', background: '#0f172a', border: '1px solid #334155', borderRadius: '10px',
          boxShadow: '0 10px 30px rgba(0,0,0,0.4)', zIndex: 50,
        }}>
          <div style={{
            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
            padding: '0.75rem 1rem', borderBottom: '1px solid #1e293b',
          }}>
            <strong style={{ fontSize: '0.85rem' }}>Notificações</strong>
            {naoLidas > 0 && (
              <button
                onClick={marcarTodasComoLidas}
                style={{
                  display: 'inline-flex', alignItems: 'center', gap: '4px', background: 'transparent',
                  border: 'none', color: '#60a5fa', fontSize: '0.75rem', cursor: 'pointer',
                }}
              >
                <Check size={13} /> Marcar todas como lidas
              </button>
            )}
          </div>

          {notificacoes.length === 0 && (
            <div style={{ padding: '2rem 1rem', textAlign: 'center', color: 'var(--text-secondary)', fontSize: '0.85rem' }}>
              Nenhuma notificação ainda.
            </div>
          )}

          {notificacoes.map((n) => (
            <button
              key={n.id}
              onClick={() => abrirNotificacao(n)}
              style={{
                display: 'block', width: '100%', textAlign: 'left', padding: '0.75rem 1rem',
                background: n.lida ? 'transparent' : 'rgba(59,130,246,0.08)', border: 'none',
                borderBottom: '1px solid #1e293b', cursor: 'pointer',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '2px' }}>
                {!n.lida && <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#3b82f6', flexShrink: 0 }} />}
                <strong style={{ fontSize: '0.82rem', color: '#f1f5f9' }}>{n.titulo}</strong>
              </div>
              <p style={{ margin: '0 0 2px', fontSize: '0.78rem', color: '#94a3b8', lineHeight: 1.3 }}>{n.mensagem}</p>
              <span style={{ fontSize: '0.7rem', color: '#64748b' }}>{formatarRelativo(n.createdAt)}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
