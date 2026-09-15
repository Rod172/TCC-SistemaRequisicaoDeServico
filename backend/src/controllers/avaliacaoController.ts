/**
 * @file avaliacaoController.ts
 * @description Controller REST da avaliação de satisfação do serviço (US18) — o Solicitante avalia o
 * Prestador (nota de 1 a 5 estrelas + comentário) depois que a solicitação é marcada `CONCLUIDA` (US17).
 *
 * BIBLIOTECAS UTILIZADAS:
 * 1. Express.js (^4.19.2): Manipulação de requisições e respostas HTTP.
 *    Doc Oficial: https://expressjs.com/pt-br/
 */

import { Request, Response } from 'express';
import avaliacaoService from '../services/avaliacaoService';
import HttpError from '../utils/HttpError';

function responderErro(res: Response, err: any) {
  if (err instanceof HttpError) {
    return res.status(err.status).json({ error: err.name, message: err.message });
  }
  return res.status(500).json({ error: 'Internal Server Error', message: err.message });
}

export class AvaliacaoController {
  /**
   * @openapi
   * /solicitacoes/{id}/avaliar:
   *   post:
   *     summary: Solicitante avalia o serviço de uma solicitação concluída (US18)
   *     tags:
   *       - Avaliações
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
   *               - nota
   *             properties:
   *               nota:
   *                 type: integer
   *               comentario:
   *                 type: string
   *     responses:
   *       201:
   *         description: Avaliação registrada com sucesso.
   *       409:
   *         description: A solicitação não está concluída, ou já foi avaliada.
   */
  async avaliar(req: Request, res: Response): Promise<Response> {
    try {
      const resultado = await avaliacaoService.avaliar(req.user!.id, req.params.id, Number(req.body.nota), req.body.comentario);
      return res.status(201).json(resultado);
    } catch (err: any) {
      return responderErro(res, err);
    }
  }

  /**
   * @openapi
   * /solicitacoes/{id}/avaliacao:
   *   get:
   *     summary: Busca a avaliação de uma solicitação, se já existir (US18)
   *     tags:
   *       - Avaliações
   *     security:
   *       - bearerAuth: []
   *     parameters:
   *       - in: path
   *         name: id
   *         required: true
   *         schema:
   *           type: string
   *     responses:
   *       200:
   *         description: Avaliação retornada (ou `null` se ainda não existir).
   */
  async buscarPorSolicitacao(req: Request, res: Response): Promise<Response> {
    try {
      const dados = await avaliacaoService.buscarPorSolicitacao(req.params.id);
      return res.status(200).json({ data: dados });
    } catch (err: any) {
      return responderErro(res, err);
    }
  }
}

export default new AvaliacaoController();
