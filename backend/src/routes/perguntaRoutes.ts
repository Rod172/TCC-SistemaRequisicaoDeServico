/**
 * @file perguntaRoutes.ts
 * @description Rotas REST do Q&A público de uma solicitação (US29), protegidas por JWT (a leitura já
 * vem embutida no detalhe público da oportunidade/solicitação — aqui só ficam as mutações).
 *
 * BIBLIOTECAS UTILIZADAS:
 * 1. Express.js Router (^4.19.2): Roteador do servidor web.
 *    Doc Oficial: https://expressjs.com/pt-br/4x/api-html#router
 */

import { Router } from 'express';
import perguntaController from '../controllers/perguntaController';
import authMiddleware from '../middlewares/authMiddleware';

const perguntaRoutes = Router();

perguntaRoutes.use(authMiddleware);

// POST /api/v1/solicitacoes/:id/perguntas — Prestador pergunta (US29)
perguntaRoutes.post('/:id/perguntas', (req, res) => perguntaController.perguntar(req, res));

// PATCH /api/v1/solicitacoes/:id/perguntas/:perguntaId/responder — Solicitante responde (US29)
perguntaRoutes.patch('/:id/perguntas/:perguntaId/responder', (req, res) => perguntaController.responder(req, res));

export default perguntaRoutes;
