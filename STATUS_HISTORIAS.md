# Conferência das histórias de usuário

Data: 25/10/2026. Referência inicial: commit `3dadf09`.

A conferência compara o backlog com as rotas, regras de negócio e telas. “Implementada” indica presença da funcionalidade e dos critérios no código; a coluna de evidências distingue os testes automatizados das conferências manuais. Os textos, prioridades e números das histórias existentes foram preservados. As descrições das 34 histórias foram sincronizadas no Jira pelo script do projeto.

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
| US08 | Feed de Oportunidades de Serviços para Prestadores | Implementada | Feed público de solicitações ABERTA com filtros; acesso público preservado. |
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
| US24 | Documentação Interativa da API (Swagger / OpenAPI) | Implementada | 45 operações documentadas com contratos de entrada/saída/erros, autenticação e referências resolvidas em src/dist. |
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

## Alcance da validação

- Integração usa banco MySQL separado e cobre fluxos críticos com concorrência, privacidade, valores e rollback; não implica cobertura de todas as combinações de entrada possíveis.
- A carteira é uma simulação acadêmica baseada em custódias, sem integração financeira real.
- A conferência manual de celular incluiu as novas telas e o formulário em etapas; avaliação de usabilidade com usuários e testes em dispositivos físicos continuam úteis para a apresentação.
- O limite de login utiliza armazenamento em memória por processo. Uma implantação com várias instâncias precisaria de armazenamento compartilhado.
- A auditoria de dependências do backend ficou com dois avisos moderados ligados a `uuid` transitivo do Sequelize. A atualização automática proposta faria downgrade incompatível do ORM; essa troca não foi aplicada.

Validação final: **11 suítes e 193 testes aprovados**, além do build de produção do frontend e verificação do diff.
