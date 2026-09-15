/**
 * @file chatRoutes.ts
 * @description Rotas REST do chat privado por proposta (US14/US34), protegidas por JWT. Montadas em
 * `/api/v1/propostas` — desde a US34 o chat é escopado pela proposta (liberado assim que ela é
 * enviada), não mais pela solicitação inteira.
 *
 * BIBLIOTECAS UTILIZADAS:
 * 1. Express.js Router (^4.19.2): Roteador do servidor web.
 *    Doc Oficial: https://expressjs.com/pt-br/4x/api-html#router
 */

import { Router } from 'express';
import chatController from '../controllers/chatController';
import authMiddleware from '../middlewares/authMiddleware';
import uploadAnexoChat from '../middlewares/uploadAnexoChatMiddleware';

const chatRoutes = Router();

chatRoutes.use(authMiddleware);

// GET /api/v1/propostas/:propostaId/mensagens — Histórico do chat (US14/US34)
chatRoutes.get('/:propostaId/mensagens', (req, res) => chatController.listarMensagens(req, res));

// POST /api/v1/propostas/:propostaId/mensagens — Enviar mensagem, com anexo opcional (US14/US15/US34)
chatRoutes.post('/:propostaId/mensagens', uploadAnexoChat.single('anexo'), (req, res) =>
  chatController.enviarMensagem(req, res)
);

// PATCH /api/v1/propostas/:propostaId/mensagens/lidas — Marcar como lidas (US14)
chatRoutes.patch('/:propostaId/mensagens/lidas', (req, res) => chatController.marcarComoLidas(req, res));

export default chatRoutes;
