import { Routes } from '@angular/router';
import { ProjectForm } from './components/project-form/project-form';
import { ContainerCards } from './components/container-cards/container-cards';
import { ProjectDetail } from './components/project-detail/project-detail';

export const routes: Routes = [
    {
        path: '',
        component: ContainerCards,
        title: 'Home'
    },
    {
        path: 'home',
        component: ContainerCards,
        title: 'Home'
    },
    {
        path: 'cadastrar',
        component: ProjectForm,
        title: 'Novo projeto'
    },
    {
        path: 'projeto/:id',
        component: ProjectDetail,
        title: 'Detalhamento do projeto'
    }
];
