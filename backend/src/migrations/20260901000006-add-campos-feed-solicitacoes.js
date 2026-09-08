/**
 * @file 20260901000006-add-campos-feed-solicitacoes.js
 * @description Migration do Sequelize que adiciona categoria, cidade, bairro e orçamento do cliente
 * à tabela `solicitacoes`, necessários para o feed de oportunidades do prestador (US08/US09/US10).
 *
 * BIBLIOTECAS UTILIZADAS:
 * 1. Sequelize ORM (^6.37.3): Definição de tabelas e tipos SQL.
 *    Doc Oficial: https://sequelize.org/docs/v6/other-topics/migrations/
 */

'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.addColumn('solicitacoes', 'categoria', {
      type: Sequelize.STRING(100),
      allowNull: true,
    });
    await queryInterface.addColumn('solicitacoes', 'cidade', {
      type: Sequelize.STRING(100),
      allowNull: true,
    });
    await queryInterface.addColumn('solicitacoes', 'bairro', {
      type: Sequelize.STRING(100),
      allowNull: true,
    });
    await queryInterface.addColumn('solicitacoes', 'orcamento_cliente', {
      type: Sequelize.DECIMAL(10, 2),
      allowNull: true,
    });
  },

  down: async (queryInterface) => {
    await queryInterface.removeColumn('solicitacoes', 'categoria');
    await queryInterface.removeColumn('solicitacoes', 'cidade');
    await queryInterface.removeColumn('solicitacoes', 'bairro');
    await queryInterface.removeColumn('solicitacoes', 'orcamento_cliente');
  },
};
