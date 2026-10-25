/**
 * Testes isolados dos dashboards, sem banco nem servidor.
 * Jest: execução e dublês. https://jestjs.io/docs/api
 * TypeScript (^5.4.5): transpila os módulos em memória para testar os arquivos reais.
 * Documentação oficial: https://github.com/microsoft/TypeScript/wiki/Using-the-Compiler-API
 * Execução: npx jest tests/dashboard.test.js --runInBand --config '{}'
 */
const fs = require('node:fs');
const path = require('node:path');
const ts = require('typescript');
const { Op } = require('sequelize');

function carregar(arquivo, dependencias) {
  const fonte = fs.readFileSync(path.join(__dirname, '../src', arquivo), 'utf8');
  const codigo = ts.transpileModule(fonte, {
    compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2020, esModuleInterop: true },
  }).outputText;
  const modulo = { exports: {} };
  const importar = nome => Object.prototype.hasOwnProperty.call(dependencias, nome) ? dependencias[nome] : require(nome);
  new Function('require', 'module', 'exports', codigo)(importar, modulo, modulo.exports);
  return modulo.exports;
}

let modelos;
let servico;
beforeEach(() => {
  modelos = {
    Solicitacao: { count: jest.fn().mockResolvedValue(0) },
    Proposta: { count: jest.fn().mockResolvedValue(0), findAll: jest.fn().mockResolvedValue([]) },
    Avaliacao: { findOne: jest.fn().mockResolvedValue({ media: null, total: '0' }) },
    TransacaoCustodia: { findAll: jest.fn().mockResolvedValue([]) },
  };
  servico = carregar('services/dashboardService.ts', { '../models': modelos });
});

test('solicitante conta estados corretos e restringe todas as consultas ao titular', async () => {
  modelos.Solicitacao.count.mockResolvedValueOnce(3).mockResolvedValueOnce(2).mockResolvedValueOnce(1);
  modelos.Proposta.count.mockResolvedValue(4);
  await expect(servico.default.solicitante('titular')).resolves.toEqual({
    servicos_abertos: 3, propostas_pendentes: 4, servicos_em_andamento: 2, servicos_concluidos: 1,
  });
  const consultas = modelos.Solicitacao.count.mock.calls.map(([opcoes]) => opcoes.where);
  expect(consultas).toEqual([
    { solicitante_id: 'titular', status: { [Op.in]: ['ABERTA', 'EM_NEGOCIACAO'] } },
    { solicitante_id: 'titular', status: 'CONTRATADA' },
    { solicitante_id: 'titular', status: 'CONCLUIDA' },
  ]);
  const pendentes = modelos.Proposta.count.mock.calls[0][0];
  expect(pendentes.where.status[Op.in]).toEqual(['ENVIADA', 'EM_ANALISE']);
  expect(pendentes.include[0]).toMatchObject({ required: true, as: 'solicitacao', where: { solicitante_id: 'titular' } });
});

test('prestador usa mês semiaberto em createdAt, conversão do mesmo conjunto e reputação real', async () => {
  modelos.Proposta.findAll.mockResolvedValue([{ status: 'ACEITA', total: '2' }, { status: 'ENVIADA', total: '3' }, { status: 'RECUSADA', total: '1' }]);
  modelos.Avaliacao.findOne.mockResolvedValue({ media: '4.6666', total: '3' });
  const dados = await servico.default.prestador('profissional', new Date('2026-10-25T15:00:00Z'));
  expect(dados).toMatchObject({ propostas_enviadas_mes: 6, propostas_aceitas_mes: 2, taxa_conversao: 33.33, nota_reputacao: 4.67, total_avaliacoes: 3 });
  expect(dados.periodo).toEqual({ inicio: '01/10/2026', fim_exclusivo: '01/11/2026', referencia: 'outubro de 2026' });
  const filtro = modelos.Proposta.findAll.mock.calls[0][0].where;
  expect(filtro.prestador_id).toBe('profissional');
  expect(filtro.createdAt[Op.gte].toISOString()).toBe('2026-10-01T03:00:00.000Z');
  expect(filtro.createdAt[Op.lt].toISOString()).toBe('2026-11-01T03:00:00.000Z');
  expect(modelos.Avaliacao.findOne.mock.calls[0][0].where).toEqual({ prestador_id: 'profissional' });
});

test('sem propostas ou avaliações retorna conversão zero e reputação ausente', async () => {
  const dados = await servico.default.prestador('novo');
  expect(dados).toMatchObject({ propostas_enviadas_mes: 0, propostas_aceitas_mes: 0, taxa_conversao: 0, nota_reputacao: null, total_avaliacoes: 0 });
});

test('carteira soma DECIMAL em centavos e filtra a proposta atual do prestador sem recorte mensal', async () => {
  modelos.TransacaoCustodia.findAll.mockResolvedValue([
    { status_pagamento: 'LIBERADO', total: '100000000.30' },
    { status_pagamento: 'RETIDO', total: '250.10' },
  ]);
  const dados = await servico.default.prestador('titular');
  expect(dados.saldo_liberado).toBe(100000000.30);
  expect(dados.valor_em_custodia).toBe(250.10);
  const consulta = modelos.TransacaoCustodia.findAll.mock.calls[0][0];
  expect(consulta.where).toEqual({ status_pagamento: { [Op.in]: ['RETIDO', 'LIBERADO'] } });
  expect(consulta.include).toEqual([{
    model: modelos.Proposta, as: 'proposta', required: true, attributes: [], where: { prestador_id: 'titular' },
  }]);
  expect(consulta.group).toEqual(['TransacaoCustodia.status_pagamento']);
  expect(consulta.attributes[1][0].fn).toBe('SUM');
  expect(consulta.attributes[1][0].args[0].col).toBe('TransacaoCustodia.valor');
});

test('carteira vazia ou sem somas retorna zero', async () => {
  expect(await servico.default.prestador('novo')).toMatchObject({ saldo_liberado: 0, valor_em_custodia: 0 });
  modelos.TransacaoCustodia.findAll.mockResolvedValue([{ status_pagamento: 'LIBERADO', total: null }]);
  expect(await servico.default.prestador('novo')).toMatchObject({ saldo_liberado: 0, valor_em_custodia: 0 });
});

test('consultar novamente não incrementa saldo e transferência de custódia sai do prestador anterior', async () => {
  modelos.TransacaoCustodia.findAll.mockImplementation(async consulta => consulta.include[0].where.prestador_id === 'atual'
    ? [{ status_pagamento: 'LIBERADO', total: '0.30' }] : []);
  expect((await servico.default.prestador('atual')).saldo_liberado).toBe(0.30);
  expect((await servico.default.prestador('atual')).saldo_liberado).toBe(0.30);
  expect((await servico.default.prestador('anterior')).saldo_liberado).toBe(0);
});

test.each([[null, 0], ['0.00', 0], ['0.10', 0.1], ['0.30', 0.3], ['123456789.99', 123456789.99], [250.1, 250.1]])(
  'normaliza soma monetária %s sem acumular frações em ponto flutuante', (entrada, esperado) => {
    expect(servico.normalizarSomaMonetaria(entrada)).toBe(esperado);
  },
);

test.each(['inválido', '1.001', '-1.00', '9007199254740992.00'])('rejeita soma monetária inválida ou imprecisa: %s', entrada => {
  expect(() => servico.normalizarSomaMonetaria(entrada)).toThrow();
});

test.each([
  ['2027-01-01T02:59:59Z', '2026-12-01T03:00:00.000Z', '2027-01-01T03:00:00.000Z'],
  ['2027-01-01T03:00:00Z', '2027-01-01T03:00:00.000Z', '2027-02-01T03:00:00.000Z'],
  ['2028-02-29T15:00:00Z', '2028-02-01T03:00:00.000Z', '2028-03-01T03:00:00.000Z'],
])('fronteiras mensais e ano bissexto: %s', (agora, inicio, fim) => {
  const periodo = servico.periodoMensal(new Date(agora));
  expect(periodo.inicio.toISOString()).toBe(inicio);
  expect(periodo.fim.toISOString()).toBe(fim);
});

function controlador() {
  const consultas = { solicitante: jest.fn().mockResolvedValue({}), prestador: jest.fn().mockResolvedValue({}) };
  const controller = carregar('controllers/dashboardController.ts', { '../services/dashboardService': consultas }).default;
  const res = { status: jest.fn().mockReturnThis(), json: jest.fn().mockReturnThis() };
  return { consultas, controller, res, next: jest.fn() };
}

test.each(['SOLICITANTE', 'PRESTADOR', 'ADMIN'])('perfil %s acessa somente suas solicitações', async tipo_perfil => {
  const { consultas, controller, res, next } = controlador();
  await controller.solicitante({ user: { id: 'eu', tipo_perfil }, query: { usuario_id: 'outro' } }, res, next);
  expect(consultas.solicitante).toHaveBeenCalledWith('eu');
});

test.each(['PRESTADOR', 'ADMIN'])('perfil %s acessa somente suas métricas profissionais', async tipo_perfil => {
  const { consultas, controller, res, next } = controlador();
  await controller.prestador({ user: { id: 'eu', tipo_perfil }, query: { prestador_id: 'outro' } }, res, next);
  expect(consultas.prestador).toHaveBeenCalledWith('eu');
});

test('solicitante não acessa métricas profissionais e anônimo recebe 401', async () => {
  const { consultas, controller, res, next } = controlador();
  await controller.prestador({ user: { id: 'eu', tipo_perfil: 'SOLICITANTE' } }, res, next);
  expect(res.status).toHaveBeenCalledWith(403);
  expect(consultas.prestador).not.toHaveBeenCalled();
  await controller.solicitante({}, res, next);
  await controller.prestador({}, res, next);
  expect(res.status.mock.calls).toEqual([[403], [401], [401]]);
});

test('falhas de consulta seguem para o tratamento global de erros', async () => {
  const { consultas, controller, res, next } = controlador();
  const erro = new Error('Falha simulada');
  consultas.solicitante.mockRejectedValue(erro);
  await controller.solicitante({ user: { id: 'eu' } }, res, next);
  expect(next).toHaveBeenCalledWith(erro);
  expect(res.json).not.toHaveBeenCalled();
});

test('as duas rotas são registradas depois da autenticação', () => {
  const rotas = { use: jest.fn(), get: jest.fn() };
  const autenticar = jest.fn();
  carregar('routes/dashboardRoutes.ts', {
    express: { Router: () => rotas },
    '../middlewares/authMiddleware': autenticar,
    '../controllers/dashboardController': {},
  });
  expect(rotas.use).toHaveBeenCalledWith(autenticar);
  expect(rotas.get.mock.calls.map(([caminho]) => caminho)).toEqual(['/solicitante', '/prestador']);
  expect(rotas.use.mock.invocationCallOrder[0]).toBeLessThan(rotas.get.mock.invocationCallOrder[0]);
});
