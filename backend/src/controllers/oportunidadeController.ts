/**
 * @file oportunidadeController.ts
 * @description Controller REST do feed de oportunidades do prestador (US08), detalhamento (US09) e
 * envio de proposta (US10).
 *
 * BIBLIOTECAS UTILIZADAS:
 * 1. Express.js (^4.19.2): Manipulação de requisições e respostas HTTP.
 *    Doc Oficial: https://expressjs.com/pt-br/
 */

import { Request, Response } from 'express';
import oportunidadeService from '../services/oportunidadeService';
import HttpError from '../utils/HttpError';

function responderErro(res: Response, err: any) {
  if (err instanceof HttpError) {
    return res.status(err.status).json({ error: err.name, message: err.message });
  }
  return res.status(500).json({ error: 'Internal Server Error', message: err.message });
}

function exigirPrestador(req: Request, res: Response): boolean {
  // ADMIN também tem acesso, para fins de suporte e teste da plataforma (US27).
  if (!['PRESTADOR', 'ADMIN'].includes(req.user!.tipo_perfil)) {
    res.status(403).json({ error: 'Forbidden', message: 'Apenas prestadores podem acessar o feed de oportunidades.' });
    return false;
  }
  return true;
}

export class OportunidadeController {
  /**
   * @openapi
   * /prestador/oportunidades:
   *   get:
   *     summary: Lista as solicitações abertas para o prestador autenticado (feed de oportunidades)
   *     tags:
   *       - Oportunidades (Prestador)
   *     security:
   *       - bearerAuth: []
   *     parameters:
   *       - in: query
   *         name: busca
   *         schema:
   *           type: string
   *       - in: query
   *         name: categoria
   *         schema:
   *           type: string
   *       - in: query
   *         name: cidade
   *         schema:
   *           type: string
   *       - in: query
   *         name: bairro
   *         schema:
   *           type: string
   *       - in: query
   *         name: ordenacao
   *         schema:
   *           type: string
   *           enum: [recentes, antigas]
   *     responses:
   *       200:
   *         description: Feed de oportunidades retornado com sucesso.
   *       403:
   *         description: Apenas prestadores podem acessar este recurso.
   */
  async listarOportunidades(req: Request, res: Response): Promise<Response | void> {
    // Listagem é pública — qualquer visitante pode navegar, autenticado ou não.
    try {
      const resultado = await oportunidadeService.listarOportunidades({
        busca: req.query.busca as string,
        categoria: req.query.categoria as string,
        cidade: req.query.cidade as string,
        bairro: req.query.bairro as string,
        ordenacao: req.query.ordenacao as string,
      });
      return res.status(200).json(resultado);
    } catch (err: any) {
      return responderErro(res, err);
    }
  }

  /**
   * @openapi
   * /prestador/oportunidades/{id}:
   *   get:
   *     summary: Retorna os detalhes de uma oportunidade aberta e a proposta já enviada pelo prestador, se houver
   *     tags:
   *       - Oportunidades (Prestador)
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
   *         description: Detalhes da oportunidade retornados com sucesso.
   *       404:
   *         description: Oportunidade aberta não encontrada.
   */
  async buscarOportunidade(req: Request, res: Response): Promise<Response | void> {
    // Detalhe também é público — só "minha proposta"/"posso propor" dependem de estar logado.
    try {
      const dados = await oportunidadeService.buscarOportunidade(req.params.id, req.user?.id ?? null);
      return res.status(200).json({ dados });
    } catch (err: any) {
      return responderErro(res, err);
    }
  }

  /**
   * @openapi
   * /prestador/oportunidades/{id}/propostas:
   *   post:
   *     summary: Envia a proposta do prestador autenticado para uma oportunidade aberta
   *     tags:
   *       - Oportunidades (Prestador)
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
   *               - valor
   *               - prazo_dias
   *               - mensagem
   *             properties:
   *               valor:
   *                 type: number
   *               prazo_dias:
   *                 type: integer
   *               mensagem:
   *                 type: string
   *     responses:
   *       201:
   *         description: Proposta enviada com sucesso.
   *       409:
   *         description: Oportunidade fechada ou prestador já possui proposta enviada.
   */
  async enviarProposta(req: Request, res: Response): Promise<Response | void> {
    if (!exigirPrestador(req, res)) return;
    try {
      const resultado = await oportunidadeService.enviarProposta(req.params.id, req.user!.id, {
        valor: Number(req.body.valor),
        prazo_dias: Number(req.body.prazo_dias),
        mensagem: String(req.body.mensagem || ''),
      });
      return res.status(201).json(resultado);
    } catch (err: any) {
      return responderErro(res, err);
    }
  }
}

export default new OportunidadeController();
