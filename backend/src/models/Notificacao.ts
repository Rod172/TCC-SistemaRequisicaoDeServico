/**
 * @file Notificacao.ts
 * @description Modelo relacional do Sequelize em TypeScript representando uma notificação interna de
 * um usuário. Estrutura já alinhada à US16 (Notificações no Sistema); usada por enquanto apenas pelo
 * gatilho de cancelamento de solicitação (US07).
 *
 * BIBLIOTECAS UTILIZADAS:
 * 1. Sequelize ORM (^6.37.3): Mapeamento Objeto-Relacional.
 *    Doc Oficial: https://sequelize.org/docs/v6/core-concepts/model-basics/
 */

import { Model, DataTypes, Optional } from 'sequelize';
import db from '../config/database';

export interface NotificacaoAttributes {
  id: string;
  usuario_id: string;
  titulo: string;
  mensagem: string;
  link_redirecionamento?: string | null;
  lida: boolean;
  created_at?: Date;
  updated_at?: Date;
}

export interface NotificacaoCreationAttributes
  extends Optional<NotificacaoAttributes, 'id' | 'link_redirecionamento' | 'lida'> {}

export class Notificacao
  extends Model<NotificacaoAttributes, NotificacaoCreationAttributes>
  implements NotificacaoAttributes
{
  public id!: string;
  public usuario_id!: string;
  public titulo!: string;
  public mensagem!: string;
  public link_redirecionamento?: string | null;
  public lida!: boolean;

  public readonly created_at!: Date;
  public readonly updated_at!: Date;
}

Notificacao.init(
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
    titulo: {
      type: DataTypes.STRING(180),
      allowNull: false,
    },
    mensagem: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
    link_redirecionamento: {
      type: DataTypes.STRING(255),
      allowNull: true,
    },
    lida: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false,
    },
  },
  {
    sequelize: db,
    tableName: 'notificacoes',
    timestamps: true,
    underscored: true,
  }
);

export default Notificacao;
