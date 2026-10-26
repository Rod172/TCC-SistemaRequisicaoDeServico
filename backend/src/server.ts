/**
 * @file server.ts
 * @description Ponto de entrada (Entrypoint) do servidor HTTP Node.js com TypeScript e Express. Cria
 * um `http.Server` explícito (em vez de `app.listen`) para que o Socket.io do chat (US14) possa se
 * conectar na mesma porta.
 *
 * BIBLIOTECAS UTILIZADAS:
 * 1. Express.js (^4.19.2): Framework web HTTP.
 *    Doc Oficial: https://expressjs.com/pt-br/
 * 2. Dotenv (^16.4.5): Carregador de variáveis de ambiente.
 *    Doc Oficial: https://github.com/motdotla/dotenv
 * 3. Socket.io (^4.8.3): WebSocket do chat privado em tempo real.
 *    Doc Oficial: https://socket.io/docs/v4/
 */

import http from 'http';
import dotenv from 'dotenv';
import app from './app';
import { sequelize } from './config/database';
import { initChatSocket } from './sockets/chatSocket';
import { getJwtSecret } from './config/jwt';

dotenv.config();

const PORT = process.env.PORT || 3001;

async function startServer() {
  try {
    getJwtSecret();
    // Autenticar a conexão com o banco de dados MySQL
    await sequelize.authenticate();
    console.log('✅ Conexão com o banco de dados MySQL realizada com sucesso via Sequelize ORM.');

    const httpServer = http.createServer(app);
    initChatSocket(httpServer);

    httpServer.listen(PORT, () => {
      console.log(`🚀 Servidor backend rodando com sucesso em http://localhost:${PORT}`);
      console.log(`📚 Documentação Swagger UI disponível em http://localhost:${PORT}/api-docs`);
      console.log(`💬 Chat em tempo real (Socket.io) disponível na mesma porta.`);
    });
  } catch (error) {
    console.error('❌ Falha ao inicializar o servidor backend:', error);
    process.exit(1);
  }
}

startServer();
