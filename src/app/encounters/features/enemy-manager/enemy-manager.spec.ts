import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { provideRouter } from '@angular/router';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { EnemyManager } from './enemy-manager';

describe('EnemyManager', () => {
  let component: EnemyManager;
  let fixture: ComponentFixture<EnemyManager>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [EnemyManager],
      providers: [provideHttpClient(), provideHttpClientTesting(), provideRouter([])],
    }).compileComponents();

    fixture = TestBed.createComponent(EnemyManager);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
