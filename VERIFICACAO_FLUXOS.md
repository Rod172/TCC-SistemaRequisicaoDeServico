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


## Retomada em 26/10/2026 — Confirmação própria e desbloqueio da navegação

As cinco chamadas `window.confirm` foram substituídas por um diálogo da aplicação, compartilhado entre os detalhes do solicitante/prestador e a administração. A confirmação usa HTML `<dialog>` com conteúdo React, não uma caixa de confirmação nativa do navegador. O fluxo JavaScript permanece assíncrono e a decisão continua obrigatória antes de chamar a API.

As pendências de conclusão e avaliação descritas no relato de 25/10 foram retomadas com novos registros fictícios. Os dados até a contratação/custódia foram preparados pela API; as ações abaixo foram realizadas na interface:

- Serviço `02fc22ac-cc79-4818-bd5e-bd755e1a6ff7`: abrir confirmação, cancelar por Escape, conferir estado CONTRATADA e foco de volta no botão; abrir novamente e confirmar; conferir CONCLUIDA. Enviar nota 5 com comentário fictício; conferir “Sua avaliação” e comentário no perfil público, com duas avaliações e média 5,0. Consulta posterior da API confirmou custódia LIBERADO, R$ 120.
- Serviço `a54b199c-f84b-4891-a0b6-c90ca4873a25`: viewport 390 × 844, abrir cancelamento, voltar sem alterar, reabrir e confirmar. Página exibiu EM_NEGOCIACAO e proposta RECUSADA. Consulta posterior confirmou custódia REEMBOLSADO, R$ 120.
- Administração: abrir confirmação de desativação da conta demo e voltar sem alterar; nenhuma conta foi desativada. Corrigida a data de cadastro na tabela (`createdAt`, conforme retorno existente da API).
- Abertura do diálogo deixa o fundo inativo; opção “Voltar sem alterar” recebe foco inicial; Escape fecha sem efetivar ação; foco retorna ao controle de origem. Conferida apresentação do diálogo no celular.

Portanto, conclusão pelo solicitante, envio de avaliação, reflexo no perfil público e cancelamento de contratação pelo solicitante passaram pela interface nesta retomada. A liberação e o reembolso foram também conferidos pela API. Continuam pendentes a homologação completa da carteira/dashboard, desistência, cadastro/edição, moderação efetivada, notificações e todos esses caminhos em celular. O caminho de conclusão do prestador e os aceites/recusas passam pelo mesmo componente, mas não foram repetidos integralmente nesta retomada.

Não se deve interpretar o bloqueio histórico de 25/10 como bloqueio atual do diálogo: o percurso retomado acima funcionou sem travamento.


## Validação dos fluxos pendentes e pagamento — 26/10/2026

### Área de pagamento (US13)

O checkout fica no detalhe da solicitação, após a contratação. A conferência encontrou duas limitações de apresentação: faltava resumo explícito antes de confirmar e o comprovante desaparecia depois de concluir/cancelar. A seção **Pagamento e garantia** agora mostra o prestador e o valor contratado antes da confirmação, métodos de teste em grupo rotulado e comprovante persistente nos estados RETIDO, LIBERADO e REEMBOLSADO. Ela informa que não há cobrança real nem coleta de dados financeiros. Esse complemento está coberto pela US13, sem novo endpoint, integração financeira ou mudança da máquina de estados.

| Fluxo | Passos e resultado observados |
|---|---|
| Cartão simulado | Fixture `787fcd22-3b42-4573-b377-f9c3b0d66851`: resumo de R$ 120, voltar sem pagar, reabrir checkout e confirmar Cartão de teste. RETIDO com valor/método/referência corretos. |
| Conclusão e carteira | Conclusão pela confirmação própria na página; comprovante passou a LIBERADO. Painel do prestador antes/depois: saldo R$ 340 → R$ 460 e custódia R$ 620 → R$ 500. Diferença exata de R$ 120. |
| PIX e desistência | Fixture `8b4051fb-6ba0-4117-a1b5-f014e36c31f4`: pagamento PIX de teste, R$ 120 retidos. Prestador abriu desistência, informou motivo fictício e confirmou. Solicitação EM_NEGOCIACAO, proposta RECUSADA, comprovante REEMBOLSADO. Saldo do prestador continuou R$ 460 e custódia voltou a R$ 500. |
| Dashboard solicitante | Abriu com indicadores próprios (16 abertos, 11 propostas pendentes, 7 em andamento e 5 concluídos no conjunto demo existente após os testes), com links para as solicitações. O isolamento e os cálculos também são cobertos pela integração. |
| Notificação | Desistência apareceu no sino; clicar nela levou exatamente à solicitação testada, pela ação de leitura/navegação. |
| Preferências | “Nova proposta recebida” foi desativada, salva e recarregada: permaneceu desativada. Depois foi restaurada ao estado ativado original. Supressão de eventos continua coberta também pela integração. |
| Perfil | Endereço da conta demo foi alterado para texto fictício, salvo e conferido após reload. Depois foi restaurado. Rótulos dos campos agora associados aos inputs. |
| Denúncia e moderação | Solicitante denunciou a fixture com motivo explicitamente fictício e sem acusação real. Administrador viu a pendência, marcou como resolvida e o contador caiu de 3 para 2, preservando as denúncias anteriores. Detalhe de terceiros ficou somente leitura para admin. |
| Cadastro solicitante | Pela interface: CPF inválido, senhas diferentes e consentimento ausente recusados. Após autorização explícita do usuário para os dois aceites, cadastro fictício válido redirecionou ao login; autenticação funcionou. |
| Cadastro prestador | Cadastro fictício com categoria, bio e PNG de teste, com aceite autorizado; redirecionamento e login aprovados. Perfil exibiu dados e foto persistidos. |
| Suspensão/reativação | Administrador filtrou exclusivamente a conta fictícia nova, desativou e confirmou; login foi recusado com “Esta conta de usuário foi desativada.” Depois reativou pela confirmação própria, restaurando o estado Ativo. Nenhuma conta anterior foi suspensa. |

As contratações/custódias iniciais das fixtures de pagamento foram preparadas pela API, antes de percorrer as ações acima pela interface. Isso não é apresentado como repetição manual de todos os passos anteriores, já verificados em 25/10.

### Celular

Inspeção em viewport 390 × 844 das páginas: início, dashboard, perfil, configurações, minhas solicitações, minhas propostas, nova solicitação, feed, detalhe da oportunidade, perfil público, status, cadastros solicitante/prestador e login. Administração com usuário filtrado também conferida nesse tamanho. A largura do documento não ultrapassou a área disponível nas medições.

O detalhe do solicitante e o checkout com resumo/métodos/botões foram conferidos ainda em 320 × 740, sem transbordamento horizontal. Comprovante liberado permanece legível. Esses são testes no navegador emulado, não em aparelhos físicos, e a checagem de largura não equivale a testar cada combinação possível de formulário/erro.

### Validação técnica e alcance

Adicionado teste integrado que tenta enviar `valor=0.01`, um prestador diferente e uma proposta aleatória ao checkout. A API deve ignorar esses dados e usar o valor/vínculo da proposta contratada. A suíte também cobre repetição e simultaneidade de pagamentos sem duplicação, pagamento por terceiros, método inválido, reembolso e recontratação.

Os fluxos pendentes listados anteriormente foram exercitados nos percursos principais descritos nesta seção. Isso não significa ausência garantida de qualquer defeito ou cobertura de todas as entradas/transições possíveis. Troca efetiva de senha e desativação voluntária não foram realizadas nestas contas pela interface; suas regras são cobertas pelos testes existentes. As contas fictícias novas foram mantidas para demonstração, com nomes e e-mails que identificam a validação.

Resultado final desta etapa: **11 suítes e 200 testes aprovados**, build de produção do frontend aprovado e diff sem erros. Sem migrações ou dependências novas.
