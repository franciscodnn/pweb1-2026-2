---
name: nova-aula
description: Cria uma nova nota de aula da disciplina PWeb1 em lecture_notes/, com referências à documentação oficial. Use quando o professor pedir para criar ou iniciar uma aula nova.
argument-hint: <número> <tema>
disable-model-invocation: true
---

Crie uma nova nota de aula a partir de: $ARGUMENTS

## 1. Pesquisa nas fontes oficiais
Antes de escrever, consulte a documentação oficial do tema com WebSearch/WebFetch.
Priorize, nesta ordem:
- Angular: https://angular.dev
- TypeScript: https://www.typescriptlang.org/docs/
- JavaScript, HTML, CSS e APIs do navegador: https://developer.mozilla.org/pt-BR/
- Spring Boot e Spring: https://docs.spring.io e https://spring.io/guides
- Outras tecnologias: o site oficial do projeto.

Use blogs ou tutoriais apenas se a documentação oficial não cobrir o assunto,
e sinalize isso na referência.

Nos conceitos inseridos na nota de aula, citar a referência em questão usando a notação de colchetes. Por exemplo, "Spring boot permite criar uma aplicação Web em Java [1] ...".

## 2. Estrutura da nota
Crie `lecture_notes/NN_tema_em_snake_case/README.md` (NN com dois dígitos),
em português, seguindo o estilo das aulas existentes
(leia ao menos uma, ex.: `lecture_notes/08_signals/README.md`):
- título com o tema;
- objetivos da aula;
- conceitos com exemplos de código curtos e comentados;
- exercícios;
- seção final **Referências**.

## 3. Regras para os links
- Coloque o link clicável junto do conceito que ele sustenta, no formato
  `[texto descritivo](url)`, e não só no fim do documento.
- Aponte para a página ou seção mais específica possível (com âncora `#...`
  quando existir), e não apenas para a página inicial da documentação.
- **Só inclua um link depois de abri-lo com WebFetch e confirmar que a página
  existe e trata do assunto citado.** Nunca escreva URLs de memória.
- Na seção **Referências**, liste todos os links usados, cada um com uma frase
  dizendo o que o aluno encontra ali.
- Se o conteúdo depender de versão (ex.: Angular, Spring Boot), informe qual
  versão a documentação consultada descreve.

## 4. Índice e resumo
- Adicione o link da aula no índice `lecture_notes/README.md`, mantendo a numeração.
- Não faça commit. Ao final, mostre o que foi criado e a lista de links
  verificados, marcando qualquer um que não pôde ser confirmado.
