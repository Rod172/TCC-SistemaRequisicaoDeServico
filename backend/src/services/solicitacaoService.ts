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
import { Solicitacao, Proposta, Usuario, PrestadorPerfil, AnexoSolicitacao } from '../models';
import { STATUS_SOLICITACAO } from '../models/Solicitacao';
import HttpError from '../utils/HttpError';

export interface ListarMinhasFiltros {
  status?: string;
  busca?: string;
}

export interface CriarSolicitacaoDTO {
  titulo: string;
  descricao: string;
  categoria?: string;
  cidade?: string;
  bairro?: string;
  prazo_desejado_dias?: number;
  orcamento_cliente?: number;
}

export interface ArquivoAnexo {
  filename: string;
  originalname: string;
}

export class SolicitacaoService {
  /**
   * Publica uma nova solicitação de serviço com status inicial `ABERTA` e, opcionalmente, até 5
   * anexos (fotos/documentos) já enviados pelo `uploadAnexosMiddleware` (US05).
   */
  async criarSolicitacao(solicitanteId: string, dados: CriarSolicitacaoDTO, arquivos: ArquivoAnexo[]) {
    const titulo = (dados.titulo || '').trim();
    const descricao = (dados.descricao || '').trim();

    if (titulo.length < 5) {
      throw new HttpError(400, 'O título deve ter pelo menos 5 caracteres.');
    }
    if (descricao.length < 20) {
      throw new HttpError(400, 'Descreva o problema/necessidade com pelo menos 20 caracteres.');
    }

    return sequelize.transaction(async (transaction) => {
      const solicitacao = await Solicitacao.create(
        {
          solicitante_id: solicitanteId,
          titulo,
          descricao,
          categoria: dados.categoria?.trim() || null,
          cidade: dados.cidade?.trim() || null,
          bairro: dados.bairro?.trim() || null,
          prazo_desejado_dias: dados.prazo_desejado_dias || null,
          orcamento_cliente: dados.orcamento_cliente || null,
          status: 'ABERTA',
        },
        { transaction }
      );

      if (arquivos.length > 0) {
        await AnexoSolicitacao.bulkCreate(
          arquivos.map((arquivo) => ({
            solicitacao_id: solicitacao.id,
            url_arquivo: `/uploads/solicitacoes/${arquivo.filename}`,
            nome_original: arquivo.originalname,
          })),
          { transaction }
        );
      }

      return solicitacao.get({ plain: true });
    });
  }

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
      attributes: [
        'id', 'titulo', 'descricao', 'categoria', 'cidade', 'bairro',
        'orcamento_cliente', 'prazo_desejado_dias', 'status', 'created_at', 'updated_at',
      ],
      include: [
        { model: AnexoSolicitacao, as: 'anexos', attributes: ['id', 'url_arquivo', 'nome_original'] },
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
