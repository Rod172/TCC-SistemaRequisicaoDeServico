'use client';

/**
 * @file Cabecalho.tsx
 * @description Cabeçalho compartilhado por todas as telas (US39), extraído da página inicial (US38).
 * Para o visitante: logo, "Como funciona", "Para prestadores", "Entrar" e "Criar conta". Para quem
 * está logado: busca adequada ao perfil, links do perfil (com o da seção atual destacado), sino de
 * notificações, menu da conta e "Nova solicitação".
 *
 * BIBLIOTECAS UTILIZADAS:
 * 1. Lucide React (^0.383.0): Ícones de busca e de nova solicitação.
 *    Doc Oficial: https://lucide.dev/
 * 2. Next.js (^14.2.3): Navegação com `Link`, `useRouter` e `usePathname`.
 *    Doc Oficial: https://nextjs.org/docs
 */

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { PlusCircle, Search } from 'lucide-react';
import NotificationBell from '@/components/NotificationBell';
import Logo from '@/components/Logo';
import MenuConta from '@/components/MenuConta';

interface UsuarioSessao {
  nome: string;
  tipo_perfil?: string;
}

const estiloLinkNav: React.CSSProperties = {
  display: 'inline-flex', alignItems: 'center', minHeight: '44px', padding: '0 0.6rem',
  color: 'var(--text-secondary)', fontSize: '0.88rem', fontWeight: 600, textDecoration: 'none',
};

const estiloLinkAtivo: React.CSSProperties = {
  ...estiloLinkNav, color: 'var(--text-primary)', boxShadow: 'inset 0 -2px 0 var(--accent-indigo)',
};

interface CabecalhoProps {
  /** Chamado depois de sair da conta. Sem ele, o cabeçalho volta para a página inicial. */
  onSair?: () => void;
}

export default function Cabecalho({ onSair }: CabecalhoProps) {
  const router = useRouter();
  const pathname = usePathname();
  const [usuario, setUsuario] = useState<UsuarioSessao | null>(null);
  // Evita mostrar por um instante os botões de visitante para quem já está logado.
  const [sessaoVerificada, setSessaoVerificada] = useState(false);
  const [busca, setBusca] = useState('');

  useEffect(() => {
    const userRaw = localStorage.getItem('@ServicoFacil:user');
    if (userRaw && localStorage.getItem('@ServicoFacil:token')) {
      try {
        setUsuario(JSON.parse(userRaw));
      } catch {
        setUsuario(null);
      }
    }
    setSessaoVerificada(true);
  }, []);

  function sair() {
    localStorage.removeItem('@ServicoFacil:token');
    localStorage.removeItem('@ServicoFacil:user');
    setUsuario(null);
    if (onSair) onSair();
    else router.push('/');
  }

  const isAdmin = usuario?.tipo_perfil === 'ADMIN';
  const isPrestador = usuario?.tipo_perfil === 'PRESTADOR';

  // A busca leva pra listagem certa de cada perfil: o solicitante busca nas próprias solicitações, o
  // prestador e o admin buscam no feed de oportunidades (a listagem com busca textual mais abrangente).
  const destinoBusca = isPrestador || isAdmin ? '/oportunidades' : '/minhas-solicitacoes';
  const placeholderBusca = isPrestador || isAdmin ? 'Buscar oportunidades abertas...' : 'Buscar nas minhas solicitações...';

  // Qualquer perfil logado pode publicar e ver as próprias solicitações (US33).
  const linksPerfil = [
    ...(isPrestador || isAdmin ? [{ href: '/oportunidades', rotulo: 'Oportunidades' }, { href: '/minhas-propostas', rotulo: 'Minhas propostas' }] : []),
    { href: '/minhas-solicitacoes', rotulo: 'Minhas solicitações' },
    ...(isAdmin ? [{ href: '/admin', rotulo: 'Painel Admin' }] : []),
  ];
  const ativo = (href: string) => pathname === href || pathname.startsWith(`${href}/`);

  function handleBuscar(e: React.FormEvent) {
    e.preventDefault();
    const query = busca.trim();
    router.push(query ? `${destinoBusca}?busca=${encodeURIComponent(query)}` : destinoBusca);
  }

  return (
    <header style={{ borderBottom: '1px solid var(--card-border)', background: 'var(--header-bg)', backdropFilter: 'blur(8px)' }}>
      <div style={{
        maxWidth: '1200px', margin: '0 auto', padding: '0.7rem 1.5rem',
        display: 'flex', alignItems: 'center', gap: '1rem', flexWrap: 'wrap', rowGap: '0.6rem',
      }}>
        <Link href="/" aria-label="Eloserv — página inicial" style={{ display: 'inline-flex', alignItems: 'center', textDecoration: 'none', flexShrink: 0 }}>
          <Logo tamanho={34} corFundo="var(--header-solid)" />
        </Link>

        {sessaoVerificada && usuario && (
          <form onSubmit={handleBuscar} role="search" style={{ flex: '1 1 180px', maxWidth: '320px', minWidth: '150px', position: 'relative' }}>
            <label htmlFor="busca-cabecalho" className="sr-only">{placeholderBusca}</label>
            <Search size={16} aria-hidden="true" style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-secondary)' }} />
            <input
              id="busca-cabecalho" type="search" value={busca} onChange={(e) => setBusca(e.target.value)} placeholder={placeholderBusca}
              style={{
                width: '100%', height: '44px', padding: '0 0.75rem 0 2.3rem',
                background: 'var(--card-bg)', border: '1px solid var(--card-border)', borderRadius: '10px',
                color: 'var(--text-primary)', fontSize: '0.875rem',
              }}
            />
          </form>
        )}

        {sessaoVerificada && (
          <nav aria-label="Principal" style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', marginLeft: 'auto', flexWrap: 'wrap', rowGap: '0.4rem' }}>
            {usuario ? (
              <>
                {/* Em telas estreitas estes links saem da barra e aparecem no menu da conta.
                    "Meu painel" fica sempre no menu, para o cabeçalho do prestador caber numa linha. */}
                {linksPerfil.map((link) => (
                  <Link
                    key={link.href} href={link.href} className="so-telas-largas"
                    aria-current={ativo(link.href) ? 'page' : undefined}
                    style={ativo(link.href) ? estiloLinkAtivo : estiloLinkNav}
                  >
                    {link.rotulo}
                  </Link>
                ))}
                <NotificationBell />
                <MenuConta nome={usuario.nome} onSair={sair} linksTelaEstreita={linksPerfil} />
                <Link href="/nova-solicitacao" className="btn btn-primario" style={{ marginLeft: '0.35rem' }}>
                  <PlusCircle size={16} aria-hidden="true" /> Nova solicitação
                </Link>
              </>
            ) : (
              <>
                {/* Âncoras escondidas no celular: a página inicial já leva a essas seções rolando. */}
                <a href="/#como-funciona" className="so-telas-largas" style={estiloLinkNav}>Como funciona</a>
                <a href="/#prestadores" className="so-telas-largas" style={estiloLinkNav}>Para prestadores</a>
                <Link href="/login" style={{ ...estiloLinkNav, color: 'var(--text-primary)' }}>Entrar</Link>
                <Link href="/register-solicitante" className="btn btn-primario" style={{ marginLeft: '0.35rem' }}>Criar conta</Link>
              </>
            )}
          </nav>
        )}
      </div>
    </header>
  );
}
