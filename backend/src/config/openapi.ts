/**
 * Contratos centrais da API REST (US24), derivados dos controllers e projeções dos services.
 * Swagger JSDoc (^6.2.8): lê anotações e preserva contratos locais por operação.
 * Documentação oficial: https://github.com/Surnet/swagger-jsdoc
 * OpenAPI 3.0: schemas, referências, respostas e autenticação HTTP Bearer.
 * Documentação oficial: https://spec.openapis.org/oas/v3.0.3.html
 * Não importa models nem inicia banco/servidor: também pode gerar documentação em dist.
 */
import path from 'path';
import swaggerJsDoc from 'swagger-jsdoc';

type Schema = Record<string, any>;
const texto = { type: 'string' };
const inteiro = { type: 'integer' };
const booleano = { type: 'boolean' };
const uuid = { type: 'string', format: 'uuid' };
const dataHora = { type: 'string', format: 'date-time' };
const nulo = (schema: Schema): Schema => ({ ...schema, nullable: true });
const ref = (nome: string): Schema => ({ $ref: `#/components/schemas/${nome}` });
const lista = (items: Schema): Schema => ({ type: 'array', items });
const objeto = (properties: Record<string, Schema>, required: string[] = Object.keys(properties)): Schema =>
  ({ type: 'object', properties, ...(required.length ? { required } : {}) });
const escolher = (schema: Schema, campos: string[]): Schema => objeto(
  Object.fromEntries(campos.map(campo => [campo, schema.properties[campo]])),
  (schema.required || []).filter((campo: string) => campos.includes(campo)),
);
const comCampos = (schema: Schema, properties: Record<string, Schema>): Schema => objeto(
  { ...schema.properties, ...properties }, [...(schema.required || []), ...Object.keys(properties)],
);
// Sequelize/MySQL retorna DECIMAL como string nas leituras; instâncias recém-criadas
// podem manter números. Os DTOs não prometem conversão que os controllers não fazem.
const decimal: Schema = { oneOf: [{ type: 'number' }, { type: 'string', pattern: '^-?[0-9]+(\\.[0-9]+)?$' }] };
// Em OpenAPI 3.0, nullable precisa de type no mesmo nível; anyOf representa os dois formatos e null.
const dinheiroNulo: Schema = { anyOf: [{ type: 'number' }, { type: 'string', nullable: true }] };
const statusSolicitacao = { type: 'string', enum: ['ABERTA', 'EM_NEGOCIACAO', 'CONTRATADA', 'CONCLUIDA', 'CANCELADA'] };
const statusProposta = { type: 'string', enum: ['ENVIADA', 'EM_ANALISE', 'ACEITA', 'RECUSADA'] };
const tipoPerfil = { type: 'string', enum: ['SOLICITANTE', 'PRESTADOR', 'ADMIN'] };
const datas = { created_at: dataHora, updated_at: dataHora, createdAt: dataHora, updatedAt: dataHora };
// Projeções explícitas selecionam created_at; instâncias completas também podem serializar createdAt.
const usuario = objeto({ id: uuid, nome: texto, email: { type: 'string', format: 'email' }, cpf: texto,
  telefone: texto, endereco: nulo(texto), foto_url: nulo(texto), tipo_perfil: tipoPerfil,
  termos_uso_versao: nulo(texto), privacidade_versao: nulo(texto), documentos_aceitos_em: nulo(dataHora),
  termo_lgpd_aceito: booleano, termo_lgpd_aceito_em: nulo(dataHora), ativo: booleano,
  status_alterado_por: nulo(uuid), status_alterado_em: nulo(dataHora), ...datas },
  ['id', 'nome', 'email', 'cpf', 'telefone', 'tipo_perfil', 'termo_lgpd_aceito', 'ativo']);
const perfil = objeto({ id: uuid, usuario_id: uuid, cnpj_cpf: texto, descricao_bio: nulo(texto),
  categorias: lista(texto), nota_media_reputacao: decimal, total_avaliacoes: inteiro, ...datas },
  ['id', 'usuario_id', 'cnpj_cpf', 'categorias', 'nota_media_reputacao', 'total_avaliacoes']);
const solicitacao = objeto({ id: uuid, solicitante_id: uuid, titulo: texto, descricao: texto,
  categoria: nulo(texto), cidade: nulo(texto), bairro: nulo(texto), orcamento_cliente: dinheiroNulo,
  prazo_desejado_dias: nulo(inteiro), status: statusSolicitacao, motivo_cancelamento: nulo(texto),
  cancelada_em: nulo(dataHora), ...datas }, ['id', 'solicitante_id', 'titulo', 'descricao', 'status']);
const proposta = objeto({ id: uuid, solicitacao_id: uuid, prestador_id: uuid, valor: decimal,
  prazo_dias: inteiro, validade_ate: dataHora, mensagem: texto, status: statusProposta, valor_contraproposta: dinheiroNulo,
  mensagem_contraproposta: nulo(texto), contraproposta_em: nulo(dataHora), contraproposta_status: nulo({ type: 'string', enum: ['PENDENTE', 'ACEITA', 'RECUSADA'] }), contraproposta_respondida_em: nulo(dataHora), ...datas },
  ['id', 'solicitacao_id', 'prestador_id', 'valor', 'prazo_dias', 'validade_ate', 'mensagem', 'status']);
const pessoa = escolher(usuario, ['id', 'nome', 'foto_url']);
const anexo = objeto({ id: uuid, url_arquivo: texto, nome_original: texto });
const pergunta = objeto({ id: uuid, solicitacao_id: uuid, prestador_id: uuid, pergunta: texto,
  resposta: nulo(texto), respondida_em: nulo(dataHora), ...datas, prestador: pessoa },
  ['id', 'solicitacao_id', 'prestador_id', 'pergunta', 'prestador']);
const custodia = objeto({ id: uuid, solicitacao_id: uuid, proposta_id: uuid, valor: decimal,
  status_pagamento: { type: 'string', enum: ['RETIDO', 'LIBERADO', 'REEMBOLSADO'] },
  metodo_pagamento: { type: 'string', enum: ['CARTAO_TESTE', 'PIX_TESTE'] }, referencia_simulada: texto,
  retido_em: dataHora, liberado_em: nulo(dataHora), ...datas },
  ['id', 'solicitacao_id', 'proposta_id', 'valor', 'status_pagamento', 'metodo_pagamento', 'referencia_simulada', 'retido_em']);
const avaliacao = objeto({ id: uuid, solicitacao_id: uuid, solicitante_id: uuid, prestador_id: uuid,
  nota: { type: 'integer', minimum: 1, maximum: 5 }, comentario: nulo(texto), ...datas },
  ['id', 'solicitacao_id', 'solicitante_id', 'prestador_id', 'nota']);
const denuncia = objeto({ id: uuid, solicitacao_id: uuid, denunciante_id: uuid, motivo: texto,
  status: { type: 'string', enum: ['PENDENTE', 'RESOLVIDA'] }, ...datas },
  ['id', 'solicitacao_id', 'denunciante_id', 'motivo', 'status']);
const resumoSolicitacao = escolher(solicitacao, ['id', 'titulo', 'status']);
const resumoProposta = escolher(proposta, ['id', 'valor', 'prazo_dias', 'validade_ate', 'mensagem', 'status', 'created_at', 'valor_contraproposta', 'mensagem_contraproposta', 'contraproposta_status', 'contraproposta_respondida_em']);
const cadastro = { nome: { type: 'string', minLength: 1, maxLength: 150 }, email: { type: 'string', format: 'email', maxLength: 150 },
  telefone: { type: 'string', minLength: 1, maxLength: 20 }, endereco: { type: 'string', maxLength: 255 },
  senha: { type: 'string', format: 'password', writeOnly: true, minLength: 8, description: 'No mínimo 8 caracteres e no máximo 72 bytes UTF-8 (limite bcrypt).' },
  termos_uso_aceitos: { type: 'boolean', enum: [true] }, privacidade_ciente: { type: 'boolean', enum: [true] },
  termos_uso_versao: texto, privacidade_versao: texto,
  termo_lgpd_aceito: { type: 'boolean', enum: [true], deprecated: true, description: 'Campo legado de compatibilidade; não autoriza tratamento genérico.' } };
const evento = { type: 'string', enum: ['NOVA_PROPOSTA', 'PROPOSTA_ACEITA_RECUSADA', 'NOVA_MENSAGEM_CHAT', 'SOLICITACAO_CANCELADA'] };
const binario = { type: 'string', format: 'binary' };

export const schemas: Record<string, Schema> = {
  DocumentosLegaisDTO: objeto({ versao_termos: texto, versao_privacidade: texto, publicado_em: texto, responsavel: texto, email_privacidade: texto, termos_url: texto, privacidade_url: texto }),
  PedidoPrivacidadeDTO: objeto({ id: uuid, usuario_id: uuid, tipo: { type: 'string', enum: ['ACESSO','CORRECAO','EXCLUSAO','INFORMACAO','REVOGACAO'] }, descricao: texto, status: { type: 'string', enum: ['PENDENTE','RESPONDIDA'] }, resposta: nulo(texto), respondida_por: nulo(uuid), respondida_em: nulo(dataHora), createdAt: dataHora, updatedAt: dataHora }),
  CriarPedidoPrivacidadeDTO: objeto({ tipo: { type: 'string', enum: ['ACESSO','CORRECAO','EXCLUSAO','INFORMACAO','REVOGACAO'] }, descricao: { type: 'string', minLength: 10, maxLength: 2000 } }),
  ResponderPrivacidadeDTO: objeto({ resposta: { type: 'string', minLength: 10, maxLength: 2000 } }),
  CentralPrivacidadeDTO: objeto({ aceite: objeto({ termos_uso_versao: nulo(texto), privacidade_versao: nulo(texto), documentos_aceitos_em: nulo(dataHora) }), solicitacoes: lista(ref('PedidoPrivacidadeDTO')) }),
  PedidoPrivacidadeAdminDTO: objeto({ id: uuid, usuario_id: uuid, tipo: texto, descricao: texto, status: texto, resposta: nulo(texto), respondida_por: nulo(uuid), respondida_em: nulo(dataHora), createdAt: dataHora, updatedAt: dataHora, titular: escolher(usuario,['id','nome','email']) }),
  ResponderContrapropostaDTO: objeto({ acao: { type: 'string', enum: ['ACEITAR', 'RECUSAR'] } }),
  Erro: objeto({ error: texto, message: texto }, ['message']),
  Mensagem: objeto({ mensagem: texto }), MensagemCadastro: objeto({ message: texto }),
  UsuarioDTO: usuario, PerfilPrestadorDTO: perfil,
  UsuarioComPerfilDTO: objeto({ ...usuario.properties, perfil_prestador: nulo(perfil) }, usuario.required),
  CadastroSolicitanteDTO: objeto({ ...cadastro, cpf: { type: 'string', description: 'CPF válido, com ou sem pontuação; persistido somente com dígitos.' } }, ['nome', 'email', 'cpf', 'telefone', 'senha', 'termos_uso_aceitos', 'privacidade_ciente', 'termos_uso_versao', 'privacidade_versao']),
  CadastroPrestadorDTO: objeto({ ...cadastro, cnpj_cpf: { type: 'string', description: 'CPF ou CNPJ válido, com ou sem pontuação; persistido somente com dígitos.' }, descricao_bio: texto, categorias: { ...lista({ type: 'string', minLength: 1 }), minItems: 1 } },
    ['nome', 'email', 'cnpj_cpf', 'telefone', 'senha', 'categorias', 'termos_uso_aceitos', 'privacidade_ciente', 'termos_uso_versao', 'privacidade_versao']),
  CadastroPrestadorMultipartDTO: objeto({ ...cadastro, cnpj_cpf: texto, descricao_bio: texto,
    categorias: { type: 'string', description: 'Array JSON serializado de categorias não vazias.', example: '["ELETRICA"]' },
    termos_uso_aceitos: { type: 'string', enum: ['true'] }, privacidade_ciente: { type: 'string', enum: ['true'] },
    termo_lgpd_aceito: { type: 'string', enum: ['true'], deprecated: true }, foto: { ...binario, description: 'Foto opcional JPEG, PNG ou WEBP; até 5 MB.' } },
    ['nome', 'email', 'cnpj_cpf', 'telefone', 'senha', 'categorias', 'termos_uso_aceitos', 'privacidade_ciente', 'termos_uso_versao', 'privacidade_versao']),
  LoginDTO: objeto({ email: { type: 'string', format: 'email' }, senha: { type: 'string', format: 'password', writeOnly: true } }),
  AutenticacaoDTO: objeto({ token: texto, usuario: ref('UsuarioComPerfilDTO') }),
  AtualizarPerfilDTO: objeto({ nome: texto, telefone: texto, endereco: texto }, []),
  AlterarSenhaDTO: objeto({ senha_atual: { type: 'string', format: 'password', writeOnly: true }, nova_senha: { type: 'string', format: 'password', writeOnly: true, minLength: 8, description: 'No mínimo 8 caracteres e no máximo 72 bytes UTF-8 (limite bcrypt).' } }),
  FotoPerfilDTO: objeto({ foto: { ...binario, description: 'JPEG, PNG ou WEBP; até 5 MB.' } }),
  PreferenciaNotificacaoDTO: objeto({ tipo_evento: evento, ativo: booleano }),
  AtualizarPreferenciasDTO: objeto({ preferencias: { ...lista(ref('PreferenciaNotificacaoDTO')), minItems: 1 } }),
  CriarSolicitacaoDTO: objeto({ titulo: { type: 'string', minLength: 5, maxLength: 180 }, descricao: { type: 'string', minLength: 20 },
    categoria: texto, cidade: texto, bairro: texto, prazo_desejado_dias: { type: 'integer', minimum: 1, maximum: 365 }, orcamento_cliente: { type: 'number', minimum: 0, maximum: 99999999.99 },
    anexos: { ...lista(binario), maxItems: 5, description: 'JPEG, PNG, WEBP ou PDF; até 10 MB por arquivo.' } }, ['titulo', 'descricao']),
  SolicitacaoDTO: solicitacao,
  MinhaSolicitacaoDTO: comCampos(escolher(solicitacao, ['id', 'titulo', 'descricao', 'status', 'created_at', 'updated_at']), { propostas_recebidas: inteiro }),
  PropostaDTO: proposta, AnexoSolicitacaoDTO: anexo, PerguntaDTO: pergunta, CustodiaDTO: custodia,
  EnviarPropostaDTO: objeto({ valor: { type: 'number', exclusiveMinimum: true, minimum: 0, maximum: 99999999.99 },
    prazo_dias: { type: 'integer', minimum: 1, maximum: 3650 }, validade_dias: { type: 'integer', minimum: 1, maximum: 365, default: 7 },
    mensagem: { type: 'string', minLength: 10, maxLength: 2000 } }, ['valor', 'prazo_dias', 'mensagem']),
  StatusPropostaDTO: objeto({ acao: { type: 'string', enum: ['ACEITAR', 'RECUSAR'] } }),
  RenegociarPropostaDTO: objeto({ valor: { type: 'number', minimum: 0, exclusiveMinimum: true }, mensagem: { type: 'string', minLength: 5 } }),
  MotivoDTO: objeto({ motivo: { type: 'string', minLength: 5 } }),
  PagamentoDTO: objeto({ metodo_pagamento: custodia.properties.metodo_pagamento }),
  CriarPerguntaDTO: objeto({ pergunta: { type: 'string', minLength: 5, maxLength: 1000 } }),
  ResponderPerguntaDTO: objeto({ resposta: { type: 'string', minLength: 2, maxLength: 1000 } }),
  AvaliarDTO: objeto({ nota: avaliacao.properties.nota, comentario: texto }, ['nota']),
  AvaliacaoDTO: avaliacao,
  AvaliacaoComPrestadorDTO: comCampos(avaliacao, { prestador: escolher(usuario, ['id', 'nome']) }),
  DenunciaDTO: denuncia,
  DenunciaAdminDTO: comCampos(denuncia, { solicitacao: resumoSolicitacao, denunciante: escolher(usuario, ['id', 'nome', 'email']) }),
  StatusUsuarioDTO: objeto({ ativo: booleano }),
  SolicitacaoAdminDTO: comCampos(escolher(solicitacao, ['id', 'titulo', 'status', 'categoria', 'cidade', 'bairro', 'created_at']),
    { solicitante: escolher(usuario, ['id', 'nome', 'email']) }),
  MensagemChatDTO: objeto({ id: uuid, solicitacao_id: uuid, proposta_id: nulo(uuid), emissor_id: uuid,
    conteudo: nulo(texto), anexo_url: nulo(texto), anexo_nome_original: nulo(texto), lida: booleano,
    ...datas, emissor: pessoa }, ['id', 'solicitacao_id', 'emissor_id', 'lida', 'emissor']),
  EnviarMensagemDTO: { ...objeto({ conteudo: { type: 'string', maxLength: 2000 }, anexo: { ...binario, description: 'JPEG, PNG, WEBP ou PDF; até 10 MB.' } }, []),
    anyOf: [{ required: ['conteudo'], properties: { conteudo: { type: 'string', minLength: 1, maxLength: 2000 } } }, { required: ['anexo'] }] },
  NotificacaoDTO: objeto({ id: uuid, usuario_id: uuid, titulo: texto, mensagem: texto, link_redirecionamento: nulo(texto), lida: booleano, ...datas },
    ['id', 'usuario_id', 'titulo', 'mensagem', 'lida']),
  OportunidadeResumoDTO: escolher(solicitacao, ['id', 'titulo', 'categoria', 'cidade', 'bairro', 'descricao', 'orcamento_cliente', 'status', 'created_at']),
  OportunidadeDTO: comCampos(escolher(solicitacao, ['id', 'titulo', 'categoria', 'cidade', 'bairro', 'descricao', 'orcamento_cliente', 'prazo_desejado_dias', 'status', 'motivo_cancelamento', 'created_at']),
    { solicitante: pessoa, anexos: lista(ref('AnexoSolicitacaoDTO')), perguntas: lista(ref('PerguntaDTO')),
      pode_enviar_proposta: booleano, minha_proposta: { ...resumoProposta, nullable: true },
      pagamento_contratacao: { type: 'string', enum: ['RETIDO', 'LIBERADO', 'REEMBOLSADO'], nullable: true,
        description: 'Situação da custódia, informada só ao prestador contratado; null antes do pagamento simulado (US17).' } }),
  MinhaPropostaDTO: comCampos(escolher(proposta, ['id', 'valor', 'prazo_dias', 'validade_ate', 'status', 'created_at']), { solicitacao: resumoSolicitacao }),
  PropostaComparacaoDTO: comCampos(proposta, { prestador: comCampos(pessoa,
    { perfil_prestador: { ...escolher(perfil, ['nota_media_reputacao', 'total_avaliacoes', 'descricao_bio', 'categorias']), nullable: true } }) }),
  SolicitacaoDetalheDTO: comCampos(escolher(solicitacao, ['id', 'titulo', 'descricao', 'categoria', 'cidade', 'bairro', 'orcamento_cliente', 'prazo_desejado_dias', 'status', 'motivo_cancelamento', 'cancelada_em', 'created_at', 'updated_at']),
    { anexos: lista(ref('AnexoSolicitacaoDTO')), perguntas: lista(ref('PerguntaDTO')), propostas: lista(ref('PropostaComparacaoDTO')),
      transacao_custodia: { ...escolher(custodia, ['id', 'valor', 'status_pagamento', 'metodo_pagamento', 'referencia_simulada', 'retido_em']), nullable: true } }),
  FeedDTO: objeto({ total: inteiro, dados: lista(ref('OportunidadeResumoDTO')), filtrosDisponiveis: objeto({ categorias: lista(texto), locais: lista(objeto({ cidade: texto, bairro: texto })) }) }),
  NotificacoesDTO: objeto({ dados: lista(ref('NotificacaoDTO')), nao_lidas: inteiro }),
  SaudeDTO: objeto({ status: { type: 'string', enum: ['OK'] }, service: texto, version: texto, environment: texto, timestamp: dataHora }),
};

type Contrato = {
  saida: Schema; status?: number; entrada?: string; multipart?: boolean; publico?: boolean;
  entradaMultipart?: string;
  erros?: number[]; parametros?: Schema[]; resumo?: string;
};
const envelope = (campo: string, schema: Schema): Schema => objeto({ [campo]: schema });
const resultado = (campo: string, schema: Schema, mensagem = 'mensagem'): Schema => objeto({ [mensagem]: texto, [campo]: schema });
const query = (nome: string, schema: Schema = texto): Schema => ({ in: 'query', name: nome, schema });
// Apenas contratos específicos: nenhuma resposta de sucesso é preenchida com objeto genérico.
const contratos: Record<string, Contrato> = {
  'GET /legal/documentos': { publico: true, saida: envelope('data', ref('DocumentosLegaisDTO')), resumo: 'Versões e contato dos documentos legais vigentes (US40)' },
  'GET /privacidade/minha-central': { saida: envelope('data', ref('CentralPrivacidadeDTO')), erros: [404], resumo: 'Registro de aceite e protocolos do próprio titular' },
  'POST /privacidade/solicitacoes': { erros: [404,409], entrada: 'CriarPedidoPrivacidadeDTO', status: 201, saida: envelope('data', ref('PedidoPrivacidadeDTO')), resumo: 'Registra pedido para análise manual, sem exclusão automática' },
  'GET /admin/privacidade': { saida: objeto({ data: lista(ref('PedidoPrivacidadeAdminDTO')), paginacao: objeto({ pagina: inteiro, total: inteiro, total_paginas: inteiro }) }), parametros: [query('pagina', {type: 'integer', minimum: 1, maximum: 100000})], erros: [400,403], resumo: 'Administração lista protocolos paginados, pendentes primeiro' },
  'PATCH /admin/privacidade/{id}/resposta': { entrada: 'ResponderPrivacidadeDTO', saida: envelope('data', ref('PedidoPrivacidadeDTO')), erros: [403,404,409], resumo: 'Registra resposta administrativa única e auditável' },
  'GET /health': { publico: true, saida: ref('SaudeDTO'), resumo: 'Verifica a disponibilidade da API' },
  'POST /auth/register/solicitante': { publico: true, status: 201, entrada: 'CadastroSolicitanteDTO', saida: resultado('data', ref('UsuarioDTO'), 'message'), erros: [400, 409] },
  'POST /auth/register/prestador': { publico: true, status: 201, entrada: 'CadastroPrestadorDTO', entradaMultipart: 'CadastroPrestadorMultipartDTO', saida: resultado('data', ref('UsuarioComPerfilDTO'), 'message'), erros: [400, 409] },
  'POST /auth/login': { publico: true, entrada: 'LoginDTO', saida: resultado('data', ref('AutenticacaoDTO'), 'message'), erros: [400, 401, 429] },
  'GET /auth/me': { saida: envelope('data', ref('UsuarioComPerfilDTO')) },
  'GET /perfil': { saida: envelope('data', ref('UsuarioComPerfilDTO')), erros: [404] },
  'PUT /perfil': { entrada: 'AtualizarPerfilDTO', saida: resultado('data', ref('UsuarioDTO'), 'message'), erros: [404] },
  'DELETE /perfil': { saida: ref('MensagemCadastro'), erros: [404] },
  'POST /perfil/foto': { entrada: 'FotoPerfilDTO', multipart: true, saida: resultado('data', objeto({ foto_url: texto }), 'message'), erros: [400, 404] },
  'PUT /perfil/senha': { entrada: 'AlterarSenhaDTO', saida: ref('MensagemCadastro'), erros: [400, 404] },
  'GET /perfil/preferencias-notificacao': { saida: envelope('data', lista(ref('PreferenciaNotificacaoDTO'))) },
  'PUT /perfil/preferencias-notificacao': { entrada: 'AtualizarPreferenciasDTO', saida: envelope('data', lista(ref('PreferenciaNotificacaoDTO'))), erros: [400] },
  'POST /solicitacoes': { entrada: 'CriarSolicitacaoDTO', multipart: true, status: 201, saida: resultado('data', ref('SolicitacaoDTO'), 'message'), erros: [400, 403] },
  'GET /solicitacoes/minhas': { saida: envelope('data', lista(ref('MinhaSolicitacaoDTO'))), erros: [400, 403], parametros: [query('status', statusSolicitacao), query('busca')] },
  'GET /solicitacoes/minhas/{id}/propostas': { saida: envelope('data', ref('SolicitacaoDetalheDTO')), erros: [403, 404] },
  'PATCH /solicitacoes/minhas/{id}/propostas/{propostaId}/status': { entrada: 'StatusPropostaDTO', saida: ref('Mensagem'), erros: [400, 403, 404, 409] },
  'POST /solicitacoes/minhas/{id}/propostas/{propostaId}/renegociar': { entrada: 'RenegociarPropostaDTO', saida: ref('Mensagem'), erros: [400, 403, 404, 409] },
  'PATCH /solicitacoes/{id}/cancelar': { entrada: 'MotivoDTO', saida: ref('Mensagem'), erros: [400, 403, 404, 409] },
  'PATCH /solicitacoes/{id}/cancelar-contratacao': { saida: ref('Mensagem'), erros: [403, 404, 409] },
  'PATCH /solicitacoes/{id}/concluir': { saida: ref('Mensagem'), erros: [403, 404, 409] },
  'POST /solicitacoes/{id}/custodia/simular': { entrada: 'PagamentoDTO', saida: resultado('dados', ref('CustodiaDTO')), erros: [403, 404, 409, 422] },
  'POST /solicitacoes/{id}/perguntas': { entrada: 'CriarPerguntaDTO', status: 201, saida: envelope('data', ref('PerguntaDTO')), erros: [400, 403, 404] },
  'PATCH /solicitacoes/{id}/perguntas/{perguntaId}/responder': { entrada: 'ResponderPerguntaDTO', saida: envelope('data', ref('PerguntaDTO')), erros: [400, 404] },
  'POST /solicitacoes/{id}/denunciar': { entrada: 'MotivoDTO', status: 201, saida: resultado('dados', ref('DenunciaDTO')), erros: [400, 403, 404] },
  'POST /solicitacoes/{id}/avaliar': { entrada: 'AvaliarDTO', status: 201, saida: resultado('dados', ref('AvaliacaoDTO')), erros: [400, 404, 409] },
  'GET /solicitacoes/{id}/avaliacao': { saida: envelope('data', { ...schemas.AvaliacaoComPrestadorDTO, nullable: true }) },
  'GET /propostas/{propostaId}/mensagens': { saida: objeto({ data: lista(ref('MensagemChatDTO')), somente_leitura: booleano }), erros: [403, 404] },
  'POST /propostas/{propostaId}/mensagens': { entrada: 'EnviarMensagemDTO', multipart: true, status: 201, saida: envelope('data', ref('MensagemChatDTO')), erros: [400, 403, 404, 409] },
  'PATCH /propostas/{propostaId}/mensagens/lidas': { saida: ref('Mensagem'), erros: [403, 404] },
  'GET /prestador/oportunidades': { publico: true, saida: ref('FeedDTO'), parametros: ['busca', 'categoria', 'cidade', 'bairro'].map(nome => query(nome)).concat([query('ordenacao', { type: 'string', enum: ['recentes', 'antigas'] })]), resumo: 'Lista oportunidades abertas ou em negociação; acesso público e filtros opcionais' },
  'GET /prestador/oportunidades/{id}': { publico: true, saida: envelope('dados', ref('OportunidadeDTO')), erros: [404], resumo: 'Consulta uma oportunidade; JWT opcional identifica a proposta do prestador' },
  'POST /prestador/oportunidades/{id}/propostas': { entrada: 'EnviarPropostaDTO', status: 201, saida: resultado('dados', ref('PropostaDTO')), erros: [400, 403, 409] },
  'POST /prestador/oportunidades/{id}/propostas/{propostaId}/contraproposta/responder': { entrada: 'ResponderContrapropostaDTO', saida: ref('Mensagem'), erros: [400, 403, 404, 409], resumo: 'Prestador aceita ou recusa contraproposta pendente (US35)' },
  'GET /prestador/propostas': { saida: envelope('dados', lista(ref('MinhaPropostaDTO'))), erros: [400, 403], parametros: [query('status', statusProposta)] },
  'PATCH /prestador/oportunidades/{id}/desistir': { entrada: 'MotivoDTO', saida: ref('Mensagem'), erros: [400, 403, 409] },
  'GET /notificacoes': { saida: ref('NotificacoesDTO') },
  'PATCH /notificacoes/lidas': { saida: ref('Mensagem') },
  'PATCH /notificacoes/{id}/lida': { saida: ref('Mensagem'), erros: [404] },
  'GET /admin/usuarios': { saida: envelope('data', lista(ref('UsuarioDTO'))), erros: [400, 403], parametros: [query('tipo_perfil', tipoPerfil), query('status', { type: 'string', enum: ['ativo', 'inativo'] }), query('busca')] },
  'PATCH /admin/usuarios/{id}/status': { entrada: 'StatusUsuarioDTO', saida: resultado('data', ref('UsuarioDTO'), 'message'), erros: [400, 403, 404] },
  'GET /admin/solicitacoes': { saida: envelope('data', lista(ref('SolicitacaoAdminDTO'))), erros: [400, 403], parametros: [query('status', statusSolicitacao)] },
  'GET /admin/denuncias': { saida: envelope('data', lista(ref('DenunciaAdminDTO'))), erros: [403] },
  'PATCH /admin/denuncias/{id}/resolver': { saida: ref('Mensagem'), erros: [403, 404] },
};

const descricoesErro: Record<number, string> = {
  400: 'Corpo, parâmetros ou arquivos inválidos.', 401: 'Autenticação ausente, inválida, expirada ou conta inativa.',
  403: 'Perfil ou participante sem permissão para a operação.', 404: 'Recurso não encontrado ou indisponível ao usuário.',
  409: 'Conflito de cadastro ou de estado do recurso.', 422: 'Método de pagamento simulado inválido.',
  429: 'Limite de 10 tentativas de login por IP a cada 15 minutos excedido.', 500: 'Falha interna do servidor.',
};
const conteudo = (schema: Schema) => ({ 'application/json': { schema } });

/** Complementa por operação, preservando descrições, parâmetros e contratos locais novos. */
export function complementarOperacao(anotada: Schema, contrato: Contrato): Schema {
  const responses = { ...(anotada.responses || {}) };
  const codigo = String(contrato.status || 200);
  responses[codigo] = { ...responses[codigo], description: responses[codigo]?.description || 'Operação realizada com sucesso.',
    content: { ...responses[codigo]?.content, ...conteudo(contrato.saida) } };
  const erros = new Set([500, ...(contrato.publico ? [] : [401]), ...(contrato.entrada ? [400] : []), ...(contrato.erros || [])]);
  for (const status of erros) {
    responses[status] = { ...responses[status], description: responses[status]?.description || descricoesErro[status],
      content: { ...responses[status]?.content, ...conteudo(ref('Erro')) } };
  }
  // Retira respostas antigas que contradizem operações agora públicas, sem apagar contratos locais.
  if (contrato.publico) for (const status of ['401', '403']) if (!contrato.erros?.includes(Number(status))) delete responses[status];
  for (const [status, resposta] of Object.entries(responses) as [string, Schema][]) {
    if (Number(status) >= 400 && !resposta.$ref) responses[status] = { ...resposta, content: { ...resposta.content, ...conteudo(ref('Erro')) } };
  }
  const parametros = new Map<string, Schema>((anotada.parameters || []).map((p: Schema) => [`${p.in}:${p.name}`, p]));
  for (const p of contrato.parametros || []) parametros.set(`${p.in}:${p.name}`, { ...parametros.get(`${p.in}:${p.name}`), ...p });
  const operacao: Schema = { ...anotada, ...(contrato.resumo ? { summary: contrato.resumo } : {}),
    security: contrato.publico ? [] : [{ bearerAuth: [] }], responses };
  if (parametros.size) operacao.parameters = [...parametros.values()];
  if (contrato.entrada) {
    const tipo = contrato.multipart ? 'multipart/form-data' : 'application/json';
    const content = { ...anotada.requestBody?.content,
      [tipo]: { ...anotada.requestBody?.content?.[tipo], schema: ref(contrato.entrada) } };
    if (contrato.entradaMultipart) content['multipart/form-data'] = {
      ...content['multipart/form-data'], schema: ref(contrato.entradaMultipart),
    };
    operacao.requestBody = { ...anotada.requestBody, required: true, content };
  }
  return operacao;
}

export function criarDocumentoOpenApi(): Schema {
  const raiz = path.resolve(__dirname, '..');
  const documento = swaggerJsDoc({
    definition: {
      openapi: '3.0.0',
      info: { title: 'API Eloserv - Plataforma de Requisição de Serviços (TCC)', version: '1.0.0',
        description: 'Contratos da API REST de serviços, propostas, comunicação, administração e indicadores pessoais.',
        contact: { name: 'Equipe de TCC (UNIP)' } },
      servers: [{ url: 'http://localhost:3001/api/v1', description: 'Servidor Local de Desenvolvimento' }],
      components: { securitySchemes: { bearerAuth: { type: 'http', scheme: 'bearer', bearerFormat: 'JWT' } }, schemas },
    },
    apis: ['controllers', 'routes'].flatMap(pasta => ['ts', 'js'].map(extensao => path.join(raiz, pasta, `*.${extensao}`))),
    failOnErrors: true,
  }) as Schema;
  for (const [chave, contrato] of Object.entries(contratos)) {
    const [metodo, caminho] = chave.split(' ');
    const item = documento.paths[caminho] || (documento.paths[caminho] = {});
    item[metodo.toLowerCase()] = complementarOperacao(item[metodo.toLowerCase()] || {}, contrato);
  }
  // Dashboards/perfil público já têm DTOs locais completos: preservar os schemas e
  // complementar apenas segurança/erros por operação, inclusive futuras anotações.
  for (const [caminho, item] of Object.entries(documento.paths) as [string, Schema][]) {
    for (const metodo of ['get', 'post', 'put', 'patch', 'delete']) {
      const operacao = item[metodo];
      if (!operacao) continue;
      if (!contratos[`${metodo.toUpperCase()} ${caminho}`]) {
        const saida = operacao.responses?.['200']?.content?.['application/json']?.schema;
        if (!saida) throw new Error(`Contrato de saída ausente: ${metodo.toUpperCase()} ${caminho}`);
        item[metodo] = complementarOperacao(operacao, { saida, publico: caminho.startsWith('/prestadores/') });
      }
      const atual = item[metodo];
      const parametros = atual.parameters || [];
      for (const correspondencia of caminho.matchAll(/\{([^}]+)\}/g)) {
        const nome = correspondencia[1];
        const existente = parametros.find((p: Schema) => p.in === 'path' && p.name === nome);
        if (existente) { existente.required = true; existente.schema = { ...uuid, ...existente.schema }; }
        else parametros.push({ in: 'path', name: nome, required: true, schema: uuid });
      }
      if (parametros.length) atual.parameters = parametros;
    }
  }
  return documento;
}
