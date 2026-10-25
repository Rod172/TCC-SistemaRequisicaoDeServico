/**
 * Indicadores pessoais das US20/US21 e carteira simulada da US13.
 * Sequelize (^6.37.3): filtros, junções e agregações sem carregar listas completas.
 * Documentação oficial: https://sequelize.org/docs/v6/core-concepts/model-querying-basics/
 */
import { Op, fn, col } from 'sequelize';
import { Solicitacao, Proposta, Avaliacao, TransacaoCustodia } from '../models';

export interface DashboardSolicitanteDTO {
  servicos_abertos: number;
  propostas_pendentes: number;
  servicos_em_andamento: number;
  servicos_concluidos: number;
}

export interface DashboardPrestadorDTO {
  propostas_enviadas_mes: number;
  propostas_aceitas_mes: number;
  taxa_conversao: number;
  nota_reputacao: number | null;
  total_avaliacoes: number;
  saldo_liberado: number;
  valor_em_custodia: number;
  periodo: { inicio: string; fim_exclusivo: string; referencia: string };
}

// SUM(DECIMAL) retorna texto no MySQL. Converte as partes diretamente em centavos
// inteiros antes de produzir o valor em reais, sem somar valores em ponto flutuante.
export function normalizarSomaMonetaria(valor: string | number | null): number {
  const partes = /^(\d+)(?:\.(\d{1,2}))?$/.exec(String(valor ?? '0'));
  if (!partes) throw new Error('Valor inválido na soma da carteira simulada.');
  const centavos = Number(partes[1]) * 100 + Number((partes[2] ?? '').padEnd(2, '0'));
  if (!Number.isSafeInteger(centavos)) throw new Error('Soma da carteira simulada excede o limite de precisão.');
  return centavos / 100;
}

// O período segue o calendário de São Paulo, independentemente do fuso do servidor.
// As fronteiras locais (UTC-03:00) são convertidas em instantes para o banco.
export function periodoMensal(agora: Date) {
  const partes = new Intl.DateTimeFormat('pt-BR', {
    timeZone: 'America/Sao_Paulo', year: 'numeric', month: '2-digit',
  }).formatToParts(agora);
  const ano = Number(partes.find(p => p.type === 'year')!.value);
  const mes = Number(partes.find(p => p.type === 'month')!.value);
  return {
    inicio: new Date(Date.UTC(ano, mes - 1, 1, 3)),
    fim: new Date(Date.UTC(ano, mes, 1, 3)),
  };
}

export class DashboardService {
  async solicitante(usuarioId: string): Promise<DashboardSolicitanteDTO> {
    const [abertos, pendentes, andamento, concluidos] = await Promise.all([
      Solicitacao.count({ where: { solicitante_id: usuarioId, status: { [Op.in]: ['ABERTA', 'EM_NEGOCIACAO'] } } }),
      // "Pendentes" corresponde aos estados persistidos ENVIADA e EM_ANALISE.
      Proposta.count({
        where: { status: { [Op.in]: ['ENVIADA', 'EM_ANALISE'] } },
        include: [{ model: Solicitacao, as: 'solicitacao', required: true, attributes: [], where: { solicitante_id: usuarioId } }],
      }),
      Solicitacao.count({ where: { solicitante_id: usuarioId, status: 'CONTRATADA' } }),
      Solicitacao.count({ where: { solicitante_id: usuarioId, status: 'CONCLUIDA' } }),
    ]);
    return { servicos_abertos: abertos, propostas_pendentes: pendentes, servicos_em_andamento: andamento, servicos_concluidos: concluidos };
  }

  async prestador(usuarioId: string, agora = new Date()): Promise<DashboardPrestadorDTO> {
    const { inicio, fim } = periodoMensal(agora);
    // Sequelize usa createdAt como atributo e o mapeia para created_at no SQL.
    const filtroMensal = { prestador_id: usuarioId, createdAt: { [Op.gte]: inicio, [Op.lt]: fim } };
    // Uma única agregação garante que numerador e denominador pertençam ao mesmo conjunto.
    const [grupos, reputacao, custodia] = await Promise.all([
      Proposta.findAll({
        where: filtroMensal,
        attributes: ['status', [fn('COUNT', col('id')), 'total']], group: ['status'], raw: true,
      }),
      Avaliacao.findOne({
        where: { prestador_id: usuarioId },
        attributes: [[fn('AVG', col('nota')), 'media'], [fn('COUNT', col('id')), 'total']], raw: true,
      }),
      // Carteira acumulada de todos os períodos. A custódia aponta para a proposta
      // atual, inclusive após recontratação; REEMBOLSADO não compõe nenhum saldo.
      TransacaoCustodia.findAll({
        where: { status_pagamento: { [Op.in]: ['RETIDO', 'LIBERADO'] } },
        include: [{ model: Proposta, as: 'proposta', required: true, attributes: [], where: { prestador_id: usuarioId } }],
        attributes: ['status_pagamento', [fn('SUM', col('TransacaoCustodia.valor')), 'total']],
        group: ['TransacaoCustodia.status_pagamento'], raw: true,
      }),
    ]);
    const contagens = grupos as unknown as { status: string; total: string | number }[];
    const enviadas = contagens.reduce((soma, grupo) => soma + Number(grupo.total), 0);
    const aceitas = Number(contagens.find(grupo => grupo.status === 'ACEITA')?.total ?? 0);
    const notas = reputacao as unknown as { media: string | number | null; total: string | number } | null;
    const saldos = custodia as unknown as { status_pagamento: string; total: string | number | null }[];
    const saldo = (status: string) => normalizarSomaMonetaria(saldos.find(grupo => grupo.status_pagamento === status)?.total ?? null);
    const formatar = (data: Date) => data.toLocaleDateString('pt-BR', { timeZone: 'America/Sao_Paulo' });
    return {
      propostas_enviadas_mes: enviadas,
      propostas_aceitas_mes: aceitas,
      taxa_conversao: enviadas === 0 ? 0 : Number((aceitas / enviadas * 100).toFixed(2)),
      nota_reputacao: notas?.media == null ? null : Number(Number(notas.media).toFixed(2)),
      total_avaliacoes: Number(notas?.total ?? 0),
      saldo_liberado: saldo('LIBERADO'),
      valor_em_custodia: saldo('RETIDO'),
      periodo: {
        inicio: formatar(inicio), fim_exclusivo: formatar(fim),
        referencia: agora.toLocaleDateString('pt-BR', { month: 'long', year: 'numeric', timeZone: 'America/Sao_Paulo' }),
      },
    };
  }
}

export default new DashboardService();
