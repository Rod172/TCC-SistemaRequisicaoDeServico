/**
 * @file 20260913000007-create-preferencias-notificacao.js
 * @description Migration do Sequelize para criação da tabela `preferencias_notificacao` (US30 -
 * Configurações de Notificação). Só existe uma linha por (usuario_id, tipo_evento) quando o usuário
 * desvia do padrão (tudo ativado) — ausência de linha é tratada como "ativado" pelo service.
 *
 * BIBLIOTECAS UTILIZADAS:
 * 1. Sequelize ORM (^6.37.3): Definição de tabelas e tipos SQL.
 *    Doc Oficial: https://sequelize.org/docs/v6/other-topics/migrations/
 */

'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('preferencias_notificacao', {
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
      tipo_evento: {
        type: Sequelize.ENUM('NOVA_PROPOSTA', 'PROPOSTA_ACEITA_RECUSADA', 'NOVA_MENSAGEM_CHAT', 'SOLICITACAO_CANCELADA'),
        allowNull: false,
      },
      ativo: {
        type: Sequelize.BOOLEAN,
        allowNull: false,
        defaultValue: true,
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

    await queryInterface.addIndex('preferencias_notificacao', ['usuario_id', 'tipo_evento'], {
      unique: true,
      name: 'preferencias_notificacao_usuario_tipo_unique',
    });
  },

  down: async (queryInterface) => {
    await queryInterface.dropTable('preferencias_notificacao');
  },
};
