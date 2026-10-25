/**
 * Rotas pessoais: montar em /api/v1/dashboards.
 * Express (^4.19.2): roteamento com autenticação JWT existente.
 * Documentação oficial: https://expressjs.com/pt-br/guide/routing.html
 * Swagger JSDoc (^6.2.8): contratos OpenAPI dos DTOs, sem dependências novas.
 * Documentação oficial: https://github.com/Surnet/swagger-jsdoc
 */
import { Router } from 'express';
import authMiddleware from '../middlewares/authMiddleware';
import dashboardController from '../controllers/dashboardController';

/**
 * @openapi
 * components:
 *   schemas:
 *     DashboardSolicitanteDTO:
 *       type: object
 *       required: [servicos_abertos, propostas_pendentes, servicos_em_andamento, servicos_concluidos]
 *       properties:
 *         servicos_abertos:
 *           type: integer
 *           minimum: 0
 *           description: Solicitações próprias ABERTA ou EM_NEGOCIACAO.
 *         propostas_pendentes:
 *           type: integer
 *           minimum: 0
 *           description: Propostas ENVIADA ou EM_ANALISE recebidas nas solicitações próprias.
 *         servicos_em_andamento:
 *           type: integer
 *           minimum: 0
 *           description: Solicitações próprias CONTRATADA.
 *         servicos_concluidos:
 *           type: integer
 *           minimum: 0
 *           description: Solicitações próprias CONCLUIDA.
 *     DashboardPrestadorDTO:
 *       type: object
 *       required: [propostas_enviadas_mes, propostas_aceitas_mes, taxa_conversao, nota_reputacao, total_avaliacoes, saldo_liberado, valor_em_custodia, periodo]
 *       properties:
 *         propostas_enviadas_mes:
 *           type: integer
 *           minimum: 0
 *         propostas_aceitas_mes:
 *           type: integer
 *           minimum: 0
 *           description: Propostas criadas neste mês cujo estado atual é ACEITA.
 *         taxa_conversao:
 *           type: number
 *           minimum: 0
 *           maximum: 100
 *           description: Percentual de aceitas dentre as enviadas no mesmo mês; zero sem propostas.
 *         nota_reputacao:
 *           type: number
 *           nullable: true
 *           minimum: 1
 *           maximum: 5
 *           description: Média de todas as avaliações reais; nulo quando não há avaliações.
 *         total_avaliacoes:
 *           type: integer
 *           minimum: 0
 *         saldo_liberado:
 *           type: number
 *           minimum: 0
 *           multipleOf: 0.01
 *           example: 180.5
 *           description: Saldo simulado em reais; soma de custódias LIBERADO vinculadas às propostas do usuário, de todos os períodos.
 *         valor_em_custodia:
 *           type: number
 *           minimum: 0
 *           multipleOf: 0.01
 *           example: 250
 *           description: Valor simulado em reais; soma de custódias RETIDO vinculadas às propostas do usuário, de todos os períodos. Liberação depende da conclusão do serviço.
 *         periodo:
 *           type: object
 *           required: [inicio, fim_exclusivo, referencia]
 *           properties:
 *             inicio:
 *               type: string
 *               example: 01/10/2026
 *             fim_exclusivo:
 *               type: string
 *               example: 01/11/2026
 *             referencia:
 *               type: string
 *               example: outubro de 2026
 * /dashboards/solicitante:
 *   get:
 *     summary: Indicadores próprios de solicitações (US20 e US33)
 *     description: Disponível a todos os perfis autenticados. Usa exclusivamente a identidade do JWT.
 *     tags: [Dashboards]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Resumo pessoal do solicitante.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               required: [dados]
 *               properties:
 *                 dados:
 *                   $ref: '#/components/schemas/DashboardSolicitanteDTO'
 *       401:
 *         description: Token ausente, inválido ou expirado.
 *       500:
 *         description: Falha interna ao consultar os indicadores.
 * /dashboards/prestador:
 *   get:
 *     summary: Indicadores próprios do prestador (US21)
 *     description: PRESTADOR ou ADMIN; nunca agrega outros usuários. Mês em America/Sao_Paulo no intervalo início inclusivo e próximo mês exclusivo. Datas em pt-BR.
 *     tags: [Dashboards]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Resumo pessoal do prestador.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               required: [dados]
 *               properties:
 *                 dados:
 *                   $ref: '#/components/schemas/DashboardPrestadorDTO'
 *       401:
 *         description: Token ausente, inválido ou expirado.
 *       403:
 *         description: Perfil sem acesso ao painel do prestador.
 *       500:
 *         description: Falha interna ao consultar os indicadores.
 */
const dashboardRoutes = Router();
dashboardRoutes.use(authMiddleware);
dashboardRoutes.get('/solicitante', (req, res, next) => dashboardController.solicitante(req, res, next));
dashboardRoutes.get('/prestador', (req, res, next) => dashboardController.prestador(req, res, next));
export default dashboardRoutes;
