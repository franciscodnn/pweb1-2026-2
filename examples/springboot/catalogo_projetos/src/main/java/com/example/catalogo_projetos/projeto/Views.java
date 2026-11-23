package com.example.catalogo_projetos.projeto;

/** Marcadores usados com @JsonView para escolher quais campos serializar. */
public class Views {
  public interface Resumo {}
  public interface Detalhe extends Resumo {}
}
