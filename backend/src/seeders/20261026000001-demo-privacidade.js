/** Sequelize CLI: protocolo fictício reversível e idempotente para a banca (US40).
 * https://sequelize.org/docs/v6/other-topics/migrations/ */
'use strict';
const id = 'f4000000-0000-4000-8000-000000000001';
module.exports = {
 async up(q) {
  const [usuarios] = await q.sequelize.query("SELECT id FROM usuarios WHERE id = 'd0000000-0000-4000-8000-000000000001'");
  const [existentes] = await q.sequelize.query('SELECT id FROM solicitacoes_privacidade WHERE id = :id', { replacements: {id} });
  if (!usuarios.length || existentes.length) return;
  await q.bulkInsert('solicitacoes_privacidade', [{ id, usuario_id: usuarios[0].id, tipo: 'INFORMACAO', descricao: 'Protocolo fictício para demonstrar o atendimento de privacidade à banca. Solicito informações sobre a retenção de dados no protótipo.', status: 'PENDENTE', created_at: new Date(), updated_at: new Date() }]);
 },
 async down(q) { await q.bulkDelete('solicitacoes_privacidade', {id}); }
};
