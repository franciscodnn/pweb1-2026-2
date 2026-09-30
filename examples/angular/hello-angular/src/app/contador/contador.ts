import { Component, signal } from '@angular/core';

@Component({
  imports: [],
  selector: 'app-contador',
  styleUrl: './contador.css',
  templateUrl: './contador.html',
})
export class Contador {
  public contador = signal(0);
  
  public contadorDuplicado = ( () => this.contador() * 2);

  public incrementar(): void {
    // this.contador.set( this.contador() + 1 );
    this.contador.update( valor => valor + 1 );
  }

  public decrementar(): void {
    // TODO
  }

  public resetar(): void {
    // TODO
  }
}
