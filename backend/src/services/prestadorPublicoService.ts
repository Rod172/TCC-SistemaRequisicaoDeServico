/**
 * Perfil público do prestador (US19), sem dados cadastrais privados.
 * Sequelize (^6.37.3): projeções públicas, agregações e associações existentes.
 * Documentação oficial: https://sequelize.org/docs/v6/core-concepts/model-querying-basics/
 */
import { col, fn, Op } from 'sequelize';
import { Avaliacao, PrestadorPerfil, Proposta, Solicitacao, Usuario } from '../models';
import HttpError from '../utils/HttpError';

function inteiroLimitado(valor: unknown, padrao: number, maximo: number, campo: string): number {
  if (valor === undefined) return padrao;
  if (typeof valor !== 'string' || !/^[1-9]\d*$/.test(valor)) {
    throw new HttpError(400, `${campo} deve ser um inteiro positivo.`);
  }
  const numero = Number(valor);
  if (!Number.isSafeInteger(numero) || numero > maximo) {
    throw new HttpError(400, `${campo} deve ser no máximo ${maximo}.`);
  }
  return numero;
}

export class PrestadorPublicoService {
  async buscarPerfilPublico(id: string, paginaInformada?: unknown, limiteInformado?: unknown) {
    if (!/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(id)) {
      throw new HttpError(400, 'Identificador do prestador inválido.');
    }
    const pagina = inteiroLimitado(paginaInformada, 1, 10000, 'Página');
    const limite = inteiroLimitado(limiteInformado, 10, 50, 'Limite');
    const usuario = await Usuario.findOne({
      where: { id, ativo: true, tipo_perfil: 'PRESTADOR' },
      attributes: ['id', 'nome', 'foto_url'],
    });
    if (!usuario) throw new HttpError(404, 'Prestador não encontrado.');

    const [perfil, reputacao, totalServicos, avaliacoes] = await Promise.all([
      PrestadorPerfil.findOne({ where: { usuario_id: id }, attributes: ['descricao_bio', 'categorias'] }),
      Avaliacao.findOne({
        where: { prestador_id: id },
        attributes: [[fn('AVG', col('nota')), 'media'], [fn('COUNT', col('id')), 'total']],
        raw: true,
      }),
      Solicitacao.count({
        where: { status: 'CONCLUIDA' },
        distinct: true,
        col: 'id',
        include: [{ model: Proposta, as: 'propostas', attributes: [], required: true,
          where: { prestador_id: id, status: 'ACEITA' } }],
      }),
      Avaliacao.findAll({
        where: { prestador_id: id },
        attributes: ['id', 'nota', 'comentario', 'created_at', 'solicitante_id'],
        order: [['created_at', 'DESC'], ['id', 'DESC']],
        limit: limite,
        offset: (pagina - 1) * limite,
      }),
    ]);
    // Não existe associação de Avaliacao ao avaliador; consulta limitada aos autores da página.
    const autores = avaliacoes.length ? await Usuario.findAll({
      where: { id: { [Op.in]: [...new Set(avaliacoes.map(avaliacao => avaliacao.solicitante_id))] } },
      attributes: ['id', 'nome'],
    }) : [];
    const nomes = new Map(autores.map(autor => [autor.id, autor.nome]));
    const resumo = reputacao as unknown as { media: string | number | null; total: string | number } | null;
    const totalAvaliacoes = Number(resumo?.total || 0);
    return {
      id: usuario.id,
      nome: usuario.nome,
      foto_url: usuario.foto_url || null,
      descricao_bio: perfil?.descricao_bio || null,
      categorias: perfil?.categorias || [],
      nota_media_reputacao: Number(Number(resumo?.media || 0).toFixed(2)),
      total_avaliacoes: totalAvaliacoes,
      total_servicos_concluidos: totalServicos,
      avaliacoes: avaliacoes.map(avaliacao => ({
        id: avaliacao.id, nota: avaliacao.nota, comentario: avaliacao.comentario || null,
        // A projeção usa o nome da coluna; o getter automático é createdAt no Sequelize.
        created_at: avaliacao.get('created_at'),
        nome_avaliador: nomes.get(avaliacao.solicitante_id) || 'Cliente indisponível',
      })),
      paginacao: { pagina, limite, total: totalAvaliacoes, total_paginas: Math.ceil(totalAvaliacoes / limite) },
    };
  }
}

export default new PrestadorPublicoService();
