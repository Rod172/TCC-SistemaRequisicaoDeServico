/** Sequelize CLI 6: evolução aditiva, sem inventar aceite para contas legadas.
 * https://sequelize.org/docs/v6/other-topics/migrations/ */
'use strict';
module.exports = {
 async up(q, S) {
  await q.addColumn('usuarios', 'termos_uso_versao', { type: S.STRING(40), allowNull: true });
  await q.addColumn('usuarios', 'privacidade_versao', { type: S.STRING(40), allowNull: true });
  await q.addColumn('usuarios', 'documentos_aceitos_em', { type: S.DATE, allowNull: true });
  await q.createTable('solicitacoes_privacidade', {
   id: { type: S.UUID, primaryKey: true, allowNull: false },
   usuario_id: { type: S.UUID, allowNull: false, references: { model: 'usuarios', key: 'id' }, onDelete: 'CASCADE' },
   tipo: { type: S.ENUM('ACESSO','CORRECAO','EXCLUSAO','INFORMACAO','REVOGACAO'), allowNull: false },
   descricao: { type: S.TEXT, allowNull: false },
   status: { type: S.ENUM('PENDENTE','RESPONDIDA'), allowNull: false, defaultValue: 'PENDENTE' },
   resposta: { type: S.TEXT, allowNull: true },
   respondida_por: { type: S.UUID, allowNull: true, references: { model: 'usuarios', key: 'id' } },
   respondida_em: { type: S.DATE, allowNull: true },
   created_at: { type: S.DATE, allowNull: false }, updated_at: { type: S.DATE, allowNull: false },
  });
  await q.addIndex('solicitacoes_privacidade', ['usuario_id','created_at']);
 },
 async down(q) {
  await q.dropTable('solicitacoes_privacidade');
  for (const campo of ['documentos_aceitos_em','privacidade_versao','termos_uso_versao']) await q.removeColumn('usuarios',campo);
 }
};
