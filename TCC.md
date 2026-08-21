UNIVERSIDADE PAULISTA – UNIP
INSTITUTO DE CIÊNCIAS EXATAS E TECNOLÓGICAS (ICET)








Gabriel Henrique Cassaro
Julia Marques de Souza
Rodrigo Fernando Melo Dias da Silva
Thaina Rayra de Ponti









DESENVOLVIMENTO DE UMA PLATAFORMA DE GERENCIAMENTO DE REQUISIÇÕES DE SERVIÇO














Ribeirão Preto
2026
Gabriel Henrique Cassaro
Julia Marques de Souza
Rodrigo Fernando Melo Dias da Silva
Thaina Rayra de Ponti












DESENVOLVIMENTO DE UMA PLATAFORMA DE GERENCIAMENTO DE REQUISIÇÕES DE SERVIÇO








Projeto submetido ao Curso de Ciência da Computação da Universidade Paulista - Unip, para avaliação da Disciplina Projeto de Curso I.
Orientadora: Prof.a Dr.a Eliana Leão do Prado Battaglion










Ribeirão Preto
2026
Sumário
1. INTRODUÇÃO	3
2. OBJETIVOS	3
2.1 Geral	3
2.2 Específicos	3
3. METODOLOGIA	4
4. REVISÃO DE LITERATURA	5
4.1 Economia de Plataforma e Mercados Digitais Bilaterais	5
4.2 Engenharia de Requisitos	5
4.3 Node.js – Back-end	6
4.4 Next.js e React – Front-end	6
4.5 TypeScript – Tipagem Estática	6
4.6 MySQL – Banco de Dados	7
4.7 Usabilidade e Experiência do Usuário (UX)	7
4.8 Segurança e LGPD	7
5.  CRONOGRAMA	8
REFERÊNCIAS	10

1. INTRODUÇÃO

O avanço da internet e das plataformas digitais transformou profundamente a forma como pessoas e empresas contratam serviços. A intermediação digital entre solicitantes e prestadores tornou-se um modelo amplamente adotado, oferecendo praticidade, rapidez e maior alcance para ambos os lados. Ainda assim, muitas soluções existentes apresentam limitações relevantes, como dificuldades na organização das solicitações, falta de transparência nas negociações e baixa confiabilidade na escolha dos prestadores, o que evidencia a necessidade de sistemas mais completos e seguros.
Nesse cenário, tecnologias como Node.js, Next.js (React), TypeScript e MySQL destacam-se por permitirem o desenvolvimento de aplicações web dinâmicas, altamente tipadas, responsivas e escaláveis, capazes de automatizar processos como cadastro de usuários, gerenciamento de solicitações e envio de propostas. Paralelamente, aspectos como usabilidade, comunicação eficiente e reputação dos prestadores exercem influência direta na experiência dos usuários e na viabilidade das plataformas.
A segurança da informação e a conformidade com a Lei Geral de Proteção de Dados (LGPD – Lei n.º 13.709/2018) são requisitos indispensáveis nesse contexto, exigindo a adoção de mecanismos de autenticação, criptografia e controle de acesso desde as fases iniciais do projeto. Diante disso, o presente trabalho propõe o desenvolvimento de uma plataforma web de intermediação de serviços sob demanda, com funcionalidades de cadastro, publicação de solicitações, envio de propostas, comunicação entre as partes e avaliação dos serviços realizados.

2. OBJETIVOS

2.1 Geral
Desenvolver uma aplicação web para requisição e gerenciamento de serviços sob demanda, estruturada como uma plataforma digital de intermediação entre clientes e prestadores de serviços. 

2.2 Específicos
    • Desenvolver uma plataforma web para intermediação de serviços;
    • Permitir cadastro e autenticação de solicitantes e prestadores; 
    • Criar formulários para solicitação de serviços; 
    • Disponibilizar visualização de serviços para prestadores; 
    • Possibilitar envio de propostas e orçamentos personalizados; 
    • Organizar comparação entre propostas recebidas; 
    • Registrar a contratação do prestador escolhido; 
    • Disponibilizar chat interno para comunicação entre as partes; 
    • Permitir avaliação dos serviços realizados; 
    • Criar histórico de reputação dos prestadores para futuras contratações.

3. METODOLOGIA

O desenvolvimento da plataforma seguirá os princípios da metodologia ágil Scrum, com atividades organizadas em sprints semanais contendo definição de metas, execução e revisão de resultados. Essa abordagem favorece entregas incrementais e a identificação antecipada de problemas.
O processo será estruturado nas seguintes fases:
- Levantamento de Requisitos: identificação e documentação dos requisitos funcionais e não funcionais, com base na análise de sistemas similares e nas necessidades dos perfis de usuário (solicitante e prestador), organizados em backlog e priorizados por impacto.
- Modelagem do Sistema: elaboração de Diagrama de Casos de Uso, Diagrama de Classes e Modelo Entidade-Relacionamento (MER), além da definição da arquitetura da aplicação.
- Implementação: desenvolvimento do back-end em Node.js com Express e TypeScript, do front-end em Next.js (React) com TypeScript e componentes reutilizáveis, e do banco de dados MySQL. A autenticação será implementada com JWT e as senhas armazenadas com criptografia bcrypt.
- Testes: testes funcionais, de unidade e de integração para validação dos módulos, além de avaliação de usabilidade orientada pelas 10 Heurísticas de Nielsen (1994).
O versionamento do código será realizado com Git/GitHub, permitindo controle de alterações, rastreabilidade do histórico de desenvolvimento e colaboração simultânea entre os integrantes da equipe. A conformidade com a LGPD será incorporada desde as etapas iniciais do desenvolvimento, assegurando o tratamento adequado dos dados pessoais dos usuários por meio da adoção de autenticação segura, criptografia de senhas e controle de acesso.

4. REVISÃO DE LITERATURA

4.1 Economia de Plataforma e Mercados Digitais Bilaterais 
Com o crescimento da internet, tornaram-se cada vez mais comuns as plataformas digitais que conectam dois grupos distintos de usuários — no caso deste trabalho, os solicitantes de serviços e os prestadores que os executam. Rochet e Tirole (2003) denominam esse modelo de mercado bilateral, no qual a plataforma atua como intermediadora entre os dois grupos, e quanto maior a participação de um grupo de usuários, maior tende a ser o valor percebido pelo outro grupo — fenômeno conhecido como efeito de rede.
Parker, Van Alstyne e Choudary (2016) ressaltam que, para que uma plataforma desse tipo seja sustentável, é necessário equilibrar os interesses de ambos os lados simultaneamente. A insatisfação de qualquer um dos grupos compromete o funcionamento do ecossistema como um todo, o que torna o gerenciamento desses perfis um fator crítico para o sucesso da plataforma.

4.2 Engenharia de Requisitos
A Engenharia de Requisitos é responsável por identificar, documentar e gerenciar o que o sistema deve fazer antes que seu desenvolvimento se inicie. Sommerville (2011) classifica os requisitos em duas categorias: os funcionais, que descrevem as funcionalidades esperadas do sistema, e os não funcionais, que estabelecem restrições de qualidade como desempenho, segurança e usabilidade.
Para este projeto, os requisitos funcionais centrais compreendem o cadastro de usuários e prestadores, a publicação de requisições de serviço, o envio e a visualização de propostas e o sistema de avaliações. Os requisitos não funcionais incluem a segurança dos dados, a responsividade da interface e a capacidade de escalabilidade da aplicação. Pressman e Maxim (2016) reforçam que o levantamento adequado dos requisitos desde o início é um dos principais determinantes do sucesso no desenvolvimento de sistemas (OLIVEIRA; et al., 2003).

4.3 Node.js – Back-end
O Node.js é um ambiente de execução JavaScript no lado do servidor, fundamentado no motor V8 do Google. Tilkov e Vinoski (2010) destacam como principal vantagem do Node.js o seu modelo de I/O não bloqueante, que permite o atendimento simultâneo de múltiplas requisições sem degradação de desempenho — característica especialmente relevante em plataformas com alto volume de acessos concorrentes.
A comunicação entre o back-end e o front-end será realizada por meio de uma API REST, padrão arquitetural proposto por Fielding (2000) em sua tese de doutorado pela Universidade da Califórnia, que define princípios para a troca eficiente de informações via protocolo HTTP. 

4.4 Next.js e React – Front-end
O React é uma biblioteca JavaScript desenvolvida pelo Meta/Facebook com o objetivo de construir interfaces de usuário a partir de componentes reutilizáveis. Segundo Banks e Porcello (2017), um de seus principais diferenciais é o conceito de Virtual DOM, que atualiza seletivamente apenas os elementos da interface que sofreram alterações.
Para otimizar o roteamento, a renderização e o desempenho da aplicação web, adota-se o Next.js como framework de produção baseado em React. Conforme ressaltado por Vercel (2024), o Next.js amplia os recursos do React oferecendo roteamento baseado em sistema de arquivos (App Router), otimização de imagens, renderização híbrida no servidor (Server-Side Rendering - SSR) e geração de páginas estáticas, garantindo carregamento rápido e excelente experiência do usuário.

4.5 TypeScript – Tipagem Estática
O TypeScript é um superconjunto tipado de JavaScript desenvolvido pela Microsoft que compila para JavaScript puro. De acordo com Bierman, Meijer e Torgersen (2014), a adoção de tipagem estática opcional permite detectar erros durante a fase de compilação/desenvolvimento em vez de em tempo de execução, além de melhorar o autocompletado do código e facilitar o refatoramento em equipes. Neste projeto, o TypeScript será utilizado no front-end e no back-end para aumentar a confiabilidade e a manutenibilidade do sistema.

4.6 MySQL – Banco de Dados 
O armazenamento dos dados da plataforma será realizado com o MySQL, um dos sistemas de gerenciamento de banco de dados relacionais mais utilizados em aplicações web. Elmasri e Navathe (2011) explicam que o modelo relacional organiza as informações em tabelas interligadas por chaves primárias e estrangeiras, garantindo consistência e integridade dos dados.
As principais entidades do sistema — usuários, prestadores, requisições de serviço, propostas e avaliações — serão representadas por meio do Modelo Entidade-Relacionamento (MER) na fase de projeto do banco de dados. A integração entre o Node.js e o MySQL será realizada pelo ORM Sequelize, que abstrai as operações de banco de dados e facilita o mapeamento entre os objetos da aplicação e as tabelas relacionais (BARSOTI; GIBERTONI, 2020).

4.7 Usabilidade e Experiência do Usuário (UX) 
A usabilidade é um atributo essencial para o sucesso de qualquer sistema interativo. Nielsen (1994) a define por cinco dimensões: facilidade de aprendizado, eficiência de uso, memorabilidade, prevenção de erros e satisfação do usuário. O autor também formulou as 10 Heurísticas de Usabilidade, amplamente utilizadas como referência para avaliação e melhoria de interfaces.
Garrett (2011) complementa essa perspectiva com o modelo dos cinco planos da experiência do usuário, que estrutura o processo de design desde a definição da estratégia do sistema até os elementos visuais da interface, promovendo uma abordagem centrada no usuário em todas as etapas do projeto (OLIVEIRA; et al., 2023).

4.8 Segurança e LGPD 
Por envolver o tratamento de dados pessoais de usuários e prestadores, a plataforma deve ser desenvolvida com base nos princípios fundamentais da segurança da informação. Stallings e Brown (2014) definem esses princípios como confidencialidade, integridade e disponibilidade dos dados. Na prática, sua aplicação implica o uso de HTTPS, autenticação via JSON Web Tokens (JWT) e criptografia de senhas com bcrypt.
No âmbito legal, a Lei Geral de Proteção de Dados — LGPD (Lei n.º 13.709/2018) estabelece que qualquer sistema que colete dados de cidadãos brasileiros deve obter o consentimento explícito do titular e manter uma política de privacidade transparente (BRASIL, 2018). O cumprimento da LGPD é uma obrigação legal e será incorporado ao projeto desde suas fases iniciais.

5.  CRONOGRAMA 

O cronograma abaixo apresenta as etapas do desenvolvimento da NP1 do Trabalho de Conclusão de Curso (TCC), organizadas por semanas, com a utilização de marcação (X) para indicar o período de execução de cada atividade. 

Quadro 1 – Cronograma de atividades da NP1.
Etapas do Projeto 	1ª Semana 	2ª Semana 	3ª Semana 	4ª Semana 
Escolha do tema 	X			
Definição dos objetivos 	X			
Pesquisa de referências 	X	X		
Revisão de literatura 		X	X	
Elaboração do cronograma 			X	
Revisão final do conteúdo 				X
Formatação do trabalho 				X
Entrega (NP1) 				X
Fonte: Elaborado pelos autores (2026).

Quadro 2 – Cronograma de atividades da NP2.
Etapas do Projeto 	1ª Semana 	2ª Semana 	3ª Semana 	4ª Semana 
Pesquisa de referências	X			
Metodologia		X		
Introdução		X		
Elaboração do cronograma 			X	
Revisão final do conteúdo 			X	
Formatação do trabalho 			X	
Entrega (NP2) 				X
Fonte: Elaborado pelos autores (2026).

REFERÊNCIAS

BARSOTI, Renan; GIBERTONI, Doris. Impacto que o Sequelize traz para o desenvolvimento de uma API construída em Node.js com Express.js. Interface Tecnológica, v. 17, n. 2, 2020. Disponível em: https://revista.fatectq.edu.br/index.php/interfacetecnologica/article/view/964. Acesso em: mar. 2026.

BIERMAN, Gavin; MEIJER, Erik; TORGERSEN, Mads. Understanding TypeScript. In: European Conference on Object-Oriented Programming (ECOOP). Springer, 2014. p. 257-281.

BRASIL. Lei nº 13.709, de 14 de agosto de 2018. Lei Geral de Proteção de Dados Pessoais (LGPD). Brasília, DF: Presidência da República, 2018. Disponível em: https://www.planalto.gov.br/ccivil_03/_ato2015-2018/2018/lei/l13709.htm. Acesso em: mar. 2026.

ELMASRI, Ramez; NAVATHE, Shamkant B. Sistemas de banco de dados. 6. ed. São Paulo: Pearson, 2011.

FIELDING, Roy Thomas. Architectural styles and the design of network-based software architectures. 2000. Tese (Doutorado em Ciência da Computação) – University of California, Irvine, Irvine, 2000.

GARRETT, Jesse James. The elements of user experience. 2. ed. Berkeley: New Riders, 2011.

NIELSEN, Jakob. Usability engineering. San Francisco: Morgan Kaufmann, 1994.

OLIVEIRA, Lais Pereira et al. Experiência do usuário: análise de usabilidade do ambiente virtual de aprendizagem e-Campo (EMBRAPA). RDBCI: Revista Digital de Biblioteconomia e Ciência da Informação, 2023. Disponível em: https://www.scielo.br/j/rdbci/a/bkwg9rz3HqvWF7znmh9G7XN/. Acesso em: mar. 2026.

OLIVEIRA, Saulo Barbará de et al. Definição de requisitos de software baseada numa arquitetura de modelagem de negócios. Produção, 2003. Disponível em: https://www.scielo.br/j/prod/a/4fyvdWfsVyDQRfhqTCRJ8vL/. Acesso em: mar. 2026.

PARKER, Geoffrey; VAN ALSTYNE, Marshall; CHOUDARY, Sangeet Paul. Platform revolution. New York: W. W. Norton & Company, 2016.

PRESSMAN, Roger S.; MAXIM, Bruce R. Engenharia de software: uma abordagem profissional. 8. ed. Porto Alegre: AMGH, 2016.

SOMMERVILLE, Ian. Engenharia de software. 9. ed. São Paulo: Pearson Prentice Hall, 2011.

STALLINGS, William; BROWN, Lawrie. Segurança de computadores: princípios e práticas. 2. ed. Rio de Janeiro: Elsevier, 2014.

TILKOV, Stefan; VINOSKI, Steve. Node.js: using JavaScript to build high-performance network programs. IEEE Internet Computing, v. 14, n. 6, p. 80–83, 2010.

VERCEL. Next.js Documentation: React Framework for the Web. 2024. Disponível em: https://nextjs.org/docs. Acesso em: mar. 2026.