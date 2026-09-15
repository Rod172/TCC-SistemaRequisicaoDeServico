/**
 * @file Avaliacao.ts
 * @description Modelo relacional do Sequelize em TypeScript representando a avaliação de satisfação
 * (nota de 1 a 5 estrelas + comentário) que o Solicitante deixa para o Prestador após a conclusão do
 * serviço (US18) — uma avaliação por solicitação concluída.
 *
 * BIBLIOTECAS UTILIZADAS:
 * 1. Sequelize ORM (^6.37.3): Mapeamento Objeto-Relacional.
 *    Doc Oficial: https://sequelize.org/docs/v6/core-concepts/model-basics/
 */

import { Model, DataTypes, Optional } from 'sequelize';
import db from '../config/database';

export interface AvaliacaoAttributes {
  id: string;
  solicitacao_id: string;
  solicitante_id: string;
  prestador_id: string;
  nota: number;
  comentario?: string | null;
  created_at?: Date;
  updated_at?: Date;
}

export interface AvaliacaoCreationAttributes extends Optional<AvaliacaoAttributes, 'id' | 'comentario'> {}

export class Avaliacao
  extends Model<AvaliacaoAttributes, AvaliacaoCreationAttributes>
  implements AvaliacaoAttributes
{
  public id!: string;
  public solicitacao_id!: string;
  public solicitante_id!: string;
  public prestador_id!: string;
  public nota!: number;
  public comentario?: string | null;

  public readonly created_at!: Date;
  public readonly updated_at!: Date;
}

Avaliacao.init(
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    solicitacao_id: {
      type: DataTypes.UUID,
      allowNull: false,
      unique: true,
      references: { model: 'solicitacoes', key: 'id' },
    },
    solicitante_id: {
      type: DataTypes.UUID,
      allowNull: false,
      references: { model: 'usuarios', key: 'id' },
    },
    prestador_id: {
      type: DataTypes.UUID,
      allowNull: false,
      references: { model: 'usuarios', key: 'id' },
    },
    nota: {
      type: DataTypes.INTEGER,
      allowNull: false,
      validate: { min: 1, max: 5 },
    },
    comentario: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
  },
  {
    sequelize: db,
    tableName: 'avaliacoes',
    timestamps: true,
    underscored: true,
  }
);

export default Avaliacao;
