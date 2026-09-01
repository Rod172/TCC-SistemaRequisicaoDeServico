/**
 * @file database.js
 * @description Arquivo de configuração de ambientes (development, test, production) utilizado pelo Sequelize CLI para execução de Migrations e Seeders.
 * 
 * BIBLIOTECAS UTILIZADAS:
 * 1. Dotenv (^16.4.5): Leitura de variáveis de ambiente do arquivo .env.
 *    Doc Oficial: https://github.com/motdotla/dotenv
 * 2. Sequelize CLI (^6.6.2): Automação de Migrations.
 *    Doc Oficial: https://github.com/sequelize/cli
 */

require('dotenv').config();

module.exports = {
  development: {
    username: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || 'tcc_servico_facil',
    host: process.env.DB_HOST || '127.0.0.1',
    port: Number(process.env.DB_PORT) || 3306,
    dialect: 'mysql',
    define: {
      timestamps: true,
      underscored: true
    }
  },
  test: {
    username: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME_TEST || 'tcc_servico_facil_test',
    host: process.env.DB_HOST || '127.0.0.1',
    dialect: 'mysql'
  },
  production: {
    username: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || 'tcc_servico_facil',
    host: process.env.DB_HOST || '127.0.0.1',
    dialect: 'mysql'
  }
};
