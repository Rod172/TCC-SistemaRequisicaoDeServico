/**
 * @file PrestadorPerfil.ts
 * @description Modelo relacional do Sequelize em TypeScript representando a entidade `PrestadorPerfil`.
 * 
 * BIBLIOTECAS UTILIZADAS:
 * 1. Sequelize ORM (^6.37.3): Mapeamento Objeto-Relacional.
 *    Doc Oficial: https://sequelize.org/docs/v6/core-concepts/model-basics/
 */

import { Model, DataTypes, Optional } from 'sequelize';
import db from '../config/database';

export interface PrestadorPerfilAttributes {
  id: string;
  usuario_id: string;
  cnpj_cpf: string;
  descricao_bio?: string;
  categorias: string[]; // Array de strings armazenado em JSON
  nota_media_reputacao: number;
  total_avaliacoes: number;
  created_at?: Date;
  updated_at?: Date;
}

export interface PrestadorPerfilCreationAttributes extends Optional<PrestadorPerfilAttributes, 'id' | 'descricao_bio' | 'nota_media_reputacao' | 'total_avaliacoes'> {}

export class PrestadorPerfil extends Model<PrestadorPerfilAttributes, PrestadorPerfilCreationAttributes> implements PrestadorPerfilAttributes {
  public id!: string;
  public usuario_id!: string;
  public cnpj_cpf!: string;
  public descricao_bio?: string;
  public categorias!: string[];
  public nota_media_reputacao!: number;
  public total_avaliacoes!: number;

  public readonly created_at!: Date;
  public readonly updated_at!: Date;
}

PrestadorPerfil.init(
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    usuario_id: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: 'usuarios',
        key: 'id',
      },
    },
    cnpj_cpf: {
      type: DataTypes.STRING(20),
      allowNull: false,
    },
    descricao_bio: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    categorias: {
      type: DataTypes.JSON,
      allowNull: false,
    },
    nota_media_reputacao: {
      type: DataTypes.DECIMAL(3, 2),
      allowNull: false,
      defaultValue: 0.00,
    },
    total_avaliacoes: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0,
    },
  },
  {
    sequelize: db,
    tableName: 'prestadores_perfil',
    timestamps: true,
    underscored: true,
  }
);

export default PrestadorPerfil;
