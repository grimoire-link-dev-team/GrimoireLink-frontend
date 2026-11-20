import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { CharacterList } from './character-list';

describe('CharacterList', () => {
  let component: CharacterList;
  let fixture: ComponentFixture<CharacterList>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CharacterList],
      providers: [provideHttpClient(), provideHttpClientTesting(), provideRouter([])],
    }).compileComponents();

    fixture = TestBed.createComponent(CharacterList);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
