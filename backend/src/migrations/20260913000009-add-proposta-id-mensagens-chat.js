/**
 * @file 20260913000009-add-proposta-id-mensagens-chat.js
 * @description Migration do Sequelize que adiciona `proposta_id` em `mensagens_chat` (US34 — Negociação
 * por Chat Antes da Contratação): o chat passa a ser uma conversa por proposta (permite múltiplos
 * prestadores concorrentes conversando com o mesmo solicitante, cada um na sua própria sala), em vez de
 * uma única conversa por solicitação. Faz o backfill das mensagens existentes usando a proposta `ACEITA`
 * de cada solicitação (era o único critério de acesso ao chat antes desta história).
 *
 * BIBLIOTECAS UTILIZADAS:
 * 1. Sequelize ORM (^6.37.3): Definição de tabelas e tipos SQL.
 *    Doc Oficial: https://sequelize.org/docs/v6/other-topics/migrations/
 */

'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.addColumn('mensagens_chat', 'proposta_id', {
      type: Sequelize.UUID,
      allowNull: true,
      references: { model: 'propostas', key: 'id' },
      onDelete: 'CASCADE',
    });

    await queryInterface.sequelize.query(`
      UPDATE mensagens_chat m
      JOIN propostas p ON p.solicitacao_id = m.solicitacao_id AND p.status = 'ACEITA'
      SET m.proposta_id = p.id
      WHERE m.proposta_id IS NULL
    `);

    await queryInterface.addIndex('mensagens_chat', ['proposta_id']);
  },

  down: async (queryInterface) => {
    await queryInterface.removeColumn('mensagens_chat', 'proposta_id');
  },
};
