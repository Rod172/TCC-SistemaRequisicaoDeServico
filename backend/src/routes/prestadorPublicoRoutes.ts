/**
 * Rotas públicas da US19. Montar em /api/v1/prestadores, sem autenticação.
 * Express (^4.19.2): roteamento HTTP. https://expressjs.com/pt-br/4x/api.html#router
 * Swagger JSDoc (^6.2.8): especificação OpenAPI. https://github.com/Surnet/swagger-jsdoc
 */
import { Router } from 'express';
import prestadorPublicoController from '../controllers/prestadorPublicoController';

const prestadorPublicoRoutes = Router();

/**
 * @openapi
 * /prestadores/{id}/perfil-publico:
 *   get:
 *     summary: Consulta o perfil público de um prestador ativo (US19)
 *     description: Retorna apenas campos públicos. Reputação calculada de todas as avaliações reais; serviços contam solicitações CONCLUIDA com proposta ACEITA do prestador. Não expõe email, CPF, telefone, endereço ou identificador do avaliador.
 *     tags: [Prestadores]
 *     security: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string, format: uuid }
 *       - in: query
 *         name: pagina
 *         description: Página de avaliações, ordenadas da mais recente para a mais antiga.
 *         schema: { type: integer, minimum: 1, maximum: 10000, default: 1 }
 *       - in: query
 *         name: limite
 *         schema: { type: integer, minimum: 1, maximum: 50, default: 10 }
 *     responses:
 *       200:
 *         description: Perfil público e avaliações paginadas. Sem avaliações, média e total são zero.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 data:
 *                   type: object
 *                   properties:
 *                     id: { type: string, format: uuid }
 *                     nome: { type: string }
 *                     foto_url: { type: string, nullable: true }
 *                     descricao_bio: { type: string, nullable: true }
 *                     categorias: { type: array, items: { type: string } }
 *                     nota_media_reputacao: { type: number, minimum: 0, maximum: 5 }
 *                     total_avaliacoes: { type: integer }
 *                     total_servicos_concluidos: { type: integer }
 *                     avaliacoes:
 *                       type: array
 *                       items:
 *                         type: object
 *                         properties:
 *                           id: { type: string, format: uuid }
 *                           nota: { type: integer, minimum: 1, maximum: 5 }
 *                           comentario: { type: string, nullable: true }
 *                           nome_avaliador: { type: string }
 *                           created_at: { type: string, format: date-time }
 *                     paginacao:
 *                       type: object
 *                       properties:
 *                         pagina: { type: integer }
 *                         limite: { type: integer }
 *                         total: { type: integer }
 *                         total_paginas: { type: integer }
 *       400:
 *         description: Identificador ou paginação inválidos.
 *       404:
 *         description: Prestador inexistente, inativo ou usuário de outro perfil.
 *       500:
 *         description: Falha interna ao consultar o perfil.
 */
prestadorPublicoRoutes.get('/:id/perfil-publico', (req, res, next) =>
  prestadorPublicoController.buscarPerfilPublico(req, res, next));

export default prestadorPublicoRoutes;
