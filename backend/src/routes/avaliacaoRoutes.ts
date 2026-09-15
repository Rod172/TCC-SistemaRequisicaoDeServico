/**
 * @file avaliacaoRoutes.ts
 * @description Rotas REST da avaliação de satisfação do serviço (US18), protegidas por JWT.
 *
 * BIBLIOTECAS UTILIZADAS:
 * 1. Express.js Router (^4.19.2): Roteador do servidor web.
 *    Doc Oficial: https://expressjs.com/pt-br/4x/api-html#router
 */

import { Router } from 'express';
import avaliacaoController from '../controllers/avaliacaoController';
import authMiddleware from '../middlewares/authMiddleware';

const avaliacaoRoutes = Router();

avaliacaoRoutes.use(authMiddleware);

// POST /api/v1/solicitacoes/:id/avaliar — Solicitante avalia o serviço concluído (US18)
avaliacaoRoutes.post('/:id/avaliar', (req, res) => avaliacaoController.avaliar(req, res));

// GET /api/v1/solicitacoes/:id/avaliacao — Busca a avaliação existente, se houver (US18)
avaliacaoRoutes.get('/:id/avaliacao', (req, res) => avaliacaoController.buscarPorSolicitacao(req, res));

export default avaliacaoRoutes;
