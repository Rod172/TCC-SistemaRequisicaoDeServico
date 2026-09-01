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
