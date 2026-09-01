/**
 * @file solicitacaoController.ts
 * @description Controller REST do painel "Minhas Solicitações" (US06), comparação de propostas (US11)
 * e aceite/recusa/renegociação de propostas (US12).
 *
 * BIBLIOTECAS UTILIZADAS:
 * 1. Express.js (^4.19.2): Manipulação de requisições e respostas HTTP.
 *    Doc Oficial: https://expressjs.com/pt-br/
 */

import { Request, Response } from 'express';
import solicitacaoService from '../services/solicitacaoService';
import HttpError from '../utils/HttpError';

function responderErro(res: Response, err: any) {
  if (err instanceof HttpError) {
    return res.status(err.status).json({ error: err.name, message: err.message });
  }
  return res.status(500).json({ error: 'Internal Server Error', message: err.message });
}

export class SolicitacaoController {
  /**
   * @openapi
   * /solicitacoes/minhas:
   *   get:
   *     summary: Lista as solicitações do solicitante autenticado, com contagem de propostas recebidas
   *     tags:
   *       - Minhas Solicitações
   *     security:
   *       - bearerAuth: []
   *     parameters:
   *       - in: query
   *         name: status
   *         schema:
   *           type: string
   *         description: Filtra por status (ABERTA, EM_NEGOCIACAO, CONTRATADA, CONCLUIDA, CANCELADA).
   *       - in: query
   *         name: busca
   *         schema:
   *           type: string
   *         description: Busca por palavra-chave no título da solicitação.
   *     responses:
   *       200:
   *         description: Lista de solicitações retornada com sucesso.
   *       401:
   *         description: Não autorizado.
   */
  async listarMinhas(req: Request, res: Response): Promise<Response> {
    try {
      const solicitanteId = req.user!.id;
      const dados = await solicitacaoService.listarMinhas(solicitanteId, {
        status: req.query.status as string,
        busca: req.query.busca as string,
      });
      return res.status(200).json({ data: dados });
    } catch (err: any) {
      return responderErro(res, err);
    }
  }

  /**
   * @openapi
   * /solicitacoes/minhas/{id}/propostas:
   *   get:
   *     summary: Retorna uma solicitação do solicitante autenticado com as propostas recebidas para comparação
   *     tags:
   *       - Minhas Solicitações
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
   *         description: Solicitação e propostas retornadas com sucesso.
   *       404:
   *         description: Solicitação não encontrada.
   */
  async buscarComPropostas(req: Request, res: Response): Promise<Response> {
    try {
      const solicitanteId = req.user!.id;
      const dados = await solicitacaoService.buscarComPropostas(solicitanteId, req.params.id);
      return res.status(200).json({ data: dados });
    } catch (err: any) {
      return responderErro(res, err);
    }
  }

  /**
   * @openapi
   * /solicitacoes/minhas/{id}/propostas/{propostaId}/status:
   *   patch:
   *     summary: Aceita ou recusa uma proposta recebida (US12 - a proposta aceita contrata o prestador)
   *     tags:
   *       - Minhas Solicitações
   *     security:
   *       - bearerAuth: []
   *     parameters:
   *       - in: path
   *         name: id
   *         required: true
   *         schema:
   *           type: string
   *       - in: path
   *         name: propostaId
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
   *               - acao
   *             properties:
   *               acao:
   *                 type: string
   *                 enum: [ACEITAR, RECUSAR]
   *     responses:
   *       200:
   *         description: Proposta atualizada com sucesso.
   *       404:
   *         description: Solicitação ou proposta não encontrada.
   *       409:
   *         description: Transição de status não permitida.
   */
  async atualizarStatusProposta(req: Request, res: Response): Promise<Response> {
    try {
      const solicitanteId = req.user!.id;
      const acao = String(req.body.acao || '').trim().toUpperCase();

      if (!['ACEITAR', 'RECUSAR'].includes(acao)) {
        return res.status(400).json({ error: 'Bad Request', message: 'A ação deve ser ACEITAR ou RECUSAR.' });
      }

      const resultado = await solicitacaoService.atualizarStatusProposta(
        solicitanteId,
        req.params.id,
        req.params.propostaId,
        acao as 'ACEITAR' | 'RECUSAR'
      );
      return res.status(200).json(resultado);
    } catch (err: any) {
      return responderErro(res, err);
    }
  }

  /**
   * @openapi
   * /solicitacoes/minhas/{id}/propostas/{propostaId}/renegociar:
   *   post:
   *     summary: Envia uma contraproposta de valor para uma proposta recebida
   *     tags:
   *       - Minhas Solicitações
   *     security:
   *       - bearerAuth: []
   *     parameters:
   *       - in: path
   *         name: id
   *         required: true
   *         schema:
   *           type: string
   *       - in: path
   *         name: propostaId
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
   *               - valor
   *               - mensagem
   *             properties:
   *               valor:
   *                 type: number
   *               mensagem:
   *                 type: string
   *     responses:
   *       200:
   *         description: Contraproposta registrada com sucesso.
   *       404:
   *         description: Solicitação ou proposta não encontrada.
   *       409:
   *         description: Esta solicitação/proposta não permite renegociação.
   */
  async renegociarProposta(req: Request, res: Response): Promise<Response> {
    try {
      const solicitanteId = req.user!.id;
      const resultado = await solicitacaoService.renegociarProposta(
        solicitanteId,
        req.params.id,
        req.params.propostaId,
        Number(req.body.valor),
        String(req.body.mensagem || '')
      );
      return res.status(200).json(resultado);
    } catch (err: any) {
      return responderErro(res, err);
    }
  }
}

export default new SolicitacaoController();
