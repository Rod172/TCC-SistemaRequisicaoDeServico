/**
 * US27: histórico persistente de cada mudança administrativa efetiva.
 * Sequelize (^6.37.3): migration, JSON e chaves estrangeiras que preservam o histórico.
 * Documentação oficial: https://sequelize.org/docs/v6/other-topics/migrations/
 */
'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('registros_administrativos', {
      id: { type: Sequelize.UUID, primaryKey: true, allowNull: false },
      admin_id: { type: Sequelize.UUID, allowNull: false,
        references: { model: 'usuarios', key: 'id' }, onDelete: 'RESTRICT', onUpdate: 'CASCADE' },
      usuario_id: { type: Sequelize.UUID, allowNull: true,
        references: { model: 'usuarios', key: 'id' }, onDelete: 'RESTRICT', onUpdate: 'CASCADE' },
      denuncia_id: { type: Sequelize.UUID, allowNull: true,
        references: { model: 'denuncias', key: 'id' }, onDelete: 'RESTRICT', onUpdate: 'CASCADE' },
      acao: { type: Sequelize.ENUM('ATIVAR_USUARIO', 'DESATIVAR_USUARIO', 'RESOLVER_DENUNCIA'), allowNull: false },
      ocorrido_em: { type: Sequelize.DATE, allowNull: false },
      estado_anterior: { type: Sequelize.JSON, allowNull: false },
      estado_posterior: { type: Sequelize.JSON, allowNull: false },
    });
    await queryInterface.addIndex('registros_administrativos', ['admin_id', 'ocorrido_em']);
    await queryInterface.addIndex('registros_administrativos', ['usuario_id', 'ocorrido_em']);
    await queryInterface.addIndex('registros_administrativos', ['denuncia_id', 'ocorrido_em']);
  },
  async down(queryInterface) {
    await queryInterface.dropTable('registros_administrativos');
  },
};
