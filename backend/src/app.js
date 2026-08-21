/**
 * Configuração da Aplicação Express (API REST)
 * 
 * Bibliotecas de Terceiros Utilizadas:
 * - express: Framework web minimalista e flexível para Node.js.
 *   Doc: https://expressjs.com
 * - cors: Middleware para habilitar requisições de origens cruzadas (Cross-Origin Resource Sharing).
 *   Doc: https://github.com/expressjs/cors
 * - helmet: Middleware de segurança para configurar cabeçalhos HTTP de proteção.
 *   Doc: https://helmetjs.github.io
 * - swagger-ui-express / swagger-jsdoc: Interface interativa para documentação da API REST (OpenAPI 3.0).
 *   Doc: https://github.com/scottie1984/swagger-ui-express
 */

const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const swaggerUi = require('swagger-ui-express');
const swaggerJsDoc = require('swagger-jsdoc');

const app = express();

// Middlewares de Segurança e Parsing
app.use(helmet());
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Configuração da Documentação Swagger/OpenAPI
const swaggerOptions = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Sistema de Requisição de Serviço API (TCC)',
      version: '1.0.0',
      description: 'Documentação oficial da API REST da Plataforma de Intermediação de Serviços sob Demanda.',
      contact: {
        name: 'Equipe TCC UNIP',
      },
    },
    servers: [
      {
        url: 'http://localhost:3001/api/v1',
        description: 'Servidor de Desenvolvimento',
      },
    ],
  },
  apis: ['./src/routes/*.js'],
};

const swaggerDocs = swaggerJsDoc(swaggerOptions);
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocs));

// Rota de Health Check / Status da API
app.get('/api/v1/health', (req, res) => {
  res.status(200).json({
    status: 'OK',
    mensagem: 'API do Sistema de Requisição de Serviço funcionando perfeitamente!',
    timestamp: new Date().toISOString()
  });
});

// Middleware Global de Tratamento de Erros
app.use((err, req, res, next) => {
  console.error('Erro na aplicação:', err.stack);
  res.status(err.status || 500).json({
    sucesso: false,
    mensagem: err.message || 'Erro interno no servidor',
    erro: process.env.NODE_ENV === 'development' ? err.stack : undefined
  });
});

module.exports = app;
