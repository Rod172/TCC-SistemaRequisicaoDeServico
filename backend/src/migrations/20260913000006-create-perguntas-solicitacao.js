/**
 * @file 20260913000006-create-perguntas-solicitacao.js
 * @description Migration do Sequelize para criação da tabela `perguntas_solicitacao` (US29 - Perguntas
 * e Respostas Públicas na Oportunidade).
 *
 * BIBLIOTECAS UTILIZADAS:
 * 1. Sequelize ORM (^6.37.3): Definição de tabelas e tipos SQL.
 *    Doc Oficial: https://sequelize.org/docs/v6/other-topics/migrations/
 */

'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('perguntas_solicitacao', {
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
      prestador_id: {
        type: Sequelize.UUID,
        allowNull: false,
        references: { model: 'usuarios', key: 'id' },
      },
      pergunta: {
        type: Sequelize.TEXT,
        allowNull: false,
      },
      resposta: {
        type: Sequelize.TEXT,
        allowNull: true,
      },
      respondida_em: {
        type: Sequelize.DATE,
        allowNull: true,
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
    await queryInterface.dropTable('perguntas_solicitacao');
  },
};
