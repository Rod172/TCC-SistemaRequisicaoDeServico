'use client';

/**
 * @file nova-solicitacao/page.tsx
 * @description Formulário de publicação de nova solicitação de serviço (US05), com upload de
 * anexos (fotos/documentos) por arrastar-e-soltar. Layout da US39: etapas no topo, formulário à
 * esquerda e, ao lado, a prévia de como os prestadores verão o pedido e dicas para receber boas
 * propostas.
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
import { ArrowLeft, ArrowRight, CheckCircle, FileText, Image as ImageIcon, MapPin, UploadCloud, X } from 'lucide-react';
import api from '@/services/api';
import { lerRascunhoPedido, limparRascunhoPedido } from '@/components/home/comum';
import Pagina, { CabecalhoPagina } from '@/components/ui/Pagina';
import { Aviso, Chip, Etapas, STATUS_SOLICITACAO } from '@/components/ui/Elementos';

const CATEGORIAS = ['Elétrica', 'Encanamento', 'Pintura', 'Limpeza', 'Marcenaria', 'Jardinagem', 'T.I.', 'Outro'];
const MAX_ARQUIVOS = 5;
const MAX_TAMANHO_MB = 10;
const ETAPAS = [{ nome: 'Descreva o serviço' }, { nome: 'Fotos e documentos' }, { nome: 'Revise e publique' }];

const FORM_INICIAL = {
  titulo: '',
  categoria: '',
  descricao: '',
  cidade: '',
  bairro: '',
  prazo_desejado_dias: '',
  orcamento_cliente: '',
};

function formatarReais(valor: string) {
  return Number(valor).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
}

export default function NovaSolicitacaoPage() {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [formulario, setFormulario] = useState(FORM_INICIAL);
  const [arquivos, setArquivos] = useState<File[]>([]);
  const [arrastando, setArrastando] = useState(false);
  const [enviando, setEnviando] = useState(false);
  const [erro, setErro] = useState('');
  const [etapa, setEtapa] = useState(1);

  useEffect(() => {
    const token = localStorage.getItem('@ServicoFacil:token');
    if (!token) router.replace('/login');
  }, [router]);

  // US38: pedido começado na página inicial — título e categoria chegam pela URL ou, se o visitante
  // precisou entrar na conta antes, pelo rascunho guardado. O rascunho é consumido aqui.
  useEffect(() => {
    if (!localStorage.getItem('@ServicoFacil:token')) return;
    const params = new URLSearchParams(window.location.search);
    const rascunho = lerRascunhoPedido();
    const titulo = params.get('titulo') || rascunho?.titulo || '';
    const categoria = params.get('categoria') || rascunho?.categoria || '';
    limparRascunhoPedido();
    if (!titulo && !categoria) return;
    setFormulario((atual) => ({
      ...atual,
      titulo: atual.titulo || titulo.slice(0, 120),
      categoria: CATEGORIAS.includes(categoria) ? categoria : atual.categoria,
    }));
  }, []);

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
    if (enviando) return;
    if (etapa < 3) {
      setEtapa(etapa + 1);
      return;
    }
    if (formulario.titulo.trim().length < 5 || formulario.descricao.trim().length < 20) {
      setErro('Revise o título e a descrição antes de publicar.');
      setEtapa(1);
      return;
    }
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

  const tamanhoDescricao = formulario.descricao.trim().length;
  const local = [formulario.bairro, formulario.cidade].map((v) => v.trim()).filter(Boolean).join(', ');

  return (
    <Pagina>
      <CabecalhoPagina
        voltar={{ href: '/minhas-solicitacoes', rotulo: 'Minhas solicitações' }}
        titulo="Publicar um pedido"
        subtitulo="Prestadores da região veem seu pedido e mandam propostas. Você escolhe com calma."
      />
      <Etapas etapas={ETAPAS} atual={etapa - 1} rotulo="Etapas da publicação" />
      <p className="sr-only" aria-live="polite">Etapa {etapa} de 3: {ETAPAS[etapa - 1].nome}</p>

      <div className="layout-lateral">
        <form onSubmit={handleSubmit} className="principal card grande" style={{ gap: '1.25rem' }}>
          {erro && <Aviso tipo="erro">{erro}</Aviso>}

          <fieldset hidden={etapa !== 1} disabled={etapa !== 1 || enviando} className="secao-form">
            <div className="campo-grupo">
              <label htmlFor="solicitacao-titulo" className="rotulo">O que você precisa?</label>
              <input id="solicitacao-titulo" name="titulo" required minLength={5} value={formulario.titulo} onChange={alterarCampo} placeholder="Ex.: Instalação de 3 tomadas na cozinha" className="campo" style={{ fontWeight: 600 }} aria-describedby="solicitacao-titulo-ajuda" />
              <span id="solicitacao-titulo-ajuda" className="ajuda">Um título curto e direto, com pelo menos 5 caracteres.</span>
            </div>
            <div className="grade-campos">
              <div className="campo-grupo">
                <label htmlFor="solicitacao-categoria" className="rotulo">Categoria</label>
                <select id="solicitacao-categoria" name="categoria" value={formulario.categoria} onChange={alterarCampo} className="campo">
                  <option value="">Selecione...</option>
                  {CATEGORIAS.map((c) => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>
              <div className="campo-grupo">
                <label htmlFor="solicitacao-prazo" className="rotulo">Para quando? <span className="opcional">(dias, opcional)</span></label>
                <input id="solicitacao-prazo" name="prazo_desejado_dias" type="number" min={1} max={365} value={formulario.prazo_desejado_dias} onChange={alterarCampo} placeholder="Ex.: 7" className="campo" />
              </div>
            </div>

            <div className="campo-grupo">
              <div style={{ display: 'flex', justifyContent: 'space-between', gap: '0.75rem', flexWrap: 'wrap' }}>
                <label htmlFor="descricao-solicitacao" className="rotulo">Descreva o serviço</label>
                <span className="ajuda" style={{ color: tamanhoDescricao >= 20 ? 'var(--success-strong)' : undefined }} aria-live="polite">
                  {tamanhoDescricao >= 20 ? `${tamanhoDescricao} caracteres · ok` : `${tamanhoDescricao} de 20 caracteres mínimos`}
                </span>
              </div>
              <textarea
                id="descricao-solicitacao" name="descricao" required minLength={20} rows={5} className="campo"
                value={formulario.descricao} onChange={alterarCampo} aria-describedby="descricao-ajuda"
                placeholder="Ex.: A pia da cozinha está entupindo há 3 dias, mesmo depois de usar desentupidor. É um apartamento, o ralo fica embaixo da pia. Preciso resolver ainda essa semana."
              />
              <span id="descricao-ajuda" className="ajuda">
                Quanto mais completo, menos idas e vindas: conte <strong>o que precisa ser feito</strong>, <strong>desde quando</strong> é um problema e <strong>detalhes que ajudem a orçar</strong> (tamanho, quantidade, marca/modelo, se já tentou algo).
              </span>
            </div>

            <div className="grade-campos">
              <div className="campo-grupo">
                <label htmlFor="solicitacao-cidade" className="rotulo">Cidade</label>
                <input id="solicitacao-cidade" name="cidade" value={formulario.cidade} onChange={alterarCampo} placeholder="Ex.: São Paulo" className="campo" />
              </div>
              <div className="campo-grupo">
                <label htmlFor="solicitacao-bairro" className="rotulo">Bairro</label>
                <input id="solicitacao-bairro" name="bairro" value={formulario.bairro} onChange={alterarCampo} placeholder="Ex.: Pinheiros" className="campo" />
              </div>
              <div className="campo-grupo">
                <label htmlFor="solicitacao-orcamento" className="rotulo">Quanto pretende pagar? <span className="opcional">(opcional)</span></label>
                <div className="campo-com-prefixo">
                  <span aria-hidden="true">R$</span>
                  <input id="solicitacao-orcamento" name="orcamento_cliente" type="number" min={0} step="0.01" value={formulario.orcamento_cliente} onChange={alterarCampo} placeholder="0,00" className="campo" />
                </div>
              </div>
            </div>
            <p className="ajuda" style={{ display: 'flex', gap: '0.4rem', alignItems: 'center' }}>
              <MapPin size={14} aria-hidden="true" /> Só a cidade e o bairro aparecem no pedido. O endereço completo você combina no chat com quem contratar.
            </p>
          </fieldset>

          {/* ── Upload de anexos ─────────────────── */}
          <div hidden={etapa !== 2} className="empilhado">
            <div>
              <h2 className="titulo-secao" style={{ marginBottom: '0.25rem' }}>Fotos e documentos <span className="opcional" style={{ fontSize: '0.9rem', fontWeight: 400, color: 'var(--text-secondary)' }}>(opcional)</span></h2>
              <p className="texto-apoio">Até {MAX_ARQUIVOS} arquivos de {MAX_TAMANHO_MB}MB cada. Fotos do local ajudam o prestador a orçar sem visita.</p>
            </div>
            <div
              role="button" tabIndex={0} aria-label="Selecionar fotos ou documentos"
              onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); fileInputRef.current?.click(); } }}
              onDragOver={(e) => { e.preventDefault(); setArrastando(true); }}
              onDragLeave={() => setArrastando(false)}
              onDrop={handleDrop}
              onClick={() => fileInputRef.current?.click()}
              style={{
                border: `2px dashed ${arrastando ? 'var(--accent-indigo)' : 'var(--card-border)'}`,
                borderRadius: '14px', padding: '2.25rem 1rem', textAlign: 'center',
                background: arrastando ? 'var(--primary-tint-soft)' : 'var(--bg-color)',
                cursor: 'pointer', transition: 'border-color 0.2s, background 0.2s',
              }}
            >
              <UploadCloud size={30} color="var(--link-color)" style={{ marginBottom: '0.5rem' }} aria-hidden="true" />
              <p style={{ color: 'var(--text-body)', fontSize: '0.95rem', fontWeight: 600 }}>Arraste arquivos aqui ou clique para selecionar</p>
              <p style={{ color: 'var(--text-muted)', fontSize: '0.8rem', marginTop: '0.25rem' }}>JPEG, PNG, WEBP ou PDF</p>
              <input
                ref={fileInputRef} type="file" multiple hidden
                accept="image/jpeg,image/png,image/webp,application/pdf"
                onChange={(e) => e.target.files && adicionarArquivos(e.target.files)}
              />
            </div>

            {arquivos.length > 0 && (
              <ul className="lista-simples" style={{ gap: '0.5rem' }}>
                {arquivos.map((arquivo, indice) => (
                  <li key={`${arquivo.name}-${indice}`} style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', background: 'var(--bg-color)', border: '1px solid var(--card-border)', borderRadius: '10px', padding: '0.4rem 0.5rem 0.4rem 0.9rem' }}>
                    {arquivo.type === 'application/pdf' ? <FileText size={16} color="var(--danger-strong)" aria-hidden="true" /> : <ImageIcon size={16} color="var(--text-secondary)" aria-hidden="true" />}
                    <span style={{ flex: 1, fontSize: '0.875rem', color: 'var(--text-body)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{arquivo.name}</span>
                    <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>{(arquivo.size / 1024 / 1024).toFixed(1)}MB</span>
                    <button type="button" aria-label={`Remover ${arquivo.name}`} onClick={() => removerArquivo(indice)} className="btn btn-texto perigo" style={{ minWidth: '44px', padding: 0 }}>
                      <X size={16} aria-hidden="true" />
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </div>

          {etapa === 3 && (
            <section aria-label="Revisão da solicitação" className="empilhado" style={{ overflowWrap: 'anywhere' }}>
              <h2 className="titulo-secao">Confira antes de publicar</h2>
              <dl className="dados">
                {[
                  ['Título', formulario.titulo], ['Categoria', formulario.categoria || 'Não informada'],
                  ['Local', [formulario.cidade, formulario.bairro].filter(Boolean).join(' — ') || 'Não informado'],
                  ['Prazo desejado', formulario.prazo_desejado_dias ? `${formulario.prazo_desejado_dias} dias` : 'A combinar'],
                  ['Orçamento', formulario.orcamento_cliente ? formatarReais(formulario.orcamento_cliente) : 'A combinar'],
                  ['Anexos', arquivos.map(a => a.name).join(', ') || 'Nenhum arquivo'],
                ].map(([nome, valor]) => <div key={nome}><dt>{nome}</dt><dd>{valor}</dd></div>)}
              </dl>
              <div className="dados" style={{ gridTemplateColumns: '1fr' }}>
                <div><dt>Descrição</dt><dd style={{ whiteSpace: 'pre-wrap', fontWeight: 400, lineHeight: 1.55 }}>{formulario.descricao}</dd></div>
              </div>
            </section>
          )}

          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '0.75rem', flexWrap: 'wrap', paddingTop: '0.75rem', borderTop: '1px solid var(--card-border)' }}>
            {etapa > 1
              ? <button type="button" disabled={enviando} onClick={() => { setErro(''); setEtapa(etapa - 1); }} className="btn btn-secundario"><ArrowLeft size={16} aria-hidden="true" /> Voltar à etapa anterior</button>
              : <Link href="/minhas-solicitacoes" className="btn btn-texto discreto">Cancelar</Link>}
            <button type="submit" disabled={enviando} className="btn btn-primario btn-grande">
              {etapa === 3 ? <CheckCircle size={18} aria-hidden="true" /> : null}
              {enviando ? 'Publicando...' : etapa === 3 ? 'Publicar solicitação' : etapa === 1 ? 'Continuar para fotos' : 'Revisar pedido'}
              {etapa < 3 ? <ArrowRight size={16} aria-hidden="true" /> : null}
            </button>
          </div>
        </form>

        <aside className="lateral">
          <span className="rotulo-area" style={{ color: 'var(--text-secondary)' }}>Prévia — como os prestadores verão</span>
          <div className="card empilhado" style={{ gap: '0.6rem' }}>
            <div className="chips">
              <Chip cor={STATUS_SOLICITACAO.ABERTA} />
              {formulario.categoria && <span className="chip categoria">{formulario.categoria}</span>}
            </div>
            <strong style={{ fontSize: '1rem', lineHeight: 1.35, overflowWrap: 'anywhere', color: formulario.titulo.trim() ? undefined : 'var(--text-muted)' }}>
              {formulario.titulo.trim() || 'O título do seu pedido aparece aqui'}
            </strong>
            <span className="texto-apoio" style={{ display: 'flex', gap: '0.35rem', alignItems: 'center', fontSize: '0.82rem' }}>
              <MapPin size={14} aria-hidden="true" /> {local || 'Local não informado'}
            </span>
            <span style={{ display: 'flex', justifyContent: 'space-between', gap: '0.5rem', paddingTop: '0.6rem', borderTop: '1px solid var(--card-border)', fontSize: '0.82rem', color: 'var(--text-secondary)' }}>
              Orçamento do cliente <strong style={{ color: 'var(--text-primary)' }}>{formulario.orcamento_cliente ? formatarReais(formulario.orcamento_cliente) : 'A combinar'}</strong>
            </span>
          </div>
          <section className="card destaque empilhado" style={{ gap: '0.6rem' }}>
            <h2 className="titulo-cartao" style={{ fontSize: '0.95rem' }}>Dicas para receber boas propostas</h2>
            <ul style={{ paddingLeft: '1.1rem', display: 'flex', flexDirection: 'column', gap: '0.5rem', fontSize: '0.85rem', lineHeight: 1.5, color: 'var(--text-body)' }}>
              <li>Fotos do local ajudam o prestador a orçar sem visita.</li>
              <li>Informar um valor de referência evita propostas fora da sua realidade.</li>
              <li>Você pode responder perguntas dos prestadores depois de publicar.</li>
            </ul>
          </section>
        </aside>
      </div>
    </Pagina>
  );
}
