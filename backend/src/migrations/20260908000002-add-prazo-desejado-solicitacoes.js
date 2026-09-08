/**
 * @file 20260908000002-add-prazo-desejado-solicitacoes.js
 * @description Migration do Sequelize que adiciona o prazo estimado desejado pelo solicitante à
 * tabela `solicitacoes` (US05 - Publicação de Nova Solicitação de Serviço).
 *
 * BIBLIOTECAS UTILIZADAS:
 * 1. Sequelize ORM (^6.37.3): Definição de tabelas e tipos SQL.
 *    Doc Oficial: https://sequelize.org/docs/v6/other-topics/migrations/
 */

'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.addColumn('solicitacoes', 'prazo_desejado_dias', {
      type: Sequelize.INTEGER.UNSIGNED,
      allowNull: true,
    });
  },

  down: async (queryInterface) => {
    await queryInterface.removeColumn('solicitacoes', 'prazo_desejado_dias');
  },
};
