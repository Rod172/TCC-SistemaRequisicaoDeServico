/**
 * @file 20260913000004-create-mensagens-chat.js
 * @description Migration do Sequelize para criação da tabela `mensagens_chat` (US14 - Chat Privado em
 * Tempo Real entre Solicitante e Prestador).
 *
 * BIBLIOTECAS UTILIZADAS:
 * 1. Sequelize ORM (^6.37.3): Definição de tabelas e tipos SQL.
 *    Doc Oficial: https://sequelize.org/docs/v6/other-topics/migrations/
 */

'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('mensagens_chat', {
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
      emissor_id: {
        type: Sequelize.UUID,
        allowNull: false,
        references: { model: 'usuarios', key: 'id' },
      },
      conteudo: {
        type: Sequelize.TEXT,
        allowNull: false,
      },
      lida: {
        type: Sequelize.BOOLEAN,
        allowNull: false,
        defaultValue: false,
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
    await queryInterface.dropTable('mensagens_chat');
  },
};
