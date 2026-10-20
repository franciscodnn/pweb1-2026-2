[main](../../README.md)


# Aula 14 - Rotas no Angular v22

## Objetivos da aula

Ao final desta aula, você deverá ser capaz de:

- explicar por que uma **SPA** precisa de um roteador e quais são as três peças do roteamento no Angular;
- **definir rotas** estáticas, com parâmetros, *wildcard*, títulos, dados e *providers* por rota;
- escolher entre carregamento **eager** e **lazy** (`loadComponent` e `loadChildren`);
- exibir rotas com `<router-outlet />`, inclusive **rotas aninhadas** e **outlets nomeados**;
- navegar com `routerLink`, `Router.navigate()` e `Router.navigateByUrl()`;
- **ler o estado da rota** (parâmetros, *query params*, *matrix params*) com `ActivatedRoute`;
- destacar o link ativo com `routerLinkActive` e com a função `isActive()`;
- configurar **redirecionamentos**, entendendo `pathMatch` e redirecionamentos condicionais;
- proteger rotas com **guards**.

> Os exemplos desta aula seguem o **Angular v22**: componentes são *standalone* por padrão, os arquivos gerados pela CLI não têm sufixo (`home.ts`, classe `Home`) e os serviços usam o decorador `@Service()` (veja a [aula de DI](../12_angular_di/README.md)).

## Índice

1. [Introdução ao roteamento](#1-introdução-ao-roteamento)
2. [Configuração básica](#2-configuração-básica)
3. [Definindo rotas](#3-definindo-rotas)
4. [Estratégias de carregamento](#4-estratégias-de-carregamento)
5. [Exibindo rotas com outlets](#5-exibindo-rotas-com-outlets)
6. [Navegando com `routerLink`](#6-navegando-com-routerlink)
7. [Navegação programática](#7-navegação-programática)
8. [Lendo o estado da rota](#8-lendo-o-estado-da-rota)
9. [Destacando a rota ativa](#9-destacando-a-rota-ativa)
10. [Redirecionamentos](#10-redirecionamentos)
11. [Route guards](#11-route-guards)
12. [Exemplo prático completo](#12-exemplo-prático-completo)
13. [Exercícios](#13-exercícios)

---

## 1. Introdução ao roteamento

Em um site tradicional, cada URL dispara uma requisição ao servidor, que devolve uma **página inteira nova**. Em uma **Single Page Application (SPA)**, o navegador baixa o `index.html` **uma única vez**. A partir daí, um **roteador no lado do cliente** decide qual conteúdo mostrar com base na URL e atualiza a página **sem recarregá-la** [1].

O **Angular Router** (`@angular/router`) é a biblioteca oficial de navegação. Ele faz parte do núcleo do framework e já vem incluído nos projetos criados pela Angular CLI [1].

O roteamento no Angular tem três peças [1]:

| Peça | Papel |
|---|---|
| **Routes** | associam uma URL ao componente que deve ser exibido |
| **Outlets** | marcadores no template onde o componente da rota ativa é renderizado |
| **Links** | permitem navegar entre rotas sem recarregar a página |

Além disso, o Router oferece rotas aninhadas, navegação programática, parâmetros de rota, *query params*, *wildcards*, leitura da rota ativa com `ActivatedRoute`, carregamento de dados com *resources* e *resolvers*, transições de view e *guards* [1].

---

## 2. Configuração básica

### Estrutura do projeto

O Style Guide recomenda organizar o código **por funcionalidade** (*feature*), diretamente dentro de `app/`. No v22, a CLI gera arquivos **sem sufixo** (`home.ts` em vez de `home.component.ts`):

```
src/
  app/
    home/
      home.ts
    about/
      about.ts
    users/
      users.ts
      user-detail.ts
    not-found/
      not-found.ts
    app.ts
    app.routes.ts
    app.config.ts
```

### Registrando o Router

As rotas ficam em um arquivo próprio (a CLI cria `src/app/app.routes.ts`) e são registradas com `provideRouter()` na configuração da aplicação [2]:

```typescript
// src/app/app.routes.ts
import { Routes } from '@angular/router';

export const routes: Routes = [];
```

```typescript
// src/app/app.config.ts
import { ApplicationConfig } from '@angular/core';
import { provideRouter } from '@angular/router';
import { routes } from './app.routes';

export const appConfig: ApplicationConfig = {
  providers: [provideRouter(routes)],
};
```

`provideRouter()` aceita *features* opcionais como segundo argumento, por exemplo:

| Feature | Efeito |
|---|---|
| `withComponentInputBinding()` | entrega parâmetros da rota como `input()` do componente (seção 8) |
| `withViewTransitions()` | anima a troca de páginas com a View Transitions API |
| `withHashLocation()` | usa URLs com `#` (ex.: `/#/users`) |
| `withPreloading(...)` | pré-carrega rotas *lazy* em segundo plano |

---

## 3. Definindo rotas

Uma **rota** é um objeto do tipo `Route` que associa um caminho de URL a um componente, além de outras opções sobre o que acontece na navegação [2].

```typescript
// src/app/app.routes.ts
import { Routes } from '@angular/router';
import { Home } from './home/home';
import { About } from './about/about';
import { NotFound } from './not-found/not-found';

export const routes: Routes = [
  { path: '',      component: Home,  title: 'Início' },
  { path: 'about', component: About, title: 'Sobre' },
  { path: 'users', loadComponent: () => import('./users/users'), title: 'Usuários' },
  { path: '**',    component: NotFound, title: 'Página não encontrada' },
];
```

> **Atenção:** o `path` **não** começa com `/`. Escreva `'about'`, e não `'/about'`.

### Caminhos estáticos

Casam com a URL exatamente como escritos [2]:

```typescript
{ path: 'admin',            component: AdminDashboard }
{ path: 'settings/account', component: AccountSettings }
```

### Caminhos com parâmetros

Um segmento iniciado por `:` captura um valor dinâmico, permitindo que **uma rota atenda várias URLs** [2]:

```typescript
{ path: 'users/:id',             component: UserDetail }        // /users/42
{ path: 'users/:id/:socialMedia', component: SocialMediaFeed }  // /users/42/instagram
```

Nomes de parâmetros começam com letra e podem conter letras, números, `_` e `-` [2]. *Query params* (`?page=2`) **não** fazem parte do `path`; eles são vistos na seção 8.

### Wildcard (404)

O caminho `**` casa com **qualquer URL**. É usado para a página "não encontrada" e deve ser a **última** rota [2]:

```typescript
{ path: '**', component: NotFound }
```

### Como o Angular escolhe a rota

O Router usa a estratégia **first-match wins**: percorre o array na ordem e para na **primeira** rota compatível. Por isso, coloque as rotas **mais específicas primeiro** e o *wildcard* por último [2]:

```typescript
export const routes: Routes = [
  { path: '',          component: Home },       // caminho vazio
  { path: 'users/new', component: NewUser },    // estático mais específico
  { path: 'users/:id', component: UserDetail }, // dinâmico
  { path: 'users',     component: Users },      // estático menos específico
  { path: '**',        component: NotFound },   // sempre por último
];
```

Se `users/:id` viesse antes de `users/new`, a URL `/users/new` cairia em `UserDetail` com `id = 'new'`.

### Títulos de página

A propriedade `title` define o `<title>` do documento quando a rota é ativada. Títulos distintos ajudam usuários de leitores de tela e o histórico do navegador [2]:

```typescript
{ path: 'about', component: About, title: 'Sobre nós' }
```

O título também pode ser calculado por um **resolver** (`ResolveFn<string>`):

```typescript
import { ResolveFn } from '@angular/router';

const productTitle: ResolveFn<string> = (route) => `Produto #${route.paramMap.get('id')}`;

export const routes: Routes = [
  { path: 'products/:id', component: ProductDetail, title: productTitle },
];
```

#### `TitleStrategy`: centralizando os títulos

Para aplicar uma regra a **todos** os títulos (por exemplo, acrescentar o nome do app), estenda `TitleStrategy` e registre a sua classe no lugar da padrão (`DefaultTitleStrategy`) [2]:

```typescript
// src/app/app-title-strategy.ts
import { Injectable, inject } from '@angular/core';
import { Title } from '@angular/platform-browser';
import { RouterStateSnapshot, TitleStrategy } from '@angular/router';

@Injectable()
export class AppTitleStrategy extends TitleStrategy {
  private readonly title = inject(Title);

  override updateTitle(snapshot: RouterStateSnapshot): void {
    const pageTitle = this.buildTitle(snapshot) || 'Início';
    this.title.setTitle(`${pageTitle} | Portfólio`);
  }
}
```

```typescript
// src/app/app.config.ts
providers: [
  provideRouter(routes),
  { provide: TitleStrategy, useClass: AppTitleStrategy },
]
```

> Usamos `@Injectable()` aqui porque a classe é registrada com `useClass`, e não automaticamente na raiz (veja "`@Service` × `@Injectable`" na [aula 12](../12_angular_di/README.md)).

### Providers por rota

O array `providers` de uma rota cria um escopo de injeção visível **apenas para aquela rota e suas filhas** [2]:

```typescript
export const routes: Routes = [
  {
    path: 'admin',
    providers: [AdminService, { provide: ADMIN_API_KEY, useValue: '12345' }],
    children: [
      { path: 'users', component: AdminUsers },
      { path: 'teams', component: AdminTeams },
    ],
  },
  // rotas fora de 'admin' não enxergam AdminService nem ADMIN_API_KEY
];
```

### Dados da rota

**Dados estáticos** ficam em `data` e servem para metadados constantes (permissões, IDs de analytics, *breadcrumbs*). Eles são lidos via `ActivatedRoute` [2]:

```typescript
{
  path: 'admin',
  component: Admin,
  data: { role: 'admin', breadcrumb: 'Administração' },
}
```

**Dados dinâmicos** podem ser buscados com **resolvers** (executados antes da ativação da rota) ou, de forma reativa, com a API de **resources** baseada em signals [2]. Esses tópicos têm guias próprios no angular.dev.

### Rotas aninhadas

Rotas filhas são declaradas em `children`. O componente pai precisa ter o **seu próprio** `<router-outlet />`, onde as filhas serão renderizadas [2] [4]:

```typescript
export const routes: Routes = [
  {
    path: 'product/:id',
    component: Product,
    children: [
      { path: 'info',    component: ProductInfo },    // /product/42/info
      { path: 'reviews', component: ProductReviews }, // /product/42/reviews
    ],
  },
];
```

```typescript
// src/app/product/product.ts
import { Component } from '@angular/core';
import { RouterLink, RouterOutlet } from '@angular/router';

@Component({
  selector: 'app-product',
  imports: [RouterOutlet, RouterLink],
  template: `
    <h1>Produto</h1>
    <nav>
      <a routerLink="info">Informações</a>
      <a routerLink="reviews">Avaliações</a>
    </nav>
    <router-outlet />
  `,
})
export class Product {}
```

Navegar entre `info` e `reviews` troca **apenas** o conteúdo do outlet do `Product`; o cabeçalho e o menu continuam na tela.

---

## 4. Estratégias de carregamento

### Eager: carregamento imediato

Rotas que usam `component` importam a classe diretamente. O código vai para o **mesmo bundle** do arquivo de rotas e fica disponível imediatamente, mas aumenta o tempo de carga inicial [3]:

```typescript
import { Home } from './home/home';
import { Login } from './auth/login';

export const routes: Routes = [
  { path: '',      component: Home },
  { path: 'login', component: Login },
];
```

### Lazy: carregamento sob demanda

Com `loadComponent` e `loadChildren`, o código só é baixado quando necessário. Cada rota *lazy* vira um **arquivo JavaScript separado** (*chunk*) [3]:

- `loadComponent`: carrega o componente quando a rota é **ativada**;
- `loadChildren`: carrega as rotas filhas durante o **matching** da rota.

```typescript
export const routes: Routes = [
  // componente único
  {
    path: 'login',
    loadComponent: () => import('./auth/login').then((m) => m.Login),
  },

  // grupo de rotas
  {
    path: 'admin',
    loadComponent: () => import('./admin/admin').then((m) => m.Admin),
    loadChildren: () => import('./admin/admin.routes').then((m) => m.adminRoutes),
  },
];
```

> **Dica:** se o arquivo usa `export default`, basta retornar o `import()` diretamente, sem o `.then()` [3]:
>
> ```typescript
> // src/app/auth/login.ts
> @Component({ /* ... */ })
> export default class Login {}
>
> // app.routes.ts
> { path: 'login', loadComponent: () => import('./auth/login') }
> ```

### Lazy loading com contexto de injeção

As funções `loadComponent` e `loadChildren` executam **dentro do contexto de injeção** da rota. Assim, elas podem chamar `inject()` para ler serviços globais, providers da própria rota ou de rotas-pai e decidir **o que** carregar [3]:

```typescript
export const routes: Routes = [
  {
    path: 'dashboard',
    loadComponent: () => {
      const flags = inject(FeatureFlags);
      return flags.isPremium()
        ? import('./dashboard/premium-dashboard')
        : import('./dashboard/basic-dashboard');
    },
  },
];
```

### Eager ou lazy?

A recomendação oficial é carregar de forma **eager** a(s) página(s) de entrada e, em geral, deixar as demais **lazy** [3]. Evite, porém, aninhar *lazy loading* em muitos níveis: cada nível pode gerar uma nova requisição e piorar o desempenho [3].

| Estratégia | Bundle inicial | Primeira visita à rota | Indicada para |
|---|---|---|---|
| Eager (`component`) | maior | imediata | página inicial, login |
| Lazy (`loadComponent`/`loadChildren`) | menor | pequena espera pelo *chunk* | áreas secundárias (admin, relatórios, configurações) |

---

## 5. Exibindo rotas com outlets

O `<router-outlet />` marca **onde** o componente da rota ativa será renderizado. O Router insere o componente **logo após** o elemento `<router-outlet>` no DOM [4]:

```typescript
// src/app/app.ts
import { Component } from '@angular/core';
import { RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, RouterLink, RouterLinkActive],
  template: `
    <nav>
      <a routerLink="/" routerLinkActive="active" [routerLinkActiveOptions]="{ exact: true }">Início</a>
      <a routerLink="/about" routerLinkActive="active">Sobre</a>
      <a routerLink="/users" routerLinkActive="active">Usuários</a>
    </nav>

    <main>
      <router-outlet />
    </main>
  `,
})
export class App {}
```

Rotas aninhadas usam um outlet dentro do componente pai, como visto na [seção 3](#rotas-aninhadas).

### Outlets nomeados (rotas secundárias)

Uma página pode ter **vários outlets**. Cada um precisa de um **nome único**, que não pode mudar em tempo de execução; o outlet sem nome se chama `'primary'` [4]:

```html
<main>
  <router-outlet />                 <!-- outlet primário -->
</main>

<aside>
  <router-outlet name="sidebar" />  <!-- outlet secundário -->
</aside>
```

A rota indica em qual outlet deve aparecer com a propriedade `outlet` [4]:

```typescript
export const routes: Routes = [
  { path: '',        component: Home },
  { path: 'help',    component: HelpPanel, outlet: 'sidebar' },
  { path: 'filters', component: Filters,   outlet: 'sidebar' },
];
```

A URL combina os outlets com parênteses, por exemplo `/(sidebar:help)` ou `/users(sidebar:filters)`. Para abrir ou fechar um outlet nomeado:

```html
<a [routerLink]="[{ outlets: { sidebar: 'help' } }]">Abrir ajuda</a>
<a [routerLink]="[{ outlets: { sidebar: null } }]">Fechar</a>
```

```typescript
this.router.navigate([{ outlets: { sidebar: 'help' } }]);
this.router.navigate([{ outlets: { sidebar: null } }]); // fecha o outlet
```

> **Quando usar:** painéis laterais, chat, filtros avançados ou qualquer área que precise de navegação independente do conteúdo principal.

### Eventos do ciclo de vida do outlet

O `<router-outlet>` emite quatro eventos [4]:

| Evento | Quando ocorre |
|---|---|
| `activate` | um novo componente é criado no outlet |
| `deactivate` | o componente é destruído |
| `attach` | a `RouteReuseStrategy` reanexa uma subárvore guardada |
| `detach` | a `RouteReuseStrategy` desanexa uma subárvore para guardá-la |

```html
<router-outlet (activate)="onActivate($event)" (deactivate)="onDeactivate($event)" />
```

### Passando dados contextuais com `routerOutletData`

Um componente pai pode enviar dados ao componente roteado **sem alterar a definição das rotas**, usando o input `routerOutletData`. O componente roteado lê o valor como um **signal** injetando o token `ROUTER_OUTLET_DATA`; se o input não for definido, o valor é `undefined` [4]:

```typescript
// src/app/dashboard/dashboard.ts
import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';

@Component({
  selector: 'app-dashboard',
  imports: [RouterOutlet],
  template: `<router-outlet [routerOutletData]="{ layout: 'sidebar' }" />`,
})
export class Dashboard {}
```

```typescript
// src/app/dashboard/stats.ts
import { Component, Signal, inject } from '@angular/core';
import { ROUTER_OUTLET_DATA } from '@angular/router';

@Component({
  selector: 'app-stats',
  template: `<p>Layout: {{ outletData().layout }}</p>`,
})
export class Stats {
  outletData = inject(ROUTER_OUTLET_DATA) as Signal<{ layout: string }>;
}
```

---

## 6. Navegando com `routerLink`

A diretiva `RouterLink` substitui o `href` em elementos `<a>`, navegando **sem recarregar a página**. Lembre-se de importá-la no componente [5]:

```typescript
import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-menu',
  imports: [RouterLink],
  template: `
    <nav>
      <a routerLink="/user-profile">Perfil</a>
      <a routerLink="/settings">Configurações</a>
    </nav>
  `,
})
export class Menu {}
```

### Links absolutos e relativos

- Com `/` no início, o caminho é **absoluto** (a partir da raiz);
- sem `/`, o caminho é **relativo** à rota atual.

Links relativos costumam ser preferidos, pois o componente não precisa saber sua posição na hierarquia de rotas [5]:

```html
<!-- usuário está em /settings -->
<a routerLink="notifications">Notificações</a>             <!-- /settings/notifications -->
<a routerLink="/settings/notifications">Notificações</a>   <!-- /settings/notifications -->

<!-- array: útil para valores dinâmicos -->
<a [routerLink]="['/team', teamId, 'user', userId]">Usuário atual</a>  <!-- /team/123/user/456 -->

<!-- query params e fragmento -->
<a [routerLink]="['/products']" [queryParams]="{ category: 'eletronicos', page: 1 }" fragment="topo">
  Eletrônicos
</a>
```

### Exibindo outra URL na barra de endereços

O input `browserUrl` faz a barra de endereços mostrar uma URL diferente da rota realmente renderizada [5]:

```html
<!-- navega para /dashboard, mas a barra mostra /home -->
<a [routerLink]="['/dashboard']" [browserUrl]="'/home'">Ir para o painel</a>
```

---

## 7. Navegação programática

Para navegar a partir do TypeScript (após salvar um formulário, receber uma resposta HTTP etc.), injete o serviço `Router` [5].

### `router.navigate()`

Recebe um **array de comandos** (segmentos) e um objeto de opções [5]:

```typescript
import { Component, inject } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-example',
  template: `
    <button (click)="irParaPerfil()">Perfil</button>
    <button (click)="verUsuario(123)">Usuário 123</button>
    <button (click)="buscarLivros()">Livros</button>
  `,
})
export class Example {
  private router = inject(Router);

  irParaPerfil() {
    this.router.navigate(['/profile']);
  }

  verUsuario(id: number) {
    this.router.navigate(['/users', id]); // /users/123
  }

  buscarLivros() {
    this.router.navigate(['/search'], {
      queryParams: { category: 'books', sort: 'price' }, // /search?category=books&sort=price
    });
  }

  verDestaques() {
    // matrix params: /products;featured=true;onSale=true
    this.router.navigate(['/products', { featured: true, onSale: true }]);
  }
}
```

#### Navegação relativa com `relativeTo`

Passe o `ActivatedRoute` do componente em `relativeTo` para navegar a partir da rota atual [5]:

```typescript
import { ActivatedRoute, Router } from '@angular/router';

export class UserDetail {
  private route = inject(ActivatedRoute);
  private router = inject(Router);

  // estando em /users/123
  editar()  { this.router.navigate(['edit'], { relativeTo: this.route }); }        // /users/123/edit
  voltar()  { this.router.navigate(['..'], { relativeTo: this.route }); }          // /users
  listar()  { this.router.navigate(['..', 'list'], { relativeTo: this.route }); }  // /users/list
}
```

Duas regras importantes [5]:

- para subir **vários** níveis, coloque todos os `..` no **primeiro** elemento: `['../../settings']`, e não `['..', '..', 'settings']`;
- **não** comece o primeiro comando com `/` ao usar `relativeTo`: a barra torna a navegação absoluta e o `relativeTo` é ignorado.

### `router.navigateByUrl()`

Recebe uma **URL completa em string** e sempre navega de forma **absoluta**. É útil para URLs vindas de fora (por exemplo, um `returnUrl`) e *deep links* [5]:

```typescript
this.router.navigateByUrl('/products/123?view=details#reviews');
this.router.navigateByUrl('/search?category=books&sortBy=price');

// substitui a entrada atual do histórico (o "voltar" não retorna para a página anterior)
this.router.navigateByUrl('/checkout', { replaceUrl: true });

// renderiza /not-found, mas mantém /products/missing-item na barra de endereços
this.router.navigateByUrl('/not-found', { browserUrl: '/products/missing-item' });
```

| Método | Entrada | Relativa? | Uso típico |
|---|---|---|---|
| `navigate()` | array de comandos + opções | sim, com `relativeTo` | navegação montada a partir de variáveis |
| `navigateByUrl()` | string com a URL completa | não | URLs prontas, *deep links*, `returnUrl` |

Ambos retornam uma `Promise<boolean>` que indica se a navegação foi concluída.

---

## 8. Lendo o estado da rota

O serviço `ActivatedRoute` fornece informações sobre a rota **associada ao componente** [6]:

| Propriedade | Descrição |
|---|---|
| `url` | `Observable` dos segmentos do caminho (`UrlSegment[]`) |
| `params` | `Observable` dos parâmetros de rota (`:id`) e *matrix params* |
| `queryParams` | `Observable` dos *query params* (`?page=2`) |
| `data` | `Observable` do objeto `data` da rota (incluindo valores de *resolvers*) |
| `snapshot` | estado da rota **naquele instante** (`paramMap`, `params`, `queryParams`, `url`) |
| `resources` | registro opcional de `Resource`s da rota (quando `withRouterResources` está habilitado) |

### Snapshot × Observable

O `snapshot` é uma "foto" do estado da rota: é **estático** e **não** acompanha mudanças posteriores [6].

```typescript
const id = this.route.snapshot.paramMap.get('id');
```

Isso é um problema quando o **mesmo componente é reutilizado**. Ao navegar de `/users/1` para `/users/2`, o Angular mantém a instância de `UserDetail` e só troca o parâmetro; um `snapshot` lido no construtor continuaria com `1`. Nesses casos, **assine o Observable** (ou use *input binding*, a seguir).

### Parâmetros de rota

Para a rota `{ path: 'product/:id', component: ProductDetail }` [6]:

```typescript
// src/app/products/product-detail.ts
import { Component, inject, signal } from '@angular/core';
import { ActivatedRoute } from '@angular/router';

@Component({
  selector: 'app-product-detail',
  template: `<h1>Produto: {{ productId() }}</h1>`,
})
export class ProductDetail {
  productId = signal('');
  private route = inject(ActivatedRoute);

  constructor() {
    this.route.params.subscribe((params) => {
      this.productId.set(params['id']); // atualiza a cada mudança de :id
    });
  }
}
```

#### Alternativa: parâmetros como `input()`

Com `withComponentInputBinding()`, o Router entrega parâmetros de rota, *query params*, *matrix params* e `data` diretamente nos **inputs** do componente, desde que o nome coincida [6]:

```typescript
// app.config.ts
provideRouter(routes, withComponentInputBinding())
```

```typescript
// src/app/products/product-detail.ts
import { Component, input } from '@angular/core';

@Component({
  selector: 'app-product-detail',
  template: `<h1>Produto: {{ id() }}</h1>`,
})
export class ProductDetail {
  id = input.required<string>(); // recebe o :id da rota product/:id
}
```

Como `input()` é um signal, o valor se atualiza sozinho quando o parâmetro muda, sem `subscribe`.

### Query parameters

*Query params* aparecem depois de `?`, são **opcionais** e **não** participam do *matching* da rota. São ideais para filtros, ordenação e paginação [6]:

```typescript
// src/app/products/products.ts
import { Component, inject, signal } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';

@Component({
  selector: 'app-products',
  template: `
    <h1>Produtos</h1>

    <select (change)="mudarOrdenacao($event)">
      <option value="name">Nome</option>
      <option value="price">Preço</option>
    </select>

    <p>Ordenação: {{ sort() }} · Página: {{ page() }}</p>
  `,
})
export class Products {
  sort = signal('name');
  page = signal(1);

  private route = inject(ActivatedRoute);
  private router = inject(Router);

  constructor() {
    this.route.queryParams.subscribe((params) => {
      this.sort.set(params['sort'] ?? 'name');
      this.page.set(Number(params['page']) || 1);
    });
  }

  mudarOrdenacao(event: Event) {
    const sort = (event.target as HTMLSelectElement).value;
    this.router.navigate([], {
      relativeTo: this.route,
      queryParams: { sort },
      queryParamsHandling: 'merge', // preserva os demais query params (ex.: page)
    });
  }
}
```

| `queryParamsHandling` | Comportamento |
|---|---|
| `'merge'` | mescla os novos params com os atuais |
| `'preserve'` | mantém os params atuais e ignora os novos |
| `'replace'` ou omitido (padrão) | substitui todos os params pelos novos |

### Matrix parameters

*Matrix params* pertencem a **um segmento** do caminho e são separados por `;`, como em `/awesome-products;view=grid`. São definidos passando um objeto no array de comandos e lidos em `route.params` [6]:

```typescript
this.router.navigate(['/awesome-products', { view: 'grid' }]); // /awesome-products;view=grid
```

```typescript
this.route.params.subscribe((params) => {
  this.view.set(params['view']); // 'grid'
});
```

Diferente dos *query params*, que valem para a URL inteira, cada segmento pode ter seus próprios *matrix params*.

---

## 9. Destacando a rota ativa

### `routerLinkActive`

Adiciona uma ou mais classes CSS ao elemento quando o link aponta para a rota ativa. As classes podem ser uma string separada por espaços ou um array [6]:

```html
<nav>
  <a routerLink="/" routerLinkActive="active" [routerLinkActiveOptions]="{ exact: true }"
     ariaCurrentWhenActive="page">Início</a>
  <a routerLink="/about" routerLinkActive="active font-bold" ariaCurrentWhenActive="page">Sobre</a>
  <a routerLink="/users" [routerLinkActive]="['active', 'font-bold']" ariaCurrentWhenActive="page">Usuários</a>
</nav>
```

```css
.active {
  color: #007bff;
  border-bottom: 2px solid #007bff;
}
```

- **Acessibilidade:** a classe é só visual. Use `ariaCurrentWhenActive="page"` para que o atributo `aria-current` informe a página atual às tecnologias assistivas [6].
- **Ancestrais:** por padrão, uma rota-pai também conta como ativa. Em `/users/42`, o link para `/users` fica ativo; e o link para `/` ficaria ativo **em todas** as páginas [6].
- **`{ exact: true }`:** restringe a ativação à rota exata. É um atalho para `IsActiveMatchOptions` com `paths: 'exact'`, `queryParams: 'exact'`, `fragment: 'ignored'` e `matrixParams: 'ignored'` [6].

A diretiva também pode ficar em um **elemento ancestral**, e passa a refletir os `routerLink`s dentro dele [6]:

```html
<li routerLinkActive="open">
  <a routerLink="/settings/profile">Perfil</a>
  <a routerLink="/settings/security">Segurança</a>
</li>
```

### `isActive()`: verificando por código

A função `isActive()` retorna um **signal computado** que indica se uma URL está ativa e se atualiza conforme o Router muda de estado [6]:

```typescript
import { Component, inject } from '@angular/core';
import { Router, isActive } from '@angular/router';

@Component({
  selector: 'app-header',
  template: `
    @if (isSettingsActive()) {
      <p>Você está na área de configurações.</p>
    }
  `,
})
export class Header {
  private router = inject(Router);

  isSettingsActive = isActive('/settings', this.router, {
    paths: 'subset',       // /settings e suas filhas
    queryParams: 'ignored',
    fragment: 'ignored',
    matrixParams: 'ignored',
  });
}
```

---

## 10. Redirecionamentos

A propriedade `redirectTo` leva o usuário automaticamente de uma rota para outra. É útil para URLs antigas, rota padrão e controle de acesso [7]:

```typescript
export const routes: Routes = [
  // simples: /marketing → /newsletter
  { path: 'marketing', redirectTo: 'newsletter' },

  // com parâmetros: /legacy-user/42 → /users/42
  { path: 'legacy-user/:id', redirectTo: 'users/:id' },

  // wildcard: qualquer URL desconhecida → /login
  { path: '**', redirectTo: '/login' },
];
```

### `pathMatch`

`pathMatch` controla como a URL é comparada com o `path` [7]:

| Valor | Descrição |
|---|---|
| `'prefix'` (padrão) | basta o **início** da URL casar |
| `'full'` | a URL **inteira** precisa casar |

Com `'prefix'`, os segmentos seguintes são levados junto no redirecionamento [7]:

```typescript
{ path: 'news', redirectTo: 'blog' }  // o mesmo que pathMatch: 'prefix'
// /news             → /blog
// /news/article     → /blog/article
// /news/article/:id → /blog/article/:id
```

Com `'full'`, só a URL exata é redirecionada [7]:

```typescript
{ path: 'news', redirectTo: '/blog', pathMatch: 'full' }
// /news           → /blog
// /news/articles  → não redireciona
```

> **Atenção:** todo redirecionamento do caminho vazio `''` deve usar `pathMatch: 'full'`. Como toda URL "começa" com `''`, sem ele **todas** as URLs seriam redirecionadas [7].

```typescript
{ path: '', redirectTo: '/dashboard', pathMatch: 'full' }
```

### Redirecionamentos condicionais

`redirectTo` também aceita uma **função**. Ela recebe parte do `ActivatedRouteSnapshot` (como `params` e `queryParams`) e retorna uma string ou um `UrlTree`; também pode retornar um `Observable` ou uma `Promise`. Valores que só existem depois do *matching*, como títulos resolvidos e componentes *lazy*, **não** estão disponíveis [7]:

```typescript
export const routes: Routes = [
  {
    path: 'restaurant/:location/menu',
    redirectTo: (route) => {
      const location = route.params['location'];

      // o usuário pediu uma refeição específica? (?meal=lunch)
      const meal = route.queryParams['meal'];
      if (meal) {
        return `/restaurant/${location}/menu/${meal}`;
      }

      // senão, escolhe pelo horário
      const hour = new Date().getHours();
      if (hour >= 5 && hour < 11) return `/restaurant/${location}/menu/breakfast`;
      if (hour >= 11 && hour < 17) return `/restaurant/${location}/menu/lunch`;
      return `/restaurant/${location}/menu/dinner`;
    },
  },

  { path: 'restaurant/:location/menu/breakfast', component: Menu },
  { path: 'restaurant/:location/menu/lunch',     component: Menu },
  { path: 'restaurant/:location/menu/dinner',    component: Menu },

  { path: '', redirectTo: '/restaurant/downtown/menu', pathMatch: 'full' },
];
```

Como a função roda em contexto de injeção, ela pode chamar `inject()` (por exemplo, `inject(Router).createUrlTree([...])` para devolver um `UrlTree`).

---

## 11. Route guards

*Guards* são funções que **controlam o acesso** às rotas: decidem se o usuário pode entrar, sair ou mesmo se a rota deve ser considerada no *matching*.

> **⚠️ Atenção:** *guards* rodam no navegador e podem ser burlados. Nunca os use como única camada de segurança; valide as permissões também no servidor.

| Guard | Quando é executado |
|---|---|
| `canActivate` | antes de entrar na rota |
| `canActivateChild` | antes de entrar em qualquer rota filha |
| `canDeactivate` | antes de sair da rota |
| `canMatch` | durante o *matching*; se falhar, o Router tenta a próxima rota |

Um *guard* pode retornar `true`/`false`, um `UrlTree` (para redirecionar) ou um `Observable`/`Promise` desses valores.

```bash
ng generate guard guards/auth
```

### `canActivate`: autenticação

```typescript
// src/app/guards/auth.guard.ts
import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../services/auth.service';

export const authGuard: CanActivateFn = (route, state) => {
  const auth = inject(AuthService);
  const router = inject(Router);

  if (auth.isAuthenticated()) {
    return true;
  }

  // redireciona para o login guardando a URL de destino
  return router.createUrlTree(['/login'], { queryParams: { returnUrl: state.url } });
};
```

```typescript
{ path: 'admin', component: Admin, canActivate: [authGuard] }
```

Depois do login, basta `this.router.navigateByUrl(returnUrl)` para voltar à página pedida.

### `canActivateChild`: rotas filhas

Executa para **todas** as filhas (inclusive netas) da rota:

```typescript
export const adminChildGuard: CanActivateChildFn = () => inject(AuthService).hasRole('admin');

{
  path: 'admin',
  component: Admin,
  canActivateChild: [adminChildGuard],
  children: [
    { path: 'users', component: AdminUsers },
    { path: 'teams', component: AdminTeams },
  ],
}
```

### `canDeactivate`: alterações não salvas

```typescript
// src/app/guards/unsaved-changes.guard.ts
import { CanDeactivateFn } from '@angular/router';
import { EditForm } from '../edit-form/edit-form';

export const unsavedChangesGuard: CanDeactivateFn<EditForm> = (component) => {
  if (component.hasUnsavedChanges()) {
    return confirm('Há alterações não salvas. Deseja sair mesmo assim?');
  }
  return true;
};
```

```typescript
{ path: 'edit/:id', component: EditForm, canDeactivate: [unsavedChangesGuard] }
```

### `canMatch`: feature flags

Quando `canMatch` retorna `false`, a navegação **não** é bloqueada: o Router simplesmente **pula** essa rota e tenta a próxima com o mesmo caminho:

```typescript
export const premiumGuard: CanMatchFn = () => inject(UserService).isPremium();

export const routes: Routes = [
  {
    path: 'dashboard',
    canMatch: [premiumGuard],
    loadComponent: () => import('./dashboard/premium-dashboard'),
  },
  {
    path: 'dashboard', // usuários sem premium caem aqui
    loadComponent: () => import('./dashboard/basic-dashboard'),
  },
];
```

---

## 12. Exemplo prático completo

Um app com página inicial, lista de usuários, detalhe por ID e área administrativa protegida.

### Estrutura

```
src/app/
├── home/
│   └── home.ts
├── about/
│   └── about.ts
├── users/
│   ├── user.ts            (modelo + dados)
│   ├── users.ts
│   └── user-detail.ts
├── not-found/
│   └── not-found.ts
├── guards/
│   └── auth.guard.ts
├── app.ts
├── app.routes.ts
└── app.config.ts
```

### app.config.ts

```typescript
import { ApplicationConfig } from '@angular/core';
import { provideRouter, withComponentInputBinding, withViewTransitions } from '@angular/router';
import { routes } from './app.routes';

export const appConfig: ApplicationConfig = {
  providers: [
    provideRouter(
      routes,
      withComponentInputBinding(), // parâmetros de rota como input()
      withViewTransitions(),       // animação nativa na troca de páginas
    ),
  ],
};
```

### app.routes.ts

```typescript
import { Routes } from '@angular/router';
import { Home } from './home/home';
import { NotFound } from './not-found/not-found';
import { authGuard } from './guards/auth.guard';

export const routes: Routes = [
  { path: '', component: Home, title: 'Início' }, // eager: página de entrada
  {
    path: 'about',
    loadComponent: () => import('./about/about').then((m) => m.About),
    title: 'Sobre',
  },
  {
    path: 'users',
    loadComponent: () => import('./users/users').then((m) => m.Users),
    title: 'Usuários',
  },
  {
    path: 'users/:id',
    loadComponent: () => import('./users/user-detail').then((m) => m.UserDetail),
    title: 'Detalhes do usuário',
  },
  { path: 'usuarios', redirectTo: 'users' }, // URL antiga
  {
    path: 'admin',
    canActivate: [authGuard],
    loadComponent: () => import('./admin/admin').then((m) => m.Admin),
    loadChildren: () => import('./admin/admin.routes').then((m) => m.adminRoutes),
    title: 'Administração',
  },
  { path: '**', component: NotFound, title: 'Página não encontrada' },
];
```

### app.ts

```typescript
import { Component } from '@angular/core';
import { RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, RouterLink, RouterLinkActive],
  template: `
    <nav class="navbar">
      <h2>Meu app Angular v22</h2>
      <ul class="nav-links">
        <li>
          <a routerLink="/" routerLinkActive="active" [routerLinkActiveOptions]="{ exact: true }"
             ariaCurrentWhenActive="page">Início</a>
        </li>
        <li><a routerLink="/about" routerLinkActive="active" ariaCurrentWhenActive="page">Sobre</a></li>
        <li><a routerLink="/users" routerLinkActive="active" ariaCurrentWhenActive="page">Usuários</a></li>
        <li><a routerLink="/admin" routerLinkActive="active" ariaCurrentWhenActive="page">Admin</a></li>
      </ul>
    </nav>

    <main class="main-content">
      <router-outlet />
    </main>
  `,
  styles: `
    .navbar {
      background: #1a1a2e;
      color: white;
      padding: 1rem 2rem;
      display: flex;
      justify-content: space-between;
      align-items: center;
    }
    .nav-links { display: flex; list-style: none; margin: 0; padding: 0; gap: 1.5rem; }
    .nav-links a { color: #ccc; text-decoration: none; padding: 0.5rem 1rem; border-radius: 4px; }
    .nav-links a:hover  { background: #333; color: white; }
    .nav-links a.active { background: #007bff; color: white; }
    .main-content { padding: 2rem; max-width: 1200px; margin: 0 auto; }
  `,
})
export class App {}
```

### home.ts

```typescript
import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-home',
  imports: [RouterLink],
  template: `
    <h1>Bem-vindo ao Angular v22!</h1>
    <p>Exemplo de roteamento com componentes standalone.</p>

    <div class="actions">
      <a routerLink="/about" class="btn">Sobre nós</a>
      <a routerLink="/users" class="btn">Ver usuários</a>
    </div>
  `,
  styles: `
    .actions { margin-top: 1.5rem; display: flex; gap: 1rem; }
    .btn { padding: 0.6rem 1.2rem; background: #007bff; color: white; text-decoration: none; border-radius: 4px; }
  `,
})
export class Home {}
```

### users/user.ts

```typescript
export interface User {
  id: number;
  name: string;
  email: string;
  bio: string;
}

export const USERS: User[] = [
  { id: 1, name: 'João Silva',     email: 'joao@email.com',  bio: 'Desenvolvedor frontend' },
  { id: 2, name: 'Maria Santos',   email: 'maria@email.com', bio: 'Designer UX/UI' },
  { id: 3, name: 'Pedro Oliveira', email: 'pedro@email.com', bio: 'Desenvolvedor backend' },
];
```

> Em um app real, esses dados viriam de um serviço `@Service()` que usa o `HttpClient` (veja a [aula 13](../13_angular_http_client/README.md)).

### users/users.ts

```typescript
import { Component, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { USERS } from './user';

@Component({
  selector: 'app-users',
  imports: [RouterLink],
  template: `
    <h1>Usuários</h1>

    <div class="users-grid">
      @for (user of users(); track user.id) {
        <div class="user-card">
          <h3>{{ user.name }}</h3>
          <p>{{ user.email }}</p>
          <!-- relativo: estando em /users, leva a /users/:id -->
          <a [routerLink]="[user.id]" class="btn">Ver detalhes</a>
        </div>
      }
    </div>
  `,
  styles: `
    .users-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(280px, 1fr)); gap: 1.5rem; }
    .user-card { border: 1px solid #ddd; padding: 1.5rem; border-radius: 8px; }
    .btn { display: inline-block; padding: 0.5rem 1rem; background: #007bff; color: white; text-decoration: none; border-radius: 4px; }
  `,
})
export class Users {
  users = signal(USERS);
}
```

### users/user-detail.ts

Graças a `withComponentInputBinding()`, o `:id` chega como `input()`, e o usuário é derivado com `computed()`. Ao navegar de `/users/1` para `/users/2`, tudo se atualiza sozinho:

```typescript
import { Component, computed, inject, input } from '@angular/core';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { USERS } from './user';

@Component({
  selector: 'app-user-detail',
  imports: [RouterLink],
  template: `
    @if (user(); as u) {
      <h1>{{ u.name }}</h1>
      <p><strong>Email:</strong> {{ u.email }}</p>
      <p><strong>Bio:</strong> {{ u.bio }}</p>

      <div class="actions">
        <button (click)="voltar()">Voltar</button>
        <button (click)="editar()" class="btn-primary">Editar</button>
        @if (u.id < 3) {
          <a [routerLink]="['..', u.id + 1]">Próximo</a>
        }
      </div>
    } @else {
      <p>Usuário não encontrado.</p>
    }
  `,
  styles: `
    .actions { margin-top: 1.5rem; display: flex; gap: 1rem; }
    button { padding: 0.5rem 1rem; border: 1px solid #ccc; border-radius: 4px; cursor: pointer; }
    .btn-primary { background: #007bff; color: white; border-color: #007bff; }
  `,
})
export class UserDetail {
  id = input.required<string>(); // vem de users/:id

  user = computed(() => USERS.find((u) => u.id === Number(this.id())));

  private route = inject(ActivatedRoute);
  private router = inject(Router);

  voltar() {
    this.router.navigate(['..'], { relativeTo: this.route }); // /users
  }

  editar() {
    this.router.navigate(['edit'], { relativeTo: this.route }); // /users/:id/edit
  }
}
```

---

## 13. Exercícios

1. Crie as rotas `/`, `/sobre` e `/contato`, com títulos, e um menu que destaque o link ativo com `routerLinkActive` e `ariaCurrentWhenActive`.
2. Adicione uma página 404 com `**`. Teste o que acontece se o *wildcard* não for a última rota.
3. Transforme `/sobre` e `/contato` em rotas *lazy* usando `export default`. Rode `ng build` e observe os *chunks* gerados.
4. Crie `/produtos/:id` e leia o `id` de duas formas: com `route.params.subscribe` e com `input()` + `withComponentInputBinding()`. Navegue de `/produtos/1` para `/produtos/2` e compare com uma versão que usa `snapshot`.
5. Na lista de produtos, implemente ordenação e paginação com *query params*, usando `queryParamsHandling: 'merge'`.
6. Redirecione `/produto/:id` (URL antiga) para `/produtos/:id` e `''` para `/inicio`. Explique por que o segundo precisa de `pathMatch: 'full'`.
7. Crie um `AppTitleStrategy` que acrescente " | Minha Loja" a todos os títulos.
8. Proteja `/admin` com um `canActivate` que redirecione para `/login?returnUrl=...` e, após o login, volte à página pedida com `navigateByUrl`.

---

## Resumo

- **Configuração:** registre as rotas com `provideRouter(routes)` no `app.config.ts`;
- **Rotas:** `path` (sem `/` inicial), `component`, `title`, `data`, `providers`, `children`; a ordem importa (**first-match wins**, `**` por último);
- **Títulos:** `title` fixo, `ResolveFn` ou um `TitleStrategy` customizado;
- **Eager × lazy:** `component` para a página de entrada; `loadComponent`/`loadChildren` (que podem usar `inject()`) para o resto;
- **Outlets:** `<router-outlet />`, outlets nomeados com `outlet`, eventos `activate`/`deactivate`/`attach`/`detach` e `routerOutletData` + `ROUTER_OUTLET_DATA`;
- **Navegação:** `routerLink` (absoluto com `/`, relativo sem); `navigate()` com `relativeTo`; `navigateByUrl()` com `replaceUrl` e `browserUrl`;
- **Estado da rota:** `ActivatedRoute` (`params`, `queryParams`, `data`, `snapshot`) ou `input()` com `withComponentInputBinding()`; *matrix params* com `;`;
- **Rota ativa:** `routerLinkActive` (+ `ariaCurrentWhenActive`, `{ exact: true }`) ou o signal `isActive()`;
- **Redirecionamentos:** `redirectTo` com string, parâmetros ou função; `pathMatch: 'full'` no caminho vazio;
- **Guards:** `canActivate`, `canActivateChild`, `canDeactivate`, `canMatch`, sempre com validação também no servidor.

### Comandos úteis da CLI

```bash
# criar um app (o roteamento já vem configurado)
ng new meu-app

# gerar componente (gera users/user-detail.ts, classe UserDetail)
ng generate component users/user-detail

# gerar guard
ng generate guard guards/auth

# gerar resolver
ng generate resolver resolvers/user-data
```

## Referências

As páginas do angular.dev foram consultadas em outubro de 2026 e descrevem o **Angular v22**.

1. [Roteamento no Angular (visão geral)](https://angular.dev/guide/routing): por que uma SPA precisa de roteador e as três peças do roteamento (rotas, outlets e links).
   - [Por que roteamento em uma SPA](https://angular.dev/guide/routing#why-is-routing-necessary-in-a-spa) · [Como o Angular gerencia rotas](https://angular.dev/guide/routing#how-angular-manages-routing)
2. [Definindo rotas](https://angular.dev/guide/routing/define-routes): `provideRouter`, caminhos estáticos e com parâmetros, *wildcards*, ordem de *matching*, títulos, `TitleStrategy`, providers, dados e rotas aninhadas.
   - [Adicionando o router](https://angular.dev/guide/routing/define-routes#adding-the-router-to-your-application) · [Caminhos de URL](https://angular.dev/guide/routing/define-routes#route-url-paths) · [Parâmetros](https://angular.dev/guide/routing/define-routes#define-url-paths-with-route-parameters) · [Wildcards](https://angular.dev/guide/routing/define-routes#wildcards) · [Como o Angular casa URLs](https://angular.dev/guide/routing/define-routes#how-angular-matches-urls) · [Títulos](https://angular.dev/guide/routing/define-routes#page-titles) · [`TitleStrategy`](https://angular.dev/guide/routing/define-routes#using-titlestrategy-for-page-titles) · [Providers por rota](https://angular.dev/guide/routing/define-routes#route-level-providers-for-dependency-injection) · [Dados da rota](https://angular.dev/guide/routing/define-routes#associating-data-with-routes) · [Rotas aninhadas](https://angular.dev/guide/routing/define-routes#nested-routes)
3. [Estratégias de carregamento de rotas](https://angular.dev/guide/routing/loading-strategies): carregamento eager e lazy, `loadComponent`, `loadChildren` e contexto de injeção nos *loaders*.
   - [Componentes eager](https://angular.dev/guide/routing/loading-strategies#eagerly-loaded-components) · [Componentes e rotas lazy](https://angular.dev/guide/routing/loading-strategies#lazily-loaded-components-and-routes) · [Lazy loading com contexto de injeção](https://angular.dev/guide/routing/loading-strategies#injection-context-lazy-loading) · [Eager ou lazy?](https://angular.dev/guide/routing/loading-strategies#should-i-use-an-eager-or-a-lazy-route)
4. [Exibindo rotas com outlets](https://angular.dev/guide/routing/show-routes-with-outlets): `<router-outlet>`, rotas filhas, outlets nomeados, eventos do ciclo de vida e `routerOutletData`.
   - [Rotas filhas](https://angular.dev/guide/routing/show-routes-with-outlets#nesting-routes-with-child-routes) · [Outlets nomeados](https://angular.dev/guide/routing/show-routes-with-outlets#secondary-routes-with-named-outlets) · [Eventos do outlet](https://angular.dev/guide/routing/show-routes-with-outlets#outlet-lifecycle-events) · [Dados contextuais](https://angular.dev/guide/routing/show-routes-with-outlets#passing-contextual-data-to-routed-components)
5. [Navegando para rotas](https://angular.dev/guide/routing/navigate-to-routes): `RouterLink`, links absolutos e relativos, `navigate()`, `relativeTo`, `navigateByUrl()` e `browserUrl`.
   - [`RouterLink`](https://angular.dev/guide/routing/navigate-to-routes#how-to-use-routerlink) · [Links absolutos e relativos](https://angular.dev/guide/routing/navigate-to-routes#using-absolute-or-relative-links) · [`router.navigate()`](https://angular.dev/guide/routing/navigate-to-routes#routernavigate) · [`router.navigateByUrl()`](https://angular.dev/guide/routing/navigate-to-routes#routernavigatebyurl) · [Outra URL na barra de endereços](https://angular.dev/guide/routing/navigate-to-routes#display-a-different-url-in-the-address-bar)
6. [Lendo o estado da rota](https://angular.dev/guide/routing/read-route-state): `ActivatedRoute`, *snapshots*, parâmetros de rota, *query* e *matrix params*, `RouterLinkActive` e `isActive()`.
   - [`ActivatedRoute`](https://angular.dev/guide/routing/read-route-state#get-information-about-the-current-route-with-activatedroute) · [Snapshots](https://angular.dev/guide/routing/read-route-state#understanding-route-snapshots) · [Parâmetros de rota](https://angular.dev/guide/routing/read-route-state#route-parameters) · [Query params](https://angular.dev/guide/routing/read-route-state#query-parameters) · [Matrix params](https://angular.dev/guide/routing/read-route-state#matrix-parameters) · [`RouterLinkActive`](https://angular.dev/guide/routing/read-route-state#detect-active-current-route-with-routerlinkactive) · [Correspondência exata](https://angular.dev/guide/routing/read-route-state#only-apply-routerlinkactive-on-exact-route-matches) · [`isActive()`](https://angular.dev/guide/routing/read-route-state#check-if-a-url-is-active)
7. [Redirecionando rotas](https://angular.dev/guide/routing/redirecting-routes): `redirectTo`, `pathMatch` (`prefix` e `full`) e redirecionamentos condicionais com funções.
   - [Configurando redirecionamentos](https://angular.dev/guide/routing/redirecting-routes#how-to-configure-redirects) · [`pathMatch`](https://angular.dev/guide/routing/redirecting-routes#understanding-pathmatch) · [Redirecionamentos condicionais](https://angular.dev/guide/routing/redirecting-routes#conditional-redirects)
