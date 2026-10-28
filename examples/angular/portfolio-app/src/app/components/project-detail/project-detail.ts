import { Component, input, output, inject, signal } from '@angular/core';
import { Project } from '../../models/project';
import { ActivatedRoute, Router } from '@angular/router';
import { Database } from '../../services/database';

const EMPTY_PROJECT: Project = {
    id: -99,
    title: 'Projeto não encontrado',
    description: 'Projeto não encontrado',
    techs: ['Sem tecnologias'],
    repoUrl: 'Inválida',
    yearsExperience: 0,
};

@Component({
  selector: 'app-project-detail',
  imports: [],
  templateUrl: './project-detail.html',
  styleUrl: './project-detail.css',
  // fecha o painel ao pressionar Esc
  host: { '(document:keydown.escape)': 'close.emit()' },
})
export class ProjectDetail {
  private router = inject(Router);
  private activatedRoute = inject(ActivatedRoute);
  private database = inject(Database);

  // public project = input.required<Project>();
  public project = signal<Project>(EMPTY_PROJECT);
  public close = output<void>();

  constructor() {
    this.activatedRoute.params.subscribe((params) => {
      const id: number = Number(params['id']);
      const proj: Project | undefined = this.database.get(id);
      
      if(proj !== undefined)
        this.project.set(proj);
      
    });
  }

  closeModal() {
    this.router.navigate(['/']);
  }
}
