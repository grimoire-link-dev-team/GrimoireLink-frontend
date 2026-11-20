import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { provideRouter } from '@angular/router';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { CampaignEncounters } from './campaign-encounters';

describe('CampaignEncounters', () => {
  let component: CampaignEncounters;
  let fixture: ComponentFixture<CampaignEncounters>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CampaignEncounters],
      providers: [provideHttpClient(), provideHttpClientTesting(), provideRouter([])],
    }).compileComponents();

    fixture = TestBed.createComponent(CampaignEncounters);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
