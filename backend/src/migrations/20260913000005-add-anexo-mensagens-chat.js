/**
 * @file 20260913000005-add-anexo-mensagens-chat.js
 * @description Migration do Sequelize para permitir anexos (imagem/PDF) nas mensagens de chat (US15).
 * `conteudo` passa a ser opcional (uma mensagem pode ser só um anexo, sem texto).
 *
 * BIBLIOTECAS UTILIZADAS:
 * 1. Sequelize ORM (^6.37.3): Definição de tabelas e tipos SQL.
 *    Doc Oficial: https://sequelize.org/docs/v6/other-topics/migrations/
 */

'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.changeColumn('mensagens_chat', 'conteudo', {
      type: Sequelize.TEXT,
      allowNull: true,
    });
    await queryInterface.addColumn('mensagens_chat', 'anexo_url', {
      type: Sequelize.STRING(500),
      allowNull: true,
    });
    await queryInterface.addColumn('mensagens_chat', 'anexo_nome_original', {
      type: Sequelize.STRING(255),
      allowNull: true,
    });
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.removeColumn('mensagens_chat', 'anexo_url');
    await queryInterface.removeColumn('mensagens_chat', 'anexo_nome_original');
    await queryInterface.changeColumn('mensagens_chat', 'conteudo', {
      type: Sequelize.TEXT,
      allowNull: false,
    });
  },
};
