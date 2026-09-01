/**
 * @file 20260901000001-create-usuarios.js
 * @description Migration do Sequelize para criação da tabela `usuarios` no MySQL.
 * 
 * BIBLIOTECAS UTILIZADAS:
 * 1. Sequelize ORM (^6.37.3): Definição de tabelas e tipos SQL.
 *    Doc Oficial: https://sequelize.org/docs/v6/other-topics/migrations/
 */

'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('usuarios', {
      id: {
        type: Sequelize.UUID,
        defaultValue: Sequelize.UUIDV4,
        primaryKey: true,
        allowNull: false
      },
      nome: {
        type: Sequelize.STRING(150),
        allowNull: false
      },
      email: {
        type: Sequelize.STRING(150),
        allowNull: false,
        unique: true
      },
      cpf: {
        type: Sequelize.STRING(14),
        allowNull: false,
        unique: true
      },
      telefone: {
        type: Sequelize.STRING(20),
        allowNull: false
      },
      endereco: {
        type: Sequelize.STRING(255),
        allowNull: true
      },
      senha_hash: {
        type: Sequelize.STRING(255),
        allowNull: false
      },
      tipo_perfil: {
        type: Sequelize.ENUM('SOLICITANTE', 'PRESTADOR', 'ADMIN'),
        allowNull: false,
        defaultValue: 'SOLICITANTE'
      },
      termo_lgpd_aceito: {
        type: Sequelize.BOOLEAN,
        allowNull: false,
        defaultValue: false
      },
      termo_lgpd_aceito_em: {
        type: Sequelize.DATE,
        allowNull: true
      },
      ativo: {
        type: Sequelize.BOOLEAN,
        allowNull: false,
        defaultValue: true
      },
      created_at: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.fn('NOW')
      },
      updated_at: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.fn('NOW')
      }
    });
  },

  down: async (queryInterface) => {
    await queryInterface.dropTable('usuarios');
  }
};
