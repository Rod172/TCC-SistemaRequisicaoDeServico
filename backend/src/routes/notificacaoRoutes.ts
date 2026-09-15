/**
 * @file notificacaoRoutes.ts
 * @description Rotas REST das notificações internas do usuário (US16), protegidas por JWT.
 *
 * BIBLIOTECAS UTILIZADAS:
 * 1. Express.js Router (^4.19.2): Roteador do servidor web.
 *    Doc Oficial: https://expressjs.com/pt-br/4x/api-html#router
 */

import { Router } from 'express';
import notificacaoController from '../controllers/notificacaoController';
import authMiddleware from '../middlewares/authMiddleware';

const notificacaoRoutes = Router();

notificacaoRoutes.use(authMiddleware);

// GET /api/v1/notificacoes — Lista as notificações do usuário autenticado (US16)
notificacaoRoutes.get('/', (req, res) => notificacaoController.listarMinhas(req, res));

// PATCH /api/v1/notificacoes/lidas — Marca todas como lidas
notificacaoRoutes.patch('/lidas', (req, res) => notificacaoController.marcarTodasComoLidas(req, res));

// PATCH /api/v1/notificacoes/:id/lida — Marca uma notificação como lida
notificacaoRoutes.patch('/:id/lida', (req, res) => notificacaoController.marcarComoLida(req, res));

export default notificacaoRoutes;
