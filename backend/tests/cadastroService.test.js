/** Jest (30.5.2): serviço isolado com persistência simulada. https://jestjs.io/docs/mock-functions */
jest.mock('../dist/models', () => ({ Usuario: { findOne: jest.fn(), create: jest.fn() }, PrestadorPerfil: { create: jest.fn() } }));
jest.mock('../dist/config/database', () => ({ __esModule: true, default: { transaction: jest.fn(fn => fn({})) } }));
jest.mock('bcryptjs', () => ({ hash: jest.fn().mockResolvedValue('hash'), compare: jest.fn() }));
const { Usuario, PrestadorPerfil } = require('../dist/models');
const { AuthService } = require('../dist/services/authService');
const servico = new AuthService();
const dados = { nome: 'Teste', email: ' TESTE@example.com ', telefone: '11999999999', cpf: '529.982.247-25', cnpj_cpf: '11.222.333/0001-81', senha: 'Senha123!', termo_lgpd_aceito: true, categorias: ['Pintura'], foto_url: '/uploads/foto.png' };
beforeEach(() => {
  jest.clearAllMocks();
  Usuario.findOne.mockResolvedValue(null);
  Usuario.create.mockImplementation(async valores => ({ id: '1', toJSON: () => valores }));
  PrestadorPerfil.create.mockImplementation(async valores => ({ toJSON: () => valores }));
});
test.each(['registerSolicitante', 'registerPrestador'])('%s normaliza antes de buscar/gravar e preserva foto', async metodo => {
  await servico[metodo](dados);
  const documento = metodo === 'registerSolicitante' ? '52998224725' : '11222333000181';
  expect(Usuario.findOne).toHaveBeenCalledWith({ where: { cpf: documento } });
  expect(Usuario.create.mock.calls[0][0]).toMatchObject({ cpf: documento, email: 'teste@example.com', foto_url: dados.foto_url });
  if (metodo === 'registerPrestador') expect(PrestadorPerfil.create.mock.calls[0][0].cnpj_cpf).toBe(documento);
});
test.each(['registerSolicitante', 'registerPrestador'])('%s exige consentimento booleano e credenciais válidas', async metodo => {
  for (const alteracao of [{ termo_lgpd_aceito: 'true' }, { termo_lgpd_aceito: 1 }, { termo_lgpd_aceito: false }, { email: {} }, { email: 'invalido' }, { email: 'a'.repeat(150) + '@x.com' }, { senha: 12345678 }, { senha: 'curta' }, { senha: 'a'.repeat(73) }, { senha: 'á'.repeat(37) }, { cpf: '52998224724', cnpj_cpf: '11222333000180' }]) {
    await expect(servico[metodo]({ ...dados, ...alteracao })).rejects.toThrow();
  }
  expect(Usuario.findOne).not.toHaveBeenCalled();
  expect(Usuario.create).not.toHaveBeenCalled();
});

test.each(['registerSolicitante', 'registerPrestador'])('%s rejeita campos pessoais inválidos antes de acessar o banco', async metodo => {
  for (const alteracao of [{ nome: {} }, { nome: 123 }, { nome: '' }, { nome: '   ' }, { nome: 'a'.repeat(151) }, { telefone: {} }, { telefone: 123 }, { telefone: '' }, { telefone: 'a'.repeat(21) }, { endereco: {} }, { endereco: null }, { endereco: 'a'.repeat(256) }]) {
    await expect(servico[metodo]({ ...dados, ...alteracao })).rejects.toMatchObject({ status: 400 });
  }
  expect(Usuario.findOne).not.toHaveBeenCalled();
});
test('prestador rejeita biografia e categorias com tipos inválidos', async () => {
  for (const alteracao of [{ descricao_bio: {} }, { descricao_bio: null }, { descricao_bio: 123 }, { categorias: {} }, { categorias: [] }, { categorias: [{}] }, { categorias: [123] }, { categorias: [null] }, { categorias: [''] }, { categorias: ['   '] }, { categorias: ['Pintura', {}] }]) {
    await expect(servico.registerPrestador({ ...dados, ...alteracao })).rejects.toMatchObject({ status: 400 });
  }
  expect(Usuario.findOne).not.toHaveBeenCalled();
});
test.each(['registerSolicitante', 'registerPrestador'])('%s aceita limites das colunas e campos opcionais ausentes', async metodo => {
  await servico[metodo]({ ...dados, nome: 'n'.repeat(150), telefone: '1'.repeat(20), endereco: 'e'.repeat(255), descricao_bio: 'Biografia' });
  expect(Usuario.create.mock.calls[0][0]).toMatchObject({ nome: 'n'.repeat(150), telefone: '1'.repeat(20), endereco: 'e'.repeat(255) });
});
test.each([{ email: {}, senha: 'Senha123!' }, { email: 123, senha: 'Senha123!' }, { email: null, senha: 'Senha123!' }, { email: 'teste@example.com', senha: {} }, { email: 'teste@example.com', senha: 123 }, { email: 'teste@example.com', senha: null }, {}, null])('login com tipos inválidos responde erro genérico: %j', async credenciais => {
  await expect(servico.login(credenciais)).rejects.toMatchObject({ message: 'E-mail ou senha incorretos.', status: 401 });
  expect(Usuario.findOne).not.toHaveBeenCalled();
});
