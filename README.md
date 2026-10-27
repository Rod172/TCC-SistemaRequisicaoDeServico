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
4. O chat privado fica disponível por proposta desde o envio; após a contratação, o cliente pode simular o pagamento em custódia. Cada prestador tem uma conversa separada.
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

Os diagramas de modelagem (casos de uso, classes, MER e sequência da contratação), em Mermaid e gerados a partir do código atual, estão em [docs/diagramas](docs/diagramas/README.md) e podem ser vistos no próprio sistema em `http://localhost:3000/arquitetura` (US41).

Desenvolvido para o curso de Ciência da Computação da Universidade Paulista (UNIP) - 2026.


## Histórias complementadas em 25/10/2026

- Perfil público em `/prestadores/:id`, acessível pelo nome do profissional na comparação de propostas (US19).
- Indicadores pessoais e carteira simulada em `/dashboard`, pelo atalho **Meu painel** (US13, US20 e US21). Valores retidos só integram o saldo disponível após a conclusão; reembolsos não integram o saldo.
- Foto opcional no cadastro profissional e validação de CPF/CNPJ numéricos (US01/US02).
- Publicação em três etapas com revisão antes do envio (US05).
- Validade comercial separada do prazo de execução: padrão de 7 dias, configurável de 1 a 365 dias. Propostas expiradas não podem ser aceitas nem renegociadas (US10).
- Login limitado a 10 tentativas por IP em 15 minutos. JWT exige conta ativa e segredo local válido (US22).
- Contratos de entrada, saída e erros em [Swagger](http://localhost:3001/api-docs/) e [OpenAPI JSON](http://localhost:3001/api-docs.json), inclusive com o backend compilado (US24).

### Preparação local

No WSL, usando Node.js 22 e o MySQL do Docker:

```bash
cd backend
cp .env.example .env # apenas na primeira configuração; preserve seu .env existente
# Preencha JWT_SECRET com uma chave local gerada por:
node -e "console.log(require('crypto').randomBytes(48).toString('hex'))"
npm ci
npm run db:migrate
npm run db:seed
npm run dev
```

O arquivo `.env` não deve entrar no Git. `JWT_SECRET` é obrigatório, deve conter ao menos 32 caracteres e não pode usar o valor público antigo. A troca da chave exige novo login. O Docker Compose lê `backend/.env` para usar a mesma configuração.

A migração de documentos remove pontuação dos registros existentes e aborta sem alterações caso encontre duplicações. As propostas antigas recebem validade de sete dias a partir da publicação original, preservando a expiração. Os seeds de demonstração devem ser usados em uma base destinada à demonstração; o seed complementar é idempotente e não recria contas existentes.

### Validação automatizada

```bash
cd backend
npm run test:unit
DB_NAME_TEST=tcc_eloserv_test npm test
# Somente integração:
DB_NAME_TEST=tcc_eloserv_test npm run test:integration
cd ../frontend
npx tsc --noEmit
npm run build
```

A integração cria e migra somente o banco explicitamente indicado com sufixo `_test`, utiliza as rotas reais e remove suas próprias fixtures. Não depende de seeds nem dos servidores de desenvolvimento. Detalhes em `backend/tests/LEIA-ME.md`.

O fluxo `.github/workflows/validacao.yml` executa a suíte com MySQL 8, verifica TypeScript e compila o frontend em pull requests. A integração na `main` deve ocorrer pelo PR após os testes.
