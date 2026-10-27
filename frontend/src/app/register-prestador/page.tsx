'use client';

/**
 * @file register-prestador/page.tsx
 * @description Formulário de cadastro de Prestador de Serviço (Profissional) em Next.js 14 / React com TypeScript.
 * Organizado em seções numeradas (US39), com as categorias como botões de alternância e uma prévia,
 * ao lado, de como o perfil aparece para os clientes, atualizada enquanto o prestador preenche.
 * Desde a US40, o aceite dos Termos de Uso e a ciência da Política de Privacidade são dois sinais
 * separados, enviados com as versões vigentes dos documentos. O CPF/CNPJ é conferido pelos dígitos
 * verificadores ao sair do campo e antes do envio, como no cadastro de cliente.
 *
 * BIBLIOTECAS UTILIZADAS:
 * 1. Lucide React (^0.383.0): Ícones para campos e categorias do formulário.
 *    Doc Oficial: https://lucide.dev/
 * 2. Next.js (^14.2.3): Framework React com App Router.
 *    Doc Oficial: https://nextjs.org/docs
 * 3. React (^18.3.1): Estado e ciclo de vida da prévia da foto. https://react.dev/reference/react
 * 4. Axios (^1.7.2): Envio multipart pelo serviço api. https://axios-http.com/docs/multipart
 */

import React, { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { AlertCircle, ArrowRight, Check, Upload, UserCircle2 } from 'lucide-react';
import api from '@/services/api';
import Pagina, { CabecalhoPagina } from '@/components/ui/Pagina';
import { Aviso, Avatar } from '@/components/ui/Elementos';
import AceiteDocumentos from '@/components/AceiteDocumentos';
import documentos from '@/conteudo/documentos-legais.json';
import { normalizarDocumento, validarCNPJ, validarCPF } from '@/utils/documento';

const CATEGORIAS_DISPONIVEIS = [
  { id: 'ELETRICA', label: 'Elétrica & Iluminação' },
  { id: 'ENCANAMENTO', label: 'Hidráulica & Encanamento' },
  { id: 'PINTURA', label: 'Pintura & Acabamentos' },
  { id: 'REFORMAS', label: 'Pedreiro & Reformas Gerais' },
  { id: 'REFRIGERACAO', label: 'Ar-Condicionado & Refrigeração' },
  { id: 'TECNOLOGIA', label: 'Informática, Redes & T.I.' },
  { id: 'LIMPEZA', label: 'Limpeza & Sanitização' },
  { id: 'MECANICA', label: 'Mecânica & Auto' },
];

/** Mesmo mínimo exigido pelo backend no cadastro (authService). */
const SENHA_MINIMA = 8;

export default function RegisterPrestadorPage() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    nome: '',
    email: '',
    cnpjCpf: '',
    telefone: '',
    endereco: '',
    senha: '',
    confirmarSenha: '',
    descricaoBio: '',
    termosAceitos: false,
  });
  // Ciência da Política separada do aceite dos Termos (US40): nenhum dos dois vem marcado.
  const [privacidadeCiente, setPrivacidadeCiente] = useState(false);
  const [docTocado, setDocTocado] = useState(false);

  const [categoriasSelecionadas, setCategoriasSelecionadas] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [foto, setFoto] = useState<File | null>(null);
  const [fotoPreview, setFotoPreview] = useState<string | null>(null);
  const [erroFoto, setErroFoto] = useState<string | null>(null);
  const fotoInput = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!foto) { setFotoPreview(null); return; }
    const url = URL.createObjectURL(foto);
    setFotoPreview(url);
    return () => URL.revokeObjectURL(url);
  }, [foto]);

  const validarFoto = (arquivo: File): string | null => {
    if (!['image/jpeg', 'image/png', 'image/webp'].includes(arquivo.type)) return 'Envie uma foto JPEG, PNG ou WEBP.';
    if (arquivo.size > 5 * 1024 * 1024) return 'A foto deve ter no máximo 5 MB.';
    if (!arquivo.size) return 'A foto selecionada está vazia.';
    return null;
  };

  const handleFoto = (evento: React.ChangeEvent<HTMLInputElement>) => {
    const arquivo = evento.target.files?.[0];
    const erro = arquivo ? validarFoto(arquivo) : null;
    setErroFoto(erro);
    setFoto(arquivo && !erro ? arquivo : null);
    if (erro) evento.target.value = '';
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target as HTMLInputElement;
    const checked = (e.target as HTMLInputElement).checked;

    setFormData((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
  };

  const handleCategoriaToggle = (catId: string) => {
    setCategoriasSelecionadas((prev) =>
      prev.includes(catId) ? prev.filter((id) => id !== catId) : [...prev, catId]
    );
  };

  const docValido = validarCPF(formData.cnpjCpf) || validarCNPJ(formData.cnpjCpf);
  const docInvalido = docTocado && formData.cnpjCpf.trim() !== '' && !docValido;
  const faltamNaSenha = Math.max(0, SENHA_MINIMA - formData.senha.length);
  const senhasDiferentes = formData.confirmarSenha !== '' && formData.senha !== formData.confirmarSenha;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setSuccessMsg(null);

    // Mesma checagem de dígitos verificadores do backend, antes de enviar o cadastro.
    if (!docValido) {
      setDocTocado(true);
      setErrorMsg('CPF ou CNPJ inválido. Confira os dígitos e tente novamente.');
      return;
    }

    if (foto && validarFoto(foto)) {
      setErrorMsg(validarFoto(foto));
      return;
    }
    setErroFoto(null);

    if (formData.senha.length < SENHA_MINIMA) {
      setErrorMsg(`A senha precisa ter pelo menos ${SENHA_MINIMA} caracteres.`);
      return;
    }

    if (formData.senha !== formData.confirmarSenha) {
      setErrorMsg('As senhas digitadas não coincidem.');
      return;
    }

    if (categoriasSelecionadas.length === 0) {
      setErrorMsg('Selecione ao menos uma categoria de atuação profissional.');
      return;
    }

    if (!formData.termosAceitos || !privacidadeCiente) {
      setErrorMsg('Aceite os Termos de Uso e confirme a leitura da Política de Privacidade para prosseguir.');
      return;
    }

    setLoading(true);

    try {
      const payload = {
        nome: formData.nome,
        email: formData.email,
        cnpj_cpf: normalizarDocumento(formData.cnpjCpf),
        telefone: formData.telefone,
        endereco: formData.endereco,
        senha: formData.senha,
        descricao_bio: formData.descricaoBio,
        categorias: categoriasSelecionadas,
        termos_uso_aceitos: formData.termosAceitos,
        privacidade_ciente: privacidadeCiente,
        termos_uso_versao: documentos.versao_termos,
        privacidade_versao: documentos.versao_privacidade,
      };

      const multipart = new FormData();
      Object.entries(payload).forEach(([campo, valor]) => {
        multipart.append(campo, Array.isArray(valor) ? JSON.stringify(valor) : String(valor));
      });
      if (foto) multipart.append('foto', foto);
      const response = await api.post('/auth/register/prestador', multipart, {
        // O navegador define o boundary multipart; remove o padrão application/json do cliente.
        headers: { 'Content-Type': undefined },
      });
      setSuccessMsg(`${response.data.message || 'Cadastro de Prestador realizado com sucesso!'} Redirecionando para o login...`);

      setTimeout(() => {
        router.push('/login');
      }, 1800);
    } catch (err: any) {
      const apiError = err.response?.data?.message || 'Ocorreu um erro ao cadastrar prestador.';
      setErrorMsg(apiError);
    } finally {
      setLoading(false);
    }
  };

  const nomePrevia = formData.nome.trim() || 'Seu nome ou empresa';
  const categoriasPrevia = CATEGORIAS_DISPONIVEIS.filter((c) => categoriasSelecionadas.includes(c.id));

  return (
    <Pagina>
      <CabecalhoPagina
        voltar={{ href: '/', rotulo: 'Página inicial' }}
        area="Conta profissional"
        titulo="Criar conta para atender clientes"
        subtitulo="Seu perfil aparece para os clientes junto com cada proposta que você enviar."
        acoes={<Link href="/register-solicitante" className="btn btn-secundario">Quero só contratar <ArrowRight size={16} aria-hidden="true" /></Link>}
      />

      <div className="layout-lateral">
        <form onSubmit={handleSubmit} className="principal card grande" style={{ gap: '1.75rem' }}>
          <fieldset className="secao-form">
            <legend>1. Seu perfil profissional</legend>
            <div style={{ display: 'flex', gap: '1rem', alignItems: 'center', flexWrap: 'wrap' }}>
              {fotoPreview
                ? <img src={fotoPreview} alt="Prévia da foto de perfil selecionada" style={{ width: 80, height: 80, objectFit: 'cover', borderRadius: '50%' }} />
                : <span aria-hidden="true" style={{ width: 80, height: 80, borderRadius: '50%', background: 'var(--sky-bg)', border: '2px dashed var(--card-border)', color: 'var(--brand-sky)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><UserCircle2 size={30} /></span>}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
                <div className="grupo-botoes">
                  <button type="button" className="btn btn-secundario" disabled={loading} onClick={() => fotoInput.current?.click()} aria-describedby="ajuda-foto-prestador">
                    <Upload size={16} aria-hidden="true" /> {foto ? 'Trocar foto' : 'Escolher foto'} <span className="opcional" style={{ fontWeight: 400, color: 'var(--text-secondary)' }}>(opcional)</span>
                  </button>
                  {foto && (
                    <button type="button" className="btn btn-texto discreto" disabled={loading} onClick={() => { setFoto(null); setErroFoto(null); if (fotoInput.current) fotoInput.current.value = ''; }}>
                      Remover foto
                    </button>
                  )}
                </div>
                <input ref={fotoInput} id="foto-prestador" name="foto" type="file" accept="image/jpeg,image/png,image/webp" onChange={handleFoto} disabled={loading} aria-label="Foto de perfil" aria-invalid={Boolean(erroFoto)} style={{ display: 'none' }} />
                <span id="ajuda-foto-prestador" className="ajuda">JPEG, PNG ou WEBP, até 5 MB. A foto aparece no seu perfil público.</span>
                {erroFoto && <span role="alert" className="erro-campo"><AlertCircle size={14} aria-hidden="true" />{erroFoto}</span>}
              </div>
            </div>
            <div className="campo-grupo">
              <label htmlFor="pre-nome" className="rotulo">Nome ou razão social</label>
              <input id="pre-nome" type="text" name="nome" required className="campo" value={formData.nome} onChange={handleChange} placeholder="Ex.: Marcos Refrigeração & Elétrica" aria-describedby="pre-nome-ajuda" />
              <span id="pre-nome-ajuda" className="ajuda">É o nome que os clientes verão nas suas propostas.</span>
            </div>
            <div role="group" aria-labelledby="pre-cat-titulo" className="campo-grupo" style={{ gap: '0.6rem' }}>
              <span id="pre-cat-titulo" className="rotulo">Em que você trabalha? <span className="opcional">Escolha uma ou mais</span></span>
              <div className="chips" style={{ gap: '0.5rem' }}>
                {CATEGORIAS_DISPONIVEIS.map((cat) => {
                  const isSelected = categoriasSelecionadas.includes(cat.id);
                  return (
                    <button
                      type="button" key={cat.id} onClick={() => handleCategoriaToggle(cat.id)} aria-pressed={isSelected}
                      className="btn"
                      style={{
                        minHeight: '40px', borderRadius: '999px', padding: '0 0.9rem', fontSize: '0.875rem',
                        border: isSelected ? '1px solid var(--accent-indigo)' : '1px solid var(--card-border)',
                        background: isSelected ? 'var(--primary-tint-strong)' : 'transparent',
                        color: isSelected ? 'var(--text-primary)' : 'var(--text-body)',
                      }}
                    >
                      {isSelected && <Check size={15} aria-hidden="true" />}{cat.label}
                    </button>
                  );
                })}
              </div>
            </div>
            <div className="campo-grupo">
              <label htmlFor="pre-bio" className="rotulo">Sobre você <span className="opcional">(opcional, mas ajuda muito)</span></label>
              <textarea id="pre-bio" name="descricaoBio" rows={4} className="campo" value={formData.descricaoBio} onChange={handleChange} placeholder="Descreva suas qualificações, anos de experiência e os tipos de serviços que executa..." aria-describedby="pre-bio-ajuda" />
              <span id="pre-bio-ajuda" className="ajuda">Conte há quanto tempo trabalha, o que faz e onde atende.</span>
            </div>
          </fieldset>

          <fieldset className="secao-form">
            <legend>2. Documento e contato</legend>
            <div className="grade-campos campos-largos">
              <div className="campo-grupo">
                <label htmlFor="pre-doc" className="rotulo">CPF ou CNPJ</label>
                <input
                  id="pre-doc" type="text" name="cnpjCpf" required inputMode="numeric" className="campo"
                  value={formData.cnpjCpf} onChange={handleChange} onBlur={() => setDocTocado(true)} placeholder="12.345.678/0001-90"
                  aria-invalid={docInvalido} aria-describedby={docInvalido ? 'pre-doc-erro pre-doc-ajuda' : 'pre-doc-ajuda'}
                />
                {docInvalido && <span id="pre-doc-erro" className="erro-campo"><AlertCircle size={14} aria-hidden="true" />CPF ou CNPJ inválido: confira os dígitos.</span>}
                <span id="pre-doc-ajuda" className="ajuda">CPF (11 dígitos) ou CNPJ (14 dígitos), com ou sem pontuação.</span>
              </div>
              <div className="campo-grupo">
                <label htmlFor="pre-email" className="rotulo">E-mail comercial</label>
                <input id="pre-email" type="email" name="email" required autoComplete="email" className="campo" value={formData.email} onChange={handleChange} placeholder="marcos@servicos.com" />
              </div>
              <div className="campo-grupo">
                <label htmlFor="pre-tel" className="rotulo">Telefone / WhatsApp</label>
                <input id="pre-tel" type="tel" name="telefone" required autoComplete="tel" className="campo" value={formData.telefone} onChange={handleChange} placeholder="(16) 98765-4321" />
              </div>
              <div className="campo-grupo">
                <label htmlFor="pre-end" className="rotulo">Endereço de atendimento <span className="opcional">(opcional)</span></label>
                <input id="pre-end" type="text" name="endereco" className="campo" value={formData.endereco} onChange={handleChange} placeholder="Av. Brasil, 500 - Ribeirão Preto, SP" />
              </div>
            </div>
          </fieldset>

          <fieldset className="secao-form">
            <legend>3. Acesso</legend>
            <div className="grade-campos">
              <div className="campo-grupo">
                <label htmlFor="pre-senha" className="rotulo">Senha</label>
                <input id="pre-senha" type="password" name="senha" required minLength={SENHA_MINIMA} autoComplete="new-password" className="campo" value={formData.senha} onChange={handleChange} aria-describedby="pre-senha-regra" />
                <span id="pre-senha-regra" className="ajuda" style={{ color: formData.senha && faltamNaSenha === 0 ? 'var(--success-strong)' : undefined }}>
                  {formData.senha === '' ? `No mínimo ${SENHA_MINIMA} caracteres.` : faltamNaSenha > 0 ? `Faltam ${faltamNaSenha} caracteres.` : 'Tamanho ok.'}
                </span>
              </div>
              <div className="campo-grupo">
                <label htmlFor="pre-senha2" className="rotulo">Confirmar senha</label>
                <input id="pre-senha2" type="password" name="confirmarSenha" required autoComplete="new-password" className="campo" value={formData.confirmarSenha} onChange={handleChange} aria-invalid={senhasDiferentes} aria-describedby={senhasDiferentes ? 'pre-senha2-erro' : undefined} />
                {senhasDiferentes && <span id="pre-senha2-erro" className="erro-campo"><AlertCircle size={14} aria-hidden="true" />As senhas não coincidem.</span>}
              </div>
            </div>
          </fieldset>

          <AceiteDocumentos
            numero={4} termos={formData.termosAceitos} ciencia={privacidadeCiente}
            alterarTermos={(valor) => setFormData((prev) => ({ ...prev, termosAceitos: valor }))}
            alterarCiencia={setPrivacidadeCiente}
          />

          {errorMsg && <Aviso tipo="erro">{errorMsg}</Aviso>}
          {successMsg && <Aviso tipo="sucesso">{successMsg}</Aviso>}

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            <button type="submit" disabled={loading} className="btn btn-primario btn-grande btn-bloco">
              {loading ? 'Criando conta...' : 'Criar conta profissional'}
            </button>
            <span className="texto-apoio" style={{ textAlign: 'center' }}>Já tem conta? <Link href="/login" style={{ fontWeight: 600 }}>Entrar</Link></span>
          </div>
        </form>

        <aside className="lateral" aria-label="Prévia do perfil">
          <span className="rotulo-area" style={{ color: 'var(--text-secondary)' }}>Prévia — como os clientes verão você</span>
          <div className="card empilhado" style={{ gap: '0.85rem' }}>
            <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
              <Avatar nome={nomePrevia} foto={fotoPreview} tamanho={52} />
              <div style={{ display: 'flex', flexDirection: 'column', gap: '2px', minWidth: 0 }}>
                <strong style={{ fontSize: '1rem', overflowWrap: 'anywhere', color: formData.nome.trim() ? undefined : 'var(--text-secondary)' }}>{nomePrevia}</strong>
                <span className="texto-apoio" style={{ fontSize: '0.8rem' }}>Sem avaliações ainda{formData.endereco.trim() ? ` · ${formData.endereco.trim()}` : ''}</span>
              </div>
            </div>
            {categoriasPrevia.length > 0 && (
              <div className="chips">{categoriasPrevia.map((c) => <span key={c.id} className="chip categoria">{c.label}</span>)}</div>
            )}
            <p style={{ fontSize: '0.875rem', lineHeight: 1.55, color: formData.descricaoBio.trim() ? 'var(--text-body)' : 'var(--text-muted)', overflowWrap: 'anywhere' }}>
              {formData.descricaoBio.trim()
                ? (formData.descricaoBio.trim().length > 180 ? `${formData.descricaoBio.trim().slice(0, 180)}…` : formData.descricaoBio.trim())
                : 'Sua apresentação aparece aqui.'}
            </p>
          </div>
          <p className="texto-apoio" style={{ fontSize: '0.82rem', lineHeight: 1.55 }}>A prévia muda enquanto você preenche. Depois do cadastro, sua nota aparece aqui conforme os clientes avaliam os serviços.</p>
        </aside>
      </div>
    </Pagina>
  );
}
