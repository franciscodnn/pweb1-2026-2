import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Abas } from './abas';

describe('Abas', () => {
  let component: Abas;
  let fixture: ComponentFixture<Abas>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Abas],
    }).compileComponents();

    fixture = TestBed.createComponent(Abas);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
