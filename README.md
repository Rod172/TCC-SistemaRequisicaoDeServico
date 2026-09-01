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

### 🐳 DevOps & Conteinerização
- **Docker & Docker Compose**: Conteinerização completa da aplicação (MySQL 8.0, Backend Node.js e Frontend Next.js 14).

---

## 🐳 Opções de Execução com Docker

### 1️⃣ Opção A: Rodar APENAS o Banco de Dados MySQL via Docker (Recomendado para Dev)

Caso você prefira rodar apenas o MySQL no container Docker e manter os servidores Node.js/Next.js rodando no seu terminal local:

```bash
# 1. Subir apenas o serviço do MySQL 8.0 em segundo plano:
docker-compose up -d db

# 2. Em outro terminal, rodar as migrations e o backend:
cd backend
npm run db:migrate
npm run dev

# 3. Em outro terminal, rodar o frontend:
cd frontend
npm run dev
```

#### 🛠️ Comandos úteis para controlar o Banco Docker:
- **Ver status do banco**: `docker-compose ps`
- **Ver logs em tempo real**: `docker-compose logs -f db`
- **Parar o banco**: `docker-compose stop db`

---

### 2️⃣ Opção B: Rodar a Aplicação COMPLETA no Docker

Para subir o Banco MySQL, o Backend e o Frontend juntos em containers com um **único comando**:

```bash
# Na raiz do repositório
docker-compose up --build
```

---

## 🌐 Endereços de Acesso

> 🖥️ **Frontend (Next.js)**: `http://localhost:3000`  
> 🌐 **Backend (Node.js)**: `http://localhost:3001/api/v1/health`  
> 📚 **Swagger UI (APIs)**: `http://localhost:3001/api-docs`

---

## 📝 Documentação Incremental e Licença

Todas as adições técnicas, referências oficiais de bibliotecas e registros de execução de testes são obrigatoriamente documentados no arquivo [LOG_DESENVOLVIMENTO.md](file:///wsl.localhost/Ubuntu/home/rod/projetos/TCC-SistemaRequisicaoDeServico/LOG_DESENVOLVIMENTO.md).

Desenvolvido para o curso de Ciência da Computação da Universidade Paulista (UNIP) - 2026.
