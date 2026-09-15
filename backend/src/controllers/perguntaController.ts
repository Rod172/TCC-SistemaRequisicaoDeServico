/**
 * @file perguntaController.ts
 * @description Controller REST do Q&A público de uma solicitação (US29).
 *
 * BIBLIOTECAS UTILIZADAS:
 * 1. Express.js (^4.19.2): Manipulação de requisições e respostas HTTP.
 *    Doc Oficial: https://expressjs.com/pt-br/
 */

import { Request, Response } from 'express';
import perguntaService from '../services/perguntaService';
import HttpError from '../utils/HttpError';

function responderErro(res: Response, err: any) {
  if (err instanceof HttpError) {
    return res.status(err.status).json({ error: err.name, message: err.message });
  }
  return res.status(500).json({ error: 'Internal Server Error', message: err.message });
}

export class PerguntaController {
  /**
   * @openapi
   * /solicitacoes/{id}/perguntas:
   *   post:
   *     summary: Prestador faz uma pergunta pública sobre a solicitação, mesmo sem ter enviado proposta (US29)
   *     tags:
   *       - Perguntas e Respostas
   *     security:
   *       - bearerAuth: []
   *     parameters:
   *       - in: path
   *         name: id
   *         required: true
   *         schema:
   *           type: string
   *     requestBody:
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *             type: object
   *             required:
   *               - pergunta
   *             properties:
   *               pergunta:
   *                 type: string
   *     responses:
   *       201:
   *         description: Pergunta registrada com sucesso.
   *       403:
   *         description: Apenas prestadores podem perguntar.
   */
  async perguntar(req: Request, res: Response): Promise<Response | void> {
    if (!['PRESTADOR', 'ADMIN'].includes(req.user!.tipo_perfil)) {
      return res.status(403).json({ error: 'Forbidden', message: 'Apenas prestadores podem fazer perguntas.' });
    }
    try {
      const dados = await perguntaService.perguntar(req.params.id, req.user!.id, req.body.pergunta);
      return res.status(201).json({ data: dados });
    } catch (err: any) {
      return responderErro(res, err);
    }
  }

  /**
   * @openapi
   * /solicitacoes/{id}/perguntas/{perguntaId}/responder:
   *   patch:
   *     summary: Solicitante dono responde uma pergunta feita na sua solicitação (US29)
   *     tags:
   *       - Perguntas e Respostas
   *     security:
   *       - bearerAuth: []
   *     parameters:
   *       - in: path
   *         name: id
   *         required: true
   *         schema:
   *           type: string
   *       - in: path
   *         name: perguntaId
   *         required: true
   *         schema:
   *           type: string
   *     requestBody:
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *             type: object
   *             required:
   *               - resposta
   *             properties:
   *               resposta:
   *                 type: string
   *     responses:
   *       200:
   *         description: Resposta registrada com sucesso.
   *       404:
   *         description: Solicitação ou pergunta não encontrada.
   */
  async responder(req: Request, res: Response): Promise<Response> {
    try {
      const dados = await perguntaService.responder(req.params.id, req.user!.id, req.params.perguntaId, req.body.resposta);
      return res.status(200).json({ data: dados });
    } catch (err: any) {
      return responderErro(res, err);
    }
  }
}

export default new PerguntaController();
