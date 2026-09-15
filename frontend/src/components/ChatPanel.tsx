'use client';

/**
 * @file ChatPanel.tsx
 * @description Núcleo do chat privado em tempo real (US14), com anexo opcional de imagem/PDF (US15) —
 * histórico via REST, mensagens/leitura via WebSocket. Escopado por **proposta** desde a US34 (liberado
 * assim que a proposta é enviada, não só após o aceite — cada prestador concorrente tem sua própria
 * sala, mesmo antes de qualquer decisão). Componente reutilizável: usado tanto na página dedicada
 * `/chat/[id]` (destino do link de notificação, US16) quanto no `ChatDrawer` (painel lateral).
 * Preenche 100% da altura do contêiner em que for colocado.
 *
 * BIBLIOTECAS UTILIZADAS:
 * 1. Socket.io Client (^4.8.3): Conexão WebSocket em tempo real com o backend.
 *    Doc Oficial: https://socket.io/docs/v4/client-api/
 * 2. Lucide React (^0.383.0): Ícones de envio, status e anexo.
 *    Doc Oficial: https://lucide.dev/
 * 3. Axios (^1.7.2): Requisições HTTP REST à API backend.
 *    Doc Oficial: https://axios-http.com/docs/intro
 */

import React, { useCallback, useEffect, useRef, useState } from 'react';
import { io, Socket } from 'socket.io-client';
import { Send, AlertCircle, Check, CheckCheck, User, Paperclip, X, FileText } from 'lucide-react';
import api from '@/services/api';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api/v1';
const SOCKET_ORIGIN = API_BASE_URL.replace(/\/api\/v1\/?$/, '');
const BACKEND_ORIGIN = SOCKET_ORIGIN;

const EXTENSOES_IMAGEM = ['.jpg', '.jpeg', '.png', '.webp'];
function ehImagem(url: string) {
  return EXTENSOES_IMAGEM.some((ext) => url.toLowerCase().endsWith(ext));
}

interface Emissor {
  id: string;
  nome: string;
  foto_url?: string | null;
}

interface Mensagem {
  id: string;
  conteudo?: string | null;
  anexo_url?: string | null;
  anexo_nome_original?: string | null;
  lida: boolean;
  createdAt: string;
  emissor: Emissor;
}

function formatarHora(iso: string) {
  return new Date(iso).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
}

export default function ChatPanel({ propostaId }: { propostaId: string }) {
  const [meuId, setMeuId] = useState('');
  const [mensagens, setMensagens] = useState<Mensagem[]>([]);
  const [texto, setTexto] = useState('');
  const [carregando, setCarregando] = useState(true);
  const [enviando, setEnviando] = useState(false);
  const [erro, setErro] = useState('');
  const [conectado, setConectado] = useState(false);
  const [arquivo, setArquivo] = useState<File | null>(null);
  const [imagemAmpliada, setImagemAmpliada] = useState<string | null>(null);

  const socketRef = useRef<Socket | null>(null);
  const fimDaListaRef = useRef<HTMLDivElement>(null);
  const inputArquivoRef = useRef<HTMLInputElement>(null);

  const rolarParaFinal = useCallback(() => {
    fimDaListaRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, []);

  useEffect(() => {
    const token = localStorage.getItem('@ServicoFacil:token');
    const userRaw = localStorage.getItem('@ServicoFacil:user');
    if (!token || !userRaw) {
      setErro('Você precisa estar logado para acessar o chat.');
      setCarregando(false);
      return;
    }
    setMeuId(JSON.parse(userRaw).id);

    api
      .get(`/propostas/${propostaId}/mensagens`)
      .then((response) => {
        setMensagens(response.data.data);
        return api.patch(`/propostas/${propostaId}/mensagens/lidas`);
      })
      .catch((err) => {
        setErro(err.response?.data?.message || 'Não foi possível carregar o chat.');
      })
      .finally(() => setCarregando(false));

    const socket = io(SOCKET_ORIGIN, { auth: { token } });
    socketRef.current = socket;

    socket.on('connect', () => {
      setConectado(true);
      socket.emit('entrar-sala', propostaId);
    });
    socket.on('disconnect', () => setConectado(false));
    socket.on('erro', (dados: { mensagem: string }) => setErro(dados.mensagem));

    socket.on('nova-mensagem', (mensagem: Mensagem) => {
      setMensagens((atual) => [...atual, mensagem]);
      if (mensagem.emissor.id !== JSON.parse(userRaw).id) {
        api.patch(`/propostas/${propostaId}/mensagens/lidas`).catch(() => {});
      }
    });

    socket.on('mensagens-lidas', (dados: { lidoPor: string }) => {
      const meuIdAtual = JSON.parse(userRaw).id;
      if (dados.lidoPor === meuIdAtual) return;
      setMensagens((atual) => atual.map((m) => (m.emissor.id === meuIdAtual ? { ...m, lida: true } : m)));
    });

    return () => {
      socket.emit('sair-sala', propostaId);
      socket.disconnect();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [propostaId]);

  useEffect(() => {
    rolarParaFinal();
  }, [mensagens, rolarParaFinal]);

  function selecionarArquivo(e: React.ChangeEvent<HTMLInputElement>) {
    const selecionado = e.target.files?.[0];
    if (selecionado) setArquivo(selecionado);
    e.target.value = '';
  }

  async function enviarMensagem(e: React.FormEvent) {
    e.preventDefault();
    const conteudo = texto.trim();
    if (!conteudo && !arquivo) return;

    setEnviando(true);
    setErro('');
    try {
      const dados = new FormData();
      if (conteudo) dados.append('conteudo', conteudo);
      if (arquivo) dados.append('anexo', arquivo);
      // Content-Type undefined: deixa o navegador definir multipart/form-data com o boundary certo,
      // sobrescrevendo o padrão application/json da instância do axios.
      await api.post(`/propostas/${propostaId}/mensagens`, dados, { headers: { 'Content-Type': undefined } });
      setTexto('');
      setArquivo(null);
    } catch (err: any) {
      setErro(err.response?.data?.message || 'Não foi possível enviar a mensagem.');
    } finally {
      setEnviando(false);
    }
  }

  if (carregando) {
    return <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', color: 'var(--text-secondary)' }}>Carregando chat...</div>;
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', marginBottom: '0.75rem' }}>
        <span style={{
          display: 'inline-flex', alignItems: 'center', gap: '5px', fontSize: '0.78rem',
          color: conectado ? '#34d399' : '#f87171',
        }}>
          <span style={{ width: '7px', height: '7px', borderRadius: '50%', background: conectado ? '#34d399' : '#f87171' }} />
          {conectado ? 'Conectado' : 'Conectando...'}
        </span>
      </div>

      {erro && (
        <div style={{
          display: 'flex', alignItems: 'center', gap: '0.6rem',
          background: 'rgba(239, 68, 68, 0.15)', border: '1px solid var(--danger-color)',
          color: '#fca5a5', padding: '0.85rem', borderRadius: '8px', marginBottom: '1rem', fontSize: '0.85rem',
        }}>
          <AlertCircle size={18} /> <span>{erro}</span>
        </div>
      )}

      <div style={{
        flex: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '0.6rem',
        background: 'var(--card-bg)', border: '1px solid var(--card-border)', borderRadius: 'var(--border-radius)',
        padding: '1.1rem', marginBottom: '1rem', minHeight: 0,
      }}>
        {mensagens.length === 0 && (
          <div style={{ margin: 'auto', textAlign: 'center', color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
            Nenhuma mensagem ainda. Comece a conversa!
          </div>
        )}

        {mensagens.map((m) => {
          const minha = m.emissor.id === meuId;
          return (
            <div key={m.id} style={{ display: 'flex', justifyContent: minha ? 'flex-end' : 'flex-start' }}>
              <div style={{ maxWidth: '85%', display: 'flex', flexDirection: 'column', alignItems: minha ? 'flex-end' : 'flex-start' }}>
                {!minha && (
                  <span style={{ display: 'flex', alignItems: 'center', gap: '4px', color: '#64748b', fontSize: '0.72rem', marginBottom: '2px' }}>
                    <User size={11} /> {m.emissor.nome}
                  </span>
                )}
                <div style={{
                  padding: m.anexo_url && ehImagem(m.anexo_url) ? '4px' : '0.6rem 0.85rem',
                  borderRadius: minha ? '14px 14px 2px 14px' : '14px 14px 14px 2px',
                  background: minha ? '#3b82f6' : '#1e293b', color: '#fff', fontSize: '0.88rem', lineHeight: 1.4,
                  wordBreak: 'break-word',
                }}>
                  {m.anexo_url && ehImagem(m.anexo_url) && (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={`${BACKEND_ORIGIN}${m.anexo_url}`}
                      alt={m.anexo_nome_original || 'Anexo'}
                      onClick={() => setImagemAmpliada(`${BACKEND_ORIGIN}${m.anexo_url}`)}
                      style={{ display: 'block', maxWidth: '200px', maxHeight: '200px', borderRadius: '10px', cursor: 'zoom-in' }}
                    />
                  )}
                  {m.anexo_url && !ehImagem(m.anexo_url) && (
                    <a
                      href={`${BACKEND_ORIGIN}${m.anexo_url}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: '#fff', textDecoration: 'none' }}
                    >
                      <FileText size={16} />
                      <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: '140px' }}>
                        {m.anexo_nome_original}
                      </span>
                    </a>
                  )}
                  {m.conteudo && (
                    <span style={{ display: 'block', padding: m.anexo_url && ehImagem(m.anexo_url) ? '0.4rem 0.3rem 0.1rem' : 0 }}>
                      {m.conteudo}
                    </span>
                  )}
                </div>
                <span style={{ display: 'flex', alignItems: 'center', gap: '3px', color: '#64748b', fontSize: '0.7rem', marginTop: '2px' }}>
                  {formatarHora(m.createdAt)}
                  {minha && (m.lida ? <CheckCheck size={12} color="#60a5fa" /> : <Check size={12} />)}
                </span>
              </div>
            </div>
          );
        })}
        <div ref={fimDaListaRef} />
      </div>

      {arquivo && (
        <div style={{
          display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '0.5rem',
          background: '#0f172a', border: '1px solid #334155', borderRadius: '8px',
          padding: '0.5rem 0.75rem', marginBottom: '0.6rem', fontSize: '0.82rem', color: '#cbd5e1',
        }}>
          <span style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', overflow: 'hidden' }}>
            <Paperclip size={14} />
            <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{arquivo.name}</span>
          </span>
          <button type="button" onClick={() => setArquivo(null)} style={{ background: 'transparent', border: 'none', color: '#94a3b8', cursor: 'pointer', display: 'flex' }}>
            <X size={16} />
          </button>
        </div>
      )}

      <form onSubmit={enviarMensagem} style={{ display: 'flex', gap: '0.5rem' }}>
        <input ref={inputArquivoRef} type="file" accept="image/jpeg,image/png,image/webp,application/pdf" onChange={selecionarArquivo} hidden />
        <button
          type="button"
          onClick={() => inputArquivoRef.current?.click()}
          title="Anexar imagem ou PDF"
          style={{
            display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
            width: '44px', height: '44px', borderRadius: '10px', border: '1px solid #334155',
            background: 'transparent', color: '#94a3b8', cursor: 'pointer', flexShrink: 0,
          }}
        >
          <Paperclip size={17} />
        </button>
        <input
          value={texto}
          onChange={(e) => setTexto(e.target.value)}
          placeholder="Escreva uma mensagem..."
          maxLength={2000}
          style={{
            flex: 1, minWidth: 0, padding: '0.7rem 0.9rem', background: '#0f172a', border: '1px solid #334155',
            borderRadius: '10px', color: '#fff', fontSize: '0.88rem',
          }}
        />
        <button
          type="submit"
          disabled={enviando || (!texto.trim() && !arquivo)}
          style={{
            display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
            width: '44px', height: '44px', borderRadius: '10px', border: 'none',
            background: (!texto.trim() && !arquivo) ? '#475569' : '#3b82f6', color: '#fff',
            cursor: (!texto.trim() && !arquivo) ? 'not-allowed' : 'pointer', flexShrink: 0,
          }}
        >
          <Send size={17} />
        </button>
      </form>

      {/* ── Modal de ampliação da imagem ─────────────── */}
      {imagemAmpliada && (
        <div
          onClick={() => setImagemAmpliada(null)}
          style={{
            position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.85)', zIndex: 200,
            display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '2rem', cursor: 'zoom-out',
          }}
        >
          <button
            onClick={() => setImagemAmpliada(null)}
            style={{
              position: 'absolute', top: '1.25rem', right: '1.25rem', background: 'transparent',
              border: 'none', color: '#fff', cursor: 'pointer', display: 'flex',
            }}
          >
            <X size={28} />
          </button>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={imagemAmpliada} alt="Imagem ampliada" style={{ maxWidth: '100%', maxHeight: '100%', borderRadius: '8px' }} />
        </div>
      )}
    </div>
  );
}
