/**
 * @file solicitacaoService.ts
 * @description Serviço de regras de negócio do painel "Minhas Solicitações" (US06), comparação de
 * propostas (US11), aceite/recusa de proposta com contratação (US12), renegociação de valor,
 * cancelamento de solicitação (US07) e simulação de pagamento/custódia (US13).
 *
 * BIBLIOTECAS UTILIZADAS:
 * 1. Sequelize ORM (^6.37.3): Consultas relacionais (`include`, `GROUP BY`) e transações atômicas.
 *    Doc Oficial: https://sequelize.org/docs/v6/
 */

import { Op, col, fn } from 'sequelize';
import sequelize from '../config/database';
import {
  Solicitacao,
  Proposta,
  Usuario,
  PrestadorPerfil,
  AnexoSolicitacao,
  Notificacao,
  TransacaoCustodia,
  PerguntaSolicitacao,
} from '../models';
import { STATUS_SOLICITACAO } from '../models/Solicitacao';
import HttpError from '../utils/HttpError';
import { emitirParaUsuario } from '../sockets/chatSocket';
import preferenciaNotificacaoService from './preferenciaNotificacaoService';

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
    if (typeof dados.titulo !== 'string' || typeof dados.descricao !== 'string') {
      throw new HttpError(400, 'O título e a descrição devem ser textos.');
    }
    const titulo = dados.titulo.trim();
    const descricao = dados.descricao.trim();

    if (titulo.length < 5 || titulo.length > 180) {
      throw new HttpError(400, 'O título deve ter entre 5 e 180 caracteres.');
    }
    if (descricao.length < 20) {
      throw new HttpError(400, 'Descreva o problema/necessidade com pelo menos 20 caracteres.');
    }

    if (dados.orcamento_cliente !== undefined &&
        (!Number.isFinite(dados.orcamento_cliente) || dados.orcamento_cliente < 0 || dados.orcamento_cliente > 99999999.99)) {
      throw new HttpError(400, 'Informe um orçamento entre 0 e 99.999.999,99.');
    }
    if (dados.prazo_desejado_dias !== undefined &&
        (!Number.isInteger(dados.prazo_desejado_dias) || dados.prazo_desejado_dias < 1 || dados.prazo_desejado_dias > 365)) {
      throw new HttpError(400, 'Informe um prazo desejado entre 1 e 365 dias inteiros.');
    }
    for (const campo of ['categoria', 'cidade', 'bairro'] as const) {
      if (dados[campo] !== undefined && dados[campo] !== null && typeof dados[campo] !== 'string') {
        throw new HttpError(400, `O campo ${campo} deve ser um texto.`);
      }
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
          prazo_desejado_dias: dados.prazo_desejado_dias ?? null,
          orcamento_cliente: dados.orcamento_cliente ?? null,
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
   * Retorna uma solicitação com todas as propostas recebidas, incluindo nome, foto e reputação do
   * prestador para comparação (US11). O `ADMIN` pode consultar qualquer solicitação, independente do
   * dono, para fins de suporte e moderação (US27) — nesse caso as ações (aceitar/recusar/renegociar/
   * cancelar/simular pagamento) continuam bloqueadas para quem não é o solicitante dono.
   */
  async buscarComPropostas(solicitanteId: string, solicitacaoId: string, comoAdmin = false) {
    const where = comoAdmin ? { id: solicitacaoId } : { id: solicitacaoId, solicitante_id: solicitanteId };

    const solicitacao = await Solicitacao.findOne({
      where,
      attributes: [
        'id', 'titulo', 'descricao', 'categoria', 'cidade', 'bairro',
        'orcamento_cliente', 'prazo_desejado_dias', 'status',
        'motivo_cancelamento', 'cancelada_em', 'created_at', 'updated_at',
      ],
      include: [
        { model: AnexoSolicitacao, as: 'anexos', attributes: ['id', 'url_arquivo', 'nome_original'] },
        {
          model: PerguntaSolicitacao,
          as: 'perguntas',
          include: [{ model: Usuario, as: 'prestador', attributes: ['id', 'nome', 'foto_url'] }],
          separate: true,
          order: [['created_at', 'ASC']],
        },
        {
          model: TransacaoCustodia,
          as: 'transacao_custodia',
          attributes: ['id', 'valor', 'status_pagamento', 'metodo_pagamento', 'referencia_simulada', 'retido_em'],
          required: false,
        },
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
                  attributes: ['nota_media_reputacao', 'total_avaliacoes', 'descricao_bio', 'categorias'],
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
   * e move a solicitação para `CONTRATADA` dentro de uma única transação Sequelize. Notifica o(s)
   * prestador(es) afetado(s) — aceita ou recusada, incluindo as recusas automáticas das concorrentes
   * (US16).
   */
  async atualizarStatusProposta(
    solicitanteId: string,
    solicitacaoId: string,
    propostaId: string,
    acao: 'ACEITAR' | 'RECUSAR'
  ) {
    await sequelize.transaction(async (transaction) => {
      // Toda transição trava primeiro a solicitação e depois seus registros dependentes.
      const solicitacao = await Solicitacao.findOne({
        where: { id: solicitacaoId, solicitante_id: solicitanteId },
        transaction, lock: transaction.LOCK.UPDATE,
      });
      if (!solicitacao) throw new HttpError(404, 'Solicitação não encontrada.');
      if (!['ABERTA', 'EM_NEGOCIACAO'].includes(solicitacao.status)) {
        throw new HttpError(409, 'Esta solicitação não permite mais alterações de propostas.');
      }
      const proposta = await Proposta.findOne({
        where: { id: propostaId, solicitacao_id: solicitacaoId },
        transaction, lock: transaction.LOCK.UPDATE,
      });
      if (!proposta) throw new HttpError(404, 'Proposta não encontrada.');
      if (acao === 'ACEITAR' && !(new Date(proposta.validade_ate).getTime() > Date.now())) {
        throw new HttpError(409, 'A validade comercial desta proposta expirou. Não é possível aceitá-la.');
      }
      if (!['ENVIADA', 'EM_ANALISE'].includes(proposta.status)) {
        throw new HttpError(409, 'Somente propostas enviadas ou em análise podem ser aceitas ou recusadas.');
      }
      if (proposta.prestador_id === solicitacao.solicitante_id) {
        throw new HttpError(409, 'O solicitante não pode contratar a própria proposta.');
      }
      const contratada = await Proposta.findOne({
        where: { solicitacao_id: solicitacaoId, status: 'ACEITA' },
        transaction, lock: transaction.LOCK.UPDATE,
      });
      if (contratada) throw new HttpError(409, 'Esta solicitação já possui uma proposta aceita.');

      if (acao === 'ACEITAR') {
        // Busca as concorrentes ANTES do update em massa, pra saber quem notificar da recusa.
        const concorrentes = await Proposta.findAll({
          where: { solicitacao_id: solicitacaoId, id: { [Op.ne]: proposta.id }, status: { [Op.in]: ['ENVIADA', 'EM_ANALISE'] } },
          attributes: ['prestador_id'],
          transaction,
        });

        await proposta.update({ status: 'ACEITA' }, { transaction });
        await Proposta.update(
          { status: 'RECUSADA' },
          {
            where: {
              solicitacao_id: solicitacaoId,
              id: { [Op.ne]: proposta.id },
              status: { [Op.in]: ['ENVIADA', 'EM_ANALISE'] },
            },
            transaction,
          }
        );
        await solicitacao.update({ status: 'CONTRATADA' }, { transaction });

        if (await preferenciaNotificacaoService.estaAtivado(proposta.prestador_id, 'PROPOSTA_ACEITA_RECUSADA')) {
          const notifAceita = await Notificacao.create(
            {
              usuario_id: proposta.prestador_id,
              titulo: 'Proposta aceita!',
              mensagem: `Sua proposta para "${solicitacao.titulo}" foi aceita pelo cliente.`,
              link_redirecionamento: `/oportunidades/${solicitacaoId}`,
            },
            { transaction }
          );
          transaction.afterCommit(() => { emitirParaUsuario(proposta.prestador_id, 'nova-notificacao', notifAceita.get({ plain: true })); });
        }

        if (concorrentes.length > 0) {
          const concorrentesAtivos = await preferenciaNotificacaoService.filtrarAtivos(
            concorrentes.map((c) => c.prestador_id),
            'PROPOSTA_ACEITA_RECUSADA'
          );
          if (concorrentesAtivos.length > 0) {
            await Notificacao.bulkCreate(
              concorrentesAtivos.map((prestadorId) => ({
                usuario_id: prestadorId,
                titulo: 'Proposta recusada',
                mensagem: `Sua proposta para "${solicitacao.titulo}" foi recusada — o cliente escolheu outro prestador.`,
                link_redirecionamento: `/oportunidades/${solicitacaoId}`,
              })),
              { transaction }
            );
            transaction.afterCommit(() => { concorrentesAtivos.forEach((prestadorId) => emitirParaUsuario(prestadorId, 'nova-notificacao', {})); });
          }
        }
      } else {
        await proposta.update({ status: 'RECUSADA' }, { transaction });
        if (await preferenciaNotificacaoService.estaAtivado(proposta.prestador_id, 'PROPOSTA_ACEITA_RECUSADA')) {
          const notifRecusada = await Notificacao.create(
            {
              usuario_id: proposta.prestador_id,
              titulo: 'Proposta recusada',
              mensagem: `Sua proposta para "${solicitacao.titulo}" foi recusada.`,
              link_redirecionamento: `/oportunidades/${solicitacaoId}`,
            },
            { transaction }
          );
          transaction.afterCommit(() => { emitirParaUsuario(proposta.prestador_id, 'nova-notificacao', notifRecusada.get({ plain: true })); });
        }
      }
    });

    return {
      mensagem: acao === 'ACEITAR' ? 'Proposta aceita com sucesso.' : 'Proposta recusada com sucesso.',
    };
  }

  /**
   * O Solicitante desfaz uma contratação já aceita, enquanto o serviço ainda não foi concluído (US34)
   * — simétrico à desistência do prestador (US31), mas do outro lado: a proposta ACEITA volta pra
   * `RECUSADA` (não pode reenviar) e a solicitação volta pra `EM_NEGOCIACAO`, reabrindo para novas
   * propostas de outros prestadores. Existe porque, antes desta história, aceitar era irreversível e já
   * recusava automaticamente as demais propostas concorrentes, sem chance de o solicitante voltar atrás.
   */
  async cancelarContratacao(solicitanteId: string, solicitacaoId: string) {
    return sequelize.transaction(async (transaction) => {
      const solicitacao = await Solicitacao.findOne({
        where: { id: solicitacaoId, solicitante_id: solicitanteId, status: 'CONTRATADA' },
        transaction,
        lock: transaction.LOCK.UPDATE,
      });
      if (!solicitacao) {
        throw new HttpError(404, 'Solicitação não encontrada ou não está mais contratada.');
      }

      const proposta = await Proposta.findOne({
        where: { solicitacao_id: solicitacaoId, status: 'ACEITA' },
        transaction,
        lock: transaction.LOCK.UPDATE,
      });
      if (!proposta) {
        throw new HttpError(404, 'Nenhuma proposta aceita encontrada para esta solicitação.');
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

      if (await preferenciaNotificacaoService.estaAtivado(proposta.prestador_id, 'PROPOSTA_ACEITA_RECUSADA')) {
        const notificacao = await Notificacao.create(
          {
            usuario_id: proposta.prestador_id,
            titulo: 'Contratação cancelada',
            mensagem: `O cliente cancelou a contratação de "${solicitacao.titulo}". A solicitação voltou a aceitar propostas.`,
            link_redirecionamento: `/minhas-propostas`,
          },
          { transaction }
        );
        transaction.afterCommit(() => { emitirParaUsuario(proposta.prestador_id, 'nova-notificacao', notificacao.get({ plain: true })); });
      }

      return { mensagem: 'Contratação cancelada. A solicitação voltou a aceitar propostas.' };
    });
  }

  /**
   * Marca uma solicitação `CONTRATADA` como `CONCLUIDA` (US17) — tanto o Solicitante quanto o
   * Prestador contratado podem confirmar. Libera o valor retido em custódia (US13), se houver, e
   * abre caminho pro Solicitante avaliar o serviço (US18). Notifica o outro lado da confirmação.
   */
  async concluir(usuarioId: string, solicitacaoId: string) {
    return sequelize.transaction(async (transaction) => {
      const solicitacao = await Solicitacao.findOne({
        where: { id: solicitacaoId, status: 'CONTRATADA' },
        transaction,
        lock: transaction.LOCK.UPDATE,
      });
      if (!solicitacao) {
        throw new HttpError(404, 'Solicitação não encontrada ou não está contratada.');
      }

      const proposta = await Proposta.findOne({
        where: { solicitacao_id: solicitacaoId, status: 'ACEITA' },
        transaction,
        lock: transaction.LOCK.UPDATE,
      });
      if (!proposta) {
        throw new HttpError(404, 'Nenhuma proposta aceita encontrada para esta solicitação.');
      }

      const ehSolicitante = solicitacao.solicitante_id === usuarioId;
      const ehPrestador = proposta.prestador_id === usuarioId;
      if (!ehSolicitante && !ehPrestador) {
        throw new HttpError(403, 'Você não participa desta contratação.');
      }

      await solicitacao.update({ status: 'CONCLUIDA' }, { transaction });

      const transacao = await TransacaoCustodia.findOne({
        where: { solicitacao_id: solicitacaoId }, transaction, lock: transaction.LOCK.UPDATE,
      });
      if (transacao && transacao.status_pagamento !== 'REEMBOLSADO' &&
          (transacao.proposta_id !== proposta.id || transacao.status_pagamento !== 'RETIDO')) {
        throw new HttpError(409, 'A custódia não corresponde à contratação atual.');
      }
      if (transacao && transacao.status_pagamento === 'RETIDO') {
        await transacao.update({ status_pagamento: 'LIBERADO', liberado_em: new Date() }, { transaction });
      }

      const outroId = ehSolicitante ? proposta.prestador_id : solicitacao.solicitante_id;
      const tipoEvento = ehSolicitante ? 'PROPOSTA_ACEITA_RECUSADA' : 'PROPOSTA_ACEITA_RECUSADA';
      if (await preferenciaNotificacaoService.estaAtivado(outroId, tipoEvento)) {
        const notificacao = await Notificacao.create(
          {
            usuario_id: outroId,
            titulo: 'Serviço concluído',
            mensagem: `"${solicitacao.titulo}" foi marcado como concluído.`,
            link_redirecionamento: ehSolicitante ? '/minhas-propostas' : `/minhas-solicitacoes/${solicitacaoId}`,
          },
          { transaction }
        );
        transaction.afterCommit(() => { emitirParaUsuario(outroId, 'nova-notificacao', notificacao.get({ plain: true })); });
      }

      return { mensagem: 'Serviço marcado como concluído.' };
    });
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

    await sequelize.transaction(async (transaction) => {
      const solicitacao = await Solicitacao.findOne({
        where: { id: solicitacaoId, solicitante_id: solicitanteId },
        transaction, lock: transaction.LOCK.UPDATE,
      });
      if (!solicitacao) throw new HttpError(404, 'Solicitação não encontrada.');

      if (['CONTRATADA', 'CONCLUIDA', 'CANCELADA'].includes(solicitacao.status)) {
        throw new HttpError(409, 'Esta solicitação não permite renegociação.');
      }

      const proposta = await Proposta.findOne({
        where: { id: propostaId, solicitacao_id: solicitacaoId },
        transaction, lock: transaction.LOCK.UPDATE,
      });
      if (!proposta) throw new HttpError(404, 'Proposta não encontrada.');
      if (!(new Date(proposta.validade_ate).getTime() > Date.now())) {
        throw new HttpError(409, 'A validade comercial desta proposta expirou. Não é possível renegociá-la.');
      }

      if (['ACEITA', 'RECUSADA'].includes(proposta.status)) {
        throw new HttpError(409, 'Esta proposta não permite renegociação.');
      }
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

  /**
   * Cancela uma solicitação antes da contratação (US07). Permitido apenas em `ABERTA` ou
   * `EM_NEGOCIACAO`; cria uma notificação interna para cada prestador que já enviou proposta.
   */
  async cancelarSolicitacao(solicitanteId: string, solicitacaoId: string, motivo: string) {
    const motivoTratado = (motivo || '').trim();
    if (motivoTratado.length < 5) {
      throw new HttpError(400, 'Informe um motivo com pelo menos 5 caracteres.');
    }

    return sequelize.transaction(async (transaction) => {
      const solicitacao = await Solicitacao.findOne({
        where: { id: solicitacaoId, solicitante_id: solicitanteId },
        transaction,
        lock: transaction.LOCK.UPDATE,
      });
      if (!solicitacao) throw new HttpError(404, 'Solicitação não encontrada.');

      if (!['ABERTA', 'EM_NEGOCIACAO'].includes(solicitacao.status)) {
        throw new HttpError(409, 'Somente solicitações abertas ou em negociação podem ser canceladas.');
      }

      const propostas = await Proposta.findAll({
        where: { solicitacao_id: solicitacaoId },
        attributes: ['prestador_id'],
        transaction,
        lock: transaction.LOCK.UPDATE,
      });

      await solicitacao.update(
        { status: 'CANCELADA', motivo_cancelamento: motivoTratado, cancelada_em: new Date() },
        { transaction }
      );

      const prestadoresUnicos = [...new Set(propostas.map((proposta) => proposta.prestador_id))];

      if (prestadoresUnicos.length > 0) {
        const prestadoresAtivos = await preferenciaNotificacaoService.filtrarAtivos(prestadoresUnicos, 'SOLICITACAO_CANCELADA');
        if (prestadoresAtivos.length > 0) {
          await Notificacao.bulkCreate(
            prestadoresAtivos.map((prestadorId) => ({
              usuario_id: prestadorId,
              titulo: 'Solicitação cancelada',
              mensagem: `A solicitação "${solicitacao.titulo}" foi cancelada. Motivo: ${motivoTratado}`,
              link_redirecionamento: `/oportunidades/${solicitacao.id}`,
            })),
            { transaction }
          );
          transaction.afterCommit(() => { prestadoresAtivos.forEach((prestadorId) => emitirParaUsuario(prestadorId, 'nova-notificacao', {})); });
        }
      }

      return {
        mensagem: `Solicitação cancelada. ${prestadoresUnicos.length} prestador(es) notificado(s).`,
      };
    });
  }

  /**
   * Simula o checkout/retenção do valor de uma proposta aceita em custódia (US13). Idempotente: se a
   * solicitação já tiver uma transação de custódia, retida para a contratação atual, apenas a retorna. Após reembolso, reutiliza o registro
   * único para a nova contratação; a conclusão libera o valor em US17.
   */
  async simularPagamentoCustodia(
    solicitanteId: string,
    solicitacaoId: string,
    metodoPagamento: 'CARTAO_TESTE' | 'PIX_TESTE'
  ) {
    if (!['CARTAO_TESTE', 'PIX_TESTE'].includes(metodoPagamento)) {
      throw new HttpError(422, 'Método de pagamento simulado inválido.');
    }

    return sequelize.transaction(async (transaction) => {
      const solicitacao = await Solicitacao.findOne({
        where: { id: solicitacaoId, solicitante_id: solicitanteId },
        transaction,
        lock: transaction.LOCK.UPDATE,
      });
      if (!solicitacao) throw new HttpError(404, 'Solicitação não encontrada.');

      if (solicitacao.status !== 'CONTRATADA') {
        throw new HttpError(409, 'O pagamento só pode ser retido para uma solicitação contratada.');
      }

      const proposta = await Proposta.findOne({
        where: { solicitacao_id: solicitacaoId, status: 'ACEITA' },
        transaction,
        lock: transaction.LOCK.UPDATE,
      });
      if (!proposta) throw new HttpError(409, 'Nenhuma proposta aceita foi encontrada para esta solicitação.');

      const existente = await TransacaoCustodia.findOne({
        where: { solicitacao_id: solicitacaoId },
        transaction,
        lock: transaction.LOCK.UPDATE,
      });
      if (existente && existente.status_pagamento !== 'REEMBOLSADO') {
        if (existente.proposta_id !== proposta.id || existente.status_pagamento !== 'RETIDO') {
          throw new HttpError(409, 'A custódia não corresponde à contratação atual.');
        }
        return { mensagem: 'O valor desta proposta já está protegido.', dados: existente.get({ plain: true }) };
      }

      const referenciaSimulada = `SIM-${solicitacao.id}-${proposta.id}-${Date.now()}`;
      const dadosCustodia = {
          solicitacao_id: solicitacao.id,
          proposta_id: proposta.id,
          valor: proposta.valor,
          metodo_pagamento: metodoPagamento,
          referencia_simulada: referenciaSimulada,
          retido_em: new Date(),
          status_pagamento: 'RETIDO' as const,
          liberado_em: null,
        };
      // A solicitação possui uma única custódia: somente um reembolso permite reutilizá-la.
      const transacao = existente
        ? await existente.update(dadosCustodia, { transaction })
        : await TransacaoCustodia.create(dadosCustodia, { transaction });

      // Retorna a precisão efetivamente persistida pelo MySQL, inclusive os timestamps DATETIME.
      await transacao.reload({ transaction });

      return { mensagem: 'Pagamento simulado e valor retido em custódia.', dados: transacao.get({ plain: true }) };
    });
  }
}

export default new SolicitacaoService();
