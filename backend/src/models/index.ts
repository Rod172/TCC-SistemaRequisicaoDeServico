/**
 * @file index.ts
 * @description Ponto de entrada centralizado para modelos e associações relacionais do Sequelize ORM.
 * 
 * BIBLIOTECAS UTILIZADAS:
 * 1. Sequelize ORM (^6.37.3): Mapeamento e Associações 1:1, 1:N.
 *    Doc Oficial: https://sequelize.org/docs/v6/core-concepts/assocs/
 */

import Usuario from './Usuario';
import PrestadorPerfil from './PrestadorPerfil';
import Solicitacao from './Solicitacao';
import Proposta from './Proposta';
import AnexoSolicitacao from './AnexoSolicitacao';

// Associação 1:1 entre Usuario e PrestadorPerfil
Usuario.hasOne(PrestadorPerfil, {
  foreignKey: 'usuario_id',
  as: 'perfil_prestador',
  onDelete: 'CASCADE',
});

PrestadorPerfil.belongsTo(Usuario, {
  foreignKey: 'usuario_id',
  as: 'usuario',
});

// Associação 1:N entre Usuario (Solicitante) e Solicitacao (US06)
Usuario.hasMany(Solicitacao, {
  foreignKey: 'solicitante_id',
  as: 'solicitacoes',
});

Solicitacao.belongsTo(Usuario, {
  foreignKey: 'solicitante_id',
  as: 'solicitante',
});

// Associação 1:N entre Solicitacao e Proposta (US11 / US12)
Solicitacao.hasMany(Proposta, {
  foreignKey: 'solicitacao_id',
  as: 'propostas',
});

Proposta.belongsTo(Solicitacao, {
  foreignKey: 'solicitacao_id',
  as: 'solicitacao',
});

// Associação 1:N entre Usuario (Prestador) e Proposta
Usuario.hasMany(Proposta, {
  foreignKey: 'prestador_id',
  as: 'propostas_enviadas',
});

Proposta.belongsTo(Usuario, {
  foreignKey: 'prestador_id',
  as: 'prestador',
});

// Associação 1:N entre Solicitacao e AnexoSolicitacao (US05)
Solicitacao.hasMany(AnexoSolicitacao, {
  foreignKey: 'solicitacao_id',
  as: 'anexos',
  onDelete: 'CASCADE',
});

AnexoSolicitacao.belongsTo(Solicitacao, {
  foreignKey: 'solicitacao_id',
  as: 'solicitacao',
});

export { Usuario, PrestadorPerfil, Solicitacao, Proposta, AnexoSolicitacao };
export default { Usuario, PrestadorPerfil, Solicitacao, Proposta, AnexoSolicitacao };
