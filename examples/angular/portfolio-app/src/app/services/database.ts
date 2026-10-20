import { Service, signal, inject } from '@angular/core';
import { Logger } from './logger';
import { Project } from '../models/project';

@Service()
export class Database {
    private logger = inject(Logger);

    public readonly projects = signal<Project[]>([
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

    add(projeto: Project) {
        this.projects.set([...this.projects(), projeto]);

        this.logger.log('projeto adicionado');

        /*
        this.projects.update( 
            projects => [...projects, projeto]
        );
        */
    }
}
