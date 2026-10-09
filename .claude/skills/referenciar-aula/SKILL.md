---
name: referenciar-aula
description: Adiciona citações e referências à documentação oficial em uma nota de aula já pronta da disciplina PWeb1, sem reescrever o conteúdo. Use quando o professor pedir para referenciar, citar fontes ou adicionar links oficiais em uma aula existente.
argument-hint: <pasta ou README da aula, ex.: lecture_notes/08_signals>
disable-model-invocation: true
---

Adicione referências à nota de aula indicada em: $ARGUMENTS

Se o argumento for uma pasta, use o `README.md` dentro dela. Se o arquivo não
existir, pare e avise.

## 1. Leitura da nota
Leia a nota inteira e identifique as afirmações técnicas que precisam de fonte:
definições, comportamentos de APIs, recomendações, sintaxe e versões.
Não é preciso citar opiniões didáticas, analogias ou instruções de exercício.

## 2. Pesquisa nas fontes oficiais
Para cada afirmação, busque a fonte na documentação oficial com WebSearch/WebFetch.
Priorize, nesta ordem:
- Angular: https://angular.dev
- TypeScript: https://www.typescriptlang.org/docs/
- JavaScript, HTML, CSS e APIs do navegador: https://developer.mozilla.org/pt-BR/
- Spring Boot e Spring: https://docs.spring.io e https://spring.io/guides
- Outras tecnologias: o site oficial do projeto.

Use blogs ou tutoriais apenas se a documentação oficial não cobrir o assunto,
e sinalize isso na referência.

## 3. Regras para os links
- **Só use um link depois de abri-lo com WebFetch e confirmar que a página
  existe e sustenta a afirmação citada.** Nunca escreva URLs de memória.
- Aponte para a página ou seção mais específica possível (com âncora `#...`
  quando existir), e não apenas para a página inicial da documentação.
- Uma mesma página citada em vários pontos recebe sempre o mesmo número.

## 4. Citações no texto
- Cite usando a notação numérica de colchetes logo após a afirmação.
  Ex.: "Spring Boot permite criar uma aplicação Web em Java [1] ...".
- Numere na ordem da primeira citação no documento.
- Se a nota já tiver citações ou uma seção **Referências**, mantenha a
  numeração existente e continue a partir dela.
- Não cite dentro de blocos de código; cite no texto ao redor.

## 5. Seção Referências
Ao final da nota, crie (ou complete) a seção `## Referências` como lista
numerada, com links clicáveis:

```markdown
## Referências

1. [Título da página](url) — o que o aluno encontra ali.
2. ...
```

Se o conteúdo depender de versão (ex.: Angular, Spring Boot), informe na
referência qual versão a documentação consultada descreve.

## 6. Preservar o texto do professor
- Não reescreva, reorganize nem remova o conteúdo existente. As únicas
  alterações permitidas são inserir os marcadores `[n]` e a seção Referências.
- Se encontrar algo que pareça desatualizado ou que diverge da documentação
  oficial, **não corrija**: liste no resumo final, com o trecho, o que a
  documentação diz e o link.

## 7. Resumo
Não faça commit. Ao final, mostre:
- quantas citações foram inseridas e a lista de referências verificadas;
- afirmações para as quais não foi encontrada fonte oficial;
- possíveis divergências encontradas (item 6), para o professor decidir.
