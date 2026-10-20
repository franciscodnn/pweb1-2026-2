import { Component, input, numberAttribute, output } from '@angular/core';

@Component({
  selector: 'app-project-card',
  imports: [],
  templateUrl: './project-card.html',
  styleUrl: './project-card.css',
})
export class ProjectCard {
  title = input.required<string>();
  yearsExperience = input(0, { transform: numberAttribute });
  description = input('');
  techs = input<string[]>([]);
  repoUrl = input('');

  // avisa o pai que o card foi clicado
  selected = output<void>();
}
