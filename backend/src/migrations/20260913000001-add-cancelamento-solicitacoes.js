/**
 * @file 20260913000001-add-cancelamento-solicitacoes.js
 * @description Migration do Sequelize para adicionar os campos de cancelamento (motivo e data) à
 * tabela `solicitacoes` (US07 - Cancelamento de Solicitação de Serviço).
 *
 * BIBLIOTECAS UTILIZADAS:
 * 1. Sequelize ORM (^6.37.3): Definição de tabelas e tipos SQL.
 *    Doc Oficial: https://sequelize.org/docs/v6/other-topics/migrations/
 */

'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.addColumn('solicitacoes', 'motivo_cancelamento', {
      type: Sequelize.TEXT,
      allowNull: true,
    });
    await queryInterface.addColumn('solicitacoes', 'cancelada_em', {
      type: Sequelize.DATE,
      allowNull: true,
    });
  },

  down: async (queryInterface) => {
    await queryInterface.removeColumn('solicitacoes', 'motivo_cancelamento');
    await queryInterface.removeColumn('solicitacoes', 'cancelada_em');
  },
};
