package com.example.catalogo_projetos.projeto;

import java.util.List;

import com.fasterxml.jackson.annotation.JsonView;

public record Projeto(
    @JsonView(Views.Resumo.class) Long id,
    @JsonView(Views.Resumo.class) String title,
    @JsonView(Views.Detalhe.class) String description,
    @JsonView(Views.Resumo.class) List<String> techs,
    @JsonView(Views.Detalhe.class) String repoUrl,
    @JsonView(Views.Detalhe.class) int yearsExperience) {

  public Projeto comId(Long novoId) {
    return new Projeto(novoId, title, description, techs, repoUrl, yearsExperience);
  }
}
