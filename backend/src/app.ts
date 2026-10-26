/**
 * @file app.ts
 * @description Configuração da aplicação Express, rotas da API, middlewares de segurança (Helmet, CORS) e Swagger UI.
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
 * 5. Multer (^2.3.0): Identificação de erros de upload no tratamento centralizado.
 *    Doc Oficial: https://github.com/expressjs/multer
 */

import express, { Request, Response, NextFunction } from 'express';
import path from 'path';
import cors from 'cors';
import helmet from 'helmet';
import swaggerUi from 'swagger-ui-express';
import { criarDocumentoOpenApi } from './config/openapi';
import authRoutes from './routes/authRoutes';
import perfilRoutes from './routes/perfilRoutes';
import solicitacaoRoutes from './routes/solicitacaoRoutes';
import oportunidadeRoutes from './routes/oportunidadeRoutes';
import adminRoutes from './routes/adminRoutes';
import chatRoutes from './routes/chatRoutes';
import notificacaoRoutes from './routes/notificacaoRoutes';
import perguntaRoutes from './routes/perguntaRoutes';
import denunciaRoutes from './routes/denunciaRoutes';
import avaliacaoRoutes from './routes/avaliacaoRoutes';
import prestadorPublicoRoutes from './routes/prestadorPublicoRoutes';
import dashboardRoutes from './routes/dashboardRoutes';
import HttpError from './utils/HttpError';
import multer from 'multer';

import privacidadeRoutes from './routes/privacidadeRoutes';

const app = express();

// Middlewares Globais de Segurança e Parse
app.use(helmet());
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Servidor de arquivos estáticos enviados pelos usuários (ex.: foto de perfil da US04).
// O cabeçalho Cross-Origin-Resource-Policy do Helmet é relaxado apenas aqui para
// permitir que o frontend (porta 3000) exiba as imagens hospedadas no backend (porta 3001).
app.use(
  '/uploads',
  (req: Request, res: Response, next: NextFunction) => {
    res.setHeader('Cross-Origin-Resource-Policy', 'cross-origin');
    next();
  },
  express.static(path.join(__dirname, '../uploads'))
);

// Configuração da Especificação Swagger / OpenAPI 3.0
const swaggerDocs = criarDocumentoOpenApi();
app.get('/api-docs.json', (_req, res) => res.json(swaggerDocs));
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

// Registro dos Módulos de Rotas da Aplicação
app.use('/api/v1', privacidadeRoutes);
app.use('/api/v1/auth', authRoutes);
app.use('/api/v1/perfil', perfilRoutes);
app.use('/api/v1/solicitacoes', solicitacaoRoutes);
app.use('/api/v1/propostas', chatRoutes);
app.use('/api/v1/solicitacoes', perguntaRoutes);
app.use('/api/v1/solicitacoes', denunciaRoutes);
app.use('/api/v1/solicitacoes', avaliacaoRoutes);
app.use('/api/v1/prestador', oportunidadeRoutes);
app.use('/api/v1/admin', adminRoutes);
app.use('/api/v1/notificacoes', notificacaoRoutes);
app.use('/api/v1/prestadores', prestadorPublicoRoutes);
app.use('/api/v1/dashboards', dashboardRoutes);

// Middleware Global de Tratamento de Erros
app.use((err: Error, req: Request, res: Response, next: NextFunction) => {
  if (err instanceof HttpError) {
    return res.status(err.status).json({ error: err.name, message: err.message });
  }
  if (err instanceof multer.MulterError) {
    return res.status(400).json({ error: 'Arquivo inválido', message: err.code === 'LIMIT_FILE_SIZE' ? 'Arquivo excede o tamanho permitido.' : 'Quantidade ou campo de arquivos inválido.' });
  }
  if (err instanceof SyntaxError && 'body' in err) {
    return res.status(400).json({ error: 'Requisição inválida', message: 'O corpo JSON é inválido.' });
  }
  console.error('Erro não tratado:', err);
  res.status(500).json({
    error: 'Erro interno',
    message: 'Ocorreu um erro interno inesperado no servidor.',
  });
});

export default app;
