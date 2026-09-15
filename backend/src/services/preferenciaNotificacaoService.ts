/**
 * @file preferenciaNotificacaoService.ts
 * @description Serviço de preferências de notificação por tipo de evento (US30). Ausência de linha
 * pra um (usuario_id, tipo_evento) significa "ativado" (comportamento padrão da US16, preservado até
 * o usuário desativar algo explicitamente). Usado tanto pela tela de Configurações (listar/atualizar)
 * quanto pelos services que criam notificações (US10/US12/US14/US07), via `filtrarAtivos`, pra não
 * criar uma `Notificacao` pra quem desativou aquele tipo de evento.
 *
 * BIBLIOTECAS UTILIZADAS:
 * 1. Sequelize ORM (^6.37.3): Consultas relacionais.
 *    Doc Oficial: https://sequelize.org/docs/v6/
 */

import { Op } from 'sequelize';
import { PreferenciaNotificacao } from '../models';
import { TIPOS_EVENTO_NOTIFICACAO, TipoEventoNotificacao } from '../models/PreferenciaNotificacao';
import HttpError from '../utils/HttpError';

export class PreferenciaNotificacaoService {
  async listarMinhas(usuarioId: string) {
    const existentes = await PreferenciaNotificacao.findAll({ where: { usuario_id: usuarioId } });
    const mapa = new Map(existentes.map((p) => [p.tipo_evento, p.ativo]));

    return TIPOS_EVENTO_NOTIFICACAO.map((tipo) => ({
      tipo_evento: tipo,
      ativo: mapa.has(tipo) ? mapa.get(tipo) : true,
    }));
  }

  async atualizar(usuarioId: string, preferencias: { tipo_evento: string; ativo: boolean }[]) {
    if (!Array.isArray(preferencias) || preferencias.length === 0) {
      throw new HttpError(400, 'Informe ao menos uma preferência para atualizar.');
    }

    for (const pref of preferencias) {
      if (!TIPOS_EVENTO_NOTIFICACAO.includes(pref.tipo_evento as TipoEventoNotificacao)) {
        throw new HttpError(400, `Tipo de evento inválido: ${pref.tipo_evento}.`);
      }

      const [linha] = await PreferenciaNotificacao.findOrCreate({
        where: { usuario_id: usuarioId, tipo_evento: pref.tipo_evento as TipoEventoNotificacao },
        defaults: { usuario_id: usuarioId, tipo_evento: pref.tipo_evento as TipoEventoNotificacao, ativo: !!pref.ativo },
      });
      await linha.update({ ativo: !!pref.ativo });
    }

    return this.listarMinhas(usuarioId);
  }

  /**
   * Dado um tipo de evento e uma lista de usuários candidatos a notificar, devolve só quem NÃO
   * desativou aquele tipo (padrão ativado — busca só quem explicitamente marcou `ativo: false`).
   */
  async filtrarAtivos(usuarioIds: string[], tipoEvento: TipoEventoNotificacao): Promise<string[]> {
    if (usuarioIds.length === 0) return [];

    const desativados = await PreferenciaNotificacao.findAll({
      where: { usuario_id: { [Op.in]: usuarioIds }, tipo_evento: tipoEvento, ativo: false },
      attributes: ['usuario_id'],
    });
    const idsDesativados = new Set(desativados.map((d) => d.usuario_id));

    return usuarioIds.filter((id) => !idsDesativados.has(id));
  }

  /** Atalho pra checar um único usuário — usado quando só há um destinatário. */
  async estaAtivado(usuarioId: string, tipoEvento: TipoEventoNotificacao): Promise<boolean> {
    const ativos = await this.filtrarAtivos([usuarioId], tipoEvento);
    return ativos.length > 0;
  }
}

export default new PreferenciaNotificacaoService();
