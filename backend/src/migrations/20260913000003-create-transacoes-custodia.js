/**
 * @file 20260913000003-create-transacoes-custodia.js
 * @description Migration do Sequelize para criação da tabela `transacoes_custodia` (US13 - Simulação
 * de Pagamento e Retenção de Valor / Escrow). A liberação do valor (dependente da conclusão do
 * serviço, US17) não é implementada aqui — apenas a retenção simulada no aceite da proposta.
 *
 * BIBLIOTECAS UTILIZADAS:
 * 1. Sequelize ORM (^6.37.3): Definição de tabelas e tipos SQL.
 *    Doc Oficial: https://sequelize.org/docs/v6/other-topics/migrations/
 */

'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('transacoes_custodia', {
      id: {
        type: Sequelize.UUID,
        defaultValue: Sequelize.UUIDV4,
        primaryKey: true,
        allowNull: false,
      },
      solicitacao_id: {
        type: Sequelize.UUID,
        allowNull: false,
        unique: true,
        references: { model: 'solicitacoes', key: 'id' },
        onDelete: 'CASCADE',
      },
      proposta_id: {
        type: Sequelize.UUID,
        allowNull: false,
        unique: true,
        references: { model: 'propostas', key: 'id' },
        onDelete: 'CASCADE',
      },
      valor: {
        type: Sequelize.DECIMAL(10, 2),
        allowNull: false,
      },
      status_pagamento: {
        type: Sequelize.ENUM('RETIDO', 'LIBERADO', 'REEMBOLSADO'),
        allowNull: false,
        defaultValue: 'RETIDO',
      },
      metodo_pagamento: {
        type: Sequelize.ENUM('CARTAO_TESTE', 'PIX_TESTE'),
        allowNull: false,
      },
      referencia_simulada: {
        type: Sequelize.STRING(120),
        allowNull: false,
        unique: true,
      },
      retido_em: {
        type: Sequelize.DATE,
        allowNull: false,
      },
      liberado_em: {
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
    await queryInterface.dropTable('transacoes_custodia');
  },
};
