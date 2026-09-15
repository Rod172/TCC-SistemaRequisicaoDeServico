/**
 * @file 20260913000002-create-notificacoes.js
 * @description Migration do Sequelize para criação da tabela `notificacoes`, no formato já previsto
 * pela US16 (Notificações no Sistema). Criada agora apenas para atender ao critério de aceite da
 * US07 ("notificar os prestadores" ao cancelar uma solicitação); os demais gatilhos (nova proposta,
 * chat, contador no header) permanecem escopo da própria US16.
 *
 * BIBLIOTECAS UTILIZADAS:
 * 1. Sequelize ORM (^6.37.3): Definição de tabelas e tipos SQL.
 *    Doc Oficial: https://sequelize.org/docs/v6/other-topics/migrations/
 */

'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('notificacoes', {
      id: {
        type: Sequelize.UUID,
        defaultValue: Sequelize.UUIDV4,
        primaryKey: true,
        allowNull: false,
      },
      usuario_id: {
        type: Sequelize.UUID,
        allowNull: false,
        references: { model: 'usuarios', key: 'id' },
        onDelete: 'CASCADE',
      },
      titulo: {
        type: Sequelize.STRING(180),
        allowNull: false,
      },
      mensagem: {
        type: Sequelize.TEXT,
        allowNull: false,
      },
      link_redirecionamento: {
        type: Sequelize.STRING(255),
        allowNull: true,
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
    await queryInterface.dropTable('notificacoes');
  },
};
