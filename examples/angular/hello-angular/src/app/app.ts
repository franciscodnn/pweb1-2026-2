import { Component, signal, computed, OnInit } from '@angular/core';
import { Contador } from './contador/contador';
import { Carrinho } from './carrinho/carrinho';
import { NomeCompletoComponent } from './nome-completo/nome-completo';
import { Abas } from './abas/abas';
import { PerfilComponent } from './aula_componentes/perfil/perfil';
import { CampoComponent } from './aula_componentes/campo/campo';
import { AvaliacaoComponent } from './aula_componentes/avaliacao/avaliacao';
import { PropertyBindingComponent } from './aula_templates/property-binding/property-binding';
import { Produtos } from './aula_templates/produtos/produtos';
import { MeuForm } from './aula_forms/meu-form/meu-form';

@Component({
  // imports: [CampoComponent, PerfilComponent, Contador, Carrinho, NomeCompletoComponent, Abas],
  imports: [MeuForm],
  selector: 'app-root',
  templateUrl: './app.html',
  // template: `
  //   <h1>Olá, Mundo!</h1>
  // `
  
})
export class App implements OnInit {
  mensagem = signal('');

  registrarNota(nota: number) {
    this.mensagem.set(`Você deu ${nota} estrela(s). Obrigado!`);
  }

  // titulo = signal('HelloAngular 2026.2');

  nome      = signal('teste');
  sobrenome = signal('');

  nomeCompleto = computed(() => `${this.nome()} ${this.sobrenome()}`.trim());

  ngOnInit() {
    console.log('Inputs inicializadas');
  }
}
