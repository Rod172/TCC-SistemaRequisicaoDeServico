/**
 * @file perguntaService.ts
 * @description Serviço de regras de negócio do Q&A público de uma solicitação (US29): qualquer
 * prestador pode perguntar antes mesmo de enviar proposta; só o solicitante dono responde; a
 * resposta fica visível pra todos.
 *
 * BIBLIOTECAS UTILIZADAS:
 * 1. Sequelize ORM (^6.37.3): Consultas relacionais.
 *    Doc Oficial: https://sequelize.org/docs/v6/
 */

import { Solicitacao, Usuario, PerguntaSolicitacao } from '../models';
import HttpError from '../utils/HttpError';

export class PerguntaService {
  async listar(solicitacaoId: string) {
    const perguntas = await PerguntaSolicitacao.findAll({
      where: { solicitacao_id: solicitacaoId },
      include: [{ model: Usuario, as: 'prestador', attributes: ['id', 'nome', 'foto_url'] }],
      order: [['created_at', 'ASC']],
    });

    return perguntas.map((p) => p.get({ plain: true }));
  }

  async perguntar(solicitacaoId: string, prestadorId: string, pergunta: string) {
    const perguntaTratada = (pergunta || '').trim();
    if (perguntaTratada.length < 5) {
      throw new HttpError(400, 'A pergunta deve ter pelo menos 5 caracteres.');
    }
    if (perguntaTratada.length > 1000) {
      throw new HttpError(400, 'A pergunta deve ter no máximo 1000 caracteres.');
    }

    const solicitacao = await Solicitacao.findByPk(solicitacaoId);
    if (!solicitacao) {
      throw new HttpError(404, 'Solicitação não encontrada.');
    }

    const criada = await PerguntaSolicitacao.create({
      solicitacao_id: solicitacaoId,
      prestador_id: prestadorId,
      pergunta: perguntaTratada,
    });

    const comPrestador = await PerguntaSolicitacao.findByPk(criada.id, {
      include: [{ model: Usuario, as: 'prestador', attributes: ['id', 'nome', 'foto_url'] }],
    });

    return comPrestador!.get({ plain: true });
  }

  async responder(solicitacaoId: string, solicitanteId: string, perguntaId: string, resposta: string) {
    const respostaTratada = (resposta || '').trim();
    if (respostaTratada.length < 2) {
      throw new HttpError(400, 'Informe uma resposta válida.');
    }
    if (respostaTratada.length > 1000) {
      throw new HttpError(400, 'A resposta deve ter no máximo 1000 caracteres.');
    }

    const solicitacao = await Solicitacao.findOne({ where: { id: solicitacaoId, solicitante_id: solicitanteId } });
    if (!solicitacao) {
      throw new HttpError(404, 'Solicitação não encontrada.');
    }

    const pergunta = await PerguntaSolicitacao.findOne({ where: { id: perguntaId, solicitacao_id: solicitacaoId } });
    if (!pergunta) {
      throw new HttpError(404, 'Pergunta não encontrada.');
    }

    await pergunta.update({ resposta: respostaTratada, respondida_em: new Date() });

    const comPrestador = await PerguntaSolicitacao.findByPk(pergunta.id, {
      include: [{ model: Usuario, as: 'prestador', attributes: ['id', 'nome', 'foto_url'] }],
    });

    return comPrestador!.get({ plain: true });
  }
}

export default new PerguntaService();
