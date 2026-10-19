import { Component, signal, inject } from '@angular/core';
import { ThemeButton } from './components/theme-button/theme-button';
import { ProjectCard } from './components/project-card/project-card';
import { Database } from './services/database';

interface Project {
  id: number;
  title: string;
  description: string;
  techs: string[];
  repoUrl: string;
  yearsExperience: number;
}

@Component({
  selector: 'app-root',
  imports: [ThemeButton, ProjectCard],
  templateUrl: './app.html',
  styleUrl: './app.css',
  host: { '[class.dark]': 'darkMode()' },
})
export class App {
  protected readonly darkMode = signal(true);

  private database = inject(Database);

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
