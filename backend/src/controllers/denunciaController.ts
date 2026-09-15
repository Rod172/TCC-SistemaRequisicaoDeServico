/**
 * @file denunciaController.ts
 * @description Controller REST da denúncia de solicitação para moderação (US32) — lado do usuário
 * comum (Solicitante/Prestador). A listagem/resolução (lado do Admin) fica em `adminController.ts`.
 *
 * BIBLIOTECAS UTILIZADAS:
 * 1. Express.js (^4.19.2): Manipulação de requisições e respostas HTTP.
 *    Doc Oficial: https://expressjs.com/pt-br/
 */

import { Request, Response } from 'express';
import denunciaService from '../services/denunciaService';
import HttpError from '../utils/HttpError';

function responderErro(res: Response, err: any) {
  if (err instanceof HttpError) {
    return res.status(err.status).json({ error: err.name, message: err.message });
  }
  return res.status(500).json({ error: 'Internal Server Error', message: err.message });
}

export class DenunciaController {
  /**
   * @openapi
   * /solicitacoes/{id}/denunciar:
   *   post:
   *     summary: Denuncia uma solicitação para revisão do Admin (US32) — restrito a quem participa dela
   *     tags:
   *       - Denúncias
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
   *               - motivo
   *             properties:
   *               motivo:
   *                 type: string
   *     responses:
   *       201:
   *         description: Denúncia registrada com sucesso.
   *       403:
   *         description: Você não participa desta solicitação.
   */
  async denunciar(req: Request, res: Response): Promise<Response> {
    try {
      const resultado = await denunciaService.denunciar(req.params.id, req.user!.id, req.body.motivo);
      return res.status(201).json(resultado);
    } catch (err: any) {
      return responderErro(res, err);
    }
  }
}

export default new DenunciaController();
