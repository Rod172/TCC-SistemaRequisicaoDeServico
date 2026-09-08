/**
 * @file AnexoSolicitacao.ts
 * @description Modelo relacional do Sequelize em TypeScript representando um anexo (foto/documento)
 * enviado junto de uma solicitação de serviço (US05).
 *
 * BIBLIOTECAS UTILIZADAS:
 * 1. Sequelize ORM (^6.37.3): Mapeamento Objeto-Relacional.
 *    Doc Oficial: https://sequelize.org/docs/v6/core-concepts/model-basics/
 */

import { Model, DataTypes, Optional } from 'sequelize';
import db from '../config/database';

export interface AnexoSolicitacaoAttributes {
  id: string;
  solicitacao_id: string;
  url_arquivo: string;
  nome_original: string;
  created_at?: Date;
  updated_at?: Date;
}

export interface AnexoSolicitacaoCreationAttributes extends Optional<AnexoSolicitacaoAttributes, 'id'> {}

export class AnexoSolicitacao
  extends Model<AnexoSolicitacaoAttributes, AnexoSolicitacaoCreationAttributes>
  implements AnexoSolicitacaoAttributes
{
  public id!: string;
  public solicitacao_id!: string;
  public url_arquivo!: string;
  public nome_original!: string;

  public readonly created_at!: Date;
  public readonly updated_at!: Date;
}

AnexoSolicitacao.init(
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
    url_arquivo: {
      type: DataTypes.STRING(500),
      allowNull: false,
    },
    nome_original: {
      type: DataTypes.STRING(255),
      allowNull: false,
    },
  },
  {
    sequelize: db,
    tableName: 'anexos_solicitacao',
    timestamps: true,
    underscored: true,
  }
);

export default AnexoSolicitacao;
