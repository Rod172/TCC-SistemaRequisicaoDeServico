/**
 * @file oportunidadeRoutes.ts
 * @description Rotas REST do feed de oportunidades (US08, US09, US10). A listagem e o detalhe são
 * públicos (qualquer visitante pode navegar, como anúncios de um classificado); enviar proposta
 * exige login de verdade como Prestador/Admin.
 *
 * BIBLIOTECAS UTILIZADAS:
 * 1. Express.js Router (^4.19.2): Roteador do servidor web.
 *    Doc Oficial: https://expressjs.com/pt-br/4x/api-html#router
 */

import { Router } from 'express';
import oportunidadeController from '../controllers/oportunidadeController';
import authMiddleware from '../middlewares/authMiddleware';
import optionalAuthMiddleware from '../middlewares/optionalAuthMiddleware';

const oportunidadeRoutes = Router();

// US35: somente o profissional dono da proposta decide sobre a contraproposta.
oportunidadeRoutes.post('/oportunidades/:id/propostas/:propostaId/contraproposta/responder', authMiddleware,
  (req, res) => oportunidadeController.responderContraproposta(req, res));

// GET /api/v1/prestador/oportunidades — Feed de oportunidades abertas, público (US08)
oportunidadeRoutes.get('/oportunidades', optionalAuthMiddleware, (req, res) => oportunidadeController.listarOportunidades(req, res));

// GET /api/v1/prestador/oportunidades/:id — Detalhe da oportunidade, público (US09)
oportunidadeRoutes.get('/oportunidades/:id', optionalAuthMiddleware, (req, res) => oportunidadeController.buscarOportunidade(req, res));

// POST /api/v1/prestador/oportunidades/:id/propostas — Envio de proposta, exige login (US10)
oportunidadeRoutes.post('/oportunidades/:id/propostas', authMiddleware, (req, res) => oportunidadeController.enviarProposta(req, res));

// GET /api/v1/prestador/propostas — Painel "Minhas Propostas Enviadas", exige login (US28)
oportunidadeRoutes.get('/propostas', authMiddleware, (req, res) => oportunidadeController.listarMinhasPropostas(req, res));

// PATCH /api/v1/prestador/oportunidades/:id/desistir — Desistência do prestador contratado (US31)
oportunidadeRoutes.patch('/oportunidades/:id/desistir', authMiddleware, (req, res) => oportunidadeController.desistirContratacao(req, res));

export default oportunidadeRoutes;
