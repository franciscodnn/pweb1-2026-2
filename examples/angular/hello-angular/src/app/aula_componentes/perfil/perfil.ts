import { Component, signal, input, numberAttribute } from '@angular/core';

@Component({
  selector: 'app-perfil',
  standalone: true,
  styles: [`
    :host {
      display: block;
      background-color: #000099;
    }

    h2 {
      background-color: green;
    }
  `],
  template: `
    <div class="p-4 rounded shadow">
      <h2 class="text-xl font-bold text-gray-800">{{ name() }}</h2>
      <p class="text-gray-500">{{ cargo() }}</p>
    </div>
  `,
})
export class PerfilComponent {
  // input
  name = input.required<string>({ alias: "nome" });
  cargo = input('Sem cargo');
  tempoCargo = input.required<number, string>({ transform: numberAttribute, alias: 'tempo' });

  // nome  = signal('Ana Maria');
  // cargo = signal('Desenvolvedora Front-end');
}