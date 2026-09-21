[main](../../README.md)

# Aula 8 - Sinais (Signals) no Angular

## 1. O que são Signals?

Um **signal** é um wrapper em torno de um valor que **notifica automaticamente os consumidores quando esse valor muda**. O Angular usa essa notificação para atualizar apenas as partes da UI que dependem daquele dado — sem re-renderizar o componente inteiro.

### Principais características:

- **Reatividade automática**: A UI é atualizada sempre que o valor de um sinal muda
- **Transparência**: Você pode acessar o valor de um sinal como se fosse uma propriedade comum
- **Granularidade**: Apenas as partes da UI que dependem de um sinal específico são atualizadas
- **Eficiência**: Reduz a necessidade de verificações de detecção de mudanças em toda a aplicação

```typescript
import { signal } from '@angular/core';

const preco = signal(99.90);

// Signals são funções getter — chamá-los lê o valor atual
console.log(preco()); // 99.90
```

> Chamar `preco()` faz **duas coisas**: retorna o valor atual e, se estiver em contexto reativo, registra a dependência.

Signals podem ser **graváveis** (`WritableSignal`) ou **somente leitura** (`Signal`).

> Os exemplos desta aula seguem o **Angular 22**: componentes são *standalone* por padrão, então não é necessário declarar `standalone: true` no `@Component`.

### Verificando se um valor é um signal

```typescript
import { signal, computed, isSignal, isWritableSignal } from '@angular/core';

const contador = signal(0);
const dobro = computed(() => contador() * 2);

isSignal(contador);          // true
isSignal(dobro);             // true
isWritableSignal(contador);  // true
isWritableSignal(dobro);     // false — computed é somente leitura
```

---

## 2. Sinais Graváveis (Writable Signals)

```typescript
import { signal } from '@angular/core';

const estoque = signal(10);

// set(): substitui o valor completamente
estoque.set(20);

// update(): calcula o novo valor a partir do anterior
estoque.update(qtd => qtd - 1);

console.log(estoque()); // 19
```

### Exemplo — Carrinho de Compras

```typescript
import { Component, signal, computed } from '@angular/core';

@Component({
  selector: 'app-carrinho',
  template: `
    <div class="p-4 max-w-sm border rounded shadow">
      <h2 class="text-xl font-bold mb-2">Carrinho</h2>
      <p class="text-gray-700">Itens: <span class="font-semibold">{{ quantidade() }}</span></p>
      <p class="text-gray-700 mb-4">Total: <span class="font-semibold text-green-700">R$ {{ total() }}</span></p>
      <div class="flex gap-2">
        <button (click)="adicionar()"
          class="bg-blue-600 hover:bg-blue-700 text-white font-medium py-1 px-3 rounded">
          + Adicionar item (R$ 29,90)
        </button>
        <button (click)="remover()" [disabled]="quantidade() === 0"
          class="bg-red-500 hover:bg-red-600 disabled:opacity-40 text-white font-medium py-1 px-3 rounded">
          - Remover
        </button>
      </div>
    </div>
  `,
})
export class CarrinhoComponent {
  quantidade = signal(0);
  precoUnitario = signal(29.90);

  total = computed(() => this.quantidade() * this.precoUnitario());

  adicionar() { this.quantidade.update(q => q + 1); }
  remover()   { this.quantidade.update(q => q - 1); }
}
```

### Função de igualdade personalizada

Por padrão, um signal só notifica seus consumidores quando o novo valor é diferente do anterior. Use a opção `equal` para definir o que significa "diferente":

```typescript
import { signal } from '@angular/core';

interface Usuario {
  id: number;
  nome: string;
}

// Só notifica se o id mudar
const usuario = signal<Usuario>(
  { id: 1, nome: 'Ana' },
  { equal: (a, b) => a.id === b.id }
);
```

### Obtendo um Signal somente leitura com `asReadonly()`

Use `asReadonly()` para expor um signal público sem permitir modificações externas:

```typescript
import { Injectable, signal } from '@angular/core';

@Injectable({ providedIn: 'root' })
export class PlacarService {
  private readonly _pontos = signal(0);

  // Componentes podem ler, mas não modificar diretamente
  readonly pontos = this._pontos.asReadonly();

  marcarPonto() {
    this._pontos.update(p => p + 1);
  }
}
```

---

## 3. Sinais Computados (Computed Signals)

São signals **somente leitura** que derivam seu valor de outros signals. Eles são:

- **Lazy**: só calculam quando lidos pela primeira vez
- **Memoizados**: reutilizam o cache se as dependências não mudaram
- **Dinâmicos**: rastreiam apenas os signals realmente lidos durante a execução
- **Somente leitura**: Não é possível usar `set()` ou `update()`.

```typescript
import { Component, signal, computed, WritableSignal, Signal } from '@angular/core';

@Component({
  selector: 'app-nome-completo',
  template: `
    <div class="p-4 max-w-sm space-y-3">
      <div class="flex flex-col gap-1">
        <label class="text-sm font-medium text-gray-700">Nome</label>
        <input #campoNome [value]="nome()" (input)="nome.set(campoNome.value)"
          class="border rounded px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400" />
      </div>
      <div class="flex flex-col gap-1">
        <label class="text-sm font-medium text-gray-700">Sobrenome</label>
        <input #campoSobrenome [value]="sobrenome()" (input)="sobrenome.set(campoSobrenome.value)"
          class="border rounded px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400" />
      </div>
      <p class="text-gray-800">Nome completo: <strong class="text-blue-700">{{ nomeCompleto() }}</strong></p>
    </div>
  `,
})
export class NomeCompletoComponent {
  nome: WritableSignal<string> = signal('Ana');
  sobrenome: WritableSignal<string> = signal('Silva');

  nomeCompleto: Signal<string> = computed(() => `${this.nome()} ${this.sobrenome()}`);
}
```

> **Sem `ngModel`**: para ligar um `<input>` a um signal, use *property binding* em `[value]` (signal → tela) e o evento `(input)` (tela → signal). A variável de template (`#campo`) dá acesso tipado ao elemento, dispensando `$event.target` e o `FormsModule`.

### Dependências dinâmicas

O `computed` rastreia **apenas** os signals lidos em cada execução:

```typescript
const mostrarDetalhes = signal(false);
const descricao = signal('Produto premium');

const info = computed(() => {
  if (mostrarDetalhes()) {
    return `Detalhes: ${descricao()}`; // descricao() só é rastreado aqui
  }
  return 'Clique para ver detalhes';
});
```

Enquanto `mostrarDetalhes` for `false`, mudanças em `descricao` **não** reprocessam `info`.

### Exemplo — Filtro de Lista

```typescript
import { Component, signal, computed } from '@angular/core';

@Component({
  selector: 'app-busca',
  template: `
    <div class="p-4 max-w-sm space-y-3">
      <input #campoBusca [value]="busca()" (input)="busca.set(campoBusca.value)" placeholder="Buscar produto..."
        class="w-full border rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400" />
      <p class="text-sm text-gray-500">{{ resultados().length }} resultado(s)</p>
      <ul class="divide-y divide-gray-200 border rounded">
        @for (item of resultados(); track item) {
          <li class="px-3 py-2 text-sm text-gray-800">{{ item }}</li>
        }
      </ul>
    </div>
  `,
})
export class BuscaComponent {
  busca = signal('');

  produtos = signal(['Notebook', 'Mouse', 'Teclado', 'Monitor', 'Headset']);

  resultados = computed(() =>
    this.produtos().filter(p =>
      p.toLowerCase().includes(this.busca().toLowerCase())
    )
  );
}
```

---

## 4. Estado Dependente com `linkedSignal`

O `linkedSignal` cria um signal **gravável** vinculado a outro estado. Diferente do `computed` (somente leitura), você pode modificar seu valor diretamente — mas ele se **reseta automaticamente** quando a fonte muda.

### O problema sem `linkedSignal`

```typescript
import { Component, signal } from '@angular/core';

@Component({
  selector: 'app-abas-problema',
  template: `
    <div class="p-4 max-w-sm space-y-3">
      <div class="flex gap-2">
        @for (aba of abas(); track aba) {
          <button (click)="selectedTab.set(aba)"
            class="bg-gray-200 hover:bg-gray-300 text-gray-800 text-sm font-medium py-1 px-3 rounded">
            {{ aba }}
          </button>
        }
      </div>
      <p class="text-gray-700">Aba ativa: <span class="font-semibold">{{ selectedTab() }}</span></p>
      <button (click)="trocarAbas()"
        class="bg-yellow-500 hover:bg-yellow-600 text-white text-sm font-medium py-1 px-3 rounded">
        Trocar conjunto de abas
      </button>
      <p class="text-red-600 text-sm font-medium">
        ⚠ Após trocar as abas, selectedTab ainda mostra "{{ selectedTab() }}"
        que pode não existir mais!
      </p>
    </div>
  `,
})
export class AbasProblemaComponent {
  abas = signal(['Início', 'Perfil', 'Config']);

  // ❌ selectedTab pode ficar inválido se abas mudar!
  selectedTab = signal(this.abas()[0]);

  trocarAbas() {
    this.abas.set(['Dashboard', 'Relatórios', 'Usuários']);
    // selectedTab ainda vale 'Início', que não existe mais!
  }
}
```

### Solução com `linkedSignal`

```typescript
import { Component, signal, linkedSignal } from '@angular/core';

@Component({
  selector: 'app-abas',
  template: `
    <div class="p-4 max-w-sm space-y-3">
      <div class="flex gap-2">
        @for (aba of abas(); track aba) {
          <button (click)="selectedTab.set(aba)"
            class="bg-blue-100 hover:bg-blue-200 text-blue-800 text-sm font-medium py-1 px-3 rounded">
            {{ aba }}
          </button>
        }
      </div>
      <p class="text-gray-700">Aba ativa: <span class="font-semibold text-blue-700">{{ selectedTab() }}</span></p>
      <button (click)="trocarAbas()"
        class="bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium py-1 px-3 rounded">
        Trocar conjunto de abas
      </button>
    </div>
  `,
})
export class AbasComponent {
  abas = signal(['Início', 'Perfil', 'Config']);

  // Reseta para a primeira aba sempre que abas() mudar
  selectedTab = linkedSignal(() => this.abas()[0]);

  trocarAbas() {
    this.abas.set(['Dashboard', 'Relatórios', 'Usuários']);
    // selectedTab volta automaticamente para 'Dashboard'
  }
}
```

### Preservando a seleção anterior

Use `source` + `computation` para manter a seleção quando ela ainda é válida:

```typescript
import { Component, signal, linkedSignal } from '@angular/core';

interface Categoria {
  id: number;
  nome: string;
}

@Component({
  selector: 'app-categorias',
  template: `
    <div class="p-4 max-w-sm space-y-3">
      <h2 class="text-xl font-bold">Categorias</h2>
      <div class="flex flex-wrap gap-2">
        @for (cat of categorias(); track cat.id) {
          <button (click)="categoriaSelecionada.set(cat)"
            class="bg-indigo-100 hover:bg-indigo-200 text-indigo-800 text-sm font-medium py-1 px-3 rounded">
            {{ cat.nome }}
          </button>
        }
      </div>
      <p class="text-gray-700">Selecionada: <strong class="text-indigo-700">{{ categoriaSelecionada().nome }}</strong></p>

      <hr class="border-gray-300" />
      <div class="flex gap-2">
        <button (click)="adicionarCategoria()"
          class="bg-green-600 hover:bg-green-700 text-white text-sm font-medium py-1 px-3 rounded">
          Adicionar Jogos
        </button>
        <button (click)="removerEletronicos()"
          class="bg-red-500 hover:bg-red-600 text-white text-sm font-medium py-1 px-3 rounded">
          Remover Eletrônicos
        </button>
      </div>
    </div>
  `,
})
export class CategoriasComponent {
  categorias = signal<Categoria[]>([
    { id: 1, nome: 'Eletrônicos' },
    { id: 2, nome: 'Livros' },
    { id: 3, nome: 'Roupas' },
  ]);

  // Mantém a categoria selecionada se ela ainda existir na nova lista;
  // caso contrário, seleciona a primeira disponível
  categoriaSelecionada = linkedSignal<Categoria[], Categoria>({
    source: this.categorias,
    computation: (novas, anterior) =>
      novas.find(c => c.id === anterior?.value.id) ?? novas[0],
  });

  adicionarCategoria() {
    this.categorias.update(cats => [...cats, { id: 4, nome: 'Jogos' }]);
    // categoriaSelecionada permanece a mesma (ainda existe na lista)
  }

  removerEletronicos() {
    this.categorias.update(cats => cats.filter(c => c.id !== 1));
    // se Eletrônicos estava selecionado, categoriaSelecionada passa para Livros
  }
}
```

### Acessando o estado anterior

No formato `source` + `computation`, o parâmetro `previous` expõe:

- `previous.source`: valor anterior do signal de origem
- `previous.value`: valor anterior do próprio `linkedSignal`

### Igualdade personalizada com `equal`

```typescript
const copiaEdicao = linkedSignal(() => this.usuarioAtivo(), {
  equal: (a, b) => a.id === b.id,
});
```

### Personalizando o `set` com `set`

A opção `set` altera o que acontece ao gravar no `linkedSignal`, por exemplo para propagar a mudança de volta à origem:

```typescript
const tempC = signal(25);

const tempF = linkedSignal(() => (tempC() * 9) / 5 + 32, {
  set: (valF) => tempC.set(((valF - 32) * 5) / 9),
});

tempF.set(212); // tempC passa a valer 100
```

---

## 5. Efeitos (Effects)

Um `effect` é uma operação que roda sempre que um ou mais signals mudam. Ele é indicado para **sincronizar estado com APIs não-reativas** (DOM, localStorage, bibliotecas de terceiros, etc.).

Os effects são executados **de forma assíncrona, durante a detecção de mudanças**, e sempre rodam **pelo menos uma vez**.

> **Regra de ouro**: sempre prefira `computed()` ou `linkedSignal()` antes de usar `effect()`.

### Quando usar

- ✅ Logging/Debugging de valores para analytics ou debugging
- ✅ Salvar em `localStorage` ou `sessionStorage`
- ✅ Sincronizar com `localStorage`, `sessionStorage` ou cookies
- ✅ Comportamento customizado de DOM que não pode ser expresso no template
- ✅ Renderização customizada (`<canvas>`, bibliotecas de gráficos, mapas, etc.)

### Quando **não** usar

- ❌ Copiar valor de um signal para outro (use `computed`)
- ❌ Derivar estado (use `computed` ou `linkedSignal`)
- ❌ Propagar estado entre signals: pode causar `ExpressionChangedAfterItHasBeenChecked` e loops infinitos

### Exemplo — Persistência no localStorage

```typescript
import { Component, signal, effect } from '@angular/core';

@Component({
  selector: 'app-notas',
  template: `
    <div class="p-4 max-w-md space-y-2">
      <h2 class="text-xl font-bold">Bloco de Notas</h2>
      <textarea #campoNota [value]="nota()" (input)="nota.set(campoNota.value)" rows="5"
        class="w-full border rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400 resize-none">
      </textarea>
      <p class="text-xs text-gray-400">💾 Salvo automaticamente</p>
    </div>
  `,
})
export class NotasComponent {
  nota = signal(localStorage.getItem('nota') ?? '');

  constructor() {
    effect(() => {
      // Executa sempre que nota() mudar
      localStorage.setItem('nota', this.nota());
    });
  }
}
```

### Effect no construtor (padrão)

Um `effect` exige um **contexto de injeção**. O local mais simples é o construtor de um componente ou serviço:

```typescript
import { Component, signal, effect } from '@angular/core';

@Component({ /* ... */ })
export class LogComponent {
  readonly pagina = signal('home');

  constructor() {
    effect(() => {
      // Roda ao menos uma vez e depois a cada mudança de pagina()
      console.log(`Usuário navegou para: ${this.pagina()}`);
    });
  }
}
```

Fora do contexto de injeção, informe um `Injector` nas opções:

```typescript
import { Component, effect, inject, Injector, signal } from '@angular/core';

@Component({ /* ... */ })
export class ContadorComponent {
  private readonly injector = inject(Injector);
  readonly count = signal(0);

  iniciarLog() {
    effect(
      () => { console.log(`The count is: ${this.count()}`); },
      { injector: this.injector }
    );
  }
}
```

### Effect com `onCleanup`

Use `onCleanup` para cancelar operações pendentes antes da próxima execução:

```typescript
effect((onCleanup) => {
  const termo = this.termoBusca();

  const timer = setTimeout(() => {
    console.log(`Buscando: ${termo}`);
  }, 500); // debounce

  onCleanup(() => clearTimeout(timer)); // cancela se o termo mudar antes de 500ms
});
```

> Para *debounce* de signals, prefira a API [`debounced`](#6-signals-com-debounce-debounced) (seção 6) em vez de implementá-lo manualmente com `effect`.

### Destruição manual com `EffectRef`

O `effect` retorna um `EffectRef` com o método `destroy()`. Combinado à opção `manualCleanup`, permite controlar o ciclo de vida explicitamente:

```typescript
const ref = effect(
  () => console.log(this.pagina()),
  { injector: this.injector, manualCleanup: true }
);

// depois, quando não for mais necessário
ref.destroy();
```

### Lendo sem rastrear com `untracked`

```typescript
import { effect, untracked } from '@angular/core';

effect(() => {
  const usuario = this.usuarioAtivo(); // rastreado — re-executa quando mudar

  // versao NÃO rastreada — mudanças em contadorAcessos não re-executam o effect
  const acessos = untracked(this.contadorAcessos);

  console.log(`${usuario} acessou ${acessos} vezes`);
});
```

### Operações de DOM com `afterRenderEffect`

Effects comuns rodam **antes** de o DOM ser atualizado. Para ler/escrever no DOM **após a renderização**, use `afterRenderEffect`, que organiza a execução em fases:

| Fase | Uso |
|---|---|
| `earlyRead` | Ler o DOM antes de escritas |
| `write` | Apenas modificar o DOM |
| `mixedReadWrite` | Ler e escrever ao mesmo tempo (fase padrão) |
| `read` | Apenas ler o DOM |

> Se nenhuma fase for informada, o callback roda em `mixedReadWrite`, o que pode prejudicar a performance. Prefira separar leituras e escritas.

`afterRenderEffect` roda **apenas no cliente** (não no servidor), e não há garantia de que o componente já tenha sido hidratado quando o callback executa.

---

## 6. Signals com Debounce (`debounced`)

> ⚠️ API **experimental**: pode mudar antes de se tornar estável.

`debounced` atrasa a reação a mudanças de um signal. Ele recebe um signal de origem e o tempo de espera, e retorna um **`Resource`** cujo valor reflete o signal de origem já "debounced". É útil, por exemplo, em campos de busca, evitando processar a cada tecla digitada.

```typescript
import { Component, debounced, signal } from '@angular/core';

@Component({
  selector: 'app-busca-debounce',
  template: `
    <input #campo [value]="query()" (input)="query.set(campo.value)" placeholder="Buscar..." />
    <p>Digitado: {{ query() }}</p>
    <p>Após debounce: {{ debouncedQuery.value() }}</p>
    @if (debouncedQuery.status() === 'loading') {
      <p>Aguardando...</p>
    }
  `,
})
export class BuscaDebounceComponent {
  query = signal('');
  debouncedQuery = debounced(this.query, 300); // espera 300 ms
}
```

### Status e valor

- Enquanto o temporizador está correndo, `status()` é `'loading'` e `value()` mantém o **último valor resolvido**
- Ao expirar, `status()` passa para `'resolved'`
- Se o signal de origem lançar erro, `status()` vira `'error'` imediatamente, sem esperar

### Tempo de espera customizado

Em vez de milissegundos, é possível passar uma **função que retorna `Promise<void>`**. Ela recebe o valor atual e o último *snapshot*, permitindo lógicas como atraso dinâmico conforme a entrada ou tratamento após erros.

### Igualdade

Por padrão usa `Object.is`; use a opção `equal` para comparações customizadas.

### Contexto de injeção

`debounced` deve ser chamado em um contexto de injeção (por exemplo, na inicialização de campos ou no construtor). Fora dele, informe um `Injector` nas opções. O Angular destrói o resource e cancela temporizadores pendentes quando o injector é destruído.

---

## 7. Contexto Reativo

Um **contexto reativo** é um ambiente onde o Angular monitora automaticamente quais signals são lidos para estabelecer dependências. Quando um signal rastreado muda, o Angular re-executa o consumidor.

O Angular entra automaticamente em contexto reativo quando:

| Contexto | Rastreado? |
|---|---|
| Template (`{{ sinal() }}`) | ✅ Sim |
| `computed(() => ...)` | ✅ Sim |
| `linkedSignal(() => ...)` | ✅ Sim |
| `effect(() => ...)` | ✅ Sim |
| `ngOnInit`, métodos comuns | ❌ Não |
| Após `await` em effect | ❌ Não |

### Onde existe contexto reativo

```typescript
// ✅ computed() — contexto reativo
const nomeCompleto = computed(() => {
  return `${nome()} ${sobrenome()}`; // nome e sobrenome são rastreados
});

// ✅ effect() — contexto reativo
effect(() => {
  console.log(this.pagina()); // pagina é rastreado, re-executa ao mudar
});

// ✅ Template — contexto reativo
// {{ pagina() }} → Angular rastreia e atualiza a view automaticamente
```

### Onde NÃO existe contexto reativo

```typescript
// ❌ ngOnInit — não é contexto reativo
ngOnInit() {
  console.log(this.pagina()); // lê o valor, mas NÃO rastreia
}

// ❌ método comum — não é contexto reativo
calcular() {
  return this.preco() * 1.1; // lê, mas não re-executa quando preco mudar
}
```

### Cuidado com operações assíncronas

O contexto reativo é **síncrono** — signals lidos após um `await` **não são rastreados**:

```typescript
// ❌ tema() não será rastreado
effect(async () => {
  const dados = await buscarDados();
  console.log(`Tema: ${this.tema()}`); // lido após await — sem rastreamento!
});

// ✅ ler o signal antes do await
effect(async () => {
  const temaAtual = this.tema(); // rastreado (lido antes do await)
  const dados = await buscarDados();
  console.log(`Tema: ${temaAtual}`);
});
```

### Garantindo que não há contexto reativo

`assertNotInReactiveContext()` lança um erro se a função for chamada dentro de um contexto reativo. É útil em APIs que não devem ser executadas em `computed`/`effect`:

```typescript
import { assertNotInReactiveContext } from '@angular/core';

function salvar(dado: string) {
  assertNotInReactiveContext(salvar);
  // ...
}
```

---

## 8. Resumo: Qual API usar?

| API | Gravável? | Quando usar |
|---|---|---|
| `signal()` | ✅ Sim | Estado independente |
| `computed()` | ❌ Não | Valor derivado de outros signals |
| `linkedSignal()` | ✅ Sim | Estado derivado que também pode ser modificado |
| `debounced()` | ❌ Não | Atrasar a reação a mudanças de um signal (experimental) |
| `effect()` | N/A | Sincronizar com APIs não-reativas (última opção) |
| `afterRenderEffect()` | N/A | Ler/escrever no DOM após a renderização (somente cliente) |

---

## Referências

- [Angular Signals](https://angular.dev/guide/signals)
- [linkedSignal](https://angular.dev/guide/signals/linked-signal)
- [Debounced](https://angular.dev/guide/signals/debounced)
- [Effects](https://angular.dev/guide/signals/effect)
