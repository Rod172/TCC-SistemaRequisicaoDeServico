/** Jest 30: mantém testes CommonJS comuns e encapsula suítes node:test em subprocesso.
 * https://jestjs.io/docs/code-transformation
 * Node.js: executa os arquivos reais, preservando ts-node e mocks nativos.
 * https://nodejs.org/api/test.html
 */
module.exports = {
 process(fonte, arquivo) {
  if (!/require\(['"]node:test['"]\)/.test(fonte)) return { code: fonte };
  return { code: `
   const { execFileSync } = require('node:child_process');
   test(${JSON.stringify('Suíte nativa: ')} + require('node:path').basename(${JSON.stringify(arquivo)}), () => {
    let saida;
    try {
     saida = execFileSync(process.execPath, ['--test', ${JSON.stringify(arquivo)}], {
      cwd: require('node:path').resolve(__dirname, '..'), encoding: 'utf8', timeout: 25000,
     });
    } catch (erro) { throw new Error(String(erro.stdout || '') + String(erro.stderr || '') + erro.message); }
    expect(saida).toMatch(/# fail 0/);
   }, 30000);
  ` };
 },
};
