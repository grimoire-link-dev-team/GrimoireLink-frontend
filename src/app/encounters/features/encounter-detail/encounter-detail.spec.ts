import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { EncounterDetail } from './encounter-detail';

describe('EncounterDetail', () => {
  let component: EncounterDetail;
  let fixture: ComponentFixture<EncounterDetail>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [EncounterDetail],
      providers: [provideHttpClient(), provideHttpClientTesting(), provideRouter([])],
    }).compileComponents();

    fixture = TestBed.createComponent(EncounterDetail);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});