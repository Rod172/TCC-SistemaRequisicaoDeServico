/**
 * @file adminService.ts
 * @description Serviço de regras de negócio do Painel Administrativo (US27): listagem/filtro de
 * usuários, ativação/desativação de contas com histórico administrativo transacional e listagem de
 * todas as solicitações da plataforma, independente do dono.
 *
 * BIBLIOTECAS UTILIZADAS:
 * 1. Sequelize ORM (^6.37.3): Consultas relacionais e filtros dinâmicos.
 *    Doc Oficial: https://sequelize.org/docs/v6/
 */

import { Op } from 'sequelize';
import { Usuario, Solicitacao, RegistroAdministrativo } from '../models';
import sequelize from '../config/database';
import { STATUS_SOLICITACAO } from '../models/Solicitacao';
import HttpError from '../utils/HttpError';

export interface ListarUsuariosFiltros {
  tipo_perfil?: string;
  status?: string; // 'ativo' | 'inativo'
  busca?: string;
}

export interface ListarSolicitacoesAdminFiltros {
  status?: string;
}

const TIPOS_VALIDOS = ['SOLICITANTE', 'PRESTADOR', 'ADMIN'];

export class AdminService {
  async listarUsuarios(filtros: ListarUsuariosFiltros) {
    const tipo_perfil = (filtros.tipo_perfil || '').trim().toUpperCase();
    const status = (filtros.status || '').trim().toLowerCase();
    const busca = (filtros.busca || '').trim();

    if (tipo_perfil && !TIPOS_VALIDOS.includes(tipo_perfil)) {
      throw new HttpError(400, `Tipo de perfil inválido. Valores aceitos: ${TIPOS_VALIDOS.join(', ')}.`);
    }
    if (status && !['ativo', 'inativo'].includes(status)) {
      throw new HttpError(400, 'Status inválido. Valores aceitos: ativo, inativo.');
    }

    const where: Record<string, unknown> = {};
    if (tipo_perfil) where.tipo_perfil = tipo_perfil;
    if (status) where.ativo = status === 'ativo';
    if (busca) {
      where[Op.or as any] = [
        { nome: { [Op.like]: `%${busca}%` } },
        { email: { [Op.like]: `%${busca}%` } },
      ];
    }

    const usuarios = await Usuario.findAll({
      where,
      attributes: { exclude: ['senha_hash'] },
      order: [['created_at', 'DESC']],
    });

    return usuarios.map((u) => u.get({ plain: true }));
  }

  async alterarStatusUsuario(adminId: string, usuarioId: string, ativo: boolean) {
    if (adminId === usuarioId) {
      throw new HttpError(400, 'Você não pode ativar/desativar a sua própria conta de administrador.');
    }

    return sequelize.transaction(async (transaction) => {
      const usuario = await Usuario.findByPk(usuarioId, { transaction, lock: transaction.LOCK.UPDATE });
      if (!usuario) throw new HttpError(404, 'Usuário não encontrado.');
      // Repetir o estado atual não é uma nova alteração administrativa.
      if (usuario.ativo !== ativo) {
        const anterior = usuario.ativo;
        const ocorridoEm = new Date();
        await usuario.update({ ativo, status_alterado_por: adminId, status_alterado_em: ocorridoEm }, { transaction });
        await RegistroAdministrativo.create({
          admin_id: adminId, usuario_id: usuarioId,
          acao: ativo ? 'ATIVAR_USUARIO' : 'DESATIVAR_USUARIO', ocorrido_em: ocorridoEm,
          estado_anterior: { ativo: anterior }, estado_posterior: { ativo },
        }, { transaction });
      }
      const { senha_hash: _senhaHash, ...usuarioSanitizado } = usuario.get({ plain: true }) as any;
      return usuarioSanitizado;
    });
  }

  async listarSolicitacoes(filtros: ListarSolicitacoesAdminFiltros) {
    const status = (filtros.status || '').trim().toUpperCase();
    if (status && !STATUS_SOLICITACAO.includes(status as any)) {
      throw new HttpError(400, `Status inválido. Valores aceitos: ${STATUS_SOLICITACAO.join(', ')}.`);
    }

    const where: Record<string, unknown> = {};
    if (status) where.status = status;

    const solicitacoes = await Solicitacao.findAll({
      where,
      attributes: ['id', 'titulo', 'status', 'categoria', 'cidade', 'bairro', 'created_at'],
      include: [{ model: Usuario, as: 'solicitante', attributes: ['id', 'nome', 'email'] }],
      order: [['created_at', 'DESC']],
    });

    return solicitacoes.map((s) => s.get({ plain: true }));
  }
}

export default new AdminService();
