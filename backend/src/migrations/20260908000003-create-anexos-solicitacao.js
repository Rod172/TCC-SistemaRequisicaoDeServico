/**
 * @file 20260908000003-create-anexos-solicitacao.js
 * @description Migration do Sequelize para criação da tabela `anexos_solicitacao` (US05 - upload de
 * fotos/documentos ao publicar uma solicitação de serviço).
 *
 * BIBLIOTECAS UTILIZADAS:
 * 1. Sequelize ORM (^6.37.3): Definição de tabelas e tipos SQL.
 *    Doc Oficial: https://sequelize.org/docs/v6/other-topics/migrations/
 */

'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('anexos_solicitacao', {
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
      url_arquivo: {
        type: Sequelize.STRING(500),
        allowNull: false,
      },
      nome_original: {
        type: Sequelize.STRING(255),
        allowNull: false,
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
    await queryInterface.dropTable('anexos_solicitacao');
  },
};
