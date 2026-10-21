import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ContainerCards } from './container-cards';

describe('ContainerCards', () => {
  let component: ContainerCards;
  let fixture: ComponentFixture<ContainerCards>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ContainerCards],
    }).compileComponents();

    fixture = TestBed.createComponent(ContainerCards);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
