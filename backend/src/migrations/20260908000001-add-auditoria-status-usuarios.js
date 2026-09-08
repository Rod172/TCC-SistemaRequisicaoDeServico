/**
 * @file 20260908000001-add-auditoria-status-usuarios.js
 * @description Migration do Sequelize que adiciona colunas de auditoria simples (quem e quando)
 * para a ativação/desativação administrativa de contas (US27 - Painel Administrativo).
 *
 * BIBLIOTECAS UTILIZADAS:
 * 1. Sequelize ORM (^6.37.3): Definição de tabelas e tipos SQL.
 *    Doc Oficial: https://sequelize.org/docs/v6/other-topics/migrations/
 */

'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.addColumn('usuarios', 'status_alterado_por', {
      type: Sequelize.UUID,
      allowNull: true,
      references: { model: 'usuarios', key: 'id' },
    });
    await queryInterface.addColumn('usuarios', 'status_alterado_em', {
      type: Sequelize.DATE,
      allowNull: true,
    });
  },

  down: async (queryInterface) => {
    await queryInterface.removeColumn('usuarios', 'status_alterado_por');
    await queryInterface.removeColumn('usuarios', 'status_alterado_em');
  },
};
