/**
 * Testes da troca de senha (PUT /perfil/senha) sobre o backend compilado (executar npm run build antes do Jest).
 * A regra de tamanho é a mesma do cadastro: no mínimo 8 caracteres e no máximo 72 bytes (limite do bcrypt).
 * Jest (30.5.2): mocks e asserções — https://jestjs.io/docs/getting-started
 * BcryptJS: hash real da senha atual — https://github.com/dcodeIO/bcrypt.js
 */
jest.mock('../dist/models', () => ({ Usuario: { findByPk: jest.fn() }, PrestadorPerfil: {} }));
jest.mock('../dist/services/preferenciaNotificacaoService', () => ({ __esModule: true, default: {} }));
const bcrypt = require('bcryptjs');
const { Usuario } = require('../dist/models');
const controller = require('../dist/controllers/perfilController').default;

const SENHA_ATUAL = 'SenhaAtual@1';
let usuario;
beforeAll(async () => {
  usuario = { senha_hash: await bcrypt.hash(SENHA_ATUAL, 4), update: jest.fn() };
});
beforeEach(() => {
  usuario.update.mockReset().mockResolvedValue(undefined);
  Usuario.findByPk.mockReset().mockResolvedValue(usuario);
});

function resposta() {
  const res = {};
  res.status = jest.fn(() => res);
  res.json = jest.fn(() => res);
  return res;
}
async function trocar(nova_senha) {
  const res = resposta();
  await controller.updateSenha({ user: { id: 'conta-1' }, body: { senha_atual: SENHA_ATUAL, nova_senha } }, res);
  return res;
}

test.each([
  ['7 caracteres', '1234567'],
  ['mais de 72 bytes', 'é'.repeat(37)],
  ['valor que não é texto', 12345678],
])('rejeita nova senha com %s, sem gravar', async (_cenario, nova_senha) => {
  const res = await trocar(nova_senha);
  expect(res.status).toHaveBeenCalledWith(400);
  expect(res.json.mock.calls[0][0].message).toMatch(/8 caracteres/);
  expect(usuario.update).not.toHaveBeenCalled();
});

test('aceita nova senha de 8 caracteres e grava o hash, nunca o texto', async () => {
  const res = await trocar('12345678');
  expect(res.status).toHaveBeenCalledWith(200);
  const { senha_hash } = usuario.update.mock.calls[0][0];
  expect(senha_hash).not.toBe('12345678');
  expect(await bcrypt.compare('12345678', senha_hash)).toBe(true);
});

test('mantém a recusa quando a senha atual está errada', async () => {
  const res = resposta();
  await controller.updateSenha({ user: { id: 'conta-1' }, body: { senha_atual: 'errada-123', nova_senha: '12345678' } }, res);
  expect(res.status).toHaveBeenCalledWith(400);
  expect(usuario.update).not.toHaveBeenCalled();
});
