/**
 * @file perfilController.ts
 * @description Controller REST para gestão do perfil do usuário autenticado, incluindo edição de dados, troca de senha e exclusão de conta (LGPD).
 * 
 * BIBLIOTECAS UTILIZADAS:
 * 1. Express.js (^4.19.2): Manipulação de requisições e respostas HTTP.
 *    Doc Oficial: https://expressjs.com/pt-br/
 * 2. BcryptJS (^2.4.3): Hash e comparação de senhas.
 *    Doc Oficial: https://github.com/dcodeIO/bcrypt.js
 */

import { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import path from 'path';
import fs from 'fs';
import { Usuario, PrestadorPerfil } from '../models';

export class PerfilController {

  /**
   * @openapi
   * /perfil:
   *   get:
   *     summary: Retorna os dados do perfil do usuário autenticado
   *     tags:
   *       - Perfil
   *     security:
   *       - bearerAuth: []
   *     responses:
   *       200:
   *         description: Dados do perfil retornados com sucesso.
   *       401:
   *         description: Não autorizado.
   */
  async getPerfil(req: Request, res: Response): Promise<Response> {
    try {
      const usuarioId = req.user!.id;

      const usuario = await Usuario.findByPk(usuarioId, {
        include: [{ model: PrestadorPerfil, as: 'perfil_prestador', required: false }],
      });

      if (!usuario) {
        return res.status(404).json({ error: 'Not Found', message: 'Usuário não encontrado.' });
      }

      const { senha_hash: _, ...perfil } = usuario.toJSON();
      return res.status(200).json({ data: perfil });
    } catch (err: any) {
      return res.status(500).json({ error: 'Internal Server Error', message: err.message });
    }
  }

  /**
   * @openapi
   * /perfil:
   *   put:
   *     summary: Atualiza os dados cadastrais do perfil do usuário autenticado
   *     tags:
   *       - Perfil
   *     security:
   *       - bearerAuth: []
   *     requestBody:
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *             type: object
   *             properties:
   *               nome:
   *                 type: string
   *               telefone:
   *                 type: string
   *               endereco:
   *                 type: string
   *     responses:
   *       200:
   *         description: Perfil atualizado com sucesso.
   *       401:
   *         description: Não autorizado.
   */
  async updatePerfil(req: Request, res: Response): Promise<Response> {
    try {
      const usuarioId = req.user!.id;
      const { nome, telefone, endereco } = req.body;

      const usuario = await Usuario.findByPk(usuarioId);
      if (!usuario) {
        return res.status(404).json({ error: 'Not Found', message: 'Usuário não encontrado.' });
      }

      await usuario.update({
        ...(nome && { nome: nome.trim() }),
        ...(telefone && { telefone: telefone.trim() }),
        ...(endereco !== undefined && { endereco: endereco.trim() }),
      });

      const { senha_hash: _, ...perfilAtualizado } = usuario.toJSON();
      return res.status(200).json({
        message: 'Perfil atualizado com sucesso!',
        data: perfilAtualizado,
      });
    } catch (err: any) {
      return res.status(500).json({ error: 'Internal Server Error', message: err.message });
    }
  }

  /**
   * @openapi
   * /perfil/foto:
   *   post:
   *     summary: Envia (ou substitui) a foto de perfil do usuário autenticado
   *     tags:
   *       - Perfil
   *     security:
   *       - bearerAuth: []
   *     requestBody:
   *       required: true
   *       content:
   *         multipart/form-data:
   *           schema:
   *             type: object
   *             properties:
   *               foto:
   *                 type: string
   *                 format: binary
   *     responses:
   *       200:
   *         description: Foto de perfil atualizada com sucesso.
   *       400:
   *         description: Arquivo não enviado ou formato inválido.
   *       401:
   *         description: Não autorizado.
   */
  async updateFoto(req: Request, res: Response): Promise<Response> {
    try {
      const usuarioId = req.user!.id;
      const arquivo = req.file;

      if (!arquivo) {
        return res.status(400).json({ error: 'Bad Request', message: 'Nenhum arquivo de imagem foi enviado.' });
      }

      const usuario = await Usuario.findByPk(usuarioId);
      if (!usuario) {
        return res.status(404).json({ error: 'Not Found', message: 'Usuário não encontrado.' });
      }

      // Remove o arquivo da foto anterior, se existir, para não acumular lixo em disco
      if (usuario.foto_url) {
        const nomeArquivoAntigo = path.basename(usuario.foto_url);
        const caminhoAntigo = path.join(__dirname, '../../uploads/perfil', nomeArquivoAntigo);
        fs.unlink(caminhoAntigo, () => {});
      }

      const foto_url = `/uploads/perfil/${arquivo.filename}`;
      await usuario.update({ foto_url });

      return res.status(200).json({
        message: 'Foto de perfil atualizada com sucesso!',
        data: { foto_url },
      });
    } catch (err: any) {
      return res.status(500).json({ error: 'Internal Server Error', message: err.message });
    }
  }

  /**
   * @openapi
   * /perfil/senha:
   *   put:
   *     summary: Altera a senha do usuário autenticado
   *     tags:
   *       - Perfil
   *     security:
   *       - bearerAuth: []
   *     requestBody:
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *             type: object
   *             required:
   *               - senha_atual
   *               - nova_senha
   *             properties:
   *               senha_atual:
   *                 type: string
   *               nova_senha:
   *                 type: string
   *     responses:
   *       200:
   *         description: Senha alterada com sucesso.
   *       400:
   *         description: Senha atual incorreta.
   *       401:
   *         description: Não autorizado.
   */
  async updateSenha(req: Request, res: Response): Promise<Response> {
    try {
      const usuarioId = req.user!.id;
      const { senha_atual, nova_senha } = req.body;

      if (!senha_atual || !nova_senha) {
        return res.status(400).json({ error: 'Bad Request', message: 'Informe a senha atual e a nova senha.' });
      }

      if (nova_senha.length < 6) {
        return res.status(400).json({ error: 'Bad Request', message: 'A nova senha deve ter no mínimo 6 caracteres.' });
      }

      const usuario = await Usuario.findByPk(usuarioId);
      if (!usuario) {
        return res.status(404).json({ error: 'Not Found', message: 'Usuário não encontrado.' });
      }

      const senhaValida = await bcrypt.compare(senha_atual, usuario.senha_hash);
      if (!senhaValida) {
        return res.status(400).json({ error: 'Bad Request', message: 'Senha atual incorreta. Verifique e tente novamente.' });
      }

      const nova_senha_hash = await bcrypt.hash(nova_senha, 10);
      await usuario.update({ senha_hash: nova_senha_hash });

      return res.status(200).json({ message: 'Senha alterada com sucesso!' });
    } catch (err: any) {
      return res.status(500).json({ error: 'Internal Server Error', message: err.message });
    }
  }

  /**
   * @openapi
   * /perfil:
   *   delete:
   *     summary: Solicita a exclusão da conta do usuário (Soft-Delete conforme LGPD)
   *     tags:
   *       - Perfil
   *     security:
   *       - bearerAuth: []
   *     responses:
   *       200:
   *         description: Conta desativada com sucesso (soft-delete LGPD).
   *       401:
   *         description: Não autorizado.
   */
  async deletePerfil(req: Request, res: Response): Promise<Response> {
    try {
      const usuarioId = req.user!.id;

      const usuario = await Usuario.findByPk(usuarioId);
      if (!usuario) {
        return res.status(404).json({ error: 'Not Found', message: 'Usuário não encontrado.' });
      }

      // Soft-delete: desativa a conta sem apagar os dados (conformidade LGPD)
      await usuario.update({ ativo: false });

      return res.status(200).json({
        message: 'Sua conta foi desativada com sucesso. Seus dados serão anonimizados em até 30 dias conforme a LGPD (Lei nº 13.709/2018).',
      });
    } catch (err: any) {
      return res.status(500).json({ error: 'Internal Server Error', message: err.message });
    }
  }
}

export default new PerfilController();
