/**
 * @file 20260901000002-create-prestadores-perfil.js
 * @description Migration do Sequelize para criação da tabela `prestadores_perfil` no MySQL.
 * 
 * BIBLIOTECAS UTILIZADAS:
 * 1. Sequelize ORM (^6.37.3): Mapeamento e chaves estrangeiras.
 *    Doc Oficial: https://sequelize.org/docs/v6/other-topics/migrations/
 */

'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('prestadores_perfil', {
      id: {
        type: Sequelize.UUID,
        defaultValue: Sequelize.UUIDV4,
        primaryKey: true,
        allowNull: false
      },
      usuario_id: {
        type: Sequelize.UUID,
        allowNull: false,
        references: {
          model: 'usuarios',
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE'
      },
      cnpj_cpf: {
        type: Sequelize.STRING(20),
        allowNull: false
      },
      descricao_bio: {
        type: Sequelize.TEXT,
        allowNull: true
      },
      categorias: {
        type: Sequelize.JSON,
        allowNull: false
      },
      nota_media_reputacao: {
        type: Sequelize.DECIMAL(3, 2),
        allowNull: false,
        defaultValue: 0.00
      },
      total_avaliacoes: {
        type: Sequelize.INTEGER,
        allowNull: false,
        defaultValue: 0
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
    await queryInterface.dropTable('prestadores_perfil');
  }
};
