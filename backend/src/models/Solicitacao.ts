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
  categoria?: string | null;
  cidade?: string | null;
  bairro?: string | null;
  orcamento_cliente?: number | null;
  prazo_desejado_dias?: number | null;
  status: StatusSolicitacao;
  motivo_cancelamento?: string | null;
  cancelada_em?: Date | null;
  created_at?: Date;
  updated_at?: Date;
}

export interface SolicitacaoCreationAttributes
  extends Optional<
    SolicitacaoAttributes,
    | 'id'
    | 'status'
    | 'categoria'
    | 'cidade'
    | 'bairro'
    | 'orcamento_cliente'
    | 'prazo_desejado_dias'
    | 'motivo_cancelamento'
    | 'cancelada_em'
  > {}

export class Solicitacao extends Model<SolicitacaoAttributes, SolicitacaoCreationAttributes> implements SolicitacaoAttributes {
  public id!: string;
  public solicitante_id!: string;
  public titulo!: string;
  public descricao!: string;
  public categoria?: string | null;
  public cidade?: string | null;
  public bairro?: string | null;
  public orcamento_cliente?: number | null;
  public prazo_desejado_dias?: number | null;
  public status!: StatusSolicitacao;
  public motivo_cancelamento?: string | null;
  public cancelada_em?: Date | null;

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
    categoria: {
      type: DataTypes.STRING(100),
      allowNull: true,
    },
    cidade: {
      type: DataTypes.STRING(100),
      allowNull: true,
    },
    bairro: {
      type: DataTypes.STRING(100),
      allowNull: true,
    },
    orcamento_cliente: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: true,
    },
    prazo_desejado_dias: {
      type: DataTypes.INTEGER.UNSIGNED,
      allowNull: true,
    },
    status: {
      type: DataTypes.ENUM(...STATUS_SOLICITACAO),
      allowNull: false,
      defaultValue: 'ABERTA',
    },
    motivo_cancelamento: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    cancelada_em: {
      type: DataTypes.DATE,
      allowNull: true,
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
