[main](../../README.md)

# Aula 14 - Métodos HTTP e Status Codes em APIs REST

## 1. Visão geral de API REST

- API REST expõe **recursos** (ex.: `Book`, `User`) via **HTTP**.
- Cada recurso é acessado por uma **URI**:
  - Coleção: `/api/books`
  - Item: `/api/books/{id}`
- Cliente faz **requisições HTTP** e recebe **respostas HTTP** com:
  - Método (GET, POST…)
  - URI
  - Status code (200, 404…)
  - Corpo (JSON, por exemplo)

---

## 2. Métodos HTTP principais (CRUD)

| Método  | Uso principal           | CRUD    | Idempotente?              |
|---------|-------------------------|---------|---------------------------|
| GET     | Buscar dados            | Read    | Sim                       |
| POST    | Criar novo recurso      | Create  | Não                       |
| PUT     | Substituir recurso      | Update  | Sim                       |
| PATCH   | Atualizar parcialmente  | Update  | Em geral não              |
| DELETE  | Remover recurso         | Delete  | Sim                       |

**Idempotente**: repetir a mesma requisição deixa o servidor no mesmo estado final.

---

## 3. Como cada método é usado em uma API REST

### GET
- Lê dados, **não altera** o estado do servidor.
- Ex.:  
  - `GET /api/books` → lista livros  
  - `GET /api/books/1` → detalhe do livro 1  

### POST
- Cria **novo recurso** em uma coleção.
- Ex.:  
  - `POST /api/books` com JSON de um livro → cria um livro novo  

### PUT
- Substitui **todo** o recurso existente.
- Ex.:  
  - `PUT /api/books/1` → envia todos os campos do livro 1  

### PATCH
- Atualiza **parte** do recurso.
- Ex.:  
  - `PATCH /api/books/1` com `{ "title": "Novo título" }`  

### DELETE
- Remove o recurso.
- Ex.:  
  - `DELETE /api/books/1` → apaga o livro 1  

---

## 4. Status codes HTTP – visão por grupo

- **1xx – Informacionais**: processamento em andamento (quase não usados em APIs comuns).
- **2xx – Sucesso**: requisição foi bem-sucedida.
- **3xx – Redirecionamento**: o cliente precisa fazer outra requisição.
- **4xx – Erro do cliente**: problema na requisição (dados, permissão, etc.).
- **5xx – Erro do servidor**: o servidor falhou ao processar.

---

## 5. 2xx – Códigos de sucesso mais usados

- **200 OK**  
  - Requisição bem-sucedida, normalmente com **corpo** na resposta (GET, PUT, PATCH).
- **201 Created**  
  - Recurso criado com sucesso (típico de **POST**).
- **204 No Content**  
  - Sucesso **sem corpo** na resposta (muito usado em **DELETE**).

---

## 6. 4xx – Erros do cliente mais comuns

- **400 Bad Request**  
  - Requisição inválida (JSON malformado, campos obrigatórios ausentes…).
- **401 Unauthorized**  
  - Falta autenticação ou token inválido.
- **403 Forbidden**  
  - Autenticado, mas **sem permissão** para acessar aquele recurso.
- **404 Not Found**  
  - Recurso não encontrado (ex.: id não existe).

---

## 7. 5xx – Erros do servidor

- **500 Internal Server Error**  
  - Erro inesperado no servidor (exceção não tratada, falha interna).
- **503 Service Unavailable**  
  - Servidor temporariamente indisponível (manutenção, sobrecarga…).

---

## 8. Mapeando métodos x status codes em uma API REST

| Ação                      | Método  | URI                 | Sucesso comum  | Erros comuns          |
|---------------------------|---------|---------------------|----------------|-----------------------|
| Listar livros             | GET     | `/api/books`        | 200 OK         | 500                   |
| Buscar livro por id       | GET     | `/api/books/{id}`   | 200 OK         | 404, 500              |
| Criar livro               | POST    | `/api/books`        | 201 Created    | 400, 500              |
| Atualizar livro (total)   | PUT     | `/api/books/{id}`   | 200 OK         | 400, 404, 500         |
| Atualizar livro (parcial) | PATCH   | `/api/books/{id}`   | 200 OK         | 400, 404, 500         |
| Deletar livro             | DELETE  | `/api/books/{id}`   | 204 No Content | 404, 500              |

---

## 9. Ideia mental para lembrar

- **Método HTTP** diz: *“o que quero fazer com o recurso?”*  
- **URI** diz: *“com qual recurso?”*  
- **Status code** diz: *“o que aconteceu com a operação?”*  

Regra prática:
- 2xx → deu certo  
- 4xx → requisição errada ou não permitida  
- 5xx → problema do servidor  

---

## 10. Pergunta para fixar

Em uma API REST, quando você criaria um novo recurso com POST e retornaria **201 Created** em vez de **200 OK?**
