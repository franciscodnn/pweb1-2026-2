[main](../README.md)

# Spring Boot — Services (`@Service`)

> Um **service** concentra as **regras de negócio** da aplicação. O controller trata apenas do HTTP: recebe a requisição, chama o service e traduz o resultado em uma resposta. Nesta aula refatoramos o **catálogo de projetos** da aula anterior, tirando do controller tudo o que não é HTTP.

Código completo: [`examples/springboot/catalogo_projetos`](../../examples/springboot/catalogo_projetos/)

---

## 1. O problema: um controller que faz tudo

Observe o `ProjetoController` da aula de [Controllers](../16_spring_boot_controllers/README.md):

```java
@RestController
@RequestMapping("/projects")
public class ProjetoController {

  private final Map<Long, Projeto> projetos = new ConcurrentHashMap<>(); // armazenamento
  private final AtomicLong sequencia = new AtomicLong();                 // geração de IDs

  public ProjetoController() {
    salvar(new Projeto(null, "Portfólio", ...));                         // dados iniciais
  }

  @GetMapping
  public List<Projeto> listar(String tech, int limit) {
    return projetos.values().stream()                                    // regra de consulta
        .filter(p -> tech == null || p.techs().contains(tech))
        .limit(limit)
        .toList();
  }
  // ...
}
```

Essa classe acumula várias responsabilidades:

| Responsabilidade | Onde aparece |
|---|---|
| Protocolo HTTP (rotas, status, headers) | `@GetMapping`, `ResponseEntity` |
| Armazenamento dos dados | `Map<Long, Projeto>` |
| Geração de IDs | `AtomicLong` + `salvar()` |
| Carga inicial | construtor |
| Regras de consulta e de negócio | filtro por `tech`, `limit` |

> **Pergunta:** se amanhã a mesma lógica tiver que atender uma página HTML, uma tarefa agendada ou um consumidor de mensagens, o que dá para reaproveitar? **Nada**, porque tudo está preso ao controller.

---

## 2. Arquitetura em camadas

A solução é separar as responsabilidades em **camadas** (veja a aula de [Arquitetura](../15_architecture/README.md)):

```
Cliente HTTP
    │  JSON
    ▼
┌──────────────────────┐
│  @RestController     │  apresentação: HTTP, status, JSON
└──────────┬───────────┘
           │ chamadas de método Java
           ▼
┌──────────────────────┐
│  @Service            │  negócio: regras, validações, casos de uso
└──────────┬───────────┘
           ▼
┌──────────────────────┐
│  @Repository         │  persistência: banco de dados (próximas aulas)
└──────────────────────┘
```

**Regra de ouro:** cada camada só conhece a camada de baixo. O service **não sabe que existe HTTP**, então não usa `ResponseEntity`, `HttpStatus` nem `@RequestParam`.

---

## 3. O que é `@Service`

```java
@Service
public class ProjetoService { ... }
```

- `@Service` é um **estereótipo** de `@Component`. Ele registra a classe como um **bean** no container de IoC do Spring (veja a aula de [DI/IoC](../16_di_ioc/README.md)).
- Tecnicamente `@Service` e `@Component` têm o mesmo efeito. A diferença é **semântica**: `@Service` documenta que a classe pertence à camada de negócio.
- O Spring **cria uma única instância** (escopo *singleton*) e a **injeta** em quem precisar dela.
- A classe precisa estar no pacote da classe anotada com `@SpringBootApplication` ou em um subpacote, porque é ali que o *component scan* procura.

| Anotação | Camada |
|---|---|
| `@Component` | genérica |
| `@Service` | negócio |
| `@Repository` | persistência (também traduz exceções de banco) |
| `@Controller` / `@RestController` | apresentação |

### Comparando com o Angular

Você já usou esse padrão na aula de [DI no Angular](../12_angular_di/README.md):

| Angular | Spring Boot |
|---|---|
| `@Service()` (provido na raiz) | `@Service` (singleton por padrão) |
| `inject(ProjetoService)` ou construtor | injeção pelo construtor |
| o componente cuida da tela | o controller cuida do HTTP |
| o service cuida dos dados e da lógica | o service cuida das regras de negócio |

---

## 4. Criando o `ProjetoService`

Movemos para o service o armazenamento, a geração de IDs, os dados iniciais e as regras:

```java
package com.example.catalogo_projetos.projeto;

@Service
public class ProjetoService {

  // "Banco" em memória (será substituído por um repositório)
  private final Map<Long, Projeto> projetos = new ConcurrentHashMap<>();
  private final AtomicLong sequencia = new AtomicLong();

  public ProjetoService() {
    criar(new Projeto(null, "Portfólio", "SPA com Angular e signals",
        List.of("Angular", "TypeScript"), "https://github.com/exemplo/portfolio", 1));
    criar(new Projeto(null, "Catálogo API", "API REST com Spring Boot",
        List.of("Java", "Spring Boot"), "https://github.com/exemplo/catalogo", 2));
  }

  public List<Projeto> listar(String tech, int limit) {
    return projetos.values().stream()
        .filter(p -> tech == null || p.techs().contains(tech))
        .limit(limit)
        .toList();
  }

  public Optional<Projeto> buscar(Long id) {
    return Optional.ofNullable(projetos.get(id));
  }

  public Projeto criar(Projeto novo) {
    validar(novo);
    Projeto salvo = novo.comId(sequencia.incrementAndGet());
    projetos.put(salvo.id(), salvo);
    return salvo;
  }

  public Optional<Projeto> atualizar(Long id, Projeto dados) {
    validar(dados);
    // atômico: só substitui se o id existir
    return Optional.ofNullable(projetos.computeIfPresent(id, (chave, antigo) -> dados.comId(chave)));
  }

  public boolean remover(Long id) {
    return projetos.remove(id) != null;
  }

  // ---- regras de negócio ----
  private void validar(Projeto p) {
    if (p.title() == null || p.title().isBlank()) {
      throw new RegraDeNegocioException("O título é obrigatório");
    }
    if (p.yearsExperience() < 0) {
      throw new RegraDeNegocioException("yearsExperience não pode ser negativo");
    }
  }
}
```

Uma exceção **de domínio**, que não tem relação com HTTP:

```java
public class RegraDeNegocioException extends RuntimeException {
  public RegraDeNegocioException(String mensagem) {
    super(mensagem);
  }
}
```

> Observe os tipos de retorno: `Optional` quando o projeto pode não existir, `boolean` quando a operação pode não ter efeito e uma **exceção** quando uma regra é violada. Quem decide se isso vira 404, 204 ou 400 é o controller.

---

## 5. O controller fica enxuto

```java
@RestController
@RequestMapping("/projects")
public class ProjetoController {

  private final ProjetoService service;

  // Injeção pelo construtor: com um único construtor, @Autowired é dispensável
  public ProjetoController(ProjetoService service) {
    this.service = service;
  }

  @GetMapping
  @JsonView(Views.Resumo.class)
  public List<Projeto> listar(
      @RequestParam(required = false) String tech,
      @RequestParam(defaultValue = "10") int limit) {
    return service.listar(tech, limit);
  }

  @GetMapping("/{id:\\d+}")
  @JsonView(Views.Detalhe.class)
  public ResponseEntity<Projeto> buscar(@PathVariable Long id) {
    return ResponseEntity.of(service.buscar(id)); // 200 ou 404
  }

  @PostMapping
  public ResponseEntity<Projeto> criar(@RequestBody Projeto novo) {
    Projeto salvo = service.criar(novo);
    URI location = ServletUriComponentsBuilder.fromCurrentRequest()
        .path("/{id}").buildAndExpand(salvo.id()).toUri();
    return ResponseEntity.created(location).body(salvo); // 201
  }

  @PutMapping("/{id:\\d+}")
  public ResponseEntity<Projeto> atualizar(@PathVariable Long id, @RequestBody Projeto dados) {
    return ResponseEntity.of(service.atualizar(id, dados)); // 200 ou 404
  }

  @DeleteMapping("/{id:\\d+}")
  public ResponseEntity<Void> remover(@PathVariable Long id) {
    return service.remover(id)
        ? ResponseEntity.noContent().build() // 204
        : ResponseEntity.notFound().build(); // 404
  }

  // Traduz a exceção de negócio para HTTP 400 (corpo no formato RFC 9457)
  @ExceptionHandler(RegraDeNegocioException.class)
  public ProblemDetail tratarRegra(RegraDeNegocioException ex) {
    return ProblemDetail.forStatusAndDetail(HttpStatus.BAD_REQUEST, ex.getMessage());
  }
}
```

| Antes | Depois |
|---|---|
| controller com ~90 linhas e 5 responsabilidades | controller apenas com HTTP |
| lógica impossível de reusar | qualquer classe pode injetar `ProjetoService` |
| testar exige subir o servidor | o service é testado como uma classe Java comum |

---

## 6. Experimentos em sala

### 6.1 Sem `@Service`, sem bean

Remova a anotação `@Service` e execute `./mvnw spring-boot:run`:

```
Parameter 0 of constructor in com.example.catalogo_projetos.projeto.ProjetoController
required a bean of type 'com.example.catalogo_projetos.projeto.ProjetoService'
that could not be found.
```

> Quem cria os objetos é o **container**, não o seu código (**Inversão de Controle**). Sem a anotação, o Spring não sabe que precisa criar o service.

### 6.2 Uma única instância

Adicione ao construtor do service:

```java
System.out.println("ProjetoService criado: " + System.identityHashCode(this));
```

A mensagem aparece **uma única vez** na inicialização, por mais requisições que você faça. Se outro controller também injetar `ProjetoService`, os dois recebem **o mesmo objeto**.

### 6.3 Singleton e concorrência

Como existe só uma instância atendendo **todas as requisições ao mesmo tempo**, o estado do service precisa ser *thread-safe*. Por isso usamos `ConcurrentHashMap` e `AtomicLong`.

Mesmo assim, a versão antiga do `atualizar` tinha uma condição de corrida:

```java
if (!projetos.containsKey(id)) return ResponseEntity.notFound().build();
// outra requisição pode remover o projeto aqui!
projetos.put(id, atualizado); // ...e ele "ressuscita"
```

`computeIfPresent` executa a verificação e a substituição de forma **atômica**.

> **Regra prática:** prefira services **sem estado** (*stateless*). Quando houver estado compartilhado, ele deve ficar no banco de dados (no repositório).

---

## 7. Testando o service

### 7.1 Teste unitário, sem Spring

Como o service é uma classe Java comum, basta instanciá-lo:

```java
class ProjetoServiceTest {

  private final ProjetoService service = new ProjetoService();

  @Test
  void criarAtribuiId() {
    Projeto salvo = service.criar(
        new Projeto(null, "Blog", "Blog pessoal", List.of("Java"), null, 1));

    assertNotNull(salvo.id());
    assertTrue(service.buscar(salvo.id()).isPresent());
  }

  @Test
  void criarSemTituloLancaExcecao() {
    assertThrows(RegraDeNegocioException.class, () ->
        service.criar(new Projeto(null, "  ", null, List.of(), null, 0)));
  }

  @Test
  void atualizarInexistenteRetornaVazio() {
    Projeto dados = new Projeto(null, "X", null, List.of(), null, 0);
    assertTrue(service.atualizar(999L, dados).isEmpty());
  }
}
```

### 7.2 Teste do controller com o service simulado (*mock*)

```java
@WebMvcTest(ProjetoController.class) // sobe apenas a camada web
class ProjetoControllerTest {

  @Autowired MockMvc mvc;

  @MockitoBean ProjetoService service; // substitui o bean real por um mock

  @Test
  void buscarInexistenteRetorna404() throws Exception {
    when(service.buscar(99L)).thenReturn(Optional.empty());

    mvc.perform(get("/projects/99"))
       .andExpect(status().isNotFound());
  }

  @Test
  void criarInvalidoRetorna400() throws Exception {
    when(service.criar(any())).thenThrow(new RegraDeNegocioException("O título é obrigatório"));

    mvc.perform(post("/projects")
           .contentType(MediaType.APPLICATION_JSON)
           .content("{\"title\":\"\"}"))
       .andExpect(status().isBadRequest());
  }
}
```

> No Spring Boot 4, `@WebMvcTest` fica em `org.springframework.boot.webmvc.test.autoconfigure` (dependência `spring-boot-starter-webmvc-test`), e `@MockitoBean` fica em `org.springframework.test.context.bean.override.mockito`.

Com as camadas separadas, cada uma pode ser testada **isoladamente**: o service sem HTTP e o controller sem a lógica real.

---

## 8. Boas práticas

| Faça | Evite |
|---|---|
| injeção pelo **construtor** com campo `final` | `@Autowired` em campo: esconde a dependência e dificulta os testes |
| service retornando tipos de domínio (`Projeto`, `Optional`, `boolean`) | service retornando `ResponseEntity` ou `HttpStatus` |
| exceções de domínio (`RegraDeNegocioException`) | lançar `ResponseStatusException` dentro do service |
| métodos com nomes de casos de uso (`criar`, `publicar`, `arquivar`) | um service que só repassa chamadas sem nenhuma regra |
| interface + implementação **quando houver mais de uma implementação** (use `@Qualifier`) | criar `ProjetoService` + `ProjetoServiceImpl` por hábito |

---

## 9. Próximo passo: o repositório

O service ainda guarda os dados no `Map`. Na próxima etapa extraímos um `ProjetoRepository` (`@Repository`, e depois Spring Data JPA). Assim o service fica responsável **apenas** pelas regras de negócio:

```java
@Service
public class ProjetoService {
  private final ProjetoRepository repository;

  public ProjetoService(ProjetoRepository repository) {
    this.repository = repository;
  }
  // ...
}
```

---

## Exercícios

1. Impeça a criação de dois projetos com o mesmo `title` (ignorando maiúsculas e minúsculas). Lance `ProjetoDuplicadoException` no service e responda com **409 Conflict** no controller.
2. Normalize `techs` no service: remova espaços extras e itens duplicados antes de salvar.
3. Crie `GET /projects/stats`, que retorna o total de projetos e a quantidade de projetos por tecnologia, como em `{"total": 2, "porTech": {"Java": 1, "Angular": 1}}`. Toda a lógica deve ficar no service.
4. Escreva testes unitários para as regras dos exercícios 1 e 2 **sem** usar o Spring.
5. Mova o `@ExceptionHandler` para uma classe anotada com `@RestControllerAdvice`. Qual é a vantagem disso quando houver vários controllers?

---

## Referências

- [Classpath scanning and stereotype annotations](https://docs.spring.io/spring-framework/reference/core/beans/classpath-scanning.html)
- [Dependency Injection](https://docs.spring.io/spring-framework/reference/core/beans/dependencies/factory-collaborators.html)
- [Bean scopes](https://docs.spring.io/spring-framework/reference/core/beans/factory-scopes.html)
- [Exceptions / `@ExceptionHandler`](https://docs.spring.io/spring-framework/reference/web/webmvc/mvc-controller/ann-exceptionhandler.html)
- [Error responses (`ProblemDetail`)](https://docs.spring.io/spring-framework/reference/web/webmvc/mvc-ann-rest-exceptions.html)
- [Testing Spring Boot applications](https://docs.spring.io/spring-boot/reference/testing/spring-boot-applications.html)
