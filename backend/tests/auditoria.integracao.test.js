/**
 * US27: persistência, autorização, idempotência e rollback da auditoria administrativa.
 * Jest (30): testes, hooks e asserções. https://jestjs.io/docs/api
 * Supertest (7): rotas HTTP reais. https://github.com/forwardemail/supertest
 * Sequelize (^6.37.3): fixtures próprias, hooks de falha e consultas ao MySQL real.
 * https://sequelize.org/docs/v6/other-topics/transactions/
 * JSON Web Token (^9.0.2): tokens exclusivamente do ambiente de integração.
 * https://github.com/auth0/node-jsonwebtoken
 * bcryptjs (^2.4.3): hash da senha das fixtures. https://github.com/dcodeIO/bcrypt.js
 * Executar somente após build/migrations e coordenação do banco de testes compartilhado.
 */
require('./ambiente.cjs')();
const request = require('supertest');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const { randomUUID, randomInt } = require('node:crypto');
const { Op } = require('sequelize');
const app = require('../dist/app').default;
const banco = require('../dist/config/database').default;
const { Usuario, Solicitacao, Denuncia, RegistroAdministrativo } = require('../dist/models');
const usuarios = [];
const solicitacoes = [];
const denuncias = [];
let admin, segundoAdmin, prestador, alvo, denuncia, senhaHash;

async function criarUsuario(tipo_perfil) {
  const usuario = await Usuario.create({
    nome: 'Fixture de auditoria US27', email: `auditoria-${randomUUID()}@example.test`,
    cpf: String(randomInt(10000000000, 99999999999)), telefone: '16999999999',
    senha_hash: senhaHash, tipo_perfil, ativo: true, termo_lgpd_aceito: true,
  });
  usuarios.push(usuario.id);
  return { id: usuario.id, token: jwt.sign({ id: usuario.id, email: usuario.email, tipo_perfil }, process.env.JWT_SECRET, { expiresIn: '1h' }) };
}
const autorizar = (requisicao, ator = admin) => requisicao.set('Authorization', `Bearer ${ator.token}`);
const alterar = (ativo, ator = admin, corpo = {}) => autorizar(request(app).patch(`/api/v1/admin/usuarios/${alvo.id}/status`), ator).send({ ...corpo, ativo });
const resolver = (ator = admin) => autorizar(request(app).patch(`/api/v1/admin/denuncias/${denuncia.id}/resolver`), ator);
const registrosUsuario = () => RegistroAdministrativo.findAll({ where: { usuario_id: alvo.id }, order: [['ocorrido_em', 'ASC']] });
const registrosDenuncia = () => RegistroAdministrativo.findAll({ where: { denuncia_id: denuncia.id } });

beforeAll(async () => {
  await banco.authenticate();
  senhaHash = await bcrypt.hash('SenhaExclusivaAuditoria123!', 10);
  admin = await criarUsuario('ADMIN');
  segundoAdmin = await criarUsuario('ADMIN');
  prestador = await criarUsuario('PRESTADOR');
});
beforeEach(async () => {
  alvo = await criarUsuario('SOLICITANTE');
  const solicitacao = await Solicitacao.create({ solicitante_id: alvo.id, titulo: 'Solicitação da auditoria', descricao: 'Fixture própria para auditar uma denúncia.', status: 'ABERTA' });
  solicitacoes.push(solicitacao.id);
  denuncia = await Denuncia.create({ solicitacao_id: solicitacao.id, denunciante_id: alvo.id, motivo: 'Motivo da denúncia de integração.' });
  denuncias.push(denuncia.id);
});
afterEach(() => RegistroAdministrativo.removeHook('beforeCreate', 'falha-auditoria-us27'));
afterAll(async () => {
  try {
    // Remove somente fixtures desta suíte, respeitando os vínculos que preservam o histórico.
    // Evita limpeza parcial e desfaz a FK autorreferente somente nas fixtures próprias.
    await banco.transaction(async transaction => {
      if (usuarios.length) await RegistroAdministrativo.destroy({ where: {
        [Op.or]: [{ admin_id: { [Op.in]: usuarios } }, { usuario_id: { [Op.in]: usuarios } }],
      }, transaction });
      if (denuncias.length) await Denuncia.destroy({ where: { id: { [Op.in]: denuncias } }, transaction });
      if (solicitacoes.length) await Solicitacao.destroy({ where: { id: { [Op.in]: solicitacoes } }, transaction });
      if (usuarios.length) {
        await Usuario.update({ status_alterado_por: null }, { where: { id: { [Op.in]: usuarios } }, transaction });
        await Usuario.destroy({ where: { id: { [Op.in]: usuarios } }, transaction });
      }
    });
  } finally { await banco.close(); }
});

test('preserva desativação e reativação como eventos distintos, com autor, alvo, data e estados', async () => {
  const inicio = Date.now();
  await alterar(false, admin, { admin_id: segundoAdmin.id }).expect(200);
  await alterar(true, segundoAdmin).expect(200);
  const registros = await registrosUsuario();
  expect(registros).toHaveLength(2);
  const desativacao = registros.find(r => r.acao === 'DESATIVAR_USUARIO');
  const ativacao = registros.find(r => r.acao === 'ATIVAR_USUARIO');
  expect(desativacao).toMatchObject({ admin_id: admin.id, usuario_id: alvo.id, denuncia_id: null,
    estado_anterior: { ativo: true }, estado_posterior: { ativo: false } });
  expect(ativacao).toMatchObject({ admin_id: segundoAdmin.id, usuario_id: alvo.id,
    estado_anterior: { ativo: false }, estado_posterior: { ativo: true } });
  for (const registro of registros) {
    expect(registro.ocorrido_em).toBeInstanceOf(Date);
    expect(registro.ocorrido_em.getTime()).toBeGreaterThanOrEqual(inicio - 1000);
    expect(registro.ocorrido_em.getTime()).toBeLessThanOrEqual(Date.now());
    expect(JSON.stringify(registro)).not.toMatch(/senha_hash|telefone|email/);
  }
  const usuario = await Usuario.findByPk(alvo.id);
  expect(usuario.ativo).toBe(true);
  expect(usuario.status_alterado_por).toBe(segundoAdmin.id);
});

test('repetição e solicitações simultâneas do mesmo estado não duplicam registros', async () => {
  const respostas = await Promise.all([alterar(false), alterar(false, segundoAdmin)]);
  expect(respostas.map(r => r.status)).toEqual([200, 200]);
  const antes = (await Usuario.findByPk(alvo.id)).toJSON();
  await alterar(false).expect(200);
  expect(await registrosUsuario()).toHaveLength(1);
  expect((await Usuario.findByPk(alvo.id)).toJSON()).toEqual(antes);
});

test('resolver denúncia registra o administrador autenticado e não repete o evento', async () => {
  const respostas = await Promise.all([resolver(), resolver(segundoAdmin)]);
  expect(respostas.map(r => r.status)).toEqual([200, 200]);
  await resolver().expect(200);
  const registros = await registrosDenuncia();
  expect(registros).toHaveLength(1);
  expect([admin.id, segundoAdmin.id]).toContain(registros[0].admin_id);
  expect(registros[0]).toMatchObject({ denuncia_id: denuncia.id, usuario_id: null, acao: 'RESOLVER_DENUNCIA',
    estado_anterior: { status: 'PENDENTE' }, estado_posterior: { status: 'RESOLVIDA' } });
  expect((await Denuncia.findByPk(denuncia.id)).status).toBe('RESOLVIDA');
});

test('bloqueia anônimo, solicitante e prestador sem alterar alvos nem registrar eventos', async () => {
  await request(app).patch(`/api/v1/admin/usuarios/${alvo.id}/status`).send({ ativo: false }).expect(401);
  await request(app).patch(`/api/v1/admin/denuncias/${denuncia.id}/resolver`).expect(401);
  for (const ator of [alvo, prestador]) {
    await alterar(false, ator).expect(403);
    await resolver(ator).expect(403);
  }
  expect((await Usuario.findByPk(alvo.id)).ativo).toBe(true);
  expect((await Denuncia.findByPk(denuncia.id)).status).toBe('PENDENTE');
  expect(await registrosUsuario()).toHaveLength(0);
  expect(await registrosDenuncia()).toHaveLength(0);
});

test('não registra ações inválidas, recurso inexistente ou autossuspensão', async () => {
  await autorizar(request(app).patch(`/api/v1/admin/usuarios/${admin.id}/status`)).send({ ativo: false }).expect(400);
  await autorizar(request(app).patch(`/api/v1/admin/usuarios/${alvo.id}/status`)).send({ ativo: 'false' }).expect(400);
  await autorizar(request(app).patch(`/api/v1/admin/usuarios/${randomUUID()}/status`)).send({ ativo: false }).expect(404);
  await autorizar(request(app).patch(`/api/v1/admin/denuncias/${randomUUID()}/resolver`)).expect(404);
  expect(await registrosUsuario()).toHaveLength(0);
  expect(await RegistroAdministrativo.count({ where: { usuario_id: admin.id } })).toBe(0);
});

test.each(['usuario', 'denuncia'])('falha ao inserir auditoria reverte a alteração de %s', async tipo => {
  const usuarioAntes = (await Usuario.findByPk(alvo.id)).toJSON();
  const denunciaAntes = (await Denuncia.findByPk(denuncia.id)).toJSON();
  // Falha apenas na auditoria desta fixture, depois de executar o UPDATE real dentro da transação.
  RegistroAdministrativo.addHook('beforeCreate', 'falha-auditoria-us27', registro => {
    if (registro.usuario_id === alvo.id || registro.denuncia_id === denuncia.id) throw new Error('Falha controlada de auditoria US27.');
  });
  try {
    await (tipo === 'usuario' ? alterar(false) : resolver()).expect(500);
    expect((await Usuario.findByPk(alvo.id)).toJSON()).toEqual(usuarioAntes);
    expect((await Denuncia.findByPk(denuncia.id)).toJSON()).toEqual(denunciaAntes);
    expect(await registrosUsuario()).toHaveLength(0);
    expect(await registrosDenuncia()).toHaveLength(0);
  } finally { RegistroAdministrativo.removeHook('beforeCreate', 'falha-auditoria-us27'); }
});

test('alterar uma conta não modifica nem audita outra conta', async () => {
  const outra = await criarUsuario('SOLICITANTE');
  const antes = (await Usuario.findByPk(outra.id)).toJSON();
  await alterar(false).expect(200);
  expect((await Usuario.findByPk(outra.id)).toJSON()).toEqual(antes);
  expect(await RegistroAdministrativo.count({ where: { usuario_id: outra.id } })).toBe(0);
  expect(await registrosUsuario()).toHaveLength(1);
});
