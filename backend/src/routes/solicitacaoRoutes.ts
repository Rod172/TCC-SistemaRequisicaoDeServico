/**
 * @file solicitacaoRoutes.ts
 * @description Rotas REST do painel "Minhas Solicitações" (US06, US11, US12), todas protegidas por JWT.
 *
 * BIBLIOTECAS UTILIZADAS:
 * 1. Express.js Router (^4.19.2): Roteador do servidor web.
 *    Doc Oficial: https://expressjs.com/pt-br/4x/api-html#router
 */

import { Router } from 'express';
import solicitacaoController from '../controllers/solicitacaoController';
import authMiddleware from '../middlewares/authMiddleware';

const solicitacaoRoutes = Router();

solicitacaoRoutes.use(authMiddleware);

// GET /api/v1/solicitacoes/minhas — Painel "Minhas Solicitações" (US06)
solicitacaoRoutes.get('/minhas', (req, res) => solicitacaoController.listarMinhas(req, res));

// GET /api/v1/solicitacoes/minhas/:id/propostas — Comparação de propostas (US11)
solicitacaoRoutes.get('/minhas/:id/propostas', (req, res) => solicitacaoController.buscarComPropostas(req, res));

// PATCH /api/v1/solicitacoes/minhas/:id/propostas/:propostaId/status — Aceite/recusa (US12)
solicitacaoRoutes.patch('/minhas/:id/propostas/:propostaId/status', (req, res) =>
  solicitacaoController.atualizarStatusProposta(req, res)
);

// POST /api/v1/solicitacoes/minhas/:id/propostas/:propostaId/renegociar — Contraproposta
solicitacaoRoutes.post('/minhas/:id/propostas/:propostaId/renegociar', (req, res) =>
  solicitacaoController.renegociarProposta(req, res)
);

export default solicitacaoRoutes;
