/**
 * Arquivo de Configuração de Conexão com o Banco de Dados MySQL usando Sequelize ORM
 * 
 * Bibliotecas de Terceiros Utilizadas:
 * - dotenv: Carrega variáveis de ambiente de um arquivo .env para process.env.
 *   Doc: https://github.com/motdotla/dotenv
 * - sequelize: ORM para Node.js com suporte a MySQL.
 *   Doc: https://sequelize.org
 */

require('dotenv').config();

module.exports = {
  development: {
    username: process.env.DB_USER || 'root',
    password: process.env.DB_PASS || 'root',
    database: process.env.DB_NAME || 'tcc_sistema_requisicao',
    host: process.env.DB_HOST || 'localhost',
    port: process.env.DB_PORT || 3306,
    dialect: 'mysql',
    logging: console.log,
    define: {
      timestamps: true,
      underscored: true
    }
  },
  production: {
    username: process.env.DB_USER,
    password: process.env.DB_PASS,
    database: process.env.DB_NAME,
    host: process.env.DB_HOST,
    port: process.env.DB_PORT,
    dialect: 'mysql',
    logging: false,
    define: {
      timestamps: true,
      underscored: true
    }
  }
};
