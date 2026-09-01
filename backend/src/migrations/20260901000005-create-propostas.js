/**
 * @file 20260901000005-create-propostas.js
 * @description Migration do Sequelize para criação da tabela `propostas` (US11 - Comparação de Propostas / US12 - Aceite de Contratação).
 *
 * BIBLIOTECAS UTILIZADAS:
 * 1. Sequelize ORM (^6.37.3): Definição de tabelas e tipos SQL.
 *    Doc Oficial: https://sequelize.org/docs/v6/other-topics/migrations/
 */

'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('propostas', {
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
        onDelete: 'CASCADE',
      },
      valor: {
        type: Sequelize.DECIMAL(10, 2),
        allowNull: false,
      },
      prazo_dias: {
        type: Sequelize.INTEGER.UNSIGNED,
        allowNull: false,
      },
      mensagem: {
        type: Sequelize.TEXT,
        allowNull: false,
      },
      status: {
        type: Sequelize.ENUM('ENVIADA', 'EM_ANALISE', 'ACEITA', 'RECUSADA'),
        allowNull: false,
        defaultValue: 'ENVIADA',
      },
      valor_contraproposta: {
        type: Sequelize.DECIMAL(10, 2),
        allowNull: true,
      },
      mensagem_contraproposta: {
        type: Sequelize.TEXT,
        allowNull: true,
      },
      contraproposta_em: {
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
    await queryInterface.dropTable('propostas');
  },
};
