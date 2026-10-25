/**
 * US24: contratos da documentação comparados às rotas Express reais, sem banco.
 * Jest (30): testes e asserções. Documentação oficial: https://jestjs.io/docs/api
 * Supertest (7): verifica os endpoints HTTP da documentação sem servidor externo.
 * Documentação oficial: https://github.com/forwardemail/supertest
 * TypeScript (^5.4.5): transpila o código real em memória, sem gerar arquivos.
 * Documentação oficial: https://github.com/microsoft/TypeScript/wiki/Using-the-Compiler-API
 * Swagger JSDoc (^6.2.8): anotações reais e integração src/dist.
 * Documentação oficial: https://github.com/Surnet/swagger-jsdoc
 * Swagger Parser (dependência já instalada de swagger-jsdoc): valida a especificação OpenAPI.
 * Documentação oficial: https://apidevtools.com/swagger-parser/
 */
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');
const ts = require('typescript');
const request = require('supertest');
const raiz = path.resolve(__dirname, '../src');
const metodos = ['get', 'post', 'put', 'patch', 'delete'];

function executar(arquivo, importar = require) {
  const codigo = ts.transpileModule(fs.readFileSync(arquivo, 'utf8'), {
    compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2020, esModuleInterop: true },
  }).outputText;
  const modulo = { exports: {} };
  new Function('require', 'module', 'exports', '__dirname', '__filename', codigo)(
    importar, modulo, modulo.exports, path.dirname(arquivo), arquivo,
  );
  return modulo.exports;
}

const helper = executar(path.join(raiz, 'config/openapi.ts'));
const documento = helper.criarDocumentoOpenApi();
const operacoes = Object.entries(documento.paths).flatMap(([rota, item]) =>
  metodos.filter(metodo => item[metodo]).map(metodo => [metodo, rota, item[metodo]]));

function resolver(ref) {
  expect(ref.startsWith('#/')).toBe(true);
  return ref.slice(2).split('/').reduce((valor, chave) => valor?.[chave.replace(/~1/g, '/').replace(/~0/g, '~')], documento);
}
function percorrer(valor, visitar) {
  if (!valor || typeof valor !== 'object') return;
  visitar(valor);
  Object.values(valor).forEach(filho => percorrer(filho, visitar));
}

// Carrega os roteadores reais. Apenas controllers, autenticação e uploads são
// substituídos: não abre conexão MySQL, não lê .env e não cria diretórios de upload.
function carregarApp() {
  const cache = new Map();
  const passar = (_req, _res, next) => next();
  const substituto = new Proxy(passar, {
    get: (_obj, nome) => nome === '__esModule' ? false : nome === 'single' || nome === 'array' ? () => passar : passar,
  });
  function carregar(arquivo) {
    if (cache.has(arquivo)) return cache.get(arquivo);
    const modulo = executar(arquivo, nome => {
      if (!nome.startsWith('.')) return require(nome);
      const destino = path.resolve(path.dirname(arquivo), `${nome}.ts`);
      if (destino === path.join(raiz, 'config/openapi.ts')) return helper;
      if (destino.includes(`${path.sep}routes${path.sep}`)) return carregar(destino);
      return substituto;
    });
    cache.set(arquivo, modulo);
    return modulo;
  }
  return carregar(path.join(raiz, 'app.ts')).default;
}
const app = carregarApp();

function rotasReais() {
  const rotas = [];
  function listar(pilha, prefixo = '') {
    for (const camada of pilha) {
      if (camada.route) {
        for (const metodo of Object.keys(camada.route.methods)) rotas.push(`${metodo.toUpperCase()} ${prefixo}${camada.route.path}`);
      } else if (camada.name === 'router') {
        // Express 4 monta os roteadores como regexp /^\/api\/v1\/auth\/?.../.
        const montagem = camada.regexp.source.replace(/^\^/, '').split('\\/?')[0].replace(/\\\//g, '/');
        listar(camada.handle.stack, prefixo + montagem);
      }
    }
  }
  listar(app._router.stack);
  return rotas.filter(rota => rota.includes(' /api/v1/')).map(rota =>
    rota.replace(' /api/v1', ' ').replace(/:([A-Za-z0-9_]+)/g, '{$1}').replace(/\/$/, '')).sort();
}

test('documenta exatamente os métodos e caminhos registrados na API real, incluindo integrações novas', () => {
  const documentadas = operacoes.map(([metodo, rota]) => `${metodo.toUpperCase()} ${rota}`).sort();
  expect(documentadas).toEqual(rotasReais());
  expect(documentadas).toEqual(expect.arrayContaining([
    'GET /dashboards/solicitante', 'GET /dashboards/prestador', 'GET /prestadores/{id}/perfil-publico',
  ]));
});

test('todas as referências locais resolvem para componentes existentes', () => {
  let total = 0;
  percorrer(documento, valor => {
    if (valor.$ref) { total++; expect(resolver(valor.$ref)).toBeDefined(); }
  });
  expect(total).toBeGreaterThan(100);
});

test('a especificação completa é válida em OpenAPI 3.0', async () => {
  const parser = require('@apidevtools/swagger-parser');
  // O parser dereferencia em memória: validar uma cópia para não alterar os demais testes.
  await expect(parser.validate(JSON.parse(JSON.stringify(documento)), { resolve: { external: false } })).resolves.toBeDefined();
});

test.each(operacoes)('%s %s tem segurança resolvida, parâmetros de caminho e schemas concretos', (metodo, rota, operacao) => {
  const publico = ['/health', '/auth/register/solicitante', '/auth/register/prestador', '/auth/login',
    '/prestador/oportunidades', '/prestador/oportunidades/{id}', '/prestadores/{id}/perfil-publico'].includes(rota);
  expect(operacao.security).toEqual(publico ? [] : [{ bearerAuth: [] }]);
  for (const requisito of operacao.security) for (const nome of Object.keys(requisito)) {
    expect(documento.components.securitySchemes[nome]).toMatchObject({ type: 'http', scheme: 'bearer' });
  }
  for (const [, nome] of rota.matchAll(/\{([^}]+)\}/g)) {
    expect(operacao.parameters).toEqual(expect.arrayContaining([expect.objectContaining({ in: 'path', name: nome, required: true })]));
  }
  expect(operacao.responses['500'].content['application/json'].schema).toEqual({ $ref: '#/components/schemas/Erro' });
  if (!publico) expect(operacao.responses['401']).toBeDefined();
  for (const [codigo, resposta] of Object.entries(operacao.responses)) {
    expect(resposta.description).toEqual(expect.any(String));
    expect(resposta.content['application/json'].schema).toBeDefined();
    if (Number(codigo) >= 400) expect(resposta.content['application/json'].schema).toEqual({ $ref: '#/components/schemas/Erro' });
    percorrer(resposta.content, schema => {
      if (schema.type === 'object') expect(Object.keys(schema.properties || {}).length).toBeGreaterThan(0);
      if (schema.type === 'array') expect(schema.items).toBeDefined();
    });
  }
});

test('DTOs representam formatos reais de envelopes, uploads, limites e estados', () => {
  const schema = (rota, metodo, codigo = 200) => documento.paths[rota][metodo].responses[codigo].content['application/json'].schema;
  expect(schema('/auth/login', 'post').properties).toHaveProperty('data.$ref', '#/components/schemas/AutenticacaoDTO');
  expect(schema('/prestador/oportunidades/{id}', 'get').properties).toHaveProperty('dados.$ref', '#/components/schemas/OportunidadeDTO');
  expect(schema('/solicitacoes/{id}/avaliar', 'post', 201).properties).toHaveProperty('mensagem');
  expect(schema('/solicitacoes/{id}/avaliar', 'post', 201).properties).toHaveProperty('dados.$ref', '#/components/schemas/AvaliacaoDTO');
  for (const [rota, nome] of [['/solicitacoes', 'CriarSolicitacaoDTO'], ['/perfil/foto', 'FotoPerfilDTO'], ['/propostas/{propostaId}/mensagens', 'EnviarMensagemDTO']]) {
    expect(documento.paths[rota].post.requestBody.content['multipart/form-data'].schema).toEqual({ $ref: `#/components/schemas/${nome}` });
  }
  expect(documento.components.schemas.CriarSolicitacaoDTO.properties.anexos.maxItems).toBe(5);
  expect(documento.components.schemas.EnviarPropostaDTO.properties.prazo_dias).toMatchObject({ minimum: 1, maximum: 3650 });
  expect(documento.components.schemas.EnviarPropostaDTO.properties.validade_dias).toMatchObject({ minimum: 1, maximum: 365, default: 7 });
  expect(documento.components.schemas.MinhaPropostaDTO.properties.validade_ate).toEqual({ type: 'string', format: 'date-time' });
  const cadastro = documento.paths['/auth/register/prestador'].post.requestBody.content;
  expect(cadastro['application/json'].schema.$ref).toBe('#/components/schemas/CadastroPrestadorDTO');
  expect(cadastro['multipart/form-data'].schema.$ref).toBe('#/components/schemas/CadastroPrestadorMultipartDTO');
  expect(documento.components.schemas.CadastroPrestadorMultipartDTO.properties.categorias.type).toBe('string');
  expect(documento.components.schemas.PropostaDTO.properties.status.enum).toEqual(['ENVIADA', 'EM_ANALISE', 'ACEITA', 'RECUSADA']);
  expect(documento.paths['/auth/login'].post.responses['429']).toBeDefined();
  expect(documento.paths['/solicitacoes/{id}/custodia/simular'].post.responses['422']).toBeDefined();
  expect(documento.paths['/prestador/oportunidades'].get.responses['403']).toBeUndefined();
  expect(documento.components.schemas.UsuarioDTO.properties).not.toHaveProperty('senha_hash');
});

test('preserva os contratos locais dos dashboards e do perfil público', () => {
  const dashboard = documento.paths['/dashboards/prestador'].get;
  expect(dashboard.responses['200'].content['application/json'].schema.properties.dados.$ref).toBe('#/components/schemas/DashboardPrestadorDTO');
  expect(dashboard.description).toContain('America/Sao_Paulo');
  expect(documento.components.schemas.DashboardPrestadorDTO.properties.nota_reputacao.nullable).toBe(true);
  const indicadores = documento.components.schemas.DashboardPrestadorDTO;
  for (const campo of ['saldo_liberado', 'valor_em_custodia']) {
    expect(indicadores.required).toContain(campo);
    expect(indicadores.properties[campo]).toMatchObject({ type: 'number', minimum: 0 });
  }
  const publico = documento.paths['/prestadores/{id}/perfil-publico'].get;
  expect(publico.description).toContain('Reputação calculada de todas as avaliações reais');
  expect(publico.description).toContain('Não expõe email, CPF, telefone, endereço ou identificador do avaliador');
  expect(publico.parameters.find(p => p.name === 'limite').schema.maximum).toBe(50);
  const propriedades = publico.responses['200'].content['application/json'].schema.properties.data.properties;
  expect(propriedades).toHaveProperty('paginacao.properties.total_paginas');
  expect(propriedades).toHaveProperty('avaliacoes.items.properties.nome_avaliador');
  for (const privado of ['email', 'cpf', 'telefone', 'endereco', 'senha_hash']) expect(propriedades).not.toHaveProperty(privado);
});

test('merge por operação mantém metadados e respostas locais ao acrescentar schemas', () => {
  const anotada = { description: 'Descrição local', tags: ['Local'], responses: { 200: { description: 'Resultado local', headers: { Exemplo: { schema: { type: 'string' } } } }, 409: { description: 'Conflito local' } } };
  const resultado = helper.complementarOperacao(anotada, { saida: { type: 'string' }, publico: true });
  expect(resultado.description).toBe('Descrição local');
  expect(resultado.tags).toEqual(['Local']);
  expect(resultado.responses['200']).toMatchObject({ description: 'Resultado local', headers: anotada.responses[200].headers });
  expect(resultado.responses['409']).toMatchObject({ description: 'Conflito local', content: { 'application/json': { schema: { $ref: '#/components/schemas/Erro' } } } });
  expect(anotada.responses[200]).not.toHaveProperty('content');
});

test('JSON e interface Swagger são servidos pela aplicação', async () => {
  const resposta = await request(app).get('/api-docs.json').expect(200).expect('Content-Type', /json/);
  expect(resposta.body).toEqual(documento);
  await request(app).get('/api-docs/').expect(200).expect('Content-Type', /html/);
});

test('gera os mesmos contratos a partir de dist, fora do diretório de trabalho do backend', () => {
  const temporario = fs.mkdtempSync(path.join(os.tmpdir(), 'documentacao-api-'));
  try {
    for (const pasta of ['controllers', 'routes', 'config']) {
      fs.mkdirSync(path.join(temporario, 'dist', pasta), { recursive: true });
      const arquivos = pasta === 'config' ? ['openapi.ts'] : fs.readdirSync(path.join(raiz, pasta)).filter(nome => nome.endsWith('.ts'));
      for (const nome of arquivos) {
        const fonte = fs.readFileSync(path.join(raiz, pasta, nome), 'utf8');
        const codigo = ts.transpileModule(fonte, { compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2020, esModuleInterop: true, removeComments: false } }).outputText;
        fs.writeFileSync(path.join(temporario, 'dist', pasta, nome.replace(/\.ts$/, '.js')), codigo);
      }
    }
    const gerador = executar(path.join(temporario, 'dist/config/openapi.js'));
    expect(gerador.criarDocumentoOpenApi()).toEqual(documento);
  } finally {
    fs.rmSync(temporario, { recursive: true, force: true });
  }
});
