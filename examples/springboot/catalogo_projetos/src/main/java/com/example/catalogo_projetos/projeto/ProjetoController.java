package com.example.catalogo_projetos.projeto;

import java.net.URI;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.atomic.AtomicLong;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.servlet.support.ServletUriComponentsBuilder;

import com.fasterxml.jackson.annotation.JsonView;

@RestController
@RequestMapping("/projects")
public class ProjetoController {

  // "Banco" em memória (será substituído por um serviço/repositório nas próximas aulas)
  private final Map<Long, Projeto> projetos = new ConcurrentHashMap<>();
  private final AtomicLong sequencia = new AtomicLong();

  public ProjetoController() {
    salvar(new Projeto(null, "Portfólio", "SPA com Angular e signals",
        List.of("Angular", "TypeScript"), "https://github.com/exemplo/portfolio", 1));
    salvar(new Projeto(null, "Catálogo API", "API REST com Spring Boot",
        List.of("Java", "Spring Boot"), "https://github.com/exemplo/catalogo", 2));
  }

  // GET /projects?tech=Angular&limit=5  -> @RequestParam
  @GetMapping
  @JsonView(Views.Resumo.class)
  public List<Projeto> listar(
      @RequestParam(required = false) String tech,
      @RequestParam(defaultValue = "10") int limit) {
    return projetos.values().stream()
        .filter(p -> tech == null || p.techs().contains(tech))
        .limit(limit)
        .toList();
  }

  // GET /projects/1  -> URI template com regex: só aceita dígitos
  @GetMapping("/{id:\\d+}")
  @JsonView(Views.Detalhe.class)
  public ResponseEntity<Projeto> buscar(@PathVariable Long id) {
    return ResponseEntity.of(Optional.ofNullable(projetos.get(id))); // 200 ou 404
  }

  // POST /projects  -> @RequestBody (JSON -> objeto Java via Jackson)
  @PostMapping
  public ResponseEntity<Projeto> criar(@RequestBody Projeto novo) {
    Projeto salvo = salvar(novo);
    URI location = ServletUriComponentsBuilder.fromCurrentRequest()
        .path("/{id}").buildAndExpand(salvo.id()).toUri();
    return ResponseEntity.created(location).body(salvo); // 201 + header Location
  }

  // PUT /projects/1
  @PutMapping("/{id:\\d+}")
  public ResponseEntity<Projeto> atualizar(@PathVariable Long id, @RequestBody Projeto dados) {
    if (!projetos.containsKey(id)) {
      return ResponseEntity.notFound().build(); // 404
    }
    Projeto atualizado = dados.comId(id);
    projetos.put(id, atualizado);
    return ResponseEntity.ok(atualizado); // 200
  }

  // DELETE /projects/1
  @DeleteMapping("/{id:\\d+}")
  public ResponseEntity<Void> remover(@PathVariable Long id) {
    return projetos.remove(id) != null
        ? ResponseEntity.noContent().build() // 204
        : ResponseEntity.notFound().build(); // 404
  }

  private Projeto salvar(Projeto p) {
    Projeto comId = p.comId(sequencia.incrementAndGet());
    projetos.put(comId.id(), comId);
    return comId;
  }
}
