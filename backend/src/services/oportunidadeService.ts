/**
 * @file oportunidadeService.ts
 * @description Serviço de regras de negócio do feed de oportunidades do prestador (US08), visualização
 * detalhada (US09) e envio de proposta (US10) — que também notifica o solicitante (US16).
 *
 * BIBLIOTECAS UTILIZADAS:
 * 1. Sequelize ORM (^6.37.3): Consultas relacionais, `GROUP BY` e transações com lock de linha.
 *    Doc Oficial: https://sequelize.org/docs/v6/
 */

import { Op } from 'sequelize';
import sequelize from '../config/database';
import { Solicitacao, Proposta, Usuario, AnexoSolicitacao, Notificacao, PerguntaSolicitacao, TransacaoCustodia } from '../models';
import HttpError from '../utils/HttpError';
import { emitirParaUsuario } from '../sockets/chatSocket';
import preferenciaNotificacaoService from './preferenciaNotificacaoService';

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
  validade_dias?: number;
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

    const where: Record<string, unknown> = { status: { [Op.in]: ['ABERTA', 'EM_NEGOCIACAO'] } };
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
        where: { status: { [Op.in]: ['ABERTA', 'EM_NEGOCIACAO'] } },
        attributes: ['categoria'],
        group: ['categoria'],
        order: [['categoria', 'ASC']],
        raw: true,
      }),
      Solicitacao.findAll({
        where: { status: { [Op.in]: ['ABERTA', 'EM_NEGOCIACAO'] } },
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
        'orcamento_cliente', 'prazo_desejado_dias', 'status', 'motivo_cancelamento', 'created_at',
      ],
      include: [
        { model: Usuario, as: 'solicitante', attributes: ['id', 'nome', 'foto_url'] },
        { model: AnexoSolicitacao, as: 'anexos', attributes: ['id', 'url_arquivo', 'nome_original'] },
        {
          model: PerguntaSolicitacao,
          as: 'perguntas',
          include: [{ model: Usuario, as: 'prestador', attributes: ['id', 'nome', 'foto_url'] }],
          separate: true,
          order: [['created_at', 'ASC']],
        },
      ],
    });

    if (!oportunidade) {
      throw new HttpError(404, 'Solicitação não encontrada.');
    }

    const minhaProposta = prestadorId
      ? await Proposta.findOne({
          where: { solicitacao_id: oportunidadeId, prestador_id: prestadorId },
          attributes: ['id', 'valor', 'prazo_dias', 'mensagem', 'status', 'validade_ate', 'created_at',
            'valor_contraproposta', 'mensagem_contraproposta', 'contraproposta_status', 'contraproposta_respondida_em'],
        })
      : null;

    // Só o prestador contratado vê a situação do pagamento da própria contratação (US13/US17).
    const custodia = minhaProposta?.status === 'ACEITA'
      ? await TransacaoCustodia.findOne({ where: { proposta_id: minhaProposta.id }, attributes: ['status_pagamento'] })
      : null;

    return {
      ...oportunidade.get({ plain: true }),
      // Precisa bater com o filtro de `enviarProposta` (ABERTA/EM_NEGOCIACAO) — senão a tela nega uma
      // ação que o backend aceitaria de verdade.
      pode_enviar_proposta: !!prestadorId && prestadorId !== oportunidade.solicitante_id && !minhaProposta && ['ABERTA', 'EM_NEGOCIACAO'].includes(oportunidade.status),
      minha_proposta: minhaProposta ? minhaProposta.get({ plain: true }) : null,
      pagamento_contratacao: custodia ? custodia.status_pagamento : null,
    };
  }

  /**
   * Envia a proposta do prestador para uma oportunidade aberta OU em negociação (US10). Aceita
   * propostas em `ABERTA` e `EM_NEGOCIACAO` — permite que vários prestadores comparem e disputem a
   * mesma solicitação (necessário pra US11, Comparação de Propostas, fazer sentido); só bloqueia
   * quando ela já foi `CONTRATADA`, `CONCLUIDA` ou `CANCELADA`. Bloqueia também se o prestador já
   * tiver uma proposta ativa para ela, e move a solicitação para `EM_NEGOCIACAO` quando ainda estava
   * `ABERTA` (idempotente se já estiver `EM_NEGOCIACAO`).
   */
  async enviarProposta(oportunidadeId: string, prestadorId: string, dados: EnviarPropostaDTO) {
    const { valor, prazo_dias, mensagem, validade_dias = 7 } = dados;

    if (!Number.isInteger(validade_dias) || validade_dias < 1 || validade_dias > 365) {
      throw new HttpError(400, 'Informe uma validade comercial entre 1 e 365 dias.');
    }

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
        where: { id: oportunidadeId, status: { [Op.in]: ['ABERTA', 'EM_NEGOCIACAO'] } },
        transaction,
        lock: transaction.LOCK.UPDATE,
      });

      if (!oportunidade) {
        throw new HttpError(409, 'A oportunidade não aceita mais propostas (já foi contratada, concluída ou cancelada).');
      }

      if (oportunidade.solicitante_id === prestadorId) {
        throw new HttpError(403, 'Você não pode propor um serviço para a própria solicitação.');
      }

      const propostaExistente = await Proposta.findOne({
        where: { solicitacao_id: oportunidadeId, prestador_id: prestadorId },
        transaction,
        lock: transaction.LOCK.UPDATE,
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
          validade_ate: new Date(Date.now() + validade_dias * 24 * 60 * 60 * 1000),
          mensagem: mensagem.trim(),
          status: 'ENVIADA',
        },
        { transaction }
      );

      await oportunidade.update({ status: 'EM_NEGOCIACAO' }, { transaction });

      const prestador = await Usuario.findByPk(prestadorId, { attributes: ['nome'], transaction });
      if (await preferenciaNotificacaoService.estaAtivado(oportunidade.solicitante_id, 'NOVA_PROPOSTA')) {
        const notificacao = await Notificacao.create(
          {
            usuario_id: oportunidade.solicitante_id,
            titulo: 'Nova proposta recebida',
            mensagem: `${prestador?.nome || 'Um prestador'} enviou uma proposta para "${oportunidade.titulo}".`,
            link_redirecionamento: `/minhas-solicitacoes/${oportunidadeId}`,
          },
          { transaction }
        );
        transaction.afterCommit(() => { emitirParaUsuario(oportunidade.solicitante_id, 'nova-notificacao', notificacao.get({ plain: true })); });
      }

      return { mensagem: 'Proposta enviada ao cliente com sucesso.', dados: proposta.get({ plain: true }) };
    });
  }

  /** US35: o prestador decide sobre o valor negociado sem contratar automaticamente. */
  async responderContraproposta(solicitacaoId: string, propostaId: string, prestadorId: string, acao: string) {
    if (!['ACEITAR', 'RECUSAR'].includes(acao)) throw new HttpError(400, 'Informe ACEITAR ou RECUSAR.');
    return sequelize.transaction(async transaction => {
      const solicitacao = await Solicitacao.findByPk(solicitacaoId, { transaction, lock: transaction.LOCK.UPDATE });
      if (!solicitacao) throw new HttpError(404, 'Solicitação não encontrada.');
      const proposta = await Proposta.findOne({ where: { id: propostaId, solicitacao_id: solicitacaoId }, transaction, lock: transaction.LOCK.UPDATE });
      if (!proposta) throw new HttpError(404, 'Proposta não encontrada.');
      if (proposta.prestador_id !== prestadorId) throw new HttpError(403, 'Você não é o prestador desta proposta.');
      if (!['ABERTA', 'EM_NEGOCIACAO'].includes(solicitacao.status) || proposta.status !== 'EM_ANALISE'
          || proposta.contraproposta_status !== 'PENDENTE' || proposta.valor_contraproposta == null
          || !(new Date(proposta.validade_ate).getTime() > Date.now())) {
        throw new HttpError(409, 'Esta contraproposta não está pendente ou sua validade expirou.');
      }
      await proposta.update({
        ...(acao === 'ACEITAR' ? { valor: proposta.valor_contraproposta } : {}),
        status: 'ENVIADA', contraproposta_status: acao === 'ACEITAR' ? 'ACEITA' : 'RECUSADA',
        contraproposta_respondida_em: new Date(),
      }, { transaction });
      if (await preferenciaNotificacaoService.estaAtivado(solicitacao.solicitante_id, 'PROPOSTA_ACEITA_RECUSADA')) {
        const notificacao = await Notificacao.create({ usuario_id: solicitacao.solicitante_id,
          titulo: acao === 'ACEITAR' ? 'Contraproposta aceita' : 'Contraproposta recusada',
          mensagem: `O prestador respondeu à negociação de "${solicitacao.titulo}". Confira o orçamento antes de contratar.`,
          link_redirecionamento: `/minhas-solicitacoes/${solicitacaoId}`,
        }, { transaction });
        transaction.afterCommit(() => { emitirParaUsuario(solicitacao.solicitante_id, 'nova-notificacao', notificacao.get({ plain: true })); });
      }
      return { mensagem: acao === 'ACEITAR' ? 'Contraproposta aceita. Aguarde a confirmação do cliente.' : 'Contraproposta recusada. O valor anterior foi mantido.' };
    });
  }

  /**
   * Lista todas as propostas enviadas pelo prestador autenticado, com o título/status da solicitação
   * correspondente (US28), mais recentes primeiro.
   */
  async listarMinhasPropostas(prestadorId: string, statusFiltro?: string) {
    const status = (statusFiltro || '').trim().toUpperCase();
    const where: Record<string, unknown> = { prestador_id: prestadorId };
    if (status) {
      if (!['ENVIADA', 'EM_ANALISE', 'ACEITA', 'RECUSADA'].includes(status)) {
        throw new HttpError(400, 'Status inválido. Valores aceitos: ENVIADA, EM_ANALISE, ACEITA, RECUSADA.');
      }
      where.status = status;
    }

    const propostas = await Proposta.findAll({
      where,
      attributes: ['id', 'valor', 'prazo_dias', 'status', 'validade_ate', 'created_at'],
      include: [{ model: Solicitacao, as: 'solicitacao', attributes: ['id', 'titulo', 'status'] }],
      order: [['created_at', 'DESC']],
    });

    return propostas.map((p) => p.get({ plain: true }));
  }

  /**
   * O prestador contratado desiste de uma solicitação já `CONTRATADA` (US31) — a proposta dele vira
   * `RECUSADA` (não pode reenviar, a regra de "1 proposta ativa por prestador" da US10 já cobre isso)
   * e a solicitação volta para `EM_NEGOCIACAO`, reabrindo para novas propostas de outros prestadores.
   */
  async desistirContratacao(solicitacaoId: string, prestadorId: string, motivo: string) {
    const motivoTratado = (motivo || '').trim();
    if (motivoTratado.length < 5) {
      throw new HttpError(400, 'Informe um motivo com pelo menos 5 caracteres.');
    }

    return sequelize.transaction(async (transaction) => {
      const solicitacao = await Solicitacao.findOne({
        where: { id: solicitacaoId, status: 'CONTRATADA' },
        transaction,
        lock: transaction.LOCK.UPDATE,
      });
      if (!solicitacao) {
        throw new HttpError(409, 'Esta solicitação não está contratada no momento (ou já mudou de status).');
      }

      const proposta = await Proposta.findOne({
        where: { solicitacao_id: solicitacaoId, prestador_id: prestadorId, status: 'ACEITA' },
        transaction,
        lock: transaction.LOCK.UPDATE,
      });
      if (!proposta) {
        throw new HttpError(403, 'Você não é o prestador contratado desta solicitação.');
      }

      const custodia = await TransacaoCustodia.findOne({
        where: { solicitacao_id: solicitacaoId },
        transaction, lock: transaction.LOCK.UPDATE,
      });
      if (custodia && custodia.status_pagamento !== 'REEMBOLSADO') {
        if (custodia.proposta_id !== proposta.id || custodia.status_pagamento !== 'RETIDO') {
          throw new HttpError(409, 'A custódia não permite desfazer esta contratação.');
        }
        await custodia.update({ status_pagamento: 'REEMBOLSADO', liberado_em: null }, { transaction });
      }

      await proposta.update({ status: 'RECUSADA' }, { transaction });
      await solicitacao.update({ status: 'EM_NEGOCIACAO' }, { transaction });

      if (await preferenciaNotificacaoService.estaAtivado(solicitacao.solicitante_id, 'PROPOSTA_ACEITA_RECUSADA')) {
        const notificacao = await Notificacao.create(
          {
            usuario_id: solicitacao.solicitante_id,
            titulo: 'Prestador desistiu da contratação',
            mensagem: `O prestador contratado para "${solicitacao.titulo}" desistiu. Motivo: ${motivoTratado}. A solicitação está aberta a novas propostas novamente.`,
            link_redirecionamento: `/minhas-solicitacoes/${solicitacaoId}`,
          },
          { transaction }
        );
        transaction.afterCommit(() => { emitirParaUsuario(solicitacao.solicitante_id, 'nova-notificacao', notificacao.get({ plain: true })); });
      }

      return { mensagem: 'Desistência registrada. O cliente foi notificado e a solicitação está aberta a novas propostas.' };
    });
  }
}

export default new OportunidadeService();
