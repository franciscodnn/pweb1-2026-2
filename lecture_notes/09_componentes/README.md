[main](../../README.md)

# Aula 9 - Componentes no Angular

## 1. Anatomia de um Componente

Os componentes são os blocos fundamentais de uma aplicação Angular. Cada componente Angular é composto por:

- Uma **classe TypeScript** com a lógica e os dados
- Um **template HTML** que define a interface
- Um **seletor CSS** que determina como o componente é usado em outros templates

```typescript
import { Component, signal } from '@angular/core';

@Component({
  selector: 'app-perfil',
  standalone: true,
  template: `
    <div class="p-4 bg-white rounded shadow">
      <h2 class="text-xl font-bold text-gray-800">{{ nome() }}</h2>
      <p class="text-gray-500">{{ cargo() }}</p>
    </div>
  `,
})
export class PerfilComponent {
  nome  = signal('Ana Costa');
  cargo = signal('Desenvolvedora Front-end');
}
```

### Usando o componente em outro template

Para usar um componente, importe-o no array `imports` do componente pai:

```typescript
import { Component } from '@angular/core';
import { PerfilComponent } from './perfil.component';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [PerfilComponent],
  template: `
    <div class="min-h-screen bg-gray-100 p-8">
      <app-perfil />
    </div>
  `,
})
export class AppComponent {}
```

### Template e estilos em arquivos separados

```typescript
@Component({
  selector: 'app-perfil',
  standalone: true,
  templateUrl: './perfil.html',
  styleUrl: './perfil.css',
})
export class PerfilComponent {}
```

> Os caminhos `templateUrl` e `styleUrl` são **relativos** ao diretório do componente.

---

## 2. Seletores

O seletor define como o componente é instanciado em templates. O Angular suporta três tipos:

### Seletor de elemento (mais comum)

```typescript
@Component({ selector: 'app-botao', ... })

// Uso:
<app-botao />
```

### Seletor de atributo

Útil para estender elementos HTML nativos, aproveitando suas APIs (como atributos ARIA):

```typescript
@Component({ selector: 'button[app-primario]', ... })

// Uso:
<button app-primario>Enviar</button>
```

### Seletor de classe CSS

```typescript
@Component({ selector: '.app-destaque', ... })

// Uso:
<div class="app-destaque"></div>
```

### Boas práticas para seletores

- Use sempre um **prefixo** curto e consistente (ex.: `app-`). O Angular reserva o prefixo `ng-`.
- Seletores de **elemento** são recomendados na maioria dos casos.
- Use seletores de **atributo** para componentes que "aprimoram" um elemento HTML nativo.
- Todos os seletores são **case-sensitive**.

---

## 3. Estilização

### Estilos inline no `@Component`

Os estilos são **encapsulados** por padrão: só afetam o template do próprio componente.

```typescript
@Component({
  selector: 'app-alerta',
  standalone: true,
  template: `
    <div class="alerta">
      <ng-content />
    </div>
  `,
  styles: [`
    .alerta {
      border-left: 4px solid #f59e0b;
      background: #fffbeb;
      padding: 12px 16px;
      border-radius: 4px;
    }
  `],
})
export class AlertaComponent {}
```

### Estilização com Tailwind (abordagem recomendada)

Com Tailwind CSS, você estiliza diretamente no template e não precisa de estilos encapsulados:

```typescript
import { Component } from '@angular/core';

@Component({
  selector: 'app-badge',
  standalone: true,
  template: `
    <span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
      Ativo
    </span>
  `,
})
export class BadgeComponent {}
```

### Modos de encapsulamento (`ViewEncapsulation`)

| Modo | Comportamento |
|---|---|
| `Emulated` (padrão) | Estilos do componente não vazam; usa atributos HTML gerados |
| `ShadowDom` | Usa Shadow DOM nativo do browser |
| `None` | Sem encapsulamento — estilos tornam-se globais |

```typescript
import { Component, ViewEncapsulation } from '@angular/core';

@Component({
  selector: 'app-exemplo',
  standalone: true,
  template: `<p class="titulo">Olá</p>`,
  styles: [`.titulo { color: red; }`],
  encapsulation: ViewEncapsulation.None, // estilos globais
})
export class ExemploComponent {}
```

### Seletor `:host`

Use `:host` para estilizar o **elemento hospedeiro** do próprio componente:

```typescript
@Component({
  styles: [`
    :host {
      display: block;
      padding: 16px;
    }
    :host(.destaque) {
      border: 2px solid #3b82f6;
    }
  `],
})
```

---

## 4. Inputs — Recebendo Dados do Pai

Use a função `input()` para declarar propriedades que recebem valores do componente pai. O retorno é um **signal somente leitura** (`InputSignal`).

### Exemplo básico

```typescript
// app-cartao.component.ts
import { Component, input, computed } from '@angular/core';

@Component({
  selector: 'app-cartao',
  standalone: true,
  template: `
    <div class="border rounded-lg p-4 shadow-sm bg-white">
      <h3 class="text-lg font-semibold text-gray-800">{{ titulo() }}</h3>
      <p class="text-gray-500 mt-1">{{ descricao() }}</p>
      <span class="text-xs font-medium text-blue-600 uppercase">{{ categoriaFormatada() }}</span>
    </div>
  `,
})
export class CartaoComponent {
  titulo    = input.required<string>();  // obrigatório
  descricao = input('Sem descrição');    // com valor padrão
  categoria = input('geral');

  categoriaFormatada = computed(() => this.categoria().toUpperCase());
}
```

```typescript
// app.component.ts
import { Component } from '@angular/core';
import { CartaoComponent } from './app-cartao.component';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CartaoComponent],
  template: `
    <div class="p-6 space-y-4">
      <app-cartao titulo="Angular Signals" categoria="frontend" />
      <app-cartao
        titulo="TypeScript Avançado"
        descricao="Genéricos, decorators e muito mais."
        categoria="linguagem" />
    </div>
  `,
})
export class AppComponent {}
```

### Input com `transform`

Use `transform` para converter o valor recebido antes de usá-lo. O Angular oferece `booleanAttribute` e `numberAttribute` como helpers embutidos:

```typescript
import { Component, input, booleanAttribute, numberAttribute } from '@angular/core';

@Component({
  selector: 'app-progresso',
  standalone: true,
  template: `
    <div class="w-full bg-gray-200 rounded-full h-3">
      <div
        class="h-3 rounded-full transition-all"
        [class]="disabled() ? 'bg-gray-400' : 'bg-blue-600'"
        [style.width.%]="valor()">
      </div>
    </div>
    <p class="text-sm text-gray-600 mt-1">
      {{ valor() }}%{{ disabled() ? ' (desativado)' : '' }}
    </p>
  `,
})
export class ProgressoComponent {
  valor    = input(0,     { transform: numberAttribute });  // '75' → 75
  disabled = input(false, { transform: booleanAttribute }); // '' → true
}
```

```html
<!-- no template pai -->
<app-progresso valor="75" />
<app-progresso valor="40" disabled />
```

### Input com alias

```typescript
export class CartaoComponent {
  // No TypeScript usa-se `titulo`, mas no template pai usa-se [cardTitle]
  titulo = input('', { alias: 'cardTitle' });
}
```

```html
<app-cartao cardTitle="Meu Cartão" />
```

---

## 5. Modelos — Two-way Binding com `model()`

Um **model input** é um tipo especial de input que permite ao componente filho **propagar novos valores de volta ao pai**. É a abordagem moderna para implementar two-way binding (`[(propriedade)]`) em componentes customizados.

Diferenças em relação ao `input()`:

| | `input()` | `model()` |
|---|---|---|
| Direção | Pai → Filho | Pai ↔ Filho |
| Gravável pelo filho | ❌ Não | ✅ Sim |
| Gera output automático | ❌ Não | ✅ Sim (`xChange`) |
| Sintaxe no pai | `[prop]` | `[(prop)]` |

### Exemplo — campo de texto reutilizável

```typescript
// app-campo.component.ts
import { Component, model } from '@angular/core';

@Component({
  selector: 'app-campo',
  standalone: true,
  template: `
    <div class="flex flex-col gap-1">
      <label class="text-sm font-medium text-gray-700">{{ rotulo }}</label>
      <input
        [value]="valor()"
        (input)="valor.set($any($event.target).value)"
        class="border rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400" />
    </div>
  `,
})
export class CampoComponent {
  rotulo = input('Campo');

  // model() cria automaticamente um output `valorChange`
  valor = model('');
}
```

```typescript
// app.component.ts
import { Component, signal, computed } from '@angular/core';
import { CampoComponent } from './app-campo.component';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CampoComponent],
  template: `
    <div class="p-6 max-w-sm space-y-4">
      <h2 class="text-xl font-bold text-gray-800">Cadastro</h2>

      <!-- [(valor)] usa o two-way binding gerado automaticamente pelo model() -->
      <app-campo rotulo="Nome" [(valor)]="nome" />
      <app-campo rotulo="Sobrenome" [(valor)]="sobrenome" />

      <div class="p-3 bg-blue-50 border border-blue-200 rounded">
        <p class="text-sm text-blue-800">
          Nome completo: <strong>{{ nomeCompleto() }}</strong>
        </p>
      </div>
    </div>
  `,
})
export class AppComponent {
  nome      = signal('');
  sobrenome = signal('');

  nomeCompleto = computed(() => `${this.nome()} ${this.sobrenome()}`.trim());
}
```

### Como funciona o two-way binding

Quando você declara `valor = model('')`, o Angular gera automaticamente um output chamado `valorChange`. A sintaxe `[(valor)]` é equivalente a:

```html
<!-- [(valor)]="nome" é açúcar sintático para: -->
<app-campo [valor]="nome" (valorChange)="nome.set($event)" />
```

### Model obrigatório e alias

```typescript
export class CampoComponent {
  // model obrigatório
  valor = model.required<string>();

  // model com alias
  texto = model('', { alias: 'conteudo' });
  // no template pai: [(conteudo)]="meuSignal"
}
```

### Quando usar `model()` vs `input()` + `output()`

- Use **`model()`** quando o componente representa um controle de formulário (input, select, checkbox) ou qualquer UI que o usuário modifica diretamente.
- Use **`input()` + `output()`** quando a comunicação pai→filho e filho→pai envolve eventos semânticamente distintos (ex.: `[tarefa]` + `(tarefaRemovida)`).

---

## 6. Outputs — Emitindo Eventos para o Pai

Use a função `output()` para declarar eventos customizados que o componente filho envia ao pai.

### Exemplo básico

```typescript
// app-avaliacao.component.ts
import { Component, output, signal } from '@angular/core';

@Component({
  selector: 'app-avaliacao',
  standalone: true,
  template: `
    <div class="flex gap-1">
      @for (estrela of estrelas; track estrela) {
        <button
          (click)="selecionar(estrela)"
          class="text-2xl transition-transform hover:scale-125"
          [class]="estrela <= nota() ? 'text-yellow-400' : 'text-gray-300'">
          ★
        </button>
      }
    </div>
    <p class="text-sm text-gray-500 mt-1">Nota selecionada: {{ nota() }}</p>
  `,
})
export class AvaliacaoComponent {
  nota    = signal(0);
  estrelas = [1, 2, 3, 4, 5];

  // Emite a nota escolhida para o componente pai
  notaSelecionada = output<number>();

  selecionar(valor: number) {
    this.nota.set(valor);
    this.notaSelecionada.emit(valor);
  }
}
```

```typescript
// app.component.ts
import { Component, signal } from '@angular/core';
import { AvaliacaoComponent } from './app-avaliacao.component';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [AvaliacaoComponent],
  template: `
    <div class="p-6 max-w-sm space-y-4">
      <h2 class="text-xl font-bold">Avalie o produto</h2>
      <app-avaliacao (notaSelecionada)="registrarNota($event)" />

      @if (mensagem()) {
        <p class="text-green-700 font-medium">{{ mensagem() }}</p>
      }
    </div>
  `,
})
export class AppComponent {
  mensagem = signal('');

  registrarNota(nota: number) {
    this.mensagem.set(`Você deu ${nota} estrela(s). Obrigado!`);
  }
}
```

### Output com alias

```typescript
export class AvaliacaoComponent {
  notaSelecionada = output<number>({ alias: 'ratingChanged' });
}
```

```html
<app-avaliacao (ratingChanged)="registrarNota($event)" />
```

---

## 7. Lifecycle Hooks — Ciclo de Vida

O Angular chama métodos específicos ao longo da vida do componente. Implemente as interfaces correspondentes para garantir segurança de tipos.

### Tabela de hooks

| Hook | Quando é chamado |
|---|---|
| `constructor` | Ao instanciar a classe (antes dos inputs) |
| `ngOnInit` | Uma vez, após os inputs serem inicializados |
| `ngOnChanges` | Sempre que um input muda (inclusive na inicialização) |
| `ngOnDestroy` | Uma vez, antes de destruir o componente |
| `ngAfterViewInit` | Uma vez, após a view do componente ser inicializada |
| `ngDoCheck` | A cada ciclo de detecção de mudanças (use com cautela) |

### Ordem de execução na inicialização

```
constructor → ngOnChanges → ngOnInit → ngDoCheck → ngAfterViewInit
```

### Exemplo — `ngOnInit` e `ngOnDestroy`

```typescript
import { Component, input, OnInit, OnDestroy } from '@angular/core';

@Component({
  selector: 'app-timer',
  standalone: true,
  template: `
    <div class="p-4 bg-gray-100 rounded-lg text-center">
      <p class="text-sm text-gray-500">Componente: <strong>{{ nome() }}</strong></p>
      <p class="text-4xl font-mono font-bold text-blue-700">{{ segundos() }}</p>
      <p class="text-xs text-gray-400 mt-1">segundos ativos</p>
    </div>
  `,
})
export class TimerComponent implements OnInit, OnDestroy {
  nome     = input('Timer');
  segundos = signal(0);

  private intervalo: ReturnType<typeof setInterval> | null = null;

  ngOnInit() {
    // Inicia o contador após os inputs estarem disponíveis
    this.intervalo = setInterval(() => this.segundos.update(s => s + 1), 1000);
    console.log(`Timer "${this.nome()}" iniciado.`);
  }

  ngOnDestroy() {
    // Limpa recursos para evitar vazamentos de memória
    if (this.intervalo) clearInterval(this.intervalo);
    console.log(`Timer "${this.nome()}" destruído.`);
  }
}
```

```typescript
// app.component.ts
import { Component, signal } from '@angular/core';
import { TimerComponent } from './app-timer.component';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [TimerComponent],
  template: `
    <div class="p-6 space-y-4">
      <button
        (click)="mostrar.set(!mostrar())"
        class="bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded">
        {{ mostrar() ? 'Remover' : 'Mostrar' }} Timer
      </button>

      @if (mostrar()) {
        <app-timer nome="Contador Principal" />
      }
    </div>
  `,
})
export class AppComponent {
  mostrar = signal(true);
}
```

> Alterne o botão e observe no console: `ngOnInit` e `ngOnDestroy` são chamados corretamente.

### Exemplo — `ngOnChanges`

```typescript
import { Component, input, signal, OnChanges, SimpleChanges } from '@angular/core';

@Component({
  selector: 'app-log-mudancas',
  standalone: true,
  template: `
    <div class="p-3 bg-yellow-50 border border-yellow-200 rounded">
      <p class="font-medium text-yellow-800">Histórico de mudanças:</p>
      <ul class="mt-2 space-y-1">
        @for (log of historico(); track log) {
          <li class="text-sm text-yellow-700">{{ log }}</li>
        }
      </ul>
    </div>
  `,
})
export class LogMudancasComponent implements OnChanges {
  valor    = input<string>('');
  historico = signal<string[]>([]);

  ngOnChanges(changes: SimpleChanges) {
    if (changes['valor']) {
      const { previousValue, currentValue, firstChange } = changes['valor'];
      const entrada = firstChange
        ? `Valor inicial: "${currentValue}"`
        : `"${previousValue}" → "${currentValue}"`;
      this.historico.update(h => [...h, entrada]);
    }
  }
}
```

```typescript
// app.component.ts
import { Component, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { LogMudancasComponent } from './app-log-mudancas.component';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [FormsModule, LogMudancasComponent],
  template: `
    <div class="p-6 max-w-sm space-y-4">
      <input
        [ngModel]="texto()"
        (ngModelChange)="texto.set($event)"
        placeholder="Digite algo..."
        class="w-full border rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400" />
      <app-log-mudancas [valor]="texto()" />
    </div>
  `,
})
export class AppComponent {
  texto = signal('');
}
```

---

## 8. Exemplo Completo — Lista de Recados

Aplicação dos conceitos: inputs, outputs, lifecycle hooks e Tailwind.

```typescript
// app-recado-item.component.ts
import { Component, input, output } from '@angular/core';

@Component({
  selector: 'app-recado-item',
  standalone: true,
  template: `
    <li class="flex items-center justify-between px-4 py-3 bg-white border rounded-lg shadow-sm">
      <span class="text-gray-800"
        [class.line-through]="lido()"
        [class.text-gray-400]="lido()">
        {{ texto() }}
      </span>
      <div class="flex gap-2">
        <button
          (click)="marcarLido.emit(id())"
          class="text-xs bg-green-100 hover:bg-green-200 text-green-700 font-medium py-1 px-2 rounded">
          {{ lido() ? 'Desmarcar' : 'Lido' }}
        </button>
        <button
          (click)="remover.emit(id())"
          class="text-xs bg-red-100 hover:bg-red-200 text-red-700 font-medium py-1 px-2 rounded">
          Remover
        </button>
      </div>
    </li>
  `,
})
export class RecadoItemComponent {
  id    = input.required<number>();
  texto = input.required<string>();
  lido  = input(false);

  marcarLido = output<number>();
  remover    = output<number>();
}
```

```typescript
// app-lista-recados.component.ts
import { Component, signal, computed, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RecadoItemComponent } from './app-recado-item.component';

interface Recado {
  id: number;
  texto: string;
  lido: boolean;
}

@Component({
  selector: 'app-lista-recados',
  standalone: true,
  imports: [FormsModule, RecadoItemComponent],
  template: `
    <div class="max-w-lg mx-auto p-6 space-y-4">
      <h1 class="text-2xl font-bold text-gray-800">📝 Recados</h1>

      <!-- Formulário -->
      <div class="flex gap-2">
        <input
          [ngModel]="novoTexto()"
          (ngModelChange)="novoTexto.set($event)"
          (keyup.enter)="adicionar()"
          placeholder="Novo recado..."
          class="flex-1 border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400" />
        <button
          (click)="adicionar()"
          [disabled]="!novoTexto().trim()"
          class="bg-blue-600 hover:bg-blue-700 disabled:opacity-40 text-white font-medium py-2 px-4 rounded-lg text-sm">
          Adicionar
        </button>
      </div>

      <!-- Estatísticas -->
      <div class="flex gap-4 text-sm text-gray-500">
        <span>Total: <strong>{{ recados().length }}</strong></span>
        <span>Lidos: <strong class="text-green-600">{{ totalLidos() }}</strong></span>
        <span>Pendentes: <strong class="text-yellow-600">{{ recados().length - totalLidos() }}</strong></span>
      </div>

      <!-- Lista -->
      <ul class="space-y-2">
        @for (recado of recados(); track recado.id) {
          <app-recado-item
            [id]="recado.id"
            [texto]="recado.texto"
            [lido]="recado.lido"
            (marcarLido)="alternarLido($event)"
            (remover)="removerRecado($event)" />
        } @empty {
          <p class="text-center text-gray-400 py-8">Nenhum recado ainda.</p>
        }
      </ul>

      <!-- Limpar lidos -->
      @if (totalLidos() > 0) {
        <button
          (click)="limparLidos()"
          class="w-full text-sm text-gray-500 hover:text-red-600 underline">
          Remover todos os lidos
        </button>
      }
    </div>
  `,
})
export class ListaRecadosComponent implements OnInit {
  recados   = signal<Recado[]>([]);
  novoTexto = signal('');
  proximoId = 1;

  totalLidos = computed(() => this.recados().filter(r => r.lido).length);

  ngOnInit() {
    const salvos = localStorage.getItem('recados');
    if (salvos) this.recados.set(JSON.parse(salvos));
  }

  adicionar() {
    if (!this.novoTexto().trim()) return;
    this.recados.update(lista => [
      ...lista,
      { id: this.proximoId++, texto: this.novoTexto().trim(), lido: false },
    ]);
    this.novoTexto.set('');
    this.salvar();
  }

  alternarLido(id: number) {
    this.recados.update(lista =>
      lista.map(r => r.id === id ? { ...r, lido: !r.lido } : r)
    );
    this.salvar();
  }

  removerRecado(id: number) {
    this.recados.update(lista => lista.filter(r => r.id !== id));
    this.salvar();
  }

  limparLidos() {
    this.recados.update(lista => lista.filter(r => !r.lido));
    this.salvar();
  }

  private salvar() {
    localStorage.setItem('recados', JSON.stringify(this.recados()));
  }
}
```

---

## 9. Resumo

| Conceito | API Angular | Quando usar |
|---|---|---|
| Estado reativo | `signal()` | Qualquer propriedade que a UI deve observar |
| Dados de entrada (pai → filho) | `input()` / `input.required()` | Passar configuração ou dados para o filho |
| Two-way binding (pai ↔ filho) | `model()` / `model.required()` | Controles de formulário e UI editável |
| Eventos de saída (filho → pai) | `output()` | Notificar o pai sobre ações do usuário |
| Transformar input | `input(val, { transform })` | Converter tipos (string → number, boolean) |
| Alias de input/output/model | `input(val, { alias })` | Nomear diferente no template e no TypeScript |
| Inicialização | `ngOnInit` | Código que depende dos inputs iniciais |
| Reagir a mudanças de input | `ngOnChanges` | Lógica baseada em mudanças de inputs |
| Limpeza de recursos | `ngOnDestroy` | Cancelar timers, subscriptions, etc. |

---

## Referências

- [Anatomy of a component](https://angular.dev/guide/components)
- [Component selectors](https://angular.dev/guide/components/selectors)
- [Styling components](https://angular.dev/guide/components/styling)
- [Inputs](https://angular.dev/guide/components/inputs)
- [Model inputs](https://angular.dev/guide/components/inputs#model-inputs)
- [Outputs](https://angular.dev/guide/components/outputs)
- [Lifecycle](https://angular.dev/guide/components/lifecycle)
