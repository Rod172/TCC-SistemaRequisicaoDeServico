# Diagramas UML e MER — Eloserv

Diagramas da modelagem prevista na seção 3 (Metodologia) do `TCC.md`. Foram gerados em 26/10/2026 a partir do código e do banco atuais, não de um projeto anterior. Por isso descrevem o sistema como ele realmente funciona.

| Arquivo | Diagrama | Fonte usada |
|---|---|---|
| [casos-de-uso.md](casos-de-uso.md) | Casos de uso por ator, com tabela de rastreabilidade caso de uso → história → endpoint | Rotas, permissões dos controllers/services e telas |
| [classes.md](classes.md) | Classes de domínio, enumerações e camadas do backend na contratação | `backend/src/models`, `models/index.ts`, services e controllers |
| [mer.md](mer.md) | Modelo Entidade-Relacionamento em visão resumida e completa (físico), com chaves estrangeiras e unicidades | `information_schema` do banco `tcc_eloserv` |
| [sequencia-contratacao.md](sequencia-contratacao.md) | Sequência da proposta até a avaliação, com transações e notificações | Services de oportunidade, solicitação e avaliação |

## Como visualizar

- **No próprio sistema:** a página `/arquitetura` (link "Arquitetura" no rodapé) lê estes arquivos e mostra os diagramas com zoom e um botão para baixar cada um em SVG (US41). Editar um arquivo aqui muda a página no próximo acesso.
- **GitHub e VS Code:** o GitHub mostra os blocos ` ```mermaid ` já desenhados. No VS Code, basta uma extensão de prévia de Markdown com suporte a Mermaid.
- **Imagem para a monografia:** cole o bloco em <https://mermaid.live> e exporte em PNG ou SVG. Prefira SVG, que não perde qualidade ao ampliar no Word ou no LaTeX.
- **Linha de comando:** com o [mermaid-cli](https://github.com/mermaid-js/mermaid-cli), rode `npx -p @mermaid-js/mermaid-cli mmdc -i mer.md -o mer.svg`. Ele gera uma imagem por bloco.

Todos os blocos foram analisados e desenhados sem erro pelo Mermaid 11.6.0 e pelo 11.17.2, a versão usada pelo sistema. Eles exigem o Mermaid 11 ou mais novo (por exemplo, pelo `direction LR` no MER resumido). Evite o 11.4.1: ele desenha seta nas linhas `---` (associação ator–caso de uso), que devem sair sem seta.

## Manutenção

Os diagramas não são gerados automaticamente. Ao criar uma migration, um model, uma rota ou uma regra de transição de status, atualize o diagrama afetado junto com o `LOG_DESENVOLVIMENTO.md`. No MER, as colunas podem ser conferidas no banco com a consulta abaixo:

```sql
SELECT TABLE_NAME, COLUMN_NAME, COLUMN_TYPE, COLUMN_KEY, IS_NULLABLE
FROM information_schema.COLUMNS
WHERE TABLE_SCHEMA = 'tcc_eloserv'
ORDER BY TABLE_NAME, ORDINAL_POSITION;
```
