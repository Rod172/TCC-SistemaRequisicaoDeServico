/**
 * @file Denuncia.ts
 * @description Modelo relacional do Sequelize em TypeScript representando uma denúncia feita por um
 * Solicitante ou Prestador sobre uma solicitação, para o Admin revisar (US32).
 *
 * BIBLIOTECAS UTILIZADAS:
 * 1. Sequelize ORM (^6.37.3): Mapeamento Objeto-Relacional.
 *    Doc Oficial: https://sequelize.org/docs/v6/core-concepts/model-basics/
 */

import { Model, DataTypes, Optional } from 'sequelize';
import db from '../config/database';

export type StatusDenuncia = 'PENDENTE' | 'RESOLVIDA';

export interface DenunciaAttributes {
  id: string;
  solicitacao_id: string;
  denunciante_id: string;
  motivo: string;
  status: StatusDenuncia;
  created_at?: Date;
  updated_at?: Date;
}

export interface DenunciaCreationAttributes extends Optional<DenunciaAttributes, 'id' | 'status'> {}

export class Denuncia
  extends Model<DenunciaAttributes, DenunciaCreationAttributes>
  implements DenunciaAttributes
{
  public id!: string;
  public solicitacao_id!: string;
  public denunciante_id!: string;
  public motivo!: string;
  public status!: StatusDenuncia;

  public readonly created_at!: Date;
  public readonly updated_at!: Date;
}

Denuncia.init(
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
    denunciante_id: {
      type: DataTypes.UUID,
      allowNull: false,
      references: { model: 'usuarios', key: 'id' },
    },
    motivo: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
    status: {
      type: DataTypes.ENUM('PENDENTE', 'RESOLVIDA'),
      allowNull: false,
      defaultValue: 'PENDENTE',
    },
  },
  {
    sequelize: db,
    tableName: 'denuncias',
    timestamps: true,
    underscored: true,
  }
);

export default Denuncia;
