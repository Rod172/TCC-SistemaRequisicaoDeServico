# Verificação dos fluxos nas páginas

Data: 25/10/2026. Branch: `historias-pendentes`.

## Resultado

Foram encontrados problemas reais durante o uso das páginas e corrigidos nesta etapa. A cobertura automatizada complementa a conferência visual; não substitui a homologação manual de todas as combinações de tela, perfil e estado.

## Percurso executado na interface

Foram utilizadas exclusivamente contas de demonstração e uma solicitação fictícia intitulada **Verificação UI 2510 — Instalação de tomada** (`a892e83e-0eb3-4ebe-a3d1-ec5d8ee68ed5`). Esse registro foi mantido para permitir a revisão do resultado, sem alterar solicitações anteriores do usuário.

| Etapa | Evidência observada | Resultado |
|---|---|---|
| Publicação | Solicitante percorreu as três etapas, anexou PNG e publicou; detalhe mostrou dados e estado ABERTA. | Aprovada na interface |
| Descoberta | Prestador abriu o detalhe pela listagem. Após a primeira proposta, outro prestador encontrou a mesma solicitação em negociação pela busca. | Aprovada após correção US36 |
| Perguntas públicas | Prestador perguntou; solicitante respondeu; resposta apareceu para o prestador. | Aprovada na interface |
| Propostas | Dois prestadores enviaram R$ 240 e R$ 260; comparação exibiu preço, prazo, validade, reputação, bio e categoria. | Aprovada após correção da data e atualização do estado |
| Chat antes do aceite | Mensagens nos dois sentidos e imagem chegaram na conversa lateral. Concorrente abriu a própria conversa sem acessar mensagens do outro prestador. | Aprovada na interface |
| Contraproposta | Solicitante ofereceu R$ 220. Prestador visualizou valor/mensagem e aceitou. Solicitante viu o valor atualizado antes da contratação. | Aprovada após implementação US35 |
| Aceite | A proposta de R$ 220 ficou ACEITA; concorrente ficou RECUSADA; solicitação CONTRATADA e checkout apareceu. | Aprovada na interface |
| Pagamento acadêmico | PIX de teste reteve R$ 220 em custódia, com referência simulada. | Aprovada na interface |
| Conversa recusada | Concorrente abriu “Ver conversa”; apareceu aviso de somente leitura e nenhum campo de envio. | Aprovada após correção |
| Conclusão | Ferramenta de navegação travou na confirmação nativa. A mesma solicitação foi concluída pela API (HTTP 200); página recarregada exibiu CONCLUÍDA e avaliação disponível. | API e apresentação aprovadas; confirmação pela interface pendente |
| Avaliação | Formulário e controles acessíveis presentes após conclusão. A interação não pôde ser concluída após o travamento da confirmação do navegador. | Envio pela interface pendente; regra coberta por integração |

## Correções entregues

- **US35 / TCC-47:** resposta explícita do prestador à contraproposta, persistência da situação/data, autorização, validade, resposta única, notificação e bloqueio da contratação enquanto pendente. Aceitar negociação não contrata automaticamente.
- **US36 / TCC-48:** feed, filtros e vitrine incluem ABERTA e EM_NEGOCIACAO; cards exibem o estado correto. Estados contratados e finais ficam fora da descoberta.
- Recarregamento após envio de proposta evita `Invalid Date` e estado visual desatualizado.
- Chat recusado/cancelado informa somente leitura; backend impede novos envios, inclusive com acesso direto à rota.
- Rótulos acessíveis no sino, preferências, envio/anexo do chat e estrelas da avaliação.
- Texto da contraproposta já contratada deixa de pedir confirmação de contratação novamente.

As histórias novas foram documentadas e importadas antes da implementação. Os critérios antigos foram preservados; US35 e US36 complementam o comportamento anterior.

## Validação automatizada

- **11 suítes, 199 testes aprovados**, com Jest/Supertest e MySQL isolado `tcc_servico_facil_test`.
- Regressões novas: descoberta em negociação, exclusão após contratação, contraproposta pendente/aceita/recusada/expirada, autorização, repetição, valor da custódia e conversa recusada somente leitura.
- A suíte existente também cobre autenticação/cadastro, documentos, isolamento por usuário, concorrência de aceites, cancelamento, desistência, reembolso/recontratação, conclusão, avaliação/reputação, dashboards, privacidade do perfil público, moderação, auditoria, seeds e contratos OpenAPI.
- Build de produção do frontend e checagem TypeScript executados nesta revisão. Resultado detalhado registrado no log de desenvolvimento.

## O que ainda precisa de homologação manual

A ferramenta de navegação ficou bloqueada após uma confirmação nativa e deixou de concluir interações nas abas. As tentativas de recuperar a aba não resolveram o bloqueio. Isso limita esta verificação; não constitui evidência de erro da regra de conclusão, que passou pela API e pela integração.

Ainda não foram aprovados integralmente pela interface nesta etapa: avaliação enviada e refletida no perfil público; atualização da carteira e dashboards após conclusão; cancelamento/reembolso e desistência; cadastro e edição de perfil; moderação e denúncias com administrador; persistência das preferências/notificações; uso completo de todos esses caminhos em celular. Existem testes automatizados e implementações desses recursos, mas não se deve chamar essa cobertura de homologação visual completa.

Para repetir o ponto interrompido: entrar como Solicitante demo, abrir a solicitação fictícia concluída, selecionar a nota e enviar a avaliação; depois conferir o perfil público e o painel do Prestador (Elétrica). Para testar a confirmação nativa desde o início, publicar outra solicitação fictícia, aceitar e pagar uma proposta simulada e usar “Marcar como concluído”.
