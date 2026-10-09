import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MeuForm } from './meu-form';

describe('MeuForm', () => {
  let component: MeuForm;
  let fixture: ComponentFixture<MeuForm>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MeuForm],
    }).compileComponents();

    fixture = TestBed.createComponent(MeuForm);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
