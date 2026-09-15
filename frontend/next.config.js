/**
 * @file next.config.js
 * @description Configuração do Next.js. `allowedDevOrigins` libera o servidor de desenvolvimento
 * pra aceitar requisições vindas de um domínio externo (ex.: túnel do Cloudflare usado pra
 * compartilhar a aplicação com terceiros durante testes) — sem isso, o Next.js bloqueia pedidos de
 * assets (`/_next/*`) que não venham de `localhost`, por proteção contra DNS rebinding.
 *
 * BIBLIOTECAS UTILIZADAS:
 * 1. Next.js (^14.2.3): Framework React para produção com App Router.
 *    Doc Oficial: https://nextjs.org/docs/app/api-reference/config/next-config-js/allowedDevOrigins
 */

/** @type {import('next').NextConfig} */
const nextConfig = {
  // Cobre qualquer túnel gerado pelo cloudflared (a URL muda a cada novo túnel).
  allowedDevOrigins: ['*.trycloudflare.com'],
};

module.exports = nextConfig;
