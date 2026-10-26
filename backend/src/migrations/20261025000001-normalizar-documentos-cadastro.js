/**
 * Sequelize (^6.37.3): transação e bloqueio das linhas para normalizar documentos legados.
 * Documentação oficial: https://sequelize.org/docs/v6/other-topics/migrations/
 * Executar com os cadastros suspensos para impedir inserções concorrentes durante a migração.
 * Não valida checksum dos legados nem altera a largura das colunas.
 */
'use strict';
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.sequelize.transaction(async transaction => {
      const planos = [];
      for (const [tabela, coluna] of [['usuarios', 'cpf'], ['prestadores_perfil', 'cnpj_cpf']]) {
        const linhas = await queryInterface.sequelize.query(
          `SELECT id, ${coluna} AS documento FROM ${tabela} FOR UPDATE`,
          { type: Sequelize.QueryTypes.SELECT, transaction }
        );
        const documentos = new Set();
        const alteracoes = [];
        for (const linha of linhas) {
          const documento = String(linha.documento ?? '').replace(/\D/g, '');
          if (documentos.has(documento)) {
            throw new Error('Normalização abortada: documentos duplicados após remover pontuação. Nenhum dado foi alterado.');
          }
          documentos.add(documento);
          if (documento !== linha.documento) alteracoes.push({ id: linha.id, documento });
        }
        planos.push({ tabela, coluna, alteracoes });
      }
      // As duas tabelas são verificadas antes da primeira escrita; qualquer falha reverte tudo.
      for (const { tabela, coluna, alteracoes } of planos) {
        for (const { id, documento } of alteracoes) {
          await queryInterface.bulkUpdate(tabela, { [coluna]: documento }, { id }, { transaction });
        }
      }
    });
  },
  async down() {
    // A pontuação original não pode ser reconstruída: mantém documentos normalizados.
  },
};
