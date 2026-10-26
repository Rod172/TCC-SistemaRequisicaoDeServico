/** Jest 30: separa integração MySQL dos testes sem banco.
 * Documentação oficial: https://jestjs.io/docs/configuration#projects-arraystring--projectconfig
 */
module.exports = {
 maxWorkers: 1,
 projects: [
  { displayName: 'unitarios', testEnvironment: 'node',
    testMatch: ['<rootDir>/tests/**/*.test.js', '<rootDir>/tests/**/*.test.cjs'],
    transform: { '^.+\\.cjs$': '<rootDir>/tests/executar-nativo.cjs' },
    testPathIgnorePatterns: ['\\.integracao\\.test\\.js$'], clearMocks: true },
  { displayName: 'integracao', testEnvironment: 'node',
    testMatch: ['<rootDir>/tests/**/*.integracao.test.js'],
    globalSetup: '<rootDir>/tests/preparar-banco.cjs',
    setupFiles: ['<rootDir>/tests/ambiente.cjs'], clearMocks: true },
 ],
 testTimeout: 30000,
};
