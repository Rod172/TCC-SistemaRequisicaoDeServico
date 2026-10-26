/**
 * @file Proposta.ts
 * @description Modelo relacional do Sequelize em TypeScript representando a entidade `Proposta` (US11 / US12).
 *
 * BIBLIOTECAS UTILIZADAS:
 * 1. Sequelize ORM (^6.37.3): Mapeamento Objeto-Relacional.
 *    Doc Oficial: https://sequelize.org/docs/v6/core-concepts/model-basics/
 */

import { Model, DataTypes, Optional } from 'sequelize';
import db from '../config/database';

export type StatusProposta = 'ENVIADA' | 'EM_ANALISE' | 'ACEITA' | 'RECUSADA';

export const STATUS_PROPOSTA: StatusProposta[] = ['ENVIADA', 'EM_ANALISE', 'ACEITA', 'RECUSADA'];

export interface PropostaAttributes {
  id: string;
  solicitacao_id: string;
  prestador_id: string;
  valor: number;
  prazo_dias: number;
  validade_ate: Date;
  mensagem: string;
  status: StatusProposta;
  valor_contraproposta?: number | null;
  mensagem_contraproposta?: string | null;
  contraproposta_em?: Date | null;
  contraproposta_status?: 'PENDENTE' | 'ACEITA' | 'RECUSADA' | null;
  contraproposta_respondida_em?: Date | null;
  created_at?: Date;
  updated_at?: Date;
}

export interface PropostaCreationAttributes
  extends Optional<PropostaAttributes, 'id' | 'status' | 'validade_ate' | 'valor_contraproposta' | 'mensagem_contraproposta' | 'contraproposta_em'> {}

export class Proposta extends Model<PropostaAttributes, PropostaCreationAttributes> implements PropostaAttributes {
  public id!: string;
  public solicitacao_id!: string;
  public prestador_id!: string;
  public valor!: number;
  public prazo_dias!: number;
  public validade_ate!: Date;
  public mensagem!: string;
  public status!: StatusProposta;
  public valor_contraproposta?: number | null;
  public mensagem_contraproposta?: string | null;
  public contraproposta_em?: Date | null;
  public contraproposta_status?: 'PENDENTE' | 'ACEITA' | 'RECUSADA' | null;
  public contraproposta_respondida_em?: Date | null;

  public readonly created_at!: Date;
  public readonly updated_at!: Date;
}

Proposta.init(
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    solicitacao_id: {
      type: DataTypes.UUID,
      allowNull: false,
      references: { model: 'solicitacoes', key: 'id' },
    },
    prestador_id: {
      type: DataTypes.UUID,
      allowNull: false,
      references: { model: 'usuarios', key: 'id' },
    },
    valor: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
    },
    prazo_dias: {
      type: DataTypes.INTEGER.UNSIGNED,
      allowNull: false,
    },
    validade_ate: {
      type: DataTypes.DATE,
      allowNull: false,
      // Compatibilidade com criações pelo modelo que ainda não informem a validade comercial.
      defaultValue: () => new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
    },
    mensagem: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
    status: {
      type: DataTypes.ENUM(...STATUS_PROPOSTA),
      allowNull: false,
      defaultValue: 'ENVIADA',
    },
    valor_contraproposta: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: true,
    },
    mensagem_contraproposta: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    contraproposta_em: {
      type: DataTypes.DATE,
      allowNull: true,
    },
    contraproposta_status: { type: DataTypes.ENUM('PENDENTE', 'ACEITA', 'RECUSADA'), allowNull: true },
    contraproposta_respondida_em: { type: DataTypes.DATE, allowNull: true },
  },
  {
    sequelize: db,
    tableName: 'propostas',
    timestamps: true,
    underscored: true,
  }
);

export default Proposta;
