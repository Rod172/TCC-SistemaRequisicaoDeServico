/**
 * @description Validade comercial das propostas (US10), independente do prazo de execução.
 * Sequelize ORM (^6.37.3): alteração de coluna e preenchimento dos registros legados.
 * Documentação oficial: https://sequelize.org/docs/v6/other-topics/migrations/
 */
'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    // MySQL faz commit implícito em DDL; cada etapa pode ser retomada após uma interrupção.
    const colunas = await queryInterface.describeTable('propostas');
    if (!colunas.validade_ate) {
      await queryInterface.addColumn('propostas', 'validade_ate', {
        type: Sequelize.DATE,
        allowNull: true,
      });
    }
    // Preserva a data original: propostas antigas não ganham mais sete dias na implantação.
    await queryInterface.sequelize.query(`
      UPDATE propostas
      SET validade_ate = DATE_ADD(created_at, INTERVAL 7 DAY)
      WHERE validade_ate IS NULL
    `);
    await queryInterface.changeColumn('propostas', 'validade_ate', {
      type: Sequelize.DATE,
      allowNull: false,
    });
  },

  async down(queryInterface) {
    await queryInterface.removeColumn('propostas', 'validade_ate');
  },
};
