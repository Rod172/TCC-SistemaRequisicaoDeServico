/**
 * @file server.ts
 * @description Ponto de entrada (Entrypoint) do servidor HTTP Node.js com TypeScript e Express.
 * 
 * BIBLIOTECAS UTILIZADAS:
 * 1. Express.js (^4.19.2): Framework web HTTP.
 *    Doc Oficial: https://expressjs.com/pt-br/
 * 2. Dotenv (^16.4.5): Carregador de variáveis de ambiente.
 *    Doc Oficial: https://github.com/motdotla/dotenv
 */

import dotenv from 'dotenv';
import app from './app';
import { sequelize } from './config/database';

dotenv.config();

const PORT = process.env.PORT || 3001;

async function startServer() {
  try {
    // Autenticar a conexão com o banco de dados MySQL
    await sequelize.authenticate();
    console.log('✅ Conexão com o banco de dados MySQL realizada com sucesso via Sequelize ORM.');

    app.listen(PORT, () => {
      console.log(`🚀 Servidor backend rodando com sucesso em http://localhost:${PORT}`);
      console.log(`📚 Documentação Swagger UI disponível em http://localhost:${PORT}/api-docs`);
    });
  } catch (error) {
    console.error('❌ Falha ao inicializar o servidor backend:', error);
    process.exit(1);
  }
}

startServer();
