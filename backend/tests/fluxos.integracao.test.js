/**
 * US26: integração das rotas reais, JWT, regras e persistência MySQL, sem mocks ou seeds.
 * Jest: hooks, asserções e execução serial. https://jestjs.io/docs/api
 * Supertest: requisições diretamente ao app Express. https://github.com/forwardemail/supertest
 * Sequelize 6: inspeção da persistência e remoção apenas das próprias fixtures.
 * https://sequelize.org/docs/v6/core-concepts/model-querying-basics/
 */
require('./ambiente.cjs')();
const request = require('supertest');
const { randomUUID, randomInt } = require('node:crypto');
const fs = require('node:fs/promises');
const path = require('node:path');
const app = require('../dist/app').default;
const banco = require('../dist/config/database').default;
const modelos = require('../dist/models');
const { Usuario, Solicitacao, Proposta, Avaliacao, PrestadorPerfil, Notificacao, MensagemChat, TransacaoCustodia } = modelos;
const usuariosCriados = [];
const solicitacoesCriadas = [];
const fotosCriadas = new Set();
const diretorioFotos = path.resolve(__dirname, '../uploads/perfil');
const senha = 'IntegracaoSegura123!';
const propostaValida = { valor: 250.50, prazo_dias: 3, mensagem: 'Execução completa com material e garantia.' };
let dono, outro, prestador, concorrente, terceiroPrestador;

function autenticar(chamada, ator) { return chamada.set('Authorization', `Bearer ${ator.token}`); }
function enviar(id, ator, dados = propostaValida) {
 return autenticar(request(app).post(`/api/v1/prestador/oportunidades/${id}/propostas`), ator).send(dados);
}
function aceitar(id, propostaId, ator = dono) {
 return autenticar(request(app).patch(`/api/v1/solicitacoes/minhas/${id}/propostas/${propostaId}/status`), ator).send({ acao: 'ACEITAR' });
}
function cpfValido() {
 const digitos = Array.from({ length: 9 }, () => randomInt(0, 10));
 for (const tamanho of [9, 10]) {
  const soma = digitos.reduce((total, numero, indice) => total + numero * (tamanho + 1 - indice), 0);
  const resto = (soma * 10) % 11;
  digitos.push(resto === 10 ? 0 : resto);
 }
 return digitos.join('');
}
async function cadastrar(tipo) {
 const email = `us26-${randomUUID()}@example.test`;
 const documento = cpfValido();
 const resposta = await request(app).post(`/api/v1/auth/register/${tipo}`).send({
  nome: 'Pessoa de integração US26', email, senha, telefone: '16999999999',
  cpf: documento, cnpj_cpf: documento, categorias: ['ELETRICA'], termo_lgpd_aceito: true,
 });
 if (resposta.body.data?.id) usuariosCriados.push(resposta.body.data.id);
 if (resposta.status !== 201) throw new Error(`Pré-condição HTTP ${resposta.status}: ${JSON.stringify(resposta.body)}`);
 expect(resposta.body.data).not.toHaveProperty('senha_hash');
 expect(resposta.body.data.tipo_perfil).toBe(tipo === 'prestador' ? 'PRESTADOR' : 'SOLICITANTE');
 const login = await request(app).post('/api/v1/auth/login').send({ email, senha }).expect(200);
 expect(login.body.data.token).toEqual(expect.any(String));
 expect(login.body.data.usuario).not.toHaveProperty('senha_hash');
 return { ...resposta.body.data, token: login.body.data.token, email };
}
async function criar(ator = dono) {
 const resposta = await autenticar(request(app).post('/api/v1/solicitacoes'), ator).send({
  titulo: 'Reparo elétrico US26', descricao: 'Revisar tomadas e substituir os componentes defeituosos.',
  categoria: 'ELETRICA', cidade: 'Ribeirão Preto', bairro: 'Centro', orcamento_cliente: 500,
 });
 if (resposta.body.data?.id) solicitacoesCriadas.push(resposta.body.data.id);
 if (resposta.status !== 201) throw new Error(`Pré-condição HTTP ${resposta.status}: ${JSON.stringify(resposta.body)}`);
 expect(resposta.body.data).toMatchObject({ status: 'ABERTA', solicitante_id: ator.id });
 return resposta.body.data;
}
async function disputa() {
 const solicitacao = await criar();
 const primeira = await enviar(solicitacao.id, prestador).expect(201);
 const segunda = await enviar(solicitacao.id, concorrente, { ...propostaValida, valor: 300 }).expect(201);
 return { id: solicitacao.id, p1: primeira.body.dados.id, p2: segunda.body.dados.id };
}

beforeAll(async () => {
 expect(banco.getDatabaseName()).toBe(process.env.DB_NAME_TEST);
 expect(banco.getDatabaseName()).toMatch(/_test$/);
 await banco.authenticate();
 dono = await cadastrar('solicitante'); outro = await cadastrar('solicitante');
 prestador = await cadastrar('prestador'); concorrente = await cadastrar('prestador');
 terceiroPrestador = await cadastrar('prestador');
});

afterAll(async () => {
 // Nunca truncar tabelas: remove somente os IDs criados nesta execução, inclusive se um teste falhar.
 try {
  if (banco.getDatabaseName() !== process.env.DB_NAME_TEST || !/_test$/.test(banco.getDatabaseName())) {
   throw new Error('Limpeza recusada: banco fora do ambiente de teste.');
  }
  await banco.transaction(async (transaction) => {
   for (const nome of ['MensagemChat', 'Avaliacao', 'TransacaoCustodia', 'Denuncia', 'PerguntaSolicitacao', 'AnexoSolicitacao', 'Proposta']) {
    if (solicitacoesCriadas.length) await modelos[nome].destroy({ where: { solicitacao_id: solicitacoesCriadas }, transaction });
   }
   if (solicitacoesCriadas.length) await Solicitacao.destroy({ where: { id: solicitacoesCriadas }, transaction });
   for (const nome of ['Notificacao', 'PreferenciaNotificacao', 'PrestadorPerfil']) {
    if (usuariosCriados.length) await modelos[nome].destroy({ where: { usuario_id: usuariosCriados }, transaction });
   }
   if (usuariosCriados.length) await Usuario.destroy({ where: { id: usuariosCriados }, transaction });
  });
 } finally {
  try {
   for (const foto of fotosCriadas) {
    const destino = path.resolve(diretorioFotos, foto);
    if (path.dirname(destino) !== diretorioFotos) throw new Error('Limpeza de foto fora da pasta permitida.');
    await fs.rm(destino, { force: true });
   }
  } finally { await banco.close(); }
 }
});

describe('US26 — autenticação real e autorização', () => {
 test('cadastro persiste senha com hash e login identifica os dois papéis', async () => {
  const salvo = await Usuario.findByPk(dono.id);
  expect(salvo.senha_hash).not.toBe(senha);
  expect(salvo.senha_hash).toMatch(/^\$2[aby]\$/);
  for (const ator of [dono, prestador]) {
   const perfil = await autenticar(request(app).get('/api/v1/auth/me'), ator).expect(200);
   expect(perfil.body.data).toMatchObject({ id: ator.id, tipo_perfil: ator.tipo_perfil });
   expect(perfil.body.data).not.toHaveProperty('senha_hash');
  }
 });
 test('recusa senha incorreta, conta inexistente e campos ausentes', async () => {
  await request(app).post('/api/v1/auth/login').send({ email: dono.email, senha: 'incorreta' }).expect(401);
  await request(app).post('/api/v1/auth/login').send({ email: 'inexistente@example.test', senha }).expect(401);
  await request(app).post('/api/v1/auth/login').send({ email: dono.email }).expect(400);
 });
 test.each([
  ['CPF inválido', { cpf: '00000000000' }, /CPF|documento/i],
  ['e-mail inválido', { email: 'email-sem-arroba' }, /e-mail/i],
  ['senha curta', { senha: '123' }, /senha/i],
  ['nome com tipo incorreto', { nome: 123 }, /nome/i],
 ])('cadastro de solicitante com %s retorna 400 sem persistir usuário', async (_caso, alteracoes, mensagemEsperada) => {
  const dados = {
   nome: 'Solicitante de integração US26', email: `cadastro-invalido-${randomUUID()}@example.test`,
   cpf: cpfValido(), telefone: '16999999999', senha, termo_lgpd_aceito: true,
   ...alteracoes,
  };
  const resposta = await request(app).post('/api/v1/auth/register/solicitante').send(dados);
  // Se a regressão criar a conta, a limpeza geral ainda remove somente essa fixture.
  if (resposta.body.data?.id) usuariosCriados.push(resposta.body.data.id);
  expect(resposta.status).toBe(400);
  expect(resposta.body.message).toMatch(mensagemEsperada);
  expect(resposta.body).not.toHaveProperty('data');
  expect(await Usuario.count({ where: { email: dados.email } })).toBe(0);
 });
 test('não permite novo cadastro com o mesmo e-mail', async () => {
  await request(app).post('/api/v1/auth/register/solicitante').send({
   nome: 'Duplicado', email: dono.email, cpf: dono.cpf, telefone: '16999999999', senha, termo_lgpd_aceito: true,
  }).expect(409);
  expect(await Usuario.count({ where: { email: dono.email } })).toBe(1);
 });
 test.each([undefined, 'token-invalido'])('bloqueia rotas protegidas com credencial %s', async (token) => {
  for (const [metodo, caminho] of [['get', '/api/v1/auth/me'], ['post', '/api/v1/solicitacoes'],
   ['post', `/api/v1/prestador/oportunidades/${randomUUID()}/propostas`]]) {
   const chamada = request(app)[metodo](caminho);
   if (token) chamada.set('Authorization', `Bearer ${token}`);
   await chamada.send({}).expect(401);
  }
 });
 test('solicitante não envia proposta; prestador pode publicar pela US33', async () => {
  const s = await criar();
  await enviar(s.id, outro).expect(403);
  expect(await Proposta.count({ where: { solicitacao_id: s.id } })).toBe(0);
  await criar(prestador);
 });
});

describe('US26 — solicitação e propostas concorrentes', () => {
 test('valida criação e persiste proprietário autenticado', async () => {
  await autenticar(request(app).post('/api/v1/solicitacoes'), dono).send({ titulo: '' }).expect(400);
  const s = await criar();
  expect((await Solicitacao.findByPk(s.id)).solicitante_id).toBe(dono.id);
 });
 test('duas propostas distintas coexistem e movem solicitação para negociação', async () => {
  const { id } = await disputa();
  const propostas = await Proposta.findAll({ where: { solicitacao_id: id } });
  expect(propostas).toHaveLength(2);
  expect(propostas.map(p => p.status)).toEqual(['ENVIADA', 'ENVIADA']);
  expect((await Solicitacao.findByPk(id)).status).toBe('EM_NEGOCIACAO');
 });
 test('proposta inválida ou duplicada não insere registros extras', async () => {
  const s = await criar();
  await enviar(s.id, prestador, { ...propostaValida, valor: -1 }).expect(400);
  await enviar(s.id, prestador).expect(201);
  await enviar(s.id, prestador).expect(409);
  expect(await Proposta.count({ where: { solicitacao_id: s.id } })).toBe(1);
 });
 test('outro solicitante e prestador não podem aceitar proposta alheia', async () => {
  const { id, p1 } = await disputa();
  await aceitar(id, p1, outro).expect(404);
  await aceitar(id, p1, prestador).expect(404);
  expect((await Proposta.findByPk(p1)).status).toBe('ENVIADA');
  expect((await Solicitacao.findByPk(id)).status).toBe('EM_NEGOCIACAO');
 });
 test('dono não pode aceitar proposta pertencente a outra solicitação', async () => {
  const { p1 } = await disputa(); const outra = await criar();
  await aceitar(outra.id, p1).expect(404);
  expect((await Proposta.findByPk(p1)).status).toBe('ENVIADA');
 });
 test('aceite contrata uma proposta e recusa sua concorrente', async () => {
  const { id, p1, p2 } = await disputa();
  await aceitar(id, p1).expect(200);
  expect((await Solicitacao.findByPk(id)).status).toBe('CONTRATADA');
  expect((await Proposta.findByPk(p1)).status).toBe('ACEITA');
  expect((await Proposta.findByPk(p2)).status).toBe('RECUSADA');
  expect(await Proposta.count({ where: { solicitacao_id: id, status: 'ACEITA' } })).toBe(1);
 });
 test('repetir aceite é conflito e não duplica notificações', async () => {
  const { id, p1 } = await disputa(); await aceitar(id, p1).expect(200);
  const antes = await Notificacao.count({ where: { usuario_id: prestador.id } });
  const repeticao = await aceitar(id, p1);
  expect(await Notificacao.count({ where: { usuario_id: prestador.id } })).toBe(antes);
  expect(repeticao.status).toBe(409);
 });
 test('não aceita concorrente após contratação e mantém vencedora única', async () => {
  const { id, p1, p2 } = await disputa(); await aceitar(id, p1).expect(200);
  const resposta = await aceitar(id, p2);
  expect(await Proposta.count({ where: { solicitacao_id: id, status: 'ACEITA' } })).toBe(1);
  expect(resposta.status).toBe(409);
  expect((await Proposta.findByPk(p1)).status).toBe('ACEITA');
 });
 test('aceites simultâneos têm um sucesso, um conflito e só uma vencedora', async () => {
  const { id, p1, p2 } = await disputa();
  const respostas = await Promise.all([aceitar(id, p1), aceitar(id, p2)]);
  expect(respostas.map(r => r.status).sort()).toEqual([200, 409]);
  expect(await Proposta.count({ where: { solicitacao_id: id, status: 'ACEITA' } })).toBe(1);
 });
});

describe('US26 — chat privado e avaliação', () => {
 test('isola histórico, escrita e marcação de leitura entre propostas', async () => {
  const { p1, p2 } = await disputa();
  await autenticar(request(app).post(`/api/v1/propostas/${p1}/mensagens`), prestador).send({ conteudo: 'Conversa privada da primeira proposta.' }).expect(201);
  for (const ator of [concorrente, outro]) {
   await autenticar(request(app).get(`/api/v1/propostas/${p1}/mensagens`), ator).expect(403);
   await autenticar(request(app).post(`/api/v1/propostas/${p1}/mensagens`), ator).send({ conteudo: 'Tentativa indevida' }).expect(403);
   await autenticar(request(app).patch(`/api/v1/propostas/${p1}/mensagens/lidas`), ator).expect(403);
  }
  const historico = await autenticar(request(app).get(`/api/v1/propostas/${p1}/mensagens`), dono).expect(200);
  expect(historico.body.data).toHaveLength(1);
  const isolado = await autenticar(request(app).get(`/api/v1/propostas/${p2}/mensagens`), concorrente).expect(200);
  expect(isolado.body.data).toEqual([]);
  expect(await MensagemChat.count({ where: { proposta_id: p1 } })).toBe(1);
 });
 test('avalia somente após conclusão, pelo dono, uma vez, com reputação consistente', async () => {
  const { id, p1 } = await disputa();
  const avaliar = (ator, nota = 5) => autenticar(request(app).post(`/api/v1/solicitacoes/${id}/avaliar`), ator).send({ nota, comentario: 'Serviço bem executado.' });
  await avaliar(dono).expect(409);
  await aceitar(id, p1).expect(200);
  await avaliar(dono).expect(409);
  expect(await Avaliacao.count({ where: { solicitacao_id: id } })).toBe(0);
  await autenticar(request(app).patch(`/api/v1/solicitacoes/${id}/concluir`), outro).expect(403);
  await autenticar(request(app).patch(`/api/v1/solicitacoes/${id}/concluir`), dono).expect(200);
  await avaliar(outro).expect(404); await avaliar(prestador).expect(404);
  await avaliar(dono, 6).expect(400);
  await avaliar(dono).expect(201); await avaliar(dono).expect(409);
  expect(await Avaliacao.count({ where: { solicitacao_id: id } })).toBe(1);
  const perfil = await PrestadorPerfil.findOne({ where: { usuario_id: prestador.id } });
  expect(perfil.total_avaliacoes).toBe(1); expect(Number(perfil.nota_media_reputacao)).toBe(5);
 });
});


describe('US26 — privacidade dos indicadores e perfil público', () => {
 test('dashboard usa a identidade do JWT e ignora ID de outro usuário na query', async () => {
  const antes = await autenticar(request(app).get('/api/v1/dashboards/solicitante'), outro).expect(200);
  await criar(dono);
  const depois = await autenticar(request(app).get(`/api/v1/dashboards/solicitante?usuario_id=${dono.id}&solicitante_id=${dono.id}`), outro).expect(200);
  expect(depois.body.dados).toEqual(antes.body.dados);
  await request(app).get('/api/v1/dashboards/solicitante').expect(401);
  await autenticar(request(app).get('/api/v1/dashboards/prestador'), dono).expect(403);
 });
 test('perfil do prestador é público sem expor documentos, contato ou hash', async () => {
  const resposta = await request(app).get(`/api/v1/prestadores/${prestador.id}/perfil-publico`).expect(200);
  const serializado = JSON.stringify(resposta.body);
  expect(serializado).not.toContain(prestador.email);
  expect(serializado).not.toContain(prestador.cpf);
  expect(serializado).not.toMatch(/senha_hash|cnpj_cpf|telefone|termo_lgpd/);
  await request(app).get(`/api/v1/prestadores/${dono.id}/perfil-publico`).expect(404);
 });
});


function pagar(id, ator = dono, metodo = 'PIX_TESTE') {
 return autenticar(request(app).post(`/api/v1/solicitacoes/${id}/custodia/simular`), ator).send({ metodo_pagamento: metodo });
}
function cancelarContratacao(id, ator = dono) {
 return autenticar(request(app).patch(`/api/v1/solicitacoes/${id}/cancelar-contratacao`), ator);
}
function concluir(id, ator = dono) {
 return autenticar(request(app).patch(`/api/v1/solicitacoes/${id}/concluir`), ator);
}
function renegociar(id, propostaId) {
 return autenticar(request(app).post(`/api/v1/solicitacoes/minhas/${id}/propostas/${propostaId}/renegociar`), dono)
  .send({ valor: 220, mensagem: 'Podemos ajustar o valor do serviço?' });
}
async function contratacao() {
 const s = await criar();
 const enviada = await enviar(s.id, prestador).expect(201);
 const propostaId = enviada.body.dados.id;
 await aceitar(s.id, propostaId).expect(200);
 return { id: s.id, propostaId };
}
async function custodia(id) { return TransacaoCustodia.findOne({ where: { solicitacao_id: id } }); }

// A expiração é preparada diretamente na fixture, sem relógio falso ou espera por dias.
describe('US26 — validade comercial persistida', () => {
 test.each([1, 7, 365])('proposta persiste validade de %i dias e prazo de execução independente', async (dias) => {
  const s = await criar(); const antes = Date.now();
  const dados = { ...propostaValida, prazo_dias: 10 };
  if (dias !== 7) dados.validade_dias = dias;
  const resposta = await enviar(s.id, prestador, dados).expect(201);
  const salva = await Proposta.findByPk(resposta.body.dados.id);
  const duracao = new Date(salva.validade_ate).getTime();
  expect(duracao).toBeGreaterThanOrEqual(antes + dias * 86400000 - 1000);
  expect(duracao).toBeLessThanOrEqual(Date.now() + dias * 86400000);
  expect(salva.prazo_dias).toBe(10);
 });
 test('aceite de proposta expirada retorna 409 sem contratar nem notificar', async () => {
  const { id, p1, p2 } = await disputa();
  await Proposta.update({ validade_ate: new Date(Date.now() - 60000) }, { where: { id: p1 } });
  const antes = await Notificacao.count({ where: { usuario_id: prestador.id } });
  await aceitar(id, p1).expect(409);
  expect((await Solicitacao.findByPk(id)).status).toBe('EM_NEGOCIACAO');
  expect((await Proposta.findByPk(p1)).status).toBe('ENVIADA');
  expect((await Proposta.findByPk(p2)).status).toBe('ENVIADA');
  expect(await Proposta.count({ where: { solicitacao_id: id, status: 'ACEITA' } })).toBe(0);
  expect(await Notificacao.count({ where: { usuario_id: prestador.id } })).toBe(antes);
 });
 test('renegociação expirada retorna 409 sem gravar contraproposta', async () => {
  const { id, p1 } = await disputa();
  await Proposta.update({ validade_ate: new Date(Date.now() - 60000) }, { where: { id: p1 } });
  await renegociar(id, p1).expect(409);
  const salva = await Proposta.findByPk(p1);
  expect(salva.status).toBe('ENVIADA'); expect(salva.valor_contraproposta).toBeNull();
 });
 test('renegociação vigente move para análise e preserva validade original', async () => {
  const { id, p1 } = await disputa(); const antes = await Proposta.findByPk(p1);
  await renegociar(id, p1).expect(200);
  const depois = await Proposta.findByPk(p1);
  expect(depois.status).toBe('EM_ANALISE'); expect(Number(depois.valor_contraproposta)).toBe(220);
  expect(new Date(depois.validade_ate).getTime()).toBe(new Date(antes.validade_ate).getTime());
 });
});

describe('US26 — retenção, reembolso e nova contratação', () => {
 test.each(['PIX_TESTE', 'CARTAO_TESTE'])('pagamento %s retém exatamente o valor da vencedora', async (metodo) => {
  const { id, propostaId } = await contratacao();
  const resposta = await pagar(id, dono, metodo).expect(200);
  const salva = await custodia(id);
  expect(resposta.body.dados.id).toBe(salva.id);
  expect(salva.proposta_id).toBe(propostaId); expect(salva.status_pagamento).toBe('RETIDO');
  expect(salva.metodo_pagamento).toBe(metodo); expect(Number(salva.valor)).toBe(propostaValida.valor);
  expect(salva.liberado_em).toBeNull();
 });
 test('pagamento repetido mantém ID, referência, valor e apenas uma custódia', async () => {
  const { id } = await contratacao();
  const primeira = await pagar(id).expect(200);
  const persistida = (await custodia(id)).toJSON();
  const segunda = await pagar(id).expect(200);
  // A resposta inicial deve refletir a precisão persistida: o serviço precisa recarregar a linha.
  expect(segunda.body.dados).toEqual(primeira.body.dados);
  expect((await custodia(id)).toJSON()).toEqual(persistida);
  expect(await TransacaoCustodia.count({ where: { solicitacao_id: id } })).toBe(1);
 });
 test('pagamentos simultâneos retornam a mesma custódia sem duplicar retenção', async () => {
  const { id } = await contratacao();
  const respostas = await Promise.all([pagar(id), pagar(id)]);
  expect(respostas.map(r => r.status)).toEqual([200, 200]);
  expect(respostas[0].body.dados.id).toBe(respostas[1].body.dados.id);
  expect(respostas[0].body.dados.referencia_simulada).toBe(respostas[1].body.dados.referencia_simulada);
  expect(await TransacaoCustodia.count({ where: { solicitacao_id: id } })).toBe(1);
 });
 test('terceiro e prestador não podem pagar nem cancelar a contratação do dono', async () => {
  const { id } = await contratacao(); await pagar(id).expect(200);
  const antes = (await custodia(id)).toJSON();
  for (const ator of [outro, prestador]) {
   await pagar(id, ator).expect(404); await cancelarContratacao(id, ator).expect(404);
  }
  expect((await custodia(id)).toJSON()).toEqual(antes);
  expect((await Solicitacao.findByPk(id)).status).toBe('CONTRATADA');
 });
 test('solicitação não contratada não recebe pagamento', async () => {
  const s = await criar(); await pagar(s.id).expect(409);
  expect(await custodia(s.id)).toBeNull();
 });
 test('método inválido não cria custódia', async () => {
  const { id } = await contratacao(); await pagar(id, dono, 'DINHEIRO').expect(422);
  expect(await custodia(id)).toBeNull();
 });
 test('cancelar contratação reembolsa valor e reabre negociação, sem liberar pagamento', async () => {
  const { id, propostaId } = await contratacao(); await pagar(id).expect(200);
  await cancelarContratacao(id).expect(200);
  const salva = await custodia(id);
  expect(salva.status_pagamento).toBe('REEMBOLSADO'); expect(salva.liberado_em).toBeNull();
  expect((await Proposta.findByPk(propostaId)).status).toBe('RECUSADA');
  expect((await Solicitacao.findByPk(id)).status).toBe('EM_NEGOCIACAO');
  await pagar(id).expect(409); await cancelarContratacao(id).expect(404);
 });
 test('recontratar outro prestador usa nova proposta e reativa custódia para o novo valor', async () => {
  const { id, propostaId } = await contratacao(); await pagar(id).expect(200);
  const anterior = (await custodia(id)).toJSON(); await cancelarContratacao(id).expect(200);
  const resposta = await enviar(id, terceiroPrestador, { ...propostaValida, valor: 490 }).expect(201);
  const novaId = resposta.body.dados.id; expect(novaId).not.toBe(propostaId);
  await aceitar(id, novaId).expect(200); await pagar(id, dono, 'CARTAO_TESTE').expect(200);
  const nova = await custodia(id);
  // O contrato atual reaproveita a linha única por solicitação; muda o vínculo e a referência.
  expect(nova.id).toBe(anterior.id); expect(nova.proposta_id).toBe(novaId);
  expect(nova.referencia_simulada).not.toBe(anterior.referencia_simulada);
  expect(Number(nova.valor)).toBe(490); expect(nova.status_pagamento).toBe('RETIDO');
  expect(nova.liberado_em).toBeNull(); expect((await Proposta.findByPk(propostaId)).status).toBe('RECUSADA');
  await concluir(id, terceiroPrestador).expect(200);
  const liberada = await custodia(id);
  expect(liberada.status_pagamento).toBe('LIBERADO'); expect(liberada.liberado_em).toBeInstanceOf(Date);
  expect(liberada.proposta_id).toBe(novaId);
  expect(await TransacaoCustodia.count({ where: { solicitacao_id: id } })).toBe(1);
 });
 test('conclusão libera custódia uma vez e impede reembolso ou nova retenção', async () => {
  const { id } = await contratacao(); await pagar(id).expect(200); await concluir(id, prestador).expect(200);
  const antes = (await custodia(id)).toJSON(); expect(antes.status_pagamento).toBe('LIBERADO');
  expect(antes.liberado_em).toBeInstanceOf(Date);
  await cancelarContratacao(id).expect(404); await concluir(id).expect(404); await pagar(id).expect(409);
  expect((await custodia(id)).toJSON()).toEqual(antes);
 });
});

describe('US26 — transições e avaliações concorrentes', () => {
 test.each([false, true])('concluir e cancelar simultaneamente preservam estado e custódia (ordem %s)', async (inverter) => {
  const { id, propostaId } = await contratacao(); await pagar(id).expect(200);
  const chamadas = inverter ? [cancelarContratacao(id), concluir(id)] : [concluir(id), cancelarContratacao(id)];
  const respostas = await Promise.all(chamadas);
  expect(respostas.map(r => r.status).sort()).toEqual([200, 404]);
  const solicitacao = await Solicitacao.findByPk(id); const pagamento = await custodia(id);
  const proposta = await Proposta.findByPk(propostaId);
  const indiceConclusao = inverter ? 1 : 0;
  if (respostas[indiceConclusao].status === 200) {
   expect(solicitacao.status).toBe('CONCLUIDA'); expect(proposta.status).toBe('ACEITA');
   expect(pagamento.status_pagamento).toBe('LIBERADO'); expect(pagamento.liberado_em).toBeInstanceOf(Date);
  } else {
   expect(solicitacao.status).toBe('EM_NEGOCIACAO'); expect(proposta.status).toBe('RECUSADA');
   expect(pagamento.status_pagamento).toBe('REEMBOLSADO'); expect(pagamento.liberado_em).toBeNull();
  }
 });
 test('duas avaliações simultâneas da mesma solicitação gravam uma só e uma reputação correta', async () => {
  const { id } = await contratacao(); await concluir(id).expect(200);
  const avaliar = nota => autenticar(request(app).post(`/api/v1/solicitacoes/${id}/avaliar`), dono).send({ nota });
  const respostas = await Promise.all([avaliar(2), avaliar(5)]);
  expect(respostas.map(r => r.status).sort()).toEqual([201, 409]);
  const salvas = await Avaliacao.findAll({ where: { solicitacao_id: id } }); expect(salvas).toHaveLength(1);
  const vencedora = respostas.find(r => r.status === 201).body.dados;
  expect(salvas[0].id).toBe(vencedora.id); expect(salvas[0].nota).toBe(vencedora.nota);
  const todas = await Avaliacao.findAll({ where: { prestador_id: prestador.id } });
  const perfil = await PrestadorPerfil.findOne({ where: { usuario_id: prestador.id } });
  expect(perfil.total_avaliacoes).toBe(todas.length);
  expect(Number(perfil.nota_media_reputacao)).toBe(Number((todas.reduce((s, a) => s + a.nota, 0) / todas.length).toFixed(2)));
 });
 test('avaliações de serviços distintos para o mesmo prestador não perdem atualização da média', async () => {
  const primeira = await contratacao(); const segunda = await contratacao();
  await concluir(primeira.id).expect(200); await concluir(segunda.id).expect(200);
  const avaliar = (id, nota) => autenticar(request(app).post(`/api/v1/solicitacoes/${id}/avaliar`), dono).send({ nota });
  const respostas = await Promise.all([avaliar(primeira.id, 1), avaliar(segunda.id, 5)]);
  expect(respostas.map(r => r.status)).toEqual([201, 201]);
  const todas = await Avaliacao.findAll({ where: { prestador_id: prestador.id } });
  const perfil = await PrestadorPerfil.findOne({ where: { usuario_id: prestador.id } });
  expect(perfil.total_avaliacoes).toBe(todas.length);
  expect(Number(perfil.nota_media_reputacao)).toBe(Number((todas.reduce((s, a) => s + a.nota, 0) / todas.length).toFixed(2)));
 });
});

const imagemPng = Buffer.from('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO+jav0AAAAASUVORK5CYII=', 'base64');
function cadastroMultipart(email, consentimento = 'true', categorias = '["ELETRICA"]') {
 return request(app).post('/api/v1/auth/register/prestador')
  .field('nome', 'Prestador de integração com foto').field('email', email)
  .field('cnpj_cpf', cpfValido()).field('telefone', '16999999999').field('senha', senha)
  .field('categorias', categorias).field('termo_lgpd_aceito', consentimento);
}
async function arquivosDeFoto() {
 return (await fs.readdir(diretorioFotos)).sort();
}
async function esperarLimpeza(antes) {
 // O controller responde antes de terminar o finally assíncrono de remoção do arquivo.
 for (let tentativa = 0; tentativa < 20; tentativa++) {
  const atuais = await arquivosDeFoto();
  if (JSON.stringify(atuais) === JSON.stringify(antes)) return;
  await new Promise(resolve => setTimeout(resolve, 50));
 }
 expect(await arquivosDeFoto()).toEqual(antes);
}

describe('US26 — cadastro multipart, consentimento e arquivos', () => {
 test('cadastro com PNG persiste foto, aceita consentimento true textual e serve a imagem', async () => {
  const email = `foto-us26-${randomUUID()}@example.test`;
  const resposta = await cadastroMultipart(email).attach('foto', imagemPng, { filename: 'avatar.png', contentType: 'image/png' });
  if (resposta.body.data?.id) usuariosCriados.push(resposta.body.data.id);
  const foto = resposta.body.data?.foto_url;
  if (foto) fotosCriadas.add(path.basename(foto));
  expect(resposta.status).toBe(201);
  expect(foto).toMatch(/^\/uploads\/perfil\/[a-f0-9-]+\.png$/);
  const salvo = await Usuario.findByPk(resposta.body.data.id);
  expect(salvo.foto_url).toBe(foto); expect(salvo.termo_lgpd_aceito).toBe(true);
  expect(await fs.readFile(path.join(diretorioFotos, path.basename(foto)))).toEqual(imagemPng);
  await request(app).get(foto).expect('Content-Type', /image\/png/).expect(200);
 });
 test.each(['false', '0'])('consentimento textual %s é recusado e remove foto sem criar usuário', async (consentimento) => {
  const antes = await arquivosDeFoto(); const email = `recusado-us26-${randomUUID()}@example.test`;
  await cadastroMultipart(email, consentimento).attach('foto', imagemPng, { filename: 'recusado.png', contentType: 'image/png' }).expect(400);
  expect(await Usuario.count({ where: { email } })).toBe(0);
  await esperarLimpeza(antes);
 });
 test('categorias malformadas após upload retornam 400 e removem foto órfã', async () => {
  const antes = await arquivosDeFoto(); const email = `invalido-us26-${randomUUID()}@example.test`;
  await cadastroMultipart(email, 'true', '{invalido').attach('foto', imagemPng, { filename: 'invalido.png', contentType: 'image/png' }).expect(400);
  expect(await Usuario.count({ where: { email } })).toBe(0); await esperarLimpeza(antes);
 });
 test('MIME não permitido retorna 400 sem salvar arquivo ou usuário', async () => {
  const antes = await arquivosDeFoto(); const email = `mime-us26-${randomUUID()}@example.test`;
  await cadastroMultipart(email).attach('foto', Buffer.from('arquivo não é imagem'), { filename: 'foto.html', contentType: 'text/html' }).expect(400);
  expect(await Usuario.count({ where: { email } })).toBe(0); await esperarLimpeza(antes);
 });
});


describe('US35/US36 — negociação visível e resposta da contraproposta', () => {
 const responder = (id, proposta, ator, acao) => autenticar(request(app).post(`/api/v1/prestador/oportunidades/${id}/propostas/${proposta}/contraproposta/responder`), ator).send({ acao });
 test('feed mantém solicitação após primeira proposta, permite concorrência e remove após contratar', async () => {
  const { id, p1 } = await disputa();
  const feed = await request(app).get('/api/v1/prestador/oportunidades').query({ busca: 'Reparo elétrico US26' }).expect(200);
  expect(feed.body.dados.find(s => s.id === id)).toMatchObject({ status: 'EM_NEGOCIACAO', categoria: 'ELETRICA' });
  expect(feed.body.filtrosDisponiveis.categorias).toContain('ELETRICA');
  await aceitar(id, p1).expect(200);
  const fechado = await request(app).get('/api/v1/prestador/oportunidades').expect(200);
  expect(fechado.body.dados.some(s => s.id === id)).toBe(false);
 });
 test('contraproposta fica visível ao prestador, bloqueia contratação pendente e aceita valor na custódia', async () => {
  const { id, p1 } = await disputa();
  await renegociar(id, p1).expect(200);
  const detalhe = await autenticar(request(app).get(`/api/v1/prestador/oportunidades/${id}`), prestador).expect(200);
  expect(detalhe.body.dados.minha_proposta).toMatchObject({ contraproposta_status: 'PENDENTE', mensagem_contraproposta: 'Podemos ajustar o valor do serviço?' });
  expect(Number(detalhe.body.dados.minha_proposta.valor_contraproposta)).toBe(220);
  await aceitar(id, p1).expect(409);
  await responder(id, p1, concorrente, 'ACEITAR').expect(403);
  await responder(id, p1, prestador, 'ACEITAR').expect(200);
  await responder(id, p1, prestador, 'ACEITAR').expect(409);
  expect((await Solicitacao.findByPk(id)).status).toBe('EM_NEGOCIACAO');
  expect(Number((await Proposta.findByPk(p1)).valor)).toBe(220);
  await aceitar(id, p1).expect(200);
  const pagamento = await pagar(id).expect(200);
  expect(Number(pagamento.body.dados.valor)).toBe(220);
 });
 test('recusa mantém preço original e permite o cliente confirmar o orçamento original', async () => {
  const { id, p1 } = await disputa(); await renegociar(id, p1).expect(200);
  await responder(id, p1, prestador, 'RECUSAR').expect(200);
  const salva = await Proposta.findByPk(p1);
  expect(salva.contraproposta_status).toBe('RECUSADA'); expect(Number(salva.valor)).toBe(propostaValida.valor);
  await aceitar(id, p1).expect(200);
 });
 test('contraproposta expirada não pode ser respondida', async () => {
  const { id, p1 } = await disputa(); await renegociar(id, p1).expect(200);
  await Proposta.update({ validade_ate: new Date(Date.now() - 60000) }, { where: { id: p1 } });
  await responder(id, p1, prestador, 'ACEITAR').expect(409);
  expect(Number((await Proposta.findByPk(p1)).valor)).toBe(propostaValida.valor);
 });
 test('chat de proposta recusada informa somente leitura e impede envio', async () => {
  const { id, p1, p2 } = await disputa(); await aceitar(id, p1).expect(200);
  const chat = await autenticar(request(app).get(`/api/v1/propostas/${p2}/mensagens`), concorrente).expect(200);
  expect(chat.body.somente_leitura).toBe(true);
  await autenticar(request(app).post(`/api/v1/propostas/${p2}/mensagens`), concorrente).send({ conteudo: 'Não pode enviar.' }).expect(409);
 });
});
