import { Component, input, output } from '@angular/core';
import { Project } from '../../models/project';

@Component({
  selector: 'app-project-detail',
  imports: [],
  templateUrl: './project-detail.html',
  styleUrl: './project-detail.css',
  // fecha o painel ao pressionar Esc
  host: { '(document:keydown.escape)': 'close.emit()' },
})
export class ProjectDetail {
  public project = input.required<Project>();
  public close = output<void>();
}
