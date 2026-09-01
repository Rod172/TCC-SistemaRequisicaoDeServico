/**
 * @file Usuario.ts
 * @description Modelo relacional do Sequelize em TypeScript representando a entidade `Usuario`.
 * 
 * BIBLIOTECAS UTILIZADAS:
 * 1. Sequelize ORM (^6.37.3): Mapeamento Objeto-Relacional.
 *    Doc Oficial: https://sequelize.org/docs/v6/core-concepts/model-basics/
 */

import { Model, DataTypes, Optional } from 'sequelize';
import db from '../config/database';

export interface UsuarioAttributes {
  id: string;
  nome: string;
  email: string;
  cpf: string;
  telefone: string;
  endereco?: string;
  foto_url?: string;
  senha_hash: string;
  tipo_perfil: 'SOLICITANTE' | 'PRESTADOR' | 'ADMIN';
  termo_lgpd_aceito: boolean;
  termo_lgpd_aceito_em?: Date;
  ativo: boolean;
  created_at?: Date;
  updated_at?: Date;
}

export interface UsuarioCreationAttributes extends Optional<UsuarioAttributes, 'id' | 'endereco' | 'foto_url' | 'termo_lgpd_aceito' | 'termo_lgpd_aceito_em' | 'ativo'> {}

export class Usuario extends Model<UsuarioAttributes, UsuarioCreationAttributes> implements UsuarioAttributes {
  public id!: string;
  public nome!: string;
  public email!: string;
  public cpf!: string;
  public telefone!: string;
  public endereco?: string;
  public foto_url?: string;
  public senha_hash!: string;
  public tipo_perfil!: 'SOLICITANTE' | 'PRESTADOR' | 'ADMIN';
  public termo_lgpd_aceito!: boolean;
  public termo_lgpd_aceito_em?: Date;
  public ativo!: boolean;

  public readonly created_at!: Date;
  public readonly updated_at!: Date;
}

Usuario.init(
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    nome: {
      type: DataTypes.STRING(150),
      allowNull: false,
    },
    email: {
      type: DataTypes.STRING(150),
      allowNull: false,
      unique: true,
      validate: {
        isEmail: true,
      },
    },
    cpf: {
      type: DataTypes.STRING(14),
      allowNull: false,
      unique: true,
    },
    telefone: {
      type: DataTypes.STRING(20),
      allowNull: false,
    },
    endereco: {
      type: DataTypes.STRING(255),
      allowNull: true,
    },
    foto_url: {
      type: DataTypes.STRING(500),
      allowNull: true,
    },
    senha_hash: {
      type: DataTypes.STRING(255),
      allowNull: false,
    },
    tipo_perfil: {
      type: DataTypes.ENUM('SOLICITANTE', 'PRESTADOR', 'ADMIN'),
      allowNull: false,
      defaultValue: 'SOLICITANTE',
    },
    termo_lgpd_aceito: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false,
    },
    termo_lgpd_aceito_em: {
      type: DataTypes.DATE,
      allowNull: true,
    },
    ativo: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: true,
    },
  },
  {
    sequelize: db,
    tableName: 'usuarios',
    timestamps: true,
    underscored: true,
  }
);

export default Usuario;
