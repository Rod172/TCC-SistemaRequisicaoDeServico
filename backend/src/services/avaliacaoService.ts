/**
 * @file avaliacaoService.ts
 * @description Serviço de avaliação de satisfação e reputação do prestador (US18) — o Solicitante
 * avalia (nota de 1 a 5 estrelas + comentário) o serviço de uma solicitação já `CONCLUIDA` (US17), uma
 * única vez por solicitação. A nota média e o total de avaliações do prestador (`PrestadorPerfil`) são
 * recalculados a partir de todas as avaliações recebidas, não incrementados/somados incrementalmente —
 * evita drift de arredondamento acumulado ao longo de muitas avaliações.
 *
 * BIBLIOTECAS UTILIZADAS:
 * 1. Sequelize ORM (^6.37.3): Consultas relacionais e agregações (`fn`, `col`).
 *    Doc Oficial: https://sequelize.org/docs/v6/
 */

import { fn, col } from 'sequelize';
import { Solicitacao, Proposta, Avaliacao, PrestadorPerfil, Usuario } from '../models';
import HttpError from '../utils/HttpError';

export class AvaliacaoService {
  async avaliar(solicitanteId: string, solicitacaoId: string, nota: number, comentario?: string) {
    const notaTratada = Number(nota);
    if (!Number.isInteger(notaTratada) || notaTratada < 1 || notaTratada > 5) {
      throw new HttpError(400, 'A nota deve ser um número inteiro de 1 a 5.');
    }

    const solicitacao = await Solicitacao.findOne({
      where: { id: solicitacaoId, solicitante_id: solicitanteId },
    });
    if (!solicitacao) throw new HttpError(404, 'Solicitação não encontrada.');
    if (solicitacao.status !== 'CONCLUIDA') {
      throw new HttpError(409, 'Só é possível avaliar um serviço já concluído.');
    }

    const jaAvaliada = await Avaliacao.findOne({ where: { solicitacao_id: solicitacaoId } });
    if (jaAvaliada) {
      throw new HttpError(409, 'Esta solicitação já foi avaliada.');
    }

    // A proposta que ganhou a contratação continua `ACEITA` mesmo depois de `concluir` (US17) — só uma
    // desistência/cancelamento (US31/US34) a moveria pra `RECUSADA`, o que não seria compatível com
    // chegar em `CONCLUIDA`.
    const propostaAceita = await Proposta.findOne({ where: { solicitacao_id: solicitacaoId, status: 'ACEITA' } });
    if (!propostaAceita) {
      throw new HttpError(409, 'Não foi possível identificar o prestador contratado desta solicitação.');
    }

    const avaliacao = await Avaliacao.create({
      solicitacao_id: solicitacaoId,
      solicitante_id: solicitanteId,
      prestador_id: propostaAceita.prestador_id,
      nota: notaTratada,
      comentario: (comentario || '').trim() || null,
    });

    await this.recalcularReputacao(propostaAceita.prestador_id);

    return { mensagem: 'Avaliação registrada com sucesso.', dados: avaliacao.get({ plain: true }) };
  }

  private async recalcularReputacao(prestadorId: string) {
    const resultado = (await Avaliacao.findOne({
      where: { prestador_id: prestadorId },
      attributes: [
        [fn('AVG', col('nota')), 'media'],
        [fn('COUNT', col('id')), 'total'],
      ],
      raw: true,
    })) as unknown as { media: string | null; total: string };

    await PrestadorPerfil.update(
      {
        nota_media_reputacao: resultado?.media ? Number(Number(resultado.media).toFixed(2)) : 0,
        total_avaliacoes: resultado?.total ? Number(resultado.total) : 0,
      },
      { where: { usuario_id: prestadorId } }
    );
  }

  async buscarPorSolicitacao(solicitacaoId: string) {
    const avaliacao = await Avaliacao.findOne({
      where: { solicitacao_id: solicitacaoId },
      include: [{ model: Usuario, as: 'prestador', attributes: ['id', 'nome'] }],
    });
    return avaliacao ? avaliacao.get({ plain: true }) : null;
  }
}

export default new AvaliacaoService();
