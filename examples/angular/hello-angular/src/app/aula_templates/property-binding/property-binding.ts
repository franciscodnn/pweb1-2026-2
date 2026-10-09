import { Component, signal } from '@angular/core';

@Component({
  selector: 'app-property-binding',
  standalone: true,
  template: `
    <div class="p-6 space-y-4">
      <h2 class="text-2xl font-bold text-gray-700">Exemplos de Property Binding</h2>

      <!-- Binding de atributos HTML -->
      <img [src]="imagemUrl()" [alt]="imagemAlt()" class="rounded shadow w-48">
      
      <!-- Binding de propriedades -->
      <input
        [value]="textoInput()"
        [disabled]="inputDesabilitado()"
        (input)="tratarReset($event)"
        class="border rounded px-3 py-2 w-full max-w-sm disabled:opacity-50">

      <!-- Binding de classes CSS -->
      <div
        [class.border-green-500]="estaAtivo()"
        [class.bg-yellow-100]="temDestaque()"
        class="border-2 p-3 rounded">
        Status do elemento
      </div>

      <!-- Controle de botão -->
      <button
        [disabled]="botaoDesabilitado()"
        (click)="alternarBotao()"
        class="px-4 py-2 bg-blue-600 text-white rounded disabled:opacity-40">
        {{ botaoDesabilitado() ? 'Botão Desabilitado' : 'Botão Habilitado' }}
      </button>
      
      @if( botaoDesabilitado() ) {
        <p>Botão está desabilitado!</p>
        <p>Para habilitá-lo, digite 'reset' na caixa de texto</p>
      } @else {
        <p>Botão habilitado!</p>
      }
    </div>
  `
})
export class PropertyBindingComponent {
  imagemUrl = signal('https://placehold.co/200x150');
  imagemAlt = signal('Imagem de exemplo');
  textoInput = signal('Texto inicial');
  inputDesabilitado = signal(false);
  estaAtivo = signal(true);
  temDestaque = signal(false);
  botaoDesabilitado = signal(false);

  tratarReset(event : InputEvent) {
    const input = event.target as HTMLInputElement;
    
    if( input.value === 'reset') {
      this.botaoDesabilitado.set(false);
      this.estaAtivo.set(true);
    }

  }

  alternarBotao() {
    this.estaAtivo.update(v => !v);

    this.botaoDesabilitado.update(v => !v);
  }
}