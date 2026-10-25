/**
 * US10: validade comercial e limites de entrada; testes isolados, sem banco ou dependências novas.
 * Node.js (node:test, node:assert): https://nodejs.org/api/test.html
 * ts-node (transitivo de ts-node-dev): https://typestrong.org/ts-node/docs/
 * Sequelize ORM (^6.37.3), modelos simulados: https://sequelize.org/docs/v6/
 * Executar no backend: node --test tests/validade-comercial.test.cjs
 */
require('ts-node/register/transpile-only');
const { test } = require('node:test');
const assert = require('node:assert/strict');
const db = require('../src/config/database').default;
const { Solicitacao, Proposta, Usuario, TransacaoCustodia } = require('../src/models');
const { SolicitacaoService } = require('../src/services/solicitacaoService');
const { OportunidadeService } = require('../src/services/oportunidadeService');
const preferencias = require('../src/services/preferenciaNotificacaoService').default;
const migracao = require('../src/migrations/20261025000002-add-validade-comercial-propostas');
const Sequelize = require('sequelize');
const solicitacoes = new SolicitacaoService();
const oportunidades = new OportunidadeService();
const propostaValida = { valor: 250, prazo_dias: 3, mensagem: 'Execução completa do serviço.' };
const dadosSolicitacao = { titulo: 'Reparo elétrico', descricao: 'Revisar tomadas e substituir componentes.' };
const conflito = erro => erro.status === 409;
const invalido = erro => erro.status === 400;
function transacao(contexto) {
  const tx = { LOCK: { UPDATE: 'UPDATE' }, afterCommit() {} };
  contexto.mock.method(db, 'transaction', async callback => callback(tx));
  return tx;
}

test('US10: validade e valor inválidos são rejeitados antes de abrir transação', async contexto => {
  contexto.mock.method(db, 'transaction', () => { throw new Error('Não deve consultar o banco'); });
  for (const validade_dias of [0, -1, 366, 1.5, NaN, Infinity, null, '7']) {
    await assert.rejects(oportunidades.enviarProposta('s', 'p', { ...propostaValida, validade_dias }), invalido);
  }
  for (const valor of [0, -1, NaN, Infinity, 100000000]) {
    await assert.rejects(oportunidades.enviarProposta('s', 'p', { ...propostaValida, valor }), invalido);
  }
});

for (const dias of [undefined, 1, 365]) {
  test(`US10: persiste validade ${dias ?? 'padrão de 7'} dias e respeita lock no pai`, async contexto => {
    const tx = transacao(contexto);
    contexto.mock.method(Solicitacao, 'findOne', async opcoes => {
      assert.equal(opcoes.transaction, tx);
      assert.equal(opcoes.lock, 'UPDATE');
      return { solicitante_id: 'cliente', update: async () => {} };
    });
    contexto.mock.method(Proposta, 'findOne', async opcoes => {
      assert.equal(opcoes.transaction, tx);
      assert.equal(opcoes.lock, 'UPDATE');
      return null;
    });
    let gravada;
    contexto.mock.method(Proposta, 'create', async dados => {
      gravada = dados;
      return { get: () => dados };
    });
    contexto.mock.method(Usuario, 'findByPk', async () => ({ nome: 'Prestador' }));
    contexto.mock.method(preferencias, 'estaAtivado', async () => false);
    const antes = Date.now();
    await oportunidades.enviarProposta('s', 'p', { ...propostaValida, valor: 99999999.99, validade_dias: dias });
    const duracao = (dias ?? 7) * 86400000;
    assert.ok(gravada.validade_ate.getTime() >= antes + duracao);
    assert.ok(gravada.validade_ate.getTime() <= Date.now() + duracao);
    assert.equal(gravada.valor, 99999999.99);
  });
}

test('US10: detalhe inclui validade da minha proposta', async contexto => {
  contexto.mock.method(Solicitacao, 'findOne', async () => ({ status: 'EM_NEGOCIACAO', get: () => ({}) }));
  contexto.mock.method(Proposta, 'findOne', async opcoes => {
    assert.ok(opcoes.attributes.includes('validade_ate'));
    return null;
  });
  await oportunidades.buscarOportunidade('s', 'p');
});

for (const acao of ['ACEITAR', 'RENEGOCIAR']) {
  test(`US10: ${acao} expirada retorna 409 após locks e sem escrita`, async contexto => {
    const tx = transacao(contexto);
    const ordem = [];
    contexto.mock.method(Solicitacao, 'findOne', async opcoes => {
      assert.equal(opcoes.transaction, tx);
      assert.equal(opcoes.lock, 'UPDATE');
      ordem.push('pai');
      return { status: 'EM_NEGOCIACAO', solicitante_id: 'cliente' };
    });
    contexto.mock.method(Proposta, 'findOne', async opcoes => {
      assert.deepEqual(ordem, ['pai']);
      assert.equal(opcoes.transaction, tx);
      assert.equal(opcoes.lock, 'UPDATE');
      return { status: 'ENVIADA', prestador_id: 'p', validade_ate: new Date(Date.now() - 1),
        update() { throw new Error('Não pode escrever proposta expirada'); } };
    });
    const chamada = acao === 'ACEITAR'
      ? solicitacoes.atualizarStatusProposta('cliente', 's', 'p', 'ACEITAR')
      : solicitacoes.renegociarProposta('cliente', 's', 'p', 200, 'Novo valor sugerido');
    await assert.rejects(chamada, erro => conflito(erro) && /expirou/.test(erro.message));
  });
}

test('US05: rejeita textos e números inválidos com 400 antes da transação', async contexto => {
  contexto.mock.method(db, 'transaction', () => { throw new Error('Não deve consultar o banco'); });
  const alteracoes = [
    { titulo: 123 }, { titulo: [] }, { titulo: null }, { titulo: 'a'.repeat(181) },
    { descricao: {} }, { descricao: false }, { descricao: null },
    ...[-1, NaN, Infinity, 100000000].map(orcamento_cliente => ({ orcamento_cliente })),
    ...[-1, 0, 366, 1.5, NaN, Infinity].map(prazo_desejado_dias => ({ prazo_desejado_dias })),
  ];
  for (const alteracao of alteracoes) {
    await assert.rejects(solicitacoes.criarSolicitacao('cliente', { ...dadosSolicitacao, ...alteracao }, []), invalido);
  }
});

test('US05: orçamento zero é preservado e campos opcionais continuam opcionais', async contexto => {
  transacao(contexto);
  contexto.mock.method(Solicitacao, 'create', async dados => ({ get: () => dados }));
  const resultado = await solicitacoes.criarSolicitacao('cliente', { ...dadosSolicitacao,
    titulo: 'a'.repeat(180), orcamento_cliente: 0, prazo_desejado_dias: 365 }, []);
  assert.equal(resultado.orcamento_cliente, 0);
  assert.equal(resultado.categoria, null);
  const semOpcionais = await solicitacoes.criarSolicitacao('cliente', dadosSolicitacao, []);
  assert.equal(semOpcionais.orcamento_cliente, null);
  assert.equal(semOpcionais.prazo_desejado_dias, null);
});

test('US10: migração preenche legadas pela criação, impõe NOT NULL e permite retomada', async () => {
  const etapas = [];
  const qi = {
    describeTable: async () => ({}),
    addColumn: async (tabela, campo, opcoes) => { etapas.push('adicionar'); assert.equal(opcoes.allowNull, true); },
    sequelize: { query: async sql => {
      etapas.push('preencher');
      assert.match(sql, /DATE_ADD\(created_at, INTERVAL 7 DAY\)/);
      assert.match(sql, /WHERE validade_ate IS NULL/);
    } },
    changeColumn: async (tabela, campo, opcoes) => { etapas.push('obrigar'); assert.equal(opcoes.allowNull, false); },
    removeColumn: async (tabela, campo) => { assert.equal(campo, 'validade_ate'); },
  };
  await migracao.up(qi, Sequelize);
  assert.deepEqual(etapas, ['adicionar', 'preencher', 'obrigar']);
  etapas.length = 0;
  qi.describeTable = async () => ({ validade_ate: {} });
  await migracao.up(qi, Sequelize);
  assert.deepEqual(etapas, ['preencher', 'obrigar']);
  await migracao.down(qi);
});

for (const reaproveitar of [false, true]) {
  test(`US13: ${reaproveitar ? 'reutilização' : 'criação'} retorna custódia recarregada e idempotente`, async contexto => {
    const tx = transacao(contexto);
    contexto.mock.method(Solicitacao, 'findOne', async () => ({ id: 's', status: 'CONTRATADA' }));
    contexto.mock.method(Proposta, 'findOne', async () => ({ id: 'p', valor: 250 }));
    let gravada = false;
    let recarregada = false;
    let dados = { id: 'custodia', proposta_id: 'antiga', status_pagamento: 'REEMBOLSADO' };
    const registro = {
      get proposta_id() { return dados.proposta_id; },
      get status_pagamento() { return dados.status_pagamento; },
      async update(novos, opcoes) {
        assert.equal(opcoes.transaction, tx);
        dados = { ...dados, ...novos };
        gravada = true;
        return this;
      },
      async reload(opcoes) {
        assert.equal(opcoes.transaction, tx);
        assert.equal(gravada, true);
        dados.retido_em = new Date(Math.floor(dados.retido_em.getTime() / 1000) * 1000);
        recarregada = true;
        return this;
      },
      get() { return { ...dados }; },
    };
    contexto.mock.method(TransacaoCustodia, 'findOne', async () => reaproveitar || gravada ? registro : null);
    contexto.mock.method(TransacaoCustodia, 'create', async (novos, opcoes) => {
      assert.equal(reaproveitar, false);
      assert.equal(opcoes.transaction, tx);
      dados = { ...dados, ...novos };
      gravada = true;
      return registro;
    });
    const primeira = await solicitacoes.simularPagamentoCustodia('cliente', 's', 'PIX_TESTE');
    assert.equal(recarregada, true);
    assert.equal(primeira.dados.retido_em.getMilliseconds(), 0);
    const segunda = await solicitacoes.simularPagamentoCustodia('cliente', 's', 'PIX_TESTE');
    assert.deepEqual(primeira.dados, segunda.dados);
    assert.equal(TransacaoCustodia.create.mock.callCount(), reaproveitar ? 0 : 1);
  });
}
