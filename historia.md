# Sistema de Requisição de Serviço (TCC) - Especificação Granular de Histórias de Usuário

> **Alinhamento com o TCC**: Esta especificação foi revisada e ajustada para refletir **100% do escopo do TCC** definido em `TCC.md` (Plataforma Bilateral de Intermediação de Serviços sob Demanda entre Solicitantes e Prestadores), utilizando a stack **Node.js (API REST com Sequelize)**, **React**, **MySQL**, **JWT** e **bcrypt**.


> **Conferência de implementação — 25/10/2026:** os critérios foram confrontados com o código e os complementos foram implementados nas próprias histórias existentes. US19/US20/US21 receberam telas e endpoints; US01/US02 validação de documentos e foto no cadastro; US05 etapas de publicação; US10 validade comercial; US13 carteira simulada derivada da custódia; US22 proteção de login e validação de conta ativa; US24 contratos OpenAPI; US25 dados de demonstração; US26 testes reais com MySQL isolado. Os critérios e a numeração existentes foram preservados. Evidências e limites da verificação estão em `LOG_DESENVOLVIMENTO.md` e `STATUS_HISTORIAS.md`.

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
- [Épico 10: Administração e Gestão da Plataforma](#-épico-10-administração-e-gestão-da-plataforma)
- [Matriz de Priorização (MoSCoW)](#-matriz-de-priorização-moscow)

---

## 🔑 Épico 1: Autenticação, Perfis de Usuário e LGPD

### US01 - Cadastro de Usuário Solicitante (Cliente)
**Como** um cliente buscando serviços  
**Quero** me cadastrar informando meus dados pessoais  
**Para que** eu possa publicar solicitações de serviços e receber propostas de prestadores.

#### Critérios de Aceite:
- [x] Formulário deve coletar: Nome Completo, E-mail, CPF, Telefone/WhatsApp, Endereço e Senha.
- [x] O e-mail e o CPF devem ser únicos no banco de dados.
- [x] A senha deve ser criptografada com **bcrypt** (salt rounds mínimo 10).
- [x] Atribuição automática do perfil `SOLICITANTE`.
- [x] Termo de consentimento explícito para tratamento de dados (conformidade LGPD).

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
- [x] Formulário deve coletar: Nome/Razão Social, E-mail, CPF/CNPJ, Telefone, Categorias de Atuação, Descrição Profissional e Foto de Perfil.
- [x] Atribuição do perfil `PRESTADOR`.
- [x] Armazenamento da senha com **bcrypt**.

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
- [x] Autenticação válida retorna token de acesso **JWT (JSON Web Token)** com payload contendo `id`, `email` e `tipo_perfil`.
- [x] O token JWT deve ser incluído no cabeçalho `Authorization: Bearer <token>` nas requisições protegidas.
- [x] Tratar erros de credenciais inválidas de forma genérica ("E-mail ou senha incorretos").

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
- [x] Exibição e atualização de Nome, Telefone, Endereço e Foto de Perfil.
- [x] Opção de alterar a senha confirmando a senha antiga.
- [x] Botão de "Solicitar exclusão da conta/dados" (Soft delete ou anonimização conforme LGPD).

#### Tarefas Técnicas:
- **Backend (Node.js)**: Endpoints `GET /api/v1/perfil` e `PUT /api/v1/perfil`.
- **Frontend (React)**: Tela de configurações da conta.

---

### US40 - Documentos Legais, Aceite Versionado e Direitos de Privacidade
**Como** uma pessoa que utiliza a plataforma

**Quero** ler os Termos de Uso e a Política de Privacidade, conhecer o que aceitei e solicitar atendimento sobre meus dados

**Para que** eu entenda o serviço e possa exercer meus direitos com transparência.

#### Critérios de Aceite:
- [x] Termos de Uso e Política de Privacidade públicos, em português, acessíveis sem login no cadastro e rodapé, com versão/data e regras coerentes com o protótipo e pagamento simulado.
- [x] Cadastro distingue aceite dos Termos e ciência da Política, sem caixa pré-marcada ou consentimento genérico para qualquer uso. API exige as versões vigentes e os dois sinais explícitos; alteração de versão não é aceita silenciosamente.
- [x] Persistir versões e data do aceite no cadastro, usando relógio do servidor. Contas anteriores permanecem com versão desconhecida, sem atribuir aceite retroativo.
- [x] Central de Privacidade mostra registros do usuário e permite enviar/acompanhar pedidos de acesso, correção, exclusão, informação ou revogação de consentimento, com protocolo, validação e isolamento por titular.
- [x] Administrador acompanha e responde aos pedidos; resposta e data ficam registradas. Responder não exclui dados automaticamente nem promete prazo, anonimização ou cumprimento jurídico não implementado.
- [x] Informar dados/finalidades, visibilidade e fornecedores, armazenamento local de sessão, retenção efetiva, direitos e canal da equipe, distinguindo bases necessárias ao serviço de consentimento específico.
- [x] Documentar limitações acadêmicas e necessidades de configuração do responsável antes de operação pública. Cobrir validações, persistência, autorização e migração com testes; conferir links/formulários no desktop e celular.

#### Tarefas Técnicas:
- **BD**: Migration de versões de aceite em usuarios e tabela de solicitacoes_privacidade, sem backfill de aceite legado.
- **Backend (Node.js)**: Metadados públicos versionados, validação do cadastro e endpoints autenticados do titular e da administração, com OpenAPI e resposta transacional auditável.
- **Frontend (React)**: Páginas legais, rodapé compartilhado, aceite com links e Central de Privacidade com caixa administrativa.
- **Testes/Documentação**: Integração, conteúdo coerente com recursos existentes, referências oficiais LGPD/ANPD, registro de limites e implantação.

---

## 📝 Épico 2: Publicação e Gerenciamento de Requisições (Solicitante)

### US05 - Publicação de Nova Solicitação de Serviço
**Como** um Solicitante  
**Quero** publicar uma nova solicitação descrevendo o serviço necessário  
**Para que** prestadores possam visualizar a demanda e me enviar propostas.

#### Critérios de Aceite:
- [x] Formulário solicitando: Título, Categoria do Serviço, Descrição detalhada do problema/necessidade, Localização/Bairro, Prazo estimado desejado.
- [x] Opção de anexar fotos/documentos do problema (até 5 arquivos, máx 10MB cada).
- [x] Status inicial da solicitação definido automaticamente como `ABERTA`.

#### Tarefas Técnicas:
- **BD**: Tabela `solicitacoes` (`id`, `solicitante_id`, `categoria_id`, `titulo`, `descricao`, `cidade_bairro`, `status`, `criado_em`).
- **BD**: Tabela `anexos_solicitacao` (`id`, `solicitacao_id`, `url_arquivo`, `nome_original`).
- **Backend (Node.js)**: Endpoint `POST /api/v1/solicitacoes` com suporte a upload de imagens via `multer`.
- **Frontend (React)**: Formulário passo-a-passo (Wizard) com upload drag-and-drop.
- **Nota (13/09/2026)**: adicionado texto de apoio com exemplos de descrição bem escrita acima do campo (ex.: "O que precisa ser feito, desde quando, e algum detalhe que ajude o prestador a orçar sem precisar perguntar") — feedback de teste real de que a tela ficava genérica demais para quem nunca usou a plataforma.

---

### US06 - Painel "Minhas Solicitações" (Solicitante)
**Como** um Solicitante  
**Quero** listar todas as minhas solicitações publicadas  
**Para que** eu acompanhe o número de propostas recebidas e o andamento de cada serviço.

#### Critérios de Aceite:
- [x] Listagem de solicitações com indicador visual de status: `ABERTA`, `EM_NEGOCIACAO`, `CONTRATADA`, `CONCLUIDA`, `CANCELADA`.
- [x] Exibição da quantidade de propostas recebidas por solicitação.
- [x] Filtro por status e busca por palavra-chave do título.

#### Tarefas Técnicas:
- **Backend (Node.js)**: Endpoint `GET /api/v1/solicitacoes/minhas` (com count de propostas via Sequelize `GROUP BY`).
- **Frontend (React)**: Lista de cards responsivos com contadores de propostas.

---

### US07 - Cancelamento de Solicitação de Serviço
**Como** um Solicitante  
**Quero** cancelar uma solicitação por mim publicada  
**Para que** os prestadores não continuem enviando propostas para um serviço desnecessário.

#### Critérios de Aceite:
- [x] Cancelamento permitido se o status for `ABERTA` ou `EM_NEGOCIACAO` (antes da contratação).
- [x] Solicitar motivo do cancelamento.
- [x] Notificar os prestadores que já haviam enviado propostas informando o cancelamento.

#### Tarefas Técnicas:
- **Backend (Node.js)**: Endpoint `PATCH /api/v1/solicitacoes/:id/cancelar`.
- **Frontend (React)**: Modal de confirmação de cancelamento.

---

### US33 - Prestador Também Pode Solicitar Serviços
**Como** um Prestador cadastrado na plataforma  
**Quero** poder publicar minhas próprias solicitações de serviço (ex.: contratar manutenção, reparo, limpeza)  
**Para que** eu também consiga usar a plataforma como cliente, sem precisar criar uma segunda conta.

#### Critérios de Aceite:
- [x] Um usuário com `tipo_perfil = PRESTADOR` consegue acessar "Nova Solicitação" e publicar normalmente (mesmo fluxo da US05), aparecendo em "Minhas Solicitações" como dono dela.
- [x] O prestador continua podendo enviar/gerenciar propostas normalmente em solicitações de terceiros — a nova permissão só acrescenta a capacidade de solicitar, não substitui a de prestar serviço.
- [x] Navbar/CTA de "Nova Solicitação" e "Minhas Solicitações" também aparecem para o perfil Prestador.

#### Tarefas Técnicas:
- **Backend (Node.js)**: relaxar a guarda `exigirSolicitante` em `solicitacaoController.ts` para aceitar `PRESTADOR` além de `SOLICITANTE`/`ADMIN` (o campo `solicitante_id` já é uma FK genérica para `usuarios`, sem restrição de papel).
- **Frontend (React)**: navbar (`page.tsx`) passa a exibir os links/CTA de solicitação para qualquer perfil autenticado.

---

## 🔍 Épico 3: Feed e Busca de Oportunidades (Prestador)

### US08 - Feed de Oportunidades de Serviços para Prestadores
**Como** um Prestador de Serviço  
**Quero** visualizar um feed com as solicitações de serviços abertas na minha área de atuação  
**Para que** eu encontre trabalhos compatíveis com minhas habilidades e região.

#### Critérios de Aceite:
- [x] Exibir apenas solicitações com status `ABERTA`.
- [x] Filtros por Categoria de Serviço, Cidade/Bairro e ordenação por mais recentes.
- [x] Exibição resumida: Título, Categoria, Bairro, Data de publicação e prévia da descrição.

#### Tarefas Técnicas:
- **Backend (Node.js)**: Endpoint `GET /api/v1/prestador/oportunidades` com filtros de busca SQL.
- **Frontend (React)**: Feed de vagas/serviços com barra de busca e filtros dinâmicos.

---

### US09 - Visualização Detalhada da Solicitação pelo Prestador
**Como** um Prestador de Serviço  
**Quero** abrir os detalhes de uma solicitação de serviço  
**Para que** eu avalie a complexidade, veja fotos do problema e decida se enviarei uma proposta.

#### Critérios de Aceite:
- [x] Exibir descrição completa, fotos/anexos e localização aproximada.
- [x] Exibir se o prestador logado já enviou proposta para aquela solicitação.
- [x] Botão de ação "Enviar Proposta".

#### Tarefas Técnicas:
- **Backend (Node.js)**: Endpoint `GET /api/v1/solicitacoes/:id`.
- **Frontend (React)**: Tela de detalhamento da requisição com galeria de imagens.

---

### US36 - Descoberta de Oportunidades que Ainda Aceitam Propostas
**Como** um Prestador procurando serviços
**Quero** encontrar no feed solicitações abertas e em negociação
**Para que** eu consiga enviar um orçamento concorrente enquanto o cliente ainda não contratou um profissional.

#### Critérios de Aceite:
- [x] Feed e vitrine inicial incluem solicitações `ABERTA` e `EM_NEGOCIACAO`, indicando o status correto.
- [x] Solicitações `CONTRATADA`, `CONCLUIDA` ou `CANCELADA` não aparecem como oportunidades disponíveis.
- [x] Os filtros de categoria/local e a busca consideram o mesmo conjunto de solicitações disponíveis.
- [x] Após a primeira proposta, outro prestador consegue encontrar a solicitação pela busca e propor pela página, respeitando a regra de uma proposta por prestador.

#### Tarefas Técnicas:
- **Backend (Node.js)**: Unificar os filtros de disponibilidade no feed e suas opções, alinhados à US10.
- **Frontend (React)**: Status em cada card, busca pública e vitrine compatíveis com a negociação.
- **Testes**: Integração do feed antes/depois da primeira proposta e exclusão dos estados finais.

---

### US29 - Perguntas e Respostas Públicas na Oportunidade
**Como** um Prestador de Serviço  
**Quero** fazer perguntas públicas sobre uma solicitação antes de enviar minha proposta  
**Para que** eu esclareça detalhes que o cliente não descreveu, sem precisar adivinhar ou perder tempo com uma proposta mal informada.

#### Critérios de Aceite:
- [x] Qualquer prestador autenticado pode fazer uma pergunta na página de detalhe da oportunidade (US09), mesmo sem ter enviado proposta ainda.
- [x] O solicitante dono da solicitação pode responder; a resposta fica visível publicamente para todos os prestadores que virem a oportunidade, não só para quem perguntou.
- [x] Perguntas sem resposta ficam visualmente identificadas como pendentes.

#### Tarefas Técnicas:
- **BD**: Tabela `perguntas_solicitacao` (`id`, `solicitacao_id`, `prestador_id`, `pergunta`, `resposta`, `respondida_em`, `criado_em`).
- **Backend (Node.js)**: `POST /api/v1/solicitacoes/:id/perguntas` (prestador pergunta), `PATCH /api/v1/solicitacoes/:id/perguntas/:perguntaId/responder` (só o solicitante dono responde); lista de perguntas incluída no detalhe da oportunidade/solicitação.
- **Frontend (React)**: Seção de Perguntas e Respostas na tela de detalhe da oportunidade (prestador) e na tela de detalhe da própria solicitação (solicitante, pra responder).

---

## 💰 Épico 4: Envio, Comparação e Aceite de Propostas/Orçamentos

### US10 - Envio de Proposta/Orçamento pelo Prestador
**Como** um Prestador de Serviço  
**Quero** enviar uma proposta comercial para uma solicitação aberta  
**Para que** o cliente avalie meu orçamento e condições de atendimento.

#### Critérios de Aceite:
- [x] Formulário de proposta com: Valor Total (R$), Prazo Estimado de Execução (em dias/horas), Descrição das Condições/Metodologia e Validade da Proposta.
- [x] Permitir apenas 1 proposta ativa por prestador para cada solicitação.
- [x] O envio altera o status da solicitação para `EM_NEGOCIACAO` (se ainda estiver `ABERTA`).

#### Tarefas Técnicas:
- **BD**: Tabela `propostas` (`id`, `solicitacao_id`, `prestador_id`, `valor`, `prazo_dias`, `descricao`, `status` [PENDENTE/ACEITA/REJEITADA], `criado_em`).
- **Backend (Node.js)**: Endpoint `POST /api/v1/solicitacoes/:id/propostas` com validações financeiras.
- **Frontend (React)**: Modal de envio de proposta com campo de valor formatado em R$ (Mask).
- **Correção (13/09/2026)**: o filtro de aceite de novas propostas em `oportunidadeService.enviarProposta` só permitia solicitações `ABERTA`, mas o próprio envio da primeira proposta já muda esse status pra `EM_NEGOCIACAO` — bloqueando qualquer prestador seguinte e esvaziando a US11 (nunca havia mais de 1 proposta pra comparar). Corrigido pra aceitar `ABERTA` e `EM_NEGOCIACAO`, só bloqueando de fato quando a solicitação já foi `CONTRATADA`/`CONCLUIDA`/`CANCELADA`.

---

### US11 - Visualização e Comparação de Propostas Recebidas pelo Solicitante
**Como** um Solicitante  
**Quero** visualizar e comparar todas as propostas enviadas para a minha solicitação  
**Para que** eu tome a decisão de contratação com base em preço, prazo e reputação do prestador.

#### Critérios de Aceite:
- [x] Tabela ou Grid comparativo listando todas as propostas recebidas.
- [x] Exibir para cada proposta: Nome e Avatar do Prestador, Nota de Reputação (Estrelas), Valor R$, Prazo estimado e Descrição da Proposta.
- [x] Link para visualizar o perfil completo do prestador e avaliações de outros clientes.
- [x] Exibir também a biografia/descrição do prestador e as categorias em que atua, para o solicitante decidir com mais contexto do que só preço e nota.

#### Tarefas Técnicas:
- **Backend (Node.js)**: Endpoint `GET /api/v1/solicitacoes/:id/propostas` incluindo dados do prestador e sua nota média.
- **Frontend (React)**: Painel comparativo de propostas com destaques de menor preço e melhor reputação.
- **Correção (13/09/2026)**: `solicitacaoService.buscarComPropostas` só selecionava `nota_media_reputacao`/`total_avaliacoes` do `perfil_prestador` — expandido para incluir `descricao_bio` e `categorias`, exibidos no card de cada proposta.

---

### US12 - Aceite e Registro de Contratação da Proposta Escolhida
**Como** um Solicitante  
**Quero** aceitar a proposta de um prestador específico  
**Para que** o acordo de contratação seja formalizado e o serviço seja executado.

#### Critérios de Aceite:
- [x] Botão "Aceitar Proposta" na proposta escolhida com confirmação.
- [x] Ao aceitar:
  - A proposta escolhida muda para status `ACEITA`.
  - As demais propostas daquela solicitação mudam automaticamente para `REJEITADA`.
  - A solicitação muda o status para `CONTRATADA`.
  - ~~O chat interno entre o solicitante e o prestador contratado é liberado.~~ *(revisto pela US34: o chat passou a ser liberado desde o envio da proposta, não mais só no aceite)*
- [x] O Solicitante consegue desfazer um aceite feito por engano, cancelando a contratação enquanto o serviço não foi concluído *(ver US34 — antes desta história, aceitar era irreversível e já recusava automaticamente as demais propostas, sem chance de volta)*.

#### Tarefas Técnicas:
- **Backend (Node.js)**: Endpoint `POST /api/v1/propostas/:id/aceitar` executado dentro de uma **transação Sequelize** (Garantia de atomicidade).
- **Frontend (React)**: Alerta de sucesso e redirecionamento para o chat de atendimento.

---

### US13 - Simulação de Pagamento e Retenção de Valor (Garantia / Escrow)
**Como** Solicitante e Prestador  
**Quero** que a plataforma simule a retenção do valor do serviço no momento do aceite  
**Para que** o cliente tenha garantia de execução e o prestador tenha garantia de recebimento após a conclusão.

#### Critérios de Aceite:
- [x] Ao aceitar a proposta, simular checkout/pagamento em status `RETIDO_EM_CUSTODIA`.
- [x] O valor só é liberado para a carteira do prestador após a confirmação de conclusão do serviço (`US17`).

#### Tarefas Técnicas:
- **BD**: Tabela `transacoes_custodia` (`id`, `solicitacao_id`, `proposta_id`, `valor`, `status_pagamento` [RETIDO/LIBERADO/REEMBOLSADO]).
- **Backend (Node.js)**: Serviço de simulação de transação e liberação financeira.
- **Frontend (React)**: Modal de simulação de checkout de pagamento.

---

### US28 - Painel "Minhas Propostas Enviadas" (Prestador)
**Como** um Prestador de Serviço  
**Quero** visualizar uma lista de todas as propostas que enviei, com o status de cada uma  
**Para que** eu acompanhe quais foram aceitas, recusadas ou ainda estão em análise, sem precisar abrir solicitação por solicitação.

#### Critérios de Aceite:
- [x] Listagem de todas as propostas enviadas pelo prestador autenticado, com título da solicitação, valor, prazo, status e data de envio.
- [x] Filtro por status (Enviada, Em análise, Aceita, Recusada).
- [x] Cada item da lista leva para o detalhe da solicitação correspondente.
- [x] Destaque visual para as propostas aceitas (contratos ganhos).

#### Tarefas Técnicas:
- **Backend (Node.js)**: Endpoint `GET /api/v1/prestador/propostas` — lista as propostas do prestador autenticado, com dados da solicitação associada (título, status) para exibição e link.
- **Frontend (React)**: Tela `/minhas-propostas` com filtro por status.

---

### US31 - Desistência do Prestador Após Contratação
**Como** um Prestador de Serviço  
**Quero** desistir de uma solicitação que já contratei, informando o motivo  
**Para que** o cliente saiba rapidamente e possa buscar outro profissional, em vez de ficar esperando um serviço que não vai acontecer.

#### Critérios de Aceite:
- [x] Botão "Desistir da contratação" disponível para o Prestador dono da proposta `ACEITA`, enquanto a solicitação estiver `CONTRATADA` (antes de `CONCLUIDA`).
- [x] Exige motivo da desistência.
- [x] Ao desistir: a proposta desse prestador muda para `RECUSADA`; a solicitação volta para `EM_NEGOCIACAO` (reabre para novas propostas de outros prestadores); o Solicitante é notificado (reaproveitando a central de notificações da US16).
- [x] O prestador que desistiu não consegue enviar uma nova proposta para a mesma solicitação depois (já coberto pela regra existente de "1 proposta ativa por prestador", US10).

#### Tarefas Técnicas:
- **Backend (Node.js)**: `PATCH /api/v1/prestador/oportunidades/:id/desistir` (`oportunidadeService.desistirContratacao`), restrito ao prestador dono da proposta aceita.
- **Frontend (React)**: botão em `oportunidades/[id]` quando a proposta do prestador logado está `ACEITA` e a solicitação está `CONTRATADA`.

---

### US35 - Resposta do Prestador à Contraproposta do Solicitante
**Como** um Prestador que recebeu uma contraproposta
**Quero** visualizar o valor e a mensagem do cliente e aceitar ou recusar a negociação
**Para que** o orçamento acordado seja explícito e o cliente confirme a contratação pelo valor correto.

#### Critérios de Aceite:
- [x] O prestador vê o valor, a mensagem e a situação da última contraproposta na própria proposta.
- [x] Somente o prestador da proposta pode aceitar ou recusar uma contraproposta pendente, com solicitação em negociação e validade comercial vigente.
- [x] Aceitar atualiza o valor da proposta; recusar mantém o valor anterior. A resposta é registrada e o solicitante é notificado conforme suas preferências.
- [x] A resposta não contrata automaticamente: o solicitante confirma o aceite depois. Enquanto a contraproposta estiver pendente, o aceite da contratação fica bloqueado.
- [x] A comparação e a custódia utilizam o valor atualizado após uma contraproposta aceita. Respostas repetidas ou estados incompatíveis retornam conflito.

#### Tarefas Técnicas:
- **BD**: Migration de situação e data da resposta à contraproposta em `propostas`.
- **Backend (Node.js)**: Endpoint de resposta do prestador, validações de dono/estado/validade e transação com lock.
- **Frontend (React)**: Exibir condições e ações de resposta no detalhe do prestador; situação da negociação na comparação do solicitante e nas decisões pelo chat.
- **Testes**: Cobrir autorização, resposta única, valor contratado/custódia e bloqueio de contratação pendente.

---

## 💬 Épico 5: Comunicação e Interação (Chat Interno)

### US14 - Chat Privado em Tempo Real entre Solicitante e Prestador
**Como** Solicitante ou Prestador contratado  
**Quero** trocar mensagens de texto no chat interno do chamado  
**Para que** possamos combinar detalhes da execução do serviço, endereço exato e horários.

#### Critérios de Aceite:
- [x] Chat acessível apenas para o Solicitante e o Prestador da proposta aceita.
- [x] Atualização automática de novas mensagens (Tempo real via WebSocket / Polling).
- [x] Exibição de horário de envio e status de leitura da mensagem.

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
- [x] Botão de anexo no chat para imagens (JPG, PNG) e arquivos PDF.
- [x] Pré-visualização de fotos diretamente na bolha de conversa do chat.

#### Tarefas Técnicas:
- **Backend (Node.js)**: o anexo foi incorporado ao próprio `POST /api/v1/solicitacoes/:id/mensagens` da US14 (multipart, campo `anexo` opcional) em vez de um endpoint `/api/v1/chat/anexos` separado — mantém a criação da mensagem atômica (texto + anexo numa única mensagem/requisição), seguindo o mesmo padrão já usado pela US05 (`POST /solicitacoes` com anexos). Upload via `uploadAnexoChatMiddleware.ts` (Multer, JPEG/PNG/WEBP/PDF, até 10MB).
- **Frontend (React)**: Componente visual de imagem no chat com modal de ampliação.

---

### US16 - Notificações no Sistema
**Como** um Usuário (Solicitante ou Prestador)  
**Quero** receber alertas dentro do sistema sobre novas propostas, mensagens e atualizações  
**Para que** eu não perca nenhuma oportunidade ou atualização importante.

#### Critérios de Aceite:
- [x] Notificar o Solicitante quando receber uma nova proposta.
- [x] Notificar o Prestador quando sua proposta for aceita ou rejeitada.
- [x] Notificar ambos quando uma nova mensagem for enviada no chat.
- [x] Central de notificações no Header (ícone de sino com contador de não lidas).

#### Tarefas Técnicas:
- **BD**: Tabela `notificacoes` (`id`, `usuario_id`, `titulo`, `mensagem`, `link_redirecionamento`, `lida`, `criado_em`) — já existia desde a US07, reaproveitada aqui como planejado.
- **Backend (Node.js)**: Disparo de notificação em `oportunidadeService.enviarProposta` (US10), `solicitacaoService.atualizarStatusProposta` (US12, cobre aceite e as recusas automáticas das concorrentes) e `chatService.enviarMensagem` (US14). `GET/PATCH /api/v1/notificacoes` para listar/marcar como lida(s). Emissão em tempo real via Socket.io (sala pessoal `usuario:<id>`, entrada automática na conexão).
- **Frontend (React)**: Componente `NotificationBell.tsx` (sino com contador + dropdown, atualização em tempo real via WebSocket), incluído nas telas principais (home, oportunidades, minhas solicitações, admin).

---

### US30 - Configurações de Notificação
**Como** um Usuário (Solicitante ou Prestador)  
**Quero** escolher quais tipos de notificação eu recebo  
**Para que** eu personalize a central de notificações (US16), sem ser incomodado por eventos que não me interessam.

#### Critérios de Aceite:
- [x] Tela de Configurações com um interruptor por tipo de evento: nova proposta recebida, proposta aceita/recusada, nova mensagem no chat, cancelamento de solicitação.
- [x] Um tipo de evento desativado não gera notificação nova para aquele usuário (nem aparece no sino).
- [x] As preferências persistem entre sessões (salvas no banco, vinculadas ao usuário).
- [x] Por padrão, todos os tipos vêm ativados — reproduz o comportamento atual da US16 até o usuário mexer.

#### Tarefas Técnicas:
- **BD**: Tabela `preferencias_notificacao` (`usuario_id`, `tipo_evento`, `ativo`) — tabela separada em vez de colunas fixas na `usuarios`, pra permitir novos tipos de evento no futuro sem migration estrutural.
- **Backend (Node.js)**: `GET/PUT /api/v1/perfil/preferencias-notificacao`; os pontos que criam `Notificacao` (US16: `oportunidadeService`, `solicitacaoService`, `chatService`) passam a checar a preferência do destinatário antes de criar/emitir.
- **Frontend (React)**: Tela `/configuracoes` com um interruptor por tipo de evento, acessível a partir do menu do usuário.

---

### US34 - Negociação por Chat Antes da Contratação e Cancelamento pelo Solicitante
**Como** um Solicitante ou Prestador  
**Quero** poder conversar com o outro lado antes de qualquer decisão de contratação, decidir (aceitar/recusar) direto pelo chat, e poder desfazer uma contratação já aceita  
**Para que** eu negocie os detalhes com calma antes de me comprometer, e não fique preso a um aceite feito por engano.

#### Critérios de Aceite:
- [x] O chat entre o Solicitante e um Prestador é liberado assim que o prestador envia uma proposta (não é mais preciso esperar o aceite) — cada proposta tem sua própria conversa privada, mesmo quando várias propostas concorrentes existem para a mesma solicitação (nenhum prestador vê a conversa dos outros).
- [x] Dentro do chat, o Solicitante consegue "Aceitar" ou "Recusar" a proposta daquele prestador sem precisar sair da tela de chat.
- [x] O Solicitante consegue cancelar uma contratação já aceita, enquanto o serviço ainda não foi concluído — a proposta volta a ficar indisponível, a solicitação volta para `EM_NEGOCIACAO` (reabrindo para novas propostas) e o prestador é notificado. Simétrico à desistência do prestador (US31), agora do lado do solicitante.
- [x] Depois de uma proposta ser recusada (ou de o solicitante cancelar a contratação), a conversa continua acessível para consulta, só não permite novas mensagens.

#### Tarefas Técnicas:
- **BD**: migration adicionando `proposta_id` (FK nullable, com backfill das mensagens antigas a partir da proposta `ACEITA` de cada solicitação) em `mensagens_chat`; a sala do Socket.io passa a ser por proposta (`proposta:<id>`) em vez de por solicitação.
- **Backend (Node.js)**: `chatService.verificarParticipante` passa a ser por `proposta_id` e aceita qualquer status exceto `RECUSADA` (que vira somente leitura); rotas de chat remontadas para `/api/v1/propostas/:propostaId/mensagens`; novo endpoint `PATCH /api/v1/solicitacoes/:id/cancelar-contratacao` (`solicitacaoService.cancelarContratacao`) para o solicitante desfazer o aceite.
- **Frontend (React)**: `ChatPanel`/`ChatDrawer` passam a abrir por proposta (um botão de chat por proposta na lista de comparação do solicitante, e assim que a proposta é enviada do lado do prestador); botões "Aceitar"/"Recusar" dentro do `ChatDrawer`; botão "Cancelar contratação" na tela de detalhe do solicitante.

---

## ⭐ Épico 6: Conclusão de Serviço e Sistema de Reputação

### US17 - Confirmação de Conclusão do Serviço
**Como** Solicitante ou Prestador  
**Quero** marcar o serviço como concluído após a realização do trabalho  
**Para que** a solicitação seja encerrada e a etapa de avaliação seja liberada.

#### Critérios de Aceite:
- [x] Botão "Marcar como Concluído".
- [x] Alteração do status da solicitação para `CONCLUIDA`.
- [x] Liberação do valor retido em custódia e liberação da tela de avaliação de satisfação.
- [x] A conclusão só é aceita quando o pagamento simulado da proposta contratada estiver retido em custódia (`RETIDO`, US13). Sem isso, a API recusa a conclusão com erro 409, e as telas do Solicitante e do Prestador deixam o botão de conclusão indisponível, explicando que o pagamento precisa ser confirmado antes.

#### Tarefas Técnicas:
- **Backend (Node.js)**: Endpoint `PATCH /api/v1/solicitacoes/:id/concluir` (`solicitacaoService.concluir`) — Solicitante ou Prestador contratado confirmam; exige a `TransacaoCustodia` (US13) da proposta aceita em `RETIDO` (sem ela, responde 409), libera-a para `LIBERADO` e notifica o outro lado.
- **Frontend (React)**: Botão "Marcar como concluído" nas telas de detalhe do Solicitante (`minhas-solicitacoes/[id]`) e do Prestador (`oportunidades/[id]`), habilitado só depois do pagamento simulado; antes disso, a tela orienta o Solicitante a confirmar o pagamento e informa o Prestador de que ele ainda não foi feito.
- **Testes**: integração cobrindo a recusa da conclusão sem custódia e a conclusão com custódia `RETIDO`.

---

### US18 - Avaliação de Satisfação e Reputação do Prestador
**Como** um Solicitante  
**Quero** avaliar o serviço prestado atribuindo uma nota e um comentário  
**Para que** eu ajude outros usuários a conhecerem a qualidade do trabalho do prestador.

#### Critérios de Aceite:
- [x] Avaliação composta por: Nota de 1 a 5 Estrelas e Comentário em texto.
- [x] Permissão para avaliar uma única vez por serviço contratado.
- [x] Recálculo automático da Nota Média do Prestador no seu perfil público.

#### Tarefas Técnicas:
- **BD**: Tabela `avaliacoes` (`id`, `solicitacao_id` único, `solicitante_id`, `prestador_id`, `nota`, `comentario`, `criado_em`).
- **Backend (Node.js)**: Endpoint `POST /api/v1/solicitacoes/:id/avaliar` (`avaliacaoService.avaliar`) — exige a solicitação `CONCLUIDA` (US17) e ainda não avaliada; recalcula `nota_media_reputacao`/`total_avaliacoes` em `prestadores_perfil` a partir da média/contagem de todas as avaliações do prestador (não incremental). `GET /api/v1/solicitacoes/:id/avaliacao` busca a avaliação existente.
- **Frontend (React)**: Componente de 5 estrelas + campo de comentário na tela do Solicitante; exibição somente leitura da avaliação recebida na tela do Prestador.
- **Nota (13/09/2026)**: antes desta história, `nota_media_reputacao`/`total_avaliacoes` eram só números fictícios de seed, sem nenhum mecanismo real de avaliação — corrigido a pedido do usuário ("a parte de avaliação de serviço deveria ser mais bem feita").

---

### US19 - Perfil Público do Prestador e Histórico de Avaliações
**Como** qualquer usuário da plataforma  
**Quero** visualizar o perfil público de um prestador contendo suas avaliações anteriores  
**Para que** eu possa verificar sua reputação e histórico de serviços realizados antes de contratá-lo.

#### Critérios de Aceite:
- [x] Exibir: Nome, Foto, Biografia/Descrição, Categorias em que atua, Nota Média geral (ex: 4.8 / 5.0) e Total de Serviços Concluídos.
- [x] Listagem de comentários e notas deixados por clientes anteriores.

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
- [x] Cards numéricos: Serviços Abertos, Propostas Recebidas Pendentes de Análise, Serviços em Andamento e Serviços Concluídos.

#### Tarefas Técnicas:
- **Backend (Node.js)**: Endpoint `GET /api/v1/dashboards/solicitante`.
- **Frontend (React)**: Layout de dashboard com cards de resumo.

---

### US21 - Dashboard do Prestador
**Como** um Prestador de Serviço  
**Quero** visualizar um dashboard com os indicadores das minhas propostas e serviços  
**Para que** eu acompanhe minhas vendas e meu índice de aceitação de orçamentos.

#### Critérios de Aceite:
- [x] Cards: Propostas Enviadas no Mês, Propostas Aceitas (Serviços Ganhos), Taxa de Conversão %, Nota Atual de Reputação.

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
- [x] Senhas nunca devem ser salvas em texto puro (Uso estrito de **bcrypt**).
- [x] Rotas protegidas exigem token **JWT** válido no header.
- [x] Proteção contra SQL Injection assegurada pelo uso de consultas parametrizadas do **Sequelize ORM**.
- [x] Proteção contra ataques de força bruta no login (Rate limiting via `express-rate-limit`).

#### Tarefas Técnicas:
- **Backend (Node.js)**: Configuração de middlewares de segurança (`helmet`, `cors`, `express-rate-limit`, `jsonwebtoken`).

---

### US23 - Interface Responsiva e Usabilidade (React & Heurísticas de Nielsen)
**Como** Usuário (Cliente ou Prestador)  
**Quero** utilizar a plataforma em smartphones, tablets ou computadores com uma interface intuitiva  
**Para que** eu execute minhas tarefas de forma simples e rápida sem erros.

#### Critérios de Aceite:
- [x] Interface 100% responsiva (Mobile-first ou adaptável).
- [x] Aplicação das 10 Heurísticas de Nielsen (Visibilidade do status, Prevenção de erros, Consistência).
- [x] Feedback visual claro para todas as ações do usuário (Spinners de carregamento, Toast de sucesso/erro).

#### Tarefas Técnicas:
- **Frontend (React)**: Componentização modular, CSS responsivo e sistema de feedback (`react-toastify` / Notificações).

---

### US37 - Identidade Visual da Marca Eloserv (Logo, Paleta e Favicon)
**Como** Usuário (Cliente ou Prestador) e Avaliador do TCC
**Quero** que a plataforma tenha nome, logo e cores próprios e consistentes em todas as telas
**Para que** o produto transmita confiança, seja reconhecível e deixe de usar o nome genérico "ServiçoFácil" e o logo provisório.

#### Critérios de Aceite:
- [x] O nome da plataforma passa a ser **Eloserv** em todos os textos visíveis (título da aba do navegador, cabeçalho, página inicial, rodapé e links de navegação).
- [x] O logo da marca (símbolo de dois elos encadeados — cliente e prestador — + palavra "eloserv" na fonte Sora) substitui o "S" provisório no cabeçalho, com cores fixas: índigo `#4F46E5` + azul-céu `#0EA5E9` (versão clara) e `#818CF8` + `#38BDF8` (versão para fundo escuro).
- [x] O ícone da aba do navegador (favicon) usa o símbolo do logo.
- [x] A paleta "Elo", derivada das cores do logo, é aplicada em toda a interface: fundo `#0E1024`, superfície `#171A3A`, borda `#2C3166`, texto `#EEF2FF`, texto secundário `#A5ACD6` e cor primária `#4F46E5` (botões com texto branco).
- [x] As cores semânticas de status são preservadas (sucesso em verde, erro em vermelho, alerta em âmbar, "Contratada" em violeta), para não mudar o significado visual já conhecido pelo usuário.
- [x] Os pares de texto e fundo da nova paleta mantêm contraste mínimo WCAG AA (4,5:1).
- [x] O banco de dados deixa o nome antigo e passa a se chamar `tcc_eloserv` (e `tcc_eloserv_test` nos testes), com todos os dados, migrations e seeders preservados, e o banco antigo mantido como cópia até a confirmação.

#### Tarefas Técnicas:
- **Design**: Exploração de 6 nomes/logos e 5 paletas em canvas de design (protótipos da página inicial, página do usuário logado e tela mobile), com escolha do nome Eloserv e da paleta "Elo".
- **Frontend (Next.js)**: Tokens de cor em `globals.css`, componente reutilizável `Logo.tsx` (símbolo SVG + palavra), favicon `app/icon.svg`, `metadata` do `layout.tsx` e substituição das cores fixas nos estilos inline das telas pelos valores da nova paleta. As chaves internas do `localStorage` (`@ServicoFacil:*`) são mantidas, pois não aparecem para o usuário e renomeá-las deslogaria as sessões existentes.
- **Banco de Dados (MySQL)**: Cópia de `tcc_servico_facil` para `tcc_eloserv` com `mysqldump` (estrutura, chaves estrangeiras, dados e histórico do `SequelizeMeta`), atualização de `.env`, `.env.example`, `docker-compose.yml`, `sequelize-cli.js`, `database.ts`, testes, CI e README. Nomes de container e volume do Docker são mantidos para não recriar o volume de dados.

---

### US38 - Nova Página Inicial para Visitante e Usuário Logado
**Como** Visitante, Solicitante ou Prestador
**Quero** uma página inicial que explique a plataforma para quem chega e, depois do login, mostre o que preciso fazer agora
**Para que** eu comece um pedido ou encontre clientes rapidamente, sem precisar procurar as funções nos menus.

#### Critérios de Aceite:
- [x] **Visitante — cabeçalho:** logo, links "Como funciona" e "Para prestadores", "Entrar" e "Criar conta", sem a busca de oportunidades (que confundia com o campo de pedido).
- [x] **Visitante — destaque:** campo "O que você precisa?" que inicia uma nova solicitação com o título já preenchido (sem login, o texto fica guardado como rascunho e o usuário vai para o login), atalhos para as categorias da plataforma, aviso do pagamento com garantia (US13) e um card de propostas identificado como exemplo.
- [x] **Visitante — "Como funciona":** cinco passos (publicar, comparar propostas, conversar pelo chat, pagar com garantia, avaliar).
- [x] **Visitante — "Para prestadores":** bloco próprio, separado do conteúdo do cliente, com os pedidos abertos reais do feed público (US08/US36) e chamadas para o cadastro de prestador e para o feed completo.
- [x] **Logado — cabeçalho:** busca adequada ao perfil, links do perfil (Oportunidades e Minhas propostas para o prestador; Painel Admin para o admin), sino de notificações, botão "Nova solicitação" e um menu da conta que agrupa Meu painel, Meu perfil, Configurações e Sair (em telas estreitas, os links do perfil também passam para esse menu).
- [x] **Solicitante:** saudação com resumo das propostas pendentes, campo para um novo pedido, "Seus pedidos" com o status e a próxima ação de cada um (comparar propostas, continuar negociação, acompanhar serviço, ver detalhes), card de mensagens recentes e card explicando a garantia do pagamento.
- [x] **Prestador:** indicadores (propostas aguardando resposta, serviços contratados em andamento, valor retido em custódia e reputação), "Oportunidades para você", últimas propostas com status, card de mensagens recentes e atalho "Também precisa de um serviço?" (US33).
- [x] Todos os números e listas vêm da API real, com estados de carregamento, lista vazia e erro; o único conteúdo fixo é o card de exemplo do visitante.
- [x] Layout responsivo: blocos empilham em telas estreitas (390px) sem rolagem horizontal.

#### Tarefas Técnicas:
- **Design**: Protótipo da página do visitante e da página logada (perfis Solicitante e Prestador) no mesmo canvas de design da US37, revisado com o usuário antes da implementação.
- **Frontend (Next.js)**: `app/page.tsx` reorganizada em cabeçalho, conteúdo e rodapé, com os novos componentes `components/home/HomeVisitante.tsx` e `components/home/HomeLogado.tsx` e o menu da conta `components/MenuConta.tsx`. `nova-solicitacao` passa a aceitar `?titulo=` e `?categoria=` e o rascunho guardado. Sem endpoint novo: reaproveita `GET /dashboards/solicitante`, `GET /dashboards/prestador`, `GET /solicitacoes/minhas`, `GET /prestador/propostas`, `GET /prestador/oportunidades` e `GET /notificacoes`. O card de mensagens usa as notificações de nova mensagem do chat (US14/US16), porque não existe rota de conversas recentes.

---

### US39 - Redesign das Telas Internas com Componentes Compartilhados
**Como** Visitante, Solicitante, Prestador ou Administrador
**Quero** que todas as telas sigam o mesmo visual da nova página inicial e mostrem claramente o próximo passo
**Para que** eu use a plataforma sem precisar reaprender cada tela e saiba sempre o que fazer a seguir.

#### Critérios de Aceite:
- [x] Cabeçalho e rodapé compartilhados em todas as telas internas (o login tem layout próprio), com o link da seção atual destacado.
- [x] Botões, campos, etiquetas de status, avisos e estados de carregando, lista vazia e erro padronizados: um único botão principal por área, ações de cancelar/desativar no estilo de perigo e erros de validação embaixo do campo.
- [x] **Entrada:** login em duas colunas com opção de mostrar a senha e as contas de demonstração como bloco secundário; cadastros de cliente e de prestador em seções numeradas, com a regra real da senha visível e, no prestador, prévia de como o perfil aparece para os clientes.
- [x] **Cliente:** nova solicitação com etapas e prévia do pedido; "Minhas solicitações" com abas por status e contagem, destaque dos pedidos que precisam de ação e a próxima ação de cada um; detalhe com a linha do andamento (publicado → propostas → contratado → concluído → avaliado), propostas comparáveis (valor, prazo e validade alinhados, "Menor preço"), estados de contraproposta e de proposta expirada explicados no próprio card e perguntas sem resposta destacadas; pedido contratado com pagamento com garantia, conclusão e avaliação em sequência.
- [x] **Prestador:** feed de oportunidades com filtros laterais e filtros ativos removíveis; detalhe da oportunidade com o formulário de proposta ao lado e o resumo do que o cliente verá; "Minhas propostas" com abas por status e ações em destaque (contraproposta, serviço contratado); perfil público com resumo de reputação.
  - *Ajuste na implementação:* a lista de "Minhas propostas" não recebe os campos de contraproposta da API, então o destaque de contraproposta fica no detalhe da oportunidade; a lista destaca as propostas aceitas (serviço contratado).
- [x] **Conta e gestão:** painel com abas Prestador/Solicitante; "Minha conta" com navegação lateral (dados pessoais, senha, notificações, privacidade); notificações com interruptores acessíveis; chat com o contexto da proposta ao lado; painel administrativo com indicadores, abas e tabela com rolagem horizontal; status do sistema com link para a documentação da API.
  - *Ajuste na implementação:* a rota do chat recebe só o id da conversa, então o cartão lateral mostra a conversa e o atalho de volta, sem os dados da proposta; o painel administrativo não ganhou os blocos de indicadores porque as listagens da API vêm filtradas e não há rota de totais (fica o aviso de denúncias pendentes e a contagem na aba).
- [x] Nenhuma regra de negócio ou endpoint alterado: os fluxos existentes (propostas, contraproposta, pagamento simulado, conclusão, avaliação, denúncia, perguntas, chat, administração) continuam funcionando como antes.
- [x] Telas responsivas (390px sem rolagem horizontal), áreas de toque de pelo menos 44px, rótulos associados a todos os campos e foco visível.

#### Tarefas Técnicas:
- **Design**: Protótipo das 16 telas e da prancha de componentes no canvas de design da US37/US38, revisado e aprovado pelo usuário antes da implementação.
- **Frontend (Next.js)**: Componentes compartilhados em `components/ui/` (cabeçalho, rodapé, layout de página, etapas, etiqueta de status, avisos e estilos) e reestruturação visual de todas as páginas em `app/`, mantendo os estados, chamadas à API e validações existentes.

---

### US42 - Tema Claro e Troca de Tema
**Como** usuário da plataforma (Solicitante, Prestador, Administrador ou visitante)
**Quero** usar o Eloserv em tema claro ou escuro, escolhendo o tema ou seguindo a preferência do meu dispositivo
**Para que** a leitura fique confortável em qualquer ambiente e as telas possam ser capturadas em tema claro para a monografia.

#### Critérios de Aceite:
- [x] Tema claro com a paleta Elo clara aprovada em 26/10/2026 (página "5 · Tema claro" do canvas de design), aplicado a todas as telas, componentes, avisos, chips, modais, chat e notificações.
- [x] Sem escolha salva, o tema segue a preferência do sistema operacional (`prefers-color-scheme`). O usuário pode escolher **Automático**, **Claro** ou **Escuro** no menu da conta; visitantes escolhem no rodapé. O tema ativo fica indicado no controle.
- [x] A escolha fica salva no navegador e vale em todas as telas e nas próximas visitas. É aplicada antes da primeira pintura, sem a página piscar no tema errado ao carregar.
- [x] O logo usa as versões fixas da marca: escura (#818CF8 + #38BDF8) no tema escuro e clara (#4F46E5 + #0EA5E9, "serv" em #0F172A) no claro. O recorte entre os elos acompanha o fundo.
- [x] Contraste WCAG AA nos dois temas: texto com pelo menos 4,5:1; bordas de campos de formulário e ícones informativos com pelo menos 3:1.
- [x] Nenhuma cor fixa de interface fora das variáveis de tema. As exceções são as cores fixas do logo e o "papel" branco dos diagramas da página `/arquitetura` (US41).
- [x] Controles nativos (campos, listas, barras de rolagem, seletor de data) acompanham o tema (`color-scheme`).
- [x] O tema escuro continua idêntico ao atual (US39), exceto correções de contraste que já falhavam: borda de campo #2C3166 → #5F67A0 (inclusive nos campos do chat), selo de notificação #EF4444 → #DC2626 e texto do botão verde do chat, de branco para #0E1024. As telas funcionam em 1280px e 375px nos dois temas.

#### Tarefas Técnicas:
- **Frontend (Next.js) — 1. Tokens de tema (`globals.css`):**
  - completar as variáveis de `:root` com todos os papéis da paleta: fundo, destaque, superfície, borda, borda de campo, texto, texto secundário, apoio, detalhe, primária e hover, link, azul-céu (texto, ícone e fundo), aviso, erro, sucesso e informação (texto, fundo e borda), recorte do logo e sombra;
  - valores atuais em `:root` (escuro) e valores claros em `:root[data-tema="claro"]` e em `@media (prefers-color-scheme: light)` com `:root:not([data-tema="escuro"])`;
  - `color-scheme: dark` / `light` em cada bloco.
- **Frontend — 2. Retirada das cores fixas:**
  - substituir as cerca de 47 cores e 3 `rgba` soltos no `globals.css`, e as cerca de 180 cores e 33 `rgba` em 27 arquivos `.tsx`, por `var(--...)`, seguindo a tabela escuro → claro do canvas;
  - ordem: `components/ui` (Elementos, Pagina, LayoutConta, Cabecalho), depois `MenuConta`, `NotificationBell`, `ChatPanel`/`ChatDrawer`, páginas inicial, solicitações, oportunidades, painel, admin, status e cadastros;
  - um script de checagem lista as cores hexadecimais restantes fora das exceções e roda antes de concluir.
- **Frontend — 3. Logo (`Logo.tsx`):** as duas versões fixas da marca, escolhidas pelas variáveis do tema, com o recorte na variável de fundo. A prop `corFundo` continua para fundos especiais.
- **Frontend — 4. Preferência e troca:**
  - `lib/tema.ts`, com ler, salvar e aplicar o tema, a chave `@ServicoFacil:tema` (prefixo usado pelas outras chaves) e os valores `automatico`, `claro` e `escuro`;
  - em `app/layout.tsx`, um script curto no `<head>` aplica `data-tema` antes da pintura, com `suppressHydrationWarning` no `<html>` e `try/catch` para navegador sem armazenamento;
  - componente `SeletorTema`, um controle segmentado acessível (`radiogroup`, foco visível, alvos de 44 px), no `MenuConta` e no rodapé (`LinksRodape`);
  - no modo automático, acompanhar a troca de preferência do sistema com a página aberta (`matchMedia` com `change`).
- **Frontend — 5. Casos especiais:**
  - barra de status, gráficos e indicadores do painel e da página `/status`;
  - imagens e anexos do chat;
  - foco visível (`outline`) com contraste nos dois temas;
  - `theme-color` do navegador no celular.
- **Testes e validação:**
  - script de contraste sobre os tokens dos dois temas, para os pares de texto, borda de campo e ícone;
  - checagem de cores fixas restantes;
  - `tsc` sem erros;
  - conferência no navegador de todas as telas nos dois temas, em 1280px e 375px, com contas demo de solicitante, prestador e admin;
  - recarga sem piscar com preferência clara e escura do sistema;
  - persistência da escolha entre páginas e visitas.
- **Documentação:** `LOG_DESENVOLVIMENTO.md` (sem bibliotecas novas previstas), `STATUS_HISTORIAS.md` e capturas de tela em tema claro para a monografia.

---

## 🛠️ Épico 9: Engenharia de Software, Testes e Documentação de API

### US24 - Documentação Interativa da API (Swagger / OpenAPI)
**Como** Desenvolvedor e Avaliador de TCC  
**Quero** consultar a documentação interativa das rotas da API REST via Swagger  
**Para que** os endpoints desenvolvidos em Node.js possam ser testados e validados facilmente pela banca.

#### Critérios de Aceite:
- [x] Rota `/api-docs` exibindo a interface do Swagger UI.
- [x] Mapeamento dos schemas de entrada/saída (DTOs) e respostas de erro HTTP (200, 400, 401, 404, 500).

#### Tarefas Técnicas:
- **Backend (Node.js)**: Configuração das bibliotecas `swagger-ui-express` e `swagger-jsdoc`.

---

### US25 - Migrações e Dados Fictícios de Demonstração (Sequelize Migrations & Seeders)
**Como** Avaliador da Banca de TCC  
**Quero** executar comandos simples de banco de dados para popular a aplicação com dados fictícios coerentes  
**Para que** a plataforma possa ser demonstrada em funcionamento completo durante a apresentação.

#### Critérios de Aceite:
- [x] Arquivos de *Migration* cobrindo todas as tabelas do sistema.
- [x] Arquivos de *Seeder* contendo usuários fictícios (clientes e prestadores), solicitações e propostas já enviadas para testes de bancadas.

#### Tarefas Técnicas:
- **Backend (Node.js)**: Criação de scripts `npm run db:migrate` e `npm run db:seed` via `sequelize-cli`.
- **Frontend (React)**: Painel "Login rápido" na tela `/login` (adicionado em 13/09/2026) — um botão por conta de demonstração do seeder (Solicitante, Prestador Elétrica, Prestador Encanamento, Admin), login em um clique com a senha padrão `Demo@123`. Facilita alternar entre perfis durante testes/demonstração, sem redigitar credenciais.

---

### US26 - Cobertura de Testes de Integração da API REST
**Como** Desenvolvedor  
**Quero** executar testes automatizados dos fluxos de autenticação, criação de requisição e proposta  
**Para que** a estabilidade e a qualidade do código sejam garantidas.

#### Critérios de Aceite:
- [x] Testes automatizados das rotas críticas (Login, Registro, Abertura de Solicitação e Aceite de Proposta).
- [x] Relatório de execução sem falhas.

#### Tarefas Técnicas:
- **Backend (Node.js)**: Implementação de testes de integração utilizando **Jest** e **Supertest**.

---

### US41 - Página de Arquitetura e Modelagem do Sistema
**Como** integrante da equipe que apresenta o TCC (e Avaliador da Banca)
**Quero** consultar, dentro da própria plataforma, os diagramas de casos de uso, classes, MER e sequência da contratação
**Para que** a modelagem seja apresentada junto com o sistema funcionando, inclusive no vídeo de apresentação, sem depender de links externos.

#### Critérios de Aceite:
- [x] Página pública `/arquitetura`, acessível sem login, com link "Arquitetura" no rodapé.
- [x] Abas Visão geral, Casos de uso, Classes, MER e Sequência da contratação, cada uma com endereço próprio (`/arquitetura?aba=...`) para abrir direto na gravação.
- [x] O conteúdo vem dos arquivos `docs/diagramas/*.md`, a fonte única dos diagramas. A página não guarda cópia e mostra textos, tabelas e diagramas Mermaid desenhados.
- [x] Cada diagrama tem zoom (aproximar, afastar e ajustar à largura) e um botão para baixar em SVG, para usar na monografia.
- [x] Os diagramas aparecem sobre fundo claro, legível no vídeo e igual ao SVG baixado. A página funciona em 1280px e 375px e pode ser navegada pelo teclado.
- [x] Um diagrama com erro ou um arquivo ausente mostra um aviso, sem quebrar o resto da página.

#### Tarefas Técnicas:
- **Frontend (Next.js)**:
  - rota `app/arquitetura/page.tsx` (Server Component que lê os `.md` com `fs`);
  - componente cliente `DiagramaMermaid`, com a biblioteca `mermaid` carregada sob demanda;
  - Markdown desenhado com `react-markdown` e `remark-gfm` (tabelas);
  - links entre os arquivos `.md` convertidos em links de aba;
  - link "Arquitetura" em `LinksRodape`.
- **DevOps**: volume somente leitura `./docs/diagramas` no serviço `frontend` do `docker-compose.yml`, para a página encontrar os arquivos também no container.
- **Documentação**: bibliotecas novas anotadas no código e na tabela do `LOG_DESENVOLVIMENTO.md`.

---

## 🛡️ Épico 10: Administração e Gestão da Plataforma

### US27 - Painel Administrativo de Usuários e Moderação
**Como** um Administrador da plataforma  
**Quero** visualizar, buscar e ativar/desativar usuários cadastrados, além de acompanhar as solicitações em andamento  
**Para que** eu possa dar suporte, moderar o uso indevido da plataforma e garantir a conformidade com a LGPD.

#### Critérios de Aceite:
- [x] Área administrativa acessível apenas pelo perfil `ADMIN` (bloqueio 403 para Solicitante e Prestador).
- [x] Listagem de todos os usuários com filtro por tipo de perfil (Solicitante/Prestador/Admin), status (ativo/inativo) e busca por nome ou e-mail.
- [x] Ação de ativar/desativar (suspender) a conta de um usuário.
- [x] Listagem de todas as solicitações da plataforma, independente do solicitante dono, com filtro por status, para fins de suporte e moderação.
- [x] A partir da listagem, o admin consegue abrir o detalhe completo de qualquer solicitação (descrição, anexos, propostas recebidas), em modo somente leitura — sem poder agir em nome do solicitante dono (cancelar, aceitar/recusar proposta, simular pagamento continuam bloqueados pra quem não é o dono real). *(adicionado em 13/09/2026, extensão natural do item de listagem acima)*
- [x] Cada ação administrativa (ex.: desativar um usuário) registra quem executou e quando.

#### Tarefas Técnicas:
- **Backend (Node.js)**: Rotas protegidas em `/api/v1/admin` (middleware de checagem de `tipo_perfil = ADMIN`): `GET /api/v1/admin/usuarios` (lista/filtra), `PATCH /api/v1/admin/usuarios/:id/status` (ativa/desativa) e `GET /api/v1/admin/solicitacoes` (lista todas, independente de dono). `GET /api/v1/solicitacoes/minhas/:id/propostas` passou a aceitar o `ADMIN` (parâmetro `comoAdmin` no service, ignorando o filtro de dono) para viabilizar o detalhe somente-leitura.
- **Frontend (React)**: Painel `/admin` com tabela de usuários, filtros e ação rápida de ativar/desativar. Cards da aba "Solicitações" linkam pro detalhe (`/minhas-solicitacoes/:id`), que exibe um selo de "modo administrativo" e oculta os botões de ação para o `ADMIN`.
- **Seeder**: Usuário `ADMIN` de demonstração para a banca acessar e testar o painel sem precisar cadastrar um manualmente.

---

### US32 - Denúncia de Solicitação para Moderação
**Como** um Solicitante ou Prestador  
**Quero** denunciar uma solicitação (incluindo o que foi tratado no chat) que considero inadequada, golpe ou abusiva  
**Para que** a administração possa revisar e agir — moderar o conteúdo, cancelar a solicitação ou suspender uma conta, se for o caso.

#### Critérios de Aceite:
- [x] Botão "Denunciar" disponível para quem participa da solicitação (o Solicitante dono ou o Prestador com proposta nela) — na tela de detalhe e dentro do painel de chat.
- [x] Exige motivo da denúncia.
- [x] A denúncia aparece numa nova aba "Denúncias" no Painel Administrativo (US27), com link para a solicitação de origem e quem denunciou.
- [x] O Admin consegue marcar uma denúncia como "Resolvida".

#### Tarefas Técnicas:
- **BD**: Tabela `denuncias` (`id`, `solicitacao_id`, `denunciante_id`, `motivo`, `status` [PENDENTE/RESOLVIDA], `criado_em`).
- **Backend (Node.js)**: `POST /api/v1/solicitacoes/:id/denunciar` (Solicitante dono ou Prestador com proposta); `GET /api/v1/admin/denuncias` e `PATCH /api/v1/admin/denuncias/:id/resolver` (só Admin).
- **Frontend (React)**: botão "Denunciar" na tela de detalhe da solicitação/oportunidade e no `ChatDrawer`; nova aba "Denúncias" no painel `/admin`.

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
| **E2** | US33 | Prestador Também Pode Solicitar Serviços | Could Have | 3 |
| **E3** | US08 | Feed de Oportunidades | Must Have | 5 |
| **E3** | US09 | Detalhes da Solicitação | Must Have | 3 |
| **E3** | US29 | Perguntas e Respostas na Oportunidade | Could Have | 5 |
| **E4** | US10 | Envio de Proposta/Orçamento | Must Have | 8 |
| **E4** | US11 | Comparação de Propostas | Must Have | 5 |
| **E4** | US12 | Aceite e Contratação | Must Have | 8 |
| **E4** | US13 | Simulação de Pagamento/Custódia | Should Have | 5 |
| **E4** | US28 | Minhas Propostas Enviadas (Prestador) | Should Have | 5 |
| **E4** | US31 | Desistência do Prestador Após Contratação | Should Have | 5 |
| **E5** | US14 | Chat Interno em Tempo Real | Should Have | 8 |
| **E5** | US15 | Anexos no Chat | Could Have | 5 |
| **E5** | US16 | Notificações no Sistema | Should Have | 5 |
| **E5** | US30 | Configurações de Notificação | Could Have | 3 |
| **E5** | US34 | Negociação por Chat Antes da Contratação e Cancelamento pelo Solicitante | Must Have | 8 |
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
| **E10** | US27 | Painel Administrativo e Moderação | Should Have | 8 |
| **E10** | US32 | Denúncia de Solicitação para Moderação | Should Have | 5 |
| **E4** | US35 | Resposta à Contraproposta | Must Have | 5 |
| **E3** | US36 | Descoberta de Oportunidades em Negociação | Must Have | 3 |
| **E1** | US40 | Documentos Legais, Aceite Versionado e Direitos de Privacidade | Must Have | 8 |
| **E8** | US37 | Identidade Visual Eloserv (Logo, Paleta e Favicon) | Could Have | 5 |
| **E8** | US38 | Nova Página Inicial (Visitante e Logado) | Should Have | 8 |
| **E8** | US39 | Redesign das Telas Internas com Componentes Compartilhados | Should Have | 13 |
| **E9** | US41 | Página de Arquitetura e Modelagem do Sistema | Should Have | 5 |
| **E8** | US42 | Tema Claro e Troca de Tema | Should Have | 8 |
