[main](../../README.md)


# Aula 12 - Injeção de Dependências (DI) em Angular v22

## Objetivos da aula

Ao final desta aula, você deverá ser capaz de:

- explicar o que é **injeção de dependências** e por que ela é útil;
- criar um **serviço** com o decorador `@Service()` e compartilhá-lo entre componentes;
- injetar dependências com a função `inject()`;
- diferenciar `@Service` de `@Injectable` e saber quando usar cada um;
- carregar um serviço **sob demanda** (lazy loading) com `injectAsync()`;
- reconhecer o que é um **contexto de injeção** e evitar o erro `NG0203`.

> Os exemplos desta aula seguem o **Angular v22**: componentes são *standalone* por padrão e os serviços usam o decorador `@Service()`.

## Introdução

À medida que uma aplicação cresce, precisamos reaproveitar e compartilhar funcionalidades entre várias partes do código. A **injeção de dependências** (*Dependency Injection*, DI) é um padrão de projeto em que uma classe **recebe de fora** as suas dependências, em vez de criá-las dentro dela mesma [1].

Uma analogia: um restaurante não fabrica o próprio fogão. Ele **pede** um fogão ao fornecedor e apenas o usa. Se amanhã o fornecedor trocar o modelo, a cozinha continua funcionando da mesma forma.

Veja a diferença em código:

```typescript
// ❌ SEM injeção de dependências: a classe cria a própria dependência
export class Pedido {
  private logger = new Logger(); // acoplado a uma implementação específica

  finalizar() {
    this.logger.log('Pedido finalizado');
  }
}
```

```typescript
// ✅ COM injeção de dependências: a classe apenas PEDE a dependência
import { inject } from '@angular/core';

export class Pedido {
  private logger = inject(Logger); // o Angular entrega a instância

  finalizar() {
    this.logger.log('Pedido finalizado');
  }
}
```

Na segunda versão, quem decide **qual** `Logger` será usado é o Angular, e não a classe `Pedido`. Isso traz três benefícios principais [1]:

| Benefício | O que significa na prática |
| --- | --- |
| **Manutenção** | Separação clara de responsabilidades: o código fica mais fácil de refatorar e com menos duplicação. |
| **Escalabilidade** | Funcionalidades modulares podem ser reaproveitadas em várias partes da aplicação. |
| **Testabilidade** | Nos testes, é possível trocar a dependência real por um "dublê" (*test double*). |

## 1. Como a DI funciona no Angular

Uma **dependência** é qualquer objeto, valor, função ou serviço de que uma classe precisa para funcionar, mas que ela não cria sozinha [1].

Você interage com o sistema de DI de duas formas [1]:

1. **Prover** (*provide*): tornar um valor disponível;
2. **Injetar** (*inject*): pedir esse valor como dependência.

```text
   ┌──────────────┐  provê   ┌──────────────┐  injeta   ┌──────────────┐
   │   Serviço    │ ───────► │   Angular    │ ────────► │  Componente  │
   │ (@Service)   │          │  (injetor)   │           │  inject(...) │
   └──────────────┘          └──────────────┘           └──────────────┘
```

Os tipos mais comuns de dependências são [1]:

- **Valores de configuração**: constantes de ambiente, URLs de API, *feature flags*;
- **Fábricas** (*factories*): funções que criam objetos de acordo com condições em tempo de execução;
- **Serviços**: classes com funcionalidades comuns, regras de negócio ou estado compartilhado.

Componentes e diretivas participam **automaticamente** da DI: podem receber dependências e também ser injetados [1].

## 2. O que são serviços?

Um **serviço** é uma classe TypeScript decorada com `@Service`, o que permite injetar uma instância dela como dependência. Serviços são a forma mais comum de compartilhar dados e funcionalidades na aplicação [1].

Exemplos típicos de serviços [1]:

| Tipo | Exemplo |
| --- | --- |
| Cliente de dados | Busca e envia dados para um servidor |
| Gerenciamento de estado | Carrinho de compras compartilhado entre páginas |
| Autenticação | Usuário logado, login/logout |
| Log | Registro de mensagens e erros |
| Utilitários | Formatação de datas, cálculos comuns |

### Criando um serviço

Pela [Angular CLI](https://angular.dev/guide/di/creating-and-using-services#creating-a-service) [2]:

```bash
ng generate service logger
# cria o arquivo src/app/logger.ts
```

Ou manualmente, adicionando o decorador `@Service()` a uma classe [2]:

```typescript
// src/app/logger.ts
import { Service } from '@angular/core';

@Service()
export class Logger {
  log(mensagem: string) {
    const hora = new Date().toLocaleTimeString();
    console.log(`[${hora}] ${mensagem}`);
  }
}
```

> 💡 **Dica:** `@Service()` é um atalho para a forma tradicional `@Injectable({ providedIn: 'root' })` [1] [2].

### Como o serviço fica disponível?

Por padrão, um serviço com `@Service()` é provido na **raiz** (*root*) da aplicação. Isso garante três coisas [2]:

- **Instância única (singleton)**: existe um só objeto, compartilhado por toda a aplicação;
- **Disponibilidade global**: pode ser injetado em qualquer lugar, sem registro manual;
- **Tree-shaking**: se nenhum código usar o serviço, ele fica de fora do pacote final de produção.

## 3. Injetando dependências com `inject()`

Para usar um serviço, chame a função `inject()` de `@angular/core` [1] [2]:

```typescript
// src/app/exemplos/ola/ola.ts
import { Component, inject } from '@angular/core';
import { Logger } from '../../logger';

@Component({
  selector: 'app-ola',
  template: `
    <button (click)="dizerOla()"
      class="rounded-lg bg-indigo-600 px-4 py-2 font-medium text-white hover:bg-indigo-700">
      Dizer olá
    </button>
  `,
})
export class Ola {
  private logger = inject(Logger); // pede ao Angular uma instância de Logger

  dizerOla() {
    this.logger.log('Olá, DI!');
  }
}
```

Repare: o componente **não** escreve `new Logger()`. Ele só declara que precisa de um `Logger`.

### Exemplo completo: um carrinho compartilhado

Como o serviço é um **singleton**, dois componentes diferentes enxergam **os mesmos dados**. Vamos criar um serviço de carrinho que guarda o estado em [signals](../08_signals/README.md):

```typescript
// src/app/carrinho-store.ts
import { Service, computed, signal } from '@angular/core';

export interface Produto {
  nome: string;
  preco: number;
}

@Service()
export class CarrinhoStore {
  // estado privado: só o serviço altera
  private readonly _itens = signal<Produto[]>([]);

  // estado público somente leitura
  readonly itens = this._itens.asReadonly();
  readonly quantidade = computed(() => this._itens().length);
  readonly total = computed(() =>
    this._itens().reduce((soma, p) => soma + p.preco, 0)
  );

  adicionar(produto: Produto) {
    this._itens.update(lista => [...lista, produto]);
  }

  limpar() {
    this._itens.set([]);
  }
}
```

Um componente **adiciona** produtos:

```typescript
// src/app/exemplos/vitrine/vitrine.ts
import { Component, inject } from '@angular/core';
import { CarrinhoStore, Produto } from '../../carrinho-store';

@Component({
  selector: 'app-vitrine',
  template: `
    <div class="space-y-2 rounded-xl bg-white p-4 shadow-md">
      <h2 class="text-lg font-semibold">Vitrine</h2>
      @for (p of produtos; track p.nome) {
        <button (click)="carrinho.adicionar(p)"
          class="block w-full rounded-lg border border-gray-300 px-3 py-2 text-left hover:bg-gray-100">
          {{ p.nome }} — R$ {{ p.preco }}
        </button>
      }
    </div>
  `,
})
export class Vitrine {
  carrinho = inject(CarrinhoStore);

  produtos: Produto[] = [
    { nome: 'Caneca', preco: 25 },
    { nome: 'Camiseta', preco: 60 },
    { nome: 'Adesivo', preco: 5 },
  ];
}
```

Outro componente, **sem nenhuma ligação direta com o primeiro**, exibe o resumo:

```typescript
// src/app/exemplos/resumo-carrinho/resumo-carrinho.ts
import { Component, inject } from '@angular/core';
import { CarrinhoStore } from '../../carrinho-store';

@Component({
  selector: 'app-resumo-carrinho',
  template: `
    <div class="rounded-xl bg-white p-4 shadow-md">
      <h2 class="text-lg font-semibold">Carrinho</h2>
      <p>Itens: {{ carrinho.quantidade() }}</p>
      <p>Total: R$ {{ carrinho.total() }}</p>
      <button (click)="carrinho.limpar()"
        class="mt-2 rounded-lg border border-gray-300 px-3 py-1 text-sm hover:bg-gray-100">
        Limpar
      </button>
    </div>
  `,
})
export class ResumoCarrinho {
  carrinho = inject(CarrinhoStore);
}
```

E o `App` usa os dois:

```typescript
// src/app/app.ts
import { Component } from '@angular/core';
import { Vitrine } from './exemplos/vitrine/vitrine';
import { ResumoCarrinho } from './exemplos/resumo-carrinho/resumo-carrinho';

@Component({
  selector: 'app-root',
  imports: [Vitrine, ResumoCarrinho],
  template: `
    <main class="mx-auto grid max-w-2xl gap-4 p-8 sm:grid-cols-2">
      <app-vitrine />
      <app-resumo-carrinho />
    </main>
  `,
})
export class App {}
```

Ao clicar em um produto na vitrine, o resumo é atualizado na hora: os dois componentes receberam **a mesma instância** de `CarrinhoStore`.

### Um serviço injetando outro serviço

Serviços também podem depender de outros serviços, usando o mesmo `inject()` [2]. Vamos fazer o carrinho registrar um log a cada item adicionado:

```typescript
// src/app/carrinho-store.ts (trecho)
import { Service, computed, inject, signal } from '@angular/core';
import { Logger } from './logger';

@Service()
export class CarrinhoStore {
  private logger = inject(Logger); // dependência de outro serviço
  private readonly _itens = signal<Produto[]>([]);
  // ...

  adicionar(produto: Produto) {
    this._itens.update(lista => [...lista, produto]);
    this.logger.log(`Adicionado: ${produto.nome}`);
  }
}
```

### Onde `inject()` pode ser usado?

`inject()` pode ser chamado durante a **construção** de um componente, diretiva ou serviço: em um **inicializador de campo** ou dentro do **construtor** [1].

```typescript
@Component({ /* ... */ })
export class MeuComponente {
  // ✅ inicializador de campo (forma mais comum)
  private logger = inject(Logger);

  // ✅ dentro do construtor
  private carrinho: CarrinhoStore;

  constructor() {
    this.carrinho = inject(CarrinhoStore);
  }
}
```

Também funciona em funções que o Angular executa em um contexto especial, como os *guards* de rota [1]:

```typescript
// ✅ em um guard de rota
export const authGuard = () => {
  const auth = inject(AuthService);
  return auth.isAuthenticated();
};
```

Todo lugar onde `inject()` pode ser chamado é chamado de **contexto de injeção** (veja a [seção 6](#6-contexto-de-injeção)) [1].

## 4. `@Service` × `@Injectable`

O `@Service` é um atalho moderno para `@Injectable({ providedIn: 'root' })` [2]. Use a tabela abaixo para decidir [2]:

| Recurso | `@Service` | `@Injectable` |
| --- | --- | --- |
| Suporte à função `inject()` | ✅ Sim | ✅ Sim |
| Injeção pelo construtor (`constructor(private x: X)`) | ❌ Não | ✅ Sim |
| Singleton na raiz automaticamente | ✅ Sim | ❌ Não (exige `{ providedIn: 'root' }`) |
| Opções avançadas (`useClass`, `useValue`...) | ❌ Não | ✅ Sim |
| Fábrica de inicialização personalizada | ✅ Sim (`factory`) | ✅ Sim |
| Escopos fora da raiz (`platform` etc.) | ❌ Não | ✅ Sim |

As duas formas abaixo são equivalentes:

```typescript
import { Injectable, Service } from '@angular/core';

@Service()
export class Logger { /* ... */ }

@Injectable({ providedIn: 'root' })
export class LoggerAntigo { /* ... */ }
```

**Regra prática** [2]: use `@Service` para criar novos serviços singleton que usam `inject()`. Continue com `@Injectable` quando precisar de injeção pelo construtor, de `useClass`/`useValue`/`useExisting`/`useFactory` ou de escopos como `providedIn: 'platform'`.

> 💡 Você ainda vai encontrar muito código (e tutoriais) com injeção pelo construtor, por exemplo `constructor(private logger: Logger) {}`. Ela continua funcionando com `@Injectable`, mas nesta disciplina usaremos `inject()`.

### Trocando a implementação com `factory`

Se você quiser controlar **como** o singleton é criado (por exemplo, usar uma implementação diferente conforme o ambiente), passe uma função `factory` [2]. A fábrica roda em um contexto de injeção, então pode chamar `inject()` [2].

No exemplo abaixo, em desenvolvimento o `Logger` escreve no console; em produção ele não faz nada:

```typescript
// src/app/logger.ts
import { Service, isDevMode } from '@angular/core';

@Service({
  // decide qual objeto será o singleton
  factory: () => (isDevMode() ? new LoggerConsole() : new Logger()),
})
export class Logger {
  log(mensagem: string) {
    // não faz nada por padrão
  }
}

class LoggerConsole extends Logger {
  override log(mensagem: string) {
    console.log('[DEV]', mensagem);
  }
}
```

Quem injeta continua escrevendo apenas `inject(Logger)`; a troca é transparente.

> **Nota:** a opção `factory` substitui as opções `useClass`, `useValue`, `useExisting` e `useFactory` do `@Injectable`. Se precisar delas, use `@Injectable` [2].

### Desligando o provimento automático

Às vezes você **não** quer um singleton global, e sim uma instância própria para um componente ou rota. Nesse caso use `autoProvided: false` e registre o serviço manualmente em um array `providers` [2]:

```typescript
// src/app/contador-store.ts
import { Service, signal } from '@angular/core';

@Service({ autoProvided: false })
export class ContadorStore {
  valor = signal(0);
  incrementar() {
    this.valor.update(v => v + 1);
  }
}
```

```typescript
// src/app/exemplos/contador/contador.ts
import { Component, inject } from '@angular/core';
import { ContadorStore } from '../../contador-store';

@Component({
  selector: 'app-contador',
  providers: [ContadorStore], // cada <app-contador> ganha a SUA instância
  template: `
    <button (click)="store.incrementar()"
      class="rounded-lg bg-indigo-600 px-4 py-2 text-white">
      Cliques: {{ store.valor() }}
    </button>
  `,
})
export class Contador {
  store = inject(ContadorStore);
}
```

Se você colocar `<app-contador />` duas vezes na tela, cada botão terá a sua própria contagem, ao contrário do `CarrinhoStore`, que era compartilhado.

## 5. Carregando serviços sob demanda (lazy loading)

Alguns serviços dependem de bibliotecas **grandes** ou são usados raramente. Não faz sentido o usuário baixar esse código ao abrir a página. A função `injectAsync()` carrega o serviço **só quando ele é realmente necessário** [3].

Ao usar `injectAsync`, o *bundler* separa o código do serviço em um arquivo JavaScript à parte (*chunk*), baixado apenas na primeira vez que você pede a instância. Depois de carregado, o serviço é resolvido pela DI normal: pode ter suas próprias dependências e continua sendo um singleton [3].

> ⚠️ **Importante:** para o lazy loading funcionar, o serviço precisa ser provido automaticamente, com `@Service()` ou `@Injectable({ providedIn: 'root' })` [3].

### Exemplo: exportar um relatório

Imagine que exportar um relatório usa uma biblioteca pesada de planilhas, mas poucos usuários clicam em **Exportar** [3]:

```typescript
// src/app/exportador-relatorio.ts
import { Service } from '@angular/core';

@Service()
export class ExportadorRelatorio {
  // imagine aqui o uso de uma biblioteca grande de planilhas
  exportar() {
    console.log('Relatório exportado!');
  }
}
```

```typescript
// src/app/exemplos/relatorio/relatorio.ts
import { Component, injectAsync } from '@angular/core';

@Component({
  selector: 'app-relatorio',
  template: `
    <button (click)="exportar()"
      class="rounded-lg bg-indigo-600 px-4 py-2 text-white">
      Exportar
    </button>
  `,
})
export class Relatorio {
  // ainda NÃO baixa o código: apenas prepara uma função de carregamento
  private exportador = injectAsync(() =>
    import('../../exportador-relatorio').then(m => m.ExportadorRelatorio)
  );

  async exportar() {
    const exportador = await this.exportador(); // 1ª vez: baixa o chunk
    exportador.exportar();
  }
}
```

A primeira chamada a `this.exportador()` dispara o `import()` dinâmico; as chamadas seguintes reaproveitam a mesma *promise*, então o arquivo é baixado **uma única vez** [3].

> 🔎 **Experimente:** abra a aba *Network* (Rede) do DevTools, recarregue a página e clique em **Exportar**. Você verá um novo arquivo `.js` sendo baixado só nesse momento.

Se o serviço for o **export default** do arquivo, basta passar o `import()` direto, e o Angular desembrulha o `default` para você [3]:

```typescript
// exportador-relatorio.ts
@Service()
export default class ExportadorRelatorio { /* ... */ }

// relatorio.ts
private exportador = injectAsync(() => import('../../exportador-relatorio'));
```

### Pré-carregamento (prefetch)

Por padrão, o arquivo só é baixado quando a função é chamada. Com a opção `prefetch`, é possível começar o download **antes**, por exemplo quando o navegador estiver ocioso, com o gatilho pronto `onIdle` [3]:

```typescript
import { Component, injectAsync, onIdle } from '@angular/core';

@Component({ /* ... */ })
export class Relatorio {
  private exportador = injectAsync(
    () => import('../../exportador-relatorio').then(m => m.ExportadorRelatorio),
    { prefetch: onIdle } // baixa quando o navegador estiver livre
  );
}
```

Também dá para definir um tempo máximo de espera [3]:

```typescript
injectAsync(loader, { prefetch: () => onIdle({ timeout: 1_000 }) }); // no máximo 1 s
```

> **Nota:** o prefetch é **oportunista**. Se o usuário clicar antes de o prefetch acontecer, o Angular carrega o serviço imediatamente [3].

### Gatilho de prefetch personalizado

Um `PrefetchTrigger` é simplesmente uma função que retorna uma *promise*; quando ela é resolvida, o carregamento começa. Exemplo: começar a baixar quando o mouse **passa por cima** de um elemento [3]:

```typescript
import { PrefetchTrigger } from '@angular/core';

export function onHover(alvo: HTMLElement): PrefetchTrigger {
  return () =>
    new Promise<void>(resolve => {
      alvo.addEventListener('pointerenter', () => resolve(), { once: true });
    });
}
```

## 6. Contexto de injeção

O sistema de DI precisa de um **contexto** em tempo de execução no qual o injetor atual esteja disponível. Por isso, `inject()` só funciona quando o código roda **dentro** desse contexto [4].

Existe um contexto de injeção nas seguintes situações [4]:

- durante a construção (`constructor`) de uma classe criada pela DI, como `@Service`, `@Injectable` ou `@Component`;
- nos **inicializadores de campo** dessas classes;
- na função `useFactory` de um *provider* ou de um `@Injectable` (e na `factory` do `@Service`);
- na função `factory` de um `InjectionToken`;
- em código executado a partir de um desses pontos (mesmo *stack frame*).

### O erro mais comum: `inject()` dentro de um método

```typescript
@Component({
  selector: 'app-errado',
  template: `<button (click)="salvar()">Salvar</button>`,
})
export class Errado {
  private logger = inject(Logger); // ✅ inicializador de campo: OK

  salvar() {
    const carrinho = inject(CarrinhoStore); // ❌ erro NG0203!
    // o clique acontece DEPOIS da construção, fora do contexto de injeção
  }
}
```

Chamar `inject()` fora de um contexto de injeção faz o Angular lançar o **erro NG0203** [4]. A correção é simples: mova o `inject()` para um campo da classe e use o campo no método.

```typescript
export class Certo {
  private logger = inject(Logger);
  private carrinho = inject(CarrinhoStore); // ✅ injetado na construção

  salvar() {
    this.carrinho.limpar(); // ✅ apenas USA a dependência
  }
}
```

### APIs que já rodam em contexto de injeção

Algumas APIs do Angular são executadas dentro de um contexto de injeção, como os **guards** de rota. Por isso podemos usar `inject()` diretamente na função [4]:

```typescript
import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';

export const somenteLogado: CanActivateFn = () => {
  const auth = inject(AuthService); // ✅ o guard roda em contexto de injeção
  return auth.isAuthenticated() ? true : inject(Router).parseUrl('/login');
};
```

### Executando código em um contexto: `runInInjectionContext`

Se você precisa usar `inject()` em um ponto onde **não** há contexto, pode criar um com `runInInjectionContext`, passando um injetor, como o `EnvironmentInjector` [4]:

```typescript
import { EnvironmentInjector, Service, inject, runInInjectionContext } from '@angular/core';

@Service()
export class Relatorios {
  private injetor = inject(EnvironmentInjector); // guardado na construção

  gerar() {
    runInInjectionContext(this.injetor, () => {
      const logger = inject(Logger); // ✅ agora existe contexto
      logger.log('Gerando relatório...');
    });
  }
}
```

> 💡 Na maioria dos casos, basta injetar a dependência em um campo. Use `runInInjectionContext` apenas quando isso não for possível.

### Verificando o contexto: `assertInInjectionContext`

Ao criar **funções auxiliares** que chamam `inject()`, use `assertInInjectionContext` para gerar uma mensagem de erro mais clara, que aponta para a sua função [4]:

```typescript
// src/app/dom-helpers.ts
import { ElementRef, assertInInjectionContext, inject } from '@angular/core';

export function injectNativeElement<T extends Element>(): T {
  assertInInjectionContext(injectNativeElement); // erro claro se usado fora do contexto
  return inject(ElementRef).nativeElement;
}
```

```typescript
@Component({ /* ... */ })
export class Cartao {
  readonly hostEl = injectNativeElement<HTMLElement>(); // ✅ inicializador de campo

  aoClicar() {
    const outro = injectNativeElement<HTMLElement>(); // ❌ falha: fora do contexto
  }
}
```

## 7. Exercícios

1. **Saudação**: crie um serviço `Saudacao` com um método `saudar(nome: string): string` que retorna `"Olá, <nome>!"`. Injete-o em um componente que tenha um campo de texto e mostre a saudação na tela.
2. **Contador global × local**: crie um `ContadorStore` com `@Service()` e use-o em dois componentes diferentes. Os dois mostram o mesmo valor? Agora troque para `@Service({ autoProvided: false })` e adicione `providers: [ContadorStore]` em cada componente. O que mudou? Explique por quê.
3. **Lista de tarefas**: crie um `TarefasStore` com um signal de tarefas e os métodos `adicionar()` e `remover()`. Faça um componente `NovaTarefa` (formulário) e outro `ListaTarefas` (exibição) que compartilhem o serviço.
4. **Serviço que usa serviço**: faça o `TarefasStore` injetar o `Logger` e registrar no console cada tarefa adicionada ou removida.
5. **Factory**: altere o `Logger` usando `factory` para que, em desenvolvimento, as mensagens apareçam com o prefixo `[DEV]` e, em produção, nada seja exibido.
6. **Lazy loading**: crie um serviço `GeradorPdf` (pode apenas fazer `console.log`) e carregue-o com `injectAsync()` somente ao clicar em um botão "Gerar PDF". Confirme na aba *Network* do DevTools que um novo arquivo é baixado no clique. Depois, adicione `prefetch: onIdle` e observe a diferença.
7. **Encontre o erro**: o código abaixo lança `NG0203`. Explique o motivo e corrija-o.

   ```typescript
   @Component({ selector: 'app-perfil', template: `<button (click)="sair()">Sair</button>` })
   export class Perfil {
     sair() {
       inject(AuthService).logout();
     }
   }
   ```

## Resumo

- **Injeção de dependências** é o padrão em que a classe **pede** suas dependências, em vez de criá-las com `new`;
- um **serviço** é uma classe com `@Service()`; por padrão ele é um **singleton** disponível em toda a aplicação;
- dependências são obtidas com **`inject()`**, em inicializadores de campo ou no construtor;
- **`@Service`** é o atalho moderno para `@Injectable({ providedIn: 'root' })`; use `@Injectable` para injeção por construtor, `useClass`/`useValue`/... ou escopos fora da raiz;
- **`factory`** permite trocar a implementação; **`autoProvided: false`** + `providers` cria instâncias por componente;
- **`injectAsync()`** carrega serviços pesados sob demanda, com prefetch opcional (`onIdle` ou gatilho próprio);
- `inject()` só funciona em um **contexto de injeção**; fora dele, ocorre o erro **NG0203**.

## Referências

As páginas do angular.dev foram consultadas em outubro de 2026 e descrevem o **Angular v22**.

1. [Injeção de dependências no Angular (visão geral)](https://angular.dev/guide/di): o que é DI, seus benefícios, o que são serviços e onde `inject()` pode ser usado.
   - [Como a DI funciona no Angular](https://angular.dev/guide/di#how-does-dependency-injection-work-in-angular) · [O que são serviços](https://angular.dev/guide/di#what-are-services) · [Injetando com `inject()`](https://angular.dev/guide/di#injecting-dependencies-with-inject) · [Onde `inject()` pode ser usado](https://angular.dev/guide/di#where-can-inject-be-used)
2. [Criando e usando serviços](https://angular.dev/guide/di/creating-and-using-services): criação pela CLI ou manual, singleton na raiz, `@Service` × `@Injectable`, `factory`, `autoProvided` e injeção em componentes e serviços.
   - [Criando um serviço](https://angular.dev/guide/di/creating-and-using-services#creating-a-service) · [Como o serviço fica disponível](https://angular.dev/guide/di/creating-and-using-services#how-services-become-available) · [`@Service` × `@Injectable`](https://angular.dev/guide/di/creating-and-using-services#using-the-service-vs-injectable-decorator) · [Trocando a implementação com `factory`](https://angular.dev/guide/di/creating-and-using-services#replacing-the-implementation-with-a-factory) · [Desligando o provimento automático](https://angular.dev/guide/di/creating-and-using-services#opting-out-of-automatic-provisioning) · [Quando usar cada um](https://angular.dev/guide/di/creating-and-using-services#when-to-use-service-vs-injectable) · [Injetando um serviço](https://angular.dev/guide/di/creating-and-using-services#injecting-a-service)
3. [Lazy loading de serviços](https://angular.dev/guide/di/lazy-loading-services): carregamento sob demanda com `injectAsync()`, prefetch com `onIdle` e gatilhos personalizados.
   - [Injetando um serviço sob demanda](https://angular.dev/guide/di/lazy-loading-services#lazily-injecting-a-service) · [Pré-carregamento](https://angular.dev/guide/di/lazy-loading-services#prefetching-the-dependency) · [Gatilho personalizado](https://angular.dev/guide/di/lazy-loading-services#provide-a-custom-prefetch-trigger)
4. [Contexto de injeção](https://angular.dev/guide/di/dependency-injection-context): onde existe contexto de injeção, `runInInjectionContext`, `assertInInjectionContext` e o erro NG0203.
   - [Stack frame em contexto](https://angular.dev/guide/di/dependency-injection-context#stack-frame-in-context) · [Executando em um contexto](https://angular.dev/guide/di/dependency-injection-context#run-within-an-injection-context) · [Verificando o contexto](https://angular.dev/guide/di/dependency-injection-context#asserts-the-context) · [Usando DI fora de um contexto](https://angular.dev/guide/di/dependency-injection-context#using-di-outside-of-a-context)
