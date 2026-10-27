/**
 * @file tema.ts
 * @description Preferência de tema da interface (US42): Automático (segue o sistema operacional),
 * Claro ou Escuro. O tema efetivo vai para o atributo `data-tema` do <html>, que ativa os tokens do
 * globals.css. "Automático" é a ausência de escolha salva, então quem nunca escolheu segue o sistema.
 * O `SCRIPT_TEMA_INICIAL` roda no <head>, antes da primeira pintura, para a página não piscar no
 * tema errado; as demais funções são usadas pelos componentes depois que a página carrega.
 *
 * BIBLIOTECAS UTILIZADAS: nenhuma. APIs nativas do navegador:
 * 1. Web Storage (localStorage): guarda a escolha. Doc: https://developer.mozilla.org/pt-BR/docs/Web/API/Window/localStorage
 * 2. matchMedia + prefers-color-scheme: preferência do sistema. Doc: https://developer.mozilla.org/pt-BR/docs/Web/CSS/@media/prefers-color-scheme
 */

export type PreferenciaTema = 'automatico' | 'claro' | 'escuro';
export type Tema = 'claro' | 'escuro';

/** Mesmo prefixo das outras chaves do navegador (`@ServicoFacil:token`, `@ServicoFacil:user`). */
export const CHAVE_TEMA = '@ServicoFacil:tema';
/** Avisa os seletores abertos (menu da conta, rodapé) quando a escolha muda. */
export const EVENTO_TEMA = 'eloserv:tema';
const CONSULTA_CLARO = '(prefers-color-scheme: light)';

export function lerPreferencia(): PreferenciaTema {
  try {
    const valor = window.localStorage.getItem(CHAVE_TEMA);
    return valor === 'claro' || valor === 'escuro' ? valor : 'automatico';
  } catch {
    // Navegador sem armazenamento (modo privado restrito): segue o sistema.
    return 'automatico';
  }
}

export function resolverTema(preferencia: PreferenciaTema): Tema {
  if (preferencia !== 'automatico') return preferencia;
  try {
    return window.matchMedia(CONSULTA_CLARO).matches ? 'claro' : 'escuro';
  } catch {
    return 'escuro';
  }
}

/** Aplica o tema no <html> e acerta a cor da barra do navegador no celular (meta theme-color). */
export function aplicarTema(preferencia: PreferenciaTema): Tema {
  const tema = resolverTema(preferencia);
  const raiz = document.documentElement;
  raiz.setAttribute('data-tema', tema);
  const cor = getComputedStyle(raiz).getPropertyValue('--bg-color').trim();
  if (cor) {
    let meta = document.querySelector('meta[name="theme-color"]');
    if (!meta) {
      meta = document.createElement('meta');
      meta.setAttribute('name', 'theme-color');
      document.head.appendChild(meta);
    }
    meta.setAttribute('content', cor);
  }
  return tema;
}

/** Salva a escolha do usuário, aplica e avisa os outros seletores da página. */
export function escolherTema(preferencia: PreferenciaTema) {
  try {
    if (preferencia === 'automatico') window.localStorage.removeItem(CHAVE_TEMA);
    else window.localStorage.setItem(CHAVE_TEMA, preferencia);
  } catch {
    // Sem armazenamento, a escolha vale só até recarregar a página.
  }
  aplicarTema(preferencia);
  window.dispatchEvent(new CustomEvent<PreferenciaTema>(EVENTO_TEMA, { detail: preferencia }));
}

export function consultaTemaDoSistema(): MediaQueryList | null {
  try {
    return window.matchMedia(CONSULTA_CLARO);
  } catch {
    return null;
  }
}

/**
 * Script do <head>: a mesma regra de `lerPreferencia` + `resolverTema`, em JavaScript puro e sem
 * dependências, porque roda antes do React e antes da primeira pintura.
 */
export const SCRIPT_TEMA_INICIAL = `(function(){var p;try{p=localStorage.getItem(${JSON.stringify(CHAVE_TEMA)});}catch(e){}`
  + `var t=p==='claro'||p==='escuro'?p:'escuro';`
  + `if(t!==p){try{if(window.matchMedia(${JSON.stringify(CONSULTA_CLARO)}).matches)t='claro';}catch(e){}}`
  + `document.documentElement.setAttribute('data-tema',t);})();`;
