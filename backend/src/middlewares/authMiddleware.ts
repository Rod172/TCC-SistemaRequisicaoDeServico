/**
 * @file authMiddleware.ts
 * @description Middleware para autenticação e validação do token JWT (JSON Web Token) nas rotas protegidas da API REST.
 * 
 * BIBLIOTECAS UTILIZADAS:
 * 1. JSON Web Token (^9.0.2): Verificação e decodificação do token RFC 7519.
 *    Doc Oficial: https://github.com/auth0/node-jsonwebtoken
 * 2. Express.js (^4.19.2): Interceptação de requisições HTTP.
 *    Doc Oficial: https://expressjs.com/pt-br/guide/using-middleware.html
 */

import { Request, Response, NextFunction } from 'express';
import { authenticateToken } from '../config/jwt';

export interface UserPayload {
  id: string;
  email: string;
  tipo_perfil: 'SOLICITANTE' | 'PRESTADOR' | 'ADMIN';
}

// Extensão do tipo Request do Express para incluir os dados do usuário autenticado
declare global {
  namespace Express {
    interface Request {
      user?: UserPayload;
    }
  }
}

export async function authMiddleware(req: Request, res: Response, next: NextFunction) {
  const authHeader = req.headers.authorization;

  if (!authHeader) {
    return res.status(401).json({
      error: 'Unauthorized',
      message: 'Token de autenticação não fornecido no cabeçalho Authorization.',
    });
  }

  // O formato esperado é "Bearer <token>"
  const parts = authHeader.split(' ');
  if (parts.length !== 2 || parts[0] !== 'Bearer') {
    return res.status(401).json({
      error: 'Unauthorized',
      message: 'Formato do token inválido. O formato correto é Bearer <token>.',
    });
  }

  const token = parts[1];

  try {
    const decoded = await authenticateToken(token);
    req.user = decoded;
    return next();
  } catch (err) {
    return res.status(401).json({
      error: 'Unauthorized',
      message: 'Token de autenticação inválido ou expirado.',
    });
  }
}

export default authMiddleware;
