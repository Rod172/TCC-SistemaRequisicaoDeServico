/** Jest (30.5.2): testes unitários sem banco. https://jestjs.io/docs/api */
const { normalizarDocumento, validarCPF, validarCNPJ, validarDocumento } = require('../dist/validators/documento');
test.each(['52998224725', '529.982.247-25'])('valida CPF %s', cpf => expect(validarCPF(cpf)).toBe(true));
test.each(['11222333000181', '11.222.333/0001-81'])('valida CNPJ %s', cnpj => expect(validarCNPJ(cnpj)).toBe(true));
test.each(['00000000000', '11111111111', '52998224724', '123', '', null, 52998224725, {}, 'abc52998224725'])('rejeita CPF inválido %j', cpf => expect(validarCPF(cpf)).toBe(false));
test.each(['00000000000000', '11111111111111', '11222333000180', '123', null, {}])('rejeita CNPJ inválido %j', cnpj => expect(validarCNPJ(cnpj)).toBe(false));
test('normaliza documentos e restringe CNPJ ao prestador', () => {
  expect(normalizarDocumento('11.222.333/0001-81')).toBe('11222333000181');
  expect(validarDocumento('529.982.247-25')).toBe('52998224725');
  expect(validarDocumento('11.222.333/0001-81', true)).toBe('11222333000181');
  expect(() => validarDocumento('11.222.333/0001-81')).toThrow('CPF inválido');
});
