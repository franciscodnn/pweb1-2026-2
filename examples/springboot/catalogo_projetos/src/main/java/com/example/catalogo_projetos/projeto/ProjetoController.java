package com.example.catalogo_projetos.projeto;

import java.net.URI;
import java.util.List;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.servlet.support.ServletUriComponentsBuilder;

import com.fasterxml.jackson.annotation.JsonView;

@RestController // @Bean
@RequestMapping("/projects") // localhost:8080/projects
public class ProjetoController {

  private final ProjetoService projetoService;
  

  public ProjetoController(ProjetoService service) {
    this.projetoService = service;
  }

  // GET /projects?tech=Angular&limit=5  -> @RequestParam
  @GetMapping("")
  @JsonView(Views.Resumo.class)
  public List<Projeto> listar(
      @RequestParam(required = false) String tech,
      @RequestParam(defaultValue = "10") int limit) {

    return this.projetoService.list(tech, limit);
  }

  // GET /projects/1  -> URI template com regex: só aceita dígitos
  @GetMapping("/{id:\\d+}")
  @JsonView(Views.Detalhe.class)
  public ResponseEntity<Projeto> buscar(@PathVariable Long id) {
    return ResponseEntity.of(
      this.projetoService.findById(id)
    );
  }

  // POST /projects  -> @RequestBody (JSON -> objeto Java via Jackson)
  @PostMapping("")
  public ResponseEntity<Projeto> criar(@RequestBody Projeto novo) {
    Projeto salvo = this.projetoService.save(novo); // salvar(novo);
    URI location = ServletUriComponentsBuilder.fromCurrentRequest()
        .path("/{id}").buildAndExpand(salvo.id()).toUri();
    return ResponseEntity.created(location).body(salvo); // 201 + header Location
  }

  // PUT /projects/1
  // @PutMapping("/{id:\\d+}")
  // public ResponseEntity<Projeto> atualizar(@PathVariable Long id, @RequestBody Projeto dados) {
  //   if (!projetos.containsKey(id)) {
  //     return ResponseEntity.notFound().build(); // 404
  //   }
  //   Projeto atualizado = dados.comId(id);
  //   projetos.put(id, atualizado);
  //   return ResponseEntity.ok(atualizado); // 200
  // }

  // DELETE /projects/1
  @DeleteMapping("/{id:\\d+}")
  public ResponseEntity<Void> remover(@PathVariable Long id) {
    Projeto removido = this.projetoService.remove(id);
    return removido != null 
              ? ResponseEntity.noContent().build() // 204
              : ResponseEntity.notFound().build(); // 404
  }

  
}
