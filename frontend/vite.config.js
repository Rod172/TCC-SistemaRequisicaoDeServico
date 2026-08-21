/**
 * Configuração do Bundler Vite para o Frontend React
 * 
 * Bibliotecas de Terceiros Utilizadas:
 * - vite: Ferramenta de build extremamente rápida para aplicações web modernas.
 *   Doc: https://vitejs.dev
 * - @vitejs/plugin-react: Plugin oficial para suporte a JSX/React no Vite.
 *   Doc: https://github.com/vitejs/vite-plugin-react
 */

import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  server: {
    port: 3000,
    open: true
  }
});
