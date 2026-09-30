import { Component, signal, untracked, computed, WritableSignal, Signal } from '@angular/core';

@Component({
  selector: 'app-nome-completo',
  template: `
    <div class="p-4 max-w-sm space-y-3">
      <div class="flex flex-col gap-1">
        <label class="text-sm font-medium text-gray-700">Nome</label>
        <input 
          #campoNome 
          placeholder="Digite seu nome..."
          [value]="nome()" 
          (input)="nome.set(campoNome.value)"
          class="border rounded px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400" />
      </div>
      <div class="flex flex-col gap-1">
        <label class="text-sm font-medium text-gray-700">Sobrenome</label>
        <input 
          #campoSobrenome 
          [value]="sobrenome()" 
          (input)="sobrenome.set(campoSobrenome.value)"
          class="border rounded px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400" />
      </div>
      <p class="text-gray-800">Nome completo: <strong class="text-blue-700">
      {{ nomeCompleto() }}</strong></p>

      
    </div>
  `,
})
export class NomeCompletoComponent {
  nome: WritableSignal<string> = signal('Ana');
  sobrenome: WritableSignal<string> = signal('Silva');

  nomeCompleto: Signal<string> = computed(() => `${untracked(this.nome)} ${untracked(this.sobrenome)}`);
}