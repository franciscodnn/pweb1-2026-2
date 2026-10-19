import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ThemeButton } from './theme-button';

describe('ThemeButton', () => {
  let component: ThemeButton;
  let fixture: ComponentFixture<ThemeButton>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ThemeButton],
    }).compileComponents();

    fixture = TestBed.createComponent(ThemeButton);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should toggle darkMode on click', async () => {
    const button = (fixture.nativeElement as HTMLElement).querySelector('button')!;
    button.click();
    await fixture.whenStable();
    expect(component.darkMode()).toBe(true);
  });
});
