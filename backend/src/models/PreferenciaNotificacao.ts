/**
 * @file PreferenciaNotificacao.ts
 * @description Modelo relacional do Sequelize em TypeScript representando a preferência de um usuário
 * por um tipo de evento de notificação (US30) — se não houver linha para um (usuario_id, tipo_evento),
 * o padrão é "ativado" (ver `preferenciaNotificacaoService.estaAtivado`).
 *
 * BIBLIOTECAS UTILIZADAS:
 * 1. Sequelize ORM (^6.37.3): Mapeamento Objeto-Relacional.
 *    Doc Oficial: https://sequelize.org/docs/v6/core-concepts/model-basics/
 */

import { Model, DataTypes, Optional } from 'sequelize';
import db from '../config/database';

export type TipoEventoNotificacao =
  | 'NOVA_PROPOSTA'
  | 'PROPOSTA_ACEITA_RECUSADA'
  | 'NOVA_MENSAGEM_CHAT'
  | 'SOLICITACAO_CANCELADA';

export const TIPOS_EVENTO_NOTIFICACAO: TipoEventoNotificacao[] = [
  'NOVA_PROPOSTA',
  'PROPOSTA_ACEITA_RECUSADA',
  'NOVA_MENSAGEM_CHAT',
  'SOLICITACAO_CANCELADA',
];

export interface PreferenciaNotificacaoAttributes {
  id: string;
  usuario_id: string;
  tipo_evento: TipoEventoNotificacao;
  ativo: boolean;
  created_at?: Date;
  updated_at?: Date;
}

export interface PreferenciaNotificacaoCreationAttributes
  extends Optional<PreferenciaNotificacaoAttributes, 'id' | 'ativo'> {}

export class PreferenciaNotificacao
  extends Model<PreferenciaNotificacaoAttributes, PreferenciaNotificacaoCreationAttributes>
  implements PreferenciaNotificacaoAttributes
{
  public id!: string;
  public usuario_id!: string;
  public tipo_evento!: TipoEventoNotificacao;
  public ativo!: boolean;

  public readonly created_at!: Date;
  public readonly updated_at!: Date;
}

PreferenciaNotificacao.init(
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    usuario_id: {
      type: DataTypes.UUID,
      allowNull: false,
      references: { model: 'usuarios', key: 'id' },
    },
    tipo_evento: {
      type: DataTypes.ENUM(...TIPOS_EVENTO_NOTIFICACAO),
      allowNull: false,
    },
    ativo: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: true,
    },
  },
  {
    sequelize: db,
    tableName: 'preferencias_notificacao',
    timestamps: true,
    underscored: true,
  }
);

export default PreferenciaNotificacao;
