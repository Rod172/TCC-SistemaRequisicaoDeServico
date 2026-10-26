/** Sequelize 6: protocolos de atendimento ao titular (US40).
 * Documentação oficial: https://sequelize.org/docs/v6/core-concepts/model-basics/ */
import { Model, DataTypes } from 'sequelize';
import db from '../config/database';
export const TIPOS_PRIVACIDADE = ['ACESSO','CORRECAO','EXCLUSAO','INFORMACAO','REVOGACAO'] as const;
export class SolicitacaoPrivacidade extends Model {
 declare id: string;
 declare usuario_id: string;
 declare tipo: string;
 declare descricao: string;
 declare status: 'PENDENTE' | 'RESPONDIDA';
 declare resposta: string | null;
 declare respondida_por: string | null;
 declare respondida_em: Date | null;
}
SolicitacaoPrivacidade.init({
 id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
 usuario_id: { type: DataTypes.UUID, allowNull: false },
 tipo: { type: DataTypes.ENUM(...TIPOS_PRIVACIDADE), allowNull: false },
 descricao: { type: DataTypes.TEXT, allowNull: false },
 status: { type: DataTypes.ENUM('PENDENTE','RESPONDIDA'), defaultValue: 'PENDENTE', allowNull: false },
 resposta: { type: DataTypes.TEXT, allowNull: true },
 respondida_por: { type: DataTypes.UUID, allowNull: true },
 respondida_em: { type: DataTypes.DATE, allowNull: true },
}, { sequelize: db, tableName: 'solicitacoes_privacidade', timestamps: true, underscored: true });
export default SolicitacaoPrivacidade;
