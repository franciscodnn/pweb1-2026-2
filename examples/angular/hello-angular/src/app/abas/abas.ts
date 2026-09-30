import { Component, signal, linkedSignal } from '@angular/core';

@Component({
  selector: 'app-abas',
  template: `
    <div class="p-4 max-w-sm space-y-3">
      <div class="flex gap-2">
        @for (aba of abas(); track aba) {
          <button (click)="selectedTab.set(aba)"
            class="bg-blue-100 hover:bg-blue-200 text-blue-800 text-sm font-medium py-1 px-3 rounded">
            {{ aba }}
          </button>
        }
      </div>
      <p class="text-gray-700">Aba ativa: <span class="font-semibold text-blue-700">{{ selectedTab() }}</span></p>
      <button (click)="trocarAbas()"
        class="bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium py-1 px-3 rounded">
        Trocar conjunto de abas
      </button>
    </div>
  `,
})
export class Abas {
  abas = signal(['Início', 'Perfil', 'Config']);

  // Reseta para a primeira aba sempre que abas() mudar
  selectedTab = linkedSignal(() => this.abas()[0]);

  trocarAbas() {
    this.abas.set(['Dashboard', 'Relatórios', 'Usuários']);
    // selectedTab volta automaticamente para 'Dashboard'
  }
}