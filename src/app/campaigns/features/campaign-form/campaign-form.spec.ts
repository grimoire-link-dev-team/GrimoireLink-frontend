import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { provideRouter } from '@angular/router';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { CampaignForm } from './campaign-form';

describe('CampaignForm', () => {
  let component: CampaignForm;
  let fixture: ComponentFixture<CampaignForm>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CampaignForm],
      providers: [provideHttpClient(), provideHttpClientTesting(), provideRouter([])],
    }).compileComponents();

    fixture = TestBed.createComponent(CampaignForm);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
