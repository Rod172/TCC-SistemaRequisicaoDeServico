# Conferência das histórias de usuário

Data: 25/10/2026. Referência inicial: commit `3dadf09`.

A conferência compara o backlog com as rotas, regras de negócio e telas. “Implementada” indica presença da funcionalidade e dos critérios no código; a coluna de evidências distingue os testes automatizados das conferências manuais. Os textos, prioridades e números das histórias existentes foram preservados. As descrições das 36 histórias foram sincronizadas no Jira pelo script do projeto.

As principais funcionalidades ausentes eram US19, US20 e US21. Também foram encontrados e completados critérios das US01, US02, US05, US10, US13, US22, US24, US25, US26 e US27, além de corrigidas transições das US12, US17, US18, US31 e US34.

| História | Título | Situação | Evidência principal |
|---|---|---|---|
| US01 | Cadastro de Usuário Solicitante (Cliente) | Implementada | Cadastro com unicidade, CPF normalizado, bcrypt e consentimento; testes de integração. |
| US02 | Cadastro de Prestador de Serviço (Profissional) | Implementada | Cadastro profissional JSON/multipart, CPF/CNPJ validado, categorias e foto opcional; testes de upload e limpeza. |
| US03 | Autenticação de Usuário (Login e Token JWT) | Implementada | JWT, login e rotas protegidas; integração e testes de segurança. |
| US04 | Gestão do Perfil do Usuário e Privacidade (LGPD) | Implementada | Perfil, foto, troca de senha e desativação; a conta desativada é recusada pelo middleware. |
| US05 | Publicação de Nova Solicitação de Serviço | Implementada | Formulário em três etapas, revisão e anexos; integração e navegação manual até revisão. |
| US06 | Painel "Minhas Solicitações" (Solicitante) | Implementada | Listagem própria com busca, status e contadores; integração de isolamento e build de produção. |
| US07 | Cancelamento de Solicitação de Serviço | Implementada | Cancelamento anterior à contratação e notificações; regras transacionais existentes. |
| US08 | Feed de Oportunidades de Serviços para Prestadores | Implementada | Feed público de solicitações ABERTA e EM_NEGOCIACAO com filtros (US36); acesso público preservado. |
| US09 | Visualização Detalhada da Solicitação pelo Prestador | Implementada | Detalhe, anexos e identificação da proposta própria; integração e navegação existente. |
| US10 | Envio de Proposta/Orçamento pelo Prestador | Implementada | Valor/prazo/condições, validade comercial persistida e proposta única; testes de expiração e limites. |
| US11 | Visualização e Comparação de Propostas Recebidas pelo Solicitante | Implementada | Comparação com reputação, bio/categorias, destaque e link para perfil público; build de produção. |
| US12 | Aceite e Registro de Contratação da Proposta Escolhida | Implementada | Aceite atômico com bloqueio da solicitação, recusa das concorrentes e notificações após commit; testes simultâneos. |
| US13 | Simulação de Pagamento e Retenção de Valor (Garantia / Escrow) | Implementada | Checkout simulado após aceite; retenção, reembolso, recontratação e saldo derivado das custódias liberadas; integração. |
| US14 | Chat Privado em Tempo Real entre Solicitante e Prestador | Implementada | Chat por proposta com autorização dos participantes; integração do isolamento entre concorrentes. |
| US15 | Troca de Anexos e Imagens no Chat | Implementada | Multer para imagem/PDF e limites de arquivo; formatos inválidos geram erro 400 e extensão é derivada do MIME permitido. |
| US16 | Notificações no Sistema | Implementada | Notificações persistidas e Socket.io; preferências respeitadas nos eventos existentes. |
| US17 | Confirmação de Conclusão do Serviço | Implementada | Conclusão por participante da contratação e liberação da custódia; testes de concorrência com cancelamento. |
| US18 | Avaliação de Satisfação e Reputação do Prestador | Implementada | Avaliação única e média real transacionais; testes de duplicação, concorrência e rollback. |
| US19 | Perfil Público do Prestador e Histórico de Avaliações | Implementada | GET /prestadores/:id/perfil-publico e /prestadores/[id]; dados privados omitidos e avaliações paginadas. |
| US20 | Dashboard do Solicitante | Implementada | GET /dashboards/solicitante e /dashboard; contadores limitados ao usuário autenticado e testes de isolamento. |
| US21 | Dashboard do Prestador | Implementada | GET /dashboards/prestador; período mensal de São Paulo, conversão sem divisão por zero e reputação real. |
| US22 | Segurança e Criptografia de Dados (Node.js / Express) | Implementada | bcrypt, JWT HS256 com conta ativa, ORM e limite de login 10/15min; testes de tokens, perfis e bloqueio. |
| US23 | Interface Responsiva e Usabilidade (React & Heurísticas de Nielsen) | Implementada | Layouts adaptáveis, foco visível, redução de movimento e estados de feedback; build e conferência manual a 390px nas telas novas. |
| US24 | Documentação Interativa da API (Swagger / OpenAPI) | Implementada | 46 operações documentadas com contratos de entrada/saída/erros, autenticação e referências resolvidas em src/dist. |
| US25 | Migrações e Dados Fictícios de Demonstração (Sequelize Migrations & Seeders) | Implementada | Migrations de todas as tabelas e seeds coerentes com conclusão, avaliações, custódia, chat e moderação; teste de idempotência/reversão. |
| US26 | Cobertura de Testes de Integração da API REST | Implementada | Jest/Supertest com MySQL exclusivo _test, sem mocks nos fluxos integrados e validação em pull requests. |
| US27 | Painel Administrativo de Usuários e Moderação | Implementada | Administração protegida, filtros e suporte; histórico de ações persistido na mesma transação, com testes de autorização e rollback. |
| US28 | Painel "Minhas Propostas Enviadas" (Prestador) | Implementada | Listagem das propostas próprias com filtros e acesso ao detalhe. |
| US29 | Perguntas e Respostas Públicas na Oportunidade | Implementada | Perguntas públicas e resposta pelo dono da solicitação, sem expor conversas privadas. |
| US30 | Configurações de Notificação | Implementada | Preferências persistidas por tipo de notificação, com padrão ativado. |
| US31 | Desistência do Prestador Após Contratação | Implementada | Desistência do contratado reabre a solicitação e reembolsa custódia; testes de recontratação. |
| US32 | Denúncia de Solicitação para Moderação | Implementada | Denúncia por participante e resolução administrativa; resolução registra autor e data no histórico. |
| US33 | Prestador Também Pode Solicitar Serviços | Implementada | Prestador publica solicitações próprias sem perder acesso às propostas de terceiros. |
| US34 | Negociação por Chat Antes da Contratação e Cancelamento pelo Solicitante | Implementada | Negociação privada antes do aceite, decisão pelo chat e cancelamento da contratação; testes de isolamento/reabertura. |

| US35 | Resposta do Prestador à Contraproposta do Solicitante | Implementada | Resposta exclusiva e única, valor atualizado e bloqueio do aceite pendente; integração e aceite manual pela página. |
| US36 | Descoberta de Oportunidades que Ainda Aceitam Propostas | Implementada | Feed/vitrine incluem negociação; segundo prestador encontrou e enviou proposta pela interface. |

## Alcance da validação

- Integração usa banco MySQL separado e cobre fluxos críticos com concorrência, privacidade, valores e rollback; não implica cobertura de todas as combinações de entrada possíveis.
- A carteira é uma simulação acadêmica baseada em custódias, sem integração financeira real.
- A conferência manual de celular incluiu as novas telas e o formulário em etapas; avaliação de usabilidade com usuários e testes em dispositivos físicos continuam úteis para a apresentação.
- O limite de login utiliza armazenamento em memória por processo. Uma implantação com várias instâncias precisaria de armazenamento compartilhado.
- A auditoria de dependências do backend ficou com dois avisos moderados ligados a `uuid` transitivo do Sequelize. A atualização automática proposta faria downgrade incompatível do ORM; essa troca não foi aplicada.

Validação final: **11 suítes e 200 testes aprovados**, além do build de produção do frontend e verificação do diff.


## Leitura conjunta das histórias e termos legados

- **US14 e US34:** o critério original da US14 menciona conversa após aceite. A US34, criada e autorizada posteriormente, substitui essa restrição: o chat é privado por proposta desde o envio. A exclusividade dos dois participantes permanece. A marca de implementação da US14 deve ser lida com essa revisão, e não como restauração da restrição antiga.
- **US10/US12:** o backlog usa os termos genéricos PENDENTE/REJEITADA em algumas tarefas. Os estados persistidos atuais são ENVIADA/EM_ANALISE/ACEITA/RECUSADA; pendência corresponde aos dois primeiros e rejeição corresponde a RECUSADA. Os contratos OpenAPI documentam os nomes efetivamente aceitos.
- **US13/US17:** o aceite abre o checkout simulado; a retenção ocorre somente quando o solicitante confirma o checkout. O saldo simulado disponível só inclui custódias LIBERADO após a conclusão. O pagamento não é realizado automaticamente em nome do usuário.
- As rotas históricas sugeridas nas tarefas técnicas podem diferir dos caminhos implementados; o inventário vigente está em `/api-docs.json`. O texto dos critérios originais foi preservado, com essas correspondências explícitas para a leitura do backlog.

## Verificação adicional das páginas — 25/10/2026

Consulte `VERIFICACAO_FLUXOS.md` para os passos realmente executados e os limites da conferência. A implementação das histórias e a aprovação dos testes não significam que todas as ações de todas as telas passaram por uma validação manual completa. Na primeira conferência, a confirmação nativa travou a ferramenta. Em 26/10 ela foi substituída por diálogo próprio (US23); conclusão, avaliação/perfil público e cancelamento foram retomados e aprovados pela interface, com liberação/reembolso também conferidos pela API. As demais pendências continuam discriminadas no relatório.


### Complemento de 26/10/2026 — pagamentos e fluxos pendentes

Checkout da US13 apresenta resumo antes da confirmação e mantém comprovante após liberação/reembolso. Cartão e PIX simulados, carteira antes/depois, desistência, dashboard do solicitante, notificação/navegação, persistência de preferências, edição de perfil com restauração, cadastros dos dois perfis e suspensão/reativação de conta fictícia foram exercitados pela interface. Denúncia fictícia resolvida por admin; detalhes de terceiros permanecem somente leitura. Consulte a matriz datada em `VERIFICACAO_FLUXOS.md` para passos, valores e limites. Conferência de largura em 14 páginas a 390px, administração a 390px e checkout a 320px. Resultado técnico: 200 testes e build aprovados. A simulação acadêmica não realiza pagamentos reais.


## US40 — Documentos e atendimento de privacidade (26/10/2026)

Implementada nesta branch separada: documentos públicos e por versão, contato responsável autorizado, links globais/cadastro, dois sinais distintos, validação das versões no backend, registro com data do servidor sem aceite retroativo, central do titular e atendimento administrativo paginado com resposta única. Perfil distingue desativação de exclusão. Jira: TCC-53, épico TCC-3.

Validação nesta branch: 13 suítes e 238 testes aprovados, build frontend aprovado, migration e seed aplicados. Documentos, protocolo/resposta e versões legadas conferidos na interface; layout em 390px. Detalhes, limites e fontes oficiais em `docs/PRIVACIDADE.md`. A implementação de documentos e canal não é certificação de conformidade integral, nem acrescenta exclusão automática ou proteção individual aos links de arquivos.

US37–US39 e alterações visuais em andamento na pasta principal não foram incorporadas nem alteradas por esta etapa. A numeração US40 foi reservada após conferir esse backlog paralelo.
