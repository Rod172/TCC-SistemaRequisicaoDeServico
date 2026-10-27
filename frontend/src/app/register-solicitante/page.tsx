'use client';

/**
 * @file register-solicitante/page.tsx
 * @description Formulário de cadastro de usuário Solicitante (Cliente) em Next.js 14 / React com TypeScript.
 * Organizado em seções numeradas (US39), com erros de CPF, senha e confirmação mostrados embaixo
 * do próprio campo e a regra real da senha (mínimo de 8 caracteres, a mesma do backend) visível.
 * Desde a US40, o aceite dos Termos de Uso e a ciência da Política de Privacidade são dois sinais
 * separados, enviados com as versões vigentes dos documentos.
 *
 * BIBLIOTECAS UTILIZADAS:
 * 1. Lucide React (^0.383.0): Ícones para campos do formulário.
 *    Doc Oficial: https://lucide.dev/
 * 2. Next.js (^14.2.3): Framework React com App Router.
 *    Doc Oficial: https://nextjs.org/docs
 */

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { AlertCircle, ArrowRight, Check, Lock } from 'lucide-react';
import api from '@/services/api';
import { normalizarDocumento, validarCPF } from '@/utils/documento';
import Pagina, { CabecalhoPagina } from '@/components/ui/Pagina';
import { Aviso } from '@/components/ui/Elementos';
import AceiteDocumentos from '@/components/AceiteDocumentos';
import documentos from '@/conteudo/documentos-legais.json';

/** Mesmo mínimo exigido pelo backend no cadastro (authService). */
const SENHA_MINIMA = 8;

export default function RegisterSolicitantePage() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    nome: '',
    email: '',
    cpf: '',
    telefone: '',
    endereco: '',
    senha: '',
    confirmarSenha: '',
    termosAceitos: false,
  });
  // Ciência da Política separada do aceite dos Termos (US40): nenhum dos dois vem marcado.
  const [privacidadeCiente, setPrivacidadeCiente] = useState(false);
  const [cpfTocado, setCpfTocado] = useState(false);

  const [loading, setLoading] = useState(false);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
  };

  const cpfInvalido = cpfTocado && formData.cpf.trim() !== '' && !validarCPF(formData.cpf);
  const faltamNaSenha = Math.max(0, SENHA_MINIMA - formData.senha.length);
  const senhasDiferentes = formData.confirmarSenha !== '' && formData.senha !== formData.confirmarSenha;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setSuccessMsg(null);

    // Impede o envio de CPF inválido antes de iniciar a requisição de cadastro.
    if (!validarCPF(formData.cpf)) {
      setCpfTocado(true);
      setErrorMsg('CPF inválido. Confira os 11 dígitos e tente novamente.');
      return;
    }

    // Validações no cliente
    if (formData.senha.length < SENHA_MINIMA) {
      setErrorMsg(`A senha precisa ter pelo menos ${SENHA_MINIMA} caracteres.`);
      return;
    }

    if (formData.senha !== formData.confirmarSenha) {
      setErrorMsg('As senhas digitadas não coincidem.');
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
        cpf: normalizarDocumento(formData.cpf),
        telefone: formData.telefone,
        endereco: formData.endereco,
        senha: formData.senha,
        termos_uso_aceitos: formData.termosAceitos,
        privacidade_ciente: privacidadeCiente,
        termos_uso_versao: documentos.versao_termos,
        privacidade_versao: documentos.versao_privacidade,
      };

      const response = await api.post('/auth/register/solicitante', payload);
      setSuccessMsg(`${response.data.message || 'Cadastro realizado com sucesso!'} Redirecionando para o login...`);

      setTimeout(() => {
        router.push('/login');
      }, 1800);
    } catch (err: any) {
      const apiError = err.response?.data?.message || 'Ocorreu um erro ao realizar o cadastro. Tente novamente.';
      setErrorMsg(apiError);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Pagina largura="estreita">
      <CabecalhoPagina
        voltar={{ href: '/', rotulo: 'Página inicial' }}
        area="Conta de cliente"
        titulo="Criar conta para contratar serviços"
        subtitulo="Leva menos de 2 minutos. Depois é só publicar o que você precisa."
        acoes={<Link href="/register-prestador" className="btn btn-secundario">Sou prestador de serviço <ArrowRight size={16} aria-hidden="true" /></Link>}
      />

      <div className="layout-lateral">
        <form onSubmit={handleSubmit} className="principal card grande" style={{ gap: '1.75rem' }}>
          <fieldset className="secao-form">
            <legend>1. Seus dados</legend>
            <div className="campo-grupo">
              <label htmlFor="cad-nome" className="rotulo">Nome completo</label>
              <input id="cad-nome" type="text" name="nome" required autoComplete="name" className="campo" value={formData.nome} onChange={handleChange} placeholder="Ex.: Carlos Eduardo Silva" />
            </div>
            <div className="campo-grupo">
              <label htmlFor="cad-cpf" className="rotulo">CPF</label>
              <input
                id="cad-cpf" type="text" name="cpf" required inputMode="numeric" className="campo"
                value={formData.cpf} onChange={handleChange} onBlur={() => setCpfTocado(true)} placeholder="123.456.789-00"
                aria-invalid={cpfInvalido} aria-describedby={cpfInvalido ? 'cad-cpf-erro cad-cpf-ajuda' : 'cad-cpf-ajuda'}
              />
              {cpfInvalido && <span id="cad-cpf-erro" className="erro-campo"><AlertCircle size={14} aria-hidden="true" />CPF inválido: confira os 11 dígitos.</span>}
              <span id="cad-cpf-ajuda" className="ajuda">Usado só para validar sua identidade. Não aparece para os prestadores.</span>
            </div>
          </fieldset>

          <fieldset className="secao-form">
            <legend>2. Contato</legend>
            <div className="grade-campos">
              <div className="campo-grupo">
                <label htmlFor="cad-email" className="rotulo">E-mail</label>
                <input id="cad-email" type="email" name="email" required autoComplete="email" className="campo" value={formData.email} onChange={handleChange} placeholder="voce@email.com" />
              </div>
              <div className="campo-grupo">
                <label htmlFor="cad-tel" className="rotulo">Telefone / WhatsApp</label>
                <input id="cad-tel" type="tel" name="telefone" required autoComplete="tel" className="campo" value={formData.telefone} onChange={handleChange} placeholder="(16) 99876-5432" />
              </div>
            </div>
            <div className="campo-grupo">
              <label htmlFor="cad-end" className="rotulo">Endereço <span className="opcional">(opcional)</span></label>
              <input id="cad-end" type="text" name="endereco" autoComplete="street-address" className="campo" value={formData.endereco} onChange={handleChange} placeholder="Rua, número, bairro" aria-describedby="cad-end-ajuda" />
              <span id="cad-end-ajuda" className="ajuda">Você também informa o local em cada pedido, então pode deixar em branco.</span>
            </div>
          </fieldset>

          <fieldset className="secao-form">
            <legend>3. Acesso</legend>
            <div className="grade-campos">
              <div className="campo-grupo">
                <label htmlFor="cad-senha" className="rotulo">Senha</label>
                <input id="cad-senha" type="password" name="senha" required minLength={SENHA_MINIMA} autoComplete="new-password" className="campo" value={formData.senha} onChange={handleChange} aria-describedby="cad-senha-regra" />
                <span id="cad-senha-regra" className="ajuda" style={{ color: formData.senha && faltamNaSenha === 0 ? 'var(--success-strong)' : undefined }}>
                  {formData.senha === '' ? `No mínimo ${SENHA_MINIMA} caracteres.` : faltamNaSenha > 0 ? `Faltam ${faltamNaSenha} caracteres.` : 'Tamanho ok.'}
                </span>
              </div>
              <div className="campo-grupo">
                <label htmlFor="cad-senha2" className="rotulo">Confirmar senha</label>
                <input id="cad-senha2" type="password" name="confirmarSenha" required autoComplete="new-password" className="campo" value={formData.confirmarSenha} onChange={handleChange} aria-invalid={senhasDiferentes} aria-describedby={senhasDiferentes ? 'cad-senha2-erro' : undefined} />
                {senhasDiferentes && <span id="cad-senha2-erro" className="erro-campo"><AlertCircle size={14} aria-hidden="true" />As senhas não coincidem.</span>}
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
              {loading ? 'Criando conta...' : 'Criar minha conta'}
            </button>
            <span className="texto-apoio" style={{ textAlign: 'center' }}>Já tem conta? <Link href="/login" style={{ fontWeight: 600 }}>Entrar</Link></span>
          </div>
        </form>

        <aside className="lateral">
          <section className="card destaque empilhado" style={{ gap: '0.75rem' }}>
            <h2 className="titulo-cartao">Com a conta você pode</h2>
            <ul className="lista-simples" style={{ gap: '0.6rem', fontSize: '0.9rem', color: 'var(--text-body)' }}>
              {['Publicar pedidos com fotos', 'Comparar propostas lado a lado', 'Negociar valores pelo chat', 'Pagar com garantia e avaliar'].map((item) => (
                <li key={item} style={{ display: 'flex', gap: '0.5rem' }}><Check size={18} color="var(--success-strong)" aria-hidden="true" style={{ flexShrink: 0 }} />{item}</li>
              ))}
            </ul>
          </section>
          <section className="card" style={{ display: 'flex', gap: '0.75rem', alignItems: 'flex-start', background: 'transparent' }}>
            <Lock size={20} color="var(--brand-sky)" aria-hidden="true" style={{ flexShrink: 0 }} />
            <p className="texto-apoio" style={{ fontSize: '0.82rem', lineHeight: 1.55 }}>Sua senha é guardada com criptografia (bcrypt) e nunca é exibida. Você pode desativar a conta quando quiser, em Meu perfil › Desativar conta.</p>
          </section>
        </aside>
      </div>
    </Pagina>
  );
}
