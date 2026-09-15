/**
 * @file 20260913000008-create-denuncias.js
 * @description Migration do Sequelize para criação da tabela `denuncias` (US32 - Denúncia de
 * Solicitação para Moderação).
 *
 * BIBLIOTECAS UTILIZADAS:
 * 1. Sequelize ORM (^6.37.3): Definição de tabelas e tipos SQL.
 *    Doc Oficial: https://sequelize.org/docs/v6/other-topics/migrations/
 */

'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('denuncias', {
      id: {
        type: Sequelize.UUID,
        defaultValue: Sequelize.UUIDV4,
        primaryKey: true,
        allowNull: false,
      },
      solicitacao_id: {
        type: Sequelize.UUID,
        allowNull: false,
        references: { model: 'solicitacoes', key: 'id' },
        onDelete: 'CASCADE',
      },
      denunciante_id: {
        type: Sequelize.UUID,
        allowNull: false,
        references: { model: 'usuarios', key: 'id' },
      },
      motivo: {
        type: Sequelize.TEXT,
        allowNull: false,
      },
      status: {
        type: Sequelize.ENUM('PENDENTE', 'RESOLVIDA'),
        allowNull: false,
        defaultValue: 'PENDENTE',
      },
      created_at: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.fn('NOW'),
      },
      updated_at: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.fn('NOW'),
      },
    });
  },

  down: async (queryInterface) => {
    await queryInterface.dropTable('denuncias');
  },
};
