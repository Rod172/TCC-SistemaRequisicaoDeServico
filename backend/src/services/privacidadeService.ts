/** US40: atendimento ao titular em camadas; resposta não executa exclusão automática.
 * Sequelize 6: consultas e locks transacionais. https://sequelize.org/docs/v6/other-topics/transactions/ */
import sequelize from '../config/database';
import { Usuario } from '../models';
import SolicitacaoPrivacidade, { TIPOS_PRIVACIDADE } from '../models/SolicitacaoPrivacidade';
import HttpError from '../utils/HttpError';
function texto(valor: unknown, minimo: number) {
 if (typeof valor !== 'string' || valor.trim().length < minimo || valor.trim().length > 2000) throw new HttpError(400, `Informe um texto entre ${minimo} e 2000 caracteres.`);
 return valor.trim();
}
export default {
 async minhaCentral(usuarioId: string) {
  const usuario = await Usuario.findByPk(usuarioId, { attributes: ['termos_uso_versao','privacidade_versao','documentos_aceitos_em'] });
  if (!usuario) throw new HttpError(404, 'Conta não encontrada.');
  const solicitacoes = await SolicitacaoPrivacidade.findAll({ where: { usuario_id: usuarioId }, order: [['created_at','DESC']] });
  return { aceite: usuario.get({ plain: true }), solicitacoes };
 },
 async criar(usuarioId: string, tipo: unknown, descricao: unknown) {
  if (typeof tipo !== 'string' || !(TIPOS_PRIVACIDADE as readonly string[]).includes(tipo)) throw new HttpError(400, 'Tipo de solicitação de privacidade inválido.');
  const mensagem = texto(descricao, 10);
  return sequelize.transaction(async transaction => {
   const titular = await Usuario.findByPk(usuarioId, { transaction, lock: transaction.LOCK.UPDATE });
   if (!titular) throw new HttpError(404, 'Conta não encontrada.');
   if (await SolicitacaoPrivacidade.count({ where: { usuario_id: usuarioId, status: 'PENDENTE' }, transaction }) >= 5) throw new HttpError(409, 'Você já possui cinco protocolos pendentes. Aguarde a resposta ou utilize o contato por e-mail.');
   return SolicitacaoPrivacidade.create({ usuario_id: usuarioId, tipo, descricao: mensagem }, { transaction });
  });
 },
 async listarAdministracao(parametroPagina?: unknown) {
  const pagina = parametroPagina === undefined ? 1 : typeof parametroPagina === 'string' && /^[1-9][0-9]*$/.test(parametroPagina) ? Number(parametroPagina) : 0;
  if (!Number.isSafeInteger(pagina) || pagina < 1 || pagina > 100000) throw new HttpError(400, 'Página inválida.');
  const resultado = await SolicitacaoPrivacidade.findAndCountAll({ order: [['status','ASC'],['created_at','DESC']], limit: 50, offset: (pagina - 1) * 50 });
  const pedidos = resultado.rows;
  const ids = [...new Set(pedidos.map(p => p.usuario_id))];
  const titulares = ids.length ? await Usuario.findAll({ where: { id: ids }, attributes: ['id','nome','email'] }) : [];
  return { data: pedidos.map(p => ({ ...p.get({ plain: true }), titular: titulares.find(u => u.id === p.usuario_id)?.get({ plain: true }) })), paginacao: { pagina, total: resultado.count, total_paginas: Math.max(1, Math.ceil(resultado.count / 50)) } };
 },
 async responder(id: string, administradorId: string, resposta: unknown) {
  const mensagem = texto(resposta, 10);
  return sequelize.transaction(async transaction => {
   const pedido = await SolicitacaoPrivacidade.findByPk(id, { transaction, lock: transaction.LOCK.UPDATE });
   if (!pedido) throw new HttpError(404, 'Protocolo não encontrado.');
   if (pedido.status !== 'PENDENTE') throw new HttpError(409, 'Este protocolo já recebeu resposta. Abra outro protocolo para complementar o atendimento.');
   return pedido.update({ resposta: mensagem, status: 'RESPONDIDA', respondida_por: administradorId, respondida_em: new Date() }, { transaction });
  });
 }
};
