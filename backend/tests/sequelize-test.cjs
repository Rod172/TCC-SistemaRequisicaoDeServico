/** Sequelize CLI 6: migrations reais, sem seeds, porta explícita.
 * https://sequelize.org/docs/v6/other-topics/migrations/
 */
require('./ambiente.cjs')();
module.exports = { test: {
 username: process.env.DB_USER, password: process.env.DB_PASSWORD,
 database: process.env.DB_NAME_TEST, host: process.env.DB_HOST,
 port: Number(process.env.DB_PORT), dialect: 'mysql', logging: false,
} };
