# Diagrama de Casos de Uso — Eloserv

Gerado a partir do código em 26/10/2026: rotas em `backend/src/routes`, regras de permissão nos controllers e services e telas em `frontend/src/app`.

O Mermaid não tem notação própria de casos de uso. Por isso, os diagramas usam fluxogramas com a seguinte convenção:

| Elemento UML | Representação aqui |
|---|---|
| Ator | retângulo com a classe `ator` |
| Caso de uso | forma arredondada `([ ... ])` |
| Fronteira do sistema | `subgraph` com o nome do módulo |
| Associação ator–caso de uso | linha contínua `---` |
| Generalização entre atores | seta grossa `==>` com o rótulo "é um" |
| `«include»` / `«extend»` | seta tracejada com o estereótipo no rótulo |

## 1. Atores e generalização

O prestador também pode publicar solicitações (US33), por isso herda os casos de uso do solicitante. Todo usuário autenticado também pode fazer o que o visitante faz.

```mermaid
flowchart BT
    Visitante[Visitante]
    Usuario[Usuário autenticado]
    Solicitante[Solicitante]
    Prestador[Prestador]
    Admin[Administrador]

    Usuario ==>|é um| Visitante
    Solicitante ==>|é um| Usuario
    Admin ==>|é um| Usuario
    Prestador ==>|é um| Solicitante

    classDef ator fill:#ffffff,stroke:#1f2937,stroke-width:2px,color:#111827
    class Visitante,Usuario,Solicitante,Prestador,Admin ator
```

## 2. Acesso, conta e privacidade

```mermaid
flowchart LR
    Visitante[Visitante]
    Usuario[Usuário autenticado]

    subgraph Conta["Eloserv — Acesso, conta e privacidade"]
        UC01([UC01 Cadastrar-se como solicitante])
        UC02([UC02 Cadastrar-se como prestador])
        UC03([UC03 Entrar no sistema])
        UC09([UC09 Consultar Termos de Uso e Política de Privacidade])
        UC10([UC10 Consultar oportunidades abertas])
        UC11([UC11 Ver perfil público do prestador])
        UC04([UC04 Gerenciar perfil e foto])
        UC05([UC05 Trocar senha])
        UC06([UC06 Desativar a própria conta])
        UC07([UC07 Configurar notificações])
        UC32([UC32 Receber notificações em tempo real])
        UC08([UC08 Exercer direitos LGPD na Central de Privacidade])
        ACEITE([Aceitar Termos e Política])
    end

    Visitante --- UC01
    Visitante --- UC02
    Visitante --- UC03
    Visitante --- UC09
    Visitante --- UC10
    Visitante --- UC11
    Usuario --- UC04
    Usuario --- UC05
    Usuario --- UC06
    Usuario --- UC07
    Usuario --- UC32
    Usuario --- UC08

    UC01 -.->|«include»| ACEITE
    UC02 -.->|«include»| ACEITE

    classDef ator fill:#ffffff,stroke:#1f2937,stroke-width:2px,color:#111827
    class Visitante,Usuario ator
```

## 3. Solicitante

```mermaid
flowchart LR
    Solicitante[Solicitante]

    subgraph Pedido["Eloserv — Solicitações e contratação"]
        UC12([UC12 Publicar solicitação com anexos])
        UC13([UC13 Acompanhar minhas solicitações])
        UC14([UC14 Comparar propostas recebidas])
        UC15([UC15 Enviar contraproposta])
        UC16([UC16 Aceitar ou recusar proposta])
        UC17([UC17 Simular pagamento em custódia])
        UC18([UC18 Cancelar solicitação])
        UC19([UC19 Cancelar contratação])
        UC20([UC20 Responder pergunta pública])
        UC21([UC21 Avaliar o prestador])
        UC22([UC22 Ver dashboard do solicitante])
        UC30([UC30 Confirmar conclusão do serviço])
    end

    Solicitante --- UC12
    Solicitante --- UC13
    Solicitante --- UC14
    Solicitante --- UC15
    Solicitante --- UC16
    Solicitante --- UC18
    Solicitante --- UC19
    Solicitante --- UC20
    Solicitante --- UC22
    Solicitante --- UC30

    UC17 -.->|«extend»| UC16
    UC21 -.->|«extend»| UC30

    classDef ator fill:#ffffff,stroke:#1f2937,stroke-width:2px,color:#111827
    class Solicitante ator
```

## 4. Prestador

```mermaid
flowchart LR
    Prestador[Prestador]

    subgraph Oferta["Eloserv — Oportunidades e propostas"]
        UC23([UC23 Fazer pergunta pública na oportunidade])
        UC24([UC24 Enviar proposta])
        UC25([UC25 Responder contraproposta])
        UC26([UC26 Acompanhar minhas propostas])
        UC27([UC27 Desistir da contratação])
        UC28([UC28 Ver dashboard do prestador])
        UC30([UC30 Confirmar conclusão do serviço])
    end

    Prestador --- UC23
    Prestador --- UC24
    Prestador --- UC25
    Prestador --- UC26
    Prestador --- UC27
    Prestador --- UC28
    Prestador --- UC30

    classDef ator fill:#ffffff,stroke:#1f2937,stroke-width:2px,color:#111827
    class Prestador ator
```

## 5. Interação entre as partes

O chat e a denúncia só ficam disponíveis para quem participa da solicitação: o solicitante dono e os prestadores que enviaram proposta.

```mermaid
flowchart LR
    Solicitante[Solicitante]
    Prestador[Prestador]

    subgraph Interacao["Eloserv — Interação"]
        UC29([UC29 Conversar no chat privado da proposta])
        ANEXO([Enviar imagem ou PDF no chat])
        UC31([UC31 Denunciar solicitação])
        UC30([UC30 Confirmar conclusão do serviço])
    end

    Solicitante --- UC29
    Prestador --- UC29
    Solicitante --- UC31
    Prestador --- UC31
    Solicitante --- UC30
    Prestador --- UC30
    ANEXO -.->|«extend»| UC29

    classDef ator fill:#ffffff,stroke:#1f2937,stroke-width:2px,color:#111827
    class Solicitante,Prestador ator
```

## 6. Administrador

```mermaid
flowchart LR
    Admin[Administrador]

    subgraph Administracao["Eloserv — Administração"]
        UC33([UC33 Ativar ou desativar usuários])
        UC34([UC34 Consultar solicitações da plataforma])
        UC35([UC35 Moderar denúncias])
        UC36([UC36 Responder pedidos de privacidade])
        HIST([Registrar ação no histórico administrativo])
    end

    Admin --- UC33
    Admin --- UC34
    Admin --- UC35
    Admin --- UC36
    UC33 -.->|«include»| HIST
    UC35 -.->|«include»| HIST

    classDef ator fill:#ffffff,stroke:#1f2937,stroke-width:2px,color:#111827
    class Admin ator
```

## 7. Rastreabilidade: caso de uso → história → endpoint

Os caminhos são relativos a `/api/v1`.

| Caso de uso | Ator principal | História | Endpoint principal |
|---|---|---|---|
| UC01 Cadastrar-se como solicitante | Visitante | US01, US40 | `POST /auth/register/solicitante` |
| UC02 Cadastrar-se como prestador | Visitante | US02, US40 | `POST /auth/register/prestador` |
| UC03 Entrar no sistema | Visitante | US03, US22 | `POST /auth/login` |
| UC04 Gerenciar perfil e foto | Usuário autenticado | US04 | `GET/PUT /perfil`, `POST /perfil/foto` |
| UC05 Trocar senha | Usuário autenticado | US04 | `PUT /perfil/senha` |
| UC06 Desativar a própria conta | Usuário autenticado | US04 | `DELETE /perfil` |
| UC07 Configurar notificações | Usuário autenticado | US30 | `GET/PUT /perfil/preferencias-notificacao` |
| UC08 Exercer direitos LGPD | Usuário autenticado | US40 | `GET /privacidade/minha-central`, `POST /privacidade/solicitacoes` |
| UC09 Consultar Termos e Política | Visitante | US40 | `GET /legal/documentos` |
| UC10 Consultar oportunidades abertas | Visitante | US08, US36 | `GET /prestador/oportunidades` |
| UC11 Ver perfil público do prestador | Visitante | US19 | `GET /prestadores/{id}/perfil-publico` |
| UC12 Publicar solicitação com anexos | Solicitante | US05 | `POST /solicitacoes` |
| UC13 Acompanhar minhas solicitações | Solicitante | US06 | `GET /solicitacoes/minhas` |
| UC14 Comparar propostas recebidas | Solicitante | US11 | `GET /solicitacoes/minhas/{id}/propostas` |
| UC15 Enviar contraproposta | Solicitante | US34, US35 | `POST /solicitacoes/minhas/{id}/propostas/{propostaId}/renegociar` |
| UC16 Aceitar ou recusar proposta | Solicitante | US12 | `PATCH /solicitacoes/minhas/{id}/propostas/{propostaId}/status` |
| UC17 Simular pagamento em custódia | Solicitante | US13 | `POST /solicitacoes/{id}/custodia/simular` |
| UC18 Cancelar solicitação | Solicitante | US07 | `PATCH /solicitacoes/{id}/cancelar` |
| UC19 Cancelar contratação | Solicitante | US34 | `PATCH /solicitacoes/{id}/cancelar-contratacao` |
| UC20 Responder pergunta pública | Solicitante | US29 | `PATCH /solicitacoes/{id}/perguntas/{perguntaId}/responder` |
| UC21 Avaliar o prestador | Solicitante | US18 | `POST /solicitacoes/{id}/avaliar` |
| UC22 Ver dashboard do solicitante | Solicitante | US20 | `GET /dashboards/solicitante` |
| UC23 Fazer pergunta pública | Prestador | US29 | `POST /solicitacoes/{id}/perguntas` |
| UC24 Enviar proposta | Prestador | US10 | `POST /prestador/oportunidades/{id}/propostas` |
| UC25 Responder contraproposta | Prestador | US35 | `POST /prestador/oportunidades/{id}/propostas/{propostaId}/contraproposta/responder` |
| UC26 Acompanhar minhas propostas | Prestador | US28 | `GET /prestador/propostas` |
| UC27 Desistir da contratação | Prestador | US31 | `PATCH /prestador/oportunidades/{id}/desistir` |
| UC28 Ver dashboard do prestador | Prestador | US21 | `GET /dashboards/prestador` |
| UC29 Conversar no chat da proposta | Solicitante e prestador | US14, US15, US34 | `GET/POST /propostas/{propostaId}/mensagens` |
| UC30 Confirmar conclusão do serviço | Solicitante e prestador | US17 | `PATCH /solicitacoes/{id}/concluir` |
| UC31 Denunciar solicitação | Solicitante e prestador | US32 | `POST /solicitacoes/{id}/denunciar` |
| UC32 Receber notificações | Usuário autenticado | US16 | `GET /notificacoes` e evento Socket.io `nova-notificacao` |
| UC33 Ativar ou desativar usuários | Administrador | US27 | `PATCH /admin/usuarios/{id}/status` |
| UC34 Consultar solicitações | Administrador | US27 | `GET /admin/solicitacoes` |
| UC35 Moderar denúncias | Administrador | US27, US32 | `GET /admin/denuncias`, `PATCH /admin/denuncias/{id}/resolver` |
| UC36 Responder pedidos de privacidade | Administrador | US40 | `GET /admin/privacidade`, `PATCH /admin/privacidade/{id}/resposta` |

**Observações sobre o código atual:**

- No backend, as rotas de prestador (enviar proposta, perguntar e o dashboard de prestador) aceitam os perfis `PRESTADOR` e `ADMIN`. O diagrama mostra só o prestador porque as telas do administrador não oferecem essas ações.
- O UC17 aparece como `«extend»` do aceite (UC16) porque o pagamento é feito num passo separado, depois da contratação. Ele é **pré-condição** do UC30: desde 26/10/2026 (critério da US17), a conclusão só é aceita com o pagamento simulado retido em custódia. Veja a regra no [diagrama de sequência](sequencia-contratacao.md).
