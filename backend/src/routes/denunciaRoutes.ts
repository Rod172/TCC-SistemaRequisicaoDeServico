/**
 * @file denunciaRoutes.ts
 * @description Rota REST da denúncia de solicitação (US32), protegida por JWT.
 *
 * BIBLIOTECAS UTILIZADAS:
 * 1. Express.js Router (^4.19.2): Roteador do servidor web.
 *    Doc Oficial: https://expressjs.com/pt-br/4x/api-html#router
 */

import { Router } from 'express';
import denunciaController from '../controllers/denunciaController';
import authMiddleware from '../middlewares/authMiddleware';

const denunciaRoutes = Router();

denunciaRoutes.use(authMiddleware);

// POST /api/v1/solicitacoes/:id/denunciar — Denuncia uma solicitação (US32)
denunciaRoutes.post('/:id/denunciar', (req, res) => denunciaController.denunciar(req, res));

export default denunciaRoutes;
