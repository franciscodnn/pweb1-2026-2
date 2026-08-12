
# Aula 13 - Rotas no Angular (v20)

## Índice
1. [Introdução ao Roteamento](#introdução-ao-roteamento)
2. [Configuração Básica](#configuração-básica)
3. [Definindo Rotas](#definindo-rotas)
4. [Estratégias de Carregamento](#estratégias-de-carregamento)
5. [Router Outlet](#router-outlet)
6. [Navegação com RouterLink](#navegação-com-routerlink)
7. [Navegação Programática](#navegação-programática)
8. [Lendo o Estado da Rota](#lendo-o-estado-da-rota)
9. [Query Parameters](#query-parameters)
10. [Rotas Aninhadas](#rotas-aninhadas)
11. [Redirecionamentos](#redirecionamentos)
12. [Route Guards](#route-guards)
13. [Exemplo Prático Completo](#exemplo-prático-completo)

---

## 1. Introdução ao Roteamento

O roteamento no Angular permite mudar o que o usuário vê em uma **Single Page Application (SPA)** sem buscar uma nova página do servidor. Um roteador client-side assume o controle e atualiza o conteúdo da página com base na URL, sem acionar um recarregamento completo.

O Angular Router (`@angular/router`) é a biblioteca oficial para navegação e já vem incluída por padrão em todos os projetos criados pelo Angular CLI.

O roteamento no Angular é composto por três partes principais:

- **Routes** — definem qual componente exibir para cada URL.
- **Outlets** — marcadores no template que carregam componentes dinamicamente.
- **Links** — permitem que o usuário navegue entre rotas sem recarregar a página.

---

## 2. Configuração Básica

### Estrutura do Projeto

No Angular v20, o padrão é usar **standalone components** e organizar as rotas em arquivos dedicados por feature:

```
src/
  app/
    home/
      home.component.ts
    about/
      about.component.ts
    users/
      users.component.ts
      user-detail.component.ts
    not-found/
      not-found.component.ts
    app.component.ts
    app.routes.ts
    app.config.ts
```

> **Nota:** No Angular v20, a pasta `components/` não é mais o padrão sugerido. O Style Guide oficial recomenda organizar por **feature** (funcionalidade), colocando cada feature diretamente dentro de `app/`.

### Configuração do Aplicativo

**app.config.ts**
```typescript
import { ApplicationConfig } from '@angular/core';
import { provideRouter } from '@angular/router';
import { routes } from './app.routes';

export const appConfig: ApplicationConfig = {
  providers: [
    provideRouter(routes)
  ]
};
```

O `provideRouter(routes)` registra o Angular Router na aplicação. Aceita opções adicionais como `withPreloading`, `withViewTransitions` e `withHashLocation`.

---

## 3. Definindo Rotas

### Rotas Básicas

**app.routes.ts**
```typescript
import { Routes } from '@angular/router';
import { HomeComponent } from './home/home.component';
import { AboutComponent } from './about/about.component';
import { NotFoundComponent } from './not-found/not-found.component';

export const routes: Routes = [
  { path: '',       component: HomeComponent,     title: 'Home' },
  { path: 'about',  component: AboutComponent,    title: 'Sobre' },
  { path: 'users',  loadComponent: () => import('./users/users.component').then(m => m.UsersComponent), title: 'Usuários' },
  { path: '**',     component: NotFoundComponent, title: 'Página não encontrada' }
];
```

### Tipos de Rotas

#### 1. Rotas Estáticas
```typescript
{ path: 'about',   component: AboutComponent }
{ path: 'contact', component: ContactComponent }
```

#### 2. Rotas com Parâmetros
```typescript
{ path: 'users/:id',               component: UserDetailComponent }
{ path: 'user/:id/:social-media',  component: SocialMediaFeedComponent }
```

Nomes de parâmetros devem começar com letra e podem conter letras, números, `_` e `-`.

#### 3. Rota Wildcard (404)
```typescript
{ path: '**', component: NotFoundComponent }
```

> **Importante:** Rotas são avaliadas na ordem em que aparecem no array — **first-match wins**. Coloque as mais específicas primeiro e o wildcard sempre por último.

```typescript
const routes: Routes = [
  { path: '',           component: HomeComponent },       // caminho vazio
  { path: 'users/new',  component: NewUserComponent },    // estático mais específico
  { path: 'users/:id',  component: UserDetailComponent }, // dinâmico
  { path: 'users',      component: UsersComponent },      // estático menos específico
  { path: '**',         component: NotFoundComponent }    // sempre por último
];
```

### Títulos de Página

O Angular atualiza automaticamente o `<title>` da página ao navegar. Sempre defina títulos para acessibilidade:

```typescript
const routes: Routes = [
  { path: '',      component: HomeComponent,  title: 'Home Page' },
  { path: 'about', component: AboutComponent, title: 'Sobre Nós' },
];
```

É possível usar um **resolver** de título dinâmico:

```typescript
const titleResolver: ResolveFn<string> = (route) => `Produto #${route.paramMap.get('id')}`;

const routes: Routes = [
  { path: 'products/:id', component: ProductDetailComponent, title: titleResolver }
];
```

### Dados Estáticos na Rota

Cada rota pode carregar dados extras via `data`, úteis para configurar o comportamento dos componentes:

```typescript
{
  path: 'admin',
  component: AdminComponent,
  data: { role: 'admin', breadcrumb: 'Administração' }
}
```

### Providers por Rota

Rotas podem fornecer serviços ou tokens disponíveis **apenas para aquela seção**:

```typescript
{
  path: 'admin',
  providers: [AdminService, { provide: ADMIN_API_KEY, useValue: '12345' }],
  children: [
    { path: 'users', component: AdminUsersComponent },
    { path: 'teams', component: AdminTeamsComponent },
  ]
}
```

---

## 4. Estratégias de Carregamento

No Angular v20, há duas estratégias principais para carregar componentes e rotas:

### Eager Loading (Carregamento Imediato)

O componente é importado diretamente na configuração de rotas e incluído no bundle inicial:

```typescript
import { HomeComponent } from './home/home.component';
import { LoginComponent } from './auth/login.component';

export const routes: Routes = [
  { path: '',      component: HomeComponent },
  { path: 'login', component: LoginComponent },
];
```

**Quando usar:** Páginas principais que o usuário acessa logo no início (ex: Home, Login).

### Lazy Loading (Carregamento Sob Demanda)

O código do componente ou das rotas filhas só é baixado quando o usuário navega até aquela rota:

```typescript
export const routes: Routes = [
  // Componente único com lazy loading
  {
    path: 'login',
    loadComponent: () => import('./auth/login.component'),
  },

  // Grupo de rotas com lazy loading
  {
    path: 'admin',
    loadComponent: () => import('./admin/admin.component'),
    loadChildren: () => import('./admin/admin.routes'),
  },

  // Lazy loading condicional com injeção de dependência
  {
    path: 'dashboard',
    loadComponent: () => {
      const flags = inject(FeatureFlags);
      return flags.isPremium
        ? import('./dashboard/premium-dashboard.component')
        : import('./dashboard/basic-dashboard.component');
    }
  }
];
```

> **Dica:** Se o arquivo usa `export default`, você pode retornar a promise do `import()` diretamente, sem `.then()` para selecionar a classe.

**Quando usar:** Áreas secundárias da aplicação (ex: Admin, Relatórios, Configurações avançadas).

| Estratégia | Bundle Inicial | Performance após login | Indicada para |
|---|---|---|---|
| Eager | Maior | Transições mais rápidas | Páginas críticas |
| Lazy | Menor | Pequena latência na 1ª visita | Áreas secundárias |

---

## 5. Router Outlet

O `<router-outlet />` é o marcador que indica **onde** o roteador deve renderizar o componente correspondente à URL atual.

**app.component.ts**
```typescript
import { Component } from '@angular/core';
import { RouterOutlet, RouterLink, RouterLinkActive } from '@angular/router';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, RouterLink, RouterLinkActive],
  template: `
    <nav>
      <a routerLink="/" routerLinkActive="active" [routerLinkActiveOptions]="{exact: true}">Home</a>
      <a routerLink="/about" routerLinkActive="active">Sobre</a>
      <a routerLink="/users" routerLinkActive="active">Usuários</a>
    </nav>

    <main>
      <router-outlet />
    </main>
  `
})
export class AppComponent {}
```

> **Nota:** No Angular v20, `standalone: true` não precisa mais ser declarado — todos os componentes são standalone por padrão.

### Named Router Outlets (Outlets Nomeados)

É possível ter **múltiplos outlets** na mesma página, cada um renderizando um componente independente. Basta dar um `name` ao outlet:

**app.component.ts**
```html
<main>
  <router-outlet />                    <!-- outlet primário -->
</main>

<aside>
  <router-outlet name="sidebar" />     <!-- outlet secundário -->
</aside>
```

Para ativar um outlet nomeado, use a propriedade `outlet` na rota:

**app.routes.ts**
```typescript
export const routes: Routes = [
  { path: '',        component: HomeComponent },
  { path: 'help',    component: HelpComponent,    outlet: 'sidebar' },
  { path: 'filters', component: FiltersComponent, outlet: 'sidebar' },
];
```

A URL gerada combina os dois outlets com a notação de parênteses:

```
/home(sidebar:help)
```

Para navegar programaticamente para um outlet nomeado:

```typescript
this.router.navigate([{ outlets: { primary: 'home', sidebar: 'help' } }]);

// Ou para fechar o outlet nomeado:
this.router.navigate([{ outlets: { sidebar: null } }]);
```

E no template com `routerLink`:

```html
<a [routerLink]="[{ outlets: { sidebar: 'help' } }]">Abrir Ajuda</a>
<a [routerLink]="[{ outlets: { sidebar: null } }]">Fechar</a>
```

> **Quando usar:** Outlets nomeados são úteis para painéis laterais, modais baseados em rota, ou qualquer área da UI que precise de navegação independente do conteúdo principal — como um chat, notificações ou filtros avançados.

---

## 6. Navegação com RouterLink

### Navegação Básica

```html
<!-- String simples (caminho absoluto) -->
<a routerLink="/home">Home</a>
<a routerLink="/about">Sobre</a>

<!-- Array com parâmetros dinâmicos -->
<a [routerLink]="['/users', userId]">Ver Usuário</a>

<!-- Caminho relativo (sem barra inicial) -->
<a routerLink="notifications">Notificações</a>

<!-- Query parameters -->
<a [routerLink]="['/products']" [queryParams]="{ category: 'electronics', page: 1 }">
  Produtos Eletrônicos
</a>
```

### RouterLinkActive

Adiciona uma classe CSS ao link quando a rota correspondente está ativa:

```html
<nav>
  <a routerLink="/"
     routerLinkActive="active"
     [routerLinkActiveOptions]="{ exact: true }">
    Home
  </a>
  <a routerLink="/about"  routerLinkActive="active">Sobre</a>
  <a routerLink="/users"  routerLinkActive="active">Usuários</a>
</nav>
```

```css
.active {
  font-weight: bold;
  color: #007bff;
  border-bottom: 2px solid #007bff;
}
```

---

## 7. Navegação Programática

Use o serviço `Router` para navegar a partir do código TypeScript (após eventos, requisições, lógica de negócio, etc.):

```typescript
import { Component, inject } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-example',
  template: `
    <button (click)="goToHome()">Ir para Home</button>
    <button (click)="goToUser(123)">Ver Usuário 123</button>
    <button (click)="goToProducts()">Buscar Produtos</button>
  `
})
export class ExampleComponent {
  private router = inject(Router);

  goToHome() {
    this.router.navigate(['/']);
  }

  goToUser(userId: number) {
    this.router.navigate(['/users', userId]);
  }

  goToProducts() {
    this.router.navigate(['/products'], {
      queryParams: { category: 'books', sort: 'price' }
    });
  }

  // Navegação com URL completa como string
  goToSearch() {
    this.router.navigateByUrl('/search?q=angular&sort=date');
  }
}
```

---

## 8. Lendo o Estado da Rota

O serviço `ActivatedRoute` fornece todas as informações sobre a rota ativa no momento.

### Propriedades Principais

| Propriedade | Tipo | Descrição |
|---|---|---|
| `params` | `Observable` | Parâmetros da rota (ex: `:id`) |
| `queryParams` | `Observable` | Query parameters da URL |
| `data` | `Observable` | Dados estáticos definidos na rota |
| `url` | `Observable` | Segmentos do caminho atual |
| `snapshot` | `ActivatedRouteSnapshot` | Estado estático da rota no momento da navegação |

### Lendo Parâmetros de Rota

**Rota definida:** `{ path: 'users/:id', component: UserDetailComponent }`

**user-detail.component.ts**
```typescript
import { Component, inject, signal } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';

@Component({
  selector: 'app-user-detail',
  template: `
    <h1>Detalhes do Usuário</h1>
    @if (user()) {
      <p><strong>ID:</strong>   {{ user()!.id }}</p>
      <p><strong>Nome:</strong> {{ user()!.name }}</p>
      <p><strong>Bio:</strong>  {{ user()!.bio }}</p>
      <button (click)="goBack()">Voltar</button>
    } @else {
      <p>Carregando...</p>
    }
  `
})
export class UserDetailComponent {
  user = signal<User | null>(null);

  private route  = inject(ActivatedRoute);
  private router = inject(Router);

  constructor() {
    // Observable: reage a mudanças no parâmetro (mesmo componente, ID diferente)
    this.route.params.subscribe(params => {
      const id = Number(params['id']);
      this.user.set(this.users.find(u => u.id === id) ?? null);
    });

    // Snapshot: leitura única, sem subscription
    // const id = this.route.snapshot.paramMap.get('id');
  }

  goBack() {
    this.router.navigate(['/users']);
  }
}
```

> **Snapshot vs Observable:** Use `snapshot` quando o componente é destruído e recriado a cada navegação. Use o `Observable` (`.params.subscribe`) quando o mesmo componente pode ser reutilizado com IDs diferentes — por exemplo, navegando de `/users/1` para `/users/2` sem sair do componente.

---

## 9. Query Parameters

Query parameters são parâmetros opcionais que aparecem após `?` na URL e não afetam o matching de rota. São ideais para filtros, ordenação e paginação.

**products.component.ts**
```typescript
import { Component, inject, signal } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';

@Component({
  selector: 'app-products',
  template: `
    <h1>Produtos</h1>

    <select (change)="updateSort($event)">
      <option value="name">Nome</option>
      <option value="price">Preço</option>
    </select>

    <p>Ordenação atual: {{ currentSort() }}</p>
    <p>Página atual: {{ currentPage() }}</p>
  `
})
export class ProductsComponent {
  currentSort = signal<string>('name');
  currentPage = signal<number>(1);

  private route  = inject(ActivatedRoute);
  private router = inject(Router);

  constructor() {
    this.route.queryParams.subscribe(params => {
      this.currentSort.set(params['sort'] || 'name');
      this.currentPage.set(Number(params['page']) || 1);
    });
  }

  updateSort(event: Event) {
    const sort = (event.target as HTMLSelectElement).value;
    this.router.navigate([], {
      queryParams: { sort },
      queryParamsHandling: 'merge' // preserva outros query params existentes
    });
  }
}
```

### Opções de `queryParamsHandling`

| Valor | Comportamento |
|---|---|
| `'merge'` | Mescla os novos params com os existentes |
| `'preserve'` | Mantém os params atuais, ignora os novos |
| `''` (padrão) | Substitui todos os params pelos novos |

---

## 10. Rotas Aninhadas

Rotas aninhadas (`children`) permitem criar hierarquias de navegação, como uma área de dashboard com sub-seções.

**app.routes.ts**
```typescript
export const routes: Routes = [
  { path: '', component: HomeComponent },
  {
    path: 'dashboard',
    component: DashboardComponent,
    children: [
      { path: '',           component: DashboardHomeComponent },   // /dashboard
      { path: 'profile',    component: ProfileComponent },         // /dashboard/profile
      { path: 'settings',   component: SettingsComponent }        // /dashboard/settings
    ]
  }
];
```

O componente pai deve ter seu próprio `<router-outlet />` para renderizar os filhos:

**dashboard.component.ts**
```typescript
import { Component } from '@angular/core';
import { RouterOutlet, RouterLink, RouterLinkActive } from '@angular/router';

@Component({
  selector: 'app-dashboard',
  imports: [RouterOutlet, RouterLink, RouterLinkActive],
  template: `
    <div class="dashboard-layout">
      <nav class="sidebar">
        <h2>Dashboard</h2>
        <ul>
          <li><a routerLink=""         routerLinkActive="active" [routerLinkActiveOptions]="{exact:true}">Home</a></li>
          <li><a routerLink="profile"  routerLinkActive="active">Perfil</a></li>
          <li><a routerLink="settings" routerLinkActive="active">Configurações</a></li>
        </ul>
      </nav>

      <main class="content">
        <router-outlet />
      </main>
    </div>
  `
})
export class DashboardComponent {}
```

---

## 11. Redirecionamentos

Use `redirectTo` para direcionar usuários de caminhos antigos ou inválidos para rotas alternativas:

```typescript
const routes: Routes = [
  // Redirecionar path vazio para /home
  { path: '',         redirectTo: '/home', pathMatch: 'full' },

  // Redirecionar rota antiga para nova
  { path: 'articles', redirectTo: '/blog' },

  // Rotas principais
  { path: 'home', component: HomeComponent },
  { path: 'blog', component: BlogComponent },

  // Wildcard para qualquer rota não encontrada
  { path: '**',   component: NotFoundComponent }
];
```

> **`pathMatch: 'full'`** é necessário no redirecionamento do path vazio `''` para evitar que ele intercepte todas as rotas — sem ele, qualquer URL começaria com `''` e seria redirecionada.

---

## 12. Route Guards

Guards são funções que **controlam o acesso a rotas**. São como porteiros: decidem se o usuário pode entrar ou sair de uma página.

> **⚠️ Atenção:** Guards client-side nunca devem ser a única camada de segurança. Sempre valide permissões também no servidor.

### Tipos de Guards

| Guard | Quando é executado |
|---|---|
| `canActivate` | Antes de entrar em uma rota |
| `canActivateChild` | Antes de entrar em qualquer rota filha |
| `canDeactivate` | Antes de sair de uma rota |
| `canMatch` | Durante o matching de rotas (útil para feature flags) |

### Gerando um Guard via CLI

```bash
ng generate guard guards/auth
```

### `canActivate` — Controle de Autenticação

**auth.guard.ts**
```typescript
import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../services/auth.service';

export const authGuard: CanActivateFn = (route, state) => {
  const auth   = inject(AuthService);
  const router = inject(Router);

  if (auth.isAuthenticated()) {
    return true;
  }

  // Redireciona para login preservando a URL de destino
  return router.createUrlTree(['/login'], {
    queryParams: { returnUrl: state.url }
  });
};
```

**Aplicando na rota:**
```typescript
{
  path: 'admin',
  component: AdminComponent,
  canActivate: [authGuard]
}
```

### `canActivateChild` — Proteção de Rotas Filhas

Executa para **todas** as rotas filhas do pai, inclusive filhos de filhos:

```typescript
export const adminChildGuard: CanActivateChildFn = (childRoute, state) => {
  const auth = inject(AuthService);
  return auth.hasRole('admin');
};

// Aplicando:
{
  path: 'admin',
  component: AdminComponent,
  canActivateChild: [adminChildGuard],
  children: [
    { path: 'users', component: AdminUsersComponent },
    { path: 'teams', component: AdminTeamsComponent },
  ]
}
```

### `canDeactivate` — Prevenção de Saída

Útil para alertar o usuário sobre dados não salvos em formulários:

**unsaved-changes.guard.ts**
```typescript
import { CanDeactivateFn } from '@angular/router';
import { EditFormComponent } from '../edit-form/edit-form.component';

export const unsavedChangesGuard: CanDeactivateFn<EditFormComponent> = (component) => {
  if (component.hasUnsavedChanges()) {
    return confirm('Há alterações não salvas. Deseja sair mesmo assim?');
  }
  return true;
};

// Aplicando:
{
  path: 'edit/:id',
  component: EditFormComponent,
  canDeactivate: [unsavedChangesGuard]
}
```

### `canMatch` — Feature Flags e A/B Testing

Diferente dos outros guards, quando `canMatch` retorna `false`, o Angular **tenta a próxima rota** ao invés de bloquear a navegação completamente. Isso é útil para servir componentes diferentes para perfis distintos de usuário:

```typescript
export const premiumGuard: CanMatchFn = () => {
  return inject(UserService).isPremium();
};

const routes: Routes = [
  {
    path: 'dashboard',
    canMatch: [premiumGuard],
    loadComponent: () => import('./dashboard/premium-dashboard.component'),
  },
  {
    path: 'dashboard', // fallback para usuários sem premium
    loadComponent: () => import('./dashboard/basic-dashboard.component'),
  }
];
```

---

## 13. Exemplo Prático Completo

### Estrutura do Projeto

```
src/app/
├── home/
│   └── home.component.ts
├── about/
│   └── about.component.ts
├── users/
│   ├── users.component.ts
│   └── user-detail.component.ts
├── not-found/
│   └── not-found.component.ts
├── guards/
│   └── auth.guard.ts
├── app.component.ts
├── app.routes.ts
└── app.config.ts
```

### app.config.ts

```typescript
import { ApplicationConfig } from '@angular/core';
import { provideRouter, withViewTransitions } from '@angular/router';
import { routes } from './app.routes';

export const appConfig: ApplicationConfig = {
  providers: [
    provideRouter(routes, withViewTransitions()) // habilita animações de transição nativas
  ]
};
```

### app.routes.ts

```typescript
import { Routes } from '@angular/router';
import { HomeComponent } from './home/home.component';
import { NotFoundComponent } from './not-found/not-found.component';
import { authGuard } from './guards/auth.guard';

export const routes: Routes = [
  {
    path: '',
    component: HomeComponent,
    title: 'Home'
  },
  {
    path: 'about',
    loadComponent: () => import('./about/about.component').then(m => m.AboutComponent),
    title: 'Sobre'
  },
  {
    path: 'users',
    loadComponent: () => import('./users/users.component').then(m => m.UsersComponent),
    title: 'Usuários'
  },
  {
    path: 'users/:id',
    loadComponent: () => import('./users/user-detail.component').then(m => m.UserDetailComponent),
    title: 'Detalhes do Usuário'
  },
  {
    path: 'admin',
    canActivate: [authGuard],
    loadComponent: () => import('./admin/admin.component').then(m => m.AdminComponent),
    loadChildren: () => import('./admin/admin.routes').then(m => m.ADMIN_ROUTES),
    title: 'Admin'
  },
  {
    path: '**',
    component: NotFoundComponent,
    title: 'Página não encontrada'
  }
];
```

### app.component.ts

```typescript
import { Component } from '@angular/core';
import { RouterOutlet, RouterLink, RouterLinkActive } from '@angular/router';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, RouterLink, RouterLinkActive],
  template: `
    <nav class="navbar">
      <div class="nav-brand">
        <h2>Meu App Angular v20</h2>
      </div>
      <ul class="nav-links">
        <li>
          <a routerLink="/"
             routerLinkActive="active"
             [routerLinkActiveOptions]="{ exact: true }">
            Home
          </a>
        </li>
        <li><a routerLink="/about" routerLinkActive="active">Sobre</a></li>
        <li><a routerLink="/users" routerLinkActive="active">Usuários</a></li>
        <li><a routerLink="/admin" routerLinkActive="active">Admin</a></li>
      </ul>
    </nav>

    <main class="main-content">
      <router-outlet />
    </main>
  `,
  styles: [`
    .navbar {
      background: #1a1a2e;
      color: white;
      padding: 1rem 2rem;
      display: flex;
      justify-content: space-between;
      align-items: center;
    }
    .nav-links {
      display: flex;
      list-style: none;
      margin: 0;
      padding: 0;
      gap: 1.5rem;
    }
    .nav-links a {
      color: #ccc;
      text-decoration: none;
      padding: 0.5rem 1rem;
      border-radius: 4px;
      transition: background 0.2s;
    }
    .nav-links a:hover  { background: #333; color: white; }
    .nav-links a.active { background: #007bff; color: white; }
    .main-content { padding: 2rem; max-width: 1200px; margin: 0 auto; }
  `]
})
export class AppComponent {}
```

### home.component.ts

```typescript
import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-home',
  imports: [RouterLink],
  template: `
    <h1>Bem-vindo ao Angular v20!</h1>
    <p>Exemplo de roteamento com standalone components.</p>

    <div class="actions">
      <a routerLink="/about" class="btn">Sobre Nós</a>
      <a routerLink="/users" class="btn">Ver Usuários</a>
    </div>
  `,
  styles: [`
    .actions { margin-top: 1.5rem; display: flex; gap: 1rem; }
    .btn {
      padding: 0.6rem 1.2rem;
      background: #007bff;
      color: white;
      text-decoration: none;
      border-radius: 4px;
    }
  `]
})
export class HomeComponent {}
```

### users.component.ts

```typescript
import { Component, signal } from '@angular/core';
import { RouterLink } from '@angular/router';

interface User {
  id: number;
  name: string;
  email: string;
}

@Component({
  selector: 'app-users',
  imports: [RouterLink],
  template: `
    <h1>Lista de Usuários</h1>

    <div class="users-grid">
      @for (user of users(); track user.id) {
        <div class="user-card">
          <h3>{{ user.name }}</h3>
          <p>{{ user.email }}</p>
          <a [routerLink]="['/users', user.id]" class="btn">Ver Detalhes</a>
        </div>
      }
    </div>
  `,
  styles: [`
    .users-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
      gap: 1.5rem;
      margin-top: 1.5rem;
    }
    .user-card { border: 1px solid #ddd; padding: 1.5rem; border-radius: 8px; }
    .btn {
      display: inline-block;
      padding: 0.5rem 1rem;
      background: #007bff;
      color: white;
      text-decoration: none;
      border-radius: 4px;
    }
  `]
})
export class UsersComponent {
  users = signal<User[]>([
    { id: 1, name: 'João Silva',     email: 'joao@email.com' },
    { id: 2, name: 'Maria Santos',   email: 'maria@email.com' },
    { id: 3, name: 'Pedro Oliveira', email: 'pedro@email.com' },
  ]);
}
```

### user-detail.component.ts

```typescript
import { Component, inject, signal } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';

interface User {
  id: number;
  name: string;
  email: string;
  bio: string;
}

@Component({
  selector: 'app-user-detail',
  imports: [],
  template: `
    @if (user()) {
      <div>
        <h1>{{ user()!.name }}</h1>
        <p><strong>Email:</strong> {{ user()!.email }}</p>
        <p><strong>Bio:</strong>   {{ user()!.bio }}</p>

        <div class="actions">
          <button (click)="goBack()">Voltar</button>
          <button (click)="editUser()" class="btn-primary">Editar</button>
        </div>
      </div>
    } @else {
      <p>Usuário não encontrado.</p>
    }
  `,
  styles: [`
    .actions { margin-top: 1.5rem; display: flex; gap: 1rem; }
    button { padding: 0.5rem 1rem; border: 1px solid #ccc; border-radius: 4px; cursor: pointer; }
    .btn-primary { background: #007bff; color: white; border-color: #007bff; }
  `]
})
export class UserDetailComponent {
  user = signal<User | null>(null);

  private route  = inject(ActivatedRoute);
  private router = inject(Router);

  private users: User[] = [
    { id: 1, name: 'João Silva',     email: 'joao@email.com',  bio: 'Desenvolvedor Frontend' },
    { id: 2, name: 'Maria Santos',   email: 'maria@email.com', bio: 'Designer UX/UI' },
    { id: 3, name: 'Pedro Oliveira', email: 'pedro@email.com', bio: 'Desenvolvedor Backend' },
  ];

  constructor() {
    this.route.params.subscribe(params => {
      const id = Number(params['id']);
      this.user.set(this.users.find(u => u.id === id) ?? null);
    });
  }

  goBack() {
    this.router.navigate(['/users']);
  }

  editUser() {
    const u = this.user();
    if (u) this.router.navigate(['/users', u.id, 'edit']);
  }
}
```

---

## Resumo dos Conceitos Principais

1. **Configuração** — Use `provideRouter(routes)` no `app.config.ts`
2. **Definição de Rotas** — Configure no `app.routes.ts` com `path`, `component`, `title`
3. **Ordem importa** — First-match wins: específicas antes, wildcard `**` por último
4. **Eager vs Lazy** — Use `component` para carregamento imediato, `loadComponent`/`loadChildren` para lazy
5. **Router Outlet** — Use `<router-outlet />` para renderizar os componentes de rota
6. **Navegação Declarativa** — Use `routerLink` nos templates
7. **Navegação Programática** — Use `Router.navigate()` ou `Router.navigateByUrl()`
8. **Parâmetros de Rota** — Leia com `ActivatedRoute.params` (observable) ou `.snapshot.paramMap`
9. **Query Parameters** — Use `queryParams` para filtros, ordenação e paginação
10. **Rotas Aninhadas** — Use `children` + `<router-outlet />` no componente pai
11. **Redirecionamentos** — Use `redirectTo` para caminhos antigos ou o path vazio
12. **Guards** — Proteja rotas com `canActivate`, `canDeactivate`, `canMatch`, etc.
13. **Títulos** — Defina sempre o `title` na rota para acessibilidade

### Comandos Angular CLI Úteis

```bash
# Gerar componente (standalone por padrão no v20)
ng generate component users/user-detail

# Gerar guard
ng generate guard guards/auth

# Gerar resolver
ng generate resolver resolvers/user-data

# Criar nova aplicação com roteamento
ng new meu-app --routing
```
