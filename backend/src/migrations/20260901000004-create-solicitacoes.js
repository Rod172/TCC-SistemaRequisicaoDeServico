/**
 * @file 20260901000004-create-solicitacoes.js
 * @description Migration do Sequelize para criação da tabela `solicitacoes` (US06 - Painel "Minhas Solicitações").
 *
 * BIBLIOTECAS UTILIZADAS:
 * 1. Sequelize ORM (^6.37.3): Definição de tabelas e tipos SQL.
 *    Doc Oficial: https://sequelize.org/docs/v6/other-topics/migrations/
 */

'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('solicitacoes', {
      id: {
        type: Sequelize.UUID,
        defaultValue: Sequelize.UUIDV4,
        primaryKey: true,
        allowNull: false,
      },
      solicitante_id: {
        type: Sequelize.UUID,
        allowNull: false,
        references: { model: 'usuarios', key: 'id' },
        onDelete: 'CASCADE',
      },
      titulo: {
        type: Sequelize.STRING(180),
        allowNull: false,
      },
      descricao: {
        type: Sequelize.TEXT,
        allowNull: false,
      },
      status: {
        type: Sequelize.ENUM('ABERTA', 'EM_NEGOCIACAO', 'CONTRATADA', 'CONCLUIDA', 'CANCELADA'),
        allowNull: false,
        defaultValue: 'ABERTA',
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
    await queryInterface.dropTable('solicitacoes');
  },
};
