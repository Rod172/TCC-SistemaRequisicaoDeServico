/**
 * @file perfilRoutes.ts
 * @description Rotas REST para gestão do perfil do usuário autenticado (todas protegidas por JWT).
 *
 * BIBLIOTECAS UTILIZADAS:
 * 1. Express.js Router (^4.19.2): Roteador do servidor web.
 *    Doc Oficial: https://expressjs.com/pt-br/4x/api-html#router
 * 2. Multer (^2.3.0): Parsing de multipart/form-data para upload da foto de perfil.
 *    Doc Oficial: https://github.com/expressjs/multer
 */

import { Router } from 'express';
import perfilController from '../controllers/perfilController';
import authMiddleware from '../middlewares/authMiddleware';
import uploadFotoPerfil from '../middlewares/uploadMiddleware';

const perfilRoutes = Router();

// Todas as rotas de perfil exigem autenticação JWT
perfilRoutes.use(authMiddleware);

// GET /api/v1/perfil — Retorna os dados do usuário logado
perfilRoutes.get('/', (req, res) => perfilController.getPerfil(req, res));

// PUT /api/v1/perfil — Atualiza nome, telefone e endereço
perfilRoutes.put('/', (req, res) => perfilController.updatePerfil(req, res));

// POST /api/v1/perfil/foto — Envia/substitui a foto de perfil
perfilRoutes.post('/foto', uploadFotoPerfil.single('foto'), (req, res) => perfilController.updateFoto(req, res));

// PUT /api/v1/perfil/senha — Altera a senha exigindo a senha atual
perfilRoutes.put('/senha', (req, res) => perfilController.updateSenha(req, res));

// DELETE /api/v1/perfil — Soft-delete da conta (conformidade LGPD)
perfilRoutes.delete('/', (req, res) => perfilController.deletePerfil(req, res));

export default perfilRoutes;
