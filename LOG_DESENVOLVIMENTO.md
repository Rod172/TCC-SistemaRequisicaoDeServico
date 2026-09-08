# 📝 Log de Desenvolvimento - Sistema de Requisição de Serviço (TCC)

Este arquivo registra o histórico incremental de desenvolvimento, decisões de arquitetura, testes executados e a **documentação com referências oficiais de todas as bibliotecas de terceiros**, conforme a **Regra 2** e a **Regra 5** definidas em `.agents/AGENTS.md`.

---

## 📚 Referências Oficiais das Bibliotecas e Dependências Adotadas

Em estrito cumprimento à **Regra 2**, a tabela abaixo mapeia todas as bibliotecas de terceiros adicionadas nesta etapa inicial do projeto, acompanhadas de suas versões, finalidades e links para a documentação oficial.

### ⚙️ Backend (Node.js / Express com TypeScript)

| Biblioteca | Versão | Propósito / Finalidade no Projeto | Referência Oficial / Link |
|---|---|---|---|
| **Express.js** | `^4.19.2` | Framework web para criação de rotas, middlewares e API REST | [expressjs.com](https://expressjs.com/pt-br/) |
| **TypeScript** | `^5.4.5` | Superconjunto tipado de JavaScript para segurança em tempo de compilação | [typescriptlang.org](https://www.typescriptlang.org/) |
| **ts-node-dev** | `^2.0.0` | Servidor de desenvolvimento Node.js com suporte e live reload para TypeScript | [github.com/wclr/ts-node-dev](https://github.com/wclr/ts-node-dev) |
| **Sequelize ORM** | `^6.37.3` | Mapeamento Objeto-Relacional (ORM) para o banco de dados MySQL | [sequelize.org](https://sequelize.org/docs/v6/) |
| **mysql2** | `^3.9.8` | Driver de alta performance para conexão com o MySQL | [github.com/sidorares/node-mysql2](https://github.com/sidorares/node-mysql2) |
| **jsonwebtoken** | `^9.0.2` | Emissão e validação de tokens JWT para autenticação segura | [jwt.io](https://jwt.io/) |
| **bcryptjs** | `^2.4.3` | Hash seguro de senhas com algoritmo Bcrypt (10 salt rounds) | [github.com/dcodeIO/bcrypt.js](https://github.com/dcodeIO/bcrypt.js) |
| **dotenv** | `^16.4.5` | Carregamento de variáveis de ambiente a partir do `.env` | [github.com/motdotla/dotenv](https://github.com/motdotla/dotenv) |
| **cors** | `^2.8.5` | Middleware de liberação de origens cruzadas no navegador | [github.com/expressjs/cors](https://github.com/expressjs/cors) |
| **helmet** | `^7.1.0` | Middleware de proteção e sanitização dos cabeçalhos HTTP | [helmetjs.github.io](https://helmetjs.github.io/) |
| **swagger-ui-express** | `^5.0.1` | Interface gráfica interativa para documentação da API REST | [swagger.io](https://swagger.io/tools/swagger-ui/) |
| **swagger-jsdoc** | `^6.2.8` | Gerador de especificação OpenAPI 3.0 via comentários JSDoc | [github.com/Sknfy/swagger-jsdoc](https://github.com/Sknfy/swagger-jsdoc) |
| **Sequelize CLI** | `^6.6.2` | Ferramenta de linha de comando para automação de Migrations/Seeders | [github.com/sequelize/cli](https://github.com/sequelize/cli) |
| **Multer** | `^2.3.0` | Middleware Express para parsing de `multipart/form-data` e upload em disco da foto de perfil (US04) | [github.com/expressjs/multer](https://github.com/expressjs/multer) |
| **@types/jsonwebtoken** | `^9.0.10` | Definições de tipos TypeScript para a biblioteca `jsonwebtoken` | [npmjs.com/package/@types/jsonwebtoken](https://www.npmjs.com/package/@types/jsonwebtoken) |
| **@types/multer** | `^2.2.0` | Definições de tipos TypeScript para a biblioteca `multer` | [npmjs.com/package/@types/multer](https://www.npmjs.com/package/@types/multer) |

### 🎨 Frontend (Next.js 14 / React com TypeScript)

| Biblioteca | Versão | Propósito / Finalidade no Projeto | Referência Oficial / Link |
|---|---|---|---|
| **Next.js** | `^14.2.3` | Framework React para produção com App Router, SSR e roteamento | [nextjs.org](https://nextjs.org/docs) |
| **React** | `^18.3.1` | Biblioteca declarativa para criação da interface do usuário | [react.dev](https://react.dev/) |
| **React DOM** | `^18.3.1` | Renderizador React para o DOM do navegador | [react.dev/reference/react-dom](https://react.dev/reference/react-dom) |
| **TypeScript** | `^5.4.5` | Tipagem estática em componentes JSX (`.tsx`) e utilitários | [typescriptlang.org](https://www.typescriptlang.org/) |
| **Axios** | `^1.7.2` | Cliente HTTP com suporte a interceptores para anexar o token JWT | [axios-http.com](https://axios-http.com/docs/intro) |
| **Lucide React** | `^0.383.0` | Conjunto de ícones vetoriais modernos para a interface | [lucide.dev](https://lucide.dev/) |

### 🐳 DevOps & Infraestrutura

| Ferramenta | Propósito / Finalidade no Projeto | Referência Oficial / Link |
|---|---|---|
| **Docker** | Plataforma de conteinerização de software | [docker.com](https://www.docker.com/) |
| **Docker Compose** | Ferramenta de orquestração de multi-containers (MySQL 8.0, Backend, Frontend) | [docs.docker.com/compose](https://docs.docker.com/compose/) |

---

## 📅 Histórico de Desenvolvimento

### 🟢 Sprint 1 - Feed de Oportunidades público (padrão classificados, tipo OLX) + navbar com busca embutida
- **Data**: 08/09/2026
- **Resumo**: Usuário pediu pra seguir o padrão de sites de classificados (OLX): dá pra ver os anúncios (aqui, as solicitações abertas no feed do prestador) sem estar logado, só precisa de conta pra agir (enviar proposta). A home também foi reajustada pra ter a busca embutida na própria barra de navegação (junto com o botão de ação principal), em vez de um cartão de busca grande abaixo — mais compacto, mais "sistema real".
- **Backend**: novo [`optionalAuthMiddleware.ts`](file:///wsl.localhost/Ubuntu/home/rod/projetos/TCC-SistemaRequisicaoDeServico/backend/src/middlewares/optionalAuthMiddleware.ts) — decodifica o JWT se presente mas nunca bloqueia a requisição. `GET /api/v1/prestador/oportunidades` e `GET /api/v1/prestador/oportunidades/:id` passaram a usá-lo (público); `POST .../propostas` continua exigindo `authMiddleware` de verdade. `oportunidadeService.buscarOportunidade` agora aceita `prestadorId: string | null`, retornando `pode_enviar_proposta: false` e `minha_proposta: null` pra visitante anônimo.
- **Frontend**: `/oportunidades` e `/oportunidades/[id]` não redirecionam mais pro login ao carregar — só quando o visitante tenta enviar proposta sem estar logado, aí a tela mostra "Entre para enviar uma proposta" com um botão pra `/login`, em vez do formulário. A busca da home foi movida pra dentro da navbar (ao lado da logo), com um botão de CTA "Nova Solicitação" destacado do lado direito — visível mesmo para visitantes não autenticados.
- **Testes realizados**: `tsc --noEmit` limpo nos dois lados. Confirmado via `curl` sem nenhum header `Authorization`: listagem (200, dados reais retornados), detalhe (200, com `pode_enviar_proposta: false`), e envio de proposta sem token continua bloqueado (401). Aproveitei pra limpar do banco 3 solicitações de teste ("lixo") que tinham ficado da investigação do bug do guard `exigirSolicitante`.

---

### 🟢 Sprint 1 - Home com busca central (estilo Google/Uber) + regra "admin vê tudo"
- **Data**: 08/09/2026
- **Resumo**: Dois ajustes de UX na home a pedido do usuário. Primeiro, corrigido um descuido: o card "Nova Solicitação" só tinha sido adicionado pro perfil `SOLICITANTE`, deixando o `ADMIN` sem acesso mesmo o backend já permitindo — extraída uma variável `isAdmin` explícita pra que a regra "admin vê todos os atalhos, de qualquer perfil" fique óbvia e não se perca de novo em adições futuras. Segundo, a home deixou de ser uma grade de cards e virou uma busca central: o usuário logado vê um campo de busca grande (rótulo e destino adaptados ao perfil — solicitante busca em "Minhas Solicitações", prestador/admin busca em "Oportunidades") e, embaixo, links pequenos só para o que a busca não cobre (Nova Solicitação, Painel Admin, Meu Perfil).
- **Arquivos alterados**: [`frontend/src/app/page.tsx`](file:///wsl.localhost/Ubuntu/home/rod/projetos/TCC-SistemaRequisicaoDeServico/frontend/src/app/page.tsx) (busca central + regra `isAdmin`), [`frontend/src/app/minhas-solicitacoes/page.tsx`](file:///wsl.localhost/Ubuntu/home/rod/projetos/TCC-SistemaRequisicaoDeServico/frontend/src/app/minhas-solicitacoes/page.tsx) e [`frontend/src/app/oportunidades/page.tsx`](file:///wsl.localhost/Ubuntu/home/rod/projetos/TCC-SistemaRequisicaoDeServico/frontend/src/app/oportunidades/page.tsx) (agora leem o filtro `busca` inicial da URL via `useSearchParams`, pra o link vindo da home já chegar filtrado).
- **Testes realizados**: `tsc --noEmit` limpo. Confirmado via `curl` que `/minhas-solicitacoes?busca=tomadas` e `/oportunidades?busca=pintura` respondem 200 e aplicam o filtro (log do Next.js mostra a rota recebendo a query string corretamente).

---

### 🟢 Sprint 1 - Correção crítica: `api.js` obsoleto quebrando a autenticação no navegador
- **Data**: 08/09/2026
- **Resumo**: Usuário reportou que o token de sessão "sumia" ao navegar entre páginas, forçando login repetido. Após uma investigação longa (logs de diagnóstico no interceptor do axios e no backend, inspeção do DevTools do navegador), foi encontrado `frontend/src/services/api.js` — um arquivo remanescente da versão em JavaScript puro do projeto (anterior à migração para TypeScript) que **coexistia** com `api.ts`. O bundler do Next.js resolvia `@/services/api` para o `.js` antigo, cujo interceptor lia o token de uma chave de `localStorage` diferente (`@TCC:token`) da usada pelo resto do app (`@ServicoFacil:token`) — por isso o cabeçalho `Authorization` nunca era enviado em nenhuma requisição feita pelo navegador, em nenhuma tela, desde a criação das telas autenticadas.
- **Correção**: arquivo `api.js` removido; `.next/` limpo e frontend reiniciado do zero para garantir que o bundle correto fosse servido. Confirmado via inspeção do chunk compilado que a chave errada não aparece mais.
- **Descoberta relacionada (ambiente)**: durante a mesma investigação, um teste de autorização no backend (`exigirSolicitante`, US05) parecia não funcionar mesmo com o código correto — causa raiz foi o `ts-node-dev --respawn` não detectar de forma confiável edições salvas via UNC do Windows (`\\wsl.localhost\...`), continuando a rodar uma versão antiga do arquivo sem erro nenhum. Resolvido matando o processo manualmente e subindo um `npm run dev` novo. Documentado em memória do projeto para não repetir a investigação.

---

### 🟢 Sprint 1 - US05: Publicação de Nova Solicitação de Serviço
- **Data**: 08/09/2026
- **Resumo**: Última história pendente do Épico 2 (junto com a US07, ainda não feita). Implementado o formulário completo de publicação de solicitação, incluindo upload de anexos.
- **Banco de Dados**: Migrations [`20260908000002-add-prazo-desejado-solicitacoes.js`](file:///wsl.localhost/Ubuntu/home/rod/projetos/TCC-SistemaRequisicaoDeServico/backend/src/migrations/20260908000002-add-prazo-desejado-solicitacoes.js) (`prazo_desejado_dias` em `solicitacoes`) e [`20260908000003-create-anexos-solicitacao.js`](file:///wsl.localhost/Ubuntu/home/rod/projetos/TCC-SistemaRequisicaoDeServico/backend/src/migrations/20260908000003-create-anexos-solicitacao.js) (nova tabela `anexos_solicitacao`, FK para `solicitacoes`).
- **Backend**:
  - [`uploadAnexosMiddleware.ts`](file:///wsl.localhost/Ubuntu/home/rod/projetos/TCC-SistemaRequisicaoDeServico/backend/src/middlewares/uploadAnexosMiddleware.ts): Multer configurado para até 5 arquivos de 10MB (imagens ou PDF).
  - `solicitacaoService.criarSolicitacao`: valida título/descrição, cria a solicitação com status `ABERTA` e os anexos numa única transação Sequelize. Endpoint `POST /api/v1/solicitacoes`, restrito a `SOLICITANTE`/`ADMIN` (guard `exigirSolicitante` no controller).
  - Anexos incluídos também nas consultas de detalhe já existentes (`buscarComPropostas` para o solicitante, `buscarOportunidade` para o prestador) — fecha uma lacuna da US09 (critério "fotos/anexos" não estava implementado).
- **Frontend**: [`frontend/src/app/nova-solicitacao/page.tsx`](file:///wsl.localhost/Ubuntu/home/rod/projetos/TCC-SistemaRequisicaoDeServico/frontend/src/app/nova-solicitacao/page.tsx) — formulário com upload por arrastar-e-soltar. Botão "Nova Solicitação" adicionado em `/minhas-solicitacoes`. Anexos exibidos como links clicáveis nas telas de detalhe do solicitante e do prestador.
- **Testes realizados**: `tsc --noEmit` limpo. Fluxo ponta a ponta via `curl`: criação com anexo real (confirmado nas tabelas `solicitacoes` e `anexos_solicitacao`), validação de título curto (400), solicitação aparecendo no feed do prestador filtrado por categoria com o anexo visível no detalhe, e bloqueio de criação por um Prestador (403) — esse último só passou a funcionar depois de contornar o problema do watcher do `ts-node-dev` descrito acima.

---

### 🟢 Sprint 1 - Home reformulada + página `/status`
- **Data**: 08/09/2026
- **Resumo**: A home tinha cara de landing page de marketing (hero grande, badges, seção de status da API e stack tecnológica misturadas com a navegação real do app). Reformulada para parecer a tela inicial de um sistema de verdade: barra de navegação fixa no topo (logo, sessão do usuário ou botões Entrar/Criar conta), atalhos de ação direto abaixo, e um rodapé simples com link para a nova página `/status`. As seções "Status da API Backend" e "Stack Tecnológica" foram movidas para [`frontend/src/app/status/page.tsx`](file:///wsl.localhost/Ubuntu/home/rod/projetos/TCC-SistemaRequisicaoDeServico/frontend/src/app/status/page.tsx), acessível a qualquer momento pelo rodapé.
- **Testes realizados**: `tsc --noEmit` limpo; confirmado via `curl` que a home não contém mais o texto de status da API e que `/status` contém as duas seções movidas.

---

### 🟢 Sprint 1 - US27: Implementação do Painel Administrativo de Usuários e Moderação
- **Data**: 08/09/2026
- **Resumo**: Implementação completa da US27 (até então só existia a história e a conta de demonstração — ver entrada anterior). Trocar de conta o tempo todo pra testar cada perfil estava incômodo, então o pedido foi priorizar essa história antes das pendentes (US05/US07).
- **Banco de Dados**: Migration [`20260908000001-add-auditoria-status-usuarios.js`](file:///wsl.localhost/Ubuntu/home/rod/projetos/TCC-SistemaRequisicaoDeServico/backend/src/migrations/20260908000001-add-auditoria-status-usuarios.js) adiciona `status_alterado_por` (FK para `usuarios.id`) e `status_alterado_em` em `usuarios`, satisfazendo o critério de aceite "cada ação administrativa registra quem executou e quando" sem precisar de uma tabela de auditoria completa (fora de escopo — nenhuma outra US pede isso).
- **Backend**:
  - [`adminMiddleware.ts`](file:///wsl.localhost/Ubuntu/home/rod/projetos/TCC-SistemaRequisicaoDeServico/backend/src/middlewares/adminMiddleware.ts): bloqueia com 403 quem não é `tipo_perfil = ADMIN` (usado depois do `authMiddleware`).
  - [`adminService.ts`](file:///wsl.localhost/Ubuntu/home/rod/projetos/TCC-SistemaRequisicaoDeServico/backend/src/services/adminService.ts): `listarUsuarios` (filtro por tipo/status/busca, exclui `senha_hash`), `alterarStatusUsuario` (ativa/desativa, grava auditoria, **impede o admin de desativar a própria conta**), `listarSolicitacoes` (todas as solicitações da plataforma, independente do dono, com dados do solicitante).
  - [`adminController.ts`](file:///wsl.localhost/Ubuntu/home/rod/projetos/TCC-SistemaRequisicaoDeServico/backend/src/controllers/adminController.ts) e [`adminRoutes.ts`](file:///wsl.localhost/Ubuntu/home/rod/projetos/TCC-SistemaRequisicaoDeServico/backend/src/routes/adminRoutes.ts), registrados em `/api/v1/admin` no `app.ts`: `GET /admin/usuarios`, `PATCH /admin/usuarios/:id/status`, `GET /admin/solicitacoes`.
- **Frontend**: [`frontend/src/app/admin/page.tsx`](file:///wsl.localhost/Ubuntu/home/rod/projetos/TCC-SistemaRequisicaoDeServico/frontend/src/app/admin/page.tsx) — painel com 2 abas (Usuários: tabela com filtro por perfil/status/busca e botão ativar/desativar por linha; Solicitações: lista de todas as solicitações da plataforma com filtro por status). Acesso checado tanto no client (redireciona pra home se `tipo_perfil !== ADMIN`) quanto no servidor (403 real). Home ganhou o card "Painel Admin" para usuários `ADMIN`.
- **Testes realizados**: `npx tsc --noEmit` limpo nos dois lados. Fluxo ponta a ponta via `curl`: listagem geral e filtrada (por tipo e por busca) de usuários, listagem de todas as solicitações independente de dono, desativação de um usuário (confirmando que ele não consegue mais logar depois) e reativação, bloqueio de auto-desativação do próprio admin (400), e bloqueio de acesso às rotas `/admin/*` por um Solicitante (403). Página `/admin` carregada no Next.js em execução sem erro.
- **Jira**: ticket `TCC-39` (US27) movido para o status "Concluído".

---

### 🟢 Sprint 1 - Regra 6: Sincronização Obrigatória Backlog ↔ Jira + Script de Importação Reutilizável
- **Data**: 08/09/2026
- **Resumo**: Adicionada a **Regra 6** em todos os arquivos de convenção de IA (`CLAUDE.md`, `AGENTS.md`, `.agents/AGENTS.md`, `.cursorrules`, `.windsurfrules`, `.github/copilot-instructions.md`): toda mudança de escopo que não esteja coberta por uma História de Usuário já existente no `historia.md` precisa virar uma nova História (mesmo formato das demais) e ser importada para o Jira. Para viabilizar isso de forma repetível, foi criado o script `scripts/jira/importar_historia.py`, que lê um Épico e uma ou mais Histórias diretamente do `historia.md` (título, Como/Quero/Para que, Critérios de Aceite, Tarefas Técnicas, prioridade MoSCoW e Story Points da matriz) e cria os tickets correspondentes no Jira via API REST.
- **Credenciais**: guardadas em `scripts/jira/.jira-credentials.json` (fora do controle de versão — ver `.gitignore`), nunca no código nem em texto plano em documentação.
- **Descobertas sobre o Jira do projeto** (registradas aqui para não repetir o erro): a chave real do projeto é **`TCC`** (não `SCRUM`, como constava incorretamente em anotações anteriores) em `https://rfmdesenvolvimento.atlassian.net`; o tipo de issue para histórias se chama **"História"** (não "Story"); é um projeto *team-managed*, então o vínculo História→Épico é feito pelo campo `parent`, não por um campo customizado de "Epic Link"; e o endpoint antigo `GET /rest/api/2/search` foi descontinuado pela Atlassian (retorna `410 Gone`) — o script usa `POST /rest/api/3/search/jql`.
- **Uso**: `python3 scripts/jira/importar_historia.py "Título do Épico" US27 [US28 ...]`. Reaproveita o Épico se já existir um com o mesmo título; cria um novo caso contrário.
- **Teste realizado**: importação real da **US27** (criada nesta mesma sessão) — Épico 10 criado como `TCC-38`, História como `TCC-39` (vinculada como filha, 8 Story Points, descrição formatada). Conferido via `GET /rest/api/2/issue/{key}` que o `parent`, o tipo, os pontos e a descrição ficaram corretos.

---

### 🟢 Sprint 1 - US27 (nova): Conta de Administrador para Acesso e Teste da Plataforma
- **Data**: 08/09/2026
- **Resumo**: O sistema não tinha nenhuma conta com `tipo_perfil = ADMIN` cadastrada nem qualquer história de backlog cobrindo gestão administrativa da plataforma. Foi criada a **US27 - Painel Administrativo de Usuários e Moderação** no `historia.md` (novo **Épico 10: Administração e Gestão da Plataforma**), descrevendo o escopo completo (listar/filtrar usuários, ativar/desativar contas, listar todas as solicitações independente do dono). A implementação do painel em si (rotas `/api/v1/admin/*` e tela `/admin`) ainda **não foi feita** — só a história e a conta de demonstração.
- **O que foi feito agora**: usuário `ADMIN` de demonstração adicionado ao seeder (`demo.admin@servicofacil.com` / `Demo@123`) para a banca/o usuário conseguir logar e testar a plataforma sob esse perfil. Como ainda não existe painel administrativo, o acesso ao feed de oportunidades do prestador (`/api/v1/prestador/oportunidades`, antes restrito a `tipo_perfil = PRESTADOR`) foi liberado também para `ADMIN`, para que essa conta consiga navegar/testar esse fluxo sem precisar logar como prestador. `/api/v1/solicitacoes/minhas` já funciona para qualquer perfil autenticado (é escopado pelo dono, retorna lista vazia pra quem não tem solicitações — não gera erro).
- **Arquivos alterados**: [`historia.md`](file:///wsl.localhost/Ubuntu/home/rod/projetos/TCC-SistemaRequisicaoDeServico/historia.md) (US27 + Épico 10 + linha na Matriz MoSCoW), [`20260901000001-demo-solicitacoes.js`](file:///wsl.localhost/Ubuntu/home/rod/projetos/TCC-SistemaRequisicaoDeServico/backend/src/seeders/20260901000001-demo-solicitacoes.js) (usuário admin), [`oportunidadeController.ts`](file:///wsl.localhost/Ubuntu/home/rod/projetos/TCC-SistemaRequisicaoDeServico/backend/src/controllers/oportunidadeController.ts) (guard `exigirPrestador` passou a aceitar `ADMIN`), [`frontend/src/app/page.tsx`](file:///wsl.localhost/Ubuntu/home/rod/projetos/TCC-SistemaRequisicaoDeServico/frontend/src/app/page.tsx) (card "Oportunidades" na home também aparece pra `ADMIN`).
- **Testes realizados**: login como admin, `GET /api/v1/perfil` (200), `GET /api/v1/prestador/oportunidades` (200, antes retornava 403), `GET /api/v1/solicitacoes/minhas` (200, lista vazia sem erro). `tsc --noEmit` limpo nos dois lados.
- **Pendente**: implementar de fato as rotas administrativas (`GET/PATCH /api/v1/admin/usuarios`, `GET /api/v1/admin/solicitacoes`) e a tela `/admin` descritas na US27 — hoje a conta admin só empresta acesso a telas que já existem, não tem nenhuma funcionalidade exclusiva de administração ainda.

---

### 🟢 Sprint 1 - US08, US09 e US10: Feed de Oportunidades, Detalhe e Envio de Proposta pelo Prestador
- **Data**: 08/09/2026
- **Resumo**: Outro integrante do grupo prototipou essas três histórias fora do projeto oficial, num app solto (`feed-oportunidades-prestadores/` + `feed-oportunidades-orcamento-cliente-new.zip`, ambos removidos do repositório após a portagem), em JavaScript puro, Vite/React, com tabelas próprias (`oportunidades_servicos`, `propostas_oportunidades`, `prestadores`) e sem autenticação real (header fake `x-prestador-id`). Foi identificado, mapeado contra o `historia.md` e portado para a stack oficial, reaproveitando as tabelas `solicitacoes`/`propostas` já criadas na portagem da US06/US11/US12 em vez de duplicar schema — só foram adicionadas as colunas que faltavam (`categoria`, `cidade`, `bairro`, `orcamento_cliente`) em `solicitacoes`.
- **Correção em relação ao protótipo**: o endpoint de detalhe do protótipo só buscava solicitações com status `ABERTA`, então depois que o prestador enviava a proposta (e a solicitação virava `EM_NEGOCIACAO`) a própria tela de detalhe passava a dar 404 pra ele — o prestador perdia o acesso à proposta que acabou de enviar. Corrigido no port: o detalhe busca a solicitação independente do status, e `pode_enviar_proposta` agora também verifica `status === 'ABERTA'`.
- **Banco de Dados**: Migration [`20260901000006-add-campos-feed-solicitacoes.js`](file:///wsl.localhost/Ubuntu/home/rod/projetos/TCC-SistemaRequisicaoDeServico/backend/src/migrations/20260901000006-add-campos-feed-solicitacoes.js). Seeder de demonstração atualizado (`categoria`/`cidade`/`bairro`/`orcamento_cliente` nas 3 solicitações existentes, mais uma 4ª solicitação `ABERTA` de categoria "Pintura" em outra cidade, para dar o que filtrar no feed).
- **Backend**:
  - [`oportunidadeService.ts`](file:///wsl.localhost/Ubuntu/home/rod/projetos/TCC-SistemaRequisicaoDeServico/backend/src/services/oportunidadeService.ts): feed com filtros de categoria/cidade/bairro/busca e opções de filtro disponíveis (US08); detalhe com dados do cliente e da proposta já enviada pelo prestador, se houver (US09); envio de proposta em transação com `lock: transaction.LOCK.UPDATE` para evitar corrida entre propostas simultâneas, bloqueando oportunidade fechada e proposta duplicada do mesmo prestador, e movendo a solicitação para `EM_NEGOCIACAO` quando ainda estava `ABERTA` (US10 — o protótipo não fazia essa transição de status).
  - [`oportunidadeController.ts`](file:///wsl.localhost/Ubuntu/home/rod/projetos/TCC-SistemaRequisicaoDeServico/backend/src/controllers/oportunidadeController.ts) e [`oportunidadeRoutes.ts`](file:///wsl.localhost/Ubuntu/home/rod/projetos/TCC-SistemaRequisicaoDeServico/backend/src/routes/oportunidadeRoutes.ts), registrados em `/api/v1/prestador` no `app.ts`, protegidos por JWT e restritos a `tipo_perfil = PRESTADOR` (403 para outros perfis).
- **Frontend**: [`frontend/src/app/oportunidades/page.tsx`](file:///wsl.localhost/Ubuntu/home/rod/projetos/TCC-SistemaRequisicaoDeServico/frontend/src/app/oportunidades/page.tsx) (feed com busca e filtros de categoria/cidade/bairro/ordenação) e [`frontend/src/app/oportunidades/[id]/page.tsx`](file:///wsl.localhost/Ubuntu/home/rod/projetos/TCC-SistemaRequisicaoDeServico/frontend/src/app/oportunidades/%5Bid%5D/page.tsx) (detalhe com orçamento do cliente, dados do solicitante e formulário de proposta, ou resumo da proposta já enviada). A página inicial ganhou um atalho "Oportunidades" para usuários logados com `tipo_perfil = PRESTADOR`.
- **Testes realizados**: `npx tsc --noEmit` limpo no backend e no frontend. Fluxo ponta a ponta validado via `curl`: listagem geral e filtrada por categoria/busca, detalhe com `pode_enviar_proposta`/`minha_proposta`, envio de proposta (confirmando a mudança de status para `EM_NEGOCIACAO` e o sumiço do feed de `ABERTA`), bloqueio de segunda proposta do mesmo prestador (409), bloqueio de acesso por um Solicitante (403), validação de mensagem curta (400), e reabertura do detalhe após a mudança de status (confirmando a correção do bug herdado do protótipo). Páginas `/oportunidades` e `/oportunidades/[id]` carregadas no Next.js em execução sem erro.

---

### 🟢 Sprint 1 - US06, US11 e US12: Minhas Solicitações, Comparação de Propostas e Aceite de Contratação
- **Data**: 01/09/2026
- **Resumo**: Um integrante do grupo havia prototipado essas três histórias fora do projeto oficial, num app solto (`minhas-solicitacoes/`, removido do repositório após a portagem) em JavaScript puro, Vite/React e sem autenticação real (usava um header fake `x-solicitante-id`). O protótipo foi identificado, mapeado contra o `historia.md` e portado integralmente para a stack oficial do TCC (TypeScript, Sequelize com UUID, JWT via `authMiddleware`, Next.js App Router), incluindo uma funcionalidade extra de renegociação de valor que o protótipo tinha mas não está descrita em nenhuma US do backlog.
- **Banco de Dados**: Migrations [`20260901000004-create-solicitacoes.js`](file:///wsl.localhost/Ubuntu/home/rod/projetos/TCC-SistemaRequisicaoDeServico/backend/src/migrations/20260901000004-create-solicitacoes.js) e [`20260901000005-create-propostas.js`](file:///wsl.localhost/Ubuntu/home/rod/projetos/TCC-SistemaRequisicaoDeServico/backend/src/migrations/20260901000005-create-propostas.js), com `solicitante_id` e `prestador_id` como FK reais para `usuarios.id` (o protótipo usava uma tabela `solicitantes` própria e um campo de texto livre `prestadorNome`). Seeder de demonstração [`20260901000001-demo-solicitacoes.js`](file:///wsl.localhost/Ubuntu/home/rod/projetos/TCC-SistemaRequisicaoDeServico/backend/src/seeders/20260901000001-demo-solicitacoes.js) cria 1 solicitante e 2 prestadores demo, e 3 solicitações em estágios diferentes (`ABERTA` com 2 propostas concorrentes, `EM_NEGOCIACAO` com contraproposta já enviada, `CONTRATADA` com uma proposta aceita e outra recusada), já que as histórias de criação de solicitação/proposta (US05, US10) ainda não existem.
- **Backend**:
  - Models [`Solicitacao.ts`](file:///wsl.localhost/Ubuntu/home/rod/projetos/TCC-SistemaRequisicaoDeServico/backend/src/models/Solicitacao.ts) e [`Proposta.ts`](file:///wsl.localhost/Ubuntu/home/rod/projetos/TCC-SistemaRequisicaoDeServico/backend/src/models/Proposta.ts), com associações registradas em [`models/index.ts`](file:///wsl.localhost/Ubuntu/home/rod/projetos/TCC-SistemaRequisicaoDeServico/backend/src/models/index.ts).
  - [`solicitacaoService.ts`](file:///wsl.localhost/Ubuntu/home/rod/projetos/TCC-SistemaRequisicaoDeServico/backend/src/services/solicitacaoService.ts): listagem com `GROUP BY`/contagem de propostas (US06), busca da solicitação com propostas + prestador + reputação para comparação (US11), aceite/recusa em transação Sequelize que rejeita as concorrentes e contrata (US12), e renegociação de valor.
  - [`solicitacaoController.ts`](file:///wsl.localhost/Ubuntu/home/rod/projetos/TCC-SistemaRequisicaoDeServico/backend/src/controllers/solicitacaoController.ts) e [`solicitacaoRoutes.ts`](file:///wsl.localhost/Ubuntu/home/rod/projetos/TCC-SistemaRequisicaoDeServico/backend/src/routes/solicitacaoRoutes.ts), registrados em `/api/v1/solicitacoes` no [`app.ts`](file:///wsl.localhost/Ubuntu/home/rod/projetos/TCC-SistemaRequisicaoDeServico/backend/src/app.ts) e protegidos por JWT (`authMiddleware`), com documentação Swagger.
  - [`HttpError.ts`](file:///wsl.localhost/Ubuntu/home/rod/projetos/TCC-SistemaRequisicaoDeServico/backend/src/utils/HttpError.ts): pequena classe de erro com status HTTP embutido, criada para o service sinalizar 400/404/409 sem depender do Express.
- **Frontend**: [`frontend/src/app/minhas-solicitacoes/page.tsx`](file:///wsl.localhost/Ubuntu/home/rod/projetos/TCC-SistemaRequisicaoDeServico/frontend/src/app/minhas-solicitacoes/page.tsx) (listagem com filtro por status e busca por título) e [`frontend/src/app/minhas-solicitacoes/[id]/page.tsx`](file:///wsl.localhost/Ubuntu/home/rod/projetos/TCC-SistemaRequisicaoDeServico/frontend/src/app/minhas-solicitacoes/%5Bid%5D/page.tsx) (comparação de propostas com nome/foto/reputação do prestador, destaque de menor preço, aceitar/recusar/renegociar). A página inicial ([`page.tsx`](file:///wsl.localhost/Ubuntu/home/rod/projetos/TCC-SistemaRequisicaoDeServico/frontend/src/app/page.tsx)) passou a exibir um atalho "Minhas Solicitações" para usuários logados com `tipo_perfil = SOLICITANTE`.
- **Testes realizados**: `npx tsc --noEmit` limpo no backend e no frontend. Fluxo ponta a ponta validado via `curl` com o usuário de demonstração: login, listagem geral e filtrada por status/busca, detalhe com propostas e dados do prestador (nome, foto, nota de reputação), aceite de proposta (confirmando que a solicitação virou `CONTRATADA` e a proposta concorrente virou `RECUSADA` automaticamente), renegociação de valor, rejeição de ação inválida (400) e tentativa de acessar solicitação inexistente/de outro usuário (404). As páginas `/minhas-solicitacoes` e `/minhas-solicitacoes/[id]` também foram carregadas no Next.js em execução para confirmar ausência de erros de renderização.
- **Decisão de arquitetura**: a pasta `minhas-solicitacoes/` (protótipo do colega) e o `minhas-solicitacoes.zip` foram removidos do repositório após a portagem, pois toda a lógica já está incorporada ao backend/frontend oficiais.

---

### 🟢 Sprint 1 - US04: Gestão do Perfil do Usuário e Privacidade (LGPD)
- **Data**: 01/09/2026
- **Resumo**: Conclusão da **US04**, que já tinha parte do backend implementada em uma sessão anterior sem foto de perfil, tela no frontend nem registro neste log. Foi adicionado o suporte a foto de perfil (coluna `foto_url`, upload via Multer, arquivo estático servido em `/uploads`) e criada a tela completa de gerenciamento de conta no Next.js. Também foram corrigidos dois bugs pré-existentes encontrados durante a verificação (`tsc --noEmit`): tipagem de `jwt.sign` em `authService.ts` (faltavam `@types/jsonwebtoken`) e a propriedade CSS inválida `shrink` (deveria ser `flexShrink`) usada em `login/page.tsx`, `register-prestador/page.tsx` e `register-solicitante/page.tsx`.
- **Banco de Dados**: Migration [`20260901000003-add-foto-perfil-usuarios.js`](file:///wsl.localhost/Ubuntu/home/rod/projetos/TCC-SistemaRequisicaoDeServico/backend/src/migrations/20260901000003-add-foto-perfil-usuarios.js) adicionando a coluna `foto_url` (nullable) à tabela `usuarios`.
- **Backend**:
  - [`uploadMiddleware.ts`](file:///wsl.localhost/Ubuntu/home/rod/projetos/TCC-SistemaRequisicaoDeServico/backend/src/middlewares/uploadMiddleware.ts): configuração do Multer (armazenamento em disco, nome de arquivo único via UUID, limite de 5MB, aceita apenas JPEG/PNG/WEBP).
  - Endpoint `POST /api/v1/perfil/foto` em [`perfilController.ts`](file:///wsl.localhost/Ubuntu/home/rod/projetos/TCC-SistemaRequisicaoDeServico/backend/src/controllers/perfilController.ts) e [`perfilRoutes.ts`](file:///wsl.localhost/Ubuntu/home/rod/projetos/TCC-SistemaRequisicaoDeServico/backend/src/routes/perfilRoutes.ts): substitui a foto anterior (removendo o arquivo antigo do disco) e persiste `foto_url` no usuário.
  - [`app.ts`](file:///wsl.localhost/Ubuntu/home/rod/projetos/TCC-SistemaRequisicaoDeServico/backend/src/app.ts): rota estática `/uploads` (`express.static`) com o cabeçalho `Cross-Origin-Resource-Policy: cross-origin` relaxado apenas nesse caminho, para permitir que o frontend (porta 3000) exiba as imagens hospedadas no backend (porta 3001) sem serem bloqueadas pelo Helmet.
  - Endpoints `GET/PUT /api/v1/perfil`, `PUT /api/v1/perfil/senha` e `DELETE /api/v1/perfil` (soft-delete LGPD) já existiam e foram apenas validados nesta etapa.
- **Frontend**: Nova tela [`frontend/src/app/perfil/page.tsx`](file:///wsl.localhost/Ubuntu/home/rod/projetos/TCC-SistemaRequisicaoDeServico/frontend/src/app/perfil/page.tsx) com 3 abas (Dados Pessoais com upload de foto, Alterar Senha, Privacidade/LGPD com confirmação de exclusão de conta). A página inicial ([`page.tsx`](file:///wsl.localhost/Ubuntu/home/rod/projetos/TCC-SistemaRequisicaoDeServico/frontend/src/app/page.tsx)) passou a detectar sessão ativa via `localStorage` e exibir um atalho "Meu Perfil" e botão "Sair" no lugar dos cards de cadastro/login.
- **Testes realizados**: Fluxo ponta a ponta validado via `curl` contra a API real (banco MySQL rodando em Docker) — cadastro, login, `GET/PUT /perfil`, upload de imagem PNG de teste (confirmando `Content-Type: image/png` e `Cross-Origin-Resource-Policy: cross-origin` na resposta estática), tentativa de troca de senha com senha atual errada (rejeitada), troca de senha correta, login com a nova senha, soft-delete da conta e confirmação de que o login é bloqueado após a exclusão. `npx tsc --noEmit` validado sem erros no backend e no frontend.

---

### 🟢 Sprint 1 - Orquestração com Docker (Stand-alone Database e Full Stack)
- **Data**: 01/09/2026
- **Resumo**: Adicionado suporte para execução isolada do banco MySQL (`docker-compose up -d db`) e documentação detalhada no [README.md](file:///wsl.localhost/Ubuntu/home/rod/projetos/TCC-SistemaRequisicaoDeServico/README.md).

---

### 🟢 Sprint 1 - US03: Autenticação de Usuário (Login e Token JWT)
- **Data**: 01/09/2026
- **Resumo**: Implementação completa do fluxo de Login com verificação de senha via `bcrypt.compare`, emissão de token JWT assinado com `jsonwebtoken`, middleware de proteção de rotas e tela de login no frontend.
- **Backend**:
  - Método `login` e `getUserProfile` em [`authService.ts`](file:///wsl.localhost/Ubuntu/home/rod/projetos/TCC-SistemaRequisicaoDeServico/backend/src/services/authService.ts).
  - Rotas `POST /api/v1/auth/login` e `GET /api/v1/auth/me` em [`authRoutes.ts`](file:///wsl.localhost/Ubuntu/home/rod/projetos/TCC-SistemaRequisicaoDeServico/backend/src/routes/authRoutes.ts).
  - Middleware [`authMiddleware.ts`](file:///wsl.localhost/Ubuntu/home/rod/projetos/TCC-SistemaRequisicaoDeServico/backend/src/middlewares/authMiddleware.ts) para validação do cabeçalho `Authorization: Bearer <token>`.
  - Documentação Swagger/OpenAPI 3.0 adicionada em [`authController.ts`](file:///wsl.localhost/Ubuntu/home/rod/projetos/TCC-SistemaRequisicaoDeServico/backend/src/controllers/authController.ts).
- **Frontend**: Tela de login [`frontend/src/app/login/page.tsx`](file:///wsl.localhost/Ubuntu/home/rod/projetos/TCC-SistemaRequisicaoDeServico/frontend/src/app/login/page.tsx) com armazenamento do token JWT em `localStorage`.

---

### 🟢 Sprint 1 - US02: Cadastro de Prestador de Serviço (Profissional)
- **Data**: 01/09/2026
- **Resumo**: Desenvolvimento completo da funcionalidade de cadastro de Prestadores de Serviço.
- **Banco de Dados**: Migration [`20260901000002-create-prestadores-perfil.js`](file:///wsl.localhost/Ubuntu/home/rod/projetos/TCC-SistemaRequisicaoDeServico/backend/src/migrations/20260901000002-create-prestadores-perfil.js), Modelo [`PrestadorPerfil.ts`](file:///wsl.localhost/Ubuntu/home/rod/projetos/TCC-SistemaRequisicaoDeServico/backend/src/models/PrestadorPerfil.ts) e associação em [`Usuario.ts`](file:///wsl.localhost/Ubuntu/home/rod/projetos/TCC-SistemaRequisicaoDeServico/backend/src/models/Usuario.ts).
- **Backend**: Método `registerPrestador` com transação atômica em [`authService.ts`](file:///wsl.localhost/Ubuntu/home/rod/projetos/TCC-SistemaRequisicaoDeServico/backend/src/services/authService.ts) e controller REST no Swagger UI.
- **Frontend**: Tela de cadastro profissional em [`frontend/src/app/register-prestador/page.tsx`](file:///wsl.localhost/Ubuntu/home/rod/projetos/TCC-SistemaRequisicaoDeServico/frontend/src/app/register-prestador/page.tsx).

---

### 🟢 Sprint 1 - US01: Cadastro de Usuário Solicitante (Cliente)
- **Data**: 01/09/2026
- **Resumo**: Implementação da **US01 (Cadastro de Solicitante)**.
- **Banco de Dados**: Migration [`20260901000001-create-usuarios.js`](file:///wsl.localhost/Ubuntu/home/rod/projetos/TCC-SistemaRequisicaoDeServico/backend/src/migrations/20260901000001-create-usuarios.js).
- **Backend**: Model [`Usuario.ts`](file:///wsl.localhost/Ubuntu/home/rod/projetos/TCC-SistemaRequisicaoDeServico/backend/src/models/Usuario.ts), [`authService.ts`](file:///wsl.localhost/Ubuntu/home/rod/projetos/TCC-SistemaRequisicaoDeServico/backend/src/services/authService.ts) e [`authController.ts`](file:///wsl.localhost/Ubuntu/home/rod/projetos/TCC-SistemaRequisicaoDeServico/backend/src/controllers/authController.ts).
- **Frontend**: Tela em [`frontend/src/app/register-solicitante/page.tsx`](file:///wsl.localhost/Ubuntu/home/rod/projetos/TCC-SistemaRequisicaoDeServico/frontend/src/app/register-solicitante/page.tsx).
