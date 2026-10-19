import { Component, signal } from '@angular/core';
import { ThemeButton } from './components/theme-button/theme-button';
import { ProjectCard } from './components/project-card/project-card';

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

  protected readonly projects = signal<Project[]>([
    {
      id: 1,
      title: 'Portfolio App',
      description: 'Este portfolio, desenvolvido com Angular e Tailwind CSS.',
      techs: ['Angular', 'TypeScript', 'Tailwind CSS'],
      repoUrl: 'https://github.com',
      yearsExperience: 1,
    },
    {
      id: 2,
      title: 'Task Manager API',
      description: 'API RESTful para gerenciamento de tarefas com autenticação JWT.',
      techs: ['NestJS', 'TypeScript', 'PostgreSQL'],
      repoUrl: 'https://github.com',
      yearsExperience: 2,
    },
    {
      id: 3,
      title: 'E-commerce Dashboard',
      description: 'Painel administrativo com gráficos em tempo real e gestão de pedidos.',
      techs: ['Angular', 'TypeScript', 'Node.js'],
      repoUrl: 'https://github.com',
      yearsExperience: 3,
    },
  ]);
}
