import { Component, inject, output, signal } from '@angular/core';
import { form, FormField, FormRoot, min, pattern, required } from '@angular/forms/signals';
import { Database } from '../../services/database';
import { Project } from '../../models/project';

// No formulário, as tecnologias são digitadas como texto separado por vírgulas
interface ProjectFormData {
  title: string;
  description: string;
  techs: string;
  repoUrl: string;
  yearsExperience: number;
}

const PROJECT_INICIAL: ProjectFormData = {
  title: '',
  description: '',
  techs: '',
  repoUrl: '',
  yearsExperience: 0,
};

@Component({
  selector: 'app-project-form',
  imports: [FormRoot, FormField],
  templateUrl: './project-form.html',
  styleUrl: './project-form.css',
})
export class ProjectForm {
  private database = inject(Database);

  // avisa o pai quando um projeto for salvo (ex.: para fechar o formulário)
  public saved = output<Project>();

  protected projectModel = signal<ProjectFormData>({ ...PROJECT_INICIAL });

  protected projectForm = form(
    this.projectModel,
    (p) => {
      required(p.title, { message: 'Informe o título do projeto' });
      required(p.description, { message: 'Informe a descrição' });
      required(p.techs, { message: 'Informe ao menos uma tecnologia' });
      required(p.repoUrl, { message: 'Informe a URL do repositório' });
      pattern(p.repoUrl, /^https?:\/\/.+/, { message: 'A URL deve começar com http:// ou https://' });
      min(p.yearsExperience, 0, { message: 'Os anos de experiência não podem ser negativos' });
    },
    {
      submission: {
        action: async (f) => {
          const project = this.toProject(this.projectModel());
          // this.database.add(project);
          this.database.addProjectSupabase(project);
          this.saved.emit(project);
          f().reset({ ...PROJECT_INICIAL });
        },
      },
    },
  );

  // converte os dados do formulário para o tipo Project
  private toProject(dados: ProjectFormData): Project {
    const ids = this.database.projects().map((project) => project.id);

    return {
      id: Math.max(0, ...ids) + 1,
      title: dados.title.trim(),
      description: dados.description.trim(),
      techs: dados.techs
        .split(',')
        .map((tech) => tech.trim())
        .filter((tech) => tech !== ''),
      repoUrl: dados.repoUrl.trim(),
      yearsExperience: dados.yearsExperience,
    };
  }
}
