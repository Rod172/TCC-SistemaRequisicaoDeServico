'use client';
/** React 18: canal do titular e caixa administrativa (US40). https://react.dev/reference/react
 * Axios 1.7: cliente centralizado com JWT. https://axios-http.com/docs/intro
 * Next.js 14: links do App Router. https://nextjs.org/docs/14/app/api-reference/components/link */
import { useCallback, useEffect, useState } from 'react';
import Link from 'next/link';
import estilosLegais from './legal.module.css';
import api from '@/services/api';
import documentos from '@/conteudo/documentos-legais.json';
const TIPOS: Record<string,string> = { ACESSO: 'Acesso ou confirmação de tratamento', CORRECAO: 'Correção de dados', EXCLUSAO: 'Exclusão, bloqueio ou anonimização', INFORMACAO: 'Informações, compartilhamento ou portabilidade', REVOGACAO: 'Revogação de consentimento específico' };
interface Pedido { id: string; tipo: string; descricao: string; status: string; resposta: string | null; respondida_em: string | null; createdAt: string; titular?: { nome: string; email: string } }
interface Aceite { termos_uso_versao: string | null; privacidade_versao: string | null; documentos_aceitos_em: string | null }
const estiloCampo = { width: '100%', padding: '.75rem', margin: '.5rem 0 1rem', border: '1px solid var(--card-border)', background: 'var(--card-bg)', color: 'var(--text-primary)', borderRadius: 8 };
const estiloBotao = { minHeight: 44, padding: '.65rem 1rem', border: 0, borderRadius: 8, background: '#2563eb', color: '#fff', cursor: 'pointer' };
function data(valor: string | null) { return valor ? new Date(valor).toLocaleString('pt-BR') : 'Não registrado'; }
export default function CentralPrivacidade({ administracao = false }: { administracao?: boolean }) {
 const [pagina,setPagina] = useState(1);
 const [paginacao,setPaginacao] = useState({ total: 0, total_paginas: 1 });
 const [sessao,setSessao] = useState<boolean | null>(null);
 const [pedidos,setPedidos] = useState<Pedido[]>([]);
 const [aceite,setAceite] = useState<Aceite | null>(null);
 const [tipo,setTipo] = useState('ACESSO');
 const [descricao,setDescricao] = useState('');
 const [respostas,setRespostas] = useState<Record<string,string>>({});
 const [erro,setErro] = useState(''); const [sucesso,setSucesso] = useState('');
 const [salvando,setSalvando] = useState(false); const [carregando,setCarregando] = useState(true);
 const carregar = useCallback(async()=>{
  setCarregando(true);setErro('');
  if (!localStorage.getItem('@ServicoFacil:token')) { setSessao(false);setCarregando(false);return; }
  setSessao(true);
  try { const r=await api.get(administracao ? `/admin/privacidade?pagina=${pagina}` : '/privacidade/minha-central');
   if (administracao) setPaginacao(r.data.paginacao || { total: r.data.data.length, total_paginas: 1 });
   setPedidos(administracao ? r.data.data : r.data.data.solicitacoes);
   if (!administracao) setAceite(r.data.data.aceite);
  } catch(e:any) { if(e.response?.status===401) setSessao(false);setErro(e.response?.data?.message || 'Não foi possível carregar os protocolos.'); }
  finally {setCarregando(false);}
 },[administracao,pagina]);
 useEffect(()=>{void carregar();},[carregar]);
 async function enviar(e: React.FormEvent) {
  e.preventDefault();setSalvando(true);setErro('');setSucesso('');
  try { const r=await api.post('/privacidade/solicitacoes',{tipo,descricao});setDescricao('');await carregar();setSucesso(`Pedido registrado. Protocolo: ${r.data.data.id}`); }
  catch(e:any){setErro(e.response?.data?.message || 'Não foi possível registrar o pedido.');}finally{setSalvando(false);}
 }
 async function responder(e: React.FormEvent,id: string) {
  e.preventDefault();setSalvando(true);setErro('');setSucesso('');
  try {await api.patch(`/admin/privacidade/${id}/resposta`,{resposta:respostas[id]});await carregar();setSucesso('Resposta registrada para o titular. Nenhuma exclusão de dados foi executada automaticamente.');}
  catch(e:any){setErro(e.response?.data?.message || 'Não foi possível registrar a resposta.');}finally{setSalvando(false);}
 }
 return <main className={estilosLegais.conteudo} style={{ maxWidth: 950, padding: '0 1.25rem 3rem', margin: '2rem auto', lineHeight: 1.65, overflowWrap: 'anywhere' }}>
  <Link href={administracao ? '/admin' : sessao ? '/perfil' : '/'}>← {administracao ? 'Voltar ao painel administrativo' : sessao ? 'Voltar para o perfil' : 'Voltar para a página inicial'}</Link>
  <h1 style={{ fontSize: 'clamp(1.6rem,5vw,2.2rem)', marginTop: '1.5rem' }}>{administracao ? 'Atendimento de privacidade' : 'Central de Privacidade'}</h1>
  <p>Responsável: {documentos.responsavel}. Contato público: <a href={`mailto:${documentos.email_privacidade}`}>{documentos.email_privacidade}</a>.</p>
  <p><Link href="/termos-de-uso">Termos de Uso</Link> · <Link href="/politica-de-privacidade">Política de Privacidade</Link></p>
  <p>Ambiente de TCC com contas de demonstração compartilhadas: use dados fictícios nos testes.</p>
  <p>Atendimento gratuito. Não envie senha, documento completo ou dados sensíveis no pedido. Sem acesso à conta, use o e-mail acima; a equipe verificará sua identidade quando necessário.</p>
  {erro && <p role="alert">{erro}</p>}{sucesso && <p role="status">{sucesso}</p>}
  {carregando ? <p role="status">Carregando protocolos...</p> : !sessao ? <p><Link href="/login">Entre na conta para registrar e acompanhar protocolos</Link>. O contato por e-mail continua disponível sem login.</p> : <>
   {!administracao && aceite && <section aria-labelledby="registro-aceite" style={{margin: '1.5rem 0'}}><h2 id="registro-aceite">Registro do seu cadastro</h2>
    <p>Termos de Uso: {aceite.termos_uso_versao || 'Versão não registrada neste cadastro anterior'}</p>
    <p>Política de Privacidade: {aceite.privacidade_versao || 'Versão não registrada neste cadastro anterior'}</p>
    <p>Data de aceite e ciência: {data(aceite.documentos_aceitos_em)}</p>
    {(!aceite.termos_uso_versao || !aceite.privacidade_versao) && <p>Não atribuímos a você aceite retroativo dos documentos atuais. Consulte os textos públicos e tire dúvidas pelo canal abaixo.</p>}
   </section>}
   {!administracao && aceite && <form onSubmit={enviar} style={{margin: '1.5rem 0'}} aria-label="Novo pedido de privacidade">
    <h2>Novo pedido</h2><label htmlFor="tipo-privacidade">Tipo de pedido</label><select id="tipo-privacidade" value={tipo} onChange={e=>setTipo(e.target.value)} style={estiloCampo}>{Object.entries(TIPOS).map(([id,nome])=><option key={id} value={id}>{nome}</option>)}</select>
    <label htmlFor="descricao-privacidade">Descreva seu pedido</label><textarea id="descricao-privacidade" required minLength={10} maxLength={2000} rows={4} value={descricao} onChange={e=>setDescricao(e.target.value)} style={estiloCampo}/>
    <p>O protocolo registra o pedido para análise manual. Desativar conta não exclui os dados; abrir um pedido de exclusão também não os apaga automaticamente. A resposta deve observar seus direitos e os prazos legais aplicáveis.</p>
    <button disabled={salvando || descricao.trim().length<10} style={estiloBotao}>{salvando ? 'Registrando...' : 'Registrar pedido'}</button>
   </form>}
   <h2>{administracao ? 'Protocolos dos titulares' : 'Meus protocolos'}</h2>
   {administracao && <p>Protocolos paginados, com pendentes primeiro. Verifique a identidade e execute a análise necessária antes de registrar a resposta. Este formulário não realiza exclusões nem exportações automaticamente.</p>}
   {administracao && <nav aria-label="Páginas dos protocolos" style={{display:'flex',gap:'.75rem',flexWrap:'wrap',alignItems:'center'}}><button type="button" disabled={pagina<=1 || carregando} onClick={()=>setPagina(pagina-1)} style={estiloBotao}>Página anterior</button><span>Página {pagina} de {paginacao.total_paginas} · {paginacao.total} protocolos</span><button type="button" disabled={pagina>=paginacao.total_paginas || carregando} onClick={()=>setPagina(pagina+1)} style={estiloBotao}>Próxima página</button></nav>}
   {!pedidos.length && <p>Nenhum protocolo para exibir.</p>}
   {pedidos.map(p=><article key={p.id} style={{padding:'1.25rem',margin:'1rem 0',border:'1px solid var(--card-border)',borderRadius:12,background:'var(--card-bg)'}}>
    <h3>{TIPOS[p.tipo] || p.tipo}</h3><p>Protocolo: {p.id}</p><p>{p.status==='PENDENTE' ? 'Pendente de análise' : 'Respondida'} · Criado em {data(p.createdAt)}</p>
    {administracao && <p>Titular: {p.titular?.nome} · {p.titular?.email}</p>}
    <p style={{whiteSpace:'pre-wrap'}}>{p.descricao}</p>
    {p.resposta && <section aria-label="Resposta ao pedido"><h4>Resposta da equipe</h4><p style={{whiteSpace:'pre-wrap'}}>{p.resposta}</p><p>Respondido em {data(p.respondida_em)}</p></section>}
    {administracao && p.status==='PENDENTE' && <form onSubmit={e=>responder(e,p.id)}><label htmlFor={`resposta-${p.id}`}>Resposta ao titular</label><textarea id={`resposta-${p.id}`} required minLength={10} maxLength={2000} rows={4} value={respostas[p.id] || ''} onChange={e=>setRespostas({...respostas,[p.id]:e.target.value})} style={estiloCampo}/><button disabled={salvando || (respostas[p.id] || '').trim().length<10} style={estiloBotao}>Registrar resposta</button></form>}
   </article>)}
  </>}
 </main>;
}
