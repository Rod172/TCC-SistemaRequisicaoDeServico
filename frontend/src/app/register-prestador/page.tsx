'use client';

/**
 * @file register-prestador/page.tsx
 * @description Formulário de cadastro de Prestador de Serviço (Profissional) em Next.js 14 / React com TypeScript.
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
import { Briefcase, Mail, Shield, Phone, MapPin, Lock, CheckCircle, AlertCircle, ArrowLeft, FileText, Wrench, CheckSquare, Square } from 'lucide-react';
import api from '@/services/api';

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
    termoLgpdAceito: false,
  });

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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setSuccessMsg(null);

    if (foto && validarFoto(foto)) {
      setErrorMsg(validarFoto(foto));
      return;
    }
    setErroFoto(null);

    if (formData.senha !== formData.confirmarSenha) {
      setErrorMsg('As senhas digitadas não coincidem.');
      return;
    }

    if (categoriasSelecionadas.length === 0) {
      setErrorMsg('Selecione ao menos uma categoria de atuação profissional.');
      return;
    }

    if (!formData.termoLgpdAceito) {
      setErrorMsg('É necessário aceitar os termos de consentimento da LGPD para prosseguir.');
      return;
    }

    setLoading(true);

    try {
      const payload = {
        nome: formData.nome,
        email: formData.email,
        cnpj_cpf: formData.cnpjCpf,
        telefone: formData.telefone,
        endereco: formData.endereco,
        senha: formData.senha,
        descricao_bio: formData.descricaoBio,
        categorias: categoriasSelecionadas,
        termo_lgpd_aceito: formData.termoLgpdAceito,
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

  return (
    <main style={{ maxWidth: '750px', margin: '2rem auto', padding: '0 1.5rem' }}>
      <Link href="/" style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: '0.5rem',
        marginBottom: '1.5rem',
        color: 'var(--text-secondary)',
        fontSize: '0.9rem'
      }}>
        <ArrowLeft size={16} />
        Voltar para a página inicial
      </Link>

      <div style={{
        background: 'var(--card-bg)',
        border: '1px solid var(--card-border)',
        borderRadius: 'var(--border-radius)',
        padding: 'clamp(1.25rem, 6vw, 2.5rem) clamp(1rem, 5vw, 2rem)',
        boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.3)'
      }}>
        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <div style={{
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            width: '48px',
            height: '48px',
            borderRadius: '50%',
            background: 'rgba(16, 185, 129, 0.15)',
            color: 'var(--accent-color)',
            marginBottom: '1rem'
          }}>
            <Briefcase size={24} />
          </div>
          <h1 style={{ fontSize: '1.75rem', fontWeight: 700, marginBottom: '0.5rem' }}>
            Cadastro de Prestador de Serviço
          </h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.95rem' }}>
            Crie sua conta profissional para receber solicitações de clientes e enviar propostas comerciais.
          </p>
        </div>

        {errorMsg && (
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.75rem',
            background: 'rgba(239, 68, 68, 0.15)',
            border: '1px solid var(--danger-color)',
            color: '#fca5a5',
            padding: '1rem',
            borderRadius: '8px',
            marginBottom: '1.5rem',
            fontSize: '0.9rem'
          }}>
            <AlertCircle size={20} style={{ flexShrink: 0 }} />
            <span>{errorMsg}</span>
          </div>
        )}

        {successMsg && (
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.75rem',
            background: 'rgba(16, 185, 129, 0.15)',
            border: '1px solid var(--accent-color)',
            color: '#6ee7b7',
            padding: '1rem',
            borderRadius: '8px',
            marginBottom: '1.5rem',
            fontSize: '0.9rem'
          }}>
            <CheckCircle size={20} style={{ flexShrink: 0 }} />
            <span>{successMsg}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          <div>
            <label htmlFor="foto-prestador" style={{ display: 'block', fontSize: '0.875rem', marginBottom: '0.4rem', color: 'var(--text-secondary)' }}>Foto de perfil (opcional)</label>
            <p id="ajuda-foto-prestador" style={{ fontSize: '.85rem', color: 'var(--text-secondary)', marginBottom: 8 }}>JPEG, PNG ou WEBP, até 5 MB. A foto aparecerá no seu perfil público.</p>
            <input ref={fotoInput} id="foto-prestador" name="foto" type="file" accept="image/jpeg,image/png,image/webp" onChange={handleFoto} disabled={loading} aria-describedby="ajuda-foto-prestador erro-foto-prestador" aria-invalid={Boolean(erroFoto)} style={{ width: '100%', minWidth: 0 }} />
            {erroFoto && <p id="erro-foto-prestador" role="alert" style={{ color: '#fca5a5', marginTop: 8 }}>{erroFoto}</p>}
            {fotoPreview && <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: 12, marginTop: 12 }}>
              <img src={fotoPreview} alt="Prévia da foto de perfil selecionada" style={{ width: 96, height: 96, objectFit: 'cover', borderRadius: '50%' }} />
              <button type="button" disabled={loading} onClick={() => { setFoto(null); setErroFoto(null); if (fotoInput.current) fotoInput.current.value = ''; }} style={{ padding: '.65rem 1rem', background: 'var(--bg-color)', color: 'var(--text-primary)', border: '1px solid var(--card-border)', borderRadius: 8, cursor: 'pointer' }}>Remover foto</button>
            </div>}
          </div>
          {/* Nome ou Razão Social */}
          <div>
            <label style={{ display: 'block', fontSize: '0.875rem', marginBottom: '0.4rem', color: 'var(--text-secondary)' }}>
              Nome Completo ou Razão Social *
            </label>
            <div style={{ position: 'relative' }}>
              <Briefcase size={18} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#64748b' }} />
              <input
                type="text"
                name="nome"
                required
                value={formData.nome}
                onChange={handleChange}
                placeholder="Ex: Marcos Refrigeração & Elétrica"
                style={{
                  width: '100%',
                  padding: '0.75rem 0.75rem 0.75rem 2.5rem',
                  background: '#0f172a',
                  border: '1px solid #334155',
                  borderRadius: '8px',
                  color: '#fff',
                  fontSize: '0.95rem'
                }}
              />
            </div>
          </div>

          {/* E-mail e CPF/CNPJ */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '1rem' }}>
            <div>
              <label style={{ display: 'block', fontSize: '0.875rem', marginBottom: '0.4rem', color: 'var(--text-secondary)' }}>
                E-mail Comercial *
              </label>
              <div style={{ position: 'relative' }}>
                <Mail size={18} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#64748b' }} />
                <input
                  type="email"
                  name="email"
                  required
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="marcos@servicos.com"
                  style={{
                    width: '100%',
                    padding: '0.75rem 0.75rem 0.75rem 2.5rem',
                    background: '#0f172a',
                    border: '1px solid #334155',
                    borderRadius: '8px',
                    color: '#fff',
                    fontSize: '0.95rem'
                  }}
                />
              </div>
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '0.875rem', marginBottom: '0.4rem', color: 'var(--text-secondary)' }}>
                CPF ou CNPJ *
              </label>
              <div style={{ position: 'relative' }}>
                <Shield size={18} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#64748b' }} />
                <input
                  type="text"
                  name="cnpjCpf"
                  required
                  value={formData.cnpjCpf}
                  onChange={handleChange}
                  placeholder="12.345.678/0001-90"
                  style={{
                    width: '100%',
                    padding: '0.75rem 0.75rem 0.75rem 2.5rem',
                    background: '#0f172a',
                    border: '1px solid #334155',
                    borderRadius: '8px',
                    color: '#fff',
                    fontSize: '0.95rem'
                  }}
                />
              </div>
            </div>
          </div>

          {/* Telefone e Endereço */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '1rem' }}>
            <div>
              <label style={{ display: 'block', fontSize: '0.875rem', marginBottom: '0.4rem', color: 'var(--text-secondary)' }}>
                Telefone / WhatsApp Comercial *
              </label>
              <div style={{ position: 'relative' }}>
                <Phone size={18} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#64748b' }} />
                <input
                  type="text"
                  name="telefone"
                  required
                  value={formData.telefone}
                  onChange={handleChange}
                  placeholder="(16) 98765-4321"
                  style={{
                    width: '100%',
                    padding: '0.75rem 0.75rem 0.75rem 2.5rem',
                    background: '#0f172a',
                    border: '1px solid #334155',
                    borderRadius: '8px',
                    color: '#fff',
                    fontSize: '0.95rem'
                  }}
                />
              </div>
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '0.875rem', marginBottom: '0.4rem', color: 'var(--text-secondary)' }}>
                Endereço de Atendimento / Base
              </label>
              <div style={{ position: 'relative' }}>
                <MapPin size={18} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#64748b' }} />
                <input
                  type="text"
                  name="endereco"
                  value={formData.endereco}
                  onChange={handleChange}
                  placeholder="Av. Brasil, 500 - Ribeirão Preto, SP"
                  style={{
                    width: '100%',
                    padding: '0.75rem 0.75rem 0.75rem 2.5rem',
                    background: '#0f172a',
                    border: '1px solid #334155',
                    borderRadius: '8px',
                    color: '#fff',
                    fontSize: '0.95rem'
                  }}
                />
              </div>
            </div>
          </div>

          {/* Categorias de Atuação Profissional */}
          <div>
            <label style={{ display: 'block', fontSize: '0.875rem', marginBottom: '0.5rem', color: 'var(--text-secondary)' }}>
              Categorias de Atuação Profissional (Selecione uma ou mais) *
            </label>
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
              gap: '0.75rem',
              background: '#0f172a',
              padding: '1.25rem',
              borderRadius: '8px',
              border: '1px solid #334155'
            }}>
              {CATEGORIAS_DISPONIVEIS.map((cat) => {
                const isSelected = categoriasSelecionadas.includes(cat.id);
                return (
                  <button
                    type="button"
                    key={cat.id}
                    onClick={() => handleCategoriaToggle(cat.id)}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.5rem',
                      padding: '0.6rem 0.8rem',
                      borderRadius: '6px',
                      background: isSelected ? 'rgba(16, 185, 129, 0.15)' : '#1e293b',
                      border: isSelected ? '1px solid var(--accent-color)' : '1px solid #334155',
                      color: isSelected ? 'var(--accent-color)' : 'var(--text-secondary)',
                      cursor: 'pointer',
                      fontSize: '0.85rem',
                      textAlign: 'left',
                      transition: 'all 0.2s ease'
                    }}
                  >
                    {isSelected ? <CheckSquare size={16} /> : <Square size={16} />}
                    <span>{cat.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Descrição Profissional / Bio */}
          <div>
            <label style={{ display: 'block', fontSize: '0.875rem', marginBottom: '0.4rem', color: 'var(--text-secondary)' }}>
              Descrição Profissional / Resumo de Experiência
            </label>
            <textarea
              name="descricaoBio"
              rows={3}
              value={formData.descricaoBio}
              onChange={handleChange}
              placeholder="Descreva suas qualificações, anos de experiência e os tipos de serviços que executa..."
              style={{
                width: '100%',
                padding: '0.75rem',
                background: '#0f172a',
                border: '1px solid #334155',
                borderRadius: '8px',
                color: '#fff',
                fontSize: '0.95rem',
                fontFamily: 'inherit',
                resize: 'vertical'
              }}
            />
          </div>

          {/* Senha e Confirmar Senha */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '1rem' }}>
            <div>
              <label style={{ display: 'block', fontSize: '0.875rem', marginBottom: '0.4rem', color: 'var(--text-secondary)' }}>
                Senha *
              </label>
              <div style={{ position: 'relative' }}>
                <Lock size={18} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#64748b' }} />
                <input
                  type="password"
                  name="senha"
                  required
                  value={formData.senha}
                  onChange={handleChange}
                  placeholder="••••••••"
                  style={{
                    width: '100%',
                    padding: '0.75rem 0.75rem 0.75rem 2.5rem',
                    background: '#0f172a',
                    border: '1px solid #334155',
                    borderRadius: '8px',
                    color: '#fff',
                    fontSize: '0.95rem'
                  }}
                />
              </div>
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '0.875rem', marginBottom: '0.4rem', color: 'var(--text-secondary)' }}>
                Confirmar Senha *
              </label>
              <div style={{ position: 'relative' }}>
                <Lock size={18} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#64748b' }} />
                <input
                  type="password"
                  name="confirmarSenha"
                  required
                  value={formData.confirmarSenha}
                  onChange={handleChange}
                  placeholder="••••••••"
                  style={{
                    width: '100%',
                    padding: '0.75rem 0.75rem 0.75rem 2.5rem',
                    background: '#0f172a',
                    border: '1px solid #334155',
                    borderRadius: '8px',
                    color: '#fff',
                    fontSize: '0.95rem'
                  }}
                />
              </div>
            </div>
          </div>

          {/* Checkbox Termo LGPD */}
          <div style={{
            display: 'flex',
            alignItems: 'flex-start',
            gap: '0.75rem',
            background: '#0f172a',
            padding: '1rem',
            borderRadius: '8px',
            border: '1px solid #334155',
            marginTop: '0.5rem'
          }}>
            <input
              type="checkbox"
              id="termoLgpdAceito"
              name="termoLgpdAceito"
              checked={formData.termoLgpdAceito}
              onChange={handleChange}
              style={{ marginTop: '0.2rem', cursor: 'pointer', width: '18px', height: '18px' }}
            />
            <label htmlFor="termoLgpdAceito" style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', cursor: 'pointer', lineHeight: 1.4 }}>
              Concordo com o tratamento dos meus dados cadastrais e profissionais para divulgação de perfil e intermediação de propostas, em conformidade com a <strong>LGPD (Lei nº 13.709/2018)</strong>. *
            </label>
          </div>

          {/* Botão de Submissão */}
          <button
            type="submit"
            disabled={loading}
            style={{
              marginTop: '1rem',
              padding: '0.875rem',
              background: loading ? '#475569' : 'var(--accent-color)',
              color: '#fff',
              border: 'none',
              borderRadius: '8px',
              fontWeight: 600,
              fontSize: '1rem',
              cursor: loading ? 'not-allowed' : 'pointer',
              transition: 'background var(--transition-speed)'
            }}
          >
            {loading ? 'Cadastrando Prestador...' : 'Finalizar Cadastro de Prestador'}
          </button>
        </form>
      </div>
    </main>
  );
}
