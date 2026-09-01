/**
 * @file solicitacaoService.ts
 * @description Serviço de regras de negócio do painel "Minhas Solicitações" (US06), comparação de
 * propostas (US11), aceite/recusa de proposta com contratação (US12) e renegociação de valor.
 *
 * BIBLIOTECAS UTILIZADAS:
 * 1. Sequelize ORM (^6.37.3): Consultas relacionais (`include`, `GROUP BY`) e transações atômicas.
 *    Doc Oficial: https://sequelize.org/docs/v6/
 */

import { Op, col, fn } from 'sequelize';
import sequelize from '../config/database';
import { Solicitacao, Proposta, Usuario, PrestadorPerfil } from '../models';
import { STATUS_SOLICITACAO } from '../models/Solicitacao';
import HttpError from '../utils/HttpError';

export interface ListarMinhasFiltros {
  status?: string;
  busca?: string;
}

export class SolicitacaoService {
  /**
   * Lista as solicitações do solicitante autenticado, com contagem de propostas recebidas (US06).
   */
  async listarMinhas(solicitanteId: string, filtros: ListarMinhasFiltros) {
    const status = (filtros.status || '').trim().toUpperCase();
    const busca = (filtros.busca || '').trim();

    if (status && !STATUS_SOLICITACAO.includes(status as any)) {
      throw new HttpError(400, `Status inválido. Valores aceitos: ${STATUS_SOLICITACAO.join(', ')}.`);
    }

    const where: Record<string, unknown> = { solicitante_id: solicitanteId };
    if (status) where.status = status;
    if (busca) where.titulo = { [Op.like]: `%${busca}%` };

    const solicitacoes = await Solicitacao.findAll({
      attributes: [
        'id',
        'titulo',
        'descricao',
        'status',
        'created_at',
        'updated_at',
        [fn('COUNT', col('propostas.id')), 'propostas_recebidas'],
      ],
      where,
      include: [{ model: Proposta, as: 'propostas', attributes: [], required: false }],
      group: ['Solicitacao.id'],
      order: [['created_at', 'DESC']],
      subQuery: false,
    });

    return solicitacoes.map((solicitacao) => {
      const item = solicitacao.get({ plain: true }) as any;
      return { ...item, propostas_recebidas: Number(item.propostas_recebidas) };
    });
  }

  /**
   * Retorna uma solicitação do solicitante autenticado com todas as propostas recebidas,
   * incluindo nome, foto e reputação do prestador para comparação (US11).
   */
  async buscarComPropostas(solicitanteId: string, solicitacaoId: string) {
    const solicitacao = await Solicitacao.findOne({
      where: { id: solicitacaoId, solicitante_id: solicitanteId },
      attributes: ['id', 'titulo', 'descricao', 'status', 'created_at', 'updated_at'],
      include: [
        {
          model: Proposta,
          as: 'propostas',
          include: [
            {
              model: Usuario,
              as: 'prestador',
              attributes: ['id', 'nome', 'foto_url'],
              include: [
                {
                  model: PrestadorPerfil,
                  as: 'perfil_prestador',
                  attributes: ['nota_media_reputacao', 'total_avaliacoes'],
                  required: false,
                },
              ],
            },
          ],
        },
      ],
      order: [[{ model: Proposta, as: 'propostas' }, 'created_at', 'DESC']],
    });

    if (!solicitacao) {
      throw new HttpError(404, 'Solicitação não encontrada.');
    }

    return solicitacao.get({ plain: true });
  }

  /**
   * Aceita ou recusa uma proposta (US12). Ao aceitar, rejeita as demais propostas concorrentes
   * e move a solicitação para `CONTRATADA` dentro de uma única transação Sequelize.
   */
  async atualizarStatusProposta(
    solicitanteId: string,
    solicitacaoId: string,
    propostaId: string,
    acao: 'ACEITAR' | 'RECUSAR'
  ) {
    const solicitacao = await Solicitacao.findOne({
      where: { id: solicitacaoId, solicitante_id: solicitanteId },
    });
    if (!solicitacao) throw new HttpError(404, 'Solicitação não encontrada.');

    if (['CONCLUIDA', 'CANCELADA'].includes(solicitacao.status)) {
      throw new HttpError(409, 'Esta solicitação não permite mais alterações.');
    }

    const proposta = await Proposta.findOne({ where: { id: propostaId, solicitacao_id: solicitacaoId } });
    if (!proposta) throw new HttpError(404, 'Proposta não encontrada.');

    if (acao === 'RECUSAR' && proposta.status === 'ACEITA') {
      throw new HttpError(409, 'Uma proposta aceita não pode ser recusada.');
    }

    await sequelize.transaction(async (transaction) => {
      if (acao === 'ACEITAR') {
        await proposta.update({ status: 'ACEITA' }, { transaction });
        await Proposta.update(
          { status: 'RECUSADA' },
          {
            where: {
              solicitacao_id: solicitacaoId,
              id: { [Op.ne]: proposta.id },
              status: { [Op.ne]: 'ACEITA' },
            },
            transaction,
          }
        );
        await solicitacao.update({ status: 'CONTRATADA' }, { transaction });
      } else {
        await proposta.update({ status: 'RECUSADA' }, { transaction });
      }
    });

    return {
      mensagem: acao === 'ACEITAR' ? 'Proposta aceita com sucesso.' : 'Proposta recusada com sucesso.',
    };
  }

  /**
   * Registra uma contraproposta de valor enviada pelo solicitante e move a negociação para análise.
   */
  async renegociarProposta(
    solicitanteId: string,
    solicitacaoId: string,
    propostaId: string,
    valor: number,
    mensagem: string
  ) {
    if (!Number.isFinite(valor) || valor <= 0) {
      throw new HttpError(400, 'Informe um valor de contraproposta válido.');
    }
    if (!mensagem || mensagem.trim().length < 5) {
      throw new HttpError(400, 'Informe uma mensagem com pelo menos 5 caracteres.');
    }

    const solicitacao = await Solicitacao.findOne({
      where: { id: solicitacaoId, solicitante_id: solicitanteId },
    });
    if (!solicitacao) throw new HttpError(404, 'Solicitação não encontrada.');

    if (['CONTRATADA', 'CONCLUIDA', 'CANCELADA'].includes(solicitacao.status)) {
      throw new HttpError(409, 'Esta solicitação não permite renegociação.');
    }

    const proposta = await Proposta.findOne({ where: { id: propostaId, solicitacao_id: solicitacaoId } });
    if (!proposta) throw new HttpError(404, 'Proposta não encontrada.');

    if (['ACEITA', 'RECUSADA'].includes(proposta.status)) {
      throw new HttpError(409, 'Esta proposta não permite renegociação.');
    }

    await sequelize.transaction(async (transaction) => {
      await proposta.update(
        {
          valor_contraproposta: valor,
          mensagem_contraproposta: mensagem.trim(),
          contraproposta_em: new Date(),
          status: 'EM_ANALISE',
        },
        { transaction }
      );
      await solicitacao.update({ status: 'EM_NEGOCIACAO' }, { transaction });
    });

    return { mensagem: 'Contraproposta enviada. A proposta está em análise.' };
  }
}

export default new SolicitacaoService();
