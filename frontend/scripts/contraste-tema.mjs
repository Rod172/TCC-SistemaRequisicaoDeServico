/**
 * @file contraste-tema.mjs
 * @description Confere o contraste WCAG dos tokens de tema (US42) nos temas escuro e claro, lendo os
 * valores direto de `src/app/globals.css`. Testa os pares de uso real (texto sobre cada superfície,
 * chips, avisos, botões, foco e bordas de campo) e termina com código 1 se algum par ficar abaixo do
 * mínimo: 4,5:1 para texto e 3:1 para bordas de campo, foco e ícones (WCAG 1.4.3 e 1.4.11).
 * Cores com transparência (rgba) são compostas sobre o fundo indicado antes do cálculo.
 *
 * Uso: `node scripts/contraste-tema.mjs` (pasta frontend). Sem dependências: só Node.js nativo.
 * Fórmula: https://www.w3.org/TR/WCAG21/#dfn-contrast-ratio
 */
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';

// Comentários saem antes da leitura, para um texto como "--x: y" dentro deles não virar token.
const css = readFileSync(fileURLToPath(new URL('../src/app/globals.css', import.meta.url)), 'utf-8')
  .replace(/\/\*[\s\S]*?\*\//g, '');

function bloco(seletor) {
  const inicio = css.indexOf(`\n${seletor} {`);
  if (inicio < 0) throw new Error(`Bloco ${seletor} não encontrado no globals.css`);
  const fim = css.indexOf('\n}', inicio);
  return Object.fromEntries([...css.slice(inicio, fim).matchAll(/--([\w-]+):\s*([^;]+);/g)].map((m) => [m[1], m[2].trim()]));
}

const escuro = bloco(':root');
const temas = { escuro, claro: { ...escuro, ...bloco(':root[data-tema="claro"]') } };

function rgb(cor) {
  const hex = cor.match(/^#([0-9a-f]{6}|[0-9a-f]{3})$/i);
  if (hex) {
    const h = hex[1].length === 3 ? [...hex[1]].map((c) => c + c).join('') : hex[1];
    return { r: parseInt(h.slice(0, 2), 16), g: parseInt(h.slice(2, 4), 16), b: parseInt(h.slice(4, 6), 16), a: 1 };
  }
  const m = cor.match(/^rgba\(\s*(\d+),\s*(\d+),\s*(\d+),\s*([\d.]+)\s*\)$/);
  if (m) return { r: +m[1], g: +m[2], b: +m[3], a: +m[4] };
  throw new Error(`Cor não suportada: ${cor}`);
}

/** Compõe uma cor (possivelmente translúcida) sobre um fundo opaco. */
function compor(frente, fundo) {
  const f = rgb(frente), b = rgb(fundo);
  return { r: f.r * f.a + b.r * (1 - f.a), g: f.g * f.a + b.g * (1 - f.a), b: f.b * f.a + b.b * (1 - f.a) };
}

function luminancia({ r, g, b }) {
  const canal = (c) => { c /= 255; return c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4; };
  return 0.2126 * canal(r) + 0.7152 * canal(g) + 0.0722 * canal(b);
}

function razao(frente, fundo, base) {
  const fundoOpaco = compor(fundo, base);
  const fundoHex = `#${[fundoOpaco.r, fundoOpaco.g, fundoOpaco.b].map((c) => Math.round(c).toString(16).padStart(2, '0')).join('')}`;
  const [a, b] = [luminancia(compor(frente, fundoHex)), luminancia(fundoOpaco)].sort((x, y) => y - x);
  return (a + 0.05) / (b + 0.05);
}

const TEXTO = 4.5, NAO_TEXTO = 3;
const SUPERFICIES = ['bg-color', 'bg-highlight', 'card-bg'];
// [frente, fundo, mínimo, fundo opaco por baixo quando o fundo é translúcido]
const pares = [
  ...['text-primary', 'text-body', 'text-secondary', 'text-muted', 'link-color', 'brand-sky', 'success-strong',
    'warning-strong', 'danger-text', 'accent-color'].flatMap((t) => SUPERFICIES.map((s) => [t, s, TEXTO])),
  ...['field-border', 'focus-ring', 'accent-indigo'].flatMap((t) => SUPERFICIES.map((s) => [t, s, NAO_TEXTO])),
  ['on-primary', 'primary-color', TEXTO], ['on-primary', 'primary-hover', TEXTO], ['on-primary', 'danger-color', TEXTO],
  ['sky-text', 'sky-bg', TEXTO], ['brand-sky', 'sky-bg', TEXTO],
  ['success-text', 'success-bg', TEXTO], ['warning-text', 'warning-bg', TEXTO], ['danger-text', 'danger-bg', TEXTO], ['info-text', 'info-bg', TEXTO],
  ['link-color', 'primary-tint', TEXTO, 'card-bg'], ['text-primary', 'primary-tint-soft', TEXTO, 'card-bg'],
  ['success-strong', 'success-tint', TEXTO, 'card-bg'], ['warning-strong', 'warning-tint', TEXTO, 'card-bg'],
  ['danger-text', 'danger-tint', TEXTO, 'card-bg'], ['danger-strong', 'danger-tint', TEXTO, 'card-bg'], ['violet-text', 'violet-tint', TEXTO, 'card-bg'],
  ['text-body', 'neutral-tint', TEXTO, 'card-bg'], ['sky-text', 'sky-tint', TEXTO, 'card-bg'],
  ['warning-soft-text', 'warning-border', TEXTO], ['text-body', 'card-border', TEXTO],
  ['text-primary', 'bg-inset', TEXTO],
  // Tokens criados na etapa 2 (telas)
  ['on-accent', 'accent-color', TEXTO], ['violet-strong', 'card-bg', TEXTO], ['info-text', 'primary-tint', TEXTO, 'card-bg'],
  ['link-color', 'primary-tint-strong', TEXTO, 'card-bg'], ['text-primary', 'primary-tint-strong', TEXTO, 'card-bg'],
  ...['success-soft-text', 'text-primary', 'text-secondary'].flatMap((t) => ['bg-raised', 'bg-sunken'].map((s) => [t, s, TEXTO])),
  ...SUPERFICIES.map((s) => ['success-soft-text', s, TEXTO]),
  ['text-secondary', 'neutral-tint-soft', TEXTO, 'bg-sunken'], ['on-overlay-media', 'overlay-media', TEXTO, 'bg-color'],
];

let falhas = 0;
for (const [nome, t] of Object.entries(temas)) {
  console.log(`\nTema ${nome}`);
  for (const [frente, fundo, minimo, base] of pares) {
    // Fundo translúcido: compõe sobre a superfície indicada; fundo opaco: ele mesmo.
    const r = razao(t[frente], t[fundo], t[fundo].startsWith('rgba') ? t[base ?? 'card-bg'] : t[fundo]);
    const ok = r >= minimo;
    if (!ok) falhas += 1;
    console.log(`${ok ? '  ok   ' : '  FALHA'} ${r.toFixed(2).padStart(5)}:1  --${frente} sobre --${fundo}${base ? ` (sobre --${base})` : ''}  [mín. ${minimo}]`);
  }
}
console.log(falhas ? `\n${falhas} par(es) abaixo do mínimo.` : '\nTodos os pares passam nos dois temas.');
process.exit(falhas ? 1 : 0);
