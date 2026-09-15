/**
 * @file notificacaoController.ts
 * @description Controller REST das notificações internas do usuário (US16).
 *
 * BIBLIOTECAS UTILIZADAS:
 * 1. Express.js (^4.19.2): Manipulação de requisições e respostas HTTP.
 *    Doc Oficial: https://expressjs.com/pt-br/
 */

import { Request, Response } from 'express';
import notificacaoService from '../services/notificacaoService';
import HttpError from '../utils/HttpError';

function responderErro(res: Response, err: any) {
  if (err instanceof HttpError) {
    return res.status(err.status).json({ error: err.name, message: err.message });
  }
  return res.status(500).json({ error: 'Internal Server Error', message: err.message });
}

export class NotificacaoController {
  /**
   * @openapi
   * /notificacoes:
   *   get:
   *     summary: Lista as notificações do usuário autenticado, mais recentes primeiro, com contador de não lidas (US16)
   *     tags:
   *       - Notificações
   *     security:
   *       - bearerAuth: []
   *     responses:
   *       200:
   *         description: Notificações retornadas com sucesso.
   */
  async listarMinhas(req: Request, res: Response): Promise<Response> {
    try {
      const resultado = await notificacaoService.listarMinhas(req.user!.id);
      return res.status(200).json(resultado);
    } catch (err: any) {
      return responderErro(res, err);
    }
  }

  /**
   * @openapi
   * /notificacoes/{id}/lida:
   *   patch:
   *     summary: Marca uma notificação específica como lida (US16)
   *     tags:
   *       - Notificações
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
   *         description: Notificação marcada como lida.
   *       404:
   *         description: Notificação não encontrada.
   */
  async marcarComoLida(req: Request, res: Response): Promise<Response> {
    try {
      const resultado = await notificacaoService.marcarComoLida(req.user!.id, req.params.id);
      return res.status(200).json(resultado);
    } catch (err: any) {
      return responderErro(res, err);
    }
  }

  /**
   * @openapi
   * /notificacoes/lidas:
   *   patch:
   *     summary: Marca todas as notificações do usuário autenticado como lidas (US16)
   *     tags:
   *       - Notificações
   *     security:
   *       - bearerAuth: []
   *     responses:
   *       200:
   *         description: Todas as notificações foram marcadas como lidas.
   */
  async marcarTodasComoLidas(req: Request, res: Response): Promise<Response> {
    try {
      const resultado = await notificacaoService.marcarTodasComoLidas(req.user!.id);
      return res.status(200).json(resultado);
    } catch (err: any) {
      return responderErro(res, err);
    }
  }
}

export default new NotificacaoController();
