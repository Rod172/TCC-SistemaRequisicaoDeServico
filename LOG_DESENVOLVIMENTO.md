# 📝 Log de Desenvolvimento - Sistema de Requisição de Serviço (TCC)

Este arquivo registra o histórico incremental de desenvolvimento, decisões de arquitetura, testes executados e a **documentação com referências oficiais de todas as bibliotecas de terceiros**, conforme a **Regra 2** e a **Regra 5** definidas em `.agents/AGENTS.md`.

---

## 📚 Referências Oficiais das Bibliotecas e Dependências Adotadas

Em estrito cumprimento à **Regra 2**, a tabela abaixo mapeia todas as bibliotecas de terceiros adicionadas nesta etapa inicial do projeto, acompanhadas de suas versões, finalidades e links para a documentação oficial.

### ⚙️ Backend (Node.js / Express)

| Biblioteca | Versão | Propósito / Finalidade no Projeto | Referência Oficial / Link |
|---|---|---|---|
| **Express.js** | `^4.19.2` | Framework web minimalista para rotas e servidor HTTP | [expressjs.com](https://expressjs.com/pt-br/) |
| **Sequelize ORM** | `^6.37.3` | Mapeamento Objeto-Relacional (ORM) para MySQL | [sequelize.org](https://sequelize.org/docs/v6/) |
| **mysql2** | `^3.9.8` | Driver de alta performance para conexão com o MySQL | [github.com/sidorares/node-mysql2](https://github.com/sidorares/node-mysql2) |
| **jsonwebtoken** | `^9.0.2` | Emissão e validação de tokens JWT para autenticação segura | [jwt.io](https://jwt.io/) |
| **bcryptjs** | `^2.4.3` | Hash seguro de senhas com algoritmo Bcrypt | [github.com/dcodeIO/bcrypt.js](https://github.com/dcodeIO/bcrypt.js) |
| **dotenv** | `^16.4.5` | Carregamento de variáveis de ambiente a partir do `.env` | [github.com/motdotla/dotenv](https://github.com/motdotla/dotenv) |
| **cors** | `^2.8.5` | Middleware de liberação de origens cruzadas no navegador | [github.com/expressjs/cors](https://github.com/expressjs/cors) |
| **helmet** | `^7.1.0` | Middleware de proteção e sanitização dos cabeçalhos HTTP | [helmetjs.github.io](https://helmetjs.github.io/) |
| **swagger-ui-express** | `^5.0.1` | Interface gráfica interativa para documentação da API REST | [swagger.io](https://swagger.io/tools/swagger-ui/) |
| **swagger-jsdoc** | `^6.2.8` | Gerador de especificação OpenAPI 3.0 via comentários JSDoc | [github.com/Sknfy/swagger-jsdoc](https://github.com/Sknfy/swagger-jsdoc) |
| **Sequelize CLI** | `^6.6.2` | Ferramenta de linha de comando para automação de Migrations/Seeders | [github.com/sequelize/cli](https://github.com/sequelize/cli) |
| **Nodemon** | `^3.1.0` | Utilitário de reinicialização automática do servidor em ambiente Dev | [nodemon.io](https://nodemon.io/) |

### 🎨 Frontend (React / Vite)

| Biblioteca | Versão | Propósito / Finalidade no Projeto | Referência Oficial / Link |
|---|---|---|---|
| **React** | `^18.3.1` | Biblioteca declarativa para criação da interface do usuário | [react.dev](https://react.dev/) |
| **React DOM** | `^18.3.1` | Renderizador React para o DOM do navegador | [react.dev/reference/react-dom](https://react.dev/reference/react-dom) |
| **Vite** | `^5.2.11` | Build tool e servidor de desenvolvimento instantâneo | [vitejs.dev](https://vitejs.dev/) |
| **Axios** | `^1.7.2` | Cliente HTTP com suporte a interceptores para anexar o token JWT | [axios-http.com](https://axios-http.com/docs/intro) |
| **React Router DOM** | `^6.23.1` | Gerenciamento de rotas e navegação declarativa na SPA | [reactrouter.com](https://reactrouter.com/) |
| **Lucide React** | `^0.383.0` | Conjunto de ícones vetoriais modernos para a interface | [lucide.dev](https://lucide.dev/) |

---

## 📅 Sprint 0: Configuração Inicial e Arquitetura Base (Primeiro Commit)

### 📌 Resumo das Atividades
- Configuração do repositório inicial e inclusão das regras de desenvolvimento do projeto em `.agents/AGENTS.md`.
- Mapeamento completo do backlog com **9 Épicos e 26 Histórias de Usuário (US01 a US26)** alinhadas com `TCC.md` em `historia.md`.
- Conexão e sincronização do backlog no Jira Cloud (Chave: `SCRUM` / `TCC`).
- Estruturação do **Backend em Node.js (Express & Sequelize)** com referências anotadas no código.
- Estruturação do **Frontend em React (Vite & CSS Vanilla)** com cliente Axios configurado.

---

### 📂 Arquivos Criados / Modificados nesta Etapa

#### 1. Configurações e Regras:
- [x] [.agents/AGENTS.md](file:///wsl.localhost/Ubuntu/home/rod/projetos/TCC-SistemaRequisicaoDeServico/.agents/AGENTS.md): Diretrizes de desenvolvimento, idiomas, Swagger, e anotações de bibliotecas.
- [x] [historia.md](file:///wsl.localhost/Ubuntu/home/rod/projetos/TCC-SistemaRequisicaoDeServico/historia.md): Backlog granular com 26 histórias de usuário e matriz MoSCoW.
- [x] [.gitignore](file:///wsl.localhost/Ubuntu/home/rod/projetos/TCC-SistemaRequisicaoDeServico/.gitignore): Ignorando `node_modules`, `.env` e pastas de build.

#### 2. Backend (Node.js & Express):
- [x] [backend/package.json](file:///wsl.localhost/Ubuntu/home/rod/projetos/TCC-SistemaRequisicaoDeServico/backend/package.json): Dependências do backend.
- [x] [backend/server.js](file:///wsl.localhost/Ubuntu/home/rod/projetos/TCC-SistemaRequisicaoDeServico/backend/server.js): Entrypoint do servidor HTTP anotado.
- [x] [backend/src/app.js](file:///wsl.localhost/Ubuntu/home/rod/projetos/TCC-SistemaRequisicaoDeServico/backend/src/app.js): Configuração do Express, middlewares de segurança e Swagger UI anotados.
- [x] [backend/src/config/database.js](file:///wsl.localhost/Ubuntu/home/rod/projetos/TCC-SistemaRequisicaoDeServico/backend/src/config/database.js): Conexão MySQL via Sequelize anotada.
- [x] [backend/.sequelizerc](file:///wsl.localhost/Ubuntu/home/rod/projetos/TCC-SistemaRequisicaoDeServico/backend/.sequelizerc): Mapeamento de diretórios do Sequelize CLI.
- [x] [backend/.env.example](file:///wsl.localhost/Ubuntu/home/rod/projetos/TCC-SistemaRequisicaoDeServico/backend/.env.example): Template de variáveis de ambiente.

#### 3. Frontend (React & Vite):
- [x] [frontend/package.json](file:///wsl.localhost/Ubuntu/home/rod/projetos/TCC-SistemaRequisicaoDeServico/frontend/package.json): Dependências do frontend.
- [x] [frontend/vite.config.js](file:///wsl.localhost/Ubuntu/home/rod/projetos/TCC-SistemaRequisicaoDeServico/frontend/vite.config.js): Configuração do Bundler Vite anotada.
- [x] [frontend/src/App.jsx](file:///wsl.localhost/Ubuntu/home/rod/projetos/TCC-SistemaRequisicaoDeServico/frontend/src/App.jsx): Tela inicial de dashboard com verificação de status da API anotada.
- [x] [frontend/src/services/api.js](file:///wsl.localhost/Ubuntu/home/rod/projetos/TCC-SistemaRequisicaoDeServico/frontend/src/services/api.js): Cliente Axios pré-configurado com interceptor JWT anotado.
- [x] [frontend/src/index.css](file:///wsl.localhost/Ubuntu/home/rod/projetos/TCC-SistemaRequisicaoDeServico/frontend/src/index.css): Estilização moderna com design system tokenizado.

---

### 🧪 Testes e Validação
- **Swagger UI**: Rota `/api-docs` configurada no backend.
- **Health Check**: Rota `GET /api/v1/health` disponibilizada no backend.
- **Client API (Axios)**: Conexão frontend/backend configurada e testada.
