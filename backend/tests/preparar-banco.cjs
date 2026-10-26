/** mysql2: cria somente banco validado com sufixo _test.
 * https://sidorares.github.io/node-mysql2/docs
 * Sequelize CLI 6: migrations com --env test, sem sync destrutivo.
 * https://sequelize.org/docs/v6/other-topics/migrations/
 */
const configurar = require('./ambiente.cjs');
const mysql = require('mysql2/promise');
const { execFileSync } = require('node:child_process');
const path = require('node:path');
const fs = require('node:fs');
module.exports = async function prepararBanco() {
 const banco = configurar();
 const raiz = path.resolve(__dirname, '..');
 if (!fs.existsSync(path.join(raiz, 'dist/app.js'))) throw new Error('Execute npm run build antes da integração.');
 const conexao = await mysql.createConnection({
  host: process.env.DB_HOST, port: Number(process.env.DB_PORT),
  user: process.env.DB_USER, password: process.env.DB_PASSWORD, connectTimeout: 5000,
 });
 try { await conexao.query('CREATE DATABASE IF NOT EXISTS `' + banco + '` CHARACTER SET utf8mb4'); }
 finally { await conexao.end(); }
 execFileSync(process.execPath, [require.resolve('sequelize-cli/lib/sequelize'),
  'db:migrate', '--env', 'test', '--config', path.join(__dirname, 'sequelize-test.cjs'),
  '--migrations-path', path.join(raiz, 'src/migrations'),
 ], { cwd: raiz, env: process.env, stdio: 'inherit' });
};
