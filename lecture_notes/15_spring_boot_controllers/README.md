# Aula 4 — Controllers no Spring Boot 4 (Spring MVC)

> **Controllers** são componentes que recebem requisições HTTP, validam os dados de entrada, encaminha os dados validados para processamento e retorna respostas HTTP. No Spring Boot, usamos anotações para mapear URLs, extrair parâmetros e serializar respostas JSON.

---

## 1. @Controller vs @RestController

O Spring MVC fornece duas anotações principais para definir controllers:

| Anotação | Descrição | Uso |
|---|---|---|
| **`@Controller`** | Marca a classe como componente Spring MVC | Retorna **nomes de view** (templates HTML) |
| **`@RestController`** | Combina `@Controller` + `@ResponseBody` | Retorna **dados diretamente** (JSON, XML, texto) |

> **Regra prática**: APIs REST usam `@RestController`. Aplicações web tradicionais (com Thymeleaf, JSP) usam `@Controller`.

### Exemplo com @Controller (retorna view)

```java
@Controller
public class HelloController {

    @GetMapping("/hello")
    public String handle(Model model) {
        model.addAttribute("message", "Hello World!");
        return "index";  // resolve para index.html / index.jsp
    }
}
```

### Exemplo com @RestController (retorna JSON)

```java
@RestController
public class ProdutoController {

    @GetMapping("/produtos/{id}")
    public Produto buscar(@PathVariable Long id) {
        return new Produto(id, "Notebook", 3500.00);
    }
}
```

---

## 2. @RequestMapping e seus atalhos

A anotação `@RequestMapping` mapeia requisições para métodos de controller. Possui atributos para filtrar por URL, método HTTP, parâmetros, headers e tipo de conteúdo.

### Atalhos específicos por método HTTP

| Atalho | Equivalente a | Uso típico |
|---|---|---|
| **`@GetMapping`** | `@RequestMapping(method = GET)` | Consultar dados |
| **`@PostMapping`** | `@RequestMapping(method = POST)` | Criar recurso |
| **`@PutMapping`** | `@RequestMapping(method = PUT)` | Atualizar recurso completo |
| **`@DeleteMapping`** | `@RequestMapping(method = DELETE)` | Remover recurso |
| **`@PatchMapping`** | `@RequestMapping(method = PATCH)` | Atualização parcial |

### Mapeamento em nível de classe + método

```java
@RestController
@RequestMapping("/pessoas")  // prefixo para todos os métodos
public class PessoaController {

    @GetMapping("/{id}")       // GET /pessoas/123
    public Pessoa buscar(@PathVariable Long id) {
        return pessoaService.findById(id);
    }

    @PostMapping               // POST /pessoas
    @ResponseStatus(HttpStatus.CREATED)
    public void criar(@RequestBody Pessoa pessoa) {
        pessoaService.save(pessoa);
    }
}
```

> **Importante**: `@RequestMapping` sem `method` especificado aceita **todos** os métodos HTTP. Prefira sempre os atalhos específicos.

---

## 3. Padrões de URI e @PathVariable

Spring MVC usa `PathPattern` para matching eficiente de URLs. Suporta literais, wildcards e variáveis de caminho.

### Padrões de URI suportados

| Padrão | Descrição | Exemplo de match |
|---|---|---|
| `spring` | Literal exato | `/spring` → `/spring` |
| `?` | Um caractere qualquer | `/t?st` → `/test`, `/t3st` |
| `*` | Zero ou mais caracteres no segmento | `/recursos/*.png` → `/recursos/logo.png` |
| `**` | Zero ou mais segmentos | `/api/**` → `/api`, `/api/v1/users` |
| `{nome}` | Variável de caminho (captura segmento) | `/users/{id}` → `/users/42` (id=42) |
| `{nome:regex}` | Variável com expressão regular | `/files/{name:[a-z]+}` → `/files/doc` |
| `{*path}` | Captura múltiplos segmentos | `/static/{*file}` → `/static/css/style.css` |

### Exemplo com @PathVariable

```java
@RestController
public class PetController {

    @GetMapping("/owners/{ownerId}/pets/{petId}")
    public Pet findPet(
            @PathVariable Long ownerId,
            @PathVariable Long petId) {
        // ownerId e petId são extraídos da URL
        return petService.find(ownerId, petId);
    }
}
```

### Variáveis de classe + método combinadas

```java
@Controller
@RequestMapping("/owners/{ownerId}")
public class OwnerController {

    @GetMapping("/pets/{petId}")
    public Pet findPet(
            @PathVariable Long ownerId,   // herdado da classe
            @PathVariable Long petId) {  // do método
        // ...
    }
}
```

> **Dica**: se o nome da variável no código for igual ao da URL, `@PathVariable` infere automaticamente. Use `@PathVariable("customId")` quando os nomes diferirem.

---

## 4. Consumes, Produces, Params e Headers

Além da URL e do método HTTP, você pode restringir mappings por tipo de conteúdo, parâmetros e headers.

### consumes — filtra pelo Content-Type da requisição

```java
@PostMapping(
    path = "/pets",
    consumes = "application/json"   // aceita apenas JSON
)
public void addPet(@RequestBody Pet pet) {
    // ...
}
```

### produces — filtra pelo Accept do cliente

```java
@GetMapping(
    path = "/pets/{petId}",
    produces = "application/json"  // retorna apenas JSON
)
public Pet getPet(@PathVariable String petId) {
    // ...
}
```

### params — filtra por parâmetros de query

```java
@GetMapping(
    path = "/pets",
    params = "tipo=cachorro"       // só match se ?tipo=cachorro
)
public List<Pet> listarCachorros() {
    // ...
}
```

### headers — filtra por headers HTTP

```java
@GetMapping(
    path = "/pets",
    headers = "X-Api-Version=2"    // só match se header presente
)
public List<Pet> listarV2() {
    // ...
}
```

> **Constantes úteis**: `MediaType.APPLICATION_JSON_VALUE`, `MediaType.APPLICATION_XML_VALUE` evitam strings hardcoded.

---

## 5. ResponseEntity — controle total da resposta

`ResponseEntity` permite definir **status HTTP**, **headers** e **body** da resposta de forma programática.

### Estrutura básica

```java
@GetMapping("/something")
public ResponseEntity<String> handle() {
    String body = "Conteúdo processado";
    String etag = "abc123";

    return ResponseEntity
        .ok()              // status 200
        .eTag(etag)        // header ETag
        .body(body);       // corpo da resposta
}
```

### Métodos de builder comuns

| Método | Status HTTP | Uso |
|---|---|---|
| `ResponseEntity.ok()` | 200 OK | Resposta de sucesso |
| `ResponseEntity.created(uri)` | 201 Created | Recurso criado (com Location) |
| `ResponseEntity.noContent()` | 204 No Content | Sucesso sem corpo |
| `ResponseEntity.badRequest()` | 400 Bad Request | Erro do cliente |
| `ResponseEntity.notFound()` | 404 Not Found | Recurso inexistente |
| `ResponseEntity.status(418)` | Qualquer status | Status customizado |

### Exemplo completo: CRUD com ResponseEntity

```java
@RestController
@RequestMapping("/produtos")
public class ProdutoController {

    private final ProdutoService service;

    public ProdutoController(ProdutoService service) {
        this.service = service;
    }

    @GetMapping("/{id}")
    public ResponseEntity<Produto> buscar(@PathVariable Long id) {
        return service.findById(id)
            .map(ResponseEntity::ok)                    // 200 + body
            .orElse(ResponseEntity.notFound().build());  // 404
    }

    @PostMapping
    public ResponseEntity<Produto> criar(@RequestBody Produto produto) {
        Produto salvo = service.save(produto);
        URI location = ServletUriComponentsBuilder
            .fromCurrentRequest()
            .path("/{id}")
            .buildAndExpand(salvo.getId())
            .toUri();

        return ResponseEntity
            .created(location)   // 201 + header Location
            .body(salvo);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> remover(@PathVariable Long id) {
        service.delete(id);
        return ResponseEntity.noContent().build();  // 204
    }
}
```

---

## 6. @RequestParam — parâmetros de query e form data

A anotação `@RequestParam` vincula **parâmetros de query string** (`?nome=valor`) ou **dados de formulário** (`application/x-www-form-urlencoded`) a argumentos de métodos de controller.

### Uso básico

```java
@RestController
@RequestMapping("/pets")
public class PetController {

    @GetMapping
    public Pet buscar(@RequestParam("petId") int petId) {
        return petService.findById(petId);
    }
}
```

Requisição: `GET /pets?petId=42` → `petId` recebe `42`

> **Dica**: se o nome do parâmetro na URL for igual ao nome do argumento, `@RequestParam` infere automaticamente: `@RequestParam int petId` equivale a `@RequestParam("petId") int petId`.

### Parâmetros opcionais

Por padrão, `@RequestParam` é **obrigatório** (`required = true`). Para tornar opcional:

#### Opção 1: required = false

```java
@GetMapping
public List<Pet> listar(
        @RequestParam(required = false) String raca,
        @RequestParam(required = false) Integer idade) {
    return petService.findByFiltros(raca, idade);
}
```

Requisições válidas:
- `GET /pets` → `raca = null`, `idade = null`
- `GET /pets?raca=siames` → `raca = "siames"`, `idade = null`
- `GET /pets?raca=siames&idade=3` → ambos preenchidos

#### Opção 2: java.util.Optional

```java
@GetMapping
public List<Pet> listar(
        @RequestParam Optional<String> raca,
        @RequestParam Optional<Integer> idade) {
    return petService.findByFiltros(raca.orElse(null), idade.orElse(null));
}
```

#### Opção 3: valor padrão (defaultValue)

```java
@GetMapping
public List<Pet> listar(
        @RequestParam(defaultValue = "todos") String status,
        @RequestParam(defaultValue = "10") int limite) {
    return petService.findByStatus(status, limite);
}
```

Requisição `GET /pets` → `status = "todos"`, `limite = 10`

### Múltiplos valores (array ou lista)

Quando um parâmetro aparece várias vezes na URL, use `List` ou array:

```java
@GetMapping
public List<Pet> listarPorRacas(@RequestParam List<String> raca) {
    // GET /pets?raca=siames&raca=persa
    // raca = ["siames", "persa"]
    return petService.findByRacas(raca);
}
```

### Capturar todos os parâmetros em um Map

```java
@PostMapping(path = "/process", consumes = MediaType.APPLICATION_FORM_URLENCODED_VALUE)
public String processarFormulario(@RequestParam MultiValueMap<String, String> params) {
    // params.getFirst("nome")
    // params.get("interesses") → lista de valores
    return "processado";
}
```

### @RequestParam implícito

Desde o Spring 3.1+, `@RequestParam` é **opcional** para tipos simples (`String`, `int`, `Long`, `Date`, etc.) que não sejam resolvidos por outro argument resolver:

```java
@GetMapping
public Pet buscar(int petId) {   // @RequestParam implícito
    return petService.findById(petId);
}
```

> **Recomendação**: prefira usar `@RequestParam` explicitamente para deixar claro a intenção e aproveitar atributos como `required`, `defaultValue`.

### Resumo dos atributos

| Atributo | Descrição | Exemplo |
|---|---|---|
| `value` / `name` | Nome do parâmetro na URL | `@RequestParam("pet_id")` |
| `required` | Se o parâmetro é obrigatório | `required = false` |
| `defaultValue` | Valor padrão quando ausente | `defaultValue = "10"` |

---

## 7. Jackson JSON — serialização com @JsonView

Spring Boot usa **Jackson** como conversor JSON padrão. A anotação `@JsonView` permite controlar quais campos de um objeto são serializados, útil para ocultar dados sensíveis.

### Definindo views (interfaces vazias como marcadores)

```java
public class Usuario {

    public interface ResumoView {};
    public interface DetalheView extends ResumoView {};

    @JsonView(ResumoView.class)
    private String username;

    @JsonView(DetalheView.class)
    private String email;

    @JsonView(DetalheView.class)
    private String telefone;

    // senha NÃO tem @JsonView → nunca aparece na resposta
    private String password;

    // getters...
}
```

### Usando @JsonView no controller

```java
@RestController
public class UsuarioController {

    @GetMapping("/usuario/resumo")
    @JsonView(Usuario.ResumoView.class)   // só serializa username
    public Usuario getResumo() {
        return new Usuario("eric", "eric@email.com", "99999", "7!jd#h23");
    }

    @GetMapping("/usuario/detalhe")
    @JsonView(Usuario.DetalheView.class)  // serializa username + email + telefone
    public Usuario getDetalhe() {
        return new Usuario("eric", "eric@email.com", "99999", "7!jd#h23");
    }
}
```

### Resposta /usuario/resumo

```json
{
  "username": "eric"
}
```

### Resposta /usuario/detalhe

```json
{
  "username": "eric",
  "email": "eric@email.com",
  "telefone": "99999"
}
```

> **Nota**: `password` nunca aparece porque não possui `@JsonView`. `@JsonView` permite **apenas uma view por método**; para múltiplas views, crie uma interface composta que estenda as desejadas.

### Alternativa programática: MappingJacksonValue

```java
@GetMapping("/usuario")
public MappingJacksonValue getUsuario() {
    Usuario usuario = new Usuario("eric", "eric@email.com", "99999", "7!jd#h23");
    MappingJacksonValue value = new MappingJacksonValue(usuario);
    value.setSerializationView(Usuario.ResumoView.class);
    return value;
}
```

> Útil quando a view precisa ser escolhida dinamicamente em tempo de execução.

---

## 8. Resumo dos conceitos

| Conceito | Descrição |
|---|---|
| **`@RestController`** | Controller que retorna dados (JSON/XML) diretamente |
| **`@RequestMapping`** | Mapeamento genérico de requisições (URL, método, headers, params) |
| **`@GetMapping` / `@PostMapping`** | Atalhos para métodos HTTP específicos |
| **`@PathVariable`** | Extrai variáveis da URL (`/{id}`) |
| **`@RequestBody`** | Desserializa o corpo JSON para objeto Java |
| **`@ResponseStatus`** | Define status HTTP padrão do método |
| **`ResponseEntity`** | Controle completo de status, headers e body |
| **`@JsonView`** | Controla quais campos são serializados pelo Jackson |
| **`consumes`** | Restringe requisições pelo Content-Type |
| **`produces`** | Restringe respostas pelo Accept header |

---

## 9. Dependências Maven (pom.xml)

```xml
<dependencies>
    <!-- Web MVC + Tomcat embutido -->
    <dependency>
        <groupId>org.springframework.boot</groupId>
        <artifactId>spring-boot-starter-webmvc</artifactId>
    </dependency>

    <!-- Jackson (já incluso no starter-webmvc, mas explicitado para clareza) -->
    <dependency>
        <groupId>org.springframework.boot</groupId>
        <artifactId>spring-boot-starter-json</artifactId>
    </dependency>

    <!-- Testes -->
    <dependency>
        <groupId>org.springframework.boot</groupId>
        <artifactId>spring-boot-starter-test</artifactId>
        <scope>test</scope>
    </dependency>
</dependencies>
```

---

## 10. Referências

- [Annotated Controllers](https://docs.spring.io/spring-framework/reference/web/webmvc/mvc-controller.html)
- [ResponseEntity](https://docs.spring.io/spring-framework/reference/web/webmvc/mvc-controller/ann-methods/responseentity.html)
- [Jackson JSON Views](https://docs.spring.io/spring-framework/reference/web/webmvc/mvc-controller/ann-methods/jackson.html)
- [Request Mapping](https://docs.spring.io/spring-framework/reference/web/webmvc/mvc-controller/ann-requestmapping.html)
