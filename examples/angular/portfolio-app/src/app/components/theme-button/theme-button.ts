import { Component, model } from '@angular/core';

@Component({
  selector: 'theme-button',
  imports: [],
  templateUrl: './theme-button.html',
  styleUrl: './theme-button.css',
})
export class ThemeButton {
  // Alternativa com input + output:
  // public readonly darkMode = input(false, { transform: booleanAttribute });
  // protected changeToDarkMode = output<boolean>();
  public darkMode = model<boolean>(false);

  protected toggleTheme(): void {
    this.darkMode.update(dark => !dark);
    // this.changeToDarkMode.emit(this.darkMode());
  }
}
