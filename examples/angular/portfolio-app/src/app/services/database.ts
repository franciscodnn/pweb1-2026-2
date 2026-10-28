import { Service, signal, inject } from '@angular/core';
import { Logger } from './logger';
import { Project } from '../models/project';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../environments/environment.development';

@Service()
export class Database {
    private logger = inject(Logger);
    private http = inject(HttpClient);

    // URL = onde está o servico???
    // APIKey = qual é a chave para acessar o servico???

    private supabaseUrl = environment.supabaseUrl;
    private supabaseKey = environment.supabaseKey;

    private get headers() {
        return {
            'apikey': this.supabaseKey,
            'Authorization': `Bearer ${this.supabaseKey}`,
            'Content-Type': 'application/json',
            'Prefer': 'return=representation'
        };
    }

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

    addProjectSupabase(projeto: Project) {
        // projeto["repo_url"] = projeto["repoUrl"];

        console.log(projeto);
        this.http.post<Project>(
            `${this.supabaseUrl}/project`,
            projeto,
            { headers: this.headers }).subscribe({
                next: (data) => {
                    console.log('Objeto armazenado');
                },
                error: (erro) => {
                    
                    console.log(erro);
                }
            });
    }

    get(id: number): (Project | undefined) {
        const proj: (Project | undefined) = this.projects()
          .find(
            (project) => project.id === id
        );

        // if(proj === undefined) return undefined;

        return proj ?? undefined;
    }

    loadProjectsFromSupabase() {
        // Método GET do HTTP
        this.http.get<Project[]>(
            `${this.supabaseUrl}/project`,
            { headers : this.headers }).subscribe(
            {
                next: (data) => {
                    this.projects.set([...this.projects(), ...data]);
                    console.log(data);
                },
                error: (erro) => {
                    console.log(erro);
                }
            }
        );
    }
}
