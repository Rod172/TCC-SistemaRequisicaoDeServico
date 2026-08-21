/**
 * @file app.ts
 * @description Configuração da aplicação Express, middlewares de segurança (Helmet, CORS) e documentação Swagger UI.
 * 
 * BIBLIOTECAS UTILIZADAS:
 * 1. Express.js (^4.19.2): Framework web para Node.js.
 *    Doc Oficial: https://expressjs.com/pt-br/
 * 2. Cors (^2.8.5): Habilita chamadas entre domínios (CORS).
 *    Doc Oficial: https://github.com/expressjs/cors
 * 3. Helmet (^7.1.0): Proteção de cabeçalhos HTTP.
 *    Doc Oficial: https://helmetjs.github.io/
 * 4. Swagger UI Express (^5.0.1) & Swagger JSDoc (^6.2.8): Documentação interativa da API REST.
 *    Doc Oficial: https://swagger.io/tools/swagger-ui/
 */

import express, { Request, Response, NextFunction } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import swaggerUi from 'swagger-ui-express';
import swaggerJsDoc from 'swagger-jsdoc';

const app = express();

// Middlewares Globais de Segurança e Parse
app.use(helmet());
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Configuração da Especificação Swagger / OpenAPI 3.0
const swaggerOptions: swaggerJsDoc.Options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'API ServiçoFácil - Plataforma de Requisição de Serviços (TCC)',
      version: '1.0.0',
      description: 'Documentação oficial da API REST desenvolvida em Node.js com Express, TypeScript e Sequelize.',
      contact: {
        name: 'Equipe de TCC (UNIP)',
      },
    },
    servers: [
      {
        url: 'http://localhost:3001/api/v1',
        description: 'Servidor Local de Desenvolvimento',
      },
    ],
  },
  apis: ['./src/controllers/*.ts', './src/routes/*.ts'],
};

const swaggerDocs = swaggerJsDoc(swaggerOptions);
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocs));

// Rota de Health Check para verificação de status da API
app.get('/api/v1/health', (req: Request, res: Response) => {
  res.status(200).json({
    status: 'OK',
    service: 'tcc-servico-facil-backend',
    version: '1.0.0',
    environment: process.env.NODE_ENV || 'development',
    timestamp: new Date().toISOString(),
  });
});

// Middleware Global de Tratamento de Erros
app.use((err: Error, req: Request, res: Response, next: NextFunction) => {
  console.error('Unhandled Error:', err);
  res.status(500).json({
    error: 'Internal Server Error',
    message: err.message || 'Ocorreu um erro interno inesperado no servidor.',
  });
});

export default app;
