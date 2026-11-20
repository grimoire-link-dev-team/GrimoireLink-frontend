import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { provideRouter } from '@angular/router';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Monsters } from './monsters';

describe('Monsters', () => {
  let component: Monsters;
  let fixture: ComponentFixture<Monsters>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Monsters],
      providers: [provideHttpClient(), provideHttpClientTesting(), provideRouter([])],
    })
      .compileComponents();

    fixture = TestBed.createComponent(Monsters);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
