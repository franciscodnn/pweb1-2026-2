import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Campo } from './campo';

describe('Campo', () => {
  let component: Campo;
  let fixture: ComponentFixture<Campo>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Campo],
    }).compileComponents();

    fixture = TestBed.createComponent(Campo);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
