/**
 * @file solicitacaoRoutes.ts
 * @description Rotas REST do painel "Minhas Solicitações" (US06, US07, US11, US12, US13), todas
 * protegidas por JWT.
 *
 * BIBLIOTECAS UTILIZADAS:
 * 1. Express.js Router (^4.19.2): Roteador do servidor web.
 *    Doc Oficial: https://expressjs.com/pt-br/4x/api-html#router
 */

import { Router } from 'express';
import solicitacaoController from '../controllers/solicitacaoController';
import authMiddleware from '../middlewares/authMiddleware';
import uploadAnexosSolicitacao from '../middlewares/uploadAnexosMiddleware';

const solicitacaoRoutes = Router();

solicitacaoRoutes.use(authMiddleware);

// POST /api/v1/solicitacoes — Publicação de nova solicitação com anexos (US05)
solicitacaoRoutes.post('/', uploadAnexosSolicitacao.array('anexos', 5), (req, res) =>
  solicitacaoController.criarSolicitacao(req, res)
);

// GET /api/v1/solicitacoes/minhas — Painel "Minhas Solicitações" (US06)
solicitacaoRoutes.get('/minhas', (req, res) => solicitacaoController.listarMinhas(req, res));

// GET /api/v1/solicitacoes/minhas/:id/propostas — Comparação de propostas (US11)
solicitacaoRoutes.get('/minhas/:id/propostas', (req, res) => solicitacaoController.buscarComPropostas(req, res));

// PATCH /api/v1/solicitacoes/minhas/:id/propostas/:propostaId/status — Aceite/recusa (US12)
solicitacaoRoutes.patch('/minhas/:id/propostas/:propostaId/status', (req, res) =>
  solicitacaoController.atualizarStatusProposta(req, res)
);

// POST /api/v1/solicitacoes/minhas/:id/propostas/:propostaId/renegociar — Contraproposta
solicitacaoRoutes.post('/minhas/:id/propostas/:propostaId/renegociar', (req, res) =>
  solicitacaoController.renegociarProposta(req, res)
);

// PATCH /api/v1/solicitacoes/:id/cancelar — Cancelamento de solicitação (US07)
solicitacaoRoutes.patch('/:id/cancelar', (req, res) => solicitacaoController.cancelarSolicitacao(req, res));

// PATCH /api/v1/solicitacoes/:id/cancelar-contratacao — Solicitante desfaz um aceite já feito (US34)
solicitacaoRoutes.patch('/:id/cancelar-contratacao', (req, res) => solicitacaoController.cancelarContratacao(req, res));

// PATCH /api/v1/solicitacoes/:id/concluir — Confirmação de conclusão do serviço (US17)
solicitacaoRoutes.patch('/:id/concluir', (req, res) => solicitacaoController.concluir(req, res));

// POST /api/v1/solicitacoes/:id/custodia/simular — Simulação de pagamento/custódia (US13)
solicitacaoRoutes.post('/:id/custodia/simular', (req, res) =>
  solicitacaoController.simularPagamentoCustodia(req, res)
);

export default solicitacaoRoutes;
