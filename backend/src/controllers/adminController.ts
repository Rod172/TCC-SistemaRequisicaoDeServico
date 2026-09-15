/**
 * @file adminController.ts
 * @description Controller REST do Painel Administrativo (US27): gestão de usuários e visão geral
 * das solicitações da plataforma. Todas as rotas exigem `tipo_perfil = ADMIN` (ver `adminMiddleware`).
 *
 * BIBLIOTECAS UTILIZADAS:
 * 1. Express.js (^4.19.2): Manipulação de requisições e respostas HTTP.
 *    Doc Oficial: https://expressjs.com/pt-br/
 */

import { Request, Response } from 'express';
import adminService from '../services/adminService';
import denunciaService from '../services/denunciaService';
import HttpError from '../utils/HttpError';

function responderErro(res: Response, err: any) {
  if (err instanceof HttpError) {
    return res.status(err.status).json({ error: err.name, message: err.message });
  }
  return res.status(500).json({ error: 'Internal Server Error', message: err.message });
}

export class AdminController {
  /**
   * @openapi
   * /admin/usuarios:
   *   get:
   *     summary: Lista e filtra todos os usuários cadastrados na plataforma (US27)
   *     tags:
   *       - Administração
   *     security:
   *       - bearerAuth: []
   *     parameters:
   *       - in: query
   *         name: tipo_perfil
   *         schema:
   *           type: string
   *           enum: [SOLICITANTE, PRESTADOR, ADMIN]
   *       - in: query
   *         name: status
   *         schema:
   *           type: string
   *           enum: [ativo, inativo]
   *       - in: query
   *         name: busca
   *         schema:
   *           type: string
   *     responses:
   *       200:
   *         description: Lista de usuários retornada com sucesso.
   *       403:
   *         description: Apenas administradores podem acessar este recurso.
   */
  async listarUsuarios(req: Request, res: Response): Promise<Response> {
    try {
      const usuarios = await adminService.listarUsuarios({
        tipo_perfil: req.query.tipo_perfil as string,
        status: req.query.status as string,
        busca: req.query.busca as string,
      });
      return res.status(200).json({ data: usuarios });
    } catch (err: any) {
      return responderErro(res, err);
    }
  }

  /**
   * @openapi
   * /admin/usuarios/{id}/status:
   *   patch:
   *     summary: Ativa ou desativa a conta de um usuário (US27)
   *     tags:
   *       - Administração
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
   *               - ativo
   *             properties:
   *               ativo:
   *                 type: boolean
   *     responses:
   *       200:
   *         description: Status do usuário atualizado com sucesso.
   *       404:
   *         description: Usuário não encontrado.
   */
  async alterarStatusUsuario(req: Request, res: Response): Promise<Response> {
    try {
      if (typeof req.body.ativo !== 'boolean') {
        return res.status(400).json({ error: 'Bad Request', message: 'O campo "ativo" é obrigatório e deve ser booleano.' });
      }
      const usuario = await adminService.alterarStatusUsuario(req.user!.id, req.params.id, req.body.ativo);
      return res.status(200).json({
        message: usuario.ativo ? 'Usuário ativado com sucesso.' : 'Usuário desativado com sucesso.',
        data: usuario,
      });
    } catch (err: any) {
      return responderErro(res, err);
    }
  }

  /**
   * @openapi
   * /admin/solicitacoes:
   *   get:
   *     summary: Lista todas as solicitações da plataforma, independente do solicitante dono (US27)
   *     tags:
   *       - Administração
   *     security:
   *       - bearerAuth: []
   *     parameters:
   *       - in: query
   *         name: status
   *         schema:
   *           type: string
   *     responses:
   *       200:
   *         description: Lista de solicitações retornada com sucesso.
   */
  async listarSolicitacoes(req: Request, res: Response): Promise<Response> {
    try {
      const solicitacoes = await adminService.listarSolicitacoes({ status: req.query.status as string });
      return res.status(200).json({ data: solicitacoes });
    } catch (err: any) {
      return responderErro(res, err);
    }
  }

  /**
   * @openapi
   * /admin/denuncias:
   *   get:
   *     summary: Lista todas as denúncias registradas na plataforma, pendentes primeiro (US32)
   *     tags:
   *       - Administração
   *     security:
   *       - bearerAuth: []
   *     responses:
   *       200:
   *         description: Lista de denúncias retornada com sucesso.
   */
  async listarDenuncias(req: Request, res: Response): Promise<Response> {
    try {
      const denuncias = await denunciaService.listarTodas();
      return res.status(200).json({ data: denuncias });
    } catch (err: any) {
      return responderErro(res, err);
    }
  }

  /**
   * @openapi
   * /admin/denuncias/{id}/resolver:
   *   patch:
   *     summary: Marca uma denúncia como resolvida (US32)
   *     tags:
   *       - Administração
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
   *         description: Denúncia marcada como resolvida.
   *       404:
   *         description: Denúncia não encontrada.
   */
  async resolverDenuncia(req: Request, res: Response): Promise<Response> {
    try {
      const resultado = await denunciaService.resolver(req.params.id);
      return res.status(200).json(resultado);
    } catch (err: any) {
      return responderErro(res, err);
    }
  }
}

export default new AdminController();
