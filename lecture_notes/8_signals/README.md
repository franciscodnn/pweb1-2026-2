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
  standalone: true,
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
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-nome-completo',
  standalone: true,
  imports: [FormsModule],
  template: `
    <div class="p-4 max-w-sm space-y-3">
      <div class="flex flex-col gap-1">
        <label class="text-sm font-medium text-gray-700">Nome</label>
        <input [(ngModel)]="nome"
          class="border rounded px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400" />
      </div>
      <div class="flex flex-col gap-1">
        <label class="text-sm font-medium text-gray-700">Sobrenome</label>
        <input [(ngModel)]="sobrenome"
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
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-busca',
  standalone: true,
  imports: [FormsModule],
  template: `
    <div class="p-4 max-w-sm space-y-3">
      <input [ngModel]="busca()" (ngModelChange)="busca.set($event)" placeholder="Buscar produto..."
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
  standalone: true,
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
  standalone: true,
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
  standalone: true,
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

---

## 5. Efeitos (Effects)

Um `effect` é uma operação que roda sempre que um ou mais signals mudam. Ele é indicado para **sincronizar estado com APIs não-reativas** (DOM, localStorage, bibliotecas de terceiros, etc.).

> **Regra de ouro**: sempre prefira `computed()` ou `linkedSignal()` antes de usar `effect()`.

### Quando usar

- ✅ Logging/Debugging de valores para analytics ou debugging
- ✅ Salvar em `localStorage` ou `sessionStorage`
- ✅ Integrar com bibliotecas externas (gráficos, mapas, etc.)

### Quando **não** usar

- ❌ Copiar valor de um signal para outro (use `computed`)
- ❌ Derivar estado (use `computed` ou `linkedSignal`)

### Exemplo — Persistência no localStorage

```typescript
import { Component, signal, effect } from '@angular/core';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-notas',
  standalone: true,
  imports: [FormsModule],
  template: `
    <div class="p-4 max-w-md space-y-2">
      <h2 class="text-xl font-bold">Bloco de Notas</h2>
      <textarea [ngModel]="nota()" (ngModelChange)="nota.set($event)" rows="5"
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

```typescript
import { Component, signal, effect } from '@angular/core';

@Component({ /* ... */ })
export class LogComponent {
  readonly pagina = signal('home');

  constructor() {
    effect(() => {
      // Roda uma vez imediatamente e depois a cada mudança de pagina()
      console.log(`Usuário navegou para: ${this.pagina()}`);
    });
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

## 6. Contexto Reativo

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

---

## 7. Resumo: Qual API usar?

| API | Gravável? | Quando usar |
|---|---|---|
| `signal()` | ✅ Sim | Estado independente |
| `computed()` | ❌ Não | Valor derivado de outros signals |
| `linkedSignal()` | ✅ Sim | Estado derivado que também pode ser modificado |
| `effect()` | N/A | Sincronizar com APIs não-reativas (última opção) |

---

## Referências

- [Angular Signals](https://next.angular.dev/guide/signals)
- [linkedSignal](https://next.angular.dev/guide/signals/linked-signal)
- [Effects](https://next.angular.dev/guide/signals/effect)
