/**
 * @file optionalAuthMiddleware.ts
 * @description Middleware de autenticação OPCIONAL: decodifica o token JWT e popula `req.user`
 * quando o cabeçalho `Authorization` está presente e válido, mas nunca bloqueia a requisição —
 * usado em rotas de visualização pública (ex.: feed de oportunidades), onde qualquer visitante
 * pode navegar, mas ações (como enviar proposta) continuam exigindo login de verdade via
 * `authMiddleware`.
 *
 * BIBLIOTECAS UTILIZADAS:
 * 1. JSON Web Token (^9.0.2): Verificação e decodificação do token RFC 7519.
 *    Doc Oficial: https://github.com/auth0/node-jsonwebtoken
 * 2. Express.js (^4.19.2): Interceptação de requisições HTTP.
 *    Doc Oficial: https://expressjs.com/pt-br/guide/using-middleware.html
 */

import { Request, Response, NextFunction } from 'express';
import { authenticateToken } from '../config/jwt';

export async function optionalAuthMiddleware(req: Request, _res: Response, next: NextFunction) {
  delete req.user;
  const authHeader = req.headers.authorization;
  if (!authHeader) return next();

  const parts = authHeader.split(' ');
  if (parts.length !== 2 || parts[0] !== 'Bearer') return next();

  try {
    req.user = await authenticateToken(parts[1]);
  } catch {
    // Token ausente/expirado/inválido: segue como visitante anônimo em vez de bloquear.
  }
  return next();
}

export default optionalAuthMiddleware;
