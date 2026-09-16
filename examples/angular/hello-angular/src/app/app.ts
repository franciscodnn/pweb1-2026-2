import { Component, signal } from '@angular/core';
import { Contador } from './contador/contador';

@Component({
  imports: [Contador],
  selector: 'app-root',
  templateUrl: './app.html',
  // template: `
  //   <h1>Olá, Mundo!</h1>
  // `
  
})
export class App {
  titulo = signal('HelloAngular 2026.2');
}
