import { Component, signal, inject } from '@angular/core';
import { ThemeButton } from './components/theme-button/theme-button';
import { ProjectCard } from './components/project-card/project-card';
import { ProjectForm } from './components/project-form/project-form';
import { ProjectDetail } from './components/project-detail/project-detail';
import { ContainerCards } from './components/container-cards/container-cards';
import { RouterOutlet, RouterLink } from '@angular/router';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, RouterLink, ThemeButton],
  templateUrl: './app.html',
  styleUrl: './app.css',
  host: { '[class.dark]': 'darkMode()' },
})
export class App {
  protected readonly darkMode = signal(true);

  // projeto exibido no detalhe (null = detalhe fechado)
  // protected readonly selectedProject = signal<Project | null>(null);
  protected readonly showForm = signal(false);

  constructor() {
    
  }
  
}
