import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { provideRouter } from '@angular/router';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { DiceRoller } from './dice-roller';

describe('DiceRoller', () => {
  let component: DiceRoller;
  let fixture: ComponentFixture<DiceRoller>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DiceRoller],
      providers: [provideHttpClient(), provideHttpClientTesting(), provideRouter([])],
    }).compileComponents();

    fixture = TestBed.createComponent(DiceRoller);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
