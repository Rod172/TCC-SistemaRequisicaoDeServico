/**
 * @file abas.ts
 * @description Abas da página de arquitetura (US41) e o arquivo de `docs/diagramas` de cada uma.
 * A lista também serve de whitelist: só esses arquivos podem ser lidos pela página.
 */

export interface AbaArquitetura { id: string; rotulo: string; arquivo: string }

export const ABAS_ARQUITETURA: AbaArquitetura[] = [
  { id: 'visao-geral', rotulo: 'Visão geral', arquivo: 'README.md' },
  { id: 'casos-de-uso', rotulo: 'Casos de uso', arquivo: 'casos-de-uso.md' },
  { id: 'classes', rotulo: 'Classes', arquivo: 'classes.md' },
  { id: 'mer', rotulo: 'MER', arquivo: 'mer.md' },
  { id: 'sequencia', rotulo: 'Sequência da contratação', arquivo: 'sequencia-contratacao.md' },
];

export function abaDoArquivo(arquivo: string) {
  return ABAS_ARQUITETURA.find((a) => a.arquivo === arquivo)?.id;
}
