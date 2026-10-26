/**
 * @file denunciaService.ts
 * @description Serviço de denúncias de solicitações para moderação (US32) — qualquer participante da
 * solicitação (o Solicitante dono ou um Prestador que já enviou proposta nela) pode denunciar; a
 * listagem e a resolução ficam restritas ao Admin.
 *
 * BIBLIOTECAS UTILIZADAS:
 * 1. Sequelize ORM (^6.37.3): Consultas relacionais.
 *    Doc Oficial: https://sequelize.org/docs/v6/
 */

import { Solicitacao, Proposta, Usuario, Denuncia, RegistroAdministrativo } from '../models';
import sequelize from '../config/database';
import HttpError from '../utils/HttpError';

export class DenunciaService {
  async denunciar(solicitacaoId: string, denuncianteId: string, motivo: string) {
    const motivoTratado = (motivo || '').trim();
    if (motivoTratado.length < 5) {
      throw new HttpError(400, 'Informe um motivo com pelo menos 5 caracteres.');
    }

    const solicitacao = await Solicitacao.findByPk(solicitacaoId);
    if (!solicitacao) throw new HttpError(404, 'Solicitação não encontrada.');

    const ehSolicitanteDono = solicitacao.solicitante_id === denuncianteId;
    const temProposta = ehSolicitanteDono
      ? false
      : !!(await Proposta.findOne({ where: { solicitacao_id: solicitacaoId, prestador_id: denuncianteId } }));

    if (!ehSolicitanteDono && !temProposta) {
      throw new HttpError(403, 'Você não participa desta solicitação.');
    }

    const denuncia = await Denuncia.create({
      solicitacao_id: solicitacaoId,
      denunciante_id: denuncianteId,
      motivo: motivoTratado,
    });

    return { mensagem: 'Denúncia registrada. A administração vai revisar.', dados: denuncia.get({ plain: true }) };
  }

  async listarTodas() {
    const denuncias = await Denuncia.findAll({
      include: [
        { model: Solicitacao, as: 'solicitacao', attributes: ['id', 'titulo', 'status'] },
        { model: Usuario, as: 'denunciante', attributes: ['id', 'nome', 'email'] },
      ],
      order: [
        ['status', 'ASC'], // PENDENTE antes de RESOLVIDA
        ['created_at', 'DESC'],
      ],
    });

    return denuncias.map((d) => d.get({ plain: true }));
  }

  async resolver(denunciaId: string, adminId: string) {
    return sequelize.transaction(async (transaction) => {
      const denuncia = await Denuncia.findByPk(denunciaId, { transaction, lock: transaction.LOCK.UPDATE });
      if (!denuncia) throw new HttpError(404, 'Denúncia não encontrada.');
      if (denuncia.status !== 'RESOLVIDA') {
        const anterior = denuncia.status;
        await denuncia.update({ status: 'RESOLVIDA' }, { transaction });
        await RegistroAdministrativo.create({
          admin_id: adminId, denuncia_id: denunciaId, acao: 'RESOLVER_DENUNCIA', ocorrido_em: new Date(),
          estado_anterior: { status: anterior }, estado_posterior: { status: 'RESOLVIDA' },
        }, { transaction });
      }
      return { mensagem: 'Denúncia marcada como resolvida.' };
    });
  }
}

export default new DenunciaService();
