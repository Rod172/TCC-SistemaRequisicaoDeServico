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
import Notificacao from './Notificacao';
import TransacaoCustodia from './TransacaoCustodia';
import MensagemChat from './MensagemChat';
import PerguntaSolicitacao from './PerguntaSolicitacao';
import PreferenciaNotificacao from './PreferenciaNotificacao';
import Denuncia from './Denuncia';
import Avaliacao from './Avaliacao';

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

// Associação 1:N entre Usuario e Notificacao (US07 - aviso de cancelamento aos prestadores)
Usuario.hasMany(Notificacao, {
  foreignKey: 'usuario_id',
  as: 'notificacoes',
});

Notificacao.belongsTo(Usuario, {
  foreignKey: 'usuario_id',
  as: 'usuario',
});

// Associação 1:1 entre Solicitacao/Proposta e TransacaoCustodia (US13 - retenção simulada em escrow)
Solicitacao.hasOne(TransacaoCustodia, {
  foreignKey: 'solicitacao_id',
  as: 'transacao_custodia',
});

TransacaoCustodia.belongsTo(Solicitacao, {
  foreignKey: 'solicitacao_id',
  as: 'solicitacao',
});

Proposta.hasOne(TransacaoCustodia, {
  foreignKey: 'proposta_id',
  as: 'transacao_custodia',
});

TransacaoCustodia.belongsTo(Proposta, {
  foreignKey: 'proposta_id',
  as: 'proposta',
});

// Associação 1:N entre Solicitacao e MensagemChat (US14 - chat privado da contratação)
Solicitacao.hasMany(MensagemChat, {
  foreignKey: 'solicitacao_id',
  as: 'mensagens_chat',
  onDelete: 'CASCADE',
});

MensagemChat.belongsTo(Solicitacao, {
  foreignKey: 'solicitacao_id',
  as: 'solicitacao',
});

// Associação 1:N entre Proposta e MensagemChat (US34 — chat por proposta, não mais só por solicitação,
// pra permitir vários prestadores concorrentes conversando com o mesmo solicitante em salas separadas).
Proposta.hasMany(MensagemChat, {
  foreignKey: 'proposta_id',
  as: 'mensagens_chat',
  onDelete: 'CASCADE',
});

MensagemChat.belongsTo(Proposta, {
  foreignKey: 'proposta_id',
  as: 'proposta',
});

Usuario.hasMany(MensagemChat, {
  foreignKey: 'emissor_id',
  as: 'mensagens_enviadas',
});

MensagemChat.belongsTo(Usuario, {
  foreignKey: 'emissor_id',
  as: 'emissor',
});

// Associação 1:N entre Solicitacao e PerguntaSolicitacao (US29 - Q&A público na oportunidade)
Solicitacao.hasMany(PerguntaSolicitacao, {
  foreignKey: 'solicitacao_id',
  as: 'perguntas',
  onDelete: 'CASCADE',
});

PerguntaSolicitacao.belongsTo(Solicitacao, {
  foreignKey: 'solicitacao_id',
  as: 'solicitacao',
});

Usuario.hasMany(PerguntaSolicitacao, {
  foreignKey: 'prestador_id',
  as: 'perguntas_feitas',
});

PerguntaSolicitacao.belongsTo(Usuario, {
  foreignKey: 'prestador_id',
  as: 'prestador',
});

// Associação 1:N entre Usuario e PreferenciaNotificacao (US30 - configurações de notificação)
Usuario.hasMany(PreferenciaNotificacao, {
  foreignKey: 'usuario_id',
  as: 'preferencias_notificacao',
  onDelete: 'CASCADE',
});

PreferenciaNotificacao.belongsTo(Usuario, {
  foreignKey: 'usuario_id',
  as: 'usuario',
});

// Associações da Denuncia (US32 - moderação)
Solicitacao.hasMany(Denuncia, {
  foreignKey: 'solicitacao_id',
  as: 'denuncias',
  onDelete: 'CASCADE',
});

Denuncia.belongsTo(Solicitacao, {
  foreignKey: 'solicitacao_id',
  as: 'solicitacao',
});

Usuario.hasMany(Denuncia, {
  foreignKey: 'denunciante_id',
  as: 'denuncias_feitas',
});

Denuncia.belongsTo(Usuario, {
  foreignKey: 'denunciante_id',
  as: 'denunciante',
});

// Associações da Avaliacao (US18 - avaliação de satisfação e reputação do prestador)
Solicitacao.hasOne(Avaliacao, {
  foreignKey: 'solicitacao_id',
  as: 'avaliacao',
  onDelete: 'CASCADE',
});

Avaliacao.belongsTo(Solicitacao, {
  foreignKey: 'solicitacao_id',
  as: 'solicitacao',
});

Usuario.hasMany(Avaliacao, {
  foreignKey: 'prestador_id',
  as: 'avaliacoes_recebidas',
});

Avaliacao.belongsTo(Usuario, {
  foreignKey: 'prestador_id',
  as: 'prestador',
});

export {
  Usuario,
  PrestadorPerfil,
  Solicitacao,
  Proposta,
  AnexoSolicitacao,
  Notificacao,
  TransacaoCustodia,
  MensagemChat,
  PerguntaSolicitacao,
  PreferenciaNotificacao,
  Denuncia,
  Avaliacao,
};
export default {
  Usuario,
  PrestadorPerfil,
  Solicitacao,
  Proposta,
  AnexoSolicitacao,
  Notificacao,
  TransacaoCustodia,
  MensagemChat,
  PerguntaSolicitacao,
  PreferenciaNotificacao,
  Denuncia,
  Avaliacao,
};
