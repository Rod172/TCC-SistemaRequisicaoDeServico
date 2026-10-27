# 📝 Log de Desenvolvimento - Sistema de Requisição de Serviço (TCC)

Este arquivo registra o histórico incremental de desenvolvimento, decisões de arquitetura, testes executados e a **documentação com referências oficiais de todas as bibliotecas de terceiros**, conforme a **Regra 2** e a **Regra 5** definidas em `.agents/AGENTS.md`.

---

## 📚 Referências Oficiais das Bibliotecas e Dependências Adotadas

Em estrito cumprimento à **Regra 2**, a tabela abaixo mapeia todas as bibliotecas de terceiros adicionadas nesta etapa inicial do projeto, acompanhadas de suas versões, finalidades e links para a documentação oficial.

### ⚙️ Backend (Node.js / Express com TypeScript)

| Biblioteca | Versão | Propósito / Finalidade no Projeto | Referência Oficial / Link |
|---|---|---|---|
| **Express.js** | `^4.19.2` (resolvida `4.22.3`) | Framework web para criação de rotas, middlewares e API REST | [expressjs.com](https://expressjs.com/pt-br/) |
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
| **Multer** | `^2.3.0` (resolvida `2.5.0`) | Middleware Express para parsing de `multipart/form-data` e upload em disco da foto de perfil (US04) | [github.com/expressjs/multer](https://github.com/expressjs/multer) |
| **@types/jsonwebtoken** | `^9.0.10` | Definições de tipos TypeScript para a biblioteca `jsonwebtoken` | [npmjs.com/package/@types/jsonwebtoken](https://www.npmjs.com/package/@types/jsonwebtoken) |
| **@types/multer** | `^2.2.0` | Definições de tipos TypeScript para a biblioteca `multer` | [npmjs.com/package/@types/multer](https://www.npmjs.com/package/@types/multer) |
| **Socket.io** | `^4.8.3` | Servidor WebSocket para o chat privado em tempo real (US14) | [socket.io](https://socket.io/docs/v4/) |

| **express-rate-limit** | `8.7.1` | Limita tentativas de autenticação por IP, US22 | [Documentação oficial](https://express-rate-limit.mintlify.app/reference/configuration) |
| **Jest** | `30.5.2` | Testes unitários e integração, projetos separados com banco exclusivo, US26 | [Documentação oficial](https://jestjs.io/docs/getting-started) |
| **Supertest** | `7.3.1` | Requisições aos endpoints reais Express sem servidor externo, US26 | [Documentação oficial](https://github.com/forwardemail/supertest) |

### 🎨 Frontend (Next.js 14 / React com TypeScript)

| Biblioteca | Versão | Propósito / Finalidade no Projeto | Referência Oficial / Link |
|---|---|---|---|
| **Next.js** | `^14.2.3` | Framework React para produção com App Router, SSR e roteamento | [nextjs.org](https://nextjs.org/docs) |
| **React** | `^18.3.1` | Biblioteca declarativa para criação da interface do usuário | [react.dev](https://react.dev/) |
| **React DOM** | `^18.3.1` | Renderizador React para o DOM do navegador | [react.dev/reference/react-dom](https://react.dev/reference/react-dom) |
| **TypeScript** | `^5.4.5` | Tipagem estática em componentes JSX (`.tsx`) e utilitários | [typescriptlang.org](https://www.typescriptlang.org/) |
| **Axios** | `^1.7.2` | Cliente HTTP com suporte a interceptores para anexar o token JWT | [axios-http.com](https://axios-http.com/docs/intro) |
| **Lucide React** | `^0.383.0` | Conjunto de ícones vetoriais modernos para a interface | [lucide.dev](https://lucide.dev/) |
| **Socket.io Client** | `^4.8.3` | Cliente WebSocket para o chat privado em tempo real (US14) | [socket.io/docs/v4/client-api](https://socket.io/docs/v4/client-api/) |
| **Google Fonts (Inter e Sora)** | CSS API v2 | Fontes carregadas em `globals.css`: Inter na interface e Sora na palavra "eloserv" do logo (US37) | [developers.google.com/fonts/docs/css2](https://developers.google.com/fonts/docs/css2) |
| **Mermaid** | `11.17.2` (exata) | Desenha em SVG os diagramas de `docs/diagramas` na página `/arquitetura`, com zoom e download (US41). Carregada sob demanda no navegador, com `securityLevel: strict`. A 11.17.2 corrige alertas de segurança das versões anteriores | [mermaid.js.org](https://mermaid.js.org/) |
| **react-markdown** | `9.0.1` (exata) | Converte os arquivos Markdown dos diagramas em elementos React no servidor, sem interpretar HTML embutido (US41) | [github.com/remarkjs/react-markdown](https://github.com/remarkjs/react-markdown) |
| **remark-gfm** | `4.0.0` (exata) | Extensão GitHub Flavored Markdown do react-markdown, para as tabelas de rastreabilidade, chaves e estados (US41) | [github.com/remarkjs/remark-gfm](https://github.com/remarkjs/remark-gfm) |

### 🐳 DevOps & Infraestrutura

| Ferramenta | Propósito / Finalidade no Projeto | Referência Oficial / Link |
|---|---|---|
| **Docker** | Plataforma de conteinerização de software | [docker.com](https://www.docker.com/) |
| **Docker Compose** | Ferramenta de orquestração de multi-containers (MySQL 8.0, Backend, Frontend) | [docs.docker.com/compose](https://docs.docker.com/compose/) |

---

### 🟢 Sprint 1 - Responsividade mobile em todas as telas
- **Data**: 13/09/2026
- **Resumo**: pedido explícito do usuário ("faça responsivo para o celular todas as páginas"). O app usa estilos inline por componente (não há CSS Modules/design system central), então a correção foi feita em duas frentes: (1) uma base global em `globals.css` reutilizada por todas as telas, e (2) uma varredura tela por tela nos pontos que realmente quebrariam em ~320-375px de largura — grids de colunas fixas e barras de navegação sem quebra de linha.
- **`globals.css`**: `html, body { overflow-x: hidden }` como rede de segurança; `input/select/textarea { font-size: 16px }` abaixo de 640px (evita o zoom automático do Safari/iOS ao focar um campo); classes utilitárias `.grid-2-cols`/`.grid-3-cols`/`.grid-main-aside` que colapsam pra 1 coluna abaixo de 640px (usadas nos grids de proporção fixa tipo `1fr 1fr`/`1.4fr 1fr`/`repeat(3, 1fr)` — os que já usavam `repeat(auto-fit, minmax(...))` não precisaram de nada, já são responsivos sozinhos); `.notif-dropdown` com `position: fixed` abaixo de 480px (o dropdown do sino de notificações usava `right: 0` relativo ao próprio botão, o que podia estourar pra fora da tela pela esquerda dependendo de onde o sino cai no header).
- **Home (`page.tsx`)**: a navbar (logo + busca + links + sino + CTA, tudo numa linha só) ganhou `flexWrap` e a busca ganhou `flex: 1 1 200px` (encolhe/quebra linha em vez de espremer o header inteiro pra fora da tela); grid de 3 colunas dos cartões de ação (logado-fora) virou `.grid-3-cols`.
- **Telas de formulário** (`nova-solicitacao`, `login`, `register-solicitante`, `register-prestador`): grids `1fr 1fr` de pares de campo (categoria/prazo, cidade/bairro, contas de login rápido) viraram `.grid-2-cols`; o card de autenticação (`login`/`register-*`) tinha `padding: 2.5rem 2rem` fixo — trocado por `clamp()` pra não sobrar tão pouco espaço útil de conteúdo em telas de 320px.
- **`minhas-solicitacoes/[id]`**: grid `1fr 2fr` do formulário de renegociação (valor/mensagem) virou `.grid-2-cols` (empilha em 1 coluna).
- **`oportunidades/[id]`**: grid principal `1.4fr 1fr` (detalhes + card de proposta) virou `.grid-main-aside`, empilhando o card de proposta abaixo do conteúdo em vez de espremer as duas colunas.
- **`admin` e `perfil`**: as abas (Usuários/Solicitações/Denúncias; Dados/Senha/Privacidade) ganharam `overflowX: auto` + `whiteSpace: nowrap` nos botões — em vez de quebrar linha de um jeito estranho, a barra de abas rola horizontalmente como um carrossel, padrão comum em app mobile. A tabela de usuários do admin já tinha `overflowX: auto` (não precisou de nada).
- **Testado**: `tsc --noEmit` limpo; todas as 12 rotas principais renderizando 200 depois das mudanças; confirmado que o Next.js já injeta a meta tag `viewport` padrão (`width=device-width, initial-scale=1`) mesmo sem export explícito no `layout.tsx`.
- **Não é história nova**: é polimento de UX/CSS transversal a todas as telas já existentes, não uma funcionalidade nova — não precisou de entrada no `historia.md`/Jira (Regra 6 cobre mudança de *escopo*, não ajuste de layout).

### 🟢 Sprint 1 - Feedback de teste real (Notas.md): US33, US34, US17/US18 e polimentos de UX
- **Data**: 13/09/2026
- **Resumo**: usuário reuniu 8 notas de uma sessão de teste real (`Notas.md`) apontando problemas de experiência e lacunas reais de funcionalidade. Triado em polimentos rápidos (sem história nova) vs. mudanças de escopo (novas histórias, seguindo a Regra 6):
  1. *"usuário fica confuso pra onde ir"* → banner de call-to-action "Precisa de um serviço?" na home para qualquer usuário logado, além do botão já existente no header (polimento, sem história nova).
  2. *"solicitante deveria poder postar de forma mais clara"* → caixa de dicas + placeholder mais concreto acima da descrição em `nova-solicitacao` (nota dentro da US05, sem história nova).
  3. e 7. *"confuso ter que aceitar antes de poder conversar"* / *"aceitei sem querer e não dava pra cancelar"* → **US34** (nova): chat liberado desde o envio da proposta (não mais só após aceite), aceitar/recusar direto pelo chat, e o solicitante pode cancelar uma contratação já aceita.
  4. *"faltam informações do prestador"* → AC extra na US11: comparação de propostas agora mostra `descricao_bio` e `categorias` do prestador, não só nota e preço.
  5. *"avaliação deveria ser mais bem feita"* → investigado e confirmado que **não existia avaliação real** (só números fictícios de seed) — US17 e US18, já previstas no backlog mas nunca implementadas, foram construídas nesta sessão.
  6. *"prestador também deveria poder solicitar serviços"* → **US33** (nova): guarda de papel relaxada, qualquer perfil autenticado pode publicar solicitação.
  8. *"chat sempre devia aparecer de lado"* → já era o comportamento desde a conversão para `ChatDrawer` numa sessão anterior; confirmado, sem mudança necessária.
- **US33 — Prestador Também Pode Solicitar Serviços**: `exigirSolicitante` em `solicitacaoController.ts` passou a aceitar `PRESTADOR` além de `SOLICITANTE`/`ADMIN` (o campo `solicitante_id` da tabela `solicitacoes` sempre foi uma FK genérica pra `usuarios`, sem restrição de papel no banco — a restrição era só na camada de controller). Navbar da home (`page.tsx`) passou a mostrar "Nova Solicitação"/"Minhas Solicitações" pra qualquer perfil logado.
- **US34 — Negociação por Chat Antes da Contratação e Cancelamento pelo Solicitante**: reformulação do chat (US14) de "uma conversa por solicitação" pra "uma conversa por proposta" — necessário porque, com múltiplos prestadores concorrentes podendo conversar antes do aceite, uma sala por solicitação vazaria a conversa de um prestador pros outros. Migration `20260913000009` adiciona `proposta_id` (nullable, com backfill a partir da proposta `ACEITA` de cada solicitação existente) em `mensagens_chat`. `chatService.verificarParticipante` passou a checar por `proposta_id` (dono da solicitação ou dono da proposta, sem exigir status `ACEITA`); toda mensagem além de `RECUSADA` fica bloqueada (409), mas o histórico continua legível pra ambos. Rotas remontadas de `/api/v1/solicitacoes/:id/mensagens` pra `/api/v1/propostas/:propostaId/mensagens`; salas do Socket.io renomeadas de `solicitacao:<id>` pra `proposta:<id>`. Novo endpoint `PATCH /api/v1/solicitacoes/:id/cancelar-contratacao` (`solicitacaoService.cancelarContratacao`) — simétrico à desistência do prestador (US31), mas do lado do solicitante: proposta `ACEITA` volta pra `RECUSADA`, solicitação volta pra `EM_NEGOCIACAO`, prestador notificado. Frontend: `ChatPanel`/`ChatDrawer` passaram a abrir por `propostaId`; `minhas-solicitacoes/[id]` ganhou um botão de chat por proposta na lista (não mais um botão único global) e um botão "Cancelar contratação"; `oportunidades/[id]` libera o botão de chat assim que a proposta é enviada (não espera mais o aceite); `ChatDrawer` ganhou botões "Aceitar"/"Recusar" inline quando quem abriu é o solicitante decidindo uma proposta ainda pendente.
- **US17 — Confirmação de Conclusão do Serviço**: `solicitacaoService.concluir` — Solicitante ou Prestador contratado confirmam a conclusão de uma solicitação `CONTRATADA`; libera a `TransacaoCustodia` (US13) pra `LIBERADO` quando existir, e notifica o outro lado. Endpoint `PATCH /api/v1/solicitacoes/:id/concluir`. Frontend: botão "Marcar como concluído" nas telas de detalhe do solicitante e do prestador.
- **US18 — Avaliação de Satisfação e Reputação do Prestador**: nova tabela `avaliacoes` (migration `20260913000010`, `solicitacao_id` único — uma avaliação por serviço) e model `Avaliacao.ts`. `avaliacaoService.avaliar` exige a solicitação `CONCLUIDA` e ainda não avaliada, identifica o prestador contratado pela proposta `ACEITA`, e recalcula `nota_media_reputacao`/`total_avaliacoes` em `prestadores_perfil` a partir da média/contagem de **todas** as avaliações do prestador (agregação via `AVG`/`COUNT`, não incremento) — evita drift de arredondamento acumulado. Endpoints `POST /api/v1/solicitacoes/:id/avaliar` e `GET /api/v1/solicitacoes/:id/avaliacao`. Frontend: formulário de 5 estrelas + comentário na tela do solicitante (liberado só quando `CONCLUIDA` e ainda sem avaliação); exibição somente leitura na tela do prestador.
- **Testes realizados**: `tsc --noEmit` limpo nos dois lados. Fluxo via `curl` com contas demo: prestador publica sua própria solicitação (US33, 201); solicitante e um prestador com proposta `ENVIADA` (ainda não aceita) trocam mensagem no chat da proposta antes de qualquer aceite; o outro prestador concorrente (proposta `RECUSADA`) recebe 409 ao tentar mandar mensagem e 403 ao tentar ler a conversa do concorrente (isolamento confirmado); solicitante aceita a proposta e em seguida cancela a contratação (`cancelar-contratacao`) — proposta volta `RECUSADA`, solicitação volta `EM_NEGOCIACAO`; solicitante conclui uma solicitação `CONTRATADA` (US17) e avalia com nota 5 (US18) — segunda tentativa de avaliar bloqueada (409, já avaliada), nota inválida (0) bloqueada (400), e a reputação do prestador (`nota_media_reputacao`/`total_avaliacoes`) recalculada corretamente no login seguinte. Páginas `/`, `/oportunidades/:id` e `/minhas-solicitacoes/:id` renderizando 200 após as mudanças.
- **Backlog/Jira**: `historia.md` com US33/US34 novas (Épico 2 e Épico 5) e US17/US18 marcadas `[x]`; AC extra adicionado à US11 (info do prestador) e à US12 (cancelamento pelo solicitante, remetendo à US34). Jira sincronizado: `TCC-45` (US33) e `TCC-46` (US34) criados; `TCC-17`/`TCC-18`/`TCC-25`/`TCC-26` (US11/US12/US17/US18) atualizados via `--atualizar`.

### 🟢 Sprint 1 - US31 (Desistência do Prestador) e US32 (Denúncia de Solicitação) implementadas
- **Data**: 13/09/2026
- **Resumo**: Discussão sobre segurança do chat (qualquer imagem é aceita, sem moderação) levou a duas necessidades reais: (1) o prestador não tinha como recuar de uma contratação já feita, mesmo descobrindo um problema durante a conversa; (2) não existia nenhum canal de denúncia. Criadas as histórias **US31** e **US32** e implementadas na mesma sessão.
- **US31 — Desistência do Prestador Após Contratação**: `oportunidadeService.desistirContratacao` — só o prestador dono da proposta `ACEITA` numa solicitação `CONTRATADA` pode desistir; a proposta dele vira `RECUSADA` (a regra de "1 proposta ativa por prestador" da US10 já impede reenviar), a solicitação volta pra `EM_NEGOCIACAO` (reabrindo pra novas propostas de outros prestadores, aproveitando a correção de múltiplas propostas de antes), e o solicitante é notificado (reaproveita o tipo `PROPOSTA_ACEITA_RECUSADA` da US30, sem criar um 5º tipo de evento). Endpoint `PATCH /api/v1/prestador/oportunidades/:id/desistir`. Frontend: botão "Desistir da contratação" em `oportunidades/[id]`, ao lado do botão de chat, com formulário de motivo.
- **US32 — Denúncia de Solicitação para Moderação**: nova tabela `denuncias` (migration `20260913000008`) e model `Denuncia.ts`. `denunciaService.ts`: só quem participa da solicitação (o solicitante dono ou um prestador que já enviou proposta nela) pode denunciar; `POST /api/v1/solicitacoes/:id/denunciar`. Lado do Admin: `GET/PATCH /api/v1/admin/denuncias(/:id/resolver)`, adicionados ao `adminController.ts`/`adminRoutes.ts` já existentes (não precisou de um controller próprio pro lado admin). Frontend: botão "Denunciar" em `oportunidades/[id]`, em `minhas-solicitacoes/[id]` e dentro do próprio `ChatDrawer` (ícone de bandeira no cabeçalho do painel); nova aba "Denúncias" no painel `/admin`, com contador de pendentes na própria aba e ação "Marcar como resolvida".
- **Testes realizados**: `tsc --noEmit` limpo nos dois lados. Fluxo completo via `curl`: prestador não-contratado bloqueado de desistir (403); prestador contratado desiste com sucesso, solicitação volta a `EM_NEGOCIACAO`, proposta dele vira `RECUSADA`, solicitante notificado, ele mesmo não consegue re-propor (409) mas outro prestador consegue propor na solicitação reaberta (201); usuário sem relação com a solicitação bloqueado de denunciar (403); solicitante dono e prestador com proposta conseguem denunciar (201); admin vê as denúncias (pendentes primeiro) e não-admin é bloqueado (403); admin resolve uma denúncia e o status persiste como `RESOLVIDA`.
- **Backlog/Jira**: `historia.md` das duas marcado `[x]`; Jira `TCC-43`/`TCC-44` sincronizados via `--atualizar US31 US32`.

---

### 🟢 Sprint 1 - Chat abre num painel lateral (drawer), em vez de página separada
- **Data**: 13/09/2026
- **Resumo**: A pedido do usuário, o chat (US14/US15) passou a abrir como um painel deslizante por cima da tela de detalhe (`minhas-solicitacoes/[id]` e `oportunidades/[id]`), mantendo o contexto da solicitação/proposta visível — em vez de navegar pra `/chat/[id]`. A página dedicada continua existindo, porque é o destino do `link_redirecionamento` da notificação de nova mensagem (US16).
- **Frontend**: lógica do chat extraída de `chat/[id]/page.tsx` pro novo componente [`ChatPanel.tsx`](file:///wsl.localhost/Ubuntu/home/rod/projetos/TCC-SistemaRequisicaoDeServico/frontend/src/components/ChatPanel.tsx) (histórico, WebSocket, anexo, modal de ampliação — tudo igual, só sem o "chrome" da página, preenchendo 100% da altura do contêiner). Novo [`ChatDrawer.tsx`](file:///wsl.localhost/Ubuntu/home/rod/projetos/TCC-SistemaRequisicaoDeServico/frontend/src/components/ChatDrawer.tsx) — painel de 420px deslizando da direita, fundo escurecido, fecha com Esc/clique fora/X, trava o scroll da página por trás. `chat/[id]/page.tsx` virou um wrapper fino em volta do `ChatPanel`. Os botões "Conversar com o cliente" (`oportunidades/[id]`) e "Chat com o prestador contratado" (`minhas-solicitacoes/[id]`) trocaram de `Link` pra `button` que abre o drawer.
- **Testes realizados**: `tsc --noEmit` limpo. As três telas (`/chat/:id`, `/minhas-solicitacoes/:id`, `/oportunidades/:id`) carregam normalmente; confirmado via `curl` que enviar mensagem continua funcionando depois da refatoração (nenhuma mudança de backend nessa entrada).

---

### 🐛 Sprint 1 - Correção: link "Minhas Solicitações" sumido da navbar pro Solicitante
- **Data**: 13/09/2026
- **Resumo**: Usuário reportou que o Solicitante não tinha nenhum botão de "Minhas Solicitações" na home. Em [`page.tsx`](file:///wsl.localhost/Ubuntu/home/rod/projetos/TCC-SistemaRequisicaoDeServico/frontend/src/app/page.tsx), a navbar só mostrava esse link quando `isAdmin` — a variável `isSolicitante` já existia na mesma página (usada no destino da busca e no botão "Nova Solicitação"), mas foi esquecida nessa condição específica. Ou seja, um Solicitante de verdade só conseguia chegar em `/minhas-solicitacoes` digitando a URL na mão.
- **Correção**: condição trocada pra `(isSolicitante || isAdmin)`; rótulo do link também ajustado de "Solicitações" pra "Minhas Solicitações", batendo com o título real da página.
- **Testes realizados**: `tsc --noEmit` limpo; home carrega normalmente.

---

### 🐛 Sprint 1 - Correção: cadastro (US01/US02) não redirecionava pra lugar nenhum após sucesso
- **Data**: 13/09/2026
- **Resumo**: Usuário reportou que, ao se cadastrar, não era redirecionado corretamente (e a sensação de "o botão de voltar não volta direito" provavelmente vinha do mesmo problema: sem redirecionamento automático, a única saída da tela era o link estático "Voltar para a página inicial"). Investigando [`register-solicitante/page.tsx`](file:///wsl.localhost/Ubuntu/home/rod/projetos/TCC-SistemaRequisicaoDeServico/frontend/src/app/register-solicitante/page.tsx) e [`register-prestador/page.tsx`](file:///wsl.localhost/Ubuntu/home/rod/projetos/TCC-SistemaRequisicaoDeServico/frontend/src/app/register-prestador/page.tsx): depois de um cadastro bem-sucedido, o código só mostrava a mensagem de sucesso e limpava o formulário — **nunca havia nenhum `router.push`**, então o usuário ficava preso na própria tela de cadastro.
- **Correção**: as duas telas agora chamam `router.push('/login')` ~1,8s depois do sucesso (mesmo padrão de delay já usado na tela de login antes de ir pra home), com a mensagem de sucesso avisando "Redirecionando para o login...". Removida a lógica de limpar o formulário manualmente (sem sentido, já que a página é trocada).
- **Testes realizados**: `tsc --noEmit` limpo. Confirmado via `curl` que o endpoint de cadastro continua funcionando e retornando a mensagem de sucesso esperada; as duas páginas carregam normalmente.

---

### 🐛 Sprint 1 - Correção: Solicitante via o formulário de proposta + `pode_enviar_proposta` desalinhado com a regra de múltiplas propostas
- **Data**: 13/09/2026
- **Resumo**: Usuário (testando ao vivo com uma conta de Solicitante real, via o túnel do Cloudflare) reportou que o Solicitante conseguia "fazer proposta". Investigando: `oportunidadeService.buscarOportunidade` calculava `pode_enviar_proposta` só olhando se havia um `prestadorId` (isto é, qualquer usuário autenticado, **sem checar o perfil**) — então um Solicitante logado via o formulário de "Enviar proposta" numa oportunidade normalmente. O backend (`enviarProposta` → `exigirPrestador`) sempre bloqueava o envio de verdade com 403, mas a tela mostrava uma ação que nunca funcionaria.
- **Segundo bug relacionado, achado na mesma investigação**: ao corrigir o bloqueio de múltiplas propostas (entrada anterior do log, "US10 bloqueava US11"), o filtro do `enviarProposta` passou a aceitar `ABERTA` e `EM_NEGOCIACAO`, mas o cálculo de `pode_enviar_proposta` continuou checando só `status === 'ABERTA'` — um prestador de verdade, numa solicitação já `EM_NEGOCIACAO` mas ainda aceitando concorrência, via "Oportunidade indisponível" mesmo podendo propor de fato. As duas flags precisam sempre bater.
- **Correção**: [`oportunidadeController.buscarOportunidade`](file:///wsl.localhost/Ubuntu/home/rod/projetos/TCC-SistemaRequisicaoDeServico/backend/src/controllers/oportunidadeController.ts) só passa o `prestadorId` real pro service quando `tipo_perfil` é `PRESTADOR`/`ADMIN` — um Solicitante logado é tratado como visitante pra esse efeito (igual não-autenticado). [`oportunidadeService.buscarOportunidade`](file:///wsl.localhost/Ubuntu/home/rod/projetos/TCC-SistemaRequisicaoDeServico/backend/src/services/oportunidadeService.ts) — `pode_enviar_proposta` agora usa `['ABERTA', 'EM_NEGOCIACAO'].includes(status)`, igual o filtro do `enviarProposta`. Frontend [`oportunidades/[id]/page.tsx`](file:///wsl.localhost/Ubuntu/home/rod/projetos/TCC-SistemaRequisicaoDeServico/frontend/src/app/oportunidades/%5Bid%5D/page.tsx): nova mensagem "Área do prestador" quando quem está logado não é Prestador/Admin, distinta da mensagem de "oportunidade indisponível" (status).
- **Sobre "não achei como responder a pergunta"**: nos dados reais já existe uma pergunta respondida com sucesso numa das solicitações do usuário — a correção anterior (`created_at`/`createdAt`) parece ter resolvido; não foi encontrado nenhum bug novo nesse fluxo nesta investigação.
- **Testes realizados**: `tsc --noEmit` limpo nos dois lados. Via `curl`: Solicitante numa oportunidade `ABERTA` → `pode_enviar_proposta: false` (antes era `true`); Prestador sem proposta ainda, numa solicitação `EM_NEGOCIACAO` recém-criada → `pode_enviar_proposta: true` (antes era `false`).

---

### 🟢 Sprint 1 - Configuração `allowedDevOrigins` pra liberar acesso via túnel do Cloudflare
- **Data**: 13/09/2026
- **Resumo**: Ao expor o frontend publicamente via `cloudflared tunnel` (pra um colega testar), o Next.js 14.2.35 emite um aviso "Cross origin request detected... você vai precisar configurar `allowedDevOrigins`" pra qualquer pedido de asset (`/_next/*`) vindo de um domínio diferente de `localhost` — proteção contra DNS rebinding. Hoje é só aviso (não bloqueia), mas o próprio Next.js avisa que vai virar bloqueio numa versão futura. Confirmado na prática com `curl` simulando um pedido de asset com `Origin`/`Referer` do domínio do túnel.
- **Correção**: criado [`frontend/next.config.js`](file:///wsl.localhost/Ubuntu/home/rod/projetos/TCC-SistemaRequisicaoDeServico/frontend/next.config.js) (não existia nenhum antes) com `allowedDevOrigins: ['*.trycloudflare.com']` — nessa versão do Next.js (14.2.35) essa opção fica na raiz do config, não dentro de `experimental` (tentei lá primeiro e o próprio Next.js rejeitou como chave não reconhecida). O wildcard cobre qualquer túnel novo do `cloudflared` sem precisar editar o arquivo a cada vez que a URL mudar.
- **Testes realizados**: reiniciado o frontend após a mudança; confirmado via `curl` (com `Origin`/`Referer` do domínio do túnel) que o aviso de cross-origin sumiu e o asset responde 200 normalmente.

---

### 🟢 Sprint 1 - Painel "Login rápido" com as contas de demonstração (melhoria da US25)
- **Data**: 13/09/2026
- **Resumo**: Usuário relatou dificuldade pra testar como Prestador/Solicitante estando logado como Admin (esperado — o painel admin é somente-leitura de propósito) e sugeriu algo pra trocar de conta mais rápido nos testes. Em vez de deixar o Admin "agir disfarçado" de outro perfil (o que reabriria o problema de segurança que o modo somente-leitura da US27 foi feito pra evitar), a solução foi um atalho de login: um painel na tela `/login` com um botão por conta de demonstração do seeder (Solicitante, Prestador Elétrica, Prestador Encanamento, Admin) — um clique já usa a senha padrão `Demo@123` e loga. Enquadrado como extensão da **US25** (que já previa dados fictícios "para testes de bancada"), não como história nova.
- **Frontend**: [`login/page.tsx`](file:///wsl.localhost/Ubuntu/home/rod/projetos/TCC-SistemaRequisicaoDeServico/frontend/src/app/login/page.tsx) — lógica de login extraída pra uma função `efetuarLogin(email, senha)` reaproveitada tanto pelo formulário normal quanto pelo painel de atalho; painel com 4 botões, estado de carregamento individual por botão.
- **Testes realizados**: `tsc --noEmit` limpo. Confirmado via `curl` que a tela carrega e que o login das contas demo continua funcionando.
- **historia.md**: nota adicionada nas Tarefas Técnicas da US25; Jira `TCC-36` sincronizado via `--atualizar US25`.

---

### 🐛 Sprint 1 - Correção: `created_at` vs `createdAt` quebrava o Q&A, o chat e o sino de notificações
- **Data**: 13/09/2026
- **Resumo**: Usuário reportou não conseguir responder uma pergunta (US29). Causa raiz: nas telas de Perguntas e Respostas, chat (US14) e sino de notificações (US16), o frontend lia `p.created_at`/`m.created_at`/`n.created_at`, mas a API retorna `createdAt` (camelCase) pra esses três recursos. A diferença: quando um service restringe `attributes` explicitamente incluindo a string `'created_at'` (como em `Solicitacao`, `Usuario` e `Proposta` em `minhas-propostas`), o Sequelize devolve a chave exatamente como pedida (`created_at`); quando a query não restringe `attributes` (como em `PerguntaSolicitacao`, `MensagemChat` e `Notificacao`, todas criadas nesta sessão), o Sequelize usa o nome interno padrão do timestamp automático, que continua `createdAt` mesmo com `underscored: true` no model. `new Date(undefined).toLocaleDateString(...)` lança `RangeError: Invalid time value` — isso quebrava a renderização de qualquer bolha de chat, notificação ou pergunta, silenciosamente do ponto de vista do usuário (a seção simplesmente não funcionava/não aparecia direito).
- **Correção**: trocado `created_at` → `createdAt` nas interfaces e no JSX de [`oportunidades/[id]/page.tsx`](file:///wsl.localhost/Ubuntu/home/rod/projetos/TCC-SistemaRequisicaoDeServico/frontend/src/app/oportunidades/%5Bid%5D/page.tsx), [`minhas-solicitacoes/[id]/page.tsx`](file:///wsl.localhost/Ubuntu/home/rod/projetos/TCC-SistemaRequisicaoDeServico/frontend/src/app/minhas-solicitacoes/%5Bid%5D/page.tsx) (perguntas), [`chat/[id]/page.tsx`](file:///wsl.localhost/Ubuntu/home/rod/projetos/TCC-SistemaRequisicaoDeServico/frontend/src/app/chat/%5Bid%5D/page.tsx) (mensagens) e [`NotificationBell.tsx`](file:///wsl.localhost/Ubuntu/home/rod/projetos/TCC-SistemaRequisicaoDeServico/frontend/src/components/NotificationBell.tsx) (notificações). Nenhuma mudança no backend — o formato já estava correto, só o nome do campo lido no frontend estava errado.
- **Testes realizados**: `tsc --noEmit` limpo. Confirmado via `curl` o formato real de `/notificacoes` (`['id', 'usuario_id', 'titulo', 'mensagem', 'link_redirecionamento', 'lida', 'createdAt', 'updatedAt']`) batendo com a correção. Páginas confirmadas servindo (200) depois da mudança.
- **Lição pro resto do projeto**: ao adicionar um novo model/tela que exibe timestamps, checar se o service usa `attributes` restrito (aí é `created_at`) ou busca o registro completo sem restringir atributos (aí é `createdAt`) — não presumir por analogia com outra tela.

---

### 🟢 Sprint 1 - US28, US29 e US30 implementadas
- **Data**: 13/09/2026
- **Resumo**: As três histórias criadas na conversa anterior (US28 sem implementação, US29/US30 idem) foram implementadas nesta sessão, a pedido do usuário.
- **US28 — Minhas Propostas Enviadas (Prestador)**: `GET /api/v1/prestador/propostas` (`oportunidadeService.listarMinhasPropostas`, filtro opcional por status) e tela `/minhas-propostas` — lista com filtro, cada card leva pro detalhe (`/oportunidades/:id`), destaque visual (borda/fundo verde + ícone de troféu) pras propostas `ACEITA`. Link adicionado na navbar da home, ao lado de "Oportunidades".
- **US29 — Perguntas e Respostas Públicas na Oportunidade**: nova tabela `perguntas_solicitacao` (migration `20260913000006`) e model `PerguntaSolicitacao.ts`. `perguntaService.ts` com `perguntar` (qualquer prestador, mesmo sem proposta) e `responder` (só o solicitante dono, verificado por `solicitante_id`). As perguntas vêm embutidas no detalhe já existente da oportunidade (`oportunidadeService.buscarOportunidade`) e da solicitação (`solicitacaoService.buscarComPropostas`) — sem endpoint `GET` dedicado, reaproveitando o padrão já usado por anexos/propostas/custódia. Endpoints de mutação: `POST /solicitacoes/:id/perguntas`, `PATCH /solicitacoes/:id/perguntas/:perguntaId/responder`. Frontend: seção "Perguntas e Respostas" em `oportunidades/[id]/page.tsx` (prestador pergunta) e em `minhas-solicitacoes/[id]/page.tsx` (solicitante responde inline; oculto no modo admin somente-leitura).
- **US30 — Configurações de Notificação**: nova tabela `preferencias_notificacao` (migration `20260913000007`, índice único `usuario_id`+`tipo_evento`) e model `PreferenciaNotificacao.ts`, com 4 tipos de evento fixos (`NOVA_PROPOSTA`, `PROPOSTA_ACEITA_RECUSADA`, `NOVA_MENSAGEM_CHAT`, `SOLICITACAO_CANCELADA`). `preferenciaNotificacaoService.ts`: ausência de linha = ativado (padrão da US16 preservado sem precisar de backfill pra usuários existentes); `filtrarAtivos(usuarioIds, tipo)` — usado nos 4 pontos que criam `Notificacao` (`oportunidadeService.enviarProposta`, `solicitacaoService.atualizarStatusProposta` nos dois ramos e no `cancelarSolicitacao`, `chatService.enviarMensagem`) pra não criar/emitir notificação pra quem desativou aquele tipo. Endpoints `GET/PUT /api/v1/perfil/preferencias-notificacao` (adicionados ao `perfilController.ts`/`perfilRoutes.ts` já existentes). Frontend: tela `/configuracoes` com 4 interruptores (salvamento imediato por toggle, com reversão visual se a requisição falhar), link no menu do usuário na home (ícone de engrenagem) e dentro do `/perfil`.
- **Testes realizados**: `tsc --noEmit` limpo nos dois lados. Fluxo completo via `curl`: prestador pergunta antes de propor → pergunta aparece publicamente sem resposta (até pra visitante sem token) → solicitante responde → um segundo usuário (não dono) toma 404 tentando responder → resposta aparece no detalhe do solicitante → prestador envia a proposta e ela aparece em "Minhas Propostas Enviadas" → filtro por status funciona → preferências de notificação começam todas ativadas por padrão → desativar `NOVA_PROPOSTA` realmente impede a notificação (contador de não lidas não muda numa nova proposta) → reativar volta a notificar normalmente.
- **Backlog/Jira**: `historia.md` das três marcado `[x]`; Jira `TCC-40`/`TCC-41`/`TCC-42` sincronizados via `--atualizar US28 US29 US30`.

---

### 🟢 Sprint 1 - Novas Histórias: US29 (Perguntas e Respostas) e US30 (Configurações de Notificação) — cadastradas, NÃO implementadas
- **Data**: 13/09/2026
- **Resumo**: Discussão com o usuário sobre a decisão de deixar o chat (US14) liberado só após a contratação levantou uma lacuna real: um prestador não tem como perguntar algo que o solicitante esqueceu de descrever na solicitação, antes de decidir se envia proposta. Em vez de abrir o chat privado cedo demais (reintroduziria o problema de spam/exposição prematura que a US14 evita de propósito), a solução recomendada e aceita foi um **Q&A público** na própria página da oportunidade — mais parecido com "Perguntas e Respostas" de sites de classificados, benefícia todos os prestadores comparando a mesma solicitação, não só quem perguntou.
- **US29 — Perguntas e Respostas Públicas na Oportunidade** (Épico 3, `historia.md`): qualquer prestador pergunta na tela de detalhe da oportunidade (mesmo sem ter proposto ainda); só o solicitante dono responde; resposta fica pública. Jira: `TCC-41`, vinculada ao Épico 3 (`TCC-12`).
- **US30 — Configurações de Notificação** (Épico 5, `historia.md`): ao perguntar o que caberia numa tela de Configurações (visto que dados pessoais/senha/LGPD já ficam no `/perfil`), o usuário escolheu **preferências de notificação** — interruptor por tipo de evento (nova proposta, aceite/recusa, mensagem no chat, cancelamento), persistido por usuário, tudo ativado por padrão. Jira: `TCC-42`, vinculada ao Épico 5 (`TCC-20`).
- **Nenhum código foi escrito** — só backlog e Jira, seguindo a Regra 6. Ambas ficam como próximos candidatos de implementação.

---

### 🟢 Sprint 1 - Correção: solicitação nunca recebia mais de uma proposta (US10 bloqueava US11)
- **Data**: 13/09/2026
- **Resumo**: Correção do achado sinalizado na entrada anterior — a pedido explícito do usuário. `oportunidadeService.enviarProposta` só aceitava propostas com a solicitação em status `ABERTA`, mas o envio da PRIMEIRA proposta já move esse status para `EM_NEGOCIACAO` (regra da própria US10), então qualquer prestador seguinte tomava 409, mesmo tendo visto a solicitação como aberta segundos antes. Corrigido pra aceitar `ABERTA` **e** `EM_NEGOCIACAO`, bloqueando só quando a solicitação já está `CONTRATADA`/`CONCLUIDA`/`CANCELADA`.
- **Arquivo alterado**: [`oportunidadeService.ts`](file:///wsl.localhost/Ubuntu/home/rod/projetos/TCC-SistemaRequisicaoDeServico/backend/src/services/oportunidadeService.ts) — filtro do `where` na busca com lock trocado de `status: 'ABERTA'` para `status: { [Op.in]: ['ABERTA', 'EM_NEGOCIACAO'] }`; mensagem de erro do 409 ajustada pra refletir a causa real do bloqueio.
- **Testes realizados**: `tsc --noEmit` limpo. Via `curl`, fluxo completo: Prestador 1 envia (solicitação vira `EM_NEGOCIACAO`) → Prestador 2 consegue enviar também (antes dava 409, agora 201) → **US11 finalmente mostra as duas propostas na comparação** → segunda tentativa do mesmo prestador ainda barrada (409, regra de "só 1 proposta ativa por prestador" preservada) → aceite da proposta do Prestador 2 → Prestador 1 (perdedor) tem a proposta automaticamente `RECUSADA` **e recebe a notificação correspondente da US16** (esse trecho de código já existia mas nunca tinha sido exercitado de verdade, por causa deste bug) → tentativa de nova proposta após `CONTRATADA` continua corretamente barrada (409).
- **Backlog/Jira**: nota adicionada nas Tarefas Técnicas da US10 no `historia.md`; Jira `TCC-16` sincronizado via `--atualizar US10`.

---

### 🟢 Sprint 1 - US16: Notificações no Sistema (fecha o Épico 5) + achado importante sobre US11
- **Data**: 13/09/2026
- **Resumo**: Última história do Épico 5. A tabela `notificacoes` já existia desde a US07 (criada prevendo esse reaproveitamento); faltava o CRUD de leitura e, principalmente, os **gatilhos** nos pontos certos do sistema, mais o sino no header. Reaproveitada a infraestrutura de Socket.io da US14: cada usuário entra automaticamente numa sala pessoal (`usuario:<id>`) ao conectar, e os services que criam uma notificação emitem `nova-notificacao` nessa sala — o sino atualiza em tempo real, sem precisar dar refresh.
- **Backend**:
  - Novos [`notificacaoService.ts`](file:///wsl.localhost/Ubuntu/home/rod/projetos/TCC-SistemaRequisicaoDeServico/backend/src/services/notificacaoService.ts), [`notificacaoController.ts`](file:///wsl.localhost/Ubuntu/home/rod/projetos/TCC-SistemaRequisicaoDeServico/backend/src/controllers/notificacaoController.ts), [`notificacaoRoutes.ts`](file:///wsl.localhost/Ubuntu/home/rod/projetos/TCC-SistemaRequisicaoDeServico/backend/src/routes/notificacaoRoutes.ts): `GET /api/v1/notificacoes` (lista + contador de não lidas), `PATCH /api/v1/notificacoes/:id/lida`, `PATCH /api/v1/notificacoes/lidas` (todas de uma vez).
  - Gatilhos adicionados: `oportunidadeService.enviarProposta` (US10) notifica o solicitante dono; `solicitacaoService.atualizarStatusProposta` (US12) notifica o prestador aceito **e** cada concorrente automaticamente recusado; `chatService.enviarMensagem` (US14) notifica o outro participante da conversa. O gatilho de cancelamento da US07 também passou a emitir em tempo real (`emitirParaUsuario`), por consistência.
  - [`sockets/chatSocket.ts`](file:///wsl.localhost/Ubuntu/home/rod/projetos/TCC-SistemaRequisicaoDeServico/backend/src/sockets/chatSocket.ts) ganhou a sala pessoal por usuário e a função `emitirParaUsuario`.
- **Frontend**: novo componente [`NotificationBell.tsx`](file:///wsl.localhost/Ubuntu/home/rod/projetos/TCC-SistemaRequisicaoDeServico/frontend/src/components/NotificationBell.tsx) (primeiro arquivo em `frontend/src/components/` — até agora cada tela duplicava seu próprio header) — sino com contador de não lidas, dropdown com as últimas 30 notificações, marcar uma ou todas como lidas, navega pro `link_redirecionamento` ao clicar. Incluído no header de [`page.tsx`](file:///wsl.localhost/Ubuntu/home/rod/projetos/TCC-SistemaRequisicaoDeServico/frontend/src/app/page.tsx) (home), [`oportunidades/page.tsx`](file:///wsl.localhost/Ubuntu/home/rod/projetos/TCC-SistemaRequisicaoDeServico/frontend/src/app/oportunidades/page.tsx) (só quando logado, já que o feed é público), [`minhas-solicitacoes/page.tsx`](file:///wsl.localhost/Ubuntu/home/rod/projetos/TCC-SistemaRequisicaoDeServico/frontend/src/app/minhas-solicitacoes/page.tsx) e [`admin/page.tsx`](file:///wsl.localhost/Ubuntu/home/rod/projetos/TCC-SistemaRequisicaoDeServico/frontend/src/app/admin/page.tsx).
- **⚠️ Achado durante o teste (fora do escopo desta história, não corrigido)**: ao tentar testar a notificação de "proposta recusada automaticamente" (quando duas propostas concorrem pela mesma solicitação), descobri que **isso nunca acontece na prática hoje** — `oportunidadeService.enviarProposta` só aceita propostas com a solicitação ainda em status `ABERTA`, mas o próprio envio da primeira proposta já muda o status para `EM_NEGOCIACAO` (regra da US10), bloqueando qualquer prestador seguinte com 409. Ou seja, **uma solicitação nunca recebe mais de uma proposta pelo fluxo normal**, o que esvazia o propósito da **US11 (Comparação de Propostas)** — não há o que comparar. Isso é um comportamento pré-existente (de antes desta sessão), não algo introduzido agora. Não foi alterado, por ser uma mudança de regra de negócio significativa fora do escopo do Épico 5 — **fica sinalizado para o usuário decidir** se a US10 deveria permitir múltiplas propostas enquanto `EM_NEGOCIACAO` (só bloqueando em `CONTRATADA` em diante).
- **Testes realizados**: `tsc --noEmit` limpo nos dois lados. Via `curl`: nova proposta gera notificação certa pro solicitante (conteúdo conferido); aceite de proposta notifica o prestador contratado; mensagem no chat notifica o outro participante; marcar uma notificação como lida e marcar todas como lidas funcionam, contador zera depois. Via script Node com `socket.io-client`: confirmado que a notificação chega em tempo real (evento `nova-notificacao`) no socket do usuário certo, sem precisar de refresh.
- **Backlog/Jira**: `historia.md` da US16 marcada `[x]`; Jira `TCC-23` sincronizado via `--atualizar US16`. **Épico 5 (US14, US15, US16) concluído.**

---

### 🟢 Sprint 1 - US15: Troca de Anexos e Imagens no Chat
- **Data**: 13/09/2026
- **Resumo**: Continuação do Épico 5. Cada mensagem do chat (US14) agora pode carregar um anexo opcional (imagem JPEG/PNG/WEBP ou PDF), além do texto — uma mensagem pode ser só texto, só anexo, ou os dois juntos (mas não pode ser totalmente vazia). O anexo foi incorporado ao mesmo endpoint de envio de mensagem da US14 (`POST /solicitacoes/:id/mensagens`, agora multipart) em vez do endpoint separado `/api/v1/chat/anexos` sugerido nas Tarefas Técnicas originais — mantém a criação atômica (uma requisição, uma mensagem), no mesmo padrão já usado pela US05.
- **Banco de Dados**: Migration [`20260913000005-add-anexo-mensagens-chat.js`](file:///wsl.localhost/Ubuntu/home/rod/projetos/TCC-SistemaRequisicaoDeServico/backend/src/migrations/20260913000005-add-anexo-mensagens-chat.js) — `conteudo` de `mensagens_chat` virou opcional, colunas novas `anexo_url` e `anexo_nome_original`.
- **Backend**: novo [`uploadAnexoChatMiddleware.ts`](file:///wsl.localhost/Ubuntu/home/rod/projetos/TCC-SistemaRequisicaoDeServico/backend/src/middlewares/uploadAnexoChatMiddleware.ts) (Multer, 1 arquivo, até 10MB, mesmos tipos aceitos da US05). `chatService.enviarMensagem` e `chatController.enviarMensagem` atualizados para aceitar o campo `anexo` opcional.
- **Frontend**: [`chat/[id]/page.tsx`](file:///wsl.localhost/Ubuntu/home/rod/projetos/TCC-SistemaRequisicaoDeServico/frontend/src/app/chat/%5Bid%5D/page.tsx) ganhou botão de anexo (abre seletor de arquivo), chip de pré-visualização do arquivo escolhido antes de enviar, renderização de imagem em miniatura direto na bolha (clicável, abre modal de ampliação em tela cheia) e, pra PDF, um chip com ícone + nome linkando pro download.
- **Testes realizados**: `tsc --noEmit` limpo nos dois lados. Via `curl` (multipart): mensagem só com imagem (sem texto) — ok; mensagem com texto + PDF — ok; mensagem totalmente vazia (sem texto nem anexo) — rejeitada (400); anexo de tipo inválido (`.txt`) — rejeitado pelo filtro do Multer; confirmado que o arquivo salvo é baixável de verdade (`GET /uploads/chat/<arquivo>.png` → 200, `Content-Type: image/png`).
- **Backlog/Jira**: `historia.md` da US15 marcada `[x]` (com nota sobre a mudança de endpoint); Jira `TCC-22` sincronizado via `--atualizar US15`.

---

### 🟢 Sprint 1 - US14: Chat Privado em Tempo Real entre Solicitante e Prestador (início do Épico 5)
- **Data**: 13/09/2026
- **Resumo**: Início da implementação do Épico 5 (Comunicação e Interação), a pedido do usuário. Chat privado por solicitação, liberado só depois da contratação (proposta `ACEITA`), com histórico via REST e mensagens/status de leitura em tempo real via WebSocket (Socket.io — biblioteca explicitamente pedida nas Tarefas Técnicas da própria US14).
- **Arquitetura**: as mutações (enviar mensagem, marcar como lida) continuam passando pela API REST normal — o WebSocket é usado **só** pra notificar em tempo real quem está conectado na sala (`io.to('solicitacao:<id>').emit(...)`, chamado pelo controller depois de persistir). O socket em si só cuida de autenticação (mesmo JWT do login) e de entrar/sair da sala, sem duplicar regra de negócio. Isso mantém a API 100% testável via `curl`/Swagger mesmo sem um cliente WebSocket.
- **Banco de Dados**: Migration [`20260913000004-create-mensagens-chat.js`](file:///wsl.localhost/Ubuntu/home/rod/projetos/TCC-SistemaRequisicaoDeServico/backend/src/migrations/20260913000004-create-mensagens-chat.js) — tabela `mensagens_chat` (`id`, `solicitacao_id`, `emissor_id`, `conteudo`, `lida`, timestamps).
- **Backend**:
  - [`MensagemChat.ts`](file:///wsl.localhost/Ubuntu/home/rod/projetos/TCC-SistemaRequisicaoDeServico/backend/src/models/MensagemChat.ts) + associações em `models/index.ts`.
  - [`chatService.ts`](file:///wsl.localhost/Ubuntu/home/rod/projetos/TCC-SistemaRequisicaoDeServico/backend/src/services/chatService.ts): `verificarParticipante` (o chat só libera se existir uma `Proposta` `ACEITA` na solicitação e o usuário for o solicitante dono OU o prestador dela — não depende do status da solicitação em si, então continua acessível em `CONCLUIDA` pra ver o histórico), `listarMensagens`, `enviarMensagem` (1-2000 caracteres), `marcarComoLidas` (só marca as mensagens que o usuário RECEBEU, nunca as próprias).
  - [`chatController.ts`](file:///wsl.localhost/Ubuntu/home/rod/projetos/TCC-SistemaRequisicaoDeServico/backend/src/controllers/chatController.ts) + [`chatRoutes.ts`](file:///wsl.localhost/Ubuntu/home/rod/projetos/TCC-SistemaRequisicaoDeServico/backend/src/routes/chatRoutes.ts): `GET/POST /api/v1/solicitacoes/:id/mensagens`, `PATCH /api/v1/solicitacoes/:id/mensagens/lidas`.
  - [`sockets/chatSocket.ts`](file:///wsl.localhost/Ubuntu/home/rod/projetos/TCC-SistemaRequisicaoDeServico/backend/src/sockets/chatSocket.ts): `initChatSocket` (autenticação JWT no handshake, eventos `entrar-sala`/`sair-sala`) e `emitirParaSala` (usado pelo controller). [`server.ts`](file:///wsl.localhost/Ubuntu/home/rod/projetos/TCC-SistemaRequisicaoDeServico/backend/src/server.ts) trocou `app.listen` por `http.createServer(app)` + `initChatSocket`, pra rodar o Socket.io na mesma porta 3001.
- **Frontend**: nova tela [`chat/[id]/page.tsx`](file:///wsl.localhost/Ubuntu/home/rod/projetos/TCC-SistemaRequisicaoDeServico/frontend/src/app/chat/%5Bid%5D/page.tsx) — histórico via REST no carregamento, conexão Socket.io com o token JWT, bolhas de mensagem alinhadas por emissor, hora de envio e ✓/✓✓ de leitura, indicador de conectado/conectando. Link "Chat com o prestador" adicionado em [`minhas-solicitacoes/[id]/page.tsx`](file:///wsl.localhost/Ubuntu/home/rod/projetos/TCC-SistemaRequisicaoDeServico/frontend/src/app/minhas-solicitacoes/%5Bid%5D/page.tsx) (quando `CONTRATADA`/`CONCLUIDA`, oculto no modo admin) e "Conversar com o cliente" em [`oportunidades/[id]/page.tsx`](file:///wsl.localhost/Ubuntu/home/rod/projetos/TCC-SistemaRequisicaoDeServico/frontend/src/app/oportunidades/%5Bid%5D/page.tsx) (quando a proposta do prestador está `ACEITA`).
- **Testes realizados**: `tsc --noEmit` limpo nos dois lados. Via `curl`: chat bloqueado antes da contratação (403); depois de aceitar a proposta, os dois participantes trocam mensagens normalmente; marcação de lida funciona só na direção certa (não marca a própria mensagem); um terceiro usuário sem relação com a solicitação toma 403. Via um script Node.js usando `socket.io-client`: confirmado que uma mensagem enviada via REST por um participante chega em tempo real (evento `nova-mensagem`) no socket do outro participante que estava na sala; confirmado que uma conexão com token inválido é rejeitada no handshake (`connect_error`).
- **Backlog/Jira**: `historia.md` da US14 marcada `[x]`; Jira `TCC-21` sincronizado via `python3 scripts/jira/importar_historia.py --atualizar US14`.

---

### 🟢 Sprint 1 - Nova História: US28 (Minhas Propostas Enviadas, Prestador) — cadastrada, NÃO implementada
- **Data**: 13/09/2026
- **Resumo**: Usuário perguntou se o prestador tem como ver as propostas que enviou e quais foram aceitas. Não existe: hoje só dá pra ver o status de uma proposta entrando na solicitação específica (`/oportunidades/:id`), uma de cada vez — não tem uma lista agregada. A US21 (Dashboard do Prestador) é próxima mas é só cards numéricos, não uma lista navegável. Seguindo a Regra 6, criada a **US28 - Painel "Minhas Propostas Enviadas" (Prestador)** no `historia.md` (Épico 4, ao lado de US10-13, já que é o par natural do lado do prestador) e importada pro Jira como `TCC-40`, vinculada ao Épico 4 (`TCC-15`). **Usuário pediu explicitamente para não implementar agora** e para não mexer em nenhuma história existente sem autorização — só a história/Jira foram criados, nada de código ainda.
- **historia.md**: nova seção US28 inserida no fim do Épico 4 (depois da US13, antes do Épico 5) + linha na Matriz de Priorização (MoSCoW). Nenhuma história existente foi alterada.
- **Jira**: `TCC-40` criado com o script `scripts/jira/importar_historia.py` (modo padrão de criação), vinculado ao Épico 4 já existente (`TCC-15`).

---

### 🟢 Sprint 1 - Correção do script de importação Jira (Regra 6) e sincronização de US07/US13/US27
- **Data**: 13/09/2026
- **Resumo**: Usuário perguntou se as mudanças de escopo estavam mesmo virando história/Jira, conforme a Regra 6. Ao auditar, a melhoria "admin ver detalhe de solicitação" (ver entrada abaixo) precisava ser refletida no Jira, mas ao tentar sincronizar, dois bugs foram encontrados no [`scripts/jira/importar_historia.py`](file:///wsl.localhost/Ubuntu/home/rod/projetos/TCC-SistemaRequisicaoDeServico/scripts/jira/importar_historia.py): (1) a extração de critérios de aceite só capturava `- [ ]` (não marcados) — itens já concluídos (`- [x]`, como os de US07/US13 desta sessão) sumiam da descrição enviada ao Jira; (2) o script só sabia **criar** histórias, nunca **atualizar** uma já existente. Ao implementar a busca pra atualização, mais dois problemas de API foram descobertos: o endpoint `POST /rest/api/3/search/jql` só devolve o campo `key` de cada issue se `fields` for pedido explicitamente no corpo (senão vem só `{"id":...}`); e este Jira tem **dois tipos de issue chamados "História"** com IDs diferentes, então filtrar por nome (`issuetype = "História"`) numa JQL retorna vazio silenciosamente — a busca precisa usar o ID numérico (`10004`).
- **Correções no script**: regex de critérios captura `[ ]`/`[x]` (marca os concluídos com `(Concluído)` no texto); novo modo `python3 importar_historia.py --atualizar US27 [US07 ...]` que localiza a História existente pelo código no summary e sobrescreve só a `description`, sem duplicar ticket; buscas por issue agora sempre passam `fields` e usam o ID numérico do tipo "História" (`10004`).
- **Descoberta importante**: o backlog inteiro (não só a US27) já estava importado no Jira de uma sessão anterior — `TCC-11` = US07, `TCC-19` = US13, `TCC-37` = US26, etc. Rodado `--atualizar US27 US07 US13`, confirmando via `GET /issue/TCC-39` que a descrição bateu com o `historia.md` atual, incluindo o novo critério de aceite marcado como `(Concluído)`.
- **historia.md**: acrescentado um critério de aceite e uma tarefa técnica em US27 documentando explicitamente a capacidade do admin de ver o detalhe de uma solicitação (ver entrada logo abaixo) — sem virar história nova, por ser extensão do AC de listagem já existente.

---

### 🟢 Sprint 1 - Admin consegue ver o detalhe de qualquer solicitação (melhoria da US27)
- **Data**: 13/09/2026
- **Resumo**: Usuário notou que os cards de solicitação na aba "Solicitações" do painel admin não eram clicáveis — mesmo que fossem, o backend bloquearia o acesso, já que `buscarComPropostas` filtrava sempre por `solicitante_id` do usuário logado (só o dono via). Como o próprio AC da US27 já previa "listagem de todas as solicitações... para fins de suporte e moderação", ver o detalhe é uma extensão natural disso — sem virar história nova. A tela de detalhe reaproveitada (`/minhas-solicitacoes/[id]`) permanece **somente leitura** para o admin: os botões de ação (cancelar, aceitar/recusar/renegociar proposta, simular pagamento) ficam ocultos quando `tipo_perfil === 'ADMIN'`, evitando que o admin aja em nome de outro usuário sem esse pedido explícito ter sido feito.
- **Backend**: `solicitacaoService.buscarComPropostas` em [`solicitacaoService.ts`](file:///wsl.localhost/Ubuntu/home/rod/projetos/TCC-SistemaRequisicaoDeServico/backend/src/services/solicitacaoService.ts) ganhou o parâmetro `comoAdmin` — quando `true`, a busca ignora o filtro de dono (`where: { id }` em vez de `{ id, solicitante_id }`). `solicitacaoController.buscarComPropostas` passa `req.user!.tipo_perfil === 'ADMIN'`. As rotas de ação (cancelar, aceitar/recusar, renegociar, custódia) **não** foram alteradas — continuam exigindo o dono real, então mesmo que o admin tentasse chamar essas rotas diretamente (bypassando a UI), levaria 404/409 igual antes.
- **Frontend**: cards da aba "Solicitações" em [`admin/page.tsx`](file:///wsl.localhost/Ubuntu/home/rod/projetos/TCC-SistemaRequisicaoDeServico/frontend/src/app/admin/page.tsx) viraram `Link` pra `/minhas-solicitacoes/:id`. Em [`minhas-solicitacoes/[id]/page.tsx`](file:///wsl.localhost/Ubuntu/home/rod/projetos/TCC-SistemaRequisicaoDeServico/frontend/src/app/minhas-solicitacoes/%5Bid%5D/page.tsx): lê o `tipo_perfil` do `localStorage`, mostra um selo "Modo administrativo — visualização somente leitura", troca o link de "Voltar" pra `/admin`, e oculta os formulários/botões de ação quando `isAdmin`.
- **Testes realizados**: `tsc --noEmit` limpo nos dois lados. Via `curl`: admin acessando `GET /solicitacoes/minhas/:id/propostas` de uma solicitação de outro usuário → 200 com dados completos; o mesmo endpoint chamado por um prestador (não dono, não admin) → continua 404, confirmando que a proteção original não foi enfraquecida.

---

### 🟢 Sprint 1 - Home mais compacta com prévia pública de solicitações
- **Data**: 13/09/2026
- **Resumo**: Usuário achou os 3 cards de ação (Cliente/Profissional/Já tenho conta) grandes demais e pediu pra home mostrar algumas solicitações reais. Reduzido o tamanho dos `ActionCard` (ícone, padding, fontes) e adicionada uma seção "Solicitações recentes" na home, puxando as últimas 6 do feed público (`GET /prestador/oportunidades`, já sem exigir login desde a mudança anterior) — cada card vai direto pro detalhe da oportunidade, com link "Ver todas" pro feed completo. Não precisou de história nova nem mudança de backend: é só uma reorganização visual da home usando um endpoint que já existe e já é público.
- **Frontend**: [`frontend/src/app/page.tsx`](file:///wsl.localhost/Ubuntu/home/rod/projetos/TCC-SistemaRequisicaoDeServico/frontend/src/app/page.tsx).
- **Testes realizados**: `tsc --noEmit` limpo. Confirmado via `curl` que o endpoint retorna as 4 solicitações de demonstração existentes no banco (dentro do limite de 6 que a home busca) e que a página carrega (HTTP 200).

---

### 🟢 Sprint 1 - Galeria de imagens na tela de oportunidade (melhoria da US09) e limpeza final dos protótipos
- **Data**: 13/09/2026
- **Resumo**: A pasta `detalhes-solicitacao-prestador/` (protótipo JS puro/Vite de um colega, mapeada pra US09, já implementada) tinha ficado pendente de uma decisão desde uma sessão anterior. Ela trazia uma melhoria de UI genuína — galeria com imagem principal + miniaturas clicáveis, em vez de só uma lista de links de anexo — que foi portada para a tela oficial (não é escopo novo, só uma forma melhor de cumprir o critério de aceite já existente "exibir fotos/anexos" da própria US09).
- **Frontend**: [`oportunidades/[id]/page.tsx`](file:///wsl.localhost/Ubuntu/home/rod/projetos/TCC-SistemaRequisicaoDeServico/frontend/src/app/oportunidades/%5Bid%5D/page.tsx) — anexos agora são separados em `imagens` (`.jpg`/`.jpeg`/`.png`/`.webp`) e `documentos` (demais extensões, ex. PDF) via `useMemo` a partir da extensão do `url_arquivo` (sem precisar de coluna nova no banco, já que o upload já restringe os tipos aceitos). Imagens ganham uma galeria (imagem principal em destaque + miniaturas clicáveis abaixo); documentos continuam como chips de download.
- **Testes realizados**: `tsc --noEmit` limpo. Criada uma solicitação de teste via `curl` com 2 anexos de imagem PNG reais — confirmado que a API retorna os dois em `anexos` e que a tela carrega sem erro (verificado o estado de carregamento inicial da página, já que é um componente client-side — sem uma ferramenta de browser neste ambiente não foi possível confirmar visualmente o resultado renderizado, só a ausência de erros de tipo/runtime).
- Com isso, todas as pastas de protótipo pendentes desta rodada (`aceite-contratacao-proposta`, `comparacao-propostas-solicitante`, `envio-proposta-prestador`, `minhas-solicitacoes`, `minhas-solicitacoes-cancelamento`, `simulacao-pagamento`, `detalhes-solicitacao-prestador`, e o zip `feed-oportunidades-orcamento-cliente-new`) foram resolvidas — portadas (US07/US13, e agora a galeria da US09) ou descartadas por redundância — e removidas do repositório.

---

### 🟢 Sprint 1 - US07 (Cancelamento de Solicitação) e US13 (Simulação de Pagamento/Custódia)
- **Data**: 13/09/2026
- **Resumo**: Portadas mais duas pastas de protótipo de colegas do grupo (`minhas-solicitacoes-cancelamento/` e `simulacao-pagamento/`, JS puro + Vite, tabelas próprias com IDs incrementais) para a stack oficial em TypeScript, mapeadas contra o backlog e removidas do repositório após o port. Junto vieram mais 4 pastas/zip redundantes (`aceite-contratacao-proposta`, `comparacao-propostas-solicitante`, `envio-proposta-prestador`, `minhas-solicitacoes`, `feed-oportunidades-orcamento-cliente-new.zip`) que reimplementavam US já concluídas (US06/US10/US11/US12) sem nenhuma funcionalidade nova relevante — descartadas sem port. Exceção: `aceite-contratacao-proposta/` também incluía criação de um chat liberado após a contratação, que corresponde à **US14** (Chat Privado, Épico 5, ainda não implementada e fora do escopo desta tarefa) — **sinalizado ao usuário, não implementado**, já que exigiria Socket.io e uma tabela de mensagens dedicada.
- **Banco de Dados**: Migrations [`20260913000001-add-cancelamento-solicitacoes.js`](file:///wsl.localhost/Ubuntu/home/rod/projetos/TCC-SistemaRequisicaoDeServico/backend/src/migrations/20260913000001-add-cancelamento-solicitacoes.js) (colunas `motivo_cancelamento`/`cancelada_em` em `solicitacoes`), [`20260913000002-create-notificacoes.js`](file:///wsl.localhost/Ubuntu/home/rod/projetos/TCC-SistemaRequisicaoDeServico/backend/src/migrations/20260913000002-create-notificacoes.js) (tabela `notificacoes`, no formato já previsto pela US16 — criada agora só para o gatilho de cancelamento) e [`20260913000003-create-transacoes-custodia.js`](file:///wsl.localhost/Ubuntu/home/rod/projetos/TCC-SistemaRequisicaoDeServico/backend/src/migrations/20260913000003-create-transacoes-custodia.js) (tabela `transacoes_custodia`, com `referencia_simulada VARCHAR(120)` — teve que ser corrigida em uma segunda rodada, o valor gerado com dois UUIDs embutidos estourava um `VARCHAR(80)` inicial).
- **Backend**:
  - Novos modelos [`Notificacao.ts`](file:///wsl.localhost/Ubuntu/home/rod/projetos/TCC-SistemaRequisicaoDeServico/backend/src/models/Notificacao.ts) e [`TransacaoCustodia.ts`](file:///wsl.localhost/Ubuntu/home/rod/projetos/TCC-SistemaRequisicaoDeServico/backend/src/models/TransacaoCustodia.ts), associações em [`models/index.ts`](file:///wsl.localhost/Ubuntu/home/rod/projetos/TCC-SistemaRequisicaoDeServico/backend/src/models/index.ts).
  - `solicitacaoService.cancelarSolicitacao` (US07) em [`solicitacaoService.ts`](file:///wsl.localhost/Ubuntu/home/rod/projetos/TCC-SistemaRequisicaoDeServico/backend/src/services/solicitacaoService.ts): permitido só em `ABERTA`/`EM_NEGOCIACAO`, exige motivo (mín. 5 caracteres), tudo em uma transação — atualiza a solicitação para `CANCELADA` e cria uma `Notificacao` para cada prestador (distintos) que já tinha enviado proposta. Endpoint `PATCH /api/v1/solicitacoes/:id/cancelar`.
  - `solicitacaoService.simularPagamentoCustodia` (US13): só permite reter o pagamento se a solicitação estiver `CONTRATADA` e existir uma proposta `ACEITA`; idempotente (chamada repetida devolve a transação já existente em vez de duplicar); a liberação (`LIBERADO`, dependente da US17) não foi implementada — está fora do escopo da US13 isoladamente. Endpoint `POST /api/v1/solicitacoes/:id/custodia/simular`.
  - `solicitacaoService.buscarComPropostas` passou a incluir `motivo_cancelamento`, `cancelada_em` e `transacao_custodia`; `oportunidadeService.buscarOportunidade` passou a incluir `motivo_cancelamento` (para o prestador ver o motivo do cancelamento na própria tela da oportunidade).
- **Frontend**: em [`minhas-solicitacoes/[id]/page.tsx`](file:///wsl.localhost/Ubuntu/home/rod/projetos/TCC-SistemaRequisicaoDeServico/frontend/src/app/minhas-solicitacoes/%5Bid%5D/page.tsx) — botão/formulário "Cancelar solicitação" (visível em `ABERTA`/`EM_NEGOCIACAO`), banner do motivo quando `CANCELADA`, e painel de custódia quando `CONTRATADA` (com "Simular pagamento" abrindo escolha de Cartão/PIX de teste, e um selo "Pagamento retido em custódia" com valor e referência depois de confirmado). Em [`oportunidades/[id]/page.tsx`](file:///wsl.localhost/Ubuntu/home/rod/projetos/TCC-SistemaRequisicaoDeServico/frontend/src/app/oportunidades/%5Bid%5D/page.tsx) — banner avisando o prestador do motivo quando a solicitação foi cancelada.
- **Testes realizados**: `npx tsc --noEmit` limpo nos dois lados. Fluxo ponta a ponta via `curl` contra a API real: criação de solicitação → prestador envia proposta → solicitante cancela (200, notificação criada) → prestador vê o motivo no detalhe da oportunidade → segunda tentativa de cancelamento rejeitada (409); em outra solicitação, tentativa de simular pagamento antes do aceite rejeitada (409) → aceite da proposta (`CONTRATADA`) → simulação de pagamento (201/200, `RETIDO`) → repetição idempotente (mesma transação, sem duplicar) → confirmado no detalhe da solicitação (`transacao_custodia` presente).

---

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


### US26 — Integração real da API com MySQL isolado (25/10/2026)

- Implementados 19 casos Jest/Supertest sobre o app real: registro/login, hash de senha, credenciais inválidas, papéis, criação, concorrência de propostas, proprietário, aceite único/repetição e simultâneo, chat privado, conclusão e avaliação única, privacidade do dashboard e perfil público.
- Arquivos criados nesta etapa: `backend/jest.config.cjs`, `backend/tests/fluxos.integracao.test.js`, `backend/tests/ambiente.cjs`, `backend/tests/preparar-banco.cjs`, `backend/tests/sequelize-test.cjs`, `backend/tests/perfil-publico.test.js` e `backend/tests/LEIA-ME.md`.
- Banco explicitamente configurado com `DB_NAME_TEST=tcc_servico_facil_test`. Antes dos imports, o setup força `NODE_ENV=test`, `DB_NAME=DB_NAME_TEST`, credenciais de teste e segredo JWT próprio; rejeita nomes sem sufixo `_test`. Migrations reais pelo Sequelize CLI `--env test`, sem seeds ou servidor HTTP externo. Limpeza restrita aos IDs das fixtures, sem truncar tabelas ou remover bancos.
- Jest separado em projetos `unitarios` e `integracao`; o primeiro funciona sem MySQL. A suíte de perfil público já existente, escrita em node:test, roda em subprocesso por uma ponte Jest.
- Validação: `npm run build` concluído; `DB_NAME_TEST=tcc_servico_facil_test npx jest --runInBand` no Node 22.23.2: **7 suítes, 75 testes aprovados**, incluindo 19 de integração (o teste ponte também executa os casos nativos de perfil). Migrations aplicadas somente no banco de teste.
- Identificado durante leitura risco de duas propostas aceitas e repetição do aceite. As regressões passaram após as correções paralelas da máquina de estados; esta etapa não alterou services ou package.json. Fixtures passaram a gerar CPFs válidos para acompanhar a validação de cadastro integrada em paralelo.

| Biblioteca/API | Versão instalada | Propósito nesta etapa | Documentação oficial |
| --- | --- | --- | --- |
| Jest | 30.5.2 | Executor, hooks e asserções dos testes de integração e configuração por projetos | https://jestjs.io/docs/getting-started |
| Supertest | 7.3.1 | Requisições às rotas do app Express em memória | https://github.com/forwardemail/supertest |
| mysql2 | 3.23.4 | Conexão para criação segura do banco de teste (dependência já existente; consultar lock para versão vigente) | https://sidorares.github.io/node-mysql2/docs |
| Sequelize CLI | 6.6.5 | Execução das migrations reais no ambiente test | https://sequelize.org/docs/v6/other-topics/migrations/ |


## 25/10/2026 — Conferência e implementação das histórias pendentes

### Escopo e decisões

Conferido `historia.md` contra os modelos, endpoints e telas. US19, US20 e US21 não tinham implementação; US01/US02/US05/US10/US13/US22/US24/US25/US26/US27 tinham critérios pendentes apesar de funcionalidades parcialmente existentes. Os complementos permanecem cobertos pelas histórias originais, com critérios e numeração preservados. A tabela `STATUS_HISTORIAS.md` registra a evidência por história. As 34 descrições foram sincronizadas com sucesso pelo script `importar_historia.py --atualizar`; o conector Atlassian exige reautenticação, mas o script existente funcionou. Nenhum token foi incluído nas alterações.

### Funcionalidades e arquivos

- **US19:** `prestadorPublicoService`, controller e routes; página `prestadores/[id]`; projeção pública explícita, paginação limitada e reputação a partir de avaliações reais. Link na comparação de propostas.
- **US20/US21/US13:** `dashboardService`, controller e routes; página `dashboard` e atalho na home. Indicadores isolados por usuário, mês de São Paulo, conversão calculada no mesmo conjunto e carteira simulada derivada dos estados RETIDO/LIBERADO, sem crédito duplicado. Reembolsos não compõem o saldo.
- **US01/US02:** validadores de CPF/CNPJ numéricos no backend/frontend; normalização e prevenção de duplicidade por pontuação; senha com limite compatível com bcrypt; consentimento estrito. Cadastro profissional com foto opcional multipart, mantendo JSON compatível; arquivo removido quando o cadastro falha. Migration `20261025000001` normaliza legados e aborta diante de colisões sem expor dados.
- **US05:** formulário em três etapas, dados preservados, navegação de volta, anexos e revisão antes de publicar. Rótulos associados aos campos e navegação por teclado no seletor de anexos.
- **US10:** migration `20261025000002`, modelo Proposta, services/controller e detalhes dos dois perfis incluem validade comercial distinta do prazo de execução, de 1 a 365 dias (padrão 7). Propostas expiradas não podem ser aceitas/renegociadas, mas podem ser recusadas, inclusive pelo chat.
- **US12/US13/US17/US18/US31/US34:** transições com lock na solicitação antes das dependências; impede dois aceites, aceite de recusada e ações incompatíveis após contratação. Reembolso/retenção de nova contratação coerentes; retorno da custódia recarregado do banco; avaliação e reputação atômicas, serializadas por perfil. Eventos socket emitidos após commit nas transições corrigidas. Checkout exibido após o aceite e custódia reembolsada não é apresentada como protegida.
- **US22:** `loginRateLimiter`, configuração JWT compartilhada e autenticação obrigatória/opcional/socket com conta ativa e perfil atual. Segredo público removido do fallback; inicialização valida a configuração. `.env.example` e Docker Compose corrigidos. Uploads usam extensão correspondente ao MIME permitido e erros de arquivo retornam 400. Atualizações compatíveis no lockfile reduziram o relatório de 11 avisos (incluindo um crítico) para dois moderados transitivos do Sequelize/uuid; não foi aplicado downgrade incompatível do ORM.
- **US23:** foco visível e respeito à redução de movimento; suspensão React nas páginas com `useSearchParams` para permitir build de produção. Removida promessa de anonimização automática em 30 dias, que não correspondia ao soft-delete implementado.
- **US24:** `config/openapi.ts`, `app.ts` e testes: 45 operações com contratos de entrada/saída e erros aplicáveis, autenticação Bearer e `$ref` válidos, geração em `src` e `dist`, JSON em `/api-docs.json`.
- **US25:** seed original ajustado para status coerente, documentos sem pontuação, reputação inicial real e validade. Novo seed `20261025000001-demo-fluxo-completo.js` idempotente, com serviços concluídos/avaliações/custódia/chat/perguntas/denúncia, preservando contas e preferências anteriores.
- **US26:** configuração Jest, preparação segura de MySQL `_test`, testes de integração e isolados em `backend/tests`; workflow `.github/workflows/validacao.yml` executa testes e build em PRs. README e instruções de teste atualizados.
- **US27:** migration `20261025000003`, modelo RegistroAdministrativo e exportação em `models/index.ts`; alteração de status e resolução de denúncia registram autor, alvo, data e estados na mesma transação. A repetição sem mudança não duplica o registro; falha na auditoria desfaz a ação.

### Referências da automação

| Componente | Versão | Propósito | Documentação oficial |
|---|---|---|---|
| GitHub Actions | Serviço | Executar validação em pull requests | https://docs.github.com/pt/actions |
| actions/checkout | v4 | Obter os arquivos da revisão | https://github.com/actions/checkout |
| actions/setup-node | v4 | Preparar Node.js 22 e cache npm | https://github.com/actions/setup-node |
| MySQL | 8.0 | Persistência de integração isolada no CI | https://dev.mysql.com/doc/refman/8.0/en/ |

### Validações

- Backend e frontend compilados com TypeScript; build de produção Next.js concluído após corrigir as fronteiras Suspense das listagens.
- Migrações novas aplicadas no banco de desenvolvimento e no banco de testes, sem recriação de dados do usuário.
- Integração usa as rotas reais, JWT e MySQL separado; cobre propostas simultâneas, estados inválidos, custódia/reembolso/recontratação, avaliação única/média, isolamento de conversas/indicadores, foto e consentimento, seeds reversíveis e auditoria transacional. A limpeza das fixtures administrativas exige retirar primeiro o vínculo de último administrador nas próprias contas de teste.
- Navegação manual: login de demonstração, formulário da descrição até a revisão sem publicar fixture no banco de desenvolvimento, painel e perfil público. Conferência em viewport de 390 × 844; painel e revisão adaptados ao celular. Isso não substitui avaliação com usuários nem teste em dispositivos físicos.
- Resultado final: **11 suítes e 193 testes aprovados**, incluindo integração MySQL, sem falhas. `npm run build` do frontend concluído; `git diff --check` sem erros. Migrations de 25/10/2026 aplicadas com sucesso. Trabalho preparado na branch `historias-pendentes` para integração por PR.

## 25/10/2026 — Verificação real das páginas e complementos US35/US36

### Achados e alterações

- Publicação em três etapas com PNG, pergunta/resposta, duas propostas concorrentes, chat lateral privado com mensagem e imagem, contraproposta, aceite e PIX simulado exercitados nas páginas com contas demo. Solicitação fictícia `a892e83e-0eb3-4ebe-a3d1-ec5d8ee68ed5`, mantida para revisão.
- **US35 / TCC-47:** registrada no backlog e importada antes de implementar a resposta do prestador à contraproposta. Migration `20261025000004-add-resposta-contraproposta.js`, modelo Proposta, service/controller/routes de oportunidades e bloqueio de contratação pendente em solicitacaoService. Resposta atômica com autorização, validade e notificação após commit; valor aceito efetivamente usado na contratação/custódia. Interfaces de detalhe dos dois perfis atualizadas.
- **US36 / TCC-48:** descoberta em ABERTA/EM_NEGOCIACAO alinhada ao envio de propostas, nos filtros/listagem e vitrine inicial; indicação correta nos cards. Histórias anteriores preservadas. Descrições das duas novas histórias sincronizadas novamente no Jira após a validação.
- Envio de proposta recarrega os dados de detalhe, corrigindo data inválida e status antigo logo após publicar. ChatPanel/ChatDrawer e chatController/chatService expõem somente leitura e bloqueiam envio em conversa recusada ou solicitação cancelada. Rótulos acessíveis adicionados no chat, sino, preferências e estrelas. Mensagem de contraproposta já contratada corrigida.
- OpenAPI documenta resposta da contraproposta e estado de leitura do chat; inventário atual de 46 operações. `STATUS_HISTORIAS.md` atualizado para 36 histórias. `VERIFICACAO_FLUXOS.md` registra evidências e pendências manuais, sem equiparar implementação a homologação visual completa.

### Testes e limites

- Migration aplicada no banco de desenvolvimento e no MySQL isolado de testes.
- `DB_NAME_TEST=tcc_servico_facil_test npm test`: **11 suítes, 199 testes aprovados**; novos casos de descoberta, resposta pendente/aceita/recusada/expirada, autorização, repetição, valor correto e chat recusado.
- `npm run build` do frontend: produção, TypeScript e geração de páginas concluídos. `git diff --check` aprovado.
- Confirmação nativa de conclusão travou a ferramenta de navegação. Tentativas de recuperar a aba não resolveram; conclusão conferida via API HTTP 200 e estado CONCLUIDA/formulário exibidos no detalhe. Envio da avaliação e demais fluxos listados no relatório continuam pendentes de homologação manual; não foram apresentados como aprovados na interface.
- Backend reiniciado após interrupção do watcher; frontend reiniciado depois do build para disponibilizar a aplicação local.

### Arquivos e referências

Alterados: `backend/src/config/openapi.ts`, controllers chat/oportunidade, models/Proposta, routes/oportunidade, services chat/oportunidade/solicitacao, teste `fluxos.integracao.test.js`; frontend detalhes solicitante/prestador, feed, home, configurações, ChatPanel, ChatDrawer e NotificationBell; `historia.md`, `STATUS_HISTORIAS.md`. Criados: migration da contraproposta e `VERIFICACAO_FLUXOS.md`.

Nenhuma biblioteca ou API externa nova adicionada. Reutilizadas as dependências já registradas:

| Biblioteca | Versão instalada | Uso nesta etapa | Documentação oficial |
|---|---|---|---|
| Sequelize | 6.37.8 | Transação, locks e atributos da contraproposta | https://sequelize.org/docs/v6/ |
| Express | 4.22.3 | Rota autenticada de resposta e contrato do chat | https://expressjs.com/pt-br/4x/api.html |
| React | 18.3.1 | Estado dos controles e apresentação acessível | https://react.dev/reference/react |
| Next.js | 14.2.35 | Rotas de detalhe, vitrine e build de produção | https://nextjs.org/docs/14 |
| Jest | 30.5.2 | Regressões de negociação e descoberta | https://jestjs.io/docs/getting-started |
| Supertest | 7.3.1 | Verificação integrada das rotas reais | https://github.com/forwardemail/supertest |


## 26/10/2026 — US23: confirmações da aplicação e retomada dos fluxos

- Substituídas as cinco chamadas `window.confirm` por `useConfirmacao.tsx`, hook com diálogo compartilhado em React/HTML. Confirmações de aceitar/recusar proposta, cancelar contratação, concluir pelos dois perfis e alterar conta administrativa agora permanecem no DOM, sem bloquear o JavaScript.
- Interação: texto associado ao título, fundo inativo pelo modal, foco inicial em “Voltar sem alterar”, Escape sem efeitos, retorno ao controle de origem, proteção contra pedidos simultâneos e resolução como cancelamento ao desmontar. Botões se reorganizam em telas estreitas.
- Correção coberta pela US23, sem novos endpoints ou regras de negócio e sem alteração dos critérios existentes. Não foi necessária nova história. Nenhuma dependência adicionada.
- Criado `frontend/src/components/useConfirmacao.tsx`; alterados `frontend/src/app/globals.css`, detalhes `minhas-solicitacoes/[id]` e `oportunidades/[id]`, `admin/page.tsx`, `STATUS_HISTORIAS.md` e `VERIFICACAO_FLUXOS.md`.
- Corrigido também o campo de data de cadastro na tabela administrativa: o retorno Sequelize existente é `createdAt`; a interface usava `created_at` e mostrava data inválida.
- Validação manual: Escape e volta sem alteração; conclusão efetiva de fixture pela interface; avaliação 5 enviada e visível no perfil público; cancelamento da contratação em 390 × 844; diálogo administrativo aberto e cancelado. API confirmou LIBERADO e REEMBOLSADO de R$ 120 nas respectivas fixtures. Pré-condições de contratação foram preparadas pela API, sem confundir com percurso completo pela interface.
- Dados fictícios de verificação mantidos para inspeção; nenhuma conta real desativada. A primeira preparação interrompida deixou um serviço fictício contratado sem pagamento, antes dos dois registros usados na validação.
- Checagem TypeScript aprovada. Build de produção do frontend executado nesta etapa. A suíte backend de 199 testes aprovada na etapa anterior não foi reexecutada: não houve alteração de backend nesta correção.

| Biblioteca/recurso | Versão | Propósito | Documentação oficial |
|---|---|---|---|
| React | 18.3.1 | Estado e ciclo de vida da confirmação assíncrona | https://react.dev/reference/react |
| HTML dialog | Plataforma Web | Modal no DOM, foco e fundo inativo, sem `window.confirm` | https://html.spec.whatwg.org/multipage/interactive-elements.html#the-dialog-element |


## 26/10/2026 — US13: apresentação do checkout e validação dos fluxos pendentes

- Conferência real de Cartão de teste e PIX de teste nas páginas. A área existente de pagamento não mostrava resumo suficiente antes da confirmação e sumia após conclusão/cancelamento. Complementada em `frontend/src/app/minhas-solicitacoes/[id]/page.tsx`: seção rotulada “Pagamento e garantia”, prestador/valor/situação, grupo de métodos acessível e flexível, bloqueio do botão Voltar durante processamento e comprovante persistente para retenção/liberação/reembolso. Nenhuma cobrança real ou coleta de dados financeiros.
- Backend já calcula pelo valor da proposta aceita e serializa pagamentos pela solicitação. Acrescentado teste em `backend/tests/fluxos.integracao.test.js` contra tentativa de trocar valor, prestador e proposta no corpo da requisição; valor/vínculo contratados prevalecem. Sem alteração do endpoint ou regra de negócio.
- `frontend/src/app/perfil/page.tsx`: rótulos dos campos associados aos inputs com IDs React, corrigindo controles sem nome acessível encontrados na conferência de edição.
- Validação manual: cartão R$ 120 retido, conclusão e liberação; saldo do prestador R$ 340→460 e custódia R$ 620→500. PIX R$ 120, desistência e reembolso sem crédito ao prestador. Solicitante viu comprovantes; profissional viu indicadores próprios. Notificação abriu solicitação correta. Preferência desativada persistiu após reload e foi restaurada; endereço demo editado, recarregado e restaurado.
- Denúncia explicitamente fictícia enviada e resolvida por admin (pendências 3→2). Cadastro solicitante recusou CPF/senha/consentimento inválidos; os dois cadastros fictícios válidos foram finalizados após autorização explícita do usuário aos aceites, redirecionaram e autenticaram. Cadastro profissional incluiu foto PNG e bio/categoria. Conta fictícia de solicitante suspensa: login recusado; reativada em seguida. Contas anteriores preservadas.
- Inspeção de largura em 390×844: início, painéis, perfil, configurações, solicitações/propostas, formulário novo, feed/detalhe, perfil público, status, cadastros e login; administração filtrada também conferida. Checkout/detalhe do solicitante em 320×740, sem transbordamento. Não equivale a ensaio em aparelho físico nem a todas as combinações de estado.
- Fixtures principais: `787fcd22-3b42-4573-b377-f9c3b0d66851` (concluída/cartão/liberado), `8b4051fb-6ba0-4117-a1b5-f014e36c31f4` (PIX/desistência/reembolso). Pré-condições de contratação preparadas pela API. Contas e solicitações fictícias mantidas para revisão; credenciais não incluídas nos arquivos versionados.
- `VERIFICACAO_FLUXOS.md` e `STATUS_HISTORIAS.md` atualizados com evidências e limites. Escopo coberto por US13, US04, US23 e testes US26; nenhuma história existente ou seus critérios foram alterados.
- Resultado: **11 suítes e 200 testes aprovados**, incluindo MySQL isolado; build de produção Next.js e checagem TypeScript aprovados; `git diff --check` aprovado. Nenhuma dependência ou migration nova.

| Biblioteca | Versão | Uso nesta etapa | Documentação oficial |
|---|---|---|---|
| React | 18.3.1 | Apresentação dos estados de pagamento e associação acessível dos campos via useId | https://react.dev/reference/react/useId |
| Jest | 30.5.2 | Regressão de integridade do pagamento | https://jestjs.io/docs/api |
| Supertest | 7.3.1 | Teste da rota real de custódia | https://github.com/forwardemail/supertest |


## 26/10/2026 — US40 / TCC-53: documentos legais, aceite e canal de privacidade

### Escopo e isolamento

- História criada no backlog antes da implementação e importada pelo script para TCC-53, vinculada ao épico original TCC-3. Preservados os critérios das histórias anteriores e a numeração US37–US39 presente no trabalho paralelo da pasta principal.
- Trabalho isolado no worktree `TCC-SistemaRequisicaoDeServico-privacidade`, branch `termos-privacidade-lgpd`, a partir de `415b844`. A tentativa de worktree gerenciado esbarrou na propriedade do caminho UNC; foi usado o Git nativo no WSL, sem alterar configurações globais de segurança. Alterações visuais não commitadas da pasta principal foram preservadas.
- Prévia isolada em frontend 3002/API 3003, banco de desenvolvimento existente; testes em banco separado `tcc_servico_facil_privacidade_test`. Dependências/configurações locais reutilizadas por links ignorados, sem commitar credenciais. `.gitignore` contempla links locais de node_modules e cache Python.

### Implementação

- Termos e Política públicos, com versão/data, sumário, referências oficiais e contato informado e autorizado pelo usuário: Rodrigo Fernando Melo Dias da Silva / rodrigogofernandomelo15@gmail.com. Telefone não publicado. Referência de versão inicial `2026-10-26.1`, arquivo de publicação preservado e rotas por versão; mapa de publicações e manifestos sincronizados por teste.
- Rodapé legal global e links nos cadastros abertos em nova aba, sem perder o preenchimento. Dois sinais inicialmente desmarcados: aceite dos Termos e ciência da Política. Nenhum consentimento genérico para todo tratamento. O cliente atual deixa de enviar o booleano legado; a API valida sinais estritos e versões atuais, gerando data no servidor.
- Migration aditiva de versões/data e tabela de protocolos. Campos legados preservados, sem backfill de versão ou novo aceite de conta anterior. Seed fictício idempotente e reversível para a demonstração.
- Services/controllers/routes em camadas; metadados públicos, central isolada pelo JWT, validações de descrição/tipo e até cinco pendentes, caixa administrativa paginada, resposta única com lock, autor/data do servidor e proteção por ADMIN. Nenhum envio automático de e-mail ou exclusão de dados.
- Perfil passa a dizer “Desativar minha conta”, explicando preservação de histórico e encaminhando pedidos de acesso/correção/exclusão à central. Documentos descrevem sessão local, dados necessários, perfis públicos, anexos por links diretos, contas demo compartilhadas, infraestrutura e retenção manual efetiva, sem prometer anonimização ou pagamento real.
- OpenAPI: cinco novas operações, DTOs do cadastro e registros atualizados, total de 51 operações documentadas nesta branch. `docs/PRIVACIDADE.md` registra contratos, publicação de versões, migração, operação e limitações antes de uso real.

### Arquivos

Novos: config/serviço de documentos, migration, modelo/serviço/controller/routes de privacidade, seed demonstrativo, testes documentosLegais/privacidade; componentes DocumentoLegal/RodapeLegal/AceiteDocumentos/CentralPrivacidade e CSS Module; páginas termos/política/central/administração e rotas por versão; conteúdo legal JSON versionado e guia técnico. Alterados app/modelos/auth/OpenAPI, fixtures de cadastro e inventário de rotas dos testes; layout/cadastros/perfil/admin; historia, status e este log.

### Validação

- 13 suítes e 238 testes aprovados no MySQL isolado, incluindo rejeição de versões/sinais ausentes/coagidos, cadastros sem campo genérico legado, data de servidor, isolamento de titulares, conta antiga sem versão, respostas concorrentes, paginação e limite de pendentes. Backend TypeScript compilado e build de produção Next.js aprovado.
- Migration aplicada no desenvolvimento e nos testes; seed demonstrativo aplicado sem sobrescrever dados existentes. Não houve recriação de banco do usuário.
- Interface: documentos e contato acessíveis sem login; sinais de cadastro desmarcados; central da conta demo mostrou versão desconhecida; protocolo fictício `b5e02ba2-0c8f-4156-ba3f-99a96ca2749a` registrado e respondido pelo admin, com resposta/data visíveis ao titular. Não houve exclusão de dados nem envio de mensagem ao contato externo. Novo aceite positivo validado na API, não realizado novamente pela interface.
- Conferência em 390×844 dos documentos, cadastros e central; caixa administrativa e paginação também sem transbordamento. Links com contraste ajustado localmente, sem alterar a identidade visual paralela. Diff sem erros. Fontes oficiais e limites jurídicos/operacionais discriminados no guia.

### Referências e dependências reutilizadas

Nenhuma biblioteca nova adicionada.

| Biblioteca/API | Versão | Propósito | Documentação oficial |
|---|---|---|---|
| Express | 4.22.3 | Novas rotas e contratos autenticados | https://expressjs.com/pt-br/4x/api.html |
| Sequelize | 6.37.8 | Modelo, migração, paginação e transações/locks | https://sequelize.org/docs/v6/ |
| Sequelize CLI | 6.6.5 | Migration e seed demonstrativo | https://sequelize.org/docs/v6/other-topics/migrations/ |
| React | 18.3.1 | Aceites controlados e central de atendimento | https://react.dev/reference/react |
| Next.js | 14.2.35 | Documentos públicos/versionados, CSS Modules e links | https://nextjs.org/docs/14 |
| Axios | 1.19.0 | Cliente centralizado com JWT para protocolos | https://axios-http.com/docs/intro |
| Jest | 30.5.2 | Testes de validação/contratos e integração | https://jestjs.io/docs/api |
| Supertest | 7.3.1 | Rotas reais na integração isolada | https://github.com/forwardemail/supertest |
| LGPD | Lei 13.709/2018, texto compilado consultado em 26/10/2026 | Transparência, finalidade, fundamentos e direitos | https://www.planalto.gov.br/ccivil_03/_ato2015-2018/2018/lei/l13709compilado.htm |
| ANPD | Orientação consultada em 26/10/2026 | Direitos e canais do titular | https://www.gov.br/anpd/pt-br/assuntos/titular-de-dados/direito-dos-titulares |

## 26/10/2026 — US37: identidade visual Eloserv (logo, paleta e favicon)

- **Escopo novo, registrado antes de implementar (Regra 6):** US37 criada no Épico 8 do `historia.md`, incluída na Matriz MoSCoW (Could Have, 5 pontos) e importada no Jira como **TCC-49** (filha do Épico TCC-31) com `scripts/jira/importar_historia.py`. Depois da implementação, os critérios foram marcados e a descrição do Jira sincronizada com `--atualizar US37`. Na mesma edição, a linha em branco que separava US35/US36 do restante da Matriz MoSCoW foi removida (ela quebrava a tabela em duas).
- **Decisão de design:** nome e paleta escolhidos pelo usuário num canvas de design com 6 nomes/logos (Eloserv, Nexoserv, TratoFeito, PropostaCerta e as sugestões Orçaí e Combinado) e 5 paletas, testadas em protótipos da página inicial, da página do usuário logado e de uma tela mobile. Escolhidos: **Eloserv** (dois elos encadeados = cliente e prestador) e a paleta **"Elo"**, derivada das cores do logo.
- **Decisão de arquitetura:** o logo tem cores fixas (índigo `#4F46E5`/`#818CF8` + azul-céu `#0EA5E9`/`#38BDF8`) e não acompanha a paleta. Foi isolado no componente `Logo.tsx` para ser reutilizado.
- **Paleta aplicada:** fundo `#0E1024`, superfície `#171A3A`, borda `#2C3166`, texto `#EEF2FF`, texto secundário `#A5ACD6`, texto apagado `#8088B8` e primária `#4F46E5`. Como as telas usam estilos inline sem design system central, a troca foi feita por script, com um mapa de cores slate/azul → paleta Elo nos `.tsx`/`.css` (inclusive nas variações `rgba()`).
- **Regra de contraste:** o índigo cheio `#4F46E5` só é usado como fundo de botão com texto branco (6,29:1). Em bordas, indicadores e texto sobre fundo escuro, onde ele ficaria com cerca de 2,6:1, usa-se `#818CF8` (6,3:1). Os links ganharam a variável `--link-color: #A5B4FC` (8,46:1 sobre a superfície). Pares conferidos: texto/superfície 15,08:1; texto secundário/fundo 8,47:1; texto apagado/superfície 4,92:1.
- **Cores preservadas:** as cores semânticas (verde de sucesso, vermelho de erro, âmbar de alerta, violeta de "Contratada") e as cores de destaque próprias de cada tela (rosa do login, verde do perfil profissional) ficaram como estavam.
- **Nome:** "ServiçoFácil" virou "Eloserv" no título da aba (`layout.tsx`), no cabeçalho e no rodapé da página inicial, na saudação "Bem-vindo à Eloserv" e no link de volta do perfil público. As chaves internas do `localStorage` (`@ServicoFacil:*`) e os e-mails das contas de demonstração (`@servicofacil.com`, usados pelos seeders e pelo login rápido) foram mantidos, por não serem visíveis como marca e para não deslogar sessões nem quebrar os dados de demonstração.
- **Arquivos criados:** `frontend/src/components/Logo.tsx`, `frontend/src/app/icon.svg` (favicon gerado automaticamente pelo App Router).
- **Arquivos alterados:** `frontend/src/app/globals.css`, `layout.tsx`, `page.tsx`, `admin`, `configuracoes`, `dashboard`, `login`, `minhas-propostas`, `minhas-solicitacoes` (lista e detalhe), `nova-solicitacao`, `oportunidades` (lista e detalhe), `perfil`, `prestadores/[id]`, `register-prestador`, `register-solicitante`, `status`, e os componentes `ChatDrawer.tsx`, `ChatPanel.tsx` e `NotificationBell.tsx`. Também `historia.md`, `STATUS_HISTORIAS.md` e este log.
- **Testes e validações:** checagem TypeScript (`tsc --noEmit`) aprovada e `git diff --check` aprovado. Conferência no navegador sobre o servidor de desenvolvimento já em execução: página inicial, login e feed de oportunidades com fundo `rgb(14, 16, 36)`, favicon `icon.svg` servido como `image/svg+xml`, fonte Sora carregada e nenhum erro no console. O build de produção **não** foi executado, porque sobrescreveria a pasta `.next` do servidor de desenvolvimento em uso. As telas autenticadas não foram percorridas uma a uma. Sem alteração de backend: a suíte de testes não foi reexecutada.

| Biblioteca/recurso | Versão | Uso nesta etapa | Documentação oficial |
|---|---|---|---|
| React | 18.3.1 | Componente `Logo.tsx` com SVG inline | https://react.dev/ |
| Next.js (App Router — ícones de metadados) | 14.2.35 | Favicon via `app/icon.svg` e título via `metadata` | https://nextjs.org/docs/app/api-reference/file-conventions/metadata/app-icons |
| Google Fonts (Sora) | CSS API v2 | Fonte da palavra "eloserv" | https://developers.google.com/fonts/docs/css2 |


## 26/10/2026 — US38: nova página inicial (visitante e usuário logado)

- **Escopo novo, registrado antes de implementar (Regra 6):** a US37 aplicou só a identidade visual, e o usuário pediu também o layout da página inicial prototipado no canvas de design. Criada a **US38** no Épico 8 (Should Have, 8 pontos) e importada no Jira como **TCC-50** (filha de TCC-31). Depois da implementação, os critérios foram marcados e a descrição sincronizada com `--atualizar US38`.
- **Visitante:**
  - O cabeçalho ficou sem a busca de oportunidades, que confundia com o campo de pedido, e ganhou as âncoras "Como funciona" e "Para prestadores" (escondidas abaixo de 640px).
  - O destaque tem o campo "O que você precisa?", atalhos de categoria (os mesmos do formulário de nova solicitação), o aviso de pagamento com garantia e um card de propostas fixo, identificado como "Exemplo".
  - "Como funciona" tem cinco passos.
  - O bloco "Para prestadores" mostra os pedidos reais do feed público.
- **Rascunho do pedido:** sem sessão, o texto digitado (e a categoria do atalho) fica no `sessionStorage` e o usuário vai para o login. O login já redirecionava para `/`, onde a página logada mostra o campo preenchido. A tela `nova-solicitacao` passou a aceitar `?titulo=` e `?categoria=`, e consome o rascunho ao abrir.
- **Logado:**
  - O cabeçalho tem a busca do perfil, os links do perfil, o sino e o novo **menu da conta** (`MenuConta.tsx`: Meu painel, Meu perfil, Configurações, Sair; fecha com Escape devolvendo o foco e com clique fora). "Meu painel" saiu da barra para o cabeçalho do prestador caber numa linha a 1280px. Abaixo de 640px, os links do perfil também passam para o menu (classes `so-telas-largas`/`so-telas-estreitas`).
  - **Solicitante:** saudação com propostas pendentes (`/dashboards/solicitante`), campo de novo pedido, "Seus pedidos" (4 mais recentes de `/solicitacoes/minhas`) com status e próxima ação, mensagens recentes e card de garantia.
  - **Prestador:** indicadores calculados de `/prestador/propostas` (aguardando = ENVIADA/EM_ANALISE; em andamento = ACEITA com solicitação CONTRATADA) e de `/dashboards/prestador` (valor em custódia, nota e total de avaliações), "Oportunidades para você", últimas propostas, mensagens e o atalho da US33.
  - **Admin:** atalhos para o painel administrativo e para o feed.
- **Decisão — mensagens sem endpoint novo:** a API não tem rota de conversas recentes, e as notificações não guardam o tipo do evento. O card "Mensagens recentes" filtra as notificações cujo título começa com "Nova mensagem de " (o padrão usado pelo `chatService`). Se esse título mudar no backend, o card precisa acompanhar.
- **Arquivos criados:** `frontend/src/components/MenuConta.tsx`, `frontend/src/components/home/HomeVisitante.tsx`, `frontend/src/components/home/HomeLogado.tsx` e `frontend/src/components/home/comum.ts` (tipos, cores de status, formatadores, rascunho e estilos compartilhados).
- **Arquivos alterados:** `frontend/src/app/page.tsx` (reescrita: o `ActionCard` antigo saiu), `frontend/src/app/nova-solicitacao/page.tsx` (pré-preenchimento), `frontend/src/app/globals.css` (classes `.sr-only`, `.so-telas-largas` e `.so-telas-estreitas`), `historia.md`, `STATUS_HISTORIAS.md` e este log.
- **Testes e validações:** checagem TypeScript (`tsc --noEmit`) aprovada. Validação manual no navegador, sobre o servidor de desenvolvimento em execução:
  - visitante a 1280px e 375px, sem rolagem horizontal (`scrollWidth` = `innerWidth`);
  - pedido digitado sem login → `/login` com o rascunho guardado → login rápido da conta demo de solicitante → página logada com o campo preenchido → `nova-solicitacao?titulo=…` com o título no formulário e o rascunho consumido;
  - página da solicitante com dados reais (11 propostas pendentes, pedidos com "Continuar negociação"/"Ver detalhes", 3 mensagens, 7 serviços em andamento);
  - menu da conta (abrir, Escape com retorno do foco, Sair);
  - página do prestador demo a 1280px (cabeçalho numa linha) e a 375px (indicadores em 2 colunas, links do perfil dentro do menu).
  - Nenhuma solicitação foi publicada nos testes. As duas contas demo terminaram deslogadas. O build de produção não foi executado, porque o servidor de desenvolvimento estava em uso. As mensagens "Module not found" no console foram da recompilação intermediária durante a cópia dos arquivos; a página recarregada respondeu 200, sem erro. Sem alteração de backend.
- Nenhuma dependência nova: React, Next.js, Axios e Lucide React já estão na tabela de bibliotecas.

## 26/10/2026 — US39: redesign das telas internas com componentes compartilhados

- **Escopo novo, registrado antes de implementar (Regra 6):** depois da página inicial (US38), o usuário pediu o design de todas as telas. As 16 telas e uma prancha de componentes foram prototipadas no canvas de design e aprovadas pelo usuário. Criada a **US39** no Épico 8 (Should Have, 13 pontos) e importada no Jira como **TCC-51** (filha de TCC-31). Depois da implementação, os critérios foram marcados e a descrição sincronizada com `--atualizar US39`.
- **Resumo:** todas as telas internas passaram a usar o mesmo cabeçalho, o mesmo rodapé e o mesmo conjunto de botões, campos, etiquetas de status, avisos e estados de lista (carregando, vazia e erro). Cada tela destaca o próximo passo do usuário. Nenhuma regra de negócio, endpoint ou chamada à API foi alterada: a lógica (estados, requisições e validações) de cada página foi mantida e só a apresentação foi reescrita.
  - **Entrada:**
    - login em duas colunas, com botão para mostrar a senha e as contas de demonstração recolhidas num bloco secundário;
    - cadastros de cliente e de prestador em seções numeradas, com o erro de CPF exibido ao sair do campo;
    - no cadastro de prestador, categorias como chips de seleção e prévia ao vivo do perfil público.
  - **Cliente:**
    - nova solicitação com etapas, prévia do pedido e dicas;
    - "Minhas solicitações" com abas por status com contagem, aviso dos pedidos em andamento e a próxima ação de cada card;
    - detalhe do pedido com a linha do andamento, propostas ordenáveis (preço, nota, prazo e recentes), pagamento com garantia, conclusão, avaliação e denúncia em sequência, e coluna lateral com o pedido e as perguntas.
  - **Prestador:**
    - feed de oportunidades com filtros laterais e chips de filtros ativos removíveis;
    - detalhe da oportunidade com o formulário de proposta ao lado e o resumo "O cliente vai ver…";
    - "Minhas propostas" com abas (Todas, Aguardando cliente, Aceitas, Recusadas) e uma frase de situação por card;
    - perfil público com resumo de reputação e avaliações.
  - **Conta e gestão:**
    - painel com seletor Prestador/Solicitante;
    - "Minha conta" (perfil e notificações) com navegação lateral;
    - notificações com interruptores;
    - chat com cartão lateral;
    - painel administrativo com aviso de denúncias pendentes, abas e tabela com rolagem horizontal;
    - status do sistema com "Verificar de novo", hora da verificação e link para o Swagger.
- **Decisões de arquitetura:**
  - **Design system em classes CSS** no `globals.css` (`.pagina`, `.card`, `.btn-*`, `.campo`, `.chip`, `.aviso-*`, `.abas`, `.etapas`, `.tabela` etc.), e não em uma biblioteca de componentes, para manter a stack sem dependência nova. Também entrou `[hidden]{display:none!important}`, porque as classes de exibição sobrescreviam o atributo `hidden`.
  - **Cores de status num lugar só:** `STATUS_SOLICITACAO`, `STATUS_PROPOSTA` e `STATUS_PAGAMENTO` foram para `components/ui/Elementos.tsx`, e as cópias locais de cada página saíram. `components/home/comum.ts` reexporta esses mapas e passa a concentrar `proximaAcao` e `precisaDeAcao`, para a página inicial e "Minhas solicitações" mostrarem o mesmo próximo passo.
  - **Contagem das abas no navegador:** "Minhas solicitações" e "Minhas propostas" carregam a lista sem filtro de status e filtram no cliente, para as abas mostrarem a contagem de cada status sem rota nova.
  - **Texto honesto no aviso de pedidos:** `propostas_recebidas` conta todas as propostas, inclusive as recusadas. Por isso o aviso diz "pedidos em andamento" (com propostas recebidas ou serviço contratado), e não "precisam de você".
  - **Senha:** os cadastros mostram e validam no cliente o mínimo de 8 caracteres, igual ao `authService`. A troca de senha em "Minha conta" também exige 8 no cliente, mas o backend (`perfilController`, `nova_senha.length < 6`) aceita 6. A divergência foi corrigida logo depois, na entrada seguinte deste log.
  - **Limites aceitos (sem endpoint novo):**
    - o chat não mostra os dados da proposta, porque a rota recebe só o id da conversa;
    - a lista de "Minhas propostas" não tem os campos de contraproposta (o destaque fica no detalhe da oportunidade);
    - o painel administrativo ficou sem os blocos de indicadores, porque as listagens vêm filtradas e não há rota de totais.
  - Os componentes internos de `ChatPanel`, `ChatDrawer` e `NotificationBell` não foram redesenhados.
- **Arquivos criados:**
  - `frontend/src/components/ui/Cabecalho.tsx`: cabeçalho por perfil, link ativo com `aria-current`, busca, sino, menu da conta e "Nova solicitação";
  - `frontend/src/components/ui/Pagina.tsx`: `Pagina`, `Rodape` e `CabecalhoPagina`;
  - `frontend/src/components/ui/Elementos.tsx`: mapas de status, `Chip`, `Aviso`, `Etapas`, `EstadoLista` e `Avatar`;
  - `frontend/src/components/ui/LayoutConta.tsx`.
- **Arquivos alterados:**
  - `frontend/src/app/globals.css`: seção de componentes da US39;
  - `frontend/src/components/home/comum.ts` e `frontend/src/components/home/HomeLogado.tsx`;
  - `frontend/src/app/page.tsx`: passa a usar o `Cabecalho` compartilhado;
  - páginas reescritas: `login`, `register-solicitante`, `register-prestador`, `nova-solicitacao`, `minhas-solicitacoes`, `minhas-solicitacoes/[id]`, `oportunidades`, `oportunidades/[id]`, `minhas-propostas`, `prestadores/[id]`, `dashboard`, `perfil`, `configuracoes`, `chat/[id]`, `admin` e `status`;
  - `historia.md`, `STATUS_HISTORIAS.md` e este log.
- **Testes e validações:**
  - checagem TypeScript (`tsc --noEmit`) aprovada.
  - Validação manual no navegador, sobre o servidor de desenvolvimento em execução, em 1280px e 375px:
    - visitante: página inicial, login, os dois cadastros e status do sistema;
    - solicitante demo: página inicial, nova solicitação, minhas solicitações (abas, aviso e "Mostrar só esses"), detalhe do pedido, painel, minha conta, notificações e chat;
    - prestador demo (Encanamento): oportunidades, detalhe da oportunidade, minhas propostas, painel na aba Prestador e perfil público;
    - admin demo: painel administrativo (aviso de denúncias pendentes, abas e tabela com rolagem horizontal no celular).
  - Na verificação, o aviso "N pedidos precisam de você" foi trocado por "em andamento" (ver decisões).
  - Nenhum formulário foi enviado nos testes (nenhum pedido, proposta, pagamento ou ação administrativa), e as contas demo terminaram deslogadas.
  - O build de produção não foi executado, porque o servidor de desenvolvimento estava em uso. As mensagens "Module not found" no console vieram da recompilação intermediária durante a cópia dos arquivos (o arquivo citado já não tinha a linha apontada). Sem alteração de backend.
- Nenhuma dependência nova: React, Next.js, Axios e Lucide React já estão na tabela de bibliotecas.

## 26/10/2026 — Troca de senha alinhada à regra do cadastro (8 caracteres)

- **Contexto:** na US39, a tela "Minha conta" passou a exigir 8 caracteres na nova senha, igual ao cadastro (`authService`), mas a rota `PUT /perfil/senha` aceitava 6. Quem chamasse a API direto conseguia gravar uma senha mais curta que a permitida no cadastro. É uma correção da troca de senha já existente, sem escopo novo, por isso não gerou história nova (Regra 6).
- **Alteração:** `updateSenha` agora usa a mesma regra do cadastro. A nova senha precisa ser texto, ter pelo menos 8 caracteres e no máximo 72 bytes UTF-8 (limite do bcrypt). Fora disso, a rota responde 400 sem gravar nada. Os outros comportamentos não mudaram: senha atual errada continua dando 400, e a gravação é sempre do hash bcrypt.
- **Arquivos alterados:**
  - `backend/src/controllers/perfilController.ts`: validação e anotação Swagger da rota (`minLength: 8` e o 400 descrito);
  - `backend/src/config/openapi.ts`: `AlterarSenhaDTO.nova_senha` de `minLength: 6` para `8`, com a descrição do limite;
  - este log.
- **Arquivo criado:** `backend/tests/perfilSenha.test.js`, com testes unitários do controller compilado (models mockados, bcrypt real):
  - recusa 7 caracteres, mais de 72 bytes e valor que não é texto, sem chamar `update`;
  - aceita 8 caracteres e grava um hash que confere com a senha;
  - mantém a recusa quando a senha atual está errada.
- **Testes e validações:** `npm run test:unit` (build com `tsc` + Jest) aprovado, com 9 suítes e 142 testes (5 novos). Os testes de integração com MySQL não foram rodados, porque nenhum deles cobre essa rota.
- Nenhuma dependência nova: Jest e BcryptJS já estão na tabela de bibliotecas.

## 26/10/2026 — Integração da US40 (documentos legais e privacidade) ao redesign US37–US39

- **Contexto:** a US40 (TCC-53) foi feita em paralelo, num worktree separado (`TCC-SistemaRequisicaoDeServico-privacidade`, branch `termos-privacidade-lgpd`, prévia nas portas 3002/3003), e publicada em `historias-pendentes` e `main` (`ab062fd` e `76ecb9a`). A pasta principal ainda estava no commit anterior (`415b844`), com o redesign US37–US39 sem commit. O usuário pediu para trazer a US40 para o site principal. A história já existia no backlog e no Jira, então nenhuma história nova foi criada (Regra 6).
- **Como foi integrada:**
  1. Backup do trabalho local fora do repositório (`~/backup-us39/`: patch e arquivos novos).
  2. `git stash -u` do redesign, avanço da branch local por *fast-forward* até `ab062fd` (sem commit novo) e `git stash pop`.
  3. Os conflitos ficaram em `historia.md`, neste log, nos dois cadastros, no perfil e no painel administrativo:
     - nos documentos, os dois lados foram mantidos (US40 antes, US37–US39 depois);
     - nas telas, partiu-se da versão do redesign e as mudanças da US40 foram reaplicadas à mão.
  4. O índice foi limpo (`git reset`): tudo ficou como alteração local, para o usuário commitar.
- **Decisões de arquitetura:**
  - **Um rodapé só:** a US40 colocava um `RodapeLegal` global no `layout.tsx`, o que duplicaria o rodapé compartilhado da US39. Os links (Termos de Uso, Política de Privacidade, Central de Privacidade e Status do sistema) foram para `LinksRodape` em `components/ui/Pagina.tsx`, usado pelo `Rodape` e no fim da tela de login, que tem layout próprio. Saíram `RodapeLegal.tsx` e `legal.module.css`; os estilos dos documentos passaram para classes no `globals.css` (`.links-rodape`, `.texto-legal`, `.sumario-legal`).
  - **Documentos legais (`DocumentoLegal.tsx`):** página com cabeçalho e rodapé compartilhados, o texto num cartão e, ao lado, o sumário, o contato do responsável e as referências oficiais. No celular, o sumário vira um bloco recolhível acima do texto. Textos, versões e rotas por versão da US40 não mudaram.
  - **Central de Privacidade (`CentralPrivacidade.tsx`):**
    - para o titular com sessão, fica dentro de "Minha conta" (`LayoutConta` ganhou a página `privacidade` e os itens "Central de Privacidade" e "Desativar conta");
    - para o visitante, há uma tela de entrada com login e e-mail;
    - para o admin, uma caixa de protocolos com etiqueta de status, formulário de resposta por protocolo e paginação.
    A lógica (requisições, validações, mensagens e limites) é a mesma da US40.
  - **Cadastros:** `AceiteDocumentos.tsx` virou a seção "4. Termos e privacidade", com os dois sinais desmarcados nas caixas de opção da US39 e os documentos abrindo em outra aba. O campo de estado passou de `termoLgpdAceito` para `termosAceitos`, e a ciência da Política ficou num estado próprio. O payload é o mesmo da US40 (`termos_uso_aceitos`, `privacidade_ciente` e as versões).
  - **Perfil e admin:**
    - a seção de desativação usa o texto da US40 (desativar não exclui os dados) e leva à Central; a âncora mudou de `#privacidade` para `#desativar`;
    - o painel administrativo ganhou o atalho "Atendimento de privacidade" no cabeçalho.
- **Arquivos alterados nesta etapa:**
  - componentes: `frontend/src/components/AceiteDocumentos.tsx`, `DocumentoLegal.tsx`, `CentralPrivacidade.tsx`, `ui/Pagina.tsx` e `ui/LayoutConta.tsx`;
  - páginas: `frontend/src/app/layout.tsx`, `login`, `register-solicitante`, `register-prestador`, `perfil` e `admin`;
  - estilos: `frontend/src/app/globals.css`;
  - documentação: `historia.md`, `STATUS_HISTORIAS.md` e este log.
- **Arquivos removidos:** `frontend/src/components/RodapeLegal.tsx` e `frontend/src/components/legal.module.css`.
- **Testes e validações:**
  - `npm run test:unit`: 10 suítes e 160 testes aprovados;
  - integração (`DB_NAME_TEST=tcc_servico_facil_test`): 4 suítes e 83 testes aprovados, com a migration da US40 aplicada no banco de teste;
  - `tsc --noEmit` do frontend aprovado;
  - migration da US40 já aplicada no banco de desenvolvimento, e a API da porta 3001 responde `GET /legal/documentos` com 200.
  - **Navegador (1280px e 375px, sem rolagem horizontal e sem erros no console):**
    - visitante: termos, política (sumário recolhível no celular), Central de entrada, login e os dois cadastros com a seção de aceite;
    - solicitante demo: Central com o registro do cadastro (versão não registrada, conta anterior à US40), formulário e protocolos com resposta; perfil com "Desativar minha conta";
    - admin demo: atalho no painel e caixa de protocolos.
  - Nenhum pedido, resposta, cadastro ou desativação foi enviado nos testes, e as contas demo terminaram deslogadas.
  - O servidor `next dev` da porta 3000 continuou entregando a versão antiga de `Pagina.tsx` mesmo com o arquivo certo (o watcher não detectou a cópia) e precisou ser reiniciado.
- Nenhuma dependência nova: React, Next.js, Axios e Lucide React já estão na tabela de bibliotecas.

## 26/10/2026 — Correção do e-mail de contato dos documentos legais (US40)

- **Contexto:** o e-mail público do responsável pelos dados foi publicado com erro de digitação (`rodrigogofernandomelo15@gmail.com`). O usuário informou o endereço correto: `rodrigofernandomelo15@gmail.com`. A entrada anterior da US40 neste log fica como estava, por ser registro histórico.
- **Decisão:** a correção foi feita na própria versão `2026-10-26.1`, sem publicar uma versão nova. Os documentos foram publicados no mesmo dia, só contas de teste aceitaram essa versão e a mudança é só o contato, sem alterar regras, finalidades nem direitos. Uma mudança de conteúdo depois de uso real continua exigindo uma versão nova, preservando a anterior.
- **Arquivos alterados:**
  - `frontend/src/conteudo/documentos-legais.json` e `backend/src/config/documentos-legais.json` (metadados vigentes);
  - `frontend/src/conteudo/legal/2026-10-26.1.json` (metadados e as duas menções no texto);
  - `backend/tests/documentosLegais.test.js` (contato esperado);
  - `docs/PRIVACIDADE.md`;
  - este log.
- **Validações:**
  - `npm run test:unit`: 10 suítes e 160 testes aprovados, incluindo o teste que confere se os metadados do frontend e do backend são idênticos;
  - o HTML de `/termos-de-uso`, `/politica-de-privacidade` e `/termos-de-uso/2026-10-26.1` e a rota `GET /legal/documentos` mostram só o endereço novo.

## 26/10/2026 — Checagem de CPF/CNPJ no cadastro de prestador

- **Contexto:** o cadastro de cliente já conferia o CPF ao sair do campo, mas o de prestador só descobria um documento inválido pela resposta da API, depois do envio. É uma melhoria do formulário que já existia, dentro dos critérios da US39 (erros de validação embaixo do campo), por isso não gerou história nova (Regra 6).
- **Alteração:**
  - `register-prestador` usa `validarCPF`/`validarCNPJ` de `frontend/src/utils/documento.ts`, com as mesmas regras de dígitos verificadores do backend (`backend/src/validators/documento.ts`);
  - o erro aparece embaixo do campo ao sair dele, com `aria-invalid` e `aria-describedby`, e o envio é bloqueado com uma mensagem quando o documento é inválido;
  - o campo ganhou uma ajuda ("CPF (11 dígitos) ou CNPJ (14 dígitos), com ou sem pontuação");
  - o documento vai para a API só com os números (`normalizarDocumento`), como no cadastro de cliente.
  - A validação do backend continua valendo: a checagem no cliente só antecipa o aviso.
- **Limite:** a checagem confere os dígitos verificadores, não consulta a Receita Federal; não garante que o documento existe ou pertence à pessoa.
- **Arquivos alterados:** `frontend/src/app/register-prestador/page.tsx` e este log.
- **Validações:**
  - `tsc --noEmit` aprovado;
  - no navegador, `11.222.333/0001-80` (dígito errado) mostrou o erro embaixo do campo e marcou `aria-invalid="true"`, e `11.222.333/0001-81` tirou o erro;
  - o formulário não foi enviado.

## 26/10/2026 — LGPD citada nos documentos legais e nome antigo retirado (US40)

- **Contexto:** o usuário notou dois problemas.
  - A LGPD aparecia só no quadro de referências ao lado do documento, sem ser citada no texto.
  - Os Termos diziam "Eloserv (anteriormente ServiçoFácil)", mas o produto nunca foi lançado com o nome ServiçoFácil, que era só o nome interno do projeto.
- **Decisão:** a correção foi feita na versão `2026-10-26.1`, publicada no mesmo dia e aceita só por contas de teste, como na correção do e-mail. As mudanças deixam explícita a lei e as bases que o texto já descrevia, sem criar finalidade nem obrigação nova. Uma mudança de conteúdo depois de uso real continua exigindo versão nova.
- **Textos legais** (`frontend/src/conteudo/legal/2026-10-26.1.json`):
  - **Termos:**
    - seção 1: o nome antigo saiu ("Eloserv é um protótipo…");
    - seção 9: passou a dizer que o tratamento de dados segue a Política, elaborada com base na LGPD (Lei nº 13.709/2018).
  - **Política:**
    - seção 1: cita a LGPD e o papel do responsável (controlador, art. 5º, VI);
    - seção 3: dá as bases legais, que são a execução de contrato (art. 7º, V), o legítimo interesse para segurança (art. 7º, IX), o exercício regular de direitos (art. 7º, VI), o cumprimento de obrigação legal (art. 7º, II) e o consentimento para tratamentos opcionais (art. 7º, I, e art. 8º). Também cita o princípio da necessidade (art. 6º, III);
    - seção 9: lista os direitos do titular (art. 18), os prazos de confirmação e acesso (art. 19) e a petição à ANPD (art. 18, § 1º);
    - seção 10: cita as medidas de segurança (art. 46) e a comunicação de incidentes à ANPD e aos titulares (art. 48).
- **Interface:**
  - aviso do topo dos documentos (`DocumentoLegal.tsx`): "protótipo acadêmico Eloserv, elaborado com base na LGPD", sem o nome antigo;
  - seção de aceite dos cadastros (`AceiteDocumentos.tsx`): os direitos de titular da LGPD são exercidos pela Central;
  - subtítulo da Central (`CentralPrivacidade.tsx`): "direitos de titular previstos no art. 18 da LGPD";
  - seção de desativação do perfil: passou a falar em "exercer os direitos previstos na LGPD";
  - título do Swagger (`backend/src/config/openapi.ts`): de "API ServiçoFácil" para "API Eloserv".
- **Nomes internos mantidos:** o nome técnico `tcc-servico-facil-backend` (pacote e `/health`), o banco `tcc_servico_facil` e as chaves `@ServicoFacil:*` do navegador continuam iguais, porque trocá-los quebraria as sessões e a configuração local.
- **Validações:**
  - JSON válido, `tsc --noEmit` aprovado e `npm run test:unit` com 10 suítes e 160 testes aprovados;
  - o HTML de `/termos-de-uso`, `/politica-de-privacidade` e `/politica-de-privacidade/2026-10-26.1` não tem mais "ServiçoFácil" e mostra as citações da LGPD;
  - o Swagger responde com o título "API Eloserv";
  - a seção 3 da Política foi conferida no navegador, sem erros no console.

## 26/10/2026 — Banco de dados renomeado para `tcc_eloserv` (US37)

- **Contexto:** depois de tirar o nome antigo dos textos visíveis, o usuário pediu para o banco também deixar de se chamar `tcc_servico_facil`. É parte da troca de identidade da US37, então a tarefa foi acrescentada à US37 no `historia.md` (um critério e uma tarefa técnica de banco) e o Jira foi sincronizado com `--atualizar US37` (TCC-49). Não virou história nova.
- **Como foi feito:** o MySQL 8.0 não tem comando para renomear banco, então o banco foi copiado.
  1. **Inspeção:** o banco tem 15 tabelas e 25 chaves estrangeiras, sem views, triggers, rotinas ou eventos; charset `utf8mb4` / `utf8mb4_0900_ai_ci`.
  2. **Dump:** `mysqldump --single-transaction --routines --triggers --events` dentro do container `tcc_servico_facil_db`, rodado pelo Docker do Windows, porque no WSL o `docker` não tem o socket da integração. O `--single-transaction` tira uma foto consistente sem travar a API, que estava usando o banco.
  3. **Criação e importação:** `CREATE DATABASE tcc_eloserv` com o mesmo charset, seguido da importação do dump. O script recusa rodar se `tcc_eloserv` já tiver tabelas.
  4. **Conferência:** 15 tabelas e 25 chaves estrangeiras nos dois bancos, e a mesma quantidade de linhas em cada tabela (0 diferenças), incluindo as 24 migrations do `SequelizeMeta`.
- **Cópias de segurança:**
  - o banco `tcc_servico_facil` foi mantido intacto, até o usuário confirmar que pode ser apagado;
  - o dump foi guardado em `~/backup-banco/backup_tcc_servico_facil_2026-10-26.sql`, fora do repositório.
- **Configuração alterada:**
  - `backend/.env` (`DB_NAME`, arquivo fora do Git);
  - `backend/.env.example` (`DB_NAME` e `DB_NAME_TEST`);
  - nomes padrão em `backend/src/config/database.ts` e `backend/src/config/sequelize-cli.js`;
  - `docker-compose.yml` (`MYSQL_DATABASE` e `DB_NAME`);
  - `.github/workflows/validacao.yml` (banco do CI);
  - mensagem de `backend/tests/ambiente.cjs`, `backend/tests/LEIA-ME.md` e `README.md`.
- **Mantidos de propósito:**
  - os nomes dos containers (`tcc_servico_facil_db`, `_backend`, `_frontend`) e do volume `mysql_data`, porque trocá-los obrigaria a recriar o container e arriscaria o volume de dados;
  - o nome técnico do pacote (`tcc-servico-facil-backend`) e as chaves `@ServicoFacil:*` do navegador;
  - os registros históricos (este log, `VERIFICACAO_FLUXOS.md` e `docs/PRIVACIDADE.md`), que citam os bancos usados na época.
  - Os bancos de teste antigos (`tcc_servico_facil_test` e `tcc_servico_facil_privacidade_test`) continuam no MySQL e podem ser apagados.
- **Observação sobre docker-compose:** `MYSQL_DATABASE` só cria o banco na primeira inicialização de um volume vazio. Numa instalação nova, `docker-compose up -d db` já cria `tcc_eloserv`. Numa instalação existente, o banco precisa ser copiado como descrito acima.
- **Validações:**
  - a API da porta 3001 foi reiniciada para ler o `.env`; `/health` e `/prestador/oportunidades` respondem 200, e o MySQL mostra conexões abertas só no `tcc_eloserv`;
  - `sequelize-cli db:migrate:status` lista todas as migrations como `up` no banco novo;
  - `DB_NAME_TEST=tcc_eloserv_test npm test`: 14 suítes e 243 testes aprovados (o banco de testes é criado pelos próprios testes);
  - no navegador, o login da conta demo de solicitante funcionou e "Minhas solicitações" mostrou os 29 pedidos;
  - a conta demo terminou deslogada.
- **Atenção:** a API de prévia do worktree de privacidade (porta 3003) usa o mesmo `.env` por link simbólico, mas só passa a usar o banco novo quando for reiniciada; até lá, ela grava no banco antigo.
- **Complemento (26/10/2026): bancos antigos apagados.** A pedido do usuário, `tcc_servico_facil`, `tcc_servico_facil_test` e `tcc_servico_facil_privacidade_test` foram removidos com `DROP DATABASE`. Antes disso, foi conferido que nenhum dos três tinha conexão aberta e que `tcc_servico_facil` tinha a mesma quantidade de linhas que `tcc_eloserv` em todas as tabelas, ou seja, nenhum dado novo foi gravado no banco antigo depois da cópia. Restam no MySQL só `tcc_eloserv` e `tcc_eloserv_test`. O dump `~/backup-banco/backup_tcc_servico_facil_2026-10-26.sql` (90 KB) foi mantido. A API de prévia do worktree de privacidade (porta 3003), se ainda estiver rodando, precisa ser reiniciada para usar o `tcc_eloserv`; os testes desse worktree devem usar `DB_NAME_TEST=tcc_eloserv_test`.

## 26/10/2026 — Diagramas UML e MER em `docs/diagramas`

- **Contexto:** a seção 3 (Metodologia) do `TCC.md` prevê Diagrama de Casos de Uso, Diagrama de Classes e MER, e o repositório não tinha nenhum. O usuário pediu esses três e o diagrama de sequência da contratação, em Mermaid e a partir do código atual. É documentação acadêmica exigida pelo `CLAUDE.md` (seção 4), sem funcionalidade, tela ou endpoint novo, por isso não virou história no backlog.
- **Arquivos criados em `docs/diagramas/`:**
  - `README.md`: índice, como visualizar e exportar para a monografia, e como manter os diagramas;
  - `casos-de-uso.md`: atores com generalização (o prestador herda o solicitante, pela US33) e cinco diagramas por área, com 36 casos de uso. Inclui uma tabela de rastreabilidade caso de uso → história → endpoint;
  - `classes.md`: as 14 classes de domínio com atributos, multiplicidades e composições (estas seguem o `ON DELETE CASCADE`), as 11 enumerações e as camadas do backend no fluxo de contratação;
  - `mer.md`: visão resumida e diagrama completo, com as 15 tabelas, as 25 chaves estrangeiras com regra de exclusão e as restrições de unicidade;
  - `sequencia-contratacao.md`: dois diagramas, da proposta e negociação até o aceite, pagamento, conclusão e avaliação. Mostram transações, bloqueios `FOR UPDATE` e as notificações emitidas depois do commit, e trazem uma tabela dos estados percorridos.
- **Fontes conferidas:**
  - models e `models/index.ts`;
  - as rotas de `backend/src/routes` e os prefixos em `app.ts`;
  - as regras de permissão nos controllers e services;
  - o esquema real do banco `tcc_eloserv` (`information_schema`: colunas, chaves estrangeiras e índices únicos);
  - as telas `minhas-solicitacoes/[id]` e `oportunidades/[id]`.
- **Decisões:**
  - o Mermaid não tem notação de casos de uso, então eles são desenhados como fluxograma com convenção explicada no arquivo;
  - o MER usa os tipos físicos do MySQL, com `decimal(10_2)` no lugar de `decimal(10,2)`, porque o Mermaid não aceita vírgula no tipo;
  - os campos `created_at` e `updated_at` foram omitidos dos diagramas;
  - o MER resumido usa `direction LR` para caber numa página A4.
- **Achado no código:** é possível confirmar a conclusão sem pagamento simulado. `solicitacaoService.concluir()` só libera a custódia se ela existir, e a tela do solicitante mostra o botão de conclusão sempre que a solicitação está `CONTRATADA`. Isso confirma a anotação "consigo concluir o serviço sem pagar" do `Notas.md`. O diagrama de sequência mostra o pagamento como `opt` e registra o ponto. O comportamento não foi alterado, porque exigir a custódia é mudança de regra e precisa passar antes pelo backlog e pelo Jira.
- **Validação:**
  - os 13 blocos Mermaid foram analisados (`mermaid.parse`) e desenhados (`mermaid.render`) sem erro no Mermaid 11.6.0, no navegador embutido, usando uma cópia temporária servida pelo `next dev` em `frontend/public/tmp-diagramas`, já apagada;
  - as setas foram contadas: só as generalizações e os `«include»`/`«extend»` têm ponta de seta;
  - o desenho dos casos de uso, das classes, do MER e da sequência foi conferido em captura de tela;
  - o Mermaid 11.4.1 desenha seta indevida nas associações `---`, o que ficou registrado no README dos diagramas.
- **Bibliotecas:** nenhuma dependência nova. O Mermaid é só a notação dos arquivos Markdown e foi carregado do CDN apenas para a validação.

## 26/10/2026 — Conclusão do serviço exige pagamento simulado retido (US17)

- **Contexto:** ao gerar o diagrama de sequência, ficou confirmado que era possível concluir um serviço sem o pagamento simulado, como anotado no `Notas.md` ("consigo concluir o serviço sem pagar"). O usuário pediu para exigir a custódia `RETIDO` antes da conclusão.
- **Backlog e Jira:** a regra cabe na US17 (Confirmação de Conclusão), então virou critério de aceite dela, e não história nova. Também foram ajustadas as tarefas técnicas de Backend e Frontend, e acrescentada uma de Testes. O critério foi registrado como pendente e sincronizado no Jira (TCC-25) antes da implementação; depois foi marcado como feito e sincronizado de novo.
- **Backend:**
  - `solicitacaoService.concluir()` lê a custódia antes de alterar a solicitação e responde 409 ("O pagamento simulado ainda não foi confirmado...") quando ela não existe ou não está `RETIDO`;
  - o caso da custódia `REEMBOLSADO` de uma contratação anterior também é recusado, porque ainda não houve pagamento da proposta atual;
  - a checagem de custódia de outra proposta continua com a mensagem própria;
  - a solicitação só vira `CONCLUIDA` depois da checagem, na mesma transação com bloqueio `FOR UPDATE`;
  - `oportunidadeService.buscarOportunidade()` devolve `pagamento_contratacao`, a situação da custódia, só para o prestador da proposta `ACEITA`, e `null` para as demais pessoas;
  - Swagger: resposta 409 em `PATCH /solicitacoes/{id}/concluir` e campo `pagamento_contratacao` em `OportunidadeDTO`.
- **Frontend:**
  - `minhas-solicitacoes/[id]`: o botão "Confirmar que o serviço foi concluído" fica desabilitado sem custódia `RETIDO`, com uma orientação para confirmar o pagamento na seção de pagamento (`aria-describedby`);
  - `oportunidades/[id]`: o aviso do prestador contratado passou a dizer se o pagamento já está retido. Sem pagamento, um alerta explica que o cliente ainda não pagou, e "Marcar como concluído" fica desabilitado. A desistência continua disponível.
- **Testes (`backend/tests/fluxos.integracao.test.js`):**
  - três testes que concluíam sem pagar passaram a pagar antes;
  - novos: recusa 409 para solicitante e prestador sem pagamento, sem mudar estado nem notificar, e conclusão logo após pagar;
  - novos: custódia reembolsada da contratação anterior não autoriza concluir a nova;
  - novos: `pagamento_contratacao` aparece só para o prestador contratado.
- **Diagramas:**
  - `docs/diagramas/sequencia-contratacao.md`: o pagamento deixou de ser opcional, a conclusão ganhou o ramo de recusa 409, e a observação virou a seção "Regra: pagamento antes da conclusão";
  - a observação de `casos-de-uso.md` foi ajustada;
  - os 13 blocos foram validados de novo no Mermaid 11.6.0.
- **Validação:**
  - `DB_NAME_TEST=tcc_eloserv_test npm test`: 14 suítes e 246 testes aprovados (eram 243);
  - `npx tsc --noEmit` no frontend: OK;
  - a API da porta 3001 foi reiniciada, porque o `ts-node-dev` não detectou as edições;
  - no navegador, na solicitação demo "Revisão do quadro de disjuntores" (contratada e sem pagamento), as telas do solicitante e do prestador mostraram o botão desabilitado e a explicação;
  - as contas demo terminaram deslogadas;
  - a solicitação demo não foi paga nem concluída, para preservar os dados da banca.
- **Bibliotecas:** nenhuma nova.

## 26/10/2026 — US41: página de arquitetura e modelagem no próprio sistema

- **Contexto:** o usuário vai apresentar o TCC em vídeo e preferiu mostrar os diagramas dentro do próprio Eloserv, em vez de um link externo. Por ser escopo novo, a US41 foi escrita no `historia.md` (Épico 9, Should Have, 5 pontos, na matriz MoSCoW) e importada para o Jira antes da implementação: TCC-54, ligada ao Épico 9 (TCC-34).
- **Página `/arquitetura`:**
  - é pública, com as abas Visão geral, Casos de uso, Classes, MER e Sequência da contratação, e cada aba abre direto pelo endereço `/arquitetura?aba=...`;
  - um valor de aba desconhecido cai na Visão geral;
  - tem link "Arquitetura" no rodapé de todas as telas e do login (`LinksRodape`).
- **Fonte única:**
  - o Server Component lê `docs/diagramas/*.md` com `fs` a cada acesso (`dynamic = 'force-dynamic'`), sem copiar os arquivos para o frontend;
  - só os cinco arquivos da lista de abas podem ser lidos, o que impede acesso a outros caminhos;
  - no Docker, um volume somente leitura `./docs/diagramas:/docs/diagramas:ro` torna os arquivos visíveis para o container; a variável `DIAGRAMAS_DIR` permite outro caminho;
  - se um arquivo faltar, a página mostra um aviso em vez de quebrar.
- **Componentes (`frontend/src/components/arquitetura/`):**
  - `abas.ts`: lista das abas, que serve também de whitelist dos arquivos;
  - `ConteudoMarkdown.tsx`: desenha o Markdown com `react-markdown` e `remark-gfm`. Os títulos descem um nível, porque a página já tem o próprio `h1`; as tabelas ficam roláveis e focáveis; os links entre `.md` viram links de aba. Cada bloco Mermaid ganha o título da seção onde está, usado no rótulo acessível e no nome do SVG;
  - `DiagramaMermaid.tsx`: carrega o Mermaid sob demanda e desenha sobre um "papel" branco, igual ao SVG baixado. Tem zoom (afastar, aproximar, ajustar e 100%) e o botão "Baixar SVG". A área do diagrama é rolável e focável pelo teclado. Um erro de sintaxe vira aviso com os detalhes.
- **CSS (`globals.css`):** estilos do texto, das tabelas e do papel dos diagramas. Os rótulos do Mermaid são HTML dentro do SVG e herdavam a cor clara e o tamanho de `p` da página, o que deixava o texto ilegível e fora das caixas. Uma regra específica faz eles herdarem do diagrama.
- **Bibliotecas novas (tabela acima):** `mermaid` 11.17.2, `react-markdown` 9.0.1 e `remark-gfm` 4.0.0, com versão exata.
  - A primeira instalação usou o Mermaid 11.6.0, que trazia alertas de `lodash-es` (alto) e vários do próprio Mermaid. A 11.17.2 eliminou esses alertas, restando um baixo do `katex`.
  - Os alertas de `next`, `axios`, `postcss` e `follow-redirects` já existiam e não foram tratados nesta história.
- **Validação:**
  - `npx tsc --noEmit` no frontend sem erros;
  - as cinco abas e um valor de aba inválido respondem 200;
  - no navegador, os 13 diagramas foram desenhados sem erro, com 6, 3, 2 e 2 por aba;
  - os 13 SVGs gerados pelo Mermaid 11.17.2 são XML válidos (`DOMParser` com `image/svg+xml`), ou seja, o arquivo baixado abre no navegador e no Word;
  - as associações `---` dos casos de uso continuam sem seta, como no 11.6.0;
  - o zoom foi testado no MER completo: de 18% ajustado para 28% em dois cliques, com rolagem horizontal;
  - a largura de 375 px não tem rolagem horizontal da página;
  - os links da Visão geral levam às abas.
  - O download em si não foi acionado no navegador embutido, para não salvar arquivo na máquina do usuário.

## 26/10/2026 — US42: tema claro desenhado, aprovado e planejado (sem código)

- **Contexto:** o usuário quis um tema claro, sobretudo para usar capturas de tela claras na monografia. Antes de qualquer código, a variação clara da paleta Elo foi desenhada no canvas de design, na página nova "5 · Tema claro". Ela tem a prancha da paleta (tokens escuro → claro com o contraste de cada par), cabeçalho e rodapé claros e as telas de comparar propostas, chat, painel administrativo e celular. As pranchas existentes não foram alteradas.
- **Paleta clara aprovada pelo usuário em 26/10/2026:**
  - superfícies: fundo #F5F6FC, destaque #ECEEFA, superfície #FFFFFF, borda #D9DCEF e borda de campo #7C83AE;
  - textos: texto #14163A, secundário #2F3563, apoio #4B5280 e detalhe #5B6290;
  - interação: primária #4F46E5 (igual à escura) e link #4338CA;
  - azul-céu: #075985 e #0369A1 sobre #E0F2FE;
  - estados: aviso #92400E sobre #FEF3C7, erro #B91C1C (selo #DC2626), sucesso #047857 e informação #3730A3 sobre #EEF2FF.
- **Contraste:** calculado por script antes do desenho. Todos os textos passam de 4,5:1, e o menor é o texto de detalhe, com 5,1:1. A borda de campo foi criada como papel próprio porque a borda de cartão não chegava a 3:1; ficou com 3,18:1 a 3,67:1. O azul-céu fixo do logo (#0EA5E9) fica com 2,77:1 sobre o branco, o que é aceito por ser logotipo, isento no WCAG. As cores do logo não mudaram.
- **Backlog e Jira:**
  - US42 "Tema Claro e Troca de Tema" no Épico 8, Should Have, 8 pontos, na matriz MoSCoW;
  - importada no Jira como TCC-55, ligada ao Épico 8 (TCC-31);
  - os critérios e as tarefas técnicas da história são o plano de implementação.
- **Levantamento para o plano:**
  - cerca de 180 cores e 33 `rgba` fixos em 27 arquivos `.tsx`, e 47 cores e 3 `rgba` soltos no `globals.css`;
  - o `Logo.tsx` está fixo na versão escura;
  - o `app/layout.tsx` não tem controle de tema.
- **Decisões do plano:** os valores escuros atuais ficam em `:root`, para o tema escuro continuar idêntico. O claro entra por `data-tema="claro"` e pela preferência do sistema. A escolha (Automático, Claro ou Escuro) é salva em `@ServicoFacil:tema` e aplicada por um script no `<head>`, para não piscar. O seletor fica no menu da conta e no rodapé. Nenhuma biblioteca nova está prevista.
- **Código:** nenhum arquivo do app foi alterado nesta etapa.

## 26/10/2026 — US42, etapa 1: tokens de tema no `globals.css`

- **O que mudou em `frontend/src/app/globals.css`:**
  - o bloco `:root` passou de 11 para 58 variáveis, cobrindo todos os papéis da paleta: superfícies, bordas, quatro níveis de texto, interação, azul-céu, estados (sucesso, aviso, erro, informação e violeta), transparências dos chips, fundo do cabeçalho, sobreposição de modal, sombra e as cores fixas do logo;
  - os nomes existentes (`--bg-color`, `--card-bg`, `--text-primary` etc.) foram mantidos, porque já eram usados cerca de 250 vezes nas telas;
  - um bloco novo, `:root[data-tema="claro"]`, redefine os mesmos papéis com a paleta clara aprovada no canvas e `color-scheme: light`;
  - as 42 regras do CSS que tinham cor fixa passaram a usar os tokens. Ficaram de fora só as cores do "papel" branco dos diagramas (US41), exceção prevista na história.
- **Por que o tema claro ainda não liga sozinho:** sem `prefers-color-scheme` nesta etapa, ninguém vê o claro por enquanto. As telas ainda têm cerca de 180 cores fixas nos `.tsx`, e uma prévia com `data-tema="claro"` no login confirmou isso: o formulário fica claro e legível, mas o painel da esquerda continua escuro. A preferência do sistema e o seletor entram na etapa 4.
- **Tons ajustados pelo script de contraste:**
  - borda de campo escura: #2C3166 → #5F67A0. Tinha 1,4:1 e o campo quase não tinha contorno;
  - selo de notificação: #EF4444 → #DC2626. O texto branco tinha 3,8:1;
  - aviso forte claro: #B45309 → #A3480A, que tinha 4,35:1 sobre o fundo de destaque.
  - As duas primeiras são mudanças pequenas e de propósito no tema escuro. O critério da US42 foi ajustado para registrá-las como exceção ao "escuro idêntico".
- **Ferramenta nova:** `frontend/scripts/contraste-tema.mjs`, executado com `npm run contraste:tema`. Ele lê os dois blocos de tokens do `globals.css` e testa 59 pares de uso em cada tema: texto sobre as três superfícies, chips sobre as transparências compostas, avisos, botões, foco e bordas de campo. Termina com erro se algum par ficar abaixo de 4,5:1 (texto) ou 3:1 (borda, foco, ícone). Usa só Node.js nativo, sem dependência nova.
- **Validações:**
  - Escuro sem mudança: cada `var(--...)` foi expandido pelo valor escuro e comparado com o `globals.css` anterior, guardado em `~/backup-us42/globals.antes-etapa1.css`. Todas as regras resolvem para as mesmas cores, exceto a borda de campo, que mudou de propósito.
  - Contraste: `npm run contraste:tema` aprovou todos os pares nos dois temas.
  - Navegador: `/login` mostrou o fundo #0E1024 e a borda de campo nova (rgb 95, 103, 160). A prévia com `data-tema="claro"` foi desligada em seguida.
- **Próxima etapa:** 2, troca das cores fixas dos `.tsx` pelos tokens.

## 26/10/2026 — Cadastros conferidos contra o canvas: endereço do prestador, dois textos e seção de termos no canvas

- **Contexto:** o usuário perguntou se o cadastro estava diferente do canvas. As telas `/register-solicitante` e `/register-prestador` foram comparadas com as pranchas "Cadastro de cliente" e "Cadastro de prestador", em 1440px. A estrutura batia; foram encontradas quatro diferenças. São ajustes dentro do redesign (US39) e dos cadastros (US01, US02, US40), sem escopo novo.
- **Corrigido no app:**
  - **prestador, "Documento e contato":** em formulário largo, a grade (colunas de no mínimo 220px) punha três campos na primeira linha e deixava o "Endereço de atendimento" sozinho numa coluna estreita, com o exemplo cortado. Nova variação `.grade-campos.campos-largos` (colunas de no mínimo 280px) no `globals.css`, usada só nessa seção, volta ao 2 x 2 do canvas;
  - **cliente, CPF:** a ajuda voltou a ter a frase "Não aparece para os prestadores." do canvas. Ela é verdadeira: o perfil público não expõe o CPF;
  - **cliente, coluna lateral:** "em Minha conta › Privacidade" apontava um caminho inexistente e foi trocado pelo caminho real, "em Meu perfil › Desativar conta".
- **Corrigido no canvas:**
  - as duas pranchas de cadastro tinham uma única caixa "Concordo com a LGPD", anterior à US40, e ganharam a seção "4. Termos e privacidade" igual à do app: botões dos dois documentos, aceite dos Termos de Uso, ciência da Política e o texto da Central de Privacidade;
  - a altura das pranchas aumentou de 1300 para 1500 (cliente) e de 1550 para 1750 (prestador);
  - o caminho de desativação do cliente foi corrigido também no canvas.
- **Diferença mantida:** o canvas mostra os campos preenchidos com exemplos (CPF com erro, senha "7 de 8"), e o app abre vazio. É esperado, porque o aviso de CPF e o contador de senha do app aparecem ao digitar.
- **Validação:**
  - `npx tsc --noEmit` sem erros;
  - em 1440px, os quatro campos do prestador ficam em 2 x 2, com 381px cada;
  - em 375px, ficam numa coluna de 306px, sem rolagem horizontal;
  - no cliente, os dois textos novos aparecem na página.

## 26/10/2026 — US42, etapa 2: cores fixas dos `.tsx` trocadas pelos tokens

- **Resultado:** nenhuma cor fixa restou nos arquivos `.tsx` de `frontend/src`, exceto no `components/Logo.tsx`, que é a etapa 3. Foram 236 trocas em 26 arquivos: 16 manuais e 220 automáticas.
- **Tokens novos no `globals.css`:** 14, nos dois temas. Eram papéis que só as telas usavam:
  - fundos: `--bg-raised` e `--bg-sunken` (painel e caixas do chat);
  - sobreposições: `--overlay-soft`, `--overlay-media` e `--on-overlay-media`. O visualizador de imagem continua escuro nos dois temas;
  - sombras: `--shadow-menu`, `--shadow-drawer` e `--shadow-card`, mais leves e azuladas no claro;
  - outros: `--primary-tint-strong`, `--neutral-tint-soft`, `--sky-border`, `--success-soft-text`, `--on-accent` e `--violet-strong`.
- **Como foi feito (`etapa2.py`):**
  - **Trocas manuais com asserção de contagem:** casos em que a mesma cor tinha papéis diferentes. O branco do chat é o principal: o balão do outro participante usava texto branco e, no claro, ficaria branco sobre branco; agora o texto acompanha o fundo. Também os campos de digitação do chat (borda de campo e texto do tema), os selos "Menor preço", o seletor das configurações, o selo de notificações e as sombras inteiras.
  - **Trocas automáticas:** cada cor cujo valor escuro é exatamente o de um token foi trocada por `var(--token)`, sem diferenciar maiúsculas e minúsculas, inclusive `rgba` com ou sem espaços.
  - O conversor terminou listando zero cores restantes. Também não sobrou nenhuma cor com nome (`white`, `black`) nos `.tsx`.
- **Prova de que o escuro não mudou (`conferir_tsx.py`):** cada `var(--...)` foi resolvido pelo valor escuro e comparado linha a linha com os `.tsx` originais, guardados em `~/backup-us42/src-antes-etapa2`. Só 9 linhas mudaram, todas de propósito:
  - correções de contraste que já falhavam: o texto do botão verde do chat (branco #FFFFFF sobre #10B981, 2,5:1) passou a #0E1024 (7,4:1); os dois campos de digitação do chat ganharam a borda de campo nova (#5F67A0); o selo de notificações passou ao vermelho #DC2626, como na etapa 1;
  - texto branco (#FFFFFF ou #EEF2FF) trocado pelo texto do tema (#F5F7FF), uma diferença imperceptível, em quatro lugares.
- **Ajuste encontrado pela auditoria:** o vermelho forte do claro (`--danger-strong`) passou de #DC2626 para #B91C1C. No chip "Cancelada", ele tinha 3,95:1 sobre o fundo rosado; agora tem 5,3:1. O par entrou no script de contraste.
- **Correção no script de contraste:** ele passou a ignorar comentários CSS. Um comentário com o texto "--danger-tint: 5,3:1" tinha sido lido como token e escondido o valor claro de `--danger-bg`.
- **Validações:**
  - `npx tsc --noEmit` sem erros;
  - `npm run contraste:tema`: 152 pares aprovados, 76 em cada tema;
  - o resultado no projeto é idêntico ao da cópia testada (`diff -rq`);
  - escuro: página inicial e detalhe conferidos no navegador, iguais aos de antes;
  - claro, por prévia com `data-tema="claro"` (o tema claro ainda não liga sozinho): uma auditoria automática no navegador mediu o contraste real de cada texto visível contra o fundo efetivo, compondo as transparências. Passou em 19 telas e no painel do chat:
    - páginas públicas: início, entrar, cadastro de prestador, status, arquitetura e Termos de Uso;
    - conta de solicitante: painel, minhas solicitações, detalhe, nova solicitação, perfil, configurações, Central de Privacidade e oportunidades;
    - conta de administrador: admin, atendimento de privacidade, minhas propostas e detalhe de oportunidade.
  - A única falha que restou é o nome "eloserv" do logo, que é a etapa 3.
  - Com o painel do navegador escondido, as transições de CSS não avançam e a medição pega a cor de antes da troca; por isso a auditoria desliga as transições.
- **Contas demo:** terminaram deslogadas. Abrir o chat da contratação demo pode ter marcado mensagens como lidas, que é o comportamento normal.
- **Próxima etapa:** 3, o logo nas duas versões fixas da marca.

## 26/10/2026 — US42, etapa 3: logo nas duas versões fixas da marca

- **O que mudou:**
  - `components/Logo.tsx` passou a usar os tokens `--logo-indigo`, `--logo-sky` e `--logo-text`, criados na etapa 1. Os valores continuam sendo as cores fixas da marca: na versão escura, #818CF8, #38BDF8 e "serv" em #F5F7FF; na clara, a já aprovada no canvas, #4F46E5, #0EA5E9 e "serv" em #0F172A. O tema só escolhe qual das duas versões aparece; nenhuma cor do logo foi alterada;
  - o recorte entre os elos (o traço grosso na cor do fundo) passou a ter `var(--bg-color)` como padrão, em vez de #0E1024 fixo;
  - o cabeçalho, cujo fundo é translúcido, ganhou o token `--header-solid`: a cor do fundo já composta, #0E1024 no escuro e #FEFEFF no claro. O `Cabecalho.tsx` passa essa cor ao logo;
  - o login já passava `var(--bg-highlight)`;
  - o comentário de documentação do `Logo.tsx` descreve as duas versões.
- **Favicon (`app/icon.svg`):** não mudou. O símbolo fica sobre um quadrado escuro próprio, então funciona igual em abas claras e escuras do navegador.
- **Resultado:** agora não há nenhuma cor fixa nos `.tsx`. As únicas cores hexadecimais que aparecem estão no comentário de documentação da marca, no `Logo.tsx`.
- **Validação:**
  - `npx tsc --noEmit` sem erros;
  - `npm run contraste:tema`: todos os pares passam;
  - no navegador, cabeçalho e rodapé de `/termos-de-uso` foram lidos nos dois temas. Elos, "elo" e "serv" resolvem exatamente para as cores fixas de cada versão;
  - o recorte coincide com o fundo real: no cabeçalho, #0E1024 / #FEFEFF; no rodapé, #0E1024 / #F5F6FC;
  - no painel do login, o recorte coincide com o fundo do painel nos dois temas, rgb(19,22,58) / rgb(236,238,250);
  - capturas confirmaram o logo legível nos dois temas. Antes, o "serv" sumia no claro.
- **Próxima etapa:** 4, preferência do sistema, seletor Automático/Claro/Escuro e aplicação antes da primeira pintura. É ela que liga o tema claro para os usuários.

## 26/10/2026 — US42, etapa 4: preferência do sistema, seletor de tema e aplicação antes da pintura (história concluída)

- **Arquivos novos:**
  - **`frontend/src/utils/tema.ts`:** guarda a regra de tema.
    - Preferências possíveis: `automatico`, `claro` e `escuro`.
    - A escolha fica salva em `@ServicoFacil:tema`, o mesmo prefixo das outras chaves. "Automático" é a ausência de chave, então quem nunca escolheu segue o sistema.
    - Funções `lerPreferencia`, `resolverTema` (consulta `prefers-color-scheme`), `aplicarTema` (escreve `data-tema` no `<html>` e acerta o `meta theme-color` pela variável `--bg-color`) e `escolherTema` (salva, aplica e avisa os seletores).
    - Constante `SCRIPT_TEMA_INICIAL`: a mesma regra em JavaScript puro, para rodar antes do React.
    - Armazenamento indisponível cai em "Automático", com `try/catch`.
  - **`frontend/src/components/TemaSincronizado.tsx`:** componente sem interface montado no layout. No modo Automático, acompanha a troca de tema do sistema com a página aberta; quando a escolha muda em outra aba (evento `storage`), aplica aqui também e atualiza os seletores.
  - **`frontend/src/components/ui/SeletorTema.tsx`:**
    - grupo de botões de rádio de verdade (`fieldset` com legenda), com aparência de controle segmentado;
    - ícones de monitor, sol e lua, e cada opção com `aria-label` próprio;
    - o tema escolhido aparece por extenso ("Tema: Automático (segue o sistema)");
    - o teclado funciona pelas setas, há contorno de foco e as opções têm 44 × 44 px.
- **Integração:**
  - **`app/layout.tsx`:** `<script>` com `SCRIPT_TEMA_INICIAL` no `<head>`, além de `suppressHydrationWarning` no `<html>` (o `data-tema` não vem do servidor) e `<TemaSincronizado />`;
  - **seletor:** no menu da conta, entre Configurações e Sair; no rodapé (`Rodape`) de todas as páginas; e no login, que não usa o rodapé completo;
  - **`globals.css`:** `color-scheme: dark` no `:root`, para os controles nativos (barras de rolagem, listas, seletor de data) acompanharem o escuro, como o claro já tinha `color-scheme: light`; e os estilos `.seletor-tema*`.
- **Por que o tema não depende de `@media` no CSS:** o script resolve a preferência e escreve sempre o tema efetivo em `data-tema`. Assim, os valores claros ficam num único bloco `:root[data-tema="claro"]`, sem duplicar a paleta numa media query.
- **Ajuste durante os testes:** a árvore de acessibilidade mostrava o valor interno ("automatico") como nome das opções. Cada rádio ganhou `aria-label` explícito, e a árvore passou a mostrar "Automático, segue o sistema", "Claro" e "Escuro".
- **Validação:**
  - `npx tsc --noEmit` sem erros, e `npm run contraste:tema` aprova todos os pares;
  - no HTML do servidor, o script fica dentro do `<head>`, antes do `<body>`, e é síncrono; o tema é aplicado antes do primeiro conteúdo da página;
  - no navegador, com a preferência do sistema emulada:
    - sem escolha salva e sistema claro, a página nasce clara, o seletor mostra "Automático" e o `theme-color` fica #F5F6FC;
    - sem escolha salva e sistema escuro, a página nasce escura, com #0E1024;
    - "Claro" com o sistema escuro salva a chave, aplica na hora e continua claro em outra página depois de um carregamento completo;
    - a seta para a direita no teclado passa a "Escuro" e salva, com contorno de foco visível;
    - voltar para "Automático" apaga a chave e segue o sistema;
    - os seletores do menu e do rodapé ficam sincronizados, e o menu continua aberto ao trocar;
    - a troca na segunda aba se aplica na primeira;
    - em 375px, o seletor quebra para baixo dos links do rodapé, sem rolagem horizontal.
  - A troca ao vivo do tema do sistema só pôde ser testada com o painel do navegador visível. Escondido, o navegador não avalia mudanças de mídia, e nem um ouvinte criado no console recebia o evento. Com o painel visível, a página passou ao claro e ao escuro sem recarregar.
  - A conta demo terminou deslogada, e o tema ficou em "Automático".
- **Bibliotecas:** nenhuma nova. Só APIs nativas do navegador (Web Storage e `matchMedia`), documentadas no topo de `tema.ts`.
- **US42 concluída:** os oito critérios de aceite foram marcados no `historia.md` e sincronizados no Jira (TCC-55). Fica para depois só a tarefa de documentação de tirar capturas em tema claro para a monografia, que é feita na redação.

## 27/10/2026 — US42, ajuste: seletor de tema alinhado no rodapé

- **Problema:** no rodapé, o seletor de tema ficava ao lado dos links, com o rótulo "Tema" em cima dos botões. O bloco ficava mais alto que os links e parecia solto, desalinhado da linha.
- **Mudança:**
  - **Variante `compacto` em `components/ui/SeletorTema.tsx`:** põe o rótulo e os botões na mesma linha, com botões de 36 px. Isso continua acima do mínimo de 24 px do WCAG 2.5.8.
  - **Texto visível:** a variante compacta mostra só "Tema: Automático". O "segue o sistema" continua no nome falado da opção e na dica.
  - **Novo layout do rodapé (`Rodape`, em `components/ui/Pagina.tsx`):** a primeira linha tem a marca à esquerda e o tema à direita, e os links vão para a linha de baixo. No celular, os três blocos se empilham, alinhados à esquerda.
  - **Login:** usa a mesma variante compacta. O menu da conta continua com o rótulo em cima, que cabe melhor no painel estreito.
  - **`globals.css`:** novos estilos `.seletor-tema.compacto`.
- **Arquivos modificados:** `frontend/src/components/ui/SeletorTema.tsx`, `frontend/src/components/ui/Pagina.tsx`, `frontend/src/app/login/page.tsx` e `frontend/src/app/globals.css`.
- **Validação:**
  - **Tela larga (1477 px):** marca e seletor ficam centralizados na mesma altura (y = 1494), e a borda direita do seletor coincide com a do conteúdo (1200 px).
  - **Celular (375 px):** não há rolagem horizontal.
  - **Login:** seletor em uma linha, abaixo dos links.
  - **Tipos:** `npx tsc --noEmit` passou sem erros.
- **Bibliotecas:** nenhuma nova.
