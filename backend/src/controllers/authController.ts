/**
 * @file authController.ts
 * @description Controller REST responsável pelos endpoints de autenticação, cadastro de Solicitantes, Prestadores e Login JWT.
 * 
 * BIBLIOTECAS UTILIZADAS:
 * 1. Express.js (^4.19.2): Framework de rotas e manipulação de requisições/respostas HTTP.
 *    Doc Oficial: https://expressjs.com/pt-br/
 */

import { Request, Response } from 'express';
import authService from '../services/authService';

export class AuthController {
  /**
   * @openapi
   * /auth/register/solicitante:
   *   post:
   *     summary: Realiza o cadastro de um novo Usuário Solicitante (Cliente)
   *     tags:
   *       - Autenticação
   *     requestBody:
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *             type: object
   *             required:
   *               - nome
   *               - email
   *               - cpf
   *               - telefone
   *               - senha
   *               - termo_lgpd_aceito
   *             properties:
   *               nome:
   *                 type: string
   *                 example: "Carlos Eduardo Silva"
   *               email:
   *                 type: string
   *                 example: "carlos.cliente@email.com"
   *               cpf:
   *                 type: string
   *                 example: "123.456.789-00"
   *               telefone:
   *                 type: string
   *                 example: "(16) 99876-5432"
   *               endereco:
   *                 type: string
   *                 example: "Rua das Flores, 123 - Ribeirão Preto, SP"
   *               senha:
   *                 type: string
   *                 example: "SenhaSegura123!"
   *               termo_lgpd_aceito:
   *                 type: boolean
   *                 example: true
   *     responses:
   *       201:
   *         description: Solicitante cadastrado com sucesso.
   *       400:
   *         description: Dados inválidos ou consentimento LGPD não fornecido.
   *       409:
   *         description: E-mail ou CPF já existente no sistema.
   *       500:
   *         description: Erro interno no servidor.
   */
  async registerSolicitante(req: Request, res: Response): Promise<Response> {
    try {
      const { nome, email, cpf, telefone, endereco, senha, termo_lgpd_aceito } = req.body;

      if (!nome || !email || !cpf || !telefone || !senha) {
        return res.status(400).json({
          error: 'Bad Request',
          message: 'Todos os campos obrigatórios (nome, email, cpf, telefone, senha) devem ser informados.',
        });
      }

      const usuario = await authService.registerSolicitante({
        nome,
        email,
        cpf,
        telefone,
        endereco,
        senha,
        termo_lgpd_aceito: Boolean(termo_lgpd_aceito),
      });

      return res.status(201).json({
        message: 'Solicitante cadastrado com sucesso!',
        data: usuario,
      });
    } catch (error: any) {
      const errorMessage = error.message || 'Erro ao realizar cadastro do solicitante.';
      if (errorMessage.includes('já está cadastrado')) {
        return res.status(409).json({ error: 'Conflict', message: errorMessage });
      }
      if (errorMessage.includes('LGPD')) {
        return res.status(400).json({ error: 'Bad Request', message: errorMessage });
      }

      return res.status(500).json({
        error: 'Internal Server Error',
        message: errorMessage,
      });
    }
  }

  /**
   * @openapi
   * /auth/register/prestador:
   *   post:
   *     summary: Realiza o cadastro de um novo Prestador de Serviço (Profissional)
   *     tags:
   *       - Autenticação
   *     requestBody:
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *             type: object
   *             required:
   *               - nome
   *               - email
   *               - cnpj_cpf
   *               - telefone
   *               - senha
   *               - categorias
   *               - termo_lgpd_aceito
   *             properties:
   *               nome:
   *                 type: string
   *                 example: "Marcos Refrigeração e Elétrica Ltda"
   *               email:
   *                 type: string
   *                 example: "marcos.prestador@email.com"
   *               cnpj_cpf:
   *                 type: string
   *                 example: "12.345.678/0001-90"
   *               telefone:
   *                 type: string
   *                 example: "(16) 98765-4321"
   *               endereco:
   *                 type: string
   *                 example: "Av. Brasil, 500 - Ribeirão Preto, SP"
   *               senha:
   *                 type: string
   *                 example: "SenhaPrestador123!"
   *               descricao_bio:
   *                 type: string
   *                 example: "Especialista em manutenção de ar-condicionado e instalações elétricas prediais."
   *               categorias:
   *                 type: array
   *                 items:
   *                   type: string
   *                 example: ["ELETRICA", "REFRIGERACAO"]
   *               termo_lgpd_aceito:
   *                 type: boolean
   *                 example: true
   *     responses:
   *       201:
   *         description: Prestador cadastrado com sucesso.
   *       400:
   *         description: Dados inválidos ou consentimento LGPD não fornecido.
   *       409:
   *         description: E-mail ou CPF/CNPJ já existente no sistema.
   *       500:
   *         description: Erro interno no servidor.
   */
  async registerPrestador(req: Request, res: Response): Promise<Response> {
    try {
      const { nome, email, cnpj_cpf, telefone, endereco, senha, descricao_bio, categorias, termo_lgpd_aceito } = req.body;

      if (!nome || !email || !cnpj_cpf || !telefone || !senha) {
        return res.status(400).json({
          error: 'Bad Request',
          message: 'Todos os campos obrigatórios (nome, email, cnpj_cpf, telefone, senha) devem ser informados.',
        });
      }

      const usuario = await authService.registerPrestador({
        nome,
        email,
        cnpj_cpf,
        telefone,
        endereco,
        senha,
        descricao_bio,
        categorias,
        termo_lgpd_aceito: Boolean(termo_lgpd_aceito),
      });

      return res.status(201).json({
        message: 'Prestador de serviço cadastrado com sucesso!',
        data: usuario,
      });
    } catch (error: any) {
      const errorMessage = error.message || 'Erro ao realizar cadastro do prestador.';
      if (errorMessage.includes('já está cadastrado')) {
        return res.status(409).json({ error: 'Conflict', message: errorMessage });
      }
      if (errorMessage.includes('LGPD') || errorMessage.includes('categoria')) {
        return res.status(400).json({ error: 'Bad Request', message: errorMessage });
      }

      return res.status(500).json({
        error: 'Internal Server Error',
        message: errorMessage,
      });
    }
  }

  /**
   * @openapi
   * /auth/login:
   *   post:
   *     summary: Efetua login do Usuário (Solicitante ou Prestador) e retorna Token JWT
   *     tags:
   *       - Autenticação
   *     requestBody:
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *             type: object
   *             required:
   *               - email
   *               - senha
   *             properties:
   *               email:
   *                 type: string
   *                 example: "carlos.cliente@email.com"
   *               senha:
   *                 type: string
   *                 example: "SenhaSegura123!"
   *     responses:
   *       200:
   *         description: Login efetuado com sucesso e Token JWT gerado.
   *       401:
   *         description: E-mail ou senha incorretos ou conta desativada.
   *       500:
   *         description: Erro interno no servidor.
   */
  async login(req: Request, res: Response): Promise<Response> {
    try {
      const { email, senha } = req.body;

      if (!email || !senha) {
        return res.status(400).json({
          error: 'Bad Request',
          message: 'E-mail e senha são obrigatórios para efetuar o login.',
        });
      }

      const result = await authService.login({ email, senha });

      return res.status(200).json({
        message: 'Login realizado com sucesso!',
        data: result,
      });
    } catch (error: any) {
      const errorMessage = error.message || 'Erro ao efetuar login.';
      if (errorMessage.includes('incorretos') || errorMessage.includes('desativada')) {
        return res.status(401).json({ error: 'Unauthorized', message: errorMessage });
      }

      return res.status(500).json({
        error: 'Internal Server Error',
        message: errorMessage,
      });
    }
  }

  /**
   * @openapi
   * /auth/me:
   *   get:
   *     summary: Retorna os dados do Usuário Autenticado via Token JWT
   *     tags:
   *       - Autenticação
   *     security:
   *       - bearerAuth: []
   *     responses:
   *       200:
   *         description: Perfil do usuário retornado com sucesso.
   *       401:
   *         description: Token JWT não fornecido, inválido ou expirado.
   *       500:
   *         description: Erro interno no servidor.
   */
  async getMe(req: Request, res: Response): Promise<Response> {
    try {
      if (!req.user || !req.user.id) {
        return res.status(401).json({
          error: 'Unauthorized',
          message: 'Usuário não autenticado.',
        });
      }

      const usuario = await authService.getUserProfile(req.user.id);

      return res.status(200).json({
        data: usuario,
      });
    } catch (error: any) {
      return res.status(500).json({
        error: 'Internal Server Error',
        message: error.message || 'Erro ao buscar perfil do usuário autenticado.',
      });
    }
  }
}

export default new AuthController();
