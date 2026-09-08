/**
 * @file oportunidadeService.ts
 * @description Serviço de regras de negócio do feed de oportunidades do prestador (US08), visualização
 * detalhada (US09) e envio de proposta (US10).
 *
 * BIBLIOTECAS UTILIZADAS:
 * 1. Sequelize ORM (^6.37.3): Consultas relacionais, `GROUP BY` e transações com lock de linha.
 *    Doc Oficial: https://sequelize.org/docs/v6/
 */

import { Op } from 'sequelize';
import sequelize from '../config/database';
import { Solicitacao, Proposta, Usuario, AnexoSolicitacao } from '../models';
import HttpError from '../utils/HttpError';

export interface ListarOportunidadesFiltros {
  busca?: string;
  categoria?: string;
  cidade?: string;
  bairro?: string;
  ordenacao?: string;
}

export interface EnviarPropostaDTO {
  valor: number;
  prazo_dias: number;
  mensagem: string;
}

function limpar(valor: unknown, limite = 100): string {
  return typeof valor === 'string' ? valor.trim().slice(0, limite) : '';
}

export class OportunidadeService {
  /**
   * Lista as solicitações abertas (US08), com filtros de categoria/cidade/bairro/busca e as opções
   * de filtro disponíveis (categorias e locais distintos entre as solicitações abertas).
   */
  async listarOportunidades(filtros: ListarOportunidadesFiltros) {
    const busca = limpar(filtros.busca);
    const categoria = limpar(filtros.categoria);
    const cidade = limpar(filtros.cidade);
    const bairro = limpar(filtros.bairro);
    const ordenacao = filtros.ordenacao === 'antigas' ? 'ASC' : 'DESC';

    const where: Record<string, unknown> = { status: 'ABERTA' };
    if (categoria) where.categoria = categoria;
    if (cidade) where.cidade = cidade;
    if (bairro) where.bairro = bairro;
    if (busca) {
      where[Op.or as any] = [
        { titulo: { [Op.like]: `%${busca}%` } },
        { descricao: { [Op.like]: `%${busca}%` } },
        { categoria: { [Op.like]: `%${busca}%` } },
      ];
    }

    const [oportunidades, categorias, locais] = await Promise.all([
      Solicitacao.findAll({
        where,
        attributes: ['id', 'titulo', 'categoria', 'cidade', 'bairro', 'descricao', 'orcamento_cliente', 'status', 'created_at'],
        order: [['created_at', ordenacao]],
      }),
      Solicitacao.findAll({
        where: { status: 'ABERTA' },
        attributes: ['categoria'],
        group: ['categoria'],
        order: [['categoria', 'ASC']],
        raw: true,
      }),
      Solicitacao.findAll({
        where: { status: 'ABERTA' },
        attributes: ['cidade', 'bairro'],
        group: ['cidade', 'bairro'],
        order: [['cidade', 'ASC'], ['bairro', 'ASC']],
        raw: true,
      }),
    ]);

    return {
      total: oportunidades.length,
      dados: oportunidades.map((o) => o.get({ plain: true })),
      filtrosDisponiveis: {
        categorias: (categorias as any[]).map((c) => c.categoria).filter(Boolean),
        locais: (locais as any[]).filter((l) => l.cidade && l.bairro),
      },
    };
  }

  /**
   * Retorna os detalhes completos de uma solicitação, incluindo o cliente e se o prestador
   * autenticado já enviou proposta (US09). Não restringe por status: o prestador precisa continuar
   * enxergando a solicitação (e a proposta que ele enviou) mesmo depois dela sair de `ABERTA`.
   * `prestadorId` é `null` para visitantes não autenticados (a listagem/detalhe é pública).
   */
  async buscarOportunidade(oportunidadeId: string, prestadorId: string | null) {
    const oportunidade = await Solicitacao.findOne({
      where: { id: oportunidadeId },
      attributes: [
        'id', 'titulo', 'categoria', 'cidade', 'bairro', 'descricao',
        'orcamento_cliente', 'prazo_desejado_dias', 'status', 'created_at',
      ],
      include: [
        { model: Usuario, as: 'solicitante', attributes: ['id', 'nome', 'foto_url'] },
        { model: AnexoSolicitacao, as: 'anexos', attributes: ['id', 'url_arquivo', 'nome_original'] },
      ],
    });

    if (!oportunidade) {
      throw new HttpError(404, 'Solicitação não encontrada.');
    }

    const minhaProposta = prestadorId
      ? await Proposta.findOne({
          where: { solicitacao_id: oportunidadeId, prestador_id: prestadorId },
          attributes: ['id', 'valor', 'prazo_dias', 'mensagem', 'status', 'created_at'],
        })
      : null;

    return {
      ...oportunidade.get({ plain: true }),
      pode_enviar_proposta: !!prestadorId && !minhaProposta && oportunidade.status === 'ABERTA',
      minha_proposta: minhaProposta ? minhaProposta.get({ plain: true }) : null,
    };
  }

  /**
   * Envia a proposta do prestador para uma oportunidade aberta (US10). Bloqueia o envio se a
   * solicitação não estiver mais aberta ou se o prestador já tiver uma proposta ativa para ela,
   * e move a solicitação para `EM_NEGOCIACAO` quando ainda estava `ABERTA`.
   */
  async enviarProposta(oportunidadeId: string, prestadorId: string, dados: EnviarPropostaDTO) {
    const { valor, prazo_dias, mensagem } = dados;

    if (!Number.isFinite(valor) || valor <= 0 || valor > 99999999.99) {
      throw new HttpError(400, 'Informe um valor válido para a proposta.');
    }
    if (!Number.isInteger(prazo_dias) || prazo_dias < 1 || prazo_dias > 3650) {
      throw new HttpError(400, 'Informe um prazo entre 1 e 3650 dias.');
    }
    if (!mensagem || mensagem.trim().length < 10 || mensagem.trim().length > 2000) {
      throw new HttpError(400, 'A mensagem deve ter entre 10 e 2000 caracteres.');
    }

    return sequelize.transaction(async (transaction) => {
      // Lock de linha: evita que duas propostas do mesmo prestador entrem na corrida em requisições simultâneas.
      const oportunidade = await Solicitacao.findOne({
        where: { id: oportunidadeId, status: 'ABERTA' },
        transaction,
        lock: transaction.LOCK.UPDATE,
      });

      if (!oportunidade) {
        throw new HttpError(409, 'A oportunidade não está mais aberta para propostas.');
      }

      const propostaExistente = await Proposta.findOne({
        where: { solicitacao_id: oportunidadeId, prestador_id: prestadorId },
        transaction,
      });

      if (propostaExistente) {
        throw new HttpError(409, 'Você já enviou uma proposta para esta oportunidade.');
      }

      const proposta = await Proposta.create(
        {
          solicitacao_id: oportunidadeId,
          prestador_id: prestadorId,
          valor,
          prazo_dias,
          mensagem: mensagem.trim(),
          status: 'ENVIADA',
        },
        { transaction }
      );

      await oportunidade.update({ status: 'EM_NEGOCIACAO' }, { transaction });

      return { mensagem: 'Proposta enviada ao cliente com sucesso.', dados: proposta.get({ plain: true }) };
    });
  }
}

export default new OportunidadeService();
