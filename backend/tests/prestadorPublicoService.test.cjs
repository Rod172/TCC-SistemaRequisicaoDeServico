/**
 * Testes isolados da US19, sem conexão ao banco e sem dependências novas.
 * Node.js (node:test/node:assert): https://nodejs.org/api/test.html
 * ts-node (já transitivo de ts-node-dev ^2.0.0): carrega o serviço TypeScript.
 * Documentação oficial: https://typestrong.org/ts-node/docs/
 * Executar no backend: node --test tests/prestadorPublicoService.test.cjs
 */
require('ts-node/register/transpile-only');
const { test } = require('node:test');
const assert = require('node:assert/strict');
const { Usuario, PrestadorPerfil, Avaliacao, Solicitacao } = require('../src/models');
const { PrestadorPublicoService } = require('../src/services/prestadorPublicoService');
const id = '11111111-1111-4111-8111-111111111111';
const servico = new PrestadorPublicoService();

test('US19: valida parâmetros antes de consultar o banco', async () => {
  for (const argumentos of [ ['inválido'], [id, '0'], [id, '1', '51'], [id, ['1']], [id, '10001'], [id, '1.5'], [id, '1', '1e1'] ]) {
    await assert.rejects(servico.buscarPerfilPublico(...argumentos), erro => erro.status === 400);
  }
});

test('US19: consultas públicas, reputação real e paginação', async (contexto) => {
  contexto.mock.method(Usuario, 'findOne', async opcoes => {
    assert.deepEqual(opcoes.where, { id, ativo: true, tipo_perfil: 'PRESTADOR' });
    assert.deepEqual(opcoes.attributes, ['id', 'nome', 'foto_url']);
    return { id, nome: 'Ana', foto_url: '/uploads/ana.png', email: 'privado', cpf: 'privado' };
  });
  contexto.mock.method(PrestadorPerfil, 'findOne', async opcoes => {
    assert.deepEqual(opcoes.attributes, ['descricao_bio', 'categorias']);
    return { descricao_bio: 'Pintora', categorias: ['Pintura'], nota_media_reputacao: 1, total_avaliacoes: 999 };
  });
  contexto.mock.method(Avaliacao, 'findOne', async opcoes => {
    assert.equal(opcoes.attributes[0][0].fn, 'AVG');
    assert.equal(opcoes.attributes[1][0].fn, 'COUNT');
    return { media: '4.666666', total: '3' };
  });
  contexto.mock.method(Solicitacao, 'count', async opcoes => {
    assert.deepEqual(opcoes.where, { status: 'CONCLUIDA' });
    assert.equal(opcoes.distinct, true);
    assert.equal(opcoes.include[0].required, true);
    assert.deepEqual(opcoes.include[0].where, { prestador_id: id, status: 'ACEITA' });
    return 2;
  });
  contexto.mock.method(Avaliacao, 'findAll', async opcoes => {
    assert.equal(opcoes.limit, 2);
    assert.equal(opcoes.offset, 2);
    assert.deepEqual(opcoes.order, [['created_at', 'DESC'], ['id', 'DESC']]);
    // Reproduz a hidratação com projeção explícita feita pelo Sequelize, sem banco.
    const avaliacao = Avaliacao.build({
      id: 'avaliacao', nota: 5, comentario: 'Ótimo', solicitante_id: 'autor',
      created_at: new Date('2026-10-01T12:00:00Z'),
    }, { isNewRecord: false, raw: true, attributes: opcoes.attributes });
    assert.equal(avaliacao.created_at, undefined);
    assert.equal(avaliacao.get('created_at').toISOString(), '2026-10-01T12:00:00.000Z');
    return [avaliacao];
  });
  contexto.mock.method(Usuario, 'findAll', async opcoes => {
    assert.deepEqual(opcoes.attributes, ['id', 'nome']);
    return [{ id: 'autor', nome: 'José', email: 'privado', cpf: 'privado' }];
  });
  const resposta = await servico.buscarPerfilPublico(id, '2', '2');
  assert.equal(resposta.nota_media_reputacao, 4.67);
  assert.equal(resposta.total_avaliacoes, 3);
  assert.equal(resposta.total_servicos_concluidos, 2);
  assert.equal(resposta.avaliacoes[0].nome_avaliador, 'José');
  assert.equal(JSON.parse(JSON.stringify(resposta)).avaliacoes[0].created_at, '2026-10-01T12:00:00.000Z');
  assert.deepEqual(resposta.paginacao, { pagina: 2, limite: 2, total: 3, total_paginas: 2 });
  assert.deepEqual(Object.keys(resposta.avaliacoes[0]).sort(), ['id', 'nota', 'comentario', 'created_at', 'nome_avaliador'].sort());
  assert.equal(JSON.stringify(resposta).includes('privado'), false);
  contexto.mock.restoreAll();
});

test('US19: sem prestador elegível retorna 404', async contexto => {
  contexto.mock.method(Usuario, 'findOne', async () => null);
  await assert.rejects(servico.buscarPerfilPublico(id), erro => erro.status === 404);
  contexto.mock.restoreAll();
});

test('US19: perfil sem biografia, foto ou avaliações tem estados vazios', async contexto => {
  contexto.mock.method(Usuario, 'findOne', async () => ({ id, nome: 'Ana' }));
  contexto.mock.method(PrestadorPerfil, 'findOne', async () => null);
  contexto.mock.method(Avaliacao, 'findOne', async () => ({ media: null, total: '0' }));
  contexto.mock.method(Solicitacao, 'count', async () => 0);
  contexto.mock.method(Avaliacao, 'findAll', async () => []);
  contexto.mock.method(Usuario, 'findAll', async () => { throw new Error('Não deve consultar autores sem avaliações.'); });
  const resposta = await servico.buscarPerfilPublico(id);
  assert.equal(resposta.nota_media_reputacao, 0);
  assert.equal(resposta.total_avaliacoes, 0);
  assert.equal(resposta.foto_url, null);
  assert.equal(resposta.descricao_bio, null);
  assert.deepEqual(resposta.categorias, []);
  assert.deepEqual(resposta.avaliacoes, []);
  assert.deepEqual(resposta.paginacao, { pagina: 1, limite: 10, total: 0, total_paginas: 0 });
  contexto.mock.restoreAll();
});
