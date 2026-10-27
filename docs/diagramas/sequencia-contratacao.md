# Diagrama de Sequência — Contratação de um serviço

Gerado em 26/10/2026 a partir do código atual:

- `oportunidadeService.enviarProposta`, `solicitacaoService.renegociarProposta` e `oportunidadeService.responderContraproposta`;
- `solicitacaoService.atualizarStatusProposta`, `simularPagamentoCustodia` e `concluir`;
- `avaliacaoService.avaliar`.

O fluxo vai do envio da proposta até a avaliação do prestador (US10, US12, US13, US17, US18, US34 e US35).

**Como as requisições são processadas:**

- Toda requisição passa pelo `authMiddleware`, que valida o JWT e recusa contas desativadas, e depois pelo controller.
- Cada etapa que altera dados roda numa transação do Sequelize e bloqueia a linha da solicitação com `SELECT ... FOR UPDATE` antes das linhas dependentes. Isso evita condições de corrida, por exemplo dois aceites simultâneos.
- As notificações são gravadas na mesma transação, mas o aviso por Socket.io só é emitido depois do commit (`transaction.afterCommit`). Assim, ninguém é avisado de algo que acabou desfeito.
- As notificações respeitam as preferências de cada usuário (US30).

## 1. Proposta e negociação

```mermaid
sequenceDiagram
    autonumber
    actor P as Prestador
    actor S as Solicitante
    participant F as Frontend (Next.js)
    participant API as API Express<br/>(authMiddleware + Controller)
    participant SV as Service
    participant DB as MySQL
    participant WS as Socket.io

    P->>F: Preenche valor, prazo, validade e mensagem
    F->>API: POST /prestador/oportunidades/{id}/propostas (JWT)
    API->>SV: oportunidadeService.enviarProposta()
    SV->>SV: Valida valor, prazo (1 a 3650 dias) e validade (1 a 365 dias)
    SV->>DB: BEGIN, SELECT solicitação ABERTA ou EM_NEGOCIACAO FOR UPDATE
    alt solicitação já contratada, concluída ou cancelada
        SV-->>API: HttpError 409
        API-->>F: 409 "A oportunidade não aceita mais propostas"
    else prestador é o dono ou já enviou proposta
        SV-->>API: HttpError 403 ou 409
        API-->>F: Erro exibido ao prestador
    else proposta válida
        SV->>DB: INSERT proposta (status ENVIADA)
        SV->>DB: UPDATE solicitação SET status = EM_NEGOCIACAO
        SV->>DB: INSERT notificação "Nova proposta recebida"
        SV->>DB: COMMIT
        SV-)WS: afterCommit: emitirParaUsuario(solicitante, nova-notificacao)
        WS-)S: Notificação em tempo real
        API-->>F: 201 Proposta enviada
    end

    opt Negociação antes do aceite (US34 e US35)
        S->>F: Conversa no chat privado da proposta
        F->>API: POST /propostas/{propostaId}/mensagens
        API-->>F: 201 Mensagem gravada e entregue por Socket.io
        S->>F: Envia contraproposta com novo valor
        F->>API: POST /solicitacoes/minhas/{id}/propostas/{propostaId}/renegociar
        API->>SV: solicitacaoService.renegociarProposta()
        SV->>DB: UPDATE proposta: EM_ANALISE e contraproposta_status PENDENTE
        API-->>F: 200 Contraproposta registrada
        P->>F: Aceita ou recusa o valor proposto
        F->>API: POST /prestador/oportunidades/{id}/propostas/{propostaId}/contraproposta/responder
        API->>SV: oportunidadeService.responderContraproposta()
        SV->>DB: UPDATE proposta: volta a ENVIADA, contraproposta ACEITA (valor passa a ser o negociado) ou RECUSADA (mantém o valor)
        API-->>F: 200 Resposta registrada
    end
```

## 2. Aceite, pagamento, conclusão e avaliação

```mermaid
sequenceDiagram
    autonumber
    actor S as Solicitante
    actor P as Prestador
    participant F as Frontend (Next.js)
    participant API as API Express<br/>(authMiddleware + Controller)
    participant SV as Service
    participant DB as MySQL
    participant WS as Socket.io

    S->>F: Compara as propostas e escolhe uma
    F->>API: PATCH /solicitacoes/minhas/{id}/propostas/{propostaId}/status { acao: ACEITAR }
    API->>SV: solicitacaoService.atualizarStatusProposta()
    SV->>DB: BEGIN, SELECT solicitação do solicitante FOR UPDATE
    SV->>DB: SELECT proposta FOR UPDATE
    alt proposta vencida, contraproposta pendente ou já existe proposta ACEITA
        SV-->>API: HttpError 409
        API-->>F: 409 com o motivo
    else aceite válido
        SV->>DB: UPDATE proposta escolhida SET status = ACEITA
        SV->>DB: UPDATE demais propostas ativas SET status = RECUSADA
        SV->>DB: UPDATE solicitação SET status = CONTRATADA
        SV->>DB: INSERT notificações (aceita e recusadas)
        SV->>DB: COMMIT
        SV-)WS: afterCommit: avisa o contratado e os concorrentes
        WS-)P: "Proposta aceita!"
        API-->>F: 200 Proposta aceita
    end

    Note over S,DB: Pagamento simulado em custódia (US13), obrigatório antes da conclusão (US17)
    S->>F: Confirma o checkout (cartão ou PIX de teste)
    F->>API: POST /solicitacoes/{id}/custodia/simular { metodo_pagamento }
    API->>SV: solicitacaoService.simularPagamentoCustodia()
    SV->>DB: BEGIN, SELECT solicitação CONTRATADA FOR UPDATE
    SV->>DB: SELECT proposta ACEITA e custódia existente FOR UPDATE
    alt custódia já RETIDA para esta proposta
        SV-->>API: Retorna a custódia existente (idempotente)
    else nenhuma custódia ou custódia REEMBOLSADA
        SV->>DB: INSERT ou UPDATE transacao_custodia (RETIDO, valor da proposta)
        SV->>DB: COMMIT
    end
    API-->>F: 200 Comprovante simulado

    alt Desfazer antes da conclusão (US31 e US34)
        S->>F: Cancela a contratação, ou o prestador desiste
        F->>API: PATCH /solicitacoes/{id}/cancelar-contratacao ou /prestador/oportunidades/{id}/desistir
        API->>SV: cancelarContratacao() ou desistirContratacao()
        SV->>DB: custódia REEMBOLSADO, proposta RECUSADA, solicitação EM_NEGOCIACAO
        API-->>F: 200 Solicitação reaberta para novas propostas
    else Serviço realizado (US17)
        S->>F: Confirma que o serviço foi concluído (o prestador também pode)
        F->>API: PATCH /solicitacoes/{id}/concluir
        API->>SV: solicitacaoService.concluir()
        SV->>DB: BEGIN, SELECT solicitação CONTRATADA e proposta ACEITA FOR UPDATE
        SV->>SV: Confere se o usuário é o solicitante ou o prestador contratado
        SV->>DB: SELECT custódia da solicitação FOR UPDATE
        alt sem custódia RETIDO para a proposta aceita
            SV-->>API: HttpError 409, ROLLBACK
            API-->>F: 409 "O pagamento simulado ainda não foi confirmado"
            Note over F: As duas telas já deixam o botão desabilitado enquanto não há pagamento retido
        else custódia RETIDO
            SV->>DB: UPDATE solicitação SET status = CONCLUIDA
            SV->>DB: UPDATE custódia SET status_pagamento = LIBERADO, liberado_em = agora
            SV->>DB: INSERT notificação "Serviço concluído", COMMIT
            SV-)WS: afterCommit: avisa a outra parte
            WS-)P: "Serviço concluído"
            API-->>F: 200 Serviço concluído

            S->>F: Dá nota de 1 a 5 e comentário
            F->>API: POST /solicitacoes/{id}/avaliar { nota, comentario }
            API->>SV: avaliacaoService.avaliar()
            SV->>DB: BEGIN, SELECT solicitação CONCLUIDA FOR UPDATE
            SV->>DB: Confere que ainda não há avaliação, SELECT perfil do prestador FOR UPDATE
            SV->>DB: INSERT avaliação
            SV->>DB: Recalcula média e total, UPDATE prestadores_perfil, COMMIT
            API-->>F: 201 Avaliação registrada, reputação atualizada no perfil público
        end
    end
```

## Estados percorridos

| Etapa | Solicitação | Proposta escolhida | Custódia |
|---|---|---|---|
| Publicação | `ABERTA` | — | — |
| Primeira proposta | `EM_NEGOCIACAO` | `ENVIADA` | — |
| Contraproposta | `EM_NEGOCIACAO` | `EM_ANALISE` | — |
| Resposta do prestador | `EM_NEGOCIACAO` | `ENVIADA` (com o valor negociado, se aceito) | — |
| Aceite | `CONTRATADA` | `ACEITA` (as demais ficam `RECUSADA`) | — |
| Pagamento simulado | `CONTRATADA` | `ACEITA` | `RETIDO` |
| Cancelamento ou desistência | `EM_NEGOCIACAO` | `RECUSADA` | `REEMBOLSADO` |
| Conclusão | `CONCLUIDA` | `ACEITA` | `LIBERADO` |

## Regra: pagamento antes da conclusão

Desde 26/10/2026, um critério da US17 (Jira TCC-25) exige que o pagamento simulado esteja retido antes da conclusão. Antes disso, era possível concluir sem pagar, como registrava o `Notas.md`.

- **API:** `solicitacaoService.concluir()` recusa a conclusão com 409 quando a custódia da proposta aceita não está `RETIDO`. Isso vale também quando só existe a custódia já reembolsada de uma contratação anterior.
- **Telas:** em `minhas-solicitacoes/[id]` e `oportunidades/[id]`, o botão de conclusão fica desabilitado até o pagamento ser confirmado, com uma explicação ligada a ele por `aria-describedby`.
- **Prestador:** para mostrar a explicação, o detalhe da oportunidade passou a devolver `pagamento_contratacao`, preenchido só para o prestador contratado.

Por isso, na tabela acima, a etapa de pagamento sempre antecede a conclusão.
