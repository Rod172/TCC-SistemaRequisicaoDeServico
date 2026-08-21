# 🚀 Plataforma de Gerenciamento de Requisições de Serviço (TCC)

> **Trabalho de Conclusão de Curso (TCC) - Curso de Ciência da Computação**  
> **Universidade Paulista (UNIP) – Instituto de Ciências Exatas e Tecnológicas (ICET)**

---

## 👥 Autores e Orientação

- **Integrantes do Grupo**:
  - Gabriel Henrique Cassaro
  - Julia Marques de Souza
  - Rodrigo Fernando Melo Dias da Silva
  - Thaina Rayra de Ponti
- **Orientadora**: Prof.ª Dr.ª Eliana Leão do Prado Battaglion

---

## 📋 Sobre o Projeto

O **ServiçoFácil** é uma plataforma web bilateral de intermediação de serviços sob demanda. O sistema conecta **Solicitantes (Clientes)** necessitando de serviços diversos a **Prestadores de Serviços (Profissionais)** disponíveis na região.

### 🔄 Fluxo Principal de Funcionamento:
1. O **Solicitante** publica uma requisição descrevendo a necessidade e anexando fotos do problema.
2. Os **Prestadores** visualizam a solicitação no feed de oportunidades e enviam **Propostas/Orçamentos** personalizados (valor R$ e prazo).
3. O **Solicitante** compara as propostas recebidas (preço, prazo e reputação) e aceita o orçamento escolhido.
4. O valor do serviço é retido em custódia garantia (Escrow) e o **Chat Privado em Tempo Real** é liberado para alinhamento.
5. Após a conclusão do trabalho, a etapa de **Avaliação de Reputação** (1 a 5 estrelas) é liberada.

---

## 🛠️ Stack Tecnológica (Conforme Especificação do TCC)

### ⚙️ Backend (API REST)
- **Runtime & Linguagem**: Node.js (v20+) com **TypeScript**
- **Framework Web**: Express.js
- **ORM / Banco de Dados**: Sequelize ORM com MySQL 8.0
- **Segurança & Auth**: JSON Web Tokens (JWT) e Bcryptjs (Hash de senhas)
- **Documentação de API**: Swagger UI & OpenAPI 3.0 (disponível em `/api-docs`)

### 🎨 Frontend (SPA / SSR)
- **Framework Web**: Next.js 14 (App Router) com **React.js (v18+)** e **TypeScript**
- **Cliente HTTP**: Axios (com interceptor automático de token JWT)
- **Componentes & Ícones**: Lucide Icons & Componentização Reutilizável
- **Estilização**: CSS Vanilla com Design System tokenizado e suporte a Dark Mode

### 🛡️ Governança, Metodologia e IA
- **Gestão Ágil**: Scrum no Jira Cloud (Chave do Projeto: `SCRUM` / `TCC`)
- **Regras para IAs**: Diretrizes de arquitetura e documentação em `.agents/AGENTS.md`
- **Conformidade Legal**: Lei Geral de Proteção de Dados (LGPD - Lei nº 13.709/2018)

---

## 📂 Estrutura do Repositório

```text
TCC-SistemaRequisicaoDeServico/
├── .agents/
│   └── AGENTS.md                  # Regras arquiteturais e conduta da IA
├── backend/                       # API REST em Node.js, Express, Sequelize e TypeScript
│   ├── src/
│   │   ├── config/database.ts    # Conexão MySQL anotada com referências
│   │   ├── app.ts                # Middlewares (Helmet, CORS) e Swagger UI
│   │   ├── server.ts             # Servidor HTTP em TypeScript na porta 3001
│   │   ├── controllers/          # Controllers da API REST (.ts)
│   │   ├── models/               # Modelos relacionais do Sequelize (.ts)
│   │   ├── services/             # Regras de negócio da aplicação (.ts)
│   │   └── middlewares/          # Autenticação JWT e tratamento de erros (.ts)
│   ├── .env.example              # Modelo de variáveis de ambiente
│   ├── tsconfig.json             # Compilador TypeScript do Backend
│   ├── package.json              # Dependências do backend anotadas
├── frontend/                      # Interface Web em Next.js 14, React e TypeScript
│   ├── src/
│   │   ├── app/                  # Next.js App Router (layout.tsx, page.tsx, globals.css)
│   │   ├── components/           # Componentes reutilizáveis (.tsx)
│   │   └── services/api.ts       # Cliente Axios em TypeScript
│   ├── tsconfig.json             # Compilador TypeScript do Frontend
│   ├── package.json              # Dependências do frontend anotadas
├── LOG_DESENVOLVIMENTO.md         # Registro de etapas e tabela de bibliotecas
├── README.md                      # Documentação principal do repositório
├── TCC.md                         # Monografia acadêmica oficial do TCC (com Next.js & TS)
└── historia.md                    # Backlog completo (26 USs e 9 Épicos)
```

---

## 🚀 Como Executar o Projeto Localmente

### 📋 Pré-requisitos
- [Node.js](https://nodejs.org/) (versão 18 ou superior)
- [MySQL](https://www.mysql.com/) (servidor ativo na porta 3306)
- [Git](https://git-scm.com/)

---

### 1️⃣ Configurando o Backend (API REST Node.js + TypeScript)

```bash
# Entrar na pasta do backend
cd backend

# Instalar as dependências
npm install

# Configurar as variáveis de ambiente (edite o .env se necessário)
cp .env.example .env

# Executar as migrações do banco de dados MySQL
npm run db:migrate

# Iniciar o servidor em ambiente de desenvolvimento (ts-node-dev)
npm run dev
```

> 🌐 **Backend online em**: `http://localhost:3001/api/v1/health`  
> 📚 **Documentação Swagger em**: `http://localhost:3001/api-docs`

---

### 2️⃣ Configurando o Frontend (Next.js 14 + TypeScript)

```bash
# Entrar na pasta do frontend (a partir da raiz)
cd frontend

# Instalar as dependências
npm install

# Iniciar a aplicação Next.js
npm run dev
```

> 🖥️ **Frontend online em**: `http://localhost:3000`

---

## 📝 Documentação Incremental e Licença

Todas as adições técnicas, referências oficiais de bibliotecas e registros de execução de testes são obrigatoriamente documentados no arquivo [LOG_DESENVOLVIMENTO.md](file:///wsl.localhost/Ubuntu/home/rod/projetos/TCC-SistemaRequisicaoDeServico/LOG_DESENVOLVIMENTO.md).

Desenvolvido para o curso de Ciência da Computação da Universidade Paulista (UNIP) - 2026.
