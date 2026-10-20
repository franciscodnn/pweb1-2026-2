import { Component, signal, inject } from '@angular/core';
import { ThemeButton } from './components/theme-button/theme-button';
import { ProjectCard } from './components/project-card/project-card';
import { ProjectForm } from './components/project-form/project-form';
import { ProjectDetail } from './components/project-detail/project-detail';
import { Database } from './services/database';
import { Project } from './models/project';

@Component({
  selector: 'app-root',
  imports: [ThemeButton, ProjectCard, ProjectForm, ProjectDetail],
  templateUrl: './app.html',
  styleUrl: './app.css',
  host: { '[class.dark]': 'darkMode()' },
})
export class App {
  protected readonly darkMode = signal(true);

  private database = inject(Database);

  // projeto exibido no detalhe (null = detalhe fechado)
  protected readonly selectedProject = signal<Project | null>(null);
  protected readonly showForm = signal(false);

  constructor() {
    this.database.add(
      {
        id: 4,
        title: 'App para gestão de tempo',
        description: 'Este projeto auxilia na gestão de tempo.',
        techs: ['Angular', 'TypeScript', 'Tailwind CSS'],
        repoUrl: 'https://github.com',
        yearsExperience: 1
    });
  }

  projects(): Project[] {
    return this.database.projects();
  }
  
}
