# Documentos legais e atendimento de privacidade — US40

História: US40 · Jira: TCC-53 · Épico original: TCC-3. Versão inicial dos documentos: `2026-10-26.1`.

## Páginas e contato

- `/termos-de-uso` e `/politica-de-privacidade`: publicação vigente, sem login.
- `/termos-de-uso/2026-10-26.1` e `/politica-de-privacidade/2026-10-26.1`: endereços da versão publicada.
- `/privacidade`: contato público por e-mail e, com conta ativa, registro de aceite e protocolos próprios.
- `/admin/privacidade`: caixa administrativa, acessível pelo painel e protegida no backend por JWT e perfil ADMIN.

Responsável informado pelo usuário: Rodrigo Fernando Melo Dias da Silva. Contato público autorizado: rodrigogofernandomelo15@gmail.com. O telefone não foi necessário nem publicado. Os links de e-mail não enviam mensagens automaticamente.

O cadastro tem dois sinais inicialmente desmarcados: aceite dos Termos e ciência da Política. Ciência não é consentimento genérico para qualquer tratamento. Tratamentos opcionais que efetivamente dependam de consentimento precisam de finalidade e escolha próprias; esta etapa não adiciona marketing/rastreamento. O token de sessão e o perfil são mantidos em localStorage, conforme o cliente já existente.

## Contrato do cadastro

Além dos campos pessoais existentes, enviar:

```json
{
  "termos_uso_aceitos": true,
  "privacidade_ciente": true,
  "termos_uso_versao": "2026-10-26.1",
  "privacidade_versao": "2026-10-26.1"
}
```

JSON exige booleanos reais. Multipart profissional aceita a representação textual exata `true`. A versão precisa corresponder à vigente, publicada em `GET /api/v1/legal/documentos`. Ausência/coerção/versão divergente retorna 400 antes da persistência. O cliente deve recarregar e permitir nova leitura; nunca substituir a versão aceita silenciosamente.

O campo legado `termo_lgpd_aceito` continua reconhecido por compatibilidade, mas não é exigido pelo cadastro atual e não substitui os campos acima. Se informado com valor contraditório/inválido, é recusado. A data é gerada pelo servidor, não pelo cliente. Contas legadas ficam com novas colunas nulas: não se cria aceite retroativo a partir do booleano antigo.

## API do canal

| Método e caminho (prefixo `/api/v1`) | Acesso | Comportamento |
|---|---|---|
| `GET /legal/documentos` | Público | Versões, data, caminhos e contato públicos |
| `GET /privacidade/minha-central` | Titular autenticado | Registro de aceite e protocolos somente do JWT |
| `POST /privacidade/solicitacoes` | Titular autenticado | Tipo válido e descrição de 10 a 2000 caracteres; no máximo cinco protocolos pendentes por titular |
| `GET /admin/privacidade?pagina=1` | ADMIN | 50 protocolos por página, pendentes primeiro, com identificação mínima do titular |
| `PATCH /admin/privacidade/:id/resposta` | ADMIN | Resposta única de 10 a 2000 caracteres, autor/data do servidor e lock transacional |

Tipos: ACESSO, CORRECAO, EXCLUSAO, INFORMACAO e REVOGACAO. Portabilidade/bloqueio/anonimização podem ser explicados nos tipos indicados pelo formulário. Criar retorna 201; validação retorna 400, limite/repetição 409, ausência 404, autenticação 401 e perfil indevido 403. Contratos completos em `/api-docs` e `/api-docs.json` (51 operações nesta branch).

O protocolo não executa automaticamente exclusão, portabilidade ou revogação. O administrador deve verificar a identidade e analisar o fundamento, dados necessários e eventuais deveres de conservação, realizar o atendimento pertinente e registrar a resposta. O titular consulta essa resposta na central. Em falta de acesso à conta, usa o contato por e-mail. O atendimento é gratuito e deve observar os prazos legais aplicáveis; não há automação de prazo ou e-mail nesta entrega.

## Banco e demonstração

Migration: `20261026000001-documentos-e-solicitacoes-privacidade.js`. Acrescenta `termos_uso_versao`, `privacidade_versao`, `documentos_aceitos_em` anuláveis em usuarios e a tabela `solicitacoes_privacidade`. Não altera valores de contas anteriores.

```bash
cd backend
npx sequelize-cli db:migrate --config src/config/sequelize-cli.js --migrations-path src/migrations
npx sequelize-cli db:seed --seed 20261026000001-demo-privacidade.js --config src/config/sequelize-cli.js --seeders-path src/seeders
```

O seed cria somente um protocolo fictício para o solicitante demo existente; é idempotente, não sobrescreve uma resposta e não inventa aceite versionado. O `down` da migration remove a tabela e as colunas: não é reversão sem perda de registros; avaliar backup e retenção antes de usá-lo.

## Atualizar os documentos

1. Não editar o arquivo já publicado `frontend/src/conteudo/legal/2026-10-26.1.json` depois de coletados aceites.
2. Criar um novo arquivo de publicação e acrescentá-lo ao mapa em `textosLegais.ts`, preservando os anteriores. As rotas por versão são geradas a partir desse mapa.
3. Atualizar os dois manifestos `frontend/src/conteudo/documentos-legais.json` e `backend/src/config/documentos-legais.json` com versões, data e URLs correspondentes. O teste compara os manifestos e a publicação vigente.
4. Revisar o conteúdo para corresponder a código/fornecedores efetivos. Compilar frontend e backend juntos e comunicar mudanças relevantes; novas versões não reescrevem registros antigos.
5. A UI não força novo aceite de conta antiga nem implementa renovação de aceite após alterações. Caso esse fluxo seja necessário, registrar história adicional e manter histórico, sem sobrescrever prova anterior.

## Limites reais e operação fora da demonstração

- Pagamento é exclusivamente simulado. Não existe cobrança, gateway financeiro ou custódia real.
- Desativação bloqueia acesso e preserva histórico; não é exclusão/anonimização. Não há expurgo automático com prazo fixo nem ferramenta automática de exportação integral nesta etapa.
- Arquivos enviados continuam servidos por links diretos, inclusive anexos compartilhados em chat. A autorização do chat não torna esses links individuais privados. Essa limitação é declarada na Política; a proteção dos arquivos precisa ser revisada antes de aceitar conteúdo confidencial.
- Contas demo têm credenciais compartilhadas, inclusive administrativas. Antes de coletar dados reais, remover esse acesso de demonstração, revisar autenticação e permissões, definir hospedagem/fornecedores, retenção/backup e resposta a incidentes. Documentos não substituem esses controles.
- As páginas explicam a possibilidade de carregamento de Google Fonts conforme a identidade visual instalada. Mudança de infraestrutura exige revisão do aviso.
- Estes textos foram preparados para o protótipo acadêmico. A entrega não certifica conformidade integral; operação real exige revisão jurídica e operacional coerente com as atividades efetivas.

## Evidências

- Integração usa MySQL exclusivo `tcc_servico_facil_privacidade_test`; a suíte completa passou com 13 suítes e 238 testes, além do build de produção Next.js.
- Cobertos sinais/versões, relógio do servidor, metadados públicos, ausência de aceite retroativo, isolamento por JWT, autorização administrativa, validações, limite pendente, paginação e resposta única/concorrente.
- Interface: documentos e contato públicos, dois sinais desmarcados nos cadastros, protocolo fictício criado e respondido por admin, resposta conferida pelo titular e texto de desativação revisado. Novos cadastros com aceite versionado foram validados pela API/integracão; não foi criado outro aceite pela interface nesta etapa.
- Celular: documentos versionados, cadastros e central em 390 × 844, além da caixa administrativa com paginação; sem transbordamento horizontal na medição. Não equivale a teste em aparelho físico.

## Referências oficiais consultadas em 26/10/2026

- [Lei nº 13.709/2018 (LGPD), texto compilado](https://www.planalto.gov.br/ccivil_03/_ato2015-2018/2018/lei/l13709compilado.htm).
- [ANPD — Direito dos Titulares](https://www.gov.br/anpd/pt-br/assuntos/titular-de-dados/direito-dos-titulares).
- [Google Fonts — informações de privacidade](https://developers.google.com/fonts/faq/privacy).
