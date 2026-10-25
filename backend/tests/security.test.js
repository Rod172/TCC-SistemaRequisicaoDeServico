/**
 * Testes da US22 sobre o backend compilado (executar npm run build antes do Jest).
 * Jest (30.5.2): mocks e asserções — https://jestjs.io/docs/getting-started
 * Supertest (7.3.1): requisições HTTP — https://github.com/ladjs/supertest
 * Express: aplicação isolada — https://expressjs.com/
 * jsonwebtoken: emissão de credenciais para cenários — https://github.com/auth0/node-jsonwebtoken
 */
jest.mock('../dist/models', () => ({ Usuario: { findByPk: jest.fn() } }));
jest.mock('../dist/controllers/authController', () => ({
  __esModule: true,
  default: {
    login: (_req, res) => res.status(401).json({ message: 'Credenciais inválidas.' }),
    registerSolicitante: jest.fn(), registerPrestador: jest.fn(), getMe: jest.fn(),
  },
}));
const express = require('express');
const request = require('supertest');
const jwt = require('jsonwebtoken');
const { Usuario } = require('../dist/models');
const { authMiddleware } = require('../dist/middlewares/authMiddleware');
const { optionalAuthMiddleware } = require('../dist/middlewares/optionalAuthMiddleware');
const { getJwtSecret } = require('../dist/config/jwt');
const secret = 'segredo-exclusivo-para-testes-seguranca-us22';
const usuario = { id: 'conta-1', email: 'atual@example.com', tipo_perfil: 'SOLICITANTE', ativo: true };
let envOriginal;
beforeEach(() => {
  envOriginal = process.env.JWT_SECRET;
  process.env.JWT_SECRET = secret;
  Usuario.findByPk.mockReset().mockResolvedValue(usuario);
});
afterEach(() => {
  if (envOriginal === undefined) delete process.env.JWT_SECRET;
  else process.env.JWT_SECRET = envOriginal;
});
function appCom(middleware) {
  const app = express();
  app.get('/', middleware, (req, res) => res.json({ usuario: req.user || null }));
  return app;
}
function token(payload = {}, options = {}) {
  return jwt.sign({ id: usuario.id, email: 'antigo@example.com', tipo_perfil: 'ADMIN', ...payload }, secret, { expiresIn: '1h', ...options });
}
test('usa perfil e e-mail atuais mesmo quando o JWT contém privilégios antigos', async () => {
  const res = await request(appCom(authMiddleware)).get('/').auth(token(), { type: 'bearer' });
  expect(res.status).toBe(200);
  expect(res.body.usuario).toEqual({ id: usuario.id, email: usuario.email, tipo_perfil: 'SOLICITANTE' });
});
test.each([null, { ...usuario, ativo: false }])('rejeita conta removida ou desativada: %j', async (conta) => {
  Usuario.findByPk.mockResolvedValue(conta);
  expect((await request(appCom(authMiddleware)).get('/').auth(token(), { type: 'bearer' })).status).toBe(401);
  const publico = await request(appCom(optionalAuthMiddleware)).get('/').auth(token(), { type: 'bearer' });
  expect(publico.status).toBe(200);
  expect(publico.body.usuario).toBeNull();
});
test('autenticação opcional também usa o perfil atual', async () => {
  const res = await request(appCom(optionalAuthMiddleware)).get('/').auth(token(), { type: 'bearer' });
  expect(res.body.usuario.tipo_perfil).toBe('SOLICITANTE');
});
test.each(['ausente', 'inválido', 'expirado', 'algoritmo'])('rejeita token %s', async (cenario) => {
  const credencial = cenario === 'expirado' ? token({}, { expiresIn: -1 }) : cenario === 'algoritmo' ? token({}, { algorithm: 'HS384' }) : 'invalido';
  const req = request(appCom(authMiddleware)).get('/');
  if (cenario !== 'ausente') req.auth(credencial, { type: 'bearer' });
  expect((await req).status).toBe(401);
});
test.each([undefined, '', 'curto', 'tcc_secret_key_super_segura_2026'])('falha claramente para segredo inseguro', (valor) => {
  if (valor === undefined) delete process.env.JWT_SECRET;
  else process.env.JWT_SECRET = valor;
  expect(getJwtSecret).toThrow('Configuração inválida: JWT_SECRET');
});
test('a rota real bloqueia a décima primeira tentativa de login', async () => {
  const app = express();
  app.use('/auth', require('../dist/routes/authRoutes').default);
  for (let i = 0; i < 10; i++) {
    expect((await request(app).post('/auth/login').send({})).status).toBe(401);
  }
  const res = await request(app).post('/auth/login').send({});
  expect(res.status).toBe(429);
  expect(res.headers['retry-after']).toBeDefined();
});
