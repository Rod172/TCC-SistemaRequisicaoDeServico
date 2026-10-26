/**
 * @file chatController.ts
 * @description Controller REST do chat privado entre Solicitante e um Prestador (US14), escopado por
 * proposta desde a US34 (liberado assim que a proposta é enviada, não só após o aceite). As mutações
 * (enviar mensagem, marcar como lida) também notificam em tempo real quem estiver conectado na sala
 * via Socket.io (`emitirParaSala`), evitando duplicar a regra de negócio no lado do WebSocket.
 *
 * BIBLIOTECAS UTILIZADAS:
 * 1. Express.js (^4.19.2): Manipulação de requisições e respostas HTTP.
 *    Doc Oficial: https://expressjs.com/pt-br/
 */

import { Request, Response } from 'express';
import chatService from '../services/chatService';
import { emitirParaSala } from '../sockets/chatSocket';
import HttpError from '../utils/HttpError';

function responderErro(res: Response, err: any) {
  if (err instanceof HttpError) {
    return res.status(err.status).json({ error: err.name, message: err.message });
  }
  return res.status(500).json({ error: 'Internal Server Error', message: err.message });
}

export class ChatController {
  /**
   * @openapi
   * /propostas/{propostaId}/mensagens:
   *   get:
   *     summary: Lista o histórico de mensagens do chat de uma proposta (US14/US34)
   *     tags:
   *       - Chat
   *     security:
   *       - bearerAuth: []
   *     parameters:
   *       - in: path
   *         name: propostaId
   *         required: true
   *         schema:
   *           type: string
   *     responses:
   *       200:
   *         description: Histórico de mensagens retornado com sucesso.
   *       403:
   *         description: Usuário não participa desta conversa.
   *       404:
   *         description: Proposta não encontrada.
   */
  async listarMensagens(req: Request, res: Response): Promise<Response> {
    try {
      const dados = await chatService.listarMensagens(req.params.propostaId, req.user!.id);
      const { proposta, solicitacao } = await chatService.verificarParticipante(req.params.propostaId, req.user!.id);
      return res.status(200).json({ data: dados, somente_leitura: proposta.status === 'RECUSADA' || solicitacao.status === 'CANCELADA' });
    } catch (err: any) {
      return responderErro(res, err);
    }
  }

  /**
   * @openapi
   * /propostas/{propostaId}/mensagens:
   *   post:
   *     summary: Envia uma mensagem de texto e/ou um anexo (imagem/PDF) no chat da proposta (US14/US15/US34)
   *     tags:
   *       - Chat
   *     security:
   *       - bearerAuth: []
   *     parameters:
   *       - in: path
   *         name: propostaId
   *         required: true
   *         schema:
   *           type: string
   *     requestBody:
   *       required: true
   *       content:
   *         multipart/form-data:
   *           schema:
   *             type: object
   *             properties:
   *               conteudo:
   *                 type: string
   *               anexo:
   *                 type: string
   *                 format: binary
   *     responses:
   *       201:
   *         description: Mensagem enviada com sucesso.
   *       403:
   *         description: Usuário não participa desta conversa.
   *       409:
   *         description: A proposta já foi recusada — conversa somente leitura.
   */
  async enviarMensagem(req: Request, res: Response): Promise<Response> {
    try {
      const arquivo = req.file
        ? { filename: req.file.filename, originalname: req.file.originalname }
        : undefined;
      const mensagem = await chatService.enviarMensagem(req.params.propostaId, req.user!.id, req.body.conteudo, arquivo);
      emitirParaSala(req.params.propostaId, 'nova-mensagem', mensagem);
      return res.status(201).json({ data: mensagem });
    } catch (err: any) {
      return responderErro(res, err);
    }
  }

  /**
   * @openapi
   * /propostas/{propostaId}/mensagens/lidas:
   *   patch:
   *     summary: Marca como lidas as mensagens recebidas no chat da proposta (US14)
   *     tags:
   *       - Chat
   *     security:
   *       - bearerAuth: []
   *     parameters:
   *       - in: path
   *         name: propostaId
   *         required: true
   *         schema:
   *           type: string
   *     responses:
   *       200:
   *         description: Mensagens marcadas como lidas.
   */
  async marcarComoLidas(req: Request, res: Response): Promise<Response> {
    try {
      const resultado = await chatService.marcarComoLidas(req.params.propostaId, req.user!.id);
      emitirParaSala(req.params.propostaId, 'mensagens-lidas', { lidoPor: req.user!.id });
      return res.status(200).json(resultado);
    } catch (err: any) {
      return responderErro(res, err);
    }
  }
}

export default new ChatController();
