/** US35: resposta à contraproposta. Sequelize 6: migrations e tipos SQL.
 * Documentação: https://sequelize.org/docs/v6/other-topics/migrations/ */
'use strict';
module.exports = {
  async up(qi, Sequelize) {
    await qi.addColumn('propostas', 'contraproposta_status', { type: Sequelize.ENUM('PENDENTE', 'ACEITA', 'RECUSADA'), allowNull: true });
    await qi.addColumn('propostas', 'contraproposta_respondida_em', { type: Sequelize.DATE, allowNull: true });
    await qi.sequelize.query("UPDATE propostas SET contraproposta_status = 'PENDENTE' WHERE status = 'EM_ANALISE' AND valor_contraproposta IS NOT NULL");
  },
  async down(qi) {
    await qi.removeColumn('propostas', 'contraproposta_respondida_em');
    await qi.removeColumn('propostas', 'contraproposta_status');
  },
};
