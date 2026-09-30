// app-campo.component.ts
import { Component, model, input, OnChanges, SimpleChanges } from '@angular/core';

@Component({
  selector: 'app-campo',
  standalone: true,
  template: `
    <div class="flex flex-col gap-1">
      <label class="text-sm font-medium text-gray-700">{{ rotulo() }}</label>
      <input #campo
        [value]="valor()"
        (input)="valor.set(campo.value)"
        placeholder="Preencha..."
        class="border rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400" />
    </div>
  `,
})
export class CampoComponent implements OnChanges {
  rotulo = input('Campo');

  // model() cria automaticamente um output `valorChange`
  valor = model('');

  ngOnChanges(changes: SimpleChanges) {
    console.log('mudança detectada no model...');
  }
}