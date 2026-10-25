/**
 * US25: integração dos seeds reais com MySQL migrado pelo ambiente de testes US26.
 * Jest: execução e asserções. https://jestjs.io/docs/api
 * Sequelize (^6.37.3): transação externa revertida ao final; não persiste fixtures.
 * Documentação oficial: https://sequelize.org/docs/v6/core-concepts/transactions/
 * Executar somente após coordenação do banco isolado, usando o projeto integracao do Jest.
 */
require('./ambiente.cjs')();
const { Sequelize, QueryTypes } = require('sequelize');
const configuracao = require('./sequelize-test.cjs').test;
const original = require('../src/seeders/20260901000001-demo-solicitacoes');
const completo = require('../src/seeders/20261025000001-demo-fluxo-completo');
const db = new Sequelize(configuracao.database, configuracao.username, configuracao.password, configuracao);
const solicitante = 'd0000000-0000-4000-8000-000000000001';
const eletricista = 'd0000000-0000-4000-8000-000000000002';
const encanadora = 'd0000000-0000-4000-8000-000000000003';
const concluida = 'd1000000-0000-4000-8000-000000000001';
const proposta = 'd1000000-0000-4000-8000-000000000002';
const contratadaOriginal = 'd0000000-0000-4000-8000-000000000008';
const avaliacaoExterna = 'd2000000-0000-4000-8000-000000000001';
const preferenciaExterna = 'd2000000-0000-4000-8000-000000000002';
let transaction;
let qi;

beforeAll(async () => {
  if (db.getDatabaseName() !== process.env.DB_NAME_TEST || !/_test$/.test(db.getDatabaseName())) {
    throw new Error('Teste recusado fora do banco isolado com sufixo _test.');
  }
  await db.authenticate();
  transaction = await db.transaction();
  const interfaceReal = db.getQueryInterface();
  // Ambos os seeds trabalham dentro da mesma transação de teste, inclusive o original.
  // A fachada evita alterar o singleton ou o comportamento de outras suítes.
  qi = {
    sequelize: {
      query: (sql, opcoes) => db.query(sql, { ...opcoes, transaction }),
      transaction: executar => executar(transaction),
    },
    bulkInsert: (tabela, registros, opcoes) => interfaceReal.bulkInsert(tabela, registros, { ...opcoes, transaction }),
    bulkDelete: (tabela, filtro, opcoes) => interfaceReal.bulkDelete(tabela, filtro, { ...opcoes, transaction }),
  };
});

afterAll(async () => {
  try { if (transaction && !transaction.finished) await transaction.rollback(); }
  finally { await db.close(); }
});

async function consultar(sql, replacements = {}) {
  return db.query(sql, { replacements, type: QueryTypes.SELECT, transaction });
}

async function registrosDoSeed() {
  const tabelas = ['solicitacoes', 'propostas', 'transacoes_custodia', 'avaliacoes', 'mensagens_chat',
    'notificacoes', 'preferencias_notificacao', 'perguntas_solicitacao', 'denuncias'];
  const resultado = {};
  for (const tabela of tabelas) {
    resultado[tabela] = await consultar(`SELECT * FROM \`${tabela}\` WHERE id LIKE 'd1000000-%' ORDER BY id`);
  }
  return resultado;
}

test('seed completo é idempotente, coerente e reversível sem remover contas ou avaliações externas', async () => {
  const existentes = await consultar('SELECT id FROM usuarios WHERE id LIKE :prefixo', { prefixo: 'd0000000-%' });
  if (existentes.length) throw new Error('O banco de teste já contém usuários demo. Use um banco de teste migrado sem seeds para esta suíte.');
  await original.up(qi);
  const perfisIniciais = await consultar('SELECT nota_media_reputacao, total_avaliacoes FROM prestadores_perfil WHERE usuario_id IN (:ids)', {
    ids: [eletricista, encanadora],
  });
  expect(perfisIniciais).toHaveLength(2);
  for (const perfil of perfisIniciais) {
    expect(Number(perfil.nota_media_reputacao)).toBe(0);
    expect(Number(perfil.total_avaliacoes)).toBe(0);
  }
  const inconsistentes = await consultar(`SELECT s.id FROM solicitacoes s JOIN propostas p ON p.solicitacao_id = s.id
    WHERE s.solicitante_id = :solicitante AND s.status = 'ABERTA'`, { solicitante });
  expect(inconsistentes).toHaveLength(0);
  const documentos = await consultar('SELECT cpf AS documento FROM usuarios WHERE id LIKE :prefixo UNION ALL SELECT cnpj_cpf AS documento FROM prestadores_perfil WHERE usuario_id LIKE :prefixo', { prefixo: 'd0000000-%' });
  for (const { documento } of documentos) expect(documento).toMatch(/^\d+$/);
  await completo.up(qi);
  const [reputacaoDemo] = await consultar('SELECT nota_media_reputacao, total_avaliacoes FROM prestadores_perfil WHERE usuario_id = :id', { id: eletricista });
  expect(Number(reputacaoDemo.nota_media_reputacao)).toBe(4.8);
  expect(Number(reputacaoDemo.total_avaliacoes)).toBe(5);
  await completo.down(qi);

  // Avaliação independente para comprovar que up/down recalculam em vez de zerar a média.
  await db.query('UPDATE solicitacoes SET status = :status WHERE id = :id', {
    replacements: { status: 'CONCLUIDA', id: contratadaOriginal }, transaction,
  });
  const agora = new Date();
  await qi.bulkInsert('avaliacoes', [{
    id: avaliacaoExterna, solicitacao_id: contratadaOriginal, solicitante_id: solicitante,
    prestador_id: eletricista, nota: 3, comentario: 'Avaliação independente do novo seed.',
    created_at: agora, updated_at: agora,
  }]);
  await completo.up(qi);
  const primeiraExecucao = await registrosDoSeed();
  await completo.up(qi);
  expect(await registrosDoSeed()).toEqual(primeiraExecucao);
  expect(Object.fromEntries(Object.entries(primeiraExecucao).map(([tabela, registros]) => [tabela, registros.length]))).toEqual({
    solicitacoes: 6, propostas: 6, transacoes_custodia: 5, avaliacoes: 5, mensagens_chat: 2,
    notificacoes: 2, preferencias_notificacao: 1, perguntas_solicitacao: 1, denuncias: 1,
  });
  const [servico] = primeiraExecucao.solicitacoes.filter(s => s.id === concluida);
  expect(servico.status).toBe('CONCLUIDA');
  expect(primeiraExecucao.propostas.find(p => p.id === proposta)).toMatchObject({ solicitacao_id: concluida, prestador_id: eletricista, status: 'ACEITA' });
  const [custodia] = primeiraExecucao.transacoes_custodia;
  expect(custodia).toMatchObject({ solicitacao_id: concluida, proposta_id: proposta, status_pagamento: 'LIBERADO' });
  expect(Number(custodia.valor)).toBe(180);
  expect(new Date(custodia.liberado_em).getTime()).toBeGreaterThan(new Date(custodia.retido_em).getTime());
  expect(primeiraExecucao.avaliacoes[0]).toMatchObject({ solicitacao_id: concluida, prestador_id: eletricista, solicitante_id: solicitante, nota: 5 });
  for (const mensagem of primeiraExecucao.mensagens_chat) {
    expect(mensagem).toMatchObject({ solicitacao_id: concluida, proposta_id: proposta });
    expect([solicitante, eletricista]).toContain(mensagem.emissor_id);
  }
  const [denuncia] = primeiraExecucao.denuncias;
  expect(denuncia.status).toBe('PENDENTE');
  expect(primeiraExecucao.propostas.some(p => p.solicitacao_id === denuncia.solicitacao_id && p.prestador_id === denuncia.denunciante_id)).toBe(true);
  expect(primeiraExecucao.perguntas_solicitacao[0].resposta).toBeTruthy();
  expect(primeiraExecucao.perguntas_solicitacao[0].respondida_em).toBeTruthy();
  const [reputacao] = await consultar('SELECT nota_media_reputacao, total_avaliacoes FROM prestadores_perfil WHERE usuario_id = :id', { id: eletricista });
  expect(Number(reputacao.nota_media_reputacao)).toBe(4.5);
  expect(Number(reputacao.total_avaliacoes)).toBe(6);
  const propostasDemo = await consultar('SELECT created_at, validade_ate FROM propostas WHERE prestador_id IN (:ids)', { ids: [eletricista, encanadora] });
  for (const registro of propostasDemo) {
    expect(new Date(registro.validade_ate).getTime() - new Date(registro.created_at).getTime()).toBe(7 * 24 * 60 * 60 * 1000);
  }

  await completo.down(qi);
  await completo.down(qi);
  for (const registros of Object.values(await registrosDoSeed())) expect(registros).toHaveLength(0);
  expect(await consultar('SELECT id FROM usuarios WHERE id LIKE :prefixo', { prefixo: 'd0000000-%' })).toHaveLength(4);
  expect(await consultar('SELECT id FROM avaliacoes WHERE id = :id', { id: avaliacaoExterna })).toHaveLength(1);
  const [restante] = await consultar('SELECT nota_media_reputacao, total_avaliacoes FROM prestadores_perfil WHERE usuario_id = :id', { id: eletricista });
  expect(Number(restante.nota_media_reputacao)).toBe(3);
  expect(Number(restante.total_avaliacoes)).toBe(1);

  // Uma preferência anterior do usuário sobrevive tanto à aplicação quanto à reversão.
  await qi.bulkInsert('preferencias_notificacao', [{
    id: preferenciaExterna, usuario_id: encanadora, tipo_evento: 'NOVA_MENSAGEM_CHAT', ativo: true,
    created_at: agora, updated_at: agora,
  }]);
  await completo.up(qi);
  await completo.down(qi);
  const [preferencia] = await consultar('SELECT ativo FROM preferencias_notificacao WHERE id = :id', { id: preferenciaExterna });
  expect(Number(preferencia.ativo)).toBe(1);
  await qi.bulkDelete('preferencias_notificacao', { id: preferenciaExterna });
  await qi.bulkDelete('avaliacoes', { id: avaliacaoExterna });
  await original.down(qi);
  expect(await consultar('SELECT id FROM usuarios WHERE id LIKE :prefixo', { prefixo: 'd0000000-%' })).toHaveLength(0);
});
