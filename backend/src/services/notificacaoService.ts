/**
 * @file notificacaoService.ts
 * @description Serviço de leitura/gerenciamento das notificações internas do usuário (US16). A
 * criação das notificações acontece nos próprios services de origem do evento (nova proposta em
 * `oportunidadeService`, aceite/recusa em `solicitacaoService`, nova mensagem em `chatService`) — este
 * serviço só lida com o que o usuário vê: listar e marcar como lida.
 *
 * BIBLIOTECAS UTILIZADAS:
 * 1. Sequelize ORM (^6.37.3): Consultas relacionais.
 *    Doc Oficial: https://sequelize.org/docs/v6/
 */

import { Notificacao } from '../models';
import HttpError from '../utils/HttpError';

export class NotificacaoService {
  async listarMinhas(usuarioId: string) {
    const [notificacoes, naoLidas] = await Promise.all([
      Notificacao.findAll({
        where: { usuario_id: usuarioId },
        order: [['created_at', 'DESC']],
        limit: 30,
      }),
      Notificacao.count({ where: { usuario_id: usuarioId, lida: false } }),
    ]);

    return {
      dados: notificacoes.map((n) => n.get({ plain: true })),
      nao_lidas: naoLidas,
    };
  }

  async marcarComoLida(usuarioId: string, notificacaoId: string) {
    const notificacao = await Notificacao.findOne({ where: { id: notificacaoId, usuario_id: usuarioId } });
    if (!notificacao) throw new HttpError(404, 'Notificação não encontrada.');

    await notificacao.update({ lida: true });
    return { mensagem: 'Notificação marcada como lida.' };
  }

  async marcarTodasComoLidas(usuarioId: string) {
    await Notificacao.update({ lida: true }, { where: { usuario_id: usuarioId, lida: false } });
    return { mensagem: 'Todas as notificações foram marcadas como lidas.' };
  }
}

export default new NotificacaoService();
