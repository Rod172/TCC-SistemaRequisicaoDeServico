/**
 * @file adminRoutes.ts
 * @description Rotas REST do Painel Administrativo (US27), protegidas por JWT e restritas a
 * `tipo_perfil = ADMIN`.
 *
 * BIBLIOTECAS UTILIZADAS:
 * 1. Express.js Router (^4.19.2): Roteador do servidor web.
 *    Doc Oficial: https://expressjs.com/pt-br/4x/api-html#router
 */

import { Router } from 'express';
import adminController from '../controllers/adminController';
import authMiddleware from '../middlewares/authMiddleware';
import adminMiddleware from '../middlewares/adminMiddleware';

const adminRoutes = Router();

adminRoutes.use(authMiddleware, adminMiddleware);

// GET /api/v1/admin/usuarios — Lista e filtra usuários
adminRoutes.get('/usuarios', (req, res) => adminController.listarUsuarios(req, res));

// PATCH /api/v1/admin/usuarios/:id/status — Ativa/desativa um usuário
adminRoutes.patch('/usuarios/:id/status', (req, res) => adminController.alterarStatusUsuario(req, res));

// GET /api/v1/admin/solicitacoes — Lista todas as solicitações da plataforma
adminRoutes.get('/solicitacoes', (req, res) => adminController.listarSolicitacoes(req, res));

export default adminRoutes;
