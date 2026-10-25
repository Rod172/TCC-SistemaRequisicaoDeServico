/**
 * US25: demonstração complementar, posterior ao seed original e às migrations.
 * Reutiliza os usuários originais sem recriar contas, senhas ou identificadores pessoais.
 * Sequelize (^6.37.3) / CLI (^6.6.2): SQL parametrizado, transações e inserções idempotentes.
 * Documentação oficial: https://sequelize.org/docs/v6/other-topics/migrations/
 * Documentação oficial: https://sequelize.org/docs/v6/core-concepts/transactions/
 */
'use strict';

const { QueryTypes } = require('sequelize');

// IDs dos usuários e perfis definidos em 20260901000001-demo-solicitacoes.js.
const USUARIOS = {
  solicitante: 'd0000000-0000-4000-8000-000000000001',
  eletricista: 'd0000000-0000-4000-8000-000000000002',
  encanadora: 'd0000000-0000-4000-8000-000000000003',
  admin: 'd0000000-0000-4000-8000-00000000000a',
};
const IDS = {
  concluida: 'd1000000-0000-4000-8000-000000000001',
  propostaConcluida: 'd1000000-0000-4000-8000-000000000002',
  custodia: 'd1000000-0000-4000-8000-000000000003',
  avaliacao: 'd1000000-0000-4000-8000-000000000004',
  mensagemSolicitante: 'd1000000-0000-4000-8000-000000000005',
  mensagemPrestador: 'd1000000-0000-4000-8000-000000000006',
  notificacaoPrestador: 'd1000000-0000-4000-8000-000000000007',
  preferencia: 'd1000000-0000-4000-8000-000000000008',
  moderacao: 'd1000000-0000-4000-8000-000000000009',
  propostaModeracao: 'd1000000-0000-4000-8000-00000000000a',
  pergunta: 'd1000000-0000-4000-8000-00000000000b',
  denuncia: 'd1000000-0000-4000-8000-00000000000c',
  notificacaoAdmin: 'd1000000-0000-4000-8000-00000000000d',
};

// Mais quatro conclusões, junto à luminária, sustentam a média real de 4,80.
const HISTORICO = [5, 5, 5, 4].map((nota, indice) => {
  const id = campo => `d1000000-0000-4000-8000-${String(100 + indice * 4 + campo).padStart(12, '0')}`;
  return { solicitacao: id(0), proposta: id(1), custodia: id(2), avaliacao: id(3), nota };
});

async function inserirSeAusente(qi, tabela, registro, transaction) {
  // tabela é sempre uma constante interna; valores externos nunca compõem o SQL.
  const existentes = await qi.sequelize.query(`SELECT id FROM \`${tabela}\` WHERE id = :id`, {
    replacements: { id: registro.id }, type: QueryTypes.SELECT, transaction,
  });
  if (!existentes.length) await qi.bulkInsert(tabela, [registro], { transaction });
}

async function recalcularReputacoes(qi, transaction) {
  // Recalcula também avaliações externas ao seed: down nunca zera reputação legítima.
  await qi.sequelize.query(`
    UPDATE prestadores_perfil p
    SET p.nota_media_reputacao = COALESCE((
      SELECT ROUND(AVG(a.nota), 2) FROM avaliacoes a WHERE a.prestador_id = p.usuario_id
    ), 0), p.total_avaliacoes = (
      SELECT COUNT(*) FROM avaliacoes a WHERE a.prestador_id = p.usuario_id
    )
    WHERE p.usuario_id IN (:prestadores)
  `, { replacements: { prestadores: [USUARIOS.eletricista, USUARIOS.encanadora] }, transaction });
}

module.exports = {
  async up(qi) {
    await qi.sequelize.transaction(async transaction => {
      const usuarios = await qi.sequelize.query('SELECT id FROM usuarios WHERE id IN (:ids)', {
        replacements: { ids: Object.values(USUARIOS) }, type: QueryTypes.SELECT, transaction,
      });
      if (usuarios.length !== 4) throw new Error('Execute primeiro o seeder original de demonstração; usuários esperados não encontrados.');

      const agora = new Date();
      const antes = minutos => new Date(agora.getTime() - minutos * 60000);
      const validade = criacao => new Date(criacao.getTime() + 7 * 24 * 60 * 60 * 1000);
      const inserir = (tabela, registro) => inserirSeAusente(qi, tabela, registro, transaction);
      const datas = { created_at: antes(120), updated_at: agora };

      await inserir('solicitacoes', {
        id: IDS.concluida, solicitante_id: USUARIOS.solicitante,
        titulo: 'Demonstração: instalação de luminária concluída',
        descricao: 'Instalação de luminária residencial, testada e aprovada pela solicitante.',
        categoria: 'Elétrica', cidade: 'São Paulo', bairro: 'Pinheiros',
        orcamento_cliente: 180, status: 'CONCLUIDA', ...datas,
      });
      await inserir('propostas', {
        id: IDS.propostaConcluida, solicitacao_id: IDS.concluida, prestador_id: USUARIOS.eletricista,
        valor: 180, prazo_dias: 1, mensagem: 'Instalação com teste de funcionamento e garantia.',
        validade_ate: validade(antes(110)),
        status: 'ACEITA', created_at: antes(110), updated_at: antes(100),
      });
      await inserir('transacoes_custodia', {
        id: IDS.custodia, solicitacao_id: IDS.concluida, proposta_id: IDS.propostaConcluida,
        valor: 180, status_pagamento: 'LIBERADO', metodo_pagamento: 'PIX_TESTE',
        referencia_simulada: 'DEMO-US25-LUMINARIA-LIBERADO',
        retido_em: antes(100), liberado_em: antes(20), created_at: antes(100), updated_at: antes(20),
      });
      await inserir('mensagens_chat', {
        id: IDS.mensagemSolicitante, solicitacao_id: IDS.concluida, proposta_id: IDS.propostaConcluida,
        emissor_id: USUARIOS.solicitante, conteudo: 'Proposta aceita. Podemos realizar a instalação hoje?',
        lida: true, created_at: antes(95), updated_at: antes(90),
      });
      await inserir('mensagens_chat', {
        id: IDS.mensagemPrestador, solicitacao_id: IDS.concluida, proposta_id: IDS.propostaConcluida,
        emissor_id: USUARIOS.eletricista, conteudo: 'Instalação finalizada e testada. Obrigado pela confiança!',
        lida: true, created_at: antes(25), updated_at: antes(20),
      });
      await inserir('avaliacoes', {
        id: IDS.avaliacao, solicitacao_id: IDS.concluida, solicitante_id: USUARIOS.solicitante,
        prestador_id: USUARIOS.eletricista, nota: 5,
        comentario: 'Serviço concluído com pontualidade e cuidado. Luminária funcionando perfeitamente.',
        created_at: antes(15), updated_at: antes(15),
      });
      await inserir('notificacoes', {
        id: IDS.notificacaoPrestador, usuario_id: USUARIOS.eletricista,
        titulo: 'Proposta aceita', mensagem: 'Sua proposta de instalação de luminária foi aceita pela solicitante.',
        link_redirecionamento: `/oportunidades/${IDS.concluida}`, lida: true,
        created_at: antes(100), updated_at: antes(95),
      });

      for (const [indice, item] of HISTORICO.entries()) {
        const criacao = antes(240 + indice * 120);
        const aceite = new Date(criacao.getTime() + 10 * 60000);
        const conclusao = new Date(criacao.getTime() + 60 * 60000);
        const avaliacao = new Date(conclusao.getTime() + 5 * 60000);
        await inserir('solicitacoes', {
          id: item.solicitacao, solicitante_id: USUARIOS.solicitante,
          titulo: `Demonstração: manutenção elétrica concluída ${indice + 1}`,
          descricao: 'Reparo elétrico residencial concluído e avaliado pela solicitante.',
          categoria: 'Elétrica', cidade: 'São Paulo', bairro: 'Pinheiros',
          orcamento_cliente: 100, status: 'CONCLUIDA', created_at: criacao, updated_at: conclusao,
        });
        await inserir('propostas', {
          id: item.proposta, solicitacao_id: item.solicitacao, prestador_id: USUARIOS.eletricista,
          valor: 100, prazo_dias: 1, mensagem: 'Manutenção elétrica com teste e garantia.',
          status: 'ACEITA', validade_ate: validade(criacao), created_at: criacao, updated_at: aceite,
        });
        await inserir('transacoes_custodia', {
          id: item.custodia, solicitacao_id: item.solicitacao, proposta_id: item.proposta,
          valor: 100, status_pagamento: 'LIBERADO', metodo_pagamento: 'PIX_TESTE',
          referencia_simulada: `DEMO-US25-HISTORICO-${indice + 1}`,
          retido_em: aceite, liberado_em: conclusao, created_at: aceite, updated_at: conclusao,
        });
        await inserir('avaliacoes', {
          id: item.avaliacao, solicitacao_id: item.solicitacao, solicitante_id: USUARIOS.solicitante,
          prestador_id: USUARIOS.eletricista, nota: item.nota,
          comentario: item.nota === 4 ? 'Bom serviço; houve pequeno atraso na chegada.' : 'Serviço bem executado e entregue conforme combinado.',
          created_at: avaliacao, updated_at: avaliacao,
        });
      }

      // Não substitui uma preferência que a pessoa já tenha configurado.
      const preferencias = await qi.sequelize.query(
        'SELECT id FROM preferencias_notificacao WHERE usuario_id = :usuario AND tipo_evento = :evento',
        { replacements: { usuario: USUARIOS.encanadora, evento: 'NOVA_MENSAGEM_CHAT' }, type: QueryTypes.SELECT, transaction },
      );
      if (!preferencias.length) await inserir('preferencias_notificacao', {
        id: IDS.preferencia, usuario_id: USUARIOS.encanadora, tipo_evento: 'NOVA_MENSAGEM_CHAT', ativo: false, ...datas,
      });

      // Caso separado: a denúncia não conflita com o serviço concluído bem avaliado.
      await inserir('solicitacoes', {
        id: IDS.moderacao, solicitante_id: USUARIOS.solicitante,
        titulo: 'Demonstração: revisão de vazamento em análise',
        descricao: 'Revisar vazamento da pia. Escopo adicional discutido nas perguntas públicas.',
        categoria: 'Encanamento', cidade: 'São Paulo', bairro: 'Pinheiros',
        orcamento_cliente: 250, status: 'EM_NEGOCIACAO', ...datas,
      });
      await inserir('perguntas_solicitacao', {
        id: IDS.pergunta, solicitacao_id: IDS.moderacao, prestador_id: USUARIOS.encanadora,
        pergunta: 'O reparo inclui apenas o sifão ou também a tubulação interna?',
        resposta: 'Também será necessário abrir a parede e substituir a tubulação interna.',
        respondida_em: antes(90), created_at: antes(100), updated_at: antes(90),
      });
      await inserir('propostas', {
        id: IDS.propostaModeracao, solicitacao_id: IDS.moderacao, prestador_id: USUARIOS.encanadora,
        valor: 250, prazo_dias: 2, mensagem: 'Orçamento inicial para o sifão, sujeito à confirmação do escopo.',
        validade_ate: validade(antes(110)),
        status: 'ENVIADA', created_at: antes(110), updated_at: antes(110),
      });
      await inserir('denuncias', {
        id: IDS.denuncia, solicitacao_id: IDS.moderacao, denunciante_id: USUARIOS.encanadora,
        motivo: 'Demonstração de moderação: escopo informado na resposta difere do reparo inicialmente anunciado; solicito revisão.',
        status: 'PENDENTE', created_at: antes(80), updated_at: antes(80),
      });
      await inserir('notificacoes', {
        id: IDS.notificacaoAdmin, usuario_id: USUARIOS.admin,
        titulo: 'Denúncia de demonstração pendente', mensagem: 'Revise a divergência de escopo relatada na solicitação de vazamento.',
        link_redirecionamento: '/admin', lida: false, created_at: antes(80), updated_at: antes(80),
      });
      await recalcularReputacoes(qi, transaction);
    });
  },

  async down(qi) {
    await qi.sequelize.transaction(async transaction => {
      // Ordem inversa das dependências; exclui somente IDs pertencentes a este seed.
      const remover = (tabela, ids) => qi.bulkDelete(tabela, { id: ids }, { transaction });
      await remover('notificacoes', [IDS.notificacaoPrestador, IDS.notificacaoAdmin]);
      await remover('preferencias_notificacao', [IDS.preferencia]);
      await remover('denuncias', [IDS.denuncia]);
      await remover('perguntas_solicitacao', [IDS.pergunta]);
      await remover('avaliacoes', [IDS.avaliacao, ...HISTORICO.map(item => item.avaliacao)]);
      await remover('mensagens_chat', [IDS.mensagemSolicitante, IDS.mensagemPrestador]);
      await remover('transacoes_custodia', [IDS.custodia, ...HISTORICO.map(item => item.custodia)]);
      await remover('propostas', [IDS.propostaConcluida, IDS.propostaModeracao, ...HISTORICO.map(item => item.proposta)]);
      await remover('solicitacoes', [IDS.concluida, IDS.moderacao, ...HISTORICO.map(item => item.solicitacao)]);
      await recalcularReputacoes(qi, transaction);
    });
  },
};
