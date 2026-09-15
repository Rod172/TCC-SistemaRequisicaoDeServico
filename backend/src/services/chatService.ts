/**
 * @file chatService.ts
 * @description Serviço de regras de negócio do chat privado entre Solicitante e um Prestador (US14),
 * com anexo opcional de imagem/PDF por mensagem (US15) e notificação do outro participante (US16).
 *
 * A partir da US34, a conversa é escopada por **proposta** (não mais por solicitação inteira): assim
 * que o prestador envia uma proposta, o chat já é liberado com o solicitante — mesmo antes do aceite —
 * e cada prestador concorrente tem sua própria sala privada, sem ver a conversa dos outros. A única
 * exceção é uma proposta já `RECUSADA`: a conversa continua acessível para consulta, mas não aceita
 * novas mensagens.
 *
 * BIBLIOTECAS UTILIZADAS:
 * 1. Sequelize ORM (^6.37.3): Consultas relacionais.
 *    Doc Oficial: https://sequelize.org/docs/v6/
 */

import { Op } from 'sequelize';
import { Proposta, Usuario, MensagemChat, Notificacao } from '../models';
import HttpError from '../utils/HttpError';
import { emitirParaUsuario } from '../sockets/chatSocket';
import preferenciaNotificacaoService from './preferenciaNotificacaoService';

export interface AnexoChat {
  filename: string;
  originalname: string;
}

export class ChatService {
  /**
   * Garante que o usuário é o Solicitante dono da solicitação da proposta ou o Prestador dono dela —
   * não há mais restrição de status (US34: liberado desde o envio da proposta). Retorna a proposta, a
   * solicitação e o id do "outro" participante (útil pra notificações), ou lança 403/404.
   */
  async verificarParticipante(propostaId: string, usuarioId: string) {
    const proposta = await Proposta.findByPk(propostaId, { include: [{ association: 'solicitacao' }] });
    if (!proposta) throw new HttpError(404, 'Proposta não encontrada.');

    const solicitacao = (proposta as any).solicitacao;
    if (!solicitacao) throw new HttpError(404, 'Solicitação não encontrada.');

    const ehSolicitante = solicitacao.solicitante_id === usuarioId;
    const ehPrestador = proposta.prestador_id === usuarioId;

    if (!ehSolicitante && !ehPrestador) {
      throw new HttpError(403, 'Você não faz parte desta conversa.');
    }

    return {
      proposta,
      solicitacao,
      outroParticipanteId: ehSolicitante ? proposta.prestador_id : solicitacao.solicitante_id,
    };
  }

  async listarMensagens(propostaId: string, usuarioId: string) {
    await this.verificarParticipante(propostaId, usuarioId);

    const mensagens = await MensagemChat.findAll({
      where: { proposta_id: propostaId },
      include: [{ model: Usuario, as: 'emissor', attributes: ['id', 'nome', 'foto_url'] }],
      order: [['created_at', 'ASC']],
    });

    return mensagens.map((m) => m.get({ plain: true }));
  }

  /**
   * Envia uma mensagem de texto e/ou um anexo (imagem/PDF, US15) — pelo menos um dos dois precisa
   * estar presente. O anexo já deve ter sido salvo em disco pelo `uploadAnexoChatMiddleware`.
   */
  async enviarMensagem(propostaId: string, usuarioId: string, conteudo: string, arquivo?: AnexoChat) {
    const conteudoTratado = (conteudo || '').trim() || null;

    if (!conteudoTratado && !arquivo) {
      throw new HttpError(400, 'Envie uma mensagem de texto ou um anexo.');
    }
    if (conteudoTratado && conteudoTratado.length > 2000) {
      throw new HttpError(400, 'A mensagem deve ter no máximo 2000 caracteres.');
    }

    const { proposta, solicitacao, outroParticipanteId } = await this.verificarParticipante(propostaId, usuarioId);

    if (proposta.status === 'RECUSADA') {
      throw new HttpError(409, 'Esta negociação foi encerrada — a conversa ficou disponível só para consulta.');
    }

    const mensagem = await MensagemChat.create({
      solicitacao_id: solicitacao.id,
      proposta_id: propostaId,
      emissor_id: usuarioId,
      conteudo: conteudoTratado,
      anexo_url: arquivo ? `/uploads/chat/${arquivo.filename}` : null,
      anexo_nome_original: arquivo ? arquivo.originalname : null,
    });

    const comEmissor = await MensagemChat.findByPk(mensagem.id, {
      include: [{ model: Usuario, as: 'emissor', attributes: ['id', 'nome', 'foto_url'] }],
    });

    const emissor = comEmissor!.get({ plain: true }) as any;

    if (await preferenciaNotificacaoService.estaAtivado(outroParticipanteId, 'NOVA_MENSAGEM_CHAT')) {
      const notificacao = await Notificacao.create({
        usuario_id: outroParticipanteId,
        titulo: `Nova mensagem de ${emissor.emissor.nome}`,
        mensagem: conteudoTratado || 'Enviou um anexo.',
        link_redirecionamento: `/chat/${propostaId}`,
      });
      emitirParaUsuario(outroParticipanteId, 'nova-notificacao', notificacao.get({ plain: true }));
    }

    return emissor;
  }

  /** Marca como lidas as mensagens que o usuário autenticado RECEBEU (não as que ele mesmo enviou). */
  async marcarComoLidas(propostaId: string, usuarioId: string) {
    await this.verificarParticipante(propostaId, usuarioId);

    await MensagemChat.update(
      { lida: true },
      {
        where: {
          proposta_id: propostaId,
          emissor_id: { [Op.ne]: usuarioId },
          lida: false,
        },
      }
    );

    return { mensagem: 'Mensagens marcadas como lidas.' };
  }
}

export default new ChatService();
