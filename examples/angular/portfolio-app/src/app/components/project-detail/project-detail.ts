import { Component, input, output, inject } from '@angular/core';
import { Project } from '../../models/project';
import { ActivatedRoute } from '@angular/router';
import { Database } from '../../services/database';

@Component({
  selector: 'app-project-detail',
  imports: [],
  templateUrl: './project-detail.html',
  styleUrl: './project-detail.css',
  // fecha o painel ao pressionar Esc
  host: { '(document:keydown.escape)': 'close.emit()' },
})
export class ProjectDetail {
  private route = inject(ActivatedRoute);
  private database = inject(Database);

  public project = input.required<Project>();
  public close = output<void>();

  constructor() {
    this.route.params.subscribe((params) => {
      const id: number = Number(params['id']);
      const project: Project = this.database.get(id);
      // console.log(typeof );
    });
  }
}
