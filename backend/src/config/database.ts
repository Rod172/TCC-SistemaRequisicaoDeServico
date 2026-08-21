/**
 * @file database.ts
 * @description Configuração da instância de conexão com o banco de dados MySQL via Sequelize ORM em TypeScript.
 * 
 * BIBLIOTECAS UTILIZADAS:
 * 1. Sequelize ORM (^6.37.3): Mapeamento objeto-relacional para Node.js.
 *    Doc Oficial: https://sequelize.org/docs/v6/
 * 2. mysql2 (^3.9.8): Driver de conexão com o banco de dados MySQL.
 *    Doc Oficial: https://github.com/sidorares/node-mysql2
 */

import { Sequelize } from 'sequelize';
import dotenv from 'dotenv';

dotenv.config();

const dbName = process.env.DB_NAME || 'tcc_servico_facil';
const dbUser = process.env.DB_USER || 'root';
const dbPassword = process.env.DB_PASSWORD || '';
const dbHost = process.env.DB_HOST || 'localhost';
const dbPort = Number(process.env.DB_PORT) || 3306;

export const sequelize = new Sequelize(dbName, dbUser, dbPassword, {
  host: dbHost,
  port: dbPort,
  dialect: 'mysql',
  logging: process.env.NODE_ENV === 'development' ? console.log : false,
  define: {
    timestamps: true,
    underscored: true,
  },
});

export default sequelize;
