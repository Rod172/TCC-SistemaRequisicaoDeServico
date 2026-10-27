# Diagrama de Classes — Eloserv

Gerado a partir do código em 26/10/2026:

- classes de domínio: models Sequelize em `backend/src/models/*.ts`;
- associações: `backend/src/models/index.ts`;
- serviços: `backend/src/services` e `backend/src/controllers`.

Os campos `created_at` e `updated_at`, presentes em todas as classes exceto `RegistroAdministrativo`, foram omitidos para deixar o diagrama legível.

## 1. Modelo de domínio

```mermaid
classDiagram
    direction LR

    class Usuario {
        +id: UUID
        +nome: string
        +email: string
        +cpf: string
        +telefone: string
        +endereco: string [0..1]
        +foto_url: string [0..1]
        -senha_hash: string
        +tipo_perfil: TipoPerfil
        +termo_lgpd_aceito: boolean
        +termo_lgpd_aceito_em: Date [0..1]
        +termos_uso_versao: string [0..1]
        +privacidade_versao: string [0..1]
        +documentos_aceitos_em: Date [0..1]
        +ativo: boolean
        +status_alterado_por: UUID [0..1]
        +status_alterado_em: Date [0..1]
    }

    class PrestadorPerfil {
        +id: UUID
        +cnpj_cpf: string
        +descricao_bio: string [0..1]
        +categorias: string[]
        +nota_media_reputacao: decimal
        +total_avaliacoes: int
    }

    class Solicitacao {
        +id: UUID
        +titulo: string
        +descricao: string
        +categoria: string [0..1]
        +cidade: string [0..1]
        +bairro: string [0..1]
        +orcamento_cliente: decimal [0..1]
        +prazo_desejado_dias: int [0..1]
        +status: StatusSolicitacao
        +motivo_cancelamento: string [0..1]
        +cancelada_em: Date [0..1]
    }

    class AnexoSolicitacao {
        +id: UUID
        +url_arquivo: string
        +nome_original: string
    }

    class Proposta {
        +id: UUID
        +valor: decimal
        +prazo_dias: int
        +validade_ate: Date
        +mensagem: string
        +status: StatusProposta
        +valor_contraproposta: decimal [0..1]
        +mensagem_contraproposta: string [0..1]
        +contraproposta_em: Date [0..1]
        +contraproposta_status: StatusContraproposta [0..1]
        +contraproposta_respondida_em: Date [0..1]
    }

    class TransacaoCustodia {
        +id: UUID
        +valor: decimal
        +status_pagamento: StatusPagamento
        +metodo_pagamento: MetodoPagamento
        +referencia_simulada: string
        +retido_em: Date
        +liberado_em: Date [0..1]
    }

    class MensagemChat {
        +id: UUID
        +conteudo: string [0..1]
        +anexo_url: string [0..1]
        +anexo_nome_original: string [0..1]
        +lida: boolean
    }

    class PerguntaSolicitacao {
        +id: UUID
        +pergunta: string
        +resposta: string [0..1]
        +respondida_em: Date [0..1]
    }

    class Avaliacao {
        +id: UUID
        +nota: int
        +comentario: string [0..1]
    }

    class Denuncia {
        +id: UUID
        +motivo: string
        +status: StatusDenuncia
    }

    class Notificacao {
        +id: UUID
        +titulo: string
        +mensagem: string
        +link_redirecionamento: string [0..1]
        +lida: boolean
    }

    class PreferenciaNotificacao {
        +id: UUID
        +tipo_evento: TipoEventoNotificacao
        +ativo: boolean
    }

    class RegistroAdministrativo {
        +id: UUID
        +acao: AcaoAdministrativa
        +ocorrido_em: Date
        +estado_anterior: JSON
        +estado_posterior: JSON
    }

    class SolicitacaoPrivacidade {
        +id: UUID
        +tipo: TipoPedidoPrivacidade
        +descricao: string
        +status: StatusPedidoPrivacidade
        +resposta: string [0..1]
        +respondida_em: Date [0..1]
    }

    Usuario "1" *-- "0..1" PrestadorPerfil : possui
    Usuario "1" --> "0..*" Solicitacao : publica
    Solicitacao "1" *-- "0..*" AnexoSolicitacao : contém
    Solicitacao "1" *-- "0..*" Proposta : recebe
    Usuario "1" --> "0..*" Proposta : envia como prestador
    Solicitacao "1" -- "0..1" TransacaoCustodia : garante
    Proposta "1" -- "0..1" TransacaoCustodia : paga
    Proposta "0..1" *-- "0..*" MensagemChat : conversa
    Solicitacao "1" *-- "0..*" MensagemChat : contexto
    Usuario "1" --> "0..*" MensagemChat : emite
    Solicitacao "1" *-- "0..*" PerguntaSolicitacao : recebe
    Usuario "1" --> "0..*" PerguntaSolicitacao : pergunta como prestador
    Solicitacao "1" *-- "0..1" Avaliacao : avaliada em
    Usuario "1" --> "0..*" Avaliacao : avalia como solicitante
    Usuario "1" --> "0..*" Avaliacao : recebe como prestador
    Solicitacao "1" *-- "0..*" Denuncia : alvo de
    Usuario "1" --> "0..*" Denuncia : denuncia
    Usuario "1" *-- "0..*" Notificacao : recebe
    Usuario "1" *-- "0..4" PreferenciaNotificacao : configura
    Usuario "1" --> "0..*" RegistroAdministrativo : registra como admin
    Usuario "0..1" <-- "0..*" RegistroAdministrativo : afeta
    Denuncia "0..1" <-- "0..*" RegistroAdministrativo : resolve
    Usuario "1" *-- "0..*" SolicitacaoPrivacidade : abre
    Usuario "0..1" <-- "0..*" SolicitacaoPrivacidade : respondida por
```

**Como ler:**

- `*--` (losango cheio) é **composição**: a parte não existe sem o todo, e o banco apaga em cascata (`ON DELETE CASCADE`). Por exemplo, apagar uma solicitação apaga seus anexos, propostas e mensagens.
- `-->` é **associação dirigida**: a classe de origem é referenciada pela chave estrangeira do destino.
- `PrestadorPerfil` só existe para usuários com `tipo_perfil = PRESTADOR`. A plataforma é bilateral: o mesmo `Usuario` pode publicar solicitações e, se for prestador, também enviar propostas para solicitações de outras pessoas (US33).
- `PreferenciaNotificacao` tem no máximo 4 registros por usuário, um por tipo de evento (índice único `usuario_id + tipo_evento`).
- `MensagemChat.proposta_id` é opcional por causa das conversas antigas, feitas por solicitação. Desde a US34, cada conversa pertence a uma proposta.

## 2. Enumerações

```mermaid
classDiagram
    direction LR

    class TipoPerfil {
        <<enumeration>>
        SOLICITANTE
        PRESTADOR
        ADMIN
    }
    class StatusSolicitacao {
        <<enumeration>>
        ABERTA
        EM_NEGOCIACAO
        CONTRATADA
        CONCLUIDA
        CANCELADA
    }
    class StatusProposta {
        <<enumeration>>
        ENVIADA
        EM_ANALISE
        ACEITA
        RECUSADA
    }
    class StatusContraproposta {
        <<enumeration>>
        PENDENTE
        ACEITA
        RECUSADA
    }
    class StatusPagamento {
        <<enumeration>>
        RETIDO
        LIBERADO
        REEMBOLSADO
    }
    class MetodoPagamento {
        <<enumeration>>
        CARTAO_TESTE
        PIX_TESTE
    }
    class StatusDenuncia {
        <<enumeration>>
        PENDENTE
        RESOLVIDA
    }
    class TipoEventoNotificacao {
        <<enumeration>>
        NOVA_PROPOSTA
        PROPOSTA_ACEITA_RECUSADA
        NOVA_MENSAGEM_CHAT
        SOLICITACAO_CANCELADA
    }
    class AcaoAdministrativa {
        <<enumeration>>
        ATIVAR_USUARIO
        DESATIVAR_USUARIO
        RESOLVER_DENUNCIA
    }
    class TipoPedidoPrivacidade {
        <<enumeration>>
        ACESSO
        CORRECAO
        EXCLUSAO
        INFORMACAO
        REVOGACAO
    }
    class StatusPedidoPrivacidade {
        <<enumeration>>
        PENDENTE
        RESPONDIDA
    }
```

## 3. Camadas do backend no fluxo de contratação

O backend segue a divisão `Routes → Middlewares → Controllers → Services → Models`. O diagrama abaixo mostra só as classes que participam da contratação. Os controllers validam a entrada HTTP e convertem erros (`HttpError`) em respostas; os services concentram as regras de negócio e as transações; os models fazem o mapeamento objeto-relacional com o Sequelize.

```mermaid
classDiagram
    direction TB

    class AuthMiddleware {
        <<middleware>>
        +authMiddleware(req, res, next) Promise
    }
    class OportunidadeController {
        <<controller>>
        +listarOportunidades(req, res)
        +enviarProposta(req, res)
        +responderContraproposta(req, res)
        +desistirContratacao(req, res)
    }
    class SolicitacaoController {
        <<controller>>
        +buscarComPropostas(req, res)
        +renegociarProposta(req, res)
        +atualizarStatusProposta(req, res)
        +simularPagamentoCustodia(req, res)
        +concluir(req, res)
        +cancelarContratacao(req, res)
    }
    class AvaliacaoController {
        <<controller>>
        +avaliar(req, res)
    }
    class OportunidadeService {
        <<service>>
        +listarOportunidades(filtros)
        +enviarProposta(oportunidadeId, prestadorId, dados)
        +responderContraproposta(solicitacaoId, propostaId, prestadorId, acao)
        +desistirContratacao(solicitacaoId, prestadorId, motivo)
    }
    class SolicitacaoService {
        <<service>>
        +buscarComPropostas(solicitanteId, solicitacaoId)
        +renegociarProposta(solicitanteId, solicitacaoId, propostaId, valor, mensagem)
        +atualizarStatusProposta(solicitanteId, solicitacaoId, propostaId, acao)
        +simularPagamentoCustodia(solicitanteId, solicitacaoId, metodo)
        +concluir(usuarioId, solicitacaoId)
        +cancelarContratacao(solicitanteId, solicitacaoId)
    }
    class AvaliacaoService {
        <<service>>
        +avaliar(solicitanteId, solicitacaoId, nota, comentario)
    }
    class PreferenciaNotificacaoService {
        <<service>>
        +estaAtivado(usuarioId, tipoEvento) boolean
        +filtrarAtivos(usuarioIds, tipoEvento) string[]
    }
    class ChatSocket {
        <<Socket.io>>
        +emitirParaUsuario(usuarioId, evento, dados) void
    }
    class HttpError {
        +status: number
        +message: string
    }

    AuthMiddleware ..> OportunidadeController : autentica antes
    AuthMiddleware ..> SolicitacaoController : autentica antes
    AuthMiddleware ..> AvaliacaoController : autentica antes
    OportunidadeController ..> OportunidadeService : usa
    SolicitacaoController ..> SolicitacaoService : usa
    AvaliacaoController ..> AvaliacaoService : usa
    OportunidadeService ..> PreferenciaNotificacaoService : consulta
    SolicitacaoService ..> PreferenciaNotificacaoService : consulta
    OportunidadeService ..> ChatSocket : notifica após commit
    SolicitacaoService ..> ChatSocket : notifica após commit
    OportunidadeService ..> HttpError : lança
    SolicitacaoService ..> HttpError : lança
    AvaliacaoService ..> HttpError : lança
    OportunidadeService ..> Proposta : cria
    SolicitacaoService ..> Proposta : atualiza
    SolicitacaoService ..> Solicitacao : atualiza
    SolicitacaoService ..> TransacaoCustodia : cria e atualiza
    AvaliacaoService ..> Avaliacao : cria
    AvaliacaoService ..> PrestadorPerfil : recalcula reputação
```

Os nomes dos métodos são os que existem nos arquivos. Os controllers estão resumidos às ações da contratação.
