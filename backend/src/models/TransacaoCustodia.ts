/**
 * @file TransacaoCustodia.ts
 * @description Modelo relacional do Sequelize em TypeScript representando a retenção simulada do
 * valor de uma proposta aceita, em garantia (escrow) até a conclusão do serviço (US13). A liberação
 * (`LIBERADO`) ocorre na confirmação de conclusão (US17) e compõe a carteira simulada do prestador.
 *
 * BIBLIOTECAS UTILIZADAS:
 * 1. Sequelize ORM (^6.37.3): Mapeamento Objeto-Relacional.
 *    Doc Oficial: https://sequelize.org/docs/v6/core-concepts/model-basics/
 */

import { Model, DataTypes, Optional } from 'sequelize';
import db from '../config/database';

export type StatusPagamentoCustodia = 'RETIDO' | 'LIBERADO' | 'REEMBOLSADO';
export type MetodoPagamentoCustodia = 'CARTAO_TESTE' | 'PIX_TESTE';

export interface TransacaoCustodiaAttributes {
  id: string;
  solicitacao_id: string;
  proposta_id: string;
  valor: number;
  status_pagamento: StatusPagamentoCustodia;
  metodo_pagamento: MetodoPagamentoCustodia;
  referencia_simulada: string;
  retido_em: Date;
  liberado_em?: Date | null;
  created_at?: Date;
  updated_at?: Date;
}

export interface TransacaoCustodiaCreationAttributes
  extends Optional<TransacaoCustodiaAttributes, 'id' | 'status_pagamento' | 'liberado_em'> {}

export class TransacaoCustodia
  extends Model<TransacaoCustodiaAttributes, TransacaoCustodiaCreationAttributes>
  implements TransacaoCustodiaAttributes
{
  public id!: string;
  public solicitacao_id!: string;
  public proposta_id!: string;
  public valor!: number;
  public status_pagamento!: StatusPagamentoCustodia;
  public metodo_pagamento!: MetodoPagamentoCustodia;
  public referencia_simulada!: string;
  public retido_em!: Date;
  public liberado_em?: Date | null;

  public readonly created_at!: Date;
  public readonly updated_at!: Date;
}

TransacaoCustodia.init(
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
    proposta_id: {
      type: DataTypes.UUID,
      allowNull: false,
      unique: true,
      references: { model: 'propostas', key: 'id' },
    },
    valor: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
    },
    status_pagamento: {
      type: DataTypes.ENUM('RETIDO', 'LIBERADO', 'REEMBOLSADO'),
      allowNull: false,
      defaultValue: 'RETIDO',
    },
    metodo_pagamento: {
      type: DataTypes.ENUM('CARTAO_TESTE', 'PIX_TESTE'),
      allowNull: false,
    },
    referencia_simulada: {
      type: DataTypes.STRING(120),
      allowNull: false,
      unique: true,
    },
    retido_em: {
      type: DataTypes.DATE,
      allowNull: false,
    },
    liberado_em: {
      type: DataTypes.DATE,
      allowNull: true,
    },
  },
  {
    sequelize: db,
    tableName: 'transacoes_custodia',
    timestamps: true,
    underscored: true,
  }
);

export default TransacaoCustodia;
