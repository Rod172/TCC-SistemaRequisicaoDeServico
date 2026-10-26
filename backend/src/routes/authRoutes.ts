/**
 * @file authRoutes.ts
 * @description Definição das rotas REST de Autenticação (Cadastro de Solicitantes, Prestadores, Login e Me).
 * 
 * BIBLIOTECAS UTILIZADAS:
 * 1. Express.js Router (^4.19.2): Roteador do servidor web.
 *    Doc Oficial: https://expressjs.com/pt-br/4x/api-html#router
 * 2. Multer (^2.3.0): Recebe foto opcional JPEG/PNG/WEBP de até 5 MB no cadastro.
 *    Doc Oficial: https://github.com/expressjs/multer
 */

import { Router } from 'express';
import authController from '../controllers/authController';
import authMiddleware from '../middlewares/authMiddleware';

import { loginRateLimiter } from '../middlewares/loginRateLimiter';
import uploadFotoPerfil from '../middlewares/uploadMiddleware';

const authRoutes = Router();

// Rota de Cadastro de Solicitante (Pública)
authRoutes.post('/register/solicitante', (req, res) => authController.registerSolicitante(req, res));

// Rota de Cadastro de Prestador de Serviço (Pública)
authRoutes.post('/register/prestador', (req, res, next) => {
  // O Multer ignora application/json, preservando os clientes anteriores.
  uploadFotoPerfil.single('foto')(req, res, (erro: unknown) => {
    if (erro) {
      const codigo = (erro as { code?: string }).code;
      res.status(400).json({
        error: 'Bad Request',
        message: codigo === 'LIMIT_FILE_SIZE' ? 'A foto deve ter no máximo 5 MB.'
          : 'Foto inválida. Envie somente uma imagem JPEG, PNG ou WEBP de até 5 MB no campo foto.',
      });
      return;
    }
    next();
  });
}, (req, res) => authController.registerPrestador(req, res));

// Rota de Login de Usuário (Pública)
authRoutes.post('/login', loginRateLimiter, (req, res) => authController.login(req, res));

// Rota de Consulta de Usuário Autenticado (Protegida por JWT)
authRoutes.get('/me', authMiddleware, (req, res) => authController.getMe(req, res));

export default authRoutes;
