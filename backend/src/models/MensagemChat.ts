/**
 * @file MensagemChat.ts
 * @description Modelo relacional do Sequelize em TypeScript representando uma mensagem trocada no chat
 * privado entre o Solicitante e o Prestador contratado de uma solicitação (US14), com suporte a um
 * anexo opcional de imagem ou PDF por mensagem (US15).
 *
 * BIBLIOTECAS UTILIZADAS:
 * 1. Sequelize ORM (^6.37.3): Mapeamento Objeto-Relacional.
 *    Doc Oficial: https://sequelize.org/docs/v6/core-concepts/model-basics/
 */

import { Model, DataTypes, Optional } from 'sequelize';
import db from '../config/database';

export interface MensagemChatAttributes {
  id: string;
  solicitacao_id: string;
  proposta_id?: string | null;
  emissor_id: string;
  conteudo?: string | null;
  anexo_url?: string | null;
  anexo_nome_original?: string | null;
  lida: boolean;
  created_at?: Date;
  updated_at?: Date;
}

export interface MensagemChatCreationAttributes
  extends Optional<MensagemChatAttributes, 'id' | 'lida' | 'conteudo' | 'anexo_url' | 'anexo_nome_original' | 'proposta_id'> {}

export class MensagemChat
  extends Model<MensagemChatAttributes, MensagemChatCreationAttributes>
  implements MensagemChatAttributes
{
  public id!: string;
  public solicitacao_id!: string;
  public proposta_id?: string | null;
  public emissor_id!: string;
  public conteudo?: string | null;
  public anexo_url?: string | null;
  public anexo_nome_original?: string | null;
  public lida!: boolean;

  public readonly created_at!: Date;
  public readonly updated_at!: Date;
}

MensagemChat.init(
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
    proposta_id: {
      type: DataTypes.UUID,
      allowNull: true,
      references: { model: 'propostas', key: 'id' },
    },
    emissor_id: {
      type: DataTypes.UUID,
      allowNull: false,
      references: { model: 'usuarios', key: 'id' },
    },
    conteudo: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    anexo_url: {
      type: DataTypes.STRING(500),
      allowNull: true,
    },
    anexo_nome_original: {
      type: DataTypes.STRING(255),
      allowNull: true,
    },
    lida: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false,
    },
  },
  {
    sequelize: db,
    tableName: 'mensagens_chat',
    timestamps: true,
    underscored: true,
  }
);

export default MensagemChat;
