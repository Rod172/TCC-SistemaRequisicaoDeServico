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
| **bcryptjs** | `^2.4.3` | Hash seguro de senhas com algoritmo Bcrypt | [github.com/dcodeIO/bcrypt.js](https://github.com/dcodeIO/bcrypt.js) |
| **dotenv** | `^16.4.5` | Carregamento de variáveis de ambiente a partir do `.env` | [github.com/motdotla/dotenv](https://github.com/motdotla/dotenv) |
| **cors** | `^2.8.5` | Middleware de liberação de origens cruzadas no navegador | [github.com/expressjs/cors](https://github.com/expressjs/cors) |
| **helmet** | `^7.1.0` | Middleware de proteção e sanitização dos cabeçalhos HTTP | [helmetjs.github.io](https://helmetjs.github.io/) |
| **swagger-ui-express** | `^5.0.1` | Interface gráfica interativa para documentação da API REST | [swagger.io](https://swagger.io/tools/swagger-ui/) |
| **swagger-jsdoc** | `^6.2.8` | Gerador de especificação OpenAPI 3.0 via comentários JSDoc | [github.com/Sknfy/swagger-jsdoc](https://github.com/Sknfy/swagger-jsdoc) |
| **Sequelize CLI** | `^6.6.2` | Ferramenta de linha de comando para automação de Migrations/Seeders | [github.com/sequelize/cli](https://github.com/sequelize/cli) |

### 🎨 Frontend (Next.js 14 / React com TypeScript)

| Biblioteca | Versão | Propósito / Finalidade no Projeto | Referência Oficial / Link |
|---|---|---|---|
| **Next.js** | `^14.2.3` | Framework React para produção com App Router, SSR e roteamento | [nextjs.org](https://nextjs.org/docs) |
| **React** | `^18.3.1` | Biblioteca declarativa para criação da interface do usuário | [react.dev](https://react.dev/) |
| **React DOM** | `^18.3.1` | Renderizador React para o DOM do navegador | [react.dev/reference/react-dom](https://react.dev/reference/react-dom) |
| **TypeScript** | `^5.4.5` | Tipagem estática em componentes JSX (`.tsx`) e utilitários | [typescriptlang.org](https://www.typescriptlang.org/) |
| **Axios** | `^1.7.2` | Cliente HTTP com suporte a interceptores para anexar o token JWT | [axios-http.com](https://axios-http.com/docs/intro) |
| **Lucide React** | `^0.383.0` | Conjunto de ícones vetoriais modernos para a interface | [lucide.dev](https://lucide.dev/) |

---

## 📅 Sprint 0: Migração para Next.js 14 + TypeScript e Atualização do TCC.md

### 📌 Resumo das Atividades
- Atualização do texto acadêmico oficial em `TCC.md` (Introdução, Metodologia, Revisão de Literatura 4.4 e 4.5, e Referências) contemplando **Next.js** e **TypeScript**.
- Reconfiguração de todos os arquivos de regras de IA em 6 formatos (`.agents/AGENTS.md`, `AGENTS.md`, `.cursorrules`, `CLAUDE.md`, `.github/copilot-instructions.md`, `.windsurfrules`).
- Migração completa do **Frontend** para **Next.js 14 (App Router) com TypeScript (`.tsx`)**.
- Migração completa do **Backend** para **Node.js + Express + TypeScript (`.ts`)**.
- Instalação e validação de pacotes `npm` em ambos os ecossistemas com sucesso.

---

### 📂 Arquivos Criados / Modificados nesta Etapa

#### 1. Documentação Acadêmica e Regras:
- [x] [TCC.md](file:///wsl.localhost/Ubuntu/home/rod/projetos/TCC-SistemaRequisicaoDeServico/TCC.md): Texto da monografia atualizado com Next.js, TypeScript e referências.
- [x] [.agents/AGENTS.md](file:///wsl.localhost/Ubuntu/home/rod/projetos/TCC-SistemaRequisicaoDeServico/.agents/AGENTS.md): Regras do projeto atualizadas para a nova stack.
- [x] [README.md](file:///wsl.localhost/Ubuntu/home/rod/projetos/TCC-SistemaRequisicaoDeServico/README.md): Documentação principal atualizada com comandos de Next.js e TypeScript.

#### 2. Backend (Node.js, Express & TypeScript):
- [x] [backend/package.json](file:///wsl.localhost/Ubuntu/home/rod/projetos/TCC-SistemaRequisicaoDeServico/backend/package.json): Dependências do backend com TypeScript.
- [x] [backend/tsconfig.json](file:///wsl.localhost/Ubuntu/home/rod/projetos/TCC-SistemaRequisicaoDeServico/backend/tsconfig.json): Configuração do compilador TypeScript.
- [x] [backend/src/server.ts](file:///wsl.localhost/Ubuntu/home/rod/projetos/TCC-SistemaRequisicaoDeServico/backend/src/server.ts): Entrypoint do servidor HTTP em TypeScript.
- [x] [backend/src/app.ts](file:///wsl.localhost/Ubuntu/home/rod/projetos/TCC-SistemaRequisicaoDeServico/backend/src/app.ts): App Express em TypeScript com Swagger UI e Health Check.
- [x] [backend/src/config/database.ts](file:///wsl.localhost/Ubuntu/home/rod/projetos/TCC-SistemaRequisicaoDeServico/backend/src/config/database.ts): Conexão MySQL em TypeScript via Sequelize ORM.

#### 3. Frontend (Next.js 14, React & TypeScript):
- [x] [frontend/package.json](file:///wsl.localhost/Ubuntu/home/rod/projetos/TCC-SistemaRequisicaoDeServico/frontend/package.json): Dependências do Next.js 14 e TypeScript.
- [x] [frontend/tsconfig.json](file:///wsl.localhost/Ubuntu/home/rod/projetos/TCC-SistemaRequisicaoDeServico/frontend/tsconfig.json): Configuração do compilador TypeScript do Next.js.
- [x] [frontend/src/app/layout.tsx](file:///wsl.localhost/Ubuntu/home/rod/projetos/TCC-SistemaRequisicaoDeServico/frontend/src/app/layout.tsx): Root Layout do Next.js App Router com Metadata.
- [x] [frontend/src/app/page.tsx](file:///wsl.localhost/Ubuntu/home/rod/projetos/TCC-SistemaRequisicaoDeServico/frontend/src/app/page.tsx): Home Page interativa testando conexão com o backend.
- [x] [frontend/src/services/api.ts](file:///wsl.localhost/Ubuntu/home/rod/projetos/TCC-SistemaRequisicaoDeServico/frontend/src/services/api.ts): Cliente Axios em TypeScript com interceptor JWT.
- [x] [frontend/src/app/globals.css](file:///wsl.localhost/Ubuntu/home/rod/projetos/TCC-SistemaRequisicaoDeServico/frontend/src/app/globals.css): Estilização global e design system.
