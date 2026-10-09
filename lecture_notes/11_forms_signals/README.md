[main](../../README.md)


# Aula 11 - Formulários com Signals em Angular v22 (Signal Forms)

## Introdução

Os formulários são parte essencial de qualquer aplicação web. Até a versão 20, o Angular oferecia duas abordagens: **template-driven forms** e **reactive forms** (vistas na [aula anterior](../11_forms/README.md)). A partir da v21, o Angular passou a oferecer uma terceira abordagem, construída sobre **signals**: os **Signal Forms** [1].

Construir formulários envolve várias preocupações interligadas: guardar os valores digitados, validar a entrada, controlar os estados de erro e manter a interface sincronizada com os dados. Os Signal Forms tratam dessas preocupações com [1]:

- **Sincronização automática**: o modelo de dados (um `signal`) e os campos da tela ficam sempre sincronizados, nos dois sentidos;
- **Segurança de tipos**: o formulário é inferido a partir do tipo do modelo, então o acesso a um campo inexistente é erro de compilação;
- **Validação centralizada**: todas as regras ficam em um único lugar, a **função de schema**.

| Conceito | Reactive Forms | Signal Forms |
| --- | --- | --- |
| Onde ficam os dados | Dentro de `FormControl`/`FormGroup` | Em um `signal()` comum, criado por você |
| Criação do formulário | `new FormGroup({...})` ou `FormBuilder` | `form(modelo, schema?)` |
| Ligação com o template | `[formGroup]` + `formControlName` | `[formField]="meuForm.campo"` |
| Validação | `Validators` em cada controle | Função de schema: `required(path.campo)` |
| Reatividade | `Observable` (`valueChanges`) | Signals (`value()`, `valid()`, `errors()`) |

> 💡 **Dica:** os Signal Forms são a escolha recomendada para aplicações novas construídas com signals. Em projetos que já usam reactive forms, eles continuam sendo uma opção válida [1] [2].

## 1. Configuração Inicial

### Criando o projeto

Os Signal Forms já fazem parte do pacote `@angular/forms` e são importados de `@angular/forms/signals` [1].

```bash
ng new app-signal-forms
cd app-signal-forms
ng version   # Angular v22 (Signal Forms exigem v21 ou superior)
```

### Tailwind CSS

Todos os exemplos desta aula são estilizados com [Tailwind CSS](https://tailwindcss.com/docs/installation/framework-guides/angular) (v4). Para configurá-lo [3]:

```bash
npm install tailwindcss @tailwindcss/postcss postcss
```

Crie o arquivo `.postcssrc.json` na raiz do projeto:

```json
{
  "plugins": {
    "@tailwindcss/postcss": {}
  }
}
```

E importe o Tailwind no arquivo de estilos globais:

```css
/* src/styles.css */
@import "tailwindcss";
```

Nos exemplos, repetimos sempre o mesmo conjunto de classes utilitárias:

| Elemento | Classes |
| --- | --- |
| Cartão do formulário | `mx-auto max-w-md space-y-4 rounded-xl bg-white p-6 shadow-md` |
| Rótulo (`<label>`) | `block text-sm font-medium text-gray-700` |
| Campo (`<input>`, `<select>`, `<textarea>`) | `w-full rounded-lg border border-gray-300 px-3 py-2 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-200` |
| Mensagem de erro | `mt-1 text-sm text-red-600` |
| Botão principal | `rounded-lg bg-indigo-600 px-4 py-2 font-medium text-white hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-50` |
| Botão secundário | `rounded-lg border border-gray-300 px-3 py-2 text-sm text-gray-700 hover:bg-gray-100` |
| Checkbox | `size-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500` |

### Configuração da aplicação

Os exemplos de validação assíncrona usam `HttpClient`; por isso, registre `provideHttpClient()` [4]:

```typescript
// src/app/app.config.ts
import { ApplicationConfig, provideBrowserGlobalErrorListeners } from '@angular/core';
import { provideHttpClient } from '@angular/common/http';
import { provideRouter } from '@angular/router';
import { routes } from './app.routes';

export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),
    provideRouter(routes),
    provideHttpClient(),
  ],
};
```

### Como testar os exemplos

Cada exemplo abaixo é um **arquivo completo**; a primeira linha de cada bloco indica onde salvá-lo (todos ficam em `src/app/exemplos/`). Para ver um exemplo funcionando, importe o componente no `App` e use o seu seletor no template:

```typescript
// src/app/app.ts
import { Component } from '@angular/core';
import { MeuForm } from './exemplos/meu-form/meu-form';

@Component({
  selector: 'app-root',
  imports: [MeuForm],
  template: `
    <main class="min-h-screen bg-gray-100 px-4 py-10">
      <app-meu-form />
    </main>
  `,
})
export class App {}
```

> 💡 **Dica:** como o `App` acima usa `template` em vez de `templateUrl`, os arquivos `app.html` e `app.css` gerados pelo `ng new` deixam de ser usados e podem ser apagados.

### Primeiro formulário

O exemplo mínimo: um modelo (`signal`), o formulário (`form()`) e a diretiva `FormField` importada no componente para ligar o campo ao `<input>` [1]:

```typescript
// src/app/exemplos/meu-form/meu-form.ts
import { Component, signal } from '@angular/core';
import { form, FormField } from '@angular/forms/signals';

@Component({
  selector: 'app-meu-form',
  imports: [FormField],
  template: `
    <div class="mx-auto max-w-md space-y-4 rounded-xl bg-white p-6 shadow-md">
      <h2 class="text-xl font-semibold text-gray-800">Meu primeiro Signal Form</h2>
      <label class="block text-sm font-medium text-gray-700">
        Nome
        <input [formField]="meuForm.nome" class="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-200" />
      </label>
      <p class="text-gray-600">Olá, <strong>{{ meuModel().nome }}</strong>!</p>
    </div>
  `,
})
export class MeuForm {
  meuModel = signal({ nome: '' });
  meuForm = form(this.meuModel);
}
```

Principais elementos da API:

| Elemento | Para que serve |
| --- | --- |
| `form()` | Cria o formulário (a *field tree*) a partir de um signal |
| `[formField]` | Diretiva que liga um campo a um `<input>`, `<select>`, `<textarea>`... |
| `[formRoot]` | Diretiva para o `<form>`, cuida do envio (*submit*) |
| `required`, `email`, `min`, `max`, `minLength`, `maxLength`, `pattern` | Validadores prontos |
| `validate`, `validateTree`, `validateHttp` | Validadores personalizados (síncronos e assíncronos) |
| `disabled`, `hidden`, `readonly` | Regras de disponibilidade dos campos |
| `applyWhen`, `applyEach`, `schema`, `apply` | Composição de regras (condicionais, arrays, reuso) |
| `submit()` | Marca tudo como *touched* e executa a ação se o formulário for válido |

### Reaproveitando classes com `@apply`

Para não repetir listas longas de classes, crie classes próprias com `@apply` no CSS do componente. No Tailwind v4, o CSS do componente precisa de `@reference` para enxergar as classes do Tailwind [5]:

```typescript
// src/app/exemplos/login-apply/login-apply.ts
import { Component, signal } from '@angular/core';
import { form, FormField } from '@angular/forms/signals';

@Component({
  selector: 'app-login-apply',
  imports: [FormField],
  templateUrl: './login-apply.html',
  styleUrl: './login-apply.css',
})
export class LoginApply {
  loginModel = signal({ email: '', senha: '' });
  loginForm = form(this.loginModel);
}
```

```html
<!-- src/app/exemplos/login-apply/login-apply.html -->
<div class="cartao">
  <label class="rotulo">
    E-mail
    <input type="email" [formField]="loginForm.email" class="campo" />
  </label>
  <label class="rotulo">
    Senha
    <input type="password" [formField]="loginForm.senha" class="campo" />
  </label>
</div>
```

```css
/* src/app/exemplos/login-apply/login-apply.css */
@reference "tailwindcss";

.cartao {
  @apply mx-auto max-w-md space-y-4 rounded-xl bg-white p-6 shadow-md;
}

.rotulo {
  @apply block text-sm font-medium text-gray-700;
}

.campo {
  @apply mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-200;
}
```

## 2. Modelo do Formulário (Form Model)

O **modelo do formulário** é a base dos Signal Forms: ele é a **única fonte de verdade** dos dados. Trata-se simplesmente de um *writable signal* criado com `signal()` [6].

> ⚠️ **Atenção:** o modelo do formulário não tem relação com a função `model()` usada para *two-way binding* entre componentes pai e filho (aula de componentes). Aqui, o modelo é um `signal()` comum que guarda os dados do formulário.

### Criando o modelo e o formulário

```typescript
// src/app/exemplos/login/login.ts
import { Component, signal } from '@angular/core';
import { form, FormField } from '@angular/forms/signals';

@Component({
  selector: 'app-login',
  imports: [FormField],
  template: `
    <div class="mx-auto max-w-md space-y-4 rounded-xl bg-white p-6 shadow-md">
      <h2 class="text-xl font-semibold text-gray-800">Login</h2>

      <label class="block text-sm font-medium text-gray-700">
        E-mail
        <input type="email" [formField]="loginForm.email" class="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-200" />
      </label>

      <label class="block text-sm font-medium text-gray-700">
        Senha
        <input type="password" [formField]="loginForm.password" class="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-200" />
      </label>
    </div>
  `,
})
export class Login {
  loginModel = signal({
    email: '',
    password: '',
  });

  loginForm = form(this.loginModel);
}
```

A função `form()` recebe o signal e cria uma **field tree** (árvore de campos), que espelha o formato do modelo. Essa árvore é [6]:

- **Navegável**: acessamos os campos filhos com ponto, por exemplo `loginForm.email`;
- **Invocável**: chamamos o campo como função para obter o seu estado, por exemplo `loginForm.email()`.

A diretiva `[formField]` liga cada `<input>` ao campo correspondente, com sincronização automática nos dois sentidos [6].

### Tipando o modelo

O TypeScript infere o tipo a partir do objeto literal, mas definir uma interface deixa o código mais claro e melhora o IntelliSense. Com o tipo explícito, `loginForm.email` é um `FieldTree<string>`, e acessar um campo inexistente é erro de compilação [6]:

```typescript
// src/app/exemplos/login-tipado/login-tipado.ts
import { Component, signal } from '@angular/core';
import { form, FormField } from '@angular/forms/signals';

interface LoginData {
  email: string;
  password: string;
}

@Component({
  selector: 'app-login-tipado',
  imports: [FormField],
  template: `
    <div class="mx-auto max-w-md space-y-4 rounded-xl bg-white p-6 shadow-md">
      <input type="email" [formField]="loginForm.email" placeholder="E-mail"
             class="w-full rounded-lg border border-gray-300 px-3 py-2 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-200" />
      <input type="password" [formField]="loginForm.password" placeholder="Senha"
             class="w-full rounded-lg border border-gray-300 px-3 py-2 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-200" />
      <!-- <input [formField]="loginForm.username" />  ❌ erro: 'username' não existe -->
    </div>
  `,
})
export class LoginTipado {
  loginModel = signal<LoginData>({
    email: '',
    password: '',
  });

  loginForm = form(this.loginModel);
}
```

### Inicializando todos os campos

O formulário é derivado do modelo: um campo sem valor inicial **não existe** na field tree. Para campos "opcionais", use um valor vazio explícito, nunca `undefined` [6]:

- `''` para controles de texto (`<input type="text">`, `<textarea>`), que não aceitam `null`;
- `null` para controles que aceitam ausência de valor, como `<input type="date">` com `Date | null`.

```typescript
// src/app/exemplos/usuario-inicial/usuario-inicial.ts
import { Component, signal } from '@angular/core';
import { JsonPipe } from '@angular/common';
import { form, FormField } from '@angular/forms/signals';

interface UsuarioData {
  nome: string;
  email: string;
  idade: number;
  telefone: string;              // opcional: vazio = ''
  dataNascimento: Date | null;   // opcional: vazio = null
}

@Component({
  selector: 'app-usuario-inicial',
  imports: [FormField, JsonPipe],
  template: `
    <div class="mx-auto max-w-md space-y-4 rounded-xl bg-white p-6 shadow-md">
      <input [formField]="usuarioForm.nome" placeholder="Nome" class="w-full rounded-lg border border-gray-300 px-3 py-2 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-200" />
      <input type="email" [formField]="usuarioForm.email" placeholder="E-mail"
             class="w-full rounded-lg border border-gray-300 px-3 py-2 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-200" />
      <input type="number" [formField]="usuarioForm.idade" class="w-full rounded-lg border border-gray-300 px-3 py-2 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-200" />
      <input type="tel" [formField]="usuarioForm.telefone" placeholder="Telefone (opcional)"
             class="w-full rounded-lg border border-gray-300 px-3 py-2 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-200" />
      <input type="date" [formField]="usuarioForm.dataNascimento" class="w-full rounded-lg border border-gray-300 px-3 py-2 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-200" />
      <pre class="overflow-x-auto rounded-lg bg-gray-900 p-3 text-xs text-green-300">{{ usuarioModel() | json }}</pre>
    </div>
  `,
})
export class UsuarioInicial {
  // ✅ Correto: todos os campos inicializados
  usuarioModel = signal<UsuarioData>({
    nome: '',
    email: '',
    idade: 0,
    telefone: '',
    dataNascimento: null,
  });

  // ❌ Evite: signal({ nome: '', email: '' }) não teria usuarioForm.idade
  usuarioForm = form(this.usuarioModel);
}
```

### Lendo valores

Há duas formas de ler os dados: pelo **estado do campo** (`campo().value()`), ideal para valores individuais e `computed()`, ou pelo **próprio modelo** (`modelo()`), ideal quando precisamos de todos os dados (por exemplo, no envio) [6]:

```typescript
// src/app/exemplos/leitura/leitura.ts
import { Component, computed, signal } from '@angular/core';
import { JsonPipe } from '@angular/common';
import { form, FormField } from '@angular/forms/signals';

@Component({
  selector: 'app-leitura',
  imports: [FormField, JsonPipe],
  template: `
    <div class="mx-auto max-w-md space-y-4 rounded-xl bg-white p-6 shadow-md">
      <input type="email" [formField]="loginForm.email" placeholder="E-mail"
             class="w-full rounded-lg border border-gray-300 px-3 py-2 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-200" />
      <input type="password" [formField]="loginForm.password" placeholder="Senha"
             class="w-full rounded-lg border border-gray-300 px-3 py-2 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-200" />

      <div class="rounded-lg bg-gray-50 p-3 text-sm text-gray-600">
        <p>E-mail atual: <span class="font-mono">{{ loginForm.email().value() }}</span></p>
        <p>Tamanho da senha: <span class="font-semibold">{{ tamanhoSenha() }}</span></p>
      </div>

      <button type="button" (click)="lerTudo()" class="rounded-lg bg-indigo-600 px-4 py-2 font-medium text-white hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-50">Ler o modelo inteiro</button>
      @if (dadosLidos(); as dados) {
        <pre class="overflow-x-auto rounded-lg bg-gray-900 p-3 text-xs text-green-300">{{ dados | json }}</pre>
      }
    </div>
  `,
})
export class Leitura {
  loginModel = signal({ email: '', password: '' });
  loginForm = form(this.loginModel);

  // 1) Pelo estado do campo
  tamanhoSenha = computed(() => this.loginForm.password().value().length);

  // 2) Pelo próprio modelo
  dadosLidos = signal<{ email: string; password: string } | null>(null);

  lerTudo() {
    const dados = this.loginModel();
    console.log(dados.email, dados.password);
    this.dadosLidos.set(dados);
  }
}
```

### Atualizando valores por código

Podemos substituir o modelo inteiro com `set()` (ex.: dados vindos de uma API ou *reset*) ou atualizar apenas um campo com `campo().value.set()`/`update()`. Nos dois casos, a tela é atualizada automaticamente [6]:

```typescript
// src/app/exemplos/atualizacao/atualizacao.ts
import { Component, signal } from '@angular/core';
import { form, FormField } from '@angular/forms/signals';

interface Usuario {
  nome: string;
  email: string;
  idade: number;
}

@Component({
  selector: 'app-atualizacao',
  imports: [FormField],
  template: `
    <div class="mx-auto max-w-md space-y-4 rounded-xl bg-white p-6 shadow-md">
      <input [formField]="usuarioForm.nome" placeholder="Nome" class="w-full rounded-lg border border-gray-300 px-3 py-2 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-200" />
      <input type="email" [formField]="usuarioForm.email" placeholder="E-mail"
             class="w-full rounded-lg border border-gray-300 px-3 py-2 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-200" />
      <input type="number" [formField]="usuarioForm.idade" class="w-full rounded-lg border border-gray-300 px-3 py-2 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-200" />

      <div class="flex flex-wrap gap-2">
        <button type="button" (click)="carregarUsuario()" class="rounded-lg bg-indigo-600 px-4 py-2 font-medium text-white hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-50">Carregar</button>
        <button type="button" (click)="limparEmail()" class="rounded-lg border border-gray-300 px-3 py-2 text-sm text-gray-700 hover:bg-gray-100">Limpar e-mail</button>
        <button type="button" (click)="incrementarIdade()" class="rounded-lg border border-gray-300 px-3 py-2 text-sm text-gray-700 hover:bg-gray-100">Idade + 1</button>
        <button type="button" (click)="limpar()" class="rounded-lg border border-gray-300 px-3 py-2 text-sm text-gray-700 hover:bg-gray-100">Limpar tudo</button>
      </div>
    </div>
  `,
})
export class Atualizacao {
  usuarioModel = signal<Usuario>({ nome: '', email: '', idade: 0 });
  usuarioForm = form(this.usuarioModel);

  // Substituindo o modelo inteiro
  carregarUsuario() {
    this.usuarioModel.set({ nome: 'Alice', email: 'alice@ifpb.edu.br', idade: 30 });
  }

  limpar() {
    this.usuarioModel.set({ nome: '', email: '', idade: 0 });
  }

  // Atualizando apenas um campo (a mudança é propagada para o modelo)
  limparEmail() {
    this.usuarioForm.email().value.set('');
  }

  incrementarIdade() {
    this.usuarioForm.idade().value.update((idade) => idade + 1);
  }
}
```

### Two-way binding

Com `[formField]`, os dados fluem nos dois sentidos sem nenhuma inscrição (*subscribe*) ou tratamento de eventos manual [6]:

- **Usuário → modelo**: o usuário digita, a diretiva detecta, o estado do campo e o signal do modelo são atualizados;
- **Código → tela**: o código chama `set()`/`update()`, o signal notifica e a diretiva atualiza o `<input>`.

```typescript
// src/app/exemplos/two-way/two-way.ts
import { Component, signal } from '@angular/core';
import { form, FormField } from '@angular/forms/signals';

@Component({
  selector: 'app-two-way',
  imports: [FormField],
  template: `
    <div class="mx-auto max-w-md space-y-4 rounded-xl bg-white p-6 shadow-md">
      <input type="text" [formField]="usuarioForm.nome" class="w-full rounded-lg border border-gray-300 px-3 py-2 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-200" />
      <button type="button" (click)="definirNome('Maria')" class="rounded-lg bg-indigo-600 px-4 py-2 font-medium text-white hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-50">
        Definir nome como Maria
      </button>
      <p class="text-gray-600">Nome atual: <strong>{{ usuarioModel().nome }}</strong></p>
    </div>
  `,
})
export class TwoWay {
  usuarioModel = signal({ nome: '' });
  usuarioForm = form(this.usuarioModel);

  definirNome(nome: string) {
    this.usuarioForm.nome().value.set(nome); // o input passa a exibir "Maria"
  }
}
```

### Objetos aninhados

Campos relacionados (como um endereço) podem ser agrupados em objetos. O acesso segue o caminho do objeto, e não é necessário nada equivalente ao `formGroupName` [6]:

```typescript
// src/app/exemplos/perfil-aninhado/perfil-aninhado.ts
import { Component, signal } from '@angular/core';
import { JsonPipe } from '@angular/common';
import { form, FormField } from '@angular/forms/signals';

@Component({
  selector: 'app-perfil-aninhado',
  imports: [FormField, JsonPipe],
  template: `
    <div class="mx-auto max-w-md space-y-4 rounded-xl bg-white p-6 shadow-md">
      <input [formField]="perfilForm.nome" placeholder="Nome" class="w-full rounded-lg border border-gray-300 px-3 py-2 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-200" />

      <fieldset class="space-y-3 rounded-lg border border-gray-200 p-4">
        <legend class="px-1 text-sm font-semibold text-gray-700">Endereço</legend>
        <input [formField]="perfilForm.endereco.rua" placeholder="Rua" class="w-full rounded-lg border border-gray-300 px-3 py-2 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-200" />
        <input [formField]="perfilForm.endereco.cidade" placeholder="Cidade" class="w-full rounded-lg border border-gray-300 px-3 py-2 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-200" />
      </fieldset>

      <fieldset class="space-y-3 rounded-lg border border-gray-200 p-4">
        <legend class="px-1 text-sm font-semibold text-gray-700">Preferências</legend>
        <select [formField]="perfilForm.preferencias.tema" class="w-full rounded-lg border border-gray-300 px-3 py-2 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-200">
          <option value="claro">Claro</option>
          <option value="escuro">Escuro</option>
        </select>
        <label class="flex items-center gap-2 text-sm text-gray-700">
          <input type="checkbox" [formField]="perfilForm.preferencias.notificacoes"
                 class="size-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500" />
          Receber notificações
        </label>
      </fieldset>

      <pre class="overflow-x-auto rounded-lg bg-gray-900 p-3 text-xs text-green-300">{{ perfilModel() | json }}</pre>
    </div>
  `,
})
export class PerfilAninhado {
  perfilModel = signal({
    nome: '',
    endereco: { rua: '', cidade: '' },
    preferencias: { tema: 'claro', notificacoes: true },
  });

  perfilForm = form(this.perfilModel);
}
```

### Arrays

Arrays substituem o `FormArray`. Para adicionar ou remover itens, basta **atualizar o modelo**. No `@for`, rastreie (`track`) pelo próprio campo, pois o Angular já mantém uma identidade estável para cada item [6] [7]:

```typescript
// src/app/exemplos/habilidades/habilidades.ts
import { Component, signal } from '@angular/core';
import { JsonPipe } from '@angular/common';
import { form, FormField } from '@angular/forms/signals';

@Component({
  selector: 'app-habilidades',
  imports: [FormField, JsonPipe],
  template: `
    <div class="mx-auto max-w-md space-y-4 rounded-xl bg-white p-6 shadow-md">
      <h2 class="text-xl font-semibold text-gray-800">Habilidades</h2>

      @for (habilidade of habForm.habilidades; track habilidade; let i = $index) {
        <div class="flex gap-2">
          <input [formField]="habilidade" placeholder="Habilidade {{ i + 1 }}"
                 class="w-full rounded-lg border border-gray-300 px-3 py-2 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-200" />
          <button type="button" (click)="remover(i)"
                  class="rounded-lg px-3 text-sm text-red-600 hover:bg-red-50">
            Remover
          </button>
        </div>
      }
      <button type="button" (click)="adicionar()" class="rounded-lg border border-gray-300 px-3 py-2 text-sm text-gray-700 hover:bg-gray-100">
        + Adicionar habilidade
      </button>

      <pre class="overflow-x-auto rounded-lg bg-gray-900 p-3 text-xs text-green-300">{{ habModel() | json }}</pre>
    </div>
  `,
})
export class Habilidades {
  habModel = signal({ habilidades: ['TypeScript', 'Angular'] });
  habForm = form(this.habModel);

  adicionar() {
    this.habModel.update((m) => ({ ...m, habilidades: [...m.habilidades, ''] }));
  }

  remover(indice: number) {
    this.habModel.update((m) => ({
      ...m,
      habilidades: m.habilidades.filter((_, i) => i !== indice),
    }));
  }
}
```

> ⚠️ **Atenção:** a estrutura do modelo deve usar apenas **objetos e arrays JavaScript simples**. Instâncias de classes, `Map` e `Set` não são suportados: o TypeScript aceita, mas o comportamento fica incorreto (classes perdem o protótipo e `Map`/`Set` geram árvores vazias) [6].

## 3. Projetando o Modelo do Formulário

Como todo o formulário é derivado do modelo, vale a pena projetá-lo bem [8].

### Boas práticas

1. **Use tipos explícitos**: defina interfaces para os modelos;
2. **Inicialize todos os campos**: campos não inicializados não existem na field tree;
3. **Mantenha o modelo focado**: um modelo por formulário (não misture login, preferências e carrinho);
4. **Pense na validação**: agrupe campos validados em conjunto (ex.: `novaSenha` e `confirmarSenha`);
5. **Use tipos compatíveis com os controles**: `<select>` trabalha com `string` (mesmo que as opções pareçam números); `<input type="number">` trabalha com `number`;
6. **Evite `undefined` e propriedades opcionais (`campo?: string`)**: `undefined` significa *ausência do campo*, e não *campo vazio* [8].

O exemplo a seguir aplica a prática 5: o tamanho do pacote vem de um `<select>`, então é `string`; a quantidade vem de um `<input type="number">`, então é `number` [8]:

```typescript
// src/app/exemplos/pedido-bebida/pedido-bebida.ts
import { Component, computed, signal } from '@angular/core';
import { form, FormField } from '@angular/forms/signals';

interface PedidoBebidaFormModel {
  tamanho: string;     // <select> com opções "6", "12", "24"
  quantidade: number;  // <input type="number">
}

@Component({
  selector: 'app-pedido-bebida',
  imports: [FormField],
  template: `
    <div class="mx-auto max-w-md space-y-4 rounded-xl bg-white p-6 shadow-md">
      <label class="block text-sm font-medium text-gray-700">
        Pacote
        <select [formField]="pedidoForm.tamanho" class="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-200">
          <option value="6">6 latas</option>
          <option value="12">12 latas</option>
          <option value="24">24 latas</option>
        </select>
      </label>
      <label class="block text-sm font-medium text-gray-700">
        Quantidade de pacotes
        <input type="number" [formField]="pedidoForm.quantidade" class="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-200" />
      </label>
      <p class="text-gray-700">Total: <strong>{{ totalLatas() }}</strong> latas</p>
    </div>
  `,
})
export class PedidoBebida {
  pedidoModel = signal<PedidoBebidaFormModel>({ tamanho: '6', quantidade: 1 });
  pedidoForm = form(this.pedidoModel);

  // A conversão de string para número acontece fora do modelo do formulário
  totalLatas = computed(() => Number(this.pedidoModel().tamanho) * this.pedidoModel().quantidade);
}
```

### Evite modelos com estrutura dinâmica

Um modelo tem estrutura dinâmica quando suas propriedades mudam conforme o valor (por exemplo, uma união de tipos). Em vez disso, mantenha uma **estrutura estática** com todos os campos possíveis e use regras de schema para **esconder** ou **desabilitar** o que não se aplica. Assim, se o usuário alternar entre "cartão" e "pix", os dados já digitados **não se perdem** [8]:

```typescript
// src/app/exemplos/pagamento/pagamento.ts
import { Component, signal } from '@angular/core';
import { JsonPipe } from '@angular/common';
import { form, FormField, hidden, schema } from '@angular/forms/signals';

interface PagamentoFormModel {
  nome: string;
  metodo: {
    tipo: string; // 'cartao' ou 'pix'
    cartao: { numero: string; cvv: string; validade: string };
    pix: { chave: string };
  };
}

const pagamentoSchema = schema<PagamentoFormModel>((p) => {
  hidden(p.metodo.cartao, { when: ({ valueOf }) => valueOf(p.metodo.tipo) !== 'cartao' });
  hidden(p.metodo.pix, { when: ({ valueOf }) => valueOf(p.metodo.tipo) !== 'pix' });
});

@Component({
  selector: 'app-pagamento',
  imports: [FormField, JsonPipe],
  template: `
    <div class="mx-auto max-w-md space-y-4 rounded-xl bg-white p-6 shadow-md">
      <input [formField]="pagForm.nome" placeholder="Nome" class="w-full rounded-lg border border-gray-300 px-3 py-2 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-200" />

      <select [formField]="pagForm.metodo.tipo" class="w-full rounded-lg border border-gray-300 px-3 py-2 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-200">
        <option value="cartao">Cartão de crédito</option>
        <option value="pix">Pix</option>
      </select>

      @if (!pagForm.metodo.cartao().hidden()) {
        <fieldset class="space-y-3 rounded-lg border border-gray-200 p-4">
          <legend class="px-1 text-sm font-semibold text-gray-700">Cartão</legend>
          <input [formField]="pagForm.metodo.cartao.numero" placeholder="Número"
                 class="w-full rounded-lg border border-gray-300 px-3 py-2 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-200" />
          <div class="grid grid-cols-2 gap-3">
            <input [formField]="pagForm.metodo.cartao.validade" placeholder="MM/AA"
                   class="w-full rounded-lg border border-gray-300 px-3 py-2 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-200" />
            <input [formField]="pagForm.metodo.cartao.cvv" placeholder="CVV"
                   class="w-full rounded-lg border border-gray-300 px-3 py-2 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-200" />
          </div>
        </fieldset>
      }

      @if (!pagForm.metodo.pix().hidden()) {
        <input [formField]="pagForm.metodo.pix.chave" placeholder="Chave Pix"
               class="w-full rounded-lg border border-gray-300 px-3 py-2 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-200" />
      }

      <pre class="overflow-x-auto rounded-lg bg-gray-900 p-3 text-xs text-green-300">{{ pagModel() | json }}</pre>
    </div>
  `,
})
export class Pagamento {
  pagModel = signal<PagamentoFormModel>({
    nome: '',
    metodo: {
      tipo: 'cartao',
      cartao: { numero: '', cvv: '', validade: '' },
      pix: { chave: '' },
    },
  });

  pagForm = form(this.pagModel, pagamentoSchema);
}
```

A exceção são os **arrays**, cujo tamanho varia naturalmente (a estrutura de cada item, porém, deve ser a mesma) [8].

### Modelo do formulário × modelo de domínio

O **modelo de domínio** representa os dados como a aplicação ou a API precisa (otimizado para regras de negócio e armazenamento). O **modelo do formulário** representa a **entrada do usuário como ela aparece na tela**. Eles podem ser diferentes: na tela, data e horário de um agendamento são escolhidos em campos separados, mas no domínio são um único `Date` [8].

O arquivo abaixo define os dois modelos e as funções de conversão:

```typescript
// src/app/exemplos/agendamento/agendamento.model.ts

// Modelo de domínio: como a aplicação/API representa o dado
export interface AgendamentoDomainModel {
  nome: string;
  momento: Date;
}

// Modelo do formulário: como o usuário preenche na tela
export interface AgendamentoFormModel {
  nome: string;
  data: string;     // <input type="date">  -> "2026-10-05"
  horario: string;  // <select>             -> "14:00"
}

export const AGENDAMENTO_VAZIO: AgendamentoFormModel = { nome: '', data: '', horario: '' };

const doisDigitos = (n: number) => String(n).padStart(2, '0');

export function domainParaForm(ag: AgendamentoDomainModel): AgendamentoFormModel {
  const m = ag.momento;
  return {
    nome: ag.nome,
    data: `${m.getFullYear()}-${doisDigitos(m.getMonth() + 1)}-${doisDigitos(m.getDate())}`,
    horario: `${doisDigitos(m.getHours())}:${doisDigitos(m.getMinutes())}`,
  };
}

export function formParaDomain(f: AgendamentoFormModel): AgendamentoDomainModel {
  return { nome: f.nome, momento: new Date(`${f.data}T${f.horario}`) };
}
```

Um serviço (simulado) que "salva" o agendamento:

```typescript
// src/app/exemplos/agendamento/agendamento.service.ts
import { Injectable } from '@angular/core';
import { AgendamentoDomainModel } from './agendamento.model';

@Injectable({ providedIn: 'root' })
export class AgendamentoService {
  salvar(agendamento: AgendamentoDomainModel): Promise<AgendamentoDomainModel> {
    console.log('Salvando', agendamento);
    return new Promise((resolve) => setTimeout(() => resolve(agendamento), 1000));
  }
}
```

### Convertendo entre domínio e formulário

Para preencher o formulário com dados existentes (recebidos por `input()` ou de uma API), use `linkedSignal()`: ele **deriva** o modelo do formulário a partir do domínio e, ao mesmo tempo, continua **editável** [8] [9]. Para salvar, converta de volta dentro do `submit()` [8]:

```typescript
// src/app/exemplos/agendamento/editar-agendamento.ts
import { Component, inject, input, linkedSignal, signal } from '@angular/core';
import { form, FormField, required, submit } from '@angular/forms/signals';
import { AgendamentoService } from './agendamento.service';
import {
  AGENDAMENTO_VAZIO, AgendamentoDomainModel, domainParaForm, formParaDomain,
} from './agendamento.model';

@Component({
  selector: 'app-editar-agendamento',
  imports: [FormField],
  template: `
    <div class="mx-auto max-w-md space-y-4 rounded-xl bg-white p-6 shadow-md">
      <h2 class="text-xl font-semibold text-gray-800">Agendamento</h2>
      <input [formField]="agForm.nome" placeholder="Nome" class="w-full rounded-lg border border-gray-300 px-3 py-2 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-200" />
      <input type="date" [formField]="agForm.data" class="w-full rounded-lg border border-gray-300 px-3 py-2 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-200" />
      <select [formField]="agForm.horario" class="w-full rounded-lg border border-gray-300 px-3 py-2 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-200">
        <option value="">Horário...</option>
        <option value="08:00">08:00</option>
        <option value="10:00">10:00</option>
        <option value="14:00">14:00</option>
      </select>
      <button type="button" (click)="salvar()" class="rounded-lg bg-indigo-600 px-4 py-2 font-medium text-white hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-50">Salvar</button>
      @if (salvo(); as ag) {
        <p class="text-sm text-green-700">Salvo: {{ ag.nome }} em {{ ag.momento.toLocaleString() }}</p>
      }
    </div>
  `,
})
export class EditarAgendamento {
  private service = inject(AgendamentoService);

  // Dado de domínio recebido do componente pai (pode não existir)
  readonly agendamento = input<AgendamentoDomainModel>();

  // Modelo do formulário derivado do domínio (e ainda assim editável)
  private readonly formModel = linkedSignal({
    source: this.agendamento,
    computation: (ag) => (ag ? domainParaForm(ag) : { ...AGENDAMENTO_VAZIO }),
  });

  protected readonly agForm = form(this.formModel, (p) => {
    required(p.nome);
    required(p.data);
    required(p.horario);
  });

  protected salvo = signal<AgendamentoDomainModel | null>(null);

  salvar() {
    submit(this.agForm, async () => {
      const salvo = await this.service.salvar(formParaDomain(this.agForm().value()));
      this.salvo.set(salvo);
    });
  }
}
```

Um componente pai que passa (ou não) um agendamento existente:

```typescript
// src/app/exemplos/agendamento/agendamento-pagina.ts
import { Component, signal } from '@angular/core';
import { EditarAgendamento } from './editar-agendamento';
import { AgendamentoDomainModel } from './agendamento.model';

@Component({
  selector: 'app-agendamento-pagina',
  imports: [EditarAgendamento],
  template: `
    <div class="mx-auto mb-4 max-w-md">
      <button type="button" (click)="carregar()" class="rounded-lg border border-gray-300 px-3 py-2 text-sm text-gray-700 hover:bg-gray-100">
        Carregar agendamento existente
      </button>
    </div>
    <app-editar-agendamento [agendamento]="existente()" />
  `,
})
export class AgendamentoPagina {
  existente = signal<AgendamentoDomainModel | undefined>(undefined);

  carregar() {
    this.existente.set({ nome: 'Alice', momento: new Date(2026, 9, 5, 14, 0) });
  }
}
```

## 4. Gerenciamento do Estado dos Campos

Ao chamar um campo como função (`meuForm.email()`), obtemos um objeto `FieldState` com vários signals [7]:

| Categoria | Signal | Descrição |
| --- | --- | --- |
| Valor | `value()` | Valor atual (é um `WritableSignal`) |
| Validação | `valid()` | Passa em todas as regras e não há validação assíncrona pendente |
| Validação | `invalid()` | Possui erros de validação |
| Validação | `errors()` | Array de erros (`kind`, `message`, `fieldTree`) |
| Validação | `pending()` | Validação assíncrona em andamento |
| Interação | `touched()` | O usuário focou e saiu do campo (*blur*) |
| Interação | `dirty()` | O usuário alterou o valor (mesmo que tenha voltado ao original) |
| Disponibilidade | `disabled()` | Campo desabilitado |
| Disponibilidade | `hidden()` | Campo deve ser escondido (com `@if`) |
| Disponibilidade | `readonly()` | Campo somente leitura |

### Estado de validação

```typescript
// src/app/exemplos/estado-validacao/estado-validacao.ts
import { Component, signal } from '@angular/core';
import { email, form, FormField, required } from '@angular/forms/signals';

@Component({
  selector: 'app-estado-validacao',
  imports: [FormField],
  template: `
    <div class="mx-auto max-w-md space-y-4 rounded-xl bg-white p-6 shadow-md">
      <input type="email" [formField]="cadastroForm.email" placeholder="E-mail"
             class="w-full rounded-lg border border-gray-300 px-3 py-2 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-200" />

      @if (cadastroForm.email().invalid()) {
        <ul class="list-inside list-disc rounded-lg bg-red-50 p-3 text-sm text-red-700">
          @for (erro of cadastroForm.email().errors(); track erro) {
            <li>{{ erro.message }} <span class="text-red-400">({{ erro.kind }})</span></li>
          }
        </ul>
      } @else {
        <p class="text-sm text-green-700">E-mail válido!</p>
      }
    </div>
  `,
})
export class EstadoValidacao {
  cadastroModel = signal({ email: '' });

  cadastroForm = form(this.cadastroModel, (schemaPath) => {
    required(schemaPath.email, { message: 'O e-mail é obrigatório' });
    email(schemaPath.email, { message: 'Informe um e-mail válido' });
  });
}
```

> 💡 **Dica:** durante uma validação assíncrona, `valid()` e `invalid()` podem ser `false` ao mesmo tempo (ainda não é válido, mas também não há erros). Por isso, para verificar se há erros, prefira `invalid()` em vez de `!valid()` [7].

### Estado de interação: touched

O padrão mais comum é **mostrar erros somente depois que o usuário interagiu** com o campo (`touched() && invalid()`) [7]:

```typescript
// src/app/exemplos/erro-apos-toque/erro-apos-toque.ts
import { Component, signal } from '@angular/core';
import { email, form, FormField, required } from '@angular/forms/signals';

@Component({
  selector: 'app-erro-apos-toque',
  imports: [FormField],
  template: `
    <div class="mx-auto max-w-md space-y-4 rounded-xl bg-white p-6 shadow-md">
      <label class="block text-sm font-medium text-gray-700">
        E-mail
        <input type="email" [formField]="signupForm.email" class="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-200" />
      </label>
      @if (signupForm.email().touched() && signupForm.email().invalid()) {
        <p class="mt-1 text-sm text-red-600">{{ signupForm.email().errors()[0].message }}</p>
      }
    </div>
  `,
})
export class ErroAposToque {
  signupModel = signal({ email: '' });

  signupForm = form(this.signupModel, (p) => {
    required(p.email, { message: 'O e-mail é obrigatório' });
    email(p.email, { message: 'Informe um e-mail válido' });
  });
}
```

### Estado de interação: dirty

O `dirty()` é útil para avisos de "alterações não salvas" [7]:

```typescript
// src/app/exemplos/alteracoes/alteracoes.ts
import { Component, signal } from '@angular/core';
import { form, FormField } from '@angular/forms/signals';

@Component({
  selector: 'app-alteracoes',
  imports: [FormField],
  template: `
    <div class="mx-auto max-w-md space-y-4 rounded-xl bg-white p-6 shadow-md">
      <input [formField]="perfilForm.nome" class="w-full rounded-lg border border-gray-300 px-3 py-2 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-200" />
      <textarea [formField]="perfilForm.bio" rows="3" class="w-full rounded-lg border border-gray-300 px-3 py-2 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-200"></textarea>

      @if (perfilForm().dirty()) {
        <p class="rounded-lg border border-amber-300 bg-amber-50 p-3 text-sm text-amber-800">
          ⚠️ Você tem alterações não salvas
        </p>
      }
    </div>
  `,
})
export class Alteracoes {
  perfilModel = signal({ nome: 'Alice', bio: 'Desenvolvedora' });
  perfilForm = form(this.perfilModel);
}
```

| Signal | Torna-se `true` quando |
| --- | --- |
| `touched()` | O usuário focou e saiu do campo, ou o campo foi marcado com `markAsTouched()` |
| `dirty()` | O usuário modificou o valor (mesmo sem sair do campo) |

### Revelando os erros de uma seção com `markAsTouched()`

Em formulários com várias etapas, o botão "Continuar" pode marcar uma seção inteira como *touched*; todos os campos descendentes também são marcados e seus erros aparecem [7]:

```typescript
// src/app/exemplos/checkout/checkout.ts
import { Component, signal } from '@angular/core';
import { form, FormField, required } from '@angular/forms/signals';

@Component({
  selector: 'app-checkout',
  imports: [FormField],
  template: `
    <div class="mx-auto max-w-md space-y-4 rounded-xl bg-white p-6 shadow-md">
      @if (passo() === 1) {
        <h2 class="text-xl font-semibold text-gray-800">1. Entrega</h2>
        <div>
          <input [formField]="checkoutForm.entrega.nome" placeholder="Nome" class="w-full rounded-lg border border-gray-300 px-3 py-2 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-200" />
          @if (checkoutForm.entrega.nome().touched() && checkoutForm.entrega.nome().invalid()) {
            <p class="mt-1 text-sm text-red-600">{{ checkoutForm.entrega.nome().errors()[0].message }}</p>
          }
        </div>
        <div>
          <input [formField]="checkoutForm.entrega.endereco" placeholder="Endereço"
                 class="w-full rounded-lg border border-gray-300 px-3 py-2 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-200" />
          @if (checkoutForm.entrega.endereco().touched() &&
               checkoutForm.entrega.endereco().invalid()) {
            <p class="mt-1 text-sm text-red-600">{{ checkoutForm.entrega.endereco().errors()[0].message }}</p>
          }
        </div>
        <button type="button" (click)="continuar()" class="rounded-lg bg-indigo-600 px-4 py-2 font-medium text-white hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-50">Continuar</button>
      } @else {
        <h2 class="text-xl font-semibold text-gray-800">2. Pagamento</h2>
        <p class="text-gray-600">Entregar para {{ checkoutModel().entrega.nome }}.</p>
        <button type="button" (click)="passo.set(1)" class="rounded-lg border border-gray-300 px-3 py-2 text-sm text-gray-700 hover:bg-gray-100">Voltar</button>
      }
    </div>
  `,
})
export class Checkout {
  passo = signal(1);

  checkoutModel = signal({
    entrega: { nome: '', endereco: '' },
  });

  checkoutForm = form(this.checkoutModel, (p) => {
    required(p.entrega.nome, { message: 'Informe o nome' });
    required(p.entrega.endereco, { message: 'Informe o endereço' });
  });

  continuar() {
    this.checkoutForm.entrega().markAsTouched();
    if (this.checkoutForm.entrega().invalid()) {
      return;
    }
    this.passo.set(2);
  }
}
```

### Estado de disponibilidade: disabled, hidden e readonly

Essas regras são definidas na função de schema. A opção `when` recebe um contexto com `valueOf()`, que lê o valor de **outro** campo [7]. O `[formField]` aplica automaticamente os atributos `disabled` e `readonly` no elemento; já o `hidden` precisa de um `@if` no template [10]:

```typescript
// src/app/exemplos/disponibilidade/disponibilidade.ts
import { Component, signal } from '@angular/core';
import { disabled, form, FormField, hidden, readonly } from '@angular/forms/signals';

@Component({
  selector: 'app-disponibilidade',
  imports: [FormField],
  template: `
    <div class="mx-auto max-w-md space-y-4 rounded-xl bg-white p-6 shadow-md">
      <label class="block text-sm font-medium text-gray-700">
        Código do pedido (somente leitura)
        <input [formField]="pedidoForm.codigo"
               class="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-200 read-only:bg-gray-100 read-only:text-gray-500" />
      </label>

      <label class="block text-sm font-medium text-gray-700">
        Total do pedido (R$)
        <input type="number" [formField]="pedidoForm.total" class="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-200" />
      </label>

      <label class="block text-sm font-medium text-gray-700">
        Cupom
        <input [formField]="pedidoForm.cupom"
               class="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-200 disabled:cursor-not-allowed disabled:bg-gray-100" />
      </label>
      @if (pedidoForm.cupom().disabled()) {
        <p class="text-sm text-sky-700">ℹ️ Cupom disponível apenas para pedidos a partir de R$ 50</p>
      }

      <label class="flex items-center gap-2 text-sm text-gray-700">
        <input type="checkbox" [formField]="pedidoForm.entregar" class="size-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500" />
        Entregar em casa
      </label>

      @if (!pedidoForm.endereco().hidden()) {
        <input [formField]="pedidoForm.endereco" placeholder="Endereço de entrega"
               class="w-full rounded-lg border border-gray-300 px-3 py-2 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-200" />
      }
    </div>
  `,
})
export class Disponibilidade {
  pedidoModel = signal({
    codigo: 'PED-2026-001',
    total: 25,
    cupom: '',
    entregar: false,
    endereco: '',
  });

  pedidoForm = form(this.pedidoModel, (p) => {
    readonly(p.codigo);
    disabled(p.cupom, { when: ({ valueOf }) => valueOf(p.total) < 50 });
    hidden(p.endereco, { when: ({ valueOf }) => !valueOf(p.entregar) });
  });
}
```

| Estado | Quando usar | Usuário vê? | Usuário edita? | Participa da validação? |
| --- | --- | --- | --- | --- |
| `disabled()` | Campo temporariamente indisponível | Sim | Não | Não |
| `hidden()` | Campo irrelevante no contexto atual | Não (com `@if`) | Não | Não |
| `readonly()` | Valor deve ser exibido, mas não editado | Sim | Não | Não |

> ⚠️ **Atenção:** campos escondidos, desabilitados ou somente leitura **não afetam** o estado do formulário pai. Um campo obrigatório escondido não impede o envio [7] [10].

### Estado do formulário e propagação

O formulário raiz também é um campo: `meuForm()` retorna um `FieldState` que **agrega** o estado dos filhos. Se um campo filho fica inválido, o grupo pai e o formulário inteiro também ficam inválidos [7]. Digite nos campos e observe:

```typescript
// src/app/exemplos/propagacao/propagacao.ts
import { Component, signal } from '@angular/core';
import { form, FormField, required } from '@angular/forms/signals';

@Component({
  selector: 'app-propagacao',
  imports: [FormField],
  template: `
    <div class="mx-auto max-w-md space-y-4 rounded-xl bg-white p-6 shadow-md">
      <input [formField]="userForm.perfil.nome" placeholder="Nome (obrigatório)"
             class="w-full rounded-lg border border-gray-300 px-3 py-2 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-200" />
      <input [formField]="userForm.endereco.cidade" placeholder="Cidade (obrigatória)"
             class="w-full rounded-lg border border-gray-300 px-3 py-2 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-200" />

      <table class="w-full text-left text-sm">
        <thead class="text-gray-500">
          <tr><th>Nível</th><th>valid</th><th>touched</th><th>dirty</th></tr>
        </thead>
        <tbody class="font-mono">
          <tr>
            <td>perfil.nome</td>
            <td>{{ userForm.perfil.nome().valid() }}</td>
            <td>{{ userForm.perfil.nome().touched() }}</td>
            <td>{{ userForm.perfil.nome().dirty() }}</td>
          </tr>
          <tr>
            <td>perfil</td>
            <td>{{ userForm.perfil().valid() }}</td>
            <td>{{ userForm.perfil().touched() }}</td>
            <td>{{ userForm.perfil().dirty() }}</td>
          </tr>
          <tr class="font-bold">
            <td>formulário</td>
            <td>{{ userForm().valid() }}</td>
            <td>{{ userForm().touched() }}</td>
            <td>{{ userForm().dirty() }}</td>
          </tr>
        </tbody>
      </table>

      <button type="button" [disabled]="userForm().invalid()" class="rounded-lg bg-indigo-600 px-4 py-2 font-medium text-white hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-50">Salvar</button>
    </div>
  `,
})
export class Propagacao {
  userModel = signal({
    perfil: { nome: '' },
    endereco: { cidade: '' },
  });

  userForm = form(this.userModel, (p) => {
    required(p.perfil.nome);
    required(p.endereco.cidade);
  });
}
```

| Signal | No nível do formulário |
| --- | --- |
| `valid()` | Todos os campos interativos válidos e nenhuma validação pendente |
| `invalid()` | Pelo menos um campo interativo com erro |
| `pending()` | Pelo menos um campo com validação assíncrona pendente |
| `touched()` | Pelo menos um campo tocado |
| `dirty()` | Pelo menos um campo modificado |

Use o **estado do formulário** para habilitar o botão de envio e avisos gerais; use o **estado de cada campo** para mensagens de erro e estilização [7].

### Estilizando conforme o estado

Os Signal Forms **não usam** a validação nativa do navegador. Por isso, não use `:valid`/`:invalid` no CSS, nem as variantes `valid:`/`invalid:`/`user-invalid:` do Tailwind (elas também dependem da validação nativa) [11]. Em vez disso, ligue as classes do Tailwind aos signals com `[class.nome-da-classe]` [7]:

```typescript
// src/app/exemplos/estilo-estado/estilo-estado.ts
import { Component, signal } from '@angular/core';
import { email, form, FormField, required } from '@angular/forms/signals';

@Component({
  selector: 'app-estilo-estado',
  imports: [FormField],
  template: `
    <div class="mx-auto max-w-md space-y-4 rounded-xl bg-white p-6 shadow-md">
      <input
        type="email"
        placeholder="E-mail"
        [formField]="f.email"
        class="w-full rounded-lg border-2 border-gray-300 px-3 py-2 focus:outline-none"
        [class.border-red-500]="f.email().touched() && f.email().invalid()"
        [class.bg-red-50]="f.email().touched() && f.email().invalid()"
        [class.border-green-500]="f.email().touched() && f.email().valid()"
      />
    </div>
  `,
})
export class EstiloEstado {
  model = signal({ email: '' });

  f = form(this.model, (p) => {
    required(p.email);
    email(p.email);
  });
}
```

### Envio (submit) e reset

A diretiva `FormRoot` (`[formRoot]`) cuida do envio: evita o comportamento padrão do navegador, adiciona `novalidate` ao `<form>` e chama `submit()` [12]. O `submit()` **marca todos os campos como touched** (revelando os erros) e executa a `action` **somente se o formulário for válido** [7] [12]. Enquanto a `action` executa, `submitting()` é `true` [12]:

```typescript
// src/app/exemplos/contato/contato.ts
import { Component, signal } from '@angular/core';
import { email, form, FormField, FormRoot, required } from '@angular/forms/signals';

interface ContatoData {
  nome: string;
  email: string;
  mensagem: string;
}

const CONTATO_INICIAL: ContatoData = { nome: '', email: '', mensagem: '' };

@Component({
  selector: 'app-contato',
  imports: [FormRoot, FormField],
  template: `
    <form [formRoot]="contatoForm" class="mx-auto max-w-md space-y-4 rounded-xl bg-white p-6 shadow-md">
      <h2 class="text-xl font-semibold text-gray-800">Fale conosco</h2>

      <div>
        <input [formField]="contatoForm.nome" placeholder="Nome" class="w-full rounded-lg border border-gray-300 px-3 py-2 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-200" />
        @if (contatoForm.nome().touched() && contatoForm.nome().invalid()) {
          <p class="mt-1 text-sm text-red-600">{{ contatoForm.nome().errors()[0].message }}</p>
        }
      </div>

      <div>
        <input type="email" [formField]="contatoForm.email" placeholder="E-mail"
               class="w-full rounded-lg border border-gray-300 px-3 py-2 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-200" />
        @if (contatoForm.email().touched() && contatoForm.email().invalid()) {
          <p class="mt-1 text-sm text-red-600">{{ contatoForm.email().errors()[0].message }}</p>
        }
      </div>

      <div>
        <textarea [formField]="contatoForm.mensagem" rows="4" placeholder="Mensagem"
                  class="w-full rounded-lg border border-gray-300 px-3 py-2 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-200"></textarea>
        @if (contatoForm.mensagem().touched() && contatoForm.mensagem().invalid()) {
          <p class="mt-1 text-sm text-red-600">{{ contatoForm.mensagem().errors()[0].message }}</p>
        }
      </div>

      <button type="submit" [disabled]="contatoForm().submitting()" class="w-full rounded-lg bg-indigo-600 px-4 py-2 font-medium text-white hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-50">
        {{ contatoForm().submitting() ? 'Enviando...' : 'Enviar' }}
      </button>

      @if (enviado()) {
        <p class="text-sm text-green-700">✅ Mensagem enviada!</p>
      }
    </form>
  `,
})
export class Contato {
  contatoModel = signal<ContatoData>({ ...CONTATO_INICIAL });
  enviado = signal(false);

  contatoForm = form(
    this.contatoModel,
    (p) => {
      required(p.nome, { message: 'Informe o seu nome' });
      required(p.email, { message: 'Informe o seu e-mail' });
      email(p.email, { message: 'Informe um e-mail válido' });
      required(p.mensagem, { message: 'Escreva a mensagem' });
    },
    {
      submission: {
        action: async (f) => {
          await this.enviar(this.contatoModel());
          this.enviado.set(true);
          // Limpa touched/dirty e volta aos valores iniciais
          f().reset({ ...CONTATO_INICIAL });
        },
      },
    },
  );

  private enviar(dados: ContatoData): Promise<ContatoData> {
    console.log('Enviando', dados);
    return new Promise((resolve) => setTimeout(() => resolve(dados), 1000));
  }
}
```

### Focando o primeiro campo inválido

Por acessibilidade, ao tentar enviar um formulário inválido, é uma boa prática mover o foco para o primeiro campo com erro, usando `errorSummary()` e `focusBoundControl()` [7]. Este exemplo também mostra o envio manual com a função `submit()`, sem a diretiva `FormRoot` [12]:

```typescript
// src/app/exemplos/foco-erro/foco-erro.ts
import { Component, signal } from '@angular/core';
import { email, form, FormField, required, submit } from '@angular/forms/signals';

@Component({
  selector: 'app-foco-erro',
  imports: [FormField],
  template: `
    <div class="mx-auto max-w-md space-y-4 rounded-xl bg-white p-6 shadow-md">
      @for (campo of [cadastroForm.usuario, cadastroForm.email, cadastroForm.senha]; track $index) {
        <div>
          <input [formField]="campo" class="w-full rounded-lg border border-gray-300 px-3 py-2 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-200" />
          @if (campo().touched() && campo().invalid()) {
            <p class="mt-1 text-sm text-red-600">{{ campo().errors()[0].message }}</p>
          }
        </div>
      }
      <button type="button" (click)="enviar()" class="rounded-lg bg-indigo-600 px-4 py-2 font-medium text-white hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-50">Cadastrar</button>
      <p class="text-sm text-gray-600">{{ status() }}</p>
    </div>
  `,
})
export class FocoErro {
  status = signal('');

  cadastroModel = signal({ usuario: '', email: '', senha: '' });

  cadastroForm = form(this.cadastroModel, (p) => {
    required(p.usuario, { message: 'Informe o usuário' });
    required(p.email, { message: 'Informe o e-mail' });
    email(p.email, { message: 'E-mail inválido' });
    required(p.senha, { message: 'Informe a senha' });
  });

  enviar() {
    const primeiroErro = this.cadastroForm().errorSummary()[0];
    if (primeiroErro?.fieldTree) {
      this.cadastroForm().markAsTouched();
      primeiroErro.fieldTree().focusBoundControl();
      return;
    }
    submit(this.cadastroForm, async () => {
      this.status.set('Cadastro enviado!');
    });
  }
}
```

## 5. Validação

A validação é definida na **função de schema**, passada como segundo argumento de `form()`. Ela recebe um `SchemaPathTree` (os "caminhos" para cada campo) e [11]:

1. **Executa uma única vez**, na criação do formulário, para registrar as regras;
2. As regras rodam **automaticamente** sempre que um valor muda;
3. Os erros ficam disponíveis nos signals `valid()`, `invalid()`, `errors()` e `pending()`.

Ordem de execução: primeiro as regras **síncronas**; as **assíncronas** só rodam se todas as síncronas passarem. Todas as regras rodam (não para no primeiro erro), então um campo pode ter vários erros ao mesmo tempo [11].

### Validadores prontos

```typescript
// src/app/exemplos/inscricao/inscricao.ts
import { Component, signal } from '@angular/core';
import {
  email, form, FormField, max, maxLength, min, minLength, pattern, required,
} from '@angular/forms/signals';

@Component({
  selector: 'app-inscricao',
  imports: [FormField],
  template: `
    <div class="mx-auto max-w-md space-y-4 rounded-xl bg-white p-6 shadow-md">
      @for (campo of campos; track campo.rotulo) {
        <label class="block text-sm font-medium text-gray-700">
          {{ campo.rotulo }}
          <input [type]="campo.tipo" [formField]="campo.field" class="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-200" />
        </label>
        @if (campo.field().touched()) {
          @for (erro of campo.field().errors(); track erro) {
            <p class="mt-1 text-sm text-red-600">{{ erro.message }}</p>
          }
        }
      }
      <label class="block text-sm font-medium text-gray-700">
        Idade
        <input type="number" [formField]="inscricaoForm.idade" class="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-200" />
      </label>
      @if (inscricaoForm.idade().touched()) {
        @for (erro of inscricaoForm.idade().errors(); track erro) {
          <p class="mt-1 text-sm text-red-600">{{ erro.message }}</p>
        }
      }
    </div>
  `,
})
export class Inscricao {
  inscricaoModel = signal({ nome: '', email: '', cep: '', bio: '', idade: 0 });

  inscricaoForm = form(this.inscricaoModel, (p) => {
    required(p.nome, { message: 'O nome é obrigatório' });
    minLength(p.nome, 3, { message: 'O nome deve ter pelo menos 3 caracteres' });

    required(p.email, { message: 'O e-mail é obrigatório' });
    email(p.email, { message: 'Informe um e-mail válido' });

    pattern(p.cep, /^\d{5}-\d{3}$/, { message: 'O CEP deve estar no formato 00000-000' });

    maxLength(p.bio, 50, { message: 'A bio deve ter no máximo 50 caracteres' });

    min(p.idade, 18, { message: 'Você deve ter pelo menos 18 anos' });
    max(p.idade, 120, { message: 'Informe uma idade válida' });
  });

  // Campos de texto exibidos com o mesmo trecho de template
  campos = [
    { rotulo: 'Nome', tipo: 'text', field: this.inscricaoForm.nome },
    { rotulo: 'E-mail', tipo: 'email', field: this.inscricaoForm.email },
    { rotulo: 'CEP', tipo: 'text', field: this.inscricaoForm.cep },
    { rotulo: 'Bio', tipo: 'text', field: this.inscricaoForm.bio },
  ];
}
```

| Validador | Verifica | Observação |
| --- | --- | --- |
| `required()` | Campo preenchido | São vazios: `null`, `undefined`, `''`, `false` e `NaN` (o `0` e `[]` não são vazios) [11] |
| `email()` | Formato de e-mail | Aceita `user@ifpb.edu.br`, rejeita `user@` |
| `min()` / `max()` | Limites numéricos | Aceitam valor fixo ou função: `min(p.qtd, () => this.minimo())` [11] |
| `minLength()` / `maxLength()` | Tamanho | Caracteres (strings) ou elementos (arrays) [11] |
| `pattern()` | Expressão regular | Telefone, CEP, matrícula... |

> 💡 **Dica:** sempre informe a opção `message`. Mensagens devem dizer ao usuário **como corrigir** o problema ("A senha deve ter pelo menos 8 caracteres" em vez de "Entrada inválida"). Todo erro também tem um `kind` (`'required'`, `'email'`, `'minLength'`...), útil para mapear mensagens próprias [11].

### Validação condicional com `when`

Todos os validadores aceitam a opção `when`; a regra só é aplicada quando a função retorna `true` [11]:

```typescript
// src/app/exemplos/cupom/cupom.ts
import { Component, signal } from '@angular/core';
import { form, FormField, required } from '@angular/forms/signals';

@Component({
  selector: 'app-cupom',
  imports: [FormField],
  template: `
    <div class="mx-auto max-w-md space-y-4 rounded-xl bg-white p-6 shadow-md">
      <label class="flex items-center gap-2 text-sm text-gray-700">
        <input type="checkbox" [formField]="cupomForm.temCupom" class="size-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500" />
        Tenho um cupom de desconto
      </label>
      <input [formField]="cupomForm.codigoCupom" placeholder="Código do cupom"
             class="w-full rounded-lg border border-gray-300 px-3 py-2 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-200" />
      @if (cupomForm.codigoCupom().invalid()) {
        <p class="mt-1 text-sm text-red-600">{{ cupomForm.codigoCupom().errors()[0].message }}</p>
      }
      <p class="text-sm text-gray-500">Formulário válido: {{ cupomForm().valid() }}</p>
    </div>
  `,
})
export class Cupom {
  cupomModel = signal({ temCupom: false, codigoCupom: '' });

  cupomForm = form(this.cupomModel, (p) => {
    required(p.codigoCupom, {
      message: 'Informe o código do cupom',
      when: ({ valueOf }) => valueOf(p.temCupom),
    });
  });
}
```

Para ativar um **grupo** de regras de uma vez, use `applyWhen()` [11] [13]:

```typescript
// src/app/exemplos/endereco-pais/endereco-pais.ts
import { Component, signal } from '@angular/core';
import { applyWhen, form, FormField, pattern, required } from '@angular/forms/signals';

@Component({
  selector: 'app-endereco-pais',
  imports: [FormField],
  template: `
    <div class="mx-auto max-w-md space-y-4 rounded-xl bg-white p-6 shadow-md">
      <select [formField]="enderecoForm.pais" class="w-full rounded-lg border border-gray-300 px-3 py-2 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-200">
        <option value="BR">Brasil</option>
        <option value="PT">Portugal</option>
      </select>
      <input [formField]="enderecoForm.cep" placeholder="CEP / código postal"
             class="w-full rounded-lg border border-gray-300 px-3 py-2 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-200" />
      @for (erro of enderecoForm.cep().errors(); track erro) {
        <p class="mt-1 text-sm text-red-600">{{ erro.message }}</p>
      }
    </div>
  `,
})
export class EnderecoPais {
  enderecoModel = signal({ pais: 'BR', cep: '' });

  enderecoForm = form(this.enderecoModel, (p) => {
    required(p.pais);

    applyWhen(
      p,
      ({ valueOf }) => valueOf(p.pais) === 'BR',
      (p) => {
        // Só valem quando o país é Brasil
        required(p.cep, { message: 'O CEP é obrigatório no Brasil' });
        pattern(p.cep, /^\d{5}-\d{3}$/, { message: 'Use o formato 00000-000' });
      },
    );
  });
}
```

### Validadores personalizados com `validate()`

`validate()` recebe uma função que retorna um **objeto de erro** (`kind` e `message`) quando o valor é inválido, ou `null` quando é válido [11]:

```typescript
// src/app/exemplos/site/site.ts
import { Component, signal } from '@angular/core';
import { form, FormField, validate } from '@angular/forms/signals';

@Component({
  selector: 'app-site',
  imports: [FormField],
  template: `
    <div class="mx-auto max-w-md space-y-4 rounded-xl bg-white p-6 shadow-md">
      <input [formField]="siteForm.site" placeholder="https://..." class="w-full rounded-lg border border-gray-300 px-3 py-2 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-200" />
      @if (siteForm.site().invalid()) {
        <p class="mt-1 text-sm text-red-600">{{ siteForm.site().errors()[0].message }}</p>
      }
    </div>
  `,
})
export class Site {
  siteModel = signal({ site: '' });

  siteForm = form(this.siteModel, (p) => {
    validate(p.site, ({ value }) => {
      if (!value().startsWith('https://')) {
        return { kind: 'https', message: 'A URL deve começar com https://' };
      }
      return null;
    });
  });
}
```

A função recebe um `FieldContext` com, entre outros [11]:

| Propriedade | Descrição |
| --- | --- |
| `value` | Signal com o valor do campo validado |
| `valueOf(path)` | Lê o valor de outro campo |
| `stateOf(path)` | Lê o estado de outro campo |
| `state` / `fieldTree` | Estado e field tree do próprio campo |

### Validadores reutilizáveis

Basta encapsular o `validate()` em uma função que recebe um `SchemaPath` [11]:

```typescript
// src/app/exemplos/validadores/cpf.validator.ts
import { SchemaPath, validate } from '@angular/forms/signals';

export function cpf(path: SchemaPath<string>, options?: { message?: string }) {
  validate(path, ({ value }) => {
    const numeros = value().replace(/\D/g, '');
    if (numeros.length !== 11 || /^(\d)\1+$/.test(numeros)) {
      return { kind: 'cpf', message: options?.message ?? 'CPF inválido' };
    }
    return null;
  });
}
```

E usá-lo como um validador pronto:

```typescript
// src/app/exemplos/aluno-cpf/aluno-cpf.ts
import { Component, signal } from '@angular/core';
import { form, FormField, required } from '@angular/forms/signals';
import { cpf } from '../validadores/cpf.validator';

@Component({
  selector: 'app-aluno-cpf',
  imports: [FormField],
  template: `
    <div class="mx-auto max-w-md space-y-4 rounded-xl bg-white p-6 shadow-md">
      <input [formField]="alunoForm.cpf" placeholder="000.000.000-00" class="w-full rounded-lg border border-gray-300 px-3 py-2 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-200" />
      @if (alunoForm.cpf().touched() && alunoForm.cpf().invalid()) {
        <p class="mt-1 text-sm text-red-600">{{ alunoForm.cpf().errors()[0].message }}</p>
      }
    </div>
  `,
})
export class AlunoCpf {
  alunoModel = signal({ cpf: '' });

  alunoForm = form(this.alunoModel, (p) => {
    required(p.cpf, { message: 'O CPF é obrigatório' });
    cpf(p.cpf, { message: 'Informe um CPF válido' });
  });
}
```

Schemas inteiros também podem ser reutilizados: `schema()` cria o schema e `apply()` o aplica a um caminho [13]:

```typescript
// src/app/exemplos/enderecos/enderecos.ts
import { Component, signal } from '@angular/core';
import { apply, form, FormField, required, schema } from '@angular/forms/signals';

interface Endereco {
  rua: string;
  cidade: string;
}

const enderecoSchema = schema<Endereco>((e) => {
  required(e.rua, { message: 'Informe a rua' });
  required(e.cidade, { message: 'Informe a cidade' });
});

@Component({
  selector: 'app-enderecos',
  imports: [FormField],
  template: `
    <div class="mx-auto max-w-md space-y-4 rounded-xl bg-white p-6 shadow-md">
      <h3 class="font-semibold text-gray-700">Entrega</h3>
      <input [formField]="pedidoForm.entrega.rua" placeholder="Rua" class="w-full rounded-lg border border-gray-300 px-3 py-2 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-200" />
      <input [formField]="pedidoForm.entrega.cidade" placeholder="Cidade" class="w-full rounded-lg border border-gray-300 px-3 py-2 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-200" />

      <h3 class="font-semibold text-gray-700">Cobrança</h3>
      <input [formField]="pedidoForm.cobranca.rua" placeholder="Rua" class="w-full rounded-lg border border-gray-300 px-3 py-2 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-200" />
      <input [formField]="pedidoForm.cobranca.cidade" placeholder="Cidade" class="w-full rounded-lg border border-gray-300 px-3 py-2 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-200" />

      <p class="text-sm text-gray-500">
        Entrega válida: {{ pedidoForm.entrega().valid() }} ·
        Cobrança válida: {{ pedidoForm.cobranca().valid() }}
      </p>
    </div>
  `,
})
export class Enderecos {
  pedidoModel = signal({
    entrega: { rua: '', cidade: '' },
    cobranca: { rua: '', cidade: '' },
  });

  pedidoForm = form(this.pedidoModel, (p) => {
    apply(p.entrega, enderecoSchema);
    apply(p.cobranca, enderecoSchema);
  });
}
```

### Validação entre campos (cross-field)

Com `valueOf()`, uma regra pode comparar campos. Ela é reavaliada automaticamente quando **qualquer um** dos dois muda [11]:

```typescript
// src/app/exemplos/troca-senha/troca-senha.ts
import { Component, signal } from '@angular/core';
import { form, FormField, minLength, required, validate } from '@angular/forms/signals';

@Component({
  selector: 'app-troca-senha',
  imports: [FormField],
  template: `
    <div class="mx-auto max-w-md space-y-4 rounded-xl bg-white p-6 shadow-md">
      <input type="password" [formField]="senhaForm.senha" placeholder="Nova senha"
             class="w-full rounded-lg border border-gray-300 px-3 py-2 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-200" />
      @if (senhaForm.senha().touched()) {
        @for (erro of senhaForm.senha().errors(); track erro) {
          <p class="mt-1 text-sm text-red-600">{{ erro.message }}</p>
        }
      }

      <input type="password" [formField]="senhaForm.confirmarSenha" placeholder="Confirmar senha"
             class="w-full rounded-lg border border-gray-300 px-3 py-2 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-200" />
      @if (senhaForm.confirmarSenha().touched()) {
        @for (erro of senhaForm.confirmarSenha().errors(); track erro) {
          <p class="mt-1 text-sm text-red-600">{{ erro.message }}</p>
        }
      }

      <button type="button" [disabled]="senhaForm().invalid()" class="rounded-lg bg-indigo-600 px-4 py-2 font-medium text-white hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-50">
        Alterar senha
      </button>
    </div>
  `,
})
export class TrocaSenha {
  senhaModel = signal({ senha: '', confirmarSenha: '' });

  senhaForm = form(this.senhaModel, (p) => {
    required(p.senha, { message: 'A senha é obrigatória' });
    minLength(p.senha, 8, { message: 'A senha deve ter pelo menos 8 caracteres' });

    required(p.confirmarSenha, { message: 'Confirme a sua senha' });
    validate(p.confirmarSenha, ({ value, valueOf }) => {
      if (value() !== valueOf(p.senha)) {
        return { kind: 'senhasDiferentes', message: 'As senhas não conferem' };
      }
      return null;
    });
  });
}
```

Para regras que envolvem uma subárvore inteira e precisam apontar o erro para um campo específico, use `validateTree()`, informando o campo em `fieldTree` [11]:

```typescript
// src/app/exemplos/periodo/periodo.ts
import { Component, signal } from '@angular/core';
import { form, FormField, required, validateTree } from '@angular/forms/signals';

@Component({
  selector: 'app-periodo',
  imports: [FormField],
  template: `
    <div class="mx-auto max-w-md space-y-4 rounded-xl bg-white p-6 shadow-md">
      <label class="block text-sm font-medium text-gray-700">
        Início
        <input type="date" [formField]="periodoForm.dataInicio" class="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-200" />
      </label>
      <label class="block text-sm font-medium text-gray-700">
        Fim
        <input type="date" [formField]="periodoForm.dataFim" class="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-200" />
      </label>
      @for (erro of periodoForm.dataFim().errors(); track erro) {
        <p class="mt-1 text-sm text-red-600">{{ erro.message }}</p>
      }
    </div>
  `,
})
export class Periodo {
  periodoModel = signal({ dataInicio: '', dataFim: '' });

  periodoForm = form(this.periodoModel, (p) => {
    required(p.dataInicio);
    required(p.dataFim);

    validateTree(p, (ctx) => {
      const inicio = ctx.valueOf(p.dataInicio);
      const fim = ctx.valueOf(p.dataFim);
      // Datas no formato "AAAA-MM-DD" podem ser comparadas como texto
      if (inicio && fim && fim < inicio) {
        return {
          kind: 'periodoInvalido',
          message: 'A data final deve ser posterior à inicial',
          fieldTree: ctx.fieldTree.dataFim,
        };
      }
      return null;
    });
  });
}
```

### Validando itens de arrays com `applyEach()`

```typescript
// src/app/exemplos/pedido-itens/pedido-itens.ts
import { Component, signal } from '@angular/core';
import { applyEach, form, FormField, min, required, SchemaPathTree } from '@angular/forms/signals';

interface Item {
  produto: string;
  quantidade: number;
}

interface Pedido {
  cliente: string;
  itens: Item[];
}

function itemSchema(item: SchemaPathTree<Item>) {
  required(item.produto, { message: 'Informe o produto' });
  min(item.quantidade, 1, { message: 'A quantidade mínima é 1' });
}

@Component({
  selector: 'app-pedido-itens',
  imports: [FormField],
  template: `
    <div class="mx-auto max-w-md space-y-4 rounded-xl bg-white p-6 shadow-md">
      <input [formField]="pedidoForm.cliente" placeholder="Cliente" class="w-full rounded-lg border border-gray-300 px-3 py-2 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-200" />

      @for (item of pedidoForm.itens; track item; let i = $index) {
        <div class="flex gap-2">
          <input [formField]="item.produto" placeholder="Produto" class="w-full rounded-lg border border-gray-300 px-3 py-2 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-200" />
          <input type="number" [formField]="item.quantidade" class="w-24 w-full rounded-lg border border-gray-300 px-3 py-2 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-200" />
          <button type="button" (click)="remover(i)"
                  class="rounded-lg px-3 text-sm text-red-600 hover:bg-red-50">✕</button>
        </div>
        @for (erro of item().errorSummary(); track erro) {
          <p class="mt-1 text-sm text-red-600">Item {{ i + 1 }}: {{ erro.message }}</p>
        }
      }

      <button type="button" (click)="adicionar()" class="rounded-lg border border-gray-300 px-3 py-2 text-sm text-gray-700 hover:bg-gray-100">+ Item</button>
      <p class="text-sm text-gray-500">Pedido válido: {{ pedidoForm().valid() }}</p>
    </div>
  `,
})
export class PedidoItens {
  pedidoModel = signal<Pedido>({
    cliente: '',
    itens: [{ produto: '', quantidade: 0 }],
  });

  pedidoForm = form(this.pedidoModel, (p) => {
    required(p.cliente);
    applyEach(p.itens, itemSchema);
  });

  adicionar() {
    this.pedidoModel.update((m) => ({ ...m, itens: [...m.itens, { produto: '', quantidade: 1 }] }));
  }

  remover(indice: number) {
    this.pedidoModel.update((m) => ({ ...m, itens: m.itens.filter((_, i) => i !== indice) }));
  }
}
```

> 💡 **Dica:** `errors()` mostra apenas os erros do próprio campo; `errorSummary()` reúne os erros do campo **e de todos os seus descendentes** (aqui, os erros de `produto` e `quantidade` de cada item) [14].

### Validação assíncrona com `validateHttp()`

Para validar contra o servidor (ex.: login já cadastrado). Enquanto a requisição está em andamento, `pending()` é `true`. Ela só roda depois que as regras síncronas passam [11], e exige `provideHttpClient()` no `app.config.ts` (veja a Configuração Inicial) [4]:

```typescript
// src/app/exemplos/login-disponivel/login-disponivel.ts
import { Component, signal } from '@angular/core';
import { form, FormField, required, validateHttp } from '@angular/forms/signals';

interface Disponibilidade {
  emUso: boolean;
}

@Component({
  selector: 'app-login-disponivel',
  imports: [FormField],
  template: `
    <div class="mx-auto max-w-md space-y-4 rounded-xl bg-white p-6 shadow-md">
      <input [formField]="usuarioForm.login" placeholder="Login" class="w-full rounded-lg border border-gray-300 px-3 py-2 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-200" />
      @if (usuarioForm.login().pending()) {
        <p class="flex items-center gap-2 text-sm text-gray-500">
          <span class="size-4 animate-spin rounded-full border-2 border-indigo-500 border-t-transparent"></span>
          Verificando disponibilidade...
        </p>
      }
      @for (erro of usuarioForm.login().errors(); track erro) {
        <p class="mt-1 text-sm text-red-600">{{ erro.message }}</p>
      }
    </div>
  `,
})
export class LoginDisponivel {
  usuarioModel = signal({ login: '' });

  usuarioForm = form(this.usuarioModel, (p) => {
    required(p.login, { message: 'O login é obrigatório' });

    validateHttp(p.login, {
      request: ({ value }) => `/api/usuarios/disponivel?login=${value()}`,
      onSuccess: (resposta: Disponibilidade) =>
        resposta.emUso ? { kind: 'loginEmUso', message: 'Este login já está em uso' } : null,
      onError: () => ({ kind: 'erroRede', message: 'Não foi possível verificar o login' }),
    });
  });
}
```

> ⚠️ **Atenção:** sem um backend respondendo em `/api/usuarios/disponivel`, a requisição falha e o campo exibe a mensagem de `onError`. Na aula de HTTP e API REST, criaremos esse endpoint.

### Integração com Zod/Valibot (Standard Schema)

Bibliotecas compatíveis com [Standard Schema](https://standardschema.dev/) podem ser usadas com `validateStandardSchema()` [11] [15]. Instale o Zod com `npm install zod` [16]:

```typescript
// src/app/exemplos/usuario-zod/usuario-zod.ts
import { Component, signal } from '@angular/core';
import { form, FormField, validateStandardSchema } from '@angular/forms/signals';
import * as z from 'zod';

const usuarioSchema = z.object({
  email: z.email('Informe um e-mail válido'),
  senha: z.string().min(8, 'A senha deve ter pelo menos 8 caracteres'),
});

@Component({
  selector: 'app-usuario-zod',
  imports: [FormField],
  template: `
    <div class="mx-auto max-w-md space-y-4 rounded-xl bg-white p-6 shadow-md">
      <input type="email" [formField]="usuarioForm.email" placeholder="E-mail"
             class="w-full rounded-lg border border-gray-300 px-3 py-2 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-200" />
      @for (erro of usuarioForm.email().errors(); track erro) {
        <p class="mt-1 text-sm text-red-600">{{ erro.message }}</p>
      }
      <input type="password" [formField]="usuarioForm.senha" placeholder="Senha"
             class="w-full rounded-lg border border-gray-300 px-3 py-2 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-200" />
      @for (erro of usuarioForm.senha().errors(); track erro) {
        <p class="mt-1 text-sm text-red-600">{{ erro.message }}</p>
      }
    </div>
  `,
})
export class UsuarioZod {
  usuarioModel = signal({ email: '', senha: '' });

  usuarioForm = form(this.usuarioModel, (p) => {
    validateStandardSchema(p, usuarioSchema);
  });
}
```

## 6. Exemplo Completo: Cadastro de Aluno

Exemplo reunindo modelo tipado, objetos aninhados, arrays, validadores prontos e personalizados, validação entre campos, campo condicional, estado e envio.

```typescript
// src/app/exemplos/cadastro-aluno/cadastro-aluno.ts
import { Component, signal } from '@angular/core';
import { JsonPipe } from '@angular/common';
import {
  applyEach, email, form, FormField, FormRoot, hidden, minLength,
  pattern, required, validate,
} from '@angular/forms/signals';

interface CadastroAluno {
  nome: string;
  email: string;
  matricula: string;
  curso: string;
  possuiDeficiencia: boolean;
  descricaoAcessibilidade: string;
  telefones: string[];
  acesso: {
    senha: string;
    confirmarSenha: string;
  };
  aceitaTermos: boolean;
}

const CADASTRO_VAZIO: CadastroAluno = {
  nome: '',
  email: '',
  matricula: '',
  curso: '',
  possuiDeficiencia: false,
  descricaoAcessibilidade: '',
  telefones: [''],
  acesso: { senha: '', confirmarSenha: '' },
  aceitaTermos: false,
};

@Component({
  selector: 'app-cadastro-aluno',
  imports: [FormRoot, FormField, JsonPipe],
  templateUrl: './cadastro-aluno.html',
  styleUrl: './cadastro-aluno.css',
})
export class CadastroAlunoComponent {
  cursos = ['TSI', 'Engenharia de Computação', 'Redes de Computadores'];
  enviado = signal(false);

  cadastroModel = signal<CadastroAluno>(structuredClone(CADASTRO_VAZIO));

  cadastroForm = form(
    this.cadastroModel,
    (p) => {
      required(p.nome, { message: 'O nome é obrigatório' });
      minLength(p.nome, 3, { message: 'O nome deve ter pelo menos 3 caracteres' });

      required(p.email, { message: 'O e-mail é obrigatório' });
      email(p.email, { message: 'Informe um e-mail válido' });

      required(p.matricula, { message: 'A matrícula é obrigatória' });
      pattern(p.matricula, /^\d{12}$/, { message: 'A matrícula deve ter 12 dígitos' });

      required(p.curso, { message: 'Selecione um curso' });

      hidden(p.descricaoAcessibilidade, {
        when: ({ valueOf }) => !valueOf(p.possuiDeficiencia),
      });
      required(p.descricaoAcessibilidade, {
        message: 'Descreva o recurso de acessibilidade necessário',
      });

      applyEach(p.telefones, (tel) => {
        pattern(tel, /^\(\d{2}\) \d{4,5}-\d{4}$/, {
          message: 'Use o formato (83) 99999-9999',
        });
      });

      required(p.acesso.senha, { message: 'A senha é obrigatória' });
      minLength(p.acesso.senha, 8, { message: 'A senha deve ter pelo menos 8 caracteres' });
      validate(p.acesso.confirmarSenha, ({ value, valueOf }) =>
        value() !== valueOf(p.acesso.senha)
          ? { kind: 'senhasDiferentes', message: 'As senhas não conferem' }
          : null,
      );

      required(p.aceitaTermos, { message: 'Você precisa aceitar os termos' });
    },
    {
      submission: {
        action: async (f) => {
          await this.salvar(this.cadastroModel());
          this.enviado.set(true);
          f().reset(structuredClone(CADASTRO_VAZIO));
        },
      },
    },
  );

  adicionarTelefone() {
    this.cadastroModel.update((m) => ({ ...m, telefones: [...m.telefones, ''] }));
  }

  removerTelefone(indice: number) {
    this.cadastroModel.update((m) => ({
      ...m,
      telefones: m.telefones.filter((_, i) => i !== indice),
    }));
  }

  private salvar(dados: CadastroAluno): Promise<CadastroAluno> {
    // Simula o envio para uma API
    return new Promise((resolve) => setTimeout(() => resolve(dados), 1500));
  }
}
```

```html
<!-- src/app/exemplos/cadastro-aluno/cadastro-aluno.html -->
<div class="min-h-screen bg-gray-100 px-4 py-10">
  <form [formRoot]="cadastroForm"
        class="mx-auto max-w-xl space-y-5 rounded-2xl bg-white p-8 shadow-lg">
    <h2 class="text-2xl font-bold text-gray-800">Cadastro de Aluno</h2>

    <div>
      <label class="rotulo" for="nome">Nome</label>
      <input id="nome" [formField]="cadastroForm.nome" class="campo"
             [class.campo-invalido]="cadastroForm.nome().touched() && cadastroForm.nome().invalid()" />
      @if (cadastroForm.nome().touched() && cadastroForm.nome().invalid()) {
        <p class="erro">{{ cadastroForm.nome().errors()[0].message }}</p>
      }
    </div>

    <div class="grid gap-5 sm:grid-cols-2">
      <div>
        <label class="rotulo" for="email">E-mail</label>
        <input id="email" type="email" [formField]="cadastroForm.email" class="campo"
               [class.campo-invalido]="cadastroForm.email().touched() && cadastroForm.email().invalid()" />
        @if (cadastroForm.email().touched() && cadastroForm.email().invalid()) {
          <p class="erro">{{ cadastroForm.email().errors()[0].message }}</p>
        }
      </div>

      <div>
        <label class="rotulo" for="matricula">Matrícula</label>
        <input id="matricula" [formField]="cadastroForm.matricula" class="campo"
               [class.campo-invalido]="cadastroForm.matricula().touched() && cadastroForm.matricula().invalid()" />
        @if (cadastroForm.matricula().touched() && cadastroForm.matricula().invalid()) {
          <p class="erro">{{ cadastroForm.matricula().errors()[0].message }}</p>
        }
      </div>
    </div>

    <div>
      <label class="rotulo" for="curso">Curso</label>
      <select id="curso" [formField]="cadastroForm.curso" class="campo"
              [class.campo-invalido]="cadastroForm.curso().touched() && cadastroForm.curso().invalid()">
        <option value="">Selecione...</option>
        @for (curso of cursos; track curso) {
          <option [value]="curso">{{ curso }}</option>
        }
      </select>
      @if (cadastroForm.curso().touched() && cadastroForm.curso().invalid()) {
        <p class="erro">{{ cadastroForm.curso().errors()[0].message }}</p>
      }
    </div>

    <div class="space-y-3">
      <label class="flex items-center gap-2 text-sm text-gray-700">
        <input type="checkbox" [formField]="cadastroForm.possuiDeficiencia" class="checkbox" />
        Necessito de recursos de acessibilidade
      </label>
      @if (!cadastroForm.descricaoAcessibilidade().hidden()) {
        <div>
          <label class="rotulo" for="acessibilidade">Quais recursos?</label>
          <textarea id="acessibilidade" rows="3" class="campo"
                    [formField]="cadastroForm.descricaoAcessibilidade"
                    [class.campo-invalido]="cadastroForm.descricaoAcessibilidade().touched() &&
                                            cadastroForm.descricaoAcessibilidade().invalid()"></textarea>
          @if (cadastroForm.descricaoAcessibilidade().touched() &&
               cadastroForm.descricaoAcessibilidade().invalid()) {
            <p class="erro">{{ cadastroForm.descricaoAcessibilidade().errors()[0].message }}</p>
          }
        </div>
      }
    </div>

    <fieldset class="space-y-3 rounded-xl border border-gray-200 p-4">
      <legend class="px-1 text-sm font-semibold text-gray-700">Telefones</legend>
      @for (tel of cadastroForm.telefones; track tel; let i = $index) {
        <div>
          <div class="flex gap-2">
            <input [formField]="tel" placeholder="(83) 99999-9999" class="campo"
                   [class.campo-invalido]="tel().touched() && tel().invalid()" />
            <button type="button" (click)="removerTelefone(i)"
                    class="rounded-lg px-3 text-sm text-red-600 hover:bg-red-50">
              Remover
            </button>
          </div>
          @if (tel().touched() && tel().invalid()) {
            <p class="erro">{{ tel().errors()[0].message }}</p>
          }
        </div>
      }
      <button type="button" (click)="adicionarTelefone()" class="botao-secundario">
        + Adicionar telefone
      </button>
    </fieldset>

    <fieldset class="grid gap-5 rounded-xl border border-gray-200 p-4 sm:grid-cols-2">
      <legend class="px-1 text-sm font-semibold text-gray-700">Acesso</legend>
      <div>
        <label class="rotulo" for="senha">Senha</label>
        <input id="senha" type="password" [formField]="cadastroForm.acesso.senha" class="campo"
               [class.campo-invalido]="cadastroForm.acesso.senha().touched() &&
                                       cadastroForm.acesso.senha().invalid()" />
        @if (cadastroForm.acesso.senha().touched() && cadastroForm.acesso.senha().invalid()) {
          @for (erro of cadastroForm.acesso.senha().errors(); track erro) {
            <p class="erro">{{ erro.message }}</p>
          }
        }
      </div>

      <div>
        <label class="rotulo" for="confirmar">Confirmar senha</label>
        <input id="confirmar" type="password" class="campo"
               [formField]="cadastroForm.acesso.confirmarSenha"
               [class.campo-invalido]="cadastroForm.acesso.confirmarSenha().touched() &&
                                       cadastroForm.acesso.confirmarSenha().invalid()" />
        @if (cadastroForm.acesso.confirmarSenha().touched() &&
             cadastroForm.acesso.confirmarSenha().invalid()) {
          <p class="erro">{{ cadastroForm.acesso.confirmarSenha().errors()[0].message }}</p>
        }
      </div>
    </fieldset>

    <div>
      <label class="flex items-center gap-2 text-sm text-gray-700">
        <input type="checkbox" [formField]="cadastroForm.aceitaTermos" class="checkbox" />
        Li e aceito os termos de uso
      </label>
      @if (cadastroForm.aceitaTermos().touched() && cadastroForm.aceitaTermos().invalid()) {
        <p class="erro">{{ cadastroForm.aceitaTermos().errors()[0].message }}</p>
      }
    </div>

    <button type="submit" [disabled]="cadastroForm().submitting()" class="botao w-full">
      {{ cadastroForm().submitting() ? 'Enviando...' : 'Cadastrar' }}
    </button>

    @if (cadastroForm().dirty()) {
      <p class="rounded-lg border border-amber-300 bg-amber-50 p-3 text-sm text-amber-800">
        ⚠️ Existem alterações não salvas.
      </p>
    }
    @if (enviado()) {
      <p class="rounded-lg border border-green-300 bg-green-50 p-3 text-sm text-green-800">
        ✅ Cadastro realizado com sucesso!
      </p>
    }
  </form>

  <div class="mx-auto mt-6 max-w-xl">
    <h3 class="mb-2 text-sm font-semibold text-gray-600">Modelo (atualizado em tempo real)</h3>
    <pre class="overflow-x-auto rounded-xl bg-gray-900 p-4 text-xs text-green-300">{{ cadastroModel() | json }}</pre>
  </div>
</div>
```

Para não repetir as mesmas listas de utilitários em cada campo, o CSS do componente define classes próprias com `@apply`:

```css
/* src/app/exemplos/cadastro-aluno/cadastro-aluno.css */
@reference "tailwindcss";

.rotulo {
  @apply mb-1 block text-sm font-medium text-gray-700;
}

.campo {
  @apply w-full rounded-lg border border-gray-300 px-3 py-2 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-200;
}

/* Declarada depois de .campo para sobrescrever a borda e o anel de foco */
.campo-invalido {
  @apply border-red-500 bg-red-50 focus:border-red-500 focus:ring-red-200;
}

.erro {
  @apply mt-1 text-sm text-red-600;
}

.checkbox {
  @apply size-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500;
}

.botao {
  @apply rounded-lg bg-indigo-600 px-4 py-2 font-medium text-white hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-50;
}

.botao-secundario {
  @apply rounded-lg border border-gray-300 px-3 py-2 text-sm text-gray-700 hover:bg-gray-100;
}
```

> 💡 **Dica:** compare este exemplo com o cadastro feito com reactive forms na aula anterior: não há `FormGroup`, `FormArray`, `Validators`, *getters* auxiliares nem a função recursiva `markFormGroupTouched()`. O `submit()` já marca tudo como *touched*.

## 7. Comparação: Reactive Forms × Signal Forms

| Tarefa | Reactive Forms | Signal Forms |
| --- | --- | --- |
| Criar o formulário | `fb.group({ nome: ['', Validators.required] })` | `form(signal({ nome: '' }), p => required(p.nome))` |
| Ligar ao input | `formControlName="nome"` | `[formField]="f.nome"` |
| Grupo aninhado | `formGroupName="endereco"` | `[formField]="f.endereco.rua"` |
| Ler o valor | `form.value` / `valueChanges` | `modelo()` / `f.nome().value()` |
| Atualizar o valor | `patchValue()` / `setValue()` | `modelo.set()` / `f.nome().value.set()` |
| Lista dinâmica | `FormArray` + `push()`/`removeAt()` | Array no modelo + `modelo.update()` |
| Validação entre campos | Validador no `FormGroup` | `validate()` com `valueOf()` |
| Desabilitar campo | `control.disable()` (imperativo) | `disabled(p.campo, { when })` (declarativo) |
| Erros | `control.errors?.['required']` | `f.campo().errors()` (array com `kind` e `message`) |
| Marcar como tocado no envio | Função recursiva manual | `submit()` faz automaticamente |

## 8. Boas Práticas

1. **Projete o modelo antes do formulário**: interfaces explícitas, todos os campos inicializados, sem `undefined`;
2. **Separe modelo do formulário e modelo de domínio** quando eles divergirem; converta com `linkedSignal()` e no `submit()`;
3. **Prefira estrutura estática**: use `hidden()`/`disabled()` em vez de adicionar ou remover propriedades;
4. **Centralize as regras na função de schema** e extraia validadores reutilizáveis para funções;
5. **Sempre forneça `message`** nos validadores;
6. **Mostre erros só após interação**: `touched() && invalid()`;
7. **Use `[formRoot]` ou `submit()`** para o envio e foque o primeiro campo inválido;
8. **Não confie na validação nativa do navegador** nem em `:valid`/`:invalid` no CSS;
9. **Valide também no backend**: validação no cliente melhora a experiência, mas não garante segurança.

## Resumo

Os Signal Forms do Angular oferecem:

- **Modelo como fonte de verdade**: os dados ficam em um `signal()` comum, sincronizado automaticamente com a tela via `[formField]`;
- **Segurança de tipos**: a field tree é inferida a partir do tipo do modelo;
- **Validação declarativa e centralizada**: validadores prontos, personalizados, entre campos, condicionais e assíncronos na função de schema;
- **Estado reativo**: `valid()`, `errors()`, `touched()`, `dirty()`, `disabled()`, `hidden()`... são signals, prontos para templates e `computed()`;
- **Menos código**: sem `FormGroup`, `FormArray`, `subscribe` ou funções auxiliares para marcar campos.

### Referências

As páginas do angular.dev foram consultadas em outubro de 2026 e descrevem o **Angular v22**, versão em que os Signal Forms aparecem como estáveis [2].

1. [Visão geral dos Signal Forms](https://angular.dev/guide/forms/signals/overview): motivação, pré-requisitos e configuração.
   - [Por que Signal Forms?](https://angular.dev/guide/forms/signals/overview#why-signal-forms) · [Pré-requisitos (v21+)](https://angular.dev/guide/forms/signals/overview#prerequisites) · [Configuração](https://angular.dev/guide/forms/signals/overview#setup)
2. [Comparação entre as abordagens de formulários](https://angular.dev/guide/forms/signals/comparison): Signal Forms × Reactive Forms × Template-driven, com recomendações de uso e status de estabilidade.
   - [Comparação rápida](https://angular.dev/guide/forms/signals/comparison#quick-comparison) · [Escolhendo a abordagem](https://angular.dev/guide/forms/signals/comparison#choose-your-approach)
3. [Instalando o Tailwind CSS com Angular](https://tailwindcss.com/docs/installation/framework-guides/angular): passo a passo oficial do Tailwind v4 em projetos Angular.
4. [Configurando o HttpClient](https://angular.dev/guide/http/setup#providing-httpclient-through-dependency-injection): como registrar `provideHttpClient()` no `app.config.ts`.
5. [Diretiva `@reference` do Tailwind](https://tailwindcss.com/docs/functions-and-directives#reference-directive): uso de `@apply` em CSS de componentes (veja também [`@apply`](https://tailwindcss.com/docs/functions-and-directives#apply-directive)).
6. [Modelos de formulário](https://angular.dev/guide/forms/signals/models): criação do modelo, leitura, atualização, sincronização e estruturas suportadas.
   - [Criando modelos](https://angular.dev/guide/forms/signals/models#creating-models) · [Estruturas suportadas](https://angular.dev/guide/forms/signals/models#supported-model-structures) · [Tipos TypeScript](https://angular.dev/guide/forms/signals/models#using-typescript-types) · [Inicializando os campos](https://angular.dev/guide/forms/signals/models#initializing-all-fields) · [Lendo valores](https://angular.dev/guide/forms/signals/models#reading-model-values) · [Atualizando valores](https://angular.dev/guide/forms/signals/models#updating-form-models-programmatically) · [Two-way binding](https://angular.dev/guide/forms/signals/models#two-way-data-binding) · [Objetos aninhados](https://angular.dev/guide/forms/signals/models#working-with-nested-objects) · [Arrays](https://angular.dev/guide/forms/signals/models#working-with-arrays)
7. [Gerenciamento do estado dos campos](https://angular.dev/guide/forms/signals/field-state-management): signals de validação, interação e disponibilidade, propagação, estilização, envio e foco.
   - [Signals do estado](https://angular.dev/guide/forms/signals/field-state-management#field-state-signals) · [Verificando a validade](https://angular.dev/guide/forms/signals/field-state-management#checking-validity) · [Touched](https://angular.dev/guide/forms/signals/field-state-management#touched-state) · [Dirty](https://angular.dev/guide/forms/signals/field-state-management#dirty-state) · [Disponibilidade](https://angular.dev/guide/forms/signals/field-state-management#availability-state) · [Propagação](https://angular.dev/guide/forms/signals/field-state-management#state-propagation) · [Estado do formulário × do campo](https://angular.dev/guide/forms/signals/field-state-management#when-to-use-form-level-vs-field-level) · [Erros após interação](https://angular.dev/guide/forms/signals/field-state-management#conditional-error-display) · [Arrays no `@for`](https://angular.dev/guide/forms/signals/field-state-management#tracking-values-for-array-fields) · [Envio](https://angular.dev/guide/forms/signals/field-state-management#form-submission) · [Estilização](https://angular.dev/guide/forms/signals/field-state-management#styling-based-on-validation-state) · [Focando o primeiro campo inválido](https://angular.dev/guide/forms/signals/field-state-management#focusing-the-first-invalid-field-on-submission)
8. [Projetando o modelo do formulário](https://angular.dev/guide/forms/signals/model-design): boas práticas, estrutura estática e conversão entre modelo de domínio e modelo do formulário.
   - [Modelo de domínio × modelo do formulário](https://angular.dev/guide/forms/signals/model-design#form-model-vs-domain-model) · [Boas práticas](https://angular.dev/guide/forms/signals/model-design#form-model-best-practices) · [Tipos compatíveis com os controles](https://angular.dev/guide/forms/signals/model-design#match-data-types-to-ui-controls) · [Evite `undefined`](https://angular.dev/guide/forms/signals/model-design#avoid-undefined) · [Evite estrutura dinâmica](https://angular.dev/guide/forms/signals/model-design#avoid-models-with-dynamic-structure) · [Exceções (arrays)](https://angular.dev/guide/forms/signals/model-design#exceptions) · [Domínio → formulário](https://angular.dev/guide/forms/signals/model-design#domain-model-to-form-model) · [Formulário → domínio](https://angular.dev/guide/forms/signals/model-design#form-model-to-domain-model)
9. [Estado dependente com `linkedSignal`](https://angular.dev/guide/signals/linked-signal): signal derivado de outro e que continua editável.
10. [Lógica de formulário](https://angular.dev/guide/forms/signals/form-logic): regras `disabled()`, `hidden()` e `readonly()`.
    - [`disabled()`](https://angular.dev/guide/forms/signals/form-logic#prevent-field-updates-with-disabled) · [`hidden()`](https://angular.dev/guide/forms/signals/form-logic#configuring-hidden-state-on-fields) · [`readonly()`](https://angular.dev/guide/forms/signals/form-logic#display-uneditable-fields-with-readonly) · [Qual escolher](https://angular.dev/guide/forms/signals/form-logic#choose-between-hidden-disabled-and-readonly)
11. [Validação](https://angular.dev/guide/forms/signals/validation): função de schema, validadores prontos, personalizados, entre campos, assíncronos e integração com Standard Schema.
    - [Função de schema](https://angular.dev/guide/forms/signals/validation#the-schema-function) · [Ordem de execução](https://angular.dev/guide/forms/signals/validation#validation-timing) · [Validação nativa do HTML](https://angular.dev/guide/forms/signals/validation#native-html-validation) · [`required()`](https://angular.dev/guide/forms/signals/validation#required) · [`min()`/`max()`](https://angular.dev/guide/forms/signals/validation#min-and-max) · [`minLength()`/`maxLength()`](https://angular.dev/guide/forms/signals/validation#minlength-and-maxlength) · [Estrutura dos erros](https://angular.dev/guide/forms/signals/validation#error-structure) · [Mensagens personalizadas](https://angular.dev/guide/forms/signals/validation#custom-error-messages) · [`validate()`](https://angular.dev/guide/forms/signals/validation#using-validate) · [Validadores reutilizáveis](https://angular.dev/guide/forms/signals/validation#reusable-validation-rules) · [Entre campos](https://angular.dev/guide/forms/signals/validation#cross-field-validation) · [`validateTree()`](https://angular.dev/guide/forms/signals/validation#using-validatetree) · [Condicional](https://angular.dev/guide/forms/signals/validation#conditional-validation) · [`validateHttp()`](https://angular.dev/guide/forms/signals/validation#using-validatehttp) · [Standard Schema](https://angular.dev/guide/forms/signals/validation#integration-with-schema-validation-libraries)
12. [Envio de formulários](https://angular.dev/guide/forms/signals/form-submission): diretiva `FormRoot`, função `submit()` e `submitting()`.
    - [O que o `submit()` faz](https://angular.dev/guide/forms/signals/form-submission#what-does-submit-do) · [`FormRoot`](https://angular.dev/guide/forms/signals/form-submission#setting-up-form-submission-with-formroot) · [`submitting()`](https://angular.dev/guide/forms/signals/form-submission#showing-submission-state-with-submitting) · [Envio manual](https://angular.dev/guide/forms/signals/form-submission#manual-submission-with-submit)
13. [Schemas e composição](https://angular.dev/guide/forms/signals/schemas): `schema()`, `apply()`, `applyWhen()` e `applyEach()`.
    - [`schema()`](https://angular.dev/guide/forms/signals/schemas#create-reusable-schemas-with-schema) · [`apply()`](https://angular.dev/guide/forms/signals/schemas#using-the-schema-with-apply) · [`applyWhen()`](https://angular.dev/guide/forms/signals/schemas#conditional-schemas-with-applywhen) · [`applyEach()`](https://angular.dev/guide/forms/signals/schemas#array-items-with-applyeach)
14. [API `FieldState`](https://angular.dev/api/forms/signals/FieldState): referência de todos os signals do estado do campo (ex.: diferença entre `errors()` e `errorSummary()`).
15. [Standard Schema](https://standardschema.dev/): especificação de interfaces comuns entre bibliotecas de validação.
16. [Zod: instalação](https://zod.dev/#installation): site oficial do Zod (veja também [mensagens de erro personalizadas](https://zod.dev/error-customization#the-error-param)).
