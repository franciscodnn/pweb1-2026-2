import { ComponentFixture, TestBed } from '@angular/core/testing';
import { NomeCompleto } from './nome-completo';

describe('NomeCompleto', () => {
  let component: NomeCompleto;
  let fixture: ComponentFixture<NomeCompleto>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [NomeCompleto],
    }).compileComponents();

    fixture = TestBed.createComponent(NomeCompleto);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
