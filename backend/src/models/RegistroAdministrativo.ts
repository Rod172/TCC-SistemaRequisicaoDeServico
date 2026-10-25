/**
 * US27: registro histórico inserido na mesma transação da ação administrativa.
 * Sequelize (^6.37.3): modelo tipado, JSON dos estados e vínculos persistentes.
 * Documentação oficial: https://sequelize.org/docs/v6/core-concepts/model-basics/
 */
import { DataTypes, Model, Optional } from 'sequelize';
import db from '../config/database';

export type AcaoAdministrativa = 'ATIVAR_USUARIO' | 'DESATIVAR_USUARIO' | 'RESOLVER_DENUNCIA';
interface RegistroAdministrativoAttributes {
  id: string;
  admin_id: string;
  usuario_id: string | null;
  denuncia_id: string | null;
  acao: AcaoAdministrativa;
  ocorrido_em: Date;
  estado_anterior: { ativo?: boolean; status?: string };
  estado_posterior: { ativo?: boolean; status?: string };
}
type CriarRegistro = Optional<RegistroAdministrativoAttributes, 'id' | 'usuario_id' | 'denuncia_id'>;

export class RegistroAdministrativo extends Model<RegistroAdministrativoAttributes, CriarRegistro>
  implements RegistroAdministrativoAttributes {
  public id!: string;
  public admin_id!: string;
  public usuario_id!: string | null;
  public denuncia_id!: string | null;
  public acao!: AcaoAdministrativa;
  public ocorrido_em!: Date;
  public estado_anterior!: RegistroAdministrativoAttributes['estado_anterior'];
  public estado_posterior!: RegistroAdministrativoAttributes['estado_posterior'];
}

RegistroAdministrativo.init({
  id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
  admin_id: { type: DataTypes.UUID, allowNull: false, references: { model: 'usuarios', key: 'id' }, onDelete: 'RESTRICT', onUpdate: 'CASCADE' },
  usuario_id: { type: DataTypes.UUID, allowNull: true, references: { model: 'usuarios', key: 'id' }, onDelete: 'RESTRICT', onUpdate: 'CASCADE' },
  denuncia_id: { type: DataTypes.UUID, allowNull: true, references: { model: 'denuncias', key: 'id' }, onDelete: 'RESTRICT', onUpdate: 'CASCADE' },
  acao: { type: DataTypes.ENUM('ATIVAR_USUARIO', 'DESATIVAR_USUARIO', 'RESOLVER_DENUNCIA'), allowNull: false },
  ocorrido_em: { type: DataTypes.DATE, allowNull: false },
  estado_anterior: { type: DataTypes.JSON, allowNull: false },
  estado_posterior: { type: DataTypes.JSON, allowNull: false },
}, { sequelize: db, tableName: 'registros_administrativos', timestamps: false });

export default RegistroAdministrativo;
