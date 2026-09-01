/**
 * @file authRoutes.ts
 * @description Definição das rotas REST de Autenticação (Cadastro de Solicitantes, Prestadores, Login e Me).
 * 
 * BIBLIOTECAS UTILIZADAS:
 * 1. Express.js Router (^4.19.2): Roteador do servidor web.
 *    Doc Oficial: https://expressjs.com/pt-br/4x/api-html#router
 */

import { Router } from 'express';
import authController from '../controllers/authController';
import authMiddleware from '../middlewares/authMiddleware';

const authRoutes = Router();

// Rota de Cadastro de Solicitante (Pública)
authRoutes.post('/register/solicitante', (req, res) => authController.registerSolicitante(req, res));

// Rota de Cadastro de Prestador de Serviço (Pública)
authRoutes.post('/register/prestador', (req, res) => authController.registerPrestador(req, res));

// Rota de Login de Usuário (Pública)
authRoutes.post('/login', (req, res) => authController.login(req, res));

// Rota de Consulta de Usuário Autenticado (Protegida por JWT)
authRoutes.get('/me', authMiddleware, (req, res) => authController.getMe(req, res));

export default authRoutes;
