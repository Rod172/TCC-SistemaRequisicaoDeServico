'use client';

/**
 * @file nova-solicitacao/page.tsx
 * @description Formulário de publicação de nova solicitação de serviço (US05), com upload de
 * anexos (fotos/documentos) por arrastar-e-soltar.
 *
 * BIBLIOTECAS UTILIZADAS:
 * 1. Lucide React (^0.383.0): Ícones para campos, upload e status.
 *    Doc Oficial: https://lucide.dev/
 * 2. Next.js (^14.2.3): Framework React com App Router.
 *    Doc Oficial: https://nextjs.org/docs
 * 3. Axios (^1.7.2): Requisições HTTP REST à API backend, incluindo upload multipart dos anexos.
 *    Doc Oficial: https://axios-http.com/docs/intro
 */

import React, { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  ArrowLeft, ClipboardList, Tag, MapPin, Clock, DollarSign,
  UploadCloud, X, FileText, Image as ImageIcon, AlertCircle, CheckCircle,
} from 'lucide-react';
import api from '@/services/api';

const CATEGORIAS = ['Elétrica', 'Encanamento', 'Pintura', 'Limpeza', 'Marcenaria', 'Jardinagem', 'T.I.', 'Outro'];
const MAX_ARQUIVOS = 5;
const MAX_TAMANHO_MB = 10;

const FORM_INICIAL = {
  titulo: '',
  categoria: '',
  descricao: '',
  cidade: '',
  bairro: '',
  prazo_desejado_dias: '',
  orcamento_cliente: '',
};

export default function NovaSolicitacaoPage() {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [formulario, setFormulario] = useState(FORM_INICIAL);
  const [arquivos, setArquivos] = useState<File[]>([]);
  const [arrastando, setArrastando] = useState(false);
  const [enviando, setEnviando] = useState(false);
  const [erro, setErro] = useState('');

  useEffect(() => {
    const token = localStorage.getItem('@ServicoFacil:token');
    if (!token) router.replace('/login');
  }, [router]);

  function alterarCampo(e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) {
    const { name, value } = e.target;
    setFormulario((atual) => ({ ...atual, [name]: value }));
  }

  function adicionarArquivos(novos: FileList | File[]) {
    setErro('');
    const listaAtual = [...arquivos];

    for (const arquivo of Array.from(novos)) {
      if (listaAtual.length >= MAX_ARQUIVOS) {
        setErro(`Você pode anexar no máximo ${MAX_ARQUIVOS} arquivos.`);
        break;
      }
      if (arquivo.size > MAX_TAMANHO_MB * 1024 * 1024) {
        setErro(`O arquivo "${arquivo.name}" excede o limite de ${MAX_TAMANHO_MB}MB.`);
        continue;
      }
      const tiposValidos = ['image/jpeg', 'image/png', 'image/webp', 'application/pdf'];
      if (!tiposValidos.includes(arquivo.type)) {
        setErro(`O arquivo "${arquivo.name}" precisa ser imagem (JPEG/PNG/WEBP) ou PDF.`);
        continue;
      }
      listaAtual.push(arquivo);
    }

    setArquivos(listaAtual.slice(0, MAX_ARQUIVOS));
  }

  function removerArquivo(indice: number) {
    setArquivos((atual) => atual.filter((_, i) => i !== indice));
  }

  function handleDrop(e: React.DragEvent) {
    e.preventDefault();
    setArrastando(false);
    if (e.dataTransfer.files?.length) adicionarArquivos(e.dataTransfer.files);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setErro('');
    setEnviando(true);

    try {
      const dados = new FormData();
      dados.append('titulo', formulario.titulo.trim());
      dados.append('descricao', formulario.descricao.trim());
      if (formulario.categoria) dados.append('categoria', formulario.categoria);
      if (formulario.cidade) dados.append('cidade', formulario.cidade.trim());
      if (formulario.bairro) dados.append('bairro', formulario.bairro.trim());
      if (formulario.prazo_desejado_dias) dados.append('prazo_desejado_dias', formulario.prazo_desejado_dias);
      if (formulario.orcamento_cliente) dados.append('orcamento_cliente', formulario.orcamento_cliente);
      arquivos.forEach((arquivo) => dados.append('anexos', arquivo));

      const response = await api.post('/solicitacoes', dados, { headers: { 'Content-Type': undefined } });
      const novaSolicitacaoId = response.data.data.id;
      router.push(`/minhas-solicitacoes/${novaSolicitacaoId}`);
    } catch (err: any) {
      setErro(err.response?.data?.message || 'Não foi possível publicar sua solicitação.');
      setEnviando(false);
    }
  }

  return (
    <main style={{ maxWidth: '760px', margin: '2rem auto', padding: '0 1.5rem 4rem' }}>
      <Link href="/minhas-solicitacoes" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1.5rem', color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
        <ArrowLeft size={16} /> Voltar para minhas solicitações
      </Link>

      <header style={{ marginBottom: '1.5rem' }}>
        <div style={{
          display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
          width: '48px', height: '48px', borderRadius: '50%',
          background: 'rgba(59,130,246,0.15)', color: '#60a5fa', marginBottom: '1rem',
        }}>
          <ClipboardList size={24} />
        </div>
        <h1 style={{ fontSize: '1.6rem', fontWeight: 700, marginBottom: '0.4rem' }}>Publicar Nova Solicitação</h1>
        <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
          Descreva o serviço que você precisa para que prestadores possam enviar propostas.
        </p>
      </header>

      {erro && (
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', background: 'rgba(239, 68, 68, 0.15)', border: '1px solid var(--danger-color)', color: '#fca5a5', padding: '1rem', borderRadius: '8px', marginBottom: '1.5rem', fontSize: '0.9rem' }}>
          <AlertCircle size={20} /> <span>{erro}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} style={{
        background: 'var(--card-bg)', border: '1px solid var(--card-border)',
        borderRadius: 'var(--border-radius)', padding: '2rem',
        display: 'flex', flexDirection: 'column', gap: '1.25rem',
      }}>
        <Campo label="Título *" icon={<ClipboardList size={18} />}>
          <input name="titulo" required minLength={5} value={formulario.titulo} onChange={alterarCampo} placeholder="Ex.: Instalação de 3 tomadas na cozinha" style={estiloInput} />
        </Campo>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
          <Campo label="Categoria" icon={<Tag size={18} />}>
            <select name="categoria" value={formulario.categoria} onChange={alterarCampo} style={estiloInput}>
              <option value="">Selecione...</option>
              {CATEGORIAS.map((c) => <option key={c} value={c}>{c}</option>)}
            </select>
          </Campo>
          <Campo label="Prazo desejado (dias)" icon={<Clock size={18} />}>
            <input name="prazo_desejado_dias" type="number" min={1} max={365} value={formulario.prazo_desejado_dias} onChange={alterarCampo} placeholder="Ex.: 7" style={estiloInput} />
          </Campo>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
          <Campo label="Cidade" icon={<MapPin size={18} />}>
            <input name="cidade" value={formulario.cidade} onChange={alterarCampo} placeholder="Ex.: São Paulo" style={estiloInput} />
          </Campo>
          <Campo label="Bairro" icon={<MapPin size={18} />}>
            <input name="bairro" value={formulario.bairro} onChange={alterarCampo} placeholder="Ex.: Pinheiros" style={estiloInput} />
          </Campo>
        </div>

        <Campo label="Orçamento de referência (R$)" icon={<DollarSign size={18} />}>
          <input name="orcamento_cliente" type="number" min={0} step="0.01" value={formulario.orcamento_cliente} onChange={alterarCampo} placeholder="Opcional — ajuda o prestador a dimensionar a proposta" style={estiloInput} />
        </Campo>

        <div>
          <label style={{ display: 'block', fontSize: '0.875rem', marginBottom: '0.4rem', color: 'var(--text-secondary)' }}>
            Descrição detalhada *
          </label>
          <textarea
            name="descricao" required minLength={20} rows={5}
            value={formulario.descricao} onChange={alterarCampo}
            placeholder="Descreva o problema ou necessidade com o máximo de detalhes possível."
            style={{ ...estiloInput, paddingLeft: '0.75rem', resize: 'vertical' }}
          />
        </div>

        {/* ── Upload de anexos ─────────────────── */}
        <div>
          <label style={{ display: 'block', fontSize: '0.875rem', marginBottom: '0.4rem', color: 'var(--text-secondary)' }}>
            Fotos ou documentos (opcional, até {MAX_ARQUIVOS} arquivos de {MAX_TAMANHO_MB}MB cada)
          </label>
          <div
            onDragOver={(e) => { e.preventDefault(); setArrastando(true); }}
            onDragLeave={() => setArrastando(false)}
            onDrop={handleDrop}
            onClick={() => fileInputRef.current?.click()}
            style={{
              border: `2px dashed ${arrastando ? '#3b82f6' : '#334155'}`,
              borderRadius: '10px', padding: '2rem', textAlign: 'center',
              background: arrastando ? 'rgba(59,130,246,0.08)' : '#0f172a',
              cursor: 'pointer', transition: 'border-color 0.2s, background 0.2s',
            }}
          >
            <UploadCloud size={28} color="#60a5fa" style={{ marginBottom: '0.5rem' }} />
            <p style={{ color: '#cbd5e1', fontSize: '0.9rem', margin: 0 }}>
              Arraste arquivos aqui ou clique para selecionar
            </p>
            <p style={{ color: '#64748b', fontSize: '0.78rem', margin: '0.25rem 0 0' }}>JPEG, PNG, WEBP ou PDF</p>
            <input
              ref={fileInputRef} type="file" multiple hidden
              accept="image/jpeg,image/png,image/webp,application/pdf"
              onChange={(e) => e.target.files && adicionarArquivos(e.target.files)}
            />
          </div>

          {arquivos.length > 0 && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', marginTop: '0.9rem' }}>
              {arquivos.map((arquivo, indice) => (
                <div key={`${arquivo.name}-${indice}`} style={{
                  display: 'flex', alignItems: 'center', gap: '0.6rem',
                  background: '#0f172a', border: '1px solid #334155', borderRadius: '8px', padding: '0.6rem 0.9rem',
                }}>
                  {arquivo.type === 'application/pdf' ? <FileText size={16} color="#94a3b8" /> : <ImageIcon size={16} color="#94a3b8" />}
                  <span style={{ flex: 1, fontSize: '0.85rem', color: '#cbd5e1', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {arquivo.name}
                  </span>
                  <span style={{ fontSize: '0.78rem', color: '#64748b' }}>{(arquivo.size / 1024 / 1024).toFixed(1)}MB</span>
                  <button type="button" onClick={() => removerArquivo(indice)} style={{ background: 'transparent', border: 'none', color: '#f87171', cursor: 'pointer', display: 'flex' }}>
                    <X size={16} />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        <button type="submit" disabled={enviando} style={{
          display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem',
          padding: '0.9rem', background: enviando ? '#475569' : '#3b82f6', color: '#fff',
          border: 'none', borderRadius: '8px', fontWeight: 600, fontSize: '0.95rem',
          cursor: enviando ? 'not-allowed' : 'pointer', marginTop: '0.5rem',
        }}>
          <CheckCircle size={18} /> {enviando ? 'Publicando...' : 'Publicar solicitação'}
        </button>
      </form>
    </main>
  );
}

function Campo({ label, icon, children }: { label: string; icon: React.ReactNode; children: React.ReactNode }) {
  return (
    <div>
      <label style={{ display: 'block', fontSize: '0.875rem', marginBottom: '0.4rem', color: 'var(--text-secondary)' }}>
        {label}
      </label>
      <div style={{ position: 'relative' }}>
        <span style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#64748b', display: 'flex' }}>
          {icon}
        </span>
        {children}
      </div>
    </div>
  );
}

const estiloInput: React.CSSProperties = {
  width: '100%',
  padding: '0.75rem 0.75rem 0.75rem 2.5rem',
  background: '#0f172a',
  border: '1px solid #334155',
  borderRadius: '8px',
  color: '#fff',
  fontSize: '0.95rem',
};
