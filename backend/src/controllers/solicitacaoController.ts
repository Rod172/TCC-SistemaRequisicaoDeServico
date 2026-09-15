/**
 * @file solicitacaoController.ts
 * @description Controller REST do painel "Minhas Solicitações" (US06), comparação de propostas (US11)
 * e aceite/recusa/renegociação de propostas (US12).
 *
 * BIBLIOTECAS UTILIZADAS:
 * 1. Express.js (^4.19.2): Manipulação de requisições e respostas HTTP.
 *    Doc Oficial: https://expressjs.com/pt-br/
 */

import { Request, Response } from 'express';
import solicitacaoService from '../services/solicitacaoService';
import HttpError from '../utils/HttpError';

function responderErro(res: Response, err: any) {
  if (err instanceof HttpError) {
    return res.status(err.status).json({ error: err.name, message: err.message });
  }
  return res.status(500).json({ error: 'Internal Server Error', message: err.message });
}

function exigirSolicitante(req: Request, res: Response): boolean {
  // ADMIN tem acesso para fins de suporte e teste da plataforma; PRESTADOR também pode publicar
  // solicitações (US33) — quer também contratar serviços (manutenção, reparo etc.), não só prestar.
  // `solicitante_id` é só uma FK genérica pra `usuarios`, sem restrição de papel no banco.
  if (!['SOLICITANTE', 'PRESTADOR', 'ADMIN'].includes(req.user!.tipo_perfil)) {
    res.status(403).json({ error: 'Forbidden', message: 'Você precisa estar logado para publicar uma solicitação.' });
    return false;
  }
  return true;
}

export class SolicitacaoController {
  /**
   * @openapi
   * /solicitacoes:
   *   post:
   *     summary: Publica uma nova solicitação de serviço com status inicial ABERTA (US05)
   *     tags:
   *       - Minhas Solicitações
   *     security:
   *       - bearerAuth: []
   *     requestBody:
   *       required: true
   *       content:
   *         multipart/form-data:
   *           schema:
   *             type: object
   *             required:
   *               - titulo
   *               - descricao
   *             properties:
   *               titulo:
   *                 type: string
   *               descricao:
   *                 type: string
   *               categoria:
   *                 type: string
   *               cidade:
   *                 type: string
   *               bairro:
   *                 type: string
   *               prazo_desejado_dias:
   *                 type: integer
   *               orcamento_cliente:
   *                 type: number
   *               anexos:
   *                 type: array
   *                 items:
   *                   type: string
   *                   format: binary
   *     responses:
   *       201:
   *         description: Solicitação publicada com sucesso.
   *       400:
   *         description: Dados inválidos.
   */
  async criarSolicitacao(req: Request, res: Response): Promise<Response | void> {
    if (!exigirSolicitante(req, res)) return;
    try {
      const solicitanteId = req.user!.id;
      const arquivos = ((req.files as Express.Multer.File[]) || []).map((arquivo) => ({
        filename: arquivo.filename,
        originalname: arquivo.originalname,
      }));

      const solicitacao = await solicitacaoService.criarSolicitacao(
        solicitanteId,
        {
          titulo: req.body.titulo,
          descricao: req.body.descricao,
          categoria: req.body.categoria,
          cidade: req.body.cidade,
          bairro: req.body.bairro,
          prazo_desejado_dias: req.body.prazo_desejado_dias ? Number(req.body.prazo_desejado_dias) : undefined,
          orcamento_cliente: req.body.orcamento_cliente ? Number(req.body.orcamento_cliente) : undefined,
        },
        arquivos
      );

      return res.status(201).json({
        message: 'Solicitação publicada com sucesso!',
        data: solicitacao,
      });
    } catch (err: any) {
      return responderErro(res, err);
    }
  }

  /**
   * @openapi
   * /solicitacoes/minhas:
   *   get:
   *     summary: Lista as solicitações do solicitante autenticado, com contagem de propostas recebidas
   *     tags:
   *       - Minhas Solicitações
   *     security:
   *       - bearerAuth: []
   *     parameters:
   *       - in: query
   *         name: status
   *         schema:
   *           type: string
   *         description: Filtra por status (ABERTA, EM_NEGOCIACAO, CONTRATADA, CONCLUIDA, CANCELADA).
   *       - in: query
   *         name: busca
   *         schema:
   *           type: string
   *         description: Busca por palavra-chave no título da solicitação.
   *     responses:
   *       200:
   *         description: Lista de solicitações retornada com sucesso.
   *       401:
   *         description: Não autorizado.
   */
  async listarMinhas(req: Request, res: Response): Promise<Response> {
    try {
      const solicitanteId = req.user!.id;
      const dados = await solicitacaoService.listarMinhas(solicitanteId, {
        status: req.query.status as string,
        busca: req.query.busca as string,
      });
      return res.status(200).json({ data: dados });
    } catch (err: any) {
      return responderErro(res, err);
    }
  }

  /**
   * @openapi
   * /solicitacoes/minhas/{id}/propostas:
   *   get:
   *     summary: Retorna uma solicitação do solicitante autenticado com as propostas recebidas para comparação
   *     tags:
   *       - Minhas Solicitações
   *     security:
   *       - bearerAuth: []
   *     parameters:
   *       - in: path
   *         name: id
   *         required: true
   *         schema:
   *           type: string
   *     responses:
   *       200:
   *         description: Solicitação e propostas retornadas com sucesso.
   *       404:
   *         description: Solicitação não encontrada.
   */
  async buscarComPropostas(req: Request, res: Response): Promise<Response> {
    try {
      const solicitanteId = req.user!.id;
      const comoAdmin = req.user!.tipo_perfil === 'ADMIN';
      const dados = await solicitacaoService.buscarComPropostas(solicitanteId, req.params.id, comoAdmin);
      return res.status(200).json({ data: dados });
    } catch (err: any) {
      return responderErro(res, err);
    }
  }

  /**
   * @openapi
   * /solicitacoes/minhas/{id}/propostas/{propostaId}/status:
   *   patch:
   *     summary: Aceita ou recusa uma proposta recebida (US12 - a proposta aceita contrata o prestador)
   *     tags:
   *       - Minhas Solicitações
   *     security:
   *       - bearerAuth: []
   *     parameters:
   *       - in: path
   *         name: id
   *         required: true
   *         schema:
   *           type: string
   *       - in: path
   *         name: propostaId
   *         required: true
   *         schema:
   *           type: string
   *     requestBody:
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *             type: object
   *             required:
   *               - acao
   *             properties:
   *               acao:
   *                 type: string
   *                 enum: [ACEITAR, RECUSAR]
   *     responses:
   *       200:
   *         description: Proposta atualizada com sucesso.
   *       404:
   *         description: Solicitação ou proposta não encontrada.
   *       409:
   *         description: Transição de status não permitida.
   */
  async atualizarStatusProposta(req: Request, res: Response): Promise<Response> {
    try {
      const solicitanteId = req.user!.id;
      const acao = String(req.body.acao || '').trim().toUpperCase();

      if (!['ACEITAR', 'RECUSAR'].includes(acao)) {
        return res.status(400).json({ error: 'Bad Request', message: 'A ação deve ser ACEITAR ou RECUSAR.' });
      }

      const resultado = await solicitacaoService.atualizarStatusProposta(
        solicitanteId,
        req.params.id,
        req.params.propostaId,
        acao as 'ACEITAR' | 'RECUSAR'
      );
      return res.status(200).json(resultado);
    } catch (err: any) {
      return responderErro(res, err);
    }
  }

  /**
   * @openapi
   * /solicitacoes/minhas/{id}/propostas/{propostaId}/renegociar:
   *   post:
   *     summary: Envia uma contraproposta de valor para uma proposta recebida
   *     tags:
   *       - Minhas Solicitações
   *     security:
   *       - bearerAuth: []
   *     parameters:
   *       - in: path
   *         name: id
   *         required: true
   *         schema:
   *           type: string
   *       - in: path
   *         name: propostaId
   *         required: true
   *         schema:
   *           type: string
   *     requestBody:
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *             type: object
   *             required:
   *               - valor
   *               - mensagem
   *             properties:
   *               valor:
   *                 type: number
   *               mensagem:
   *                 type: string
   *     responses:
   *       200:
   *         description: Contraproposta registrada com sucesso.
   *       404:
   *         description: Solicitação ou proposta não encontrada.
   *       409:
   *         description: Esta solicitação/proposta não permite renegociação.
   */
  async renegociarProposta(req: Request, res: Response): Promise<Response> {
    try {
      const solicitanteId = req.user!.id;
      const resultado = await solicitacaoService.renegociarProposta(
        solicitanteId,
        req.params.id,
        req.params.propostaId,
        Number(req.body.valor),
        String(req.body.mensagem || '')
      );
      return res.status(200).json(resultado);
    } catch (err: any) {
      return responderErro(res, err);
    }
  }

  /**
   * @openapi
   * /solicitacoes/{id}/cancelar:
   *   patch:
   *     summary: Cancela uma solicitação aberta ou em negociação, notificando os prestadores que já enviaram proposta (US07)
   *     tags:
   *       - Minhas Solicitações
   *     security:
   *       - bearerAuth: []
   *     parameters:
   *       - in: path
   *         name: id
   *         required: true
   *         schema:
   *           type: string
   *     requestBody:
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *             type: object
   *             required:
   *               - motivo
   *             properties:
   *               motivo:
   *                 type: string
   *     responses:
   *       200:
   *         description: Solicitação cancelada com sucesso.
   *       404:
   *         description: Solicitação não encontrada.
   *       409:
   *         description: Esta solicitação não permite mais cancelamento.
   */
  async cancelarSolicitacao(req: Request, res: Response): Promise<Response> {
    try {
      const solicitanteId = req.user!.id;
      const resultado = await solicitacaoService.cancelarSolicitacao(
        solicitanteId,
        req.params.id,
        String(req.body.motivo || '')
      );
      return res.status(200).json(resultado);
    } catch (err: any) {
      return responderErro(res, err);
    }
  }

  /**
   * @openapi
   * /solicitacoes/{id}/cancelar-contratacao:
   *   patch:
   *     summary: O Solicitante desfaz uma contratação já aceita, reabrindo a solicitação (US34)
   *     tags:
   *       - Minhas Solicitações
   *     security:
   *       - bearerAuth: []
   *     parameters:
   *       - in: path
   *         name: id
   *         required: true
   *         schema:
   *           type: string
   *     responses:
   *       200:
   *         description: Contratação cancelada com sucesso.
   *       404:
   *         description: Solicitação não encontrada, não está contratada, ou não tem proposta aceita.
   */
  async cancelarContratacao(req: Request, res: Response): Promise<Response> {
    try {
      const resultado = await solicitacaoService.cancelarContratacao(req.user!.id, req.params.id);
      return res.status(200).json(resultado);
    } catch (err: any) {
      return responderErro(res, err);
    }
  }

  /**
   * @openapi
   * /solicitacoes/{id}/concluir:
   *   patch:
   *     summary: Solicitante ou Prestador contratado marca o serviço como concluído (US17)
   *     tags:
   *       - Minhas Solicitações
   *     security:
   *       - bearerAuth: []
   *     parameters:
   *       - in: path
   *         name: id
   *         required: true
   *         schema:
   *           type: string
   *     responses:
   *       200:
   *         description: Serviço marcado como concluído.
   *       403:
   *         description: Usuário não participa desta contratação.
   *       404:
   *         description: Solicitação não encontrada ou não está contratada.
   */
  async concluir(req: Request, res: Response): Promise<Response> {
    try {
      const resultado = await solicitacaoService.concluir(req.user!.id, req.params.id);
      return res.status(200).json(resultado);
    } catch (err: any) {
      return responderErro(res, err);
    }
  }

  /**
   * @openapi
   * /solicitacoes/{id}/custodia/simular:
   *   post:
   *     summary: Simula o checkout/retenção do valor de uma proposta aceita em custódia (US13)
   *     tags:
   *       - Minhas Solicitações
   *     security:
   *       - bearerAuth: []
   *     parameters:
   *       - in: path
   *         name: id
   *         required: true
   *         schema:
   *           type: string
   *     requestBody:
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *             type: object
   *             required:
   *               - metodo_pagamento
   *             properties:
   *               metodo_pagamento:
   *                 type: string
   *                 enum: [CARTAO_TESTE, PIX_TESTE]
   *     responses:
   *       200:
   *         description: Pagamento simulado com sucesso (ou já existente).
   *       409:
   *         description: A solicitação não está em condição de receber o pagamento simulado.
   */
  async simularPagamentoCustodia(req: Request, res: Response): Promise<Response> {
    try {
      const solicitanteId = req.user!.id;
      const resultado = await solicitacaoService.simularPagamentoCustodia(
        solicitanteId,
        req.params.id,
        String(req.body.metodo_pagamento || '') as 'CARTAO_TESTE' | 'PIX_TESTE'
      );
      return res.status(200).json(resultado);
    } catch (err: any) {
      return responderErro(res, err);
    }
  }
}

export default new SolicitacaoController();
