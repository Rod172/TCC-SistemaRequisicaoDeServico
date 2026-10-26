/** US40: arquivo publicado imutável. Acrescente versões ao mapa, preservando as anteriores. */
import publicado from './legal/2026-10-26.1.json';
import documentos from './documentos-legais.json';
export const publicacoes: Record<string, typeof publicado> = { '2026-10-26.1': publicado };
export const termos = publicacoes[documentos.versao_termos].termos;
export const privacidade = publicacoes[documentos.versao_privacidade].privacidade;
