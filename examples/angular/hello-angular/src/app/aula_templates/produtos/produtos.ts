import { Component, signal } from '@angular/core';
import { CurrencyPipe, 
  UpperCasePipe, DecimalPipe } from '@angular/common';


interface Produto {
  id: number;
  nome: string;
  preco: number;
  categoria: string;
  disponivel: boolean;
}

@Component({
  selector: 'app-produtos',
  standalone: true,
  imports: [CurrencyPipe, UpperCasePipe, DecimalPipe],
  template: `
    <div class="p-6">
      <h2 class="text-2xl font-bold text-gray-700 mb-4">
        Lista de Produtos
      </h2>

      
      <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        @for (produto of produtos(); track produto.id) {
          <div class="border rounded-lg p-4 bg-white shadow-sm"
                [class.opacity-60]="!produto.disponivel">
            <h3 class="font-semibold text-gray-800">{{ produto.nome }}</h3>
            <p class="text-sm text-gray-500">{{ produto.categoria }}</p>
            <p class="text-lg font-bold text-blue-600 mt-2">
              {{ produto.preco | currency:'BRL':'symbol':'1.2-2' }}
            </p>

            @if (produto.disponivel) {
              <button class="mt-3 w-full px-3 py-2 bg-green-600 text-white text-sm rounded">
                Comprar
              </button>
            } @else {
              <span class="mt-3 block text-center text-red-500 font-medium text-sm">
                Indisponível
              </span>
            }
          </div>
        } @empty {
          <p class="text-center text-gray-500 italic">
            {{ 'Nenhum produto encontrado.' | uppercase }}
          </p>
        }
        <p>&#127792; {{ 3.14159 | number:'1.2-2' }}</p>
        <p class="text-8xl">\u{0040}</p>
      </div>
    
  </div>
  `
})
export class Produtos {
  produtos = signal<Produto[]>([
    // { id: 1, nome: 'Smartphone', preco: 1299.99, categoria: 'Eletrônicos', disponivel: true },
    // { id: 2, nome: 'Notebook',   preco: 2499.99, categoria: 'Eletrônicos', disponivel: true },
    // { id: 3, nome: 'Headphone',  preco: 299.99,  categoria: 'Acessórios',  disponivel: false },
    // { id: 4, nome: 'Mouse',      preco: 89.99,   categoria: 'Acessórios',  disponivel: true }
  ]);
}