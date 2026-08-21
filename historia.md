# Sistema de Requisição de Serviço (TCC) - Especificação Granular de Histórias de Usuário

> **Alinhamento com o TCC**: Esta especificação foi revisada e ajustada para refletir **100% do escopo do TCC** definido em `TCC.md` (Plataforma Bilateral de Intermediação de Serviços sob Demanda entre Solicitantes e Prestadores), utilizando a stack **Node.js (API REST com Sequelize)**, **React**, **MySQL**, **JWT** e **bcrypt**.

---

## 📌 Sumário de Épicos

- [Épico 1: Autenticação, Perfis de Usuário e LGPD](#-épico-1-autenticação-perfis-de-usuário-e-lgpd)
- [Épico 2: Publicação e Gerenciamento de Requisições (Solicitante)](#-épico-2-publicação-e-gerenciamento-de-requisições-solicitante)
- [Épico 3: Feed e Busca de Oportunidades (Prestador)](#-épico-3-feed-e-busca-de-oportunidades-prestador)
- [Épico 4: Envio, Comparação e Aceite de Propostas/Orçamentos](#-épico-4-envio-comparação-e-aceite-de-propostasorçamentos)
- [Épico 5: Comunicação e Interação (Chat Interno)](#-épico-5-comunicação-e-interação-chat-interno)
- [Épico 6: Conclusão de Serviço e Sistema de Reputação](#-épico-6-conclusão-de-serviço-e-sistema-de-reputação)
- [Épico 7: Dashboards, Histórico e Métricas](#-épico-7-dashboards-histórico-e-métricas)
- [Épico 8: Requisitos Não-Funcionais, Segurança e Usabilidade](#-épico-8-requisitos-não-funcionais-segurança-e-usabilidade)
- [Épico 9: Engenharia de Software, Testes e Documentação de API](#-épico-9-engenharia-de-software-testes-e-documentação-de-api)
- [Matriz de Priorização (MoSCoW)](#-matriz-de-priorização-moscow)

---

## 🔑 Épico 1: Autenticação, Perfis de Usuário e LGPD

### US01 - Cadastro de Usuário Solicitante (Cliente)
**Como** um cliente buscando serviços  
**Quero** me cadastrar informando meus dados pessoais  
**Para que** eu possa publicar solicitações de serviços e receber propostas de prestadores.

#### Critérios de Aceite:
- [ ] Formulário deve coletar: Nome Completo, E-mail, CPF, Telefone/WhatsApp, Endereço e Senha.
- [ ] O e-mail e o CPF devem ser únicos no banco de dados.
- [ ] A senha deve ser criptografada com **bcrypt** (salt rounds mínimo 10).
- [ ] Atribuição automática do perfil `SOLICITANTE`.
- [ ] Termo de consentimento explícito para tratamento de dados (conformidade LGPD).

#### Tarefas Técnicas:
- **BD**: Tabela `usuarios` (`id`, `nome`, `email`, `cpf`, `telefone`, `endereco`, `senha_hash`, `tipo_perfil`, `ativo`, `criado_em`).
- **Backend (Node.js/Express)**: Endpoint `POST /api/v1/auth/register/solicitante` usando ORM **Sequelize** e **bcrypt**.
- **Frontend (React)**: Componente formulário responsivo com validação de campos (CPF, e-mail).
- **Testes**: Testes unitários no controller de registro e validação de hash de senha.

---

### US02 - Cadastro de Prestador de Serviço (Profissional)
**Como** um prestador de serviço  
**Quero** me cadastrar informando minhas especialidades, dados comerciais e portfólio  
**Para que** eu possa visualizar solicitações e enviar propostas a potenciais clientes.

#### Critérios de Aceite:
- [ ] Formulário deve coletar: Nome/Razão Social, E-mail, CPF/CNPJ, Telefone, Categorias de Atuação, Descrição Profissional e Foto de Perfil.
- [ ] Atribuição do perfil `PRESTADOR`.
- [ ] Armazenamento da senha com **bcrypt**.

#### Tarefas Técnicas:
- **BD**: Tabela `prestadores_perfil` (`id`, `usuario_id`, `cnpj_cpf`, `descricao_bio`, `categorias_ids`, `nota_media_reputacao`).
- **Backend (Node.js)**: Endpoint `POST /api/v1/auth/register/prestador`.
- **Frontend (React)**: Tela de cadastro de profissional com seleção de categorias e upload de avatar.

---

### US03 - Autenticação de Usuário (Login e Token JWT)
**Como** um usuário cadastrado (Solicitante ou Prestador)  
**Quero** me autenticar com e-mail e senha  
**Para que** eu possa acessar os recursos protegidos da plataforma.

#### Critérios de Aceite:
- [ ] Autenticação válida retorna token de acesso **JWT (JSON Web Token)** com payload contendo `id`, `email` e `tipo_perfil`.
- [ ] O token JWT deve ser incluído no cabeçalho `Authorization: Bearer <token>` nas requisições protegidas.
- [ ] Tratar erros de credenciais inválidas de forma genérica ("E-mail ou senha incorretos").

#### Tarefas Técnicas:
- **Backend (Node.js)**: Endpoint `POST /api/v1/auth/login` utilizando a biblioteca `jsonwebtoken` e `bcrypt.compare`.
- **Backend**: Middleware `authMiddleware` para verificar token JWT nas rotas protegidas.
- **Frontend (React)**: Contexto de Autenticação (`AuthContext`) no React com salvamento seguro do token.

---

### US04 - Gestão do Perfil do Usuário e Privacidade (LGPD)
**Como** um usuário autenticado  
**Quero** visualizar, editar meus dados cadastrais e gerenciar minhas preferências de privacidade  
**Para que** minhas informações se mantenham atualizadas e eu exerça meus direitos sob a LGPD.

#### Critérios de Aceite:
- [ ] Exibição e atualização de Nome, Telefone, Endereço e Foto de Perfil.
- [ ] Opção de alterar a senha confirmando a senha antiga.
- [ ] Botão de "Solicitar exclusão da conta/dados" (Soft delete ou anonimização conforme LGPD).

#### Tarefas Técnicas:
- **Backend (Node.js)**: Endpoints `GET /api/v1/perfil` e `PUT /api/v1/perfil`.
- **Frontend (React)**: Tela de configurações da conta.

---

## 📝 Épico 2: Publicação e Gerenciamento de Requisições (Solicitante)

### US05 - Publicação de Nova Solicitação de Serviço
**Como** um Solicitante  
**Quero** publicar uma nova solicitação descrevendo o serviço necessário  
**Para que** prestadores possam visualizar a demanda e me enviar propostas.

#### Critérios de Aceite:
- [ ] Formulário solicitando: Título, Categoria do Serviço, Descrição detalhada do problema/necessidade, Localização/Bairro, Prazo estimado desejado.
- [ ] Opção de anexar fotos/documentos do problema (até 5 arquivos, máx 10MB cada).
- [ ] Status inicial da solicitação definido automaticamente como `ABERTA`.

#### Tarefas Técnicas:
- **BD**: Tabela `solicitacoes` (`id`, `solicitante_id`, `categoria_id`, `titulo`, `descricao`, `cidade_bairro`, `status`, `criado_em`).
- **BD**: Tabela `anexos_solicitacao` (`id`, `solicitacao_id`, `url_arquivo`, `nome_original`).
- **Backend (Node.js)**: Endpoint `POST /api/v1/solicitacoes` com suporte a upload de imagens via `multer`.
- **Frontend (React)**: Formulário passo-a-passo (Wizard) com upload drag-and-drop.

---

### US06 - Painel "Minhas Solicitações" (Solicitante)
**Como** um Solicitante  
**Quero** listar todas as minhas solicitações publicadas  
**Para que** eu acompanhe o número de propostas recebidas e o andamento de cada serviço.

#### Critérios de Aceite:
- [ ] Listagem de solicitações com indicador visual de status: `ABERTA`, `EM_NEGOCIACAO`, `CONTRATADA`, `CONCLUIDA`, `CANCELADA`.
- [ ] Exibição da quantidade de propostas recebidas por solicitação.
- [ ] Filtro por status e busca por palavra-chave do título.

#### Tarefas Técnicas:
- **Backend (Node.js)**: Endpoint `GET /api/v1/solicitacoes/minhas` (com count de propostas via Sequelize `GROUP BY`).
- **Frontend (React)**: Lista de cards responsivos com contadores de propostas.

---

### US07 - Cancelamento de Solicitação de Serviço
**Como** um Solicitante  
**Quero** cancelar uma solicitação por mim publicada  
**Para que** os prestadores não continuem enviando propostas para um serviço desnecessário.

#### Critérios de Aceite:
- [ ] Cancelamento permitido se o status for `ABERTA` ou `EM_NEGOCIACAO` (antes da contratação).
- [ ] Solicitar motivo do cancelamento.
- [ ] Notificar os prestadores que já haviam enviado propostas informando o cancelamento.

#### Tarefas Técnicas:
- **Backend (Node.js)**: Endpoint `PATCH /api/v1/solicitacoes/:id/cancelar`.
- **Frontend (React)**: Modal de confirmação de cancelamento.

---

## 🔍 Épico 3: Feed e Busca de Oportunidades (Prestador)

### US08 - Feed de Oportunidades de Serviços para Prestadores
**Como** um Prestador de Serviço  
**Quero** visualizar um feed com as solicitações de serviços abertas na minha área de atuação  
**Para que** eu encontre trabalhos compatíveis com minhas habilidades e região.

#### Critérios de Aceite:
- [ ] Exibir apenas solicitações com status `ABERTA`.
- [ ] Filtros por Categoria de Serviço, Cidade/Bairro e ordenação por mais recentes.
- [ ] Exibição resumida: Título, Categoria, Bairro, Data de publicação e prévia da descrição.

#### Tarefas Técnicas:
- **Backend (Node.js)**: Endpoint `GET /api/v1/prestador/oportunidades` com filtros de busca SQL.
- **Frontend (React)**: Feed de vagas/serviços com barra de busca e filtros dinâmicos.

---

### US09 - Visualização Detalhada da Solicitação pelo Prestador
**Como** um Prestador de Serviço  
**Quero** abrir os detalhes de uma solicitação de serviço  
**Para que** eu avalie a complexidade, veja fotos do problema e decida se enviarei uma proposta.

#### Critérios de Aceite:
- [ ] Exibir descrição completa, fotos/anexos e localização aproximada.
- [ ] Exibir se o prestador logado já enviou proposta para aquela solicitação.
- [ ] Botão de ação "Enviar Proposta".

#### Tarefas Técnicas:
- **Backend (Node.js)**: Endpoint `GET /api/v1/solicitacoes/:id`.
- **Frontend (React)**: Tela de detalhamento da requisição com galeria de imagens.

---

## 💰 Épico 4: Envio, Comparação e Aceite de Propostas/Orçamentos

### US10 - Envio de Proposta/Orçamento pelo Prestador
**Como** um Prestador de Serviço  
**Quero** enviar uma proposta comercial para uma solicitação aberta  
**Para que** o cliente avalie meu orçamento e condições de atendimento.

#### Critérios de Aceite:
- [ ] Formulário de proposta com: Valor Total (R$), Prazo Estimado de Execução (em dias/horas), Descrição das Condições/Metodologia e Validade da Proposta.
- [ ] Permitir apenas 1 proposta ativa por prestador para cada solicitação.
- [ ] O envio altera o status da solicitação para `EM_NEGOCIACAO` (se ainda estiver `ABERTA`).

#### Tarefas Técnicas:
- **BD**: Tabela `propostas` (`id`, `solicitacao_id`, `prestador_id`, `valor`, `prazo_dias`, `descricao`, `status` [PENDENTE/ACEITA/REJEITADA], `criado_em`).
- **Backend (Node.js)**: Endpoint `POST /api/v1/solicitacoes/:id/propostas` com validações financeiras.
- **Frontend (React)**: Modal de envio de proposta com campo de valor formatado em R$ (Mask).

---

### US11 - Visualização e Comparação de Propostas Recebidas pelo Solicitante
**Como** um Solicitante  
**Quero** visualizar e comparar todas as propostas enviadas para a minha solicitação  
**Para que** eu tome a decisão de contratação com base em preço, prazo e reputação do prestador.

#### Critérios de Aceite:
- [ ] Tabela ou Grid comparativo listando todas as propostas recebidas.
- [ ] Exibir para cada proposta: Nome e Avatar do Prestador, Nota de Reputação (Estrelas), Valor R$, Prazo estimado e Descrição da Proposta.
- [ ] Link para visualizar o perfil completo do prestador e avaliações de outros clientes.

#### Tarefas Técnicas:
- **Backend (Node.js)**: Endpoint `GET /api/v1/solicitacoes/:id/propostas` incluindo dados do prestador e sua nota média.
- **Frontend (React)**: Painel comparativo de propostas com destaques de menor preço e melhor reputação.

---

### US12 - Aceite e Registro de Contratação da Proposta Escolhida
**Como** um Solicitante  
**Quero** aceitar a proposta de um prestador específico  
**Para que** o acordo de contratação seja formalizado e o serviço seja executado.

#### Critérios de Aceite:
- [ ] Botão "Aceitar Proposta" na proposta escolhida com confirmação.
- [ ] Ao aceitar:
  - A proposta escolhida muda para status `ACEITA`.
  - As demais propostas daquela solicitação mudam automaticamente para `REJEITADA`.
  - A solicitação muda o status para `CONTRATADA`.
  - O chat interno entre o solicitante e o prestador contratado é liberado.

#### Tarefas Técnicas:
- **Backend (Node.js)**: Endpoint `POST /api/v1/propostas/:id/aceitar` executado dentro de uma **transação Sequelize** (Garantia de atomicidade).
- **Frontend (React)**: Alerta de sucesso e redirecionamento para o chat de atendimento.

---

### US13 - Simulação de Pagamento e Retenção de Valor (Garantia / Escrow)
**Como** Solicitante e Prestador  
**Quero** que a plataforma simule a retenção do valor do serviço no momento do aceite  
**Para que** o cliente tenha garantia de execução e o prestador tenha garantia de recebimento após a conclusão.

#### Critérios de Aceite:
- [ ] Ao aceitar a proposta, simular checkout/pagamento em status `RETIDO_EM_CUSTODIA`.
- [ ] O valor só é liberado para a carteira do prestador após a confirmação de conclusão do serviço (`US17`).

#### Tarefas Técnicas:
- **BD**: Tabela `transacoes_custodia` (`id`, `solicitacao_id`, `proposta_id`, `valor`, `status_pagamento` [RETIDO/LIBERADO/REEMBOLSADO]).
- **Backend (Node.js)**: Serviço de simulação de transação e liberação financeira.
- **Frontend (React)**: Modal de simulação de checkout de pagamento.

---

## 💬 Épico 5: Comunicação e Interação (Chat Interno)

### US14 - Chat Privado em Tempo Real entre Solicitante e Prestador
**Como** Solicitante ou Prestador contratado  
**Quero** trocar mensagens de texto no chat interno do chamado  
**Para que** possamos combinar detalhes da execução do serviço, endereço exato e horários.

#### Critérios de Aceite:
- [ ] Chat acessível apenas para o Solicitante e o Prestador da proposta aceita.
- [ ] Atualização automática de novas mensagens (Tempo real via WebSocket / Polling).
- [ ] Exibição de horário de envio e status de leitura da mensagem.

#### Tarefas Técnicas:
- **BD**: Tabela `mensagens_chat` (`id`, `solicitacao_id`, `emissor_id`, `conteudo`, `criado_em`).
- **Backend (Node.js)**: API de mensagens e integração com WebSockets (`Socket.io`).
- **Frontend (React)**: Componente de Chat responsivo.

---

### US15 - Troca de Anexos e Imagens no Chat
**Como** Solicitante ou Prestador  
**Quero** enviar imagens e arquivos de documentos dentro da conversa do chat  
**Para que** eu possa enviar fotos da evolução do serviço ou comprovantes.

#### Critérios de Aceite:
- [ ] Botão de anexo no chat para imagens (JPG, PNG) e arquivos PDF.
- [ ] Pré-visualização de fotos diretamente na bolha de conversa do chat.

#### Tarefas Técnicas:
- **Backend (Node.js)**: Endpoint `POST /api/v1/chat/anexos` com upload para servidor/storage.
- **Frontend (React)**: Componente visual de imagem no chat com modal de ampliação.

---

### US16 - Notificações no Sistema
**Como** um Usuário (Solicitante ou Prestador)  
**Quero** receber alertas dentro do sistema sobre novas propostas, mensagens e atualizações  
**Para que** eu não perca nenhuma oportunidade ou atualização importante.

#### Critérios de Aceite:
- [ ] Notificar o Solicitante quando receber uma nova proposta.
- [ ] Notificar o Prestador quando sua proposta for aceita ou rejeitada.
- [ ] Notificar ambos quando uma nova mensagem for enviada no chat.
- [ ] Central de notificações no Header (ícone de sino com contador de não lidas).

#### Tarefas Técnicas:
- **BD**: Tabela `notificacoes` (`id`, `usuario_id`, `titulo`, `mensagem`, `link_redirecionamento`, `lida`, `criado_em`).
- **Backend (Node.js)**: Disparo de evento de notificação nos controllers.
- **Frontend (React)**: Componente Dropdown de notificações em tempo real.

---

## ⭐ Épico 6: Conclusão de Serviço e Sistema de Reputação

### US17 - Confirmação de Conclusão do Serviço
**Como** Solicitante ou Prestador  
**Quero** marcar o serviço como concluído após a realização do trabalho  
**Para que** a solicitação seja encerrada e a etapa de avaliação seja liberada.

#### Critérios de Aceite:
- [ ] Botão "Marcar como Concluído".
- [ ] Alteração do status da solicitação para `CONCLUIDA`.
- [ ] Liberação do valor retido em custódia e liberação da tela de avaliação de satisfação.

#### Tarefas Técnicas:
- **Backend (Node.js)**: Endpoint `PATCH /api/v1/solicitacoes/:id/concluir`.
- **Frontend (React)**: Modal de confirmação e disparo para avaliação.

---

### US18 - Avaliação de Satisfação e Reputação do Prestador
**Como** um Solicitante  
**Quero** avaliar o serviço prestado atribuindo uma nota e um comentário  
**Para que** eu ajude outros usuários a conhecerem a qualidade do trabalho do prestador.

#### Critérios de Aceite:
- [ ] Avaliação composta por: Nota de 1 a 5 Estrelas e Comentário em texto.
- [ ] Permissão para avaliar uma única vez por serviço contratado.
- [ ] Recálculo automático da Nota Média do Prestador no seu perfil público.

#### Tarefas Técnicas:
- **BD**: Tabela `avaliacoes` (`id`, `solicitacao_id`, `solicitante_id`, `prestador_id`, `nota`, `comentario`, `criado_em`).
- **Backend (Node.js)**: Endpoint `POST /api/v1/avaliacoes` que atualiza a coluna `nota_media_reputacao` na tabela `prestadores_perfil`.
- **Frontend (React)**: Componente de avaliação com 5 estrelas e depoimento.

---

### US19 - Perfil Público do Prestador e Histórico de Avaliações
**Como** qualquer usuário da plataforma  
**Quero** visualizar o perfil público de um prestador contendo suas avaliações anteriores  
**Para que** eu possa verificar sua reputação e histórico de serviços realizados antes de contratá-lo.

#### Critérios de Aceite:
- [ ] Exibir: Nome, Foto, Biografia/Descrição, Categorias em que atua, Nota Média geral (ex: 4.8 / 5.0) e Total de Serviços Concluídos.
- [ ] Listagem de comentários e notas deixados por clientes anteriores.

#### Tarefas Técnicas:
- **Backend (Node.js)**: Endpoint `GET /api/v1/prestadores/:id/perfil-publico`.
- **Frontend (React)**: Tela de Perfil Público do Prestador com resumo de reputação.

---

## 📊 Épico 7: Dashboards, Histórico e Métricas

### US20 - Dashboard do Solicitante
**Como** um Solicitante  
**Quero** visualizar um painel resumo de minhas atividades na plataforma  
**Para que** eu gerencie minhas solicitações ativas e serviços contratados.

#### Critérios de Aceite:
- [ ] Cards numéricos: Serviços Abertos, Propostas Recebidas Pendentes de Análise, Serviços em Andamento e Serviços Concluídos.

#### Tarefas Técnicas:
- **Backend (Node.js)**: Endpoint `GET /api/v1/dashboards/solicitante`.
- **Frontend (React)**: Layout de dashboard com cards de resumo.

---

### US21 - Dashboard do Prestador
**Como** um Prestador de Serviço  
**Quero** visualizar um dashboard com os indicadores das minhas propostas e serviços  
**Para que** eu acompanhe minhas vendas e meu índice de aceitação de orçamentos.

#### Critérios de Aceite:
- [ ] Cards: Propostas Enviadas no Mês, Propostas Aceitas (Serviços Ganhos), Taxa de Conversão %, Nota Atual de Reputação.

#### Tarefas Técnicas:
- **Backend (Node.js)**: Endpoint `GET /api/v1/dashboards/prestador`.
- **Frontend (React)**: Dashboard com cards e estatísticas operacionais.

---

## 🔒 Épico 8: Requisitos Não-Funcionais, Segurança e Usabilidade

### US22 - Segurança e Criptografia de Dados (Node.js / Express)
**Como** Administrador do Sistema  
**Quero** garantir que os dados sensíveis dos usuários estejam seguros e protegidos  
**Para que** a aplicação seja confiável e atenda a boas práticas de segurança.

#### Critérios de Aceite:
- [ ] Senhas nunca devem ser salvas em texto puro (Uso estrito de **bcrypt**).
- [ ] Rotas protegidas exigem token **JWT** válido no header.
- [ ] Proteção contra SQL Injection assegurada pelo uso de consultas parametrizadas do **Sequelize ORM**.
- [ ] Proteção contra ataques de força bruta no login (Rate limiting via `express-rate-limit`).

#### Tarefas Técnicas:
- **Backend (Node.js)**: Configuração de middlewares de segurança (`helmet`, `cors`, `express-rate-limit`, `jsonwebtoken`).

---

### US23 - Interface Responsiva e Usabilidade (React & Heurísticas de Nielsen)
**Como** Usuário (Cliente ou Prestador)  
**Quero** utilizar a plataforma em smartphones, tablets ou computadores com uma interface intuitiva  
**Para que** eu execute minhas tarefas de forma simples e rápida sem erros.

#### Critérios de Aceite:
- [ ] Interface 100% responsiva (Mobile-first ou adaptável).
- [ ] Aplicação das 10 Heurísticas de Nielsen (Visibilidade do status, Prevenção de erros, Consistência).
- [ ] Feedback visual claro para todas as ações do usuário (Spinners de carregamento, Toast de sucesso/erro).

#### Tarefas Técnicas:
- **Frontend (React)**: Componentização modular, CSS responsivo e sistema de feedback (`react-toastify` / Notificações).

---

## 🛠️ Épico 9: Engenharia de Software, Testes e Documentação de API

### US24 - Documentação Interativa da API (Swagger / OpenAPI)
**Como** Desenvolvedor e Avaliador de TCC  
**Quero** consultar a documentação interativa das rotas da API REST via Swagger  
**Para que** os endpoints desenvolvidos em Node.js possam ser testados e validados facilmente pela banca.

#### Critérios de Aceite:
- [ ] Rota `/api-docs` exibindo a interface do Swagger UI.
- [ ] Mapeamento dos schemas de entrada/saída (DTOs) e respostas de erro HTTP (200, 400, 401, 404, 500).

#### Tarefas Técnicas:
- **Backend (Node.js)**: Configuração das bibliotecas `swagger-ui-express` e `swagger-jsdoc`.

---

### US25 - Migrações e Dados Fictícios de Demonstração (Sequelize Migrations & Seeders)
**Como** Avaliador da Banca de TCC  
**Quero** executar comandos simples de banco de dados para popular a aplicação com dados fictícios coerentes  
**Para que** a plataforma possa ser demonstrada em funcionamento completo durante a apresentação.

#### Critérios de Aceite:
- [ ] Arquivos de *Migration* cobrindo todas as tabelas do sistema.
- [ ] Arquivos de *Seeder* contendo usuários fictícios (clientes e prestadores), solicitações e propostas já enviadas para testes de bancadas.

#### Tarefas Técnicas:
- **Backend (Node.js)**: Criação de scripts `npm run db:migrate` e `npm run db:seed` via `sequelize-cli`.

---

### US26 - Cobertura de Testes de Integração da API REST
**Como** Desenvolvedor  
**Quero** executar testes automatizados dos fluxos de autenticação, criação de requisição e proposta  
**Para que** a estabilidade e a qualidade do código sejam garantidas.

#### Critérios de Aceite:
- [ ] Testes automatizados das rotas críticas (Login, Registro, Abertura de Solicitação e Aceite de Proposta).
- [ ] Relatório de execução sem falhas.

#### Tarefas Técnicas:
- **Backend (Node.js)**: Implementação de testes de integração utilizando **Jest** e **Supertest**.

---

## 🛠️ Matriz de Priorização (MoSCoW)

| Épico | História | Título da História | Prioridade (MoSCoW) | Estimativa (Story Points) |
|---|---|---|---|---|
| **E1** | US01 | Cadastro de Solicitante | Must Have | 3 |
| **E1** | US02 | Cadastro de Prestador | Must Have | 5 |
| **E1** | US03 | Autenticação (Login e JWT) | Must Have | 5 |
| **E1** | US04 | Gestão de Perfil e LGPD | Should Have | 3 |
| **E2** | US05 | Publicação de Solicitação | Must Have | 8 |
| **E2** | US06 | Painel "Minhas Solicitações" | Must Have | 5 |
| **E2** | US07 | Cancelamento de Solicitação | Should Have | 3 |
| **E3** | US08 | Feed de Oportunidades | Must Have | 5 |
| **E3** | US09 | Detalhes da Solicitação | Must Have | 3 |
| **E4** | US10 | Envio de Proposta/Orçamento | Must Have | 8 |
| **E4** | US11 | Comparação de Propostas | Must Have | 5 |
| **E4** | US12 | Aceite e Contratação | Must Have | 8 |
| **E4** | US13 | Simulação de Pagamento/Custódia | Should Have | 5 |
| **E5** | US14 | Chat Interno em Tempo Real | Should Have | 8 |
| **E5** | US15 | Anexos no Chat | Could Have | 5 |
| **E5** | US16 | Notificações no Sistema | Should Have | 5 |
| **E6** | US17 | Conclusão do Serviço | Must Have | 3 |
| **E6** | US18 | Avaliação e Reputação | Must Have | 5 |
| **E6** | US19 | Perfil Público do Prestador | Should Have | 5 |
| **E7** | US20 | Dashboard do Solicitante | Should Have | 3 |
| **E7** | US21 | Dashboard do Prestador | Should Have | 5 |
| **E8** | US22 | Segurança e Criptografia (JWT/bcrypt) | Must Have | 5 |
| **E8** | US23 | Interface Responsiva e UX (React) | Must Have | 5 |
| **E9** | US24 | Documentação da API (Swagger) | Should Have | 5 |
| **E9** | US25 | Migrações e Seeders (Sequelize CLI) | Must Have | 5 |
| **E9** | US26 | Testes de Integração (Jest/Supertest) | Should Have | 5 |
