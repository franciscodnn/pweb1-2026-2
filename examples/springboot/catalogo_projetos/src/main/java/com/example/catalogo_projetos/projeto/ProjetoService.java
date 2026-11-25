package com.example.catalogo_projetos.projeto;

import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.atomic.AtomicLong;

import org.springframework.stereotype.Service;

@Service // @Bean
public class ProjetoService {

    // "Banco" em memória (será substituído por um serviço/repositório nas próximas aulas)
  private final Map<Long, Projeto> projetos = new ConcurrentHashMap<>();
  private final AtomicLong sequencia = new AtomicLong();

  public ProjetoService() {
    this.saveToDB(new Projeto(null, "Portfólio", "SPA com Angular e signals",
        List.of("Angular", "TypeScript"), "https://github.com/exemplo/portfolio", 1));
    this.saveToDB(new Projeto(null, "Catálogo API", "API REST com Spring Boot",
        List.of("Java", "Spring Boot"), "https://github.com/exemplo/catalogo", 2));
  }

  public List<Projeto> list(String tech, int limit) {
    return this.projetos.values().stream()
        .filter(p -> tech == null || p.techs().contains(tech))
        .limit(limit)
        .toList();
  }

  public Optional<Projeto> findById(Long id) {
    return Optional.ofNullable(this.projetos.get(id));
  }

  public Projeto save(Projeto newProject) {
    return this.saveToDB(newProject);
  }

  public Projeto update(Long id, Projeto dados) {
    if (!this.projetos.containsKey(id)) {
      return null; 
    }
    Projeto atualizado = dados.comId(id);
    this.projetos.put(id, atualizado);
    return atualizado; // 200
  }

  public Projeto remove(Long id) {
    return projetos.remove(id);
  }

  private Projeto saveToDB(Projeto p) {
    Projeto comId = p.comId(sequencia.incrementAndGet());
    this.projetos.put(comId.id(), comId);
    return comId;
  }
}
