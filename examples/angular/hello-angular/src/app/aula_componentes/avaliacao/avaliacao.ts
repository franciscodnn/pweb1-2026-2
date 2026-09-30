// app-avaliacao.component.ts
import { Component, output, signal } from '@angular/core';

@Component({
  selector: 'app-avaliacao',
  standalone: true,
  template: `
    <div class="flex gap-1">
      @for (estrela of estrelas(); track estrela) {
        <button
          (click)="selecionar(estrela)"
          class="text-2xl transition-transform hover:scale-125"
          [class]="estrela <= nota() ? 'text-yellow-400' : 'text-gray-600'">
          ★
        </button>
      }
    </div>
    <p class="text-sm text-gray-500 mt-1">Nota selecionada: {{ nota() }}</p>
  `,
})
export class AvaliacaoComponent {
  nota    = signal(0);
  estrelas = signal([1, 2, 3, 4, 5]);

  // Emite a nota escolhida para o componente pai
  notaSelecionada = output<number>();

  selecionar(valor: number) {
    this.nota.set(valor);
    this.notaSelecionada.emit(valor);
  }
}