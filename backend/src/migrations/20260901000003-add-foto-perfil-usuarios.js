/**
 * @file 20260901000003-add-foto-perfil-usuarios.js
 * @description Migration do Sequelize que adiciona a coluna `foto_url` à tabela `usuarios` (US04 - Foto de Perfil).
 *
 * BIBLIOTECAS UTILIZADAS:
 * 1. Sequelize ORM (^6.37.3): Definição de tabelas e tipos SQL.
 *    Doc Oficial: https://sequelize.org/docs/v6/other-topics/migrations/
 */

'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.addColumn('usuarios', 'foto_url', {
      type: Sequelize.STRING(500),
      allowNull: true,
    });
  },

  down: async (queryInterface) => {
    await queryInterface.removeColumn('usuarios', 'foto_url');
  }
};
