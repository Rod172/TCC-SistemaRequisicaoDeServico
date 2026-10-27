'use client';

/**
 * @file perfil/page.tsx
 * @description Tela "Meu Perfil" (US04) do usuário autenticado: edição de dados cadastrais e foto,
 * troca de senha e desativação da conta. Consome a API protegida por JWT em /api/v1/perfil.
 * Layout da US39 ("Minha conta"): navegação lateral compartilhada com as configurações de notificação
 * e a Central de Privacidade, e as seções de dados pessoais, senha e desativação uma abaixo da outra,
 * cada uma com o próprio aviso de sucesso ou erro. Desde a US40, a desativação deixa claro que não
 * exclui os dados e encaminha os pedidos sobre dados pessoais à Central de Privacidade.
 *
 * BIBLIOTECAS UTILIZADAS:
 * 1. Lucide React (^0.383.0): Ícones para campos do formulário e seções.
 *    Doc Oficial: https://lucide.dev/
 * 2. Next.js (^14.2.3): Framework React com App Router.
 *    Doc Oficial: https://nextjs.org/docs
 * 3. Axios (^1.7.2): Requisições HTTP REST à API backend, incluindo upload multipart da foto.
 *    Doc Oficial: https://axios-http.com/docs/intro
 */

import React, { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Camera, KeyRound, Save, Trash2 } from 'lucide-react';
import api from '@/services/api';
import LayoutConta from '@/components/ui/LayoutConta';
import { Aviso, EstadoLista, iniciais } from '@/components/ui/Elementos';

const BACKEND_ORIGIN = (process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api/v1').replace(/\/api\/v1\/?$/, '');

/** Mesmo mínimo exigido no cadastro (authService), para a regra da senha ser uma só no app. */
const SENHA_MINIMA = 8;

type Secao = 'dados' | 'senha' | 'privacidade';

interface PerfilData {
  id: string;
  nome: string;
  email: string;
  telefone: string;
  endereco?: string;
  foto_url?: string;
  tipo_perfil: 'SOLICITANTE' | 'PRESTADOR' | 'ADMIN';
}

export default function PerfilPage() {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [perfil, setPerfil] = useState<PerfilData | null>(null);
  const [carregando, setCarregando] = useState(true);

  const [dadosForm, setDadosForm] = useState({ nome: '', telefone: '', endereco: '' });
  const [salvandoDados, setSalvandoDados] = useState(false);
  const [enviandoFoto, setEnviandoFoto] = useState(false);

  const [senhaForm, setSenhaForm] = useState({ senha_atual: '', nova_senha: '', confirmar_senha: '' });
  const [salvandoSenha, setSalvandoSenha] = useState(false);

  const [excluindo, setExcluindo] = useState(false);
  const [confirmarExclusao, setConfirmarExclusao] = useState(false);

  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  // Seção a que a mensagem pertence: o aviso aparece dentro dela, perto de onde a pessoa agiu.
  const [secaoMsg, setSecaoMsg] = useState<Secao>('dados');

  useEffect(() => {
    const token = localStorage.getItem('@ServicoFacil:token');
    if (!token) {
      router.replace('/login');
      return;
    }

    async function carregarPerfil() {
      try {
        const response = await api.get('/perfil');
        const dados: PerfilData = response.data.data;
        setPerfil(dados);
        setDadosForm({
          nome: dados.nome || '',
          telefone: dados.telefone || '',
          endereco: dados.endereco || '',
        });
      } catch (err: any) {
        if (err.response?.status === 401) {
          localStorage.removeItem('@ServicoFacil:token');
          localStorage.removeItem('@ServicoFacil:user');
          router.replace('/login');
          return;
        }
        setErrorMsg(err.response?.data?.message || 'Não foi possível carregar os dados do seu perfil.');
      } finally {
        setCarregando(false);
      }
    }

    carregarPerfil();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function limparMensagens(secao: Secao) {
    setSuccessMsg(null);
    setErrorMsg(null);
    setSecaoMsg(secao);
  }

  async function handleSalvarDados(e: React.FormEvent) {
    e.preventDefault();
    limparMensagens('dados');
    setSalvandoDados(true);

    try {
      const response = await api.put('/perfil', dadosForm);
      setPerfil((prev) => (prev ? { ...prev, ...response.data.data } : prev));
      localStorage.setItem('@ServicoFacil:user', JSON.stringify(response.data.data));
      setSuccessMsg('Dados do perfil atualizados com sucesso!');
    } catch (err: any) {
      setErrorMsg(err.response?.data?.message || 'Não foi possível atualizar seus dados.');
    } finally {
      setSalvandoDados(false);
    }
  }

  async function handleSelecionarFoto(e: React.ChangeEvent<HTMLInputElement>) {
    const arquivo = e.target.files?.[0];
    if (!arquivo) return;

    limparMensagens('dados');
    setEnviandoFoto(true);

    const formData = new FormData();
    formData.append('foto', arquivo);

    try {
      const response = await api.post('/perfil/foto', formData, {
        headers: { 'Content-Type': undefined },
      });
      const { foto_url } = response.data.data;
      setPerfil((prev) => (prev ? { ...prev, foto_url } : prev));
      setSuccessMsg('Foto de perfil atualizada com sucesso!');
    } catch (err: any) {
      setErrorMsg(err.response?.data?.message || 'Não foi possível enviar a foto. Use JPEG, PNG ou WEBP de até 5MB.');
    } finally {
      setEnviandoFoto(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  }

  async function handleAlterarSenha(e: React.FormEvent) {
    e.preventDefault();
    limparMensagens('senha');

    if (senhaForm.nova_senha.length < SENHA_MINIMA) {
      setErrorMsg(`A nova senha precisa ter pelo menos ${SENHA_MINIMA} caracteres.`);
      return;
    }

    if (senhaForm.nova_senha !== senhaForm.confirmar_senha) {
      setErrorMsg('A confirmação da nova senha não coincide.');
      return;
    }

    setSalvandoSenha(true);
    try {
      await api.put('/perfil/senha', {
        senha_atual: senhaForm.senha_atual,
        nova_senha: senhaForm.nova_senha,
      });
      setSuccessMsg('Senha alterada com sucesso!');
      setSenhaForm({ senha_atual: '', nova_senha: '', confirmar_senha: '' });
    } catch (err: any) {
      setErrorMsg(err.response?.data?.message || 'Não foi possível alterar a senha.');
    } finally {
      setSalvandoSenha(false);
    }
  }

  async function handleExcluirConta() {
    limparMensagens('privacidade');
    setExcluindo(true);
    try {
      await api.delete('/perfil');
      localStorage.removeItem('@ServicoFacil:token');
      localStorage.removeItem('@ServicoFacil:user');
      router.push('/');
    } catch (err: any) {
      setErrorMsg(err.response?.data?.message || 'Não foi possível excluir sua conta agora.');
      setExcluindo(false);
    }
  }

  function avisos(secao: Secao) {
    if (secaoMsg !== secao) return null;
    return (
      <>
        {errorMsg && <Aviso tipo="erro">{errorMsg}</Aviso>}
        {successMsg && <Aviso tipo="sucesso">{successMsg}</Aviso>}
      </>
    );
  }

  if (carregando) {
    return (
      <LayoutConta pagina="perfil">
        <EstadoLista tipo="carregando">Carregando seu perfil...</EstadoLista>
      </LayoutConta>
    );
  }

  if (!perfil) {
    return (
      <LayoutConta pagina="perfil">
        <EstadoLista tipo="erro">{errorMsg || 'Não foi possível carregar os dados do seu perfil.'}</EstadoLista>
      </LayoutConta>
    );
  }

  const tipoConta = perfil.tipo_perfil === 'PRESTADOR' ? 'Prestador de Serviço' : perfil.tipo_perfil === 'ADMIN' ? 'Administrador' : 'Cliente';
  const faltamNaSenha = Math.max(0, SENHA_MINIMA - senhaForm.nova_senha.length);

  return (
    <LayoutConta pagina="perfil">
      {/* ── Dados pessoais ─────────────────────────── */}
      <form id="dados" onSubmit={handleSalvarDados} aria-labelledby="titulo-dados" className="card grande empilhado" style={{ gap: '1.1rem', scrollMarginTop: '1rem' }}>
        <h2 id="titulo-dados" className="titulo-secao">Dados pessoais</h2>
        <div style={{ display: 'flex', gap: '1rem', alignItems: 'center', flexWrap: 'wrap' }}>
          <span aria-hidden="true" className="avatar" style={{ width: 72, height: 72, fontSize: '1.5rem' }}>
            {perfil.foto_url
              // eslint-disable-next-line @next/next/no-img-element
              ? <img src={`${BACKEND_ORIGIN}${perfil.foto_url}`} alt="" />
              : iniciais(perfil.nome)}
          </span>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.2rem', minWidth: 0 }}>
            <strong style={{ fontSize: '1rem', overflowWrap: 'anywhere' }}>{perfil.nome}</strong>
            <span className="texto-apoio" style={{ fontSize: '0.82rem', overflowWrap: 'anywhere' }}>{perfil.email} · {tipoConta}</span>
            <button type="button" onClick={() => fileInputRef.current?.click()} disabled={enviandoFoto} className="btn btn-texto" style={{ alignSelf: 'flex-start', minHeight: '36px', padding: 0 }}>
              <Camera size={15} aria-hidden="true" /> {enviandoFoto ? 'Enviando foto...' : 'Alterar foto'}
            </button>
            <input ref={fileInputRef} type="file" accept="image/jpeg,image/png,image/webp" onChange={handleSelecionarFoto} hidden aria-label="Alterar foto de perfil" />
          </div>
        </div>
        <div className="grade-campos">
          <div className="campo-grupo inteiro">
            <label htmlFor="perfil-nome" className="rotulo">Nome completo</label>
            <input id="perfil-nome" type="text" required autoComplete="name" className="campo" value={dadosForm.nome} onChange={(e) => setDadosForm((p) => ({ ...p, nome: e.target.value }))} />
          </div>
          <div className="campo-grupo">
            <label htmlFor="perfil-telefone" className="rotulo">Telefone</label>
            <input id="perfil-telefone" type="tel" required autoComplete="tel" className="campo" value={dadosForm.telefone} onChange={(e) => setDadosForm((p) => ({ ...p, telefone: e.target.value }))} />
          </div>
          <div className="campo-grupo">
            <label htmlFor="perfil-endereco" className="rotulo">Endereço</label>
            <input id="perfil-endereco" type="text" autoComplete="street-address" className="campo" value={dadosForm.endereco} onChange={(e) => setDadosForm((p) => ({ ...p, endereco: e.target.value }))} placeholder="Rua, número, bairro, cidade" />
          </div>
        </div>
        {avisos('dados')}
        <button type="submit" disabled={salvandoDados} className="btn btn-primario" style={{ alignSelf: 'flex-start' }}>
          <Save size={16} aria-hidden="true" /> {salvandoDados ? 'Salvando...' : 'Salvar alterações'}
        </button>
      </form>

      {/* ── Senha ─────────────────────────── */}
      <form id="senha" onSubmit={handleAlterarSenha} aria-labelledby="titulo-senha" className="card grande empilhado" style={{ gap: '1.1rem', scrollMarginTop: '1rem' }}>
        <h2 id="titulo-senha" className="titulo-secao">Senha</h2>
        <div className="grade-campos" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 200px), 1fr))' }}>
          <div className="campo-grupo">
            <label htmlFor="senha-atual" className="rotulo">Senha atual</label>
            <input id="senha-atual" type="password" required autoComplete="current-password" className="campo" value={senhaForm.senha_atual} onChange={(e) => setSenhaForm((p) => ({ ...p, senha_atual: e.target.value }))} />
          </div>
          <div className="campo-grupo">
            <label htmlFor="senha-nova" className="rotulo">Nova senha</label>
            <input id="senha-nova" type="password" required minLength={SENHA_MINIMA} autoComplete="new-password" className="campo" value={senhaForm.nova_senha} onChange={(e) => setSenhaForm((p) => ({ ...p, nova_senha: e.target.value }))} aria-describedby="senha-nova-regra" />
            <span id="senha-nova-regra" className="ajuda" style={{ color: senhaForm.nova_senha && faltamNaSenha === 0 ? 'var(--success-strong)' : undefined }}>
              {senhaForm.nova_senha === '' ? `No mínimo ${SENHA_MINIMA} caracteres.` : faltamNaSenha > 0 ? `Faltam ${faltamNaSenha} caracteres.` : 'Tamanho ok.'}
            </span>
          </div>
          <div className="campo-grupo">
            <label htmlFor="senha-confirmar" className="rotulo">Confirmar nova senha</label>
            <input id="senha-confirmar" type="password" required minLength={SENHA_MINIMA} autoComplete="new-password" className="campo" value={senhaForm.confirmar_senha} onChange={(e) => setSenhaForm((p) => ({ ...p, confirmar_senha: e.target.value }))} />
          </div>
        </div>
        {avisos('senha')}
        <button type="submit" disabled={salvandoSenha} className="btn btn-secundario" style={{ alignSelf: 'flex-start' }}>
          <KeyRound size={16} aria-hidden="true" /> {salvandoSenha ? 'Alterando...' : 'Alterar senha'}
        </button>
      </form>

      {/* ── Desativação da conta (texto da US40) ─── */}
      <section id="desativar" aria-labelledby="titulo-privacidade" className="card grande perigo empilhado" style={{ gap: '0.9rem', scrollMarginTop: '1rem' }}>
        <h2 id="titulo-privacidade" className="titulo-secao">Desativação da conta e direitos sobre seus dados</h2>
        <p style={{ fontSize: '0.9rem', lineHeight: 1.6, color: 'var(--text-body)' }}>
          Desativar a conta bloqueia seu acesso e preserva o histórico. Essa ação não exclui nem anonimiza seus dados.{' '}
          <strong style={{ color: 'var(--text-primary)' }}>Ela não pode ser desfeita pelo próprio usuário.</strong>
        </p>
        <p style={{ fontSize: '0.9rem', lineHeight: 1.6, color: 'var(--text-body)' }}>
          Para exercer os direitos previstos na LGPD, como acesso, correção ou análise de exclusão dos dados, use a{' '}
          <Link href="/privacidade" style={{ fontWeight: 600 }}>Central de Privacidade</Link>, onde também ficam os registros do seu cadastro.
        </p>
        {avisos('privacidade')}
        {!confirmarExclusao ? (
          <button type="button" onClick={() => setConfirmarExclusao(true)} className="btn btn-perigo" style={{ alignSelf: 'flex-start' }}>
            <Trash2 size={16} aria-hidden="true" /> Desativar minha conta
          </button>
        ) : (
          <div role="alertdialog" aria-labelledby="titulo-confirmar-exclusao" className="empilhado" style={{ gap: '0.75rem', padding: '1rem', borderRadius: '12px', background: 'var(--danger-bg)', border: '1px solid var(--danger-border)' }}>
            <p id="titulo-confirmar-exclusao" style={{ fontSize: '0.9rem' }}>Tem certeza? Você será desconectado imediatamente e perderá o acesso à sua conta.</p>
            <div className="grupo-botoes">
              <button type="button" onClick={() => setConfirmarExclusao(false)} className="btn btn-secundario" autoFocus>Voltar sem alterar</button>
              <button type="button" onClick={handleExcluirConta} disabled={excluindo} className="btn btn-perigo">
                <Trash2 size={16} aria-hidden="true" /> {excluindo ? 'Desativando...' : 'Sim, desativar minha conta'}
              </button>
            </div>
          </div>
        )}
      </section>
    </LayoutConta>
  );
}
