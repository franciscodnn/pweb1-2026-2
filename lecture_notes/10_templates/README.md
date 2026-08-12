[main](../../README.md)

# Aula 10 - Templates no Angular v20

## 1. Introdução aos Templates

Os templates no Angular são arquivos HTML que definem a interface do usuário de um componente. Eles combinam HTML tradicional com sintaxe específica do Angular para criar interfaces dinâmicas e reativas.

### Características principais:
- **HTML válido** com extensões específicas do Angular
- **Interpolação** para exibir dados
- **Binding de propriedades** para controlar elementos
- **Event binding** para responder a interações
- **Controle de fluxo** (`@if`, `@for`, `@switch`) para lógica condicional e de repetição
- **Pipes** para transformar dados

### Template básico:

```typescript
import { Component, signal } from '@angular/core';
import { DatePipe } from '@angular/common';

@Component({
  selector: 'app-exemplo-basico',
  standalone: true,
  imports: [DatePipe],
  template: `
    <div class="p-6">
      <h1 class="text-3xl font-bold text-gray-800">{{ titulo() }}</h1>
      <p class="text-gray-600">Bem-vindo, {{ usuario().nome }}!</p>
      <p class="text-sm text-gray-400">Data atual: {{ dataAtual | date:'dd/MM/yyyy' }}</p>
    </div>
  `
})
export class ExemploBasicoComponent {
  titulo = signal('Minha Aplicação Angular v20');
  usuario = signal({ nome: 'João Silva', idade: 30 });
  dataAtual = new Date();
}
```

---

## 2. Data Binding (Vinculação de Dados)

O Angular oferece diferentes tipos de binding para conectar o template com a lógica do componente.

### 2.1 Interpolação (`{{ }}`)

A interpolação exibe valores de propriedades do componente diretamente no template:

```typescript
import { Component, signal, computed } from '@angular/core';

@Component({
  selector: 'app-interpolacao',
  standalone: true,
  template: `
    <div class="p-6 space-y-2">
      <h2 class="text-2xl font-bold text-gray-700">Exemplos de Interpolação</h2>

      <p class="text-gray-600">Nome: <span class="font-semibold">{{ nome() }}</span></p>
      <p class="text-gray-600">Idade: <span class="font-semibold">{{ idade() }}</span></p>
      <p class="text-gray-600">Ano de nascimento: {{ 2026 - idade() }}</p>
      <p class="text-gray-600">Nome em maiúsculas: {{ nome().toUpperCase() }}</p>
      <p class="text-indigo-600 font-medium">{{ saudacao() }}</p>
      <p class="text-gray-600">
        Status: {{ idade() >= 18 ? 'Adulto' : 'Menor de idade' }}
      </p>
    </div>
  `
})
export class InterpolacaoComponent {
  nome = signal('Maria Santos');
  idade = signal(25);

  saudacao = computed(() => `Olá, ${this.nome()}! Você tem ${this.idade()} anos.`);
}
```

### 2.2 Property Binding (`[propriedade]`)

O property binding define valores de propriedades de elementos HTML ou componentes dinamicamente:

```typescript
import { Component, signal } from '@angular/core';

@Component({
  selector: 'app-property-binding',
  standalone: true,
  template: `
    <div class="p-6 space-y-4">
      <h2 class="text-2xl font-bold text-gray-700">Exemplos de Property Binding</h2>

      <!-- Binding de atributos HTML -->
      <img [src]="imagemUrl()" [alt]="imagemAlt()" class="rounded shadow w-48">

      <!-- Binding de propriedades -->
      <input
        [value]="textoInput()"
        [disabled]="inputDesabilitado()"
        class="border rounded px-3 py-2 w-full max-w-sm disabled:opacity-50">

      <!-- Binding de classes CSS -->
      <div
        [class.border-green-500]="estaAtivo()"
        [class.bg-yellow-100]="temDestaque()"
        class="border-2 p-3 rounded">
        Status do elemento
      </div>

      <!-- Controle de botão -->
      <button
        [disabled]="botaoDesabilitado()"
        (click)="alternarBotao()"
        class="px-4 py-2 bg-blue-600 text-white rounded disabled:opacity-40">
        {{ botaoDesabilitado() ? 'Botão Desabilitado' : 'Botão Habilitado' }}
      </button>
    </div>
  `
})
export class PropertyBindingComponent {
  imagemUrl = signal('https://placehold.co/200x150');
  imagemAlt = signal('Imagem de exemplo');
  textoInput = signal('Texto inicial');
  inputDesabilitado = signal(false);
  estaAtivo = signal(true);
  temDestaque = signal(false);
  botaoDesabilitado = signal(false);

  alternarBotao() {
    this.botaoDesabilitado.update(v => !v);
  }
}
```

### 2.3 Attribute Binding (`[attr.atributo]`)

Para atributos HTML que não têm propriedades correspondentes no DOM:

```typescript
import { Component, signal } from '@angular/core';

@Component({
  selector: 'app-attribute-binding',
  standalone: true,
  template: `
    <div class="p-6 space-y-4">
      <h2 class="text-2xl font-bold text-gray-700">Attribute Binding</h2>

      <!-- Atributos de acessibilidade -->
      <button
        [attr.aria-label]="botaoLabel()"
        [attr.aria-pressed]="botaoPressionado()"
        class="px-4 py-2 bg-indigo-600 text-white rounded">
        {{ botaoTexto() }}
      </button>

      <!-- Atributos data -->
      <div
        [attr.data-id]="elementoId()"
        [attr.data-categoria]="categoria()"
        class="p-3 border rounded text-sm text-gray-600">
        Elemento com data attributes
      </div>

      <!-- Atributos condicionais -->
      <input
        [attr.required]="campoObrigatorio() ? '' : null"
        [attr.readonly]="campoSomenteLeitura() ? '' : null"
        class="border rounded px-3 py-2"
        placeholder="Campo de exemplo">
    </div>
  `
})
export class AttributeBindingComponent {
  botaoLabel = signal('Clique para alternar');
  botaoPressionado = signal(false);
  botaoTexto = signal('Alternar Estado');
  elementoId = signal('elemento-123');
  categoria = signal('categoria-a');
  campoObrigatorio = signal(true);
  campoSomenteLeitura = signal(false);
}
```

---

## 3. Event Binding (Vinculação de Eventos)

O event binding permite responder a eventos do usuário ou do DOM:

```typescript
import { Component, signal } from '@angular/core';

@Component({
  selector: 'app-event-binding',
  standalone: true,
  template: `
    <div class="p-6 space-y-4">
      <h2 class="text-2xl font-bold text-gray-700">Exemplos de Event Binding</h2>

      <!-- Eventos de clique -->
      <div class="flex gap-3">
        <button (click)="onClique()" class="px-4 py-2 bg-blue-600 text-white rounded">
          Clique simples
        </button>
        <button (click)="onCliqueComParametro('Olá!')" class="px-4 py-2 bg-purple-600 text-white rounded">
          Clique com parâmetro
        </button>
      </div>

      <!-- Eventos de mouse -->
      <div
        (mouseenter)="onMouseEnter()"
        (mouseleave)="onMouseLeave()"
        [class.bg-blue-50]="mouseOver()"
        class="p-4 border rounded transition-colors cursor-pointer">
        Passe o mouse aqui
      </div>

      <!-- Eventos de teclado -->
      <input
        (keyup)="onTeclaLiberada($event)"
        (keyup.enter)="onEnter()"
        (keyup.escape)="onEscape()"
        [value]="textoDigitado()"
        placeholder="Digite algo..."
        class="border rounded px-3 py-2 w-full max-w-sm">

      <!-- Eventos de foco -->
      <input
        (focus)="onFocus()"
        (blur)="onBlur()"
        placeholder="Campo com foco"
        class="border rounded px-3 py-2 w-full max-w-sm"
        [class.ring-2]="temFoco()"
        [class.ring-blue-400]="temFoco()">

      <!-- Resultado -->
      <div class="bg-gray-50 p-4 rounded text-sm space-y-1">
        <p>Última ação: <span class="font-medium text-indigo-600">{{ ultimaAcao() }}</span></p>
        <p>Contador: <span class="font-bold text-blue-600">{{ contadorCliques() }}</span></p>
        <p>Texto digitado: <span class="font-medium">{{ textoDigitado() }}</span></p>
        <p>Foco: <span class="font-medium">{{ temFoco() ? 'Com foco' : 'Sem foco' }}</span></p>
      </div>
    </div>
  `
})
export class EventBindingComponent {
  ultimaAcao = signal('Nenhuma ação realizada');
  contadorCliques = signal(0);
  textoDigitado = signal('');
  mouseOver = signal(false);
  temFoco = signal(false);

  onClique() {
    this.contadorCliques.update(n => n + 1);
    this.ultimaAcao.set('Botão clicado');
  }

  onCliqueComParametro(mensagem: string) {
    this.ultimaAcao.set(`Clique com parâmetro: ${mensagem}`);
  }

  onMouseEnter() {
    this.mouseOver.set(true);
    this.ultimaAcao.set('Mouse entrou na div');
  }

  onMouseLeave() {
    this.mouseOver.set(false);
    this.ultimaAcao.set('Mouse saiu da div');
  }

  onTeclaLiberada(event: KeyboardEvent) {
    const target = event.target as HTMLInputElement;
    this.textoDigitado.set(target.value);
    this.ultimaAcao.set(`Tecla: ${event.key}`);
  }

  onEnter()  { this.ultimaAcao.set('Enter pressionado'); }
  onEscape() { this.ultimaAcao.set('Escape pressionado'); }

  onFocus() { this.temFoco.set(true);  this.ultimaAcao.set('Campo recebeu foco'); }
  onBlur()  { this.temFoco.set(false); this.ultimaAcao.set('Campo perdeu foco'); }
}
```

---

## 4. Two-Way Binding (Vinculação Bidirecional)

O two-way binding combina property binding e event binding para sincronização automática.

### 4.1 Com `ngModel` (FormsModule)

```typescript
import { Component, computed } from '@angular/core';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-two-way-binding',
  standalone: true,
  imports: [FormsModule],
  template: `
    <div class="p-6 space-y-4 max-w-lg">
      <h2 class="text-2xl font-bold text-gray-700">Two-Way Binding com ngModel</h2>

      <div>
        <label class="block text-sm font-medium text-gray-700 mb-1">Nome:</label>
        <input [(ngModel)]="nome" placeholder="Digite seu nome"
          class="border rounded px-3 py-2 w-full">
        <p class="mt-1 text-indigo-600">Olá, {{ nome || 'Visitante' }}!</p>
      </div>

      <div>
        <label class="block text-sm font-medium text-gray-700 mb-1">Email:</label>
        <input type="email" [(ngModel)]="email" name="email"
          class="border rounded px-3 py-2 w-full">
      </div>

      <div>
        <label class="block text-sm font-medium text-gray-700 mb-1">Cidade:</label>
        <select [(ngModel)]="cidade" name="cidade" class="border rounded px-3 py-2 w-full">
          <option value="">Selecione uma cidade</option>
          <option value="joao-pessoa">João Pessoa</option>
          <option value="campina-grande">Campina Grande</option>
          <option value="recife">Recife</option>
        </select>
      </div>

      <label class="flex items-center gap-2">
        <input type="checkbox" [(ngModel)]="aceitaTermos" name="termos" class="w-4 h-4">
        <span class="text-sm text-gray-700">Aceito os termos e condições</span>
      </label>

      <!-- Resumo -->
      <div class="bg-gray-50 rounded p-4 text-sm">
        <pre class="text-gray-700 whitespace-pre-wrap">{{ dadosFormulario() }}</pre>
      </div>
    </div>
  `
})
export class TwoWayBindingComponent {
  nome = '';
  email = '';
  cidade = '';
  aceitaTermos = false;

  dadosFormulario = computed(() =>
    JSON.stringify({ nome: this.nome, email: this.email, cidade: this.cidade, aceitaTermos: this.aceitaTermos }, null, 2)
  );
}
```

### 4.2 Com `model()` — Signals

O `model()` é a alternativa moderna ao `ngModel` para componentes customizados:

```typescript
import { Component, model } from '@angular/core';

@Component({
  selector: 'app-input-personalizado',
  standalone: true,
  template: `
    <div class="p-4 border rounded-lg">
      <label class="block text-sm font-medium text-gray-700 mb-1">{{ rotulo }}</label>
      <input
        [value]="valor()"
        (input)="valor.set($any($event.target).value)"
        class="border rounded px-3 py-2 w-full focus:ring-2 focus:ring-blue-400 outline-none">
      <p class="text-xs text-gray-400 mt-1">{{ valor().length }} caracteres</p>
    </div>
  `
})
export class InputPersonalizadoComponent {
  valor = model('');   // two-way bindable signal
  rotulo = 'Campo';
}

// Uso no componente pai:
// <app-input-personalizado [(valor)]="meuSignal" rotulo="Nome" />
```

---

## 5. Controle de Fluxo

O Angular substituiu as diretivas estruturais (`*ngIf`, `*ngFor`, `*ngSwitch`) por uma sintaxe nativa mais simples.

| Sintaxe antiga | Sintaxe moderna |
|---|---|
| `*ngIf="cond"` | `@if (cond) { }` |
| `*ngFor="let x of list"` | `@for (x of list; track x.id) { }` |
| `[ngSwitch]` / `*ngSwitchCase` | `@switch (expr) { @case (...) { } }` |

### 5.1 `@if` / `@else`

```typescript
import { Component, signal } from '@angular/core';

interface Usuario {
  nome: string;
  email: string;
  isLogado: boolean;
  isAdmin: boolean;
}

@Component({
  selector: 'app-usuario',
  standalone: true,
  template: `
    <div class="p-6 max-w-md">
      <h2 class="text-2xl font-bold text-gray-700 mb-4">Perfil do Usuário</h2>

      @if (usuario().isLogado) {
        <div class="bg-green-50 border border-green-200 rounded-lg p-4 space-y-2">
          <h3 class="text-lg font-semibold text-green-800">Bem-vindo, {{ usuario().nome }}!</h3>
          <p class="text-sm text-green-700">Email: {{ usuario().email }}</p>

          @if (usuario().isAdmin) {
            <button class="px-4 py-2 bg-blue-600 text-white text-sm rounded">
              Painel Administrativo
            </button>
          }

          <button (click)="logout()"
            class="px-4 py-2 bg-red-500 text-white text-sm rounded">
            Sair
          </button>
        </div>
      } @else {
        <div class="bg-gray-50 border rounded-lg p-4 space-y-3">
          <h3 class="text-lg font-semibold text-gray-700">Faça seu login</h3>
          <button (click)="login()"
            class="px-4 py-2 bg-indigo-600 text-white rounded">
            Entrar
          </button>
        </div>
      }
    </div>
  `
})
export class UsuarioComponent {
  usuario = signal<Usuario>({
    nome: 'João Silva',
    email: 'joao@exemplo.com',
    isLogado: false,
    isAdmin: false
  });

  login()  { this.usuario.update(u => ({ ...u, isLogado: true })); }
  logout() { this.usuario.update(u => ({ ...u, isLogado: false })); }
}
```

### 5.2 `@for` com `track`

```typescript
import { Component, signal } from '@angular/core';
import { CurrencyPipe } from '@angular/common';

interface Produto {
  id: number;
  nome: string;
  preco: number;
  categoria: string;
  disponivel: boolean;
}

@Component({
  selector: 'app-produtos',
  standalone: true,
  imports: [CurrencyPipe],
  template: `
    <div class="p-6">
      <h2 class="text-2xl font-bold text-gray-700 mb-4">Lista de Produtos</h2>

      @if (produtos().length > 0) {
        <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          @for (produto of produtos(); track produto.id) {
            <div class="border rounded-lg p-4 bg-white shadow-sm"
                 [class.opacity-60]="!produto.disponivel">
              <h3 class="font-semibold text-gray-800">{{ produto.nome }}</h3>
              <p class="text-sm text-gray-500">{{ produto.categoria }}</p>
              <p class="text-lg font-bold text-blue-600 mt-2">
                {{ produto.preco | currency:'BRL':'symbol':'1.2-2' }}
              </p>

              @if (produto.disponivel) {
                <button class="mt-3 w-full px-3 py-2 bg-green-600 text-white text-sm rounded">
                  Comprar
                </button>
              } @else {
                <span class="mt-3 block text-center text-red-500 font-medium text-sm">
                  Indisponível
                </span>
              }
            </div>
          }
        </div>
      } @empty {
        <p class="text-center text-gray-500 italic">Nenhum produto encontrado.</p>
      }
    </div>
  `
})
export class ProdutosComponent {
  produtos = signal<Produto[]>([
    { id: 1, nome: 'Smartphone', preco: 1299.99, categoria: 'Eletrônicos', disponivel: true },
    { id: 2, nome: 'Notebook',   preco: 2499.99, categoria: 'Eletrônicos', disponivel: true },
    { id: 3, nome: 'Headphone',  preco: 299.99,  categoria: 'Acessórios',  disponivel: false },
    { id: 4, nome: 'Mouse',      preco: 89.99,   categoria: 'Acessórios',  disponivel: true }
  ]);
}
```

> **Atenção:** `@for` exige a cláusula `track` para identificar itens únicos na lista. Use `track item.id` quando houver um identificador, ou `track $index` como alternativa.

### 5.3 `@switch`

```typescript
import { Component, signal } from '@angular/core';
import { DatePipe } from '@angular/common';

type StatusPedido = 'pendente' | 'processando' | 'enviado' | 'entregue';

interface Pedido {
  numero: number;
  status: StatusPedido;
  progresso: number;
  codigoRastreamento: string;
  previsaoEntrega: Date;
  dataEntrega: Date;
}

@Component({
  selector: 'app-pedido-status',
  standalone: true,
  imports: [DatePipe],
  template: `
    <div class="p-6 max-w-lg mx-auto">
      <h2 class="text-2xl font-bold text-gray-700 mb-4">
        Status do Pedido #{{ pedido().numero }}
      </h2>

      @switch (pedido().status) {
        @case ('pendente') {
          <div class="bg-yellow-50 border-2 border-yellow-300 rounded-xl p-5 text-center space-y-3">
            <p class="text-3xl">⏳</p>
            <h3 class="text-lg font-semibold text-yellow-800">Pedido Pendente</h3>
            <p class="text-sm text-yellow-700">Aguardando confirmação de pagamento</p>
            <button (click)="avancarStatus()"
              class="px-4 py-2 bg-yellow-500 text-white rounded">
              Confirmar Pagamento
            </button>
          </div>
        }
        @case ('processando') {
          <div class="bg-blue-50 border-2 border-blue-300 rounded-xl p-5 text-center space-y-3">
            <p class="text-3xl">🔄</p>
            <h3 class="text-lg font-semibold text-blue-800">Processando</h3>
            <div class="w-full bg-blue-100 rounded-full h-2.5">
              <div class="bg-blue-500 h-2.5 rounded-full transition-all"
                   [style.width.%]="pedido().progresso"></div>
            </div>
            <button (click)="avancarStatus()"
              class="px-4 py-2 bg-blue-500 text-white rounded">
              Marcar como Enviado
            </button>
          </div>
        }
        @case ('enviado') {
          <div class="bg-green-50 border-2 border-green-300 rounded-xl p-5 text-center space-y-3">
            <p class="text-3xl">🚚</p>
            <h3 class="text-lg font-semibold text-green-800">Enviado</h3>
            <p class="text-sm text-green-700">Rastreamento: {{ pedido().codigoRastreamento }}</p>
            <p class="text-sm text-green-700">
              Previsão: {{ pedido().previsaoEntrega | date:'dd/MM/yyyy' }}
            </p>
            <button (click)="avancarStatus()"
              class="px-4 py-2 bg-green-500 text-white rounded">
              Confirmar Entrega
            </button>
          </div>
        }
        @case ('entregue') {
          <div class="bg-emerald-50 border-2 border-emerald-300 rounded-xl p-5 text-center space-y-3">
            <p class="text-3xl">✅</p>
            <h3 class="text-lg font-semibold text-emerald-800">Entregue</h3>
            <p class="text-sm text-emerald-700">
              Entregue em {{ pedido().dataEntrega | date:'dd/MM/yyyy HH:mm' }}
            </p>
          </div>
        }
        @default {
          <div class="bg-red-50 border-2 border-red-300 rounded-xl p-5 text-center">
            <p class="text-3xl">❌</p>
            <h3 class="text-lg font-semibold text-red-800">Status Desconhecido</h3>
          </div>
        }
      }
    </div>
  `
})
export class PedidoStatusComponent {
  pedido = signal<Pedido>({
    numero: 12345,
    status: 'pendente',
    progresso: 65,
    codigoRastreamento: 'BR123456789',
    previsaoEntrega: new Date(2026, 5, 25),
    dataEntrega: new Date(2026, 5, 23, 14, 30)
  });

  private readonly fluxo: StatusPedido[] = ['pendente', 'processando', 'enviado', 'entregue'];

  avancarStatus() {
    this.pedido.update(p => {
      const idx = this.fluxo.indexOf(p.status);
      const proximo = this.fluxo[idx + 1] ?? p.status;
      return { ...p, status: proximo };
    });
  }
}
```

---

## 6. Pipes — Transformação de Dados

Pipes transformam valores diretamente no template, mantendo a lógica de formatação separada do componente.

### 6.1 Pipes Nativos

| Pipe | Exemplo | Resultado |
|---|---|---|
| `uppercase` | `{{ 'angular' \| uppercase }}` | `ANGULAR` |
| `lowercase` | `{{ 'ANGULAR' \| lowercase }}` | `angular` |
| `titlecase` | `{{ 'joão silva' \| titlecase }}` | `João Silva` |
| `number` | `{{ 3.14159 \| number:'1.2-2' }}` | `3,14` |
| `currency` | `{{ 1299.99 \| currency:'BRL' }}` | `R$1.299,99` |
| `percent` | `{{ 0.75 \| percent:'1.0-0' }}` | `75%` |
| `date` | `{{ data \| date:'dd/MM/yyyy' }}` | `20/06/2026` |
| `json` | `{{ obj \| json }}` | JSON formatado |
| `slice` | `{{ lista \| slice:0:3 }}` | 3 primeiros itens |

> **Importante:** No Angular standalone, os pipes nativos devem ser importados explicitamente no array `imports`:
> ```typescript
> imports: [DatePipe, CurrencyPipe, TitleCasePipe, PercentPipe]
> ```

#### Exemplo completo com pipes nativos:

```typescript
import { Component } from '@angular/core';
import {
  DatePipe, CurrencyPipe, UpperCasePipe, LowerCasePipe,
  TitleCasePipe, PercentPipe, DecimalPipe, JsonPipe
} from '@angular/common';

@Component({
  selector: 'app-dados-formatados',
  standalone: true,
  imports: [DatePipe, CurrencyPipe, UpperCasePipe, LowerCasePipe, TitleCasePipe, PercentPipe, DecimalPipe, JsonPipe],
  template: `
    <div class="p-6 space-y-4">
      <h2 class="text-2xl font-bold text-gray-700">Pipes Nativos</h2>

      <div class="bg-white border rounded-lg p-4 space-y-2">
        <h3 class="font-semibold text-gray-700 border-b pb-1">Texto</h3>
        <p>Original: <span class="font-mono">{{ nome }}</span></p>
        <p>Maiúsculo: <span class="font-mono text-blue-600">{{ nome | uppercase }}</span></p>
        <p>Minúsculo: <span class="font-mono text-purple-600">{{ nome | lowercase }}</span></p>
        <p>Título: <span class="font-mono text-green-600">{{ nome | titlecase }}</span></p>
      </div>

      <div class="bg-white border rounded-lg p-4 space-y-2">
        <h3 class="font-semibold text-gray-700 border-b pb-1">Números e Moeda</h3>
        <p>Decimal: {{ preco | number:'1.2-2' }}</p>
        <p>Percentual: {{ desconto | percent:'1.0-1' }}</p>
        <p>Moeda BRL: <span class="font-bold text-green-700">{{ preco | currency:'BRL':'symbol':'1.2-2' }}</span></p>
        <p>Moeda USD: <span class="font-bold text-blue-700">{{ precoUSD | currency:'USD':'symbol':'1.2-2' }}</span></p>
      </div>

      <div class="bg-white border rounded-lg p-4 space-y-2">
        <h3 class="font-semibold text-gray-700 border-b pb-1">Datas</h3>
        <p>Formato BR: {{ dataAtual | date:'dd/MM/yyyy' }}</p>
        <p>Com hora: {{ dataAtual | date:'dd/MM/yyyy HH:mm' }}</p>
        <p>Completo: {{ dataAtual | date:'fullDate':'':'pt' }}</p>
      </div>

      <div class="bg-gray-50 border rounded-lg p-4">
        <h3 class="font-semibold text-gray-700 border-b pb-1 mb-2">JSON Debug</h3>
        <pre class="text-xs text-gray-600 overflow-auto">{{ usuario | json }}</pre>
      </div>
    </div>
  `
})
export class DadosFormatadosComponent {
  nome = 'joão silva santos';
  preco = 1299.99;
  precoUSD = 259.99;
  desconto = 0.15;
  dataAtual = new Date();

  usuario = { id: 1, nome: 'João Silva', email: 'joao@exemplo.com', ativo: true };
}
```

### 6.2 Pipes Customizados

```typescript
// highlight.pipe.ts
import { Pipe, PipeTransform } from '@angular/core';

@Pipe({ name: 'highlight', standalone: true })
export class HighlightPipe implements PipeTransform {
  transform(text: string, search: string): string {
    if (!search || !text) return text;
    const regex = new RegExp(`(${search})`, 'gi');
    return text.replace(regex, '<mark class="bg-yellow-200 rounded px-0.5">$1</mark>');
  }
}
```

```typescript
// truncate.pipe.ts
import { Pipe, PipeTransform } from '@angular/core';

@Pipe({ name: 'truncate', standalone: true })
export class TruncatePipe implements PipeTransform {
  transform(value: string, limit = 50, suffix = '...'): string {
    if (!value) return '';
    return value.length <= limit ? value : value.substring(0, limit) + suffix;
  }
}
```

#### Usando os pipes customizados:

```typescript
// busca-artigos.component.ts
import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { DatePipe } from '@angular/common';
import { HighlightPipe } from './pipes/highlight.pipe';
import { TruncatePipe } from './pipes/truncate.pipe';

@Component({
  selector: 'app-busca-artigos',
  standalone: true,
  imports: [FormsModule, DatePipe, HighlightPipe, TruncatePipe],
  template: `
    <div class="p-6 max-w-3xl mx-auto space-y-4">
      <h2 class="text-2xl font-bold text-gray-700">Busca de Artigos</h2>

      <input
        type="text"
        [(ngModel)]="termoBusca"
        placeholder="Digite sua busca..."
        class="w-full border rounded-lg px-4 py-2 text-sm focus:ring-2 focus:ring-indigo-300 outline-none">

      <div class="space-y-3">
        @for (artigo of artigos; track artigo.id) {
          <div class="bg-white border rounded-lg p-4 shadow-sm">
            <h3 class="font-semibold text-blue-700"
                [innerHTML]="artigo.titulo | highlight:termoBusca"></h3>
            <p class="text-sm text-gray-600 mt-1"
               [innerHTML]="artigo.resumo | truncate:120 | highlight:termoBusca"></p>
            <div class="flex justify-between mt-3 text-xs text-gray-400">
              <span>Por: {{ artigo.autor }}</span>
              <span>{{ artigo.dataPublicacao | date:'dd/MM/yyyy' }}</span>
            </div>
          </div>
        }
      </div>
    </div>
  `
})
export class BuscaArtigosComponent {
  termoBusca = '';

  artigos = [
    {
      id: 1,
      titulo: 'Introdução ao Angular 20',
      resumo: 'Angular 20 trouxe muitas novidades, incluindo melhorias nos templates e na sintaxe de controle de fluxo que tornam o código mais limpo e legível.',
      autor: 'Maria Santos',
      dataPublicacao: new Date(2026, 5, 1)
    },
    {
      id: 2,
      titulo: 'Pipes Customizados no Angular',
      resumo: 'Os pipes são uma ferramenta poderosa para transformar dados nos templates. Aprenda como criar pipes customizados para necessidades específicas do projeto.',
      autor: 'João Silva',
      dataPublicacao: new Date(2026, 4, 28)
    },
    {
      id: 3,
      titulo: 'Control Flow: @if, @for e @switch',
      resumo: 'A nova sintaxe de control flow oferece uma maneira mais intuitiva de trabalhar com condicionais e loops, substituindo as diretivas estruturais tradicionais.',
      autor: 'Ana Costa',
      dataPublicacao: new Date(2026, 4, 25)
    }
  ];
}
```

---

## 7. Exercício Prático — Dashboard de Vendas

Crie um componente que combine controle de fluxo e pipes para exibir um dashboard com lista de vendas e estatísticas.

```typescript
// dashboard.component.ts
import { Component, signal, computed } from '@angular/core';
import { CurrencyPipe, TitleCasePipe, DatePipe, PercentPipe } from '@angular/common';

type StatusFiltro = 'todos' | 'pendente' | 'aprovada' | 'cancelada';

interface Venda {
  id: number;
  cliente: string;
  valor: number;
  data: Date;
  status: 'pendente' | 'aprovada' | 'cancelada';
}

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CurrencyPipe, TitleCasePipe, DatePipe, PercentPipe],
  template: `
    <div class="p-6 max-w-5xl mx-auto space-y-6">
      <h1 class="text-3xl font-bold text-gray-800">Dashboard de Vendas</h1>

      <!-- Filtros -->
      <div class="flex gap-2 flex-wrap">
        @for (opcao of opcoesFiltro; track opcao.valor) {
          <button
            (click)="filtroAtivo.set(opcao.valor)"
            [class.bg-indigo-600]="filtroAtivo() === opcao.valor"
            [class.text-white]="filtroAtivo() === opcao.valor"
            [class.bg-white]="filtroAtivo() !== opcao.valor"
            [class.text-gray-700]="filtroAtivo() !== opcao.valor"
            class="px-4 py-2 rounded-lg border text-sm font-medium transition-colors">
            {{ opcao.label }}
          </button>
        }
      </div>

      <!-- Estatísticas -->
      <div class="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div class="bg-white rounded-xl shadow-sm border p-4 text-center">
          <p class="text-sm text-gray-500">Total Aprovado</p>
          <p class="text-2xl font-bold text-green-600 mt-1">
            {{ totalAprovado() | currency:'BRL':'symbol':'1.2-2' }}
          </p>
        </div>
        <div class="bg-white rounded-xl shadow-sm border p-4 text-center">
          <p class="text-sm text-gray-500">Vendas no Mês</p>
          <p class="text-2xl font-bold text-blue-600 mt-1">{{ vendasMes() }}</p>
        </div>
        <div class="bg-white rounded-xl shadow-sm border p-4 text-center">
          <p class="text-sm text-gray-500">Taxa de Conversão</p>
          <p class="text-2xl font-bold text-indigo-600 mt-1">
            {{ taxaConversao() | percent:'1.1-1' }}
          </p>
        </div>
      </div>

      <!-- Lista de Vendas -->
      <div class="bg-white rounded-xl shadow-sm border overflow-hidden">
        @for (venda of vendasFiltradas(); track venda.id) {
          <div class="flex items-center px-4 py-3 border-b last:border-b-0 hover:bg-gray-50 transition-colors">
            <div class="flex-1">
              <p class="font-medium text-gray-800">{{ venda.cliente | titlecase }}</p>
              <p class="text-xs text-gray-400">{{ venda.data | date:'dd/MM/yyyy' }}</p>
            </div>
            <p class="font-bold text-gray-700 mx-6">
              {{ venda.valor | currency:'BRL':'symbol':'1.2-2' }}
            </p>
            <div>
              @switch (venda.status) {
                @case ('pendente') {
                  <span class="px-3 py-1 text-xs font-semibold rounded-full bg-yellow-100 text-yellow-800">
                    ⏳ Pendente
                  </span>
                }
                @case ('aprovada') {
                  <span class="px-3 py-1 text-xs font-semibold rounded-full bg-green-100 text-green-800">
                    ✅ Aprovada
                  </span>
                }
                @case ('cancelada') {
                  <span class="px-3 py-1 text-xs font-semibold rounded-full bg-red-100 text-red-800">
                    ❌ Cancelada
                  </span>
                }
              }
            </div>
          </div>
        } @empty {
          <p class="text-center py-10 text-gray-400 italic">
            Nenhuma venda encontrada para o filtro selecionado.
          </p>
        }
      </div>
    </div>
  `
})
export class DashboardComponent {
  filtroAtivo = signal<StatusFiltro>('todos');

  opcoesFiltro: { valor: StatusFiltro; label: string }[] = [
    { valor: 'todos',     label: 'Todos' },
    { valor: 'pendente',  label: 'Pendentes' },
    { valor: 'aprovada',  label: 'Aprovadas' },
    { valor: 'cancelada', label: 'Canceladas' }
  ];

  vendas = signal<Venda[]>([
    { id: 1, cliente: 'maria silva',     valor: 1299.99, data: new Date(2026, 5, 20), status: 'aprovada' },
    { id: 2, cliente: 'joão santos',     valor: 899.50,  data: new Date(2026, 5, 19), status: 'pendente' },
    { id: 3, cliente: 'ana costa',       valor: 2100.00, data: new Date(2026, 5, 18), status: 'aprovada' },
    { id: 4, cliente: 'pedro oliveira',  valor: 650.75,  data: new Date(2026, 5, 17), status: 'cancelada' },
    { id: 5, cliente: 'julia fernandes', valor: 1850.25, data: new Date(2026, 5, 16), status: 'aprovada' }
  ]);

  vendasFiltradas = computed(() => {
    const filtro = this.filtroAtivo();
    if (filtro === 'todos') return this.vendas();
    return this.vendas().filter(v => v.status === filtro);
  });

  totalAprovado = computed(() =>
    this.vendas()
      .filter(v => v.status === 'aprovada')
      .reduce((acc, v) => acc + v.valor, 0)
  );

  vendasMes = computed(() => this.vendas().length);

  taxaConversao = computed(() => {
    const aprovadas = this.vendas().filter(v => v.status === 'aprovada').length;
    return aprovadas / this.vendas().length;
  });
}
```

---

## 8. Referências

- [Angular Templates](https://angular.dev/guide/templates)
- [Angular Pipes](https://angular.dev/guide/templates/pipes)
- [Control Flow](https://angular.dev/guide/templates/control-flow)
- [Two-way binding](https://angular.dev/guide/templates/two-way-binding)
- [Event binding](https://angular.dev/guide/templates/event-binding)
