import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { provideRouter } from '@angular/router';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { CharacterSheet } from './character-sheet';

describe('CharacterSheet', () => {
  let component: CharacterSheet;
  let fixture: ComponentFixture<CharacterSheet>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CharacterSheet],
      providers: [provideHttpClient(), provideHttpClientTesting(), provideRouter([])],
    }).compileComponents();

    fixture = TestBed.createComponent(CharacterSheet);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
