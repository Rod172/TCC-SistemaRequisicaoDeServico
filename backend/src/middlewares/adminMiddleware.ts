/**
 * @file adminMiddleware.ts
 * @description Middleware que restringe o acesso às rotas administrativas (US27) a usuários com
 * `tipo_perfil = ADMIN`. Deve ser usado sempre depois do `authMiddleware` na cadeia de rotas.
 *
 * BIBLIOTECAS UTILIZADAS:
 * 1. Express.js (^4.19.2): Interceptação de requisições HTTP.
 *    Doc Oficial: https://expressjs.com/pt-br/guide/using-middleware.html
 */

import { Request, Response, NextFunction } from 'express';

export function adminMiddleware(req: Request, res: Response, next: NextFunction) {
  if (req.user?.tipo_perfil !== 'ADMIN') {
    return res.status(403).json({
      error: 'Forbidden',
      message: 'Apenas administradores podem acessar este recurso.',
    });
  }
  return next();
}

export default adminMiddleware;
