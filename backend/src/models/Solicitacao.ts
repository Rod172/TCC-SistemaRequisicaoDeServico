/**
 * @file Solicitacao.ts
 * @description Modelo relacional do Sequelize em TypeScript representando a entidade `Solicitacao` (US06).
 *
 * BIBLIOTECAS UTILIZADAS:
 * 1. Sequelize ORM (^6.37.3): Mapeamento Objeto-Relacional.
 *    Doc Oficial: https://sequelize.org/docs/v6/core-concepts/model-basics/
 */

import { Model, DataTypes, Optional } from 'sequelize';
import db from '../config/database';

export type StatusSolicitacao = 'ABERTA' | 'EM_NEGOCIACAO' | 'CONTRATADA' | 'CONCLUIDA' | 'CANCELADA';

export const STATUS_SOLICITACAO: StatusSolicitacao[] = [
  'ABERTA',
  'EM_NEGOCIACAO',
  'CONTRATADA',
  'CONCLUIDA',
  'CANCELADA',
];

export interface SolicitacaoAttributes {
  id: string;
  solicitante_id: string;
  titulo: string;
  descricao: string;
  status: StatusSolicitacao;
  created_at?: Date;
  updated_at?: Date;
}

export interface SolicitacaoCreationAttributes extends Optional<SolicitacaoAttributes, 'id' | 'status'> {}

export class Solicitacao extends Model<SolicitacaoAttributes, SolicitacaoCreationAttributes> implements SolicitacaoAttributes {
  public id!: string;
  public solicitante_id!: string;
  public titulo!: string;
  public descricao!: string;
  public status!: StatusSolicitacao;

  public readonly created_at!: Date;
  public readonly updated_at!: Date;
}

Solicitacao.init(
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    solicitante_id: {
      type: DataTypes.UUID,
      allowNull: false,
      references: { model: 'usuarios', key: 'id' },
    },
    titulo: {
      type: DataTypes.STRING(180),
      allowNull: false,
    },
    descricao: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
    status: {
      type: DataTypes.ENUM(...STATUS_SOLICITACAO),
      allowNull: false,
      defaultValue: 'ABERTA',
    },
  },
  {
    sequelize: db,
    tableName: 'solicitacoes',
    timestamps: true,
    underscored: true,
  }
);

export default Solicitacao;
