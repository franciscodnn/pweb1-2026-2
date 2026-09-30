import { Component, signal, computed } from '@angular/core';

@Component({
  selector: 'app-carrinho',
  template: `
    <div class="p-4 max-w-sm border rounded shadow">
      <h2 class="text-xl font-bold mb-2">Carrinho</h2>
      <p class="text-gray-700">Itens: <span class="font-semibold">{{ quantidade() }}</span></p>
      <p class="text-gray-700 mb-4">
      Total: <span class="font-semibold text-green-700">
      R$ {{ total() }}</span></p>
      <div class="flex gap-2">
        <button (click)="adicionar()"
          class="bg-blue-600 hover:bg-blue-700 text-white font-medium py-1 px-3 rounded">
          + Adicionar item (R$ 29,90)
        </button>
        
        <button 
          (click)="remover()" 
          [disabled]="quantidade() === 0"
          class="bg-red-500 hover:bg-red-600 disabled:opacity-40 text-white font-medium py-1 px-3 rounded">
          - Remover
        </button>

      </div>
    </div>
  `,
})
export class Carrinho {
  private _precoUnitario = signal(29.90);
  quantidade = signal(0);
  readonly precoUnitario = this._precoUnitario.asReadonly();

  total = computed(() => this.quantidade() * this.precoUnitario());

  adicionar() { 
    this.quantidade.update(q => q + 1);
  }
  remover()   { this.quantidade.update(q => q - 1); }
}