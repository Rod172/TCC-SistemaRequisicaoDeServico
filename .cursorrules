# Regras do Projeto - Sistema de Requisição de Serviço (TCC)

Este arquivo define as diretrizes de desenvolvimento, arquitetura e conduta estrita para qualquer assistente de IA neste projeto de Trabalho de Conclusão de Curso (TCC).

---

## 1. 🌐 Idioma e Comunicação
- **Português Padrão**: Todas as respostas, explicações, documentações, comentários no código, mensagens de commit e artefatos devem ser redigidos estritamente em **Português**.

---

## 2. 📚 Registro e Documentação OBRIGATÓRIA de APIs e Bibliotecas de Terceiros (REGRA RIGOROSA)
- **Anotação e Referenciação Obrigatória em 2 Locais**: Toda e qualquer **API externa**, **serviço** ou **biblioteca de terceiros** (`npm`, dependências de backend, frameworks, drivers, utilitários, etc.) adicionada ou utilizada no projeto **DEVE ser expressamente anotada e referenciada de forma rigorosa**:
  1. **Anotação no Código-Fonte**: Adicionar comentários detalhados no topo/ponto de importação do arquivo de código onde a biblioteca for utilizada, com a descrição do propósito e o link para a documentação oficial.
  2. **Tabela de Referências no LOG_DESENVOLVIMENTO.md**: Manter e atualizar uma tabela no arquivo `LOG_DESENVOLVIMENTO.md` contendo: Nome da Biblioteca, Versão, Propósito/Justificativa no Projeto e Link para a Documentação Oficial.

---

## 3. 🏗️ Arquitetura e Padrões de Código (Stack do TCC)
- **Backend (Node.js & Express com TypeScript)**:
  - Estrutura em camadas bem definidas em TypeScript (`.ts`): `Controllers`, `Services`, `Repositories/Models (Sequelize)`, `Middlewares` e `DTOs/Validators`.
  - Tratamento centralizado de erros (Middleware de erro global).
  - Senhas sempre salvas com hash usando **bcrypt**.
  - Autenticação e autorização via **JWT**.
- **Frontend (Next.js com React & TypeScript)**:
  - Framework **Next.js (App Router)** com componentes funcionais React e tipagem estática **TypeScript (`.tsx`)**.
  - Gerenciamento de estado claro e consumo de APIs isolado em serviços de API.
- **Banco de Dados (MySQL & Sequelize)**:
  - Toda alteração de estrutura deve ser feita por **Migrations**.
  - Fornecer **Seeders** (dados fictícios) para facilitar a demonstração do sistema para a banca examinadora.

---

## 4. 🎓 Exigências Acadêmicas de TCC
- **Documentação de API**: Manter/gerar especificação Swagger/OpenAPI para os endpoints REST desenvolvidos.
- **Diagramas UML**: Quando solicitado para explicar a arquitetura ou processos, utilizar sintaxe **Mermaid** (Casos de Uso, Diagrama de Classes, Fluxos de Sequência).
- **Testes**: Código crítico (autenticação, cálculos de propostas e máquina de estados de serviços) deve ser acompanhado de testes unitários ou de integração (Jest/Supertest).

---

## 5. 📝 Registro Obrigatório do Que Foi Feito (Log de Desenvolvimento)
- **Documentação Incremental**: Ao final de cada funcionalidade, tarefa ou etapa concluída, deve-se obrigatoriamente manter e atualizar o arquivo `LOG_DESENVOLVIMENTO.md`.
- **Conteúdo Exigido no Registro**:
  - Tabela atualizada de bibliotecas/APIs adotadas com versões e referências oficiais.
  - Resumo das alterações e funcionalidades criadas.
  - Relação dos arquivos criados e/ou modificados.
  - Procedimentos de teste realizados e validações de sucesso.
  - Decisões de arquitetura relevantes tomadas durante o processo.

---

## 6. 📋 Toda Mudança de Escopo Vira História no Backlog e no Jira (REGRA RIGOROSA)
- **Nenhum trabalho fora do backlog**: Qualquer funcionalidade, tela, endpoint ou mudança de escopo que for implementada e **não estiver coberta por uma História de Usuário já existente** no `historia.md` **DEVE, obrigatoriamente**:
  1. Ser registrada como uma **nova História de Usuário** no `historia.md` (mesmo formato das demais: Como/Quero/Para que, Critérios de Aceite, Tarefas Técnicas), dentro do Épico correspondente (ou de um novo Épico, se nenhum se aplicar) e incluída na Matriz de Priorização (MoSCoW).
  2. Ser **importada para o Jira** do projeto (`https://rfmdesenvolvimento.atlassian.net`, projeto **TCC**) como Épico/História vinculados, usando o script reutilizável `scripts/jira/importar_historia.py` (as credenciais ficam em `scripts/jira/.jira-credentials.json`, fora do controle de versão — nunca commitar esse arquivo nem expor o token em texto).
- **Ordem**: primeiro documentar a história no `historia.md`, depois importar pro Jira, e só então (ou em paralelo) implementar — mantendo backlog, Jira e código sempre sincronizados.
