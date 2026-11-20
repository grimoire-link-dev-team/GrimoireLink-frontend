import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { provideRouter } from '@angular/router';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { CharacterManager } from './character-manager';

describe('CharacterManager', () => {
  let component: CharacterManager;
  let fixture: ComponentFixture<CharacterManager>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CharacterManager],
      providers: [provideHttpClient(), provideHttpClientTesting(), provideRouter([])],
    }).compileComponents();

    fixture = TestBed.createComponent(CharacterManager);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
