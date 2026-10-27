# Testes da US26

Dependências de teste: Jest 30.5.2 e Supertest 7.3.1. Não há dependência de seeds, servidor HTTP em execução ou ts-jest.

No diretório backend, com Node 22:

```sh
npm run build
DB_NAME_TEST=tcc_eloserv_test npx jest --runInBand
# Somente os fluxos reais:
DB_NAME_TEST=tcc_eloserv_test npx jest --selectProjects integracao --runInBand
# Segurança, dashboard e perfil, sem exigir banco:
npx jest --selectProjects unitarios --runInBand
```

O setup recusa DB_NAME_TEST ausente ou sem sufixo _test. Define NODE_ENV=test e DB_NAME=DB_NAME_TEST antes de carregar o app. Cria somente o banco validado, aplica as migrations reais via Sequelize CLI --env test e nunca executa seeds, DROP DATABASE, TRUNCATE ou sync force. A limpeza remove somente IDs gerados pela própria execução, em transação, e fecha a conexão. O banco de teste deve ser exclusivo desta execução; não execute duas instâncias da integração simultaneamente.

A configuração Docker existente publica MySQL em 127.0.0.1:3306, usuário root, senha root. Para outra instalação, use DB_HOST_TEST, DB_PORT_TEST, DB_USER_TEST e DB_PASSWORD_TEST. As variáveis comuns de desenvolvimento são substituídas no processo de teste. O segredo JWT é exclusivo dos testes. Falta de banco ou erro de migrations causa falha explícita; não há skip silencioso.

Os projetos Jest mantêm os testes sem banco separados da integração. O projeto unitario inclui **/*.test.js e **/*.test.cjs. O transformador executar-nativo.cjs preserva arquivos CommonJS Jest e executa suites node:test em subprocesso, mantendo ts-node e mocks nativos; qualquer falha do subprocesso falha o teste Jest.

Regressões de aceite exigem 409 para repetição e para concorrente após contratação, sem notificações duplicadas, além de somente uma vencedora para dois aceites simultâneos. Os testes usam os serviços reais e verificam as transições persistidas no MySQL.


Ampliação dos fluxos: validade comercial padrão e limites, aceite/renegociação expirados, custódia PIX/cartão, idempotência sequencial e simultânea, autorização financeira, reembolso e recontratação com outro ID de proposta (a linha de custódia é reaproveitada pelo contrato atual), liberação, conclusão concorrente com cancelamento, avaliações concorrentes na mesma solicitação e em solicitações distintas, cadastro multipart com PNG e consentimento textual, limpeza de foto após erro e rejeição de MIME. A limpeza das fotos bem-sucedidas remove apenas arquivos retornados pelos próprios cadastros de teste.

Após alterações nos services/models, compile novamente antes da integração. Para executar somente esta suíte, sem a suíte independente dos seeds:

```sh
DB_NAME_TEST=tcc_eloserv_test npx jest --selectProjects integracao --runInBand --runTestsByPath tests/fluxos.integracao.test.js
```
