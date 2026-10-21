import { Component, inject, signal } from '@angular/core';
import { Database } from '../../services/database';
import { Project } from '../../models/project';
import { ProjectCard } from '../project-card/project-card';
import { RouterLink } from '@angular/router';

@Component({
  imports: [ProjectCard, RouterLink],
  selector: 'app-container-cards',
  styleUrl: './container-cards.css',
  templateUrl: './container-cards.html',
})
export class ContainerCards {
  private database = inject(Database);
  protected readonly selectedProject = signal<Project | null>(null);

  projects(): Project[] {
    return this.database.projects();
  }
}
