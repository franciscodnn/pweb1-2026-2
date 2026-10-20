import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ProjectDetail } from './project-detail';

describe('ProjectDetail', () => {
  let component: ProjectDetail;
  let fixture: ComponentFixture<ProjectDetail>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ProjectDetail],
    }).compileComponents();

    fixture = TestBed.createComponent(ProjectDetail);
    fixture.componentRef.setInput('project', {
      id: 1,
      title: 'Projeto Teste',
      description: 'Descrição',
      techs: ['Angular'],
      repoUrl: 'https://github.com',
      yearsExperience: 1,
    });
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should render title', () => {
    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.querySelector('h3')?.textContent).toContain('Projeto Teste');
  });
});
