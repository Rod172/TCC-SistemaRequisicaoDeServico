/**
 * @file 20260901000001-demo-solicitacoes.js
 * @description Seeder de demonstração para a banca do TCC: cria 1 solicitante, 2 prestadores, 1 admin e
 * solicitações em estágios diferentes (EM_NEGOCIACAO com propostas para comparar, EM_NEGOCIACAO com
 * contraproposta e CONTRATADA já aceita), cobrindo US06, US08-US12 sem depender de cadastro manual.
 *
 * BIBLIOTECAS UTILIZADAS:
 * 1. Sequelize CLI (^6.6.2): Automação de Seeders via `queryInterface.bulkInsert`.
 *    Doc Oficial: https://github.com/sequelize/cli
 * 2. BcryptJS (^2.4.3): Hash das senhas de demonstração.
 *    Doc Oficial: https://github.com/dcodeIO/bcrypt.js
 * 3. crypto (Node.js nativo): Geração de UUIDs fixos para os registros de demonstração.
 */

'use strict';

const bcrypt = require('bcryptjs');
const crypto = require('crypto');

const SENHA_DEMO = 'Demo@123';

const IDS = {
  solicitante: 'd0000000-0000-4000-8000-000000000001',
  prestadorEletrica: 'd0000000-0000-4000-8000-000000000002',
  prestadorEncanamento: 'd0000000-0000-4000-8000-000000000003',
  admin: 'd0000000-0000-4000-8000-00000000000a',
  perfilEletrica: 'd0000000-0000-4000-8000-000000000004',
  perfilEncanamento: 'd0000000-0000-4000-8000-000000000005',
  solicitacaoAberta: 'd0000000-0000-4000-8000-000000000006',
  solicitacaoNegociacao: 'd0000000-0000-4000-8000-000000000007',
  solicitacaoContratada: 'd0000000-0000-4000-8000-000000000008',
  solicitacaoAberta2: 'd0000000-0000-4000-8000-000000000009',
};

module.exports = {
  up: async (queryInterface) => {
    const senhaHash = await bcrypt.hash(SENHA_DEMO, 10);
    const agora = new Date();
    const validadeAte = new Date(agora.getTime() + 7 * 24 * 60 * 60 * 1000);

    await queryInterface.bulkInsert('usuarios', [
      {
        id: IDS.solicitante,
        nome: 'Ana Demonstração (Solicitante)',
        email: 'demo.solicitante@servicofacil.com',
        cpf: '00000000001',
        telefone: '11900000001',
        endereco: 'Rua da Demonstração, 100 - São Paulo, SP',
        senha_hash: senhaHash,
        tipo_perfil: 'SOLICITANTE',
        termo_lgpd_aceito: true,
        termo_lgpd_aceito_em: agora,
        ativo: true,
        created_at: agora,
        updated_at: agora,
      },
      {
        id: IDS.prestadorEletrica,
        nome: 'João Elétrica Demo',
        email: 'demo.prestador.eletrica@servicofacil.com',
        cpf: '00000000002',
        telefone: '11900000002',
        senha_hash: senhaHash,
        tipo_perfil: 'PRESTADOR',
        termo_lgpd_aceito: true,
        termo_lgpd_aceito_em: agora,
        ativo: true,
        created_at: agora,
        updated_at: agora,
      },
      {
        id: IDS.prestadorEncanamento,
        nome: 'Maria Encanamentos Demo',
        email: 'demo.prestador.encanamento@servicofacil.com',
        cpf: '00000000003',
        telefone: '11900000003',
        senha_hash: senhaHash,
        tipo_perfil: 'PRESTADOR',
        termo_lgpd_aceito: true,
        termo_lgpd_aceito_em: agora,
        ativo: true,
        created_at: agora,
        updated_at: agora,
      },
      {
        id: IDS.admin,
        nome: 'Admin Demonstração',
        email: 'demo.admin@servicofacil.com',
        cpf: '00000000009',
        telefone: '11900000009',
        senha_hash: senhaHash,
        tipo_perfil: 'ADMIN',
        termo_lgpd_aceito: true,
        termo_lgpd_aceito_em: agora,
        ativo: true,
        created_at: agora,
        updated_at: agora,
      },
    ]);

    await queryInterface.bulkInsert('prestadores_perfil', [
      {
        id: IDS.perfilEletrica,
        usuario_id: IDS.prestadorEletrica,
        cnpj_cpf: '00000000002',
        descricao_bio: 'Eletricista com 10 anos de experiência em instalações residenciais.',
        categorias: JSON.stringify(['Elétrica']),
        nota_media_reputacao: 0,
        total_avaliacoes: 0,
        created_at: agora,
        updated_at: agora,
      },
      {
        id: IDS.perfilEncanamento,
        usuario_id: IDS.prestadorEncanamento,
        cnpj_cpf: '00000000003',
        descricao_bio: 'Encanadora especializada em reparos hidráulicos residenciais e comerciais.',
        categorias: JSON.stringify(['Encanamento']),
        nota_media_reputacao: 0,
        total_avaliacoes: 0,
        created_at: agora,
        updated_at: agora,
      },
    ]);

    await queryInterface.bulkInsert('solicitacoes', [
      {
        id: IDS.solicitacaoAberta,
        solicitante_id: IDS.solicitante,
        titulo: 'Instalação de 3 tomadas na cozinha',
        descricao: 'Preciso instalar 3 tomadas novas na cozinha, próximas à bancada, com disjuntor dedicado.',
        categoria: 'Elétrica',
        cidade: 'São Paulo',
        bairro: 'Pinheiros',
        orcamento_cliente: 300.0,
        status: 'EM_NEGOCIACAO',
        created_at: agora,
        updated_at: agora,
      },
      {
        id: IDS.solicitacaoNegociacao,
        solicitante_id: IDS.solicitante,
        titulo: 'Troca de sifão e conserto de vazamento no banheiro',
        descricao: 'Vazamento embaixo da pia do banheiro social, provavelmente no sifão ou na conexão da coluna.',
        categoria: 'Encanamento',
        cidade: 'São Paulo',
        bairro: 'Pinheiros',
        orcamento_cliente: 280.0,
        status: 'EM_NEGOCIACAO',
        created_at: agora,
        updated_at: agora,
      },
      {
        id: IDS.solicitacaoContratada,
        solicitante_id: IDS.solicitante,
        titulo: 'Revisão do quadro de disjuntores',
        descricao: 'Quadro de disjuntores antigo, preciso de uma revisão completa e troca dos disjuntores queimados.',
        categoria: 'Elétrica',
        cidade: 'São Paulo',
        bairro: 'Pinheiros',
        orcamento_cliente: 450.0,
        status: 'CONTRATADA',
        created_at: agora,
        updated_at: agora,
      },
      {
        id: IDS.solicitacaoAberta2,
        solicitante_id: IDS.solicitante,
        titulo: 'Pintura de sala e corredor',
        descricao: 'Pintura de sala de estar (18m²) e corredor, tinta já comprada, preciso apenas da mão de obra.',
        categoria: 'Pintura',
        cidade: 'Campinas',
        bairro: 'Cambuí',
        orcamento_cliente: null,
        status: 'ABERTA',
        created_at: agora,
        updated_at: agora,
      },
    ]);

    await queryInterface.bulkInsert('propostas', [
      // Solicitação EM_NEGOCIACAO: 2 propostas concorrentes para comparação (US11).
      {
        id: crypto.randomUUID(),
        solicitacao_id: IDS.solicitacaoAberta,
        prestador_id: IDS.prestadorEletrica,
        valor: 280.0,
        prazo_dias: 2,
        mensagem: 'Consigo fazer amanhã mesmo, material incluso no valor.',
        validade_ate: validadeAte,
        status: 'ENVIADA',
        created_at: agora,
        updated_at: agora,
      },
      {
        id: crypto.randomUUID(),
        solicitacao_id: IDS.solicitacaoAberta,
        prestador_id: IDS.prestadorEncanamento,
        valor: 250.0,
        prazo_dias: 4,
        mensagem: 'Posso fazer na próxima semana, valor sem material.',
        validade_ate: validadeAte,
        status: 'ENVIADA',
        created_at: agora,
        updated_at: agora,
      },
      // Solicitação EM_NEGOCIACAO: proposta com contraproposta já enviada pelo solicitante.
      {
        id: crypto.randomUUID(),
        solicitacao_id: IDS.solicitacaoNegociacao,
        prestador_id: IDS.prestadorEncanamento,
        valor: 320.0,
        prazo_dias: 1,
        mensagem: 'Valor cobre peças e mão de obra, visita em até 24h.',
        validade_ate: validadeAte,
        status: 'EM_ANALISE',
        valor_contraproposta: 260.0,
        mensagem_contraproposta: 'Consigo pagar até R$260, o serviço é simples.',
        contraproposta_em: agora,
        created_at: agora,
        updated_at: agora,
      },
      // Solicitação CONTRATADA: uma proposta aceita e outra automaticamente recusada (US12).
      {
        id: crypto.randomUUID(),
        solicitacao_id: IDS.solicitacaoContratada,
        prestador_id: IDS.prestadorEletrica,
        valor: 450.0,
        prazo_dias: 3,
        mensagem: 'Revisão completa com laudo técnico incluso.',
        validade_ate: validadeAte,
        status: 'ACEITA',
        created_at: agora,
        updated_at: agora,
      },
      {
        id: crypto.randomUUID(),
        solicitacao_id: IDS.solicitacaoContratada,
        prestador_id: IDS.prestadorEncanamento,
        valor: 480.0,
        prazo_dias: 5,
        mensagem: 'Revisão com garantia de 6 meses.',
        validade_ate: validadeAte,
        status: 'RECUSADA',
        created_at: agora,
        updated_at: agora,
      },
    ]);
  },

  down: async (queryInterface) => {
    await queryInterface.bulkDelete('propostas', {
      solicitacao_id: [IDS.solicitacaoAberta, IDS.solicitacaoNegociacao, IDS.solicitacaoContratada, IDS.solicitacaoAberta2],
    });
    await queryInterface.bulkDelete('solicitacoes', {
      id: [IDS.solicitacaoAberta, IDS.solicitacaoNegociacao, IDS.solicitacaoContratada, IDS.solicitacaoAberta2],
    });
    await queryInterface.bulkDelete('prestadores_perfil', {
      id: [IDS.perfilEletrica, IDS.perfilEncanamento],
    });
    await queryInterface.bulkDelete('usuarios', {
      id: [IDS.solicitante, IDS.prestadorEletrica, IDS.prestadorEncanamento, IDS.admin],
    });
  },
};
