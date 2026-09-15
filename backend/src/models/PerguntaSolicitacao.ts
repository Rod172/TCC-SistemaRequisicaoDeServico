/**
 * @file PerguntaSolicitacao.ts
 * @description Modelo relacional do Sequelize em TypeScript representando uma pergunta pública feita
 * por um Prestador numa solicitação, e a resposta do Solicitante dono (US29).
 *
 * BIBLIOTECAS UTILIZADAS:
 * 1. Sequelize ORM (^6.37.3): Mapeamento Objeto-Relacional.
 *    Doc Oficial: https://sequelize.org/docs/v6/core-concepts/model-basics/
 */

import { Model, DataTypes, Optional } from 'sequelize';
import db from '../config/database';

export interface PerguntaSolicitacaoAttributes {
  id: string;
  solicitacao_id: string;
  prestador_id: string;
  pergunta: string;
  resposta?: string | null;
  respondida_em?: Date | null;
  created_at?: Date;
  updated_at?: Date;
}

export interface PerguntaSolicitacaoCreationAttributes
  extends Optional<PerguntaSolicitacaoAttributes, 'id' | 'resposta' | 'respondida_em'> {}

export class PerguntaSolicitacao
  extends Model<PerguntaSolicitacaoAttributes, PerguntaSolicitacaoCreationAttributes>
  implements PerguntaSolicitacaoAttributes
{
  public id!: string;
  public solicitacao_id!: string;
  public prestador_id!: string;
  public pergunta!: string;
  public resposta?: string | null;
  public respondida_em?: Date | null;

  public readonly created_at!: Date;
  public readonly updated_at!: Date;
}

PerguntaSolicitacao.init(
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
    pergunta: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
    resposta: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    respondida_em: {
      type: DataTypes.DATE,
      allowNull: true,
    },
  },
  {
    sequelize: db,
    tableName: 'perguntas_solicitacao',
    timestamps: true,
    underscored: true,
  }
);

export default PerguntaSolicitacao;
