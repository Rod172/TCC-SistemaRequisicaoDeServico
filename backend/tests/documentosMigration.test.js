/** Jest (30.5.2): verifica o plano da migration sem banco. https://jestjs.io/docs/api */
const migration = require('../src/migrations/20261025000001-normalizar-documentos-cadastro');
function preparar(tabelas) {
  const transaction = {};
  const qi = {
    sequelize: {
      transaction: jest.fn(fn => fn(transaction)),
      query: jest.fn().mockResolvedValueOnce(tabelas[0]).mockResolvedValueOnce(tabelas[1]),
    },
    bulkUpdate: jest.fn().mockResolvedValue(undefined),
  };
  return { qi, transaction };
}
const Sequelize = { QueryTypes: { SELECT: 'SELECT' } };
test('normaliza ambas as tabelas sem validar checksum legado', async () => {
  const { qi, transaction } = preparar([[{ id: '1', documento: '123.456.789-00' }], [{ id: '2', documento: '12.345.678/0001-00' }]]);
  await migration.up(qi, Sequelize);
  expect(qi.bulkUpdate).toHaveBeenCalledWith('usuarios', { cpf: '12345678900' }, { id: '1' }, { transaction });
  expect(qi.bulkUpdate).toHaveBeenCalledWith('prestadores_perfil', { cnpj_cpf: '12345678000100' }, { id: '2' }, { transaction });
});
test.each([0, 1])('colisão na tabela %s aborta antes de qualquer escrita e sem PII', async indice => {
  const tabelas = [[{ id: '1', documento: '987.654.321-00' }], [{ id: '2', documento: '123.456.789-00' }]];
  tabelas[indice].push({ id: '3', documento: tabelas[indice][0].documento.replace(/\D/g, '') });
  const { qi } = preparar(tabelas);
  await expect(migration.up(qi, Sequelize)).rejects.toThrow('Normalização abortada: documentos duplicados');
  expect(qi.bulkUpdate).not.toHaveBeenCalled();
});
test('documentos já normalizados não são regravados', async () => {
  const { qi } = preparar([[{ id: '1', documento: '52998224725' }], []]);
  await migration.up(qi, Sequelize);
  expect(qi.bulkUpdate).not.toHaveBeenCalled();
});
